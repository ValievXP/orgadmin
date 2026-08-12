"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  ChevronDown, X, Plus, Trash2, Save, Check, Search,
  Clock, CalendarDays, MapPin, Video, Users, FileText, Type,
  Image as ImageIcon, Layers, MousePointer, Code, Table, Columns,
  ChevronUp, ChevronRight, Copy, Eye, EyeOff, Upload, Play, Download,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Quote, Strikethrough, Heading1, Heading2, Heading3,
  Palette, Pipette, ArrowDown, GripVertical, CalendarClock, Info,
  Minus, Zap, AlertTriangle, HelpCircle, Lightbulb, Shield, XCircle, CheckCircle,
  Volume2, Music, Monitor, Smartphone
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type BlockType = 'video' | 'audio' | 'file' | 'text' | 'image' | 'slider' | 'callout' | 'button' | 'iframe' | 'table' | 'columns';

interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
}

interface EventDate {
  id: string;
  date: string;
  dateEnd?: string;       // заполняется только в режиме «Период»: дата окончания
  timeStart: string;
  timeEnd: string;
  speakers?: string[];    // спикеры конкретного дня / периода
}

type DateMode = 'days' | 'period';

interface RegistrationPeriod {
  id: string;
  dateStart: string;
  timeStart: string;
  dateEnd: string;
  timeEnd: string;
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  format: 'online' | 'offline';
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  status: 'draft' | 'registration' | 'in_progress' | 'completed';
  registrationOpen: boolean;
  participants: number;
  participantLimit: number | null;
  parentId: string | null;
  description: string;
  speakers: string;            // строка через запятую — её показывает список мероприятий
  speakersList?: string[];     // спикеры мероприятия в целом
  dateMode?: DateMode;
  dates: EventDate[];
  registrationDates: RegistrationPeriod[];
  blocks: ContentBlock[];
  lang?: 'RUS' | 'UZB' | 'ENG';
  registrationType?: 'open' | 'private';
  createdAt?: string;
  scale?: 'Внутреннее' | 'Локальное' | 'Международное';
}

const mkId = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const DEFAULT_BLOCK: Record<BlockType, () => any> = {
  video: () => ({ fileName: '', orientation: 'horizontal' }),
  audio: () => ({ fileName: '', size: '' }),
  file: () => ({ name: '', size: '' }),
  text: () => ({ html: '' }),
  image: () => ({ url: '', caption: '', width: 'full' }),
  slider: () => ({ images: [] as { id: string; url: string }[] }),
  callout: () => ({ icon: 'info', html: '', iconColor: '#378CFF', bgColor: '#EBF5FF' }),
  button: () => ({ text: 'Кнопка', url: '', color: '#378CFF', textColor: '#FFFFFF', isDivider: false }),
  iframe: () => ({ code: '' }),
  table: () => ({ cells: [['', '', ''], ['', '', ''], ['', '', '']], headerRow: true }),
  columns: () => ({ count: 2, cols: [[], []] as ContentBlock[][] }),
};

