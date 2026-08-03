// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM DATA — mirrors real data across org-admin
//   ORG structure  → src/app/users/page.tsx (mockUsers) + settings priorityFields
//   TEAM           → src/app/team/page.tsx (initialTeamUsers)
//   ELEMENT_TREE   → src/components/modals/AddElementModal.tsx (+ UZ titles)
//   Notify channels→ src/app/tools/page.tsx (Уведомления: push, Telegram, SMS)
// Контент и уведомления двуязычные: RU — основной, UZ — параллельная версия.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Content catalog ────────────────────────────────────────────────────────────

export interface ElementNode {
  id: string;
  type: 'section' | 'folder' | 'course' | 'module' | 'lesson' | 'test' | 'homework' | 'survey' | 'event';
  title: string;
  titleUz?: string;
  children?: ElementNode[];
  color?: string;
}

export const ELEMENT_TREE: ElementNode[] = [
  {
    id: 'sec-courses', type: 'section', title: 'Курсы',
    children: [
      {
        id: 'folder-f1', type: 'folder', title: 'Onboarding 2026', color: 'text-blue-500',
        children: [
          { id: 'folder-f3', type: 'folder', title: 'IT & Security Core', color: 'text-yellow-500', children: [] },
          {
            id: 'c-990', type: 'course', title: 'Welcome Day: Знакомство с компанией', titleUz: 'Welcome Day: Kompaniya bilan tanishuv',
            children: [
              {
                id: 'm-990-1', type: 'module', title: 'Первый день',
                children: [
                  { id: 'l-990-1', type: 'lesson', title: 'Добро пожаловать!', titleUz: 'Xush kelibsiz!' },
                  { id: 'l-990-2', type: 'lesson', title: 'Структура компании', titleUz: 'Kompaniya tuzilmasi' },
                ]
              }
            ]
          }
        ]
      },
      { id: 'folder-f2', type: 'folder', title: 'Compliance & Legal', color: 'text-purple-500', children: [] },
      {
        id: 'c-821', type: 'course', title: 'Основы корпоративной безопасности', titleUz: 'Korporativ xavfsizlik asoslari',
        children: [
          {
            id: 'm-1', type: 'module', title: 'Введение в корпоративную безопасность',
            children: [
              { id: 'l-1', type: 'lesson', title: 'Что такое корпоративная безопасность', titleUz: 'Korporativ xavfsizlik nima' },
              { id: 'l-2', type: 'homework', title: 'Основные угрозы и риски', titleUz: 'Asosiy tahdidlar va xavflar' },
              { id: 't-1', type: 'test', title: 'Тест: Основные понятия', titleUz: 'Test: Asosiy tushunchalar' },
            ]
          },
          {
            id: 'm-2', type: 'module', title: 'Защита информации',
            children: [
              { id: 'l-3', type: 'lesson', title: 'Классификация информации', titleUz: 'Axborot tasnifi' },
              { id: 'l-4', type: 'lesson', title: 'Методы защиты данных', titleUz: 'Ma\'lumotlarni himoya qilish usullari' },
              { id: 'l-5', type: 'homework', title: 'Шифрование и VPN', titleUz: 'Shifrlash va VPN' },
              { id: 't-2', type: 'test', title: 'Тест: Защита данных', titleUz: 'Test: Ma\'lumotlar himoyasi' },
            ]
          },
          {
            id: 'm-3', type: 'module', title: 'Физическая безопасность',
            children: [
              { id: 'l-6', type: 'lesson', title: 'Контроль доступа в здание', titleUz: 'Binoga kirishni nazorat qilish' },
              { id: 'l-7', type: 'lesson', title: 'Видеонаблюдение и мониторинг', titleUz: 'Videokuzatuv va monitoring' },
            ]
          }
        ]
      },
      {
        id: 'c-724', type: 'course', title: 'Введение в управление проектами', titleUz: 'Loyiha boshqaruviga kirish',
        children: [
          {
            id: 'm-10', type: 'module', title: 'Основы проектного управления',
            children: [
              { id: 'l-20', type: 'lesson', title: 'Жизненный цикл проекта', titleUz: 'Loyiha hayotiy sikli' },
              { id: 'l-21', type: 'homework', title: 'Роли в проектной команде', titleUz: 'Loyiha jamoasidagi rollar' },
            ]
          }
        ]
      },
      {
        id: 'c-612', type: 'course', title: 'Дизайн-системы в Figma', titleUz: 'Figma\'da dizayn-tizimlar',
        children: [{ id: 'm-20', type: 'module', title: 'Фундамент дизайн-системы', children: [{ id: 'l-30', type: 'lesson', title: 'Что такое дизайн-система?', titleUz: 'Dizayn-tizim nima?' }] }]
      },
      {
        id: 'c-509', type: 'course', title: 'Английский язык (Средний уровень)', titleUz: 'Ingliz tili (O\'rta daraja)',
        children: [{ id: 'm-30', type: 'module', title: 'Grammar Essentials', children: [{ id: 'l-40', type: 'lesson', title: 'Tenses Overview' }] }]
      }
    ]
  },
  {
    id: 'sec-testing', type: 'section', title: 'Тестирование',
    children: [
      { id: 'tst-1', type: 'test', title: 'Ежегодная аттестация', titleUz: 'Yillik attestatsiya' },
      { id: 'tst-2', type: 'test', title: 'Тест по информационной безопасности', titleUz: 'Axborot xavfsizligi bo\'yicha test' },
      { id: 'tst-3', type: 'test', title: 'Тест: Охрана труда', titleUz: 'Test: Mehnat muhofazasi' },
    ]
  },
  {
    id: 'sec-surveys', type: 'section', title: 'Опросы',
    children: [
      { id: 'srv-1', type: 'survey', title: 'Опрос удовлетворённости сотрудников', titleUz: 'Xodimlar qoniqish so\'rovi' },
      { id: 'srv-2', type: 'survey', title: 'Оценка качества обучения', titleUz: 'O\'qitish sifatini baholash' },
      { id: 'srv-3', type: 'survey', title: 'Обратная связь по курсу', titleUz: 'Kurs bo\'yicha fikr-mulohaza' },
    ]
  },
  {
    id: 'sec-events', type: 'section', title: 'Мероприятия',
    children: [
      { id: 'evt-1', type: 'event', title: 'Вебинар: Новые стандарты безопасности', titleUz: 'Vebinar: Yangi xavfsizlik standartlari' },
      { id: 'evt-2', type: 'event', title: 'Тренинг по оказанию первой помощи', titleUz: 'Birinchi yordam bo\'yicha trening' },
      { id: 'evt-3', type: 'event', title: 'Конференция EdTech 2026', titleUz: 'EdTech 2026 konferensiyasi' },
    ]
  }
];

