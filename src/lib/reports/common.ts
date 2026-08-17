// ═══════════════════════════════════════════════════════════════════════════════
// СТАТИСТИКА — ОТЧЁТЫ / ОБЩИЕ ШАБЛОНЫ
// KPI-карточки и графики выгружаются одинаково во всех вкладках,
// поэтому их шаблоны собираются фабриками, а не дублируются.
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from './types';
import { orDash } from './format';

/** Строка выгрузки KPI-блока: показатель и его значение. */
export interface KpiRow {
  label: string;
  value: string | number;
}

/**
 * Заголовок смысловой группы внутри сводки.
 * Пустое значение во второй колонке читается в Excel как подзаголовок.
 */
export const kpiSection = (title: string): KpiRow => ({ label: title.toUpperCase(), value: '' });

/** Пустая строка-разделитель между группами. */
export const kpiGap = (): KpiRow => ({ label: '', value: '' });

/** Шаблон для блока KPI-карточек (показатель → значение). */
export function kpiTemplate(id: string, title: string, sheetName: string, description?: string): ReportTemplate<KpiRow> {
  return {
    id,
    title,
    sheetName,
    description,
    hideRowCount: true,
    columns: [
      { header: 'Показатель', width: 42, value: r => r.label },
      { header: 'Значение', width: 20, value: r => r.value },
    ],
  };
}

/** Точка временного ряда для выгрузки графиков. */
export interface SeriesRow {
  label: string;   // дата или час, как подписано на оси
  value: number;
}

/** Шаблон для блока-графика (временной ряд). */
export function seriesTemplate(
  id: string,
  title: string,
  sheetName: string,
  valueHeader: string,
  axisHeader = 'Дата',
  description?: string
): ReportTemplate<SeriesRow> {
  return {
    id,
    title,
    sheetName,
    description,
    columns: [
      { header: axisHeader, width: 18, value: r => r.label },
      { header: valueHeader, width: 20, value: r => r.value, format: 'integer' },
    ],
    summary: rows => {
      if (!rows.length) return [];
      const values = rows.map(r => r.value);
      const total = values.reduce((a, b) => a + b, 0);
      const max = rows.reduce((best, r) => (r.value > best.value ? r : best), rows[0]);
      const min = rows.reduce((best, r) => (r.value < best.value ? r : best), rows[0]);
      return [
        ['Всего за период', total],
        ['Среднее за точку', Math.round((total / rows.length) * 10) / 10],
        ['Максимум', `${max.value} (${max.label})`],
        ['Минимум', `${min.value} (${min.label})`],
      ];
    },
  };
}

/** Строка топ-списка (Топ-10 курсов и т.п.). */
export interface RankRow {
  rank: number;
  title: string;
  count: number | string;
}

/** Шаблон для блоков «Топ-N». */
export function rankTemplate(
  id: string,
  title: string,
  sheetName: string,
  valueHeader: string,
  description?: string
): ReportTemplate<RankRow> {
  return {
    id,
    title,
    sheetName,
    description,
    columns: [
      { header: 'Место', width: 8, value: r => r.rank, format: 'integer' },
      { header: 'Название', width: 52, value: r => orDash(r.title) },
      { header: valueHeader, width: 20, value: r => r.count, format: 'integer' },
    ],
  };
}
