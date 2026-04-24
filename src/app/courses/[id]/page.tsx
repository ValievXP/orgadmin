"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, Users, Clock, Plus, MoreVertical, X,
  Edit3, Trash2, ChevronDown, ChevronRight, 
  FileText, HelpCircle, Copy, Settings, Globe,
  Unlock, Lock, CalendarClock, Timer, ClipboardCheck, Layers,
  Search, AlertTriangle, UserPlus, ArrowUpDown, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Image, Link, Eye, EyeOff, Check, Upload, ExternalLink, Languages, Star
} from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ───────────────────────────────────────────────────────────────────

type AccessStatus = 'open' | 'closed' | 'scheduled' | 'limited';
type ItemType = 'lesson' | 'test' | 'homework';

const ACCESS_OPTIONS: { id: AccessStatus, label: string, desc: string }[] = [
  { id: 'open', label: 'Открытый', desc: 'Доступен сразу после публикации' },
  { id: 'closed', label: 'Закрытый', desc: 'Недоступен для студентов' },
  { id: 'scheduled', label: 'По расписанию', desc: 'Откроется в назначенные дату и время' },
  { id: 'limited', label: 'Ограниченный период', desc: 'Доступен только в определённые даты' },
];

// ─── Status Helpers ──────────────────────────────────────────────────────────

