// ═══════════════════════════════════════════════════════════════════════════════
// СТАТИСТИКА — ОТЧЁТЫ / ФОРМАТИРОВАНИЕ
// Значения в выгрузке приводятся к виду, привычному по интерфейсу:
// даты — ДД.ММ.ГГГГ, пустые значения — прочерк, проценты — долей для Excel.
// ═══════════════════════════════════════════════════════════════════════════════

export const DASH = '—';

/** Пустое значение → прочерк. Ноль и false сохраняются как есть. */
export function orDash(v: string | number | null | undefined): string | number {
  if (v === null || v === undefined) return DASH;
  if (typeof v === 'string' && v.trim() === '') return DASH;
  return v;
}

/**
 * Дата в ДД.ММ.ГГГГ. Принимает ISO (2026-08-12), ДД/ММ/ГГГГ и ДД.ММ.ГГГГ.
 * Неразобранное значение возвращается как есть — лучше показать сырое, чем потерять.
 */
export function fmtDate(value?: string | null): string {
  if (!value) return DASH;
  const raw = value.trim();
  if (!raw) return DASH;

  // ISO: 2026-08-12 или 2026-08-12T10:00
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;

  // ДД/ММ/ГГГГ или ДД.ММ.ГГГГ (возможно со временем)
  const dmy = raw.match(/^(\d{2})[./](\d{2})[./](\d{4})/);
  if (dmy) return `${dmy[1]}.${dmy[2]}.${dmy[3]}`;

  return raw;
}

/** Дата и время в «ДД.ММ.ГГГГ ЧЧ:ММ». */
export function fmtDateTime(value?: string | null): string {
  if (!value) return DASH;
  const raw = value.trim();
  if (!raw) return DASH;

  const datePart = fmtDate(raw);
  const time = raw.match(/(\d{2}:\d{2})/);
  return time ? `${datePart} ${time[1]}` : datePart;
}

/**
 * Процент для Excel: 85.3 → 0.853. Excel умножит обратно при показе,
 * поэтому в ячейке будет настоящее число, а не текст «85,3 %».
 */
export function pctValue(percent: number | null | undefined): number | string {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return DASH;
  return percent / 100;
}

/** Доля от целого в процентах, с защитой от деления на ноль. */
export function share(part: number, total: number): number | string {
  if (!total) return DASH;
  return part / total;
}

/** Минуты → «1 ч 25 мин». Для колонок «среднее время». */
export function fmtDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return DASH;
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (!h) return `${rest} мин`;
  return rest ? `${h} ч ${rest} мин` : `${h} ч`;
}

/** Список значений фильтра в одну строку для шапки отчёта. */
export function fmtFilterValue(v: string[] | string | undefined): string {
  if (!v) return '';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '';
  return v;
}

/** Безопасное имя файла: кириллицу оставляем, спецсимволы убираем. */
export function safeFileName(name: string): string {
  return name.replace(/[^\wа-яА-ЯёЁ\- ]/g, '').trim().replace(/\s+/g, '_');
}
