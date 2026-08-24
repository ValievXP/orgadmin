// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — ХРАНИЛИЩЕ
//
// Прототип держит сценарии в localStorage, но весь доступ идёт через этот модуль:
// чтобы перевести инструмент на API платформы, достаточно заменить тело функций.
//
// Формат версионирован. Сценарии, сохранённые старой версией инструмента,
// переносятся в новую схему при чтении — молча ломаться они не должны.
// ═══════════════════════════════════════════════════════════════════════════════

import { Edition, unsupportedSteps, startEventAllowed } from './editions';
import {
  FlowDoc, FlowSettings, DEFAULT_SETTINGS, SCHEMA_VERSION,
  StepData, StepType, AudienceRule, FlowNode,
} from './types';

const KEY = (edition: Edition) => `osnova-user-flow-${edition}`;
const LEGACY_SINGLE = 'osnova-onboarding-flow-v2';

export const newFlowId = () => `flow-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

// ── Перенос со старой схемы (v1: шаги-«ноды» с полем flowType) ────────────────

const STEP_BY_LEGACY_TYPE: Record<string, StepType> = {
  trigger: 'start',
  content: 'content',
  notify: 'notify',
  delay: 'wait',
  wait_event: 'wait',
  condition_employee: 'branch',
  switch: 'branch',
  condition_content: 'check_result',
  curator: 'curator',
  end: 'end',
};

interface LegacyNode { id: string; position: { x: number; y: number }; data: Record<string, unknown> }
interface LegacyEdge { id: string; source: string; target: string; sourceHandle?: string; [k: string]: unknown }

/** Перекладывает данные одного шага из старой схемы в новую. */
function migrateStep(d: Record<string, unknown>): StepData {
  const legacy = String(d.flowType || '');
  const step = STEP_BY_LEGACY_TYPE[legacy] || 'content';
  const out: StepData = { step };

  switch (legacy) {
    case 'content':
      out.item = d.selectedContent as StepData['item'];
      out.deadlineDays = d.deadlineDays as number;
      out.mandatory = !!d.mandatory;
      out.notifyOnAssign = !!d.notifyOnAssign;
      break;
    case 'notify':
      out.recipient = (d.notifyRecipient as string) || 'employee';
      out.channels = (d.notifyChannels as string[]) || ['push'];
      out.templateId = d.notifyTemplateId as string;
      out.textRu = (d.notifyTextRu as string) || '';
      out.textUz = (d.notifyTextUz as string) || '';
      break;
    case 'delay':
      out.waitMode = 'pause';
      out.pauseValue = (d.delayValue as number) ?? 1;
      // старая единица «сек» в новой схеме не поддерживается — округляем до минут
      out.pauseUnit = (d.delayUnit === 'sec' ? 'min' : (d.delayUnit as StepData['pauseUnit'])) || 'day';
      break;
    case 'wait_event':
      out.waitMode = 'completion';
      out.waitItem = d.waitItem as StepData['waitItem'];
      out.waitLimitDays = (d.waitTimeoutDays as number) ?? 7;
      break;
    case 'condition_employee':
      out.branchField = d.empField as string;
      // «= [значения]» превращается в ветки по этим значениям + «остальные»
      out.branchValues = (d.empValues as string[]) || [];
      out.branchElse = true;
      break;
    case 'switch':
      out.branchField = d.switchField as string;
      out.branchValues = (d.switchValues as string[]) || [];
      out.branchElse = true;
      break;
    case 'condition_content':
      out.checkItems = (d.conditionItems as StepData['checkItems']) || [];
      out.checkField = d.conditionField === 'test_score' ? 'score'
        : d.conditionField === 'course_progress' ? 'progress' : 'completed';
      out.checkOperator = (d.conditionOperator as string) || '=';
      out.checkValue = d.conditionValue as string;
      break;
    case 'curator':
      out.curatorMode = (d.curatorMode as 'auto' | 'specific') || 'auto';
      out.curatorId = d.curatorId as number;
      break;
    case 'end':
      out.endStatus = (d.endStatus as 'success' | 'aborted') || 'success';
      out.endNotifyHr = !!d.endNotifyHr;
      break;
  }
  return out;
}

/** Настройки сценария собираются из данных старого шага «Триггер». */
function migrateSettings(nodes: LegacyNode[]): FlowSettings {
  const trigger = nodes.find(n => n.data?.flowType === 'trigger');
  if (!trigger) return { ...DEFAULT_SETTINGS };
  const d = trigger.data;
  const aud = (d.audience as Record<string, string[]>) || {};
  const audience: AudienceRule[] = Object.entries(aud)
    .filter(([, v]) => Array.isArray(v) && v.length > 0)
    .map(([field, values], i) => ({ id: `r-mig-${i}`, field, op: 'is' as const, values }));

  return {
    ...DEFAULT_SETTINGS,
    startEvent: (d.triggerType as FlowSettings['startEvent']) || 'new_employee',
    scheduleFreq: d.scheduleFreq as FlowSettings['scheduleFreq'],
    scheduleDay: d.scheduleDay as string,
    scheduleMonthDay: d.scheduleMonthDay as number,
    scheduleTime: d.scheduleTime as string,
    audience,
  };
}

/** Переходы из старых выходов в новые. */
function migrateHandle(sourceLegacyType: string, handle?: string, values: string[] = []): string | undefined {
  if (!handle) return undefined;
  if (sourceLegacyType === 'condition_employee') {
    if (handle === 'true') return values.length ? `b-${values[0]}` : 'else';
    if (handle === 'false') return 'else';
  }
  if (sourceLegacyType === 'switch' && handle.startsWith('sw-')) return `b-${handle.slice(3)}`;
  if (sourceLegacyType === 'condition_content') {
    if (handle === 'true') return 'yes';
    if (handle === 'false') return 'no';
  }
  return handle;   // done / timeout / else / out — совпадают
}

function migrateFlow(raw: Record<string, unknown>): FlowDoc {
  if (Number(raw.schemaVersion) >= SCHEMA_VERSION) {
    const doc = raw as unknown as FlowDoc;
    return {
      ...doc,
      // В файле экспорта состояния включения нет — импортированный сценарий
      // всегда приходит черновиком, включать его нужно осознанно.
      active: !!doc.active,
      activatedAt: doc.active ? doc.activatedAt : undefined,
      settings: { ...DEFAULT_SETTINGS, ...doc.settings },
    };
  }

  const legacyNodes = (raw.nodes as LegacyNode[]) || [];
  const legacyEdges = (raw.edges as LegacyEdge[]) || [];
  const legacyTypeById = new Map(legacyNodes.map(n => [n.id, String(n.data?.flowType || '')]));
  const valuesById = new Map(legacyNodes.map(n => [
    n.id,
    (n.data?.empValues as string[]) || (n.data?.switchValues as string[]) || [],
  ]));

  const nodes = legacyNodes.map(n => ({
    id: n.id,
    type: 'step',
    position: n.position,
    data: migrateStep(n.data || {}),
  }));

  // В старой схеме триггер мог отсутствовать — новая требует шаг «Запуск»
  if (!nodes.some(n => n.data.step === 'start')) {
    nodes.unshift({ id: 'start', type: 'step', position: { x: 400, y: -180 }, data: { step: 'start' } });
  }

  const edges = legacyEdges.map(e => ({
    ...e,
    sourceHandle: migrateHandle(legacyTypeById.get(e.source) || '', e.sourceHandle, valuesById.get(e.source)),
  }));

  return {
    id: String(raw.id || newFlowId()),
    name: String(raw.name || 'Сценарий'),
    active: false,                       // после переноса схемы включаем осознанно
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Number(raw.updatedAt) || Date.now(),
    settings: migrateSettings(legacyNodes),
    nodes,
    edges,
  };
}

// ── Чтение и запись ───────────────────────────────────────────────────────────

/** Читает список и заодно сообщает, пришлось ли что-то переносить со старой схемы. */
function readWithFlag(edition: Edition): { flows: FlowDoc[]; migrated: boolean } {
  if (typeof window === 'undefined') return { flows: [], migrated: false };
  try {
    const raw = localStorage.getItem(KEY(edition));
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed?.flows)) return { flows: [], migrated: false };
    const migrated = parsed.flows.some(
      (f: Record<string, unknown>) => Number(f?.schemaVersion || 1) < SCHEMA_VERSION,
    );
    return { flows: parsed.flows.map(migrateFlow), migrated };
  } catch { return { flows: [], migrated: false }; }
}

const read = (edition: Edition): FlowDoc[] => readWithFlag(edition).flows;

function write(edition: Edition, flows: FlowDoc[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY(edition), JSON.stringify({ schemaVersion: SCHEMA_VERSION, flows }));
  } catch { /* переполнено — в прототипе игнорируем */ }
}

/** Единственный сценарий старого инструмента «Онбординг» переносится в Pro. */
function migrateLegacySingle() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LEGACY_SINGLE);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved?.nodes) && saved.nodes.length > 0) {
      const flows = read('pro');
      flows.unshift(migrateFlow({ ...saved, id: newFlowId(), name: 'Онбординг: перенесён из старой версии' }));
      write('pro', flows);
    }
    localStorage.removeItem(LEGACY_SINGLE);
  } catch { /* повреждено — отбрасываем */ }
}

export function loadFlows(edition: Edition): FlowDoc[] {
  migrateLegacySingle();
  const { flows, migrated } = readWithFlag(edition);
  // Перенос делаем один раз и сразу закрепляем в хранилище
  if (migrated) write(edition, flows);
  return flows.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const getFlow = (edition: Edition, id: string) =>
  loadFlows(edition).find(f => f.id === id);

export function upsertFlow(edition: Edition, flow: FlowDoc) {
  const flows = read(edition);
  const idx = flows.findIndex(f => f.id === flow.id);
  if (idx >= 0) flows[idx] = flow; else flows.push(flow);
  write(edition, flows);
}

export function deleteFlow(edition: Edition, id: string) {
  write(edition, read(edition).filter(f => f.id !== id));
}

export function duplicateFlow(edition: Edition, id: string): FlowDoc | undefined {
  const src = getFlow(edition, id);
  if (!src) return undefined;
  const copy: FlowDoc = {
    ...src,
    id: newFlowId(),
    name: `${src.name} (копия)`,
    active: false,
    activatedAt: undefined,
    updatedAt: Date.now(),
  };
  upsertFlow(edition, copy);
  return copy;
}

export function createFlow(edition: Edition, name: string, settings: FlowSettings, nodes: unknown[], edges: unknown[]): FlowDoc {
  const doc: FlowDoc = {
    id: newFlowId(),
    name,
    active: false,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now(),
    settings,
    nodes,
    edges,
  };
  upsertFlow(edition, doc);
  return doc;
}

// ── Обмен файлами ─────────────────────────────────────────────────────────────

export function exportFlow(flow: FlowDoc): string {
  return JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    name: flow.name,
    settings: flow.settings,
    nodes: flow.nodes,
    edges: flow.edges,
  }, null, 2);
}

export interface ImportResult {
  ok: true;
  flow: FlowDoc;
  /** Возможности из Pro, которых эта версия не исполнит */
  unsupported: string[];
}

export function importFlow(edition: Edition, json: string): ImportResult | { ok: false; error: string } {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Файл повреждён — это не JSON' };
  }
  if (!Array.isArray(parsed.nodes)) {
    return { ok: false, error: 'Не похоже на сценарий User Flow: в файле нет шагов' };
  }
  if (Number(parsed.schemaVersion || 1) > SCHEMA_VERSION) {
    return { ok: false, error: 'Файл сделан более новой версией инструмента — обновите платформу' };
  }
  const doc = migrateFlow({
    ...parsed,
    id: newFlowId(),
    name: typeof parsed.name === 'string' && parsed.name.trim() ? `${parsed.name} (импорт)` : 'Импортированный сценарий',
    updatedAt: Date.now(),
  });

  // Файл мог быть выгружен из Pro. Сценарий импортируем, но честно говорим,
  // что именно эта версия исполнить не сможет — включить его проверка не даст.
  const steps = (doc.nodes as FlowNode[]).map(n => n?.data?.step).filter(Boolean) as StepType[];
  const unsupported = unsupportedSteps(edition, steps).map(st => st as string);
  if (!startEventAllowed(edition, doc.settings.startEvent)) {
    unsupported.push(`событие запуска «${doc.settings.startEvent}»`);
  }

  upsertFlow(edition, doc);
  return { ok: true, flow: doc, unsupported };
}
