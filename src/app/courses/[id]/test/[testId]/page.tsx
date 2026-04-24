"use client";
import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  ChevronDown, X, Plus, GripVertical, Trash2,
  Clock, RotateCcw, ShieldCheck, Target, Shuffle, Eye, EyeOff,
  Upload, Image as ImageIcon, FileSpreadsheet, Check,
  Unlock, Lock, CalendarClock, Timer,
  CircleDot, CheckSquare, AlertTriangle, Save,
  ChevronLeft, ChevronRight, Copy, Search
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AccessStatus = 'open' | 'closed' | 'scheduled' | 'limited';
type QuestionType = 'radio' | 'checkbox';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  image: string | null;
  explanation: string;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  image: string | null;
  answers: Answer[];
}

interface TestSettings {
  title: string;
  description: string;
  coverImage: string | null;
  accessStatus: AccessStatus;
  scheduledDate: string;
  startDate: string;
  endDate: string;
  timeLimit: boolean;
  timeLimitMinutes: number;
  attempts: number;
  isMandatory: boolean;
  passingThreshold: number;
  shuffleQuestions: boolean;
  questionCount: number;
  showResults: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TEST: TestSettings = {
  title: 'Тест: Основные понятия',
  description: 'Проверьте свои знания по основным понятиям корпоративной безопасности. Тест включает вопросы по классификации угроз, методам защиты и основным принципам.',
  coverImage: null,
  accessStatus: 'open',
  scheduledDate: '',
  startDate: '',
  endDate: '',
  timeLimit: true,
  timeLimitMinutes: 15,
  attempts: 3,
  isMandatory: true,
  passingThreshold: 7,
  shuffleQuestions: true,
  questionCount: 10,
  showResults: true,
};

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1', type: 'radio', text: 'Что является основной целью корпоративной безопасности?',
    image: null,
    answers: [
      { id: 'a1', text: 'Защита активов и информации компании', isCorrect: true, image: null, explanation: 'Верно. Основная цель — комплексная защита всех активов организации.' },
      { id: 'a2', text: 'Увеличение прибыли компании', isCorrect: false, image: null, explanation: 'Это задача бизнес-стратегии, а не корпоративной безопасности.' },
      { id: 'a3', text: 'Контроль сотрудников', isCorrect: false, image: null, explanation: 'Контроль — лишь один из инструментов, но не главная цель.' },
      { id: 'a4', text: 'Ведение документации', isCorrect: false, image: null, explanation: 'Документирование — вспомогательная функция.' },
    ],
  },
  {
    id: 'q2', type: 'checkbox', text: 'Какие из перечисленных методов относятся к физической безопасности? (выберите все подходящие)',
    image: null,
    answers: [
      { id: 'a5', text: 'Система контроля доступа', isCorrect: true, image: null, explanation: 'СКУД — классический элемент физической безопасности.' },
      { id: 'a6', text: 'Шифрование данных', isCorrect: false, image: null, explanation: 'Шифрование относится к информационной безопасности.' },
      { id: 'a7', text: 'Видеонаблюдение', isCorrect: true, image: null, explanation: 'Видеонаблюдение — важный компонент физической безопасности.' },
      { id: 'a8', text: 'Охранная сигнализация', isCorrect: true, image: null, explanation: 'Сигнализация обеспечивает обнаружение несанкционированного доступа.' },
    ],
  },
  {
    id: 'q3', type: 'radio', text: 'Какой из принципов является ключевым в модели информационной безопасности CIA?',
    image: null,
    answers: [
      { id: 'a9', text: 'Конфиденциальность', isCorrect: true, image: null, explanation: 'Конфиденциальность (Confidentiality) — один из трёх ключевых принципов модели CIA.' },
      { id: 'a10', text: 'Производительность', isCorrect: false, image: null, explanation: 'Производительность не входит в модель CIA.' },
      { id: 'a11', text: 'Масштабируемость', isCorrect: false, image: null, explanation: 'Масштабируемость — характеристика архитектуры, не входит в CIA.' },
    ],
  },
  {
    id: 'q4', type: 'radio', text: 'Что такое фишинг?',
    image: null,
    answers: [
      { id: 'a12', text: 'Программа для мониторинга сети', isCorrect: false, image: null, explanation: 'Это описание сетевого анализатора, а не фишинга.' },
      { id: 'a13', text: 'Метод социальной инженерии для получения конфиденциальных данных', isCorrect: true, image: null, explanation: 'Фишинг — это мошенническая попытка получить чувствительную информацию, маскируясь под доверенное лицо.' },
      { id: 'a14', text: 'Тип межсетевого экрана', isCorrect: false, image: null, explanation: 'Межсетевой экран (firewall) — совершенно другая технология.' },
    ],
  },
  {
    id: 'q5', type: 'checkbox', text: 'Какие из следующих действий повышают безопасность паролей?',
    image: null,
    answers: [
      { id: 'a15', text: 'Использование длинных паролей (12+ символов)', isCorrect: true, image: null, explanation: 'Длинные пароли значительно усложняют подбор.' },
      { id: 'a16', text: 'Использование одного пароля для всех сервисов', isCorrect: false, image: null, explanation: 'Это серьёзная уязвимость — компрометация одного сервиса раскроет все.' },
      { id: 'a17', text: 'Включение двухфакторной аутентификации', isCorrect: true, image: null, explanation: '2FA добавляет дополнительный уровень защиты.' },
      { id: 'a18', text: 'Регулярная смена паролей', isCorrect: true, image: null, explanation: 'Периодическая смена уменьшает окно уязвимости.' },
    ],
  },
];

