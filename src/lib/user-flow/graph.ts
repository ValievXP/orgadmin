// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — РАБОТА С СХЕМОЙ
// Построение связей, контекст предыдущих шагов, чистка «висячих» переходов.
// ═══════════════════════════════════════════════════════════════════════════════

import { Edge, MarkerType } from '@xyflow/react';
import { FlowNode, StepData, ContentRef, TONE_COLOR, StepOutput } from './types';
import { stepOutputs } from './registry';

let seq = 0;

/** Цвет и подпись перехода определяются выходом, из которого он выходит. */
export function outputOf(data: StepData | undefined, handle?: string | null): StepOutput | undefined {
  if (!data || !handle) return undefined;
  return stepOutputs(data).find(o => o.id === handle);
}

export function buildEdge(
  source: string,
  target: string,
  sourceHandle?: string | null,
  sourceData?: StepData,
): Edge {
  const out = outputOf(sourceData, sourceHandle);
  const tone = out?.tone ?? 'neutral';
  const color = TONE_COLOR[tone];
  const label = out?.label;

  return {
    id: `e-${Date.now()}-${seq++}`,
    source,
    target,
    sourceHandle: sourceHandle || undefined,
    type: 'smoothstep',
    style: { stroke: color, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
    ...(label ? {
      label: label.length > 22 ? `${label.slice(0, 21)}…` : label,
      labelStyle: { fontSize: 10, fontWeight: 700, fill: color },
      labelBgStyle: { fill: '#ffffff', stroke: '#E5E5E5' },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
    } : {}),
  };
}

/** Пересобрать вид перехода — например, после переименования ветки. */
export function restyleEdges(nodes: FlowNode[], edges: Edge[]): Edge[] {
  const byId = new Map(nodes.map(n => [n.id, n]));
  return edges.map(e => {
    const src = byId.get(e.source);
    const rebuilt = buildEdge(e.source, e.target, e.sourceHandle, src?.data);
    return { ...rebuilt, id: e.id };
  });
}

/**
 * Контент, назначенный выше по сценарию — идёт вверх по входящим связям.
 * Ближайшие шаги оказываются первыми: их и предлагаем в первую очередь.
 */
export function collectUpstream(startIds: string[], nodes: FlowNode[], edges: Edge[]): ContentRef[] {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const incoming = new Map<string, string[]>();
  edges.forEach(e => { const a = incoming.get(e.target) || []; a.push(e.source); incoming.set(e.target, a); });

  const seen = new Set<string>();
  const out: ContentRef[] = [];
  const ids = new Set<string>();
  let frontier = [...startIds];
  let depth = 0;

  while (frontier.length && depth < 40) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      const item = byId.get(id)?.data.item;
      if (item && !ids.has(item.id)) { out.push(item); ids.add(item.id); }
      next.push(...(incoming.get(id) || []));
    }
    frontier = next;
    depth++;
  }
  return out;
}

/**
 * Разложить шаги сверху вниз.
 *
 * Уровень шага — самый длинный путь до него от начала. Обратные связи (возврат
 * к предыдущему шагу — например, «напомнить и снова ждать») из расчёта
 * исключаются: иначе каждый проход по циклу опускал бы шаг всё ниже, и сценарий
 * растягивался бы на пустой холст.
 */
export function autoLayout(nodes: FlowNode[], edges: Edge[]): FlowNode[] {
  const start = nodes.find(n => n.data.step === 'start');
  if (!start) return nodes;

  const outgoing = new Map<string, Edge[]>();
  const incoming = new Map<string, string[]>();
  edges.forEach(e => {
    const a = outgoing.get(e.source) || []; a.push(e); outgoing.set(e.source, a);
    const b = incoming.get(e.target) || []; b.push(e.source); incoming.set(e.target, b);
  });

  // ── Поиск обратных связей: цель уже лежит в текущей ветке обхода ──
  const back = new Set<string>();
  const mark = new Map<string, 0 | 1 | 2>();
  const walk = (id: string) => {
    mark.set(id, 1);
    (outgoing.get(id) || []).forEach(e => {
      const st = mark.get(e.target) ?? 0;
      if (st === 1) back.add(e.id);
      else if (st === 0) walk(e.target);
    });
    mark.set(id, 2);
  };

  // Обход начинаем с запуска, затем с шагов, куда ничего не входит, затем с любых
  const roots = [
    start.id,
    ...nodes.filter(n => n.id !== start.id && (incoming.get(n.id) || []).length === 0).map(n => n.id),
    ...nodes.map(n => n.id),
  ];
  roots.forEach(id => { if ((mark.get(id) ?? 0) === 0) walk(id); });

  const forward = (id: string) => (outgoing.get(id) || []).filter(e => !back.has(e.id));

  // ── Уровни: самый длинный путь по прямым связям ──
  const level = new Map<string, number>();
  const relax = () => {
    for (let pass = 0; pass <= nodes.length; pass++) {
      let changed = false;
      [...level.entries()].forEach(([id, here]) => {
        forward(id).forEach(e => {
          const known = level.get(e.target);
          if (known === undefined || known < here + 1) {
            level.set(e.target, here + 1);
            changed = true;
          }
        });
      });
      if (!changed) break;
    }
  };

  level.set(start.id, 0);
  relax();

  // Шаги, до которых от запуска не дойти (ещё не соединены), раскладываем
  // отдельными группами ниже, а не сваливаем в одну строку
  let guard = 0;
  while (guard++ <= nodes.length) {
    const rest = nodes.filter(n => !level.has(n.id));
    if (rest.length === 0) break;
    const base = Math.max(0, ...[...level.values()]) + 2;
    const seed = rest.find(n => !(incoming.get(n.id) || []).some(src => !level.has(src))) || rest[0];
    level.set(seed.id, base);
    relax();
  }

  const byLevel = new Map<number, FlowNode[]>();
  nodes.forEach(n => {
    const l = level.get(n.id) ?? 0;
    const list = byLevel.get(l) || [];
    list.push(n);
    byLevel.set(l, list);
  });

  const COL = 320;
  const ROW = 200;

  return nodes.map(n => {
    const l = level.get(n.id) ?? 0;
    const row = byLevel.get(l)!.slice().sort((a, b) => a.position.x - b.position.x);
    const i = row.findIndex(x => x.id === n.id);
    const offset = (row.length - 1) / 2;
    return { ...n, position: { x: 400 + (i - offset) * COL, y: l * ROW } };
  });
}

/** Убрать переходы, ведущие из выходов, которых у шага больше нет. */
export function dropOrphanEdges(nodeId: string, data: StepData, edges: Edge[]): Edge[] {
  const valid = new Set(stepOutputs(data).map(o => o.id));
  return edges.filter(e => {
    if (e.source !== nodeId) return true;
    return valid.has(e.sourceHandle || 'out');
  });
}
