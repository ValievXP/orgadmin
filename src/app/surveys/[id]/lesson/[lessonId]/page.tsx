"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  ChevronDown, X, Plus, Trash2, Save, Check, Search,
  Clock, Unlock, Lock, CalendarClock, Timer,
  MessageSquare, Star, BookOpen, GripVertical,
  Video, FileText, Type, Image as ImageIcon, Layers,
  AlertTriangle, MousePointer, Code, Table, Columns,
  ChevronUp, ChevronRight, Copy, Eye, EyeOff,
  Upload, Play, Download, ExternalLink, FolderOpen,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Quote, Strikethrough, Heading1, Heading2, Heading3,
  Zap, Info, AlertCircle, HelpCircle, Lightbulb, Shield, XCircle, CheckCircle,
  CircleDot, CheckSquare, Minus, Pipette, MessageCircle, Volume2, Music, Monitor, Smartphone
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AccessStatus = 'open' | 'closed' | 'scheduled' | 'limited';
type BlockType = 'video' | 'audio' | 'file' | 'text' | 'image' | 'slider' | 'callout' | 'button' | 'exercise' | 'iframe' | 'table' | 'columns';

interface LessonSettings {
  title: string;
  accessStatus: AccessStatus;
  scheduledDate: string;
  startDate: string;
  endDate: string;
  ratingEnabled: boolean;
  reviewEnabled: boolean;
  homeworkEnabled: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
}

interface ExerciseAnswer {
  id: string;
  text: string;
  description: string;
  imageUrl: string;
  isCorrect: boolean;
}

interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

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
  exercise: () => ({
    type: 'radio' as 'radio' | 'checkbox',
    question: '', questionImage: '',
    answers: [
      { id: mkId(), text: '', description: '', imageUrl: '', isCorrect: false },
      { id: mkId(), text: '', description: '', imageUrl: '', isCorrect: false },
    ] as ExerciseAnswer[],
    isDivider: false,
  }),
  iframe: () => ({ code: '' }),
  table: () => ({ cells: [['', '', ''], ['', '', ''], ['', '', '']], headerRow: true }),
  columns: () => ({ count: 2, cols: [[], []] as ContentBlock[][] }),
};

// ─── Mock ────────────────────────────────────────────────────────────────────

const MOCK: LessonSettings = {
  title: 'Введение в корпоративную безопасность',
  accessStatus: 'open',
  scheduledDate: '', startDate: '', endDate: '',
  ratingEnabled: true, reviewEnabled: false,
  homeworkEnabled: false, timerEnabled: true, timerMinutes: 5,
};

const MOCK_BLOCKS: ContentBlock[] = [
  { id: 'b1', type: 'text', data: { html: '<p>В этом уроке мы рассмотрим основные принципы корпоративной безопасности.</p>' } },
  { id: 'b2', type: 'video', data: { fileName: 'intro_lecture.mp4' } },
  { id: 'b3', type: 'callout', data: { icon: 'info', html: '<p>Материалы этого урока обязательны для изучения перед тестом.</p>', iconColor: '#378CFF', bgColor: '#EBF5FF' } },
];

const MOCK_IMPORT_COURSES = [
  { id: 'c1', title: 'Основы кибербезопасности', lessons: [
    { id: 'l1', title: 'Введение', blocks: [
      { type: 'video' as BlockType, label: 'Вводная лекция.mp4' },
      { type: 'text' as BlockType, label: 'Основные понятия' },
      { type: 'file' as BlockType, label: 'Методичка.pdf' },
    ]},
    { id: 'l2', title: 'Фишинг', blocks: [
      { type: 'video' as BlockType, label: 'Как распознать фишинг.mp4' },
      { type: 'text' as BlockType, label: 'Признаки фишинговых писем' },
      { type: 'exercise' as BlockType, label: 'Тест по фишингу' },
    ]},
  ]},
  { id: 'c2', title: 'Управление проектами', lessons: [
    { id: 'l3', title: 'Scrum', blocks: [
      { type: 'text' as BlockType, label: 'Основы Scrum' },
      { type: 'slider' as BlockType, label: 'Схемы процессов (5 слайдов)' },
      { type: 'file' as BlockType, label: 'Шаблон_спринта.xlsx' },
    ]},
  ]},
];

