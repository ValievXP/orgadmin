// ═══════════════════════════════════════════════════════════════════════════════
// ШАБЛОНЫ ОТЧЁТОВ — ВКЛАДКА «ИСТОРИЯ ОПЕРАЦИЙ»
// ═══════════════════════════════════════════════════════════════════════════════

import { ReportTemplate } from '../types';
import { fmtDateTime, orDash } from '../format';

export interface OperationRow {
  id: number;
  userName: string;
  userEmail: string;
  type: 'Назначение' | 'Покупка' | 'Регистрация';
  itemName: string;
  dateStr: string;
  sum: string;
  promoCode: string;
  /** Подтягивается из профиля пользователя по userId */
  branch?: string;
  dept?: string;
  div?: string;
  role?: string;
}

/** Сумма приходит строкой «25,000 сум» — для Excel нужно число. */
function parseSum(sum: string): number | string {
  if (!sum) return '—';
  const digits = sum.replace(/[^\d]/g, '');
  return digits ? Number(digits) : '—';
}

const commonColumns = [
  { header: 'Пользователь', width: 30, value: (r: OperationRow) => r.userName },
  { header: 'Email', width: 30, value: (r: OperationRow) => r.userEmail },
];

const orgColumns = [
  { header: 'Филиал', width: 20, value: (r: OperationRow) => orDash(r.branch) },
  { header: 'Департамент', width: 24, value: (r: OperationRow) => orDash(r.dept) },
  { header: 'Отдел', width: 22, value: (r: OperationRow) => orDash(r.div) },
  { header: 'Должность', width: 22, value: (r: OperationRow) => orDash(r.role) },
];

export const operationsTemplate: ReportTemplate<OperationRow> = {
  id: 'istoriya_operacii',
  title: 'История операций',
  sheetName: 'Операции',
  description: 'Назначения, регистрации и покупки в текущем срезе фильтров',
  columns: [
    ...commonColumns,
    { header: 'Тип операции', width: 16, value: r => r.type },
    { header: 'Название', width: 44, value: r => r.itemName },
    { header: 'Дата и время', width: 20, value: r => fmtDateTime(r.dateStr) },
    ...orgColumns,
  ],
  summary: rows => [
    ['Всего операций', rows.length],
    ['Назначений', rows.filter(r => r.type === 'Назначение').length],
    ['Регистраций', rows.filter(r => r.type === 'Регистрация').length],
    ['Покупок', rows.filter(r => r.type === 'Покупка').length],
  ],
};

export const purchasesTemplate: ReportTemplate<OperationRow> = {
  id: 'pokupki',
  title: 'Покупки',
  sheetName: 'Покупки',
  description: 'Оплаченные позиции и применённые промокоды',
  columns: [
    ...commonColumns,
    { header: 'Название', width: 44, value: r => r.itemName },
    { header: 'Сумма, сум', width: 16, value: r => parseSum(r.sum), format: 'integer' },
    { header: 'Промокод', width: 16, value: r => (r.promoCode && r.promoCode !== '—' ? r.promoCode : '—') },
    { header: 'Дата и время', width: 20, value: r => fmtDateTime(r.dateStr) },
    ...orgColumns,
  ],
  summary: rows => {
    const total = rows.reduce((a, r) => {
      const v = parseSum(r.sum);
      return a + (typeof v === 'number' ? v : 0);
    }, 0);
    const withPromo = rows.filter(r => r.promoCode && r.promoCode !== '—').length;
    return [
      ['Всего покупок', rows.length],
      ['Сумма покупок, сум', total],
      ['Средний чек, сум', rows.length ? Math.round(total / rows.length) : '—'],
      ['С промокодом', withPromo],
    ];
  },
};
