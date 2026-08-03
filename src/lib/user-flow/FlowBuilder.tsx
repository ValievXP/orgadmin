"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — BUILDER (общий движок для MVP и Pro, см. editions.ts)
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap, Background, BackgroundVariant,
  Connection, Edge, Node, NodeProps, Handle, Position, MarkerType, useReactFlow, ReactFlowProvider, Panel,
  useStoreApi, FinalConnectionState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, Maximize2, Plus, X, Search, ChevronRight, ChevronDown,
  UserPlus, FileText, HelpCircle, ClipboardList, Calendar, GitBranch, Clock, ArrowLeft,
  Trash2, CheckCircle2, AlertCircle, Users, Timer, Folder, BookOpen, GraduationCap,
  ClipboardCheck, Layers, Zap, Bell, UserCheck, CheckCircle, XCircle, AlertTriangle,
  Copy, RotateCcw, Route, Minus, Lock, Edit3,
} from 'lucide-react';
import {
  ELEMENT_TREE, ElementNode, ORG, EMPLOYEE_FIELDS, EmployeeFieldKey, getFieldValues,
  EMPLOYEES, Employee, CURATORS, NOTIFY_CHANNELS, NOTIFY_RECIPIENTS, NOTIFY_TEMPLATES,
  NOTIFY_VARIABLES, DELAY_UNITS, DelayUnit, QUICK_DELAYS, DEADLINE_QUICK,
  SCHEDULE_FREQ, SCHEDULE_DAYS, SCHEDULE_TIMES, TRIGGER_OPTIONS,
} from './data';
import { Edition, EDITIONS, EditionConfig } from './editions';
import { getFlow, upsertFlow } from './storage';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type FlowNodeType =
  | 'trigger'
  | 'condition_employee' | 'condition_content' | 'switch'
  | 'content' | 'notify' | 'curator'
  | 'delay' | 'wait_event'
  | 'end';

interface SelectedContent { id: string; title: string; titleUz?: string; type: string; }

interface FlowNodeData {
  flowType: FlowNodeType;
  // trigger
  triggerType?: string;
  audience?: Partial<Record<EmployeeFieldKey, string[]>>;
  scheduleFreq?: string; scheduleDay?: string; scheduleMonthDay?: number; scheduleTime?: string;
  // condition: employee
  empField?: EmployeeFieldKey; empOperator?: 'in' | 'not_in'; empValues?: string[];
  // condition: content
  conditionItems?: SelectedContent[]; conditionField?: string; conditionOperator?: string; conditionValue?: string;
  // switch
  switchField?: EmployeeFieldKey; switchValues?: string[];
  // content
  selectedContent?: SelectedContent; deadlineDays?: number; mandatory?: boolean; notifyOnAssign?: boolean;
  // notify (текст редактируемый; RU обязателен, UZ — параллельная версия)
  notifyChannels?: string[]; notifyRecipient?: string; notifyTemplateId?: string;
  notifyTextRu?: string; notifyTextUz?: string;
  // curator
  curatorMode?: 'auto' | 'specific'; curatorId?: number;
  // delay
  delayValue?: number; delayUnit?: DelayUnit;
  // wait
  waitItem?: SelectedContent; waitTimeoutDays?: number;
  // end
  endStatus?: 'success' | 'aborted'; endNotifyHr?: boolean;
  // simulation overlay (runtime only, not persisted)
  simState?: 'active' | 'visited' | 'idle';
  [key: string]: unknown;
}

type FlowNode = Node<FlowNodeData>;

// ═══════════════════════════════════════════════════════════════════════════════
// NODE CATALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface CatalogItem {
  flowType: FlowNodeType; label: string; description: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}

const NODE_CATALOG: { category: string; items: CatalogItem[] }[] = [
  {
    category: 'Триггеры',
    items: [
      { flowType: 'trigger', label: 'Триггер', description: 'Событие, запускающее флоу', icon: Zap, color: 'emerald' },
    ],
  },
  {
    category: 'Условия и ветвления',
    items: [
      { flowType: 'condition_employee', label: 'Условие: Сотрудник', description: 'Проверка профиля: отдел, должность…', icon: Users, color: 'amber' },
      { flowType: 'condition_content', label: 'Условие: Контент', description: 'Проверка прогресса: курс, тест, балл…', icon: ClipboardCheck, color: 'amber' },
      { flowType: 'switch', label: 'Ветвление (Switch)', description: 'Несколько веток по полю профиля', icon: GitBranch, color: 'violet' },
    ],
  },
  {
    category: 'Действия',
    items: [
      { flowType: 'content', label: 'Назначить контент', description: 'Курс, урок, тест, опрос, мероприятие', icon: BookOpen, color: 'blue' },
      { flowType: 'notify', label: 'Уведомление', description: 'Push, Telegram, Email или SMS', icon: Bell, color: 'indigo' },
      { flowType: 'curator', label: 'Назначить куратора', description: 'Куратор из команды платформы', icon: UserCheck, color: 'sky' },
    ],
  },
  {
    category: 'Ожидание',
    items: [
      { flowType: 'delay', label: 'Задержка', description: 'Пауза перед следующим шагом', icon: Clock, color: 'yellow' },
      { flowType: 'wait_event', label: 'Ждать событие', description: 'Завершение контента, с тайм-аутом', icon: Timer, color: 'orange' },
    ],
  },
  {
    category: 'Завершение',
    items: [
      { flowType: 'end', label: 'Завершить флоу', description: 'Финальная точка маршрута', icon: CheckCircle, color: 'rose' },
    ],
  },
];

const CATALOG_FLAT = NODE_CATALOG.flatMap(c => c.items);
const catalogFor = (t: FlowNodeType) => CATALOG_FLAT.find(i => i.flowType === t)!;

