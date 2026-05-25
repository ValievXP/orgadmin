"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Eye, 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search,
  Check,
  Unlock,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Refined Mock Survey Definition
const MOCK_SURVEY = {
  id: 'SRV-821',
  title: 'Опрос удовлетворенности сотрудников',
  description: 'Пожалуйста, ответьте на вопросы честно. Это поможет сделать условия работы в компании комфортнее для каждого.',
  lang: 'RUS',
  status: 'Active',
  type: 'Открытый',
  timerMinutes: 5,
  totalStudents: 142,
  content: [
    {
      id: 'block-text-intro',
      type: 'text',
      html: 'Приветствуем! В рамках регулярной оценки внутреннего климата мы проводим этот анонимный опрос. Ответы помогут нам оптимизировать распределение задач и улучшить коммуникации.'
    },
    {
      id: 'block-img-decor',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop',
      caption: 'Наши рабочие будни и атмосфера в OSNOVA'
    },
    {
      id: 'q1',
      type: 'yes_no',
      text: '1. Довольны ли вы текущим гибридным форматом работы?',
      options: ['Да', 'Нет'],
      required: true
    },
    {
      id: 'q2',
      type: 'rating_5',
      text: '2. Оцените уровень организации рабочих процессов в вашей команде (1 - очень плохо, 5 - отлично)',
      required: true
    },
    {
      id: 'q3',
      type: 'emoji',
      text: '3. С каким настроением вы чаще всего завершаете рабочий день?',
      options: ['😞', '🙁', '😐', '🙂', '🤩'],
      required: true
    },
    {
      id: 'q4',
      type: 'single',
      text: '4. Как часто вы общаетесь со своим руководителем тет-а-тет?',
      options: ['Каждый день', 'Несколько раз в неделю', 'Раз в неделю', 'Раз в месяц или реже'],
      required: true
    },
    {
      id: 'q5',
      type: 'multiple',
      text: '5. Какие факторы сильнее всего снижают вашу продуктивность? (выберите все подходящие)',
      options: ['Шум в офисе', 'Нечетко поставленные задачи', 'Слишком много созвонов', 'Проблемы с оборудованием', 'Другое'],
      required: false
    },
    {
      id: 'q6',
      type: 'open',
      text: '6. Что бы вы хотели изменить или улучшить в рабочих процессах нашей компании?',
      required: false
    }
  ]
};

