// ═══════════════════════════════════════════════════════════════════════════════
// СТАТИСТИКА — ОТЧЁТЫ
// Единая точка входа: страница статистики импортирует только отсюда.
//
// Как устроено:
//   types.ts      — декларативное описание отчёта (колонки, форматы, итоги)
//   format.ts     — приведение дат/процентов/длительностей к читаемому виду
//   xlsx.ts       — сборка листа и выгрузка (блок → файл, вкладка → книга)
//   common.ts     — фабрики шаблонов, общих для вкладок (KPI, график, топ-N)
//   templates/*   — шаблоны конкретных блоков каждой вкладки
//
// Добавить новый блок: описать ReportTemplate в templates/<вкладка>.ts
// и вызвать downloadBlock(template, rows, ctx).
// ═══════════════════════════════════════════════════════════════════════════════

export * from './types';
export * from './format';
export * from './xlsx';
export * from './common';

export * from './templates/users';
export * from './templates/courses';
export * from './templates/events';
export * from './templates/surveys';
export * from './templates/operations';
export * from './templates/survey-detail';
export * from './templates/profile';