const FLOW_COLORS: Record<string, { border: string; handleBg: string; iconBg: string; iconText: string }> = {
  emerald: { border: 'border-emerald-300', handleBg: '!bg-emerald-500', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  amber:   { border: 'border-amber-300',   handleBg: '!bg-amber-500',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600' },
  violet:  { border: 'border-violet-300',  handleBg: '!bg-violet-500',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600' },
  blue:    { border: 'border-blue-300',    handleBg: '!bg-blue-500',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600' },
  indigo:  { border: 'border-indigo-300',  handleBg: '!bg-indigo-500',  iconBg: 'bg-indigo-100',  iconText: 'text-indigo-600' },
  sky:     { border: 'border-sky-300',     handleBg: '!bg-sky-500',     iconBg: 'bg-sky-100',     iconText: 'text-sky-600' },
  yellow:  { border: 'border-yellow-400',  handleBg: '!bg-yellow-500',  iconBg: 'bg-yellow-100',  iconText: 'text-yellow-700' },
  orange:  { border: 'border-orange-300',  handleBg: '!bg-orange-500',  iconBg: 'bg-orange-100',  iconText: 'text-orange-600' },
  rose:    { border: 'border-rose-300',    handleBg: '!bg-rose-500',    iconBg: 'bg-rose-100',    iconText: 'text-rose-600' },
};

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  folder:   { icon: Folder,         color: 'text-neutral-400', label: 'Папка' },
  course:   { icon: BookOpen,       color: 'text-emerald-500', label: 'Курс' },
  module:   { icon: Layers,         color: 'text-indigo-400',  label: 'Модуль' },
  lesson:   { icon: FileText,       color: 'text-blue-500',    label: 'Урок' },
  homework: { icon: FileText,       color: 'text-violet-500',  label: 'Урок с ДЗ' },
  test:     { icon: HelpCircle,     color: 'text-amber-500',   label: 'Тест' },
  survey:   { icon: ClipboardList,  color: 'text-purple-500',  label: 'Опрос' },
  event:    { icon: Calendar,       color: 'text-rose-500',    label: 'Мероприятие' },
};

const SECTION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'sec-courses':  { icon: GraduationCap,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'sec-testing':  { icon: ClipboardCheck, color: 'text-amber-600',   bg: 'bg-amber-50' },
  'sec-surveys':  { icon: ClipboardList,  color: 'text-purple-600',  bg: 'bg-purple-50' },
  'sec-events':   { icon: Calendar,       color: 'text-rose-600',    bg: 'bg-rose-50' },
};

const SELECTABLE_TYPES = new Set(['lesson', 'homework', 'test', 'survey', 'event', 'course']);

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const DELAY_UNIT_SHORT: Record<DelayUnit, string> = { sec: 'сек', min: 'мин', hour: 'ч', day: 'дн' };

function getConditionFields(items?: SelectedContent[]): { value: string; label: string }[] {
  if (!items || items.length === 0) return [];
  const fields: { value: string; label: string }[] = [];
  const types = new Set(items.map(i => i.type));
  if (types.has('course'))   fields.push({ value: 'course_completed', label: 'Курс завершён' }, { value: 'course_progress', label: 'Прогресс курса (%)' });
  if (types.has('lesson') || types.has('homework')) fields.push({ value: 'lesson_completed', label: 'Урок завершён' });
  if (types.has('test'))     fields.push({ value: 'test_completed', label: 'Тест завершён' }, { value: 'test_score', label: 'Результат теста (баллы)' });
  if (types.has('survey'))   fields.push({ value: 'survey_completed', label: 'Опрос завершён' });
  if (types.has('event'))    fields.push({ value: 'event_attended', label: 'Мероприятие посещено' });
  return fields;
}

const isBoolConditionField = (field?: string) =>
  !!field && (field.includes('completed') || field.includes('attended'));

function getConditionOperators(field?: string): { value: string; label: string }[] {
  if (!field) return [];
  if (isBoolConditionField(field)) return [{ value: '=', label: '=' }];
  return [{ value: '>=', label: '≥' }, { value: '<', label: '<' }, { value: '=', label: '=' }];
}

function waitEventLabel(type?: string): string {
  switch (type) {
    case 'course': return 'Курс завершён';
    case 'lesson': case 'homework': return 'Урок завершён';
    case 'test': return 'Тест пройден';
    case 'survey': return 'Опрос пройден';
    case 'event': return 'Мероприятие посещено';
    default: return 'Событие';
  }
}

const fieldLabel = (f?: EmployeeFieldKey) => EMPLOYEE_FIELDS.find(x => x.value === f)?.label || '';

const locTitle = (c: SelectedContent | undefined, uz: boolean) =>
  (uz && c?.titleUz) ? c.titleUz : (c?.title || '');

// Текст уведомления: свой (редактируемый) или заготовка шаблона
function getNotifyText(d: FlowNodeData, lang: 'ru' | 'uz'): string {
  const tpl = NOTIFY_TEMPLATES.find(t => t.id === d.notifyTemplateId);
  if (lang === 'uz') return d.notifyTextUz ?? tpl?.textUz ?? '';
  return d.notifyTextRu ?? tpl?.text ?? '';
}

function isConfigured(d: FlowNodeData): boolean {
  switch (d.flowType) {
    case 'trigger':
      if (!d.triggerType) return false;
      if (d.triggerType === 'schedule') {
        if (!d.scheduleFreq || !d.scheduleTime) return false;
        if (d.scheduleFreq === 'weekly' && !d.scheduleDay) return false;
        if (d.scheduleFreq === 'monthly' && !d.scheduleMonthDay) return false;
      }
      return true;
    case 'condition_employee': return !!d.empField && !!d.empOperator && (d.empValues?.length ?? 0) > 0;
    case 'condition_content':  return (d.conditionItems?.length ?? 0) > 0 && !!d.conditionField && !!d.conditionOperator && !!d.conditionValue;
    case 'switch':             return !!d.switchField && (d.switchValues?.length ?? 0) > 0;
    case 'content':            return !!d.selectedContent && d.deadlineDays !== undefined;
    case 'notify':             return (d.notifyChannels?.length ?? 0) > 0 && !!d.notifyRecipient && getNotifyText(d, 'ru').trim().length > 0;
    case 'curator':            return d.curatorMode === 'auto' || (d.curatorMode === 'specific' && d.curatorId !== undefined);
    case 'delay':              return d.delayValue !== undefined && d.delayValue > 0 && !!d.delayUnit;
    case 'wait_event':         return !!d.waitItem && d.waitTimeoutDays !== undefined;
    case 'end':                return !!d.endStatus;
    default: return false;
  }
}

function audienceSummary(a?: Partial<Record<EmployeeFieldKey, string[]>>): string {
  if (!a) return 'Все сотрудники';
  const parts: string[] = [];
  (['branch', 'dept', 'div', 'role', 'lang'] as EmployeeFieldKey[]).forEach(k => {
    const v = a[k];
    if (v && v.length) parts.push(`${fieldLabel(k)}: ${v.length === 1 ? v[0] : v.length}`);
  });
  return parts.length ? parts.join(' · ') : 'Все сотрудники';
}

function nodeSummary(d: FlowNodeData): string {
  switch (d.flowType) {
    case 'trigger': {
      if (!d.triggerType) return '';
      const t = TRIGGER_OPTIONS.find(o => o.value === d.triggerType)?.label || '';
      if (d.triggerType === 'schedule' && d.scheduleFreq) {
        const f = SCHEDULE_FREQ.find(x => x.value === d.scheduleFreq)?.label || '';
        const day = d.scheduleFreq === 'weekly' ? ` · ${d.scheduleDay || ''}` : d.scheduleFreq === 'monthly' ? ` · ${d.scheduleMonthDay || ''} числа` : '';
        return `${f}${day} · ${d.scheduleTime || ''}`;
      }
      return `${t} · ${audienceSummary(d.audience)}`;
    }
    case 'condition_employee':
      if (!d.empField || !d.empValues?.length) return '';
      return `${fieldLabel(d.empField)} ${d.empOperator === 'not_in' ? '≠' : '='} ${d.empValues.length === 1 ? d.empValues[0] : `${d.empValues.length} знач.`}`;
    case 'condition_content': {
      if (!d.conditionField || !d.conditionValue) return '';
      const f = getConditionFields(d.conditionItems).find(x => x.value === d.conditionField)?.label || '';
      const op = getConditionOperators(d.conditionField).find(o => o.value === d.conditionOperator)?.label || d.conditionOperator;
      return `${f} ${op} ${d.conditionValue}`;
    }
    case 'switch':
      if (!d.switchField) return '';
      return `По полю «${fieldLabel(d.switchField)}» · ${(d.switchValues?.length || 0) + 1} веток`;
    case 'content': {
      if (!d.selectedContent) return '';
      const dl = d.deadlineDays === undefined ? '' : d.deadlineDays === 0 ? ' · без срока' : ` · срок ${d.deadlineDays} дн.`;
      return `${d.selectedContent.title}${dl}`;
    }
    case 'notify': {
      const tpl = NOTIFY_TEMPLATES.find(t => t.id === d.notifyTemplateId);
      const name = d.notifyTemplateId === 'custom' ? 'Своё сообщение' : tpl?.title;
      if (!name) return '';
      const ch = (d.notifyChannels || []).map(c => NOTIFY_CHANNELS.find(x => x.value === c)?.label).join(', ');
      const rec = NOTIFY_RECIPIENTS.find(r => r.value === d.notifyRecipient)?.label || '';
      return `${name} → ${rec}${ch ? ` (${ch})` : ''}`;
    }
    case 'curator': {
      if (d.curatorMode === 'auto') return 'Авто: куратор отдела сотрудника';
      const c = CURATORS.find(x => x.id === d.curatorId);
      return c ? c.name : '';
    }
    case 'delay':
      if (d.delayValue === undefined || !d.delayUnit) return '';
      return `Пауза: ${d.delayValue} ${DELAY_UNIT_SHORT[d.delayUnit]}`;
    case 'wait_event': {
      if (!d.waitItem) return '';
      const to = d.waitTimeoutDays === undefined ? '' : d.waitTimeoutDays === 0 ? ' · без лимита' : ` · до ${d.waitTimeoutDays} дн.`;
      return `${waitEventLabel(d.waitItem.type)}: ${d.waitItem.title}${to}`;
    }
    case 'end':
      if (!d.endStatus) return '';
      return d.endStatus === 'success' ? `Завершён успешно${d.endNotifyHr ? ' · HR уведомлён' : ''}` : 'Флоу прерван';
    default: return '';
  }
}

// Output handles per node type
interface OutputDef { id: string; label: string; handleCls: string; labelCls: string; }

function getOutputs(d: FlowNodeData): OutputDef[] {
  switch (d.flowType) {
    case 'condition_employee':
    case 'condition_content':
      return [
        { id: 'true',  label: 'Да',  handleCls: '!bg-emerald-500', labelCls: 'text-emerald-600' },
        { id: 'false', label: 'Нет', handleCls: '!bg-red-500',     labelCls: 'text-red-500' },
      ];
    case 'wait_event':
      return [
        { id: 'done',    label: 'Выполнено', handleCls: '!bg-emerald-500', labelCls: 'text-emerald-600' },
        { id: 'timeout', label: 'Тайм-аут',  handleCls: '!bg-orange-500',  labelCls: 'text-orange-500' },
      ];
    case 'switch':
      return [
        ...(d.switchValues || []).map(v => ({ id: `sw-${v}`, label: v, handleCls: '!bg-violet-500', labelCls: 'text-violet-600' })),
        { id: 'else', label: 'Иначе', handleCls: '!bg-neutral-400', labelCls: 'text-neutral-400' },
      ];
    case 'end':
      return [];
    default:
      return [{ id: 'out', label: '', handleCls: '', labelCls: '' }];
  }
}

// Edge look derived from the source handle
function edgeMeta(sourceHandle?: string | null): { color: string; label?: string } {
  if (sourceHandle === 'true')    return { color: '#10b981', label: 'Да' };
  if (sourceHandle === 'false')   return { color: '#ef4444', label: 'Нет' };
  if (sourceHandle === 'done')    return { color: '#10b981', label: 'Выполнено' };
  if (sourceHandle === 'timeout') return { color: '#f97316', label: 'Тайм-аут' };
  if (sourceHandle === 'else')    return { color: '#a3a3a3', label: 'Иначе' };
  if (sourceHandle?.startsWith('sw-')) {
    const v = sourceHandle.slice(3);
    return { color: '#8b5cf6', label: v.length > 22 ? `${v.slice(0, 21)}…` : v };
  }
  return { color: '#C3C3C3' };
}

let edgeSeq = 0;
function buildEdge(source: string, target: string, sourceHandle?: string | null): Edge {
  const m = edgeMeta(sourceHandle);
  return {
    id: `e-${Date.now()}-${edgeSeq++}`,
    source, target, sourceHandle: sourceHandle || undefined,
    type: 'smoothstep',
    style: { stroke: m.color, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: m.color, width: 16, height: 16 },
    ...(m.label ? {
      label: m.label,
      labelStyle: { fontSize: 10, fontWeight: 700, fill: m.color },
      labelBgStyle: { fill: '#ffffff', stroke: '#e5e5e5' },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
    } : {}),
  };
}

// Контекст из предыдущих шагов: контент, назначенный выше по графу
// (startIds включаются в обход — нода-источник тоже учитывается).
function collectContentFrom(startIds: string[], nodes: FlowNode[], edges: Edge[]): SelectedContent[] {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const incoming = new Map<string, string[]>();
  edges.forEach(e => {
    const a = incoming.get(e.target) || [];
    a.push(e.source);
    incoming.set(e.target, a);
  });
  const seen = new Set<string>();
  const out: SelectedContent[] = [];
  const outIds = new Set<string>();
  let frontier = [...startIds];
  let depth = 0;
  while (frontier.length && depth < 40) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      const n = byId.get(id);
      const sc = n?.data.flowType === 'content' ? n.data.selectedContent : undefined;
      if (sc && !outIds.has(sc.id)) { out.push(sc); outIds.add(sc.id); }
      next.push(...(incoming.get(id) || []));
    }
    frontier = next;
    depth++;
  }
  return out; // ближайшие — первыми
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM NODE
// ═══════════════════════════════════════════════════════════════════════════════

const UserFlowNode = React.memo(function UserFlowNode({ id, data, selected }: NodeProps<FlowNode>) {
  const cat = catalogFor(data.flowType);
  const colors = FLOW_COLORS[cat.color];
  const Icon = cat.icon;
  const configured = isConfigured(data);
  const summary = nodeSummary(data);
  const outputs = getOutputs(data);
  const multiOut = outputs.length > 1;
  const isTrigger = data.flowType === 'trigger';
  const storeApi = useStoreApi();
  const outKey = outputs.map(o => o.id).join('|');
  // Синхронное переизмерение при изменении набора выходов (см. forceMeasure)
  useEffect(() => {
    const { domNode, updateNodeInternals } = storeApi.getState();
    const el = domNode?.querySelector(`.react-flow__node[data-id="${CSS.escape(id)}"]`);
    if (el) updateNodeInternals(new Map([[id, { id, nodeElement: el as HTMLDivElement, force: true }]]));
  }, [outKey, id, storeApi]);

  const minWidth = data.flowType === 'switch' ? Math.max(240, outputs.length * 104) : 240;

  const simCls = data.simState === 'active'
    ? 'ring-4 ring-emerald-300/70 !border-emerald-400 shadow-lg shadow-emerald-500/20'
    : data.simState === 'visited'
      ? '!border-emerald-300'
      : data.simState === 'idle' ? 'opacity-40' : '';

  return (
    <div className="relative group">
      {!isTrigger && (
        <Handle type="target" position={Position.Top}
          className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${colors.handleBg} !-top-1.5`} />
      )}

      <div style={{ minWidth, maxWidth: Math.max(300, minWidth) }}
        className={`bg-white border-2 ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/10' : colors.border}
        rounded-2xl transition-all duration-200 ${selected ? 'scale-[1.02]' : 'hover:shadow-md'} ${simCls}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-[18px] h-[18px] ${colors.iconText}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-neutral-900 truncate">{cat.label}</p>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{cat.description}</p>
          </div>
        </div>
        {summary && (
          <div className="px-4 pb-2">
            <div className="bg-neutral-50 rounded-lg px-3 py-1.5 text-[11px] text-neutral-600 font-medium truncate" title={summary}>{summary}</div>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-4 pb-3">
          {configured
            ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[10px] font-medium text-emerald-600">Готов</span></>
            : <><AlertCircle className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-medium text-amber-500">Настроить</span></>
          }
        </div>
      </div>

      {/* Output handles */}
      {!multiOut && outputs.length === 1 && (
        <Handle type="source" position={Position.Bottom}
          className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${colors.handleBg} !-bottom-1.5`} />
      )}
      {multiOut && outputs.map((o, i) => {
        const left = `${((i + 1) / (outputs.length + 1)) * 100}%`;
        return (
          <React.Fragment key={o.id}>
            <Handle type="source" position={Position.Bottom} id={o.id}
              className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${o.handleCls} !-bottom-1.5`}
              style={{ left }} />
            <div className={`absolute -bottom-6 text-[9px] font-bold ${o.labelCls} text-center truncate`}
              style={{ left, transform: 'translateX(-50%)', maxWidth: 92 }} title={o.label}>
              {o.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});

const nodeTypes = { userflow: UserFlowNode };

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { stroke: '#C3C3C3', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#C3C3C3', width: 16, height: 16 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SMALL UI PRIMITIVES — chips, searchable chips, number input, toggle
// ═══════════════════════════════════════════════════════════════════════════════

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">{title}</label>
      {children}
      {hint && <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Chips({ options, selected, onToggle, activeCls = 'bg-neutral-900 text-white' }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void; activeCls?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)}
            className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${active ? activeCls : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

// Для справочников с сотнями значений: поиск + ограничение вывода.
const CHIP_LIMIT = 12;

function SearchableChips({ options, selected, onToggle, activeCls = 'bg-neutral-900 text-white' }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void; activeCls?: string;
}) {
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(CHIP_LIMIT);
  const needSearch = options.length > CHIP_LIMIT;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? options.filter(o => o.toLowerCase().includes(term)) : options;
    if (!needSearch) return base;
    // выбранные — первыми, чтобы не терялись за лимитом
    return [...base.filter(o => selected.includes(o)), ...base.filter(o => !selected.includes(o))];
  }, [options, q, selected, needSearch]);

  const visible = filtered.slice(0, limit);
  const hiddenCount = filtered.length - visible.length;

  return (
    <div>
      {needSearch && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setLimit(CHIP_LIMIT); }}
            placeholder={`Поиск среди ${options.length}…`}
            className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-[12px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {visible.map(o => {
          const active = selected.includes(o);
          return (
            <button key={o} onClick={() => onToggle(o)}
              className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${active ? activeCls : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {o}
            </button>
          );
        })}
        {hiddenCount > 0 && (
          <button onClick={() => setLimit(l => l + 24)}
            className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition-all">
            Ещё {hiddenCount}
          </button>
        )}
      </div>
      {filtered.length === 0 && <p className="text-[11px] text-neutral-400 mt-1">Ничего не найдено</p>}
      {needSearch && selected.length > 0 && <p className="text-[10px] text-neutral-400 mt-1.5">Выбрано: {selected.length}</p>}
    </div>
  );
}

// Ручной ввод числовых значений (срок, задержка, баллы, проценты)
function NumberInput({ value, onChange, min = 1, max = 999, suffix }: {
  value?: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  const [draft, setDraft] = useState(value !== undefined ? String(value) : '');
  useEffect(() => { setDraft(value !== undefined ? String(value) : ''); }, [value]);

  const commit = (raw: string) => {
    const n = Math.round(Number(raw));
    if (raw.trim() === '' || Number.isNaN(n)) { setDraft(value !== undefined ? String(value) : ''); return; }
    const clamped = Math.min(max, Math.max(min, n));
    setDraft(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, (value ?? min + 1) - 1))}
        className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors shrink-0">
        <Minus className="w-4 h-4" />
      </button>
      <input type="number" inputMode="numeric" value={draft} min={min} max={max}
        onChange={e => {
          setDraft(e.target.value);
          const n = Math.round(Number(e.target.value));
          if (e.target.value.trim() !== '' && !Number.isNaN(n) && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => commit(draft)}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        className="w-20 text-center px-2 py-2 bg-white border border-neutral-200 rounded-xl text-[14px] font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
      <button onClick={() => onChange(Math.min(max, (value ?? 0) + 1))}
        className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors shrink-0">
        <Plus className="w-4 h-4" />
      </button>
      {suffix && <span className="text-[12px] font-medium text-neutral-500">{suffix}</span>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
      <span className="text-[13px] font-medium text-neutral-700">{label}</span>
      <span className={`w-10 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
        <span className={`block bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT PICKER MODAL — content catalog tree (RU + UZ titles)
// ═══════════════════════════════════════════════════════════════════════════════

function ElementPickerModal({ isOpen, onClose, onSelect }: {
  isOpen: boolean; onClose: () => void;
  onSelect: (el: SelectedContent) => void;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['sec-courses', 'c-821']));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 100); } }, [isOpen]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return ELEMENT_TREE;
    const term = search.toLowerCase();
    const filterNode = (node: ElementNode): ElementNode | null => {
      const match = node.title.toLowerCase().includes(term) || (node.titleUz || '').toLowerCase().includes(term);
      if (node.children) {
        const filtered = node.children.map(filterNode).filter(Boolean) as ElementNode[];
        if (filtered.length > 0) return { ...node, children: filtered };
      }
      return match ? node : null;
    };
    return ELEMENT_TREE.map(filterNode).filter(Boolean) as ElementNode[];
  }, [search]);

  const isSearching = search.trim().length > 0;

  const renderNode = (node: ElementNode, depth: number = 0): React.ReactNode => {
    const isExp = expanded.has(node.id) || isSearching;
    const hasChildren = node.children && node.children.length > 0;
    const isSelectable = SELECTABLE_TYPES.has(node.type);
    const isSection = node.type === 'section';

    if (isSection) {
      const cfg = SECTION_CONFIG[node.id] || { icon: BookOpen, color: 'text-neutral-500', bg: 'bg-neutral-100' };
      const SIcon = cfg.icon;
      return (
        <div key={node.id} className="mb-1">
          <button onClick={() => toggleExpand(node.id)}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="w-5 h-5 flex items-center justify-center">
              {isExp ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
            </div>
            <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}><SIcon className={`w-4 h-4 ${cfg.color}`} /></div>
            <span className="text-[14px] font-bold text-neutral-900">{node.title}</span>
            {node.children && <span className="text-[11px] text-neutral-400 ml-auto">{node.children.length}</span>}
          </button>
          {isExp && hasChildren && (
            <div className="ml-3 border-l-2 border-neutral-100 pl-1 mt-0.5 flex flex-col gap-0.5">
              {node.children!.map(child => renderNode(child, 1))}
            </div>
          )}
        </div>
      );
    }

    const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.lesson;
    const NIcon = cfg.icon;
    const iconColor = node.type === 'folder' && node.color ? node.color : cfg.color;

    return (
      <div key={node.id}>
        <div
          onClick={() => { if (hasChildren) toggleExpand(node.id); }}
          className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer transition-all group hover:bg-neutral-50"
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
        >
          <div onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggleExpand(node.id); } }}
            className={`w-5 h-5 flex items-center justify-center rounded shrink-0 ${hasChildren ? 'hover:bg-neutral-200 cursor-pointer' : ''}`}>
            {hasChildren
              ? (isExp ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />)
              : <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />}
          </div>
          <NIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-700 truncate">{node.title}</p>
            {node.titleUz && <p className="text-[10px] text-neutral-400 truncate">UZ: {node.titleUz}</p>}
          </div>
          {!isSelectable && node.type !== 'folder' && (
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider shrink-0">{cfg.label}</span>
          )}
          {isSelectable && (
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onSelect({ id: node.id, title: node.title, titleUz: node.titleUz, type: node.type }); onClose(); }}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
                <Plus className="w-3 h-3" /> Выбрать
              </button>
            </div>
          )}
        </div>
        {hasChildren && isExp && (
          <div className={`flex flex-col gap-0.5 ${depth < 2 ? 'ml-3 border-l-2 border-neutral-100 pl-1' : 'ml-5'} mt-0.5`}>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Plus className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">Выбрать элемент</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">Контент платформы · RU и UZ версии назначаются вместе</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию (RU / UZ)..." autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {filteredData.length > 0
            ? <div className="flex flex-col gap-0.5">{filteredData.map(node => renderNode(node))}</div>
            : <div className="py-16 flex flex-col items-center justify-center text-center">
                <Search className="w-8 h-8 text-neutral-300 mb-3" />
                <p className="text-[14px] font-medium text-neutral-700">Ничего не найдено</p>
              </div>
          }
        </div>
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-neutral-400">Данные из разделов платформы: Курсы, Тестирование, Опросы, Мероприятия</p>
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-medium text-neutral-600 hover:bg-neutral-200 bg-neutral-100 transition-colors">Закрыть</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTOR PANEL — per-type configuration
// ═══════════════════════════════════════════════════════════════════════════════

function InspectorPanel({ node, upstreamContent, feats, onClose, onUpdate, onDelete, onDuplicate }: {
  node: FlowNode; upstreamContent: SelectedContent[]; feats: EditionConfig;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<FlowNodeData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const d = node.data;
  const cat = catalogFor(d.flowType);
  const Icon = cat.icon;
  const colors = FLOW_COLORS[cat.color];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'content' | 'condition' | 'wait'>('content');
  const [msgLang, setMsgLang] = useState<'ru' | 'uz'>('ru');
  const msgRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMsgLang('ru'); }, [node.id]);

  const upd = (patch: Partial<FlowNodeData>) => onUpdate(node.id, patch);

  const toggleInList = (list: string[] | undefined, v: string) => {
    const cur = list || [];
    return cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
  };

  const handlePick = (el: SelectedContent) => {
    if (pickerTarget === 'content') upd({ selectedContent: el, deadlineDays: d.deadlineDays ?? 7 });
    else if (pickerTarget === 'wait') upd({ waitItem: el, waitTimeoutDays: d.waitTimeoutDays ?? 7 });
    else upd({
      conditionItems: [...(d.conditionItems || []), el],
      conditionField: undefined, conditionOperator: undefined, conditionValue: undefined,
    });
  };

  const openPicker = (target: 'content' | 'condition' | 'wait') => { setPickerTarget(target); setPickerOpen(true); };

  const insertVar = (v: string) => {
    const cur = getNotifyText(d, msgLang);
    const ta = msgRef.current;
    const start = ta ? ta.selectionStart : cur.length;
    const end = ta ? ta.selectionEnd : cur.length;
    const next = cur.slice(0, start) + v + cur.slice(end);
    upd(msgLang === 'ru' ? { notifyTextRu: next } : { notifyTextUz: next });
    setTimeout(() => { if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = start + v.length; } }, 0);
  };

  const ContentRow = ({ item, onRemove }: { item: SelectedContent; onRemove: () => void }) => {
    const c = TYPE_CONFIG[item.type]; const I = c?.icon || FileText;
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 ${colors.iconBg} rounded-xl`}>
        <I className={`w-4 h-4 ${c?.color || 'text-blue-500'} shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-neutral-800 truncate">{item.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{c?.label}{item.titleUz ? ` · UZ: ${item.titleUz}` : ''}</p>
        </div>
        <button onClick={onRemove}
          className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:bg-white hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  };

  const PickButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-neutral-300 rounded-xl text-[13px] font-semibold text-neutral-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );

  // Быстрый выбор из контента предыдущих шагов
  const UpstreamPicks = ({ exclude, onPick }: { exclude: Set<string>; onPick: (c: SelectedContent) => void }) => {
    const avail = upstreamContent.filter(u => !exclude.has(u.id));
    if (avail.length === 0) return null;
    return (
      <div className="mb-2">
        <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Из предыдущих шагов:</p>
        <div className="space-y-1.5">
          {avail.map(u => {
            const c = TYPE_CONFIG[u.type]; const I = c?.icon || FileText;
            return (
              <button key={u.id} onClick={() => onPick(u)}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-white border border-dashed border-amber-300 rounded-xl hover:bg-amber-50 transition-colors text-left">
                <I className={`w-3.5 h-3.5 ${c?.color || 'text-amber-500'} shrink-0`} />
                <span className="flex-1 min-w-0 text-[12px] font-medium text-neutral-700 truncate">{u.title}</span>
                <Plus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfig = () => {
    // ── TRIGGER ──
    if (d.flowType === 'trigger') {
      const aud = d.audience || {};
      const selectedDepts = aud.dept || [];
      const divOptions = selectedDepts.length
        ? ORG.departments.filter(x => selectedDepts.includes(x.name)).flatMap(x => x.divisions)
        : ORG.departments.flatMap(x => x.divisions);
      const setAud = (k: EmployeeFieldKey, v: string) => {
        const next = { ...aud, [k]: toggleInList(aud[k], v) };
        if (k === 'dept') {
          const allowed = (next.dept?.length ? ORG.departments.filter(x => next.dept!.includes(x.name)) : ORG.departments).flatMap(x => x.divisions);
          next.div = (next.div || []).filter(x => allowed.includes(x));
        }
        upd({ audience: next });
      };
      return (<>
        <Section title="Событие запуска">
          <div className="space-y-2">
            {TRIGGER_OPTIONS.map(t => {
              const locked = !feats.triggerTypes.includes(t.value);
              return (
                <button key={t.value} onClick={() => !locked && upd({ triggerType: t.value })}
                  disabled={locked}
                  title={locked ? 'Доступно в User Flow Pro' : undefined}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${locked ? 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed' : d.triggerType === t.value ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-neutral-800">{t.label}</p>
                    {locked && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-bold"><Lock className="w-2.5 h-2.5" /> PRO</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </Section>

        {d.triggerType === 'schedule' && (<>
          <Section title="Периодичность">
            <Chips options={SCHEDULE_FREQ.map(f => f.label)}
              selected={d.scheduleFreq ? [SCHEDULE_FREQ.find(f => f.value === d.scheduleFreq)!.label] : []}
              onToggle={l => upd({ scheduleFreq: SCHEDULE_FREQ.find(f => f.label === l)!.value, scheduleDay: undefined, scheduleMonthDay: undefined })}
              activeCls="bg-emerald-500 text-white" />
          </Section>
          {d.scheduleFreq === 'weekly' && (
            <Section title="День недели">
              <Chips options={SCHEDULE_DAYS} selected={d.scheduleDay ? [d.scheduleDay] : []}
                onToggle={v => upd({ scheduleDay: v })} activeCls="bg-emerald-500 text-white" />
            </Section>
          )}
          {d.scheduleFreq === 'monthly' && (
            <Section title="Число месяца">
              <NumberInput value={d.scheduleMonthDay} min={1} max={28} onChange={v => upd({ scheduleMonthDay: v })} suffix="числа каждого месяца" />
            </Section>
          )}
          <Section title="Время">
            <Chips options={SCHEDULE_TIMES} selected={d.scheduleTime ? [d.scheduleTime] : []}
              onToggle={v => upd({ scheduleTime: v })} activeCls="bg-emerald-500 text-white" />
          </Section>
        </>)}

        {d.triggerType && d.triggerType !== 'schedule' && (
          <Section title="Аудитория" hint="Пусто = все сотрудники. Данные из справочников платформы; в длинных списках работает поиск.">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Филиал</p>
                <SearchableChips key="branch" options={ORG.branches} selected={aud.branch || []} onToggle={v => setAud('branch', v)} activeCls="bg-emerald-500 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Департамент</p>
                <SearchableChips key="dept" options={ORG.departments.map(x => x.name)} selected={aud.dept || []} onToggle={v => setAud('dept', v)} activeCls="bg-emerald-500 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Отдел</p>
                <SearchableChips key="div" options={divOptions} selected={aud.div || []} onToggle={v => setAud('div', v)} activeCls="bg-emerald-500 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Должность</p>
                <SearchableChips key="role" options={ORG.positions} selected={aud.role || []} onToggle={v => setAud('role', v)} activeCls="bg-emerald-500 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Язык</p>
                <Chips options={ORG.languages} selected={aud.lang || []} onToggle={v => setAud('lang', v)} activeCls="bg-emerald-500 text-white" />
              </div>
            </div>
          </Section>
        )}
      </>);
    }

    // ── CONDITION: EMPLOYEE ──
    if (d.flowType === 'condition_employee') {
      const values = getFieldValues(d.empField);
      return (<>
        <Section title="Поле профиля">
          <Chips options={EMPLOYEE_FIELDS.map(f => f.label)}
            selected={d.empField ? [fieldLabel(d.empField)] : []}
            onToggle={l => upd({ empField: EMPLOYEE_FIELDS.find(f => f.label === l)!.value, empValues: [], empOperator: d.empOperator || 'in' })}
            activeCls="bg-amber-500 text-white" />
        </Section>
        {d.empField && (
          <Section title="Оператор" hint="«=» — значение совпадает с одним из выбранных, «≠» — не совпадает ни с одним.">
            <div className="flex gap-2">
              {([{ v: 'in', l: '=' }, { v: 'not_in', l: '≠' }] as const).map(o => (
                <button key={o.v} onClick={() => upd({ empOperator: o.v })}
                  className={`px-5 py-2 rounded-lg text-[15px] font-bold transition-all ${d.empOperator === o.v ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </Section>
        )}
        {d.empField && d.empOperator && (
          <Section title={`Значения (${fieldLabel(d.empField)})`} hint="Выход «Да» — если условие выполнено.">
            <SearchableChips key={d.empField} options={values} selected={d.empValues || []}
              onToggle={v => upd({ empValues: toggleInList(d.empValues, v) })}
              activeCls="bg-amber-500 text-white" />
          </Section>
        )}
      </>);
    }

    // ── CONDITION: CONTENT ──
    if (d.flowType === 'condition_content') {
      const condFields = getConditionFields(d.conditionItems);
      const condOps = getConditionOperators(d.conditionField);
      const isBool = isBoolConditionField(d.conditionField);
      const already = new Set((d.conditionItems || []).map(i => i.id));
      return (<>
        <Section title="Проверяемый контент" hint={upstreamContent.length === 0 && (d.conditionItems?.length ?? 0) === 0 ? 'Соедините ноду с шагом «Назначить контент» — элемент подтянется автоматически.' : undefined}>
          <div className="space-y-2">
            {(d.conditionItems || []).map(item => (
              <ContentRow key={item.id} item={item} onRemove={() => upd({
                conditionItems: (d.conditionItems || []).filter(i => i.id !== item.id),
                conditionField: undefined, conditionOperator: undefined, conditionValue: undefined,
              })} />
            ))}
            <UpstreamPicks exclude={already} onPick={c => upd({
              conditionItems: [...(d.conditionItems || []), c],
              conditionField: undefined, conditionOperator: undefined, conditionValue: undefined,
            })} />
            <PickButton label="Выбрать из каталога" onClick={() => openPicker('condition')} />
          </div>
        </Section>
        {condFields.length > 0 && (
          <Section title="Что проверяем">
            <div className="flex flex-wrap gap-2">
              {condFields.map(f => (
                <button key={f.value} onClick={() => upd({ conditionField: f.value, conditionOperator: undefined, conditionValue: undefined })}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${d.conditionField === f.value ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </Section>
        )}
        {d.conditionField && condOps.length > 0 && (
          <Section title="Оператор">
            <div className="flex gap-2">
              {condOps.map(op => (
                <button key={op.value} onClick={() => upd({ conditionOperator: op.value, conditionValue: isBool ? undefined : d.conditionValue })}
                  className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${d.conditionOperator === op.value ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  {op.label}
                </button>
              ))}
            </div>
          </Section>
        )}
        {d.conditionField && d.conditionOperator && (
          isBool ? (
            <Section title="Значение">
              <div className="flex gap-2">
                {['Да', 'Нет'].map(v => (
                  <button key={v} onClick={() => upd({ conditionValue: v })}
                    className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${d.conditionValue === v ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </Section>
          ) : (
            <Section title="Значение" hint={d.conditionField === 'course_progress' ? 'Процент прохождения курса (0–100).' : 'Количество баллов за тест.'}>
              <NumberInput
                value={d.conditionValue !== undefined && d.conditionValue !== '' ? Number(d.conditionValue) : undefined}
                min={0} max={d.conditionField === 'course_progress' ? 100 : 999}
                onChange={v => upd({ conditionValue: String(v) })}
                suffix={d.conditionField === 'course_progress' ? '%' : 'баллов'} />
            </Section>
          )
        )}
      </>);
    }

    // ── SWITCH ──
    if (d.flowType === 'switch') {
      const values = getFieldValues(d.switchField);
      return (<>
        <Section title="Поле профиля">
          <Chips options={EMPLOYEE_FIELDS.map(f => f.label)}
            selected={d.switchField ? [fieldLabel(d.switchField)] : []}
            onToggle={l => upd({ switchField: EMPLOYEE_FIELDS.find(f => f.label === l)!.value, switchValues: [] })}
            activeCls="bg-violet-500 text-white" />
        </Section>
        {d.switchField && (
          <Section title="Ветки" hint="Каждое значение — отдельный выход. Плюс выход «Иначе» для остальных.">
            <SearchableChips key={d.switchField} options={values} selected={d.switchValues || []}
              onToggle={v => upd({ switchValues: toggleInList(d.switchValues, v) })}
              activeCls="bg-violet-500 text-white" />
          </Section>
        )}
        {(d.switchValues?.length || 0) > 0 && (
          <Section title="Выходы ноды">
            <div className="space-y-1.5">
              {(d.switchValues || []).map(v => (
                <div key={v} className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                  <span className="text-[12px] font-semibold text-neutral-700 truncate">{v}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                <span className="text-[12px] font-semibold text-neutral-500">Иначе (все остальные)</span>
              </div>
            </div>
          </Section>
        )}
      </>);
    }

    // ── CONTENT ──
    if (d.flowType === 'content') return (<>
      <Section title="Элемент из каталога">
        {d.selectedContent
          ? <ContentRow item={d.selectedContent} onRemove={() => upd({ selectedContent: undefined })} />
          : <PickButton label="Выбрать элемент" onClick={() => openPicker('content')} />}
      </Section>
      {d.selectedContent && (<>
        <Section title="Срок прохождения" hint="Дедлайн отсчитывается от даты назначения элемента сотруднику. Эта же дата подставляется в переменную {дедлайн} в уведомлениях.">
          <Toggle label="Без срока" checked={d.deadlineDays === 0} onChange={v => upd({ deadlineDays: v ? 0 : 7 })} />
          {d.deadlineDays !== 0 && (
            <div className="mt-2 space-y-2">
              <NumberInput value={d.deadlineDays} min={1} max={365} onChange={v => upd({ deadlineDays: v })} suffix="дней на прохождение" />
              <div className="flex flex-wrap gap-1.5">
                {DEADLINE_QUICK.map(v => (
                  <button key={v} onClick={() => upd({ deadlineDays: v })}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${d.deadlineDays === v ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                    {v} дн.
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>
        <Section title="Параметры">
          <div className="space-y-2">
            <Toggle label="Обязательный элемент" checked={!!d.mandatory} onChange={v => upd({ mandatory: v })} />
            <Toggle label="Уведомить о назначении" checked={!!d.notifyOnAssign} onChange={v => upd({ notifyOnAssign: v })} />
          </div>
        </Section>
      </>)}
    </>);

    // ── NOTIFY ──
    if (d.flowType === 'notify') {
      const hasTemplate = !!d.notifyTemplateId;
      return (<>
        <Section title="Получатель">
          <div className="grid grid-cols-2 gap-2">
            {NOTIFY_RECIPIENTS.map(r => (
              <button key={r.value} onClick={() => upd({ notifyRecipient: r.value })}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all ${d.notifyRecipient === r.value ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                <p className="text-[12px] font-semibold text-neutral-800">{r.label}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Каналы" hint="Push, Telegram, Email и SMS — как в инструменте «Уведомления».">
          <Chips options={NOTIFY_CHANNELS.map(c => c.label)}
            selected={(d.notifyChannels || []).map(c => NOTIFY_CHANNELS.find(x => x.value === c)!.label)}
            onToggle={l => { const v = NOTIFY_CHANNELS.find(c => c.label === l)!.value; upd({ notifyChannels: toggleInList(d.notifyChannels, v) }); }}
            activeCls="bg-indigo-500 text-white" />
        </Section>
        <Section title="Шаблон" hint="Шаблон заполняет текст на обоих языках — дальше его можно свободно править.">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => upd({ notifyTemplateId: 'custom', notifyTextRu: '', notifyTextUz: '' })}
              className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${d.notifyTemplateId === 'custom' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              Свой текст
            </button>
            {NOTIFY_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => upd({ notifyTemplateId: t.id, notifyTextRu: t.text, notifyTextUz: t.textUz })}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${d.notifyTemplateId === t.id ? 'bg-indigo-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {t.title}
              </button>
            ))}
          </div>
        </Section>
        {hasTemplate && (
          <Section title="Текст сообщения" hint="Сотрудник получит версию на своём языке (RU/UZ из профиля). Переменные платформа подставит при отправке.">
            <div className="flex gap-1 mb-2">
              {(['ru', 'uz'] as const).map(l => (
                <button key={l} onClick={() => setMsgLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${msgLang === l ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <textarea ref={msgRef} rows={4}
              value={getNotifyText(d, msgLang)}
              onChange={e => upd(msgLang === 'ru' ? { notifyTextRu: e.target.value } : { notifyTextUz: e.target.value })}
              placeholder={msgLang === 'ru' ? 'Текст уведомления…' : 'Bildirishnoma matni… (пусто — отправится RU-версия)'}
              className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 leading-relaxed placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {NOTIFY_VARIABLES.map(v => (
                <button key={v} onClick={() => insertVar(v)}
                  className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-[11px] font-semibold font-mono transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </Section>
        )}
      </>);
    }

    // ── CURATOR ──
    if (d.flowType === 'curator') return (<>
      <Section title="Способ назначения">
        <div className="space-y-2">
          <button onClick={() => upd({ curatorMode: 'auto', curatorId: undefined })}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${d.curatorMode === 'auto' ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
            <p className="text-[13px] font-semibold text-neutral-800">Автоматически</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Куратор из того же департамента, что и сотрудник</p>
          </button>
          <button onClick={() => upd({ curatorMode: 'specific' })}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${d.curatorMode === 'specific' ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
            <p className="text-[13px] font-semibold text-neutral-800">Выбрать из команды</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Конкретный куратор с платформы (раздел «Команда»)</p>
          </button>
        </div>
      </Section>
      {d.curatorMode === 'specific' && (
        <Section title="Куратор">
          <div className="space-y-2">
            {CURATORS.map(c => (
              <button key={c.id} onClick={() => upd({ curatorId: c.id })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${d.curatorId === c.id ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center justify-center shrink-0">{c.initials}</span>
                <span className="min-w-0">
                  <p className="text-[12px] font-semibold text-neutral-800 truncate">{c.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{c.dept} · {c.div}</p>
                </span>
                {d.curatorId === c.id && <CheckCircle2 className="w-4 h-4 text-sky-500 ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </Section>
      )}
    </>);

    // ── DELAY ──
    if (d.flowType === 'delay') return (
      <Section title="Длительность" hint="Пауза перед следующим шагом. Значение вводится вручную.">
        <div className="flex items-center gap-3 flex-wrap">
          <NumberInput value={d.delayValue} min={1} max={999}
            onChange={v => upd({ delayValue: v, delayUnit: d.delayUnit || 'day' })} />
          <div className="flex gap-1">
            {DELAY_UNITS.map(u => (
              <button key={u.value} onClick={() => upd({ delayUnit: u.value, delayValue: d.delayValue ?? 1 })}
                className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${d.delayUnit === u.value ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {QUICK_DELAYS.map(p => {
            const active = d.delayValue === p.value && d.delayUnit === p.unit;
            return (
              <button key={p.label} onClick={() => upd({ delayValue: p.value, delayUnit: p.unit })}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${active ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>
    );

    // ── WAIT EVENT ──
    if (d.flowType === 'wait_event') {
      const already = new Set(d.waitItem ? [d.waitItem.id] : []);
      return (<>
        <Section title="Какое событие ждём" hint={!d.waitItem && upstreamContent.length === 0 ? 'Соедините ноду с шагом «Назначить контент» — элемент подтянется автоматически.' : undefined}>
          {d.waitItem
            ? <div className="space-y-2">
                <ContentRow item={d.waitItem} onRemove={() => upd({ waitItem: undefined })} />
                <div className="px-4 py-2.5 bg-orange-50 rounded-xl text-[12px] font-semibold text-orange-700">
                  Событие: {waitEventLabel(d.waitItem.type)}
                </div>
              </div>
            : <div className="space-y-2">
                <UpstreamPicks exclude={already} onPick={c => upd({ waitItem: c, waitTimeoutDays: d.waitTimeoutDays ?? 7 })} />
                <PickButton label="Выбрать из каталога" onClick={() => openPicker('wait')} />
              </div>}
        </Section>
        {d.waitItem && (
          <Section title="Максимальное ожидание" hint="Если событие не наступит за это время — сработает выход «Тайм-аут».">
            <Toggle label="Без лимита" checked={d.waitTimeoutDays === 0} onChange={v => upd({ waitTimeoutDays: v ? 0 : 7 })} />
            {d.waitTimeoutDays !== 0 && (
              <div className="mt-2">
                <NumberInput value={d.waitTimeoutDays} min={1} max={365} onChange={v => upd({ waitTimeoutDays: v })} suffix="дней ожидания" />
              </div>
            )}
          </Section>
        )}
      </>);
    }

    // ── END ──
    if (d.flowType === 'end') return (<>
      <Section title="Результат">
        <div className="space-y-2">
          <button onClick={() => upd({ endStatus: 'success' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${d.endStatus === 'success' ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              <p className="text-[13px] font-semibold text-neutral-800">Завершён успешно</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Сотрудник прошёл маршрут до конца</p>
            </span>
          </button>
          <button onClick={() => upd({ endStatus: 'aborted' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${d.endStatus === 'aborted' ? 'border-red-300 bg-red-50 ring-2 ring-red-200' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>
              <p className="text-[13px] font-semibold text-neutral-800">Прервать флоу</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Маршрут остановлен без завершения</p>
            </span>
          </button>
        </div>
      </Section>
      <Section title="Параметры">
        <Toggle label="Уведомить HR о завершении" checked={!!d.endNotifyHr} onChange={v => upd({ endNotifyHr: v })} />
      </Section>
    </>);

    return null;
  };

  return (<>
    <div className="w-[380px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.iconText}`} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-neutral-900">{cat.label}</p>
            <p className={`text-[11px] font-semibold ${isConfigured(d) ? 'text-emerald-600' : 'text-amber-500'}`}>
              {isConfigured(d) ? 'Настроена' : 'Требует настройки'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">{renderConfig()}</div>
      <div className="px-5 py-4 border-t border-neutral-100 flex items-center gap-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">Готово</button>
        <button onClick={() => onDuplicate(node.id)} title="Дублировать"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors border border-neutral-200"><Copy className="w-4 h-4" /></button>
        <button onClick={() => onDelete(node.id)} title="Удалить"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-neutral-200"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
    <ElementPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handlePick} />
  </>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD NODE PANEL — categories + search; Pro-ноды в MVP показаны с замком
// ═══════════════════════════════════════════════════════════════════════════════

function AddNodePanel({ isOpen, onClose, onAddNode, pendingFrom, feats }: {
  isOpen: boolean; onClose: () => void;
  onAddNode: (item: CatalogItem) => void;
  pendingFrom?: string | null;
  feats: EditionConfig;
}) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isOpen) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 100); } }, [isOpen]);
  if (!isOpen) return null;

  const term = search.trim().toLowerCase();
  const groups = NODE_CATALOG
    .map(g => ({ ...g, items: g.items.filter(i => !term || i.label.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="w-[340px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div>
          <p className="text-[15px] font-bold text-neutral-900">Добавить ноду</p>
          {pendingFrom
            ? <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Будет соединена с «{pendingFrom}»</p>
            : <p className="text-[11px] text-neutral-400 mt-0.5">Выберите тип шага</p>}
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск ноды..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {groups.map(g => (
          <div key={g.category} className="mb-3">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1.5">{g.category}</p>
            <div className="space-y-1">
              {g.items.map(item => {
                const colors = FLOW_COLORS[item.color];
                const locked = !feats.nodeTypes.includes(item.flowType);
                return (
                  <button key={item.flowType} onClick={() => !locked && onAddNode(item)}
                    disabled={locked}
                    title={locked ? 'Доступно в User Flow Pro' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group border border-transparent ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 hover:border-neutral-100'}`}>
                    <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-[18px] h-[18px] ${colors.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800">{item.label}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{item.description}</p>
                    </div>
                    {locked
                      ? <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-bold shrink-0"><Lock className="w-2.5 h-2.5" /> PRO</span>
                      : <Plus className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 transition-colors shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="py-12 text-center">
            <Search className="w-7 h-7 text-neutral-300 mx-auto mb-2" />
            <p className="text-[13px] font-medium text-neutral-500">Ничего не найдено</p>
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50">
        <p className="text-[11px] text-neutral-400">Подсказка: тяните связь из ноды в пустое место — панель откроется сама.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

interface FlowIssue { level: 'error' | 'warn'; text: string; nodeId?: string; }

function validateFlow(nodes: FlowNode[], edges: Edge[]): FlowIssue[] {
  const issues: FlowIssue[] = [];
  if (nodes.length === 0) return issues;
  const triggers = nodes.filter(n => n.data.flowType === 'trigger');
  if (triggers.length === 0) issues.push({ level: 'error', text: 'Нет триггера — добавьте начальную точку флоу' });
  nodes.forEach(n => {
    const label = catalogFor(n.data.flowType).label;
    if (!isConfigured(n.data)) issues.push({ level: 'error', text: `«${label}» не настроена`, nodeId: n.id });
    if (n.data.flowType !== 'trigger' && !edges.some(e => e.target === n.id))
      issues.push({ level: 'error', text: `«${label}» — нет входящей связи`, nodeId: n.id });
    const outputs = getOutputs(n.data);
    if (outputs.length > 1) {
      outputs.forEach(o => {
        if (!edges.some(e => e.source === n.id && e.sourceHandle === o.id))
          issues.push({ level: 'warn', text: `«${label}»: выход «${o.label}» не соединён`, nodeId: n.id });
      });
    } else if (outputs.length === 1 && n.data.flowType !== 'end' && !edges.some(e => e.source === n.id)) {
      issues.push({ level: 'warn', text: `«${label}» — ветка обрывается`, nodeId: n.id });
    }
  });
  if (!nodes.some(n => n.data.flowType === 'end'))
    issues.push({ level: 'warn', text: 'Нет ноды «Завершить флоу»' });
  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATION ENGINE (Pro)
// ═══════════════════════════════════════════════════════════════════════════════

interface SimStep {
  nodeId?: string; edgeId?: string;
  kind: 'trigger' | 'action' | 'branch' | 'wait' | 'notify' | 'end' | 'stop' | 'info';
  title: string; detail?: string; badge?: string; badgeCls?: string;
}

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstName = (full: string) => full.split(' ')[1] || full;
const fmtDate = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 864e5).toLocaleDateString('ru-RU');

function simulate(emp: Employee, nodes: FlowNode[], edges: Edge[], runSeed: number): SimStep[] {
  const steps: SimStep[] = [];
  const byId = new Map(nodes.map(n => [n.id, n]));
  const trigger = nodes.find(n => n.data.flowType === 'trigger' && isConfigured(n.data));
  if (!trigger) {
    steps.push({ kind: 'stop', title: 'Симуляция невозможна', detail: 'Нет настроенного триггера' });
    return steps;
  }

  const isUz = emp.lang === 'UZ';
  const ctx: { lastContent?: SelectedContent; lastDeadline?: number; curatorName?: string } = {};
  let cur: FlowNode | undefined = trigger;
  let pendingEdgeId: string | undefined;
  let guard = 0;

  const substitute = (text: string) => text
    .replace(/\{имя\}/g, firstName(emp.name))
    .replace(/\{контент\}/g, locTitle(ctx.lastContent, isUz) || 'контент')
    .replace(/\{дедлайн\}/g, fmtDate(ctx.lastDeadline ?? 7))
    .replace(/\{куратор\}/g, ctx.curatorName || 'куратор')
    .replace(/\{отдел\}/g, emp.div);

  while (cur && guard < 60) {
    guard++;
    const d: FlowNodeData = cur.data;
    const rng = mulberry32(emp.id * 7919 + strHash(cur.id) + runSeed * 104729);
    let handle: string | undefined;

    switch (d.flowType) {
      case 'trigger': {
        const t = TRIGGER_OPTIONS.find(o => o.value === d.triggerType)?.label || 'Триггер';
        const aud = d.audience || {};
        const mismatch = (['branch', 'dept', 'div', 'role', 'lang'] as EmployeeFieldKey[]).find(k => {
          const v = aud[k];
          return v && v.length > 0 && !v.includes(String(emp[k]));
        });
        if (mismatch) {
          steps.push({
            nodeId: cur.id, edgeId: pendingEdgeId, kind: 'stop', title: `Триггер: ${t}`,
            detail: `${emp.name} не подходит: ${fieldLabel(mismatch)} «${emp[mismatch]}» вне аудитории`,
            badge: 'Не запущен', badgeCls: 'bg-red-100 text-red-600',
          });
          return steps;
        }
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'trigger', title: `Триггер: ${t}`,
          detail: `${emp.name} · ${emp.dept} / ${emp.div} · ${emp.role} · язык: ${emp.lang}`,
          badge: 'Запущен', badgeCls: 'bg-emerald-100 text-emerald-700',
        });
        break;
      }
      case 'condition_employee': {
        const val = String(emp[d.empField!]);
        const inList = (d.empValues || []).includes(val);
        const pass = d.empOperator === 'not_in' ? !inList : inList;
        handle = pass ? 'true' : 'false';
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'branch', title: `Условие: ${fieldLabel(d.empField)}`,
          detail: `У сотрудника: «${val}» · проверка: ${d.empOperator === 'not_in' ? '≠' : '='} [${(d.empValues || []).join(', ')}]`,
          badge: pass ? 'Да' : 'Нет', badgeCls: pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
        });
        break;
      }
      case 'condition_content': {
        const f = d.conditionField || '';
        const fLabel = getConditionFields(d.conditionItems).find(x => x.value === f)?.label || f;
        let pass = false; let detail = '';
        if (isBoolConditionField(f)) {
          const done = rng() > 0.3;
          pass = (done ? 'Да' : 'Нет') === d.conditionValue;
          detail = `Симуляция: ${done ? 'выполнено' : 'не выполнено'}`;
        } else if (f === 'test_score') {
          const score = 5 + Math.floor(rng() * 26);
          const target = Number(d.conditionValue);
          pass = d.conditionOperator === '>=' ? score >= target : d.conditionOperator === '<' ? score < target : score === target;
          detail = `Симуляция: результат ${score} б. · порог ${d.conditionOperator} ${target}`;
        } else if (f === 'course_progress') {
          const p = Math.floor(rng() * 101);
          const target = Number(d.conditionValue);
          pass = d.conditionOperator === '>=' ? p >= target : d.conditionOperator === '<' ? p < target : p === target;
          detail = `Симуляция: прогресс ${p}% · порог ${d.conditionOperator} ${target}%`;
        }
        handle = pass ? 'true' : 'false';
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'branch',
          title: `Условие: ${fLabel}`,
          detail: `${(d.conditionItems || []).map(i => i.title).join(', ')} · ${detail}`,
          badge: pass ? 'Да' : 'Нет', badgeCls: pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
        });
        break;
      }
      case 'switch': {
        const val = String(emp[d.switchField!]);
        const hit = (d.switchValues || []).includes(val);
        handle = hit ? `sw-${val}` : 'else';
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'branch', title: `Ветвление: ${fieldLabel(d.switchField)}`,
          detail: `У сотрудника: «${val}»`,
          badge: hit ? val : 'Иначе', badgeCls: hit ? 'bg-violet-100 text-violet-700' : 'bg-neutral-200 text-neutral-600',
        });
        break;
      }
      case 'content': {
        ctx.lastContent = d.selectedContent;
        ctx.lastDeadline = d.deadlineDays;
        const dl = d.deadlineDays === 0 ? 'без срока' : `до ${fmtDate(d.deadlineDays ?? 7)}`;
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'action',
          title: `Назначено: ${locTitle(d.selectedContent, isUz)}`,
          detail: `${TYPE_CONFIG[d.selectedContent?.type || 'lesson']?.label} · ${dl}${d.mandatory ? ' · обязательный' : ''}${d.notifyOnAssign ? ' · уведомление отправлено' : ''}${isUz && d.selectedContent?.titleUz ? ' · UZ-версия' : ''}`,
          badge: 'Назначено', badgeCls: 'bg-blue-100 text-blue-700',
        });
        break;
      }
      case 'notify': {
        const rec = NOTIFY_RECIPIENTS.find(r => r.value === d.notifyRecipient)?.label || '';
        const ch = (d.notifyChannels || []).map(c => NOTIFY_CHANNELS.find(x => x.value === c)?.label).join(' + ');
        const text = isUz ? (getNotifyText(d, 'uz') || getNotifyText(d, 'ru')) : getNotifyText(d, 'ru');
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'notify',
          title: `Уведомление → ${rec}`,
          detail: text ? `«${substitute(text)}»` : '',
          badge: `${ch}${isUz ? ' · UZ' : ''}`, badgeCls: 'bg-indigo-100 text-indigo-700',
        });
        break;
      }
      case 'curator': {
        let curator = d.curatorMode === 'specific' ? CURATORS.find(c => c.id === d.curatorId) : undefined;
        if (d.curatorMode === 'auto') {
          const pool = CURATORS.filter(c => c.name !== emp.name);
          curator = pool.find(c => c.dept === emp.dept) || pool[0];
        }
        ctx.curatorName = curator?.name;
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'action',
          title: `Куратор назначен: ${curator?.name || '—'}`,
          detail: d.curatorMode === 'auto' ? `Авто-подбор по департаменту «${emp.dept}»` : `${curator?.dept} · ${curator?.div}`,
          badge: 'Куратор', badgeCls: 'bg-sky-100 text-sky-700',
        });
        break;
      }
      case 'delay': {
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'wait',
          title: `Задержка: ${d.delayValue} ${DELAY_UNIT_SHORT[d.delayUnit || 'day']}`,
          detail: 'В симуляции пауза пропускается',
          badge: 'Пауза', badgeCls: 'bg-yellow-100 text-yellow-700',
        });
        break;
      }
      case 'wait_event': {
        const evt = waitEventLabel(d.waitItem?.type);
        const noLimit = d.waitTimeoutDays === 0;
        const happened = noLimit || rng() > 0.35;
        const days = 1 + Math.floor(rng() * Math.max(1, noLimit ? 10 : d.waitTimeoutDays || 7));
        handle = happened ? 'done' : 'timeout';
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'wait',
          title: `Ожидание: ${evt}`,
          detail: happened
            ? `«${locTitle(d.waitItem, isUz)}» — событие наступило через ~${days} дн.`
            : `«${locTitle(d.waitItem, isUz)}» — событие не наступило за ${d.waitTimeoutDays} дн.`,
          badge: happened ? 'Выполнено' : 'Тайм-аут', badgeCls: happened ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700',
        });
        break;
      }
      case 'end': {
        const ok = d.endStatus === 'success';
        steps.push({
          nodeId: cur.id, edgeId: pendingEdgeId, kind: 'end',
          title: ok ? 'Флоу завершён' : 'Флоу прерван',
          detail: `${emp.name}${d.endNotifyHr ? ' · HR уведомлён о результате' : ''}`,
          badge: ok ? 'Успех' : 'Прерван', badgeCls: ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
        });
        return steps;
      }
    }

    const outs = edges.filter(e => e.source === cur!.id && (handle === undefined || e.sourceHandle === handle));
    if (outs.length === 0) {
      const hLabel = handle ? edgeMeta(handle).label : undefined;
      steps.push({
        kind: 'stop', title: 'Поток остановлен',
        detail: hLabel ? `Выход «${hLabel}» никуда не ведёт` : 'Дальше нет соединённых нод',
      });
      return steps;
    }
    pendingEdgeId = outs[0].id;
    cur = byId.get(outs[0].target);
  }
  if (guard >= 60) steps.push({ kind: 'stop', title: 'Симуляция остановлена', detail: 'Превышен лимит шагов (возможен бесконечный цикл)' });
  return steps;
}

const SIM_KIND_STYLE: Record<SimStep['kind'], { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  trigger: { icon: Zap,           cls: 'bg-emerald-100 text-emerald-600' },
  action:  { icon: BookOpen,      cls: 'bg-blue-100 text-blue-600' },
  branch:  { icon: GitBranch,     cls: 'bg-amber-100 text-amber-600' },
  wait:    { icon: Clock,         cls: 'bg-yellow-100 text-yellow-700' },
  notify:  { icon: Bell,          cls: 'bg-indigo-100 text-indigo-600' },
  end:     { icon: CheckCircle,   cls: 'bg-emerald-100 text-emerald-600' },
  stop:    { icon: AlertTriangle, cls: 'bg-red-100 text-red-500' },
  info:    { icon: AlertCircle,   cls: 'bg-neutral-100 text-neutral-500' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATION PANEL (Pro)
// ═══════════════════════════════════════════════════════════════════════════════

function SimulationPanel({ onClose, onRun, steps, stepIdx, playing, employee, setEmployee }: {
  onClose: () => void;
  onRun: () => void;
  steps: SimStep[]; stepIdx: number; playing: boolean;
  employee: Employee | null; setEmployee: (e: Employee) => void;
}) {
  const [empListOpen, setEmpListOpen] = useState(!employee);
  const logRef = useRef<HTMLDivElement>(null);
  const visible = steps.slice(0, stepIdx + 1);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [stepIdx]);

  return (
    <div className="w-[380px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Play className="w-5 h-5 text-teal-600" /></div>
          <div>
            <p className="text-[15px] font-bold text-neutral-900">Симуляция</p>
            <p className="text-[11px] text-neutral-400">Прогон флоу на реальном сотруднике</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      {/* Employee selector */}
      <div className="px-4 py-3 border-b border-neutral-100">
        <button onClick={() => setEmpListOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
          {employee ? (<>
            <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold flex items-center justify-center shrink-0">{employee.initials}</span>
            <span className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-neutral-800 truncate">{employee.name}</p>
              <p className="text-[11px] text-neutral-400 truncate">{employee.dept} · {employee.role}</p>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 shrink-0">{employee.lang}</span>
          </>) : (<>
            <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"><UserPlus className="w-4 h-4 text-neutral-400" /></span>
            <span className="flex-1 text-[13px] font-medium text-neutral-500">Выберите сотрудника</span>
          </>)}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${empListOpen ? 'rotate-180' : ''}`} />
        </button>
        {empListOpen && (
          <div className="mt-2 max-h-[240px] overflow-y-auto rounded-xl border border-neutral-100 divide-y divide-neutral-50">
            {EMPLOYEES.map(e => (
              <button key={e.id} onClick={() => { setEmployee(e); setEmpListOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${employee?.id === e.id ? 'bg-teal-50' : 'hover:bg-neutral-50'}`}>
                <span className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold flex items-center justify-center shrink-0">{e.initials}</span>
                <span className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-neutral-800 truncate">{e.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{e.dept} / {e.div} · {e.role}</p>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 shrink-0">{e.lang}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={onRun} disabled={!employee || playing}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-[13px] font-semibold hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {steps.length > 0 && !playing ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? 'Выполняется…' : steps.length > 0 ? 'Запустить ещё раз' : 'Запустить симуляцию'}
        </button>
      </div>

      {/* Log */}
      <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-50/50">
        {visible.length === 0 && (
          <div className="py-16 text-center">
            <Route className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-neutral-500">Выберите сотрудника и запустите</p>
            <p className="text-[11px] text-neutral-400 mt-1">Профиль и язык берутся из раздела «Пользователи».<br />Прогресс по контенту симулируется.</p>
          </div>
        )}
        {visible.map((s, i) => {
          const st = SIM_KIND_STYLE[s.kind];
          const SIcon = st.icon;
          return (
            <div key={i} className={`flex gap-3 p-3 bg-white rounded-xl border border-neutral-100 ${i === visible.length - 1 && playing ? 'ring-2 ring-teal-200' : ''}`}>
              <div className={`w-7 h-7 rounded-lg ${st.cls} flex items-center justify-center shrink-0`}><SIcon className="w-3.5 h-3.5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-bold text-neutral-800 flex-1 min-w-0 truncate">{s.title}</p>
                  {s.badge && <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${s.badgeCls}`}>{s.badge}</span>}
                </div>
                {s.detail && <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{s.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARTER TEMPLATES — по версии инструмента
// ═══════════════════════════════════════════════════════════════════════════════

const TPL_WELCOME: SelectedContent = { id: 'c-990', title: 'Welcome Day: Знакомство с компанией', titleUz: 'Welcome Day: Kompaniya bilan tanishuv', type: 'course' };
const TPL_SECURITY: SelectedContent = { id: 'c-821', title: 'Основы корпоративной безопасности', titleUz: 'Korporativ xavfsizlik asoslari', type: 'course' };
const TPL_IB_TEST: SelectedContent = { id: 'tst-2', title: 'Тест по информационной безопасности', titleUz: 'Axborot xavfsizligi bo\'yicha test', type: 'test' };
const TPL_SURVEY: SelectedContent = { id: 'srv-2', title: 'Оценка качества обучения', titleUz: 'O\'qitish sifatini baholash', type: 'survey' };

export function makeTemplate(edition: Edition): { nodes: FlowNode[]; edges: Edge[] } {
  const N = (id: string, x: number, y: number, data: FlowNodeData): FlowNode =>
    ({ id, type: 'userflow', position: { x, y }, data });

  if (edition === 'mvp') {
    const nodes: FlowNode[] = [
      N('t1', 400, 0,    { flowType: 'trigger', triggerType: 'new_employee', audience: {} }),
      N('n1', 400, 180,  { flowType: 'notify', notifyChannels: ['push', 'telegram'], notifyRecipient: 'employee', notifyTemplateId: 'tpl-welcome' }),
      N('c1', 400, 360,  { flowType: 'content', selectedContent: TPL_WELCOME, deadlineDays: 7, mandatory: true, notifyOnAssign: true }),
      N('w1', 400, 540,  { flowType: 'wait_event', waitItem: TPL_WELCOME, waitTimeoutDays: 7 }),
      N('c2', 180, 760,  { flowType: 'content', selectedContent: TPL_SURVEY, deadlineDays: 7 }),
      N('n2', 640, 760,  { flowType: 'notify', notifyChannels: ['push'], notifyRecipient: 'employee', notifyTemplateId: 'tpl-reminder' }),
      N('e1', 180, 950,  { flowType: 'end', endStatus: 'success', endNotifyHr: true }),
    ];
    const edges: Edge[] = [
      buildEdge('t1', 'n1'), buildEdge('n1', 'c1'), buildEdge('c1', 'w1'),
      buildEdge('w1', 'c2', 'done'),
      buildEdge('w1', 'n2', 'timeout'),
      buildEdge('n2', 'w1'),
      buildEdge('c2', 'e1'),
    ];
    return { nodes, edges };
  }

  const nodes: FlowNode[] = [
    N('t1',  400, 0,    { flowType: 'trigger', triggerType: 'new_employee', audience: {} }),
    N('cu1', 400, 180,  { flowType: 'curator', curatorMode: 'auto' }),
    N('n1',  400, 350,  { flowType: 'notify', notifyChannels: ['push', 'telegram'], notifyRecipient: 'employee', notifyTemplateId: 'tpl-welcome' }),
    N('s1',  400, 540,  { flowType: 'switch', switchField: 'dept', switchValues: ['Коммерческий департамент', 'IT'] }),
    N('c1',  20,  760,  { flowType: 'content', selectedContent: TPL_WELCOME, deadlineDays: 7, mandatory: true, notifyOnAssign: true }),
    N('c2',  400, 760,  { flowType: 'content', selectedContent: TPL_SECURITY, deadlineDays: 14, mandatory: true, notifyOnAssign: true }),
    N('c3',  780, 760,  { flowType: 'content', selectedContent: TPL_WELCOME, deadlineDays: 7, mandatory: true }),
    N('w1',  20,  950,  { flowType: 'wait_event', waitItem: TPL_WELCOME, waitTimeoutDays: 7 }),
    N('c4',  -120, 1170, { flowType: 'content', selectedContent: TPL_IB_TEST, deadlineDays: 3, mandatory: true }),
    N('n2',  300, 1170, { flowType: 'notify', notifyChannels: ['push'], notifyRecipient: 'employee', notifyTemplateId: 'tpl-reminder' }),
    N('if1', -120, 1360, { flowType: 'condition_content', conditionItems: [TPL_IB_TEST], conditionField: 'test_score', conditionOperator: '>=', conditionValue: '15' }),
    N('n3',  -300, 1570, { flowType: 'notify', notifyChannels: ['push'], notifyRecipient: 'employee', notifyTemplateId: 'tpl-passed' }),
    N('n4',  90,  1570, { flowType: 'notify', notifyChannels: ['telegram'], notifyRecipient: 'curator', notifyTemplateId: 'tpl-failed' }),
    N('d1',  90,  1750, { flowType: 'delay', delayValue: 3, delayUnit: 'day' }),
    N('sv1', 640, 990,  { flowType: 'content', selectedContent: TPL_SURVEY, deadlineDays: 7 }),
    N('e1',  400, 1930, { flowType: 'end', endStatus: 'success', endNotifyHr: true }),
  ];
  const edges: Edge[] = [
    buildEdge('t1', 'cu1'), buildEdge('cu1', 'n1'), buildEdge('n1', 's1'),
    buildEdge('s1', 'c1', 'sw-Коммерческий департамент'),
    buildEdge('s1', 'c2', 'sw-IT'),
    buildEdge('s1', 'c3', 'else'),
    buildEdge('c1', 'w1'),
    buildEdge('w1', 'c4', 'done'),
    buildEdge('w1', 'n2', 'timeout'),
    buildEdge('n2', 'w1'),
    buildEdge('c4', 'if1'),
    buildEdge('if1', 'n3', 'true'),
    buildEdge('if1', 'n4', 'false'),
    buildEdge('n4', 'd1'),
    buildEdge('d1', 'c4'),
    buildEdge('c2', 'sv1'), buildEdge('c3', 'sv1'),
    buildEdge('n3', 'e1'), buildEdge('sv1', 'e1'),
  ];
  return { nodes, edges };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FLOW BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function FlowBuilderInner({ edition, flowId }: { edition: Edition; flowId: string }) {
  const feats = EDITIONS[edition];
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [flowName, setFlowName] = useState('Без названия');
  const [editingName, setEditingName] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reactFlowInstance = useReactFlow();
  const storeApi = useStoreApi();
  const nodeIdCounter = useRef(1);

  // Pending connection: drag from a handle dropped on empty canvas → add + connect
  const [pending, setPending] = useState<{ source: string; sourceHandle?: string | null; x: number; y: number } | null>(null);

  // Simulation state (Pro)
  const [simOpen, setSimOpen] = useState(false);
  const [simEmployee, setSimEmployee] = useState<Employee | null>(null);
  const [simSteps, setSimSteps] = useState<SimStep[]>([]);
  const [simIdx, setSimIdx] = useState(-1);
  const [simPlaying, setSimPlaying] = useState(false);
  const simRunSeed = useRef(0);

  // Bulk programmatic setNodes (restore, template) misses xyflow's measure
  // pass while the flow is still initializing: handleBounds stay empty and
  // every edge is silently skipped. Force synchronous re-measure sweeps
  // (the public useUpdateNodeInternals defers via rAF, which can starve).
  const forceMeasure = useCallback((ids: string[]) => {
    if (!ids.length) return;
    const sweep = () => {
      const { domNode, updateNodeInternals } = storeApi.getState();
      if (!domNode) return;
      const updates = new Map();
      ids.forEach(id => {
        const el = domNode.querySelector(`.react-flow__node[data-id="${CSS.escape(id)}"]`);
        if (el) updates.set(id, { id, nodeElement: el as HTMLDivElement, force: true });
      });
      if (updates.size) updateNodeInternals(updates);
    };
    [150, 600, 1500].forEach(ms => setTimeout(sweep, ms));
  }, [storeApi]);

  // ── Persistence: загрузка флоу по id ──
  const handleInit = useCallback(() => {
    const rec = getFlow(edition, flowId);
    if (!rec) { setNotFound(true); setLoaded(true); return; }
    const recNodes = (rec.nodes as FlowNode[]).map(n => ({
      id: n.id, type: 'userflow', position: n.position, data: n.data,
    }));
    setNodes(recNodes);
    setEdges(rec.edges as Edge[]);
    setActive(rec.active);
    setFlowName(rec.name);
    const maxId = recNodes.reduce((m, n) => {
      const match = /^node-(\d+)$/.exec(n.id);
      return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    nodeIdCounter.current = maxId + 1;
    setLoaded(true);
    forceMeasure(recNodes.map(n => n.id));
    if (recNodes.length) setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 400 }), 350);
  }, [edition, flowId, setNodes, setEdges, forceMeasure, reactFlowInstance]);

  useEffect(() => {
    if (!loaded || notFound) return;
    const t = setTimeout(() => {
      const clean = nodes.map(n => ({ ...n, data: { ...n.data, simState: undefined } }));
      upsertFlow(edition, { id: flowId, name: flowName, active, updatedAt: Date.now(), nodes: clean, edges });
    }, 400);
    return () => clearTimeout(t);
  }, [nodes, edges, active, flowName, loaded, notFound, edition, flowId]);

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSelectedNode(null); setSimOpen(false); setAddPanelOpen(true); }
      if (e.key === 'Escape') { setAddPanelOpen(false); setPending(null); setIssuesOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Node CRUD ──
  const handleUpdateNode = useCallback((id: string, patch: Partial<FlowNodeData>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelectedNode(prev => prev && prev.id === id ? { ...prev, data: { ...prev.data, ...patch } } : prev);
    // Switch: drop edges whose source handle no longer exists
    if (patch.switchValues !== undefined || patch.switchField !== undefined) {
      const valid = new Set([...(patch.switchValues || []).map(v => `sw-${v}`), 'else']);
      setEdges(eds => eds.filter(e => e.source !== id || (e.sourceHandle && valid.has(e.sourceHandle))));
    }
  }, [setNodes, setEdges]);

  // ── Connections ──
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    setEdges(eds => addEdge(buildEdge(connection.source!, connection.target!, connection.sourceHandle), eds));
    // Контекст из предыдущих шагов: условие/ожидание подтягивают контент источника
    const target = nodes.find(n => n.id === connection.target);
    if (!target) return;
    const d = target.data;
    const wantsContent =
      (d.flowType === 'condition_content' && !(d.conditionItems?.length)) ||
      (d.flowType === 'wait_event' && !d.waitItem);
    if (!wantsContent) return;
    const up = collectContentFrom([connection.source], nodes, edges);
    if (!up.length) return;
    const patch: Partial<FlowNodeData> = d.flowType === 'wait_event'
      ? { waitItem: up[0], waitTimeoutDays: d.waitTimeoutDays ?? 7 }
      : { conditionItems: [up[0]] };
    handleUpdateNode(target.id, patch);
  }, [setEdges, nodes, edges, handleUpdateNode]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
    if (connectionState.isValid || !connectionState.fromNode || connectionState.fromHandle?.type !== 'source') return;
    const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
    const pos = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
    setPending({ source: connectionState.fromNode.id, sourceHandle: connectionState.fromHandle?.id, x: pos.x, y: pos.y });
    setSelectedNode(null); setSimOpen(false);
    setAddPanelOpen(true);
  }, [reactFlowInstance]);

  const handleAddNode = useCallback((item: CatalogItem) => {
    const id = `node-${nodeIdCounter.current++}`;
    const position = pending
      ? { x: pending.x - 120, y: pending.y }
      : reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const data: FlowNodeData = { flowType: item.flowType };
    // Контекст из предыдущих шагов при добавлении перетягиванием связи
    if (pending && (item.flowType === 'condition_content' || item.flowType === 'wait_event')) {
      const up = collectContentFrom([pending.source], nodes, edges);
      if (up.length) {
        if (item.flowType === 'wait_event') { data.waitItem = up[0]; data.waitTimeoutDays = 7; }
        else data.conditionItems = [up[0]];
      }
    }
    const newNode: FlowNode = { id, type: 'userflow', position, data };
    setNodes(nds => [...nds, newNode]);
    if (pending && item.flowType !== 'trigger') {
      setEdges(eds => [...eds, buildEdge(pending.source, id, pending.sourceHandle)]);
    }
    setPending(null);
    setAddPanelOpen(false);
    setTimeout(() => setSelectedNode(newNode), 50);
  }, [setNodes, setEdges, reactFlowInstance, pending, nodes, edges]);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleDuplicateNode = useCallback((id: string) => {
    setNodes(nds => {
      const src = nds.find(n => n.id === id);
      if (!src) return nds;
      const copy: FlowNode = {
        ...src, id: `node-${nodeIdCounter.current++}`,
        position: { x: src.position.x + 60, y: src.position.y + 60 },
        selected: false,
        data: { ...src.data, simState: undefined },
      };
      setTimeout(() => setSelectedNode(copy), 50);
      return [...nds, copy];
    });
  }, [setNodes]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setAddPanelOpen(false); setSimOpen(false);
    setSelectedNode(node as FlowNode);
  }, []);
  const handlePaneClick = useCallback(() => { setSelectedNode(null); setIssuesOpen(false); }, []);

  const loadTemplate = useCallback(() => {
    const tpl = makeTemplate(edition);
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    forceMeasure(tpl.nodes.map(n => n.id));
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.15, duration: 500 }), 300);
  }, [edition, setNodes, setEdges, reactFlowInstance, forceMeasure]);

  // Контент из предыдущих шагов для открытой в инспекторе ноды
  const upstreamContent = useMemo(() => {
    if (!selectedNode) return [];
    const t = selectedNode.data.flowType;
    if (t !== 'condition_content' && t !== 'wait_event') return [];
    const sources = edges.filter(e => e.target === selectedNode.id).map(e => e.source);
    return collectContentFrom(sources, nodes, edges);
  }, [selectedNode, nodes, edges]);

  // ── Validation ──
  const issues = useMemo(() => validateFlow(nodes, edges), [nodes, edges]);
  const errorCount = issues.filter(i => i.level === 'error').length;
  const warnCount = issues.filter(i => i.level === 'warn').length;

  const focusIssue = useCallback((issue: FlowIssue) => {
    if (!issue.nodeId) return;
    const n = nodes.find(x => x.id === issue.nodeId);
    if (!n) return;
    reactFlowInstance.setCenter(n.position.x + 130, n.position.y + 70, { zoom: 1, duration: 500 });
    setSelectedNode(n);
    setIssuesOpen(false);
  }, [nodes, reactFlowInstance]);

  // ── Simulation (Pro) ──
  const runSimulation = useCallback(() => {
    if (!simEmployee) return;
    simRunSeed.current += 1;
    const steps = simulate(simEmployee, nodes, edges, simRunSeed.current);
    setSimSteps(steps);
    setSimIdx(-1);
    setSimPlaying(true);
  }, [simEmployee, nodes, edges]);

  useEffect(() => {
    if (!simPlaying) return;
    if (simIdx >= simSteps.length - 1) { setSimPlaying(false); return; }
    const t = setTimeout(() => setSimIdx(i => i + 1), 700);
    return () => clearTimeout(t);
  }, [simPlaying, simIdx, simSteps]);

  // Center on the active simulation node
  useEffect(() => {
    if (!simPlaying || simIdx < 0) return;
    const nodeId = simSteps[simIdx]?.nodeId;
    if (!nodeId) return;
    const n = nodes.find(x => x.id === nodeId);
    if (n) reactFlowInstance.setCenter(n.position.x + 130, n.position.y + 70, { zoom: Math.max(0.75, reactFlowInstance.getZoom()), duration: 450 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simIdx, simPlaying]);

  const closeSim = useCallback(() => {
    setSimOpen(false); setSimSteps([]); setSimIdx(-1); setSimPlaying(false);
  }, []);

  const simVisual = useMemo(() => {
    if (!simOpen || simSteps.length === 0 || simIdx < 0) return null;
    const visited = new Set<string>(); const traversed = new Set<string>();
    for (let i = 0; i <= simIdx && i < simSteps.length; i++) {
      if (simSteps[i].nodeId) visited.add(simSteps[i].nodeId!);
      if (simSteps[i].edgeId) traversed.add(simSteps[i].edgeId!);
    }
    return { visited, traversed, activeId: simSteps[simIdx]?.nodeId };
  }, [simOpen, simSteps, simIdx]);

  const displayNodes = useMemo(() => {
    if (!simVisual) return nodes;
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        simState: (n.id === simVisual.activeId ? 'active' : simVisual.visited.has(n.id) ? 'visited' : 'idle') as FlowNodeData['simState'],
      },
    }));
  }, [nodes, simVisual]);

  const displayEdges = useMemo(() => {
    if (!simVisual) return edges;
    return edges.map(e => simVisual.traversed.has(e.id)
      ? { ...e, animated: true, style: { ...e.style, strokeWidth: 3, opacity: 1 } }
      : { ...e, style: { ...e.style, opacity: 0.2 } });
  }, [edges, simVisual]);

  const openSim = () => { setSelectedNode(null); setAddPanelOpen(false); setSimOpen(true); };

  const statusChip = errorCount > 0
    ? { cls: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle, text: `${errorCount} ошиб.` }
    : warnCount > 0
      ? { cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle, text: `${warnCount} предупр.` }
      : { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2, text: 'Готов к запуску' };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={displayNodes} edges={displayEdges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onConnectEnd={onConnectEnd} onInit={handleInit}
          onNodeClick={handleNodeClick} onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes} defaultEdgeOptions={defaultEdgeOptions}
          fitView fitViewOptions={{ padding: 0.3 }} className="bg-[#FAFAFA]"
          snapToGrid snapGrid={[20, 20]} deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode="Shift" minZoom={0.15} maxZoom={2}>
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E5E5" />
          <MiniMap nodeColor={(node: Node) => {
            const cat = catalogFor((node.data as FlowNodeData).flowType);
            return {
              emerald: '#10b981', amber: '#f59e0b', violet: '#8b5cf6', blue: '#3b82f6', indigo: '#6366f1',
              sky: '#0ea5e9', yellow: '#eab308', orange: '#f97316', rose: '#f43f5e',
            }[cat.color] || '#3b82f6';
          }} maskColor="rgba(0,0,0,0.08)" className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm" pannable zoomable />
          <Controls showInteractive={false} className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm" />

          {/* Top right: actions */}
          <Panel position="top-right">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-neutral-200 px-2 py-1.5 mt-3 mr-3">
              <button onClick={() => { setSelectedNode(null); setSimOpen(false); setPending(null); setAddPanelOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[12px] font-semibold hover:bg-neutral-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Добавить ноду
              </button>
              {feats.simulation && (
                <button onClick={openSim}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-[12px] font-semibold hover:bg-teal-700 transition-colors">
                  <Play className="w-3.5 h-3.5" /> Симуляция
                </button>
              )}
              <div className="w-px h-6 bg-neutral-200" />
              <button onClick={() => reactFlowInstance.fitView({ padding: 0.3, duration: 400 })}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors" title="Вписать в экран">
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-neutral-400 px-2">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono">Ctrl+K</kbd> добавить
              </div>
            </div>
          </Panel>

          {/* Top left: title + status */}
          <Panel position="top-left">
            <div className="flex items-start gap-3 mt-3 ml-3">
              <a href={feats.basePath} className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </a>
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    {editingName ? (
                      <input autoFocus value={flowName}
                        onChange={e => setFlowName(e.target.value)}
                        onBlur={() => { if (!flowName.trim()) setFlowName('Без названия'); setEditingName(false); }}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className="text-[15px] font-bold text-neutral-900 bg-neutral-50 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-[220px]" />
                    ) : (
                      <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 group" title="Переименовать">
                        <p className="text-[15px] font-bold text-neutral-900">{flowName}</p>
                        <Edit3 className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                      </button>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${edition === 'pro' ? 'bg-violet-100 text-violet-600' : 'bg-teal-100 text-teal-700'}`}>{feats.badge}</span>
                    <button
                      onClick={() => errorCount === 0 && setActive(a => !a)}
                      disabled={errorCount > 0}
                      title={errorCount > 0 ? 'Исправьте ошибки, чтобы активировать' : active ? 'Флоу активен — нажмите, чтобы остановить' : 'Активировать флоу'}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${active ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'} ${errorCount > 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      {active ? 'Активен' : 'Черновик'}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{nodes.length} нод · {edges.length} связей · RU/UZ</p>
                </div>
                {nodes.length > 0 && (
                  <div className="relative">
                    <button onClick={() => setIssuesOpen(o => !o)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold shadow-sm transition-colors ${statusChip.cls}`}>
                      <statusChip.icon className="w-3.5 h-3.5" /> {statusChip.text}
                      {issues.length > 0 && <ChevronDown className={`w-3 h-3 transition-transform ${issuesOpen ? 'rotate-180' : ''}`} />}
                    </button>
                    {issuesOpen && issues.length > 0 && (
                      <div className="absolute top-full mt-1.5 left-0 w-[300px] bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 max-h-[300px] overflow-y-auto">
                        {issues.map((issue, i) => (
                          <button key={i} onClick={() => focusIssue(issue)}
                            className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-neutral-50 transition-colors ${issue.nodeId ? 'cursor-pointer' : 'cursor-default'}`}>
                            {issue.level === 'error'
                              ? <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                              : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                            <span className="text-[11px] font-medium text-neutral-600 leading-snug">{issue.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Not found */}
          {notFound && (
            <Panel position="top-center">
              <div className="mt-[25vh] text-center bg-white rounded-2xl shadow-lg border border-neutral-200 px-10 py-8">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-[16px] font-bold text-neutral-700 mb-1">Флоу не найден</p>
                <p className="text-[13px] text-neutral-400 mb-4">Возможно, он был удалён</p>
                <a href={feats.basePath}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> К списку флоу
                </a>
              </div>
            </Panel>
          )}

          {/* Empty state */}
          {loaded && !notFound && nodes.length === 0 && (
            <Panel position="top-center">
              <div className="mt-[22vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Route className="w-7 h-7 text-neutral-400" />
                </div>
                <p className="text-[16px] font-bold text-neutral-700 mb-1">Пустой флоу</p>
                <p className="text-[13px] text-neutral-400 mb-4">Начните с триггера или загрузите готовый шаблон</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setAddPanelOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                    <Plus className="w-4 h-4" /> Добавить ноду
                  </button>
                  <button onClick={loadTemplate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-[13px] font-semibold hover:bg-neutral-50 transition-colors shadow-sm">
                    <Route className="w-4 h-4 text-teal-500" /> Шаблон: Онбординг сотрудника
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {addPanelOpen && (
        <AddNodePanel isOpen onClose={() => { setAddPanelOpen(false); setPending(null); }} onAddNode={handleAddNode} feats={feats}
          pendingFrom={pending ? catalogFor(nodes.find(n => n.id === pending.source)?.data.flowType || 'trigger').label : null} />
      )}
      {selectedNode && !addPanelOpen && !simOpen && (
        <InspectorPanel node={selectedNode} upstreamContent={upstreamContent} feats={feats} onClose={() => setSelectedNode(null)}
          onUpdate={handleUpdateNode} onDelete={handleDeleteNode} onDuplicate={handleDuplicateNode} />
      )}
      {simOpen && !addPanelOpen && feats.simulation && (
        <SimulationPanel onClose={closeSim} onRun={runSimulation}
          steps={simSteps} stepIdx={simIdx} playing={simPlaying}
          employee={simEmployee} setEmployee={setSimEmployee} />
      )}
    </div>
  );
}

export function UserFlowBuilder({ edition, flowId }: { edition: Edition; flowId: string }) {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ReactFlowProvider><FlowBuilderInner edition={edition} flowId={flowId} /></ReactFlowProvider>
    </div>
  );
}
