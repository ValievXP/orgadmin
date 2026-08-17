"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Reports from '@/lib/reports';
import { 
  ArrowLeft,
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Eye, 
  FileText,
  MessageSquare,
  Users, 
  CheckCircle2, 
  Clock, 
  Search,
  Check,
  X,
  Unlock,
  BarChart,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

// Refined Mock Survey Definition with statements fitting Правда/Ложь choice layouts
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
      text: '1. Утверждение: В нашей команде эффективно распределяются задачи и всегда соблюдаются сроки проектов.',
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

// Refined Mock Submissions Database
// Refined Mock Submissions Database
const MOCK_SUBMISSIONS = [
  {
    id: 'sub1',
    studentName: 'Иван Сергеев',
    firstName: 'Иван',
    lastName: 'Сергеев',
    patronymic: 'Сергеевич',
    email: 'ivan@example.com',
    avatarColor: 'bg-indigo-50 text-indigo-600',
    date: '24.05.2026 14:20',
    answers: {
      q1: 'Правда',
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
    firstName: 'Мария',
    lastName: 'Власова',
    patronymic: 'Игоревна',
    email: 'maria@example.com',
    avatarColor: 'bg-emerald-50 text-emerald-600',
    date: '24.05.2026 15:10',
    answers: {
      q1: 'Правда',
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
    firstName: 'Петр',
    lastName: 'Николаев',
    patronymic: 'Васильевич',
    email: 'petr@example.com',
    avatarColor: 'bg-amber-50 text-amber-600',
    date: '25.05.2026 10:05',
    answers: {
      q1: 'Правда',
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
    firstName: 'Анна',
    lastName: 'Смирнова',
    patronymic: '',
    email: 'anna@example.com',
    avatarColor: 'bg-rose-50 text-rose-600',
    date: '25.05.2026 11:30',
    answers: {
      q1: 'Ложь',
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
    firstName: 'Дмитрий',
    lastName: 'Козлов',
    patronymic: 'Александрович',
    email: 'dmitry@example.com',
    avatarColor: 'bg-blue-50 text-blue-600',
    date: '25.05.2026 12:15',
    answers: {
      q1: 'Правда',
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
    firstName: 'Елена',
    lastName: 'Кузнецова',
    patronymic: 'Дмитриевна',
    email: 'elena@example.com',
    avatarColor: 'bg-purple-50 text-purple-600',
    date: '25.05.2026 13:40',
    answers: {
      q1: 'Правда',
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
    firstName: 'Алексей',
    lastName: 'Петров',
    patronymic: 'Николаевич',
    email: 'alexey@example.com',
    avatarColor: 'bg-teal-50 text-teal-600',
    date: '25.05.2026 14:02',
    answers: {
      q1: 'Ложь',
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
    firstName: 'Ольга',
    lastName: 'Соколова',
    patronymic: 'Сергеевна',
    email: 'olga@example.com',
    avatarColor: 'bg-pink-50 text-pink-600',
    date: '25.05.2026 15:55',
    answers: {
      q1: 'Правда',
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
    firstName: 'Владимир',
    lastName: 'Морозов',
    patronymic: 'Павлович',
    email: 'vladimir@example.com',
    avatarColor: 'bg-violet-50 text-violet-600',
    date: '25.05.2026 16:30',
    answers: {
      q1: 'Правда',
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
    firstName: 'Екатерина',
    lastName: 'Павлова',
    patronymic: 'Михайловна',
    email: 'katerina@example.com',
    avatarColor: 'bg-orange-50 text-orange-600',
    date: '25.05.2026 17:12',
    answers: {
      q1: 'Правда',
      q2: 3,
      q3: '😐',
      q4: 'Раз в неделю',
      q5: ['Нечетко поставленные задачи'],
      q6: 'Иногда задачи ставятся устно без тасков в Jira, сложно потом отслеживать коммиты.'
    }
  }
];

// ─── Агрегаты сводки ────────────────────────────────────────────────────────
// Единый источник для экрана и выгрузки: раньше эти числа лежали двумя копиями —
// в разметке и в функции экспорта, и уже начали расходиться.

export interface SurveyOptionResult {
  /** Подпись варианта для отчёта — всегда текстом, без эмодзи */
  label: string;
  /** Как вариант показан на экране («5 баллов», «🤩») */
  display: string;
  count: number;
  pct: number;
  color: string;
}

export interface SurveyQuestionResult {
  id: string;
  num: number;
  type: 'yes_no' | 'rating_5' | 'emoji' | 'single' | 'multiple' | 'open';
  typeLabel: string;
  /** Индекс блока в MOCK_SURVEY.content, откуда берётся текст вопроса */
  contentIndex: number;
  options: SurveyOptionResult[];
  average?: number;
}

const SURVEY_RESULTS: SurveyQuestionResult[] = [
  {
    id: 'q1', num: 1, type: 'yes_no', typeLabel: 'Да/Нет', contentIndex: 2,
    options: [
      { label: 'Правда', display: 'Правда', count: 92, pct: 78, color: 'bg-emerald-500' },
      { label: 'Ложь', display: 'Ложь', count: 26, pct: 22, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'q2', num: 2, type: 'rating_5', typeLabel: 'Шкала оценки', contentIndex: 3,
    average: 4.1,
    options: [
      { label: '5', display: '5 баллов', count: 53, pct: 45, color: 'bg-indigo-500' },
      { label: '4', display: '4 баллов', count: 35, pct: 30, color: 'bg-blue-500' },
      { label: '3', display: '3 баллов', count: 18, pct: 15, color: 'bg-emerald-500' },
      { label: '2', display: '2 баллов', count: 8, pct: 7, color: 'bg-amber-500' },
      { label: '1', display: '1 баллов', count: 4, pct: 3, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'q3', num: 3, type: 'emoji', typeLabel: 'Смайлики', contentIndex: 4,
    options: [
      { label: 'Отлично', display: '🤩', count: 41, pct: 35, color: 'bg-amber-500' },
      { label: 'Хорошо', display: '🙂', count: 47, pct: 40, color: 'bg-emerald-500' },
      { label: 'Нейтрально', display: '😐', count: 18, pct: 15, color: 'bg-blue-500' },
      { label: 'Плохо', display: '🙁', count: 8, pct: 7, color: 'bg-orange-500' },
      { label: 'Очень плохо', display: '😞', count: 4, pct: 3, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'q4', num: 4, type: 'single', typeLabel: 'Один выбор', contentIndex: 5,
    options: [
      { label: 'Каждый день', display: 'Каждый день', count: 53, pct: 45, color: 'bg-emerald-500' },
      { label: 'Несколько раз в неделю', display: 'Несколько раз в неделю', count: 41, pct: 35, color: 'bg-blue-500' },
      { label: 'Раз в неделю', display: 'Раз в неделю', count: 18, pct: 15, color: 'bg-amber-500' },
      { label: 'Раз в месяц или реже', display: 'Раз в месяц или реже', count: 6, pct: 5, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'q5', num: 5, type: 'multiple', typeLabel: 'Множественный выбор', contentIndex: 6,
    options: [
      { label: 'Слишком много созвонов', display: 'Слишком много созвонов', count: 72, pct: 61, color: 'bg-rose-500' },
      { label: 'Нечетко поставленные задачи', display: 'Нечетко поставленные задачи', count: 48, pct: 41, color: 'bg-amber-500' },
      { label: 'Шум в офисе', display: 'Шум в офисе', count: 35, pct: 30, color: 'bg-blue-500' },
      { label: 'Проблемы с оборудованием', display: 'Проблемы с оборудованием', count: 18, pct: 15, color: 'bg-purple-500' },
      { label: 'Другое', display: 'Другое', count: 8, pct: 7, color: 'bg-neutral-400' },
    ],
  },
  { id: 'q6', num: 6, type: 'open', typeLabel: 'Открытый ответ', contentIndex: 7, options: [] },
];

/** Текст вопроса берётся из содержимого опроса, чтобы не дублировать формулировки. */
const questionText = (q: SurveyQuestionResult): string =>
  (MOCK_SURVEY.content[q.contentIndex] as any)?.text || `Вопрос ${q.num}`;

const getUserFIO = (user: { firstName?: string; lastName?: string; patronymic?: string; studentName?: string }) => {
  if (user.lastName && user.firstName) {
    return user.patronymic
      ? `${user.lastName} ${user.firstName} ${user.patronymic}`
      : `${user.lastName} ${user.firstName}`;
  }
  return user.studentName || '';
};

const getUserInitials = (user: { firstName?: string; lastName?: string; studentName?: string }) => {
  if (user.lastName && user.firstName) {
    return `${user.lastName[0]}${user.firstName[0]}`.toUpperCase();
  }
  if (user.studentName) {
    return user.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  return '??';
};


export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Default tab set to 'results' (Ответы) as requested
  const [activeTab, setActiveTab] = useState<'preview' | 'results'>('results');
  
  // Results view sub-tabs: 'summary' | 'individual'
  const [resultsMode, setResultsMode] = useState<'summary' | 'individual'>('summary');

  // Export dropdown state
  const [isExportOpen, setIsExportOpen] = useState(false);

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
      name: getUserFIO(s),
      email: s.email,
      date: s.date,
      avatarColor: s.avatarColor,
      text: s.answers.q6,
      firstName: s.firstName,
      lastName: s.lastName,
      patronymic: s.patronymic
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
    return MOCK_SUBMISSIONS.filter(s => getUserFIO(s).toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
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

  // Client-side Export Methods
  // ─── Выгрузка отчётов ──────────────────────────────────────────────────────
  // Три отдельных отчёта, потому что у них принципиально разный размер:
  // сводка не растёт от числа участников, ответы растут линейно.

  const reportCtx = (): Reports.ReportContext => ({
    generatedAt: new Date().toLocaleString('ru-RU'),
    fileStamp: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    filters: {
      'Опрос': MOCK_SURVEY.title,
      'Поиск': individualSearch || undefined,
    },
  });

  const filePrefix = `Опрос_${MOCK_SURVEY.id}`;

  /** Строки сводки: по одной на каждый вариант ответа. */
  const summaryRows = (): Reports.SurveySummaryRow[] =>
    SURVEY_RESULTS.filter(q => q.options.length > 0).flatMap(q =>
      q.options.map(o => ({
        questionNum: q.num,
        questionText: questionText(q),
        typeLabel: q.typeLabel,
        optionLabel: o.label,
        count: o.count,
        pct: o.pct,
        average: q.average,
      }))
    );

  /** Мета вопросов для колонок широкой таблицы (открытые тоже нужны). */
  const questionMeta = (): Reports.SurveyQuestionMeta[] =>
    SURVEY_RESULTS.map(q => ({ id: q.id, num: q.num, text: questionText(q) }));

  /** Ответ приводим к тексту: множественный выбор через «;», смайлик — подписью. */
  const answerToText = (q: SurveyQuestionResult, raw: any): string => {
    if (raw === undefined || raw === null || raw === '') return '';
    if (Array.isArray(raw)) return raw.join('; ');
    if (q.type === 'emoji') {
      const opt = q.options.find(o => o.display === raw);
      return opt ? opt.label : String(raw);
    }
    return String(raw);
  };

  const respondentRows = (): Reports.SurveyRespondentRow[] =>
    filteredSubmissions.map(s => {
      const answers: Record<string, string> = {};
      SURVEY_RESULTS.forEach(q => {
        answers[q.id] = answerToText(q, (s.answers as any)[q.id]);
      });
      return { name: getUserFIO(s), email: s.email, date: s.date, answers };
    });

  const openAnswerRows = (): Reports.SurveyOpenAnswerRow[] => {
    const openQuestions = SURVEY_RESULTS.filter(q => q.type === 'open');
    return openQuestions.flatMap(q =>
      filteredSubmissions
        .filter(s => (s.answers as any)[q.id])
        .map(s => ({
          questionText: questionText(q),
          name: getUserFIO(s),
          email: s.email,
          date: s.date,
          text: String((s.answers as any)[q.id]),
        }))
    );
  };

  // Счётчики строк показываются прямо в меню: человек заранее видит объём,
  // а не узнаёт о нём, когда браузер уже подвис.
  const summaryRowCount = SURVEY_RESULTS.reduce((a, q) => a + q.options.length, 0);
  const respondentRowCount = filteredSubmissions.length;
  const openAnswerRowCount = SURVEY_RESULTS
    .filter(q => q.type === 'open')
    .reduce((a, q) => a + filteredSubmissions.filter(s => (s.answers as any)[q.id]).length, 0);
  const isHeavyExport = respondentRowCount > 5000;

  const exportSummary = () => {
    setIsExportOpen(false);
    Reports.downloadBlock(Reports.surveySummaryTemplate, summaryRows(), reportCtx(), filePrefix);
  };

  const exportRespondents = () => {
    setIsExportOpen(false);
    Reports.downloadBlock(
      Reports.surveyRespondentsTemplate(questionMeta()),
      respondentRows(),
      reportCtx(),
      filePrefix
    );
  };

  const exportOpenAnswers = () => {
    setIsExportOpen(false);
    Reports.downloadBlock(Reports.surveyOpenAnswersTemplate, openAnswerRows(), reportCtx(), filePrefix);
  };

  const exportEverything = () => {
    setIsExportOpen(false);
    Reports.downloadWorkbook(
      [
        { template: Reports.surveySummaryTemplate, rows: summaryRows() },
        { template: Reports.surveyRespondentsTemplate(questionMeta()), rows: respondentRows() },
        { template: Reports.surveyOpenAnswersTemplate, rows: openAnswerRows() },
      ],
      reportCtx(),
      `Опрос_${MOCK_SURVEY.id}_полный`
    );
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] relative h-full overflow-y-auto pb-16 text-neutral-800">
      
      {/* Top sticky header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm w-full">
        <div className="flex items-center justify-between h-16 px-6 max-w-[1200px] mx-auto w-full">
          
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
            
            {/* Header Switcher: Ответы first, Предпросмотр second */}
            <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-0.5">
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'results' 
                    ? 'bg-white text-neutral-900 border border-neutral-200/55 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ответы</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-white text-neutral-900 border border-neutral-200/55 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Предпросмотр</span>
              </button>
            </div>

            {/* Combined export button "Отчет" with dropdown format selector */}
            <div className="relative">
              {isExportOpen && (
                <div className="fixed inset-0 z-[190]" onClick={() => setIsExportOpen(false)} />
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="h-9 px-4 font-medium text-[13px] bg-white text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 border-neutral-200 shadow-sm"
              >
                <Download className="w-4 h-4 text-neutral-500" />
                <span>Отчет</span>
              </Button>

              {/* Format selection popover */}
              {isExportOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-[200] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 pt-1 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Скачать Excel
                  </div>

                  <button
                    onClick={exportSummary}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-start gap-2.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-neutral-800">Сводка по вопросам</span>
                      <span className="block text-[10px] text-neutral-400 font-medium leading-snug">
                        Итоги по каждому варианту ответа · {summaryRowCount} строк
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={exportRespondents}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-start gap-2.5"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-neutral-800">Ответы участников</span>
                      <span className="block text-[10px] text-neutral-400 font-medium leading-snug">
                        Одна строка на участника · {respondentRowCount} строк
                        {isHeavyExport && <span className="text-amber-600"> · большой файл</span>}
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={exportOpenAnswers}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-start gap-2.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-violet-600 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-neutral-800">Открытые ответы</span>
                      <span className="block text-[10px] text-neutral-400 font-medium leading-snug">
                        Свободный текст отдельно · {openAnswerRowCount} строк
                      </span>
                    </span>
                  </button>

                  <div className="h-px bg-neutral-100 my-1" />

                  <button
                    onClick={exportEverything}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-start gap-2.5"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-neutral-800">Всё вместе</span>
                      <span className="block text-[10px] text-neutral-400 font-medium leading-snug">
                        Одна книга, три листа
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Редактировать Button styled exactly as courses lesson preview primary button */}
            <Button 
              onClick={() => router.push(`/surveys/create?id=${MOCK_SURVEY.id}`)}
              variant="primary" 
              className="h-9 px-4 font-medium text-[13px] shadow-sm"
            >
              Редактировать
            </Button>
          </div>

        </div>
      </header>

      {/* Centered screen content wrapper */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6 animate-in fade-in duration-200">
        
        {/* ========================================================================= */}
        {/* PREVIEW MODE                                                              */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="w-full flex flex-col gap-5">
            
            {/* Header info */}
            <div>
              <h2 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-neutral-400" />
                Предпросмотр контента
              </h2>
            </div>

            {/* Interactive Survey Sheet */}
            <div className="border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col bg-white">
              <div className="p-10 lg:p-14 max-w-[850px] mx-auto w-full flex-1 flex flex-col gap-8">
                
                {/* Cover Title (Metadata tags category and lang badges removed as requested) */}
                <div className="pb-6 border-b border-neutral-100">
                  <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{MOCK_SURVEY.title}</h1>
                  <p className="text-[15px] text-neutral-500 leading-relaxed mt-4">{MOCK_SURVEY.description}</p>
                </div>

                {/* Decor Block: Image */}
                <div className="space-y-2">
                  <img 
                    src={MOCK_SURVEY.content[1].url} 
                    alt="Decor" 
                    className="w-full rounded-2xl object-cover shadow-sm" 
                  />
                  {MOCK_SURVEY.content[1].caption && (
                    <p className="text-center text-[13px] text-neutral-500 mt-2 font-medium">
                      {MOCK_SURVEY.content[1].caption}
                    </p>
                  )}
                </div>

                {/* Text Block intro */}
                <div className="prose prose-neutral max-w-none text-neutral-800 text-[15px] leading-relaxed">
                  <p>{MOCK_SURVEY.content[0].html}</p>
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Question 1: Да/Нет (Technical category badges removed) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[2].text}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      onClick={() => setPrevQ1Val('Правда')}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${
                        prevQ1Val === 'Правда' 
                          ? 'border-emerald-400 bg-emerald-50/30' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        prevQ1Val === 'Правда' ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                      <p className={`text-[14px] font-semibold ${prevQ1Val === 'Правда' ? 'text-emerald-700' : 'text-neutral-600'}`}>Правда</p>
                    </button>

                    <button
                      onClick={() => setPrevQ1Val('Ложь')}
                      className={`p-5 rounded-xl border-2 text-center transition-all ${
                        prevQ1Val === 'Ложь' 
                          ? 'border-rose-450 bg-rose-50/30' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        prevQ1Val === 'Ложь' ? 'bg-rose-500 text-white' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        <X className="w-5 h-5" />
                      </div>
                      <p className={`text-[14px] font-semibold ${prevQ1Val === 'Ложь' ? 'text-rose-700' : 'text-neutral-600'}`}>Ложь</p>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Question 2: Rating Scale 1-5 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[3].text}</h3>
                  <div className="flex gap-3 mt-2 max-w-md">
                    {[1, 2, 3, 4, 5].map(val => {
                      const isSelected = prevQ2Val === val;
                      return (
                        <button
                          key={val}
                          onClick={() => setPrevQ2Val(val)}
                          className={`w-11 h-11 rounded-xl border-2 text-[15px] font-bold transition-all flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-900 scale-105'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
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
                    <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[4].text}</h3>
                  <div className="flex gap-3 mt-2 max-w-sm">
                    {MOCK_SURVEY.content[4].options?.map(emoji => {
                      const isSelected = prevQ3Val === emoji;
                      return (
                        <button
                          key={emoji}
                          onClick={() => setPrevQ3Val(emoji)}
                          className={`w-12 h-12 rounded-xl border-2 text-2xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-neutral-200 bg-white hover:border-neutral-350'
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
                    <span className="text-xs text-rose-500 font-bold">* Обязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[5].text}</h3>
                  <div className="space-y-3 mt-2">
                    {MOCK_SURVEY.content[5].options?.map(opt => {
                      const isSelected = prevQ4Val === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setPrevQ4Val(opt)}
                          className={`w-full p-4 rounded-xl border-2 text-left text-[15px] font-medium transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900' 
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          {opt}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
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
                    <span className="text-xs text-neutral-400 font-bold">Необязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[6].text}</h3>
                  <div className="space-y-3 mt-2">
                    {MOCK_SURVEY.content[6].options?.map(opt => {
                      const isSelected = prevQ5Val.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleQ5Toggle(opt)}
                          className={`w-full p-4 rounded-xl border-2 text-left text-[15px] font-medium transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50/30 text-purple-900' 
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          {opt}
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
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

                {/* Question 6: Open question */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-bold">Необязательный</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-neutral-900 leading-relaxed">{MOCK_SURVEY.content[7].text}</h3>
                  <textarea
                    value={prevQ6Val}
                    onChange={(e) => setPrevQ6Val(e.target.value)}
                    placeholder="Опишите ваши идеи..."
                    rows={4}
                    className="w-full mt-2 p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm font-medium outline-none focus:border-neutral-300 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="h-px bg-neutral-100 mt-4" />

                {/* Bottom bar */}
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => alert('Демо-отправка завершена!')}
                    className="h-9 px-5 rounded-lg text-xs font-bold text-white bg-neutral-955 hover:bg-neutral-900 transition-colors"
                  >
                    Отправить
                  </button>
                </div>

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

            {/* Results sub-tab switchers and Export panel */}
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
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ДА/НЕТ</span>
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
                          Правда: 78% (92 отв.)
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Ложь: 22% (26 отв.)
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
                      <span className="text-4xl font-bold text-indigo-600">{SURVEY_RESULTS[1].average}</span>
                      <span className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">Ср. Оценка</span>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {SURVEY_RESULTS[1].options.map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="min-w-[64px] whitespace-nowrap text-[11px] font-semibold text-neutral-500">{item.display}</span>
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
                    {SURVEY_RESULTS[2].options.map(item => (
                      <div key={item.label} className="bg-neutral-50 border border-neutral-150 rounded-xl p-3 flex flex-col items-center">
                        <span className="text-2xl" title={item.label}>{item.display}</span>
                        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-3">
                          <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 mt-1 text-center whitespace-nowrap">
                          {item.pct}% ({item.count} отв.)
                        </span>
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
                    {SURVEY_RESULTS[3].options.map((row) => (
                      <div key={row.label} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-neutral-800">{row.label}</span>
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
                    {SURVEY_RESULTS[4].options.map((row) => (
                      <div key={row.label} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-neutral-800">{row.label}</span>
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
                              <div className="flex flex-col min-w-0 flex-1">
                                <MarqueeText text={item.name} className="text-xs font-bold text-neutral-800 leading-tight" />
                                <MarqueeText text={item.email} className="text-[9px] text-neutral-400 font-semibold leading-tight" />
                              </div>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-semibold shrink-0">{item.date}</span>
                          </div>
                          <p className="text-xs font-normal leading-relaxed text-neutral-700">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Clean Aligned Pagination */}
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
                            <ChevronDown className="w-3 h-3 text-neutral-455 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                                {getUserInitials(sub)}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <MarqueeText text={getUserFIO(sub)} className="text-xs font-semibold text-neutral-800" />
                                <MarqueeText text={sub.email} className="text-[9px] text-neutral-400 font-medium" />
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
                          <span className="text-[9px] text-neutral-455">Стр. {individualPage} из {individualTotalPages}</span>
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
                        {getUserInitials(selectedSubmission)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-neutral-800 text-xs leading-tight">{getUserFIO(selectedSubmission)}</h4>
                        <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{selectedSubmission.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{selectedSubmission.date}</span>
                  </div>

                  {/* Submission Answers lists */}
                  <div className="space-y-5">
                    
                    {/* Q1 Answer (Правда/Ложь cards, highlighting selected) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">ВОПРОС 1 • ДА/НЕТ</span>
                      <h4 className="font-semibold text-neutral-700 text-xs">{MOCK_SURVEY.content[2].text}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div
                          className={`p-5 rounded-xl border-2 text-center transition-all ${
                            selectedSubmission.answers.q1 === 'Правда' 
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                              : 'border-neutral-200 bg-white opacity-40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            selectedSubmission.answers.q1 === 'Правда' ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'
                          }`}>
                            <Check className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold">Правда</p>
                        </div>

                        <div
                          className={`p-5 rounded-xl border-2 text-center transition-all ${
                            selectedSubmission.answers.q1 === 'Ложь' 
                              ? 'border-rose-500 bg-rose-50 text-rose-900' 
                              : 'border-neutral-200 bg-white opacity-40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            selectedSubmission.answers.q1 === 'Ложь' ? 'bg-rose-500 text-white' : 'bg-neutral-100 text-neutral-400'
                          }`}>
                            <X className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold">Ложь</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q2 Answer (Scale 1-5) */}
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

                    {/* Q3 Answer (Emoji Choice) */}
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

                    {/* Q4 Answer (Single Choice) */}
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
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-200'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-neutral-150" />

                    {/* Q5 Answer (Multiple Choice) */}
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
