// ═══════════════════════════════════════════════════════════════════════════════
// ПЛАТФОРМА — ПРОФИЛЬ СОТРУДНИКА (единый источник)
//
// Раньше каждый инструмент держал свою копию списка полей и справочников.
// Теперь источник один, и он читает НАСТРОЙКИ ПЛАТФОРМЫ: администратор может
// переименовать поле или убрать его из профиля (/settings) — и все инструменты,
// включая User Flow, сразу видят изменение.
//
// В проде: справочники приезжают из API, EMPLOYEES заменяется запросом с
// фильтром. Интерфейс модуля при этом не меняется.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Справочники организации ───────────────────────────────────────────────────

export const ORG = {
  branches: ['Ташкент (ГК)', 'Самарканд', 'Бухара', 'Фергана'],
  departments: [
    { name: 'Коммерческий департамент', divisions: ['Отдел продаж B2B', 'Отдел продаж B2C'] },
    { name: 'Маркетинг',                divisions: ['PR и коммуникации'] },
    { name: 'Служба поддержки',         divisions: ['Первая линия'] },
    { name: 'HR',                       divisions: ['Подбор персонала'] },
    { name: 'IT',                       divisions: ['Разработка ПО'] },
    { name: 'Финансы',                  divisions: ['Бухгалтерия'] },
    { name: 'Руководство',              divisions: ['Совет директоров'] },
    { name: 'Логистика',                divisions: ['Складской учет'] },
    { name: 'Продуктовая аналитика',    divisions: ['Аналитика'] },
  ],
  positions: [
    'Стажёр', 'Младший специалист', 'Руководитель отдела', 'PR-менеджер',
    'Специалист поддержки', 'HR Бизнес-партнер', 'Frontend Разработчик',
    'Главный бухгалтер', 'Операционный директор', 'Менеджер по логистике',
    'Старший менеджер', 'Data Analyst',
  ],
  languages: ['RU', 'UZ'],
};

// Статус сотрудника — управляемый справочник, а не набор значений, случайно
// собранный из существующих пользователей. Без этого нельзя было построить
// сценарий «сотрудник попал в статус Стажировка».
export const EMPLOYEE_STATUSES = [
  'Стажировка',
  'Испытательный срок',
  'Работает',
  'Отпуск',
  'Уволен',
];

/**
 * Статусы, при которых сотрудник не участвует в сценариях: назначать обучение
 * уволенному бессмысленно. Правило вынесено сюда, чтобы его было видно и
 * правилось в одном месте, а не пряталось строкой внутри фильтра аудитории.
 */
export const INACTIVE_STATUSES = ['Уволен'];

export const isActiveEmployee = (e: { status: string }) => !INACTIVE_STATUSES.includes(e.status);

export const ALL_DIVISIONS = ORG.departments.flatMap(d => d.divisions);

// ── Модель сотрудника ─────────────────────────────────────────────────────────

export type NotifyChannelKey = 'push' | 'telegram' | 'email' | 'sms';

export interface Employee {
  id: number;
  initials: string;
  name: string;
  branch: string;
  dept: string;
  div: string;
  role: string;
  status: string;
  lang: 'RU' | 'UZ';
  /** Каналы, до которых сотрудник реально доступен (Telegram привязан не у всех) */
  channels: NotifyChannelKey[];
  [key: string]: string | number | string[];
}

const E = (
  id: number, initials: string, name: string,
  branch: string, dept: string, div: string, role: string,
  status: string, lang: 'RU' | 'UZ', channels: NotifyChannelKey[],
): Employee => ({ id, initials, name, branch, dept, div, role, status, lang, channels });

