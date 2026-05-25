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
  Video,
  Image as ImageIcon,
  HelpCircle,
  Unlock,
  BarChart,
  MessageSquare,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Rich Mock Survey Definition containing mixed media and diverse question types
const MOCK_SURVEY = {
  id: 'SRV-821',
  title: 'Опрос удовлетворенности сотрудников',
  description: 'Пожалуйста, ответьте на вопросы честно. Это поможет сделать условия работы в компании комфортнее для каждого.',
  lang: 'RUS',
  status: 'Active',
  type: 'Открытый',
  timerMinutes: 5,
  totalStudents: 142, // directly assigned + inherited
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
      options: ['😞', '😐', '🙂', '🤩'],
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

// Rich Mock Submissions Database
const MOCK_SUBMISSIONS = [
  {
    id: 'sub1',
    studentName: 'Иван Сергеев',
    email: 'ivan@example.com',
    avatarColor: 'bg-indigo-100 text-indigo-700',
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
    avatarColor: 'bg-emerald-100 text-emerald-700',
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
    avatarColor: 'bg-amber-100 text-amber-700',
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
    avatarColor: 'bg-rose-100 text-rose-700',
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
    avatarColor: 'bg-blue-100 text-blue-700',
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
    avatarColor: 'bg-purple-100 text-purple-700',
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
    avatarColor: 'bg-teal-100 text-teal-700',
    date: '25.05.2026 14:02',
    answers: {
      q1: 'Нет',
      q2: 2,
      q3: '😞',
      q4: 'Раз в месяц или реже',
      q5: ['Нечетко поставленные задачи', 'Проблемы с оборудованием', 'Шум в офисе'],
      q6: 'Сложно планировать задачи, требования часто меняются на ходу.'
    }
  },
  {
    id: 'sub8',
    studentName: 'Ольга Соколова',
    email: 'olga@example.com',
    avatarColor: 'bg-pink-100 text-pink-700',
    date: '25.05.2026 15:55',
    answers: {
      q1: 'Да',
      q2: 4,
      q3: '🙂',
      q4: 'Несколько раз в неделю',
      q5: ['Слишком много созвонов'],
      q6: 'Было бы здорово иметь один день в неделю без созвонов (no-meeting day).'
    }
  },
  {
    id: 'sub9',
    studentName: 'Владимир Морозов',
    email: 'vladimir@example.com',
    avatarColor: 'bg-violet-100 text-violet-700',
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
    avatarColor: 'bg-orange-100 text-orange-700',
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
  
  // Detail mode toggled via header eye / list switcher: 'preview' | 'results'
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

  // 1. Calculate Results metrics dynamically
  const totalStudents = MOCK_SURVEY.totalStudents; // 142
  const totalReplies = 118; // total completed replies
  const completionRate = Math.round((totalReplies / totalStudents) * 100); // 83%
  const averageTime = '4.2 мин';

  // 2. Open-ended responses list + pagination
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

  // Reset page when search or limit changes
  React.useEffect(() => {
    setOpenTextPage(1);
  }, [openTextSearch, openTextLimit]);

  // 3. Individual responses sidebar list + pagination
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

  // Reset page when sidebar search or limit changes
  React.useEffect(() => {
    setIndividualPage(1);
  }, [individualSearch, individualLimit]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] w-full text-neutral-800">
      
      {/* Top sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm w-full">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto w-full">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 text-sm text-neutral-500 font-medium">
            <button 
              onClick={() => router.push('/surveys')} 
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link href="/surveys" className="hover:text-neutral-900 transition-colors">Опросы</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 font-bold max-w-[200px] sm:max-w-xs truncate">{MOCK_SURVEY.title}</span>
          </div>

          {/* Right Header Panel: View switcher and Редактировать Button */}
          <div className="flex items-center gap-4">
            
            {/* Minimalist Switcher Tool */}
            <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="Предпросмотр опроса"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Предпросмотр</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'results' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="Ответы и статистика"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Ответы</span>
              </button>
            </div>

            {/* Редактировать button redirecting to the builder page */}
            <Button 
              variant="outline" 
              className="h-9 px-4 text-xs font-bold rounded-xl bg-white border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 shadow-sm"
              onClick={() => router.push(`/surveys/create?id=${MOCK_SURVEY.id}`)}
            >
              Редактировать
            </Button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
        
        {/* ========================================================================= */}
        {/* PREVIEW MODE                                                              */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            
            {/* Top metadata disclaimer banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-600)] rounded-xl flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-neutral-900">Интерактивный предпросмотр</h3>
                <p className="text-xs text-neutral-500 mt-0.5">В этом режиме вы можете проверить прохождение опроса студентами. Ответы не будут сохранены в базе.</p>
              </div>
            </div>

            {/* Interactive Survey Sheet */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-8">
              
              {/* Cover Title */}
              <div>
                <h1 className="text-2xl font-black text-neutral-900 leading-tight">{MOCK_SURVEY.title}</h1>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2">{MOCK_SURVEY.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 font-bold uppercase tracking-wider mt-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-neutral-300" /> {MOCK_SURVEY.timerMinutes} минут на опрос</span>
                  <span className="flex items-center gap-1"><Unlock className="w-3.5 h-3.5 text-neutral-300" /> Доступ: {MOCK_SURVEY.type}</span>
                </div>
              </div>

              {/* Decor Block: Image */}
              <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 p-1">
                <img 
                  src={MOCK_SURVEY.content[1].url} 
                  alt="Decor" 
                  className="w-full max-h-72 object-cover rounded-xl shadow-inner" 
                />
                <div className="p-3 text-center text-xs italic text-neutral-500 font-medium">
                  {MOCK_SURVEY.content[1].caption}
                </div>
              </div>

              {/* Text Block intro */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-medium leading-relaxed text-neutral-700">
                {MOCK_SURVEY.content[0].html}
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 1: Yes / No */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--color-admin-primary-600)] uppercase tracking-wider bg-[var(--color-admin-primary-50)] px-2 py-0.5 rounded">Логический вопрос</span>
                  <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[2].text}</h3>
                <div className="flex gap-4 mt-2">
                  {['Да', 'Нет'].map(option => {
                    const isSelected = prevQ1Val === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setPrevQ1Val(option)}
                        className={`flex-1 py-3 px-5 rounded-xl border text-sm font-bold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-50)] text-[var(--color-admin-primary-850)] ring-1 ring-[var(--color-admin-primary-500)]/30'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {option}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[var(--color-admin-primary-500)] bg-[var(--color-admin-primary-500)]' : 'border-neutral-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 2: Rating Scale 1-5 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">Шкала оценки</span>
                  <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[3].text}</h3>
                <div className="grid grid-cols-5 gap-2.5 mt-2">
                  {[1, 2, 3, 4, 5].map(val => {
                    const isSelected = prevQ2Val === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setPrevQ2Val(val)}
                        className={`py-3.5 rounded-xl border text-base font-black transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20 scale-[1.02]'
                            : 'border-neutral-200 bg-white hover:bg-indigo-50/30'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 3: Emoji Choice */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">Смайлики</span>
                  <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[4].text}</h3>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {MOCK_SURVEY.content[4].options?.map(emoji => {
                    const isSelected = prevQ3Val === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => setPrevQ3Val(emoji)}
                        className={`py-4 rounded-2xl border text-3xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20 shadow-sm'
                            : 'border-neutral-200 bg-white hover:bg-amber-50/20'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 4: Single choice */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Один выбор</span>
                  <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[5].text}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {MOCK_SURVEY.content[5].options?.map(opt => {
                    const isSelected = prevQ4Val === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setPrevQ4Val(opt)}
                        className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                            : 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 5: Multiple choice */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">Множественный выбор</span>
                  <span className="text-xs text-neutral-400 font-bold">Необязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[6].text}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {MOCK_SURVEY.content[6].options?.map(opt => {
                    const isSelected = prevQ5Val.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleQ5Toggle(opt)}
                        className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 text-purple-900' 
                            : 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                        }`}
                      >
                        {opt}
                        <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-purple-500 bg-purple-500' : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Question 6: Open ended question */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Открытый вопрос</span>
                  <span className="text-xs text-neutral-400 font-bold">Необязательный</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{MOCK_SURVEY.content[7].text}</h3>
                <textarea
                  value={prevQ6Val}
                  onChange={(e) => setPrevQ6Val(e.target.value)}
                  placeholder="Опишите ваши идеи и предложения..."
                  rows={4}
                  className="w-full mt-2 p-4 border border-neutral-200 bg-neutral-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] focus:bg-white transition-all shadow-inner resize-none"
                />
              </div>

              <div className="h-px bg-neutral-100 mt-4" />

              {/* Bottom bar of interactive form sheet */}
              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => {
                    setPrevQ1Val('');
                    setPrevQ2Val(0);
                    setPrevQ3Val('');
                    setPrevQ4Val('');
                    setPrevQ5Val([]);
                    setPrevQ6Val('');
                  }}
                  variant="outline" 
                  className="h-10 px-5 rounded-xl text-xs font-bold text-neutral-600 bg-white border-neutral-200 shadow-sm"
                >
                  Очистить форму
                </Button>
                <Button 
                  onClick={() => alert('Демонстрационная отправка завершена!')}
                  variant="primary" 
                  className="h-10 px-6 rounded-xl text-xs font-bold shadow-md"
                >
                  Отправить опрос
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RESULTS MODE                                                              */}
        {/* ========================================================================= */}
        {activeTab === 'results' && (
          <div className="w-full flex flex-col gap-6">
            
            {/* Top metrics metrics bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-14 h-14 bg-[var(--color-admin-primary-50)] rounded-full -mr-4 -mt-4 opacity-50" />
                <Users className="w-5 h-5 text-[var(--color-admin-primary-500)] mb-3 relative z-10" />
                <span className="text-2xl font-black text-neutral-900 relative z-10">{totalStudents}</span>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 uppercase tracking-wider relative z-10">Всего студентов</span>
              </div>
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-14 h-14 bg-emerald-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3 relative z-10" />
                <span className="text-2xl font-black text-neutral-900 relative z-10">{completionRate}%</span>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 uppercase tracking-wider relative z-10">Процент завершения</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-14 h-14 bg-blue-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <FileText className="w-5 h-5 text-blue-500 mb-3 relative z-10" />
                <span className="text-2xl font-black text-neutral-900 relative z-10">{totalReplies}</span>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 uppercase tracking-wider relative z-10">Всего ответов</span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-14 h-14 bg-purple-50 rounded-full -mr-4 -mt-4 opacity-50" />
                <Clock className="w-5 h-5 text-purple-500 mb-3 relative z-10" />
                <span className="text-2xl font-black text-neutral-900 relative z-10">{averageTime}</span>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 uppercase tracking-wider relative z-10">Среднее время</span>
              </div>
            </div>

            {/* Results sub-tab switchers */}
            <div className="flex border-b border-neutral-200 w-full gap-6">
              <button
                onClick={() => setResultsMode('summary')}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'summary' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <BarChart className="w-4 h-4" />
                Сводка результатов
              </button>
              <button
                onClick={() => setResultsMode('individual')}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px flex items-center gap-2 ${
                  resultsMode === 'individual' 
                    ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Отдельные ответы ({MOCK_SUBMISSIONS.length})
              </button>
            </div>

            {/* SUB-VIEW 1: SUMMARY GRAPH ANALYSIS */}
            {resultsMode === 'summary' && (
              <div className="flex flex-col gap-6">
                
                {/* Visual Analysis Question 1 (Yes/No) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ЛОГИЧЕСКИЙ</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[2].text}</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Visual stacked percentage bar */}
                    <div className="w-full flex-1 flex flex-col gap-2">
                      <div className="h-6 rounded-full w-full bg-neutral-100 flex overflow-hidden shadow-inner border border-neutral-200">
                        <div style={{ width: '78%' }} className="h-full bg-emerald-500 transition-all hover:opacity-90" title="Да (78%)" />
                        <div style={{ width: '22%' }} className="h-full bg-rose-500 transition-all hover:opacity-90" title="Нет (22%)" />
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold mt-1">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Да: 78% (92 отв.)
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Нет: 22% (26 отв.)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Analysis Question 2 (Scale 1-5) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ШКАЛА ОЦЕНКИ</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[3].text}</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex flex-col items-center bg-neutral-50 border border-neutral-150 rounded-2xl px-8 py-5 shrink-0 min-w-[150px]">
                      <span className="text-5xl font-black text-indigo-600">4.1</span>
                      <span className="text-[11px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">Ср. Оценка</span>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      {[
                        { val: 5, pct: 45, count: 53, color: 'bg-indigo-500' },
                        { val: 4, pct: 30, count: 35, color: 'bg-blue-500' },
                        { val: 3, pct: 15, count: 18, color: 'bg-emerald-500' },
                        { val: 2, pct: 7, count: 8, color: 'bg-amber-500' },
                        { val: 1, pct: 3, count: 4, color: 'bg-rose-500' }
                      ].map((item) => (
                        <div key={item.val} className="flex items-center gap-3">
                          <span className="w-12 text-xs font-bold text-neutral-500">{item.val} баллов</span>
                          <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden shadow-inner border border-neutral-200/50">
                            <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                          </div>
                          <span className="w-10 text-right text-xs font-bold text-neutral-800">{item.pct}%</span>
                          <span className="w-16 text-right text-[11px] text-neutral-400">({item.count} отв.)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Analysis Question 3 (Emoji Rating) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • СМАЙЛИКИ</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[4].text}</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { emoji: '🤩', pct: 35, label: 'Отлично', color: 'bg-amber-500' },
                      { emoji: '🙂', pct: 40, label: 'Хорошо', color: 'bg-emerald-500' },
                      { emoji: '😐', pct: 18, label: 'Нейтрально', color: 'bg-blue-500' },
                      { emoji: '😞', pct: 7, label: 'Грустно', color: 'bg-rose-500' }
                    ].map(item => (
                      <div key={item.emoji} className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col items-center">
                        <span className="text-4xl">{item.emoji}</span>
                        <span className="text-xs font-bold text-neutral-800 mt-2">{item.label}</span>
                        <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
                          <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-bold text-neutral-400 mt-1.5">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Analysis Question 4 (Single Choice) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОДИН ВЫБОР</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[5].text}</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { option: 'Каждый день', pct: 45, count: 53, color: 'bg-emerald-500' },
                      { option: 'Несколько раз в неделю', pct: 35, count: 41, color: 'bg-blue-500' },
                      { option: 'Раз в неделю', pct: 15, count: 18, color: 'bg-amber-500' },
                      { option: 'Раз в месяц или реже', pct: 5, count: 6, color: 'bg-rose-500' }
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
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-lg`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Analysis Question 5 (Multiple Choice) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 5 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[6].text}</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { option: 'Слишком много созвонов', pct: 61, count: 72, color: 'bg-rose-500' },
                      { option: 'Нечетко поставленные задачи', pct: 41, count: 48, color: 'bg-amber-500' },
                      { option: 'Шум в офисе', pct: 30, count: 35, color: 'bg-blue-500' },
                      { option: 'Проблемы с оборудованием', pct: 15, count: 18, color: 'bg-purple-500' },
                      { option: 'Другое', pct: 7, count: 8, color: 'bg-neutral-400' }
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
                          <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-lg`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimised paginated card listing for Question 6 (Open text feedback) */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 6 • ОТКРЫТЫЕ ОТВЕТЫ</span>
                      <h3 className="text-base font-bold text-neutral-800 mt-1">{MOCK_SURVEY.content[7].text}</h3>
                    </div>

                    {/* Search bar inside summary page */}
                    <div className="relative w-full sm:max-w-xs shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Поиск по ответам..."
                        value={openTextSearch}
                        onChange={(e) => setOpenTextSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 border border-neutral-200 bg-neutral-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Scrollable list container */}
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {paginatedOpenTextResponses.length === 0 ? (
                      <div className="py-12 text-center text-xs text-neutral-400">Нет подходящих ответов</div>
                    ) : (
                      paginatedOpenTextResponses.map((item, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col gap-3 hover:border-neutral-300 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner shrink-0 ${item.avatarColor}`}>
                                {item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-neutral-850 truncate leading-tight">{item.name}</span>
                                <span className="text-[10px] text-neutral-400 font-semibold truncate leading-tight">{item.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-semibold shrink-0">{item.date}</span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed text-neutral-700">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination and limit control */}
                  {filteredOpenTextResponses.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-500 mt-2">
                      <div className="flex items-center gap-2">
                        <span>Показывать по:</span>
                        <div className="relative">
                          <select 
                            value={openTextLimit}
                            onChange={(e) => setOpenTextLimit(Number(e.target.value))}
                            className="bg-neutral-50 border border-neutral-200 rounded-lg py-1 pl-2 pr-6 appearance-none font-bold text-neutral-700 outline-none cursor-pointer"
                          >
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <span className="text-[11px] text-neutral-400 font-semibold ml-2">
                          Показано {(openTextPage - 1) * openTextLimit + 1}–{Math.min(openTextPage * openTextLimit, filteredOpenTextResponses.length)} из {filteredOpenTextResponses.length}
                        </span>
                      </div>

                      {openTextTotalPages > 1 && (
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => setOpenTextPage(p => Math.max(p - 1, 1))}
                            disabled={openTextPage === 1}
                            className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: openTextTotalPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setOpenTextPage(idx + 1)}
                              className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
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
                            className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
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
                
                {/* Left Side: Students List Sidebar (Spans 4 columns) */}
                <div className="md:col-span-4 bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4 w-full">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Студенты ({filteredSubmissions.length})</h3>
                  </div>

                  {/* Sidebar Search Input */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Поиск по имени/почте..."
                      value={individualSearch}
                      onChange={(e) => setIndividualSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 border border-neutral-200 bg-neutral-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  {/* Scrollable list container */}
                  <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {paginatedSubmissions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-neutral-400">Студенты не найдены</div>
                    ) : (
                      paginatedSubmissions.map((sub) => {
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
                              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${sub.avatarColor}`}>
                                {sub.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-neutral-800 truncate">{sub.studentName}</span>
                                <span className="text-[10px] text-neutral-400 font-medium truncate">{sub.email}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Sidebar Pagination */}
                  {filteredSubmissions.length > 0 && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-neutral-100 text-xs font-bold text-neutral-500">
                      <div className="flex items-center justify-between w-full">
                        <span>Показывать:</span>
                        <div className="relative">
                          <select 
                            value={individualLimit}
                            onChange={(e) => setIndividualLimit(Number(e.target.value))}
                            className="bg-neutral-50 border border-neutral-200 rounded-lg py-1 pl-2 pr-6 appearance-none font-bold text-neutral-700 outline-none cursor-pointer"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {individualTotalPages > 1 && (
                        <div className="flex items-center justify-between w-full">
                          <button
                            onClick={() => setIndividualPage(p => Math.max(p - 1, 1))}
                            disabled={individualPage === 1}
                            className="p-1 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span>Стр. {individualPage} из {individualTotalPages}</span>
                          <button
                            onClick={() => setIndividualPage(p => Math.min(p + 1, individualTotalPages))}
                            disabled={individualPage === individualTotalPages}
                            className="p-1 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Side: Detailed Submission sheet (Spans 8 columns) */}
                <div className="md:col-span-8 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 w-full">
                  
                  {/* Selected student header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${selectedSubmission.avatarColor}`}>
                        {selectedSubmission.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-neutral-800 text-sm leading-tight">{selectedSubmission.studentName}</h4>
                        <span className="text-xs text-neutral-400 mt-0.5 leading-tight">{selectedSubmission.email}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-semibold">{selectedSubmission.date}</span>
                  </div>

                  {/* Submission Answers lists */}
                  <div className="space-y-6">
                    
                    {/* Q1 Answer (Logical Yes/No) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ЛОГИЧЕСКИЙ</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[2].text}</h4>
                      <div className={`p-3 rounded-xl border font-bold text-xs w-fit ${
                        selectedSubmission.answers.q1 === 'Да'
                          ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                          : 'border-rose-250 bg-rose-50 text-rose-700'
                      }`}>
                        {selectedSubmission.answers.q1}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q2 Answer (Scale 1-5) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 2 • ШКАЛА ОЦЕНКИ</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[3].text}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const active = val <= selectedSubmission.answers.q2;
                          return (
                            <div 
                              key={val} 
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                active
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                  : 'bg-white border-neutral-200 text-neutral-300'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q3 Answer (Emoji Choice) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 3 • СМАЙЛИКИ</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[4].text}</h4>
                      <div className="text-4xl p-2 bg-amber-50/50 border border-amber-100 rounded-xl w-fit">
                        {selectedSubmission.answers.q3}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q4 Answer (Single Choice) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 4 • ОДИН ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[5].text}</h4>
                      <div className="p-3 px-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 w-fit">
                        {selectedSubmission.answers.q4}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q5 Answer (Multiple Choice) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 5 • МНОЖЕСТВЕННЫЙ ВЫБОР</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[6].text}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubmission.answers.q5.length === 0 ? (
                          <span className="text-xs text-neutral-450 italic">Ничего не выбрано</span>
                        ) : (
                          selectedSubmission.answers.q5.map((opt) => (
                            <span key={opt} className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-semibold">
                              {opt}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Q6 Answer (Open format text) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 6 • ОТКРЫТЫЙ ОТВЕТ</span>
                      <h4 className="font-semibold text-neutral-700 text-sm">{MOCK_SURVEY.content[7].text}</h4>
                      <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs font-medium leading-relaxed text-neutral-700">
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