// ═══ Primitives ══════════════════════════════════════════════════════════════

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
      <button onClick={() => onChange(!checked)}
        className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ml-3 ${checked ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
        <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : ''}`} />
      </button>
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
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-white text-[13px] text-neutral-900 transition-all">
        <div className="flex items-center gap-2">
          {sel?.dot && <div className={`w-2 h-2 rounded-full ${sel.dot}`} />}
          {sel?.label}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100]">
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
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
      <button ref={btnRef} onClick={handleOpen}
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
                <button key={c} onClick={() => { onChange(c); setHex(c); }}
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

// ═══ Block Toolbar ═══════════════════════════════════════════════════════════

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
      <div className="flex items-center gap-0.5">
        <button onClick={onMoveUp} disabled={index === 0} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
        <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
        <button onClick={onDuplicate} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ═══ Import Modal ════════════════════════════════════════════════════════════

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (blocks: ContentBlock[]) => void }) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [mode, setMode] = useState<'full' | 'items'>('full');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const course = MOCK_IMPORT_COURSES.find(c => c.id === courseId);
  const lesson = course?.lessons.find(l => l.id === lessonId);

  useEffect(() => {
    if (lesson) setSelected(new Set(lesson.blocks.map((_, i) => i)));
  }, [lessonId]);

  const handleImport = () => {
    if (!lesson) return;
    const indices = mode === 'full' ? lesson.blocks.map((_, i) => i) : Array.from(selected);
    const newBlocks: ContentBlock[] = indices.map(i => {
      const src = lesson.blocks[i];
      return { id: mkId(), type: src.type, data: { ...DEFAULT_BLOCK[src.type](), ...(src.type === 'video' ? { fileName: src.label } : src.type === 'file' ? { name: src.label, size: '2.4 MB' } : src.type === 'text' ? { html: `<p>${src.label}</p>` } : {}) } };
    });
    onImport(newBlocks);
    onClose();
  };

  const toggleItem = (i: number) => setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">Импорт из курса</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">Скопированные элементы добавятся в текущий урок</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {!courseId ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Курсы</p>
                {MOCK_IMPORT_COURSES.map(c => (
                  <button key={c.id} onClick={() => setCourseId(c.id)}
                    className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-neutral-500" /></div>
                    <div className="flex-1"><p className="text-[13px] font-medium text-neutral-800">{c.title}</p><p className="text-[11px] text-neutral-400">{c.lessons.length} уроков</p></div>
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  </button>
                ))}
              </div>
            ) : !lessonId ? (
              <div className="space-y-2">
                <button onClick={() => setCourseId(null)} className="text-[12px] text-neutral-500 hover:text-neutral-700 flex items-center gap-1 mb-2"><ChevronUp className="w-3 h-3 -rotate-90" /> Назад</button>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">{course?.title}</p>
                {course?.lessons.map(l => (
                  <button key={l.id} onClick={() => setLessonId(l.id)}
                    className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-blue-500" /></div>
                    <div className="flex-1"><p className="text-[13px] font-medium text-neutral-800">{l.title}</p><p className="text-[11px] text-neutral-400">{l.blocks.map(b => b.label).join(' · ')}</p></div>
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => setLessonId(null)} className="text-[12px] text-neutral-500 hover:text-neutral-700 flex items-center gap-1 mb-1"><ChevronUp className="w-3 h-3 -rotate-90" /> Назад</button>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-[13px] font-semibold text-neutral-800">{lesson?.title}</p>
                </div>
                <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                  <button onClick={() => setMode('full')} className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all ${mode === 'full' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}>Весь урок</button>
                  <button onClick={() => setMode('items')} className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all ${mode === 'items' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}>Выбрать</button>
                </div>
                {mode === 'items' && (
                  <div className="space-y-1">
                    {lesson?.blocks.map((b, i) => {
                      const meta = BLOCK_REG.find(r => r.type === b.type);
                      return (
                        <label key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 cursor-pointer">
                          <input type="checkbox" checked={selected.has(i)} onChange={() => toggleItem(i)} className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${meta?.color || 'bg-neutral-100 text-neutral-500'}`}>
                            {meta && <meta.icon className="w-3 h-3" />}
                          </div>
                          <span className="text-[13px] text-neutral-700">{b.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          {lessonId && (
            <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-neutral-600 hover:bg-neutral-100">Отмена</button>
              <button onClick={handleImport} disabled={mode === 'items' && selected.size === 0}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-colors">
                Импортировать {mode === 'items' ? `(${selected.size})` : ''}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══ Rich Editor (prevents cursor jump) ═════════════════════════════════════

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

// ═══ Block Editors ═══════════════════════════════════════════════════════════

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
          <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('bold'), icon: Bold, title: 'Жирный' },
          { cmd: () => exec('italic'), icon: Italic, title: 'Курсив' },
          { cmd: () => exec('underline'), icon: Underline, title: 'Подчёркнутый' },
          { cmd: () => exec('strikeThrough'), icon: Strikethrough, title: 'Зачёркнутый' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('justifyLeft'), icon: AlignLeft, title: 'Лево' },
          { cmd: () => exec('justifyCenter'), icon: AlignCenter, title: 'Центр' },
          { cmd: () => exec('justifyRight'), icon: AlignRight, title: 'Право' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
        <div className="w-px h-5 bg-neutral-200 mx-0.5" />
        {[
          { cmd: () => exec('insertUnorderedList'), icon: List, title: 'Список' },
          { cmd: () => exec('insertOrderedList'), icon: ListOrdered, title: 'Нумерация' },
          { cmd: () => exec('formatBlock', 'blockquote'), icon: Quote, title: 'Цитата' },
          { cmd: () => { const url = prompt('Введите URL:'); if (url) exec('createLink', url); }, icon: Link, title: 'Ссылка' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" title={b.title}><b.icon className="w-3.5 h-3.5" /></button>
        ))}
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
            <button onClick={() => onChange({ ...data, fileName: '' })} className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <div className="relative rounded-xl overflow-hidden group/i bg-neutral-100"><img src={data.url} alt="" className="w-full max-h-64 object-contain" /><button onClick={() => onChange({...data, url:''})} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/i:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button></div>
          <input type="text" value={data.caption||''} onChange={e => onChange({...data, caption: e.target.value})} placeholder="Подпись..." className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] text-neutral-700 placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none text-center italic" />
        </div>
      ) : (
        <button className="w-full h-28 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer group">
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
        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-neutral-800 truncate">{data.name}</p><p className="text-[11px] text-neutral-400">{data.size}</p></div>
          <button onClick={() => onChange({name:'',size:''})} className="p-1 rounded text-neutral-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <button className="w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50/50 transition-all cursor-pointer">
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
            <button onClick={() => onChange({...data, images: imgs.filter((_:any,i:number) => i !== idx)})}
              className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover/s:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
          </div>
        ))}
        <button onClick={() => onChange({...data, images: [...imgs, {id: mkId(), url:''}]})}
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
      {/* Rich text editor */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-neutral-100 bg-neutral-50/50 flex-wrap">
          {[
            { cmd: () => execC('bold'), icon: Bold, title: 'Жирный' },
            { cmd: () => execC('italic'), icon: Italic, title: 'Курсив' },
            { cmd: () => execC('underline'), icon: Underline, title: 'Подчёркнутый' },
          ].map((b,i) => (
            <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" title={b.title}><b.icon className="w-3 h-3" /></button>
          ))}
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          {[
            { cmd: () => execC('insertUnorderedList'), icon: List, title: 'Список' },
            { cmd: () => { const u=prompt('URL:'); if(u) execC('createLink',u); }, icon: Link, title: 'Ссылка' },
          ].map((b,i) => (
            <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" title={b.title}><b.icon className="w-3 h-3" /></button>
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
              return <button key={c.id} onClick={() => onChange({...data, icon: c.id})}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${data.icon === c.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`} title={c.label}>
                <CIcon className="w-3.5 h-3.5" />
              </button>;
            })}
          </div>
        </div>
        <ColorPicker value={data.iconColor} onChange={c => onChange({...data, iconColor: c})} label="Цвет иконки" />
        <ColorPicker value={data.bgColor} onChange={c => onChange({...data, bgColor: c})} label="Цвет фона" />
      </div>

      {/* Preview below */}
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
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" /></div>
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

function ExerciseBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const answers: ExerciseAnswer[] = data.answers || [];
  const setCorrect = (id: string) => {
    if (data.type === 'radio') onChange({...data, answers: answers.map((a: ExerciseAnswer) => ({...a, isCorrect: a.id === id}))});
    else onChange({...data, answers: answers.map((a: ExerciseAnswer) => a.id === id ? {...a, isCorrect: !a.isCorrect} : a)});
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
          <button onClick={() => onChange({...data, type:'radio'})} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${data.type==='radio'?'bg-white text-neutral-900 shadow-sm':'text-neutral-500'}`}><CircleDot className="w-3 h-3" /> Один</button>
          <button onClick={() => onChange({...data, type:'checkbox'})} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${data.type==='checkbox'?'bg-white text-neutral-900 shadow-sm':'text-neutral-500'}`}><CheckSquare className="w-3 h-3" /> Несколько</button>
        </div>
        <Toggle checked={data.isDivider} onChange={v => onChange({...data, isDivider: v})} label="Разделитель" icon={EyeOff} />
      </div>

      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})}
        placeholder="Введите вопрос..."
        className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />

      {data.questionImage ? (
        <div className="relative rounded-lg overflow-hidden h-28 bg-neutral-100 group/qi">
          <img src={data.questionImage} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange({...data, questionImage:''})} className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover/qi:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <button className="w-full h-12 border border-dashed border-neutral-200 rounded-lg flex items-center justify-center gap-2 text-[11px] text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 transition-all">
          <ImageIcon className="w-3.5 h-3.5" /> Изображение к вопросу
        </button>
      )}

      <div className="space-y-2">
        {answers.map((a: ExerciseAnswer, ai: number) => (
          <div key={a.id} className="flex gap-3 items-center">
            {/* Left: check + letter */}
            <button onClick={() => setCorrect(a.id)}
              className={`w-5 h-5 shrink-0 flex items-center justify-center transition-all ${
                data.type === 'radio' ? `rounded-full border-2 ${a.isCorrect?'border-emerald-500 bg-emerald-500':'border-neutral-300'}` : `rounded-md border-2 ${a.isCorrect?'border-emerald-500 bg-emerald-500':'border-neutral-300'}`
              }`}>{a.isCorrect && <Check className="w-3 h-3 text-white" />}</button>
            <span className="text-[11px] font-bold text-neutral-400 w-4 shrink-0">{String.fromCharCode(65+ai)}</span>
            {/* Center: text + description stacked, same width */}
            <div className="flex-1 min-w-0 space-y-1">
              <input type="text" value={a.text} onChange={e => onChange({...data, answers: answers.map((ans: ExerciseAnswer) => ans.id===a.id ? {...ans,text:e.target.value} : ans)})}
                placeholder={`Вариант ${String.fromCharCode(65+ai)}...`}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
              <input type="text" value={a.description} onChange={e => onChange({...data, answers: answers.map((ans: ExerciseAnswer) => ans.id===a.id ? {...ans,description:e.target.value} : ans)})}
                placeholder="Описание ответа..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
            </div>
            {/* Right: image 1:1 */}
            <div className="shrink-0">
              {a.imageUrl ? (
                <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden bg-neutral-100 group/ai">
                  <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => onChange({...data, answers: answers.map((ans: ExerciseAnswer) => ans.id===a.id ? {...ans,imageUrl:''} : ans)})}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/ai:opacity-100 transition-opacity"><X className="w-3.5 h-3.5 text-white" /></button>
                </div>
              ) : (
                <button className="w-[60px] h-[60px] rounded-lg border border-dashed border-neutral-200 flex items-center justify-center text-neutral-300 hover:border-neutral-300 hover:text-neutral-400 transition-all">
                  <ImageIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Delete */}
            {answers.length > 2 && <button onClick={() => onChange({...data, answers: answers.filter((x: ExerciseAnswer) => x.id !== a.id)})} className="p-1 text-neutral-300 hover:text-rose-500 shrink-0"><X className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        <button onClick={() => onChange({...data, answers: [...answers, {id:mkId(),text:'',description:'',imageUrl:'',isCorrect:false}]})}
          className="w-full py-2 border-2 border-dashed border-neutral-200 rounded-lg text-[11px] font-medium text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 flex items-center justify-center gap-1.5">
          <Plus className="w-3 h-3" /> Добавить вариант
        </button>
      </div>
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
      {data.code && <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 flex flex-col items-center text-neutral-400 gap-1"><Code className="w-5 h-5" /><span className="text-[11px]">Превью у студента</span></div>}
    </div>
  );
}

function TableBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const cells: string[][] = data.cells || [['',''],['','']];
  const updateCell = (r:number,c:number,v:string) => {const n=cells.map((row:string[],ri:number)=>row.map((cell:string,ci:number)=>ri===r&&ci===c?v:cell));onChange({...data,cells:n})};
  return (
    <div className="px-4 py-4">
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse">
          <tbody>{cells.map((row:string[],ri:number)=>(
            <tr key={ri}>{row.map((cell:string,ci:number)=>(
              <td key={ci} className={`border-r border-b border-neutral-200 last:border-r-0 p-0 ${ri===0&&data.headerRow?'bg-neutral-100':''}`}>
                <input type="text" value={cell} onChange={e=>updateCell(ri,ci,e.target.value)} placeholder={ri===0&&data.headerRow?'Заголовок':''}
                  className={`w-full px-2.5 py-2 text-[12px] bg-transparent focus:outline-none focus:bg-blue-50/30 min-w-[80px] ${ri===0&&data.headerRow?'font-semibold text-neutral-800':'text-neutral-700'}`} />
              </td>
            ))}<td className="w-6 border-b border-neutral-200">{cells.length>1&&<button onClick={()=>onChange({...data,cells:cells.filter((_:any,i:number)=>i!==ri)})} className="p-0.5 text-neutral-300 hover:text-rose-500"><X className="w-3 h-3" /></button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={()=>onChange({...data,cells:[...cells,Array(cells[0]?.length||2).fill('')]})} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Строка</button>
        <button onClick={()=>onChange({...data,cells:cells.map((r:string[])=>[...r,''])})} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Столбец</button>
        <div className="flex-1" />
        <Toggle checked={data.headerRow} onChange={v=>onChange({...data,headerRow:v})} label="Заголовок" />
      </div>
    </div>
  );
}

// Mini block type selector for columns
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
            <button key={n} onClick={()=>onChange({...data, count:n, cols: Array.from({length:n},(_, i) => cols[i]||[])})}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${count===n?'bg-white text-neutral-900 shadow-sm':'text-neutral-500'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div className={`grid gap-3 ${count===3?'grid-cols-3':'grid-cols-2'}`}>
        {Array.from({length: count}).map((_,colIdx)=> {
          const colBlocks: ContentBlock[] = cols[colIdx] || [];
          return (
            <div key={colIdx} className="border border-neutral-200 rounded-xl">
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
                        <button onClick={()=>deleteColBlock(colIdx,cb.id)} className="p-0.5 text-neutral-300 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <Ed data={cb.data} onChange={d=>updateColBlock(colIdx,cb.id,d)} />
                    </div>
                  );
                })}
              </div>}
              {/* Add block to column */}
              <div className={`relative px-2 pb-2 ${colBlocks.length === 0 ? 'pt-2' : ''}`}>
                <button onClick={()=>setAddMenuCol(addMenuCol===colIdx?null:colIdx)}
                  className="w-full py-1.5 border border-dashed border-neutral-200 rounded-lg text-[10px] font-medium text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
                {addMenuCol === colIdx && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={()=>setAddMenuCol(null)} />
                    <div className="absolute left-2 right-2 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[100]">
                      {COL_BLOCK_TYPES.map(bt => (
                        <button key={bt.type} onClick={()=>{addToCol(colIdx,bt.type);setAddMenuCol(null);}}
                          className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-50 text-[11px] text-neutral-700">
                          <bt.icon className="w-3 h-3 text-neutral-400" /> {bt.label}
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
      <p className="text-[10px] text-neutral-400 flex items-center gap-1"><Info className="w-3 h-3" /> На мобильных колонки стакаются вертикально</p>
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
  {type:'exercise',label:'Упражнение',desc:'Мини-тест',icon:HelpCircle,color:'text-orange-600 bg-orange-50'},
  {type:'iframe',label:'Код',desc:'HTML / JS виджет',icon:Code,color:'text-purple-600 bg-purple-50'},
  {type:'table',label:'Таблица',desc:'Данные в таблице',icon:Table,color:'text-teal-600 bg-teal-50'},
  {type:'columns',label:'Колонки',desc:'Сетка 2–3',icon:Columns,color:'text-indigo-600 bg-indigo-50'},
];

const EDITORS: Record<BlockType, React.FC<{data:any;onChange:(d:any)=>void}>> = {
  text:TextBlockEditor,video:VideoBlockEditor,audio:AudioBlockEditor,image:ImageBlockEditor,
  file:FileBlockEditor,slider:SliderBlockEditor,callout:CalloutBlockEditor,
  button:ButtonBlockEditor,exercise:ExerciseBlockEditor,iframe:IframeBlockEditor,
  table:TableBlockEditor,columns:ColumnsBlockEditor,
};

// ═══ Floating Bar ════════════════════════════════════════════════════════════

function FloatingBar({ onAdd, onImport }: { onAdd: (t: BlockType) => void; onImport: () => void }) {
  return (
    <div className="fixed bottom-6 z-[80]" style={{left:'calc(50% + 120px)',transform:'translateX(-50%)'}}>
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-2.5 py-1.5 flex items-center gap-0.5">
        {BLOCK_REG.map(b=>(
          <div key={b.type} className="relative group/fb">
            <button onClick={()=>onAdd(b.type)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${b.color}`}><b.icon className="w-3.5 h-3.5" /></button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 rounded-lg shadow-xl opacity-0 scale-95 group-hover/fb:opacity-100 group-hover/fb:scale-100 pointer-events-none transition-all whitespace-nowrap">
              <p className="text-white text-[11px] font-medium">{b.label}</p>
              <p className="text-neutral-400 text-[10px]">{b.desc}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
            </div>
          </div>
        ))}
        <div className="w-px h-6 bg-neutral-200 mx-0.5" />
        <div className="relative group/fb">
          <button onClick={onImport} className="w-8 h-8 rounded-xl flex items-center justify-center text-pink-600 bg-pink-50 transition-all hover:scale-110 active:scale-95"><FolderOpen className="w-3.5 h-3.5" /></button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 rounded-lg shadow-xl opacity-0 scale-95 group-hover/fb:opacity-100 group-hover/fb:scale-100 pointer-events-none transition-all whitespace-nowrap">
            <p className="text-white text-[11px] font-medium">Импорт</p>
            <p className="text-neutral-400 text-[10px]">Из другого курса</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export default function LessonEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [settings, setSettings] = useState<LessonSettings>(MOCK);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    typeof params.lessonId === 'string' && params.lessonId.startsWith('item-') ? [] : MOCK_BLOCKS
  );
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [showImport, setShowImport] = useState(false);

  // Drag
  const dragIdxRef = useRef<number|null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const upd = (p: Partial<LessonSettings>) => setSettings(prev => ({...prev,...p}));

  const addBlock = (type: BlockType) => {
    setBlocks(prev => [...prev, {id: mkId(), type, data: DEFAULT_BLOCK[type]()}]);
  };
  const updateBlock = (id:string,data:any) => setBlocks(p=>p.map(b=>b.id===id?{...b,data}:b));
  const deleteBlock = (id:string) => setBlocks(p=>p.filter(b=>b.id!==id));
  const dupBlock = (id:string) => {
    const s=blocks.find(b=>b.id===id);if(!s)return;
    const i=blocks.findIndex(b=>b.id===id);
    setBlocks(p=>[...p.slice(0,i+1),{...s,id:mkId(),data:JSON.parse(JSON.stringify(s.data))},...p.slice(i+1)]);
  };
  const moveBlock = (from:number,to:number) => {
    setBlocks(p=>{const n=[...p];const[m]=n.splice(from,1);n.splice(to,0,m);return n;});
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragIdxRef.current = idx;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Create a ghost image from the block
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

  const handleImport = (importedBlocks: ContentBlock[]) => { setBlocks(prev => [...prev, ...importedBlocks]); };

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };

  const accessOpts = [
    {id:'open',label:'Открытый',dot:'bg-emerald-500'},
    {id:'closed',label:'Закрытый',dot:'bg-neutral-400'},
    {id:'scheduled',label:'По расписанию',dot:'bg-blue-500'},
    {id:'limited',label:'Ограниченный',dot:'bg-amber-500'},
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <PageHeader
        breadcrumbs={[{label:'Курсы',href:'/courses'},{label:'Содержание',href:`/courses/${courseId}`},{label:settings.title||'Новый урок'}]}
        actions={<div className="flex items-center gap-2">
          {saved && <span className="text-[13px] text-emerald-600 font-medium flex items-center gap-1.5"><Check className="w-4 h-4" /> Сохранено</span>}
          <Button variant="primary" onClick={save} className="gap-2 text-[13px]"><Save className="w-4 h-4" /> Сохранить</Button>
        </div>}
      />

      <div className="max-w-4xl mx-auto px-6 py-6" style={{paddingBottom:'140px'}}>
        {/* Title */}
        <input type="text" value={settings.title} onChange={e=>upd({title:e.target.value})}
          placeholder="Название урока..."
          className="w-full text-[26px] font-bold text-neutral-900 placeholder-neutral-300 border-0 focus:outline-none bg-transparent leading-tight mb-5" />

        {/* Settings */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
          <button onClick={()=>setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-50/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-neutral-500" /></div>
              <span className="text-[14px] font-semibold text-neutral-900">Настройки урока</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${settingsOpen?'rotate-180':''}`} />
          </button>
          {settingsOpen && (
            <div className="px-5 pb-5 border-t border-neutral-100 pt-4 space-y-4">
              {/* 1) Access */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Тип доступа</label>
                <div className="max-w-xs">
                  <Dropdown value={settings.accessStatus} options={accessOpts} onChange={v=>upd({accessStatus:v as AccessStatus})} />
                </div>
                {settings.accessStatus === 'scheduled' && (
                  <div className="mt-2 max-w-xs"><input type="datetime-local" value={settings.scheduledDate} onChange={e=>upd({scheduledDate:e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" /></div>
                )}
                {settings.accessStatus === 'limited' && (
                  <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
                    <input type="datetime-local" value={settings.startDate} onChange={e=>upd({startDate:e.target.value})} className="px-3 py-2 rounded-lg border border-neutral-200 text-[12px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                    <input type="datetime-local" value={settings.endDate} onChange={e=>upd({endDate:e.target.value})} className="px-3 py-2 rounded-lg border border-neutral-200 text-[12px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-100" />

              {/* 2) Rating + Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Toggle checked={settings.ratingEnabled} onChange={v=>upd({ratingEnabled:v})} label="Оценка урока" description="От 1 до 5 звёзд" icon={Star} />
                <Toggle checked={settings.reviewEnabled} onChange={v=>upd({reviewEnabled:v})} label="Развёрнутый отзыв" description="Текстовый комментарий" icon={MessageCircle} />
              </div>

              <div className="border-t border-neutral-100" />

              {/* 3) Timer + Homework */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 items-start">
                <div>
                  <Toggle checked={settings.timerEnabled} onChange={v=>upd({timerEnabled:v})} label="Таймер-блокировка" description="Мин. время на уроке" icon={Timer} />
                  {settings.timerEnabled && (
                    <div className="flex items-center gap-2 pl-10 mt-1">
                      <input type="number" min={1} value={settings.timerMinutes} onChange={e=>upd({timerMinutes:Number(e.target.value)})}
                        className="w-20 px-3 py-1.5 rounded-lg border border-neutral-200 text-[13px] text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      <span className="text-[12px] text-neutral-400">минут</span>
                    </div>
                  )}
                </div>
                <div>
                  <Toggle checked={settings.homeworkEnabled} onChange={v=>upd({homeworkEnabled:v})} label="Домашнее задание" description="Чат с куратором" icon={MessageSquare} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-900">Содержание</h2>
          <span className="text-[12px] text-neutral-400">{blocks.length} {blocks.length===1?'блок':blocks.length<5?'блока':'блоков'}</span>
        </div>

        {blocks.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-neutral-300" /></div>
            <h3 className="font-semibold text-neutral-800 mb-1">Начните создавать урок</h3>
            <p className="text-[13px] text-neutral-400 max-w-sm">Используйте панель инструментов внизу экрана</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block,idx) => {
              const meta = BLOCK_REG.find(b=>b.type===block.type);
              const Ed = EDITORS[block.type];
              const over = dragOverIdx === idx && dragIdxRef.current !== idx;

              return (
                <div key={block.id} data-block
                  onDragOver={e=>handleDragOver(e,idx)}
                  onDrop={e=>handleDrop(e,idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white border rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${
                    over ? 'border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]' : 'border-neutral-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                  }`}>
                  <BlockToolbar
                    index={idx} total={blocks.length}
                    onMoveUp={()=>moveBlock(idx,idx-1)}
                    onMoveDown={()=>moveBlock(idx,idx+1)}
                    onDuplicate={()=>dupBlock(block.id)}
                    onDelete={()=>deleteBlock(block.id)}
                    label={meta?.label||block.type}
                    onDragStart={e=>handleDragStart(e,idx)}
                  />
                  <Ed data={block.data} onChange={d=>updateBlock(block.id,d)} />
                  {(block.type==='button'||block.type==='exercise')&&block.data.isDivider && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
                        <EyeOff className="w-3.5 h-3.5" /> Контент ниже скрыт до взаимодействия
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FloatingBar onAdd={addBlock} onImport={()=>setShowImport(true)} />
      {showImport && <ImportModal onClose={()=>setShowImport(false)} onImport={handleImport} />}
    </div>
  );
}
