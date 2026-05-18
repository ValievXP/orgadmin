"use client";
import React, { useState, useMemo } from 'react';
import { 
  X, Search, ChevronRight, ChevronDown, Folder, 
  FileText, HelpCircle, BookOpen, ClipboardList, Calendar, Plus,
  GraduationCap, ClipboardCheck, Layers
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ElementNode {
  id: string;
  type: 'section' | 'folder' | 'course' | 'module' | 'lesson' | 'test' | 'homework' | 'survey' | 'event';
  title: string;
  children?: ElementNode[];
  color?: string;   // accent color for folder dots
}

// ─── Mock Data (mirrors real sidebar sections, courses page folders/courses, etc.) ──

const MOCK_DATA: ElementNode[] = [
  {
    id: 'sec-courses',
    type: 'section',
    title: 'Курсы',
    children: [
      // ── Folders first ──
      {
        id: 'folder-f1',
        type: 'folder',
        title: 'Onboarding 2026',
        color: 'text-blue-500',
        children: [
          {
            id: 'folder-f3',
            type: 'folder',
            title: 'IT & Security Core',
            color: 'text-yellow-500',
            children: []
          },
          {
            id: 'c-990',
            type: 'course',
            title: 'Welcome Day: Знакомство с компанией',
            children: [
              {
                id: 'm-990-1',
                type: 'module',
                title: 'Первый день',
                children: [
                  { id: 'l-990-1', type: 'lesson', title: 'Добро пожаловать!' },
                  { id: 'l-990-2', type: 'lesson', title: 'Структура компании' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'folder-f2',
        type: 'folder',
        title: 'Compliance & Legal',
        color: 'text-purple-500',
        children: []
      },
      // ── Root courses ──
      {
        id: 'c-821',
        type: 'course',
        title: 'Основы корпоративной безопасности',
        children: [
          {
            id: 'm-1',
            type: 'module',
            title: 'Введение в корпоративную безопасность',
            children: [
              { id: 'l-1', type: 'lesson', title: 'Что такое корпоративная безопасность' },
              { id: 'l-2', type: 'homework', title: 'Основные угрозы и риски' },
              { id: 't-1', type: 'test', title: 'Тест: Основные понятия' },
            ]
          },
          {
            id: 'm-2',
            type: 'module',
            title: 'Защита информации',
            children: [
              { id: 'l-3', type: 'lesson', title: 'Классификация информации' },
              { id: 'l-4', type: 'lesson', title: 'Методы защиты данных' },
              { id: 'l-5', type: 'homework', title: 'Шифрование и VPN' },
              { id: 't-2', type: 'test', title: 'Тест: Защита данных' },
            ]
          },
          {
            id: 'm-3',
            type: 'module',
            title: 'Физическая безопасность',
            children: [
              { id: 'l-6', type: 'lesson', title: 'Контроль доступа в здание' },
              { id: 'l-7', type: 'lesson', title: 'Видеонаблюдение и мониторинг' },
            ]
          }
        ]
      },
      {
        id: 'c-724',
        type: 'course',
        title: 'Введение в управление проектами',
        children: [
          {
            id: 'm-10',
            type: 'module',
            title: 'Основы проектного управления',
            children: [
              { id: 'l-20', type: 'lesson', title: 'Жизненный цикл проекта' },
              { id: 'l-21', type: 'homework', title: 'Роли в проектной команде' },
            ]
          }
        ]
      },
      {
        id: 'c-612',
        type: 'course',
        title: 'Дизайн-системы в Figma',
        children: [
          {
            id: 'm-20',
            type: 'module',
            title: 'Фундамент дизайн-системы',
            children: [
              { id: 'l-30', type: 'lesson', title: 'Что такое дизайн-система?' },
            ]
          }
        ]
      },
      {
        id: 'c-509',
        type: 'course',
        title: 'Английский язык (Средний уровень)',
        children: [
          {
            id: 'm-30',
            type: 'module',
            title: 'Grammar Essentials',
            children: [
              { id: 'l-40', type: 'lesson', title: 'Tenses Overview' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sec-testing',
    type: 'section',
    title: 'Тестирование',
    children: [
      { id: 'tst-1', type: 'test', title: 'Ежегодная аттестация' },
      { id: 'tst-2', type: 'test', title: 'Тест по информационной безопасности' },
      { id: 'tst-3', type: 'test', title: 'Тест: Охрана труда' },
    ]
  },
  {
    id: 'sec-surveys',
    type: 'section',
    title: 'Опросы',
    children: [
      { id: 'srv-1', type: 'survey', title: 'Опрос удовлетворенности сотрудников' },
      { id: 'srv-2', type: 'survey', title: 'Оценка качества обучения' },
      { id: 'srv-3', type: 'survey', title: 'Обратная связь по курсу' },
    ]
  },
  {
    id: 'sec-events',
    type: 'section',
    title: 'Мероприятия',
    children: [
      { id: 'evt-1', type: 'event', title: 'Вебинар: Новые стандарты безопасности' },
      { id: 'evt-2', type: 'event', title: 'Тренинг по оказанию первой помощи' },
      { id: 'evt-3', type: 'event', title: 'Конференция EdTech 2026' },
    ]
  }
];

// ─── Visual config ───────────────────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  'sec-courses':  { icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'sec-testing':  { icon: ClipboardCheck, color: 'text-amber-600',  bg: 'bg-amber-50' },
  'sec-surveys':  { icon: ClipboardList,  color: 'text-purple-600', bg: 'bg-purple-50' },
  'sec-events':   { icon: Calendar,       color: 'text-rose-600',   bg: 'bg-rose-50' },
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  folder:   { icon: Folder,         color: 'text-neutral-400', label: 'Папка' },
  course:   { icon: BookOpen,       color: 'text-emerald-500', label: 'Курс' },
  module:   { icon: Layers,         color: 'text-indigo-400',  label: 'Модуль' },
  lesson:   { icon: FileText,       color: 'text-blue-500',    label: 'Урок' },
  homework: { icon: FileText,       color: 'text-violet-500',  label: 'Урок с ДЗ' },
  test:     { icon: HelpCircle,     color: 'text-amber-500',   label: 'Тест' },
  survey:   { icon: ClipboardList,  color: 'text-purple-500',  label: 'Опрос' },
  event:    { icon: Calendar,       color: 'text-rose-500',    label: 'Мероприятие' },
};

// Which types can be selected (leaf items the user can actually add)
const SELECTABLE_TYPES = new Set(['lesson', 'homework', 'test', 'survey', 'event']);

// ─── Component ───────────────────────────────────────────────────────────────

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (element: ElementNode) => void;
}

export function AddElementModal({ isOpen, onClose, onSelect }: AddElementModalProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['sec-courses', 'c-821']));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Recursive search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return MOCK_DATA;
    const term = search.toLowerCase();
    const filterNode = (node: ElementNode): ElementNode | null => {
      const match = node.title.toLowerCase().includes(term);
      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean) as ElementNode[];
        if (filteredChildren.length > 0) return { ...node, children: filteredChildren };
      }
      return match ? node : null;
    };
    return MOCK_DATA.map(filterNode).filter(Boolean) as ElementNode[];
  }, [search]);

  if (!isOpen) return null;

  const isSearching = search.trim().length > 0;

  // ─── Render a single tree node ─────────────────────────────────────────────

  const renderNode = (node: ElementNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id) || isSearching;
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isSelectable = SELECTABLE_TYPES.has(node.type);
    const isSection = node.type === 'section';

    // Section-level nodes (Курсы, Тестирование, etc.)
    if (isSection) {
      const cfg = SECTION_CONFIG[node.id] || { icon: BookOpen, color: 'text-neutral-500', bg: 'bg-neutral-100' };
      const SectionIcon = cfg.icon;
      return (
        <div key={node.id} className="mb-1">
          <button
            onClick={() => toggleExpand(node.id)}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isExpanded 
                ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> 
                : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
            </div>
            <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
              <SectionIcon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <span className="text-[14px] font-bold text-neutral-900">{node.title}</span>
            {node.children && (
              <span className="text-[11px] text-neutral-400 ml-auto">{node.children.length}</span>
            )}
          </button>
          {isExpanded && hasChildren && (
            <div className="ml-3 border-l-2 border-neutral-100 pl-1 mt-0.5 flex flex-col gap-0.5">
              {node.children!.map(child => renderNode(child, 1))}
            </div>
          )}
        </div>
      );
    }

    // All other node types
    const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.lesson;
    const NodeIcon = cfg.icon;
    const iconColor = node.type === 'folder' && node.color ? node.color : cfg.color;

    return (
      <div key={node.id}>
        <div
          onClick={() => {
            if (isSelectable) setSelectedId(node.id);
            else if (hasChildren) toggleExpand(node.id);
          }}
          className={`flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer transition-all group ${
            isSelected
              ? 'bg-blue-50 ring-1 ring-blue-200'
              : 'hover:bg-neutral-50'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
        >
          {/* Expand / collapse chevron */}
          <div
            onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggleExpand(node.id); } }}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0 ${
              hasChildren ? 'hover:bg-neutral-200 cursor-pointer' : ''
            }`}
          >
            {hasChildren ? (
              isExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
            )}
          </div>

          {/* Icon */}
          <NodeIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] truncate ${
              isSelected ? 'font-semibold text-blue-700' : 'font-medium text-neutral-700'
            }`}>
              {node.title}
            </p>
          </div>

          {/* Type badge (for non-folder containers) */}
          {!isSelectable && node.type !== 'folder' && (
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider shrink-0">
              {cfg.label}
            </span>
          )}

          {/* Add button (leaf items only) */}
          {isSelectable && (
            <div className={`shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect?.(node); onClose(); }}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3 h-3" /> Добавить
              </button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className={`flex flex-col gap-0.5 ${depth < 2 ? 'ml-3 border-l-2 border-neutral-100 pl-1' : 'ml-5'} mt-0.5`}>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ─── Modal shell ───────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">Добавить элемент</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">Выберите урок, тест, опрос или мероприятие</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {filteredData.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {filteredData.map(node => renderNode(node))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Search className="w-8 h-8 text-neutral-300 mb-3" />
              <p className="text-[14px] font-medium text-neutral-700">Ничего не найдено</p>
              <p className="text-[13px] text-neutral-400 mt-1">Попробуйте изменить поисковый запрос</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-neutral-400">
            Импорт из любого доступного раздела
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-medium text-neutral-600 hover:bg-neutral-200 bg-neutral-100 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
