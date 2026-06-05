"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Check,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown,
  X,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Mock data representing platform team members (with 2 administrators)
const initialTeamUsers = [
  { id: 1, initials: 'АС', name: 'Смирнов Алексей Иванович', email: 'a.smirnov@osnova.uz', phone: '+998 90 123-45-67', branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Руководитель отдела', status: 'Работает', visit: '24/04/2026 10:30', reg: '15/01/2025 09:00', activityMs: 1777000000000, regMs: 1736920000000, sysRole: 'Администратор' },
  { id: 2, initials: 'МВ', name: 'Волкова Мария Сергеевна', email: 'm.volkova@osnova.uz', phone: '+998 91 234-56-78', branch: 'Ташкент (ГК)', dept: 'Маркетинг', div: 'PR и коммуникации', role: 'PR-менеджер', status: 'Работает', visit: '24/04/2026 09:15', reg: '03/03/2025 11:20', activityMs: 1776990000000, regMs: 1740980000000, sysRole: 'Куратор' },
  { id: 3, initials: 'ДТ', name: 'Тарасов Дмитрий Андреевич', email: 'd.tarasov@osnova.uz', phone: '+998 93 345-67-89', branch: 'Самарканд', dept: 'Служба поддержки', div: 'Первая линия', role: 'Специалист поддержки', status: 'Отпуск', visit: '20/04/2026 18:00', reg: '10/02/2025 15:45', activityMs: 1776600000000, regMs: 1739150000000, sysRole: 'Куратор' },
  { id: 4, initials: 'ЕК', name: 'Кузнецова Елена Александровна', email: 'e.kuznecova@osnova.uz', phone: '+998 94 456-78-90', branch: 'Ташкент (ГК)', dept: 'HR', div: 'Подбор персонала', role: 'HR Бизнес-партнер', status: 'Работает', visit: '24/04/2026 11:45', reg: '01/08/2024 10:10', activityMs: 1777010000000, regMs: 1722480000000, sysRole: 'Куратор' },
  { id: 5, initials: 'ТИ', name: 'Ибрагимов Тимур Бахтиярович', email: 't.ibragimov@osnova.uz', phone: '+998 99 567-89-01', branch: 'Бухара', dept: 'IT', div: 'Разработка ПО', role: 'Frontend Разработчик', status: 'Работает', visit: '24/04/2026 12:20', reg: '12/11/2025 09:30', activityMs: 1777050000000, regMs: 1762950000000, sysRole: 'Куратор' },
  { id: 6, initials: 'ОС', name: 'Сидорова Ольга Петровна', email: 'o.sidorova@osnova.uz', phone: '+998 97 678-90-12', branch: 'Ташкент (ГК)', dept: 'Финансы', div: 'Бухгалтерия', role: 'Главный бухгалтер', status: 'Работает', visit: '23/04/2026 17:30', reg: '05/05/2024 14:15', activityMs: 1776900000000, regMs: 1714870000000, sysRole: 'Куратор' },
  { id: 7, initials: 'АМ', name: 'Махмудов Алишер Рустамович', email: 'a.mahmudov@osnova.uz', phone: '+998 90 789-01-23', branch: 'Ташкент (ГК)', dept: 'Руководство', div: 'Совет директоров', role: 'Операционный директор', status: 'Работает', visit: '24/04/2026 08:50', reg: '10/01/2024 08:00', activityMs: 1776980000000, regMs: 1704850000000, sysRole: 'Администратор' },
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
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

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
    <div className="relative group w-full" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left pl-3.5 pr-9 py-2.5 bg-white border ${open ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-100)]' : 'border-neutral-200 hover:border-neutral-300'} rounded-xl text-[13px] text-neutral-800 font-medium transition-all flex items-center justify-between h-[44px]`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-neutral-200 shadow-xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[300px]">
          <div className="px-2 pb-1.5 border-b border-neutral-100 mb-1">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1.5 text-[13px] text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary-500)] focus:border-[var(--color-admin-primary-500)] placeholder:text-neutral-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto">
            {!searchQuery && (
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
              >
                <span className={value === "" ? "font-semibold text-neutral-900" : ""}>{label} (Все)</span>
                {value === "" && <Check className="w-4 h-4 text-neutral-900" />}
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-neutral-400 text-center">Нет результатов</div>
            ) : (
              filteredOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
                >
                  <span className={value === opt ? "font-semibold text-neutral-900" : ""}>{opt}</span>
                  {value === opt && <Check className="w-4 h-4 text-neutral-900" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormSelect({ label, placeholder, options, value, onChange, showSearch = true }: { label: string, placeholder: string, options: string[], value: string, onChange: (val: string) => void, showSearch?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery) return options;
    return options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery, showSearch]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value === "" ? placeholder : value;

  return (
    <div className="relative group" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full text-left px-4 py-3 bg-neutral-50/50 hover:bg-neutral-50 border ${open ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-100)]' : 'border-neutral-200'} rounded-xl text-[14px] ${value === "" ? 'text-neutral-400' : 'text-neutral-900'} focus:outline-none transition-all flex items-center justify-between min-h-[46px]`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-neutral-200 shadow-xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[250px]">
          {showSearch && (
            <div className="px-2 pb-1.5 border-b border-neutral-100 mb-1">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1.5 text-[13px] text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary-500)] focus:border-[var(--color-admin-primary-500)] placeholder:text-neutral-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto">
            {(!searchQuery && placeholder) && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
              >
                <span className={value === "" ? "font-semibold text-neutral-900" : ""}>{placeholder}</span>
                {value === "" && <Check className="w-4 h-4 text-neutral-900" />}
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-neutral-400 text-center">Нет результатов</div>
            ) : (
              filteredOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
                >
                  <span className={value === opt ? "font-semibold text-neutral-900" : ""}>{opt}</span>
                  {value === opt && <Check className="w-4 h-4 text-neutral-900" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type SortOrder = 'asc' | 'desc' | null;

export default function TeamPage() {
  const router = useRouter();
  
  const [settings, setSettings] = useState<any>(null);
  const [teamUsers, setTeamUsers] = useState<any[]>(initialTeamUsers);

  useEffect(() => {
    const saved = localStorage.getItem('osnova_user_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading settings', e);
      }
    } else {
      setSettings({
        patronymicEnabled: true,
        patronymicRequired: false,
        regionEnabled: false,
        regionRequired: false,
        priorityFields: [
          { id: 'p_branch', label: 'Филиал' },
          { id: 'p_dept', label: 'Департамент' },
          { id: 'p_div', label: 'Отдел' },
          { id: 'p_role', label: 'Должность' },
          { id: 'p_status', label: 'Статус' }
        ],
        secondaryFields: [
          { id: 's_gender', label: 'Пол' },
          { id: 's_age', label: 'Возраст' }
        ]
      });
    }
  }, []);

  const getUserFullName = (fullName: string) => {
    if (settings && !settings.patronymicEnabled) {
      const parts = fullName.split(' ');
      if (parts.length >= 3) {
        return `${parts[0]} ${parts[1]}`;
      }
    }
    return fullName;
  };

  // Filters state
  const [search, setSearch] = useState("");
  const [sysRoleFilter, setSysRoleFilter] = useState(""); // Role badge filter
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<'10' | '20' | '50' | 'all'>('10');
  
  // Sort state
  const [activitySort, setActivitySort] = useState<SortOrder>(null);
  const [regSort, setRegSort] = useState<SortOrder>(null);

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Form states (Adding team member)
  const [formName, setFormName] = useState("");
  const [formSurname, setFormSurname] = useState("");
  const [formPatronymic, setFormPatronymic] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formGender, setFormGender] = useState("");
  
  // Preselected role "Куратор"
  const [formRole, setFormRole] = useState("Куратор"); 
  const [formBranch, setFormBranch] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formDiv, setFormDiv] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formStatus, setFormStatus] = useState("Работает");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation & submission
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSurname.trim() || !formPhone.trim()) {
      alert("Пожалуйста, заполните все обязательные поля (*)");
      return;
    }

    const newId = teamUsers.length + 1;
    const initials = `${formSurname.charAt(0)}${formName.charAt(0)}`.toUpperCase();
    const fullName = `${formSurname} ${formName} ${formPatronymic}`.trim();
    
    const newUser = {
      id: newId,
      initials,
      name: fullName,
      email: formEmail || `${formName.toLowerCase()}.${formSurname.toLowerCase()}@osnova.uz`,
      phone: formPhone,
      branch: formBranch || "Ташкент (ГК)",
      dept: formDept || "Маркетинг",
      div: formDiv || "PR и коммуникации",
      role: formPosition || "Куратор",
      status: formStatus || "Работает",
      visit: null,
      reg: new Date().toLocaleDateString('ru-RU') + " " + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      activityMs: 0,
      regMs: Date.now(),
      sysRole: formRole
    };

    setTeamUsers([newUser, ...teamUsers]);
    setIsAddUserModalOpen(false);
    
    // Reset form states
    setFormName("");
    setFormSurname("");
    setFormPatronymic("");
    setFormRegion("");
    setFormPhone("");
    setFormEmail("");
    setFormGender("");
    setFormRole("Куратор");
    setFormBranch("");
    setFormDept("");
    setFormDiv("");
    setFormPosition("");
    setFormStatus("Работает");
  };

  const handleExportToExcel = () => {
    const headers = ['ФИО', 'Телефон', 'Email', 'Роль'];
    if (settings?.birthDateEnabled ?? true) headers.push('Дата рождения');
    if (settings?.genderEnabled ?? true) headers.push('Пол');
    if (settings?.regionEnabled ?? false) headers.push('Регион');
    headers.push('Последний визит', 'Регистрация');

    const rows = filteredUsers.map(user => {
      const rowData = [
        getUserFullName(user.name),
        user.phone,
        user.email,
        user.sysRole
      ];

      if (settings?.birthDateEnabled ?? true) rowData.push('12/05/1990');
      if (settings?.genderEnabled ?? true) rowData.push('M');
      if (settings?.regionEnabled ?? false) rowData.push('Ташкент');
      rowData.push(user.visit || '—', user.reg);
      return rowData;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Команда');
    XLSX.writeFile(wb, 'osnova_team.xlsx');
  };

  // Roles visible in table filtering
  const filterRoles = ["Куратор", "Руководитель", "Администратор"];
  
  // Roles allowed to be created by the administrator (Administrator excluded)
  const formRoles = ["Куратор", "Руководитель"];

  // Filter data
  const filteredUsers = useMemo(() => {
    let result = teamUsers.filter(u => {
      const q = search.toLowerCase();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      
      const matchesSysRole = !sysRoleFilter || u.sysRole === sysRoleFilter;
      return matchesSearch && matchesSysRole;
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
  }, [teamUsers, search, sysRoleFilter, activitySort, regSort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sysRoleFilter]);

  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.ceil(filteredUsers.length / Number(pageSize));
  }, [filteredUsers.length, pageSize]);

  const pagedUsers = useMemo(() => {
    if (pageSize === 'all') return filteredUsers;
    const start = (currentPage - 1) * Number(pageSize);
    return filteredUsers.slice(start, start + Number(pageSize));
  }, [filteredUsers, currentPage, pageSize]);

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
      return <span className="text-neutral-300 font-normal">—</span>;
    }
    const parts = dateTimeStr.split(' ');
    const date = parts[0];
    const time = parts[1] || '';
    return (
      <div className="flex flex-col min-w-0 items-end">
        <span className="text-[11px] text-neutral-800 font-semibold truncate">{date}</span>
        <span className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{time}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] pb-0">
      <PageHeader 
        title="Команда" 
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Добавить
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-6 lg:p-8 pb-16">
        
        {/* Toolbar */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400" />
              <input 
                type="text" 
                placeholder="Найти члена команды по ФИО, номеру телефона или почте..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400"
              />
            </div>
            <div className="w-full md:w-[240px]">
              <CustomSelect 
                label="Роль в команде" 
                options={filterRoles} 
                value={sysRoleFilter} 
                onChange={setSysRoleFilter} 
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        {(() => {
          return (
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap table-fixed" style={{ minWidth: '900px' }}>
                  <thead className="bg-neutral-50/80 border-b border-neutral-100">
                    <tr>
                      <th style={{ width: '60px' }} className="px-4 py-3.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center">№</th>
                      <th 
                        style={{ width: '45%' }}
                        className="px-4 py-3.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate"
                      >
                        Сотрудник
                      </th>
                      <th style={{ width: '18%' }} className="px-4 py-3.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                        Роль
                      </th>
                      <th style={{ width: '150px' }} className="px-4 py-3.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('activity')}>
                        <div className="flex items-center justify-end gap-1.5">
                          Посл. визит
                          {activitySort === 'desc' ? <ArrowDownAZ className="w-3.5 h-3.5 shrink-0" /> : 
                           activitySort === 'asc' ? <ArrowUpZA className="w-3.5 h-3.5 shrink-0" /> : 
                           <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-50 shrink-0" />}
                        </div>
                      </th>
                      <th style={{ width: '150px' }} className="px-4 py-3.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('reg')}>
                        <div className="flex items-center justify-end gap-1.5">
                          Регистрация
                          {regSort === 'desc' ? <ArrowDownAZ className="w-3.5 h-3.5 shrink-0" /> : 
                           regSort === 'asc' ? <ArrowUpZA className="w-3.5 h-3.5 shrink-0" /> : 
                           <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-50 shrink-0" />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {pagedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-neutral-400 text-[14px]">Члены команды не найдены</td>
                      </tr>
                    ) : (
                      pagedUsers.map((user, index) => {
                        const globalIdx = pageSize === 'all' ? (index + 1) : ((currentPage - 1) * Number(pageSize) + index + 1);
                        return (
                          <tr key={user.id} onClick={() => { if (user.sysRole === 'Куратор') router.push(`/team/${user.id}`); }} className={`group border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors ${user.sysRole === 'Куратор' ? 'cursor-pointer' : 'cursor-default'}`}>
                            <td className="px-4 py-3.5 text-center">
                              <span className="text-[11px] text-neutral-300 tabular-nums">
                                {String(globalIdx).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 overflow-hidden">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
                                  {user.initials}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <MarqueeText 
                                    text={getUserFullName(user.name)} 
                                    className="font-semibold text-neutral-800 text-[13px]" 
                                  />
                                  <MarqueeText 
                                    text={user.email} 
                                    className="text-[11px] text-neutral-400 font-medium" 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 overflow-hidden">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-md border shrink-0 leading-none ${
                                user.sysRole === 'Администратор' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                user.sysRole === 'Руководитель' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                                'bg-violet-50 border-violet-100 text-violet-700'
                              }`}>
                                {user.sysRole}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 truncate text-right">
                              {renderDateTime(user.visit)}
                            </td>
                            <td className="px-4 py-3.5 truncate text-right">
                              {renderDateTime(user.reg)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-neutral-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-50/20 rounded-b-2xl">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-semibold">Показывать по:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-300 shadow-sm cursor-pointer"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="all">Все</option>
                    </select>
                  </div>
                  <span className="text-xs text-neutral-400 font-semibold">
                    Показано <span className="text-neutral-700 font-bold">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * (pageSize === 'all' ? filteredUsers.length : Number(pageSize)) + 1}–{pageSize === 'all' ? filteredUsers.length : Math.min(currentPage * Number(pageSize), filteredUsers.length)}</span> из <span className="text-neutral-700 font-bold">{filteredUsers.length}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto sm:ml-auto">
                  {pageSize !== 'all' && totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-colors shadow-sm cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const isActive = page === currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                              isActive
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-colors shadow-sm cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleExportToExcel}
                    className="flex items-center gap-2 font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 h-9 rounded-xl shadow-sm text-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Скачать Excel
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add Team Member Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Добавить члена команды</h2>
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSaveUser} className="flex flex-col gap-8">
                
                {/* Personal Information */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-neutral-900">Персональная информация</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Имя <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Фамилия <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        value={formSurname}
                        onChange={(e) => setFormSurname(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                      />
                    </div>

                    {(settings?.patronymicEnabled ?? true) && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">
                          Отчество {settings?.patronymicRequired && <span className="text-rose-500">*</span>}
                        </label>
                        <input 
                          type="text" 
                          required={settings?.patronymicRequired}
                          placeholder="Отчество"
                          value={formPatronymic}
                          onChange={(e) => setFormPatronymic(e.target.value)}
                          className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                        />
                      </div>
                    )}

                    {settings?.regionEnabled && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">
                          Регион {settings?.regionRequired && <span className="text-rose-500">*</span>}
                        </label>
                        <input 
                          type="text" 
                          required={settings?.regionRequired}
                          placeholder="Регион проживания / работы"
                          value={formRegion}
                          onChange={(e) => setFormRegion(e.target.value)}
                          className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">Дата рождения</label>
                        <input type="date" className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all text-neutral-400" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">Пол</label>
                        <FormSelect 
                          label="Пол" 
                          placeholder="" 
                          options={["Мужской", "Женский"]} 
                          value={formGender} 
                          onChange={setFormGender}
                          showSearch={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Data / System Role */}
                <div className="flex flex-col gap-5 pt-2 border-t border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900">Дополнительные данные</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-rose-500">Роль в команде *</label>
                      <FormSelect 
                        label="Роль" 
                        placeholder="" 
                        options={formRoles} // Admin excluded from creation dropdown
                        value={formRole} 
                        onChange={setFormRole}
                        showSearch={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Auth Data */}
                <div className="flex flex-col gap-5 pt-2 border-t border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900">Данные для авторизации</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Номер телефона <span className="text-rose-500">*</span></label>
                      <input 
                        type="tel" 
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                        placeholder="+998" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Почта</label>
                      <input 
                        type="email" 
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                        placeholder="example@ex.com" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">Пароль</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-11 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">Подтвердите пароль</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-11 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden submit trigger */}
                <button type="submit" className="hidden" id="submit-form-btn" />
              </form>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
              <Button variant="ghost" onClick={() => setIsAddUserModalOpen(false)}>
                Отмена
              </Button>
              <Button 
                variant="primary" 
                className="px-8 bg-black hover:bg-neutral-800 text-white rounded-xl"
                onClick={() => document.getElementById("submit-form-btn")?.click()}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
