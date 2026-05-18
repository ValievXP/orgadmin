"use client";
import React, { useState, useMemo } from 'react';
import { 
  X, Search, ChevronRight, ChevronDown, Folder, 
  BookOpen, CheckSquare, Square
} from 'lucide-react';

interface CourseNode {
  id: string;
  type: 'folder' | 'course';
  title: string;
  children?: CourseNode[];
  color?: string;
}

const COURSE_DATA: CourseNode[] = [
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
        title: 'Welcome Day: Знакомство с компанией'
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
  {
    id: 'c-821',
    type: 'course',
    title: 'Основы корпоративной безопасности'
  },
  {
    id: 'c-724',
    type: 'course',
    title: 'Введение в управление проектами'
  },
  {
    id: 'c-612',
    type: 'course',
    title: 'Дизайн-системы в Figma'
  },
  {
    id: 'c-509',
    type: 'course',
    title: 'Английский язык (Средний уровень)'
  }
];

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (selectedCourses: string[]) => void;
}

export function AssignCourseModal({ isOpen, onClose, onAssign }: AssignCourseModalProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['folder-f1']));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return COURSE_DATA;
    const term = search.toLowerCase();
    const filterNode = (node: CourseNode): CourseNode | null => {
      const match = node.title.toLowerCase().includes(term);
      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean) as CourseNode[];
        if (filteredChildren.length > 0) return { ...node, children: filteredChildren };
      }
      return match ? node : null;
    };
    return COURSE_DATA.map(filterNode).filter(Boolean) as CourseNode[];
  }, [search]);

  if (!isOpen) return null;

  const isSearching = search.trim().length > 0;

  const renderNode = (node: CourseNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id) || isSearching;
    const hasChildren = node.children && node.children.length > 0;
    const isCourse = node.type === 'course';
    const isSelected = selectedIds.has(node.id);

    return (
      <div key={node.id}>
        <div
          onClick={() => {
            if (isCourse) toggleSelect(node.id);
            else toggleExpand(node.id);
          }}
          className={`flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer transition-all group hover:bg-neutral-50`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Expand / collapse chevron or empty space */}
          <div
            onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggleExpand(node.id); } }}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0 ${
              hasChildren ? 'hover:bg-neutral-200 cursor-pointer' : ''
            }`}
          >
            {node.type === 'folder' ? (
              isExpanded
                ? <ChevronDown className="w-4 h-4 text-neutral-400" />
                : <ChevronRight className="w-4 h-4 text-neutral-400" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
            )}
          </div>

          {/* Icon */}
          {node.type === 'folder' ? (
            <Folder className={`w-4 h-4 shrink-0 ${node.color || 'text-neutral-400'}`} />
          ) : (
            <BookOpen className="w-4 h-4 shrink-0 text-emerald-500" />
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] truncate ${
              isSelected ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
            }`}>
              {node.title}
            </p>
          </div>

          {/* Checkbox for courses */}
          {isCourse && (
            <div className={`shrink-0 ml-2 ${isSelected ? 'text-[var(--color-admin-primary-500)]' : 'text-neutral-300 group-hover:text-neutral-400'}`}>
              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className={`flex flex-col gap-0.5 ml-5 mt-0.5`}>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-admin-primary-50)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[var(--color-admin-primary-600)]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">Назначить курс</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">Выберите курсы для пользователя</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по курсам и папкам..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-400)] transition-all shadow-sm"
            />
          </div>
        </div>

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

        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-neutral-500 font-medium">
            Выбрано курсов: <span className="font-bold text-neutral-900">{selectedIds.size}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-[13px] font-medium text-neutral-600 hover:bg-neutral-200 bg-neutral-100 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                onAssign(Array.from(selectedIds));
              }}
              disabled={selectedIds.size === 0}
              className="px-5 py-2 rounded-xl text-[13px] font-medium text-white bg-[var(--color-admin-primary-600)] hover:bg-[var(--color-admin-primary-700)] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
            >
              Назначить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
