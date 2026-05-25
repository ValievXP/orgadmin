"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Plus, Users, BookOpen, MoreVertical, LayoutGrid, List, Folder, Globe, Layers, Edit3, Move, Trash2, Check, Unlock, Lock, CalendarDays, Clock, FileText } from 'lucide-react';
import { DndContext, DragOverlay, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FOLDER_COLORS = [
  { id: 'red', icon: 'text-red-600', bg: 'bg-red-100' },
  { id: 'orange', icon: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'yellow', icon: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'emerald', icon: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'slate', icon: 'text-slate-600', bg: 'bg-slate-200' },
  { id: 'blue', icon: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'purple', icon: 'text-purple-600', bg: 'bg-purple-100' },
];

const INITIAL_FOLDERS = [
  { id: 'f1', title: 'HR Опросы', coursesCount: 4, parentId: null, colorId: 'blue' },
  { id: 'f2', title: 'Фидбек от клиентов', coursesCount: 12, parentId: null, colorId: 'purple' },
  { id: 'f3', title: 'Секретные опросы', coursesCount: 2, parentId: 'f1', colorId: 'yellow' },
];

const INITIAL_SURVEYS = [
  { 
    id: 'SRV-821', title: 'Опрос удовлетворенности сотрудников', lang: 'RUS', status: 'Active', type: 'Открытый',
    users: 142, parentId: null
  },
  { 
    id: 'SRV-724', title: 'Регистрация на вебинар', lang: 'UZB', status: 'Draft', type: 'Открытый',
    users: 0, parentId: null
  },
  { 
    id: 'SRV-612', title: 'Оценка качества обучения', lang: 'RUS', status: 'Active', type: 'По расписанию',
    users: 89, parentId: null
  },
  { 
    id: 'SRV-509', title: 'Сбор заявок на парковку', lang: 'RUS', status: 'Closed', type: 'Ограниченное время',
    users: 512, parentId: null
  },
  { 
    id: 'SRV-990', title: 'Анкета предзаписи на новый курс', lang: 'RUS', status: 'Active', type: 'Открытый',
    users: 1240, parentId: 'f1'
  },
];

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

function SortableFolder({ folder, isDraggingCourse, onClick, onMenuClick, openMenuId, setOpenMenuId }: { folder: any, isDraggingCourse: boolean, onClick: () => void, onMenuClick: (action: 'edit' | 'move' | 'delete', folderId: string) => void, openMenuId?: string | null, setOpenMenuId?: (id: string | null) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
    id: folder.id,
    data: { type: 'folder', folderId: folder.id }
  });

  const menuOpen = openMenuId === folder.id;
  const setMenuOpen = (open: boolean) => setOpenMenuId?.(open ? folder.id : null);
  const colorObj = FOLDER_COLORS.find(c => c.id === folder.colorId) || FOLDER_COLORS[0];
  const style = { transform: CSS.Translate.toString(transform), transition };
  const isOverCourse = over?.id === folder.id && isDraggingCourse;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group/f bg-white border rounded-2xl p-4 flex items-start gap-4 transition-all relative ${
        isOverCourse 
          ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-2 ring-[var(--color-admin-primary-200)] scale-[1.02] z-10' 
          : isDragging ? 'opacity-50 shadow-md bg-neutral-50 z-50' : 'border-neutral-200 hover:border-[var(--color-admin-primary-500)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div 
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover/f:scale-105 ${colorObj.icon} ${colorObj.bg}`}
      >
        <Folder className={`w-6 h-6 fill-current transition-opacity ${isOverCourse ? 'opacity-80 scale-110' : 'opacity-20'}`} />
      </div>
      
      <div className="flex-1 min-w-0 py-1 cursor-pointer" onClick={(!isDraggingCourse && !menuOpen) ? onClick : undefined}>
        <MarqueeText text={folder.title} className="font-semibold text-neutral-900 transition-colors" />
        <p className="text-xs text-neutral-500 mt-1">{folder.coursesCount} опросов</p>
      </div>

      <div className="relative">
        {menuOpen && (
          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
        )}
        <button 
          {...attributes} {...listeners}
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

const getAssignedStudentsCount = (surveyId: string, directUsers: number) => {
  const coursesList = [
    { id: 'COR-821', studentCount: 142, surveyIds: ['SRV-821'] },
    { id: 'COR-612', studentCount: 89, surveyIds: ['SRV-612'] },
  ];
  let count = directUsers;
  coursesList.forEach(c => {
    if (c.surveyIds.includes(surveyId)) {
      count += c.studentCount;
    }
  });
  return count;
};

const getAnswersCount = (surveyId: string) => {
  const answersMap: Record<string, number> = {
    'SRV-821': 118,
    'SRV-724': 0,
    'SRV-612': 54,
    'SRV-509': 342,
    'SRV-990': 850
  };
  return answersMap[surveyId] !== undefined ? answersMap[surveyId] : 0;
};

function SortableCourseCard({ course, index = 0, viewMode, onMenuClick, openMenuId, setOpenMenuId }: { course: any, index?: number, viewMode: 'grid' | 'list', onMenuClick?: (action: 'edit' | 'move' | 'duplicate' | 'delete', courseId: string) => void, openMenuId?: string | null, setOpenMenuId?: (id: string | null) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
    data: { type: 'course', course }
  });

  const [localMenuOpen, setLocalMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [flipUp, setFlipUp] = React.useState(false);

  // Use lifted state for list view, local state for grid view
  const menuOpen = viewMode === 'list' ? (openMenuId === course.id) : localMenuOpen;
  const setMenuOpen = (open: boolean) => {
    if (viewMode === 'list' && setOpenMenuId) {
      setOpenMenuId(open ? course.id : null);
    } else {
      setLocalMenuOpen(open);
    }
  };

  // Auto-detect if menu should flip upward
  React.useEffect(() => {
    if (menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = 200; // approximate dropdown height
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < menuHeight);
    }
  }, [menuOpen]);

  const router = typeof window !== 'undefined' ? useRouter() : null;

  const style = { transform: CSS.Translate.toString(transform), transition };

  const menuDropdown = (
    <div className={`absolute right-0 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 text-neutral-900 text-left ${flipUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
      <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router?.push('/surveys/create?id=' + course.id); }}><Edit3 className="w-4 h-4 text-neutral-400" />Редактировать</button>
      <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('move', course.id); }}><Move className="w-4 h-4 text-neutral-400" />Переместить</button>
      <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('duplicate', course.id); }}><svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>Дублировать</button>
      <div className="h-px bg-neutral-100 my-1.5 mx-2" />
      <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuClick?.('delete', course.id); }}><Trash2 className="w-4 h-4 text-rose-500" />Удалить</button>
    </div>
  );

  const totalStudents = getAssignedStudentsCount(course.id, course.users);
  const answersCount = getAnswersCount(course.id);

  if (viewMode === 'list') {
    return (
      <div 
        ref={setNodeRef} style={style}
        onClick={(e) => { if (!menuOpen) router?.push(`/surveys/${course.id}`); }}
        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center bg-white transition-all group cursor-pointer ${
          isDragging ? 'opacity-30 bg-neutral-50 shadow-inner' : 'hover:bg-[var(--color-admin-primary-50)]/30'
        }`}
      >
        <div className="col-span-4 flex items-center gap-3 pr-4 min-w-0">
          <div className="w-5 text-neutral-400 font-semibold text-[13px] text-center shrink-0">{index + 1}</div>
          <div className="relative group/tooltip flex items-center justify-center shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                course.type === 'Открытый' ? 'bg-emerald-50 text-emerald-600' :
                course.type === 'По расписанию' ? 'bg-blue-50 text-blue-600' :
                'bg-orange-50 text-orange-600'
              }`}>
               {course.type === 'Открытый' ? <Unlock className="w-4 h-4" /> :
                course.type === 'По расписанию' ? <CalendarDays className="w-4 h-4" /> :
                <Clock className="w-4 h-4" />}
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-50 flex flex-col items-center origin-bottom scale-95 group-hover/tooltip:scale-100">
              <div className="bg-[#1A1A1A] text-white text-[11px] leading-tight rounded-lg py-2 px-3 whitespace-nowrap shadow-xl border border-white/10">
                <div className="font-bold mb-1">{course.type}</div>
                {course.type === 'По расписанию' && <div className="text-neutral-400">Откроется: 25 апр 2026, 09:00</div>}
                {course.type === 'Ограниченное время' && <div className="text-neutral-400">Доступен до: 30 апр 2026</div>}
                {course.type === 'Открытый' && <div className="text-neutral-400">Доступен всем без ограничений</div>}
              </div>
              <div className="w-2 h-2 bg-[#1A1A1A] rotate-45 -mt-1 border-b border-r border-white/10" />
            </div>
          </div>
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <MarqueeText text={course.title} className="font-bold text-neutral-900 hover:text-[var(--color-admin-primary-600)] transition-colors max-w-full" />
          </div>
        </div>
        <div className="col-span-1 text-neutral-600 font-medium text-[13px]">{course.lang}</div>
        <div className="col-span-2 flex flex-wrap gap-2 items-center">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
            ${course.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
              course.status === 'Draft' ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {course.status === 'Active' ? 'Активен' : course.status === 'Draft' ? 'Черновик' : 'Завершен'}
          </span>
        </div>
        <div className="col-span-1 text-right text-neutral-900 font-semibold text-[13px]">{totalStudents}</div>
        <div className="col-span-1 text-right text-neutral-900 font-semibold text-[13px]">{answersCount}</div>
        <div className="col-span-2 text-right pr-6 flex justify-end flex-col text-[12px]"><span className="text-neutral-900 font-medium leading-none mb-1">12.05.2026</span><span className="text-neutral-400 leading-none">14:30</span></div>
        <div className="col-span-1 text-right relative" ref={menuRef}>
          {menuOpen && (
             <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
          )}
          <button 
            ref={btnRef}
            {...attributes} {...listeners}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className={`cursor-grab active:cursor-grabbing p-1.5 transition-all z-[100] relative ${menuOpen ? 'bg-neutral-100 text-neutral-900 opacity-100 rounded-lg' : 'text-neutral-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100 rounded hover:bg-neutral-100'}`}
          >
            <MoreVertical className="w-5 h-5 pointer-events-none" />
          </button>
          {menuOpen && menuDropdown}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} style={style}
      onClick={(e) => { if (!menuOpen) router?.push(`/surveys/${course.id}`); }}
      className={`group bg-white border border-neutral-200 rounded-2xl flex flex-col transition-all duration-200 relative cursor-pointer ${menuOpen ? 'z-50 ring-2 ring-[var(--color-admin-primary-500)] border-[var(--color-admin-primary-500)]' : 'z-10'} ${
        isDragging ? 'opacity-30 scale-[0.98] shadow-inner bg-neutral-100' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-neutral-300'
      }`}
    >
      <div className={`h-32 w-full relative p-4 flex flex-col justify-between rounded-t-[15px] ${course.cover}`}>
        <div className="relative flex justify-end items-start w-full">
          <div className="relative">
            {menuOpen && (
              <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
            )}
            <button 
               ref={btnRef}
               {...attributes} {...listeners}
               onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
               className={`cursor-grab active:cursor-grabbing p-1.5 transition-all -mr-2 -mt-2 shrink-0 relative z-[100] ${menuOpen ? 'bg-white/90 text-neutral-900 opacity-100 rounded-lg' : 'opacity-0 group-hover:opacity-100 hover:bg-white/20 text-white drop-shadow-md rounded-lg'}`}
            >
              <MoreVertical className="w-5 h-5 pointer-events-none" />
            </button>
            {menuOpen && menuDropdown}
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${course.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : course.status === 'Draft' ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {course.status === 'Active' ? 'Активен' : course.status === 'Draft' ? 'Черновик' : 'Завершен'}
          </span>
        </div>
        <MarqueeText text={course.title} className="text-lg font-bold text-neutral-900 leading-snug mb-5" />
        <div className="mt-auto grid grid-cols-3 gap-2 pt-5 border-t border-neutral-100">
          <div className="flex flex-col gap-1.5"><div className="flex items-center text-neutral-400 text-[10px] uppercase font-semibold"><Globe className="w-3 h-3 mr-1" /> Язык</div><span className="text-neutral-900 font-semibold text-sm">{course.lang}</span></div>
          <div className="flex flex-col gap-1.5"><div className="flex items-center text-neutral-400 text-[10px] uppercase font-semibold"><Users className="w-3 h-3 mr-1" /> Студенты</div><span className="text-neutral-900 font-semibold text-sm">{totalStudents}</span></div>
          <div className="flex flex-col gap-1.5"><div className="flex items-center text-neutral-400 text-[10px] uppercase font-semibold"><FileText className="w-3 h-3 mr-1" /> Ответов</div><span className="text-neutral-900 font-semibold text-sm">{answersCount}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [courses, setCourses] = useState(INITIAL_SURVEYS);
  const [activeItem, setActiveItem] = useState<any>(null);

  // Modals state
  const [folderEditor, setFolderEditor] = useState<{ mode: 'create' | 'edit', folderId?: string } | null>(null);
  const [folderEditorData, setFolderEditorData] = useState({ title: '', colorId: 'blue' });

  const [moveFolderId, setMoveFolderId] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);

  const [moveCourseId, setMoveCourseId] = useState<string | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [duplicateCourseId, setDuplicateCourseId] = useState<string | null>(null);
  const [duplicateCourseForm, setDuplicateCourseForm] = useState({ title: '', courseId: '' });

  const [courseEditor, setCourseEditor] = useState<{ mode: 'create' | 'edit', courseId?: string, folderId?: string | null } | null>(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', courseId: '', lang: 'RUS', access: 'paid', price: '', hasDiscount: false, discountPrice: '' });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
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

  const visibleCourses = useMemo(() => {
    if (isSearching) {
      return courses.filter(c => (c.title.toLowerCase().includes(normalizedSearch) || c.id.toLowerCase().includes(normalizedSearch)) && isDescendant(c.parentId, currentFolderId));
    }
    return courses.filter(c => c.parentId === currentFolderId);
  }, [courses, currentFolderId, normalizedSearch, isSearching, isDescendant]);

  const breadcrumbs = useMemo(() => {
    if (!currentFolderId && !isSearching) return undefined;
    const trail: any[] = [{ label: 'Опросы', onClick: () => { setCurrentFolderId(null); setSearchQuery(''); } }];
    if (isSearching) {
      trail.push({ label: `Поиск "${searchQuery.trim()}"`, onClick: () => {} });
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
    const course = courses.find(c => c.id === active.id);
    if (course) {
      setActiveItem({ type: 'course', data: course });
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
      setCourses(prev => prev.map(c => c.id === active.id ? { ...c, parentId: targetFolderId } : c));
      setFolders(prev => prev.map(f => f.id === targetFolderId ? { ...f, coursesCount: f.coursesCount + 1 } : f));
      return;
    }

    if (activeType === 'course' && overType === 'course') {
      if (active.id !== over.id) {
        setCourses(items => {
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
  };
  
  const confirmMoveCourse = (targetFolderId: string | null) => {
    if (!moveCourseId) return;
    setCourses(prev => prev.map(c => c.id === moveCourseId ? { ...c, parentId: targetFolderId } : c));
    setMoveCourseId(null);
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

  const handleCourseMenuAction = (action: 'edit' | 'move' | 'duplicate' | 'delete', courseId: string) => {
    if (action === 'edit') {
       const c = courses.find(cc => cc.id === courseId);
       if(c) {
          setCourseForm({ title: c.title, description: '', courseId: c.id, lang: c.lang || 'RUS', access: c.status === 'Draft' ? 'free' : 'paid', price: '', hasDiscount: false, discountPrice: '' }); 
          setCourseEditor({ mode: 'edit', courseId });
       }
    } else if (action === 'move') {
       setMoveCourseId(courseId);
    } else if (action === 'delete') {
       setDeleteCourseId(courseId);
    } else if (action === 'duplicate') {
       const c = courses.find(cc => cc.id === courseId);
       if(c) {
          setDuplicateCourseForm({ title: `${c.title} (Копия)`, courseId: c.id });
          setDuplicateCourseId(courseId);
       }
    }
  };

  const saveFolder = () => {
    if (!folderEditorData.title.trim()) return;
    if (folderEditor?.mode === 'create') {
       const newFolder = {
         id: `f-${Date.now()}`,
         title: folderEditorData.title,
         colorId: folderEditorData.colorId,
         coursesCount: 0,
         parentId: currentFolderId
       };
       setFolders([...folders, newFolder]);
    } else if (folderEditor?.mode === 'edit' && folderEditor.folderId) {
       setFolders(prev => prev.map(f => f.id === folderEditor.folderId ? { ...f, title: folderEditorData.title, colorId: folderEditorData.colorId } : f));
    }
    setFolderEditor(null);
  };

  const saveCourse = () => {
    if (!courseForm.title.trim()) return;
    
    if (courseEditor?.mode === 'create') {
      const newCourse = {
        id: `SRV-${Math.floor(Math.random() * 10000)}`,
        title: courseForm.title,
        lang: courseForm.lang,
        status: 'Draft',
        type: 'Открытый',
        users: 0,
        parentId: courseEditor.folderId || null
      };
      setCourses([newCourse, ...courses]);
      
      if (courseEditor.folderId) {
         setFolders(prev => prev.map(f => f.id === courseEditor.folderId ? { ...f, coursesCount: f.coursesCount + 1 } : f));
      }
    }
    setCourseEditor(null);
  };

  const confirmDeleteFolder = () => {
    if (!deleteFolderId) return;
    
    // Find all descendant folders
    const deletedIds = new Set<string>([deleteFolderId]);
    let added = true;
    while (added) {
      added = false;
      // We can't use setFolders inside the loop, we iterate current state
      folders.forEach(f => {
        if (f.parentId && deletedIds.has(f.parentId) && !deletedIds.has(f.id)) {
          deletedIds.add(f.id);
          added = true;
        }
      });
    }

    setFolders(prev => prev.filter(f => !deletedIds.has(f.id)));
    setCourses(prev => prev.filter(c => !c.parentId || !deletedIds.has(c.parentId)));
    setDeleteFolderId(null);
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F9FAFB] dark:bg-[var(--bg-app)] overflow-x-hidden relative">
      <PageHeader 
        title={!breadcrumbs ? "Опросы" : undefined}
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
               className="gap-2 bg-white shadow-sm hover:bg-neutral-50 border-neutral-200 h-9"
            >
              <Folder className="w-4 h-4 text-neutral-500" />
              Создать папку
            </Button>
            <Button 
              variant="primary" 
              onClick={() => router.push('/surveys/create')}
              className="gap-2 shadow-md h-9"
            >
              <Plus className="w-4 h-4" />
              Создать опрос
            </Button>
          </>
        }
      />
      
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 pb-32">
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
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 gap-2 bg-white shadow-sm border-neutral-200 rounded-xl px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4 text-neutral-500" />
              Фильтры
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
          
          {isSearching && visibleFolders.length === 0 && visibleCourses.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500 animate-in fade-in duration-500">
               <Search className="w-12 h-12 text-neutral-300 mb-4" />
               <p className="text-lg">По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            <>
              {visibleFolders.length > 0 && (
                <div className="mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Папки</h2>
                  <SortableContext items={visibleFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {visibleFolders.map((folder) => (
                        <SortableFolder 
                          key={folder.id} 
                          folder={folder} 
                          isDraggingCourse={activeItem?.type === 'course'} 
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

              {(visibleCourses.length > 0 || !isSearching) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">{isSearching ? 'Результаты поиска' : 'Опросы'}</h2>
                  <SortableContext items={visibleCourses.map(c => c.id)} strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleCourses.map(course => <SortableCourseCard key={course.id} course={course} viewMode="grid" onMenuClick={handleCourseMenuAction} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />)}
                      </div>
                    ) : (
                      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 rounded-t-2xl text-[11px] font-bold text-neutral-400 uppercase tracking-wider items-center">
                          <div className="col-span-4">Опрос</div>
                          <div className="col-span-1">Язык</div>
                          <div className="col-span-2">Статус</div>
                          <div className="col-span-1 text-right">Студенты</div>
                          <div className="col-span-1 text-right">Ответов</div>
                          <div className="col-span-2 text-right pr-6">Создан</div>
                          <div className="col-span-1"></div>
                        </div>
                        <div className="flex flex-col divide-y divide-neutral-100 relative min-h-[100px]">
                           {visibleCourses.length === 0 ? (
                              <div className="py-12 flex flex-col items-center justify-center text-neutral-500"><p>Здесь пока нет опросов</p></div>
                           ) : visibleCourses.map((course, index) => <SortableCourseCard key={course.id} course={course} index={index} viewMode="list" onMenuClick={handleCourseMenuAction} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />)}
                        </div>
                      </div>
                    )}
                  </SortableContext>

                  <DragOverlay dropAnimation={null}>
                    {activeItem?.type === 'course' ? (
                       <div className="opacity-60 rotate-2 cursor-grabbing shadow-2xl origin-center"><SortableCourseCard course={activeItem.data} viewMode={viewMode} /></div>
                    ) : activeItem?.type === 'folder' ? (
                       <div className="opacity-80 rotate-2 cursor-grabbing shadow-2xl origin-center"><SortableFolder folder={activeItem.data} isDraggingCourse={false} onClick={()=>{}} onMenuClick={()=>{}} /></div>
                    ) : null}
                  </DragOverlay>
                </div>
              )}
            </>
          )}
        </DndContext>
      </div>

      {/* Editor Modal */}
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
                    className="w-full h-11 px-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] outline-none" 
                    value={folderEditorData.title} 
                    onChange={e => setFolderEditorData(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Например, Дизайн и Графика"
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
               <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" className="font-semibold" onClick={() => setFolderEditor(null)}>Отмена</Button>
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
                   <div className="w-8 h-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-neutral-500" /></div>
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
                <Button variant="outline" className="font-semibold" onClick={() => setMoveFolderId(null)}>Отмена</Button>
             </div>
          </div>
        </div>
      )}

      {/* Move Course Modal */}
      {moveCourseId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setMoveCourseId(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-neutral-900 mb-2">Переместить опрос</h2>
             <p className="text-sm text-neutral-500 mb-6">Выберите новое расположение для "{courses.find(c => c.id === moveCourseId)?.title}"</p>
             <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6 p-1">
                <button 
                   onClick={() => confirmMoveCourse(null)}
                   className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:border-[var(--color-admin-primary-500)] hover:bg-[var(--color-admin-primary-50)] transition-all font-semibold text-neutral-900 flex items-center gap-3"
                 >
                   <div className="w-8 h-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-neutral-500" /></div>
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
                       key={f.id} onClick={() => confirmMoveCourse(f.id)}
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
                <Button variant="outline" className="font-semibold" onClick={() => setMoveCourseId(null)}>Отмена</Button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {deleteCourseId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setDeleteCourseId(null)} />
           <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                 <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-[22px] font-bold text-neutral-900 mb-3 tracking-tight">Удалить опрос?</h2>
              <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">Вы действительно хотите безвозвратно удалить опрос <strong className="text-neutral-900 font-semibold">"{courses.find(c => c.id === deleteCourseId)?.title}"</strong>?</p>
              <div className="flex gap-3 w-full">
                 <Button variant="outline" className="flex-1 font-semibold" onClick={() => setDeleteCourseId(null)}>Отмена</Button>
                 <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent" onClick={() => {
                     setCourses(prev => prev.filter(c => c.id !== deleteCourseId));
                     setDeleteCourseId(null);
                 }}>Удалить</Button>
              </div>
           </div>
        </div>
      )}

      {/* Duplicate Course Modal */}
      {duplicateCourseId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setDuplicateCourseId(null)} />
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Дублирование опроса</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[14px] font-semibold text-neutral-800 mb-2">Новое название опроса</label>
                  <input 
                     type="text" autoFocus
                     className="w-full h-11 px-4 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] outline-none transition-all shadow-sm text-sm" 
                     value={duplicateCourseForm.title} 
                     onChange={e => setDuplicateCourseForm(prev => ({ ...prev, title: e.target.value }))} 
                     placeholder="Введите название"
                   />
                </div>
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-neutral-100">
                   <Button variant="outline" className="font-semibold" onClick={() => setDuplicateCourseId(null)}>Отмена</Button>
                   <Button variant="primary" className="font-semibold" disabled={!duplicateCourseForm.title.trim()} onClick={() => {
                        const originalInfo = courses.find(c => c.id === duplicateCourseId);
                        if(originalInfo) {
                           setCourses(prev => [{ ...originalInfo, id: `COR-${Math.floor(Math.random() * 10000)}`, title: duplicateCourseForm.title, status: 'Draft' }, ...prev]);
                        }
                        setDuplicateCourseId(null);
                   }}>Дублировать</Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Course Editor Modal */}
      {courseEditor && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setCourseEditor(null)} />
          <div className="bg-white rounded-3xl w-full max-w-[720px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 pb-6 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white z-20">
               <div>
                 <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{courseEditor.mode === 'create' ? 'Создание курса' : 'Настройки курса'}</h2>
                 <p className="text-sm text-neutral-500 mt-1">{courseEditor.mode === 'create' ? 'Заполните основные данные о новом материале' : 'Отредактируйте основные данные о курсе'}</p>
               </div>
             </div>
             
             <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30">
               <div className="flex flex-col gap-8">

                 {/* Basic Info */}
                 <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-6">
                   <div className="grid grid-cols-[180px_1fr] items-center gap-6">
                     <label className="text-[14px] font-semibold text-neutral-800">Название опроса</label>
                     <input 
                        type="text" autoFocus
                        value={courseForm.title} 
                        onChange={e => setCourseForm(prev => ({ ...prev, title: e.target.value }))} 
                        placeholder="Введите название курса"
                        className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] hover:border-neutral-300 outline-none text-sm shadow-sm transition-all" 
                      />
                   </div>

                   <div className="h-px bg-neutral-100 w-full" />

                   <div className="grid grid-cols-[180px_1fr] items-start gap-6">
                     <label className="text-[14px] font-semibold text-neutral-800 mt-3">Описание опроса</label>
                     <textarea 
                        value={courseForm.description} 
                        onChange={e => setCourseForm(prev => ({ ...prev, description: e.target.value }))} 
                        placeholder="Кратко опишите о чем курс и чему научится студент"
                        className="w-full h-24 p-4 bg-white border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] hover:border-neutral-300 outline-none resize-none text-sm shadow-sm transition-all leading-relaxed" 
                      />
                   </div>

                   <div className="h-px bg-neutral-100 w-full" />

                   <div className="grid grid-cols-[180px_1fr] items-center gap-6">
                     <label className="text-[14px] font-semibold text-neutral-800">Язык опроса</label>
                     <div className="relative">
                       <button 
                         type="button"
                         onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                         className={`w-full h-11 px-4 pr-10 bg-white border ${langDropdownOpen ? 'border-[var(--color-admin-primary-500)] ring-4 ring-[var(--color-admin-primary-500)]/10' : 'border-neutral-200 hover:border-neutral-300'} rounded-xl outline-none text-[14px] text-left shadow-sm transition-all focus:border-neutral-200 flex items-center justify-between`}
                       >
                         <span className="truncate">{courseForm.lang === 'RUS' ? 'Русский' : "O'zbek tili"}</span>
                       </button>
                       <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                         <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                       </div>
                       
                       {langDropdownOpen && (
                         <>
                           <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                           <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden p-1.5 animate-in fade-in slide-in-from-top-1">
                             <button
                               type="button"
                               onClick={() => { setCourseForm(prev => ({ ...prev, lang: 'RUS' })); setLangDropdownOpen(false); }}
                               className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] flex items-center justify-between transition-colors ${courseForm.lang === 'RUS' ? 'bg-neutral-50 text-neutral-900 font-medium' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'}`}
                             >
                               Русский
                               {courseForm.lang === 'RUS' && <Check className="w-4 h-4 text-[var(--color-admin-primary-600)]" />}
                             </button>
                             <button
                               type="button"
                               onClick={() => { setCourseForm(prev => ({ ...prev, lang: 'UZB' })); setLangDropdownOpen(false); }}
                               className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] flex items-center justify-between transition-colors ${courseForm.lang === 'UZB' ? 'bg-neutral-50 text-neutral-900 font-medium' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'}`}
                             >
                               O'zbek tili
                               {courseForm.lang === 'UZB' && <Check className="w-4 h-4 text-[var(--color-admin-primary-600)]" />}
                             </button>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Settings / Access */}
                 <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-6">
                   <div className="grid grid-cols-[180px_1fr] items-start gap-6 pt-1">
                     <label className="text-[14px] font-semibold text-neutral-800 mt-2">Доступ к опросу</label>
                     <div className="flex flex-col gap-6">
                       <div className="flex bg-neutral-100/80 p-1 rounded-xl w-full border border-neutral-200/50">
                         <button 
                           type="button"
                           onClick={() => setCourseForm(prev => ({ ...prev, access: 'paid' }))}
                           className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseForm.access === 'paid' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           Платный
                         </button>
                         <button 
                           type="button"
                           onClick={() => setCourseForm(prev => ({ ...prev, access: 'free', hasDiscount: false, price: '', discountPrice: '' }))}
                           className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseForm.access === 'free' ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           Бесплатный
                         </button>
                       </div>

                       {courseForm.access === 'paid' && (
                         <div className="flex flex-col gap-6 animate-in slide-in-from-top-2 fade-in duration-300">
                           <div className="h-px bg-neutral-100 w-full" />
                           <div className="relative">
                             <label className="block text-[14px] font-semibold text-neutral-800 mb-2">Стоимость (UZS)</label>
                             <input 
                                type="number" 
                                value={courseForm.price} 
                                onChange={e => setCourseForm(prev => ({ ...prev, price: e.target.value }))} 
                                placeholder="Введите стоимость курса"
                                className="w-full h-11 pl-4 pr-12 bg-white border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] outline-none text-[14px] shadow-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                              />
                             <span className="absolute right-4 bottom-0 h-11 flex items-center text-xs font-medium text-neutral-400 pointer-events-none select-none">UZS</span>
                           </div>
                           
                           <div className="h-px bg-neutral-100 w-full" />
                           
                           <div className="flex items-center justify-between">
                             <span className="text-[14px] font-semibold text-neutral-800 cursor-pointer" onClick={() => setCourseForm(prev => ({ ...prev, hasDiscount: !prev.hasDiscount }))}>
                               Включить скидку
                             </span>
                             <button 
                               type="button"
                               onClick={() => setCourseForm(prev => ({ ...prev, hasDiscount: !prev.hasDiscount, discountPrice: '' }))}
                               className={`w-11 h-6 rounded-full transition-all relative flex items-center shrink-0 border ${courseForm.hasDiscount ? 'bg-[var(--color-admin-primary-500)] border-[var(--color-admin-primary-500)]' : 'bg-neutral-200 border-neutral-300'}`}
                             >
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm absolute left-1 ${courseForm.hasDiscount ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                           </div>
                           
                           {courseForm.hasDiscount && (
                             <div className="animate-in fade-in slide-in-from-top-1 duration-200 -mt-2">
                               <div className="relative">
                                 <input 
                                    type="number" 
                                    value={courseForm.discountPrice} 
                                    onChange={e => setCourseForm(prev => ({ ...prev, discountPrice: e.target.value }))} 
                                    placeholder="Введите стоимость со скидкой"
                                    className="w-full h-11 pl-4 pr-12 bg-white border border-neutral-200 rounded-xl focus:ring-4 focus:ring-[var(--color-admin-primary-500)]/10 focus:border-[var(--color-admin-primary-500)] outline-none text-[14px] shadow-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                  />
                                 <span className="absolute right-4 bottom-0 h-11 flex items-center text-xs font-medium text-neutral-400 pointer-events-none select-none">UZS</span>
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>

                 </div>
               </div>
             </div>
             
             <div className="p-6 sm:px-8 bg-white border-t border-neutral-100 flex justify-end gap-3 shrink-0">
                <Button variant="outline" className="font-semibold px-6 h-11 min-w-[120px] rounded-xl text-neutral-600 border-neutral-200 hover:bg-neutral-50" onClick={() => setCourseEditor(null)}>Отмена</Button>
                <Button variant="primary" className="font-semibold shadow-md px-6 h-11 rounded-xl min-w-[140px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100" disabled={!courseForm.title.trim()} onClick={saveCourse}>
                  {courseEditor.mode === 'create' ? 'Создать опрос' : 'Сохранить'}
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
               <span className="font-semibold text-rose-600 mt-2 block">Все вложенные курсы и папки будут удалены без возможности восстановления.</span>
             </p>
             <div className="flex gap-3">
                <Button variant="outline" className="flex-1 font-semibold" onClick={() => setDeleteFolderId(null)}>Отмена</Button>
                <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm" onClick={confirmDeleteFolder}>Удалить</Button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
