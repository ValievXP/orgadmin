// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — МОДЕЛЬ ДАННЫХ
//
// Сценарий состоит из двух частей:
//   1. Настройки  — кому и когда (аудитория, запуск, тихие часы, повторный вход)
//   2. Схема      — что происходит (шаги и переходы между ними)
//
// Раньше «кому и когда» пряталось внутри шага на холсте. Теперь это отдельная
// сущность: её видно всегда, она одна на сценарий и её нельзя случайно удалить.
// ═══════════════════════════════════════════════════════════════════════════════

import { Node, Edge } from '@xyflow/react';

// ── Типы шагов ────────────────────────────────────────────────────────────────

export type StepType =
  | 'start'              // Запуск — всегда один, неудаляемый
  | 'content'            // Назначить обучение
  | 'notify'             // Отправить уведомление
  | 'wait'               // Ожидание: пауза или прохождение
  | 'branch'             // Развилка по полю профиля
  | 'end'                // Финиш
  | 'check_result'       // PRO: проверить результат обучения
  | 'curator';           // PRO: назначить куратора

// ── Элемент контента платформы ────────────────────────────────────────────────

export interface ContentRef {
  id: string;
  title: string;
  titleUz?: string;
  type: string;          // lesson | homework | test | survey | event | course
}

// ── Данные шага ───────────────────────────────────────────────────────────────

export type WaitMode = 'pause' | 'completion';
export type DelayUnit = 'min' | 'hour' | 'day';

export interface StepData {
  step: StepType;

  // content
  item?: ContentRef;
  deadlineDays?: number;       // 0 = без срока
  mandatory?: boolean;
  notifyOnAssign?: boolean;

  // notify
  recipient?: string;
  channels?: string[];
  templateId?: string;         // какой шаблон вставлен — для подсветки
  textRu?: string;
  textUz?: string;

  // wait
  waitMode?: WaitMode;
  pauseValue?: number;
  pauseUnit?: DelayUnit;
  waitItem?: ContentRef;
  waitLimitDays?: number;      // 0 = без лимита

  // branch
  branchField?: string;
  branchValues?: string[];
  branchElse?: boolean;

  // end
  endStatus?: 'success' | 'aborted';
  endNotifyHr?: boolean;

  // check_result (PRO)
  checkItems?: ContentRef[];
  checkField?: string;
  checkOperator?: string;
  checkValue?: string;

  // curator (PRO)
  curatorMode?: 'auto' | 'specific';
  curatorId?: number;

  /** Подсветка при прогоне — в хранилище не попадает */
  runState?: 'active' | 'visited' | 'idle';

  [key: string]: unknown;
}

export type FlowNode = Node<StepData>;

// ── Настройки сценария: кому и когда ──────────────────────────────────────────

export type StartEvent = 'new_employee' | 'manual' | 'schedule' | 'transfer';

/**
 * Одно правило отбора: «Филиал — один из: Ташкент, Самарканд».
 * Между правилами — И, внутри правила — ИЛИ. Формулировки «один из» / «ни один из»
 * сделаны так, чтобы это не приходилось объяснять сноской.
 */
export interface AudienceRule {
  id: string;
  field: string;
  op: 'is' | 'not';
  values: string[];
}

export interface QuietHours {
  enabled: boolean;
  from: string;   // '09:00'
  to: string;     // '20:00'
}

export interface FlowSettings {
  startEvent: StartEvent;
  /** Расписание — только Pro */
  scheduleFreq?: 'daily' | 'weekly' | 'monthly';
  scheduleDay?: string;
  scheduleMonthDay?: number;
  scheduleTime?: string;

  audience: AudienceRule[];
  quietHours: QuietHours;
  /** once — один человек проходит сценарий один раз */
  reentry: 'once' | 'always';
  /** Кого захватить при включении: только новых или всех подходящих сейчас */
  applyTo: 'new' | 'all';
}

export const DEFAULT_SETTINGS: FlowSettings = {
  startEvent: 'new_employee',
  audience: [],
  quietHours: { enabled: true, from: '09:00', to: '20:00' },
  reentry: 'once',
  applyTo: 'new',
};

// ── Документ сценария ─────────────────────────────────────────────────────────

/** Версия формата. Растёт при несовместимых изменениях — см. storage.migrate. */
export const SCHEMA_VERSION = 2;

export interface FlowDoc {
  id: string;
  name: string;
  active: boolean;
  schemaVersion: number;
  updatedAt: number;
  /** Когда сценарий включили — от этой даты считается «новый сотрудник» */
  activatedAt?: number;
  settings: FlowSettings;
  nodes: unknown[];
  edges: unknown[];
}

// ── Выходы шага ───────────────────────────────────────────────────────────────

export interface StepOutput {
  id: string;
  label: string;
  /** Цвет метки и линии */
  tone: 'neutral' | 'positive' | 'negative' | 'warning' | 'branch';
}

export const TONE_COLOR: Record<StepOutput['tone'], string> = {
  neutral:  '#B4B4B4',
  positive: '#16A34A',
  negative: '#DC2626',
  warning:  '#EA580C',
  branch:   '#7C3AED',
};

export const TONE_HANDLE: Record<StepOutput['tone'], string> = {
  neutral:  '!bg-neutral-400',
  positive: '!bg-emerald-500',
  negative: '!bg-red-500',
  warning:  '!bg-orange-500',
  branch:   '!bg-violet-500',
};

export const TONE_TEXT: Record<StepOutput['tone'], string> = {
  neutral:  'text-neutral-400',
  positive: 'text-emerald-600',
  negative: 'text-red-500',
  warning:  'text-orange-500',
  branch:   'text-violet-600',
};

export type { Edge };
