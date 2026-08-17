// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ВКЛАДКА «ОПРОСЫ»
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDateTime, orDash, share } from '../format';

export interface SurveyListRow {
  id: string;
  title: string;
  lang?: string;
  status: string;
  type: string;
  createdAt: string;
  /** Считается по отфильтрованным записям участников */
  assigned: number;
  inProgress: number;
  completed: number;
  avgTime: string;
}

export interface SurveyParticipantRow {
  userName: string;
  userEmail: string;
  surveyTitle: string;
  registeredAt: string;
  partLabel: string;
  partStatus: string;
  partCompletedAt: string | null;
  duration: string;
  branch: string;
  dept: string;
  div: string;
  role: string;
}

export const surveysListTemplate: ReportTemplate<SurveyListRow> = {
  id: 'spisok_oprosov',
  title: 'Список опросов',
  sheetName: 'Опросы',
  description: 'Опросы и их наполнение в текущем срезе фильтров',
  columns: [
    { header: 'Название', width: 44, value: r => r.title },
    { header: 'Тип', width: 22, value: r => orDash(r.type) },
    { header: 'Статус', width: 14, value: r => orDash(r.status) },
    { header: 'Назначено', width: 14, value: r => r.assigned, format: 'integer' },
    { header: 'В процессе', width: 14, value: r => r.inProgress, format: 'integer' },
    { header: 'Завершено', width: 14, value: r => r.completed, format: 'integer' },
    { header: 'Доля завершивших', width: 18, value: r => share(r.completed, r.assigned), format: 'percent' },
    { header: 'Ср. время', width: 14, value: r => orDash(r.avgTime) },
    { header: 'Язык', width: 10, value: r => orDash(r.lang || 'RUS') },
    { header: 'Создан', width: 20, value: r => fmtDateTime(r.createdAt) },
  ],
  summary: rows => {
    const assigned = rows.reduce((a, r) => a + r.assigned, 0);
    const completed = rows.reduce((a, r) => a + r.completed, 0);
    return [
      ['Всего опросов', rows.length],
      ['Назначено всего', assigned],
      ['Завершено всего', completed],
      ['Средняя доля завершивших', assigned ? `${Math.round((completed / assigned) * 1000) / 10} %` : '—'],
    ];
  },
};

export const surveyParticipantsTemplate: ReportTemplate<SurveyParticipantRow> = {
  id: 'uchastniki_oprosov',
  title: 'Участники опросов',
  sheetName: 'Участники опросов',
  description: 'По одной строке на участника и часть опроса',
  columns: [
    { header: 'Участник', width: 30, value: r => r.userName },
    { header: 'Email', width: 30, value: r => r.userEmail },
    { header: 'Опрос', width: 40, value: r => r.surveyTitle },
    { header: 'Часть', width: 12, value: r => orDash(r.partLabel) },
    { header: 'Назначен', width: 20, value: r => fmtDateTime(r.registeredAt) },
    { header: 'Статус', width: 16, value: r => orDash(r.partStatus) },
    { header: 'Завершил', width: 20, value: r => fmtDateTime(r.partCompletedAt) },
    { header: 'Затраченное время', width: 18, value: r => orDash(r.duration) },
    { header: 'Филиал', width: 20, value: r => orDash(r.branch) },
    { header: 'Департамент', width: 24, value: r => orDash(r.dept) },
    { header: 'Отдел', width: 22, value: r => orDash(r.div) },
    { header: 'Должность', width: 22, value: r => orDash(r.role) },
  ],
  summary: rows => {
    const done = rows.filter(r => r.partStatus === 'Заполнил').length;
    return [
      ['Всего строк (участник × часть)', rows.length],
      ['Заполнено', done],
      ['Ожидание', rows.filter(r => r.partStatus === 'Ожидание').length],
      ['Не заполнено', rows.filter(r => r.partStatus === 'Не заполнил').length],
      ['Доля заполненных', rows.length ? `${Math.round((done / rows.length) * 1000) / 10} %` : '—'],
    ];
  },
};