function StatusIcon({ status, scheduledDate, startDate, endDate }: { status: AccessStatus, scheduledDate?: string, startDate?: string, endDate?: string }) {
  const configs: Record<AccessStatus, { icon: any, color: string, bg: string, label: string, detail?: string }> = {
    open: { icon: Unlock, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Открытый', detail: 'Доступен для прохождения' },
    closed: { icon: Lock, color: 'text-neutral-400', bg: 'bg-neutral-100', label: 'Закрытый', detail: 'Недоступен для студентов' },
    scheduled: { icon: CalendarClock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'По расписанию', detail: scheduledDate ? `Откроется: ${scheduledDate}` : 'Откроется в назначенное время' },
    limited: { icon: Timer, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Ограниченный период', detail: startDate && endDate ? `${startDate} — ${endDate}` : 'Доступен ограниченное время' },
  };
  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div className="relative group/status shrink-0">
      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center cursor-help transition-colors`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="absolute bottom-full right-0 mb-2 w-max max-w-[240px] px-3 py-2 bg-neutral-900 rounded-lg shadow-xl opacity-0 scale-95 group-hover/status:opacity-100 group-hover/status:scale-100 pointer-events-none transition-all duration-150 z-50 origin-bottom-right">
        <p className="text-white text-[11px] font-semibold">{cfg.label}</p>
        {cfg.detail && <p className="text-neutral-400 text-[10px] mt-0.5 leading-snug">{cfg.detail}</p>}
        <div className="absolute top-full right-3 border-4 border-transparent border-t-neutral-900" />
      </div>
    </div>
  );
}

// ─── Item Type Icon with Tooltip ─────────────────────────────────────────────

function ItemTypeIcon({ type }: { type: ItemType }) {
  const configs: Record<ItemType, { icon: any, color: string, bg: string, border: string, label: string }> = {
    lesson: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200/60', label: 'Урок' },
    test: { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200/60', label: 'Тест' },
    homework: { icon: ClipboardCheck, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200/60', label: 'Урок с домашним заданием' },
  };
  const cfg = configs[type];
  const Icon = cfg.icon;

  return (
    <div className="relative group/type shrink-0">
      <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-900 rounded-lg shadow-xl opacity-0 scale-95 group-hover/type:opacity-100 group-hover/type:scale-100 pointer-events-none transition-all duration-150 z-50 origin-bottom whitespace-nowrap">
        <p className="text-white text-[10px] font-semibold">{cfg.label}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
      </div>
    </div>
  );
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const COURSES_DB: Record<string, any> = {
  'COR-821': {
    id: 'COR-821', title: 'Основы корпоративной безопасности', 
    description: 'Изучите фундаментальные принципы корпоративной безопасности, защиты данных и предотвращения угроз в организации.',
    lang: 'Русский', status: 'Active', inCatalog: true, users: 142, hours: 24,
    cover: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
    modules: [
      { id: 'm1', title: 'Введение в корпоративную безопасность', collapsed: false, status: 'open' as AccessStatus, items: [
        { id: 'l1', type: 'lesson' as ItemType, title: 'Что такое корпоративная безопасность', status: 'open' as AccessStatus },
        { id: 'l2', type: 'homework' as ItemType, title: 'Основные угрозы и риски', status: 'open' as AccessStatus },
        { id: 'l3', type: 'test' as ItemType, title: 'Тест: Основные понятия', status: 'closed' as AccessStatus },
      ]},
      { id: 'm2', title: 'Защита информации', collapsed: false, status: 'scheduled' as AccessStatus, scheduledDate: '25 апреля 2026, 09:00', items: [
        { id: 'l4', type: 'lesson' as ItemType, title: 'Классификация конфиденциальной информации', status: 'scheduled' as AccessStatus, scheduledDate: '25 апреля 2026, 09:00' },
        { id: 'l5', type: 'lesson' as ItemType, title: 'Методы защиты данных', status: 'scheduled' as AccessStatus, scheduledDate: '25 апреля 2026, 09:00' },
        { id: 'l6', type: 'homework' as ItemType, title: 'Шифрование и VPN', status: 'closed' as AccessStatus },
        { id: 'l7', type: 'test' as ItemType, title: 'Тест: Защита данных', status: 'closed' as AccessStatus },
      ]},
      { id: 'm3', title: 'Физическая безопасность', collapsed: false, status: 'limited' as AccessStatus, startDate: '1 мая 2026', endDate: '31 мая 2026', items: [
        { id: 'l8', type: 'lesson' as ItemType, title: 'Контроль доступа в здание', status: 'limited' as AccessStatus, startDate: '1 мая 2026', endDate: '31 мая 2026' },
        { id: 'l9', type: 'lesson' as ItemType, title: 'Видеонаблюдение и мониторинг', status: 'open' as AccessStatus },
      ]},
    ]
  },
  'COR-724': {
    id: 'COR-724', title: 'Введение в управление проектами',
    description: 'Научитесь планировать, выполнять и контролировать проекты любого масштаба с использованием современных методологий.',
    lang: 'Узбекский', status: 'Draft', inCatalog: false, users: 0, hours: 16,
    cover: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
    modules: [
      { id: 'm10', title: 'Основы проектного управления', collapsed: false, status: 'open' as AccessStatus, items: [
        { id: 'l20', type: 'lesson' as ItemType, title: 'Жизненный цикл проекта', status: 'open' as AccessStatus },
        { id: 'l21', type: 'homework' as ItemType, title: 'Роли в проектной команде', status: 'open' as AccessStatus },
      ]},
    ]
  },
  'COR-612': {
    id: 'COR-612', title: 'Дизайн-системы в Figma',
    description: 'Создайте полноценную дизайн-систему с токенами, компонентами и документацией прямо в Figma.',
    lang: 'Русский', status: 'Active', inCatalog: true, users: 89, hours: 40,
    cover: 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-600',
    modules: [
      { id: 'm20', title: 'Основы дизайн-систем', collapsed: false, status: 'open' as AccessStatus, items: [
        { id: 'l30', type: 'lesson' as ItemType, title: 'Что такое дизайн-система', status: 'open' as AccessStatus },
        { id: 'l31', type: 'lesson' as ItemType, title: 'Атомарный дизайн', status: 'closed' as AccessStatus },
      ]},
    ]
  },
  'COR-509': {
    id: 'COR-509', title: 'Английский язык (Средний уровень)',
    description: 'Интенсивный курс для совершенствования навыков владения английским языком для деловой среды.',
    lang: 'Русский', status: 'Archived', inCatalog: false, users: 512, hours: 80,
    cover: 'bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500',
    modules: []
  },
};

// ─── Mock Students Data ──────────────────────────────────────────────────────

const MOCK_STUDENTS: Record<string, any[]> = {
  'COR-821': [
    { id: 's1', name: 'Иванов Алексей Петрович', progress: 87, assignedDate: '2026-01-15T10:30:00', lastActivity: '2026-04-18T14:22:00', completedDate: null },
    { id: 's2', name: 'Смирнова Елена Викторовна', progress: 100, assignedDate: '2026-01-15T09:00:00', lastActivity: '2026-03-28T18:45:00', completedDate: '2026-03-28T18:45:00' },
    { id: 's3', name: 'Козлов Дмитрий Андреевич', progress: 45, assignedDate: '2026-02-01T11:15:00', lastActivity: '2026-04-17T09:10:00', completedDate: null },
    { id: 's4', name: 'Новикова Мария Сергеевна', progress: 62, assignedDate: '2026-02-10T14:00:00', lastActivity: '2026-04-19T16:33:00', completedDate: null },
    { id: 's5', name: 'Петров Игорь Владимирович', progress: 100, assignedDate: '2026-01-20T08:45:00', lastActivity: '2026-04-01T20:12:00', completedDate: '2026-04-01T20:12:00' },
    { id: 's6', name: 'Волкова Анастасия Дмитриевна', progress: 23, assignedDate: '2026-03-05T12:00:00', lastActivity: '2026-04-15T11:07:00', completedDate: null },
    { id: 's7', name: 'Соколов Артём Игоревич', progress: 0, assignedDate: '2026-04-10T09:30:00', lastActivity: null, completedDate: null },
    { id: 's8', name: 'Морозова Ольга Александровна', progress: 91, assignedDate: '2026-01-15T10:00:00', lastActivity: '2026-04-20T08:50:00', completedDate: null },
    { id: 's9', name: 'Лебедев Максим Николаевич', progress: 100, assignedDate: '2026-01-15T10:00:00', lastActivity: '2026-02-20T15:30:00', completedDate: '2026-02-20T15:30:00' },
    { id: 's10', name: 'Кузнецова Дарья Олеговна', progress: 34, assignedDate: '2026-03-12T13:20:00', lastActivity: '2026-04-16T17:45:00', completedDate: null },
    { id: 's11', name: 'Семёнов Виталий Юрьевич', progress: 15, assignedDate: '2026-03-20T10:00:00', lastActivity: '2026-04-10T12:15:00', completedDate: null },
    { id: 's12', name: 'Орлова Наталья Вадимовна', progress: 78, assignedDate: '2026-01-22T09:00:00', lastActivity: '2026-04-19T21:10:00', completedDate: null },
    { id: 's13', name: 'Белов Андрей Геннадьевич', progress: 100, assignedDate: '2026-01-18T14:30:00', lastActivity: '2026-03-15T10:00:00', completedDate: '2026-03-15T10:00:00' },
    { id: 's14', name: 'Чернова Екатерина Алексеевна', progress: 56, assignedDate: '2026-02-05T11:00:00', lastActivity: '2026-04-18T15:40:00', completedDate: null },
    { id: 's15', name: 'Григорьев Павел Сергеевич', progress: 8, assignedDate: '2026-04-01T09:00:00', lastActivity: '2026-04-05T14:20:00', completedDate: null },
    { id: 's16', name: 'Тихонова Анна Игоревна', progress: 100, assignedDate: '2026-01-15T10:00:00', lastActivity: '2026-02-28T19:55:00', completedDate: '2026-02-28T19:55:00' },
    { id: 's17', name: 'Ефимов Роман Олегович', progress: 42, assignedDate: '2026-02-18T16:00:00', lastActivity: '2026-04-14T13:30:00', completedDate: null },
    { id: 's18', name: 'Карпова Светлана Петровна', progress: 73, assignedDate: '2026-01-25T08:30:00', lastActivity: '2026-04-20T07:15:00', completedDate: null },
    { id: 's19', name: 'Макаров Денис Александрович', progress: 5, assignedDate: '2026-04-08T10:00:00', lastActivity: '2026-04-09T11:20:00', completedDate: null },
    { id: 's20', name: 'Зайцева Маргарита Викторовна', progress: 100, assignedDate: '2026-01-16T09:00:00', lastActivity: '2026-03-02T16:40:00', completedDate: '2026-03-02T16:40:00' },
    { id: 's21', name: 'Данилов Кирилл Владимирович', progress: 29, assignedDate: '2026-03-01T11:45:00', lastActivity: '2026-04-12T10:05:00', completedDate: null },
    { id: 's22', name: 'Попова Вероника Дмитриевна', progress: 67, assignedDate: '2026-02-12T13:00:00', lastActivity: '2026-04-19T22:30:00', completedDate: null },
  ],
  'COR-612': [
    { id: 's101', name: 'Фёдоров Никита Сергеевич', progress: 55, assignedDate: '2026-02-01T12:00:00', lastActivity: '2026-04-18T15:00:00', completedDate: null },
    { id: 's102', name: 'Егорова Виктория Павловна', progress: 78, assignedDate: '2026-02-15T09:30:00', lastActivity: '2026-04-19T17:20:00', completedDate: null },
  ],
};

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({ open, onClose, onConfirm, title, itemName }: {
  open: boolean, onClose: () => void, onConfirm: () => void, title: string, itemName: string
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <p className="text-[13px] text-neutral-500 mt-2 leading-relaxed">
            Вы действительно хотите удалить <span className="font-semibold text-neutral-800">«{itemName}»</span>?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 mt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
            Отмена
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Lesson Item ────────────────────────────────────────────────────

function SortableItem({ item, index, moduleId, openMenuId, setOpenMenuId, onDelete, onEdit }: { item: any, index: number, moduleId: string, openMenuId: string | null, setOpenMenuId: (id: string | null) => void, onDelete: () => void, onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', moduleId, item }
  });
  
  const style = { transform: CSS.Translate.toString(transform), transition };
  const menuOpen = openMenuId === item.id;
  const setMenuOpen = (open: boolean) => setOpenMenuId(open ? item.id : null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [flipUp, setFlipUp] = useState(false);

  useEffect(() => {
    if (menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlipUp(window.innerHeight - rect.bottom < 180);
    }
  }, [menuOpen]);

  return (
    <div 
      ref={setNodeRef} style={style}
      {...attributes} {...listeners}
      className={`group/item flex items-center gap-3 py-3 px-4 mx-3 rounded-xl transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-20 scale-[0.98]' : 'hover:bg-neutral-50/80'
      }`}
    >
      <ItemTypeIcon type={item.type} />

      <span className="text-[11px] font-medium text-neutral-300 tabular-nums shrink-0 w-5 text-right">{String(index + 1).padStart(2, '0')}</span>
      
      <p className="text-[13px] font-medium text-neutral-700 truncate flex-1 min-w-0">{item.title}</p>

      <StatusIcon status={item.status || 'open'} scheduledDate={item.scheduledDate} startDate={item.startDate} endDate={item.endDate} />

      <div className="relative shrink-0">
        {menuOpen && <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />}
        <button 
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={`p-1.5 rounded-lg transition-all ${menuOpen ? 'bg-neutral-100 text-neutral-700 opacity-100' : 'text-neutral-300 hover:text-neutral-600 opacity-0 group-hover/item:opacity-100 hover:bg-neutral-100'}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className={`absolute right-0 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 ${flipUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onEdit(); }}><Edit3 className="w-3.5 h-3.5 text-neutral-400" />Редактировать</button>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => setMenuOpen(false)}><Copy className="w-3.5 h-3.5 text-neutral-400" />Дублировать</button>
            <div className="h-px bg-neutral-100 my-1.5 mx-2" />
            <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onDelete(); }}><Trash2 className="w-3.5 h-3.5 text-rose-400" />Удалить</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Droppable Module ────────────────────────────────────────────────────────

function DroppableModule({ module, moduleIndex, onToggle, openMenuId, setOpenMenuId, onReorderItems, onEdit, onAddLesson, onAddTest, onDelete, onDeleteItem, onEditItem }: {
  module: any, moduleIndex: number,
  onToggle: () => void, openMenuId: string | null, setOpenMenuId: (id: string | null) => void,
  onReorderItems: (moduleId: string, items: any[]) => void,
  onEdit: () => void, onAddLesson: () => void, onAddTest: () => void,
  onDelete: () => void, onDeleteItem: (itemId: string, itemTitle: string) => void,
  onEditItem: (itemId: string, itemType: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
    data: { type: 'module', module }
  });

  const { setNodeRef: setDroppableRef } = useDroppable({ id: `drop-${module.id}` });
  
  const style = { transform: CSS.Translate.toString(transform), transition };
  const menuOpen = openMenuId === module.id;
  const setMenuOpen = (open: boolean) => setOpenMenuId(open ? module.id : null);

  return (
    <div 
      ref={setNodeRef} style={style}
      className={`bg-white border rounded-2xl transition-all ${
        isDragging ? 'opacity-20 scale-[0.99] border-neutral-300' : 'border-neutral-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Module Header */}
      <div {...attributes} {...listeners} className="flex items-center gap-2.5 px-5 py-4 group/mod cursor-grab active:cursor-grabbing">
        <button onClick={onToggle} className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 rounded-md hover:bg-neutral-100">
          {module.collapsed 
            ? <ChevronRight className="w-4 h-4" /> 
            : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0 tabular-nums">
              {String(moduleIndex + 1).padStart(2, '0')}
            </span>
            <h3 className="font-semibold text-neutral-900 text-[14px] truncate">{module.title}</h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {module.items.length} {module.items.length === 1 ? 'элемент' : module.items.length < 5 ? 'элемента' : 'элементов'}
          </p>
        </div>

        <StatusIcon status={module.status || 'open'} scheduledDate={module.scheduledDate} startDate={module.startDate} endDate={module.endDate} />

        <div className="relative shrink-0">
          {menuOpen && <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />}
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className={`p-1.5 rounded-lg transition-all ${menuOpen ? 'bg-neutral-100 text-neutral-700 opacity-100' : 'text-neutral-300 hover:text-neutral-600 opacity-0 group-hover/mod:opacity-100 hover:bg-neutral-100'}`}
          >
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onEdit(); }}><Edit3 className="w-3.5 h-3.5 text-neutral-400" />Редактировать</button>
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onAddLesson(); }}><FileText className="w-3.5 h-3.5 text-neutral-400" />Добавить урок</button>
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onAddTest(); }}><HelpCircle className="w-3.5 h-3.5 text-neutral-400" />Добавить тест</button>
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => setMenuOpen(false)}><Copy className="w-3.5 h-3.5 text-neutral-400" />Дублировать</button>
              <div className="h-px bg-neutral-100 my-1.5 mx-2" />
              <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onDelete(); }}><Trash2 className="w-3.5 h-3.5 text-rose-400" />Удалить модуль</button>
            </div>
          )}
        </div>
      </div>

      {/* Module Items */}
      {!module.collapsed && (
        <div ref={setDroppableRef} className="border-t border-neutral-100 pb-2">
          <SortableContext items={module.items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            {module.items.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-neutral-300">
                Добавьте уроки или тесты в этот модуль
              </div>
            ) : (
              <div className="flex flex-col pt-1">
                {module.items.map((item: any, idx: number) => (
                  <SortableItem key={item.id} item={item} index={idx} moduleId={module.id} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onDelete={() => onDeleteItem(item.id, item.title)} onEdit={() => onEditItem(item.id, item.type)} />
                ))}
              </div>
            )}
          </SortableContext>

        </div>
      )}
    </div>
  );
}