// Refined Mock Submissions Database (matching 5 emojis and revised options)
const MOCK_SUBMISSIONS = [
  {
    id: 'sub1',
    studentName: 'Иван Сергеев',
    email: 'ivan@example.com',
    avatarColor: 'bg-indigo-50 text-indigo-600',
    date: '24.05.2026 14:20',
    answers: {
      q1: 'Да',
      q2: 5,
      q3: '🤩',
      q4: 'Каждый день',
      q5: ['Нечетко поставленные задачи', 'Слишком много созвонов'],
      q6: 'Было бы круто разгрузить календарь от лишних митингов, особенно в первой половине дня.'
    }
  },
  {
    id: 'sub2',
    studentName: 'Мария Власова',
    email: 'maria@example.com',
    avatarColor: 'bg-emerald-50 text-emerald-600',
    date: '24.05.2026 15:10',
    answers: {
      q1: 'Да',
      q2: 4,
      q3: '🙂',
      q4: 'Несколько раз в неделю',
      q5: ['Шум в офисе'],
      q6: 'Офис на третьем этаже довольно шумный, хотелось бы больше тихих зон для сфокусированной работы.'
    }
  },
  {
    id: 'sub3',
    studentName: 'Петр Николаев',
    email: 'petr@example.com',
    avatarColor: 'bg-amber-50 text-amber-600',
    date: '25.05.2026 10:05',
    answers: {
      q1: 'Да',
      q2: 4,
      q3: '🙂',
      q4: 'Каждый день',
      q5: ['Слишком много созвонов', 'Другое'],
      q6: 'Все отлично, коммуникации выстроены хорошо.'
    }
  },
  {
    id: 'sub4',
    studentName: 'Анна Смирнова',
    email: 'anna@example.com',
    avatarColor: 'bg-rose-50 text-rose-600',
    date: '25.05.2026 11:30',
    answers: {
      q1: 'Нет',
      q2: 3,
      q3: '😐',
      q4: 'Раз в неделю',
      q5: ['Нечетко поставленные задачи', 'Проблемы с оборудованием'],
      q6: 'Ноутбук иногда виснет на сложных проектах в Figma, хотелось бы обновить железо.'
    }
  },
  {
    id: 'sub5',
    studentName: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    avatarColor: 'bg-blue-50 text-blue-600',
    date: '25.05.2026 12:15',
    answers: {
      q1: 'Да',
      q2: 5,
      q3: '🤩',
      q4: 'Несколько раз в неделю',
      q5: ['Другое'],
      q6: 'Очень нравятся пятничные посиделки и общая атмосфера.'
    }
  },
  {
    id: 'sub6',
    studentName: 'Елена Кузнецова',
    email: 'elena@example.com',
    avatarColor: 'bg-purple-50 text-purple-600',
    date: '25.05.2026 13:40',
    answers: {
      q1: 'Да',
      q2: 4,
      q3: '🙂',
      q4: 'Раз в неделю',
      q5: ['Шум в офисе', 'Слишком много созвонов'],
      q6: 'Созвонов действительно многовато, иногда не хватает времени на непосредственную разработку.'
    }
  },
  {
    id: 'sub7',
    studentName: 'Алексей Петров',
    email: 'alexey@example.com',
    avatarColor: 'bg-teal-50 text-teal-600',
    date: '25.05.2026 14:02',
    answers: {
      q1: 'Нет',
      q2: 2,
      q3: '🙁',
      q4: 'Раз в месяц или реже',
      q5: ['Нечетко поставленные задачи', 'Проблемы с оборудованием', 'Шум в офисе'],
      q6: 'Сложно планировать задачи, требования часто меняются на ходу.'
    }
  },
  {
    id: 'sub8',
    studentName: 'Ольга Соколова',
    email: 'olga@example.com',
    avatarColor: 'bg-pink-50 text-pink-600',
    date: '25.05.2026 15:55',
    answers: {
      q1: 'Да',
      q2: 4,
      q3: '🙂',
      q4: 'Несколько раз в неделю',
      q5: ['Слишком много созвонов'],
      q6: 'Было бы здорово иметь один день в неделю без созвонов.'
    }
  },
  {
    id: 'sub9',
    studentName: 'Владимир Морозов',
    email: 'vladimir@example.com',
    avatarColor: 'bg-violet-50 text-violet-600',
    date: '25.05.2026 16:30',
    answers: {
      q1: 'Да',
      q2: 5,
      q3: '🤩',
      q4: 'Несколько раз в неделю',
      q5: [],
      q6: 'Процессы выстроены на высшем уровне. Спасибо HR отделу за заботу!'
    }
  },
  {
    id: 'sub10',
    studentName: 'Екатерина Павлова',
    email: 'katerina@example.com',
    avatarColor: 'bg-orange-50 text-orange-600',
    date: '25.05.2026 17:12',
    answers: {
      q1: 'Да',
      q2: 3,
      q3: '😐',
      q4: 'Раз в неделю',
      q5: ['Нечетко поставленные задачи'],
      q6: 'Иногда задачи ставятся устно без тасков в Jira, сложно потом отслеживать коммиты.'
    }
  }
];

