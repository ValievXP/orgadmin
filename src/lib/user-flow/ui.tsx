"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — ОБЩИЕ ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
//
// Все настройки инструмента собираются из этих кирпичей, поэтому правило
// формулировок задаётся здесь один раз: подпись говорит, ЧТО настраиваем,
// подсказка — ЧТО произойдёт, а не как устроена система.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, X, Plus, Minus, ChevronRight, ChevronDown, Check,
  Folder, BookOpen, Layers, FileText, HelpCircle, ClipboardList, Calendar,
  GraduationCap, ClipboardCheck, FlaskConical,
} from 'lucide-react';
import { ELEMENT_TREE, ElementNode, SELECTABLE_TYPES, CONTENT_TYPE_LABEL } from './data';
import { ContentRef } from './types';

// ── Иконки типов контента ─────────────────────────────────────────────────────

export const CONTENT_ICON: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  folder:   { icon: Folder,        color: 'text-neutral-400' },
  course:   { icon: BookOpen,      color: 'text-emerald-500' },
  module:   { icon: Layers,        color: 'text-indigo-400' },
  lesson:   { icon: FileText,      color: 'text-blue-500' },
  homework: { icon: FileText,      color: 'text-violet-500' },
  test:     { icon: HelpCircle,    color: 'text-amber-500' },
  survey:   { icon: ClipboardList, color: 'text-purple-500' },
  event:    { icon: Calendar,      color: 'text-rose-500' },
};

const SECTION_ICON: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'sec-courses': { icon: GraduationCap,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'sec-testing': { icon: ClipboardCheck, color: 'text-amber-600',   bg: 'bg-amber-50' },
  'sec-surveys': { icon: ClipboardList,  color: 'text-purple-600',  bg: 'bg-purple-50' },
  'sec-events':  { icon: Calendar,       color: 'text-rose-600',    bg: 'bg-rose-50' },
};

// ── Метка прототипной заглушки ────────────────────────────────────────────────

/**
 * Оборачивает элемент, которого В ПРОДУКТЕ БЫТЬ НЕ ДОЛЖНО.
 *
 * Прототип читается разработкой буквально, поэтому всё, что существует только
 * ради демонстрации (подмена данных, «перемотка времени», отладочные переключатели),
 * обязано быть видимо помечено — иначе оно уедет в продукт вместе с остальным.
 */
export function PrototypeOnly({ note, children }: { note: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50/40 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-100/70 border-b border-dashed border-fuchsia-300">
        <FlaskConical className="w-3 h-3 text-fuchsia-600 shrink-0" />
        <p className="text-[9.5px] font-bold text-fuchsia-700 uppercase tracking-wider">
          Заглушка прототипа · в продукт не переносить
        </p>
      </div>
      <div className="px-3 py-2.5">{children}</div>
      <p className="px-3 pb-2.5 text-[10.5px] text-fuchsia-700/80 leading-relaxed">{note}</p>
    </div>
  );
}

// ── Блок настройки ────────────────────────────────────────────────────────────

