"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — СПИСОК СЦЕНАРИЕВ
// Карточка отвечает на три вопроса сразу: кому, работает ли, что происходит.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Plus, Route, Copy, Trash2, Download, Upload, Edit3, Check, X,
  Users, ArrowUpRight, AlertTriangle, Sparkles, Search,
} from 'lucide-react';
import { Edition, EDITIONS } from './editions';
import { FlowDoc, DEFAULT_SETTINGS } from './types';
import {
  loadFlows, upsertFlow, deleteFlow, duplicateFlow, createFlow, exportFlow, importFlow,
} from './storage';
import { TEMPLATES, templatesFor, emptyFlow, settingsFor, slotCount, FlowTemplate, TemplateFill } from './templates';
import { TemplateSetup } from './TemplateSetup';
import { describeAudience, audienceOf } from './audience';
import { isConfigured, stepDef } from './registry';
import { FlowNode, StepType } from './types';
import { participantsOf, participantStats } from './participants';

const pluralRu = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

const fmtDateTime = (ms: number) =>
  `${new Date(ms).toLocaleDateString('ru-RU')} ${new Date(ms).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

// ── Галерея шаблонов ──────────────────────────────────────────────────────────

function TemplateGallery({ edition, onPick, onBlank, onClose }: {
  edition: Edition; onPick: (t: FlowTemplate) => void; onBlank: () => void; onClose: () => void;
}) {
  const list = templatesFor(edition);
  const locked = TEMPLATES.filter(t => t.edition !== 'both' && t.edition !== edition);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '86vh' }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-neutral-900">С чего начнём</h2>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Шаблон задаёт форму сценария — курсы, отделы и филиалы вы выберете свои
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map(t => (
              <button key={t.id} onClick={() => onPick(t)}
                className="text-left p-4 rounded-2xl border border-neutral-200 hover:border-neutral-900 hover:shadow-md transition-all group flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-bold text-neutral-900 leading-snug">{t.name}</p>
                  <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-[12px] text-neutral-500 leading-relaxed flex-1">{t.description}</p>
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Route className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.shape}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Выберете сами: {slotCount(t)} {pluralRu(slotCount(t), 'значение', 'значения', 'значений')}</span>
                  </div>
                </div>
              </button>
            ))}

            <button onClick={onBlank}
              className="text-left p-4 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-500 transition-all flex flex-col justify-center items-center gap-2 min-h-[130px] text-neutral-400 hover:text-neutral-700">
              <Plus className="w-6 h-6" />
              <span className="text-[13px] font-semibold">Пустой сценарий</span>
            </button>
          </div>

          {locked.length > 0 && (
            <div className="mt-5 pt-5 border-t border-neutral-100">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Доступно в Pro</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locked.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50 opacity-70">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-bold text-neutral-600 leading-snug">{t.name}</p>
                      <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-bold shrink-0">PRO</span>
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-relaxed mt-2">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Карточка сценария ─────────────────────────────────────────────────────────

function FlowCard({ flow, edition, onOpen, onRename, onDuplicate, onExport, onDelete }: {
  flow: FlowDoc; edition: Edition;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(flow.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = useMemo(() => participantStats(participantsOf(flow)), [flow]);
  const reach = useMemo(() => audienceOf(flow.settings?.audience || []).length, [flow.settings]);
  const steps = Array.isArray(flow.nodes) ? flow.nodes.length : 0;
  const unfilled = useMemo(
    () => (flow.nodes as FlowNode[]).filter(n => n?.data && !isConfigured(n.data)).length,
    [flow.nodes],
  );

  const commit = () => { onRename(draft.trim() || flow.name); setRenaming(false); };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete();
  };

  return (
    <div onClick={() => !renaming && onOpen()}
      className="group bg-white rounded-[16px] p-5 flex flex-col gap-3 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer relative">

      <div className="flex items-start justify-between gap-2">
        <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 ${
          edition === 'pro' ? 'text-violet-500 bg-violet-50' : 'text-teal-600 bg-teal-50'
        }`}>
          <Route className="w-5 h-5" />
        </div>
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
          flow.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
        }`}>
          {flow.active ? 'Работает' : 'Черновик'}
        </span>
      </div>

      {renaming ? (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setRenaming(false); }}
            className="flex-1 min-w-0 text-[15px] font-bold text-neutral-900 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
          <button onClick={commit}
            className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shrink-0">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <h3 className="text-[16px] font-bold text-neutral-900 leading-snug pr-6">{flow.name}</h3>
      )}

      <div className="flex items-start gap-1.5 text-[12px] text-neutral-500">
        <Users className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
        <span className="leading-snug">
          {describeAudience(flow.settings?.audience || [])}
          <span className="text-neutral-300"> · </span>
          <span className={reach === 0 ? 'text-red-500 font-semibold' : 'font-semibold text-neutral-700'}>{reach} чел.</span>
        </span>
      </div>

      {flow.active ? (
        <div className="grid grid-cols-4 rounded-xl bg-neutral-50 overflow-hidden">
          {[
            { l: 'Зашли', v: stats.entered, c: 'text-neutral-800' },
            { l: 'Идут', v: stats.running, c: 'text-blue-600' },
            { l: 'Готово', v: stats.done, c: 'text-emerald-600' },
            { l: 'Застряли', v: stats.stuck, c: 'text-amber-600' },
          ].map(s => (
            <div key={s.l} className="py-2 text-center border-r border-white last:border-r-0">
              <p className={`text-[15px] font-bold tabular-nums ${s.c}`}>{s.v}</p>
              <p className="text-[9.5px] text-neutral-400 font-medium">{s.l}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11.5px] text-neutral-400">
          {steps} {pluralRu(steps, 'шаг', 'шага', 'шагов')}
          {unfilled > 0 && (
            <span className="text-amber-600 font-semibold"> · {unfilled} не {pluralRu(unfilled, 'заполнен', 'заполнены', 'заполнены')}</span>
          )}
          {' · '}обновлён {fmtDateTime(flow.updatedAt)}
        </p>
      )}

      <div className="mt-auto pt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}>
        <button onClick={() => { setDraft(flow.name); setRenaming(true); }} title="Переименовать"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDuplicate} title="Сделать копию"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={onExport} title="Сохранить в файл"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDelete} title={confirmDelete ? 'Нажмите ещё раз' : 'Удалить'}
          className={`h-8 rounded-lg flex items-center justify-center gap-1 transition-all ${
            confirmDelete ? 'px-2.5 bg-red-500 text-white text-[11px] font-bold' : 'w-8 text-neutral-400 hover:bg-red-50 hover:text-red-500'
          }`}>
          <Trash2 className="w-3.5 h-3.5" />{confirmDelete && 'Точно?'}
        </button>
      </div>
    </div>
  );
}

// ── Страница списка ───────────────────────────────────────────────────────────

export function UserFlowList({ edition }: { edition: Edition }) {
  const cfg = EDITIONS[edition];
  const router = useRouter();
  const [flows, setFlows] = useState<FlowDoc[]>([]);
  const [ready, setReady] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [setupFor, setSetupFor] = useState<FlowTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'draft'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setFlows(loadFlows(edition)), [edition]);
  useEffect(() => { refresh(); setReady(true); }, [refresh]);

  const open = (id: string) => router.push(`${cfg.basePath}/${id}`);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return flows.filter(f => {
      if (tab === 'active' && !f.active) return false;
      if (tab === 'draft' && f.active) return false;
      if (!term) return true;
      return f.name.toLowerCase().includes(term)
        || describeAudience(f.settings?.audience || []).toLowerCase().includes(term);
    });
  }, [flows, query, tab]);

  /** Два сценария из одного шаблона не должны называться одинаково. */
  const uniqueName = useCallback((base: string) => {
    const taken = new Set(flows.map(f => f.name));
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base} ${i}`)) i++;
    return `${base} ${i}`;
  }, [flows]);

  const createFromTemplate = (t: FlowTemplate, fill: TemplateFill) => {
    const built = t.build(fill);
    const doc = createFlow(edition, uniqueName(t.name), settingsFor(t, fill), built.nodes, built.edges);
    open(doc.id);
  };

  const fromBlank = () => {
    const built = emptyFlow();
    const doc = createFlow(edition, uniqueName('Новый сценарий'), { ...DEFAULT_SETTINGS }, built.nodes, built.edges);
    open(doc.id);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = importFlow(edition, String(reader.result));
      if (!res.ok) { setError(res.error); return; }
      refresh();
      // Файл мог быть выгружен из Pro — молча принять его нельзя
      setError(res.unsupported.length > 0
        ? `Сценарий загружен, но в нём есть возможности из ${EDITIONS.pro.title}: ${res.unsupported
            .map(u => stepDef(u as StepType).label || u).join(', ')}. Включить его в этой версии не получится.`
        : null);
    };
    reader.readAsText(file);
  };

  const handleExport = (flow: FlowDoc) => {
    const blob = new Blob([exportFlow(flow)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.name.replace(/[^\wа-яА-ЯёЁ -]/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F4F5F7] overflow-x-hidden relative">
      <div className="bg-white">
        <PageHeader
          breadcrumbs={[{ label: 'Инструменты', href: '/tools' }, { label: cfg.title }]}
          actions={
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="application/json" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }} />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-[13px] font-semibold hover:bg-neutral-50 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Загрузить из файла
              </button>
              <button onClick={() => setGallery(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Создать сценарий
              </button>
            </div>
          }
        />
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-32">

        {error && (
          <div className="mb-5 flex items-start gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-900 flex-1 leading-relaxed">{error}</p>
            <button onClick={() => setError(null)} className="text-amber-500 hover:text-amber-700 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Поиск и фильтр — появляются, когда сценариев становится много */}
        {flows.length > 3 && (
          <div className="mb-5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Поиск по названию или аудитории…"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all" />
            </div>
            <div className="flex gap-1.5 shrink-0">
              {([
                ['all', `Все · ${flows.length}`],
                ['active', `Работают · ${flows.filter(f => f.active).length}`],
                ['draft', `Черновики · ${flows.filter(f => !f.active).length}`],
              ] as const).map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`px-3 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap ${
                    tab === k ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {ready && flows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="text-[17px] font-bold text-neutral-700 mb-1">Пока нет ни одного сценария</p>
            <p className="text-[13px] text-neutral-400 mb-5 max-w-md leading-relaxed">
              Начните с готового: адаптация новичка, разное обучение разным группам,
              напоминания до прохождения
            </p>
            <button onClick={() => setGallery(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
              <Plus className="w-4 h-4" /> Выбрать сценарий
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(f => (
              <FlowCard key={f.id} flow={f} edition={edition}
                onOpen={() => open(f.id)}
                onRename={name => { upsertFlow(edition, { ...f, name, updatedAt: Date.now() }); refresh(); }}
                onDuplicate={() => { duplicateFlow(edition, f.id); refresh(); }}
                onExport={() => handleExport(f)}
                onDelete={() => { deleteFlow(edition, f.id); refresh(); }} />
            ))}

            {visible.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-neutral-600">Ничего не найдено</p>
                <p className="text-[12.5px] text-neutral-400 mt-1">Измените запрос или выберите другой фильтр</p>
              </div>
            )}

            {visible.length > 0 && (
              <button onClick={() => setGallery(true)}
                className="border-2 border-dashed border-neutral-200 rounded-[16px] p-6 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 hover:bg-white/60 transition-all min-h-[200px]">
                <Plus className="w-6 h-6" />
                <span className="text-[13px] font-semibold">Новый сценарий</span>
              </button>
            )}
          </div>
        )}
      </div>

      {gallery && (
        <TemplateGallery edition={edition}
          onPick={t => { setGallery(false); setSetupFor(t); }}
          onBlank={fromBlank}
          onClose={() => setGallery(false)} />
      )}

      {setupFor && (
        <TemplateSetup template={setupFor}
          onCreate={fill => createFromTemplate(setupFor, fill)}
          onClose={() => setSetupFor(null)} />
      )}
    </div>
  );
}