// ── Org structure (single source: user profile priority fields) ───────────────
// В проде списки берутся из справочников платформы и могут содержать сотни
// значений — UI работает с ними через поиск и ограничение вывода.

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
    'Руководитель отдела', 'PR-менеджер', 'Специалист поддержки', 'HR Бизнес-партнер',
    'Frontend Разработчик', 'Главный бухгалтер', 'Операционный директор',
    'Менеджер по логистике', 'Старший менеджер', 'Data Analyst',
  ],
  statuses: ['Работает', 'Отпуск', 'Уволен'],
  languages: ['RU', 'UZ'],
};

export const ALL_DIVISIONS = ORG.departments.flatMap(d => d.divisions);

// Employee profile fields available in conditions / switch — mirror settings.priorityFields
export const EMPLOYEE_FIELDS = [
  { value: 'branch', label: 'Филиал' },
  { value: 'dept',   label: 'Департамент' },
  { value: 'div',    label: 'Отдел' },
  { value: 'role',   label: 'Должность' },
  { value: 'status', label: 'Статус' },
  { value: 'lang',   label: 'Язык' },
] as const;

export type EmployeeFieldKey = typeof EMPLOYEE_FIELDS[number]['value'];

export function getFieldValues(field: EmployeeFieldKey | undefined): string[] {
  switch (field) {
    case 'branch': return ORG.branches;
    case 'dept':   return ORG.departments.map(d => d.name);
    case 'div':    return ALL_DIVISIONS;
    case 'role':   return ORG.positions;
    case 'status': return ORG.statuses;
    case 'lang':   return ORG.languages;
    default:       return [];
  }
}

