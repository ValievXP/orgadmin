"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — НАСТРОЙКА ШАБЛОНА ПОД ОРГАНИЗАЦИЮ
//
// Шаблон задаёт форму сценария, а содержимое подставляется здесь — из справочников
// конкретной организации. Ни один вопрос не обязателен: что пропустили, останется
// на холсте пустым шагом с пометкой «нужно заполнить».
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { X, Plus, GitBranch, ArrowRight } from 'lucide-react';
import { getProfileFields, getFieldValues } from '@/lib/platform/profile';
import { ContentRef } from './types';
import { FlowTemplate, TemplateFill, emptyFill } from './templates';
import { AudienceBuilder, ReachBanner } from './FlowHeader';
import { Field, ContentCard, ContentPicker, SearchableChips } from './ui';

export function TemplateSetup({ template, onCreate, onClose }: {
  template: FlowTemplate;
  onCreate: (fill: TemplateFill) => void;
  onClose: () => void;
}) {
  const [fill, setFill] = useState<TemplateFill>(emptyFill);
  const [picking, setPicking] = useState<string | null>(null);

  const fields = getProfileFields();
  const branchField = fill.branchField || fields[0]?.key;
  const branchValues = getFieldValues(branchField);

  const setContent = (slotId: string, item: ContentRef | undefined) =>
    setFill(f => ({ ...f, content: { ...f.content, [slotId]: item } }));

  const filledCount =
    template.contentSlots.filter(s => fill.content[s.id]).length +
    (template.branchSlot ? (fill.branchValues.length > 0 ? 1 : 0) : 0);
  const totalSlots = template.contentSlots.length + (template.branchSlot ? 1 : 0);

  return (
    <>
      <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '88vh' }}>

          <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold text-neutral-900">{template.name}</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5 leading-relaxed">{template.description}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-7 min-h-0">

            {/* ── Кому ── */}
            <Field label="Кому назначаем"
              hint="Значения берутся из справочников вашей организации. Оставите пустым — сценарий получат все сотрудники.">
              <AudienceBuilder rules={fill.audience} onChange={a => setFill(f => ({ ...f, audience: a }))} />
            </Field>
            <ReachBanner rules={fill.audience} compact />

            {/* ── Развилка ── */}
            {template.branchSlot && (
              <Field label={template.branchSlot.label} hint={template.branchSlot.hint}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/60">
                    <GitBranch className="w-4 h-4 text-violet-500 shrink-0" />
                    <select value={branchField}
                      onChange={e => setFill(f => ({ ...f, branchField: e.target.value, branchValues: [] }))}
                      className="flex-1 min-w-0 bg-transparent text-[13px] font-semibold text-neutral-800 focus:outline-none cursor-pointer">
                      {fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>

                  <SearchableChips options={branchValues} selected={fill.branchValues} tone="violet"
                    placeholder={`Поиск среди ${branchValues.length}…`}
                    onToggle={v => setFill(f => ({
                      ...f,
                      branchField: branchField,
                      branchValues: f.branchValues.includes(v)
                        ? f.branchValues.filter(x => x !== v)
                        : [...f.branchValues, v],
                    }))} />

                  {fill.branchValues.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {fill.branchValues.map(v => (
                        <div key={v} className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                          <span className="text-[12px] font-semibold text-neutral-700 truncate">{v}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                        <span className="text-[12px] font-semibold text-neutral-500">Все остальные</span>
                      </div>
                    </div>
                  )}
                </div>
              </Field>
            )}

            {/* ── Контент ── */}
            {template.contentSlots.map(slot => {
              const item = fill.content[slot.id];
              return (
                <Field key={slot.id} label={slot.label} hint={slot.hint}>
                  {item ? (
                    <ContentCard item={item} onRemove={() => setContent(slot.id, undefined)} />
                  ) : (
                    <button type="button" onClick={() => setPicking(slot.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-neutral-300 rounded-xl text-[13px] font-semibold text-neutral-500 hover:border-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-all">
                      <Plus className="w-4 h-4" /> Выбрать из каталога
                    </button>
                  )}
                </Field>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center gap-3 shrink-0">
            <p className="text-[11.5px] text-neutral-500 flex-1 leading-relaxed">
              {filledCount === totalSlots
                ? 'Всё заполнено — сценарий откроется готовым'
                : `Заполнено ${filledCount} из ${totalSlots}. Остальное можно выбрать позже — шаги будут помечены как незаполненные.`}
            </p>
            <button onClick={() => onCreate({ ...fill, branchField })}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors shrink-0">
              Создать сценарий <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ContentPicker open={picking !== null} onClose={() => setPicking(null)}
        title={template.contentSlots.find(s => s.id === picking)?.label || 'Выбрать элемент'}
        onSelect={el => { if (picking) setContent(picking, el); }} />
    </>
  );
}
