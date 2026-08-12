"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Plus, Users, MoreVertical, LayoutGrid, List, Folder, Edit3, Move, Trash2, CalendarDays, MapPin, Video } from 'lucide-react';
import { DndContext, DragOverlay, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EventFolder {
  id: string;
  title: string;
  coursesCount: number;
  parentId: string | null;
  colorId: string;
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  format: 'online' | 'offline';
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  speakers: string;
  location: string;
  status: 'draft' | 'registration' | 'in_progress' | 'completed';
  registrationOpen: boolean;
  participants: number;
  participantLimit: number | null;
  parentId: string | null;
  dates?: { id: string; date: string; timeStart: string; timeEnd: string }[];
  registrationDates?: { id: string; dateStart: string; timeStart: string; dateEnd: string; timeEnd: string }[];
  description?: string;
  blocks?: any[];
  lang?: 'RUS' | 'UZB' | 'ENG';
  registrationType?: 'open' | 'private';
  createdAt?: string;
  scale?: 'Внутреннее' | 'Локальное' | 'Международное';
}

const FOLDER_COLORS = [
  { id: 'red', icon: 'text-red-600', bg: 'bg-red-100' },
  { id: 'orange', icon: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'yellow', icon: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'emerald', icon: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'slate', icon: 'text-slate-600', bg: 'bg-slate-200' },
  { id: 'blue', icon: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'purple', icon: 'text-purple-600', bg: 'bg-purple-100' },
];

const INITIAL_FOLDERS: EventFolder[] = [
  { id: 'f1', title: 'Корпоративные', coursesCount: 2, parentId: null, colorId: 'blue' },
  { id: 'f2', title: 'Обучающие', coursesCount: 2, parentId: null, colorId: 'emerald' },
  { id: 'f3', title: 'Тимбилдинг', coursesCount: 1, parentId: null, colorId: 'orange' },
];

const INITIAL_EVENTS: EventItem[] = [
  { id: 'EVT-000', title: 'Форум Инновационного Банкинга (Период)', type: 'Конференция', format: 'offline', date: '2026-04-15', timeStart: '10:00', timeEnd: '17:00', speakers: 'Азиз Каримов, Елена Смирнова, Дмитрий Волков', location: 'Главный офис, Зал A (от 15.04.2026 до 22.04.2026)', status: 'registration', registrationOpen: true, participants: 47, participantLimit: 60, parentId: 'f2', lang: 'RUS', registrationType: 'open', createdAt: '2026-05-10T10:00:00.000Z', scale: 'Международное' },
  { id: 'EVT-001', title: 'Основы искусственного интеллекта', type: 'Воркшоп', format: 'offline', date: '2026-03-28', timeStart: '10:00', timeEnd: '13:00', speakers: 'Азиз Каримов', location: 'Главный офис, Зал A', status: 'registration', registrationOpen: true, participants: 47, participantLimit: 60, parentId: 'f2', lang: 'RUS', registrationType: 'open', createdAt: '2026-05-10T10:00:00.000Z', scale: 'Внутреннее' },
  { id: 'EVT-002', title: 'Эффективные переговоры', type: 'Тренинг', format: 'offline', date: '2026-04-02', timeStart: '09:00', timeEnd: '17:00', speakers: 'Бизнес-тренеры OCA', location: 'Учебный центр, комната 3', status: 'registration', registrationOpen: true, participants: 30, participantLimit: 30, parentId: 'f1', lang: 'UZB', registrationType: 'private', createdAt: '2026-05-12T14:30:00.000Z', scale: 'Локальное' },
  { id: 'EVT-003', title: 'Финансовый риск-менеджмент', type: 'Вебинар', format: 'online', date: '2026-04-10', timeStart: '14:00', timeEnd: '16:00', speakers: 'Фаррух Юсупов, Елена Смирнова', location: 'Zoom трансляция', status: 'in_progress', registrationOpen: true, participants: 18, participantLimit: 100, parentId: 'f2', lang: 'ENG', registrationType: 'open', createdAt: '2026-05-15T09:15:00.000Z', scale: 'Международное' },
  { id: 'EVT-004', title: 'Digital Banking Summit', type: 'Конференция', format: 'offline', date: '2026-03-15', timeStart: '09:00', timeEnd: '18:00', speakers: 'Приглашенные спикеры', location: 'Hyatt Regency Tashkent', status: 'completed', registrationOpen: false, participants: 87, participantLimit: 120, parentId: null, lang: 'RUS', registrationType: 'open', createdAt: '2026-05-18T18:00:00.000Z', scale: 'Международное' },
  { id: 'EVT-005', title: 'Excel продвинутый уровень', type: 'Мастер-класс', format: 'offline', date: '2026-05-20', timeStart: '10:00', timeEnd: '12:00', speakers: 'Мадина Рахимова', location: 'Главный офис, Зал B', status: 'in_progress', registrationOpen: false, participants: 22, participantLimit: 25, parentId: 'f1', lang: 'RUS', registrationType: 'private', createdAt: '2026-05-20T11:45:00.000Z', scale: 'Внутреннее' },
  { id: 'EVT-006', title: 'Летний тимбилдинг', type: 'Тимбилдинг', format: 'offline', date: '2026-06-12', timeStart: '12:00', timeEnd: '18:00', speakers: 'HR-департамент', location: 'Зона отдыха "Чарвак"', status: 'draft', registrationOpen: true, participants: 12, participantLimit: 50, parentId: 'f3', lang: 'UZB', registrationType: 'open', createdAt: '2026-05-22T08:00:00.000Z', scale: 'Локальное' },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('ru-RU');
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateTimeStr?: string) => {
  if (!dateTimeStr) return '—';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return dateTimeStr;
  }
};

