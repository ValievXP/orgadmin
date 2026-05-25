"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronDown, 
  Save, 
  BookOpen, 
  Type, 
  Video, 
  Image as ImageIcon, 
  ListOrdered, 
  FileText, 
  Info, 
  MousePointer2, 
  HelpCircle, 
  Code2, 
  Table, 
  LayoutGrid, 
  Folder,
  ArrowLeft,
  Search,
  CheckCircle2,
  Users,
  Clock,
  BarChart,
  Eye,
  Star,
  Check,
  Award,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock responses database for the survey
const MOCK_SUBMISSIONS = [
  {
    id: 'sub1',
    studentName: 'Иван Сергеев',
    email: 'ivan@example.com',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    date: '24.05.2026 14:20',
    answers: {
      q1: 5,
      q2: 'Каждый день',
      q3: ['Нечеткие задачи', 'Слишком много созвонов'],
      q4: 'Было бы круто разгрузить календарь от лишних митингов, особенно в первой половине дня.'
    }
  },
  {
    id: 'sub2',
    studentName: 'Мария Власова',
    email: 'maria@example.com',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    date: '24.05.2026 15:10',
    answers: {
      q1: 4,
      q2: 'Несколько раз в неделю',
      q3: ['Шум в офисе'],
      q4: 'Офис на третьем этаже довольно шумный, хотелось бы больше тихих зон для сфокусированной работы.'
    }
  },
  {
    id: 'sub3',
    studentName: 'Петр Николаев',
    email: 'petr@example.com',
    avatarColor: 'bg-amber-100 text-amber-700',
    date: '25.05.2026 10:05',
    answers: {
      q1: 4,
      q2: 'Каждый день',
      q3: ['Слишком много созвонов', 'Другое'],
      q4: 'Все отлично, коммуникации выстроены хорошо.'
    }
  },
  {
    id: 'sub4',
    studentName: 'Анна Смирнова',
    email: 'anna@example.com',
    avatarColor: 'bg-rose-100 text-rose-700',
    date: '25.05.2026 11:30',
    answers: {
      q1: 3,
      q2: 'Раз в неделю',
      q3: ['Нечеткие задачи', 'Плохое оборудование'],
      q4: 'Ноутбук иногда виснет на сложных проектах в Figma, хотелось бы обновить железо.'
    }
  }
];

