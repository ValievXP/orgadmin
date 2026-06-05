"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  User as UserIcon,
  MapPin,
  Check,
  X,
  Edit3,
  BookOpen,
  Users as UsersIcon,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckSquare,
  Square,
  Folder,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

const branchesList = ['Ташкент (ГК)', 'Самарканд', 'Бухара', 'Фергана'];
const deptsList = ['Коммерческий департамент', 'Маркетинг', 'Служба поддержки', 'HR', 'IT', 'Финансы', 'Руководство', 'Продуктовая аналитика'];
const divsList = ['Отдел продаж B2B', 'PR и коммуникации', 'Первая линия', 'Подбор персонала', 'Разработка ПО', 'Бухгалтерия', 'Совет директоров', 'Отдел продаж B2C', 'Аналитика'];
const statusesList = ['Работает', 'Отпуск', 'Уволен'];

const mockTeamMembers = [
  { id: 1, initials: 'АС', name: 'Смирнов Алексей Иванович', email: 'a.smirnov@osnova.uz', phone: '+998 90 123-45-67', branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Руководитель отдела', status: 'Работает', visit: '24/04/2026 10:30', reg: '15/01/2025 09:00', activityMs: 1777000000000, regMs: 1736920000000, sysRole: 'Администратор', birthDate: '12/05/1990', gender: 'Мужской', region: 'Ташкент' },
  { id: 2, initials: 'МВ', name: 'Волкова Мария Сергеевна', email: 'm.volkova@osnova.uz', phone: '+998 91 234-56-78', branch: 'Ташкент (ГК)', dept: 'Маркетинг', div: 'PR и коммуникации', role: 'PR-менеджер', status: 'Работает', visit: '24/04/2026 09:15', reg: '03/03/2025 11:20', activityMs: 1776990000000, regMs: 1740980000000, sysRole: 'Куратор', birthDate: '18/09/1994', gender: 'Женский', region: 'Ташкент' },
  { id: 3, initials: 'ДТ', name: 'Тарасов Дмитрий Андреевич', email: 'd.tarasov@osnova.uz', phone: '+998 93 345-67-89', branch: 'Самарканд', dept: 'Служба поддержки', div: 'Первая линия', role: 'Специалист поддержки', status: 'Отпуск', visit: '20/04/2026 18:00', reg: '10/02/2025 15:45', activityMs: 1776600000000, regMs: 1739150000000, sysRole: 'Куратор', birthDate: '24/11/1992', gender: 'Мужской', region: 'Самарканд' },
  { id: 4, initials: 'ЕК', name: 'Кузнецова Елена Александровна', email: 'e.kuznecova@osnova.uz', phone: '+998 94 456-78-90', branch: 'Ташкент (ГК)', dept: 'HR', div: 'Подбор персонала', role: 'HR Бизнес-партнер', status: 'Работает', visit: '24/04/2026 11:45', reg: '01/08/2024 10:10', activityMs: 1777010000000, regMs: 1722480000000, sysRole: 'Куратор', birthDate: '05/02/1988', gender: 'Женский', region: 'Ташкент' },
  { id: 5, initials: 'ТИ', name: 'Ибрагимов Тимур Бахтиярович', email: 't.ibragimov@osnova.uz', phone: '+998 99 567-89-01', branch: 'Бухара', dept: 'IT', div: 'Разработка ПО', role: 'Frontend Разработчик', status: 'Работает', visit: '24/04/2026 12:20', reg: '12/11/2025 09:30', activityMs: 1777050000000, regMs: 1762950000000, sysRole: 'Куратор', birthDate: '15/07/1996', gender: 'Мужской', region: 'Бухара' },
  { id: 6, initials: 'ОС', name: 'Сидорова Ольга Петровна', email: 'o.sidorova@osnova.uz', phone: '+998 97 678-90-12', branch: 'Ташкент (ГК)', dept: 'Финансы', div: 'Бухгалтерия', role: 'Главный бухгалтер', status: 'Работает', visit: '23/04/2026 17:30', reg: '05/05/2024 14:15', activityMs: 1776900000000, regMs: 1714870000000, sysRole: 'Куратор', birthDate: '30/10/1985', gender: 'Женский', region: 'Ташкент' },
  { id: 7, initials: 'АМ', name: 'Махмудов Алишер Рустамович', email: 'a.mahmudov@osnova.uz', phone: '+998 90 789-01-23', branch: 'Ташкент (ГК)', dept: 'Руководство', div: 'Совет директоров', role: 'Операционный директор', status: 'Работает', visit: '24/04/2026 08:50', reg: '10/01/2024 08:00', activityMs: 1776980000000, regMs: 1704850000000, sysRole: 'Администратор', birthDate: '01/03/1982', gender: 'Мужской', region: 'Ташкент' },
];

const mockAvailableCourses = [
  { id: 1, title: 'B2B Продажи: Продвинутый уровень', code: 'B2B-PRO', folder: null },
  { id: 2, title: 'Управление командой и лидерство', code: 'MNG-LEAD', folder: null },
  { id: 3, title: 'Основы корпоративной безопасности', code: 'SEC-CORP', folder: null },
  { id: 4, title: 'Эффективные переговоры в бизнесе', code: 'NEG-BIZ', folder: null },
  { id: 5, title: 'Маркетинг в социальных сетях (SMM)', code: 'MKT-SMM', folder: null },
  { id: 6, title: 'Введение в управление проектами', code: 'PRJ-AGILE', folder: null },
  { id: 7, title: 'Welcome Day: Знакомство с компанией', code: 'ONB-WELCOME', folder: 'IT & Security Core', parentFolder: 'Onboarding 2026' },
  { id: 8, title: 'Дизайн-системы в Figma', code: 'DS-FIGMA', folder: null },
  { id: 9, title: 'Английский язык (Средний уровень)', code: 'ENG-MID', folder: null },
];

const mockAvailableStudents = [
  { id: 101, name: 'Иван Сергеев', email: 'ivan@example.com', phone: '+998 90 123 45 67', initials: 'ИС', branch: 'Ташкент (ГК)', dept: 'Коммерческий департамент', div: 'Отдел продаж B2B', role: 'Менеджер B2B', status: 'Работает', visit: '24/04/2026 10:30', reg: '15/01/2025 09:00', city: 'Москва', institution: 'Школа №1' },
  { id: 102, name: 'Мария Власова', email: 'maria@example.com', phone: '+998 90 234 56 78', initials: 'МВ', branch: 'Ташкент (ГК)', dept: 'Маркетинг', div: 'PR и коммуникации', role: 'PR-специалист', status: 'Работает', visit: '24/04/2026 09:15', reg: '03/03/2025 11:20', city: 'Санкт-Петербург', institution: 'Лицей №2' },
  { id: 103, name: 'Петр Николаев', email: 'petr@example.com', phone: '+998 90 345 67 89', initials: 'ПН', branch: 'Самарканд', dept: 'Служба поддержки', div: 'Первая линия', role: 'Специалист поддержки', status: 'Отпуск', visit: '20/04/2026 18:00', reg: '10/02/2025 15:45', city: 'Москва', institution: 'Школа №1' },
  { id: 104, name: 'Анна Смирнова', email: 'anna@example.com', phone: '+998 90 444 55 66', initials: 'АС', branch: 'Ташкент (ГК)', dept: 'HR', div: 'Подбор персонала', role: 'HR Рекрутер', status: 'Работает', visit: '24/04/2026 11:45', reg: '01/08/2024 10:10', city: 'Казань', institution: 'ТАТУ' },
  { id: 105, name: 'Дмитрий Каримов', email: 'd.karimov@example.com', phone: '+998 90 555 66 77', initials: 'ДК', branch: 'Бухара', dept: 'IT', div: 'Разработка ПО', role: 'Backend Dev', status: 'Работает', visit: '24/04/2026 12:20', reg: '12/11/2025 09:30', city: 'Ташкент', institution: 'Вестминстерский университет' },
  { id: 106, name: 'Гульнора Абдуллаева', email: 'g.abdullaeva@example.com', phone: '+998 90 777 88 99', initials: 'ГА', branch: 'Самарканд', dept: 'Логистика', div: 'Складской учет', role: 'Менеджер', status: 'Работает', visit: '23/04/2026 17:30', reg: '05/05/2024 14:15', city: 'Самарканд', institution: 'Вестминстерский университет' },
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

function CustomSelectFilter({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
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
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full text-left pl-3.5 pr-9 py-2 bg-neutral-50/50 border ${open ? 'border-[var(--color-admin-primary-500)] ring-2 ring-[var(--color-admin-primary-100)]' : 'border-neutral-200 hover:border-neutral-300'} rounded-xl text-[13px] text-neutral-800 font-medium transition-all flex items-center justify-between h-[42px]`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-neutral-200 shadow-xl rounded-xl py-1.5 z-[150] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[300px]">
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
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors font-medium"
              >
                <span>{label} (Все)</span>
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

function FormSelect({ label, placeholder, options, value, onChange, showSearch = true }: { label: string, placeholder: string, options: string[], value: string, onChange: (val: string) => void, showSearch?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
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

export default function TeamMemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const idStr = params.id as string;
  const memberId = parseInt(idStr) || 1;

  const [activeTab, setActiveTab] = useState<'courses' | 'students'>('courses');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab');
      if (tab === 'students') {
        setActiveTab('students');
      }
    }
  }, []);

  const handleTabChange = (tab: 'courses' | 'students') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };
  
  // Layout Shift state: profile collapsed by default into miniature card
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for student tab table filtering and searching
  const [tabStudentSearch, setTabStudentSearch] = useState("");
  const [tabBranchFilter, setTabBranchFilter] = useState("");
  const [tabDeptFilter, setTabDeptFilter] = useState("");
  const [tabDivFilter, setTabDivFilter] = useState("");
  const [tabPositionFilter, setTabPositionFilter] = useState("");
  const [tabStatusFilter, setTabStatusFilter] = useState("");

  // Load member details
  const [member, setMember] = useState<any>(() => {
    const found = mockTeamMembers.find(m => m.id === memberId);
    return found || mockTeamMembers[0];
  });

  // Edit States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSurname, setFormSurname] = useState("");
  const [formPatronymic, setFormPatronymic] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("Куратор");
  const [formBranch, setFormBranch] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formDiv, setFormDiv] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");

  useEffect(() => {
    if (member) {
      const parts = member.name.split(' ');
      setFormSurname(parts[0] || "");
      setFormName(parts[1] || "");
      setFormPatronymic(parts[2] || "");
      setFormRegion(member.region || "Ташкент");
      setFormBirthDate(member.birthDate || "12/05/1990");
      setFormGender(member.gender || "Мужской");
      setFormPhone(member.phone);
      setFormEmail(member.email);
      setFormRole(member.sysRole);
      setFormBranch(member.branch || "Ташкент (ГК)");
      setFormDept(member.dept || "Маркетинг");
      setFormDiv(member.div || "PR и коммуникации");
      setFormPosition(member.role || "PR-менеджер");
      setFormStatus(member.status || "Работает");
      setFormPassword("");
      setFormConfirmPassword("");
    }
  }, [member]);

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSurname.trim() || !formPhone.trim()) {
      alert("Пожалуйста, заполните обязательные поля.");
      return;
    }
    if (formPassword !== formConfirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }
    const fullName = `${formSurname} ${formName} ${formPatronymic}`.trim();
    const initials = `${formSurname.charAt(0)}${formName.charAt(0)}`.toUpperCase();

    setMember((prev: any) => ({
      ...prev,
      name: fullName,
      initials,
      phone: formPhone,
      email: formEmail,
      region: formRegion,
      birthDate: formBirthDate,
      gender: formGender,
      sysRole: formRole,
      branch: formBranch,
      dept: formDept,
      div: formDiv,
      role: formPosition,
      status: formStatus
    }));
    setIsEditModalOpen(false);
    showToast("Профиль успешно обновлен");
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    showToast("Сотрудник успешно удален");
    router.push('/team');
  };

  // Assigned courses and students lists
  const [assignedCourses, setAssignedCourses] = useState<any[]>([
    { ...mockAvailableCourses[0], date: '15.03.2026 10:00' },
    { ...mockAvailableCourses[1], date: '15.03.2026 10:00' }
  ]);

  const [assignedStudents, setAssignedStudents] = useState<any[]>([
    mockAvailableStudents[0],
    mockAvailableStudents[1],
    mockAvailableStudents[2]
  ]);

  // Modals for assignments
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Search inside modals
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  
  // Student modal drop down filters (dynamic from settings)
  const [modalBranchFilter, setModalBranchFilter] = useState("");
  const [modalDeptFilter, setModalDeptFilter] = useState("");
  const [modalDivFilter, setModalDivFilter] = useState("");
  const [modalRoleFilter, setModalRoleFilter] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("");
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

  const activePriorityFields = useMemo(() => {
    return settings?.priorityFields || [
      { id: 'p_branch', label: 'Филиал' },
      { id: 'p_dept', label: 'Департамент' },
      { id: 'p_div', label: 'Отдел' },
      { id: 'p_role', label: 'Должность' },
      { id: 'p_status', label: 'Статус' }
    ];
  }, [settings]);

  const modalBranches = useMemo(() => Array.from(new Set(mockAvailableStudents.map(u => u.branch))), []);
  const modalDepts = useMemo(() => Array.from(new Set(mockAvailableStudents.map(u => u.dept))), []);
  const modalDivs = useMemo(() => Array.from(new Set(mockAvailableStudents.map(u => u.div))), []);
  const modalRoles = useMemo(() => Array.from(new Set(mockAvailableStudents.map(u => u.role))), []);
  const modalStatuses = useMemo(() => Array.from(new Set(mockAvailableStudents.map(u => u.status))), []);

  const getModalFilterState = (fieldId: string, idx: number) => {
    const fallbacks = [
      { value: modalBranchFilter, onChange: setModalBranchFilter, options: modalBranches },
      { value: modalDeptFilter, onChange: setModalDeptFilter, options: modalDepts },
      { value: modalDivFilter, onChange: setModalDivFilter, options: modalDivs },
      { value: modalRoleFilter, onChange: setModalRoleFilter, options: modalRoles },
      { value: modalStatusFilter, onChange: setModalStatusFilter, options: modalStatuses }
    ];
    return fallbacks[idx % fallbacks.length];
  };

  // Temp selections
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Folder Expansion states in course modal
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Onboarding 2026', 'IT & Security Core']);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) ? prev.filter(f => f !== folderName) : [...prev, folderName]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCourseModal = () => {
    setSelectedCourses(assignedCourses.map(c => c.id));
    setCourseSearch("");
    setIsCourseModalOpen(true);
  };

  const handleOpenStudentModal = () => {
    setSelectedStudents(assignedStudents.map(s => s.id));
    setStudentSearch("");
    setModalBranchFilter("");
    setModalDeptFilter("");
    setModalDivFilter("");
    setModalRoleFilter("");
    setModalStatusFilter("");
    setIsStudentModalOpen(true);
  };

  const handleSaveCourses = () => {
    const nextCourses = mockAvailableCourses.filter(c => selectedCourses.includes(c.id)).map(c => {
      const existing = assignedCourses.find(ac => ac.id === c.id);
      return {
        ...c,
        date: existing?.date || new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
    });
    setAssignedCourses(nextCourses);
    setIsCourseModalOpen(false);
    showToast("Курсы успешно назначены куратору");
  };

  const handleSaveStudents = () => {
    const nextStudents = mockAvailableStudents.filter(s => selectedStudents.includes(s.id));
    setAssignedStudents(nextStudents);
    setIsStudentModalOpen(false);
    showToast("Студенты успешно назначены куратору");
  };

  const toggleCourseSelect = (id: number) => {
    setSelectedCourses(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const toggleStudentSelect = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  // States for confirmation of unassigning
  const [unassignCourseId, setUnassignCourseId] = useState<number | null>(null);
  const [unassignStudentId, setUnassignStudentId] = useState<number | null>(null);

  const handleUnassignCourse = (id: number) => {
    setUnassignCourseId(id);
  };

  const handleUnassignStudent = (id: number) => {
    setUnassignStudentId(id);
  };

  const confirmUnassignCourse = () => {
    if (unassignCourseId !== null) {
      setAssignedCourses(prev => prev.filter(c => c.id !== unassignCourseId));
      setUnassignCourseId(null);
      showToast("Курс успешно откреплен");
    }
  };

  const confirmUnassignStudent = () => {
    if (unassignStudentId !== null) {
      setAssignedStudents(prev => prev.filter(s => s.id !== unassignStudentId));
      setUnassignStudentId(null);
      showToast("Студент успешно откреплен");
    }
  };

  // Filtered available courses for selection
  const filteredAvailableCourses = useMemo(() => {
    return mockAvailableCourses.filter(c => 
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
      c.code.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courseSearch]);

  // Filtered students for assignment selection modal
  const filteredAvailableStudents = useMemo(() => {
    return mockAvailableStudents.filter(s => {
      const q = studentSearch.toLowerCase();
      const matchSearch = !q || 
                          s.name.toLowerCase().includes(q) || 
                          s.email.toLowerCase().includes(q) || 
                          s.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      
      const matchBranch = !modalBranchFilter || s.branch === modalBranchFilter;
      const matchDept = !modalDeptFilter || s.dept === modalDeptFilter;
      const matchDiv = !modalDivFilter || s.div === modalDivFilter;
      const matchRole = !modalRoleFilter || s.role === modalRoleFilter;
      const matchStatus = !modalStatusFilter || s.status === modalStatusFilter;
      
      return matchSearch && matchBranch && matchDept && matchDiv && matchRole && matchStatus;
    });
  }, [studentSearch, modalBranchFilter, modalDeptFilter, modalDivFilter, modalRoleFilter, modalStatusFilter]);

  // Filtered students list displayed inside the "Students" tab of this profile page
  const filteredTabStudents = useMemo(() => {
    return assignedStudents.filter(student => {
      const q = tabStudentSearch.toLowerCase();
      const matchesSearch = !q || 
        student.name.toLowerCase().includes(q) || 
        student.email.toLowerCase().includes(q) || 
        student.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      
      const matchesBranch = !tabBranchFilter || student.branch === tabBranchFilter;
      const matchesDept = !tabDeptFilter || student.dept === tabDeptFilter;
      const matchesDiv = !tabDivFilter || student.div === tabDivFilter;
      const matchesPosition = !tabPositionFilter || student.role === tabPositionFilter;
      const matchesStatus = !tabStatusFilter || student.status === tabStatusFilter;
      
      return matchesSearch && matchesBranch && matchesDept && matchesDiv && matchesPosition && matchesStatus;
    });
  }, [assignedStudents, tabStudentSearch, tabBranchFilter, tabDeptFilter, tabDivFilter, tabPositionFilter, tabStatusFilter]);

  const [tabStudentPageSize, setTabStudentPageSize] = useState<'10' | '20' | '50' | 'all'>('10');
  const [tabStudentCurrentPage, setTabStudentCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setTabStudentCurrentPage(1);
  }, [tabStudentSearch, tabBranchFilter, tabDeptFilter, tabDivFilter, tabPositionFilter, tabStatusFilter]);

  const totalPages = useMemo(() => {
    if (tabStudentPageSize === 'all') return 1;
    return Math.ceil(filteredTabStudents.length / Number(tabStudentPageSize));
  }, [filteredTabStudents.length, tabStudentPageSize]);

  const pagedTabStudents = useMemo(() => {
    if (tabStudentPageSize === 'all') return filteredTabStudents;
    const start = (tabStudentCurrentPage - 1) * Number(tabStudentPageSize);
    return filteredTabStudents.slice(start, start + Number(tabStudentPageSize));
  }, [filteredTabStudents, tabStudentCurrentPage, tabStudentPageSize]);

  const handleTabStudentsExportToExcel = () => {
    const headers = [
      '№',
      'ФИО',
      'Email',
      'Телефон',
      'Филиал',
      'Департамент',
      'Отдел',
      'Должность',
      'Статус',
      'Последний визит',
      'Дата регистрации'
    ];

    const rows = filteredTabStudents.map((student, idx) => {
      return [
        idx + 1,
        student.name,
        student.email,
        student.phone,
        student.branch || '—',
        student.dept || '—',
        student.div || '—',
        student.role || '—',
        student.status || '—',
        student.visit || '—',
        student.reg
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Студенты');
    XLSX.writeFile(wb, `students_curator_${member.name}.xlsx`);
  };

  // Form dropdown validation options
  const formRoles = ["Куратор", "Руководитель"];

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] pb-0 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[200] bg-neutral-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          {toastMessage}
        </div>
      )}

      {/* Sticky Profile Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 lg:px-8 py-4 max-w-[1800px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-neutral-900 leading-tight">Профиль сотрудника</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button onClick={() => setIsEditModalOpen(true)} variant="primary" className="flex items-center gap-2 font-medium shadow-sm h-9">
              <Edit3 className="w-4 h-4" /> Редактировать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-6 lg:px-8 mt-6 pb-16">
        
        {/* Dynamic Statistic Cards Grid */}
        <div className={`grid gap-4 mb-6 items-stretch ${isProfileExpanded ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          
          {/* Card 1: Miniature Profile Card (Only shown when collapsed) */}
          {!isProfileExpanded && (
            <div 
              onClick={() => setIsProfileExpanded(true)}
              className="bg-white border border-neutral-200 hover:border-neutral-300 transition-all rounded-xl p-4 flex items-center gap-3.5 shadow-sm cursor-pointer relative group"
            >
              <div className="w-11 h-11 rounded-full bg-[var(--color-admin-primary-100)] flex items-center justify-center font-bold text-neutral-800 text-sm shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {member.initials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-neutral-900 truncate leading-snug">{member.name}</span>
                <span className="text-[11px] text-neutral-500 truncate mt-0.5">{member.email}</span>
                <span className="text-[11px] text-neutral-400 truncate">{member.phone}</span>
              </div>
              <div className="text-neutral-400 group-hover:text-neutral-600 transition-colors ml-1 shrink-0">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Card 2: Назначено курсов */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-center gap-1 shadow-sm">
            <span className="text-[20px] font-bold text-neutral-900 leading-none">{assignedCourses.length}</span>
            <span className="text-[12px] text-neutral-500 font-medium mt-1">Назначено курсов</span>
          </div>

          {/* Card 3: Назначено студентов */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-center gap-1 shadow-sm">
            <span className="text-[20px] font-bold text-neutral-900 leading-none">{assignedStudents.length}</span>
            <span className="text-[12px] text-neutral-500 font-medium mt-1">Назначено студентов</span>
          </div>

          {/* Card 4: Проверено работ */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-center gap-1 shadow-sm">
            <span className="text-[20px] font-bold text-neutral-900 leading-none">124</span>
            <span className="text-[12px] text-neutral-500 font-medium mt-1">Проверено работ</span>
          </div>
        </div>

        {/* Bottom Area: Conditional Grid layout based on Profile Expansion */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Expanded Sidebar (Only visible when isProfileExpanded is true) */}
          {isProfileExpanded && (
            <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6 animate-in slide-in-from-left-4 fade-in duration-200">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                
                {/* Profile Header inside Sidebar (Centered, like on the User Profile page) */}
                <div className="flex flex-col items-center text-center border-b border-neutral-100 pb-6 mb-6 w-full">
                  <div className="w-24 h-24 rounded-full bg-neutral-100 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-neutral-700 mb-4 shrink-0">
                    {member.initials}
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2 leading-tight">{member.name}</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Телефон</span>
                      <MarqueeText text={member.phone} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Email</span>
                      <MarqueeText text={member.email} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Роль</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                          {member.sysRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Дата рождения</span>
                      <MarqueeText text={member.birthDate} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Пол</span>
                      <MarqueeText text={member.gender} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Регион</span>
                      <MarqueeText text={member.region} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>
                </div>

                {isSidebarExpanded && (
                  <div className="animate-in fade-in duration-300">
                    <div className="h-px bg-neutral-100 my-6" />
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Приоритетные поля</h4>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Филиал</span>
                        <MarqueeText text={member.branch} className="text-[14px] text-neutral-900" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Департамент</span>
                        <MarqueeText text={member.dept} className="text-[14px] text-neutral-900" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Отдел</span>
                        <MarqueeText text={member.div} className="text-[14px] text-neutral-900" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Должность</span>
                        <MarqueeText text={member.role} className="text-[14px] text-neutral-900" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Статус</span>
                        <MarqueeText text={member.status} className="text-[14px] text-neutral-900" />
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Дополнительная информация</h4>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Пол</span>
                        <MarqueeText text={member.gender} className="text-[14px] text-neutral-900" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] text-neutral-500 font-medium">Возраст</span>
                        <MarqueeText 
                          text={
                            member.birthDate 
                              ? (() => {
                                  const parts = member.birthDate.split('/');
                                  if (parts.length < 3) return '—';
                                  const year = parseInt(parts[2]);
                                  if (isNaN(year)) return '—';
                                  const age = 2026 - year;
                                  const lastDigit = age % 10;
                                  const lastTwoDigits = age % 100;
                                  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${age} лет`;
                                  if (lastDigit === 1) return `${age} год`;
                                  if (lastDigit >= 2 && lastDigit <= 4) return `${age} года`;
                                  return `${age} лет`;
                                })()
                              : '—'
                          } 
                          className="text-[14px] text-neutral-900" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 mt-6">
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="w-full py-2.5 px-4 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[40px]"
                  >
                    {isSidebarExpanded ? 'Свернуть' : 'Развернуть данные'}
                  </button>
                  <button 
                    onClick={() => setIsProfileExpanded(false)}
                    className="w-full py-2.5 px-4 border border-neutral-100 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[40px]"
                  >
                    Свернуть в миниатюру
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Tab View (Takes 100% width if profile is collapsed) */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
            
            {/* Tab Selection */}
            <div className="flex items-end justify-between border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleTabChange('courses')}
                  className={`px-4 py-3 text-[14px] font-semibold transition-all border-b-2 ${
                    activeTab === 'courses' 
                      ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  Курсы
                </button>
                <button 
                  onClick={() => handleTabChange('students')}
                  className={`px-4 py-3 text-[14px] font-semibold transition-all border-b-2 ${
                    activeTab === 'students' 
                      ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  Студенты
                </button>
              </div>
              
              <div className="pb-2">
                {activeTab === 'courses' ? (
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold" onClick={handleOpenCourseModal}>
                    Назначить курс
                  </Button>
                ) : (
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold" onClick={handleOpenStudentModal}>
                    Назначить студентов
                  </Button>
                )}
              </div>
            </div>

            {/* Tab: Courses List */}
            {activeTab === 'courses' && (
              <div className="flex flex-col gap-4">
                {assignedCourses.length === 0 ? (
                  <div className="py-12 bg-white border border-neutral-200 rounded-2xl text-center text-neutral-400">
                    <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <span>Нет назначенных курсов под ответственностью этого куратора</span>
                  </div>
                ) : (
                  assignedCourses.map(course => (
                    <div key={course.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 transition-all flex items-center justify-between gap-5 group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6 text-violet-600" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-[15px] font-bold text-neutral-900 truncate mb-1">{course.title}</h4>
                          <span className="text-[13px] text-neutral-400 font-medium">Назначен: {course.date || '15.03.2026 10:00'}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleUnassignCourse(course.id)} 
                        className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 h-9 w-9 p-0 rounded-lg opacity-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
                        title="Открепить курс"
                      >
                        <Trash2 className="w-5 h-5 shrink-0" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Students List (Full Users view layout columns) */}
            {activeTab === 'students' && (
              <div className="flex flex-col gap-4">
                
                {/* Search & Filters Toolbar */}
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400" />
                      <input 
                        type="text" 
                        placeholder="Найти пользователя по ФИО, номеру телефона или почте..." 
                        value={tabStudentSearch}
                        onChange={(e) => setTabStudentSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <CustomSelectFilter 
                        label="Филиал" 
                        options={branchesList} 
                        value={tabBranchFilter} 
                        onChange={setTabBranchFilter} 
                      />
                      <CustomSelectFilter 
                        label="Департамент" 
                        options={deptsList} 
                        value={tabDeptFilter} 
                        onChange={setTabDeptFilter} 
                      />
                      <CustomSelectFilter 
                        label="Отдел" 
                        options={divsList} 
                        value={tabDivFilter} 
                        onChange={setTabDivFilter} 
                      />
                      <CustomSelectFilter 
                        label="Должность" 
                        options={['Руководитель отдела', 'Специалист', 'Менеджер', 'PR-менеджер', 'Frontend Разработчик', 'Главный бухгалтер']} 
                        value={tabPositionFilter} 
                        onChange={setTabPositionFilter} 
                      />
                      <CustomSelectFilter 
                        label="Статус" 
                        options={statusesList} 
                        value={tabStatusFilter} 
                        onChange={setTabStatusFilter} 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
                  <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap table-fixed" style={{ minWidth: '950px' }}>
                      <thead className="bg-neutral-50/80 border-b border-neutral-100">
                        <tr>
                          <th style={{ width: '40px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center">№</th>
                          <th style={{ width: '20%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Пользователь</th>
                          <th style={{ width: '12%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Филиал</th>
                          <th style={{ width: '12%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Департамент</th>
                          <th style={{ width: '12%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Отдел</th>
                          <th style={{ width: '12%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Должность</th>
                          <th style={{ width: '8%' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Статус</th>
                          <th style={{ width: '100px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate text-right">Посл. визит</th>
                          <th style={{ width: '100px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate text-right">Регистрация</th>
                          <th style={{ width: '60px' }} className="px-3 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {pagedTabStudents.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-16 text-center text-neutral-400 text-sm">Студенты не найдены</td>
                          </tr>
                        ) : (
                          pagedTabStudents.map((student, index) => {
                            const globalIdx = tabStudentPageSize === 'all' ? (index + 1) : ((tabStudentCurrentPage - 1) * Number(tabStudentPageSize) + index + 1);
                            return (
                              <tr key={student.id} onClick={() => router.push(`/users/${student.id}`)} className="group border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors cursor-pointer">
                                <td className="px-3 py-3 text-center">
                                  <span className="text-[11px] text-neutral-300 tabular-nums">
                                    {String(globalIdx).padStart(2, '0')}
                                  </span>
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
                                      {student.initials}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <MarqueeText text={student.name} className="font-semibold text-neutral-800 text-[13px]" />
                                      <MarqueeText text={student.email} className="text-[11px] text-neutral-400 font-medium" />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={student.branch} className="text-[12px] font-medium text-neutral-800" />
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={student.dept} className="text-[12px] font-medium text-neutral-800" />
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={student.div} className="text-[12px] font-medium text-neutral-800" />
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={student.role} className="text-[12px] font-medium text-neutral-800" />
                                </td>
                                <td className="px-3 py-3 overflow-hidden">
                                  <MarqueeText text={student.status} className="text-[12px] font-medium text-neutral-800" />
                                </td>
                                <td className="px-3 py-3 truncate text-right">
                                  {renderDateTime(student.visit)}
                                </td>
                                <td className="px-3 py-3 truncate text-right">
                                  {renderDateTime(student.reg)}
                                </td>
                                <td className="px-1 py-3 text-center" onClick={e => e.stopPropagation()}>
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => handleUnassignStudent(student.id)} 
                                    className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 h-9 w-9 p-0 rounded-lg opacity-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                    title="Открепить студента"
                                  >
                                    <Trash2 className="w-5 h-5 shrink-0" />
                                  </Button>
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
                          value={tabStudentPageSize}
                          onChange={(e) => {
                            setTabStudentPageSize(e.target.value as any);
                            setTabStudentCurrentPage(1);
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
                        Показано <span className="text-neutral-700 font-bold">{filteredTabStudents.length === 0 ? 0 : (tabStudentCurrentPage - 1) * (tabStudentPageSize === 'all' ? filteredTabStudents.length : Number(tabStudentPageSize)) + 1}–{tabStudentPageSize === 'all' ? filteredTabStudents.length : Math.min(tabStudentCurrentPage * Number(tabStudentPageSize), filteredTabStudents.length)}</span> из <span className="text-neutral-700 font-bold">{filteredTabStudents.length}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto sm:ml-auto">
                      {tabStudentPageSize !== 'all' && totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setTabStudentCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={tabStudentCurrentPage === 1}
                            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-colors shadow-sm cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            const isActive = page === tabStudentCurrentPage;
                            return (
                              <button
                                key={page}
                                onClick={() => setTabStudentCurrentPage(page)}
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
                            onClick={() => setTabStudentCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={tabStudentCurrentPage === totalPages}
                            className="w-8 h-8 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-colors shadow-sm cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        onClick={handleTabStudentsExportToExcel}
                        className="flex items-center gap-2 font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 h-9 rounded-xl shadow-sm text-xs shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Скачать Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Edit Team Member */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Редактировать сотрудника</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleEditSave} className="flex flex-col gap-10">
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Отчество</label>
                      <input 
                        type="text" 
                        placeholder="Отчество"
                        value={formPatronymic}
                        onChange={(e) => setFormPatronymic(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Регион</label>
                      <input 
                        type="text" 
                        placeholder="Регион проживания / работы"
                        value={formRegion}
                        onChange={(e) => setFormRegion(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-neutral-700">Дата рождения</label>
                        <input 
                          type="text" 
                          placeholder="ДД/ММ/ГГГГ"
                          value={formBirthDate}
                          onChange={(e) => setFormBirthDate(e.target.value)}
                          className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                        />
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
                        options={["Куратор", "Руководитель"]} 
                        value={formRole} 
                        onChange={setFormRole}
                        showSearch={false}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Филиал</label>
                      <FormSelect 
                        label="Филиал" 
                        placeholder="Филиал" 
                        options={branchesList} 
                        value={formBranch} 
                        onChange={setFormBranch} 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Департамент</label>
                      <FormSelect 
                        label="Департамент" 
                        placeholder="Департамент" 
                        options={deptsList} 
                        value={formDept} 
                        onChange={setFormDept} 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Отдел</label>
                      <FormSelect 
                        label="Отдел" 
                        placeholder="Отдел" 
                        options={divsList} 
                        value={formDiv} 
                        onChange={setFormDiv} 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Должность</label>
                      <FormSelect 
                        label="Должность" 
                        placeholder="Должность" 
                        options={['Руководитель отдела', 'Специалист', 'Менеджер', 'PR-менеджер', 'Frontend Разработчик', 'Главный бухгалтер']} 
                        value={formPosition} 
                        onChange={setFormPosition} 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Статус</label>
                      <FormSelect 
                        label="Статус" 
                        placeholder="Статус" 
                        options={statusesList} 
                        value={formStatus} 
                        onChange={setFormStatus} 
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
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-11 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
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
                            value={formConfirmPassword}
                            onChange={(e) => setFormConfirmPassword(e.target.value)}
                            className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl pl-4 pr-11 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="hidden" id="edit-form-submit-btn" />
              </form>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-between items-center shrink-0">
              <Button 
                variant="ghost" 
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent font-bold cursor-pointer h-10 px-4"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Удалить профиль
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
                <Button 
                  variant="primary" 
                  className="px-8 bg-black hover:bg-neutral-800 text-white rounded-xl"
                  onClick={() => document.getElementById("edit-form-submit-btn")?.click()}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Course (Folder hierarchy tree with checkboxes) */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsCourseModalOpen(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]">
            
            <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-admin-primary-50)] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[var(--color-admin-primary-600)]" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-bold text-neutral-900 leading-tight">Назначить курс</h2>
                  <p className="text-[13px] text-neutral-500 mt-0.5">Выберите курсы за которые будет ответственен куратор {member.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCourseModalOpen(false)} 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Поиск по курсам и папкам..." 
                  value={courseSearch} 
                  onChange={e => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-400)] transition-all shadow-sm h-[42px]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 min-h-0 text-sm text-neutral-850">
              {/* Collapsible folders tree layout */}
              <div className="flex flex-col gap-0.5">
                
                {/* Onboarding 2026 Folder */}
                <div className="flex flex-col gap-0.5">
                  <div 
                    onClick={() => toggleFolder('Onboarding 2026')}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-50 text-neutral-700 font-semibold transition-all group"
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-250 transition-colors shrink-0">
                      {expandedFolders.includes('Onboarding 2026') ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                    </div>
                    <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-[13px] truncate">Onboarding 2026</span>
                  </div>
                  
                  {expandedFolders.includes('Onboarding 2026') && (
                    <div className="flex flex-col gap-0.5 pl-5">
                      
                      {/* IT & Security Core Folder */}
                      <div className="flex flex-col gap-0.5">
                        <div 
                          onClick={() => toggleFolder('IT & Security Core')}
                          className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-50 text-neutral-700 font-semibold transition-all group"
                        >
                          <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-250 transition-colors shrink-0">
                            {expandedFolders.includes('IT & Security Core') ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                          </div>
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-[13px] truncate">IT & Security Core</span>
                        </div>

                        {expandedFolders.includes('IT & Security Core') && (
                          <div className="flex flex-col gap-0.5 pl-5">
                            {filteredAvailableCourses.filter(c => c.folder === 'IT & Security Core').map(course => {
                              const isChecked = selectedCourses.includes(course.id);
                              return (
                                <div 
                                  key={course.id}
                                  onClick={() => toggleCourseSelect(course.id)}
                                  className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-50 transition-all group"
                                  style={{ paddingLeft: '24px' }}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                                    </div>
                                    <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-[13px] text-neutral-700 truncate">{course.title}</span>
                                  </div>
                                  <div className={`shrink-0 ml-2 ${isChecked ? 'text-[var(--color-admin-primary-500)]' : 'text-neutral-300 group-hover:text-neutral-400'}`}>
                                    {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compliance & Legal Folder */}
                <div className="flex flex-col gap-0.5">
                  <div 
                    onClick={() => toggleFolder('Compliance & Legal')}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-50 text-neutral-700 font-semibold transition-all group"
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-250 transition-colors shrink-0">
                      {expandedFolders.includes('Compliance & Legal') ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                    </div>
                    <Folder className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-[13px] truncate">Compliance & Legal</span>
                  </div>
                </div>

                {/* Root Level Courses */}
                <div className="flex flex-col gap-1 mt-2">
                  {filteredAvailableCourses.filter(c => c.folder === null).map(course => {
                    const isChecked = selectedCourses.includes(course.id);
                    return (
                      <div 
                        key={course.id}
                        onClick={() => toggleCourseSelect(course.id)}
                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-neutral-50 rounded-lg px-2"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span className="text-neutral-700 font-medium">{course.title}</span>
                        </div>
                        {isChecked ? <CheckSquare className="w-5 h-5 text-[var(--color-admin-primary-600)]" /> : <Square className="w-5 h-5 text-neutral-300" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-between items-center shrink-0">
              <span className="text-[13px] font-bold text-neutral-600">Выбрано курсов: <span className="text-neutral-900 font-bold">{selectedCourses.length}</span></span>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsCourseModalOpen(false)}>Отмена</Button>
                <Button variant="primary" onClick={handleSaveCourses} className="px-6 bg-[var(--color-admin-primary-900)] text-white rounded-xl">Назначить</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Students */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsStudentModalOpen(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[1200px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            
            <div className="p-6 border-b border-neutral-100 shrink-0 flex items-start gap-4">
              <div className="flex-1 flex flex-col min-w-0">
                <h2 className="text-xl font-bold text-neutral-900 leading-tight">Добавить студентов</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Выберите студентов за которых будет ответственен куратор {member.name}</p>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto min-h-0 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Поиск по ФИО, телефону или email..." 
                  value={studentSearch} 
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:ring-2 focus:ring-[var(--color-admin-primary-500)] outline-none"
                />
              </div>

              {/* Dynamic Filters Row */}
              <div 
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(1, activePriorityFields.length)}, minmax(0, 1fr))`
                }}
              >
                {activePriorityFields.map((field: any, idx: number) => {
                  const state = getModalFilterState(field.id, idx);
                  return (
                    <CustomSelectFilter 
                      key={field.id}
                      label={field.label} 
                      options={state.options} 
                      value={state.value} 
                      onChange={state.onChange} 
                    />
                  );
                })}
              </div>

              {/* Student Table View */}
              <div className="border border-neutral-200 rounded-[20px] overflow-hidden mt-2 bg-white flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left whitespace-nowrap table-fixed" style={{ minWidth: '1000px' }}>
                    <thead className="bg-neutral-50 sticky top-0 border-b border-neutral-100 z-10">
                      <tr>
                        <th style={{ width: '48px' }} className="px-3 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedStudents.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudents(filteredAvailableStudents.map(s => s.id));
                              else setSelectedStudents([]);
                            }}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer" 
                          />
                        </th>
                        <th style={{ width: '50px' }} className="px-3 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center">№</th>
                        <th style={{ width: '25%' }} className="px-3 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Пользователь</th>
                        {activePriorityFields.map((field: any, idx: number) => {
                          const widths = [12, 14, 12, 12, 8];
                          const wVal = widths[idx % widths.length];
                          return (
                            <th key={field.id} style={{ width: `${wVal}%` }} className="px-3 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                              {field.label}
                            </th>
                          );
                        })}
                        <th style={{ width: '110px' }} className="px-3 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-right">Посл. визит</th>
                        <th style={{ width: '110px' }} className="px-3 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-right">Регистрация</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredAvailableStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5 + activePriorityFields.length} className="px-4 py-12 text-center text-sm text-neutral-400">Пользователи не найдены</td>
                        </tr>
                      ) : (
                        filteredAvailableStudents.map((s, index) => {
                          const isChecked = selectedStudents.includes(s.id);
                          return (
                            <tr 
                              key={s.id} 
                              className="hover:bg-neutral-50/60 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors" 
                              onClick={() => toggleStudentSelect(s.id)}
                            >
                              <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => toggleStudentSelect(s.id)}
                                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer" 
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="text-[11px] text-neutral-300 tabular-nums">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                              </td>
                              <td className="px-3 py-3 overflow-hidden">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
                                    {s.initials}
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <MarqueeText text={s.name} className="font-semibold text-neutral-800 text-[13px]" />
                                    <MarqueeText text={s.email} className="text-[11px] text-neutral-400 font-medium" />
                                  </div>
                                </div>
                              </td>
                              {activePriorityFields.map((field: any) => {
                                let val = '';
                                if (field.id === 'p_branch') val = s.branch;
                                if (field.id === 'p_dept') val = s.dept;
                                if (field.id === 'p_div') val = s.div;
                                if (field.id === 'p_role') val = s.role;
                                if (field.id === 'p_status') val = s.status;
                                
                                return (
                                  <td key={field.id} className="px-3 py-3 overflow-hidden">
                                    <MarqueeText text={val} className="text-[12px] font-medium text-neutral-800" />
                                  </td>
                                );
                              })}
                              <td className="px-3 py-3 truncate text-right">
                                {renderDateTime(s.visit)}
                              </td>
                              <td className="px-3 py-3 truncate text-right">
                                {renderDateTime(s.reg)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between rounded-b-[24px] shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedStudents(filteredAvailableStudents.map(s => s.id))} 
                className="text-[13px] font-semibold text-[var(--color-admin-primary-600)] hover:text-[var(--color-admin-primary-700)] px-3 py-2 rounded-lg hover:bg-[var(--color-admin-primary-50)] transition-colors"
              >
                Добавить всех ({filteredAvailableStudents.length})
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsStudentModalOpen(false)} className="text-[13px] font-semibold text-neutral-500 hover:text-neutral-700 px-4 py-2 hover:bg-neutral-100 rounded-xl transition-colors">Отмена</button>
                <Button 
                  variant="primary" 
                  disabled={selectedStudents.length === 0} 
                  onClick={handleSaveStudents} 
                  className="text-[13px] font-semibold"
                >
                  Добавить выбранных ({selectedStudents.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Unassign Student Modal */}
      {unassignStudentId !== null && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setUnassignStudentId(null)} />
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-[20px] font-bold text-neutral-900 mb-3 tracking-tight">Открепить студента?</h2>
            <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">
              Вы действительно хотите открепить студента <strong className="text-neutral-900 font-semibold">"{mockAvailableStudents.find(s => s.id === unassignStudentId)?.name}"</strong> от куратора <strong className="text-neutral-900 font-semibold">"{member.name}"</strong>?
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-700 h-10" onClick={() => setUnassignStudentId(null)}>Отмена</Button>
              <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent h-10" onClick={confirmUnassignStudent}>Открепить</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Unassign Course Modal */}
      {unassignCourseId !== null && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setUnassignCourseId(null)} />
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-[20px] font-bold text-neutral-900 mb-3 tracking-tight">Открепить курс?</h2>
            <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">
              Вы действительно хотите открепить курс <strong className="text-neutral-900 font-semibold">"{mockAvailableCourses.find(c => c.id === unassignCourseId)?.title}"</strong> от куратора <strong className="text-neutral-900 font-semibold">"{member.name}"</strong>?
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-700 h-10" onClick={() => setUnassignCourseId(null)}>Отмена</Button>
              <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent h-10" onClick={confirmUnassignCourse}>Открепить</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Member Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-[20px] font-bold text-neutral-900 mb-3 tracking-tight">Удалить профиль сотрудника?</h2>
            <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">
              Вы действительно хотите удалить профиль сотрудника <strong className="text-neutral-900 font-semibold">"{member.name}"</strong>? Все связанные данные будут безвозвратно удалены.
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-700 h-10" onClick={() => setIsDeleteModalOpen(false)}>Отмена</Button>
              <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent h-10" onClick={handleDeleteProfile}>Удалить</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