export function Field({ label, hint, children, action }: {
  label: string; hint?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{label}</label>
        {action}
      </div>
      {children}
      {hint && <p className="text-[11.5px] text-neutral-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

// ── Карточка-переключатель ────────────────────────────────────────────────────

export function OptionCard({ title, desc, active, disabled, badge, onClick }: {
  title: string; desc?: string; active: boolean; disabled?: boolean;
  badge?: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        disabled
          ? 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed'
          : active
            ? 'border-neutral-900 bg-neutral-900/[0.03] ring-1 ring-neutral-900'
            : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          active ? 'border-neutral-900' : 'border-neutral-300'
        }`}>
          {active && <span className="w-2 h-2 rounded-full bg-neutral-900" />}
        </span>
        <p className="text-[13px] font-semibold text-neutral-800 flex-1">{title}</p>
        {badge}
      </div>
      {desc && <p className="text-[11.5px] text-neutral-400 mt-1 ml-6 leading-relaxed">{desc}</p>}
    </button>
  );
}

// ── Чипы ──────────────────────────────────────────────────────────────────────

export function Chips({ options, selected, onToggle, tone = 'dark' }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
  tone?: 'dark' | 'teal' | 'violet' | 'indigo';
}) {
  const active = {
    dark:   'bg-neutral-900 text-white',
    teal:   'bg-teal-600 text-white',
    violet: 'bg-violet-600 text-white',
    indigo: 'bg-indigo-600 text-white',
  }[tone];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onToggle(o)}
          className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
            selected.includes(o) ? active : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

const CHIP_LIMIT = 12;

/** Для справочников на сотни значений: поиск, лимит вывода, выбранные впереди. */
export function SearchableChips({ options, selected, onToggle, tone = 'dark', placeholder }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
  tone?: 'dark' | 'teal' | 'violet' | 'indigo'; placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(CHIP_LIMIT);
  const needSearch = options.length > CHIP_LIMIT;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? options.filter(o => o.toLowerCase().includes(term)) : options;
    if (!needSearch) return base;
    return [...base.filter(o => selected.includes(o)), ...base.filter(o => !selected.includes(o))];
  }, [options, q, selected, needSearch]);

  const visible = filtered.slice(0, limit);
  const hidden = filtered.length - visible.length;

  return (
    <div className="flex flex-col gap-2">
      {needSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setLimit(CHIP_LIMIT); }}
            placeholder={placeholder || `Поиск среди ${options.length}…`}
            className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-[12px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all" />
        </div>
      )}
      <Chips options={visible} selected={selected} onToggle={onToggle} tone={tone} />
      {hidden > 0 && (
        <button type="button" onClick={() => setLimit(l => l + 24)}
          className="self-start px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition-all">
          Показать ещё {hidden}
        </button>
      )}
      {filtered.length === 0 && <p className="text-[11.5px] text-neutral-400">Ничего не найдено</p>}
      {selected.length > 0 && <p className="text-[11px] text-neutral-400">Выбрано: {selected.length}</p>}
    </div>
  );
}

// ── Числовой ввод ─────────────────────────────────────────────────────────────

export function Stepper({ value, onChange, min = 1, max = 999, suffix }: {
  value?: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  const [draft, setDraft] = useState(value !== undefined ? String(value) : '');
  useEffect(() => { setDraft(value !== undefined ? String(value) : ''); }, [value]);

  const commit = (raw: string) => {
    const n = Math.round(Number(raw));
    if (raw.trim() === '' || Number.isNaN(n)) { setDraft(value !== undefined ? String(value) : ''); return; }
    const clamped = Math.min(max, Math.max(min, n));
    setDraft(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, (value ?? min + 1) - 1))}
        className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors shrink-0">
        <Minus className="w-4 h-4" />
      </button>
      <input type="number" inputMode="numeric" value={draft} min={min} max={max}
        onChange={e => {
          setDraft(e.target.value);
          const n = Math.round(Number(e.target.value));
          if (e.target.value.trim() !== '' && !Number.isNaN(n) && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => commit(draft)}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        className="w-[72px] text-center px-2 py-2 bg-white border border-neutral-200 rounded-xl text-[14px] font-bold text-neutral-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
      <button type="button" onClick={() => onChange(Math.min(max, (value ?? 0) + 1))}
        className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors shrink-0">
        <Plus className="w-4 h-4" />
      </button>
      {suffix && <span className="text-[12.5px] font-medium text-neutral-500">{suffix}</span>}
    </div>
  );
}

// ── Переключатель ─────────────────────────────────────────────────────────────

export function Switch({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-full flex items-start justify-between gap-3 px-4 py-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors text-left">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-neutral-700">{label}</span>
        {desc && <span className="block text-[11.5px] text-neutral-400 mt-0.5 leading-relaxed">{desc}</span>}
      </span>
      <span className={`w-10 h-6 rounded-full p-0.5 shrink-0 mt-0.5 transition-colors ${checked ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
        <span className={`block bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}

// ── Выбранный элемент контента ────────────────────────────────────────────────

export function ContentCard({ item, onRemove }: { item: ContentRef; onRemove?: () => void }) {
  const cfg = CONTENT_ICON[item.type] || CONTENT_ICON.lesson;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl">
      <Icon className={`w-4 h-4 ${cfg.color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold text-neutral-800 truncate">{item.title}</p>
        <p className="text-[10.5px] text-neutral-400 truncate">
          {CONTENT_TYPE_LABEL[item.type]}{item.titleUz ? ` · UZ: ${item.titleUz}` : ' · нет узбекской версии'}
        </p>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function PickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-neutral-300 rounded-xl text-[13px] font-semibold text-neutral-500 hover:border-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-all">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

/** Быстрый выбор из того, что уже назначено выше по сценарию. */
export function UpstreamPicks({ items, exclude, onPick }: {
  items: ContentRef[]; exclude: Set<string>; onPick: (c: ContentRef) => void;
}) {
  const avail = items.filter(i => !exclude.has(i.id));
  if (avail.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium text-neutral-400">Назначено на предыдущих шагах:</p>
      {avail.map(u => {
        const cfg = CONTENT_ICON[u.type] || CONTENT_ICON.lesson;
        const Icon = cfg.icon;
        return (
          <button key={u.id} type="button" onClick={() => onPick(u)}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-amber-50/60 border border-dashed border-amber-300 rounded-xl hover:bg-amber-50 transition-colors text-left">
            <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
            <span className="flex-1 min-w-0 text-[12px] font-medium text-neutral-700 truncate">{u.title}</span>
            <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

// ── Каталог контента ──────────────────────────────────────────────────────────

export function ContentPicker({ open, onClose, onSelect, title = 'Выбрать элемент' }: {
  open: boolean; onClose: () => void; onSelect: (el: ContentRef) => void; title?: string;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['sec-courses', 'c-821']));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 80); } }, [open]);

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const data = useMemo(() => {
    if (!search.trim()) return ELEMENT_TREE;
    const term = search.toLowerCase();
    const filter = (node: ElementNode): ElementNode | null => {
      const hit = node.title.toLowerCase().includes(term) || (node.titleUz || '').toLowerCase().includes(term);
      if (node.children) {
        const kids = node.children.map(filter).filter(Boolean) as ElementNode[];
        if (kids.length) return { ...node, children: kids };
      }
      return hit ? node : null;
    };
    return ELEMENT_TREE.map(filter).filter(Boolean) as ElementNode[];
  }, [search]);

  const searching = search.trim().length > 0;

  const renderNode = (node: ElementNode, depth = 0): React.ReactNode => {
    const isOpen = expanded.has(node.id) || searching;
    const hasKids = !!node.children?.length;
    const selectable = SELECTABLE_TYPES.has(node.type);

    if (node.type === 'section') {
      const cfg = SECTION_ICON[node.id] || { icon: BookOpen, color: 'text-neutral-500', bg: 'bg-neutral-100' };
      const Icon = cfg.icon;
      return (
        <div key={node.id} className="mb-1">
          <button type="button" onClick={() => toggle(node.id)}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
            <span className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </span>
            <span className="text-[14px] font-bold text-neutral-900">{node.title}</span>
            <span className="text-[11px] text-neutral-400 ml-auto">{node.children?.length ?? 0}</span>
          </button>
          {isOpen && hasKids && (
            <div className="ml-3 border-l-2 border-neutral-100 pl-1 mt-0.5 flex flex-col gap-0.5">
              {node.children!.map(c => renderNode(c, 1))}
            </div>
          )}
        </div>
      );
    }

    const cfg = CONTENT_ICON[node.type] || CONTENT_ICON.lesson;
    const Icon = cfg.icon;
    const iconColor = node.type === 'folder' && node.color ? node.color : cfg.color;

    return (
      <div key={node.id}>
        <div
          onClick={() => { if (hasKids) toggle(node.id); }}
          className="flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all group hover:bg-neutral-50"
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px`, cursor: hasKids ? 'pointer' : 'default' }}
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            {hasKids
              ? (isOpen ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />)
              : <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />}
          </span>
          <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-700 truncate">{node.title}</p>
            {node.titleUz && <p className="text-[10px] text-neutral-400 truncate">UZ: {node.titleUz}</p>}
          </div>
          {!selectable && node.type !== 'folder' && (
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider shrink-0">
              {CONTENT_TYPE_LABEL[node.type]}
            </span>
          )}
          {selectable && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onSelect({ id: node.id, title: node.title, titleUz: node.titleUz, type: node.type }); onClose(); }}
              className="shrink-0 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
              <Check className="w-3 h-3" /> Выбрать
            </button>
          )}
        </div>
        {hasKids && isOpen && (
          <div className={`flex flex-col gap-0.5 mt-0.5 ${depth < 2 ? 'ml-3 border-l-2 border-neutral-100 pl-1' : 'ml-5'}`}>
            {node.children!.map(c => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-neutral-900">{title}</h2>
            <p className="text-[12.5px] text-neutral-500 mt-0.5">Русская и узбекская версии назначаются вместе</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию (RU / UZ)…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all shadow-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {data.length > 0
            ? <div className="flex flex-col gap-0.5">{data.map(n => renderNode(n))}</div>
            : <div className="py-16 text-center">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-neutral-700">Ничего не найдено</p>
              </div>}
        </div>
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 shrink-0">
          <p className="text-[11.5px] text-neutral-400">Разделы платформы: Курсы, Тестирование, Опросы, Мероприятия</p>
        </div>
      </div>
    </div>
  );
}