export default function SurveyEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Tab states: 'editor' | 'preview' | 'results'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'results'>('editor');
  
  // Constructor States
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('Опрос удовлетворенности сотрудников');
  const [accessType, setAccessType] = useState('Открытый');
  const [toggles, setToggles] = useState({
    rating: true,
    timer: true,
    feedback: false,
    homework: false
  });
  const [timerMinutes, setTimerMinutes] = useState('5');
  
  // Preview Interactive States
  const [prevRating, setPrevRating] = useState<number>(0);
  const [prevHoverRating, setPrevHoverRating] = useState<number>(0);
  const [prevQ2Val, setPrevQ2Val] = useState<string>('');
  const [prevQ3Val, setPrevQ3Val] = useState<string[]>([]);
  const [prevQ4Val, setPrevQ4Val] = useState<string>('');

  // Results Sub-tabs: 'summary' | 'individual'
  const [resultsMode, setResultsMode] = useState<'summary' | 'individual'>('summary');
  const [selectedSubId, setSelectedSubId] = useState<string>('sub1');
  const [openTextSearch, setOpenTextSearch] = useState<string>('');

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQ3Toggle = (val: string) => {
    setPrevQ3Val(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  // Selected individual submission data
  const selectedSubmission = useMemo(() => {
    return MOCK_SUBMISSIONS.find(s => s.id === selectedSubId) || MOCK_SUBMISSIONS[0];
  }, [selectedSubId]);

  // Filter open-ended responses
  const openTextResponses = useMemo(() => {
    const list = MOCK_SUBMISSIONS.map(s => ({
      name: s.studentName,
      email: s.email,
      date: s.date,
      avatarColor: s.avatarColor,
      text: s.answers.q4
    }));
    if (!openTextSearch.trim()) return list;
    const q = openTextSearch.toLowerCase();
    return list.filter(r => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  }, [openTextSearch]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium">
            <button 
              onClick={() => router.push('/surveys')} 
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link href="/surveys" className="hover:text-neutral-900 transition-colors">Опросы</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 font-semibold">{surveyTitle}</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-0.5 shadow-inner">
            {[
              { id: 'editor', label: 'Конструктор' },
              { id: 'preview', label: 'Предпросмотр' },
              { id: 'results', label: 'Ответы' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button variant="primary" className="h-9 gap-2 shadow-sm rounded-xl">
            <Save className="w-4 h-4" />
            Сохранить
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-8 flex flex-col gap-8 animate-in fade-in duration-300">
        
        {/* Editor Constructor Tab */}
        {activeTab === 'editor' && (
          <div className="flex flex-col gap-8">
            {/* Title Editor */}
            <div>
              <input 
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                className="text-3xl font-bold text-neutral-900 bg-transparent outline-none w-full border-b border-transparent hover:border-neutral-200 focus:border-neutral-300 transition-all placeholder:text-neutral-300 py-1"
                placeholder="Введите название опроса"
              />
            </div>

            {/* Settings Block */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-neutral-900 font-bold text-[15px]">
                  <BookOpen className="w-5 h-5 text-neutral-400" />
                  Настройки опроса
                </div>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSettingsOpen && (
                <div className="p-6 pt-0 border-t border-neutral-100 flex flex-col gap-8 animate-in slide-in-from-top-2 fade-in duration-200">
                  {/* Access Type */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">ТИП ДОСТУПА</label>
                    <div className="relative w-full max-w-sm">
                      <select 
                        value={accessType}
                        onChange={(e) => setAccessType(e.target.value)}
                        className="w-full h-11 px-4 appearance-none bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] transition-all cursor-pointer"
                      >
                        <option value="Открытый">🟢 Открытый</option>
                        <option value="По расписанию">🔵 По расписанию</option>
                        <option value="Ограниченное время">🟠 Ограниченное время</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Toggles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Rating */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Star className="w-4 h-4 text-neutral-400 fill-neutral-100" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">Оценка опроса</div>
                          <div className="text-xs text-neutral-500 mt-0.5">От 1 до 5 звёзд</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggle('rating')}
                        className={`w-10 h-5.5 flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 ${toggles.rating ? 'bg-[var(--color-admin-primary-500)]' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${toggles.rating ? 'translate-x-[19px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Feedback */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">Развёрнутый отзыв</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Текстовый комментарий</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggle('feedback')}
                        className={`w-10 h-5.5 flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 ${toggles.feedback ? 'bg-[var(--color-admin-primary-500)]' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${toggles.feedback ? 'translate-x-[19px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Timer */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="w-full">
                          <div className="font-bold text-neutral-900 text-sm">Таймер-блокировка</div>
                          <div className="text-xs text-neutral-500 mt-0.5 mb-3">Мин. время на опрос</div>
                          {toggles.timer && (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={timerMinutes}
                                onChange={(e) => setTimerMinutes(e.target.value)}
                                className="w-16 h-9 px-3 border border-neutral-200 rounded-lg text-sm text-center font-medium outline-none focus:border-[var(--color-admin-primary-500)] transition-colors"
                              />
                              <span className="text-sm text-neutral-500 font-medium">минут</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggle('timer')}
                        className={`w-10 h-5.5 flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 mt-1 ${toggles.timer ? 'bg-[var(--color-admin-primary-500)]' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${toggles.timer ? 'translate-x-[19px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Homework */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">Домашнее задание</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Чат с куратором</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggle('homework')}
                        className={`w-10 h-5.5 flex items-center rounded-full transition-colors duration-200 ease-in-out shrink-0 ${toggles.homework ? 'bg-[var(--color-admin-primary-500)]' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${toggles.homework ? 'translate-x-[19px]' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-900 text-[15px]">Содержание опроса</h3>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">4 вопроса</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Visual Block list representing survey builder content */}
                {[
                  { index: 1, type: 'Оценка (1-5 звёзд)', q: 'Оцените общую атмосферу в коллективе от 1 до 5 звезд' },
                  { index: 2, type: 'Один выбор', q: 'Как часто вы общаетесь со своим руководителем?' },
                  { index: 3, type: 'Множественный выбор', q: 'Какие факторы мешают вашей продуктивности? (выберите все подходящие)' },
                  { index: 4, type: 'Открытый текст', q: 'Что бы вы хотели изменить или улучшить в рабочих процессах?' }
                ].map((item) => (
                  <div key={item.index} className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-neutral-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.index}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider bg-[var(--color-admin-primary-50)] px-2 py-0.5 rounded">{item.type}</span>
                        <h4 className="font-semibold text-neutral-800 text-sm mt-1">{item.q}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs font-bold text-neutral-500 hover:text-neutral-900 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">Редактировать</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Tab */}
        {activeTab === 'preview' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-600)] rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{surveyTitle}</h2>
                <div className="flex items-center gap-4 text-xs text-neutral-400 font-semibold mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Блокировка: {timerMinutes} мин</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Тип: {accessType}</span>
                </div>
              </div>
            </div>

            {/* Questions Container */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-8 lg:p-10 shadow-sm flex flex-col gap-8">
              
              {/* Question 1: Stars Rating */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider">Вопрос 1 из 4 • Оценка</span>
                <h3 className="text-base font-bold text-neutral-900">Оцените общую атмосферу в коллективе от 1 до 5 звезд</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= prevRating;
                    const isHovered = star <= prevHoverRating;
                    return (
                      <button
                        key={star}
                        onClick={() => setPrevRating(star)}
                        onMouseEnter={() => setPrevHoverRating(star)}
                        onMouseLeave={() => setPrevHoverRating(0)}
                        className="p-1 rounded transition-transform active:scale-90"
                      >
                        <Star className={`w-8 h-8 transition-colors ${
                          isHovered || isSelected 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-neutral-300'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 2: Single Choice */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider">Вопрос 2 из 4 • Один выбор</span>
                <h3 className="text-base font-bold text-neutral-900">Как часто вы общаетесь со своим руководителем?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {['Каждый день', 'Несколько раз в неделю', 'Раз в неделю', 'Раз в месяц или реже'].map((opt) => {
                    const isSelected = prevQ2Val === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setPrevQ2Val(opt)}
                        className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-800)]'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-500)]' : 'border-neutral-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 3: Multiple Choice */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider">Вопрос 3 из 4 • Множественный выбор</span>
                <h3 className="text-base font-bold text-neutral-900">Какие факторы мешают вашей продуктивности? (выберите все подходящие)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {['Шум в офисе', 'Нечеткие задачи', 'Слишком много созвонов', 'Плохое оборудование', 'Другое'].map((opt) => {
                    const isSelected = prevQ3Val.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleQ3Toggle(opt)}
                        className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-800)]'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-500)]' : 'border-neutral-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 4: Open Ended */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider">Вопрос 4 из 4 • Открытый ответ</span>
                <h3 className="text-base font-bold text-neutral-900">Что бы вы хотели изменить или улучшить в рабочих процессах?</h3>
                <textarea
                  value={prevQ4Val}
                  onChange={(e) => setPrevQ4Val(e.target.value)}
                  placeholder="Ваши предложения и мысли..."
                  rows={4}
                  className="w-full mt-2 p-4 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-850 outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] transition-all resize-none shadow-inner"
                />
              </div>

              <div className="h-px bg-neutral-100 mt-4" />

              {/* Submit simulation */}
              <div className="flex justify-end gap-3 mt-2">
                <Button 
                  onClick={() => {
                    setPrevRating(0);
                    setPrevQ2Val('');
                    setPrevQ3Val([]);
                    setPrevQ4Val('');
                  }}
                  variant="outline" 
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-white text-neutral-600 border-neutral-200"
                >
                  Сбросить ответы
                </Button>
                <Button 
                  onClick={() => alert('Ответы записаны в демо-режиме!')}
                  variant="primary" 
                  className="h-10 px-6 rounded-xl text-sm font-bold shadow-md"
                >
                  Отправить
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* Results and Answers Tab */}
        {activeTab === 'results' && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Upper Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-[var(--color-admin-primary-50)] rounded-full -mr-4 -mt-4 opacity-50" />
                <Users className="w-5 h-5 text-[var(--color-admin-primary-500)] mb-3 relative z-10" />
                <span className="text-2xl font-bold text-neutral-900 relative z-10">118</span>
                <span className="text-[12px] font-semibold text-neutral-400 mt-1 relative z-10">Всего ответов</span>
              </div>
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3 relative z-10" />
                <span className="text-2xl font-bold text-neutral-900 relative z-10">94%</span>
                <span className="text-[12px] font-semibold text-neutral-400 mt-1 relative z-10">Процент завершения</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <Clock className="w-5 h-5 text-blue-500 mb-3 relative z-10" />
                <span className="text-2xl font-bold text-neutral-900 relative z-10">4.5 мин</span>
                <span className="text-[12px] font-semibold text-neutral-400 mt-1 relative z-10">Среднее время</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-amber-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <Star className="w-5 h-5 text-amber-500 fill-amber-500 mb-3 relative z-10" />
                <span className="text-2xl font-bold text-neutral-900 relative z-10">4.2 / 5</span>
                <span className="text-[12px] font-semibold text-neutral-400 mt-1 relative z-10">Средняя оценка</span>
              </div>
            </div>

            {/* Results Modes toggler */}
            <div className="flex border-b border-neutral-200 w-full gap-6">
              <button
                onClick={() => setResultsMode('summary')}
                className={`py-3.5 text-sm font-bold border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'summary' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <BarChart className="w-4 h-4" />
                Сводка результатов
              </button>
              <button
                onClick={() => setResultsMode('individual')}
                className={`py-3.5 text-sm font-bold border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'individual' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Отдельные ответы ({MOCK_SUBMISSIONS.length})
              </button>
            </div>

            {/* SUMMARY VIEW */}
            {resultsMode === 'summary' && (
              <div className="flex flex-col gap-8">
                
                {/* Star rating analysis card */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ОЦЕНКА</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">Оцените общую атмосферу в коллективе от 1 до 5 звезд</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex flex-col items-center bg-neutral-50 border border-neutral-100 rounded-2xl px-8 py-6 shrink-0 min-w-[160px]">
                      <span className="text-5xl font-extrabold text-neutral-900">4.2</span>
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4,5].map(st => (
                          <Star key={st} className={`w-4 h-4 ${st <= 4 ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400 font-semibold mt-2">На основе 118 оценок</span>
                    </div>

                    <div className="flex-1 w-full space-y-3.5">
                      {[
                        { label: '5 звёзд', count: 68, pct: 58, color: 'bg-emerald-500' },
                        { label: '4 звезды', count: 28, pct: 24, color: 'bg-blue-500' },
                        { label: '3 звезды', count: 16, pct: 13, color: 'bg-amber-500' },
                        { label: '2 звезды', count: 4, pct: 3, color: 'bg-orange-500' },
                        { label: '1 звезда', count: 2, pct: 2, color: 'bg-rose-500' }
                      ].map((bar) => (
                        <div key={bar.label} className="flex items-center gap-3">
                          <span className="w-16 text-xs text-neutral-500 font-bold leading-none">{bar.label}</span>
                          <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden relative shadow-inner">
                            <div style={{ width: `${bar.pct}%` }} className={`h-full ${bar.color} rounded-full transition-all duration-1000`} />
                          </div>
                          <span className="w-14 text-right text-xs font-bold text-neutral-800">{bar.pct}%</span>
                          <span className="w-20 text-right text-[11px] text-neutral-400 font-semibold">({bar.count} отв.)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Single Choice Analysis Card */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ОДИН ВЫБОР</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">Как часто вы общаетесь со своим руководителем?</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { option: 'Каждый день', count: 53, pct: 45, color: 'bg-[var(--color-admin-primary-500)]' },
                      { option: 'Несколько раз в неделю', count: 41, pct: 35, color: 'bg-indigo-500' },
                      { option: 'Раз в неделю', count: 18, pct: 15, color: 'bg-sky-500' },
                      { option: 'Раз в месяц или реже', count: 6, pct: 5, color: 'bg-neutral-400' }
                    ].map((row) => (
                      <div key={row.option} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-800">{row.option}</span>
                          <div className="flex gap-2 items-center text-neutral-500 font-bold">
                            <span>{row.pct}%</span>
                            <span className="text-neutral-300 font-normal">|</span>
                            <span className="text-neutral-400">{row.count} ответов</span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden shadow-sm">
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-lg transition-all duration-1000`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multiple Choice Analysis Card */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">Какие факторы мешают вашей продуктивности? (выберите все подходящие)</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { option: 'Слишком много созвонов', count: 72, pct: 61, color: 'bg-rose-500' },
                      { option: 'Нечеткие задачи', count: 48, pct: 41, color: 'bg-amber-500' },
                      { option: 'Шум в офисе', count: 35, pct: 30, color: 'bg-blue-500' },
                      { option: 'Плохое оборудование', count: 18, pct: 15, color: 'bg-violet-500' },
                      { option: 'Другое', count: 8, pct: 7, color: 'bg-slate-400' }
                    ].map((row) => (
                      <div key={row.option} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-800">{row.option}</span>
                          <div className="flex gap-2 items-center text-neutral-500 font-bold">
                            <span>{row.pct}%</span>
                            <span className="text-neutral-300 font-normal">|</span>
                            <span className="text-neutral-400">{row.count} ответов</span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden shadow-sm">
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-lg transition-all duration-1000`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Ended Text Responses Card */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОТКРЫТЫЕ ОТВЕТЫ</span>
                      <h3 className="text-base font-bold text-neutral-800 mt-1">Что бы вы хотели изменить или улучшить в рабочих процессах?</h3>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Поиск по ответам..."
                        value={openTextSearch}
                        onChange={(e) => setOpenTextSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 border border-neutral-200 bg-neutral-50/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                    {openTextResponses.length === 0 ? (
                      <div className="py-12 text-center text-xs text-neutral-400">Ничего не найдено</div>
                    ) : (
                      openTextResponses.map((item, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-3 hover:bg-neutral-50/80 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner ${item.avatarColor}`}>
                                {item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-850 leading-tight">{item.name}</span>
                                <span className="text-[10px] text-neutral-400 font-semibold leading-tight">{item.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-semibold">{item.date}</span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed text-neutral-700">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* INDIVIDUAL SUBMISSIONS VIEW */}
            {resultsMode === 'individual' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Students Sidebar */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Отправители ({MOCK_SUBMISSIONS.length})</h3>
                  <div className="flex flex-col gap-1.5">
                    {MOCK_SUBMISSIONS.map((sub) => {
                      const isSelected = sub.id === selectedSubId;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubId(sub.id)}
                          className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                            isSelected 
                              ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] shadow-sm'
                              : 'border-transparent hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${sub.avatarColor}`}>
                              {sub.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-neutral-800 truncate">{sub.studentName}</span>
                              <span className="text-[10px] text-neutral-400 font-medium truncate">{sub.email}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submission Answers view */}
                <div className="md:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${selectedSubmission.avatarColor}`}>
                        {selectedSubmission.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-neutral-800 text-sm leading-tight">{selectedSubmission.studentName}</h4>
                        <span className="text-xs text-neutral-400 mt-0.5 leading-tight">{selectedSubmission.email}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-semibold">{selectedSubmission.date}</span>
                  </div>

                  {/* Answers Questionnaire simulation */}
                  <div className="space-y-6">
                    {/* Q1 answer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ОЦЕНКА</span>
                      <h4 className="font-semibold text-neutral-700 text-[14px]">Оцените общую атмосферу в коллективе от 1 до 5 звезд</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-5 h-5 ${star <= selectedSubmission.answers.q1 ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q2 answer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ОДИН ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-[14px]">Как часто вы общаетесь со своим руководителем?</h4>
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-150 text-xs font-bold text-neutral-800 w-fit">
                        {selectedSubmission.answers.q2}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q3 answer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-[14px]">Какие факторы мешают вашей продуктивности? (выберите все подходящие)</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubmission.answers.q3.map((opt) => (
                          <span key={opt} className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 text-neutral-700 text-xs font-semibold">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q4 answer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОТКРЫТЫЙ ОТВЕТ</span>
                      <h4 className="font-semibold text-neutral-700 text-[14px]">Что бы вы хотели изменить или улучшить в рабочих процессах?</h4>
                      <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs font-medium leading-relaxed text-neutral-700">
                        {selectedSubmission.answers.q4 || <span className="text-neutral-400 italic">Студент оставил поле пустым</span>}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
