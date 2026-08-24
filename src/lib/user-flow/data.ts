// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — КАТАЛОГ КОНТЕНТА И ЗАГОТОВКИ
//
// Данные о сотрудниках, полях профиля и каналах живут в src/lib/platform/*.
// Здесь только то, что относится к контенту платформы и текстам уведомлений.
//
// ELEMENT_TREE повторяет разделы платформы: Курсы, Тестирование, Опросы,
// Мероприятия. В проде заменяется запросом к каталогу — форма узла не меняется.
// ═══════════════════════════════════════════════════════════════════════════════

import { ContentRef, DelayUnit } from './types';

// ── Каталог контента ──────────────────────────────────────────────────────────

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
                ],
              },
            ],
          },
        ],
      },
      { id: 'folder-f2', type: 'folder', title: 'Compliance & Legal', color: 'text-purple-500', children: [] },
      {
        id: 'c-821', type: 'course', title: 'Основы корпоративной безопасности', titleUz: 'Korporativ xavfsizlik asoslari',
        children: [
          {
            id: 'm-1', type: 'module', title: 'Введение в корпоративную безопасность',
            children: [
              { id: 'l-1', type: 'lesson',   title: 'Что такое корпоративная безопасность', titleUz: 'Korporativ xavfsizlik nima' },
              { id: 'l-2', type: 'homework', title: 'Основные угрозы и риски', titleUz: 'Asosiy tahdidlar va xavflar' },
              { id: 't-1', type: 'test',     title: 'Тест: Основные понятия', titleUz: 'Test: Asosiy tushunchalar' },
            ],
          },
          {
            id: 'm-2', type: 'module', title: 'Защита информации',
            children: [
              { id: 'l-3', type: 'lesson',   title: 'Классификация информации', titleUz: 'Axborot tasnifi' },
              { id: 'l-4', type: 'lesson',   title: 'Методы защиты данных', titleUz: 'Ma\'lumotlarni himoya qilish usullari' },
              { id: 'l-5', type: 'homework', title: 'Шифрование и VPN', titleUz: 'Shifrlash va VPN' },
              { id: 't-2', type: 'test',     title: 'Тест: Защита данных', titleUz: 'Test: Ma\'lumotlar himoyasi' },
            ],
          },
          {
            id: 'm-3', type: 'module', title: 'Физическая безопасность',
            children: [
              { id: 'l-6', type: 'lesson', title: 'Контроль доступа в здание', titleUz: 'Binoga kirishni nazorat qilish' },
              { id: 'l-7', type: 'lesson', title: 'Видеонаблюдение и мониторинг', titleUz: 'Videokuzatuv va monitoring' },
            ],
          },
        ],
      },
      {
        id: 'c-724', type: 'course', title: 'Введение в управление проектами', titleUz: 'Loyiha boshqaruviga kirish',
        children: [
          {
            id: 'm-10', type: 'module', title: 'Основы проектного управления',
            children: [
              { id: 'l-20', type: 'lesson',   title: 'Жизненный цикл проекта', titleUz: 'Loyiha hayotiy sikli' },
              { id: 'l-21', type: 'homework', title: 'Роли в проектной команде', titleUz: 'Loyiha jamoasidagi rollar' },
            ],
          },
        ],
      },
      {
        id: 'c-612', type: 'course', title: 'Дизайн-системы в Figma', titleUz: 'Figma\'da dizayn-tizimlar',
        children: [{ id: 'm-20', type: 'module', title: 'Фундамент дизайн-системы', children: [
          { id: 'l-30', type: 'lesson', title: 'Что такое дизайн-система?', titleUz: 'Dizayn-tizim nima?' },
        ] }],
      },
      {
        id: 'c-509', type: 'course', title: 'Английский язык (Средний уровень)', titleUz: 'Ingliz tili (O\'rta daraja)',
        children: [{ id: 'm-30', type: 'module', title: 'Grammar Essentials', children: [
          { id: 'l-40', type: 'lesson', title: 'Tenses Overview' },
        ] }],
      },
    ],
  },
  {
    id: 'sec-testing', type: 'section', title: 'Тестирование',
    children: [
      { id: 'tst-1', type: 'test', title: 'Ежегодная аттестация', titleUz: 'Yillik attestatsiya' },
      { id: 'tst-2', type: 'test', title: 'Тест по информационной безопасности', titleUz: 'Axborot xavfsizligi bo\'yicha test' },
      { id: 'tst-3', type: 'test', title: 'Тест: Охрана труда', titleUz: 'Test: Mehnat muhofazasi' },
    ],
  },
  {
    id: 'sec-surveys', type: 'section', title: 'Опросы',
    children: [
      { id: 'srv-1', type: 'survey', title: 'Опрос удовлетворённости сотрудников', titleUz: 'Xodimlar qoniqish so\'rovi' },
      { id: 'srv-2', type: 'survey', title: 'Оценка качества обучения', titleUz: 'O\'qitish sifatini baholash' },
      { id: 'srv-3', type: 'survey', title: 'Обратная связь по курсу', titleUz: 'Kurs bo\'yicha fikr-mulohaza' },
    ],
  },
  {
    id: 'sec-events', type: 'section', title: 'Мероприятия',
    children: [
      { id: 'evt-1', type: 'event', title: 'Вебинар: Новые стандарты безопасности', titleUz: 'Vebinar: Yangi xavfsizlik standartlari' },
      { id: 'evt-2', type: 'event', title: 'Тренинг по оказанию первой помощи', titleUz: 'Birinchi yordam bo\'yicha trening' },
      { id: 'evt-3', type: 'event', title: 'Конференция EdTech 2026', titleUz: 'EdTech 2026 konferensiyasi' },
    ],
  },
];