export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Tab selector: 'preview' | 'results'
  const [activeTab, setActiveTab] = useState<'preview' | 'results'>('preview');
  
  // Results view sub-tabs: 'summary' | 'individual'
  const [resultsMode, setResultsMode] = useState<'summary' | 'individual'>('summary');

  // Interactive preview input states
  const [prevQ1Val, setPrevQ1Val] = useState<string>('');
  const [prevQ2Val, setPrevQ2Val] = useState<number>(0);
  const [prevQ3Val, setPrevQ3Val] = useState<string>('');
  const [prevQ4Val, setPrevQ4Val] = useState<string>('');
  const [prevQ5Val, setPrevQ5Val] = useState<string[]>([]);
  const [prevQ6Val, setPrevQ6Val] = useState<string>('');

  // Results open-ended text pagination & search
  const [openTextSearch, setOpenTextSearch] = useState<string>('');
  const [openTextPage, setOpenTextPage] = useState<number>(1);
  const [openTextLimit, setOpenTextLimit] = useState<number>(5);

  // Individual responses filter states
  const [selectedSubId, setSelectedSubId] = useState<string>('sub1');
  const [individualSearch, setIndividualSearch] = useState<string>('');
  const [individualPage, setIndividualPage] = useState<number>(1);
  const [individualLimit, setIndividualLimit] = useState<number>(5);

  const handleQ5Toggle = (opt: string) => {
    setPrevQ5Val(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  // Metrics parameters
  const totalStudents = MOCK_SURVEY.totalStudents;
  const totalReplies = 118;
  const completionRate = Math.round((totalReplies / totalStudents) * 100);
  const averageTime = '4.2 мин';

  // Filter open-ended responses
  const filteredOpenTextResponses = useMemo(() => {
    const raw = MOCK_SUBMISSIONS.map(s => ({
      name: s.studentName,
      email: s.email,
      date: s.date,
      avatarColor: s.avatarColor,
      text: s.answers.q6
    })).filter(r => r.text);
    
    if (!openTextSearch.trim()) return raw;
    const query = openTextSearch.toLowerCase();
    return raw.filter(r => r.text.toLowerCase().includes(query) || r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query));
  }, [openTextSearch]);

  const openTextTotalPages = Math.ceil(filteredOpenTextResponses.length / openTextLimit);
  const paginatedOpenTextResponses = useMemo(() => {
    const start = (openTextPage - 1) * openTextLimit;
    return filteredOpenTextResponses.slice(start, start + openTextLimit);
  }, [filteredOpenTextResponses, openTextPage, openTextLimit]);

  // Sidebar student search
  const filteredSubmissions = useMemo(() => {
    if (!individualSearch.trim()) return MOCK_SUBMISSIONS;
    const query = individualSearch.toLowerCase();
    return MOCK_SUBMISSIONS.filter(s => s.studentName.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
  }, [individualSearch]);

  const individualTotalPages = Math.ceil(filteredSubmissions.length / individualLimit);
  const paginatedSubmissions = useMemo(() => {
    const start = (individualPage - 1) * individualLimit;
    return filteredSubmissions.slice(start, start + individualLimit);
  }, [filteredSubmissions, individualPage, individualLimit]);

  const selectedSubmission = useMemo(() => {
    return MOCK_SUBMISSIONS.find(s => s.id === selectedSubId) || MOCK_SUBMISSIONS[0];
  }, [selectedSubId]);

  // Page resets
  React.useEffect(() => {
    setOpenTextPage(1);
  }, [openTextSearch, openTextLimit]);

  React.useEffect(() => {
    setIndividualPage(1);
  }, [individualSearch, individualLimit]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] w-full text-neutral-800 pb-16">
      
      {/* Top sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm w-full">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto w-full">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-500 font-medium">
            <button 
              onClick={() => router.push('/surveys')} 
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <Link href="/surveys" className="hover:text-neutral-900 transition-colors">Опросы</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-semibold max-w-[200px] sm:max-w-xs truncate">{MOCK_SURVEY.title}</span>
          </div>

          {/* Switcher and Редактировать Button */}
          <div className="flex items-center gap-3">
            
            <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-0.5">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-white text-neutral-900 border border-neutral-200/55 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Предпросмотр</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'results' 
                    ? 'bg-white text-neutral-900 border border-neutral-200/55 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ответы</span>
              </button>
            </div>

            <Button 
              variant="outline" 
              className="h-8 px-3 text-xs font-semibold rounded-lg bg-white border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 shadow-sm"
              onClick={() => router.push(`/surveys/create?id=${MOCK_SURVEY.id}`)}
            >
              Редактировать
            </Button>
          </div>

        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-in fade-in duration-200">
        
        {/* ========================================================================= */}
        {/* PREVIEW MODE                                                              */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
            
            {/* Top metadata disclaimer banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-50 border border-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-neutral-900">Интерактивный предпросмотр</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">В этом режиме вы можете проверить прохождение опроса студентами. Ответы не сохраняются.</p>
              </div>
            </div>

            {/* Interactive Survey Sheet */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              
              {/* Cover Title */}
              <div>
                <h1 className="text-xl font-bold text-neutral-900 leading-tight">{MOCK_SURVEY.title}</h1>
                <p className="text-xs text-neutral-500 leading-relaxed mt-1.5">{MOCK_SURVEY.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-300" /> {MOCK_SURVEY.timerMinutes} минут</span>
                  <span className="flex items-center gap-1"><Unlock className="w-3 h-3 text-neutral-300" /> Доступ: {MOCK_SURVEY.type}</span>
                </div>
              </div>

              {/* Decor Block: Image */}
              <div className="rounded-xl overflow-hidden border border-neutral-150 bg-neutral-50 p-0.5">
                <img 
                  src={MOCK_SURVEY.content[1].url} 
                  alt="Decor" 
                  className="w-full max-h-56 object-cover rounded-lg" 
                />
                <div className="p-2 text-center text-[11px] italic text-neutral-500 font-medium">
                  {MOCK_SURVEY.content[1].caption}
                </div>
              </div>

              {/* Text Block intro */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150 text-xs font-medium leading-relaxed text-neutral-700">
                {MOCK_SURVEY.content[0].html}
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 1: Yes / No */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider bg-[var(--color-admin-primary-50)] px-2 py-0.5 rounded">Логический вопрос</span>
                  <span className="text-[10px] text-rose-500 font-semibold">* Обязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[2].text}</h3>
                <div className="flex gap-3 mt-1">
                  {['Да', 'Нет'].map(option => {
                    const isSelected = prevQ1Val === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setPrevQ1Val(option)}
                        className={`flex-1 py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] text-neutral-900'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {option}
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-500)]' : 'border-neutral-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 2: Rating Scale 1-5 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">Шкала оценки</span>
                  <span className="text-[10px] text-rose-500 font-semibold">* Обязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[3].text}</h3>
                <div className="flex gap-2.5 mt-1 max-w-sm">
                  {[1, 2, 3, 4, 5].map(val => {
                    const isSelected = prevQ2Val === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setPrevQ2Val(val)}
                        className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 3: Emoji Choice */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">Смайлики</span>
                  <span className="text-[10px] text-rose-500 font-semibold">* Обязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[4].text}</h3>
                <div className="flex gap-2.5 mt-1 max-w-xs">
                  {MOCK_SURVEY.content[4].options?.map(emoji => {
                    const isSelected = prevQ3Val === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => setPrevQ3Val(emoji)}
                        className={`w-10 h-10 rounded-xl border text-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 4: Single choice */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Один выбор</span>
                  <span className="text-[10px] text-rose-500 font-semibold">* Обязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[5].text}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {MOCK_SURVEY.content[5].options?.map(opt => {
                    const isSelected = prevQ4Val === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setPrevQ4Val(opt)}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                            : 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'
                        }`}>
                          {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 5: Multiple choice */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">Множественный выбор</span>
                  <span className="text-[10px] text-neutral-400 font-semibold">Необязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[6].text}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {MOCK_SURVEY.content[6].options?.map(opt => {
                    const isSelected = prevQ5Val.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleQ5Toggle(opt)}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 text-purple-900' 
                            : 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-purple-500 bg-purple-500' : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-150" />

              {/* Question 6: Open question */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Открытый вопрос</span>
                  <span className="text-[10px] text-neutral-400 font-semibold">Необязательный</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{MOCK_SURVEY.content[7].text}</h3>
                <textarea
                  value={prevQ6Val}
                  onChange={(e) => setPrevQ6Val(e.target.value)}
                  placeholder="Опишите ваши идеи..."
                  rows={3}
                  className="w-full mt-1 p-3 border border-neutral-200 bg-neutral-50 rounded-xl text-xs font-medium outline-none focus:border-neutral-300 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="h-px bg-neutral-150 mt-2" />

              {/* Bottom bar */}
              <div className="flex justify-end gap-2.5">
                <button 
                  onClick={() => {
                    setPrevQ1Val('');
                    setPrevQ2Val(0);
                    setPrevQ3Val('');
                    setPrevQ4Val('');
                    setPrevQ5Val([]);
                    setPrevQ6Val('');
                  }}
                  className="h-8 px-4 rounded-lg text-xs font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
                >
                  Очистить
                </button>
                <button 
                  onClick={() => alert('Демо-отправка завершена!')}
                  className="h-8 px-4 rounded-lg text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
                >
                  Отправить
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RESULTS MODE                                                              */}
        {/* ========================================================================= */}
        {activeTab === 'results' && (
          <div className="w-full flex flex-col gap-6">
            
            {/* Top metrics bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col shadow-sm relative overflow-hidden">
                <Users className="w-4.5 h-4.5 text-[var(--color-admin-primary-500)] mb-2 relative z-10" />
                <span className="text-xl font-bold text-neutral-900 relative z-10">{totalStudents}</span>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider relative z-10">Всего студентов</span>
              </div>
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col shadow-sm relative overflow-hidden">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mb-2 relative z-10" />
                <span className="text-xl font-bold text-neutral-900 relative z-10">{completionRate}%</span>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider relative z-10">Процент завершения</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col shadow-sm relative overflow-hidden">
                <FileText className="w-4.5 h-4.5 text-blue-500 mb-2 relative z-10" />
                <span className="text-xl font-bold text-neutral-900 relative z-10">{totalReplies}</span>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider relative z-10">Всего ответов</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col shadow-sm relative overflow-hidden">
                <Clock className="w-4.5 h-4.5 text-purple-500 mb-2 relative z-10" />
                <span className="text-xl font-bold text-neutral-900 relative z-10">{averageTime}</span>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider relative z-10">Среднее время</span>
              </div>
            </div>

            {/* Results sub-tab switchers */}
            <div className="flex border-b border-neutral-200 w-full gap-6">
              <button
                onClick={() => setResultsMode('summary')}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'summary' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <BarChart className="w-3.5 h-3.5" />
                Сводка результатов
              </button>
              <button
                onClick={() => setResultsMode('individual')}
                className={`py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'individual' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Отдельные ответы ({MOCK_SUBMISSIONS.length})
              </button>
            </div>

            {/* SUB-VIEW 1: SUMMARY GRAPH ANALYSIS */}
            {resultsMode === 'summary' && (
              <div className="flex flex-col gap-5">
                
                {/* Visual Analysis Question 1 (Yes/No) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ЛОГИЧЕСКИЙ</span>
                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[2].text}</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full flex-1 flex flex-col gap-2">
                      <div className="h-4 rounded-full w-full bg-neutral-100 flex overflow-hidden border border-neutral-200/50">
                        <div style={{ width: '78%' }} className="h-full bg-emerald-500" />
                        <div style={{ width: '22%' }} className="h-full bg-rose-500" />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold mt-1">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Да: 78% (92 отв.)
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Нет: 22% (26 отв.)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Analysis Question 2 (Scale 1-5) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ШКАЛА ОЦЕНКИ</span>
                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[3].text}</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-col items-center bg-neutral-50 border border-neutral-150 rounded-xl px-6 py-4 shrink-0 min-w-[120px]">
                      <span className="text-4xl font-bold text-indigo-600">4.1</span>
                      <span className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">Ср. Оценка</span>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {[
                        { val: 5, pct: 45, count: 53, color: 'bg-indigo-500' },
                        { val: 4, pct: 30, count: 35, color: 'bg-blue-500' },
                        { val: 3, pct: 15, count: 18, color: 'bg-emerald-500' },
                        { val: 2, pct: 7, count: 8, color: 'bg-amber-500' },
                        { val: 1, pct: 3, count: 4, color: 'bg-rose-500' }
                      ].map((item) => (
                        <div key={item.val} className="flex items-center gap-3">
                          <span className="w-12 text-[11px] font-semibold text-neutral-500">{item.val} баллов</span>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/50">
                            <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                          </div>
                          <span className="w-8 text-right text-[11px] font-bold text-neutral-800">{item.pct}%</span>
                          <span className="w-14 text-right text-[10px] text-neutral-400 font-medium">({item.count} отв.)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Analysis Question 3 (Emoji Rating) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • СМАЙЛИКИ</span>
                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[4].text}</h3>
                  </div>

                  <div className="grid grid-cols-5 gap-3 max-w-xl">
                    {[
                      { emoji: '🤩', pct: 35, color: 'bg-amber-500' },
                      { emoji: '🙂', pct: 40, color: 'bg-emerald-500' },
                      { emoji: '😐', pct: 15, color: 'bg-blue-500' },
                      { emoji: '🙁', pct: 7, color: 'bg-orange-500' },
                      { emoji: '😞', pct: 3, color: 'bg-rose-500' }
                    ].map(item => (
                      <div key={item.emoji} className="bg-neutral-50 border border-neutral-150 rounded-xl p-3 flex flex-col items-center">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-3">
                          <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 mt-1">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Analysis Question 4 (Single Choice) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОДИН ВЫБОР</span>
                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[5].text}</h3>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { option: 'Каждый день', pct: 45, count: 53, color: 'bg-emerald-500' },
                      { option: 'Несколько раз в неделю', pct: 35, count: 41, color: 'bg-blue-500' },
                      { option: 'Раз в неделю', pct: 15, count: 18, color: 'bg-amber-500' },
                      { option: 'Раз в месяц или реже', pct: 5, count: 6, color: 'bg-rose-500' }
                    ].map((row) => (
                      <div key={row.option} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-neutral-800">{row.option}</span>
                          <div className="flex gap-2 items-center text-neutral-500 font-bold">
                            <span>{row.pct}%</span>
                            <span className="text-neutral-300 font-normal">|</span>
                            <span className="text-neutral-400">{row.count} ответов</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-neutral-50 border border-neutral-100 rounded-full overflow-hidden">
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Analysis Question 5 (Multiple Choice) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 5 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                    <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[6].text}</h3>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { option: 'Слишком много созвонов', pct: 61, count: 72, color: 'bg-rose-500' },
                      { option: 'Нечетко поставленные задачи', pct: 41, count: 48, color: 'bg-amber-500' },
                      { option: 'Шум в офисе', pct: 30, count: 35, color: 'bg-blue-500' },
                      { option: 'Проблемы с оборудованием', pct: 15, count: 18, color: 'bg-purple-500' },
                      { option: 'Другое', pct: 7, count: 8, color: 'bg-neutral-400' }
                    ].map((row) => (
                      <div key={row.option} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-neutral-800">{row.option}</span>
                          <div className="flex gap-2 items-center text-neutral-500 font-bold">
                            <span>{row.pct}%</span>
                            <span className="text-neutral-300 font-normal">|</span>
                            <span className="text-neutral-400">{row.count} ответов</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-neutral-50 border border-neutral-100 rounded-full overflow-hidden">
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open text feedback list (paginated, clean) */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 6 • ОТКРЫТЫЕ ОТВЕТЫ</span>
                      <h3 className="text-sm font-semibold text-neutral-800 mt-0.5">{MOCK_SURVEY.content[7].text}</h3>
                    </div>

                    {/* Flat Search */}
                    <div className="relative w-full sm:max-w-xs shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Поиск по ответам..."
                        value={openTextSearch}
                        onChange={(e) => setOpenTextSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-4 border border-neutral-200 bg-neutral-50 rounded-lg text-xs outline-none focus:border-neutral-350 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* List items */}
                  <div className="flex flex-col gap-3">
                    {paginatedOpenTextResponses.length === 0 ? (
                      <div className="py-8 text-center text-xs text-neutral-400">Нет ответов</div>
                    ) : (
                      paginatedOpenTextResponses.map((item, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-150 rounded-xl p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${item.avatarColor}`}>
                                {item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-neutral-800 truncate leading-tight">{item.name}</span>
                                <span className="text-[9px] text-neutral-400 font-semibold truncate leading-tight">{item.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-semibold shrink-0">{item.date}</span>
                          </div>
                          <p className="text-xs font-normal leading-relaxed text-neutral-700">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Clean Aligned Pagination (User-friendly matching event participants) */}
                  {filteredOpenTextResponses.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-150 text-[11px] font-semibold text-neutral-500 mt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span>Показывать по:</span>
                          <div className="relative">
                            <select 
                              value={openTextLimit}
                              onChange={(e) => setOpenTextLimit(Number(e.target.value))}
                              className="bg-neutral-50 border border-neutral-200 rounded-lg py-1 pl-2 pr-6 appearance-none font-bold text-neutral-700 outline-none cursor-pointer text-[11px]"
                            >
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-neutral-450 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                        <span className="text-neutral-400">
                          Показано {(openTextPage - 1) * openTextLimit + 1}–{Math.min(openTextPage * openTextLimit, filteredOpenTextResponses.length)} из {filteredOpenTextResponses.length}
                        </span>
                      </div>

                      {openTextTotalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setOpenTextPage(p => Math.max(p - 1, 1))}
                            disabled={openTextPage === 1}
                            className="px-2.5 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold"
                          >
                            Назад
                          </button>
                          {Array.from({ length: openTextTotalPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setOpenTextPage(idx + 1)}
                              className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all flex items-center justify-center border ${
                                openTextPage === idx + 1
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                          <button 
                            onClick={() => setOpenTextPage(p => Math.min(p + 1, openTextTotalPages))}
                            disabled={openTextPage === openTextTotalPages}
                            className="px-2.5 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold"
                          >
                            Вперед
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* SUB-VIEW 2: INDIVIDUAL STUDENTS DETAILED INSPECTOR */}
            {resultsMode === 'individual' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                
                {/* Left Side: Students List Sidebar */}
                <div className="md:col-span-4 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 w-full">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Студенты ({filteredSubmissions.length})</h3>

                  {/* Sidebar Search Input */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Поиск..."
                      value={individualSearch}
                      onChange={(e) => setIndividualSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-4 border border-neutral-200 bg-neutral-50 rounded-lg text-xs outline-none focus:border-neutral-350 focus:bg-white"
                    />
                  </div>

                  {/* List container */}
                  <div className="flex flex-col gap-1 max-h-[340px] overflow-y-auto">
                    {paginatedSubmissions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-neutral-400">Студенты не найдены</div>
                    ) : (
                      paginatedSubmissions.map((sub) => {
                        const isSelected = sub.id === selectedSubId;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubId(sub.id)}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                              isSelected 
                                ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] shadow-sm'
                                : 'border-transparent hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${sub.avatarColor}`}>
                                {sub.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-neutral-800 truncate">{sub.studentName}</span>
                                <span className="text-[9px] text-neutral-400 truncate">{sub.email}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Sidebar Pagination */}
                  {filteredSubmissions.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-neutral-150 text-[10px] font-bold text-neutral-500">
                      <div className="flex items-center justify-between w-full">
                        <span>Показывать:</span>
                        <div className="relative">
                          <select 
                            value={individualLimit}
                            onChange={(e) => setIndividualLimit(Number(e.target.value))}
                            className="bg-neutral-50 border border-neutral-200 rounded-md py-0.5 pl-1.5 pr-5 appearance-none font-bold text-neutral-700 outline-none cursor-pointer text-[10px]"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                          </select>
                          <ChevronDown className="w-2.5 h-2.5 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {individualTotalPages > 1 && (
                        <div className="flex items-center justify-between w-full pt-1">
                          <button
                            onClick={() => setIndividualPage(p => Math.max(p - 1, 1))}
                            disabled={individualPage === 1}
                            className="px-2 py-0.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
                          >
                            Назад
                          </button>
                          <span className="text-[9px] text-neutral-450">Стр. {individualPage} из {individualTotalPages}</span>
                          <button
                            onClick={() => setIndividualPage(p => Math.min(p + 1, individualTotalPages))}
                            disabled={individualPage === individualTotalPages}
                            className="px-2 py-0.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
                          >
                            Вперед
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Side: Detailed Submission sheet */}
                <div className="md:col-span-8 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5 w-full">
                  
                  {/* Selected student header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedSubmission.avatarColor}`}>
                        {selectedSubmission.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-neutral-800 text-xs leading-tight">{selectedSubmission.studentName}</h4>
                        <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{selectedSubmission.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{selectedSubmission.date}</span>
                  </div>

                  {/* Submission Answers lists */}
                  <div className="space-y-5">
                    
                    {/* Q1 Answer (Logical Yes/No) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ЛОГИЧЕСКИЙ</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[2].text}</h4>
                      
                      <div className="flex gap-2 mt-1">
                        {['Да', 'Нет'].map(option => {
                          const active = selectedSubmission.answers.q1 === option;
                          return (
                            <div 
                              key={option} 
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                active
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                  : 'bg-neutral-50/50 border-neutral-150 text-neutral-400'
                              }`}
                            >
                              {option}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q2 Answer (Scale 1-5, HIGHLIGHT ONLY SELECTED VALUE) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ШКАЛА ОЦЕНКИ</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[3].text}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = val === selectedSubmission.answers.q2;
                          return (
                            <div 
                              key={val} 
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                  : 'bg-neutral-50/50 border-neutral-150 text-neutral-400'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q3 Answer (Emoji Choice, HIGHLIGHT ONLY SELECTED EMOJI) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • СМАЙЛИКИ</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[4].text}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {MOCK_SURVEY.content[4].options?.map((emoji) => {
                          const isSelected = emoji === selectedSubmission.answers.q3;
                          return (
                            <div 
                              key={emoji} 
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl border transition-all ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-400 scale-105'
                                  : 'bg-neutral-50/50 border-neutral-150 opacity-40'
                              }`}
                            >
                              {emoji}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q4 Answer (Single Choice, SHOW ALL OPTIONS AND HIGHLIGHT SELECTED) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОДИН ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[5].text}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {MOCK_SURVEY.content[5].options?.map((opt) => {
                          const isSelected = opt === selectedSubmission.answers.q4;
                          return (
                            <div 
                              key={opt} 
                              className={`p-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-450 text-emerald-800'
                                  : 'bg-neutral-50/50 border-neutral-150 text-neutral-400'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-200'
                              }`}>
                                {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q5 Answer (Multiple Choice, SHOW ALL OPTIONS AND HIGHLIGHT SELECTED) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 5 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[6].text}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {MOCK_SURVEY.content[6].options?.map((opt) => {
                          const isSelected = selectedSubmission.answers.q5.includes(opt);
                          return (
                            <div 
                              key={opt} 
                              className={`p-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-450 text-purple-800'
                                  : 'bg-neutral-50/50 border-neutral-150 text-neutral-400'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-purple-500 bg-purple-500' : 'border-neutral-200'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q6 Answer (Open format text) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 6 • ОТКРЫТЫЙ ОТВЕТ</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[7].text}</h4>
                      <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-xl text-xs font-normal leading-relaxed text-neutral-700">
                        {selectedSubmission.answers.q6 || <span className="text-neutral-400 italic">Студент оставил поле пустым</span>}
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
