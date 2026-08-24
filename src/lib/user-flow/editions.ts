// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — ГРАНИЦА МЕЖДУ MVP И PRO
//
//   ЭТОТ ФАЙЛ — ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ О ТОМ, ЧТО ВХОДИТ В PRO.
//
// Чтобы перенести возможность из Pro в MVP (или обратно), правится ровно один
// массив ниже — PRO_ONLY_STEPS или PRO_ONLY_EVENTS. Ни реестр шагов, ни панели,
// ни проверка сценария больше нигде границу не описывают: они спрашивают её
// у функций stepAllowed / startEventAllowed.
//
// ── ПРИНЦИП РАЗДЕЛЕНИЯ ────────────────────────────────────────────────────────
//
// Граница проведена по СТОИМОСТИ ИСПОЛНЕНИЯ НА БЭКЕНДЕ, а не по тому, какой шаг
// проще нарисовать:
//
//   MVP — работает на механизмах, которые у платформы уже есть: создание
//         пользователя, ручной запуск, назначение контента, отправка
//         уведомления, отложенная задача, переход по метке.
//
//   PRO — требует новых механизмов: планировщика повторяющихся запусков,
//         журнала изменений профиля, доступа к результатам обучения.
//
// Развилка на несколько веток намеренно оставлена в MVP: для бэкенда это тот же
// переход по метке, что и обычное условие.
// ═══════════════════════════════════════════════════════════════════════════════

import { StepType, StartEvent } from './types';

export type Edition = 'mvp' | 'pro';

/** Все шаги, которые пользователь может добавить. «Запуск» есть всегда и не добавляется. */
export const ADDABLE_STEPS: StepType[] = [
  'content', 'notify', 'wait', 'branch', 'curator', 'check_result', 'end',
];

// ── ЧТО ВХОДИТ ТОЛЬКО В PRO ───────────────────────────────────────────────────

/** Шаги, доступные только в Pro. Единственное место, где это объявлено. */
export const PRO_ONLY_STEPS: StepType[] = ['curator', 'check_result'];

/** События запуска, доступные только в Pro. */
export const PRO_ONLY_EVENTS: StartEvent[] = ['schedule', 'transfer'];

/**
 * Почему возможность в Pro — что именно должна уметь платформа.
 *
 * ЭТО ТЕКСТ ДЛЯ РАЗРАБОТКИ, НЕ ДЛЯ ИНТЕРФЕЙСА. Пользователю платформы незачем
 * знать про планировщики и журналы изменений — ему показывается короткое
 * PRO_LOCK_HINT. Здесь описана постановка задачи для бэкенда.
 */
export const PRO_REASON: Record<string, string> = {
  curator: 'Нужна механика кураторства: закрепление сотрудника за куратором и зона ответственности',
  check_result: 'Нужен доступ к результатам обучения в реальном времени: баллы, прогресс, факт прохождения',
  schedule: 'Нужен планировщик повторяющихся запусков с защитой от повторной выдачи',
  transfer: 'Нужен журнал изменений профиля — сейчас платформа изменения должности и отдела не хранит',
};

export const isProStep = (step: StepType) => PRO_ONLY_STEPS.includes(step);
export const isProEvent = (event: StartEvent) => PRO_ONLY_EVENTS.includes(event);

// ── Конфигурация версий (выводится из объявлений выше) ────────────────────────

export interface EditionConfig {
  key: Edition;
  title: string;
  /** Метка версии рядом с названием. Пустая — значит метки нет:
   *  «MVP» — наше внутреннее слово, пользователю платформы оно ничего не говорит. */
  badge: string;
  basePath: string;
  accent: 'teal' | 'violet';
  /** Шаги, доступные для добавления */
  steps: StepType[];
  /** События запуска сценария */
  startEvents: StartEvent[];
}

const ALL_EVENTS: StartEvent[] = ['new_employee', 'manual', 'transfer', 'schedule'];

export const EDITIONS: Record<Edition, EditionConfig> = {
  mvp: {
    key: 'mvp',
    title: 'User Flow',
    badge: '',
    basePath: '/tools/user-flow',
    accent: 'teal',
    steps: ADDABLE_STEPS.filter(s => !isProStep(s)),
    startEvents: ALL_EVENTS.filter(e => !isProEvent(e)),
  },
  pro: {
    key: 'pro',
    title: 'User Flow Pro',
    badge: 'PRO',
    basePath: '/tools/user-flow-pro',
    accent: 'violet',
    steps: ADDABLE_STEPS,
    startEvents: ALL_EVENTS,
  },
};

// ── Проверки доступности ──────────────────────────────────────────────────────

/** «Запуск» доступен всегда: он есть в каждом сценарии и не добавляется вручную. */
export const stepAllowed = (edition: Edition, step: StepType) =>
  step === 'start' || EDITIONS[edition].steps.includes(step);

export const startEventAllowed = (edition: Edition, event: StartEvent) =>
  EDITIONS[edition].startEvents.includes(event);

/**
 * Шаги сценария, которые эта версия исполнить не сможет.
 * Используется проверкой сценария: такой сценарий нельзя включать, иначе
 * платформа молча остановится на неизвестном ей шаге.
 */
export const unsupportedSteps = (edition: Edition, steps: StepType[]) =>
  [...new Set(steps.filter(s => !stepAllowed(edition, s)))];
