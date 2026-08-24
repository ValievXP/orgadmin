// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — БИБЛИОТЕКА СЦЕНАРИЕВ
//
// ВАЖНО: шаблон описывает ФОРМУ сценария, а не его содержимое.
// У каждой организации свои курсы, филиалы, департаменты и статусы, поэтому
// зашивать «Welcome Day» или «Ташкент (ГК)» в шаблон нельзя — в чужой системе
// таких значений просто нет.
//
// Вместо этого шаблон объявляет «места» (slots): какое обучение назначить,
// по какому признаку разделить людей, кому всё это адресовано. Значения
// подставляет пользователь при создании — из справочников СВОЕЙ организации.
// Что не заполнили — останется пустым шагом с пометкой «нужно заполнить».
// ═══════════════════════════════════════════════════════════════════════════════

import { Edge } from '@xyflow/react';
import {
  FlowNode, StepData, FlowSettings, DEFAULT_SETTINGS, ContentRef, AudienceRule,
} from './types';
import { buildEdge } from './graph';
import { NOTIFY_TEMPLATES } from './data';
import { Edition } from './editions';

// ── Что пользователь заполняет при создании ───────────────────────────────────

export interface ContentSlot {
  id: string;
  /** Вопрос пользователю — на его языке, без терминов */
  label: string;
  hint?: string;
}

export interface BranchSlot {
  label: string;
  hint?: string;
}

/** Ответы пользователя. Любое поле может остаться пустым. */
export interface TemplateFill {
  audience: AudienceRule[];
  content: Record<string, ContentRef | undefined>;
  branchField?: string;
  branchValues: string[];
}

export const emptyFill = (): TemplateFill => ({ audience: [], content: {}, branchValues: [] });

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  /** Из чего состоит — видно до создания */
  shape: string;
  edition: Edition | 'both';
  contentSlots: ContentSlot[];
  branchSlot?: BranchSlot;
  baseSettings?: Partial<FlowSettings>;
  build: (fill: TemplateFill) => { nodes: FlowNode[]; edges: Edge[] };
}

// ── Хелперы сборки ────────────────────────────────────────────────────────────

const node = (id: string, x: number, y: number, data: StepData): FlowNode =>
  ({ id, type: 'step', position: { x, y }, data });

const tpl = (id: string) => NOTIFY_TEMPLATES.find(t => t.id === id)!;

const notifyStep = (templateId: string, recipient = 'employee'): StepData => ({
  step: 'notify',
  recipient,
  channels: ['push'],
  templateId,
  textRu: tpl(templateId).text,
  textUz: tpl(templateId).textUz,
});

/** Шаг «Назначить обучение»: с выбранным элементом или пустой, но на своём месте. */
const contentStep = (item: ContentRef | undefined, deadlineDays = 7, mandatory = true): StepData => ({
  step: 'content',
  item,
  deadlineDays,
  mandatory,
  notifyOnAssign: true,
});

/** Шаг «Ожидание прохождения» — привязан к тому же элементу, что и назначение. */
const waitStep = (item: ContentRef | undefined, limitDays = 7): StepData => ({
  step: 'wait',
  waitMode: 'completion',
  waitItem: item,
  waitLimitDays: limitDays,
});

function linker(nodes: FlowNode[]) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  return (s: string, t: string, h?: string): Edge => buildEdge(s, t, h, byId.get(s)?.data);
}

/** Ветки развилки: выбранные значения плюс «остальные». */
const branchStep = (field: string | undefined, values: string[]): StepData => ({
  step: 'branch',
  branchField: field,
  branchValues: values,
  branchElse: true,
});

// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPLATES: FlowTemplate[] = [

  // ── 1. Адаптация новичка ────────────────────────────────────────────────────
  {
    id: 'tpl-onboarding',
    name: 'Адаптация новичка',
    description: 'Приветствие, первое обучение, напоминание тем, кто не успел, и опрос в конце.',
    shape: 'Уведомление → обучение → ожидание → опрос',
    edition: 'both',
    contentSlots: [
      { id: 'main',   label: 'Какое обучение назначаем новичку?', hint: 'Обычно вводный курс или знакомство с компанией' },
      { id: 'survey', label: 'Каким опросом закрываем адаптацию?', hint: 'Не обязательно — можно пропустить' },
    ],
    baseSettings: { startEvent: 'new_employee' },
    build: ({ content }) => {
      const main = content.main;
      const nodes: FlowNode[] = [
        node('start', 400, 0,    { step: 'start' }),
        node('n1',    400, 175,  notifyStep('tpl-welcome')),
        node('c1',    400, 350,  contentStep(main, 7)),
        node('w1',    400, 525,  waitStep(main, 7)),
        node('n2',    690, 720,  notifyStep('tpl-reminder')),
        node('p1',    690, 880,  { step: 'wait', waitMode: 'pause', pauseValue: 3, pauseUnit: 'day' }),
        node('sv',    150, 720,  contentStep(content.survey, 7, false)),
        node('end',   150, 900,  { step: 'end', endStatus: 'success', endNotifyHr: true }),
      ];
      const l = linker(nodes);
      return {
        nodes,
        edges: [
          l('start', 'n1'), l('n1', 'c1'), l('c1', 'w1'),
          l('w1', 'sv', 'done'), l('w1', 'n2', 'timeout'),
          l('n2', 'p1'), l('p1', 'w1'),
          l('sv', 'end'),
        ],
      };
    },
  },

  // ── 2. Разное обучение разным группам ───────────────────────────────────────
  {
    id: 'tpl-split',
    name: 'Разное обучение разным группам',
    description: 'Одна развилка делит людей по признаку профиля, каждая ветка получает своё обучение.',
    shape: 'Развилка → два обучения → общий финиш',
    edition: 'both',
    contentSlots: [
      { id: 'a',    label: 'Что назначаем первой группе?' },
      { id: 'b',    label: 'Что назначаем всем остальным?' },
    ],
    branchSlot: {
      label: 'По какому признаку делим людей?',
      hint: 'Например, по филиалу, департаменту или должности — что именно, решаете вы',
    },
    baseSettings: { startEvent: 'manual' },
    build: ({ content, branchField, branchValues }) => {
      const nodes: FlowNode[] = [
        node('start', 400, 0,   { step: 'start' }),
        node('br',    400, 190, branchStep(branchField, branchValues)),
        node('c1',    120, 430, contentStep(content.a, 14)),
        node('c2',    680, 430, contentStep(content.b, 14)),
        node('end',   400, 640, { step: 'end', endStatus: 'success' }),
      ];
      const l = linker(nodes);
      const first = branchValues[0];
      return {
        nodes,
        edges: [
          l('start', 'br'),
          ...(first ? [l('br', 'c1', `b-${first}`)] : []),
          l('br', 'c2', 'else'),
          l('c1', 'end'), l('c2', 'end'),
        ],
      };
    },
  },

  // ── 3. Серия напоминаний ────────────────────────────────────────────────────
  {
    id: 'tpl-reminders',
    name: 'Напоминания до прохождения',
    description: 'Назначаем обучение и напоминаем раз в неделю, пока человек его не закончит.',
    shape: 'Обучение → ожидание → напоминание по кругу',
    edition: 'both',
    contentSlots: [
      { id: 'main', label: 'О прохождении чего напоминаем?', hint: 'Курс, тест или мероприятие с дедлайном' },
    ],
    baseSettings: { startEvent: 'manual' },
    build: ({ content }) => {
      const main = content.main;
      const nodes: FlowNode[] = [
        node('start', 400, 0,   { step: 'start' }),
        node('c1',    400, 175, contentStep(main, 30)),
        node('w1',    400, 350, waitStep(main, 7)),
        node('n1',    700, 545, notifyStep('tpl-reminder')),
        node('p1',    700, 705, { step: 'wait', waitMode: 'pause', pauseValue: 7, pauseUnit: 'day' }),
        node('n2',    120, 545, notifyStep('tpl-passed')),
        node('end',   120, 715, { step: 'end', endStatus: 'success' }),
      ];
      const l = linker(nodes);
      return {
        nodes,
        edges: [
          l('start', 'c1'), l('c1', 'w1'),
          l('w1', 'n2', 'done'), l('w1', 'n1', 'timeout'),
          l('n1', 'p1'), l('p1', 'w1'), l('n2', 'end'),
        ],
      };
    },
  },

  // ── 4. Обратная связь после обучения ────────────────────────────────────────
  {
    id: 'tpl-feedback',
    name: 'Обратная связь после обучения',
    description: 'Через несколько дней после прохождения просим оценить обучение.',
    shape: 'Ожидание → пауза → опрос',
    edition: 'both',
    contentSlots: [
      { id: 'main',   label: 'После прохождения чего спрашиваем?' },
      { id: 'survey', label: 'Какой опрос отправляем?' },
    ],
    baseSettings: { startEvent: 'manual' },
    build: ({ content }) => {
      const nodes: FlowNode[] = [
        node('start', 400, 0,   { step: 'start' }),
        node('w1',    400, 175, waitStep(content.main, 30)),
        node('p1',    180, 380, { step: 'wait', waitMode: 'pause', pauseValue: 3, pauseUnit: 'day' }),
        node('sv',    180, 555, contentStep(content.survey, 7, false)),
        node('end',   180, 730, { step: 'end', endStatus: 'success' }),
        node('stop',  660, 380, { step: 'end', endStatus: 'aborted' }),
      ];
      const l = linker(nodes);
      return {
        nodes,
        edges: [
          l('start', 'w1'),
          l('w1', 'p1', 'done'), l('w1', 'stop', 'timeout'),
          l('p1', 'sv'), l('sv', 'end'),
        ],
      };
    },
  },

  // ── 5. Обязательное обучение с проверкой результата (Pro) ───────────────────
  {
    id: 'tpl-certification',
    name: 'Обучение с проверкой результата',
    description: 'Назначаем обучение, проверяем итоговый результат и разводим на «сдал» и «пересдача».',
    shape: 'Куратор → обучение → проверка результата → две ветки',
    edition: 'pro',
    contentSlots: [
      { id: 'main', label: 'Какое обучение проверяем?', hint: 'Лучше тест — по нему есть баллы' },
    ],
    baseSettings: { startEvent: 'manual', reentry: 'always' },
    build: ({ content }) => {
      const main = content.main;
      const nodes: FlowNode[] = [
        node('start', 400, 0,    { step: 'start' }),
        node('cu',    400, 175,  { step: 'curator', curatorMode: 'auto' }),
        node('c1',    400, 350,  contentStep(main, 30)),
        node('w1',    400, 525,  waitStep(main, 30)),
        node('ch',    160, 720,  main
          ? { step: 'check_result', checkItems: [main], checkField: 'completed', checkOperator: '=', checkValue: 'Пройдено' }
          : { step: 'check_result', checkItems: [] }),
        node('n1',    -60, 915,  notifyStep('tpl-passed')),
        node('n2',    360, 915,  notifyStep('tpl-failed', 'curator')),
        node('n3',    700, 720,  notifyStep('tpl-reminder', 'manager')),
        node('end',   -60, 1090, { step: 'end', endStatus: 'success', endNotifyHr: true }),
        node('stop',  360, 1090, { step: 'end', endStatus: 'aborted' }),
      ];
      const l = linker(nodes);
      return {
        nodes,
        edges: [
          l('start', 'cu'), l('cu', 'c1'), l('c1', 'w1'),
          l('w1', 'ch', 'done'), l('w1', 'n3', 'timeout'),
          l('ch', 'n1', 'yes'), l('ch', 'n2', 'no'),
          l('n1', 'end'), l('n2', 'stop'),
        ],
      };
    },
  },
];

export const templatesFor = (edition: Edition) =>
  TEMPLATES.filter(t => t.edition === 'both' || t.edition === edition);

export const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id);

/** Сколько мест в шаблоне нужно заполнить. */
export const slotCount = (t: FlowTemplate) =>
  t.contentSlots.length + (t.branchSlot ? 1 : 0);

export function settingsFor(t: FlowTemplate, fill: TemplateFill): FlowSettings {
  return { ...DEFAULT_SETTINGS, ...(t.baseSettings || {}), audience: fill.audience };
}

/** Пустой сценарий: только шаг «Запуск». */
export function emptyFlow(): { nodes: FlowNode[]; edges: Edge[] } {
  return { nodes: [node('start', 400, 0, { step: 'start' })], edges: [] };
}