/** Типы, которые можно назначить сотруднику. */
export const SELECTABLE_TYPES = new Set(['course', 'lesson', 'homework', 'test', 'survey', 'event']);

export const CONTENT_TYPE_LABEL: Record<string, string> = {
  folder: 'Папка', course: 'Курс', module: 'Модуль', lesson: 'Урок',
  homework: 'Урок с ДЗ', test: 'Тест', survey: 'Опрос', event: 'Мероприятие',
};

/** Как называется факт прохождения — разный для разных типов. */
export function completionLabel(type?: string): string {
  switch (type) {
    case 'course':   return 'Курс пройден';
    case 'lesson':
    case 'homework': return 'Урок пройден';
    case 'test':     return 'Тест пройден';
    case 'survey':   return 'Опрос пройден';
    case 'event':    return 'Мероприятие посещено';
    default:         return 'Элемент пройден';
  }
}

export const contentTitle = (c: ContentRef | undefined, uz: boolean) =>
  (uz && c?.titleUz) ? c.titleUz : (c?.title || '');

/** Плоский список всех назначаемых элементов — для поиска и подстановок. */
export function flattenCatalog(): ContentRef[] {
  const out: ContentRef[] = [];
  const walk = (n: ElementNode) => {
    if (SELECTABLE_TYPES.has(n.type)) out.push({ id: n.id, title: n.title, titleUz: n.titleUz, type: n.type });
    n.children?.forEach(walk);
  };
  ELEMENT_TREE.forEach(walk);
  return out;
}

// ── Заготовки текстов уведомлений ─────────────────────────────────────────────
// Шаблон только ВСТАВЛЯЕТ текст — дальше он свободно правится.

