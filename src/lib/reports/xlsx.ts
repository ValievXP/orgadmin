// ═══════════════════════════════════════════════════════════════════════════════
// СТАТИСТИКА — ОТЧЁТЫ / ДВИЖОК ВЫГРУЗКИ
// Собирает Excel-лист по декларативному шаблону: шапка с параметрами среза,
// таблица с настоящими числами (не текстом) и блок итогов.
// Один блок → один файл; вся вкладка → книга из нескольких листов.
// ═══════════════════════════════════════════════════════════════════════════════

import * as XLSX from 'xlsx';
import { NumFmt, ReportContext, ReportSheet, ReportTemplate } from './types';
import { fmtFilterValue, safeFileName } from './format';

const NUM_FORMATS: Record<NumFmt, string | undefined> = {
  integer: '#,##0',
  decimal: '#,##0.0',
  percent: '0.0%',
  text: undefined,
};

/** Excel запрещает : \ / ? * [ ] в именах листов и ограничивает их 31 символом. */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, ' ').trim();
  return cleaned.length > 31 ? cleaned.slice(0, 31) : (cleaned || 'Лист');
}

/** Строки шапки: что это за отчёт и по какому срезу собран. */
function buildHeader<Row>(
  template: ReportTemplate<Row>,
  ctx: ReportContext,
  rowCount: number
): (string | number)[][] {
  const head: (string | number)[][] = [
    ['OSNOVA'],
    [template.title],
  ];

  if (template.description) head.push([template.description]);
  head.push([]);

  if (ctx.periodStart || ctx.periodEnd) {
    head.push(['Период:', `${ctx.periodStart || '…'} — ${ctx.periodEnd || '…'}`]);
  }

  const activeFilters = Object.entries(ctx.filters || {})
    .map(([label, value]) => [label, fmtFilterValue(value)] as const)
    .filter(([, value]) => value !== '');

  if (activeFilters.length) {
    activeFilters.forEach(([label, value]) => head.push([`${label}:`, value]));
  } else {
    head.push(['Фильтры:', 'не применялись']);
  }

  head.push(['Сформирован:', ctx.generatedAt]);
  if (!template.hideRowCount) head.push(['Записей в отчёте:', rowCount]);
  head.push([]);

  return head;
}

/**
 * Собирает лист по шаблону. Возвращает лист и число строк шапки,
 * чтобы вызывающий код знал, с какой строки начинаются данные.
 */
export function buildSheet<Row>(sheet: ReportSheet<Row>, ctx: ReportContext): XLSX.WorkSheet {
  const { template, rows } = sheet;
  const cols = template.columns;

  const header = buildHeader(template, ctx, rows.length);
  const headerRowCount = header.length;

  const tableHead = cols.map(c => c.header);
  const body = rows.map((row, i) =>
    cols.map(c => {
      const v = c.value(row, i);
      return v === null || v === undefined ? '' : v;
    })
  );

  const aoa: (string | number)[][] = [...header, tableHead, ...body];

  // Блок итогов под таблицей
  const summaryRows = template.summary ? template.summary(rows, ctx) : [];
  if (summaryRows.length) {
    aoa.push([]);
    aoa.push(['ИТОГО']);
    summaryRows.forEach(([label, value]) => aoa.push([label, value]));
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Ширины колонок: явная из шаблона либо по длине заголовка
  ws['!cols'] = cols.map(c => ({ wch: c.width ?? Math.max(12, c.header.length + 2) }));

  // Числовые форматы применяем только к телу таблицы
  const firstDataRow = headerRowCount + 1; // 0-based индекс строки данных
  cols.forEach((col, ci) => {
    const fmt = col.format ? NUM_FORMATS[col.format] : undefined;
    if (!fmt) return;
    for (let ri = 0; ri < body.length; ri++) {
      const addr = XLSX.utils.encode_cell({ r: firstDataRow + ri, c: ci });
      const cell = ws[addr];
      if (cell && typeof cell.v === 'number') cell.z = fmt;
    }
  });

  // Заголовок отчёта растягиваем на ширину таблицы
  if (cols.length > 1) {
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: cols.length - 1 } },
    ];
  }

  // Закрепляем шапку таблицы, чтобы длинные списки было удобно листать
  ws['!freeze'] = { xSplit: 0, ySplit: firstDataRow };
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range(
      { r: headerRowCount, c: 0 },
      { r: headerRowCount + body.length, c: Math.max(0, cols.length - 1) }
    ),
  };

  return ws;
}

/** Выгрузка одного блока статистики в отдельный файл. */
export function downloadBlock<Row>(
  template: ReportTemplate<Row>,
  rows: Row[],
  ctx: ReportContext,
  filePrefix = 'Статистика'
) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet({ template, rows }, ctx), sanitizeSheetName(template.sheetName));
  const stamp = ctx.fileStamp ? `_${ctx.fileStamp}` : '';
  XLSX.writeFile(wb, `${safeFileName(filePrefix)}_${safeFileName(template.id)}${stamp}.xlsx`);
}

/**
 * Выгрузка всей вкладки: книга, где каждый блок — отдельный лист.
 * Пустые блоки в книгу не попадают — они только утяжеляют файл.
 */
export function downloadWorkbook(
  sheets: ReportSheet<any>[],
  ctx: ReportContext,
  fileName: string
) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();

  const filled = sheets.filter(s => s.rows && s.rows.length > 0);
  const toWrite = filled.length ? filled : sheets.slice(0, 1);

  toWrite.forEach(sheet => {
    let name = sanitizeSheetName(sheet.template.sheetName);
    // Имена листов в книге должны быть уникальны
    let n = 2;
    while (used.has(name)) {
      const suffix = ` (${n++})`;
      name = sanitizeSheetName(sheet.template.sheetName.slice(0, 31 - suffix.length) + suffix);
    }
    used.add(name);
    XLSX.utils.book_append_sheet(wb, buildSheet(sheet, ctx), name);
  });

  const stamp = ctx.fileStamp ? `_${ctx.fileStamp}` : '';
  XLSX.writeFile(wb, `${safeFileName(fileName)}${stamp}.xlsx`);
}
