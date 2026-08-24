"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — «КОМУ И КОГДА»
//
// Раньше это пряталось внутри шага на холсте. Теперь — постоянная панель:
// событие запуска, правила отбора, живой счётчик охвата и список людей.
//
// Правило одно: число на экране и список сотрудников считаются ОДНОЙ функцией
// (audienceOf). Иначе они разъедутся, и инструменту перестанут верить.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from 'react';
import {
  X, Users, Plus, Trash2, AlertTriangle, Search, Lock, Clock, Repeat, Play,
} from 'lucide-react';
import { getProfileFields, getFieldLabel, getFieldValues, Employee } from '@/lib/platform/profile';
import { FlowSettings, AudienceRule, StartEvent } from './types';
import { Edition, startEventAllowed } from './editions';
import { START_EVENTS, SCHEDULE_FREQ, SCHEDULE_DAYS, SCHEDULE_TIMES } from './data';
import { audienceOf, describeAudience, newRuleId, totalReachable } from './audience';
import { Field, OptionCard, Chips, SearchableChips, Stepper, Switch } from './ui';

// ── Список подходящих сотрудников ─────────────────────────────────────────────

export function AudienceModal({ open, onClose, employees, rules }: {
  open: boolean; onClose: () => void; employees: Employee[]; rules: AudienceRule[];
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.dept.toLowerCase().includes(term) ||
      e.role.toLowerCase().includes(term));
  }, [employees, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '82vh' }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-neutral-900">
              Кто попадает в сценарий · {employees.length}
            </h2>
            <p className="text-[12.5px] text-neutral-500 mt-0.5">{describeAudience(rules)}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по имени, отделу, должности…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-neutral-50">
          {filtered.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                {e.initials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-800 truncate">{e.name}</p>
                <p className="text-[11.5px] text-neutral-400 truncate">{e.dept} / {e.div} · {e.role}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[9.5px] font-bold">{e.lang}</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[9.5px] font-bold">{e.status}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-[14px] font-medium text-neutral-600">Никто не найден</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Одно правило отбора ───────────────────────────────────────────────────────

function RuleRow({ rule, usedFields, onChange, onRemove }: {
  rule: AudienceRule; usedFields: string[];
  onChange: (r: AudienceRule) => void; onRemove: () => void;
}) {
  const fields = getProfileFields();
  const available = fields.filter(f => f.key === rule.field || !usedFields.includes(f.key));
  const values = getFieldValues(rule.field);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100 bg-neutral-50/60">
        <select
          value={rule.field}
          onChange={e => onChange({ ...rule, field: e.target.value, values: [] })}
          className="flex-1 min-w-0 bg-transparent text-[13px] font-semibold text-neutral-800 focus:outline-none cursor-pointer">
          {available.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>

        <div className="flex gap-1 shrink-0">
          {([{ v: 'is', l: 'один из' }, { v: 'not', l: 'ни один из' }] as const).map(o => (
            <button key={o.v} type="button" onClick={() => onChange({ ...rule, op: o.v })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                rule.op === o.v ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}>
              {o.l}
            </button>
          ))}
        </div>

        <button type="button" onClick={onRemove} title="Убрать условие"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-3 py-3">
        <SearchableChips options={values} selected={rule.values} tone="teal"
          onToggle={v => onChange({
            ...rule,
            values: rule.values.includes(v) ? rule.values.filter(x => x !== v) : [...rule.values, v],
          })} />
        {rule.values.length === 0 && (
          <p className="text-[11.5px] text-amber-600 mt-2">Значение не выбрано — условие ничего не отсекает</p>
        )}
      </div>
    </div>
  );
}

// ── Конструктор аудитории (общий для настроек и создания из шаблона) ──────────

export function AudienceBuilder({ rules, onChange }: {
  rules: AudienceRule[]; onChange: (r: AudienceRule[]) => void;
}) {
  const fields = getProfileFields();
  const used = rules.map(r => r.field);

  const add = () => {
    const free = fields.find(f => !used.includes(f.key)) || fields[0];
    onChange([...rules, { id: newRuleId(), field: free.key, op: 'is', values: [] }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {rules.map(r => (
        <RuleRow key={r.id} rule={r} usedFields={used}
          onChange={next => onChange(rules.map(x => x.id === r.id ? next : x))}
          onRemove={() => onChange(rules.filter(x => x.id !== r.id))} />
      ))}
      <button type="button" onClick={add}
        className={`w-full flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all ${
          rules.length === 0
            ? 'px-4 py-3.5 border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-neutral-700'
            : 'px-4 py-2 text-neutral-500 hover:text-neutral-800'
        }`}>
        <Plus className="w-4 h-4" /> {rules.length === 0 ? 'Добавить условие отбора' : 'Ещё условие'}
      </button>
    </div>
  );
}

/** Плашка охвата: одно число, посчитанное той же функцией, что и список. */
export function ReachBanner({ rules, compact }: { rules: AudienceRule[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const audience = audienceOf(rules);
  const total = totalReachable();
  const noRules = rules.filter(r => r.values.length > 0).length === 0;

  const tone = audience.length === 0
    ? { box: 'border-red-200 bg-red-50', title: 'text-red-700', sub: 'text-red-600' }
    : noRules
      ? { box: 'border-amber-200 bg-amber-50', title: 'text-amber-800', sub: 'text-amber-700' }
      : { box: 'border-emerald-200 bg-emerald-50', title: 'text-emerald-800', sub: 'text-emerald-700' };

  return (
    <>
      <div className={`rounded-2xl border overflow-hidden ${tone.box}`}>
        <div className={`${compact ? 'px-3.5 py-3' : 'px-4 py-3.5'} flex items-start gap-3`}>
          {audience.length === 0 || noRules
            ? <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${audience.length === 0 ? 'text-red-500' : 'text-amber-600'}`} />
            : <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          <div className="min-w-0 flex-1">
            <p className={`text-[13.5px] font-bold ${tone.title}`}>
              {audience.length === 0
                ? 'Не подходит ни один сотрудник'
                : noRules
                  ? `Условий нет — попадут все ${total} сотрудников`
                  : `Сейчас подходит ${audience.length} из ${total}`}
            </p>
            <p className={`text-[11.5px] mt-0.5 leading-relaxed ${tone.sub}`}>
              {audience.length === 0
                ? 'Проверьте условия — возможно, они противоречат друг другу'
                : 'Уволенные сотрудники в сценарии не участвуют'}
            </p>
          </div>
        </div>
        {audience.length > 0 && (
          <button type="button" onClick={() => setOpen(true)}
            className="w-full px-4 py-2.5 bg-white/70 hover:bg-white text-[12px] font-semibold text-neutral-700 border-t border-black/5 transition-colors">
            Посмотреть список
          </button>
        )}
      </div>
      <AudienceModal open={open} onClose={() => setOpen(false)} employees={audience} rules={rules} />
    </>
  );
}

// ── Панель настроек сценария ──────────────────────────────────────────────────

export function FlowSettingsPanel({ settings, edition, onChange, onClose }: {
  settings: FlowSettings; edition: Edition;
  onChange: (s: FlowSettings) => void; onClose: () => void;
}) {
  const patch = (p: Partial<FlowSettings>) => onChange({ ...settings, ...p });

  return (
    <>
      <div className="w-[400px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 shadow-xl z-50">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Play className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-neutral-900">Кому и когда</p>
              <p className="text-[11.5px] text-neutral-400">Начало сценария</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* ── Событие запуска ── */}
          <Field label="Когда запускать">
            <div className="flex flex-col gap-2">
              {START_EVENTS.map(ev => {
                const locked = !startEventAllowed(edition, ev.value as StartEvent);
                return (
                  <OptionCard key={ev.value} title={ev.label} desc={ev.desc}
                    active={settings.startEvent === ev.value}
                    disabled={locked}
                    badge={locked
                      ? <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-bold shrink-0">
                          <Lock className="w-2.5 h-2.5" /> PRO
                        </span>
                      : undefined}
                    onClick={() => patch({ startEvent: ev.value as StartEvent })} />
                );
              })}
            </div>
          </Field>

          {/* ── Расписание ── */}
          {settings.startEvent === 'schedule' && (
            <>
              <Field label="Как часто">
                <Chips options={SCHEDULE_FREQ.map(f => f.label)}
                  selected={settings.scheduleFreq ? SCHEDULE_FREQ.filter(f => f.value === settings.scheduleFreq).map(f => f.label) : []}
                  onToggle={l => patch({
                    scheduleFreq: SCHEDULE_FREQ.find(f => f.label === l)!.value,
                    scheduleDay: undefined, scheduleMonthDay: undefined,
                  })} tone="violet" />
              </Field>
              {settings.scheduleFreq === 'weekly' && (
                <Field label="В какой день">
                  <Chips options={SCHEDULE_DAYS} selected={settings.scheduleDay ? [settings.scheduleDay] : []}
                    onToggle={v => patch({ scheduleDay: v })} tone="violet" />
                </Field>
              )}
              {settings.scheduleFreq === 'monthly' && (
                <Field label="Какого числа">
                  <Stepper value={settings.scheduleMonthDay} min={1} max={28} suffix="числа каждого месяца"
                    onChange={v => patch({ scheduleMonthDay: v })} />
                </Field>
              )}
              <Field label="Во сколько">
                <Chips options={SCHEDULE_TIMES} selected={settings.scheduleTime ? [settings.scheduleTime] : []}
                  onToggle={v => patch({ scheduleTime: v })} tone="violet" />
              </Field>
            </>
          )}

          {/* ── Аудитория ── */}
          <Field label="Кто попадает в сценарий"
            hint="Условия работают вместе: сотрудник должен подходить под каждое из них.">
            <AudienceBuilder rules={settings.audience} onChange={a => patch({ audience: a })} />
          </Field>

          <ReachBanner rules={settings.audience} />

          {/* ── Уведомления ── */}
          <Field label="Когда можно писать сотрудникам">
            <Switch label="Только в рабочие часы"
              desc={settings.quietHours.enabled
                ? `Всё, что выпадает за пределы окна, уйдёт утром`
                : 'Уведомления будут уходить в любое время суток, включая ночь'}
              checked={settings.quietHours.enabled}
              onChange={v => patch({ quietHours: { ...settings.quietHours, enabled: v } })} />
            {settings.quietHours.enabled && (
              <div className="flex items-center gap-2 mt-2 px-3.5 py-2.5 bg-neutral-50 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-[12.5px] text-neutral-600">с</span>
                <select value={settings.quietHours.from}
                  onChange={e => patch({ quietHours: { ...settings.quietHours, from: e.target.value } })}
                  className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-neutral-800 focus:outline-none cursor-pointer">
                  {['07:00', '08:00', '09:00', '10:00'].map(t => <option key={t}>{t}</option>)}
                </select>
                <span className="text-[12.5px] text-neutral-600">до</span>
                <select value={settings.quietHours.to}
                  onChange={e => patch({ quietHours: { ...settings.quietHours, to: e.target.value } })}
                  className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-neutral-800 focus:outline-none cursor-pointer">
                  {['17:00', '18:00', '19:00', '20:00', '21:00'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            )}
          </Field>

          {/* ── Повторный вход ── */}
          <Field label="Если сотрудник снова подойдёт под условия">
            <div className="flex flex-col gap-2">
              <OptionCard title="Не запускать повторно"
                desc="Один человек проходит сценарий один раз. Подходит для онбординга и адаптации"
                active={settings.reentry === 'once'} onClick={() => patch({ reentry: 'once' })} />
              <OptionCard title="Запускать каждый раз"
                desc="Человек может пройти сценарий несколько раз. Подходит для аттестаций и регулярных проверок"
                active={settings.reentry === 'always'} onClick={() => patch({ reentry: 'always' })} />
            </div>
            {settings.reentry === 'always' && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <Repeat className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Следите, чтобы сценарий не запускался слишком часто: сотрудник, который надолго
                  остался в выбранном статусе, будет получать его снова и снова.
                </p>
              </div>
            )}
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose}
            className="w-full px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
            Готово
          </button>
        </div>
      </div>

    </>
  );
}

// ── Сводка запуска для карточки шага на холсте ────────────────────────────────

export function startSummary(settings: FlowSettings): { when: string; who: string } {
  const ev = START_EVENTS.find(e => e.value === settings.startEvent);
  let when = ev?.label || '';
  if (settings.startEvent === 'schedule' && settings.scheduleFreq) {
    const f = SCHEDULE_FREQ.find(x => x.value === settings.scheduleFreq)?.label || '';
    const day = settings.scheduleFreq === 'weekly' ? `, ${settings.scheduleDay || '—'}`
      : settings.scheduleFreq === 'monthly' ? `, ${settings.scheduleMonthDay || '—'} числа` : '';
    when = `${f}${day} в ${settings.scheduleTime || '—'}`;
  }
  return { when, who: describeAudience(settings.audience) };
}

export { getFieldLabel };