export const NOTIFY_TEMPLATES = [
  { id: 'tpl-welcome',  title: 'Приветствие',
    text:   '{имя}, добро пожаловать в команду! Ваш план адаптации уже готов на платформе.',
    textUz: '{имя}, jamoamizga xush kelibsiz! Moslashuv rejangiz platformada tayyor.' },
  { id: 'tpl-assigned', title: 'Назначено обучение',
    text:   '{имя}, вам назначен «{обучение}». Срок прохождения — до {дедлайн}.',
    textUz: '{имя}, sizga «{обучение}» tayinlandi. Muddat — {дедлайн} gacha.' },
  { id: 'tpl-reminder', title: 'Напоминание о сроке',
    text:   '{имя}, напоминаем: «{обучение}» нужно завершить до {дедлайн}.',
    textUz: '{имя}, eslatma: «{обучение}» {дедлайн} gacha yakunlanishi kerak.' },
  { id: 'tpl-passed',   title: 'Поздравление с этапом',
    text:   '{имя}, поздравляем — «{обучение}» пройден! Впереди следующий шаг.',
    textUz: '{имя}, tabriklaymiz — «{обучение}» o\'tildi! Oldinda keyingi qadam.' },
  { id: 'tpl-failed',   title: 'Этап не пройден',
    text:   '{имя}, «{обучение}» не пройден. Свяжитесь с куратором {куратор} для пересдачи.',
    textUz: '{имя}, «{обучение}» o\'tilmadi. Qayta topshirish uchun kurator {куратор} bilan bog\'laning.' },
  { id: 'tpl-curator',  title: 'Куратору: новый подопечный',
    text:   'Вам назначен новый сотрудник на адаптацию: {имя} ({отдел}).',
    textUz: 'Sizga moslashuv uchun yangi xodim tayinlandi: {имя} ({отдел}).' },
  { id: 'tpl-manager',  title: 'Руководителю: статус',
    text:   'Сотрудник {имя} завершил «{обучение}» в рамках адаптации.',
    textUz: 'Xodim {имя} moslashuv doirasida «{обучение}» ni yakunladi.' },
  { id: 'tpl-finish',   title: 'Сценарий завершён',
    text:   '{имя}, адаптация успешно завершена. Отличная работа!',
    textUz: '{имя}, moslashuv muvaffaqiyatli yakunlandi. Ajoyib ish!' },
];

export const NOTIFY_VARIABLES = [
  { token: '{имя}',      hint: 'Имя сотрудника' },
  { token: '{обучение}', hint: 'Последний назначенный элемент' },
  { token: '{дедлайн}',  hint: 'Дата, до которой нужно пройти' },
  { token: '{куратор}',  hint: 'Назначенный куратор' },
  { token: '{отдел}',    hint: 'Отдел сотрудника' },
];

// ── Время ─────────────────────────────────────────────────────────────────────

export const DELAY_UNITS: { value: DelayUnit; label: string; short: string; ms: number }[] = [
  { value: 'min',  label: 'минут', short: 'мин', ms: 60_000 },
  { value: 'hour', label: 'часов', short: 'ч',   ms: 3_600_000 },
  { value: 'day',  label: 'дней',  short: 'дн',  ms: 86_400_000 },
];

export const delayShort = (u: DelayUnit) => DELAY_UNITS.find(x => x.value === u)?.short || u;

export const QUICK_PAUSES: { value: number; unit: DelayUnit; label: string }[] = [
  { value: 1,  unit: 'hour', label: '1 час' },
  { value: 1,  unit: 'day',  label: '1 день' },
  { value: 3,  unit: 'day',  label: '3 дня' },
  { value: 7,  unit: 'day',  label: 'неделя' },
  { value: 14, unit: 'day',  label: '2 недели' },
  { value: 30, unit: 'day',  label: 'месяц' },
];

export const DEADLINE_QUICK = [3, 7, 14, 30];

/** Длительность паузы в днях — для оценки общего срока сценария. */
export function pauseInDays(value?: number, unit?: DelayUnit): number {
  if (!value || !unit) return 0;
  const u = DELAY_UNITS.find(x => x.value === unit);
  return u ? (value * u.ms) / 86_400_000 : 0;
}

export const SCHEDULE_FREQ = [
  { value: 'daily',   label: 'Каждый день' },
  { value: 'weekly',  label: 'Каждую неделю' },
  { value: 'monthly', label: 'Каждый месяц' },
] as const;

export const SCHEDULE_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const SCHEDULE_TIMES = ['08:00', '09:00', '10:00', '12:00', '15:00', '18:00'];

// ── События запуска ───────────────────────────────────────────────────────────

export const START_EVENTS = [
  { value: 'new_employee', label: 'Сотрудник появился на платформе', desc: 'Как только человек заведён и подходит под условия' },
  { value: 'manual',       label: 'Запускаю вручную',                 desc: 'Администратор выбирает людей и запускает сам' },
  { value: 'transfer',     label: 'Сменились должность или отдел',    desc: 'Нужен журнал изменений профиля' },
  { value: 'schedule',     label: 'По расписанию',                    desc: 'Повторяющийся запуск в заданное время' },
] as const;

export const startEventLabel = (v?: string) =>
  START_EVENTS.find(e => e.value === v)?.label || '';
