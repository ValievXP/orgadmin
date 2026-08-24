"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — РЕДАКТОР СЦЕНАРИЯ
//
// Холст, панели настройки шагов, проверка перед включением и мониторинг.
// Вся логика шагов живёт в registry.tsx — здесь только их размещение и связи.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useMemo, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap, Background,
  BackgroundVariant, Connection, Edge, Node, NodeProps, Handle, Position,
  useReactFlow, ReactFlowProvider, Panel, useStoreApi, FinalConnectionState, NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus, X, Search, ArrowLeft, Trash2, Copy, Edit3, Lock, Maximize2, Users,
  CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, Route, Play, Pause,
  ChevronDown, Settings2, Undo2, Redo2, LayoutGrid, Keyboard, ClipboardCopy, Check,
} from 'lucide-react';

import { Employee } from '@/lib/platform/profile';
import {
  FlowNode, StepData, StepType, FlowSettings, DEFAULT_SETTINGS,
  SCHEMA_VERSION, TONE_HANDLE, TONE_TEXT, FlowDoc,
} from './types';
import { Edition, EDITIONS, stepAllowed, isProStep } from './editions';
import { stepDef, stepSummary, stepOutputs, isConfigured, STEP_TONE, stepCatalog } from './registry';
import { buildEdge, collectUpstream, dropOrphanEdges, restyleEdges, autoLayout } from './graph';
import { getFlow, upsertFlow } from './storage';
import { checkFlow, CheckReport, CheckItem } from './check';
import { participantsOf, participantStats, STATE_LABEL, STATE_STYLE } from './participants';
import { audienceOf, describeAudience, totalReachable } from './audience';
import { FlowSettingsPanel, startSummary, AudienceModal } from './FlowHeader';
import { PrototypeOnly } from './ui';

// ═══════════════════════════════════════════════════════════════════════════════
// КАРТОЧКА ШАГА
// ═══════════════════════════════════════════════════════════════════════════════

const SettingsContext = createContext<FlowSettings>(DEFAULT_SETTINGS);
const EditionContext = createContext<Edition>('mvp');

/** Действия, которые карточка шага вызывает у редактора. */
interface CanvasActions { addAfter: (nodeId: string, handleId: string) => void }
const ActionsContext = createContext<CanvasActions>({ addAfter: () => {} });

/** Кнопка «продолжить отсюда» — главный способ добавить шаг, не зная про перетаскивание связей. */
function AddAfterButton({ nodeId, handleId, style }: {
  nodeId: string; handleId: string; style?: React.CSSProperties;
}) {
  const { addAfter } = useContext(ActionsContext);
  return (
    <button
      type="button"
      title="Добавить следующий шаг"
      onClick={e => { e.stopPropagation(); addAfter(nodeId, handleId); }}
      style={style}
      className="nodrag nopan absolute w-6 h-6 rounded-full bg-white border border-neutral-300 text-neutral-400
        flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100
        hover:border-neutral-900 hover:text-neutral-900 hover:scale-110 transition-all z-10">
      <Plus className="w-3.5 h-3.5" />
    </button>
  );
}

const StepNode = React.memo(function StepNode({ id, data, selected }: NodeProps<FlowNode>) {
  const def = stepDef(data.step);
  const tone = STEP_TONE[def.tone];
  const Icon = def.icon;
  const settings = useContext(SettingsContext);
  const edition = useContext(EditionContext);
  const storeApi = useStoreApi();
  const isPro = isProStep(data.step);
  const unsupported = !stepAllowed(edition, data.step);

  const isStart = data.step === 'start';
  const outputs = stepOutputs(data);
  const multi = outputs.length > 1;
  const configured = isConfigured(data);

  const start = isStart ? startSummary(settings) : null;
  const summary = isStart ? start!.who : stepSummary(data);

  // При смене набора выходов ReactFlow нужно синхронно переизмерить узел,
  // иначе связи из новых ручек не рисуются.
  const outKey = outputs.map(o => o.id).join('|');
  useEffect(() => {
    const { domNode, updateNodeInternals } = storeApi.getState();
    const el = domNode?.querySelector(`.react-flow__node[data-id="${CSS.escape(id)}"]`);
    if (el) updateNodeInternals(new Map([[id, { id, nodeElement: el as HTMLDivElement, force: true }]]));
  }, [outKey, id, storeApi]);

  const width = Math.max(250, outputs.length * 112);

  const runCls = data.runState === 'active'
    ? 'ring-4 ring-emerald-300/70 !border-emerald-400 shadow-lg shadow-emerald-500/20'
    : data.runState === 'visited' ? '!border-emerald-300'
    : data.runState === 'idle' ? 'opacity-40' : '';

  return (
    <div className="relative group">
      {!isStart && (
        <Handle type="target" position={Position.Top}
          className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${tone.handle} !-top-1.5`} />
      )}

      <div style={{ minWidth: multi ? width : 250, maxWidth: Math.max(320, multi ? width : 250) }}
        className={`bg-white border-2 rounded-2xl transition-all duration-200 ${
          unsupported ? 'border-dashed border-red-400 bg-red-50/40'
            : selected ? 'border-neutral-900 shadow-lg'
            : configured ? tone.border
            : 'border-dashed border-amber-400 bg-amber-50/30'
        } ${selected ? 'scale-[1.02]' : 'hover:shadow-md'} ${runCls}`}>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`w-9 h-9 rounded-xl ${tone.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-[18px] h-[18px] ${tone.iconText}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-bold text-neutral-900 truncate">{def.label}</p>
              {isPro && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                  unsupported ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'
                }`}>PRO</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {isStart ? start!.when : def.description}
            </p>
          </div>
        </div>

        {summary && (
          <div className="px-4 pb-2">
            <div className="bg-neutral-50 rounded-lg px-3 py-1.5 text-[11px] text-neutral-600 font-medium truncate" title={summary}>
              {summary}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-4 pb-3">
          {unsupported ? (
            <><Lock className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-medium text-red-600">Недоступен в этой версии</span></>
          ) : isStart ? (
            <><Settings2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-medium text-neutral-400">Нажмите, чтобы настроить</span></>
          ) : configured ? (
            <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600">Готов</span></>
          ) : (
            <><AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-500">Нужно заполнить</span></>
          )}
        </div>
      </div>

      {!multi && outputs.length === 1 && (
        <>
          {/* id обязателен: связи ссылаются на выход по имени, включая единственный */}
          <Handle type="source" position={Position.Bottom} id={outputs[0].id}
            className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${tone.handle} !-bottom-1.5`} />
          <AddAfterButton nodeId={id} handleId={outputs[0].id}
            style={{ left: '50%', bottom: -40, transform: 'translateX(-50%)' }} />
        </>
      )}

      {multi && outputs.map((o, i) => {
        const left = `${((i + 1) / (outputs.length + 1)) * 100}%`;
        return (
          <React.Fragment key={o.id}>
            <Handle type="source" position={Position.Bottom} id={o.id}
              className={`!w-3 !h-3 !rounded-full !border-2 !border-white ${TONE_HANDLE[o.tone]} !-bottom-1.5`}
              style={{ left }} />
            <div className={`absolute -bottom-6 text-[9.5px] font-bold ${TONE_TEXT[o.tone]} text-center truncate`}
              style={{ left, transform: 'translateX(-50%)', maxWidth: 100 }} title={o.label}>
              {o.label}
            </div>
            <AddAfterButton nodeId={id} handleId={o.id}
              style={{ left, bottom: -62, transform: 'translateX(-50%)' }} />
          </React.Fragment>
        );
      })}
    </div>
  );
});