// ─── Toggle Component ────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description, icon: Icon }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-neutral-500" />
          </div>
        )}
        <div>
          <p className="text-[13px] font-medium text-neutral-800">{label}</p>
          {description && <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4 ${
          checked ? 'bg-emerald-500' : 'bg-neutral-200'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

// ─── Settings Card ───────────────────────────────────────────────────────────

function SettingsCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h3 className="text-[14px] font-semibold text-neutral-900">{title}</h3>
        {description && <p className="text-[12px] text-neutral-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────

function Dropdown({ value, options, onChange }: {
  value: string;
  options: { id: string; label: string; desc?: string; dot?: string }[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white text-sm text-neutral-900 transition-all"
      >
        <div className="flex items-center gap-2.5">
          {selected?.dot && <div className={`w-2 h-2 rounded-full ${selected.dot}`} />}
          {selected?.label || 'Выберите...'}
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-400" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[100] animate-in fade-in zoom-in-95 duration-150">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                value === opt.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'
              }`}
            >
              {opt.dot && <div className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />}
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] ${value === opt.id ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>{opt.label}</p>
                {opt.desc && <p className="text-[11px] text-neutral-400">{opt.desc}</p>}
              </div>
              {value === opt.id && <Check className="w-4 h-4 text-neutral-900 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Test Editor Page ───────────────────────────────────────────────────

export default function TestEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const testId = params.testId as string;

  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
  const isNew = typeof params.testId === 'string' && params.testId.startsWith('item-');
  const initQuestions = isNew ? [{ id: 'q1', type: 'radio' as const, title: '', options: [{ id: 'o1', text: '', isCorrect: true }, { id: 'o2', text: '', isCorrect: false }], required: true }] : MOCK_QUESTIONS;
  const [settings, setSettings] = useState<TestSettings>(MOCK_TEST);
  const [questions, setQuestions] = useState<Question[]>(initQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(initQuestions[0]?.id || null);
  const [saved, setSaved] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');

  // Filtered questions for sidebar
  const filteredQuestions = questions.filter(q =>
    questionSearch === '' || q.text.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  // ─── Settings handlers ────────────────────────────────────────
  const updateSettings = (partial: Partial<TestSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  // ─── Question handlers ────────────────────────────────────────
  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type,
      text: '',
      image: null,
      answers: [
        { id: `a-${Date.now()}-1`, text: '', isCorrect: false, image: null, explanation: '' },
        { id: `a-${Date.now()}-2`, text: '', isCorrect: false, image: null, explanation: '' },
      ],
    };
    setQuestions(prev => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
  };

  const deleteQuestion = (qId: string) => {
    setQuestions(prev => {
      const next = prev.filter(q => q.id !== qId);
      if (selectedQuestionId === qId) {
        setSelectedQuestionId(next[0]?.id || null);
      }
      return next;
    });
  };

  const duplicateQuestion = (qId: string) => {
    const src = questions.find(q => q.id === qId);
    if (!src) return;
    const dup: Question = {
      ...src,
      id: `q-${Date.now()}`,
      answers: src.answers.map(a => ({ ...a, id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
    };
    const idx = questions.findIndex(q => q.id === qId);
    setQuestions(prev => [...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)]);
    setSelectedQuestionId(dup.id);
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q));
  };

  const updateAnswer = (qId: string, aId: string, updates: Partial<Answer>) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        answers: q.answers.map(a => {
          if (a.id !== aId) return a;
          return { ...a, ...updates };
        }),
      };
    }));
  };

  const setCorrectAnswer = (qId: string, aId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      if (q.type === 'radio') {
        return { ...q, answers: q.answers.map(a => ({ ...a, isCorrect: a.id === aId })) };
      }
      return { ...q, answers: q.answers.map(a => a.id === aId ? { ...a, isCorrect: !a.isCorrect } : a) };
    }));
  };

  const addAnswer = (qId: string) => {
    const newA: Answer = { id: `a-${Date.now()}`, text: '', isCorrect: false, image: null, explanation: '' };
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answers: [...q.answers, newA] } : q));
  };

  const removeAnswer = (qId: string, aId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answers: q.answers.filter(a => a.id !== aId) } : q));
  };

  const moveQuestion = (fromIdx: number, toIdx: number) => {
    setQuestions(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── Access status options ────────────────────────────────────
  const accessOptions = [
    { id: 'open', label: 'Открытый', desc: 'Доступен сразу', dot: 'bg-emerald-500' },
    { id: 'closed', label: 'Закрытый', desc: 'Недоступен для студентов', dot: 'bg-neutral-400' },
    { id: 'scheduled', label: 'По расписанию', desc: 'Откроется в назначенные дату и время', dot: 'bg-blue-500' },
    { id: 'limited', label: 'Ограниченный период', desc: 'Доступен только в определённые даты', dot: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <PageHeader
        breadcrumbs={[
          { label: 'Курсы', href: '/courses' },
          { label: 'Содержание', href: `/courses/${courseId}` },
          { label: settings.title || 'Новый тест' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-2 text-[13px]">
              <FileSpreadsheet className="w-4 h-4" />
              Импорт Excel
            </Button>
            {saved && (
              <span className="text-[13px] text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4" /> Сохранено
              </span>
            )}
            <Button variant="primary" onClick={handleSave} className="gap-2 text-[13px]">
              <Save className="w-4 h-4" />
              Сохранить
            </Button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-100 rounded-xl p-1 w-fit">
          {([
            { key: 'settings' as const, label: 'Настройки' },
            { key: 'questions' as const, label: `Вопросы (${questions.length})` },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Settings Tab ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* General */}
            <SettingsCard title="Основная информация" description="Название, описание и обложка теста">
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Название теста</label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={e => updateSettings({ title: e.target.value })}
                    placeholder="Введите название теста..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Описание</label>
                  <textarea
                    value={settings.description}
                    onChange={e => updateSettings({ description: e.target.value })}
                    rows={3}
                    placeholder="Описание теста для студентов..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent bg-neutral-50 hover:bg-white focus:bg-white transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Обложка теста</label>
                  {settings.coverImage ? (
                    <div className="relative h-40 rounded-xl overflow-hidden group/cover">
                      <img src={settings.coverImage} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                        <button className="opacity-0 group-hover/cover:opacity-100 transition-opacity px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-neutral-800 shadow-lg flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> Заменить
                        </button>
                        <button
                          onClick={() => updateSettings({ coverImage: null })}
                          className="opacity-0 group-hover/cover:opacity-100 transition-opacity px-3 py-1.5 bg-rose-500/90 backdrop-blur-sm rounded-lg text-sm font-medium text-white shadow-lg flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" /> Удалить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 transition-all cursor-pointer">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[12px] font-medium">Загрузить обложку</span>
                      <span className="text-[11px] text-neutral-300">PNG, JPG. Рекомендуемый размер 1200×400</span>
                    </button>
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* Access */}
            <SettingsCard title="Доступ" description="Статус и порядок просмотра теста">
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Статус доступа</label>
                  <Dropdown
                    value={settings.accessStatus}
                    options={accessOptions}
                    onChange={v => updateSettings({ accessStatus: v as AccessStatus })}
                  />
                </div>
                {settings.accessStatus === 'scheduled' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Дата и время открытия</label>
                    <input
                      type="datetime-local"
                      value={settings.scheduledDate}
                      onChange={e => updateSettings({ scheduledDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                    />
                  </div>
                )}
                {settings.accessStatus === 'limited' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Дата начала</label>
                      <input type="datetime-local" value={settings.startDate} onChange={e => updateSettings({ startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Дата окончания</label>
                      <input type="datetime-local" value={settings.endDate} onChange={e => updateSettings({ endDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </SettingsCard>

            {/* Rules */}
            <SettingsCard title="Правила прохождения" description="Время, попытки, обязательность и оценка">
              <div className="space-y-1 divide-y divide-neutral-100">
                <Toggle
                  checked={settings.isMandatory}
                  onChange={v => updateSettings({ isMandatory: v })}
                  label="Обязательный тест"
                  description="Студент не сможет продолжить курс, не пройдя тест"
                  icon={ShieldCheck}
                />

                <Toggle
                  checked={settings.timeLimit}
                  onChange={v => updateSettings({ timeLimit: v })}
                  label="Ограничение по времени"
                  description="Установить таймер на прохождение теста"
                  icon={Clock}
                />
                {settings.timeLimit && (
                  <div className="pt-3 pb-2 pl-11 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Минут на прохождение</label>
                    <input
                      type="number" min={1} value={settings.timeLimitMinutes}
                      onChange={e => updateSettings({ timeLimitMinutes: Number(e.target.value) })}
                      className="w-32 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <div className="pt-3 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-neutral-800">Количество попыток</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">0 = неограниченное количество попыток</p>
                    </div>
                    <input
                      type="number" min={0} value={settings.attempts}
                      onChange={e => updateSettings({ attempts: Number(e.target.value) })}
                      className="w-20 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-3 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-neutral-800">Порог прохождения</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Минимальное количество правильных ответов</p>
                    </div>
                    <input
                      type="number" min={0} value={settings.passingThreshold}
                      onChange={e => updateSettings({ passingThreshold: Number(e.target.value) })}
                      className="w-20 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <Toggle
                  checked={settings.showResults}
                  onChange={v => updateSettings({ showResults: v })}
                  label="Показывать результаты"
                  description="Студент увидит правильные ответы после прохождения"
                  icon={Eye}
                />
              </div>
            </SettingsCard>

            {/* Shuffle & Count */}
            <SettingsCard title="Вопросы" description="Перемешивание и количество вопросов">
              <div className="space-y-1 divide-y divide-neutral-100">
                <Toggle
                  checked={settings.shuffleQuestions}
                  onChange={v => updateSettings({ shuffleQuestions: v })}
                  label="Перемешивать вопросы"
                  description="Вопросы будут выдаваться в случайном порядке"
                  icon={Shuffle}
                />
                <div className="pt-3 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-neutral-800">Количество вопросов в тесте</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Из {questions.length} загруженных. 0 = все вопросы</p>
                    </div>
                    <input
                      type="number" min={0} max={questions.length} value={settings.questionCount}
                      onChange={e => updateSettings({ questionCount: Number(e.target.value) })}
                      className="w-20 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ═══ Questions Tab ═══ */}
        {activeTab === 'questions' && (
          <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ minHeight: 'calc(100vh - 200px)' }}>
            
            {/* Marquee + scrollbar styles */}
            <style>{`
              .q-sidebar-scroll {
                scrollbar-width: thin;
                scrollbar-color: transparent transparent;
              }
              .q-sidebar-scroll:hover {
                scrollbar-color: rgba(0,0,0,0.15) transparent;
              }
              .q-sidebar-scroll::-webkit-scrollbar { width: 4px; }
              .q-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
              .q-sidebar-scroll::-webkit-scrollbar-thumb {
                background: transparent;
                border-radius: 4px;
              }
              .q-sidebar-scroll:hover::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.12);
              }
              @keyframes marquee-scroll {
                0% { transform: translateX(0); }
                10% { transform: translateX(0); }
                90% { transform: translateX(var(--scroll-distance)); }
                100% { transform: translateX(var(--scroll-distance)); }
              }
              .q-text-marquee {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .q-text-marquee .q-text-inner {
                white-space: nowrap;
              }
              .q-text-marquee:hover {
                text-overflow: clip;
              }
              .q-text-marquee:hover .q-text-inner.is-overflowing {
                display: inline-block;
                animation: marquee-scroll var(--scroll-duration, 3s) linear infinite;
              }
            `}</style>

            {/* ─── Left Sidebar: Question List ─── */}
            <div className="w-[280px] shrink-0">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-[88px]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <span className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Вопросы ({questions.length})</span>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-neutral-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={e => setQuestionSearch(e.target.value)}
                      placeholder="Поиск по вопросам..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] text-neutral-700 placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all"
                    />
                  </div>
                </div>

                {/* Question List */}
                <div className="max-h-[calc(100vh-320px)] overflow-y-auto py-1 q-sidebar-scroll">
                  {filteredQuestions.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-neutral-300">Ничего не найдено</div>
                  ) : (
                    filteredQuestions.map((q, fIdx) => {
                      const globalIdx = questions.findIndex(qo => qo.id === q.id);
                      const hasCorrect = q.answers.some(a => a.isCorrect);
                      const hasText = q.text.length > 0;
                      const isLast = fIdx === filteredQuestions.length - 1;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuestionId(q.id)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors group/qitem ${
                            selectedQuestionId === q.id
                              ? 'bg-neutral-100'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span className="text-[11px] font-semibold text-neutral-300 tabular-nums w-5 text-right shrink-0">{globalIdx + 1}</span>
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            q.type === 'radio' ? 'bg-blue-50 text-blue-500' : 'bg-violet-50 text-violet-500'
                          }`}>
                            {q.type === 'radio' ? <CircleDot className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                          </div>
                          <span className="flex-1 min-w-0 q-text-marquee">
                            <span
                              className={`q-text-inner text-[12px] text-neutral-700`}
                              ref={(el) => {
                                if (el) {
                                  const parent = el.parentElement;
                                  // Temporarily make inline-block to measure true width
                                  el.style.display = 'inline-block';
                                  if (parent && el.scrollWidth > parent.clientWidth) {
                                    el.classList.add('is-overflowing');
                                    const distance = el.scrollWidth - parent.clientWidth + 8;
                                    el.style.setProperty('--scroll-distance', `-${distance}px`);
                                    const duration = Math.max(2, distance / 40);
                                    parent.style.setProperty('--scroll-duration', `${duration}s`);
                                  } else {
                                    el.classList.remove('is-overflowing');
                                  }
                                  // Restore to inline so ellipsis works
                                  el.style.display = '';
                                }
                              }}
                            >
                              {q.text || 'Без названия'}
                            </span>
                          </span>
                          <div className="relative group/dot shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              hasText && hasCorrect
                                ? 'bg-emerald-400'
                                : hasText
                                  ? 'bg-blue-400'
                                  : 'bg-neutral-300'
                            }`} />
                            <div className={`absolute right-0 px-2 py-1 bg-neutral-900 rounded-md shadow-xl opacity-0 scale-95 group-hover/dot:opacity-100 group-hover/dot:scale-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap ${
                              isLast ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <p className="text-white text-[10px] font-medium">
                                {hasText && hasCorrect ? 'Готов — есть правильный ответ' : hasText ? 'Заполнен — нет правильного ответа' : 'Пустой вопрос'}
                              </p>
                              <div className={`absolute right-1.5 border-4 border-transparent ${
                                isLast ? 'top-full border-t-neutral-900' : 'bottom-full border-b-neutral-900'
                              }`} />
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Add question buttons */}
                <div className="border-t border-neutral-100 p-3 flex gap-2">
                  <button
                    onClick={() => addQuestion('radio')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-neutral-200 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 transition-all"
                  >
                    <CircleDot className="w-3 h-3" />
                    Radio
                  </button>
                  <button
                    onClick={() => addQuestion('checkbox')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-neutral-200 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 transition-all"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Checkbox
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Right: Question Editor ─── */}
            <div className="flex-1 min-w-0">
              {selectedQuestion ? (
                <div className="space-y-4">
                  {/* Question header */}
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    {/* Question toolbar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-bold text-neutral-400 tabular-nums">
                          Вопрос {questions.findIndex(q => q.id === selectedQuestion.id) + 1} из {questions.length}
                        </span>
                        <span className="text-neutral-200">|</span>
                        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuestion(selectedQuestion.id, { type: 'radio' })}
                            className={`flex items-center gap-1
                              px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                selectedQuestion.type === 'radio'
                                  ? 'bg-white text-neutral-900 shadow-sm'
                                  : 'text-neutral-500 hover:text-neutral-700'
                              }`}
                          >
                            <CircleDot className="w-3 h-3" /> Один ответ
                          </button>
                          <button
                            onClick={() => updateQuestion(selectedQuestion.id, { type: 'checkbox' })}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                selectedQuestion.type === 'checkbox'
                                  ? 'bg-white text-neutral-900 shadow-sm'
                                  : 'text-neutral-500 hover:text-neutral-700'
                              }`}
                          >
                            <CheckSquare className="w-3 h-3" /> Несколько ответов
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateQuestion(selectedQuestion.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                          title="Дублировать"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const idx = questions.findIndex(q => q.id === selectedQuestion.id);
                            if (idx > 0) { moveQuestion(idx, idx - 1); }
                          }}
                          disabled={questions.findIndex(q => q.id === selectedQuestion.id) === 0}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-30"
                          title="Переместить вверх"
                        >
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        </button>
                        <button
                          onClick={() => {
                            const idx = questions.findIndex(q => q.id === selectedQuestion.id);
                            if (idx < questions.length - 1) { moveQuestion(idx, idx + 1); }
                          }}
                          disabled={questions.findIndex(q => q.id === selectedQuestion.id) === questions.length - 1}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-30"
                          title="Переместить вниз"
                        >
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </button>
                        {questions.length > 1 && (
                          <button
                            onClick={() => deleteQuestion(selectedQuestion.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-1"
                            title="Удалить вопрос"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="px-5 py-4">
                      <textarea
                        value={selectedQuestion.text}
                        onChange={e => updateQuestion(selectedQuestion.id, { text: e.target.value })}
                        rows={2}
                        placeholder="Введите текст вопроса..."
                        className="w-full text-[15px] font-medium text-neutral-900 placeholder-neutral-300 resize-none border-0 focus:outline-none focus:ring-0 bg-transparent leading-relaxed"
                      />

                      {/* Question image */}
                      {selectedQuestion.image ? (
                        <div className="relative mt-3 rounded-xl overflow-hidden w-fit group/qimg">
                          <img src={selectedQuestion.image} alt="" className="max-h-48 rounded-xl" />
                          <button
                            onClick={() => updateQuestion(selectedQuestion.id, { image: null })}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover/qimg:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
                          <ImageIcon className="w-3.5 h-3.5" /> Добавить изображение
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="space-y-2">
                    {selectedQuestion.answers.map((answer, aIdx) => (
                      <div key={answer.id} className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="flex items-start gap-3 px-5 py-4">
                          {/* Correct indicator */}
                          <button
                            onClick={() => setCorrectAnswer(selectedQuestion.id, answer.id)}
                            className={`mt-1 shrink-0 flex items-center justify-center transition-all ${
                              selectedQuestion.type === 'radio'
                                ? `w-5 h-5 rounded-full border-2 ${answer.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300 hover:border-neutral-400'}`
                                : `w-5 h-5 rounded-md border-2 ${answer.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300 hover:border-neutral-400'}`
                            }`}
                            title={answer.isCorrect ? 'Правильный ответ' : 'Отметить как правильный'}
                          >
                            {answer.isCorrect && <Check className="w-3 h-3 text-white" />}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold text-neutral-300 uppercase">Вариант {String.fromCharCode(65 + aIdx)}</span>
                              {answer.isCorrect && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✓ Верный</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={answer.text}
                              onChange={e => updateAnswer(selectedQuestion.id, answer.id, { text: e.target.value })}
                              placeholder="Текст ответа..."
                              className="w-full text-[13px] text-neutral-800 placeholder-neutral-300 border-0 focus:outline-none focus:ring-0 bg-transparent font-medium"
                            />

                            {/* Answer image */}
                            {answer.image ? (
                              <div className="relative mt-2 rounded-lg overflow-hidden w-fit group/aimg">
                                <img src={answer.image} alt="" className="max-h-24 rounded-lg" />
                                <button
                                  onClick={() => updateAnswer(selectedQuestion.id, answer.id, { image: null })}
                                  className="absolute top-1 right-1 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover/aimg:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : null}

                            {/* Explanation */}
                            <div className="mt-2">
                              <input
                                type="text"
                                value={answer.explanation}
                                onChange={e => updateAnswer(selectedQuestion.id, answer.id, { explanation: e.target.value })}
                                placeholder="Описание ответа (показывается в результатах)..."
                                className="w-full text-[11px] text-neutral-500 placeholder-neutral-300 border-0 focus:outline-none focus:ring-0 bg-transparent italic"
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 mt-1 shrink-0">
                            <button
                              className="p-1 rounded text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 transition-colors"
                              title="Добавить изображение"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            {selectedQuestion.answers.length > 2 && (
                              <button
                                onClick={() => removeAnswer(selectedQuestion.id, answer.id)}
                                className="p-1 rounded text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Удалить вариант"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add answer */}
                    <button
                      onClick={() => addAnswer(selectedQuestion.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200 rounded-2xl text-[12px] font-medium text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 hover:bg-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить вариант ответа
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        const idx = questions.findIndex(q => q.id === selectedQuestion.id);
                        if (idx > 0) setSelectedQuestionId(questions[idx - 1].id);
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion.id) === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-neutral-500 hover:bg-white hover:text-neutral-700 border border-transparent hover:border-neutral-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" /> Предыдущий
                    </button>
                    <button
                      onClick={() => {
                        const idx = questions.findIndex(q => q.id === selectedQuestion.id);
                        if (idx < questions.length - 1) setSelectedQuestionId(questions[idx + 1].id);
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion.id) === questions.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-neutral-500 hover:bg-white hover:text-neutral-700 border border-transparent hover:border-neutral-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Следующий <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">Нет вопросов</h3>
                  <p className="text-[13px] text-neutral-400 max-w-sm mb-4">Добавьте первый вопрос, чтобы начать создание теста</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => addQuestion('radio')} className="gap-2 text-[13px]">
                      <CircleDot className="w-4 h-4" /> Один ответ
                    </Button>
                    <Button variant="secondary" onClick={() => addQuestion('checkbox')} className="gap-2 text-[13px]">
                      <CheckSquare className="w-4 h-4" /> Несколько ответов
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
