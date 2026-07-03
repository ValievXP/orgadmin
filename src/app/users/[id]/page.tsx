"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { TestResultsModal } from '@/components/modals/TestResultsModal';
import { AssignCourseModal } from '@/components/modals/AssignCourseModal';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Briefcase, 
  Edit3, 
  Trash2, 
  Lock,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Award,
  Calendar,
  Download,
  Eye,
  User as UserIcon,
  Check,
  X,
  ChevronDown,
  EyeOff
} from 'lucide-react';

const getUserFIO = (u: any, patronymicEnabled: boolean = true) => {
  return [u.lastName, u.firstName, patronymicEnabled ? u.patronymic : ''].filter(Boolean).join(' ');
};

const getUserInitials = (u: any) => {
  return ((u.lastName?.[0] || '') + (u.firstName?.[0] || '')).toUpperCase();
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

const mockUser = {
  id: 1,
  firstName: 'Алексей',
  lastName: 'Смирнов',
  patronymic: 'Иванович',
  email: 'a.smirnov@osnova.uz',
  phone: '+998 90 123-45-67',
  birthDate: '12/05/1990',
  gender: 'Мужской',
  roles: ['Студент', 'Куратор'],
  customFields: [
    { label: 'Роль', value: 'Студент' },
    { label: 'Филиал', value: 'Ташкент (ГК)' },
    { label: 'Департамент', value: 'Коммерческий департамент' },
    { label: 'Отдел', value: 'Отдел продаж B2B' },
    { label: 'Должность', value: 'Руководитель отдела' }
  ],
  status: 'Работает',
  visit: '24/04/2026 10:30',
  reg: '15/01/2025 09:00',
  courses: [
    { id: 101, title: 'B2B Продажи: Продвинутый уровень', progress: 100, status: 'Завершен', date: '12/03/2026' },
    { id: 102, title: 'Управление командой', progress: 45, status: 'В процессе', date: '22/04/2026' },
    { id: 103, title: 'Корпоративная этика', progress: 0, status: 'Назначен', date: '25/04/2026' },
  ],
  testings: [
    { id: 201, title: 'Аттестация по продукту (1 кв. 2026)', score: 95, maxScore: 100, status: 'Сдан', date: '05/04/2026' },
    { id: 202, title: 'Промежуточный тест: Управление', score: null, maxScore: 50, status: 'Назначен', date: '30/04/2026' },
  ],
  certificates: [
    { id: 301, title: 'Сертифицированный B2B Эксперт', issueDate: '15/03/2026' }
  ]
};

const branchesList = ['Ташкент (ГК)', 'Самарканд', 'Бухара', 'Фергана'];
const deptsList = ['Коммерческий департамент', 'Маркетинг', 'Служба поддержки', 'HR', 'IT', 'Финансы', 'Руководство', 'Продуктовая аналитика'];
const divsList = ['Отдел продаж B2B', 'PR и коммуникации', 'Первая линия', 'Подбор персонала', 'Разработка ПО', 'Бухгалтерия', 'Совет директоров', 'Отдел продаж B2C', 'Аналитика'];
const statusesList = ['Работает', 'Отпуск', 'Уволен'];

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

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'courses' | 'testings' | 'certificates'>('courses');
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [testResultsOpen, setTestResultsOpen] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [activeSessionsModalOpen, setActiveSessionsModalOpen] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 's1', os: 'Windows', date: '29.01.2026 14:15', browser: 'Mozilla Firefox', current: false, status: 'Active', deviceType: 'desktop' },
    { id: 's2', os: 'iPhone', date: '03.07.2026 21:04', browser: 'Safari', status: 'Active', current: false, deviceType: 'mobile' },
    { id: 's3', os: 'Android', date: '10.04.2026 09:30', browser: 'Chrome', status: 'Inactive', inactiveDays: 84, current: false, deviceType: 'mobile' },
    { id: 's4', os: 'Mac OS', date: '03.07.2026 23:45', browser: 'Google Chrome', current: true, status: 'Active', deviceType: 'desktop' },
    { id: 's5', os: 'Windows', date: '03.07.2026 18:22', browser: 'Яндекс.Браузер', current: false, status: 'Active', deviceType: 'desktop' }
  ]);
  const [sessionToTerm, setSessionToTerm] = useState<string | null>(null);

  // In a real app, you would fetch user data using params.id
  const [user, setUser] = useState(mockUser); 

  // Modal edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formFirstName, setFormFirstName] = useState(user.firstName);
  const [formLastName, setFormLastName] = useState(user.lastName);
  const [formPatronymic, setFormPatronymic] = useState(user.patronymic);
  const [formRegion, setFormRegion] = useState((user as any).region || 'Ташкент');
  const [formBirthDate, setFormBirthDate] = useState(user.birthDate);
  const [formGender, setFormGender] = useState(user.gender);
  const [formRoles, setFormRoles] = useState<string[]>(user.roles);
  const [formBranch, setFormBranch] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formDiv, setFormDiv] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formPhone, setFormPhone] = useState(user.phone);
  const [formEmail, setFormEmail] = useState(user.email);
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');

  useEffect(() => {
    if (isEditModalOpen) {
      setFormFirstName(user.firstName);
      setFormLastName(user.lastName);
      setFormPatronymic(user.patronymic);
      setFormRegion((user as any).region || 'Ташкент');
      setFormBirthDate(user.birthDate);
      setFormGender(user.gender);
      setFormRoles(user.roles);
      const branchField = user.customFields.find(f => f.label === 'Филиал')?.value || '';
      const deptField = user.customFields.find(f => f.label === 'Департамент')?.value || '';
      const divField = user.customFields.find(f => f.label === 'Отдел')?.value || '';
      const positionField = user.customFields.find(f => f.label === 'Должность')?.value || '';
      setFormBranch(branchField);
      setFormDept(deptField);
      setFormDiv(divField);
      setFormPosition(positionField);
      setFormStatus(user.status);
      setFormPhone(user.phone);
      setFormEmail(user.email);
      setFormPassword('');
      setFormConfirmPassword('');
    }
  }, [isEditModalOpen, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      firstName: formFirstName,
      lastName: formLastName,
      patronymic: formPatronymic,
      region: formRegion,
      birthDate: formBirthDate,
      gender: formGender,
      roles: formRoles,
      phone: formPhone,
      email: formEmail,
      status: formStatus,
      customFields: [
        { label: 'Роль', value: formRoles.join(', ') },
        { label: 'Филиал', value: formBranch },
        { label: 'Департамент', value: formDept },
        { label: 'Отдел', value: formDiv },
        { label: 'Должность', value: formPosition }
      ]
    }));
    setIsEditModalOpen(false);
    setToastMessage('Профиль успешно обновлен');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setToastMessage("Пользователь успешно удален");
    setTimeout(() => {
      setToastMessage(null);
      router.push('/users');
    }, 1500);
  };

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

  const getPriorityFieldValue = (fieldId: string) => {
    if (fieldId === 'p_branch') return user.customFields.find(f => f.label === 'Филиал')?.value || 'Ташкент (ГК)';
    if (fieldId === 'p_dept') return user.customFields.find(f => f.label === 'Департамент')?.value || 'Коммерческий департамент';
    if (fieldId === 'p_div') return user.customFields.find(f => f.label === 'Отдел')?.value || 'Отдел продаж B2B';
    if (fieldId === 'p_role') return user.customFields.find(f => f.label === 'Должность')?.value || 'Руководитель отдела';
    if (fieldId === 'p_status') return user.status || 'Работает';
    return 'Не заполнено';
  };

  const getSecondaryFieldValue = (fieldId: string) => {
    if (fieldId === 's_gender') return user.gender;
    if (fieldId === 's_age') return '36 лет';
    return '—';
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] pb-0">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 lg:px-8 py-4 max-w-[1800px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-neutral-900 leading-tight">Профиль пользователя</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 font-medium shadow-sm bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 h-9">
              <Download className="w-4 h-4" /> Результаты
            </Button>
            <Button onClick={() => setIsEditModalOpen(true)} variant="primary" className="flex items-center gap-2 font-medium shadow-sm h-9">
              <Edit3 className="w-4 h-4" /> Редактировать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-6 lg:px-8 mt-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: User Info */}
          <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex flex-col items-center text-center border-b border-neutral-100 pb-6 mb-6 relative">
                <button
                  onClick={() => setActiveSessionsModalOpen(true)}
                  className="absolute top-0 right-0 p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-center shadow-sm w-9 h-9"
                  title="Активные сессии"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </button>
                <div className="w-24 h-24 rounded-full bg-neutral-100 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-neutral-700 mb-4">
                  {getUserInitials(user)}
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">{getUserFIO(user, settings?.patronymicEnabled ?? true)}</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12px] text-neutral-500 font-medium">Телефон</span>
                    <MarqueeText text={user.phone} className="text-[14px] text-neutral-900" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12px] text-neutral-500 font-medium">Email</span>
                    <MarqueeText text={user.email} className="text-[14px] text-neutral-900" />
                  </div>
                </div>

                {/* Roles (Multiple) */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12px] text-neutral-500 font-medium">Роль</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {user.roles.map(role => (
                        <span key={role} className="text-[11px] font-bold px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {(settings?.birthDateEnabled ?? true) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Дата рождения</span>
                      <MarqueeText text={user.birthDate} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>
                )}
                {(settings?.genderEnabled ?? true) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Пол</span>
                      <MarqueeText text={user.gender} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>
                )}
                {settings?.regionEnabled && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] text-neutral-500 font-medium">Регион</span>
                      <MarqueeText text={(user as any).region || 'Ташкент'} className="text-[14px] text-neutral-900" />
                    </div>
                  </div>
                )}
              </div>

              {isSidebarExpanded && (
                <div className="animate-in fade-in duration-300">
                  {activePriorityFields.length > 0 && (
                    <>
                      <div className="h-px bg-neutral-100 my-6" />
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Приоритетные поля</h4>
                        {activePriorityFields.map((field: any) => (
                          <div key={field.id} className="flex flex-col min-w-0">
                            <span className="text-[12px] text-neutral-500 font-medium">{field.label}</span>
                            <MarqueeText text={getPriorityFieldValue(field.id)} className="text-[14px] text-neutral-900" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {settings?.secondaryFields && settings.secondaryFields.length > 0 && (
                    <>
                      <div className="h-px bg-neutral-100 my-6" />
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Дополнительная информация</h4>
                        {settings.secondaryFields.map((field: any) => (
                          <div key={field.id} className="flex flex-col min-w-0">
                            <span className="text-[12px] text-neutral-500 font-medium">{field.label}</span>
                            <MarqueeText text={getSecondaryFieldValue(field.id)} className="text-[14px] text-neutral-900" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="w-full mt-6 py-2.5 px-4 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSidebarExpanded ? 'Свернуть' : 'Развернуть данные'}
              </button>
            </div>

          </div>

          {/* Right Column: Content Tabs */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
            
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.courses.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Курсов назначено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">1</span>
                <span className="text-[12px] font-medium text-neutral-500">Завершено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.testings.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Тестов пройдено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.certificates.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Сертификатов</span>
              </div>
            </div>

            <div className="flex items-end justify-between border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-3 text-[14px] font-semibold transition-all border-b-2 ${
                    activeTab === 'courses' 
                      ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  Курсы
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Тестирования
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Сертификаты
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Опросы
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Мероприятия
                </button>
              </div>
              
              {activeTab === 'courses' && (
                <div className="pb-2">
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold" onClick={() => setAssignModalOpen(true)}>Назначить курс</Button>
                </div>
              )}
              {activeTab === 'testings' && (
                <div className="pb-2">
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold">Назначить тест</Button>
                </div>
              )}
            </div>

            {/* Courses List */}
            {activeTab === 'courses' && (
              <div className="flex flex-col gap-4">
                {user.courses.map(course => (
                  <div key={course.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 transition-all group flex flex-col">
                    <div 
                      className="p-5 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer"
                      onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6 text-neutral-500" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h4 className="text-[15px] font-bold text-neutral-900 truncate mb-1">{course.title}</h4>
                        <div className="flex items-center gap-4 text-[13px] text-neutral-500 font-medium">
                          {course.status === 'Завершен' ? (
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Завершен: 15.03.2026 10:00</span>
                          ) : course.status === 'Назначен' ? (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Назначен: {course.date}</span>
                          ) : (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Последняя активность: 14.03.2026 14:30</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:w-48 flex flex-col gap-2 shrink-0">
                        <div className="flex items-center justify-between text-[12px] font-semibold">
                          <span className={course.status === 'Завершен' ? 'text-emerald-600' : 'text-neutral-700'}>
                            {course.status}
                          </span>
                          <span className="text-neutral-900">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-[var(--color-admin-primary-500,bg-neutral-800)]'}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {expandedCourseId === course.id && (
                      <div className="border-t border-neutral-100 p-6 bg-neutral-50/50">
                        
                        {/* Progress and Activity Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                           <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Прогресс</span>
                              <span className="text-[32px] font-bold text-emerald-500 leading-none">{course.progress}%</span>
                           </div>
                           <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Активность</span>
                              <div className="flex flex-col gap-0.5 text-[13px] text-neutral-500 font-medium mb-auto">
                                 <span>Назначен: {course.date}</span>
                                 {course.status !== 'Назначен' && <span>Посл. акт: 14.03.2026 14:30</span>}
                              </div>
                              {course.status === 'Завершен' && (
                                <div className="mt-3 inline-flex items-center w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded">
                                   Завершен 15.03.2026 10:00
                                </div>
                              )}
                           </div>
                        </div>

                        {course.status === 'Назначен' ? (
                          <div className="py-8 text-center border-t border-neutral-200/60 mt-4">
                            <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                            <p className="text-[14px] font-medium text-neutral-700">Пользователь еще не приступал к курсу</p>
                          </div>
                        ) : (
                          <>
                            <h5 className="text-[15px] font-bold text-neutral-900 mb-5">Прохождение модулей и уроков</h5>
                            <div className="flex flex-col gap-6">
                          {/* Module 1 */}
                          <div className="flex flex-col relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-[14px] font-medium text-neutral-900">1. Введение в корпоративную безопасность</span>
                              </div>
                              <span className="text-[13px] text-neutral-500">15.03.2026</span>
                            </div>
                            
                            {/* Inner lessons */}
                            <div className="flex flex-col gap-3 pl-[11px] ml-2.5 border-l border-emerald-200/60 pb-2">
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <span className="text-[13px] text-neutral-700">1.1 Что такое корпоративная безопасность</span>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Пройден (14.03.2026 12:15)</span>
                              </div>
                              
                              <div className="ml-4 p-4 bg-white border border-neutral-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] max-w-[400px]">
                                <div className="flex items-center gap-1 mb-2 text-amber-400 text-[14px]">
                                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                  <span className="text-[12px] text-neutral-500 ml-2 font-medium">5/5</span>
                                </div>
                                <p className="text-[13px] text-neutral-500 italic">"Отличное введение, всё кратко и по делу!"</p>
                              </div>

                              <div className="flex items-center justify-between pl-4 relative mt-1">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <div className="flex flex-col">
                                  <span className="text-[13px] text-neutral-700 flex items-center gap-2">
                                    1.2 Тест: Основные понятия
                                    <button onClick={() => setTestResultsOpen('test-basics')} title="Посмотреть результаты" className="text-neutral-400 hover:text-[var(--color-admin-primary-600)] transition-colors ml-1">
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </span>
                                  <span className="text-[12px] text-emerald-600 font-medium mt-0.5">Оценка: 5/5 (Сдан)</span>
                                </div>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start mt-0.5">Пройден (15.03.2026 10:00)</span>
                              </div>
                            </div>
                          </div>

                          {/* Module 2 */}
                          <div className="flex flex-col relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-[14px] font-medium text-neutral-900">2. Защита информации</span>
                              </div>
                              <span className="text-[13px] text-neutral-500">В процессе</span>
                            </div>
                            
                            {/* Inner lessons */}
                            <div className="flex flex-col gap-4 pl-[11px] ml-2.5 border-l border-amber-200/60">
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <span className="text-[13px] text-neutral-700">2.1 Методы защиты данных</span>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Пройден (16.03.2026 11:30)</span>
                              </div>
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-neutral-300" />
                                <span className="text-[13px] text-neutral-700">2.2 Шифрование и VPN</span>
                                <span className="text-[12px] font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">Не начат</span>
                              </div>
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-rose-500" />
                                <div className="flex flex-col">
                                  <span className="text-[13px] text-neutral-700 flex items-center gap-2">
                                    2.3 Тест: Защита данных
                                    <button onClick={() => setTestResultsOpen('test-data-protection')} title="Посмотреть результаты" className="text-neutral-400 hover:text-[var(--color-admin-primary-600)] transition-colors ml-1">
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </span>
                                  <span className="text-[12px] text-rose-600 font-medium mt-0.5">Оценка: 1/5 (Не сдан)</span>
                                </div>
                                <span className="text-[12px] font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md self-start mt-0.5">Не сдан (17.03.2026 14:15)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                          </>
                        )}

                        <div className="flex items-center justify-between pt-6 mt-4 border-t border-neutral-200/60">
                           <button className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg">
                              <Download className="w-3.5 h-3.5" /> Результаты
                           </button>
                           <div className="flex justify-end gap-3">
                              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-4 rounded-xl text-[13px] font-medium shadow-none">Открепить курс</Button>
                              <Button onClick={() => router.push(`/courses/COR-${course.id}`)} className="h-9 px-4 rounded-xl text-[13px] font-medium bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm text-neutral-700">Перейти в курс</Button>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Testings List */}
            {activeTab === 'testings' && (
              <div className="flex flex-col gap-4">
                {user.testings.map(test => (
                  <div key={test.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-indigo-200 transition-all group flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      test.status === 'Сдан' ? 'bg-emerald-50' : 'bg-indigo-50'
                    }`}>
                      {test.status === 'Сдан' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h4 className="text-[15px] font-bold text-neutral-900 truncate mb-1">{test.title}</h4>
                      <div className="flex items-center gap-4 text-[13px] text-neutral-500 font-medium">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.status === 'Сдан' ? 'Сдан: ' : 'Дедлайн: '} {test.date}</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-32 flex flex-col shrink-0 items-start sm:items-end">
                      {test.score !== null ? (
                        <>
                          <div className="text-[20px] font-bold text-emerald-600 leading-none mb-1">
                            {test.score} <span className="text-[14px] text-neutral-400 font-medium">/ {test.maxScore}</span>
                          </div>
                          <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Пройден успешно</span>
                        </>
                      ) : (
                        <Button variant="outline" className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm flex items-center justify-center gap-2">
                          <PlayCircle className="w-4 h-4" /> Напомнить
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certificates List */}
            {activeTab === 'certificates' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.certificates.map(cert => (
                  <div key={cert.id} className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[14px] font-bold text-neutral-900 leading-snug line-clamp-2">{cert.title}</h4>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-50">
                      <span className="text-[12px] text-neutral-500 font-medium">{cert.issueDate}</span>
                      <button className="text-[13px] font-medium text-[var(--color-admin-primary-600)] hover:text-[var(--color-admin-primary-700)] transition-colors">
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Редактировать профиль</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="flex flex-col gap-10">
                
                {/* Personal Information */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-neutral-900">Персональная информация</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Имя <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all placeholder:text-neutral-400" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-neutral-700">Фамилия <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
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
                        options={["Студент", "Куратор", "Гость"]} 
                        value={formRoles.includes('Студент') ? 'Студент' : formRoles.includes('Куратор') ? 'Куратор' : 'Гость'} 
                        onChange={(val) => {
                          if (val === 'Студент') setFormRoles(['Студент']);
                          else if (val === 'Куратор') setFormRoles(['Куратор']);
                          else if (val === 'Гость') setFormRoles(['Гость']);
                        }}
                        showSearch={false}
                      />
                    </div>

                    {activePriorityFields.map((field: any, idx: number) => {
                      let val = '';
                      let onChg = (v: string) => {};
                      let opts: string[] = [];

                      if (field.id === 'p_branch') {
                        val = formBranch;
                        onChg = setFormBranch;
                        opts = branchesList;
                      } else if (field.id === 'p_dept') {
                        val = formDept;
                        onChg = setFormDept;
                        opts = deptsList;
                      } else if (field.id === 'p_div') {
                        val = formDiv;
                        onChg = setFormDiv;
                        opts = divsList;
                      } else if (field.id === 'p_role') {
                        val = formPosition;
                        onChg = setFormPosition;
                        opts = ['Руководитель отдела', 'Специалист', 'Менеджер'];
                      } else if (field.id === 'p_status') {
                        val = formStatus;
                        onChg = setFormStatus;
                        opts = statusesList;
                      }

                      return (
                        <div key={field.id} className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-neutral-700">{field.label}</label>
                          <FormSelect 
                            label={field.label} 
                            placeholder={field.label} 
                            options={opts} 
                            value={val} 
                            onChange={onChg} 
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
                            value={formConfirmPassword}
                            onChange={(e) => setFormConfirmPassword(e.target.value)}
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

                <div className="flex justify-between items-center shrink-0 pt-4 border-t border-neutral-100 mt-6">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent font-bold cursor-pointer h-10 px-4"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Удалить профиль
                  </Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit" variant="primary" className="px-8 bg-black hover:bg-neutral-800 text-white rounded-xl">
                      Сохранить
                    </Button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Modal */}
      <TestResultsModal
        isOpen={testResultsOpen !== null}
        onClose={() => setTestResultsOpen(null)}
        testId={testResultsOpen || ''}
      />

      {/* Assign Course Modal */}
      <AssignCourseModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={(selectedIds) => {
          setAssignModalOpen(false);
          // In a real app we'd fetch the real course names here or they'd be returned by the modal
          const newCourses = selectedIds.map(id => ({
            id: parseInt(id.replace('c-', '')) || Math.floor(Math.random() * 1000),
            title: `Новый курс (${id})`,
            progress: 0,
            status: 'Назначен',
            date: new Date().toLocaleDateString('ru-RU')
          }));
          setUser(prev => ({
            ...prev,
            courses: [...newCourses, ...prev.courses]
          }));
          setToastMessage(`Назначено курсов: ${selectedIds.length}`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[600] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[14px] font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Confirm Delete User Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-[20px] font-bold text-neutral-900 mb-3 tracking-tight">Удалить профиль пользователя?</h2>
            <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed max-w-[340px]">
              Вы действительно хотите удалить профиль пользователя <strong className="text-neutral-900 font-semibold">"{user.lastName} {user.firstName}"</strong>? Все связанные данные будут безвозвратно удалены.
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 font-semibold border-neutral-200 text-neutral-700 h-10" onClick={() => setIsDeleteModalOpen(false)}>Отмена</Button>
              <Button className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent h-10" onClick={handleDeleteProfile}>Удалить</Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {activeSessionsModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setActiveSessionsModalOpen(false)} />
          <div className="bg-white rounded-[24px] w-full max-w-[550px] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h2 className="text-[18px] font-bold text-neutral-900">Активные сессии пользователя</h2>
              <button onClick={() => setActiveSessionsModalOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-150 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 shrink-0 mt-0.5">
                      {session.deviceType === 'mobile' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 text-[15px]">{session.os}</span>
                        {session.current && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            Этот сеанс
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-neutral-500 space-y-0.5">
                        <p>Активность: <span className="text-neutral-700 font-medium">{session.date}</span></p>
                        <p>Браузер: <span className="text-neutral-700 font-medium">{session.browser}</span></p>
                      </div>
                      {session.status === 'Inactive' && session.inactiveDays && (
                        <div className="text-amber-600 text-[12px] font-medium flex items-center gap-1.5 mt-1 bg-amber-50/70 border border-amber-100 px-2.5 py-1 rounded-lg w-fit">
                          <span>⚠️</span> Неактивен {session.inactiveDays} дней
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {session.current ? (
                      <span className="text-[12px] text-neutral-400 font-medium px-3 py-1.5">Текущий</span>
                    ) : (
                      <button
                        onClick={() => setSessionToTerm(session.id)}
                        className="text-[13px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                        title="Завершить сеанс"
                      >
                        Завершить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog (Missclick protection) */}
      {sessionToTerm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSessionToTerm(null)} />
          <div className="bg-white rounded-[24px] w-full max-w-[400px] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-[18px] font-bold text-neutral-900 mb-2">Завершить сеанс?</h3>
            <p className="text-[14px] text-neutral-500 mb-6 leading-relaxed">
              Действительно хотите завершить эту сессию?
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 font-semibold border-neutral-200 text-neutral-700 h-10"
                onClick={() => setSessionToTerm(null)}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent h-10"
                onClick={() => {
                  setSessions(prev => prev.filter(s => s.id !== sessionToTerm));
                  setToastMessage("Сессия успешно завершена");
                  setTimeout(() => setToastMessage(null), 3000);
                  setSessionToTerm(null);
                }}
              >
                Завершить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
