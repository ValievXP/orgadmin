// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — EDITIONS
// Один движок, две версии инструмента:
//   MVP — ядро: триггер, контент, ожидание события, условие по сотруднику,
//         задержка, уведомления, завершение.
//   PRO — апгрейд MVP: switch-ветвления, условия по контенту, кураторы,
//         триггеры по расписанию/переводу, симуляция прохождения.
// ═══════════════════════════════════════════════════════════════════════════════

export type Edition = 'mvp' | 'pro';

export interface EditionConfig {
  key: Edition;
  title: string;
  badge: string;
  basePath: string;
  /** Типы нод, доступные для добавления */
  nodeTypes: string[];
  /** Доступные события запуска триггера */
  triggerTypes: string[];
  /** Симуляция прохождения флоу */
  simulation: boolean;
}

export const EDITIONS: Record<Edition, EditionConfig> = {
  mvp: {
    key: 'mvp',
    title: 'User Flow',
    badge: 'MVP',
    basePath: '/tools/user-flow',
    nodeTypes: ['trigger', 'content', 'wait_event', 'condition_employee', 'delay', 'notify', 'end'],
    triggerTypes: ['new_employee', 'manual'],
    simulation: false,
  },
  pro: {
    key: 'pro',
    title: 'User Flow Pro',
    badge: 'PRO',
    basePath: '/tools/user-flow-pro',
    nodeTypes: [
      'trigger', 'condition_employee', 'condition_content', 'switch',
      'content', 'notify', 'curator', 'delay', 'wait_event', 'end',
    ],
    triggerTypes: ['new_employee', 'transfer', 'manual', 'schedule'],
    simulation: true,
  },
};
