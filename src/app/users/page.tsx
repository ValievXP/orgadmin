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
  ArrowUpDown,
  X,
  FileSpreadsheet,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';

const mockUsers = [
  { id: 1, initials: 'АС', name: 'Смирнов Алексей Иванович', email: 'a.smirnov@osnova.uz', phone: '+998 90 123-45-67', branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Руководитель отдела', status: 'Работает', visit: '24/04/2026 10:30', reg: '15/01/2025 09:00', activityMs: 1777000000000, regMs: 1736920000000 },
  { id: 2, initials: 'МВ', name: 'Волкова Мария Сергеевна', email: 'm.volkova@osnova.uz', phone: '+998 91 234-56-78', branch: 'Ташкент (ГК)', dept: 'Маркетинг', div: 'PR и коммуникации', role: 'PR-менеджер', status: 'Работает', visit: '24/04/2026 09:15', reg: '03/03/2025 11:20', activityMs: 1776990000000, regMs: 1740980000000 },
  { id: 3, initials: 'ДТ', name: 'Тарасов Дмитрий Андреевич', email: 'd.tarasov@osnova.uz', phone: '+998 93 345-67-89', branch: 'Самарканд', dept: 'Служба поддержки', div: 'Первая линия', role: 'Специалист поддержки', status: 'Отпуск', visit: '20/04/2026 18:00', reg: '10/02/2025 15:45', activityMs: 1776600000000, regMs: 1739150000000 },
  { id: 4, initials: 'ЕК', name: 'Кузнецова Елена Александровна', email: 'e.kuznecova@osnova.uz', phone: '+998 94 456-78-90', branch: 'Ташкент (ГК)', dept: 'HR', div: 'Подбор персонала', role: 'HR Бизнес-партнер', status: 'Работает', visit: '24/04/2026 11:45', reg: '01/08/2024 10:10', activityMs: 1777010000000, regMs: 1722480000000 },
  { id: 5, initials: 'ТИ', name: 'Ибрагимов Тимур Бахтиярович', email: 't.ibragimov@osnova.uz', phone: '+998 99 567-89-01', branch: 'Бухара', dept: 'IT', div: 'Разработка ПО', role: 'Frontend Разработчик', status: 'Работает', visit: '24/04/2026 12:20', reg: '12/11/2025 09:30', activityMs: 1777050000000, regMs: 1762950000000 },
  { id: 6, initials: 'ОС', name: 'Сидорова Ольга Петровна', email: 'o.sidorova@osnova.uz', phone: '+998 97 678-90-12', branch: 'Ташкент (ГК)', dept: 'Финансы', div: 'Бухгалтерия', role: 'Главный бухгалтер', status: 'Работает', visit: '23/04/2026 17:30', reg: '05/05/2024 14:15', activityMs: 1776900000000, regMs: 1714870000000 },
  { id: 7, initials: 'АМ', name: 'Махмудов Алишер Рустамович', email: 'a.mahmudov@osnova.uz', phone: '+998 90 789-01-23', branch: 'Ташкент (ГК)', dept: 'Руководство', div: 'Совет директоров', role: 'Операционный директор', status: 'Работает', visit: '24/04/2026 08:50', reg: '10/01/2024 08:00', activityMs: 1776980000000, regMs: 1704850000000 },
  { id: 8, initials: 'ИН', name: 'Новикова Ирина Владимировна', email: 'i.novikova@osnova.uz', phone: '+998 91 890-12-34', branch: 'Фергана', dept: 'Логистика', div: 'Складской учет', role: 'Менеджер по логистике', status: 'Уволен', visit: '15/03/2026 14:10', reg: '22/09/2025 16:20', activityMs: 1773000000000, regMs: 1758500000000 },
  { id: 9, initials: 'РК', name: 'Каримов Рустам Маратович', email: 'r.karimov@osnova.uz', phone: '+998 93 901-23-45', branch: 'Самарканд', dept: 'Коммерческий департамент', div: 'Отдел продаж B2C', role: 'Старший менеджер', status: 'Работает', visit: null, reg: '18/06/2025 11:00', activityMs: 0, regMs: 1750200000000 },
  { id: 10, initials: 'СЛ', name: 'Лебедева Светлана Сергеевна', email: 's.lebedeva@osnova.uz', phone: '+998 94 012-34-56', branch: 'Ташкент (ГК)', dept: 'Продуктовая аналитика', div: 'Аналитика', role: 'Data Analyst', status: 'Работает', visit: '24/04/2026 10:15', reg: '30/10/2025 13:45', activityMs: 1776995000000, regMs: 1761800000000 },
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
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left pl-3.5 pr-9 py-2.5 bg-white border ${open ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-100)]' : 'border-neutral-200 hover:border-neutral-300'} rounded-xl text-[13px] text-neutral-800 font-medium transition-all flex items-center justify-between`}
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

export default function UsersPage() {
  const router = useRouter();
  
  // Load settings
  const [settings, setSettings] = useState<any>(null);
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

  const activePriorityFields = settings?.priorityFields || [
    { id: 'p_branch', label: 'Филиал' },
    { id: 'p_dept', label: 'Департамент' },
    { id: 'p_div', label: 'Отдел' },
    { id: 'p_role', label: 'Должность' },
    { id: 'p_status', label: 'Статус' }
  ];

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
  const [branchFilter, setBranchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [divFilter, setDivFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<'10' | '20' | '50' | 'all'>('10');
  
  // Sort state
  const [activitySort, setActivitySort] = useState<SortOrder>(null);
  const [regSort, setRegSort] = useState<SortOrder>(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleDownloadTemplate = () => {
    const getColumnLetter = (colIndex: number): string => {
      let letter = '';
      let temp = colIndex;
      while (temp >= 0) {
        letter = String.fromCharCode((temp % 26) + 65) + letter;
        temp = Math.floor(temp / 26) - 1;
      }
      return letter;
    };

    const headers = ['ФИО', 'Телефон', 'Email'];
    let birthDateColIdx = -1;
    let genderColIdx = -1;
    let regionColIdx = -1;

    if (settings?.birthDateEnabled ?? true) {
      headers.push('Дата рождения');
      birthDateColIdx = headers.length - 1;
    }
    if (settings?.genderEnabled ?? true) {
      headers.push('Пол');
      genderColIdx = headers.length - 1;
    }
    if (settings?.regionEnabled ?? false) {
      headers.push('Регион');
      regionColIdx = headers.length - 1;
    }

    const priorityFields = settings?.priorityFields || [
      { id: 'p_branch', label: 'Филиал' },
      { id: 'p_dept', label: 'Департамент' },
      { id: 'p_div', label: 'Отдел' },
      { id: 'p_role', label: 'Должность' },
      { id: 'p_status', label: 'Статус' }
    ];
    priorityFields.forEach((field: any) => {
      headers.push(field.label);
    });

    const secondaryFields = settings?.secondaryFields || [];
    const addedSecondaryFields: any[] = [];
    secondaryFields.forEach((field: any) => {
      if (!headers.includes(field.label)) {
        headers.push(field.label);
        addedSecondaryFields.push(field);
      }
    });

    const sampleRow: string[] = ['Смирнов Алексей Иванович', '+998901234567', 'a.smirnov@osnova.uz'];
    if (settings?.birthDateEnabled ?? true) {
      sampleRow.push('12/05/1990');
    }
    if (settings?.genderEnabled ?? true) {
      sampleRow.push('M');
    }
    if (settings?.regionEnabled ?? false) {
      sampleRow.push('Ташкент');
    }
    priorityFields.forEach((field: any) => {
      if (field.id === 'p_branch') sampleRow.push('Ташкент (ГК)');
      else if (field.id === 'p_dept') sampleRow.push('Коммерческий департамент');
      else if (field.id === 'p_div') sampleRow.push('Отдел продаж B2B');
      else if (field.id === 'p_role') sampleRow.push('Руководитель отдела');
      else if (field.id === 'p_status') sampleRow.push('Работает');
      else sampleRow.push('Значение');
    });
    addedSecondaryFields.forEach((field: any) => {
      if (field.label === 'Пол') sampleRow.push('M');
      else if (field.label === 'Возраст') sampleRow.push('36');
      else sampleRow.push('Значение');
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const validations: any[] = [];

    if (genderColIdx !== -1) {
      const colLetter = getColumnLetter(genderColIdx);
      validations.push({
        sqref: `${colLetter}2:${colLetter}1000`,
        type: 'list',
        formula1: '"M,F"'
      });
    }

    if (regionColIdx !== -1) {
      const colLetter = getColumnLetter(regionColIdx);
      validations.push({
        sqref: `${colLetter}2:${colLetter}1000`,
        type: 'list',
        formula1: '"Ташкент,Ташкентская область,Самаркандская область,Андижанская область,Бухарская область,Джизакская область,Кашкадарьинская область,Навоийская область,Наманганская область,Сурхандарьинская область,Сырдарьинская область,Ферганская область,Хорезмская область,Республика Каракалпакстан"'
      });
    }

    if (validations.length > 0) {
      ws['!dataValidation'] = validations;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Шаблон загрузки');
    XLSX.writeFile(wb, 'osnova_users_template.xlsx');
  };

  const handleExportToExcel = () => {
    const headers = ['ФИО', 'Телефон', 'Email'];
    if (settings?.birthDateEnabled ?? true) headers.push('Дата рождения');
    if (settings?.genderEnabled ?? true) headers.push('Пол');
    if (settings?.regionEnabled ?? false) headers.push('Регион');

    const priorityFields = settings?.priorityFields || [
      { id: 'p_branch', label: 'Филиал' },
      { id: 'p_dept', label: 'Департамент' },
      { id: 'p_div', label: 'Отдел' },
      { id: 'p_role', label: 'Должность' },
      { id: 'p_status', label: 'Статус' }
    ];
    priorityFields.forEach((field: any) => {
      headers.push(field.label);
    });

    const secondaryFields = settings?.secondaryFields || [];
    const addedSecondaryFields: any[] = [];
    secondaryFields.forEach((field: any) => {
      if (!headers.includes(field.label)) {
        headers.push(field.label);
        addedSecondaryFields.push(field);
      }
    });

    headers.push('Последний визит', 'Регистрация');

    const rows = filteredUsers.map(user => {
      const rowData: string[] = [
        getUserFullName(user.name),
        user.phone,
        user.email
      ];

      if (settings?.birthDateEnabled ?? true) {
        rowData.push((user as any).birthDate || '12/05/1990');
      }
      if (settings?.genderEnabled ?? true) {
        rowData.push((user as any).gender || 'M');
      }
      if (settings?.regionEnabled ?? false) {
        rowData.push((user as any).region || 'Ташкент');
      }

      priorityFields.forEach((field: any) => {
        if (field.id === 'p_branch') rowData.push(user.branch);
        else if (field.id === 'p_dept') rowData.push(user.dept);
        else if (field.id === 'p_div') rowData.push(user.div);
        else if (field.id === 'p_role') rowData.push(user.role);
        else if (field.id === 'p_status') rowData.push(user.status);
        else rowData.push('—');
      });

      addedSecondaryFields.forEach((field: any) => {
        if (field.label === 'Пол') rowData.push((user as any).gender || 'M');
        else if (field.label === 'Возраст') rowData.push('36');
        else rowData.push('—');
      });

      rowData.push(user.visit || '—', user.reg);
      return rowData;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Пользователи');
    XLSX.writeFile(wb, 'osnova_users.xlsx');
  };

  // Form dropdown states
  const [formGender, setFormGender] = useState("");
  const [formRole, setFormRole] = useState("Студент");
  const [formBranch, setFormBranch] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formDiv, setFormDiv] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formStatus, setFormStatus] = useState("Работает");

  // Helper for mapping priority custom fields to their state
  const getFilterState = (fieldId: string, idx: number) => {
    if (fieldId === 'p_branch') return { value: branchFilter, onChange: setBranchFilter, options: branches };
    if (fieldId === 'p_dept') return { value: deptFilter, onChange: setDeptFilter, options: depts };
    if (fieldId === 'p_div') return { value: divFilter, onChange: setDivFilter, options: divs };
    if (fieldId === 'p_role') return { value: roleFilter, onChange: setRoleFilter, options: roles };
    if (fieldId === 'p_status') return { value: statusFilter, onChange: setStatusFilter, options: statuses };
    
    const fallbacks = [
      { value: branchFilter, onChange: setBranchFilter, options: branches },
      { value: deptFilter, onChange: setDeptFilter, options: depts },
      { value: divFilter, onChange: setDivFilter, options: divs },
      { value: roleFilter, onChange: setRoleFilter, options: roles },
      { value: statusFilter, onChange: setStatusFilter, options: statuses }
    ];
    return fallbacks[idx % fallbacks.length];
  };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, branchFilter, deptFilter, divFilter, roleFilter, statusFilter, activitySort, regSort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, branchFilter, deptFilter, divFilter, roleFilter, statusFilter]);

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
        title="Пользователи" 
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <Upload className="w-4 h-4" /> Массовая загрузка
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Добавить пользователя
            </Button>
          </div>
        }
      />
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-6 lg:p-8 pb-16">
        
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
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, activePriorityFields.length)}, minmax(0, 1fr))`
              }}
            >
              {activePriorityFields.map((field: any, idx: number) => {
                const state = getFilterState(field.id, idx);
                return (
                  <CustomSelect 
                    key={field.id}
                    label={field.label} 
                    options={state.options} 
                    value={state.value} 
                    onChange={state.onChange} 
                  />
                );
              })}
            </div>

          </div>
        </div>

        {/* Data Table */}
        {(() => {
          const totalPriorityWidth = activePriorityFields.reduce((sum: number, _: any, idx: number) => {
            const widths = [12, 14, 12, 12, 8];
            return sum + widths[idx % widths.length];
          }, 0);

          return (
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap table-fixed" style={{ minWidth: '1100px' }}>
                  <thead className="bg-neutral-50/80 border-b border-neutral-100">
                    <tr>
                      <th style={{ width: '48px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center">№</th>
                      <th 
                        style={{ width: '28%' }}
                        className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate"
                      >
                        Пользователь
                      </th>
                      {activePriorityFields.map((field: any, idx: number) => {
                        const widths = [12, 14, 12, 12, 8];
                        const wVal = widths[idx % widths.length];
                        return (
                          <th key={field.id} style={{ width: `${wVal}%` }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                            {field.label}
                          </th>
                        );
                      })}
                      <th style={{ width: '130px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('activity')}>
                        <div className="flex items-center justify-end gap-1.5">
                          Посл. визит
                          {activitySort === 'desc' ? <ArrowDownAZ className="w-3.5 h-3.5 shrink-0" /> : 
                           activitySort === 'asc' ? <ArrowUpZA className="w-3.5 h-3.5 shrink-0" /> : 
                           <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-50 shrink-0" />}
                        </div>
                      </th>
                      <th style={{ width: '130px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors truncate" onClick={() => toggleSort('reg')}>
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
                        <td colSpan={4 + activePriorityFields.length} className="py-16 text-center text-neutral-400 text-[14px]">Пользователи не найдены</td>
                      </tr>
                    ) : (
                      pagedUsers.map((user, index) => {
                        const globalIdx = pageSize === 'all' ? (index + 1) : ((currentPage - 1) * Number(pageSize) + index + 1);
                        return (
                          <tr key={user.id} onClick={() => router.push(`/users/${user.id}`)} className="group border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors cursor-pointer">
                            <td className="px-3 py-3 text-center">
                              <span className="text-[11px] text-neutral-300 tabular-nums">
                                {String(globalIdx).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-3 py-3 overflow-hidden">
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
                            {activePriorityFields.map((field: any, idx: number) => {
                              const keys = ['branch', 'dept', 'div', 'role', 'status'] as const;
                              const key = keys[idx % keys.length];
                              const val = (user as any)[key] || '';
                              return (
                                <td key={field.id} className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={val} className="text-[12px] font-medium text-neutral-850" />
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 truncate text-right">
                              {renderDateTime(user.visit)}
                            </td>
                            <td className="px-3 py-3 truncate text-right">
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

      {/* Mass Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Массовая загрузка</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  Загрузите список пользователей из Excel-файла.
                </p>
                <button 
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-admin-primary-500)] hover:underline self-start mt-1"
                >
                  <Download className="w-4 h-4" /> Скачать шаблон
                </button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group relative ${isDragging ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-500)]/5' : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-[var(--color-admin-primary-400)]'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-medium text-neutral-900 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[13px] text-neutral-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-6 h-6 text-neutral-400 group-hover:text-[var(--color-admin-primary-500)] transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-medium text-neutral-900 pointer-events-none">
                        Перетащите файл сюда
                      </p>
                      <p className="text-[13px] text-neutral-500 mt-1 pointer-events-none">
                        или нажмите для выбора файла на устройстве
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                Отмена
              </Button>
              <Button variant="primary" disabled={!selectedFile}>
                Загрузить файл
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Добавить пользователя</h2>
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form className="flex flex-col gap-10">
                
                {/* Personal Information */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-neutral-900">Персональная информация</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Имя <span className="text-rose-500">*</span></label>
                      <input type="text" className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Фамилия <span className="text-rose-500">*</span></label>
                      <input type="text" className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" />
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

                {/* Additional Data */}
                <div className="flex flex-col gap-5 pt-2 border-t border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900">Дополнительные данные</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Роль <span className="text-rose-500">*</span></label>
                      <FormSelect 
                        label="Роль" 
                        placeholder="" 
                        options={["Студент", "Куратор", "Гость"]} 
                        value={formRole} 
                        onChange={setFormRole}
                        showSearch={false}
                      />
                    </div>

                    {activePriorityFields.map((field: any, idx: number) => {
                      const state = getFilterState(field.id, idx);
                      const formValues = [
                        { value: formBranch, onChange: setFormBranch },
                        { value: formDept, onChange: setFormDept },
                        { value: formDiv, onChange: setFormDiv },
                        { value: formPosition, onChange: setFormPosition },
                        { value: formStatus, onChange: setFormStatus }
                      ];
                      const formState = formValues[idx % formValues.length];
                      return (
                        <div key={field.id} className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-neutral-700">{field.label}</label>
                          <FormSelect 
                            label={field.label} 
                            placeholder={field.label} 
                            options={state.options} 
                            value={formState.value} 
                            onChange={formState.onChange} 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Auth Data */}
                <div className="flex flex-col gap-5 pt-2 border-t border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900">Данные для авторизации</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Номер телефона <span className="text-rose-500">*</span></label>
                      <input type="tel" className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" placeholder="+998" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Почта</label>
                      <input type="email" className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" placeholder="example@ex.com" />
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

              </form>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
              <Button variant="ghost" onClick={() => setIsAddUserModalOpen(false)}>
                Отмена
              </Button>
              <Button variant="primary" className="px-8 bg-black hover:bg-neutral-800 text-white rounded-xl">
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
