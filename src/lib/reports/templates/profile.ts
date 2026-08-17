// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ПРОФИЛЬ СОТРУДНИКА
//
// Данных здесь мало (один человек), поэтому выгрузка простая:
//   • по одному курсу — плоский разбор модулей, уроков и тестов;
//   • по всему профилю — книга: сводка + курсы + все уроки и тесты
//     + тестирования + сертификаты.
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDate, fmtDateTime, orDash } from '../format';

/** Строка разбора: урок или тест внутри модуля курса. */
export interface ProfileItemRow {
  courseTitle: string;
  moduleTitle: string;
  itemTitle: string;
  type: 'lesson' | 'test';
  status: string;
  date: string;
  score?: string;
  verdict?: string;
  rating?: number;
  review?: string;
}

export interface ProfileCourseRow {
  title: string;
  status: string;
  progress: number;
  assignedAt: string;
  lastActivity: string;
  completedAt: string;
  modulesCount: number;
  itemsCount: number;
  itemsDone: number;
}

export interface ProfileTestingRow {
  title: string;
  status: string;
  score: number | null;
  maxScore: number;
  date: string;
}

export interface ProfileCertificateRow {
  title: string;
  issueDate: string;
}

const TYPE_LABEL: Record<string, string> = { lesson: 'Урок', test: 'Тест' };

/** Разбор прохождения: используется и для одного курса, и для всего профиля. */
export const profileItemsTemplate: ReportTemplate<ProfileItemRow> = {
  id: 'prohozhdenie',
  title: 'Прохождение модулей, уроков и тестов',
  sheetName: 'Уроки и тесты',
  description: 'По одной строке на каждый элемент курса',
  columns: [
    { header: 'Курс', width: 38, value: r => r.courseTitle },
    { header: 'Модуль', width: 40, value: r => r.moduleTitle },
    { header: 'Элемент', width: 44, value: r => r.itemTitle },
    { header: 'Тип', width: 10, value: r => TYPE_LABEL[r.type] || r.type },
    { header: 'Статус', width: 14, value: r => orDash(r.status) },
    { header: 'Дата прохождения', width: 20, value: r => fmtDateTime(r.date) },
    { header: 'Оценка', width: 12, value: r => orDash(r.score) },
    { header: 'Результат', width: 14, value: r => orDash(r.verdict) },
    { header: 'Оценка курса', width: 14, value: r => (r.rating === undefined ? '—' : r.rating), format: 'decimal' },
    { header: 'Отзыв студента', width: 60, value: r => orDash(r.review) },
  ],
  summary: rows => {
    const done = rows.filter(r => r.status === 'Пройден').length;
    const failed = rows.filter(r => r.status === 'Не сдан').length;
    const rated = rows.filter(r => r.rating !== undefined);
    const avgRating = rated.length
      ? Math.round((rated.reduce((a, r) => a + (r.rating || 0), 0) / rated.length) * 100) / 100
      : '—';
    return [
      ['Всего элементов', rows.length],
      ['Пройдено', done],
      ['Не сдано', failed],
      ['Не начато', rows.filter(r => r.status === 'Не начат').length],
      ['Прогресс', rows.length ? `${Math.round((done / rows.length) * 1000) / 10} %` : '—'],
      ['Средняя оценка курса студентом', avgRating],
    ];
  },
};

export const profileCoursesTemplate: ReportTemplate<ProfileCourseRow> = {
  id: 'naznachennye_kursy',
  title: 'Назначенные курсы',
  sheetName: 'Курсы',
  description: 'Все курсы сотрудника и прогресс по каждому',
  columns: [
    { header: 'Курс', width: 46, value: r => r.title },
    { header: 'Статус', width: 16, value: r => r.status },
    { header: 'Прогресс', width: 12, value: r => r.progress / 100, format: 'percent' },
    { header: 'Назначен', width: 18, value: r => fmtDate(r.assignedAt) },
    { header: 'Последняя активность', width: 22, value: r => fmtDateTime(r.lastActivity) },
    { header: 'Завершён', width: 20, value: r => fmtDateTime(r.completedAt) },
    { header: 'Модулей', width: 11, value: r => r.modulesCount, format: 'integer' },
    { header: 'Элементов', width: 12, value: r => r.itemsCount, format: 'integer' },
    { header: 'Пройдено', width: 12, value: r => r.itemsDone, format: 'integer' },
  ],
  summary: rows => {
    const avg = rows.length ? rows.reduce((a, r) => a + r.progress, 0) / rows.length : 0;
    return [
      ['Всего курсов', rows.length],
      ['Завершено', rows.filter(r => r.status === 'Завершен').length],
      ['В процессе', rows.filter(r => r.status === 'В процессе').length],
      ['Не начато', rows.filter(r => r.status === 'Назначен').length],
      ['Средний прогресс', `${Math.round(avg * 10) / 10} %`],
    ];
  },
};

export const profileTestingsTemplate: ReportTemplate<ProfileTestingRow> = {
  id: 'testirovaniya',
  title: 'Тестирования',
  sheetName: 'Тестирования',
  description: 'Назначенные тестирования и результаты',
  columns: [
    { header: 'Тестирование', width: 46, value: r => r.title },
    { header: 'Статус', width: 14, value: r => r.status },
    { header: 'Балл', width: 10, value: r => (r.score === null ? '—' : r.score), format: 'integer' },
    { header: 'Максимум', width: 12, value: r => r.maxScore, format: 'integer' },
    { header: 'Результат', width: 12, value: r => (r.score === null ? '—' : r.score / r.maxScore), format: 'percent' },
    { header: 'Дата', width: 18, value: r => fmtDate(r.date) },
  ],
  summary: rows => [
    ['Всего тестирований', rows.length],
    ['Сдано', rows.filter(r => r.status === 'Сдан').length],
    ['Ожидают прохождения', rows.filter(r => r.status === 'Назначен').length],
  ],
};

export const profileCertificatesTemplate: ReportTemplate<ProfileCertificateRow> = {
  id: 'sertifikaty',
  title: 'Сертификаты',
  sheetName: 'Сертификаты',
  description: 'Выданные сертификаты',
  columns: [
    { header: 'Сертификат', width: 52, value: r => r.title },
    { header: 'Дата выдачи', width: 18, value: r => fmtDate(r.issueDate) },
  ],
  summary: rows => [['Всего сертификатов', rows.length]],
};
