// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ВКЛАДКА «ПОЛЬЗОВАТЕЛИ»
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDate, fmtDateTime, orDash, share } from '../format';
import { seriesTemplate, SeriesRow } from '../common';

/** Пользователь в том виде, в котором он лежит в статистике. */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  branch: string;
  dept: string;
  div: string;
  role: string;
  status: string;
  visit: string | null;
  activity: string;
  reg: string;
  regDateStr: string;
  regionId: string;
  gender: 'Мужской' | 'Женский';
}

/** Регион карты с пересчитанными по фильтрам значениями. */
export interface RegionRow {
  id: string;
  name: string;
  users: number;
  pct: number;
}

/**
 * Список пользователей. Выгружаются и те поля, которых нет в таблице
 * (телефон, оргструктура, пол, регион) — в отчёте они нужны для сводных.
 */
export function usersListTemplate(regionNameById: Record<string, string>): ReportTemplate<UserRow> {
  return {
    id: 'spisok_polzovatelei',
    title: 'Список пользователей',
    sheetName: 'Пользователи',
    description: 'Пользователи, попавшие в текущий срез фильтров',
    columns: [
      { header: 'ФИО', width: 30, value: r => r.name },
      { header: 'Email', width: 30, value: r => r.email },
      { header: 'Телефон', width: 18, value: r => orDash(r.phone) },
      { header: 'Филиал', width: 20, value: r => orDash(r.branch) },
      { header: 'Департамент', width: 24, value: r => orDash(r.dept) },
      { header: 'Отдел', width: 22, value: r => orDash(r.div) },
      { header: 'Должность', width: 22, value: r => orDash(r.role) },
      { header: 'Статус', width: 14, value: r => orDash(r.status) },
      { header: 'Пол', width: 12, value: r => orDash(r.gender) },
      { header: 'Регион', width: 20, value: r => orDash(regionNameById[r.regionId] || r.regionId) },
      { header: 'Последний визит', width: 20, value: r => fmtDateTime(r.visit) },
      { header: 'Последняя активность', width: 22, value: r => fmtDateTime(r.activity) },
      { header: 'Дата регистрации', width: 20, value: r => fmtDateTime(r.reg) },
    ],
    summary: rows => {
      const male = rows.filter(r => r.gender === 'Мужской').length;
      const female = rows.length - male;
      const active = rows.filter(r => r.status === 'Работает').length;
      return [
        ['Всего пользователей', rows.length],
        ['Мужчин', male],
        ['Женщин', female],
        ['Со статусом «Работает»', active],
      ];
    },
  };
}

/** Распределение пользователей по регионам (карта + список «Студенты на карте»). */
export const regionsTemplate: ReportTemplate<RegionRow> = {
  id: 'regiony',
  title: 'Распределение по регионам',
  sheetName: 'Регионы',
  description: 'Количество пользователей по регионам в текущем срезе',
  columns: [
    { header: 'Место', width: 8, value: (_r, i) => i + 1, format: 'integer' },
    { header: 'Регион', width: 30, value: r => r.name },
    { header: 'Пользователей', width: 18, value: r => r.users, format: 'integer' },
    { header: 'Доля', width: 12, value: r => r.pct / 100, format: 'percent' },
  ],
  summary: rows => {
    const total = rows.reduce((a, r) => a + r.users, 0);
    const top = rows.reduce((best, r) => (r.users > best.users ? r : best), rows[0]);
    return rows.length
      ? [
          ['Всего пользователей', total],
          ['Регионов с пользователями', rows.filter(r => r.users > 0).length],
          ['Лидирующий регион', `${top.name} (${top.users})`],
        ]
      : [];
  },
};

/** Приводит точки графика к единому виду для выгрузки. */
export function seriesRows(data: any[], isHourly: boolean): SeriesRow[] {
  return (data || []).map(d => ({
    label: isHourly ? d.time : (d.displayDate || fmtDate(d.date)),
    value: Number(d.value) || 0,
  }));
}

export const regChartTemplate = (isHourly: boolean) =>
  seriesTemplate(
    'dinamika_registracii',
    'Динамика регистраций',
    'Регистрации',
    'Регистраций',
    isHourly ? 'Время' : 'Дата',
    isHourly ? 'Почасовой разрез за выбранный день' : undefined
  );

export const visitsChartTemplate = (isHourly: boolean) =>
  seriesTemplate(
    'vizity_polzovatelei',
    'Визиты пользователей',
    'Визиты',
    'Визитов',
    isHourly ? 'Время' : 'Дата',
    isHourly ? 'Почасовой разрез за выбранный день' : undefined
  );

export const activeChartTemplate = (isHourly: boolean) =>
  seriesTemplate(
    'aktivnye_polzovateli',
    'Активные пользователи',
    'Активные',
    'Активных пользователей',
    isHourly ? 'Время' : 'Дата',
    isHourly ? 'Почасовой разрез за выбранный день' : undefined
  );