export const EMPLOYEES: Employee[] = [
  // ── Стажёры (целевая аудитория онбординга) ──
  E(11, 'АЮ', 'Юсупов Азиз Шухратович',       'Ташкент (ГК)', 'IT',                       'Разработка ПО',    'Стажёр', 'Стажировка', 'UZ', ['push', 'telegram']),
  E(12, 'НС', 'Салимова Нигора Фарходовна',   'Ташкент (ГК)', 'Маркетинг',                'PR и коммуникации','Стажёр', 'Стажировка', 'UZ', ['push']),
  E(13, 'ДП', 'Петров Денис Олегович',        'Ташкент (ГК)', 'Коммерческий департамент', 'Отдел продаж B2B', 'Стажёр', 'Стажировка', 'RU', ['push', 'telegram', 'email']),
  E(14, 'КЖ', 'Жумаева Камила Бахтияровна',   'Самарканд',    'Служба поддержки',         'Первая линия',     'Стажёр', 'Стажировка', 'UZ', ['push', 'telegram']),
  E(15, 'МР', 'Рахимов Мурод Аброрович',      'Бухара',       'Логистика',                'Складской учет',   'Стажёр', 'Стажировка', 'UZ', ['push']),
  E(16, 'ЕВ', 'Виноградова Елизавета Ильин.', 'Ташкент (ГК)', 'HR',                       'Подбор персонала', 'Стажёр', 'Стажировка', 'RU', ['push', 'telegram', 'email']),

  // ── Испытательный срок ──
  E(17, 'ТА', 'Абдуллаев Тимур Рустамович',   'Ташкент (ГК)', 'IT',                       'Разработка ПО',      'Младший специалист', 'Испытательный срок', 'UZ', ['push', 'telegram']),
  E(18, 'ОГ', 'Громова Ольга Викторовна',     'Фергана',      'Коммерческий департамент', 'Отдел продаж B2C',   'Младший специалист', 'Испытательный срок', 'RU', ['push', 'email']),
  E(19, 'ША', 'Азимов Шерзод Комилович',      'Самарканд',    'Продуктовая аналитика',    'Аналитика',          'Младший специалист', 'Испытательный срок', 'UZ', ['push', 'telegram']),

  // ── Основной штат ──
  E(1,  'АС', 'Смирнов Алексей Иванович',      'Ташкент (ГК)', 'Коммерческий департамент', 'Отдел продаж B2B',  'Руководитель отдела',   'Работает', 'RU', ['push', 'telegram', 'email', 'sms']),
  E(2,  'МВ', 'Волкова Мария Сергеевна',       'Ташкент (ГК)', 'Маркетинг',                'PR и коммуникации', 'PR-менеджер',           'Работает', 'RU', ['push', 'telegram', 'email']),
  E(3,  'ДТ', 'Тарасов Дмитрий Андреевич',     'Самарканд',    'Служба поддержки',         'Первая линия',      'Специалист поддержки',  'Отпуск',   'RU', ['push', 'email']),
  E(4,  'ЕК', 'Кузнецова Елена Александровна', 'Ташкент (ГК)', 'HR',                       'Подбор персонала',  'HR Бизнес-партнер',     'Работает', 'RU', ['push', 'telegram', 'email']),
  E(5,  'ТИ', 'Ибрагимов Тимур Бахтиярович',   'Бухара',       'IT',                       'Разработка ПО',     'Frontend Разработчик',  'Работает', 'UZ', ['push', 'telegram']),
  E(6,  'ОС', 'Сидорова Ольга Петровна',       'Ташкент (ГК)', 'Финансы',                  'Бухгалтерия',       'Главный бухгалтер',     'Работает', 'RU', ['push', 'email']),
  E(7,  'АМ', 'Махмудов Алишер Рустамович',    'Ташкент (ГК)', 'Руководство',              'Совет директоров',  'Операционный директор', 'Работает', 'UZ', ['push', 'telegram', 'email', 'sms']),
  E(8,  'ИН', 'Новикова Ирина Владимировна',   'Фергана',      'Логистика',                'Складской учет',    'Менеджер по логистике', 'Уволен',   'RU', ['push']),
  E(9,  'РК', 'Каримов Рустам Маратович',      'Самарканд',    'Коммерческий департамент', 'Отдел продаж B2C',  'Старший менеджер',      'Работает', 'UZ', ['push', 'telegram']),
  E(10, 'СЛ', 'Лебедева Светлана Сергеевна',   'Ташкент (ГК)', 'Продуктовая аналитика',    'Аналитика',         'Data Analyst',          'Работает', 'RU', ['push', 'telegram', 'email']),
  E(20, 'ФХ', 'Хасанов Фаррух Дилшодович',     'Бухара',       'Служба поддержки',         'Первая линия',      'Специалист поддержки',  'Работает', 'UZ', ['push']),
  E(21, 'АБ', 'Белова Анна Дмитриевна',        'Ташкент (ГК)', 'Финансы',                  'Бухгалтерия',       'Младший специалист',    'Работает', 'RU', ['push', 'email']),
  E(22, 'НТ', 'Турсунов Насим Улугбекович',    'Фергана',      'IT',                       'Разработка ПО',     'Frontend Разработчик',  'Работает', 'UZ', ['push', 'telegram']),
  E(23, 'ЛМ', 'Морозова Людмила Петровна',     'Самарканд',    'Маркетинг',                'PR и коммуникации', 'PR-менеджер',           'Работает', 'RU', ['push', 'telegram', 'email']),
  E(24, 'ЗИ', 'Исмаилов Зафар Тохирович',      'Ташкент (ГК)', 'Коммерческий департамент', 'Отдел продаж B2B',  'Старший менеджер',      'Работает', 'UZ', ['push', 'telegram']),
];

// ── Поля профиля: берутся из настроек платформы ───────────────────────────────