const nodeTypes = { step: StepNode };

/**
 * Буфер скопированных шагов. Живёт вне компонента, поэтому скопированное
 * в одном сценарии можно вставить в другой, не выходя из инструмента.
 */
let stepClipboard: { nodes: FlowNode[]; edges: Edge[] } | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ПАНЕЛЬ НАСТРОЙКИ ШАГА
// ═══════════════════════════════════════════════════════════════════════════════

function StepInspector({ node, upstream, audience, pro, onUpdate, onDelete, onDuplicate, onClose }: {
  node: FlowNode; upstream: StepData['item'][]; audience: Employee[]; pro: boolean;
  onUpdate: (id: string, patch: Partial<StepData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
}) {
  const def = stepDef(node.data.step);
  const tone = STEP_TONE[def.tone];
  const Icon = def.icon;
  const Inspector = def.Inspector;

  return (
    <div className="w-[400px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${tone.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${tone.iconText}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-neutral-900 truncate">{def.label}</p>
            <p className={`text-[11.5px] font-semibold ${isConfigured(node.data) ? 'text-emerald-600' : 'text-amber-500'}`}>
              {isConfigured(node.data) ? 'Заполнен' : 'Нужно заполнить'}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {Inspector && (
          <Inspector
            data={node.data}
            update={patch => onUpdate(node.id, patch)}
            upstream={(upstream.filter(Boolean) as NonNullable<StepData['item']>[])}
            audience={audience}
            pro={pro}
          />
        )}
      </div>

      <div className="px-5 py-4 border-t border-neutral-100 flex items-center gap-2 shrink-0">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
          Готово
        </button>
        <button onClick={() => onDuplicate(node.id)} title="Сделать копию шага"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors border border-neutral-200">
          <Copy className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(node.id)} title="Удалить шаг"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-neutral-200">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПАНЕЛЬ ДОБАВЛЕНИЯ ШАГА
// ═══════════════════════════════════════════════════════════════════════════════

function AddStepPanel({ edition, connectFrom, onAdd, onClose }: {
  edition: Edition; connectFrom?: string | null;
  onAdd: (t: StepType) => void; onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const term = q.trim().toLowerCase();
  const groups = stepCatalog()
    .map(g => ({
      ...g,
      steps: g.steps.filter(s => !term || s.label.toLowerCase().includes(term) || s.description.toLowerCase().includes(term)),
    }))
    .filter(g => g.steps.length > 0);

  return (
    <div className="w-[360px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-neutral-900">Добавить шаг</p>
          {connectFrom
            ? <p className="text-[11.5px] text-emerald-600 font-medium mt-0.5 truncate">Продолжит шаг «{connectFrom}»</p>
            : <p className="text-[11.5px] text-neutral-400 mt-0.5">Что должно произойти</p>}
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск шага…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {groups.map(g => (
          <div key={g.category} className="mb-3">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1.5">{g.category}</p>
            <div className="flex flex-col gap-1">
              {g.steps.map(s => {
                const locked = !stepAllowed(edition, s.type);
                const tone = STEP_TONE[s.tone];
                return (
                  <button key={s.type} onClick={() => !locked && onAdd(s.type)} disabled={locked}
                    title={locked ? `Доступно в ${EDITIONS.pro.title}` : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border border-transparent ${
                      locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 hover:border-neutral-200'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl ${tone.iconBg} flex items-center justify-center shrink-0`}>
                      <s.icon className={`w-[18px] h-[18px] ${tone.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800">{s.label}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{s.description}</p>
                    </div>
                    {locked
                      ? <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-bold shrink-0">
                          <Lock className="w-2.5 h-2.5" /> PRO
                        </span>
                      : <Plus className="w-4 h-4 text-neutral-300 shrink-0" />}
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

      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 shrink-0">
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Можно и проще: потяните линию от шага в пустое место — эта панель откроется сама.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПРОВЕРКА СЦЕНАРИЯ
// ═══════════════════════════════════════════════════════════════════════════════

const CHECK_ICON = {
  ok:    { Icon: CheckCircle2,  cls: 'text-emerald-500' },
  warn:  { Icon: AlertTriangle, cls: 'text-amber-500' },
  error: { Icon: AlertCircle,   cls: 'text-red-500' },
};

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

function CheckPanel({ report, active, onFocus, onClose }: {
  report: CheckReport; active: boolean;
  onFocus: (item: CheckItem) => void; onClose: () => void;
}) {
  const order: CheckItem['level'][] = ['error', 'warn', 'ok'];
  const sorted = order.flatMap(l => report.items.filter(i => i.level === l));

  const headline = report.errors > 0
    ? active
      ? `Сценарий работает, но в нём ${report.errors} ${plural(report.errors, 'ошибка', 'ошибки', 'ошибок')}`
      : `Нельзя включить: ${report.errors} ${plural(report.errors, 'ошибка', 'ошибки', 'ошибок')}`
    : report.warnings > 0
      ? `Можно включить, но есть ${report.warnings} ${plural(report.warnings, 'предупреждение', 'предупреждения', 'предупреждений')}`
      : 'Всё готово к включению';

  return (
    <div className="w-[400px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-neutral-900">Проверка сценария</p>
            <p className="text-[11.5px] text-neutral-400">Что произойдёт после включения</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`px-5 py-3.5 border-b shrink-0 ${
        report.errors > 0 ? 'bg-red-50 border-red-100'
          : report.warnings > 0 ? 'bg-amber-50 border-amber-100'
          : 'bg-emerald-50 border-emerald-100'
      }`}>
        <p className={`text-[13.5px] font-bold ${
          report.errors > 0 ? 'text-red-700' : report.warnings > 0 ? 'text-amber-800' : 'text-emerald-800'
        }`}>
          {headline}
        </p>
        {report.errors > 0 && active && (
          <p className="text-[11.5px] text-red-600 mt-1 leading-relaxed">
            Те, кто уже идёт по сценарию, продолжают по нему. Новые участники до сломанных шагов не дойдут.
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {sorted.map((item, i) => {
          const { Icon, cls } = CHECK_ICON[item.level];
          return (
            <button key={i} onClick={() => onFocus(item)} disabled={!item.nodeId}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                item.nodeId ? 'hover:bg-neutral-50 cursor-pointer' : 'cursor-default'
              }`}>
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cls}`} />
              <span className="text-[12.5px] text-neutral-700 leading-relaxed">{item.text}</span>
            </button>
          );
        })}
        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <Route className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-[13px] text-neutral-500">Добавьте шаги, чтобы увидеть разбор</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// УЧАСТНИКИ
// ═══════════════════════════════════════════════════════════════════════════════

const FORECAST_STEPS = [0, 3, 7, 14, 30];

function ParticipantsPanel({ flow, onClose }: { flow: FlowDoc; onClose: () => void }) {
  const [filter, setFilter] = useState<'all' | 'stuck'>('all');
  const [ahead, setAhead] = useState(0);

  const list = useMemo(
    () => participantsOf(flow, Date.now() + ahead * 864e5),
    [flow, ahead],
  );
  const stats = participantStats(list);
  const shown = filter === 'stuck' ? list.filter(p => p.state === 'stuck') : list;

  return (
    <div className="w-[400px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-neutral-900">Участники</p>
            <p className="text-[11.5px] text-neutral-400">Кто сейчас в сценарии</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Перемотка времени существует только чтобы показать экран в работе:
          в продукте участники приходят из таблицы состояний, а не вычисляются. */}
      <div className="px-4 py-3 border-b border-neutral-100 shrink-0">
        <PrototypeOnly note="Перемотка вперёд нужна, чтобы этот экран было на чём показать: сразу после включения участников ещё нет. В продукте состояние участников приходит из данных, и переключателя времени быть не должно.">
          <div className="flex flex-wrap gap-1.5">
            {FORECAST_STEPS.map(d => (
              <button key={d} onClick={() => setAhead(d)}
                className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all ${
                  ahead === d ? 'bg-neutral-900 text-white' : 'bg-white border border-fuchsia-200 text-neutral-600 hover:bg-fuchsia-50'
                }`}>
                {d === 0 ? 'Сегодня' : `+${d} дн.`}
              </button>
            ))}
          </div>
        </PrototypeOnly>
      </div>

      <div className="grid grid-cols-4 border-b border-neutral-100 shrink-0">
        {[
          { label: 'Зашли',      value: stats.entered, cls: 'text-neutral-900' },
          { label: 'Идут',       value: stats.running, cls: 'text-blue-600' },
          { label: 'Завершили',  value: stats.done,    cls: 'text-emerald-600' },
          { label: 'Застряли',   value: stats.stuck,   cls: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="px-2 py-3 text-center border-r border-neutral-100 last:border-r-0">
            <p className={`text-[18px] font-bold tabular-nums ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {stats.stuck > 0 && (
        <div className="px-4 py-2.5 border-b border-neutral-100 shrink-0">
          <div className="flex gap-1.5">
            {([['all', 'Все'], ['stuck', `Требуют внимания · ${stats.stuck}`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all ${
                  filter === k ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
        {shown.map(p => (
          <div key={p.employee.id} className="px-4 py-3 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-[10.5px] font-bold flex items-center justify-center shrink-0">
              {p.employee.initials}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-neutral-800 truncate">{p.employee.name}</p>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{p.where}</p>
              <p className="text-[10.5px] text-neutral-400 mt-1 tabular-nums">{p.daysIn} дн. в сценарии</p>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${STATE_STYLE[p.state]}`}>
              {STATE_LABEL[p.state]}
            </span>
          </div>
        ))}
        {shown.length === 0 && (
          <div className="py-16 text-center px-6">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-neutral-600">Пока никого нет</p>
            <p className="text-[11.5px] text-neutral-400 mt-1 leading-relaxed">
              Участники появятся, когда сотрудники начнут попадать под условия отбора.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ВКЛЮЧЕНИЕ СЦЕНАРИЯ
// ═══════════════════════════════════════════════════════════════════════════════

function ActivateDialog({ name, settings, warnings, onConfirm, onCancel }: {
  name: string; settings: FlowSettings; warnings: CheckItem[];
  onConfirm: (applyTo: 'new' | 'all') => void; onCancel: () => void;
}) {
  const [applyTo, setApplyTo] = useState<'new' | 'all'>(settings.applyTo || 'new');
  const [listOpen, setListOpen] = useState(false);
  const audience = audienceOf(settings.audience);

  return (
    <>
      <div className="fixed inset-0 z-[340] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-[18px] font-bold text-neutral-900">Включить «{name}»?</h2>
            <p className="text-[13px] text-neutral-500 mt-1">{describeAudience(settings.audience)}</p>
          </div>

          <div className="px-6 py-5 flex flex-col gap-3">
            <button onClick={() => setApplyTo('new')}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                applyTo === 'new' ? 'border-neutral-900 ring-1 ring-neutral-900 bg-neutral-900/[0.03]' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${applyTo === 'new' ? 'border-neutral-900' : 'border-neutral-300'}`}>
                  {applyTo === 'new' && <span className="w-2 h-2 rounded-full bg-neutral-900" />}
                </span>
                <p className="text-[14px] font-semibold text-neutral-900">Только для новых</p>
              </div>
              <p className="text-[12px] text-neutral-500 mt-1 ml-6 leading-relaxed">
                Сценарий получат те, кто попадёт под условия после включения. Никто из существующих
                сотрудников назначений не получит.
              </p>
            </button>

            <button onClick={() => setApplyTo('all')}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                applyTo === 'all' ? 'border-neutral-900 ring-1 ring-neutral-900 bg-neutral-900/[0.03]' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${applyTo === 'all' ? 'border-neutral-900' : 'border-neutral-300'}`}>
                  {applyTo === 'all' && <span className="w-2 h-2 rounded-full bg-neutral-900" />}
                </span>
                <p className="text-[14px] font-semibold text-neutral-900">Для новых и для всех, кто подходит сейчас</p>
              </div>
              <p className="text-[12px] text-neutral-500 mt-1 ml-6 leading-relaxed">
                Сценарий запустится сразу для всех подходящих сотрудников.
              </p>
              {applyTo === 'all' && audience.length > 0 && (
                <div className="ml-6 mt-2.5 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-amber-800 leading-relaxed">
                    {audience.length} {audience.length === 1 ? 'сотрудник получит' : 'сотрудников получат'} назначения
                    и уведомления немедленно.{' '}
                    <span onClick={e => { e.stopPropagation(); setListOpen(true); }}
                      className="underline underline-offset-2 font-semibold cursor-pointer">
                      Посмотреть список
                    </span>
                  </p>
                </div>
              )}
            </button>
          </div>

          {warnings.length > 0 && (
            <div className="px-6 pb-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-[12px] font-bold text-amber-800">
                    Включить можно, но обратите внимание
                  </p>
                </div>
                <ul className="px-4 py-2.5 flex flex-col gap-1.5">
                  {warnings.slice(0, 4).map((w, i) => (
                    <li key={i} className="text-[11.5px] text-amber-900 leading-relaxed flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>{w.text}
                    </li>
                  ))}
                  {warnings.length > 4 && (
                    <li className="text-[11.5px] text-amber-700">…и ещё {warnings.length - 4}. Полный список — в «Проверке сценария».</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-2 bg-neutral-50">
            <button onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-neutral-600 hover:bg-neutral-200 bg-white border border-neutral-200 transition-colors">
              Отмена
            </button>
            <button onClick={() => onConfirm(applyTo)}
              className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors">
              Включить сценарий
            </button>
          </div>
        </div>
      </div>

      <AudienceModal open={listOpen} onClose={() => setListOpen(false)} employees={audience} rules={settings.audience} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// РЕДАКТОР
// ═══════════════════════════════════════════════════════════════════════════════

type SidePanel = 'none' | 'settings' | 'step' | 'add' | 'check' | 'participants';

function BuilderInner({ edition, flowId }: { edition: Edition; flowId: string }) {
  const cfg = EDITIONS[edition];
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [settings, setSettings] = useState<FlowSettings>(DEFAULT_SETTINGS);
  const [name, setName] = useState('Новый сценарий');
  const [active, setActive] = useState(false);
  const [activatedAt, setActivatedAt] = useState<number | undefined>();
  const [panel, setPanel] = useState<SidePanel>('none');
  const [selected, setSelected] = useState<FlowNode | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [pending, setPending] = useState<{ source: string; handle?: string | null; x: number; y: number } | null>(null);
  const [hint, setHint] = useState<{ text: string; at: number } | null>(null);
  const flash = useCallback((text: string) => setHint({ text, at: Date.now() }), []);

  const rf = useReactFlow();
  const storeApi = useStoreApi();
  const idCounter = useRef(1);

  // ── Переизмерение узлов после программной загрузки ──
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

  // ── Загрузка ──
  const handleInit = useCallback(() => {
    const rec = getFlow(edition, flowId);
    if (!rec) { setNotFound(true); setLoaded(true); return; }

    const loadedNodes = (rec.nodes as FlowNode[]).map(n => ({
      id: n.id, type: 'step', position: n.position, data: n.data,
    }));
    // Шаг «Запуск» есть всегда: он не удаляется и добавляется при переносе схемы.
    // Страховка на случай повреждённого файла — холст не должен остаться пустым.
    if (!loadedNodes.some(n => n.data?.step === 'start')) {
      loadedNodes.unshift({ id: 'start', type: 'step', position: { x: 400, y: -200 }, data: { step: 'start' } });
    }
    setNodes(loadedNodes);
    setEdges(rec.edges as Edge[]);
    setSettings({ ...DEFAULT_SETTINGS, ...rec.settings });
    setName(rec.name);
    setActive(rec.active);
    setActivatedAt(rec.activatedAt);

    idCounter.current = loadedNodes.reduce((m, n) => {
      const match = /^s-(\d+)$/.exec(n.id);
      return match ? Math.max(m, Number(match[1])) : m;
    }, 0) + 1;

    setLoaded(true);
    forceMeasure(loadedNodes.map(n => n.id));
    if (loadedNodes.length) setTimeout(() => rf.fitView({ padding: 0.25, duration: 400 }), 350);
  }, [edition, flowId, setNodes, setEdges, forceMeasure, rf]);

  // ── Автосохранение ──
  useEffect(() => {
    if (!loaded || notFound) return;
    setSaveState('saving');
    const t = setTimeout(() => {
      const clean = nodes.map(n => ({ ...n, data: { ...n.data, runState: undefined } }));
      upsertFlow(edition, {
        id: flowId, name, active, activatedAt,
        schemaVersion: SCHEMA_VERSION, updatedAt: Date.now(),
        settings, nodes: clean, edges,
      });
      setSaveState('saved');
    }, 400);
    return () => clearTimeout(t);
  }, [nodes, edges, settings, name, active, activatedAt, loaded, notFound, edition, flowId]);

  // ── История: отмена и возврат ──
  // Снимок берём только со структуры (без выделения и перетаскивания), иначе
  // в историю попадает каждый клик по шагу.
  type Snapshot = { nodes: FlowNode[]; edges: Edge[]; settings: FlowSettings };
  const history = useRef<Snapshot[]>([]);
  const histIdx = useRef(-1);
  const applying = useRef(false);
  const [histState, setHistState] = useState({ canUndo: false, canRedo: false });

  const syncHistState = () => setHistState({
    canUndo: histIdx.current > 0,
    canRedo: histIdx.current < history.current.length - 1,
  });

  useEffect(() => {
    if (!loaded || notFound) return;
    if (applying.current) { applying.current = false; syncHistState(); return; }
    const t = setTimeout(() => {
      const clean = nodes.map(n => ({ ...n, selected: false, dragging: false }));
      const snap: Snapshot = { nodes: clean, edges, settings };
      const prev = history.current[histIdx.current];
      if (prev && JSON.stringify(prev) === JSON.stringify(snap)) return;
      history.current = history.current.slice(0, histIdx.current + 1);
      history.current.push(snap);
      if (history.current.length > 60) history.current.shift();
      histIdx.current = history.current.length - 1;
      syncHistState();
    }, 350);
    return () => clearTimeout(t);
  }, [nodes, edges, settings, loaded, notFound]);

  const applySnapshot = useCallback((snap: Snapshot) => {
    applying.current = true;
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setSettings(snap.settings);
    setSelected(null);
    forceMeasure(snap.nodes.map(n => n.id));
  }, [setNodes, setEdges, forceMeasure]);

  const undo = useCallback(() => {
    if (histIdx.current <= 0) return;
    histIdx.current -= 1;
    applySnapshot(history.current[histIdx.current]);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    if (histIdx.current >= history.current.length - 1) return;
    histIdx.current += 1;
    applySnapshot(history.current[histIdx.current]);
  }, [applySnapshot]);

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(null), 2200);
    return () => clearTimeout(t);
  }, [hint]);

  const tidyUp = useCallback(() => {
    setNodes(nds => autoLayout(nds, edges));
    setTimeout(() => rf.fitView({ padding: 0.25, duration: 450 }), 60);
  }, [setNodes, edges, rf]);


  // ── Правка шага ──
  const updateStep = useCallback((id: string, patch: Partial<StepData>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelected(prev => prev && prev.id === id ? { ...prev, data: { ...prev.data, ...patch } } : prev);

    // Набор выходов мог измениться — убираем переходы из исчезнувших.
    // Это отдельные редкие клики, поэтому читать nodes из замыкания безопасно.
    const outputsChanged = patch.branchValues !== undefined || patch.branchField !== undefined
      || patch.branchElse !== undefined || patch.waitMode !== undefined;
    if (!outputsChanged) return;
    const current = nodes.find(n => n.id === id);
    if (!current) return;
    const nextData = { ...current.data, ...patch };
    const nextNodes = nodes.map(n => n.id === id ? { ...n, data: nextData } : n);
    setEdges(eds => restyleEdges(nextNodes, dropOrphanEdges(id, nextData, eds)));
  }, [nodes, setNodes, setEdges]);

  // ── Связи ──
  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target || c.source === c.target) return;
    const sourceNode = nodes.find(n => n.id === c.source);
    const handle = c.sourceHandle || 'out';

    // Из одного выхода ведёт ровно один путь: сценарий исполняется
    // последовательно, и «вилка» из одного выхода была бы молча проигнорирована.
    const occupied = edges.find(e => e.source === c.source && (e.sourceHandle || 'out') === handle);
    if (occupied && occupied.target !== c.target) {
      setEdges(eds => addEdge(
        buildEdge(c.source!, c.target!, c.sourceHandle, sourceNode?.data),
        eds.filter(e => e.id !== occupied.id),
      ));
      flash('У шага может быть только одно продолжение — прежняя связь заменена');
    } else {
      setEdges(eds => addEdge(buildEdge(c.source!, c.target!, c.sourceHandle, sourceNode?.data), eds));
    }

    // Шаги, которым нужен контент, подхватывают его с предыдущих шагов
    const target = nodes.find(n => n.id === c.target);
    if (!target) return;
    const d = target.data;
    const wants = (d.step === 'wait' && d.waitMode === 'completion' && !d.waitItem)
      || (d.step === 'check_result' && !(d.checkItems?.length));
    if (!wants) return;
    const up = collectUpstream([c.source], nodes, edges);
    if (!up.length) return;
    updateStep(target.id, d.step === 'wait'
      ? { waitItem: up[0], waitLimitDays: d.waitLimitDays ?? 7 }
      : { checkItems: [up[0]] });
  }, [nodes, edges, setEdges, updateStep, flash]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    if (state.isValid || !state.fromNode || state.fromHandle?.type !== 'source') return;
    const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
    const pos = rf.screenToFlowPosition({ x: clientX, y: clientY });
    setPending({ source: state.fromNode.id, handle: state.fromHandle?.id, x: pos.x, y: pos.y });
    setSelected(null);
    setPanel('add');
  }, [rf]);

  // ── Добавление шага ──
  const addStep = useCallback((type: StepType) => {
    const def = stepDef(type);
    const id = `s-${idCounter.current++}`;
    const position = pending
      ? { x: pending.x - 125, y: pending.y }
      : rf.screenToFlowPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 });

    const data = def.defaults();
    if (pending && (type === 'wait' || type === 'check_result')) {
      const up = collectUpstream([pending.source], nodes, edges);
      if (up.length) {
        if (type === 'wait') { data.waitMode = 'completion'; data.waitItem = up[0]; data.waitLimitDays = 7; }
        else data.checkItems = [up[0]];
      }
    }

    const node: FlowNode = { id, type: 'step', position, data };
    setNodes(nds => [...nds, node]);

    if (pending) {
      const src = nodes.find(n => n.id === pending.source);
      const handle = pending.handle || 'out';
      // Если из этого выхода уже что-то шло — новый шаг ВСТАВЛЯЕТСЯ в середину,
      // а не создаёт вторую ветку: именно этого ждут от кнопки «+».
      const existing = edges.find(e => e.source === pending.source && (e.sourceHandle || 'out') === handle);
      const firstOut = stepOutputs(data)[0]?.id;

      setEdges(eds => {
        const rest = existing ? eds.filter(e => e.id !== existing.id) : eds;
        const added = [buildEdge(pending.source, id, pending.handle, src?.data)];
        // Продолжаем цепочку только если у нового шага есть выход.
        // У «Финиша» выходов нет: вставка в середину означает, что здесь всё кончается.
        if (existing && firstOut && existing.target !== id) {
          added.push(buildEdge(id, existing.target, firstOut, data));
        }
        return [...rest, ...added];
      });
    }

    setPending(null);
    // Новый узел ещё не измерен — без этого связь к нему не рисуется
    forceMeasure([id, ...(pending ? [pending.source] : [])]);
    setTimeout(() => { setSelected(node); setPanel('step'); }, 40);
  }, [pending, rf, nodes, edges, setNodes, setEdges, forceMeasure]);

  /** Кнопка «+» под выходом шага: тот же путь, что и перетаскивание связи. */
  const addAfter = useCallback((nodeId: string, handleId: string) => {
    const src = nodes.find(n => n.id === nodeId);
    if (!src) return;
    const outs = stepOutputs(src.data);
    const idx = Math.max(0, outs.findIndex(o => o.id === handleId));
    const spread = outs.length > 1 ? (idx - (outs.length - 1) / 2) * 300 : 0;
    setPending({ source: nodeId, handle: handleId, x: src.position.x + 125 + spread, y: src.position.y + 220 });
    setSelected(null);
    setPanel('add');
  }, [nodes]);

  const canvasActions = useMemo<CanvasActions>(() => ({ addAfter }), [addAfter]);

  /**
   * Удаление шага из середины не должно рвать сценарий: если у шага ровно один
   * выход, предшественники переподключаются к его продолжению.
   */
  /**
   * Удаление шагов. «Запуск» удалить нельзя — без него сценарий не имеет начала.
   * Если у удаляемого шага ровно один выход, предшественники переподключаются
   * к его продолжению, чтобы сценарий не разорвался.
   */
  const deleteSteps = useCallback((ids: string[]) => {
    const removable = ids.filter(id => nodes.find(n => n.id === id)?.data.step !== 'start');
    if (removable.length === 0) return;
    const gone = new Set(removable);

    let next = edges;
    removable.forEach(id => {
      const incoming = next.filter(e => e.target === id);
      const outgoing = next.filter(e => e.source === id);
      next = next.filter(e => e.source !== id && e.target !== id);
      if (outgoing.length !== 1) return;
      const target = outgoing[0].target;
      if (gone.has(target)) return;
      incoming.forEach(inc => {
        if (gone.has(inc.source) || inc.source === target) return;
        const dup = next.some(e => e.source === inc.source && e.target === target
          && (e.sourceHandle || '') === (inc.sourceHandle || ''));
        if (dup) return;
        const src = nodes.find(n => n.id === inc.source);
        next = [...next, buildEdge(inc.source, target, inc.sourceHandle, src?.data)];
      });
    });

    setNodes(nds => nds.filter(n => !gone.has(n.id)));
    setEdges(next.filter(e => !gone.has(e.source) && !gone.has(e.target)));
    setSelected(prev => (prev && gone.has(prev.id) ? null : prev));
    setPanel(cur => (cur === 'step' ? 'none' : cur));
  }, [nodes, edges, setNodes, setEdges]);

  const deleteStep = useCallback((id: string) => deleteSteps([id]), [deleteSteps]);

  /** Delete на холсте: своим путём, чтобы работало независимо от фокуса. */
  const deleteSelected = useCallback(() => {
    const ids = nodes.filter(n => n.selected && n.data.step !== 'start').map(n => n.id);
    const edgeIds = edges.filter(e => e.selected).map(e => e.id);

    if (ids.length === 0 && edgeIds.length === 0) return;

    // Удаление только связей: шаги остаются, обрывается переход между ними
    if (ids.length === 0) {
      setEdges(eds => eds.filter(e => !edgeIds.includes(e.id)));
      flash(`Удалено ${edgeIds.length} ${plural(edgeIds.length, 'связь', 'связи', 'связей')}`);
      return;
    }

    deleteSteps(ids);
    if (edgeIds.length) setEdges(eds => eds.filter(e => !edgeIds.includes(e.id)));
    flash(`Удалено ${ids.length} ${plural(ids.length, 'шаг', 'шага', 'шагов')}`);
  }, [nodes, edges, deleteSteps, setEdges, flash]);

  /** Удаление с холста (клавиша Delete) идёт тем же путём, что и кнопка в панели. */
  const handleNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    const removed = changes.filter(c => c.type === 'remove').map(c => c.id);
    const rest = changes.filter(c => c.type !== 'remove');
    if (rest.length) onNodesChange(rest);
    if (removed.length) deleteSteps(removed);
  }, [onNodesChange, deleteSteps]);

  const duplicateStep = useCallback((id: string) => {
    const src = nodes.find(n => n.id === id);
    if (!src || src.data.step === 'start') return;
    const copy: FlowNode = {
      ...src,
      id: `s-${idCounter.current++}`,
      position: { x: src.position.x + 70, y: src.position.y + 70 },
      selected: false,
      data: { ...src.data, runState: undefined },
    };
    setNodes(nds => [...nds, copy]);
    forceMeasure([copy.id]);
    setTimeout(() => { setSelected(copy); setPanel('step'); }, 40);
  }, [nodes, setNodes, forceMeasure]);

  // ── Буфер обмена ──

  /** Что копируем: выделенное на холсте, иначе открытый в панели шаг. */
  const copyTargets = useCallback((): FlowNode[] => {
    const picked = nodes.filter(n => n.selected && n.data.step !== 'start');
    if (picked.length) return picked;
    const open = selected && selected.data.step !== 'start' ? nodes.find(n => n.id === selected.id) : undefined;
    return open ? [open] : [];
  }, [nodes, selected]);

  const copySelection = useCallback(() => {
    const list = copyTargets();
    if (!list.length) { flash('Сначала выберите шаг на холсте'); return; }
    const ids = new Set(list.map(n => n.id));
    stepClipboard = {
      nodes: list.map(n => ({ ...n, selected: false, data: { ...n.data, runState: undefined } })),
      edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)),
    };
    flash(`Скопировано ${list.length} ${plural(list.length, 'шаг', 'шага', 'шагов')}`);
  }, [copyTargets, edges]);

  const pasteClipboard = useCallback(() => {
    if (!stepClipboard || stepClipboard.nodes.length === 0) { flash('Буфер пуст — сначала скопируйте шаг'); return; }
    // Буфер общий для обеих версий: шаг из Pro не должен попасть в MVP-сценарий
    const allowed = stepClipboard.nodes.filter(n => stepAllowed(edition, n.data.step));
    const blocked = stepClipboard.nodes.length - allowed.length;
    if (allowed.length === 0) {
      flash(`В буфере только шаги из ${EDITIONS.pro.title} — сюда их вставить нельзя`);
      return;
    }
    const allowedIds = new Set(allowed.map(n => n.id));
    const buf = {
      nodes: allowed,
      edges: stepClipboard.edges.filter(e => allowedIds.has(e.source) && allowedIds.has(e.target)),
    };
    const remap = new Map<string, string>();

    // Кладём группу под все существующие шаги, сохраняя её внутреннюю раскладку,
    // иначе вставленное ложится поверх соседей и его не видно.
    const bottom = nodes.length ? Math.max(...nodes.map(n => n.position.y)) : 0;
    const clipTop = Math.min(...buf.nodes.map(n => n.position.y));
    const shiftY = bottom + 220 - clipTop;

    const fresh = buf.nodes.map(n => {
      const id = `s-${idCounter.current++}`;
      remap.set(n.id, id);
      return { ...n, id, position: { x: n.position.x, y: n.position.y + shiftY }, selected: true };
    });

    const freshEdges = buf.edges
      .filter(e => remap.has(e.source) && remap.has(e.target))
      .map(e => buildEdge(
        remap.get(e.source)!, remap.get(e.target)!, e.sourceHandle,
        buf.nodes.find(n => n.id === e.source)?.data,
      ));

    setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...fresh]);
    setEdges(eds => [...eds, ...freshEdges]);
    forceMeasure(fresh.map(n => n.id));
    if (fresh.length === 1) setTimeout(() => { setSelected(fresh[0]); setPanel('step'); }, 40);
    setTimeout(() => rf.fitView({ padding: 0.25, duration: 400 }), 120);
    flash(blocked > 0
      ? `Вставлено ${fresh.length} · пропущено ${blocked} из ${EDITIONS.pro.title}`
      : `Вставлено ${fresh.length} ${plural(fresh.length, 'шаг', 'шага', 'шагов')}`);
  }, [nodes, setNodes, setEdges, forceMeasure, rf, edition, flash]);

  // ── Горячие клавиши ──
  // Сравниваем по e.code (физическая клавиша), а НЕ по e.key: при русской
  // раскладке e.key возвращает «ф», «с», «м», «я», сочетания не срабатывают,
  // и браузер делает своё «выделить всё» по странице.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName || '') || !!el?.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;

      // e.code — основной путь; e.key оставлен для клавиатур, которые code не сообщают
      const key = (letter: string) =>
        e.code === `Key${letter.toUpperCase()}` || e.key.toLowerCase() === letter;

      if (e.key === 'Escape') {
        setPanel('none'); setPending(null); setSelected(null); setShortcutsOpen(false);
        return;
      }

      if (!mod) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) {
          e.preventDefault();
          deleteSelected();
        }
        return;
      }

      if (key('k')) {
        e.preventDefault();
        setSelected(null); setPanel('add');
        return;
      }

      if (typing) return;   // в полях ввода отдаём сочетания браузеру

      if (key('a')) {
        e.preventDefault();
        // Сбрасываем выделение текста: иначе следующий Ctrl+C скопирует текст страницы
        window.getSelection()?.removeAllRanges();
        setNodes(nds => nds.map(n => ({ ...n, selected: n.data.step !== 'start' })));
        setSelected(null);
        setPanel('none');
        return;
      }

      if (key('z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }

      if (key('y')) {           // привычная альтернатива для «вернуть»
        e.preventDefault();
        redo();
        return;
      }

      // Если пользователь выделил текст — Ctrl+C копирует текст, не шаги
      if (key('c') && !window.getSelection()?.toString()) {
        e.preventDefault();
        copySelection();
        return;
      }

      if (key('v')) {
        e.preventDefault();
        pasteClipboard();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, copySelection, pasteClipboard, deleteSelected, setNodes]);

  // ── Клик по шагу ──
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const n = node as FlowNode;
    setPending(null);
    // Shift — это выбор нескольких шагов, панель настройки тут только мешает
    if (event.shiftKey) { setSelected(null); setPanel('none'); return; }
    if (n.data.step === 'start') { setSelected(null); setPanel('settings'); return; }
    setSelected(n);
    setPanel('step');
  }, []);

  // Текущее состояние сценария — мониторинг смотрит на него, а не на
  // сохранённую копию: иначе после включения панель показывает вчерашний день.
  const liveDoc: FlowDoc = useMemo(() => ({
    id: flowId, name, active, activatedAt,
    schemaVersion: SCHEMA_VERSION, updatedAt: Date.now(),
    settings, nodes, edges,
  }), [flowId, name, active, activatedAt, settings, nodes, edges]);

  // ── Проверка ──
  const report = useMemo(() => checkFlow(nodes, edges, settings, edition), [nodes, edges, settings, edition]);
  const audience = useMemo(() => audienceOf(settings.audience), [settings.audience]);

  const upstream = useMemo(() => {
    if (!selected) return [];
    const sources = edges.filter(e => e.target === selected.id).map(e => e.source);
    return collectUpstream(sources, nodes, edges);
  }, [selected, nodes, edges]);

  const focusIssue = useCallback((item: CheckItem) => {
    if (!item.nodeId) return;
    const n = nodes.find(x => x.id === item.nodeId);
    if (!n) return;
    rf.setCenter(n.position.x + 130, n.position.y + 70, { zoom: 1, duration: 450 });
    if (n.data.step === 'start') { setPanel('settings'); return; }
    setSelected(n);
    setPanel('step');
  }, [nodes, rf]);

  // ── Включение / выключение ──
  const toggleActive = () => {
    if (active) { setActive(false); setActivatedAt(undefined); return; }
    if (!report.canActivate) { setPanel('check'); return; }
    setActivateOpen(true);
  };

  const confirmActivate = (applyTo: 'new' | 'all') => {
    setSettings(s => ({ ...s, applyTo }));
    setActive(true);
    setActivatedAt(Date.now());
    setActivateOpen(false);
    setPanel('participants');
  };

  const status = report.errors > 0
    ? { cls: 'bg-red-50 text-red-600 border-red-200', Icon: AlertCircle, text: `${report.errors} ${plural(report.errors, 'ошибка', 'ошибки', 'ошибок')}` }
    : report.warnings > 0
      ? { cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle, text: `${report.warnings} ${plural(report.warnings, 'предупреждение', 'предупреждения', 'предупреждений')}` }
      : { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2, text: 'Готов к включению' };

  return (
    <SettingsContext.Provider value={settings}>
     <EditionContext.Provider value={edition}>
     <ActionsContext.Provider value={canvasActions}>
      <div className="flex h-full w-full">
        <div className="flex-1 relative min-w-0">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onConnectEnd={onConnectEnd} onInit={handleInit}
            onNodeClick={onNodeClick} onPaneClick={() => { setPanel('none'); setSelected(null); setShortcutsOpen(false); }}
            nodeTypes={nodeTypes}
            fitView fitViewOptions={{ padding: 0.3 }} className="bg-[#FAFAFA]"
            snapToGrid snapGrid={[20, 20]} deleteKeyCode={null}
            multiSelectionKeyCode="Shift" minZoom={0.15} maxZoom={2}>

            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E5E5" />
            <MiniMap pannable zoomable maskColor="rgba(0,0,0,0.06)"
              nodeColor={(n: Node) => ({
                start: '#10b981', action: '#3b82f6', notify: '#6366f1',
                wait: '#f59e0b', branch: '#8b5cf6', end: '#f43f5e', pro: '#0ea5e9',
              }[stepDef((n.data as StepData).step).tone] || '#3b82f6')}
              className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm" />
            <Controls showInteractive={false} className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm" />

            {/* ── Шапка слева ── */}
            <Panel position="top-left">
              <div className="flex items-start gap-3 mt-3 ml-3">
                <Link href={cfg.basePath}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="flex flex-col gap-2">
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {editingName ? (
                        <input autoFocus value={name} onChange={e => setName(e.target.value)}
                          onBlur={() => { if (!name.trim()) setName('Новый сценарий'); setEditingName(false); }}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          className="text-[15px] font-bold text-neutral-900 bg-neutral-50 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 w-[220px]" />
                      ) : (
                        <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 group" title="Переименовать">
                          <p className="text-[15px] font-bold text-neutral-900">{name}</p>
                          <Edit3 className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                        </button>
                      )}
                      {cfg.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-600">
                          {cfg.badge}
                        </span>
                      )}
                    </div>

                    {/* Кому и когда — всегда на виду */}
                    <button onClick={() => { setSelected(null); setPanel('settings'); }}
                      className="flex items-center gap-2 mt-1.5 group text-left">
                      <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-[11.5px] text-neutral-500 group-hover:text-neutral-800 transition-colors">
                        {describeAudience(settings.audience)}
                        <span className="text-neutral-300"> · </span>
                        <span className={report.reach === 0 ? 'text-red-500 font-semibold' : 'font-semibold text-neutral-700'}>
                          {report.reach} из {totalReachable()}
                        </span>
                      </span>
                      <ChevronDown className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                    </button>

                    {saveState !== 'idle' && (
                      <p className="text-[10.5px] text-neutral-400 mt-1 flex items-center gap-1">
                        {saveState === 'saving'
                          ? <><span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse" /> Сохраняем…</>
                          : <><Check className="w-3 h-3 text-emerald-500" /> Сохранено</>}
                      </p>
                    )}
                  </div>

                  {nodes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelected(null); setPanel('check'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11.5px] font-semibold shadow-sm transition-colors ${status.cls}`}>
                        <status.Icon className="w-3.5 h-3.5" /> {status.text}
                      </button>

                      {active && (
                        <button onClick={() => { setSelected(null); setPanel('participants'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-[11.5px] font-semibold shadow-sm hover:bg-blue-100 transition-colors">
                          <Users className="w-3.5 h-3.5" /> Участники
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* ── Действия справа ── */}
            <Panel position="top-right">
              <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-neutral-200 px-2 py-1.5 mt-3 mr-3">
                <button onClick={() => { setSelected(null); setPending(null); setPanel('add'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[12px] font-semibold hover:bg-neutral-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Добавить шаг
                </button>

                <button onClick={toggleActive}
                  title={active ? 'Остановить сценарий' : report.canActivate ? 'Включить сценарий' : 'Сначала исправьте ошибки'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : report.canActivate
                        ? 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}>
                  {active ? <><Pause className="w-3.5 h-3.5" /> Работает</> : <><Play className="w-3.5 h-3.5" /> Включить</>}
                </button>

                <div className="w-px h-6 bg-neutral-200" />
                <button onClick={undo} disabled={!histState.canUndo} title="Отменить (Ctrl+Z)"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={redo} disabled={!histState.canRedo} title="Вернуть (Ctrl+Shift+Z)"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                  <Redo2 className="w-4 h-4" />
                </button>
                <button onClick={tidyUp} title="Выровнять шаги"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => rf.fitView({ padding: 0.3, duration: 400 })} title="Вписать в экран"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button onClick={() => setShortcutsOpen(o => !o)} title="Горячие клавиши"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      shortcutsOpen ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
                    }`}>
                    <Keyboard className="w-4 h-4" />
                  </button>
                  {shortcutsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[260px] bg-white rounded-xl shadow-xl border border-neutral-200 p-3 z-50">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Горячие клавиши</p>
                      <div className="flex flex-col gap-1.5">
                        {[
                          ['Ctrl + K', 'Добавить шаг'],
                          ['Ctrl + A', 'Выбрать все шаги'],
                          ['Ctrl + C', 'Скопировать выбранные шаги'],
                          ['Ctrl + V', 'Вставить скопированное'],
                          ['Ctrl + Z', 'Отменить'],
                          ['Ctrl + Shift + Z', 'Вернуть'],
                          ['Delete', 'Удалить выбранные шаги'],
                          ['Shift + клик', 'Выбрать несколько'],
                          ['Esc', 'Закрыть панель'],
                        ].map(([k, d]) => (
                          <div key={k} className="flex items-center justify-between gap-3">
                            <span className="text-[11.5px] text-neutral-600">{d}</span>
                            <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono text-neutral-600 shrink-0 whitespace-nowrap">{k}</kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* ── Короткое сообщение о действии ── */}
          {hint && (
            <Panel position="bottom-center">
              <div key={hint.at}
                className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl shadow-lg text-[12.5px] font-medium">
                <ClipboardCopy className="w-3.5 h-3.5 shrink-0" />
                {hint.text}
              </div>
            </Panel>
          )}

          {/* ── Сценарий не найден ── */}
            {notFound && (
              <Panel position="top-center">
                <div className="mt-[25vh] text-center bg-white rounded-2xl shadow-lg border border-neutral-200 px-10 py-8">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-[16px] font-bold text-neutral-700 mb-1">Сценарий не найден</p>
                  <p className="text-[13px] text-neutral-400 mb-4">Возможно, он был удалён</p>
                  <Link href={cfg.basePath}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> К списку сценариев
                  </Link>
                </div>
              </Panel>
            )}

          </ReactFlow>
        </div>

        {/* ── Боковые панели ── */}
        {panel === 'settings' && (
          <FlowSettingsPanel settings={settings} edition={edition}
            onChange={setSettings} onClose={() => setPanel('none')} />
        )}
        {panel === 'step' && selected && (
          <StepInspector node={selected} upstream={upstream} audience={audience} pro={edition === 'pro'}
            onUpdate={updateStep} onDelete={deleteStep} onDuplicate={duplicateStep}
            onClose={() => { setPanel('none'); setSelected(null); }} />
        )}
        {panel === 'add' && (
          <AddStepPanel edition={edition} onAdd={addStep}
            connectFrom={pending ? stepDef(nodes.find(n => n.id === pending.source)?.data.step || 'content').label : null}
            onClose={() => { setPanel('none'); setPending(null); }} />
        )}
        {panel === 'check' && (
          <CheckPanel report={report} active={active} onFocus={focusIssue} onClose={() => setPanel('none')} />
        )}
        {panel === 'participants' && (
          <ParticipantsPanel flow={liveDoc} onClose={() => setPanel('none')} />
        )}

        {activateOpen && (
          <ActivateDialog name={name} settings={settings}
            warnings={report.items.filter(i => i.level === 'warn')}
            onConfirm={confirmActivate} onCancel={() => setActivateOpen(false)} />
        )}
      </div>
     </ActionsContext.Provider>
     </EditionContext.Provider>
    </SettingsContext.Provider>
  );
}

export function UserFlowBuilder({ edition, flowId }: { edition: Edition; flowId: string }) {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ReactFlowProvider>
        <BuilderInner edition={edition} flowId={flowId} />
      </ReactFlowProvider>
    </div>
  );
}
