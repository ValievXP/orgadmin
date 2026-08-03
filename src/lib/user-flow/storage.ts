// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — STORAGE
// Несколько флоу на версию инструмента. localStorage-прототип с интерфейсом,
// готовым к замене на API платформы (все операции идут через этот модуль).
// ═══════════════════════════════════════════════════════════════════════════════

import { Edition } from './editions';

export interface StoredFlow {
  id: string;
  name: string;
  active: boolean;
  updatedAt: number;
  // Граф хранится как есть (ноды/рёбра ReactFlow); типизируется на стороне билдера
  nodes: unknown[];
  edges: unknown[];
}

const KEY = (edition: Edition) => `osnova-user-flow-${edition}`;
const LEGACY_KEY = 'osnova-onboarding-flow-v2';

export const newFlowId = () => `flow-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

function read(edition: Edition): StoredFlow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY(edition));
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.flows) ? parsed.flows : [];
  } catch { return []; }
}

function write(edition: Edition, flows: StoredFlow[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY(edition), JSON.stringify({ flows })); } catch { /* quota — ignore in prototype */ }
}

/** Старый однофлоу-ключ инструмента «Онбординг» переносится в Pro-список. */
export function migrateLegacy() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved?.nodes) && saved.nodes.length > 0) {
      const flows = read('pro');
      flows.unshift({
        id: newFlowId(),
        name: 'Онбординг: Стандартный',
        active: !!saved.active,
        updatedAt: Date.now(),
        nodes: saved.nodes,
        edges: saved.edges || [],
      });
      write('pro', flows);
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* corrupted legacy — drop it */ }
}

export function loadFlows(edition: Edition): StoredFlow[] {
  migrateLegacy();
  return read(edition).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getFlow(edition: Edition, id: string): StoredFlow | undefined {
  return loadFlows(edition).find(f => f.id === id);
}

export function upsertFlow(edition: Edition, flow: StoredFlow) {
  const flows = read(edition);
  const idx = flows.findIndex(f => f.id === flow.id);
  if (idx >= 0) flows[idx] = flow; else flows.push(flow);
  write(edition, flows);
}

export function deleteFlow(edition: Edition, id: string) {
  write(edition, read(edition).filter(f => f.id !== id));
}

export function duplicateFlow(edition: Edition, id: string): StoredFlow | undefined {
  const src = getFlow(edition, id);
  if (!src) return undefined;
  const copy: StoredFlow = {
    ...src,
    id: newFlowId(),
    name: `${src.name} (копия)`,
    active: false,
    updatedAt: Date.now(),
  };
  upsertFlow(edition, copy);
  return copy;
}
