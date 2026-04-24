"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Upload, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  User,
  Edit3,
  Trash2,
  Check,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown
} from 'lucide-react';

const mockUsers = [
  { id: 1, initials: 'АС', name: 'Алексей Смирнов', email: 'a.smirnov@osnova.uz', phone: '+998 90 123-45-67', branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Руководитель отдела', status: 'Работает', visit: '24/04/2026 10:30', reg: '15/01/2025 09:00', activityMs: 1777000000000, regMs: 1736920000000 },
  { id: 2, initials: 'МВ', name: 'Мария Волкова', email: 'm.volkova@osnova.uz', phone: '+998 91 234-56-78', branch: 'Ташкент (ГК)', dept: 'Маркетинг', div: 'PR и коммуникации', role: 'PR-менеджер', status: 'Работает', visit: '24/04/2026 09:15', reg: '03/03/2025 11:20', activityMs: 1776990000000, regMs: 1740980000000 },
  { id: 3, initials: 'ДТ', name: 'Дмитрий Тарасов', email: 'd.tarasov@osnova.uz', phone: '+998 93 345-67-89', branch: 'Самарканд', dept: 'Служба поддержки', div: 'Первая линия', role: 'Специалист поддержки', status: 'Отпуск', visit: '20/04/2026 18:00', reg: '10/02/2025 15:45', activityMs: 1776600000000, regMs: 1739150000000 },
  { id: 4, initials: 'ЕК', name: 'Елена Кузнецова', email: 'e.kuznecova@osnova.uz', phone: '+998 94 456-78-90', branch: 'Ташкент (ГК)', dept: 'HR', div: 'Подбор персонала', role: 'HR Бизнес-партнер', status: 'Работает', visit: '24/04/2026 11:45', reg: '01/08/2024 10:10', activityMs: 1777010000000, regMs: 1722480000000 },
  { id: 5, initials: 'ТИ', name: 'Тимур Ибрагимов', email: 't.ibragimov@osnova.uz', phone: '+998 99 567-89-01', branch: 'Бухара', dept: 'IT', div: 'Разработка ПО', role: 'Frontend Разработчик', status: 'Работает', visit: '24/04/2026 12:20', reg: '12/11/2025 09:30', activityMs: 1777050000000, regMs: 1762950000000 },
  { id: 6, initials: 'ОС', name: 'Ольга Сидорова', email: 'o.sidorova@osnova.uz', phone: '+998 97 678-90-12', branch: 'Ташкент (ГК)', dept: 'Финансы', div: 'Бухгалтерия', role: 'Главный бухгалтер', status: 'Работает', visit: '23/04/2026 17:30', reg: '05/05/2024 14:15', activityMs: 1776900000000, regMs: 1714870000000 },
  { id: 7, initials: 'АМ', name: 'Алишер Махмудов', email: 'a.mahmudov@osnova.uz', phone: '+998 90 789-01-23', branch: 'Ташкент (ГК)', dept: 'Руководство', div: 'Совет директоров', role: 'Операционный директор', status: 'Работает', visit: '24/04/2026 08:50', reg: '10/01/2024 08:00', activityMs: 1776980000000, regMs: 1704850000000 },
  { id: 8, initials: 'ИН', name: 'Ирина Новикова', email: 'i.novikova@osnova.uz', phone: '+998 91 890-12-34', branch: 'Фергана', dept: 'Логистика', div: 'Складской учет', role: 'Менеджер по логистике', status: 'Уволен', visit: '15/03/2026 14:10', reg: '22/09/2025 16:20', activityMs: 1773000000000, regMs: 1758500000000 },
  { id: 9, initials: 'РК', name: 'Рустам Каримов', email: 'r.karimov@osnova.uz', phone: '+998 93 901-23-45', branch: 'Самарканд', dept: 'Коммерческий департамент', div: 'Отдел продаж B2C', role: 'Старший менеджер', status: 'Работает', visit: null, reg: '18/06/2025 11:00', activityMs: 0, regMs: 1750200000000 },
  { id: 10, initials: 'СЛ', name: 'Светлана Лебедева', email: 's.lebedeva@osnova.uz', phone: '+998 94 012-34-56', branch: 'Ташкент (ГК)', dept: 'Продуктовая аналитика', div: 'Аналитика', role: 'Data Analyst', status: 'Работает', visit: '24/04/2026 10:15', reg: '30/10/2025 13:45', activityMs: 1776995000000, regMs: 1761800000000 },
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

function CustomSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value === "" ? label : value;

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left pl-3.5 pr-9 py-2.5 bg-white border ${open ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-100)]' : 'border-neutral-200 hover:border-neutral-300'} rounded-xl text-[13px] text-neutral-800 font-medium transition-all flex items-center justify-between`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-[180px] bg-white border border-neutral-200 shadow-xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
          >
            <span className={value === "" ? "font-semibold text-neutral-900" : ""}>{label} (Все)</span>
            {value === "" && <Check className="w-4 h-4 text-neutral-900" />}
          </button>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
            >
              <span className={value === opt ? "font-semibold text-neutral-900" : ""}>{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-neutral-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type SortOrder = 'asc' | 'desc' | null;

export default function UsersPage() {
  const router = useRouter();
  
  // Filters state
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [divFilter, setDivFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Sort state
  const [activitySort, setActivitySort] = useState<SortOrder>(null);
  const [regSort, setRegSort] = useState<SortOrder>(null);

  // Extract unique options
  const branches = useMemo(() => Array.from(new Set(mockUsers.map(u => u.branch))), []);
  const depts = useMemo(() => Array.from(new Set(mockUsers.map(u => u.dept))), []);
  const divs = useMemo(() => Array.from(new Set(mockUsers.map(u => u.div))), []);
  const roles = useMemo(() => Array.from(new Set(mockUsers.map(u => u.role))), []);
  const statuses = useMemo(() => Array.from(new Set(mockUsers.map(u => u.status))), []);

  // Filter data
  const filteredUsers = useMemo(() => {
    let result = mockUsers.filter(u => {
      const q = search.toLowerCase();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      
      const matchesBranch = !branchFilter || u.branch === branchFilter;
      const matchesDept = !deptFilter || u.dept === deptFilter;
      const matchesDiv = !divFilter || u.div === divFilter;
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesBranch && matchesDept && matchesDiv && matchesRole && matchesStatus;
    });

    if (activitySort === 'desc') {
      result.sort((a, b) => b.activityMs - a.activityMs);
    } else if (activitySort === 'asc') {
      result.sort((a, b) => a.activityMs - b.activityMs);
    } else if (regSort === 'desc') {
      result.sort((a, b) => b.regMs - a.regMs);
    } else if (regSort === 'asc') {
      result.sort((a, b) => a.regMs - b.regMs);
    }

    return result;
  }, [search, branchFilter, deptFilter, divFilter, roleFilter, statusFilter, activitySort, regSort]);

  const toggleSort = (type: 'activity' | 'reg') => {
    if (type === 'activity') {
      setRegSort(null);
      if (activitySort === null) setActivitySort('desc');
      else if (activitySort === 'desc') setActivitySort('asc');
      else setActivitySort(null);
    } else {
      setActivitySort(null);
      if (regSort === null) setRegSort('desc');
      else if (regSort === 'desc') setRegSort('asc');
      else setRegSort(null);
    }
  };

  const renderDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) {
      return <span className="text-[13px] font-medium text-neutral-400">-</span>;
    }
    const parts = dateTimeStr.split(' ');
    const date = parts[0];
    const time = parts[1] || '';
    return (
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-neutral-900 truncate">{date}</span>
        <span className="text-[11px] text-neutral-500 truncate">{time}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)]">
      <PageHeader 
        title="Пользователи" 
        actions={
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2 font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
              <Upload className="w-4 h-4" /> Excel
            </Button>
            <Button variant="primary" className="flex items-center gap-2 font-medium shadow-sm">
              <Plus className="w-4 h-4" /> Добавить пользователя
            </Button>
          </div>
        }
      />
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-6 lg:p-8">
        
        {/* Toolbar */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 p-5">
          <div className="flex flex-col gap-5">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400" />
              <input 
                type="text" 
                placeholder="Найти пользователя по ФИО, номеру телефона или почте..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <CustomSelect label="Филиал" options={branches} value={branchFilter} onChange={setBranchFilter} />
              <CustomSelect label="Департамент" options={depts} value={deptFilter} onChange={setDeptFilter} />
              <CustomSelect label="Отдел" options={divs} value={divFilter} onChange={setDivFilter} />
              <CustomSelect label="Должность" options={roles} value={roleFilter} onChange={setRoleFilter} />
              <CustomSelect label="Статус" options={statuses} value={statusFilter} onChange={setStatusFilter} />
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="w-full">
            <table className="w-full text-left whitespace-nowrap table-fixed">
              <thead className="bg-neutral-50/80 border-b border-neutral-200">
                <tr>
                  <th className="px-3 py-4 w-10 text-[12px] font-semibold text-neutral-400 uppercase tracking-wider text-center">№</th>
                  <th className="px-3 py-4 w-[20%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Пользователь</th>
                  <th className="px-3 py-4 w-[12%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Филиал</th>
                  <th className="px-3 py-4 w-[14%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Департамент</th>
                  <th className="px-3 py-4 w-[12%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Отдел</th>
                  <th className="px-3 py-4 w-[12%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Должность</th>
                  <th className="px-3 py-4 w-[8%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider truncate">Статус</th>
                  <th className="px-3 py-4 w-[11%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('activity')}>
                    <div className="flex items-center gap-1.5">
                      Посл. визит
                      {activitySort === 'desc' ? <ArrowDownAZ className="w-3.5 h-3.5 shrink-0" /> : 
                       activitySort === 'asc' ? <ArrowUpZA className="w-3.5 h-3.5 shrink-0" /> : 
                       <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-50 shrink-0" />}
                    </div>
                  </th>
                  <th className="px-3 py-4 w-[11%] text-[12px] font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('reg')}>
                    <div className="flex items-center gap-1.5">
                      Регистрация
                      {regSort === 'desc' ? <ArrowDownAZ className="w-3.5 h-3.5 shrink-0" /> : 
                       regSort === 'asc' ? <ArrowUpZA className="w-3.5 h-3.5 shrink-0" /> : 
                       <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-50 shrink-0" />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-neutral-400 text-[14px]">Пользователи не найдены</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} onClick={() => router.push(`/users/${user.id}`)} className="hover:bg-neutral-50/60 transition-colors group cursor-pointer">
                      <td className="px-3 py-3 text-center">
                        <span className="text-[12px] font-medium text-neutral-400 tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-3 overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0">
                            {user.initials}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <MarqueeText text={user.name} className="text-[13px] font-semibold text-neutral-900" />
                            <MarqueeText text={user.email} className="text-[11px] text-neutral-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 overflow-hidden">
                        <MarqueeText text={user.branch} className="text-[12px] font-medium text-neutral-800" />
                      </td>
                      <td className="px-3 py-3 overflow-hidden">
                        <MarqueeText text={user.dept} className="text-[12px] font-medium text-neutral-800" />
                      </td>
                      <td className="px-3 py-3 overflow-hidden">
                        <MarqueeText text={user.div} className="text-[12px] font-medium text-neutral-800" />
                      </td>
                      <td className="px-3 py-3 overflow-hidden">
                        <div className="bg-neutral-100 px-2.5 py-1 rounded-md inline-flex max-w-full">
                          <MarqueeText text={user.role} className="text-[12px] font-medium text-neutral-700" />
                        </div>
                      </td>
                      <td className="px-3 py-3 truncate">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            user.status === 'Работает' ? 'bg-emerald-500' :
                            user.status === 'Отпуск' ? 'bg-amber-400' :
                            'bg-rose-500'
                          }`} />
                          <span className="text-[12px] font-medium text-neutral-700 truncate">
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 truncate">
                        {renderDateTime(user.visit)}
                      </td>
                      <td className="px-3 py-3 truncate">
                        {renderDateTime(user.reg)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-white rounded-b-2xl">
            <span className="text-[13px] font-medium text-neutral-500">
              Показано {filteredUsers.length} из {mockUsers.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800 transition-colors disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4, 5, '...', 31].map((page, i) => (
                <button 
                  key={i} 
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                    page === 1 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-neutral-600 hover:bg-neutral-50'
                  } ${page === '...' ? 'pointer-events-none text-neutral-400' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800 transition-colors disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