// ── Employees (mirror mockUsers, users/page.tsx) — used by simulation ─────────

export interface Employee {
  id: number; initials: string; name: string;
  branch: string; dept: string; div: string; role: string; status: string; lang: 'RU' | 'UZ';
  [key: string]: string | number;
}

export const EMPLOYEES: Employee[] = [
  { id: 1,  initials: 'АС', name: 'Смирнов Алексей Иванович',      branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Руководитель отдела',    status: 'Работает', lang: 'RU' },
  { id: 2,  initials: 'МВ', name: 'Волкова Мария Сергеевна',       branch: 'Ташкент (ГК)', dept: 'Маркетинг',                div: 'PR и коммуникации', role: 'PR-менеджер',            status: 'Работает', lang: 'RU' },
  { id: 3,  initials: 'ДТ', name: 'Тарасов Дмитрий Андреевич',     branch: 'Самарканд',    dept: 'Служба поддержки',         div: 'Первая линия',      role: 'Специалист поддержки',   status: 'Отпуск',   lang: 'RU' },
  { id: 4,  initials: 'ЕК', name: 'Кузнецова Елена Александровна', branch: 'Ташкент (ГК)', dept: 'HR',                       div: 'Подбор персонала',  role: 'HR Бизнес-партнер',      status: 'Работает', lang: 'RU' },
  { id: 5,  initials: 'ТИ', name: 'Ибрагимов Тимур Бахтиярович',   branch: 'Бухара',       dept: 'IT',                       div: 'Разработка ПО',     role: 'Frontend Разработчик',   status: 'Работает', lang: 'UZ' },
  { id: 6,  initials: 'ОС', name: 'Сидорова Ольга Петровна',       branch: 'Ташкент (ГК)', dept: 'Финансы',                  div: 'Бухгалтерия',       role: 'Главный бухгалтер',      status: 'Работает', lang: 'RU' },
  { id: 7,  initials: 'АМ', name: 'Махмудов Алишер Рустамович',    branch: 'Ташкент (ГК)', dept: 'Руководство',              div: 'Совет директоров',  role: 'Операционный директор',  status: 'Работает', lang: 'UZ' },
  { id: 8,  initials: 'ИН', name: 'Новикова Ирина Владимировна',   branch: 'Фергана',      dept: 'Логистика',                div: 'Складской учет',    role: 'Менеджер по логистике',  status: 'Уволен',   lang: 'RU' },
  { id: 9,  initials: 'РК', name: 'Каримов Рустам Маратович',      branch: 'Самарканд',    dept: 'Коммерческий департамент', div: 'Отдел продаж B2C',  role: 'Старший менеджер',       status: 'Работает', lang: 'UZ' },
  { id: 10, initials: 'СЛ', name: 'Лебедева Светлана Сергеевна',   branch: 'Ташкент (ГК)', dept: 'Продуктовая аналитика',    div: 'Аналитика',         role: 'Data Analyst',           status: 'Работает', lang: 'RU' },
];

// ── Team (mirror initialTeamUsers, team/page.tsx) — curator assignment ─────────

export interface TeamMember {
  id: number; initials: string; name: string; dept: string; div: string; sysRole: 'Администратор' | 'Куратор' | 'Руководитель';
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

// ── Notifications ──────────────────────────────────────────────────────────────

export const NOTIFY_CHANNELS = [
  { value: 'push',     label: 'Push' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'email',    label: 'Email' },
  { value: 'sms',      label: 'SMS' },
] as const;

export const NOTIFY_RECIPIENTS = [
  { value: 'employee', label: 'Сотрудник',           desc: 'Участник флоу' },
  { value: 'curator',  label: 'Куратор',             desc: 'Назначенный куратор' },
  { value: 'manager',  label: 'Руководитель отдела', desc: 'Руководитель сотрудника' },
  { value: 'hr',       label: 'HR',                  desc: 'HR Бизнес-партнер' },
] as const;

// Шаблоны — заготовки: после выбора текст копируется в ноду и редактируется.
// Плейсхолдеры {имя}, {контент}, {дедлайн}, {куратор}, {отдел} едины для RU и UZ.
export const NOTIFY_TEMPLATES = [
  { id: 'tpl-welcome',  title: 'Приветствие',
    text: '{имя}, добро пожаловать в команду! Ваш план адаптации уже готов на платформе.',
    textUz: '{имя}, jamoamizga xush kelibsiz! Moslashuv rejangiz platformada tayyor.' },
  { id: 'tpl-assigned', title: 'Назначен контент',
    text: '{имя}, вам назначен «{контент}». Срок прохождения — до {дедлайн}.',
    textUz: '{имя}, sizga «{контент}» tayinlandi. Muddat — {дедлайн} gacha.' },
  { id: 'tpl-reminder', title: 'Напоминание о сроке',
    text: '{имя}, напоминаем: «{контент}» нужно завершить до {дедлайн}.',
    textUz: '{имя}, eslatma: «{контент}» {дедлайн} gacha yakunlanishi kerak.' },
  { id: 'tpl-passed',   title: 'Поздравление с этапом',
    text: '{имя}, поздравляем — этап «{контент}» успешно пройден! Впереди следующий шаг.',
    textUz: '{имя}, tabriklaymiz — «{контент}» bosqichi muvaffaqiyatli o\'tildi! Oldinda keyingi qadam.' },
  { id: 'tpl-failed',   title: 'Этап не пройден',
    text: '{имя}, «{контент}» не пройден. Свяжитесь с куратором {куратор} для пересдачи.',
    textUz: '{имя}, «{контент}» o\'tilmadi. Qayta topshirish uchun kurator {куратор} bilan bog\'laning.' },
  { id: 'tpl-curator',  title: 'Куратору: новый подопечный',
    text: 'Вам назначен новый сотрудник на адаптацию: {имя} ({отдел}).',
    textUz: 'Sizga moslashuv uchun yangi xodim tayinlandi: {имя} ({отдел}).' },
  { id: 'tpl-manager',  title: 'Руководителю: статус',
    text: 'Сотрудник {имя} завершил этап «{контент}» в рамках онбординга.',
    textUz: 'Xodim {имя} onbording doirasida «{контент}» bosqichini yakunladi.' },
  { id: 'tpl-finish',   title: 'Онбординг завершён',
    text: '{имя}, онбординг успешно завершён. Отличная работа!',
    textUz: '{имя}, onbording muvaffaqiyatli yakunlandi. Ajoyib ish!' },
];

export const NOTIFY_VARIABLES = ['{имя}', '{контент}', '{дедлайн}', '{куратор}', '{отдел}'];

// ── Time units & quick presets (значения вводятся вручную) ────────────────────

export const DELAY_UNITS = [
  { value: 'sec',  label: 'сек' },
  { value: 'min',  label: 'мин' },
  { value: 'hour', label: 'час' },
  { value: 'day',  label: 'дн' },
] as const;

export type DelayUnit = typeof DELAY_UNITS[number]['value'];

export const QUICK_DELAYS: { value: number; unit: DelayUnit; label: string }[] = [
  { value: 30, unit: 'min',  label: '30 мин' },
  { value: 1,  unit: 'hour', label: '1 час' },
  { value: 12, unit: 'hour', label: '12 часов' },
  { value: 1,  unit: 'day',  label: '1 день' },
  { value: 3,  unit: 'day',  label: '3 дня' },
  { value: 7,  unit: 'day',  label: '7 дней' },
];

export const DEADLINE_QUICK = [3, 7, 14, 30];

export const SCHEDULE_FREQ = [
  { value: 'daily',   label: 'Каждый день' },
  { value: 'weekly',  label: 'Каждую неделю' },
  { value: 'monthly', label: 'Каждый месяц' },
];

export const SCHEDULE_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const SCHEDULE_TIMES = ['08:00', '09:00', '10:00', '12:00', '15:00', '18:00'];

export const TRIGGER_OPTIONS = [
  { value: 'new_employee', label: 'Новый сотрудник',  desc: 'При добавлении сотрудника в систему' },
  { value: 'transfer',     label: 'Перевод сотрудника', desc: 'При смене должности или отдела' },
  { value: 'manual',       label: 'Ручной запуск',     desc: 'Администратор запускает вручную' },
  { value: 'schedule',     label: 'По расписанию',     desc: 'Повторяющийся запуск по времени' },
];