export interface ProfileField {
  /** Ключ в модели сотрудника */
  key: string;
  /** Подпись — та, что администратор задал в настройках */
  label: string;
  /** Допустимые значения из справочника */
  values: string[];
}

/** Привязка настраиваемых полей профиля к данным сотрудника. */
const FIELD_BINDINGS: Record<string, { key: string; values: () => string[] }> = {
  p_branch: { key: 'branch', values: () => ORG.branches },
  p_dept:   { key: 'dept',   values: () => ORG.departments.map(d => d.name) },
  p_div:    { key: 'div',    values: () => ALL_DIVISIONS },
  p_role:   { key: 'role',   values: () => ORG.positions },
  p_status: { key: 'status', values: () => EMPLOYEE_STATUSES },
};

const DEFAULT_PRIORITY_FIELDS = [
  { id: 'p_branch', label: 'Филиал' },
  { id: 'p_dept',   label: 'Департамент' },
  { id: 'p_div',    label: 'Отдел' },
  { id: 'p_role',   label: 'Должность' },
  { id: 'p_status', label: 'Статус' },
];

/** Системное поле — есть всегда, в настройках профиля не редактируется. */
const LANG_FIELD: ProfileField = { key: 'lang', label: 'Язык', values: ORG.languages };

/**
 * Поля, по которым можно отбирать и разделять сотрудников.
 * Состав и подписи — из настроек платформы (/settings → Поля профиля).
 */
let fieldsCache: { raw: string | null; fields: ProfileField[] } | null = null;

export function getProfileFields(): ProfileField[] {
  const raw = typeof window === 'undefined' ? null : localStorage.getItem('osnova_user_settings');

  // Функция вызывается на каждый чип при отрисовке — без кэша это десятки
  // разборов JSON за один рендер. Кэш сбрасывается сам, если настройки изменили.
  if (fieldsCache && fieldsCache.raw === raw) return fieldsCache.fields;

  let configured = DEFAULT_PRIORITY_FIELDS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.priorityFields) && parsed.priorityFields.length > 0) {
        configured = parsed.priorityFields;
      }
    } catch { /* настройки повреждены — работаем на значениях по умолчанию */ }
  }

  const fields = configured
    .filter(f => FIELD_BINDINGS[f.id])
    .map(f => {
      const bind = FIELD_BINDINGS[f.id];
      return {
        key: bind.key,
        label: (f.label || '').trim() || DEFAULT_PRIORITY_FIELDS.find(d => d.id === f.id)?.label || bind.key,
        values: bind.values(),
      };
    });

  const result = [...fields, LANG_FIELD];
  fieldsCache = { raw, fields: result };
  return result;
}

export function getFieldLabel(key: string): string {
  return getProfileFields().find(f => f.key === key)?.label || key;
}

export function getFieldValues(key: string | undefined): string[] {
  if (!key) return [];
  return getProfileFields().find(f => f.key === key)?.values || [];
}

/** Значение поля у сотрудника в виде строки. */
export function employeeValue(emp: Employee, key: string): string {
  const v = emp[key];
  return Array.isArray(v) ? v.join(', ') : String(v ?? '');
}

export const firstName = (fullName: string) => fullName.split(' ')[1] || fullName;

// ── Команда платформы (кураторы) ──────────────────────────────────────────────

export interface TeamMember {
  id: number; initials: string; name: string; dept: string; div: string;
  sysRole: 'Администратор' | 'Куратор' | 'Руководитель';
}

export const TEAM: TeamMember[] = [
  { id: 1, initials: 'АС', name: 'Смирнов Алексей Иванович',      dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', sysRole: 'Администратор' },
  { id: 2, initials: 'МВ', name: 'Волкова Мария Сергеевна',       dept: 'Маркетинг',                div: 'PR и коммуникации', sysRole: 'Куратор' },
  { id: 3, initials: 'ДТ', name: 'Тарасов Дмитрий Андреевич',     dept: 'Служба поддержки',         div: 'Первая линия',      sysRole: 'Куратор' },
  { id: 4, initials: 'ЕК', name: 'Кузнецова Елена Александровна', dept: 'HR',                       div: 'Подбор персонала',  sysRole: 'Куратор' },
  { id: 5, initials: 'ТИ', name: 'Ибрагимов Тимур Бахтиярович',   dept: 'IT',                       div: 'Разработка ПО',     sysRole: 'Куратор' },
  { id: 6, initials: 'ОС', name: 'Сидорова Ольга Петровна',       dept: 'Финансы',                  div: 'Бухгалтерия',       sysRole: 'Куратор' },
  { id: 7, initials: 'АМ', name: 'Махмудов Алишер Рустамович',    dept: 'Руководство',              div: 'Совет директоров',  sysRole: 'Администратор' },
];

export const CURATORS = TEAM.filter(m => m.sysRole === 'Куратор');
