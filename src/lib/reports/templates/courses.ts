// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ВКЛАДКА «КУРСЫ» (курсы, уроки, тесты)
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDateTime, orDash, share } from '../format';
import { rankTemplate } from '../common';

// ─── Каталог контента ────────────────────────────────────────────────────────

export interface CourseRow {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  assigned: number;
  inProgress: number;
  completed: number;
  certificates: number;
  avgTime: string;
}

export interface LessonRow extends Omit<CourseRow, 'certificates'> {
  started: number;
  csi: number;
}

export interface TestRow extends Omit<CourseRow, 'certificates'> {
  started: number;
  passed: number;
  failed: number;
}

export const coursesCatalogTemplate: ReportTemplate<CourseRow> = {
  id: 'katalog_kursov',
  title: 'Курсы',
  sheetName: 'Курсы',
  description: 'Сводка по курсам в текущем срезе фильтров',
  columns: [
    { header: 'Название', width: 44, value: r => r.title },
    { header: 'Назначено', width: 14, value: r => r.assigned, format: 'integer' },
    { header: 'В процессе', width: 14, value: r => r.inProgress, format: 'integer' },
    { header: 'Завершено', width: 14, value: r => r.completed, format: 'integer' },
    { header: 'Завершаемость', width: 16, value: r => share(r.completed, r.assigned), format: 'percent' },
    { header: 'Сертификатов', width: 15, value: r => r.certificates, format: 'integer' },
    { header: 'Ср. время', width: 14, value: r => orDash(r.avgTime) },
    { header: 'Язык', width: 10, value: r => orDash(r.language) },
    { header: 'Создан', width: 20, value: r => fmtDateTime(r.createdAt) },
  ],
  summary: rows => {
    const assigned = rows.reduce((a, r) => a + r.assigned, 0);
    const completed = rows.reduce((a, r) => a + r.completed, 0);
    return [
      ['Всего курсов', rows.length],
      ['Назначено всего', assigned],
      ['Завершено всего', completed],
      ['Сертификатов выдано', rows.reduce((a, r) => a + r.certificates, 0)],
      ['Средняя завершаемость', assigned ? `${Math.round((completed / assigned) * 1000) / 10} %` : '—'],
    ];
  },
};

export const lessonsCatalogTemplate: ReportTemplate<LessonRow> = {
  id: 'katalog_urokov',
  title: 'Уроки',
  sheetName: 'Уроки',
  description: 'Сводка по урокам в текущем срезе фильтров',
  columns: [
    { header: 'Название', width: 44, value: r => r.title },
    { header: 'Начато', width: 12, value: r => r.started, format: 'integer' },
    { header: 'В процессе', width: 14, value: r => r.inProgress, format: 'integer' },
    { header: 'Завершено', width: 14, value: r => r.completed, format: 'integer' },
    { header: 'Завершаемость', width: 16, value: r => share(r.completed, r.started), format: 'percent' },
    { header: 'Ср. время', width: 14, value: r => orDash(r.avgTime) },
    { header: 'CSI', width: 10, value: r => r.csi, format: 'decimal' },
    { header: 'Язык', width: 10, value: r => orDash(r.language) },
    { header: 'Создан', width: 20, value: r => fmtDateTime(r.createdAt) },
  ],
  summary: rows => {
    const csi = rows.length ? rows.reduce((a, r) => a + r.csi, 0) / rows.length : 0;
    return [
      ['Всего уроков', rows.length],
      ['Начато всего', rows.reduce((a, r) => a + r.started, 0)],
      ['Завершено всего', rows.reduce((a, r) => a + r.completed, 0)],
      ['Средний CSI', Math.round(csi * 100) / 100],
    ];
  },
};

export const testsCatalogTemplate: ReportTemplate<TestRow> = {
  id: 'katalog_testov',
  title: 'Тесты',
  sheetName: 'Тесты',
  description: 'Сводка по тестам в текущем срезе фильтров',
  columns: [
    { header: 'Название', width: 44, value: r => r.title },
    { header: 'Начато', width: 12, value: r => r.started, format: 'integer' },
    { header: 'В процессе', width: 14, value: r => r.inProgress, format: 'integer' },
    { header: 'Завершено', width: 14, value: r => r.completed, format: 'integer' },
    { header: 'Успешно', width: 12, value: r => r.passed, format: 'integer' },
    { header: 'Провалено', width: 13, value: r => r.failed, format: 'integer' },
    { header: 'Доля успешных', width: 16, value: r => share(r.passed, r.passed + r.failed), format: 'percent' },
    { header: 'Ср. время', width: 14, value: r => orDash(r.avgTime) },
    { header: 'Язык', width: 10, value: r => orDash(r.language) },
    { header: 'Создан', width: 20, value: r => fmtDateTime(r.createdAt) },
  ],
  summary: rows => {
    const passed = rows.reduce((a, r) => a + r.passed, 0);
    const failed = rows.reduce((a, r) => a + r.failed, 0);
    return [
      ['Всего тестов', rows.length],
      ['Успешных попыток', passed],
      ['Проваленных попыток', failed],
      ['Доля успешных', passed + failed ? `${Math.round((passed / (passed + failed)) * 1000) / 10} %` : '—'],
    ];
  },
};

