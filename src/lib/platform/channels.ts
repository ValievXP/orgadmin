// ═══════════════════════════════════════════════════════════════════════════════
// ПЛАТФОРМА — КАНАЛЫ УВЕДОМЛЕНИЙ
//
// Каналы не равны между собой: Telegram-бот может быть не подключён, SMS —
// не оплачен. Инструменты обязаны показывать это состояние ДО отправки,
// а не молча терять сообщения.
//
// В проде `connected` приезжает из настроек интеграций организации.
// ═══════════════════════════════════════════════════════════════════════════════

import { NotifyChannelKey, Employee } from './profile';

export interface NotifyChannel {
  value: NotifyChannelKey;
  label: string;
  /** Подключён ли канал у организации */
  connected: boolean;
  /** Где подключить, если нет */
  setupHint?: string;
  setupHref?: string;
}

// ВНИМАНИЕ РАЗРАБОТКЕ: `connected` — это НЕ константа продукта, а состояние
// интеграций организации. Здесь оно задано вручную под текущее положение дел:
// Email и SMS ещё не подключены. Когда каналы появятся, значение должно
// приходить из настроек интеграций, а не правиться в коде.
export const NOTIFY_CHANNELS: NotifyChannel[] = [
  { value: 'push',     label: 'Push',     connected: true },
  { value: 'telegram', label: 'Telegram', connected: true },
  {
    value: 'email', label: 'Email', connected: false,
    setupHint: 'Email пока не подключён — письма по этому каналу не отправляются',
    setupHref: '/tools',
  },
  {
    value: 'sms', label: 'SMS', connected: false,
    setupHint: 'SMS пока не подключены — сообщения по этому каналу не отправляются',
    setupHref: '/tools',
  },
];

export const channelLabel = (v: string) =>
  NOTIFY_CHANNELS.find(c => c.value === v)?.label || v;

export const isChannelConnected = (v: string) =>
  !!NOTIFY_CHANNELS.find(c => c.value === v)?.connected;

/** Сотрудники, до которых выбранные каналы не дотягиваются вообще. */
export function unreachableBy(channels: string[], employees: Employee[]): Employee[] {
  const usable = channels.filter(isChannelConnected);
  if (usable.length === 0) return employees;
  return employees.filter(e => !usable.some(c => e.channels.includes(c as NotifyChannelKey)));
}

/** Сотрудники без конкретного канала — для предупреждений в проверке сценария. */
export function missingChannel(channel: NotifyChannelKey, employees: Employee[]): Employee[] {
  return employees.filter(e => !e.channels.includes(channel));
}

export const NOTIFY_RECIPIENTS = [
  { value: 'employee', label: 'Сотрудник',           desc: 'Участник сценария' },
  { value: 'curator',  label: 'Куратор',             desc: 'Назначенный куратор' },
  { value: 'manager',  label: 'Руководитель отдела', desc: 'Руководитель сотрудника' },
  { value: 'hr',       label: 'HR',                  desc: 'HR Бизнес-партнер' },
] as const;

export const recipientLabel = (v?: string) =>
  NOTIFY_RECIPIENTS.find(r => r.value === v)?.label || '';