function MarqueeText({ text, className }: { text: string, className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isHovered && containerRef.current && textRef.current) {
      textRef.current.style.width = 'max-content';
      const diff = textRef.current.offsetWidth - containerRef.current.clientWidth;
      textRef.current.style.width = '';
      if (diff > 0) {
        setOffset(diff + 2);
      }
    } else {
      setOffset(0);
    }
  }, [isHovered, text]);

  const active = isHovered || isAnimating;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => { setIsHovered(true); setIsAnimating(true); }}
      onMouseLeave={() => { 
        setIsHovered(false);
        if (offset === 0) setIsAnimating(false);
      }}
      title={text}
    >
      <div 
        ref={textRef}
        onTransitionEnd={() => { if (!isHovered) setIsAnimating(false); }}
        className={`transition-transform ease-linear origin-left ${active ? 'w-max pr-1' : 'w-full truncate'}`}
        style={{ 
          transform: `translateX(-${offset}px)`,
          transitionDuration: isHovered && offset > 0 ? `${offset / 25}s` : '0.4s',
          transitionDelay: isHovered ? '0.3s' : '0s'
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
      <span className="text-sm font-semibold pr-2">{message}</span>
    </div>
  );
}

function FolderCard({
  folder,
  isDraggingEvent,
  onClick,
  onMenuClick,
  openMenuId,
  setOpenMenuId,
  isOverlay = false,
  isDragging = false,
  isOverEvent = false,
  dragAttributes,
  dragListeners,
  style = {}
}: {
  folder: any,
  isDraggingEvent: boolean,
  onClick: () => void,
  onMenuClick: (action: 'edit' | 'move' | 'delete', folderId: string) => void,
  openMenuId?: string | null,
  setOpenMenuId?: (id: string | null) => void,
  isOverlay?: boolean,
  isDragging?: boolean,
  isOverEvent?: boolean,
  dragAttributes?: any,
  dragListeners?: any,
  style?: React.CSSProperties
}) {
  const menuOpen = openMenuId === folder.id;
  const setMenuOpen = (open: boolean) => setOpenMenuId?.(open ? folder.id : null);
  const colorObj = FOLDER_COLORS.find(c => c.id === folder.colorId) || FOLDER_COLORS[0];

  return (
    <div 
      style={style}
      className={`group/f bg-white border rounded-2xl p-4 flex items-start gap-4 transition-all relative w-full h-full ${
        isOverEvent 
          ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-2 ring-[var(--color-admin-primary-200)] scale-[1.02]' 
          : isDragging ? 'opacity-40 scale-[0.98] shadow-inner bg-neutral-50' : 'border-neutral-200 hover:border-[var(--color-admin-primary-500)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover/f:scale-105 ${colorObj.icon} ${colorObj.bg}`}>
        <Folder className={`w-6 h-6 fill-current transition-opacity ${isOverEvent ? 'opacity-80 scale-110' : 'opacity-25'}`} />
      </div>
      
      <div className="flex-1 min-w-0 py-1 cursor-pointer" onClick={(!isDraggingEvent && !menuOpen && !isOverlay) ? onClick : undefined}>
        <MarqueeText text={folder.title} className="font-semibold text-neutral-900 transition-colors" />
        <p className="text-xs text-neutral-500 mt-1">{folder.coursesCount} мероприятий</p>
      </div>

      <div className="relative">
        {menuOpen && (
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
        )}
        <button 
          {...dragAttributes} {...dragListeners}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={`cursor-grab active:cursor-grabbing p-1.5 rounded-lg transition-all z-[100] relative ${menuOpen ? 'bg-neutral-100 text-neutral-900 opacity-100' : 'text-neutral-400 hover:text-neutral-900 opacity-0 group-hover/f:opacity-100 hover:bg-neutral-100'}`}
        >
          <MoreVertical className="w-5 h-5 pointer-events-none" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick('edit', folder.id); }}
            >
              <Edit3 className="w-4 h-4 text-neutral-400" />
              Редактировать
            </button>
            <button 
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick('move', folder.id); }}
            >
              <Move className="w-4 h-4 text-neutral-400" />
              Переместить
            </button>
            <div className="h-px bg-neutral-100 my-1.5 mx-2" />
            <button 
              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick('delete', folder.id); }}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableFolder({ folder, isDraggingEvent, onClick, onMenuClick, openMenuId, setOpenMenuId }: { folder: any, isDraggingEvent: boolean, onClick: () => void, onMenuClick: (action: 'edit' | 'move' | 'delete', folderId: string) => void, openMenuId?: string | null, setOpenMenuId?: (id: string | null) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
    id: folder.id,
    data: { type: 'folder', folderId: folder.id }
  });

  const style = { transform: CSS.Translate.toString(transform), transition };
  const isOverEvent = over?.id === folder.id && isDraggingEvent;
  const menuOpen = openMenuId === folder.id;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative ${isDragging ? 'z-50' : menuOpen ? 'z-30' : 'hover:z-10 z-0'}`}
    >
      <FolderCard 
        folder={folder}
        isDraggingEvent={isDraggingEvent}
        onClick={onClick}
        onMenuClick={onMenuClick}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        isDragging={isDragging}
        isOverEvent={isOverEvent}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function EventRow({ 
  event, 
  index = 0, 
  onMenuClick, 
  openMenuId, 
  setOpenMenuId, 
  isOverlay = false, 
  isDragging = false,
  dragAttributes = {},
  dragListeners = {},
  style = {}
}: { 
  event: EventItem, 
  index?: number, 
  onMenuClick?: (action: 'edit' | 'move' | 'duplicate' | 'delete', eventId: string) => void, 
  openMenuId?: string | null, 
  setOpenMenuId?: (id: string | null) => void,
  isOverlay?: boolean,
  isDragging?: boolean,
  dragAttributes?: any,
  dragListeners?: any,
  style?: React.CSSProperties
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [flipUp, setFlipUp] = useState(false);

  const menuOpen = openMenuId === event.id;
  const setMenuOpen = (open: boolean) => setOpenMenuId?.(open ? event.id : null);

  useEffect(() => {
    if (menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < 200);
    }
  }, [menuOpen]);

  const router = typeof window !== 'undefined' ? useRouter() : null;
  const finalStyle = { 
    ...style,
    gridTemplateColumns: '1.8fr 70px 120px 95px 115px 90px 125px 40px'
  };

  // Status Styles
  const statusConfig = {
    draft: { text: 'Черновик', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    registration: { text: 'Регистрация', style: 'bg-blue-50 text-blue-700 border-blue-150' },
    in_progress: { text: 'В процессе', style: 'bg-emerald-50 text-emerald-700 border-emerald-150' },
    completed: { text: 'Завершено', style: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  }[event.status] || { text: event.status, style: 'bg-neutral-50 text-neutral-500 border-neutral-100' };

  // Format Styles
  const formatConfig = event.format === 'offline' 
    ? { text: 'Офлайн', icon: <MapPin className="w-3 h-3" />, style: 'text-orange-600 bg-orange-50 border-orange-100' }
    : { text: 'Онлайн', icon: <Video className="w-3 h-3" />, style: 'text-violet-600 bg-violet-50 border-violet-100' };

  return (
    <div 
      style={finalStyle}
      onClick={() => { if (!menuOpen && !isOverlay) router?.push(`/events/${event.id}`); }}
      className={`grid gap-4 px-6 py-4 items-center bg-white border-b border-neutral-100 transition-all group cursor-pointer relative ${
        isDragging ? 'opacity-30 bg-neutral-50 shadow-inner' : 'hover:bg-[var(--color-admin-primary-50)]/20'
      }`}
    >
      {/* 1. Title & Calendar Icon with Tooltip (includes number) */}
      <div className="flex items-center gap-1.5 pr-4 min-w-0 relative">
        <div className="min-w-[14px] text-neutral-400 font-semibold text-[13px] text-left shrink-0">
          {index + 1}
        </div>
        <div className="relative group/tooltip flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-lg shrink-0 bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 group-hover:text-[var(--color-admin-primary-600)] group-hover:border-[var(--color-admin-primary-100)] transition-all cursor-pointer">
            <CalendarDays className="w-4.5 h-4.5 stroke-[1.8]" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-[-16px] mb-2 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-50 flex flex-col bg-[#1A1A1A] text-white text-[11px] rounded-lg p-3 shadow-xl border border-white/10 w-64 origin-bottom-left scale-95 group-hover/tooltip:scale-100 font-medium leading-relaxed">
            <div className="mb-2 pb-1.5 border-b border-white/10">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5 font-bold">Регистрация</span>
              <div>Начало: {formatDateTime(event.registrationDates?.[0]?.dateStart ? `${event.registrationDates[0].dateStart}T${event.registrationDates[0].timeStart}` : undefined)}</div>
              <div>Конец: {formatDateTime(event.registrationDates?.[0]?.dateEnd ? `${event.registrationDates[0].dateEnd}T${event.registrationDates[0].timeEnd}` : undefined)}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5 font-bold">Даты проведения</span>
              {event.dates && event.dates.length > 0 ? (
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {event.dates.map((d, i) => (
                    <div key={d.id}>День {i + 1}: {formatDate(d.date)} ({d.timeStart} - {d.timeEnd})</div>
                  ))}
                </div>
              ) : (
                <div>{formatDate(event.date)} ({event.timeStart} - {event.timeEnd})</div>
              )}
            </div>
            <div className="w-2 h-2 bg-[#1A1A1A] rotate-45 absolute top-full left-[32px] -translate-x-1/2 -translate-y-1/2 border-r border-b border-white/10" />
          </div>
        </div>

        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <MarqueeText text={event.title} className="font-bold text-neutral-900 text-sm leading-snug group-hover:text-[var(--color-admin-primary-600)] transition-colors" />
          <span className="text-xs text-neutral-400 font-semibold mt-0.5">{event.type}</span>
        </div>
      </div>

      {/* 2. Language */}
      <div className="text-neutral-600 font-medium text-[13px]">
        {event.lang || 'RUS'}
      </div>

      {/* 3. Status */}
      <div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${statusConfig.style}`}>
          {statusConfig.text}
        </span>
      </div>

      {/* 4. Format */}
      <div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${formatConfig.style}`}>
          {formatConfig.icon}
          {formatConfig.text}
        </span>
      </div>

      {/* 5. Registration Type */}
      <div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
          event.registrationType === 'private'
            ? 'bg-amber-50 text-amber-700 border-amber-150'
            : 'bg-emerald-50 text-emerald-700 border-emerald-150'
        }`}>
          {event.registrationType === 'private' ? 'Приватная' : 'Открытая'}
        </span>
      </div>

      {/* 6. Participants count */}
      <div className="text-neutral-900 font-semibold text-[13px]">
        {event.participantLimit ? `${event.participants}/${event.participantLimit}` : event.participants}
      </div>

      {/* 7. Creation date */}
      <div>
        {(() => {
          if (!event.createdAt) return <span className="text-neutral-450">—</span>;
          try {
            const date = new Date(event.createdAt);
            if (isNaN(date.getTime())) return <span className="text-neutral-450">—</span>;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return (
              <div className="flex flex-col text-[12px] leading-tight">
                <span className="text-neutral-900 font-medium">{`${day}.${month}.${year}`}</span>
                <span className="text-neutral-400 mt-0.5">{`${hours}:${minutes}`}</span>
              </div>
            );
          } catch {
            return <span className="text-neutral-450">—</span>;
          }
        })()}
      </div>

      {/* 8. Action Menu / Drag Handle */}
      <div className="text-right relative">
        {menuOpen && <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />}
        <button 
          ref={btnRef}
          {...dragAttributes} {...dragListeners}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={`cursor-grab active:cursor-grabbing p-1.5 transition-all z-[100] relative ${menuOpen ? 'bg-neutral-100 text-neutral-900 opacity-100 rounded-lg' : 'text-neutral-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100 rounded hover:bg-neutral-100'}`}
        >
          <MoreVertical className="w-5 h-5 pointer-events-none" />
        </button>
        {menuOpen && (
          <div className={`absolute right-0 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 text-neutral-900 text-left ${flipUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('edit', event.id); }}><Edit3 className="w-4 h-4 text-neutral-400" />Редактировать</button>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('move', event.id); }}><Move className="w-4 h-4 text-neutral-400" />Переместить</button>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('duplicate', event.id); }}><svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>Дублировать</button>
            <div className="h-px bg-neutral-100 my-1.5 mx-2" />
            <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('delete', event.id); }}><Trash2 className="w-4 h-4 text-rose-500" />Удалить</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableEventRow({ event, index = 0, onMenuClick, openMenuId, setOpenMenuId }: { event: EventItem, index?: number, onMenuClick?: (action: 'edit' | 'move' | 'duplicate' | 'delete', eventId: string) => void, openMenuId?: string | null, setOpenMenuId?: (id: string | null) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
    data: { type: 'course', course: event }
  });

  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition
  };

  const menuOpen = openMenuId === event.id;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative ${isDragging ? 'z-50' : menuOpen ? 'z-30' : 'hover:z-10 z-0'}`}
    >
      <EventRow 
        event={event}
        index={index}
        onMenuClick={onMenuClick}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        isDragging={isDragging}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

export default function EventsPage() {
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState<EventFolder[]>(INITIAL_FOLDERS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEvents = localStorage.getItem('osnova_events');
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents);
        const mapped = parsed.map((ev: any) => ({
          ...ev,
          lang: ev.lang || 'RUS',
          registrationType: ev.registrationType || 'open',
          createdAt: ev.createdAt || (ev.date ? `${ev.date}T09:00:00.000Z` : new Date().toISOString())
        }));
        setEvents(mapped);
      } else {
        const mappedInitial = INITIAL_EVENTS.map(ev => ({
          ...ev,
          format: ev.format as 'online' | 'offline',
          description: ev.description || 'Описание мероприятия.',
          dates: [{ id: 'd1', date: ev.date || '', timeStart: ev.timeStart || '', timeEnd: ev.timeEnd || '' }],
          registrationDates: [{ id: 'r1', dateStart: ev.date || '', timeStart: '08:00', dateEnd: ev.date || '', timeEnd: ev.timeStart || '' }],
          blocks: []
        }));
        setEvents(mappedInitial);
        localStorage.setItem('osnova_events', JSON.stringify(mappedInitial));
      }

      const storedFolders = localStorage.getItem('osnova_folders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      } else {
        setFolders(INITIAL_FOLDERS);
        localStorage.setItem('osnova_folders', JSON.stringify(INITIAL_FOLDERS));
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && events.length > 0) {
      localStorage.setItem('osnova_events', JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (typeof window !== 'undefined' && folders.length > 0) {
      localStorage.setItem('osnova_folders', JSON.stringify(folders));
    }
  }, [folders]);

  // Modals state
  const [folderEditor, setFolderEditor] = useState<{ mode: 'create' | 'edit', folderId?: string } | null>(null);
  const [folderEditorData, setFolderEditorData] = useState({ title: '', colorId: 'blue' });

  const [moveFolderId, setMoveFolderId] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);

  const [moveEventId, setMoveEventId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [duplicateEventId, setDuplicateEventId] = useState<string | null>(null);
  const [duplicateEventForm, setDuplicateEventForm] = useState({ title: '', eventId: '' });

  const [eventEditor, setEventEditor] = useState<{ mode: 'create' | 'edit', eventId?: string, folderId?: string | null } | null>(null);
  const [eventForm, setEventForm] = useState({ 
    title: '', description: '', type: 'Воркшоп',
    date: '', timeStart: '', timeEnd: '', format: 'offline', location: '',
    speakers: '', registrationOpen: true, participantLimit: ''
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isDescendant = React.useCallback((itemParentId: string | null, targetFolderId: string | null): boolean => {
    if (targetFolderId === null) return true;
    let current = itemParentId;
    while (current !== null) {
      if (current === targetFolderId) return true;
      const parent = folders.find(f => f.id === current);
      if (!parent) break;
      current = parent.parentId;
    }
    return false;
  }, [folders]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length >= 2;

  const visibleFolders = useMemo(() => {
    if (isSearching) {
      return folders.filter(f => f.title.toLowerCase().includes(normalizedSearch) && isDescendant(f.parentId, currentFolderId));
    }
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId, normalizedSearch, isSearching, isDescendant]);

  const visibleEvents = useMemo(() => {
    if (isSearching) {
      return events.filter(c => (c.title.toLowerCase().includes(normalizedSearch) || c.id.toLowerCase().includes(normalizedSearch)) && isDescendant(c.parentId, currentFolderId));
    }
    return events.filter(c => c.parentId === currentFolderId);
  }, [events, currentFolderId, normalizedSearch, isSearching, isDescendant]);

  const breadcrumbs = useMemo(() => {
    if (!currentFolderId && !isSearching) return undefined;
    const trail: any[] = [{ label: 'Мероприятия', onClick: () => { setCurrentFolderId(null); setSearchQuery(''); } }];
    if (isSearching) {
      trail.push({ label: `Поиск "${searchQuery.trim()}"` });
      return trail;
    }
    const hierarchy = [];
    let tempId: string | null = currentFolderId;
    while (tempId) {
      const f = folders.find(folder => folder.id === tempId);
      if (f) {
        hierarchy.unshift(f);
        tempId = f.parentId;
      } else break;
    }
    hierarchy.forEach(h => {
      trail.push({ label: h.title, onClick: () => setCurrentFolderId(h.id) });
    });
    return trail;
  }, [currentFolderId, folders, searchQuery, isSearching]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ev = events.find(c => c.id === active.id);
    if (ev) {
      setActiveItem({ type: 'course', data: ev });
    } else {
      const folder = folders.find(f => f.id === active.id);
      if (folder) setActiveItem({ type: 'folder', data: folder });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'folder' && overType === 'folder') {
      if (active.id !== over.id) {
        setFolders(items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      return;
    }

    if (activeType === 'course' && overType === 'folder') {
      const targetFolderId = over.data.current?.folderId;
      setEvents(prev => prev.map(c => c.id === active.id ? { ...c, parentId: targetFolderId } : c));
      setFolders(prev => prev.map(f => f.id === targetFolderId ? { ...f, coursesCount: f.coursesCount + 1 } : f));
      setToast({ message: "Мероприятие перенесено в папку", type: "success" });
      return;
    }

    if (activeType === 'course' && overType === 'course') {
      if (active.id !== over.id) {
        setEvents(items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const confirmMoveFolder = (targetId: string | null) => {
    if (!moveFolderId) return;
    setFolders(prev => prev.map(f => f.id === moveFolderId ? { ...f, parentId: targetId } : f));
    setMoveFolderId(null);
    setToast({ message: "Папка перемещена", type: "success" });
  };
  
  const confirmMoveEvent = (targetFolderId: string | null) => {
    if (!moveEventId) return;
    setEvents(prev => prev.map(c => c.id === moveEventId ? { ...c, parentId: targetFolderId } : c));
    setMoveEventId(null);
    setToast({ message: "Мероприятие перемещено", type: "success" });
  };

  const handleFolderMenuAction = (action: 'edit' | 'move' | 'delete', folderId: string) => {
    if (action === 'edit') {
      const f = folders.find(x => x.id === folderId);
      if (f) {
        setFolderEditorData({ title: f.title, colorId: f.colorId });
        setFolderEditor({ mode: 'edit', folderId });
      }
    } else if (action === 'move') {
      setMoveFolderId(folderId);
    } else if (action === 'delete') {
      setDeleteFolderId(folderId);
    }
  };

  const handleEventMenuAction = (action: 'edit' | 'move' | 'duplicate' | 'delete', eventId: string) => {
    if (action === 'edit') {
       router?.push(`/events/create?id=${eventId}`);
    } else if (action === 'move') {
       setMoveEventId(eventId);
    } else if (action === 'delete') {
       setDeleteEventId(eventId);
    } else if (action === 'duplicate') {
       const c = events.find(cc => cc.id === eventId);
       if(c) {
          setDuplicateEventForm({ title: `${c.title} (Копия)`, eventId: c.id });
          setDuplicateEventId(eventId);
       }
    }
  };

  const saveFolder = () => {
    if (!folderEditorData.title.trim()) return;
    if (folderEditor?.mode === 'create') {
       const newFolder: EventFolder = {
         id: `f-${Date.now()}`,
         title: folderEditorData.title,
         colorId: folderEditorData.colorId,
         coursesCount: 0,
         parentId: currentFolderId
       };
       setFolders([...folders, newFolder]);
       setToast({ message: "Папка успешно создана", type: "success" });
    } else if (folderEditor?.mode === 'edit' && folderEditor.folderId) {
       setFolders(prev => prev.map(f => f.id === folderEditor.folderId ? { ...f, title: folderEditorData.title, colorId: folderEditorData.colorId } : f));
       setToast({ message: "Папка сохранена", type: "success" });
    }
    setFolderEditor(null);
  };


  const confirmDeleteFolder = () => {
    if (!deleteFolderId) return;
    
    const deletedIds = new Set<string>([deleteFolderId]);
    let added = true;
    while (added) {
      added = false;
      folders.forEach(f => {
        if (f.parentId && deletedIds.has(f.parentId) && !deletedIds.has(f.id)) {
          deletedIds.add(f.id);
          added = true;
        }
      });
    }

    setFolders(prev => prev.filter(f => !deletedIds.has(f.id)));
    setEvents(prev => prev.filter(c => !c.parentId || !deletedIds.has(c.parentId)));
    setDeleteFolderId(null);
    setToast({ message: "Папка и всё её содержимое удалены", type: "success" });
  };

  const handleLimitChange = (val: string) => {
    if (val === '') {
      setEventForm(prev => ({ ...prev, participantLimit: '' }));
    } else {
      const parsed = parseInt(val);
      if (!isNaN(parsed)) {
        setEventForm(prev => ({ ...prev, participantLimit: Math.max(1, parsed).toString() }));
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F9FAFB] dark:bg-[var(--bg-app)] overflow-x-hidden relative">
      <PageHeader 
        title={!breadcrumbs ? "Мероприятия" : undefined}
        breadcrumbs={breadcrumbs}
        onBack={currentFolderId ? () => {
          const folder = folders.find(f => f.id === currentFolderId);
          if (folder) setCurrentFolderId(folder.parentId);
        } : undefined}
        actions={
          <>
            <Button 
               variant="outline" 
               onClick={() => { setFolderEditorData({ title: '', colorId: 'blue' }); setFolderEditor({ mode: 'create' }); }}
               className="gap-2 bg-white shadow-sm hover:bg-neutral-50 border-neutral-200 h-9 font-semibold text-neutral-700"
            >
              <Folder className="w-4 h-4 text-neutral-400" />
              Создать папку
            </Button>
            <Button 
              variant="primary" 
              onClick={() => router?.push(currentFolderId ? `/events/create?folderId=${currentFolderId}` : '/events/create')}
              className="gap-2 shadow-md h-9 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Создать мероприятие
            </Button>
          </>
        }
      />
      
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 pb-32">
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск" 
              className="w-full h-9 pl-10 pr-4 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-white shadow-sm border-neutral-200 font-semibold text-neutral-700">
              <Filter className="w-4 h-4 text-neutral-400" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Content */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
          
          {isSearching && visibleFolders.length === 0 && visibleEvents.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500 animate-in fade-in duration-500">
               <Search className="w-12 h-12 text-neutral-300 mb-4" />
               <p className="text-lg">По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            <>
              {/* Folders Section - EXACT same grid as Courses page */}
              {visibleFolders.length > 0 && (
                <div className="mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Папки</h2>
                  <SortableContext items={visibleFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {visibleFolders.map((folder) => (
                        <SortableFolder 
                          key={folder.id} 
                          folder={folder} 
                          isDraggingEvent={activeItem?.type === 'course'} 
                          onMenuClick={handleFolderMenuAction}
                          onClick={() => { setCurrentFolderId(folder.id); setSearchQuery(''); }}
                          openMenuId={openFolderMenuId}
                          setOpenMenuId={setOpenFolderMenuId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              {/* Events Section - EXCLUSIVELY list view */}
              {(visibleEvents.length > 0 || !isSearching) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">{isSearching ? 'Результаты поиска' : 'Мероприятия'}</h2>
                  
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col">
                    
                    {/* Header of Table */}
                    <div 
                      className="grid gap-4 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 rounded-t-2xl text-[11px] font-bold text-neutral-400 uppercase tracking-wider items-center text-left"
                      style={{ gridTemplateColumns: '1.8fr 70px 120px 95px 115px 90px 125px 40px' }}
                    >
                      <div>Мероприятие</div>
                      <div>Язык</div>
                      <div>Статус</div>
                      <div>Формат</div>
                      <div>Регистрация</div>
                      <div>Участники</div>
                      <div>Дата создания</div>
                      <div></div>
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col divide-y divide-neutral-100 relative min-h-[100px]">
                      {visibleEvents.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-neutral-400">
                          <CalendarDays className="w-12 h-12 text-neutral-200 mb-3" />
                          <p className="text-base font-semibold">Здесь пока нет мероприятий</p>
                        </div>
                      ) : (
                        <SortableContext items={visibleEvents.map(c => c.id)} strategy={verticalListSortingStrategy}>
                          {visibleEvents.map((ev, idx) => (
                            <SortableEventRow 
                              key={ev.id} 
                              event={ev} 
                              index={idx}
                              onMenuClick={handleEventMenuAction} 
                              openMenuId={openMenuId} 
                              setOpenMenuId={setOpenMenuId} 
                            />
                          ))}
                        </SortableContext>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={null}>
            {activeItem?.type === 'course' ? (
               <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto pointer-events-none">
                 <div className="opacity-80 rotate-2 bg-white shadow-2xl scale-[1.01] rounded-xl origin-right border border-neutral-200">
                   <EventRow event={activeItem.data} index={0} isOverlay={true} />
                 </div>
               </div>
            ) : activeItem?.type === 'folder' ? (
               <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto pointer-events-none">
                 <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                   <div className="opacity-85 rotate-2 bg-white shadow-2xl scale-[1.01] rounded-xl origin-right border border-neutral-200">
                     <FolderCard folder={activeItem.data} isDraggingEvent={false} onClick={()=>{}} onMenuClick={()=>{}} isOverlay={true} />
                   </div>
                 </div>
               </div>
            ) : null}
          </DragOverlay>

        </DndContext>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Folder Creator Modal */}
      {folderEditor && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setFolderEditor(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-neutral-900 mb-6">{folderEditor.mode === 'create' ? 'Создание папки' : 'Редактировать папку'}</h2>
             <div className="flex flex-col gap-5">
               <div>
                 <label className="block text-sm font-semibold text-neutral-700 mb-2">Название папки</label>
                 <input 
                    type="text" autoFocus
                    className="w-full h-11 px-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] outline-none font-semibold" 
                    value={folderEditorData.title} 
                    onChange={e => setFolderEditorData(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Например, Корпоративные"
                  />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-neutral-700 mb-2">Цветовое оформление</label>
                 <div className="grid grid-cols-7 gap-2 w-full">
                    {FOLDER_COLORS.map(c => (
                       <button 
                          key={c.id} 
                          onClick={() => setFolderEditorData(prev => ({ ...prev, colorId: c.id }))}
                          className={`w-full h-12 rounded-xl flex items-center justify-center transition-all ${
                            folderEditorData.colorId === c.id 
                              ? `ring-[3px] ring-neutral-400 ring-offset-1 shadow-sm opacity-100 z-10 ${c.icon} ${c.bg}` 
                              : `border border-transparent opacity-60 hover:opacity-100 ${c.icon} ${c.bg}`
                          }`}
                        >
                          <Folder className="w-6 h-6 fill-current" />
                       </button>
                    ))}
                 </div>
               </div>
               <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-100">
                  <Button variant="outline" className="font-semibold text-neutral-600 border-neutral-200" onClick={() => setFolderEditor(null)}>Отмена</Button>
                  <Button variant="primary" className="font-semibold" disabled={!folderEditorData.title.trim()} onClick={saveFolder}>Сохранить</Button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Move Folder Modal */}
      {moveFolderId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setMoveFolderId(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-neutral-900 mb-2">Переместить папку</h2>
             <p className="text-sm text-neutral-500 mb-6">Выберите новое расположение для "{folders.find(f => f.id === moveFolderId)?.title}"</p>
             <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 p-1">
                <button 
                   onClick={() => confirmMoveFolder(null)}
                   className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:border-[var(--color-admin-primary-500)] hover:bg-[var(--color-admin-primary-50)] transition-all font-semibold text-neutral-900 flex items-center gap-3"
                 >
                   <div className="w-8 h-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center"><Folder className="w-4 h-4 text-neutral-500" /></div>
                   Начальный экран
                </button>
                {(() => {
                   const getChildren = (parentId: string | null, depth: number): any[] => {
                     let result: any[] = [];
                     const children = folders.filter(f => f.parentId === parentId);
                     for (const child of children) {
                        if (child.id === moveFolderId) continue;
                        result.push({ ...child, depth });
                        result = result.concat(getChildren(child.id, depth + 1));
                     }
                     return result;
                   };
                   return getChildren(null, 0).map(f => (
                     <button 
                       key={f.id} onClick={() => confirmMoveFolder(f.id)}
                       className="w-full text-left px-4 py-2.5 rounded-xl border border-transparent hover:border-[var(--color-admin-primary-500)] hover:bg-[var(--color-admin-primary-50)] transition-all font-semibold text-neutral-900 flex items-center gap-3 overflow-hidden"
                     >
                       {f.depth > 0 && <div style={{ width: (f.depth - 1) * 24 }} className="shrink-0" />}
                       {f.depth > 0 && <div className="w-4 h-4 border-l-2 border-b-2 border-neutral-300 rounded-bl-[6px] shrink-0 -mt-2.5" />}
                       <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${FOLDER_COLORS.find(c => c.id === f.colorId)?.bg} ${FOLDER_COLORS.find(c => c.id === f.colorId)?.icon}`}><Folder className="w-4 h-4 fill-current opacity-80" /></div>
                       <span className="truncate">{f.title}</span>
                     </button>
                   ));
                })()}
             </div>
             <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <Button variant="outline" className="font-semibold text-neutral-600 border-neutral-200" onClick={() => setMoveFolderId(null)}>Отмена</Button>
             </div>
          </div>
        </div>
      )}

      {/* Move Event Modal */}
      {moveEventId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setMoveEventId(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-neutral-900 mb-2">Переместить мероприятие</h2>
             <p className="text-sm text-neutral-500 mb-6">Выберите новое расположение для "{events.find(c => c.id === moveEventId)?.title}"</p>
             <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 p-1">
                <button 
                   onClick={() => confirmMoveEvent(null)}
                   className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:border-[var(--color-admin-primary-500)] hover:bg-[var(--color-admin-primary-50)] transition-all font-semibold text-neutral-900 flex items-center gap-3"
                 >
                   <div className="w-8 h-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center"><Folder className="w-4 h-4 text-neutral-500" /></div>
                   Начальный экран
                </button>
                {(() => {
                   const getChildren = (parentId: string | null, depth: number): any[] => {
                     let result: any[] = [];
                     const children = folders.filter(f => f.parentId === parentId);
                     for (const child of children) {
                        result.push({ ...child, depth });
                        result = result.concat(getChildren(child.id, depth + 1));
                     }
                     return result;
                   };
                   return getChildren(null, 0).map(f => (
                     <button 
                       key={f.id} onClick={() => confirmMoveEvent(f.id)}
                       className="w-full text-left px-4 py-2.5 rounded-xl border border-transparent hover:border-[var(--color-admin-primary-500)] hover:bg-[var(--color-admin-primary-50)] transition-all font-semibold text-neutral-900 flex items-center gap-3 overflow-hidden"
                     >
                       {f.depth > 0 && <div style={{ width: (f.depth - 1) * 24 }} className="shrink-0" />}
                       {f.depth > 0 && <div className="w-4 h-4 border-l-2 border-b-2 border-neutral-300 rounded-bl-[6px] shrink-0 -mt-2.5" />}
                       <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${FOLDER_COLORS.find(c => c.id === f.colorId)?.bg} ${FOLDER_COLORS.find(c => c.id === f.colorId)?.icon}`}><Folder className="w-4 h-4 fill-current opacity-80" /></div>
                       <span className="truncate">{f.title}</span>
                     </button>
                   ));
                })()}
             </div>
             <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <Button variant="outline" className="font-semibold text-neutral-600 border-neutral-200" onClick={() => setMoveEventId(null)}>Отмена</Button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      {deleteEventId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setDeleteEventId(null)} />
           <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                 <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-[22px] font-bold text-neutral-900 mb-3 tracking-tight">Удалить мероприятие?</h2>
              <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">Вы действительно хотите безвозвратно удалить мероприятие <strong className="text-neutral-900 font-semibold">"{events.find(c => c.id === deleteEventId)?.title}"</strong>?</p>
              <div className="flex gap-3 w-full">
                 <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-700" onClick={() => setDeleteEventId(null)}>Отмена</Button>
                 <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent" onClick={() => {
                     setEvents(prev => prev.filter(c => c.id !== deleteEventId));
                     setDeleteEventId(null);
                     setToast({ message: "Мероприятие удалено", type: "success" });
                 }}>Удалить</Button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {deleteFolderId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setDeleteFolderId(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200 text-center">
             <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
               <Trash2 className="w-6 h-6 text-rose-600" />
             </div>
             <h2 className="text-xl font-bold text-neutral-900 mb-2">Удалить папку?</h2>
             <p className="text-sm text-neutral-500 mb-6">
               Вы действительно хотите удалить папку "{folders.find(f => f.id === deleteFolderId)?.title}"? <br/>
               <span className="font-semibold text-rose-600 mt-2 block">Все вложенные мероприятия и папки будут удалены без возможности восстановления.</span>
             </p>
             <div className="flex gap-3">
                <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-600" onClick={() => setDeleteFolderId(null)}>Отмена</Button>
                <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm" onClick={confirmDeleteFolder}>Удалить</Button>
             </div>
          </div>
        </div>
      )}

      {/* Duplicate Event Modal */}
      {duplicateEventId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setDuplicateEventId(null)} />
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Дублирование мероприятия</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[14px] font-semibold text-neutral-800 mb-2">Новое название</label>
                  <input 
                     type="text" autoFocus
                     className="w-full h-11 px-4 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] outline-none transition-all shadow-sm text-sm" 
                     value={duplicateEventForm.title} 
                     onChange={e => setDuplicateEventForm(prev => ({ ...prev, title: e.target.value }))} 
                     placeholder="Введите название"
                   />
                </div>
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-neutral-100">
                   <Button variant="outline" className="font-semibold text-neutral-600 border-neutral-200" onClick={() => setDuplicateEventId(null)}>Отмена</Button>
                   <Button variant="primary" className="font-semibold" disabled={!duplicateEventForm.title.trim()} onClick={() => {
                        const originalInfo = events.find(c => c.id === duplicateEventId);
                        if(originalInfo) {
                           setEvents(prev => [{ ...originalInfo, id: `EVT-${Math.floor(Math.random() * 10000)}`, title: duplicateEventForm.title, status: 'draft', participants: 0 }, ...prev]);
                           setToast({ message: "Мероприятие продублировано в черновик", type: "success" });
                        }
                        setDuplicateEventId(null);
                   }}>Дублировать</Button>
                </div>
              </div>
           </div>
        </div>
      )}


    </div>
  );
}