// ─── Module Modal (Create / Edit) ────────────────────────────────────────────

const ACCESS_ICONS: Record<AccessStatus, any> = {
  open: Unlock, closed: Lock, scheduled: CalendarClock, limited: Timer,
};
const ACCESS_COLORS: Record<AccessStatus, string> = {
  open: 'text-emerald-500', closed: 'text-neutral-400', scheduled: 'text-blue-500', limited: 'text-amber-500',
};

function ModuleModal({ open, onClose, onSave, editModule }: {
  open: boolean, onClose: () => void,
  onSave: (data: any) => void,
  editModule?: any // if provided, we are editing
}) {
  const isEdit = !!editModule;
  const [title, setTitle] = useState('');
  const [access, setAccess] = useState<AccessStatus>('open');
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('18:00');

  // Populate fields when editing
  useEffect(() => {
    if (editModule) {
      setTitle(editModule.title || '');
      setAccess(editModule.status || 'open');
      // Parse dates if available
      if (editModule.scheduledDate) {
        const parts = editModule.scheduledDate.split(' ');
        setScheduledDate(parts[0] || '');
        setScheduledTime(parts[1] || '09:00');
      }
      if (editModule.startDate) {
        const parts = editModule.startDate.split(' ');
        setStartDate(parts[0] || '');
        setStartTime(parts[1] || '09:00');
      }
      if (editModule.endDate) {
        const parts = editModule.endDate.split(' ');
        setEndDate(parts[0] || '');
        setEndTime(parts[1] || '18:00');
      }
    } else {
      setTitle('');
      setAccess('open');
      setScheduledDate('');
      setScheduledTime('09:00');
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
      setEndTime('18:00');
    }
  }, [editModule, open]);

  if (!open) return null;

  const canSave = title.trim().length > 0 && (
    access === 'open' || access === 'closed' || 
    (access === 'scheduled' && scheduledDate) ||
    (access === 'limited' && startDate && endDate)
  );

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...(editModule && { id: editModule.id }),
      title: title.trim(),
      status: access,
      scheduledDate: access === 'scheduled' ? `${scheduledDate} ${scheduledTime}` : undefined,
      startDate: access === 'limited' ? `${startDate} ${startTime}` : undefined,
      endDate: access === 'limited' ? `${endDate} ${endTime}` : undefined,
    });
    onClose();
  };

  const selectedAccess = ACCESS_OPTIONS.find(o => o.id === access)!;
  const SelectedIcon = ACCESS_ICONS[access];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{isEdit ? 'Редактирование модуля' : 'Новый модуль'}</h2>
            <p className="text-[13px] text-neutral-400 mt-0.5">{isEdit ? 'Измените название и настройки доступа' : 'Добавьте модуль в структуру курса'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Название модуля</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название модуля"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all bg-neutral-50 hover:bg-white focus:bg-white"
            />
          </div>

          {/* Access */}
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Доступ к модулю</label>
            <div className="relative">
              {accessDropdownOpen && <div className="fixed inset-0 z-[10]" onClick={() => setAccessDropdownOpen(false)} />}
              <button
                onClick={() => setAccessDropdownOpen(!accessDropdownOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  accessDropdownOpen 
                    ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-500)]/20 bg-white' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                }`}
              >
                <SelectedIcon className={`w-4 h-4 ${ACCESS_COLORS[access]} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900">{selectedAccess.label}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{selectedAccess.desc}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${accessDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {accessDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  {ACCESS_OPTIONS.map(opt => {
                    const Icon = ACCESS_ICONS[opt.id];
                    return (
                      <button
                        key={opt.id}
                        onClick={() => { setAccess(opt.id); setAccessDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          access === opt.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${ACCESS_COLORS[opt.id]} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{opt.label}</p>
                          <p className="text-[11px] text-neutral-400">{opt.desc}</p>
                        </div>
                        {access === opt.id && <div className="w-2 h-2 rounded-full bg-[var(--color-admin-primary-500)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Scheduled date/time */}
          {access === 'scheduled' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Дата и время открытия</label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-32 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Limited period */}
          {access === 'limited' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Начало периода</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-32 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Конец периода</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-32 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
            Отмена
          </button>
          <Button variant="primary" disabled={!canSave} onClick={handleSave} className="font-medium text-[13px] shadow-sm">
            {isEdit ? 'Сохранить' : 'Создать модуль'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────

function CustomDropdown({ value, options, onChange }: { value: string; options: { label: string; value: string }[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] transition-all"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                value === opt.value ? 'font-semibold text-[var(--color-admin-primary-600)] bg-[var(--color-admin-primary-50)]' : 'font-medium text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Multi-Select Dropdown ───────────────────────────────────────────────────

function MultiSelectDropdown({ values, options, onChange, placeholder }: { values: string[]; options: { label: string; value: string }[]; onChange: (vals: string[]) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  
  const toggleOption = (val: string) => {
    if (val === 'All') {
      onChange(['All']);
      return;
    }
    const newVals = values.filter(v => v !== 'All');
    if (newVals.includes(val)) {
      const updated = newVals.filter(v => v !== val);
      onChange(updated.length === 0 ? ['All'] : updated);
    } else {
      onChange([...newVals, val]);
    }
  };

  const selectedLabels = values.includes('All') || values.length === 0 
    ? [placeholder] 
    : options.filter(o => values.includes(o.value)).map(o => o.label);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] transition-all"
      >
        <span className="truncate">{selectedLabels.join(', ')}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); toggleOption(opt.value); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[13px] transition-colors hover:bg-neutral-50 ${isSelected ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}
              >
                {opt.label}
                {isSelected && <Check className="w-4 h-4 text-neutral-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

function AddStudentModal({
  open,
  onClose,
  onAddSelected,
  onAddAll,
}: {
  open: boolean;
  onClose: () => void;
  onAddSelected: (students: any[]) => void;
  onAddAll: (filters: any) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState<string[]>(['All']);
  const [filterSchool, setFilterSchool] = useState<string[]>(['All']);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Mock global students
  const ALL_GLOBAL_STUDENTS = [
    { id: 'g1', name: 'Иван Сергеев', email: 'ivan@example.com', phone: '+7 900 123 45 67', city: 'Москва', school: 'Школа №1' },
    { id: 'g2', name: 'Мария Власова', email: 'maria@example.com', phone: '+7 900 234 56 78', city: 'Санкт-Петербург', school: 'Лицей №2' },
    { id: 'g3', name: 'Петр Николаев', email: 'petr@example.com', phone: '+7 900 345 67 89', city: 'Москва', school: 'Школа №1' },
    { id: 'g4', name: 'Анна Смирнова', email: 'anna@example.com', phone: '+7 900 456 78 90', city: 'Казань', school: 'Гимназия №3' },
  ];

  const filtered = ALL_GLOBAL_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                       s.email.toLowerCase().includes(search.toLowerCase()) || 
                       s.phone.includes(search);
    const matchCity = filterCity.includes('All') || filterCity.includes(s.city);
    const matchSchool = filterSchool.includes('All') || filterSchool.includes(s.school);
    return matchSearch && matchCity && matchSchool;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddSelected = () => {
    const selectedStudents = ALL_GLOBAL_STUDENTS.filter(s => selectedIds.has(s.id)).map(s => ({
      id: s.id, name: s.name, progress: 0, assignedDate: new Date().toISOString(), lastActivity: null, completedDate: null
    }));
    onAddSelected(selectedStudents);
    setSelectedIds(new Set());
    onClose();
  };

  const handleAddAll = () => {
    onAddAll({ search, filterCity, filterSchool }); // In a real app this would send filters to backend
    const allFiltered = filtered.map(s => ({
      id: s.id, name: s.name, progress: 0, assignedDate: new Date().toISOString(), lastActivity: null, completedDate: null
    }));
    onAddSelected(allFiltered);
    setSelectedIds(new Set());
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Добавить студентов</h2>
            <p className="text-[13px] text-neutral-500 mt-0.5">Выберите студентов для зачисления на курс</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Поиск по ФИО, телефону или email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:ring-2 focus:ring-[var(--color-admin-primary-500)] outline-none"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col z-[50]">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Город</label>
              <MultiSelectDropdown
                values={filterCity}
                onChange={setFilterCity}
                placeholder="Все города"
                options={[
                  { value: 'All', label: 'Все города' },
                  { value: 'Москва', label: 'Москва' },
                  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
                  { value: 'Казань', label: 'Казань' }
                ]}
              />
            </div>
            <div className="flex flex-col z-[50]">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Учебное заведение</label>
              <MultiSelectDropdown
                values={filterSchool}
                onChange={setFilterSchool}
                placeholder="Все заведения"
                options={[
                  { value: 'All', label: 'Все' },
                  { value: 'Школа №1', label: 'Школа №1' },
                  { value: 'Лицей №2', label: 'Лицей №2' },
                  { value: 'Гимназия №3', label: 'Гимназия №3' }
                ]}
              />
            </div>
          </div>

          {/* List */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden mt-2">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 sticky top-0 border-b border-neutral-100 z-10">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filtered.map(s => s.id)));
                          else setSelectedIds(new Set());
                        }}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                      />
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-neutral-500 uppercase">Студент</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-neutral-500 uppercase">Контакты</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-neutral-500 uppercase">Детали</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">По вашему запросу студенты не найдены</td>
                    </tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50/50 cursor-pointer" onClick={() => toggleSelect(s.id)}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          onClick={e => e.stopPropagation()}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-neutral-900">{s.name}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        <div className="max-w-[120px] truncate" title={s.email}>{s.email}</div>
                        <div className="mt-0.5">{s.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        <div>{s.city}</div>
                        <div className="mt-0.5">{s.school}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between rounded-b-2xl">
          <button onClick={handleAddAll} className="text-[13px] font-medium text-[var(--color-admin-primary-600)] hover:text-[var(--color-admin-primary-700)] px-3 py-2 rounded-lg hover:bg-[var(--color-admin-primary-50)] transition-colors">
            Добавить всех ({filtered.length})
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-[13px] font-medium text-neutral-500 hover:text-neutral-700 px-4 py-2 hover:bg-neutral-100 rounded-xl transition-colors">Отмена</button>
            <Button variant="primary" disabled={selectedIds.size === 0} onClick={handleAddSelected} className="text-[13px] font-medium">
              Добавить выбранных ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Details Modal ─────────────────────────────────────────────────────

function StudentDetailsModal({
  student,
  courseId,
  open,
  onClose,
}: {
  student: any | null;
  courseId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{student.name}</h2>
            <p className="text-[13px] text-neutral-500 mt-0.5">Информация по курсу {courseId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/users/${student.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Полный профиль
            </button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Прогресс</span>
              <span className={`text-xl font-bold ${student.progress === 100 ? 'text-emerald-600' : student.progress > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>{student.progress}%</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 col-span-3">
              <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Активность</span>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-neutral-600">Назначен: {new Date(student.assignedDate).toLocaleDateString()}</p>
                  <p className="text-xs text-neutral-600 mt-1">Посл. акт: {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : '—'}</p>
                </div>
                {student.completedDate && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Завершён {new Date(student.completedDate).toLocaleDateString('ru-RU')} {new Date(student.completedDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Прохождение модулей и уроков</h3>
            <div className="space-y-2 border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
              {/* Fake progress items */}
              <div className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-neutral-900">1. Введение в корпоративную безопасность</span>
                  </div>
                  <span className="text-xs text-neutral-500">15.03.2026</span>
                </div>
                <div className="ml-6 space-y-2 mt-2 border-l-2 border-emerald-100 pl-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-neutral-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 1.1 Что такое корпоративная безопасность</span>
                      <div className="ml-3.5 mt-1.5 p-2 bg-neutral-50 rounded-lg border border-neutral-100 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[10px] font-semibold text-neutral-500 ml-1">5/5</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 italic">"Отличное введение, всё кратко и по делу!"</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md self-start" title="Пройден: 14.03.2026 12:15">Пройден (14.03.2026 12:15)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-neutral-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 1.2 Тест: Основные понятия</span>
                      <span className="text-[11px] text-emerald-600 ml-3.5 mt-0.5">Оценка: 100/100 (Сдан)</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md" title="Пройден: 15.03.2026 10:00">Пройден (15.03.2026 10:00)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-neutral-900">2. Защита информации</span>
                  </div>
                  <span className="text-xs text-neutral-500">В процессе</span>
                </div>
                <div className="ml-6 space-y-2 mt-2 border-l-2 border-amber-100 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 2.1 Методы защиты данных</span>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md" title="Пройден: 16.03.2026 11:30">Пройден (16.03.2026 11:30)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-neutral-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div> 2.2 Шифрование и VPN</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-semibold bg-neutral-100 px-2 py-0.5 rounded-md">Не начат</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-neutral-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 2.3 Тест: Защита данных</span>
                      <span className="text-[11px] text-rose-600 ml-3.5 mt-0.5">Оценка: 40/100 (Провален)</span>
                    </div>
                    <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md" title="Последняя попытка: 17.03.2026 14:15">Не сдан (17.03.2026 14:15)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Course Detail Page ─────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const courseData = COURSES_DB[courseId];
  const [activeTab, setActiveTab] = useState<'materials' | 'students' | 'settings'>('materials');
  const [modules, setModules] = useState<any[]>(courseData?.modules || []);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, title: string, name: string, onConfirm: () => void }>({ open: false, title: '', name: '', onConfirm: () => {} });
  const [students, setStudents] = useState<any[]>(MOCK_STUDENTS[courseId] || []);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(0);
  const [studentsPerPage, setStudentsPerPage] = useState(20);
  const [studentSort, setStudentSort] = useState<{ key: string, dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [perPageOpen, setPerPageOpen] = useState(false);

  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any | null>(null);

  // Settings state
  const [settingsTitle, setSettingsTitle] = useState(courseData?.title || '');
  const [settingsDesc, setSettingsDesc] = useState(courseData?.description || '');
  const [settingsAltTitle, setSettingsAltTitle] = useState('');
  const [settingsAltDesc, setSettingsAltDesc] = useState('');
  const [settingsStatus, setSettingsStatus] = useState(courseData?.status || 'Draft');
  const [settingsInCatalog, setSettingsInCatalog] = useState(courseData?.inCatalog || false);
  const [settingsHours, setSettingsHours] = useState(courseData?.hours || 0);
  const [settingsLang, setSettingsLang] = useState(courseData?.lang || 'Русский');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [settingsStatusOpen, setSettingsStatusOpen] = useState(false);
  const [settingsLangOpen, setSettingsLangOpen] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!courseData) {
    return (
      <div className="flex flex-col min-h-full w-full">
        <PageHeader title="Курс не найден" backHref="/courses" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500">Курс с ID «{courseId}» не найден</p>
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(courseData.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const totalElements = modules.reduce((acc, m) => acc + m.items.length, 0);

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, collapsed: !m.collapsed } : m));
  };

  const handleReorderItems = (moduleId: string, newItems: any[]) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, items: newItems } : m));
  };

  const handleSaveModule = (data: any) => {
    if (data.id) {
      // Edit existing module
      setModules(prev => prev.map(m => m.id === data.id ? {
        ...m,
        title: data.title,
        status: data.status,
        scheduledDate: data.scheduledDate,
        startDate: data.startDate,
        endDate: data.endDate,
      } : m));
    } else {
      // Create new module
      const newModule = {
        id: `m-${Date.now()}`,
        title: data.title,
        collapsed: false,
        status: data.status,
        scheduledDate: data.scheduledDate,
        startDate: data.startDate,
        endDate: data.endDate,
        items: [],
      };
      setModules(prev => [...prev, newModule]);
    }
    setEditingModule(null);
  };

  const handleEditModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setEditingModule(mod);
      setModuleModalOpen(true);
    }
  };

  const handleAddItem = (moduleId: string, type: 'lesson' | 'test') => {
    const newItemId = `item-${Date.now()}`;
    const newItem = {
      id: newItemId,
      type,
      title: type === 'lesson' ? 'Новый урок' : 'Новый тест',
      status: 'open' as AccessStatus,
    };
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, items: [...m.items, newItem], collapsed: false } : m
    ));
    if (type === 'test') {
      router.push(`/courses/${courseId}/test/${newItemId}`);
    } else {
      router.push(`/courses/${courseId}/lesson/${newItemId}`);
    }
  };

  const handleEditItem = (itemId: string, itemType: string) => {
    if (itemType === 'test') {
      router.push(`/courses/${courseId}/test/${itemId}`);
    } else {
      router.push(`/courses/${courseId}/lesson/${itemId}`);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    setDeleteModal({
      open: true,
      title: 'Удалить модуль',
      name: mod.title,
      onConfirm: () => setModules(prev => prev.filter(m => m.id !== moduleId)),
    });
  };

  const handleDeleteItem = (moduleId: string, itemId: string, itemTitle: string) => {
    setDeleteModal({
      open: true,
      title: 'Удалить элемент',
      name: itemTitle,
      onConfirm: () => setModules(prev => prev.map(m =>
        m.id === moduleId ? { ...m, items: m.items.filter((i: any) => i.id !== itemId) } : m
      )),
    });
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    setDeleteModal({
      open: true,
      title: 'Удалить студента с курса',
      name: studentName,
      onConfirm: () => setStudents(prev => prev.filter(s => s.id !== studentId)),
    });
  };

  const handleAddStudent = () => {
    setAddStudentModalOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSort = (key: string) => {
    setStudentSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setStudentPage(0);
  };

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
    .sort((a, b) => {
      const { key, dir } = studentSort;
      const mul = dir === 'asc' ? 1 : -1;
      if (key === 'name') return mul * a.name.localeCompare(b.name, 'ru');
      if (key === 'progress') return mul * (a.progress - b.progress);
      if (key === 'assignedDate') return mul * (new Date(a.assignedDate).getTime() - new Date(b.assignedDate).getTime());
      if (key === 'lastActivity') {
        const aT = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bT = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return mul * (aT - bT);
      }
      if (key === 'completedDate') {
        const aT = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const bT = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return mul * (aT - bT);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const pagedStudents = filteredStudents.slice(studentPage * studentsPerPage, (studentPage + 1) * studentsPerPage);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'module' && overData?.type === 'module') {
      if (active.id !== over.id) {
        setModules(prev => {
          const oldIndex = prev.findIndex(m => m.id === active.id);
          const newIndex = prev.findIndex(m => m.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      return;
    }

    if (activeData?.type === 'item' && overData?.type === 'item') {
      const sourceModuleId = activeData.moduleId;
      const targetModuleId = overData.moduleId;

      if (sourceModuleId === targetModuleId) {
        setModules(prev => prev.map(m => {
          if (m.id !== sourceModuleId) return m;
          const oldIdx = m.items.findIndex((i: any) => i.id === active.id);
          const newIdx = m.items.findIndex((i: any) => i.id === over.id);
          return { ...m, items: arrayMove(m.items, oldIdx, newIdx) };
        }));
      } else {
        setModules(prev => {
          const item = prev.find(m => m.id === sourceModuleId)?.items.find((i: any) => i.id === active.id);
          if (!item) return prev;
          return prev.map(m => {
            if (m.id === sourceModuleId) return { ...m, items: m.items.filter((i: any) => i.id !== active.id) };
            if (m.id === targetModuleId) {
              const targetIdx = m.items.findIndex((i: any) => i.id === over.id);
              const newItems = [...m.items];
              newItems.splice(targetIdx, 0, item);
              return { ...m, items: newItems };
            }
            return m;
          });
        });
      }
      return;
    }

    if (activeData?.type === 'item' && over.id.toString().startsWith('drop-')) {
      const targetModuleId = over.id.toString().replace('drop-', '');
      const sourceModuleId = activeData.moduleId;
      if (sourceModuleId === targetModuleId) return;

      setModules(prev => {
        const item = prev.find(m => m.id === sourceModuleId)?.items.find((i: any) => i.id === active.id);
        if (!item) return prev;
        return prev.map(m => {
          if (m.id === sourceModuleId) return { ...m, items: m.items.filter((i: any) => i.id !== active.id) };
          if (m.id === targetModuleId) return { ...m, items: [...m.items, item] };
          return m;
        });
      });
    }
  };

  const tabs = [
    { id: 'materials' as const, label: 'Содержание', icon: BookOpen },
    { id: 'students' as const, label: 'Студенты', icon: Users },
    { id: 'settings' as const, label: 'Настройки', icon: Settings },
  ];

  const statusLabel = courseData.status === 'Active' ? 'Активен' : courseData.status === 'Draft' ? 'Черновик' : 'Архив';
  const statusClass = courseData.status === 'Active' 
    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
    : courseData.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-200' 
    : 'bg-neutral-100 text-neutral-500 border-neutral-200';

  return (
    <div className="flex flex-col min-h-full w-full">
      <PageHeader 
        breadcrumbs={[
          { label: 'Курсы', href: '/courses' },
          { label: courseData.title },
        ]}
      />

      <div className="flex-1 overflow-auto">
        {/* Banner */}
        <div className={`h-44 w-full relative ${courseData.cover} shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        </div>

        {/* Course Info Card */}
        <div className="max-w-6xl mx-auto w-full px-6 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* PFP Icon */}
              <div className={`w-[72px] h-[72px] rounded-2xl shrink-0 shadow-lg ring-4 ring-white flex items-center justify-center ${courseData.cover}`}>
                <BookOpen className="w-7 h-7 text-white drop-shadow-md" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <button 
                    onClick={handleCopyId}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all active:scale-95 ${
                      copiedId 
                        ? 'bg-[var(--color-admin-primary-600)] text-white' 
                        : 'font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-700'
                    }`}
                  >
                    {copiedId ? 'ID скопирован' : courseData.id}
                  </button>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${statusClass}`}>{statusLabel}</span>
                  {courseData.inCatalog && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border bg-blue-50 text-blue-500 border-blue-200">В каталоге</span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1.5">{courseData.title}</h1>
                <p className="text-[13px] text-neutral-500 leading-relaxed max-w-2xl">{courseData.description}</p>
              </div>
            </div>

            {/* Stats Row: Язык, Часы, Модули, Элементы, Студенты */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-5 border-t border-neutral-100">
              {[
                { icon: Globe, label: 'Язык', value: courseData.lang, isText: true },
                { icon: Clock, label: 'Часы', value: courseData.hours },
                { icon: BookOpen, label: 'Модули', value: modules.length },
                { icon: Layers, label: 'Элементы', value: totalElements },
                { icon: Users, label: 'Студенты', value: courseData.users },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                    <stat.icon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className={`font-bold text-neutral-900 leading-tight ${(stat as any).isText ? 'text-[13px]' : 'text-base'}`}>{stat.value}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto w-full px-6 mt-6">
          <div className="flex gap-1 border-b border-neutral-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto w-full px-6 py-6 pb-12">
          {activeTab === 'materials' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-semibold text-neutral-900">Структура курса</h2>
                  <p className="text-[12px] text-neutral-400 mt-0.5">
                    {modules.length} {modules.length === 1 ? 'модуль' : modules.length < 5 ? 'модуля' : 'модулей'} · {totalElements} {totalElements === 1 ? 'элемент' : totalElements < 5 ? 'элемента' : 'элементов'}
                  </p>
                </div>
                <Button variant="primary" onClick={() => { setEditingModule(null); setModuleModalOpen(true); }} className="font-medium gap-2 shadow-sm text-[13px]">
                  <Plus className="w-4 h-4" />
                  Добавить модуль
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {modules.length === 0 ? (
                      <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
                          <BookOpen className="w-6 h-6 text-neutral-300" />
                        </div>
                        <h3 className="font-semibold text-neutral-800 mb-1">Пока нет модулей</h3>
                        <p className="text-[13px] text-neutral-400 max-w-sm">Создайте первый модуль, чтобы начать наполнять курс учебными материалами</p>
                      </div>
                    ) : (
                      modules.map((mod, idx) => (
                        <DroppableModule
                          key={mod.id}
                          module={mod}
                          moduleIndex={idx}
                          onToggle={() => toggleModule(mod.id)}
                          openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          onReorderItems={handleReorderItems}
                          onEdit={() => handleEditModule(mod.id)}
                          onAddLesson={() => handleAddItem(mod.id, 'lesson')}
                          onAddTest={() => handleAddItem(mod.id, 'test')}
                          onDelete={() => handleDeleteModule(mod.id)}
                          onDeleteItem={(itemId, itemTitle) => handleDeleteItem(mod.id, itemId, itemTitle)}
                          onEditItem={handleEditItem}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {activeItem?.type === 'module' ? (
                    <div className="opacity-90 rotate-1 cursor-grabbing shadow-2xl bg-white border border-neutral-200 rounded-2xl px-5 py-4 w-full max-w-2xl">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Модуль</span>
                        <h3 className="font-semibold text-neutral-900 text-[14px] truncate">{activeItem.module?.title}</h3>
                      </div>
                    </div>
                  ) : activeItem?.type === 'item' ? (
                    <div className="opacity-90 rotate-1 cursor-grabbing shadow-2xl bg-white border border-neutral-200 rounded-xl py-3 px-4 flex items-center gap-3 max-w-lg">
                      <ItemTypeIcon type={activeItem.item?.type} />
                      <p className="text-[13px] font-medium text-neutral-800 truncate">{activeItem.item?.title}</p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-neutral-900">Студенты курса</h2>
                  <p className="text-[12px] text-neutral-400 mt-0.5">{students.length} {students.length === 1 ? 'студент' : students.length < 5 ? 'студента' : 'студентов'}</p>
                </div>
                <Button variant="primary" onClick={handleAddStudent} className="font-medium gap-2 shadow-sm text-[13px]">
                  <UserPlus className="w-4 h-4" />
                  Добавить студента
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(0); }}
                  placeholder="Поиск по имени студента..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-white transition-all"
                />
              </div>

              {/* Students Table */}
              {filteredStudents.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">{studentSearch ? 'Студенты не найдены' : 'Нет студентов'}</h3>
                  <p className="text-[13px] text-neutral-400 max-w-sm">{studentSearch ? 'Попробуйте изменить поисковый запрос' : 'Добавьте студентов на курс, чтобы отслеживать их прогресс'}</p>
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                  {/* Table */}
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50/80 border-b border-neutral-100">
                        <th className="text-left pl-5 pr-1 py-2.5 w-10">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase">#</span>
                        </th>
                        <th className="text-left px-2 py-2.5">
                          <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors">
                            Студент
                            <ArrowUpDown className={`w-3 h-3 ${studentSort.key === 'name' ? 'text-neutral-700' : 'text-neutral-300'}`} />
                          </button>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[80px]">
                          <button onClick={() => toggleSort('progress')} className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors">
                            Прогресс
                            <ArrowUpDown className={`w-3 h-3 ${studentSort.key === 'progress' ? 'text-neutral-700' : 'text-neutral-300'}`} />
                          </button>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[130px]">
                          <button onClick={() => toggleSort('assignedDate')} className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors">
                            Назначен
                            <ArrowUpDown className={`w-3 h-3 ${studentSort.key === 'assignedDate' ? 'text-neutral-700' : 'text-neutral-300'}`} />
                          </button>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[130px]">
                          <button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors">
                            Активность
                            <ArrowUpDown className={`w-3 h-3 ${studentSort.key === 'lastActivity' ? 'text-neutral-700' : 'text-neutral-300'}`} />
                          </button>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[130px]">
                          <button onClick={() => toggleSort('completedDate')} className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors">
                            Завершён
                            <ArrowUpDown className={`w-3 h-3 ${studentSort.key === 'completedDate' ? 'text-neutral-700' : 'text-neutral-300'}`} />
                          </button>
                        </th>
                        <th className="w-9 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedStudents.map((student, idx) => {
                        const globalIdx = studentPage * studentsPerPage + idx + 1;
                        const progressTextColor = student.progress === 100 ? 'text-emerald-600' : student.progress >= 50 ? 'text-blue-600' : student.progress > 0 ? 'text-amber-600' : 'text-neutral-400';
                        return (
                          <tr 
                            key={student.id} 
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="group/row border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors cursor-pointer"
                          >
                            <td className="pl-5 pr-1 py-2.5" onClick={e => e.stopPropagation()}>
                              <span className="text-[11px] text-neutral-300 tabular-nums">{globalIdx}</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-[13px] font-medium text-neutral-800 truncate block">{student.name}</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className={`text-[12px] font-semibold tabular-nums ${progressTextColor}`}>{student.progress}%</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-[11px] text-neutral-500 tabular-nums">{formatDate(student.assignedDate)}</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-[11px] text-neutral-500 tabular-nums">{formatDate(student.lastActivity)}</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <span className="text-[11px] text-neutral-500 tabular-nums">{formatDate(student.completedDate)}</span>
                            </td>
                            <td className="pr-4 py-2.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleRemoveStudent(student.id, student.name)}
                                className="p-1 rounded-md text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/row:opacity-100"
                                title="Удалить с курса"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/40">
                    {/* Per page dropdown */}
                    <div className="relative">
                      {perPageOpen && <div className="fixed inset-0 z-[90]" onClick={() => setPerPageOpen(false)} />}
                      <button
                        onClick={() => setPerPageOpen(!perPageOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 transition-colors"
                      >
                        {studentsPerPage} на стр.
                        <ChevronDown className="w-3 h-3 text-neutral-400" />
                      </button>
                      {perPageOpen && (
                        <div className="absolute left-0 bottom-full mb-1 w-24 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100] animate-in fade-in zoom-in-95 duration-150">
                          {[20, 50, 100].map(n => (
                            <button
                              key={n}
                              onClick={() => { setStudentsPerPage(n); setStudentPage(0); setPerPageOpen(false); }}
                              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                                studentsPerPage === n ? 'font-semibold text-neutral-900 bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Page numbers */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setStudentPage(p => Math.max(0, p - 1))}
                        disabled={studentPage === 0}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>

                      {(() => {
                        const pages: (number | '...')[] = [];
                        if (totalPages <= 7) {
                          for (let i = 0; i < totalPages; i++) pages.push(i);
                        } else {
                          pages.push(0);
                          if (studentPage > 2) pages.push('...');
                          const start = Math.max(1, studentPage - 1);
                          const end = Math.min(totalPages - 2, studentPage + 1);
                          for (let i = start; i <= end; i++) pages.push(i);
                          if (studentPage < totalPages - 3) pages.push('...');
                          pages.push(totalPages - 1);
                        }
                        return pages.map((p, i) =>
                          p === '...' ? (
                            <span key={`dot-${i}`} className="px-1 text-[11px] text-neutral-300">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setStudentPage(p)}
                              className={`min-w-[28px] h-7 rounded-md text-[11px] font-medium tabular-nums transition-colors ${
                                studentPage === p
                                  ? 'bg-neutral-900 text-white'
                                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                              }`}
                            >
                              {(p as number) + 1}
                            </button>
                          )
                        );
                      })()}

                      <button
                        onClick={() => setStudentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={studentPage >= totalPages - 1}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

              {/* — Visual Settings — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-[14px] font-semibold text-neutral-900">Оформление</h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Иконка и баннер курса</p>
                </div>
                <div className="px-6 py-5">
                  {/* Banner */}
                  <div className="mb-5">
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Баннер курса</label>
                    <div className={`relative h-32 rounded-xl ${courseData.cover} overflow-hidden group/banner cursor-pointer`}>
                      <div className="absolute inset-0 bg-black/0 group-hover/banner:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-neutral-800 shadow-lg">
                          <Upload className="w-4 h-4" />
                          Загрузить баннер
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] text-neutral-400 mt-2">Рекомендуемый размер 1920×1080 px</p>
                  </div>
                  {/* Icon */}
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Иконка курса</label>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${courseData.cover} flex items-center justify-center shadow-md group/icon cursor-pointer relative overflow-hidden`}>
                        <span className="text-2xl font-bold text-white">{courseData.title[0]}</span>
                        <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/30 transition-colors flex items-center justify-center">
                          <Upload className="w-4 h-4 text-white opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <p className="text-[12px] text-neutral-400">PNG, JPG или SVG. Рекомендуемый размер 512×512 px</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* — General Info — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-[14px] font-semibold text-neutral-900">Основная информация</h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Название и описание курса</p>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Название курса</label>
                    <input
                      type="text"
                      value={settingsTitle}
                      onChange={(e) => setSettingsTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Описание</label>
                    <textarea
                      value={settingsDesc}
                      onChange={(e) => setSettingsDesc(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* — Localization — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-neutral-400" />
                    <div>
                      <h3 className="text-[14px] font-semibold text-neutral-900">Дополнительный язык</h3>
                      <p className="text-[12px] text-neutral-400 mt-0.5">
                        Основной язык: <span className="font-medium text-neutral-600">{settingsLang}</span> — дополнительно на <span className="font-medium text-neutral-600">{settingsLang === 'Русский' ? 'узбекском' : 'русском'}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Название ({settingsLang === 'Русский' ? 'Узбекский' : 'Русский'})
                    </label>
                    <input
                      type="text"
                      value={settingsAltTitle}
                      onChange={(e) => setSettingsAltTitle(e.target.value)}
                      placeholder={settingsLang === 'Русский' ? 'Kurs nomi...' : 'Название курса...'}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Описание ({settingsLang === 'Русский' ? 'Узбекский' : 'Русский'})
                    </label>
                    <textarea
                      value={settingsAltDesc}
                      onChange={(e) => setSettingsAltDesc(e.target.value)}
                      rows={3}
                      placeholder={settingsLang === 'Русский' ? 'Kurs tavsifi...' : 'Описание курса...'}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* — Status & Visibility — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-[14px] font-semibold text-neutral-900">Статус и видимость</h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Управление статусом курса и его отображением в каталоге</p>
                </div>
                <div className="px-6 py-5 space-y-5">
                  {/* Status */}
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Статус курса</label>
                    <div className="relative">
                      {settingsStatusOpen && <div className="fixed inset-0 z-[90]" onClick={() => setSettingsStatusOpen(false)} />}
                      <button
                        onClick={() => setSettingsStatusOpen(!settingsStatusOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white text-sm text-neutral-900 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${
                            settingsStatus === 'Active' ? 'bg-emerald-500' : settingsStatus === 'Draft' ? 'bg-amber-500' : 'bg-neutral-400'
                          }`} />
                          {settingsStatus === 'Active' ? 'Активный' : settingsStatus === 'Draft' ? 'Черновик' : 'Архив'}
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </button>
                      {settingsStatusOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100] animate-in fade-in zoom-in-95 duration-150">
                          {(['Draft', 'Active', 'Archived'] as const).map(s => {
                            const label = s === 'Active' ? 'Активный' : s === 'Draft' ? 'Черновик' : 'Архив';
                            const desc = s === 'Active' ? 'Курс доступен студентам' : s === 'Draft' ? 'Курс в разработке' : 'Курс скрыт для новых студентов';
                            const dot = s === 'Active' ? 'bg-emerald-500' : s === 'Draft' ? 'bg-amber-500' : 'bg-neutral-400';
                            return (
                              <button
                                key={s}
                                onClick={() => { setSettingsStatus(s); setSettingsStatusOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                  settingsStatus === s ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] ${settingsStatus === s ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>{label}</p>
                                  <p className="text-[11px] text-neutral-400">{desc}</p>
                                </div>
                                {settingsStatus === s && <Check className="w-4 h-4 text-neutral-900 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Catalog */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-[13px] font-medium text-neutral-800">Отображать в каталоге</p>
                      <p className="text-[12px] text-neutral-400 mt-0.5">Курс будет виден в общем каталоге курсов</p>
                    </div>
                    <button
                      onClick={() => setSettingsInCatalog(!settingsInCatalog)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        settingsInCatalog ? 'bg-emerald-500' : 'bg-neutral-200'
                      }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        settingsInCatalog ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* — Course Details — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-[14px] font-semibold text-neutral-900">Параметры курса</h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Продолжительность и язык</p>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Продолжительность (часов)</label>
                      <input
                        type="number"
                        min={0}
                        value={settingsHours}
                        onChange={(e) => setSettingsHours(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Язык курса</label>
                      <div className="relative">
                        {settingsLangOpen && <div className="fixed inset-0 z-[90]" onClick={() => setSettingsLangOpen(false)} />}
                        <button
                          onClick={() => setSettingsLangOpen(!settingsLangOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white text-sm text-neutral-900 transition-all"
                        >
                          {settingsLang}
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        </button>
                        {settingsLangOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100] animate-in fade-in zoom-in-95 duration-150">
                            {['Русский', 'Узбекский', 'Английский'].map(lang => (
                              <button
                                key={lang}
                                onClick={() => { setSettingsLang(lang); setSettingsLangOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-[13px] transition-colors ${
                                  settingsLang === lang ? 'font-semibold text-neutral-900 bg-neutral-50' : 'font-medium text-neutral-700 hover:bg-neutral-50'
                                }`}
                              >
                                {lang}
                                {settingsLang === lang && <Check className="w-4 h-4 text-neutral-900" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">ID курса</label>
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 font-mono flex-1">{courseData.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* — Links — */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-[14px] font-semibold text-neutral-900">Ссылки</h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">Ссылки для назначения и оплаты курса</p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  {[
                    { key: 'assign', label: 'Назначение курса', desc: 'Ссылка для назначения курса студенту', url: `https://platform.osnova.uz/assign/${courseData.id}` },
                    { key: 'payment', label: 'Оплата курса', desc: 'Ссылка для оплаты и самостоятельной записи', url: `https://platform.osnova.uz/pay/${courseData.id}` },
                  ].map(link => (
                    <div key={link.key} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                        <Link className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-neutral-800">{link.label}</p>
                        <p className="text-[11px] text-neutral-400 truncate font-mono">{link.url}</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(link.url); setCopiedLink(link.key); setTimeout(() => setCopiedLink(null), 2000); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                          copiedLink === link.key
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800'
                        }`}
                      >
                        {copiedLink === link.key ? (
                          <><Check className="w-3.5 h-3.5" /> Скопировано</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Копировать</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pb-4">
                {settingsSaved && (
                  <span className="text-[13px] text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Check className="w-4 h-4" /> Изменения сохранены
                  </span>
                )}
                <Button
                  variant="primary"
                  className="font-medium text-[13px] shadow-sm px-6"
                  onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}
                >
                  Сохранить изменения
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Modal (Create / Edit) */}
      <ModuleModal
        open={moduleModalOpen}
        onClose={() => { setModuleModalOpen(false); setEditingModule(null); }}
        onSave={handleSaveModule}
        editModule={editingModule}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal(prev => ({ ...prev, open: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        itemName={deleteModal.name}
      />
      
      {/* Add Student Modal */}
      <AddStudentModal 
        open={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
        onAddSelected={(newStudents) => setStudents(prev => [...newStudents, ...prev])}
        onAddAll={(filters) => { console.log('Adding all with filters:', filters); }}
      />

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudentForDetails}
        courseId={courseId}
        open={selectedStudentForDetails !== null}
        onClose={() => setSelectedStudentForDetails(null)}
      />
    </div>
  );
}
