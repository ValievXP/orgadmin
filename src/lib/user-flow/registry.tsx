"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — РЕЕСТР ШАГОВ
//
// Один шаг — одно описание. Здесь лежит всё, что о шаге нужно знать системе:
// как он называется, чем заполняется по умолчанию, когда считается настроенным,
// что показывает на карточке, какие у него выходы и как выглядит его панель настроек.
//
// Добавить новый тип шага = дописать один объект в STEP_DEFS. Ни холст, ни
// валидация, ни проверка сценария при этом не меняются.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Zap, BookOpen, Bell, Clock, GitBranch, Flag, ClipboardCheck, UserCheck,
  AlertTriangle, Eye, Lock,
} from 'lucide-react';
import {
  Employee, getProfileFields, getFieldLabel, getFieldValues, employeeValue,
  firstName, CURATORS,
} from '@/lib/platform/profile';
import { NOTIFY_CHANNELS, NOTIFY_RECIPIENTS, channelLabel, recipientLabel } from '@/lib/platform/channels';
import {
  NOTIFY_TEMPLATES, NOTIFY_VARIABLES, DELAY_UNITS, delayShort, QUICK_PAUSES,
  DEADLINE_QUICK, CONTENT_TYPE_LABEL, completionLabel, contentTitle,
} from './data';
import { StepType, StepData, StepOutput, ContentRef, DelayUnit } from './types';
import { ADDABLE_STEPS } from './editions';
import {
  Field, OptionCard, Chips, SearchableChips, Stepper, Switch,
  ContentCard, PickButton, ContentPicker, UpstreamPicks, CONTENT_ICON,
} from './ui';

// ── Контракт панели настроек ──────────────────────────────────────────────────

export interface InspectorProps {
  data: StepData;
  update: (patch: Partial<StepData>) => void;
  /** Контент, назначенный выше по сценарию */
  upstream: ContentRef[];
  /** Кто попадает в сценарий — для предпросмотра и подсчётов */
  audience: Employee[];
  pro: boolean;
}

export interface StepDef {
  type: StepType;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Цветовая роль шага */
  tone: 'start' | 'action' | 'notify' | 'wait' | 'branch' | 'end' | 'pro';
  /** Единственный в сценарии и неудаляемый */
  unique?: boolean;
  defaults: () => StepData;
  isConfigured: (d: StepData) => boolean;
  /** Короткая строка под названием на карточке шага */
  summary: (d: StepData) => string;
  outputs: (d: StepData) => StepOutput[];
  Inspector?: React.FC<InspectorProps>;
}

