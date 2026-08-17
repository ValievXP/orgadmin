// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — СТРАНИЦА ОПРОСА
//
// Опрос могут пройти тысячи человек, поэтому выгрузка разделена на три части
// с принципиально разным размером:
//
//   1. Сводка по вопросам — размер НЕ зависит от числа респондентов
//      (строк = сумма вариантов ответа, обычно 20–150). Всегда быстрая.
//   2. Ответы участников — «широкая» таблица: одна строка = один человек,
//      колонки = вопросы. Стандартный формат сырых данных.
//   3. Открытые ответы — отдельным листом: свободный текст ломает ширину
//      колонок в широкой таблице, и читают его отдельно.
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportColumn, ReportTemplate } from '../types';
import { fmtDateTime, orDash } from '../format';

/** Вариант ответа с посчитанной долей. */
export interface SurveySummaryRow {
  questionNum: number;
  questionText: string;
  typeLabel: string;
  optionLabel: string;
  count: number;
  pct: number;
  /** Средняя оценка — заполняется только у шкальных вопросов */
  average?: number;
}

/** Один респондент: служебные поля + ответы по вопросам. */
export interface SurveyRespondentRow {
  name: string;
  email: string;
  date: string;
  /** Ответ на каждый вопрос, ключ — id вопроса */
  answers: Record<string, string>;
}

export interface SurveyOpenAnswerRow {
  questionText: string;
  name: string;
  email: string;
  date: string;
  text: string;
}

/** Описание вопроса, нужное для колонок широкой таблицы. */
export interface SurveyQuestionMeta {
  id: string;
  num: number;
  text: string;
}

// ─── 1. Сводка по вопросам ───────────────────────────────────────────────────

export const surveySummaryTemplate: ReportTemplate<SurveySummaryRow> = {
  id: 'svodka_po_voprosam',
  title: 'Сводка по вопросам',
  sheetName: 'Сводка по вопросам',
  description: 'По одной строке на каждый вариант ответа. Размер не зависит от числа участников',
  columns: [
    { header: '№ вопроса', width: 11, value: r => r.questionNum, format: 'integer' },
    { header: 'Вопрос', width: 60, value: r => r.questionText },
    { header: 'Тип вопроса', width: 22, value: r => r.typeLabel },
    { header: 'Вариант ответа', width: 34, value: r => r.optionLabel },
    { header: 'Ответов', width: 12, value: r => r.count, format: 'integer' },
    { header: 'Доля', width: 12, value: r => r.pct / 100, format: 'percent' },
    { header: 'Средняя оценка', width: 16, value: r => (r.average === undefined ? '—' : r.average), format: 'decimal' },
  ],
  summary: rows => {
    const questions = new Set(rows.map(r => r.questionNum));
    return [
      ['Вопросов в отчёте', questions.size],
      ['Вариантов ответа', rows.length],
      ['Всего засчитано ответов', rows.reduce((a, r) => a + r.count, 0)],
    ];
  },
};

// ─── 2. Ответы участников (широкая таблица) ──────────────────────────────────

/**
 * Колонки строятся под конкретный опрос: служебные поля плюс по колонке
 * на каждый вопрос. Тысяча участников — это тысяча строк, а не тысяча × вопросы.
 */
export function surveyRespondentsTemplate(questions: SurveyQuestionMeta[]): ReportTemplate<SurveyRespondentRow> {
  const questionColumns: ReportColumn<SurveyRespondentRow>[] = questions.map(q => ({
    header: `${q.num}. ${q.text}`,
    width: 34,
    value: (r: SurveyRespondentRow) => orDash(r.answers[q.id]),
  }));

  return {
    id: 'otvety_uchastnikov',
    title: 'Ответы участников',
    sheetName: 'Ответы участников',
    description: 'Одна строка — один участник, по колонке на каждый вопрос',
    columns: [
      { header: 'Участник', width: 30, value: r => r.name },
      { header: 'Email', width: 30, value: r => r.email },
      { header: 'Дата ответа', width: 20, value: r => fmtDateTime(r.date) },
      ...questionColumns,
    ],
    summary: rows => [['Участников в отчёте', rows.length]],
  };
}

// ─── 3. Открытые ответы ──────────────────────────────────────────────────────

export const surveyOpenAnswersTemplate: ReportTemplate<SurveyOpenAnswerRow> = {
  id: 'otkrytye_otvety',
  title: 'Открытые ответы',
  sheetName: 'Открытые ответы',
  description: 'Свободные текстовые ответы участников',
  columns: [
    { header: 'Вопрос', width: 46, value: r => r.questionText },
    { header: 'Участник', width: 30, value: r => r.name },
    { header: 'Email', width: 30, value: r => r.email },
    { header: 'Дата ответа', width: 20, value: r => fmtDateTime(r.date) },
    { header: 'Ответ', width: 90, value: r => r.text },
  ],
  summary: rows => [['Открытых ответов', rows.length]],
};