// ─── Записи пользователей ────────────────────────────────────────────────────

interface BaseEnrollment {
  userName: string;
  userEmail: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  avgTime: string;
}

export interface CourseEnrollmentRow extends BaseEnrollment {
  courseName: string;
  progress: number;
}

export interface LessonEnrollmentRow extends BaseEnrollment {
  lessonName: string;
  courseName: string;
  rating: number | null;
}

export interface TestEnrollmentRow extends BaseEnrollment {
  testName: string;
  courseName: string;
  status: 'Успешно' | 'Провалено' | null;
  correctAnswers: string | null;
}

const enrollmentBaseColumns = [
  { header: 'Пользователь', width: 30, value: (r: BaseEnrollment) => r.userName },
  { header: 'Email', width: 30, value: (r: BaseEnrollment) => r.userEmail },
];

const enrollmentTailColumns = [
  { header: 'Назначен', width: 20, value: (r: BaseEnrollment) => fmtDateTime(r.assignedAt) },
  { header: 'Начал', width: 20, value: (r: BaseEnrollment) => fmtDateTime(r.startedAt) },
  { header: 'Завершил', width: 20, value: (r: BaseEnrollment) => fmtDateTime(r.completedAt) },
  { header: 'Затраченное время', width: 18, value: (r: BaseEnrollment) => orDash(r.avgTime) },
];

export const courseEnrollmentsTemplate: ReportTemplate<CourseEnrollmentRow> = {
  id: 'zapisi_po_kursam',
  title: 'Записи пользователей на курсы',
  sheetName: 'Записи · Курсы',
  description: 'Назначения курсов и прогресс по каждому пользователю',
  columns: [
    ...enrollmentBaseColumns,
    { header: 'Курс', width: 40, value: r => r.courseName },
    ...enrollmentTailColumns,
    { header: 'Прогресс', width: 12, value: r => r.progress / 100, format: 'percent' },
  ],
  summary: rows => {
    const completed = rows.filter(r => r.completedAt).length;
    const started = rows.filter(r => r.startedAt).length;
    const avg = rows.length ? rows.reduce((a, r) => a + r.progress, 0) / rows.length : 0;
    return [
      ['Всего назначений', rows.length],
      ['Приступили', started],
      ['Завершили', completed],
      ['Не приступали', rows.length - started],
      ['Средний прогресс', `${Math.round(avg * 10) / 10} %`],
    ];
  },
};

export const lessonEnrollmentsTemplate: ReportTemplate<LessonEnrollmentRow> = {
  id: 'zapisi_po_urokam',
  title: 'Записи пользователей на уроки',
  sheetName: 'Записи · Уроки',
  description: 'Прохождение уроков и выставленные оценки',
  columns: [
    ...enrollmentBaseColumns,
    { header: 'Урок', width: 40, value: r => r.lessonName },
    { header: 'Курс', width: 34, value: r => orDash(r.courseName) },
    ...enrollmentTailColumns,
    { header: 'Оценка', width: 10, value: r => (r.rating === null ? '—' : r.rating), format: 'decimal' },
  ],
  summary: rows => {
    const rated = rows.filter(r => r.rating !== null);
    const avg = rated.length ? rated.reduce((a, r) => a + (r.rating || 0), 0) / rated.length : 0;
    return [
      ['Всего назначений', rows.length],
      ['Завершили', rows.filter(r => r.completedAt).length],
      ['С оценкой', rated.length],
      ['Средняя оценка', rated.length ? Math.round(avg * 100) / 100 : '—'],
    ];
  },
};

export const testEnrollmentsTemplate: ReportTemplate<TestEnrollmentRow> = {
  id: 'zapisi_po_testam',
  title: 'Записи пользователей на тесты',
  sheetName: 'Записи · Тесты',
  description: 'Попытки прохождения тестов и результаты',
  columns: [
    ...enrollmentBaseColumns,
    { header: 'Тест', width: 40, value: r => r.testName },
    { header: 'Курс', width: 34, value: r => orDash(r.courseName) },
    ...enrollmentTailColumns,
    { header: 'Статус', width: 14, value: r => orDash(r.status) },
    { header: 'Верных ответов', width: 16, value: r => orDash(r.correctAnswers) },
  ],
  summary: rows => {
    const passed = rows.filter(r => r.status === 'Успешно').length;
    const failed = rows.filter(r => r.status === 'Провалено').length;
    return [
      ['Всего назначений', rows.length],
      ['Успешно', passed],
      ['Провалено', failed],
      ['Не завершили', rows.length - passed - failed],
      ['Доля успешных', passed + failed ? `${Math.round((passed / (passed + failed)) * 1000) / 10} %` : '—'],
    ];
  },
};

// ─── Топ-списки ──────────────────────────────────────────────────────────────

export const topPopularTemplate = rankTemplate(
  'top_populyarnye_kursy',
  'Топ 10 курсов по популярности',
  'Топ · Популярность',
  'Назначений',
  'Курсы с наибольшим числом назначений в текущем срезе'
);

export const topCompletedTemplate = rankTemplate(
  'top_zavershennye_kursy',
  'Топ 10 курсов по завершению',
  'Топ · Завершение',
  'Завершений',
  'Курсы с наибольшим числом завершений в текущем срезе'
);