export const STEP_TONE: Record<StepDef['tone'], { border: string; iconBg: string; iconText: string; handle: string }> = {
  start:  { border: 'border-emerald-300', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', handle: '!bg-emerald-500' },
  action: { border: 'border-blue-300',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    handle: '!bg-blue-500' },
  notify: { border: 'border-indigo-300',  iconBg: 'bg-indigo-100',  iconText: 'text-indigo-600',  handle: '!bg-indigo-500' },
  wait:   { border: 'border-amber-300',   iconBg: 'bg-amber-100',   iconText: 'text-amber-700',   handle: '!bg-amber-500' },
  branch: { border: 'border-violet-300',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  handle: '!bg-violet-500' },
  end:    { border: 'border-rose-300',    iconBg: 'bg-rose-100',    iconText: 'text-rose-600',    handle: '!bg-rose-500' },
  pro:    { border: 'border-sky-300',     iconBg: 'bg-sky-100',     iconText: 'text-sky-600',     handle: '!bg-sky-500' },
};

const SINGLE_OUT: StepOutput[] = [{ id: 'out', label: '', tone: 'neutral' }];

// ── Текст уведомления ─────────────────────────────────────────────────────────

export const notifyText = (d: StepData, lang: 'ru' | 'uz') =>
  (lang === 'uz' ? d.textUz : d.textRu) ?? '';

/** Подстановка переменных на конкретном сотруднике — то, что он реально увидит. */
export function renderMessage(d: StepData, emp: Employee | undefined, upstream: ContentRef[]): string {
  const uz = emp?.lang === 'UZ';
  const raw = uz ? (notifyText(d, 'uz') || notifyText(d, 'ru')) : notifyText(d, 'ru');
  const item = upstream[0];
  const deadline = new Date(Date.now() + 7 * 864e5).toLocaleDateString('ru-RU');
  return raw
    .replace(/\{имя\}/g, emp ? firstName(emp.name) : 'Имя')
    .replace(/\{обучение\}/g, contentTitle(item, uz) || 'обучение')
    .replace(/\{дедлайн\}/g, deadline)
    .replace(/\{куратор\}/g, CURATORS[0]?.name || 'куратор')
    .replace(/\{отдел\}/g, emp?.div || 'отдел');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПАНЕЛИ НАСТРОЕК
// ═══════════════════════════════════════════════════════════════════════════════

// ── Назначить обучение ────────────────────────────────────────────────────────

const ContentInspector: React.FC<InspectorProps> = ({ data: d, update, upstream }) => {
  const [picker, setPicker] = useState(false);
  return (
    <>
      <Field label="Что назначаем">
        {d.item
          ? <ContentCard item={d.item} onRemove={() => update({ item: undefined })} />
          : (
            <div className="flex flex-col gap-2">
              <UpstreamPicks items={upstream} exclude={new Set()} onPick={c => update({ item: c, deadlineDays: d.deadlineDays ?? 7 })} />
              <PickButton label="Выбрать из каталога" onClick={() => setPicker(true)} />
            </div>
          )}
      </Field>

      {d.item && (
        <>
          <Field label="Срок прохождения"
            hint="Считается от дня назначения. Эта же дата подставляется в переменную {дедлайн} в уведомлениях.">
            <Switch label="Без срока" checked={d.deadlineDays === 0}
              onChange={v => update({ deadlineDays: v ? 0 : 7 })} />
            {d.deadlineDays !== 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <Stepper value={d.deadlineDays} min={1} max={365} suffix="дней на прохождение"
                  onChange={v => update({ deadlineDays: v })} />
                <Chips options={DEADLINE_QUICK.map(v => `${v} дн.`)}
                  selected={d.deadlineDays ? [`${d.deadlineDays} дн.`] : []}
                  onToggle={l => update({ deadlineDays: Number(l.replace(' дн.', '')) })} />
              </div>
            )}
          </Field>

          <Field label="Как назначаем">
            <div className="flex flex-col gap-2">
              <Switch label="Обязательное" desc="Сотрудник не сможет отказаться от прохождения"
                checked={!!d.mandatory} onChange={v => update({ mandatory: v })} />
              <Switch label="Сообщить о назначении" desc="Короткое системное уведомление сразу после назначения"
                checked={!!d.notifyOnAssign} onChange={v => update({ notifyOnAssign: v })} />
            </div>
          </Field>
        </>
      )}

      <ContentPicker open={picker} onClose={() => setPicker(false)} title="Что назначить сотруднику"
        onSelect={el => update({ item: el, deadlineDays: d.deadlineDays ?? 7 })} />
    </>
  );
};

// ── Отправить уведомление ─────────────────────────────────────────────────────

const NotifyInspector: React.FC<InspectorProps> = ({ data: d, update, upstream, audience }) => {
  const [lang, setLang] = useState<'ru' | 'uz'>('ru');
  const areaRef = React.useRef<HTMLTextAreaElement>(null);

  const insert = (token: string) => {
    const cur = notifyText(d, lang);
    const ta = areaRef.current;
    const s = ta ? ta.selectionStart : cur.length;
    const e = ta ? ta.selectionEnd : cur.length;
    const next = cur.slice(0, s) + token + cur.slice(e);
    update(lang === 'ru' ? { textRu: next } : { textUz: next });
    setTimeout(() => { if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = s + token.length; } }, 0);
  };

  const toggleChannel = (v: string) => {
    const cur = d.channels || [];
    update({ channels: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] });
  };

  const uzEmpty = !notifyText(d, 'uz').trim();
  const uzCount = audience.filter(e => e.lang === 'UZ').length;

  // Предпросмотр можно проверить на любом сотруднике из аудитории — сообщение
  // на русском и на узбекском выглядит по-разному, и это должно быть видно.
  const [sampleId, setSampleId] = useState<number | null>(null);
  const sample = audience.find(e => e.id === sampleId) || audience[0];
  const preview = renderMessage(d, sample, upstream);

  return (
    <>
      <Field label="Кому отправляем">
        <div className="grid grid-cols-2 gap-2">
          {NOTIFY_RECIPIENTS.map(r => (
            <button key={r.value} type="button" onClick={() => update({ recipient: r.value })}
              className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                d.recipient === r.value
                  ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}>
              <p className="text-[12px] font-semibold text-neutral-800">{r.label}</p>
              <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">{r.desc}</p>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Каналы">
        <div className="flex flex-wrap gap-1.5">
          {NOTIFY_CHANNELS.map(c => {
            const on = (d.channels || []).includes(c.value);
            return (
              <button key={c.value} type="button" onClick={() => c.connected && toggleChannel(c.value)}
                disabled={!c.connected}
                title={c.connected ? undefined : c.setupHint}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                  !c.connected ? 'bg-neutral-50 text-neutral-300 cursor-not-allowed line-through'
                    : on ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}>
                {!c.connected && <Lock className="w-3 h-3" />}{c.label}
              </button>
            );
          })}
        </div>
        {NOTIFY_CHANNELS.some(c => !c.connected) && (
          <p className="text-[11.5px] text-neutral-400 leading-relaxed">
            {NOTIFY_CHANNELS.filter(c => !c.connected).map(c => c.setupHint).join('. ')}
          </p>
        )}
      </Field>

      <Field label="Текст сообщения"
        action={
          <div className="flex gap-1">
            {(['ru', 'uz'] as const).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                  lang === l ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        }>
        <textarea ref={areaRef} rows={4} value={notifyText(d, lang)}
          onChange={e => update(lang === 'ru' ? { textRu: e.target.value } : { textUz: e.target.value })}
          placeholder={lang === 'ru' ? 'Напишите текст или вставьте заготовку ниже…' : 'Matn yozing yoki quyidagi tayyor matnni qo\'ying…'}
          className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 leading-relaxed placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all" />

        <div className="flex flex-wrap gap-1.5">
          {NOTIFY_VARIABLES.map(v => (
            <button key={v.token} type="button" onClick={() => insert(v.token)} title={v.hint}
              className="px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-md text-[11px] font-semibold font-mono transition-colors">
              {v.token}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Готовые заготовки" hint="Вставляет текст сразу на двух языках. После вставки его можно свободно править.">
        <div className="flex flex-wrap gap-1.5">
          {NOTIFY_TEMPLATES.map(t => (
            <button key={t.id} type="button"
              onClick={() => update({ templateId: t.id, textRu: t.text, textUz: t.textUz })}
              className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                d.templateId === t.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}>
              {t.title}
            </button>
          ))}
        </div>
      </Field>

      {/* Предпросмотр — то, чего нельзя было увидеть до запуска */}
      {notifyText(d, 'ru').trim() && (
        <Field label="Как увидит сотрудник">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2 border-b border-neutral-200 bg-white">
              <Eye className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {sample ? (
                <select value={sample.id} onChange={e => setSampleId(Number(e.target.value))}
                  className="flex-1 min-w-0 bg-transparent text-[11.5px] font-semibold text-neutral-600 focus:outline-none cursor-pointer truncate">
                  {audience.map(e => (
                    <option key={e.id} value={e.id}>{e.name} · {e.lang}</option>
                  ))}
                </select>
              ) : (
                <p className="text-[11.5px] font-semibold text-neutral-500">Никто не попадает в аудиторию</p>
              )}
            </div>
            <p className="px-3.5 py-3 text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {preview || '—'}
            </p>
          </div>
          {uzEmpty && uzCount > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-800 leading-relaxed">
                Узбекский текст не заполнен — {uzCount} из {audience.length} сотрудников получат русскую версию.
              </p>
            </div>
          )}
        </Field>
      )}
    </>
  );
};

// ── Ожидание ──────────────────────────────────────────────────────────────────

const WaitInspector: React.FC<InspectorProps> = ({ data: d, update, upstream }) => {
  const [picker, setPicker] = useState(false);
  const mode = d.waitMode || 'pause';

  return (
    <>
      <Field label="Чего ждём">
        <div className="flex flex-col gap-2">
          <OptionCard title="Просто подождать" desc="Пауза перед следующим шагом"
            active={mode === 'pause'}
            onClick={() => update({ waitMode: 'pause', pauseValue: d.pauseValue ?? 3, pauseUnit: d.pauseUnit ?? 'day' })} />
          <OptionCard title="Дождаться прохождения" desc="Ждём, пока сотрудник закончит обучение. Появятся два продолжения: «Прошёл» и «Не успел»"
            active={mode === 'completion'}
            onClick={() => update({ waitMode: 'completion', waitLimitDays: d.waitLimitDays ?? 7 })} />
        </div>
      </Field>

      {mode === 'pause' && (
        <Field label="Сколько ждём">
          <div className="flex items-center gap-3 flex-wrap">
            <Stepper value={d.pauseValue} min={1} max={999}
              onChange={v => update({ pauseValue: v, pauseUnit: d.pauseUnit || 'day' })} />
            <div className="flex gap-1">
              {DELAY_UNITS.map(u => (
                <button key={u.value} type="button"
                  onClick={() => update({ pauseUnit: u.value, pauseValue: d.pauseValue ?? 1 })}
                  className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    d.pauseUnit === u.value ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}>
                  {u.short}
                </button>
              ))}
            </div>
          </div>
          <Chips options={QUICK_PAUSES.map(p => p.label)}
            selected={QUICK_PAUSES.filter(p => p.value === d.pauseValue && p.unit === d.pauseUnit).map(p => p.label)}
            onToggle={l => { const p = QUICK_PAUSES.find(x => x.label === l)!; update({ pauseValue: p.value, pauseUnit: p.unit }); }} />
        </Field>
      )}

      {mode === 'completion' && (
        <>
          <Field label="Что должен пройти"
            hint={!d.waitItem && upstream.length === 0 ? 'Соедините этот шаг с «Назначить обучение» — элемент подставится сам.' : undefined}>
            {d.waitItem
              ? (
                <div className="flex flex-col gap-2">
                  <ContentCard item={d.waitItem} onRemove={() => update({ waitItem: undefined })} />
                  <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[12px] font-semibold text-amber-800">
                    Ждём событие: {completionLabel(d.waitItem.type)}
                  </div>
                </div>
              )
              : (
                <div className="flex flex-col gap-2">
                  <UpstreamPicks items={upstream} exclude={new Set()} onPick={c => update({ waitItem: c, waitLimitDays: d.waitLimitDays ?? 7 })} />
                  <PickButton label="Выбрать из каталога" onClick={() => setPicker(true)} />
                </div>
              )}
          </Field>

          {d.waitItem && (
            <Field label="Сколько ждём максимум" hint="Если сотрудник не успеет за это время — сценарий пойдёт по ветке «Не успел».">
              <Switch label="Ждать сколько угодно" checked={d.waitLimitDays === 0}
                onChange={v => update({ waitLimitDays: v ? 0 : 7 })} />
              {d.waitLimitDays !== 0 && (
                <div className="mt-2">
                  <Stepper value={d.waitLimitDays} min={1} max={365} suffix="дней" onChange={v => update({ waitLimitDays: v })} />
                </div>
              )}
            </Field>
          )}
        </>
      )}

      <ContentPicker open={picker} onClose={() => setPicker(false)} title="Прохождение какого элемента ждём"
        onSelect={el => update({ waitItem: el, waitLimitDays: d.waitLimitDays ?? 7 })} />
    </>
  );
};

// ── Развилка ──────────────────────────────────────────────────────────────────

const BranchInspector: React.FC<InspectorProps> = ({ data: d, update, audience }) => {
  const fields = getProfileFields();
  const values = getFieldValues(d.branchField);
  const chosen = d.branchValues || [];
  const withElse = d.branchElse !== false;

  const countIn = (v: string) => audience.filter(e => employeeValue(e, d.branchField!) === v).length;
  const countElse = audience.filter(e => !chosen.includes(employeeValue(e, d.branchField!))).length;

  return (
    <>
      <Field label="По какому признаку делим" hint="Поля берутся из настроек профиля сотрудника.">
        <Chips options={fields.map(f => f.label)}
          selected={d.branchField ? [getFieldLabel(d.branchField)] : []}
          onToggle={l => update({ branchField: fields.find(f => f.label === l)!.key, branchValues: [] })}
          tone="violet" />
      </Field>

      {d.branchField && (
        <Field label="Ветки" hint="Каждое выбранное значение станет отдельным продолжением сценария.">
          <SearchableChips options={values} selected={chosen} tone="violet"
            onToggle={v => update({ branchValues: chosen.includes(v) ? chosen.filter(x => x !== v) : [...chosen, v] })} />
        </Field>
      )}

      {d.branchField && chosen.length > 0 && (
        <Field label="Что получится">
          <div className="flex flex-col gap-1.5">
            {chosen.map(v => (
              <div key={v} className="flex items-center gap-2.5 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                <span className="text-[12px] font-semibold text-neutral-700 flex-1 min-w-0 truncate">{v}</span>
                <span className="text-[11px] font-semibold text-violet-700 tabular-nums shrink-0">{countIn(v)} чел.</span>
              </div>
            ))}
            {withElse && (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                <span className="text-[12px] font-semibold text-neutral-500 flex-1">Все остальные</span>
                <span className="text-[11px] font-semibold text-neutral-500 tabular-nums shrink-0">{countElse} чел.</span>
              </div>
            )}
          </div>

          <Switch label="Ветка «Все остальные»"
            desc={withElse
              ? 'Кто не попал ни в одну ветку — пойдёт сюда'
              : 'Сейчас выключена: у кого другое значение, для того сценарий на этом закончится'}
            checked={withElse} onChange={v => update({ branchElse: v })} />
        </Field>
      )}
    </>
  );
};

// ── Финиш ─────────────────────────────────────────────────────────────────────

const EndInspector: React.FC<InspectorProps> = ({ data: d, update }) => (
  <>
    <Field label="Чем закончилось">
      <div className="flex flex-col gap-2">
        <OptionCard title="Успешно завершён" desc="Сотрудник прошёл сценарий до конца"
          active={d.endStatus === 'success'} onClick={() => update({ endStatus: 'success' })} />
        <OptionCard title="Прерван" desc="Сценарий остановлен, оставшиеся шаги не выполняются"
          active={d.endStatus === 'aborted'} onClick={() => update({ endStatus: 'aborted' })} />
      </div>
    </Field>
    <Field label="Кого известить">
      <Switch label="Сообщить HR о результате" desc="Уведомление уйдёт HR Бизнес-партнёру сотрудника"
        checked={!!d.endNotifyHr} onChange={v => update({ endNotifyHr: v })} />
    </Field>
  </>
);

// ── PRO: проверить результат ──────────────────────────────────────────────────

const CHECK_FIELDS = [
  { value: 'completed', label: 'Пройдено', types: ['course', 'lesson', 'homework', 'test', 'survey', 'event'] },
  { value: 'score',     label: 'Баллы за тест', types: ['test'] },
  { value: 'progress',  label: 'Прогресс курса (%)', types: ['course'] },
];

function checkFieldsFor(items?: ContentRef[]) {
  if (!items?.length) return [];
  const types = new Set(items.map(i => i.type));
  return CHECK_FIELDS.filter(f => f.types.some(t => types.has(t)));
}

const CheckResultInspector: React.FC<InspectorProps> = ({ data: d, update, upstream }) => {
  const [picker, setPicker] = useState(false);
  const items = d.checkItems || [];
  const fields = checkFieldsFor(items);
  const isBool = d.checkField === 'completed';

  return (
    <>
      <Field label="Что проверяем"
        hint={items.length === 0 && upstream.length === 0 ? 'Соедините шаг с «Назначить обучение» — элемент подставится сам.' : undefined}>
        <div className="flex flex-col gap-2">
          {items.map(it => (
            <ContentCard key={it.id} item={it}
              onRemove={() => update({ checkItems: items.filter(i => i.id !== it.id), checkField: undefined, checkValue: undefined })} />
          ))}
          <UpstreamPicks items={upstream} exclude={new Set(items.map(i => i.id))}
            onPick={c => update({ checkItems: [...items, c], checkField: undefined, checkValue: undefined })} />
          <PickButton label="Выбрать из каталога" onClick={() => setPicker(true)} />
        </div>
      </Field>

      {fields.length > 0 && (
        <Field label="Какой показатель">
          <Chips options={fields.map(f => f.label)}
            selected={d.checkField ? fields.filter(f => f.value === d.checkField).map(f => f.label) : []}
            onToggle={l => update({ checkField: fields.find(f => f.label === l)!.value, checkOperator: undefined, checkValue: undefined })}
            tone="indigo" />
        </Field>
      )}

      {items.length > 0 && d.checkField && (
        isBool ? (
          <Field label="Условие">
            <Chips options={['Пройдено', 'Не пройдено']} selected={d.checkValue ? [d.checkValue] : []}
              onToggle={v => update({ checkValue: v, checkOperator: '=' })} tone="indigo" />
          </Field>
        ) : (
          <>
            <Field label="Сравнение">
              <Chips options={['не меньше', 'меньше', 'ровно']}
                selected={d.checkOperator ? [{ '>=': 'не меньше', '<': 'меньше', '=': 'ровно' }[d.checkOperator] || ''] : []}
                onToggle={l => update({ checkOperator: { 'не меньше': '>=', 'меньше': '<', 'ровно': '=' }[l] })} tone="indigo" />
            </Field>
            <Field label="Значение">
              <Stepper value={d.checkValue ? Number(d.checkValue) : undefined} min={0}
                max={d.checkField === 'progress' ? 100 : 999}
                suffix={d.checkField === 'progress' ? '%' : 'баллов'}
                onChange={v => update({ checkValue: String(v) })} />
            </Field>
          </>
        )
      )}

      <ContentPicker open={picker} onClose={() => setPicker(false)} title="Результат какого обучения проверяем"
        onSelect={el => update({ checkItems: [...items, el], checkField: undefined, checkValue: undefined })} />
    </>
  );
};

// ── PRO: куратор ──────────────────────────────────────────────────────────────

const CuratorInspector: React.FC<InspectorProps> = ({ data: d, update }) => (
  <>
    <Field label="Как выбираем куратора">
      <div className="flex flex-col gap-2">
        <OptionCard title="Автоматически" desc="Куратор из того же департамента, что и сотрудник"
          active={d.curatorMode === 'auto'} onClick={() => update({ curatorMode: 'auto', curatorId: undefined })} />
        <OptionCard title="Конкретный человек" desc="Один куратор из раздела «Команда» для всех участников"
          active={d.curatorMode === 'specific'} onClick={() => update({ curatorMode: 'specific' })} />
      </div>
    </Field>
    {d.curatorMode === 'specific' && (
      <Field label="Куратор">
        <div className="flex flex-col gap-2">
          {CURATORS.map(c => (
            <button key={c.id} type="button" onClick={() => update({ curatorId: c.id })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                d.curatorId === c.id ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-300' : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}>
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center justify-center shrink-0">{c.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold text-neutral-800 truncate">{c.name}</span>
                <span className="block text-[10.5px] text-neutral-400 truncate">{c.dept} · {c.div}</span>
              </span>
            </button>
          ))}
        </div>
      </Field>
    )}
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ОПИСАНИЯ ШАГОВ
// ═══════════════════════════════════════════════════════════════════════════════

export const STEP_DEFS: Record<StepType, StepDef> = {

  start: {
    type: 'start', label: 'Запуск', description: 'Кому и когда', category: 'Начало',
    icon: Zap, tone: 'start', unique: true,
    defaults: () => ({ step: 'start' }),
    isConfigured: () => true,            // настраивается в шапке сценария
    summary: () => '',                   // подставляется холстом из настроек сценария
    outputs: () => SINGLE_OUT,
  },

  content: {
    type: 'content', label: 'Назначить обучение', description: 'Курс, урок, тест, опрос или мероприятие',
    category: 'Действия', icon: BookOpen, tone: 'action',
    defaults: () => ({ step: 'content', deadlineDays: 7, mandatory: true, notifyOnAssign: true }),
    isConfigured: d => !!d.item && d.deadlineDays !== undefined,
    summary: d => {
      if (!d.item) return '';
      const dl = d.deadlineDays === 0 ? 'без срока' : `${d.deadlineDays} дн.`;
      return `${d.item.title} · ${dl}`;
    },
    outputs: () => SINGLE_OUT,
    Inspector: ContentInspector,
  },

  notify: {
    type: 'notify', label: 'Отправить уведомление', description: 'Push, Telegram, Email или SMS',
    category: 'Действия', icon: Bell, tone: 'notify',
    defaults: () => ({ step: 'notify', recipient: 'employee', channels: ['push'], textRu: '', textUz: '' }),
    isConfigured: d =>
      (d.channels?.length ?? 0) > 0 && !!d.recipient && notifyText(d, 'ru').trim().length > 0,
    summary: d => {
      const text = notifyText(d, 'ru').trim();
      if (!text) return '';
      const ch = (d.channels || []).map(channelLabel).join(', ');
      return `${recipientLabel(d.recipient)}${ch ? ` · ${ch}` : ''}`;
    },
    outputs: () => SINGLE_OUT,
    Inspector: NotifyInspector,
  },

  wait: {
    type: 'wait', label: 'Ожидание', description: 'Пауза или ожидание прохождения',
    category: 'Ожидание', icon: Clock, tone: 'wait',
    defaults: () => ({ step: 'wait', waitMode: 'pause', pauseValue: 3, pauseUnit: 'day' as DelayUnit }),
    isConfigured: d => d.waitMode === 'completion'
      ? !!d.waitItem && d.waitLimitDays !== undefined
      : !!d.pauseValue && d.pauseValue > 0 && !!d.pauseUnit,
    summary: d => {
      if (d.waitMode === 'completion') {
        if (!d.waitItem) return '';
        const lim = d.waitLimitDays === 0 ? 'без лимита' : `до ${d.waitLimitDays} дн.`;
        return `${d.waitItem.title} · ${lim}`;
      }
      if (!d.pauseValue || !d.pauseUnit) return '';
      return `Пауза ${d.pauseValue} ${delayShort(d.pauseUnit)}`;
    },
    outputs: d => d.waitMode === 'completion'
      ? [
          { id: 'done',    label: 'Прошёл',   tone: 'positive' },
          { id: 'timeout', label: 'Не успел', tone: 'warning' },
        ]
      : SINGLE_OUT,
    Inspector: WaitInspector,
  },

  branch: {
    type: 'branch', label: 'Развилка', description: 'Разделить сотрудников по признаку',
    category: 'Ветвление', icon: GitBranch, tone: 'branch',
    defaults: () => ({ step: 'branch', branchValues: [], branchElse: true }),
    isConfigured: d => !!d.branchField && (d.branchValues?.length ?? 0) > 0,
    summary: d => {
      if (!d.branchField || !d.branchValues?.length) return '';
      const n = d.branchValues.length + (d.branchElse !== false ? 1 : 0);
      return `По полю «${getFieldLabel(d.branchField)}» · ${n} ветк${n === 1 ? 'а' : n < 5 ? 'и' : 'ок'}`;
    },
    outputs: d => {
      const outs: StepOutput[] = (d.branchValues || []).map(v => ({ id: `b-${v}`, label: v, tone: 'branch' as const }));
      if (d.branchElse !== false) outs.push({ id: 'else', label: 'Остальные', tone: 'neutral' });
      return outs.length ? outs : SINGLE_OUT;
    },
    Inspector: BranchInspector,
  },

  end: {
    type: 'end', label: 'Финиш', description: 'Конец сценария',
    category: 'Завершение', icon: Flag, tone: 'end',
    defaults: () => ({ step: 'end', endStatus: 'success', endNotifyHr: false }),
    isConfigured: d => !!d.endStatus,
    summary: d => d.endStatus === 'aborted'
      ? 'Прерван'
      : `Успешно${d.endNotifyHr ? ' · HR извещён' : ''}`,
    outputs: () => [],
    Inspector: EndInspector,
  },

  check_result: {
    type: 'check_result', label: 'Проверить результат', description: 'Баллы, прогресс или факт прохождения',
    category: 'Ветвление', icon: ClipboardCheck, tone: 'pro',
    defaults: () => ({ step: 'check_result', checkItems: [] }),
    isConfigured: d => (d.checkItems?.length ?? 0) > 0 && !!d.checkField && !!d.checkValue,
    summary: d => {
      if (!d.checkField || !d.checkValue) return '';
      const f = CHECK_FIELDS.find(x => x.value === d.checkField)?.label || '';
      const op = { '>=': '≥', '<': '<', '=': '=' }[d.checkOperator || '='] || '';
      return d.checkField === 'completed' ? `${f}: ${d.checkValue}` : `${f} ${op} ${d.checkValue}`;
    },
    outputs: () => [
      { id: 'yes', label: 'Да',  tone: 'positive' },
      { id: 'no',  label: 'Нет', tone: 'negative' },
    ],
    Inspector: CheckResultInspector,
  },

  curator: {
    type: 'curator', label: 'Назначить куратора', description: 'Куратор из раздела «Команда»',
    category: 'Действия', icon: UserCheck, tone: 'pro',
    defaults: () => ({ step: 'curator', curatorMode: 'auto' }),
    isConfigured: d => d.curatorMode === 'auto' || (d.curatorMode === 'specific' && d.curatorId !== undefined),
    summary: d => d.curatorMode === 'auto'
      ? 'Куратор департамента'
      : CURATORS.find(c => c.id === d.curatorId)?.name || '',
    outputs: () => SINGLE_OUT,
    Inspector: CuratorInspector,
  },
};

// ── Доступ к реестру ──────────────────────────────────────────────────────────

export const stepDef = (t: StepType): StepDef => STEP_DEFS[t] || STEP_DEFS.content;

export const isConfigured = (d: StepData) => stepDef(d.step).isConfigured(d);
export const stepSummary  = (d: StepData) => stepDef(d.step).summary(d);
export const stepOutputs  = (d: StepData) => stepDef(d.step).outputs(d);

// Состав шагов и граница версий объявлены в editions.ts — единственном месте,
// где это описано. Здесь только их порядок в каталоге.

export interface StepGroup { category: string; steps: StepDef[] }

export function stepCatalog(): StepGroup[] {
  const order = ['Действия', 'Ожидание', 'Ветвление', 'Завершение'];
  const groups = new Map<string, StepDef[]>();
  ADDABLE_STEPS.forEach(t => {
    const def = stepDef(t);
    const list = groups.get(def.category) || [];
    list.push(def);
    groups.set(def.category, list);
  });
  return order.filter(c => groups.has(c)).map(c => ({ category: c, steps: groups.get(c)! }));
}

export { CONTENT_ICON, CONTENT_TYPE_LABEL, contentTitle };