// ─── Primitives ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description, icon: Icon }: {
  checked: boolean; onChange: (v: boolean) => void;
  label: string; description?: string; icon?: any;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {Icon && <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-neutral-500" /></div>}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-800">{label}</p>
          {description && <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ml-3 ${checked ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
        <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : ''}`} />
      </button>
    </div>
  );
}

// Свободный ввод спикеров: запятая или Enter превращают текст в лейбл.
// Двойной клик по лейблу — правка, крестик при наведении — удаление.
function SpeakerTags({ value, onChange, placeholder, compact }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string; compact?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editIdx !== null) {
      editRef.current?.focus();
      editRef.current?.select();
    }
  }, [editIdx]);

  const commit = (raw: string) => {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    setDraft('');
    if (!parts.length) return;
    const next = [...value];
    parts.forEach(p => {
      if (!next.some(v => v.toLowerCase() === p.toLowerCase())) next.push(p);
    });
    onChange(next);
  };

  const applyEdit = () => {
    if (editIdx === null) return;
    const text = editText.trim();
    const next = [...value];
    if (!text) next.splice(editIdx, 1);
    else next[editIdx] = text;
    setEditIdx(null);
    setEditText('');
    onChange(next);
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) (e.currentTarget.querySelector('[data-tag-draft]') as HTMLInputElement)?.focus();
      }}
      className={`flex flex-wrap items-center gap-1.5 w-full bg-white border border-neutral-200 rounded-xl shadow-sm cursor-text transition-all focus-within:border-[var(--color-admin-primary-500)] focus-within:ring-4 focus-within:ring-[var(--color-admin-primary-500)]/10 ${compact ? 'min-h-[40px] px-2 py-1.5' : 'min-h-[44px] px-2.5 py-2'}`}
    >
      {value.map((s, i) => editIdx === i ? (
        <input
          key={`edit-${i}`}
          ref={editRef}
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={applyEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); applyEdit(); }
            else if (e.key === 'Escape') { e.preventDefault(); setEditIdx(null); setEditText(''); }
          }}
          className="h-7 px-2 rounded-lg bg-[var(--color-admin-primary-50)] border border-[var(--color-admin-primary-300)] outline-none text-[12px] font-bold text-neutral-900"
          style={{ width: `${Math.max(6, editText.length + 2)}ch` }}
        />
      ) : (
        <span
          key={`tag-${i}`}
          onDoubleClick={() => { setEditIdx(i); setEditText(s); }}
          title="Двойной клик — изменить"
          className="group inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-lg bg-neutral-100 border border-neutral-200/80 text-[12px] font-bold text-neutral-700 select-none"
        >
          {s}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        data-tag-draft
        value={draft}
        onChange={e => {
          const v = e.target.value;
          if (v.includes(',')) commit(v);
          else setDraft(v);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(draft); }
          else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => commit(draft)}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 min-w-[140px] h-7 bg-transparent outline-none text-[13px] font-semibold placeholder:text-neutral-400 placeholder:font-medium"
      />
    </div>
  );
}

function Dropdown({ value, options, onChange }: {
  value: string; options: { id: string; label: string; dot?: string }[]; onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const sel = options.find(o => o.id === value);
  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white text-[13px] text-neutral-900 transition-all font-semibold shadow-sm">
        <div className="flex items-center gap-2">
          {sel?.dot && <div className={`w-2 h-2 rounded-full ${sel.dot}`} />}
          {sel?.label}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100]">
          {options.map(o => (
            <button type="button" key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${value === o.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'}`}>
              {o.dot && <div className={`w-2 h-2 rounded-full ${o.dot} shrink-0`} />}
              <span className={`text-[13px] flex-1 ${value === o.id ? 'font-semibold' : ''}`}>{o.label}</span>
              {value === o.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{top:number;left:number}>({top:0,left:0});
  useEffect(() => setHex(value), [value]);
  const PR = ['#378CFF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#1E293B','#06B6D4','#84CC16','#FFB560'];

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.top - 4, left: r.left });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">{label}</label>
      <button ref={btnRef} onClick={handleOpen} type="button"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-white transition-all">
        <div className="w-5 h-5 rounded-md border border-neutral-200" style={{ backgroundColor: value }} />
        <span className="text-[11px] text-neutral-600 font-mono">{value}</span>
        <Pipette className="w-3 h-3 text-neutral-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[300]" onClick={() => setOpen(false)} />
          <div className="fixed p-3 bg-white border border-neutral-200 rounded-xl shadow-2xl z-[301] w-[200px]"
            style={{ top: pos.top, left: pos.left, transform: 'translateY(-100%)' }}>
            <input type="color" value={value} onChange={e => { onChange(e.target.value); setHex(e.target.value); }}
              className="w-full h-24 rounded-lg cursor-pointer border-0 p-0 mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <input type="text" value={hex} maxLength={7}
                onChange={e => { setHex(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value); }}
                className="flex-1 px-2 py-1 rounded-md border border-neutral-200 text-[11px] font-mono text-center bg-neutral-50 focus:bg-white focus:outline-none" />
              <div className="w-6 h-6 rounded-md border border-neutral-200" style={{ backgroundColor: value }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PR.map(c => (
                <button type="button" key={c} onClick={() => { onChange(c); setHex(c); }}
                  className={`w-5 h-5 rounded-md transition-all ${value === c ? 'ring-2 ring-offset-1 ring-neutral-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Block Toolbar ───────────────────────────────────────────────────────────

function BlockToolbar({ index, total, onMoveUp, onMoveDown, onDuplicate, onDelete, label, onDragStart }: {
  index: number; total: number;
  onMoveUp: () => void; onMoveDown: () => void;
  onDuplicate: () => void; onDelete: () => void;
  label: string;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 bg-neutral-50/50">
      <div className="flex items-center gap-2">
        <div
          draggable
          onDragStart={onDragStart}
          className="p-0.5 cursor-grab active:cursor-grabbing rounded hover:bg-neutral-200 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-neutral-300" />
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={index === 0} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={onDuplicate} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={onDelete} className="p-1 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Rich Editor (prevents cursor jump) ───────────────────────────────────────

function RichEditor({ html, onUpdate, className, placeholder }: {
  html: string; onUpdate: (h: string) => void; className?: string; placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(html);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || '';
  }, []);

  const handleInput = useCallback(() => {
    if (ref.current) {
      const h = ref.current.innerHTML;
      lastHtml.current = h;
      onUpdate(h);
    }
  }, [onUpdate]);

  useEffect(() => {
    if (ref.current && html !== lastHtml.current) {
      ref.current.innerHTML = html || '';
      lastHtml.current = html;
    }
  }, [html]);

  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onInput={handleInput} className={className} data-placeholder={placeholder} />
  );
}

// ─── Block Editors ───────────────────────────────────────────────────────────

function ColorPickerBtn({ onColor, execFn }: { onColor?: (c: string) => void; execFn?: (cmd: string, val?: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span className="relative inline-flex">
      <button type="button" onMouseDown={e => { e.preventDefault(); ref.current?.click(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title="Цвет текста">
        <Palette className="w-3.5 h-3.5" />
      </button>
      <input ref={ref} type="color" defaultValue="#ff0000"
        onChange={e => {
          if (execFn) execFn('foreColor', e.target.value);
          if (onColor) onColor(e.target.value);
        }}
        className="absolute w-0 h-0 opacity-0 pointer-events-none" />
    </span>
  );
}

function TextBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const onHtmlChange = useCallback((h: string) => onChange({ ...data, html: h }), [data, onChange]);
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2 pb-2 border-b border-neutral-100 flex-wrap">
        {[
          { cmd: () => exec('formatBlock', 'h1'), icon: Heading1, title: 'H1' },
          { cmd: () => exec('formatBlock', 'h2'), icon: Heading2, title: 'H2' },
          { cmd: () => exec('formatBlock', 'h3'), icon: Heading3, title: 'H3' },
        ].map((b, i) => (
          <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('bold'), icon: Bold, title: 'Жирный' },
          { cmd: () => exec('italic'), icon: Italic, title: 'Курсив' },
          { cmd: () => exec('underline'), icon: Underline, title: 'Подчёркнутый' },
          { cmd: () => exec('strikeThrough'), icon: Strikethrough, title: 'Зачёркнутый' },
        ].map((b, i) => (
          <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('justifyLeft'), icon: AlignLeft, title: 'Лево' },
          { cmd: () => exec('justifyCenter'), icon: AlignCenter, title: 'Центр' },
          { cmd: () => exec('justifyRight'), icon: AlignRight, title: 'Право' },
        ].map((b, i) => (
          <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('insertUnorderedList'), icon: List, title: 'Список' },
          { cmd: () => exec('insertOrderedList'), icon: ListOrdered, title: 'Нумерация' },
          { cmd: () => exec('formatBlock', 'blockquote'), icon: Quote, title: 'Цитата' },
          { cmd: () => { const url = prompt('Введите URL:'); if (url) exec('createLink', url); }, icon: Link, title: 'Ссылка' },
        ].map((b, i) => (
          <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <ColorPickerBtn execFn={exec} />
      </div>
      <RichEditor
        html={data.html}
        onUpdate={onHtmlChange}
        className="min-h-[80px] text-[14px] text-neutral-800 leading-relaxed focus:outline-none prose prose-sm max-w-none [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        placeholder="Введите текст..."
      />
      <style>{`[data-placeholder]:empty:before { content: attr(data-placeholder); color: #ccc; pointer-events: none; }`}</style>
    </div>
  );
}

function VideoBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const orientation = data.orientation || 'horizontal';
  return (
    <div className="px-4 py-4">
      {data.fileName ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Ориентация: {orientation === 'horizontal' ? 'Горизонтальное' : 'Вертикальное'}</span>
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
              <button type="button" onClick={() => onChange({ ...data, orientation: 'horizontal' })} title="Горизонтальное видео"
                className={`p-1 rounded-md transition-all ${orientation === 'horizontal' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => onChange({ ...data, orientation: 'vertical' })} title="Вертикальное видео"
                className={`p-1 rounded-md transition-all ${orientation === 'vertical' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className={`bg-neutral-900 rounded-xl flex items-center justify-center transition-all ${orientation === 'vertical' ? 'h-64 w-36 mx-auto' : 'h-44'}`}>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"><Play className="w-6 h-6 text-white ml-0.5" /></div>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <Video className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[13px] font-medium text-neutral-800 truncate flex-1">{data.fileName}</span>
            <button type="button" onClick={() => onChange({ ...data, fileName: '' })} className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
              <button type="button" onClick={() => onChange({ ...data, orientation: 'horizontal' })} title="Горизонтальное видео"
                className={`p-1 rounded-md transition-all ${orientation === 'horizontal' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => onChange({ ...data, orientation: 'vertical' })} title="Вертикальное видео"
                className={`p-1 rounded-md transition-all ${orientation === 'vertical' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button type="button" onClick={() => onChange({ ...data, fileName: 'intro_video.mp4' })}
            className="w-full h-36 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform"><Upload className="w-5 h-5 text-rose-400" /></div>
            <span className="text-[12px] font-medium">Загрузить видео</span>
            <span className="text-[11px] text-neutral-300">MP4, MOV, AVI · до 2 ГБ · {orientation === 'horizontal' ? '1920x1080' : '1080x1920'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AudioBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4">
      {data.fileName ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <Volume2 className="w-5 h-5 text-cyan-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-800 truncate">{data.fileName}</p>
              <p className="text-[11px] text-neutral-400">{data.size || '3.4 MB'}</p>
            </div>
            <button type="button" onClick={() => onChange({ fileName: '', size: '' })} className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-neutral-100 rounded-lg">
            <button type="button" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
              <Play className="w-3.5 h-3.5 text-neutral-800 ml-0.5" />
            </button>
            <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-neutral-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">0:00 / 3:45</span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => onChange({ fileName: 'podcast_interview.mp3', size: '4.8 MB' })}
          className="w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer">
          <Upload className="w-5 h-5" />
          <span className="text-[12px] font-medium">Загрузить аудио</span>
          <span className="text-[11px] text-neutral-300">MP3, AAC, OGG · до 2 ГБ</span>
        </button>
      )}
    </div>
  );
}

function ImageBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4">
      {data.url ? (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden group/i bg-neutral-100">
            <img src={data.url} alt="" className="w-full max-h-64 object-contain" />
            <button type="button" onClick={() => onChange({...data, url:''})} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/i:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
          </div>
          <input type="text" value={data.caption||''} onChange={e => onChange({...data, caption: e.target.value})} placeholder="Подпись..." className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] text-neutral-700 placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none text-center italic animate-none" />
        </div>
      ) : (
        <button type="button" onClick={() => onChange({...data, url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'})} className="w-full h-28 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform"><ImageIcon className="w-5 h-5 text-blue-400" /></div>
          <span className="text-[12px] font-medium">Загрузить изображение</span>
        </button>
      )}
    </div>
  );
}

function FileBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4">
      {data.name ? (
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <FileText className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-neutral-800 truncate">{data.name}</p><p className="text-[11px] text-neutral-400">{data.size}</p></div>
            <button type="button" onClick={() => onChange({name:'',size:''})} className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => onChange({name: 'Презентация.pptx', size: '4.8 MB'})} className="w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer">
          <Upload className="w-5 h-5" /><span className="text-[12px] font-medium">Загрузить файл</span><span className="text-[11px] text-neutral-300">PDF, DOCX, XLSX, PPTX</span>
        </button>
      )}
    </div>
  );
}

function SliderBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const imgs = data.images || [];
  const [dragI, setDragI] = useState<number|null>(null);

  const handleSliderDrop = (toIdx: number) => {
    if (dragI === null || dragI === toIdx) return;
    const next = [...imgs];
    const [moved] = next.splice(dragI, 1);
    next.splice(toIdx, 0, moved);
    onChange({...data, images: next});
    setDragI(null);
  };

  return (
    <div className="px-4 py-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {imgs.map((img: any, idx: number) => (
          <div key={img.id}
            draggable
            onDragStart={() => setDragI(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleSliderDrop(idx)}
            onDragEnd={() => setDragI(null)}
            className={`relative w-28 h-20 rounded-lg bg-neutral-100 border shrink-0 group/s overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${dragI === idx ? 'opacity-40 border-blue-400' : 'border-neutral-200'}`}>
            {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-neutral-300" />}
            <div className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded bg-black/50 text-white text-[9px] font-bold">{idx+1}</div>
            <button type="button" onClick={() => onChange({...data, images: imgs.filter((_:any,i:number) => i !== idx)})}
              className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover/s:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
          </div>
        ))}
        <button type="button" onClick={() => onChange({...data, images: [...imgs, {id: mkId(), url:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=60'}]})}
          className="w-28 h-20 rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-neutral-300 transition-all shrink-0 cursor-pointer">
          <Plus className="w-4 h-4" /><span className="text-[9px] font-medium">Добавить</span>
        </button>
      </div>
      <p className="text-[11px] text-neutral-400 mt-1">{imgs.length} изображений · Перетащите для изменения порядка</p>
    </div>
  );
}

const CALLOUT_ICONS: {id:string; icon:any; label:string}[] = [
  {id:'none',icon:Minus,label:'Без иконки'},{id:'zap',icon:Zap,label:'Молния'},{id:'info',icon:Info,label:'Инфо'},
  {id:'alert',icon:AlertTriangle,label:'Внимание'},{id:'help',icon:HelpCircle,label:'Вопрос'},
  {id:'bulb',icon:Lightbulb,label:'Идея'},{id:'shield',icon:Shield,label:'Защита'},
  {id:'error',icon:XCircle,label:'Ошибка'},{id:'success',icon:CheckCircle,label:'Успех'},
];

function CalloutBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const ci = CALLOUT_ICONS.find(i => i.id === data.icon) || CALLOUT_ICONS[2];
  const IC = ci.icon;
  const show = data.icon !== 'none';
  const onCalloutHtml = useCallback((h: string) => onChange({...data, html: h}), [data, onChange]);
  const execC = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-neutral-100 bg-neutral-50/50 flex-wrap">
          {[
            { cmd: () => execC('bold'), icon: Bold, title: 'Жирный' },
            { cmd: () => execC('italic'), icon: Italic, title: 'Курсив' },
            { cmd: () => execC('underline'), icon: Underline, title: 'Подчёркнутый' },
          ].map((b,i) => (
            <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
          ))}
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          {[
            { cmd: () => execC('insertUnorderedList'), icon: List, title: 'Список' },
            { cmd: () => { const u=prompt('URL:'); if(u) execC('createLink',u); }, icon: Link, title: 'Ссылка' },
          ].map((b,i) => (
            <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
          ))}
        </div>
        <RichEditor
          html={data.html}
          onUpdate={onCalloutHtml}
          className="min-h-[48px] px-3 py-2 text-[13px] text-neutral-900 leading-relaxed focus:outline-none [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          placeholder="Текст подсказки..."
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Иконка</label>
          <div className="flex gap-1 flex-wrap">
            {CALLOUT_ICONS.map(c => {
              const CIcon = c.icon;
              return <button type="button" key={c.id} onClick={() => onChange({...data, icon: c.id})}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${data.icon === c.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`} title={c.label}>
                <CIcon className="w-3.5 h-3.5" />
              </button>;
            })}
          </div>
        </div>
        <ColorPicker value={data.iconColor} onChange={c => onChange({...data, iconColor: c})} label="Цвет иконки" />
        <ColorPicker value={data.bgColor} onChange={c => onChange({...data, bgColor: c})} label="Цвет фона" />
      </div>

      <div className="rounded-xl p-4 flex items-start gap-3" style={{backgroundColor: data.bgColor}}>
        {show && <div className="shrink-0 mt-0.5" style={{color: data.iconColor}}><IC className="w-5 h-5" /></div>}
        <div className="text-[13px] text-neutral-800 leading-relaxed flex-1 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{__html: data.html || '<p>Предпросмотр...</p>'}} />
      </div>
    </div>
  );
}

function ButtonBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex justify-center py-2">
        <div className="px-6 py-2.5 rounded-xl text-[13px] font-semibold shadow-lg hover:scale-105 transition-transform cursor-default"
          style={{backgroundColor: data.color, color: data.textColor}}>{data.text || 'Кнопка'}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Текст</label>
          <input type="text" value={data.text} onChange={e => onChange({...data, text: e.target.value})} placeholder="Кнопка..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 font-semibold" /></div>
        <div><label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Ссылка</label>
          <input type="text" value={data.url} onChange={e => onChange({...data, url: e.target.value})} placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" /></div>
      </div>
      <div className="flex flex-wrap gap-4">
        <ColorPicker value={data.color} onChange={c => onChange({...data, color: c})} label="Цвет кнопки" />
        <ColorPicker value={data.textColor} onChange={c => onChange({...data, textColor: c})} label="Цвет текста" />
      </div>
      <Toggle checked={data.isDivider} onChange={v => onChange({...data, isDivider: v})} label="Разделитель контента" description="Контент под кнопкой скрыт до нажатия" icon={EyeOff} />
    </div>
  );
}

function IframeBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4 space-y-3">
      <p className="text-[11px] text-neutral-400">Вставьте HTML/JS код. Контент адаптивно масштабируется под все устройства.</p>
      <textarea value={data.code} onChange={e => onChange({...data, code: e.target.value})}
        rows={6} placeholder={"<div>\n  <!-- HTML / JS код -->\n</div>"}
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[12px] font-mono text-neutral-800 placeholder-neutral-300 bg-neutral-900/[0.03] focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 resize-none" />
      {data.code && <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 flex flex-col items-center text-neutral-400 gap-1"><Code className="w-5 h-5" /><span className="text-[11px]">Превью</span></div>}
    </div>
  );
}

function TableBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const cells = data.cells || [[{html:''},{html:''}],[{html:''},{html:''}]];
  const colWidths: number[] = data.colWidths || [];
  const [activeCell, setActiveCell] = useState<{r:number,c:number}|null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const dragRef = useRef<{colIdx:number, startX:number, startW:number}|null>(null);

  const updateCell = (r: number, c: number, html: string) => {
    const n = cells.map((row: any[], ri: number) => row.map((cell: any, ci: number) => ri===r&&ci===c ? {...cell, html} : cell));
    onChange({...data, cells: n});
  };
  const updateCellColor = (color: string) => {
    if (!activeCell) return;
    const {r, c} = activeCell;
    const n = cells.map((row: any[], ri: number) => row.map((cell: any, ci: number) => ri===r&&ci===c ? {...cell, color} : cell));
    onChange({...data, cells: n});
  };

  const execT = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };
  const normCells = cells.map((row: any[]) => row.map((cell: any) => typeof cell === 'string' ? {html: cell} : cell));
  const numCols = normCells[0]?.length || 2;

  const onResizeStart = (e: React.MouseEvent, colIdx: number) => {
    e.preventDefault();
    const table = tableRef.current;
    if (!table) return;
    const thCells = table.querySelectorAll('tr:first-child td');
    const startW = (thCells[colIdx] as HTMLElement)?.offsetWidth || 100;
    dragRef.current = { colIdx, startX: e.clientX, startW };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const diff = ev.clientX - dragRef.current.startX;
      const newW = Math.max(40, dragRef.current.startW + diff);
      const nw = [...(colWidths.length === numCols ? colWidths : Array(numCols).fill(0))];
      if (!colWidths.length) {
        thCells.forEach((td, i) => { nw[i] = (td as HTMLElement).offsetWidth; });
      }
      nw[dragRef.current.colIdx] = newW;
      onChange({...data, colWidths: nw});
    };
    const onMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="px-4 py-4 space-y-3">
      {activeCell !== null && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border border-neutral-200 rounded-lg bg-white mb-2 flex-wrap">
          {[
            { cmd: () => execT('bold'), icon: Bold, title: 'Жирный' },
            { cmd: () => execT('italic'), icon: Italic, title: 'Курсив' },
            { cmd: () => execT('underline'), icon: Underline, title: 'Подчёркнутый' },
            { cmd: () => { const u=prompt('URL:'); if(u) execT('createLink',u); }, icon: Link, title: 'Ссылка' },
          ].map((b,i) => (
            <button type="button" key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"><b.icon className="w-3.5 h-3.5" /></button>
          ))}
          <ColorPickerBtn execFn={execT} />
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-neutral-400 font-semibold pl-1">Фон:</span>
            <input type="color" value={normCells[activeCell.r]?.[activeCell.c]?.color || '#ffffff'} onChange={e=>updateCellColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer p-0 border-0" />
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table ref={tableRef} className="w-full border-collapse" style={{tableLayout: colWidths.length ? 'fixed' : 'auto'}}>
          {colWidths.length > 0 && (
            <colgroup>
              {Array.from({length: numCols}).map((_, ci) => (
                <col key={ci} style={{width: colWidths[ci] ? `${colWidths[ci]}px` : 'auto'}} />
              ))}
              <col style={{width: '24px'}} />
            </colgroup>
          )}
          <tbody>{normCells.map((row: any[], ri: number) => (
            <tr key={ri}>{row.map((cell: any, ci: number) => (
              <td key={ci} style={{backgroundColor: cell.color || (ri===0&&data.headerRow?'#f5f5f5':'transparent')}}
                className={"border-r border-b border-neutral-200 last:border-r-0 p-0 transition-colors relative " + (ri===0&&data.headerRow?'font-semibold':'')}>
                <div onFocus={()=>setActiveCell({r:ri,c:ci})}>
                  <RichEditor
                    html={cell.html}
                    onUpdate={h=>updateCell(ri,ci,h)}
                    placeholder={ri===0&&data.headerRow?'Заголовок':''}
                    className="w-full px-2.5 py-2 min-h-[36px] text-[13px] text-neutral-800 focus:outline-none focus:bg-blue-50/20"
                  />
                </div>
                {ci < numCols - 1 && (
                  <div
                    onMouseDown={e => onResizeStart(e, ci)}
                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/40 transition-colors z-10"
                    style={{transform: 'translateX(50%)'}}
                  />
                )}
              </td>
            ))}<td className="w-6 border-b border-neutral-200 text-center">{normCells.length>1&&<button type="button" onClick={()=>onChange({...data,cells:normCells.filter((_: any,i: number)=>i!==ri)})} className="p-0.5 text-neutral-300 hover:text-rose-500"><X className="w-3.5 h-3.5 mx-auto" /></button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={()=>onChange({...data,cells:[...normCells,Array(normCells[0]?.length||2).fill({html:''})], colWidths})} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Строка</button>
        <button type="button" onClick={()=>{
          onChange({...data,
            cells:normCells.map((r: any[])=>[...r,{html:''}]),
            colWidths: colWidths.length ? [...colWidths, 100] : []
          })
        }} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Столбец</button>
        <div className="flex-1" />
        <Toggle checked={data.headerRow} onChange={v=>onChange({...data,headerRow:v})} label="Заголовок" />
      </div>
    </div>
  );
}

const COL_BLOCK_TYPES: {type:BlockType; icon:any; label:string}[] = [
  {type:'text',icon:Type,label:'Текст'},{type:'image',icon:ImageIcon,label:'Картинка'},
  {type:'video',icon:Video,label:'Видео'},{type:'audio',icon:Volume2,label:'Аудио'},{type:'table',icon:Table,label:'Таблица'},
  {type:'file',icon:FileText,label:'Файл'},
];

function ColumnsBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const count = data.count || 2;
  const cols: ContentBlock[][] = data.cols || Array.from({length:count}, ()=>[]);

  const addToCol = (colIdx: number, type: BlockType) => {
    const newBlock: ContentBlock = {id:mkId(), type, data: DEFAULT_BLOCK[type]()};
    const next = cols.map((c:ContentBlock[],i:number) => i===colIdx ? [...c, newBlock] : c);
    onChange({...data, cols: next});
  };
  const updateColBlock = (colIdx:number, blockId:string, blockData:any) => {
    const next = cols.map((c:ContentBlock[],i:number) => i===colIdx ? c.map((b:ContentBlock) => b.id===blockId ? {...b,data:blockData} : b) : c);
    onChange({...data, cols: next});
  };
  const deleteColBlock = (colIdx:number, blockId:string) => {
    const next = cols.map((c:ContentBlock[],i:number) => i===colIdx ? c.filter((b:ContentBlock) => b.id!==blockId) : c);
    onChange({...data, cols: next});
  };
  const [addMenuCol, setAddMenuCol] = useState<number|null>(null);

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Колонки</span>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
          {[2,3].map(n=>(
            <button type="button" key={n} onClick={()=>onChange({...data, count:n, cols: Array.from({length:n},(_, i) => cols[i]||[])})}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${count===n?'bg-white text-neutral-900 shadow-sm':'text-neutral-500'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div className={`grid gap-3 ${count===3?'grid-cols-3':'grid-cols-2'}`}>
        {Array.from({length: count}).map((_,colIdx)=> {
          const colBlocks: ContentBlock[] = cols[colIdx] || [];
          return (
            <div key={colIdx} className="border border-neutral-200 rounded-xl bg-neutral-50/20">
              <div className="px-2 py-1 bg-neutral-50 border-b border-neutral-100 text-[10px] font-semibold text-neutral-400 uppercase flex items-center justify-between">
                <span>Колонка {colIdx+1}</span>
                <span className="text-neutral-300 font-normal">{colBlocks.length}</span>
              </div>
              {colBlocks.length > 0 && <div className="p-2 space-y-1.5">
                {colBlocks.map((cb:ContentBlock) => {
                  const Ed = EDITORS[cb.type];
                  const meta = BLOCK_REG.find(r=>r.type===cb.type);
                  if (!Ed) return null;
                  return (
                    <div key={cb.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                      <div className="flex items-center justify-between px-2 py-1 bg-neutral-50 border-b border-neutral-100">
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase">{meta?.label}</span>
                        <button type="button" onClick={()=>deleteColBlock(colIdx,cb.id)} className="p-0.5 text-neutral-300 hover:text-rose-500"><X className="w-3 h-3" /></button>
                      </div>
                      <Ed data={cb.data} onChange={d=>updateColBlock(colIdx,cb.id,d)} />
                    </div>
                  );
                })}
              </div>}
              <div className={`relative px-2 pb-2 ${colBlocks.length === 0 ? 'pt-2' : ''}`}>
                <button type="button" onClick={()=>setAddMenuCol(addMenuCol===colIdx?null:colIdx)}
                  className="w-full py-1.5 border border-dashed border-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-400 hover:border-neutral-350 hover:text-neutral-600 flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
                {addMenuCol === colIdx && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={()=>setAddMenuCol(null)} />
                    <div className="absolute left-2 right-2 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[100]">
                      {COL_BLOCK_TYPES.map(bt => (
                        <button type="button" key={bt.type} onClick={()=>{addToCol(colIdx,bt.type);setAddMenuCol(null);}}
                          className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-50 text-[11px] text-neutral-700 font-semibold">
                          <bt.icon className="w-3 h-3 text-neutral-400 animate-none" /> {bt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold"><Info className="w-3 h-3" /> На мобильных колонки стакаются вертикально</p>
    </div>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────────

const BLOCK_REG: { type: BlockType; label: string; desc: string; icon: any; color: string }[] = [
  {type:'text',label:'Текст',desc:'Форматируемый блок',icon:Type,color:'text-neutral-600 bg-neutral-100'},
  {type:'video',label:'Видео',desc:'Загрузить видео',icon:Video,color:'text-rose-600 bg-rose-50'},
  {type:'audio',label:'Аудио',desc:'Загрузить аудиофайл',icon:Volume2,color:'text-cyan-600 bg-cyan-50'},
  {type:'image',label:'Картинка',desc:'Загрузить изображение',icon:ImageIcon,color:'text-blue-600 bg-blue-50'},
  {type:'slider',label:'Слайдер',desc:'Галерея изображений',icon:Layers,color:'text-violet-600 bg-violet-50'},
  {type:'file',label:'Файл',desc:'PDF, Excel и др.',icon:FileText,color:'text-amber-600 bg-amber-50'},
  {type:'callout',label:'Подсказка',desc:'Блок-сноска',icon:Info,color:'text-sky-600 bg-sky-50'},
  {type:'button',label:'Кнопка',desc:'Ссылка / разделитель',icon:MousePointer,color:'text-emerald-600 bg-emerald-50'},
  {type:'iframe',label:'Код',desc:'HTML / JS виджет',icon:Code,color:'text-purple-600 bg-purple-50'},
  {type:'table',label:'Таблица',desc:'Данные в таблице',icon:Table,color:'text-teal-600 bg-teal-50'},
  {type:'columns',label:'Колонки',desc:'Сетка 2–3',icon:Columns,color:'text-indigo-600 bg-indigo-50'},
];

const EDITORS: Record<BlockType, React.FC<{data:any;onChange:(d:any)=>void}>> = {
  text:TextBlockEditor,video:VideoBlockEditor,audio:AudioBlockEditor,image:ImageBlockEditor,
  file:FileBlockEditor,slider:SliderBlockEditor,callout:CalloutBlockEditor,
  button:ButtonBlockEditor,iframe:IframeBlockEditor,
  table:TableBlockEditor,columns:ColumnsBlockEditor,
};

// ─── Floating Bar ────────────────────────────────────────────────────────────

function FloatingBar({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <div className="fixed bottom-6 z-[80]" style={{left:'calc(50% + 120px)',transform:'translateX(-50%)'}}>
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-2.5 py-1.5 flex items-center gap-0.5">
        {BLOCK_REG.map(b=>(
          <div key={b.type} className="relative group/fb animate-none">
            <button type="button" onClick={()=>onAdd(b.type)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${b.color}`}>
              <b.icon className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 rounded-lg shadow-xl opacity-0 scale-95 group-hover/fb:opacity-100 group-hover/fb:scale-100 pointer-events-none transition-all whitespace-nowrap z-50">
              <p className="text-white text-[11px] font-semibold">{b.label}</p>
              <p className="text-neutral-400 text-[10px]">{b.desc}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Initial Mock Data ───────────────────────────────────────────────────────

const INITIAL_EVENTS = [
  { id: 'EVT-001', title: 'Основы искусственного интеллекта', type: 'Воркшоп', format: 'offline', date: '2026-03-28', timeStart: '10:00', timeEnd: '13:00', speakers: 'Азиз Каримов', location: 'Главный офис, Зал A', status: 'upcoming', registrationOpen: true, participants: 47, participantLimit: 60, parentId: 'f2', description: 'Практический воркшоп по внедрению современных AI-инструментов.' },
  { id: 'EVT-002', title: 'Эффективные переговоры', type: 'Тренинг', format: 'offline', date: '2026-04-02', timeStart: '09:00', timeEnd: '17:00', speakers: 'Бизнес-тренеры OCA', location: 'Учебный центр, комната 3', status: 'upcoming', registrationOpen: true, participants: 30, participantLimit: 30, parentId: 'f1', description: 'Развитие коммуникативных навыков ведения переговоров.' },
  { id: 'EVT-003', title: 'Финансовый риск-менеджмент', type: 'Вебинар', format: 'online', date: '2026-04-10', timeStart: '14:00', timeEnd: '16:00', speakers: 'Фаррух Юсупов, Елена Смирнова', location: 'Zoom трансляция', status: 'upcoming', registrationOpen: true, participants: 18, participantLimit: 100, parentId: 'f2', description: 'Изучение методов минимизации рисков.' }
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CreateEventPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const queryFolderId = searchParams.get('folderId');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Воркшоп');
  const [format, setFormat] = useState<'online' | 'offline'>('offline');
  const [location, setLocation] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [participantLimit, setParticipantLimit] = useState<string>('');
  
  // New event metadata states
  const [lang, setLang] = useState<'RUS' | 'UZB' | 'ENG'>('RUS');
  const [registrationType, setRegistrationType] = useState<'open' | 'private'>('open');
  const [status, setStatus] = useState<'draft' | 'registration' | 'in_progress' | 'completed'>('draft');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [scale, setScale] = useState<'Внутреннее' | 'Локальное' | 'Международное'>('Внутреннее');
  
  // Спикеры мероприятия в целом (на весь период)
  const [speakersList, setSpeakersList] = useState<string[]>([]);

  // Режим дат: набор отдельных дней или сплошной период «с … по …»
  const [dateMode, setDateMode] = useState<DateMode>('days');

  // Multiple event dates (multiple calendar days and times)
  const [dates, setDates] = useState<EventDate[]>([
    { id: 'd-1', date: '', timeStart: '10:00', timeEnd: '12:00', speakers: [] }
  ]);

  // Multiple registration dates (multiple calendar days and start/end times)
  const [registrationDates, setRegistrationDates] = useState<RegistrationPeriod[]>([
    { id: 'r-1', dateStart: '', timeStart: '09:00', dateEnd: '', timeEnd: '18:00' }
  ]);

  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  // Drag and drop states for blocks
  const dragIdxRef = useRef<number|null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [insertIdx, setInsertIdx] = useState<number | null>(null);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('osnova_events');
      const eventsList: EventItem[] = stored ? JSON.parse(stored) : INITIAL_EVENTS.map(ev => ({
        ...ev,
        format: ev.format as 'online' | 'offline',
        description: ev.description || 'Описание мероприятия.',
        dates: [{ id: 'd1', date: ev.date, timeStart: ev.timeStart, timeEnd: ev.timeEnd }],
        registrationDates: [{ id: 'r1', dateStart: ev.date, timeStart: '08:00', dateEnd: ev.date, timeEnd: ev.timeStart }],
        blocks: []
      }));

      if (eventId) {
        const found = eventsList.find(e => e.id === eventId);
        if (found) {
          setTitle(found.title);
          setType(found.type);
          setFormat(found.format);
          setLocation(found.location);
          setRegistrationOpen(found.registrationOpen);
          setParticipantLimit(found.participantLimit ? found.participantLimit.toString() : '');
          if (found.dates && found.dates.length > 0) setDates(found.dates);
          if (found.registrationDates && found.registrationDates.length > 0) setRegistrationDates(found.registrationDates);
          setDateMode(found.dateMode || 'days');
          setSpeakersList(
            found.speakersList
            || (found.speakers && found.speakers !== 'Спикеры не добавлены'
                ? found.speakers.split(',').map(s => s.trim()).filter(Boolean)
                : [])
          );
          setBlocks(found.blocks || []);
          setLang(found.lang || 'RUS');
          setRegistrationType(found.registrationType || 'open');
          setStatus(found.status || 'draft');
          setCreatedAt(found.createdAt || '');
          setScale(found.scale || 'Внутреннее');
        }
      }
    }
  }, [eventId]);

  const addDateRow = () => {
    setDates(prev => [...prev, { id: `d-${Date.now()}`, date: '', timeStart: '10:00', timeEnd: '12:00', speakers: [] }]);
  };

  const removeDateRow = (id: string) => {
    if (dates.length > 1) {
      setDates(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateDateRow = (id: string, field: 'date' | 'dateEnd' | 'timeStart' | 'timeEnd', value: string) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const updateDateSpeakers = (id: string, speakers: string[]) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, speakers } : d));
  };

  // Переключение режима: дни ⇄ период. Данные не теряются — схлопываем/разворачиваем первую строку.
  const switchDateMode = (mode: DateMode) => {
    if (mode === dateMode) return;
    setDates(prev => {
      const first = prev[0] || { id: 'd-1', date: '', timeStart: '10:00', timeEnd: '12:00', speakers: [] };
      if (mode === 'period') {
        const last = prev[prev.length - 1];
        // спикеры всех дней собираем в один список периода, без дублей
        const merged: string[] = [];
        prev.forEach(d => (d.speakers || []).forEach(s => {
          if (!merged.some(m => m.toLowerCase() === s.toLowerCase())) merged.push(s);
        }));
        return [{
          ...first,
          dateEnd: first.dateEnd || (prev.length > 1 ? last.date : ''),
          timeEnd: last.timeEnd || first.timeEnd,
          speakers: merged,
        }];
      }
      // обратно в дни — дата окончания периода больше не нужна
      return prev.map(d => { const { dateEnd, ...rest } = d; return rest; });
    });
    setDateMode(mode);
  };

  const periodRow = dates[0] || { id: 'd-1', date: '', dateEnd: '', timeStart: '10:00', timeEnd: '12:00', speakers: [] };

  const regPeriod = registrationDates[0] || { id: 'r-1', dateStart: '', timeStart: '09:00', dateEnd: '', timeEnd: '18:00' };

  const updateRegPeriod = (field: keyof RegistrationPeriod, value: string) => {
    setRegistrationDates(prev => {
      const first = prev[0] || { id: 'r-1', dateStart: '', timeStart: '09:00', dateEnd: '', timeEnd: '18:00' };
      const updated = { ...first, [field]: value };
      return [updated];
    });
  };

  const addBlock = (type: BlockType) => {
    const newBlock = { id: mkId(), type, data: DEFAULT_BLOCK[type]() };
    if (insertIdx !== null) {
      setBlocks(prev => {
        const next = [...prev];
        next.splice(insertIdx, 0, newBlock);
        return next;
      });
      setInsertIdx(insertIdx + 1);
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  const updateBlock = (id:string, data:any) => setBlocks(p=>p.map(b=>b.id===id?{...b,data}:b));
  const deleteBlock = (id:string) => setBlocks(p=>p.filter(b=>b.id!==id));
  const dupBlock = (id:string) => {
    const s=blocks.find(b=>b.id===id);if(!s)return;
    const i=blocks.findIndex(b=>b.id===id);
    setBlocks(p=>[...p.slice(0,i+1),{...s,id:mkId(),data:JSON.parse(JSON.stringify(s.data))},...p.slice(i+1)]);
  };
  const moveBlock = (from:number, to:number) => {
    setBlocks(p=>{const n=[...p];const[m]=n.splice(from,1);n.splice(to,0,m);return n;});
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragIdxRef.current = idx;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    const el = (e.target as HTMLElement).closest('[data-block]');
    if (el) e.dataTransfer.setDragImage(el as HTMLElement, 20, 20);
  };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdxRef.current !== null && dragIdxRef.current !== idx) moveBlock(dragIdxRef.current, idx);
    dragIdxRef.current = null; setDragOverIdx(null); setIsDragging(false);
  };
  const handleDragEnd = () => { dragIdxRef.current=null; setDragOverIdx(null); setIsDragging(false); };

  const handleLimitChange = (val: string) => {
    if (val === '') {
      setParticipantLimit('');
    } else {
      const parsed = parseInt(val);
      if (!isNaN(parsed)) {
        setParticipantLimit(Math.max(1, parsed).toString());
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('osnova_events');
      let eventsList: EventItem[] = stored ? JSON.parse(stored) : INITIAL_EVENTS.map(ev => ({
        ...ev,
        format: ev.format as 'online' | 'offline',
        description: ev.description || 'Описание мероприятия.',
        dates: [{ id: 'd1', date: ev.date, timeStart: ev.timeStart, timeEnd: ev.timeEnd }],
        registrationDates: [{ id: 'r1', dateStart: ev.date, timeStart: '08:00', dateEnd: ev.date, timeEnd: ev.timeStart }],
        blocks: []
      }));

      const primaryDate = dates[0]?.date || new Date().toISOString().split('T')[0];
      const primaryTimeStart = dates[0]?.timeStart || '10:00';
      const primaryTimeEnd = dates[0]?.timeEnd || '12:00';

      // В списке мероприятий спикеры показываются одной строкой:
      // сначала спикеры мероприятия, затем уникальные спикеры отдельных дней.
      const allSpeakers = [...speakersList];
      dates.forEach(d => (d.speakers || []).forEach(s => {
        if (!allSpeakers.some(v => v.toLowerCase() === s.toLowerCase())) allSpeakers.push(s);
      }));
      const speakersStr = allSpeakers.join(', ') || 'Спикеры не добавлены';

      if (eventId) {
        // Edit existing
        eventsList = eventsList.map(ev => ev.id === eventId ? {
          ...ev,
          title,
          type,
          format,
          location,
          registrationOpen,
          participantLimit: participantLimit ? parseInt(participantLimit) : null,
          date: primaryDate,
          timeStart: primaryTimeStart,
          timeEnd: primaryTimeEnd,
          dateMode,
          dates,
          registrationDates,
          blocks,
          speakers: speakersStr,
          speakersList,
          lang,
          registrationType,
          status,
          createdAt: createdAt || ev.createdAt || new Date().toISOString(),
          scale
        } : ev);
      } else {
        // Create new
        const newEvent: EventItem = {
          id: `EVT-${Math.floor(100 + Math.random() * 900)}`,
          title,
          type,
          format,
          location,
          status,
          registrationOpen,
          participants: 0,
          participantLimit: participantLimit ? parseInt(participantLimit) : null,
          parentId: queryFolderId || null,
          description: blocks.find(b => b.type === 'text')?.data.html.replace(/<[^>]*>/g, '').slice(0, 160) || 'Описание отсутствует',
          speakers: speakersStr,
          speakersList,
          date: primaryDate,
          timeStart: primaryTimeStart,
          timeEnd: primaryTimeEnd,
          dateMode,
          dates,
          registrationDates,
          blocks,
          lang,
          registrationType,
          createdAt: new Date().toISOString(),
          scale
        };
        eventsList = [newEvent, ...eventsList];
      }

      localStorage.setItem('osnova_events', JSON.stringify(eventsList));
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/events');
    }, 800);
  };

  const typeOpts = [
    { id: 'Воркшоп', label: 'Воркшоп' },
    { id: 'Тренинг', label: 'Тренинг' },
    { id: 'Вебинар', label: 'Вебинар' },
    { id: 'Конференция', label: 'Конференция' },
    { id: 'Мастер-Класс', label: 'Мастер-Класс' },
    { id: 'Тимбилдинг', label: 'Тимбилдинг' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[var(--bg-app)] flex flex-col w-full relative">
      <PageHeader
        breadcrumbs={[
          { label: 'Мероприятия', onClick: () => router.push('/events') },
          { label: title || 'Новое мероприятие' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-[13px] text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" /> Сохранено
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/events')}
              className="font-semibold text-neutral-600 border-neutral-200 bg-white hover:bg-neutral-50 h-10 px-5"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!title.trim()}
              className="gap-2 text-[13px] font-bold shadow-md h-10 px-5"
            >
              <Save className="w-4 h-4" /> Сохранить
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-8 w-full flex-1 flex flex-col gap-6" style={{ paddingBottom: '140px' }}>
        
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Название мероприятия..."
          className="w-full text-[28px] font-black text-neutral-900 placeholder-neutral-300 border-0 focus:outline-none bg-transparent leading-tight mt-2 outline-none"
        />

        {/* Collapsible Settings */}
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm z-20 relative overflow-hidden">
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50/50 transition-colors ${settingsOpen ? 'border-b border-neutral-100' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-600)] flex items-center justify-center border border-[var(--color-admin-primary-100)]">
                <CalendarClock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[15px] font-extrabold text-neutral-900 tracking-tight">Параметры мероприятия</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>

          {settingsOpen && (
            <div className="p-6 space-y-6 bg-white">
              
              {/* Type and Scale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Тип мероприятия</label>
                  <Dropdown value={type} options={typeOpts} onChange={setType} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Масштаб мероприятия</label>
                  <Dropdown
                    value={scale}
                    options={[
                      { id: 'Внутреннее', label: 'Внутреннее' },
                      { id: 'Локальное', label: 'Локальное' },
                      { id: 'Международное', label: 'Международное' },
                    ]}
                    onChange={(id) => setScale(id as 'Внутреннее' | 'Локальное' | 'Международное')}
                  />
                </div>
              </div>

              {/* Language and Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Язык</label>
                  <Dropdown 
                    value={lang} 
                    options={[
                      { id: 'RUS', label: 'Русский (RUS)' },
                      { id: 'UZB', label: 'Узбекский (UZB)' },
                      { id: 'ENG', label: 'Английский (ENG)' },
                    ]} 
                    onChange={(id) => setLang(id as 'RUS' | 'UZB' | 'ENG')} 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Формат проведения</label>
                  <div className="flex bg-neutral-100 p-1 rounded-xl w-full border border-neutral-200/50 h-[46px]">
                    <button
                      type="button"
                      onClick={() => setFormat('offline')}
                      className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${format === 'offline' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <MapPin className="w-4 h-4 text-orange-500 animate-none" />
                      Оффлайн
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('online')}
                      className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${format === 'online' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <Video className="w-4 h-4 text-violet-500 animate-none" />
                      Онлайн
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Input dynamically changed based on Format */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                  {format === 'offline' ? 'Место проведения' : 'Ссылка на трансляцию'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    {format === 'offline' ? <MapPin className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={format === 'offline' ? "Введите адрес, аудиторию или название зала" : "Вставьте ссылку на Zoom, Teams, YouTube и т.д."}
                    className="w-full h-11 pl-11 pr-4 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 focus:border-[var(--color-admin-primary-500)] focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 transition-all rounded-xl outline-none font-semibold text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Multi-date Event Times */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Даты проведения мероприятия</label>

                  {/* Режим: отдельные дни или сплошной период */}
                  <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/50 h-9 shrink-0">
                    <button
                      type="button"
                      onClick={() => switchDateMode('days')}
                      className={`px-3.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${dateMode === 'days' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      По дням
                    </button>
                    <button
                      type="button"
                      onClick={() => switchDateMode('period')}
                      className={`px-3.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${dateMode === 'period' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      Периодом
                    </button>
                  </div>
                </div>

                {dateMode === 'period' ? (
                  /* ── Период: с даты по дату ─────────────────────────────── */
                  <div className="bg-neutral-50/50 border border-neutral-200/60 p-3.5 rounded-2xl w-full space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Дата начала</span>
                        <input
                          type="date"
                          value={periodRow.date}
                          onChange={e => updateDateRow(periodRow.id, 'date', e.target.value)}
                          className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Дата окончания</span>
                        <input
                          type="date"
                          min={periodRow.date || undefined}
                          value={periodRow.dateEnd || ''}
                          onChange={e => updateDateRow(periodRow.id, 'dateEnd', e.target.value)}
                          className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время начала</span>
                        <input
                          type="time"
                          value={periodRow.timeStart}
                          onChange={e => updateDateRow(periodRow.id, 'timeStart', e.target.value)}
                          className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время окончания</span>
                        <input
                          type="time"
                          value={periodRow.timeEnd}
                          onChange={e => updateDateRow(periodRow.id, 'timeEnd', e.target.value)}
                          className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>

                    {periodRow.dateEnd && periodRow.date && periodRow.dateEnd < periodRow.date && (
                      <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 pl-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Дата окончания раньше даты начала
                      </p>
                    )}

                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Спикеры периода</span>
                      <SpeakerTags
                        compact
                        value={periodRow.speakers || []}
                        onChange={v => updateDateSpeakers(periodRow.id, v)}
                        placeholder="Иванов Иван, Петрова Мария — через запятую"
                      />
                    </div>
                  </div>
                ) : (
                  /* ── По дням ────────────────────────────────────────────── */
                  <div className="space-y-3">
                    {dates.map((d, index) => (
                      <div key={d.id} className="flex flex-col sm:flex-row items-start gap-3 bg-neutral-50/50 border border-neutral-200/60 p-3.5 rounded-2xl w-full">
                        <div className="flex-1 min-w-0 space-y-3 w-full">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">День {index + 1}</span>
                              <input
                                type="date"
                                value={d.date}
                                onChange={e => updateDateRow(d.id, 'date', e.target.value)}
                                className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время начала</span>
                              <input
                                type="time"
                                value={d.timeStart}
                                onChange={e => updateDateRow(d.id, 'timeStart', e.target.value)}
                                className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время окончания</span>
                              <input
                                type="time"
                                value={d.timeEnd}
                                onChange={e => updateDateRow(d.id, 'timeEnd', e.target.value)}
                                className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Спикеры дня {index + 1}</span>
                            <SpeakerTags
                              compact
                              value={d.speakers || []}
                              onChange={v => updateDateSpeakers(d.id, v)}
                              placeholder="Иванов Иван, Петрова Мария — через запятую"
                            />
                          </div>
                        </div>

                        {dates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDateRow(d.id)}
                            className="mt-5 sm:mt-[22px] p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 shrink-0"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDateRow}
                      className="h-10 border-2 border-dashed border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-700 bg-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all w-full shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Добавить день
                    </button>
                  </div>
                )}
              </div>

              {/* Спикеры мероприятия целиком */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Спикеры мероприятия
                </label>
                <SpeakerTags
                  value={speakersList}
                  onChange={setSpeakersList}
                  placeholder="Введите ФИО и нажмите Enter или запятую"
                />
                <p className="text-[11px] text-neutral-400 font-medium pl-1">
                  Общие спикеры на весь период. Двойной клик по лейблу — изменить, крестик — удалить.
                </p>
              </div>

              {/* Registration Period */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Период регистрации участников</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50/50 border border-neutral-200/60 p-3.5 rounded-2xl w-full">
                  
                  {/* Start Period */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Дата открытия</span>
                    <input
                      type="date"
                      value={regPeriod.dateStart}
                      onChange={e => updateRegPeriod('dateStart', e.target.value)}
                      className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время открытия</span>
                    <input
                      type="time"
                      value={regPeriod.timeStart}
                      onChange={e => updateRegPeriod('timeStart', e.target.value)}
                      className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>

                  {/* End Period */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Дата закрытия</span>
                    <input
                      type="date"
                      value={regPeriod.dateEnd}
                      onChange={e => updateRegPeriod('dateEnd', e.target.value)}
                      className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase pl-1">Время закрытия</span>
                    <input
                      type="time"
                      value={regPeriod.timeEnd}
                      onChange={e => updateRegPeriod('timeEnd', e.target.value)}
                      className="h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>

                </div>
              </div>

              {/* Toggle: Registration Open & Limit Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100 pt-6">
                <div>
                  <Toggle
                    checked={registrationOpen}
                    onChange={(v) => {
                      setRegistrationOpen(v);
                      setRegistrationType(v ? 'open' : 'private');
                    }}
                    label="Регистрация открыта"
                    description="Пользователи смогут самостоятельно записываться на мероприятие"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Лимит участников</label>
                  <input
                    type="number"
                    min="1"
                    value={participantLimit}
                    onChange={e => handleLimitChange(e.target.value)}
                    placeholder="Без лимита"
                    className="w-full h-11 px-4 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 focus:border-[var(--color-admin-primary-500)] focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 transition-all rounded-xl outline-none font-semibold text-sm shadow-sm"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Content Heading */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-extrabold text-neutral-900 tracking-tight">Содержание мероприятия</h2>
          <span className="text-xs text-neutral-400 font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
            {blocks.length} {blocks.length === 1 ? 'блок' : blocks.length > 1 && blocks.length < 5 ? 'блока' : 'блоков'}
          </span>
        </div>

        {/* Blocks builder */}
        {blocks.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-200 rounded-3xl p-16 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
              <CalendarDays className="w-6 h-6 text-neutral-300" />
            </div>
            <h3 className="font-extrabold text-neutral-800 text-base mb-1">Наполните мероприятие контентом</h3>
            <p className="text-[13px] text-neutral-400 max-w-sm font-medium leading-relaxed">
              Добавляйте тексты, изображения, расписание, презентации и видеоролики с помощью панели внизу экрана
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, idx) => {
              const meta = BLOCK_REG.find(b => b.type === block.type);
              const Ed = EDITORS[block.type];
              const over = dragOverIdx === idx && dragIdxRef.current !== idx;

              if (!Ed) return null;

              return (
                <React.Fragment key={block.id}>
                  <div
                    data-block
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border rounded-3xl shadow-sm transition-all overflow-hidden ${
                      over ? 'border-[var(--color-admin-primary-500)] ring-4 ring-[var(--color-admin-primary-200)]/30 scale-[1.01] z-30' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <BlockToolbar
                      index={idx}
                      total={blocks.length}
                      onMoveUp={() => moveBlock(idx, idx - 1)}
                      onMoveDown={() => moveBlock(idx, idx + 1)}
                      onDuplicate={() => dupBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      label={meta?.label || block.type}
                      onDragStart={e => handleDragStart(e, idx)}
                    />
                    <Ed data={block.data} onChange={d => updateBlock(block.id, d)} />
                    {block.type === 'button' && block.data.isDivider && (
                      <div className="px-4 pb-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                          <EyeOff className="w-3.5 h-3.5" /> Контент ниже скрыт до взаимодействия
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`relative h-10 flex items-center justify-center -my-2 z-10 transition-all ${
                    insertIdx === idx + 1 ? "opacity-100 scale-100" : "opacity-0 hover:opacity-100 scale-95"
                  }`}>
                    <div className={`absolute inset-x-8 h-px transition-colors ${
                      insertIdx === idx + 1 ? "bg-[var(--color-admin-primary-500)]" : "bg-neutral-300"
                    }`} />
                    <button
                      type="button"
                      onClick={() => setInsertIdx(insertIdx === idx + 1 ? null : idx + 1)}
                      className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-sm border ${
                        insertIdx === idx + 1 ? "text-[var(--color-admin-primary-750)] bg-[var(--color-admin-primary-50)] border-[var(--color-admin-primary-200)]" : "text-neutral-600 bg-neutral-100 border-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      {insertIdx === idx + 1 ? "Вставка блока сюда..." : "Вставить блок здесь"}
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Panel (no import, no exercises/questions/scales) */}
      <FloatingBar onAdd={addBlock} />

    </div>
  );
}

export default function CreateEventPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-neutral-400 font-semibold">Загрузка...</div>}>
      <CreateEventPageContent />
    </React.Suspense>
  );
}
