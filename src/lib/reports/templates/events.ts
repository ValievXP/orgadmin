// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ВКЛАДКА «МЕРОПРИЯТИЯ»
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDate, fmtDateTime, orDash, share } from '../format';

export interface EventListRow {
  id: string;
  title: string;
  type: string;
  format: 'online' | 'offline';
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  speakers: string;
  status: string;
  participants: number;
  participantLimit: number;
  lang?: string;
  registrationType?: 'open' | 'private';
  createdAt: string;
}

export interface EventParticipantRow {
  userName: string;
  userEmail: string;
  eventTitle: string;
  registeredAt: string;
  dayLabel: string;
  dayStatus: string;
  dayCheckedInAt: string | null;
  branch: string;
  dept: string;
  div: string;
  role: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  registration: 'Регистрация',
  in_progress: 'В процессе',
  completed: 'Завершено',
};

export const eventsListTemplate: ReportTemplate<EventListRow> = {
  id: 'spisok_meropriyatii',
  title: 'Список мероприятий',
  sheetName: 'Мероприятия',
  description: 'Мероприятия, попавшие в текущий срез фильтров',
  columns: [
    { header: 'Мероприятие', width: 42, value: r => r.title },
    { header: 'Тип', width: 18, value: r => orDash(r.type) },
    { header: 'Статус', width: 16, value: r => STATUS_LABELS[r.status] || r.status },
    { header: 'Формат', width: 12, value: r => (r.format === 'online' ? 'Онлайн' : 'Офлайн') },
    { header: 'Регистрация', width: 14, value: r => (r.registrationType === 'private' ? 'Приватная' : 'Открытая') },
    { header: 'Язык', width: 10, value: r => orDash(r.lang || 'RUS') },
    { header: 'Дата проведения', width: 18, value: r => fmtDate(r.date) },
    { header: 'Начало', width: 10, value: r => orDash(r.timeStart) },
    { header: 'Окончание', width: 12, value: r => orDash(r.timeEnd) },
    { header: 'Место / ссылка', width: 34, value: r => orDash(r.location) },
    { header: 'Спикеры', width: 34, value: r => orDash(r.speakers) },
    { header: 'Участников', width: 13, value: r => r.participants, format: 'integer' },
    { header: 'Лимит', width: 10, value: r => orDash(r.participantLimit), format: 'integer' },
    { header: 'Заполненность', width: 15, value: r => share(r.participants, r.participantLimit), format: 'percent' },
    { header: 'Создано', width: 20, value: r => fmtDateTime(r.createdAt) },
  ],
  summary: rows => {
    const participants = rows.reduce((a, r) => a + r.participants, 0);
    const capacity = rows.reduce((a, r) => a + (r.participantLimit || 0), 0);
    return [
      ['Всего мероприятий', rows.length],
      ['Онлайн', rows.filter(r => r.format === 'online').length],
      ['Офлайн', rows.filter(r => r.format === 'offline').length],
      ['Участников суммарно', participants],
      ['Средняя заполненность', capacity ? `${Math.round((participants / capacity) * 1000) / 10} %` : '—'],
    ];
  },
};

export const eventParticipantsTemplate: ReportTemplate<EventParticipantRow> = {
  id: 'uchastniki_meropriyatii',
  title: 'Участники мероприятий',
  sheetName: 'Участники',
  description: 'По одной строке на участника и день мероприятия',
  columns: [
    { header: 'Участник', width: 30, value: r => r.userName },
    { header: 'Email', width: 30, value: r => r.userEmail },
    { header: 'Мероприятие', width: 40, value: r => r.eventTitle },
    { header: 'День', width: 12, value: r => orDash(r.dayLabel) },
    { header: 'Дата регистрации', width: 20, value: r => fmtDateTime(r.registeredAt) },
    { header: 'Статус посещения', width: 18, value: r => orDash(r.dayStatus) },
    { header: 'Время прихода', width: 18, value: r => fmtDateTime(r.dayCheckedInAt) },
    { header: 'Филиал', width: 20, value: r => orDash(r.branch) },
    { header: 'Департамент', width: 24, value: r => orDash(r.dept) },
    { header: 'Отдел', width: 22, value: r => orDash(r.div) },
    { header: 'Должность', width: 22, value: r => orDash(r.role) },
  ],
  summary: rows => {
    const present = rows.filter(r => r.dayStatus === 'Присутствует').length;
    return [
      ['Всего строк (участник × день)', rows.length],
      ['Присутствовали', present],
      ['Ожидание', rows.filter(r => r.dayStatus === 'Ожидание').length],
      ['Отсутствовали', rows.filter(r => r.dayStatus === 'Отсутствовал').length],
      ['Посещаемость', rows.length ? `${Math.round((present / rows.length) * 1000) / 10} %` : '—'],
    ];
  },
};
