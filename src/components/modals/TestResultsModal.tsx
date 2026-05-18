"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, Download, Clock, Check, XCircle, AlertTriangle,
  HelpCircle, CheckCircle2, MinusCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
// Test question types: radio, checkbox, true/false, lines (matching), drag&drop (ordering)

type QuestionType = 'single' | 'multiple' | 'true_false' | 'matching' | 'ordering';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  earnedPoints: number;
  answers: Answer[];
  pairs?: { left: string; right: string; userRight: string }[];  // for matching (lines)
  correctOrder?: string[];   // for ordering (drag&drop)
  userOrder?: string[];      // for ordering (drag&drop)
}

export interface TestResultData {
  testTitle: string;
  studentName: string;
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: string;
  finishedAt: string;
  duration: string;
  questions: Question[];
}

// ─── Mock data ───────────────────────────────────────────────────────────────

export const MOCK_TEST_RESULTS: Record<string, TestResultData> = {
  'test-basics': {
    testTitle: 'Тест: Основные понятия',
    studentName: 'Белов Андрей Геннадьевич',
    score: 5,
    maxScore: 5,
    passed: true,
    startedAt: '15.03.2026 09:42',
    finishedAt: '15.03.2026 10:00',
    duration: '18 мин',
    questions: [
      {
        id: 'q1', type: 'single', text: 'Что является основной целью корпоративной безопасности?',
        points: 1, earnedPoints: 1,
        answers: [
          { id: 'a1', text: 'Увеличение прибыли компании', isCorrect: false, isSelected: false },
          { id: 'a2', text: 'Защита активов, данных и сотрудников организации', isCorrect: true, isSelected: true },
          { id: 'a3', text: 'Контроль рабочего времени', isCorrect: false, isSelected: false },
          { id: 'a4', text: 'Автоматизация бизнес-процессов', isCorrect: false, isSelected: false },
        ]
      },
      {
        id: 'q2', type: 'multiple', text: 'Какие из перечисленных элементов входят в систему корпоративной безопасности?',
        points: 1, earnedPoints: 1,
        answers: [
          { id: 'a5', text: 'Информационная безопасность', isCorrect: true, isSelected: true },
          { id: 'a6', text: 'Физическая безопасность', isCorrect: true, isSelected: true },
          { id: 'a7', text: 'Маркетинговый анализ', isCorrect: false, isSelected: false },
          { id: 'a8', text: 'Кадровая безопасность', isCorrect: true, isSelected: true },
          { id: 'a9', text: 'Дизайн интерьера офиса', isCorrect: false, isSelected: false },
        ]
      },
      {
        id: 'q3', type: 'true_false', text: 'Корпоративная безопасность включает только защиту от внешних угроз.',
        points: 1, earnedPoints: 1,
        answers: [
          { id: 'a10', text: 'Правда', isCorrect: false, isSelected: false },
          { id: 'a11', text: 'Ложь', isCorrect: true, isSelected: true },
        ]
      },
      {
        id: 'q4', type: 'matching', text: 'Сопоставьте виды угроз с примерами.',
        points: 1, earnedPoints: 1,
        answers: [],
        pairs: [
          { left: 'Внешняя угроза', right: 'Хакерская атака', userRight: 'Хакерская атака' },
          { left: 'Внутренняя угроза', right: 'Утечка данных сотрудником', userRight: 'Утечка данных сотрудником' },
          { left: 'Техногенная угроза', right: 'Сбой серверного оборудования', userRight: 'Сбой серверного оборудования' },
        ]
      },
      {
        id: 'q5', type: 'ordering', text: 'Расположите уровни доступа от минимального к максимальному.',
        points: 1, earnedPoints: 1,
        answers: [],
        correctOrder: ['Гостевой', 'Базовый', 'Расширенный', 'Административный'],
        userOrder: ['Гостевой', 'Базовый', 'Расширенный', 'Административный'],
      }
    ]
  },
  'test-data-protection': {
    testTitle: 'Тест: Защита данных',
    studentName: 'Белов Андрей Геннадьевич',
    score: 1,
    maxScore: 5,
    passed: false,
    startedAt: '17.03.2026 13:50',
    finishedAt: '17.03.2026 14:15',
    duration: '25 мин',
    questions: [
      {
        id: 'q10', type: 'single', text: 'Какой протокол обеспечивает шифрование данных при передаче через интернет?',
        points: 1, earnedPoints: 1,
        answers: [
          { id: 'b1', text: 'HTTP', isCorrect: false, isSelected: false },
          { id: 'b2', text: 'FTP', isCorrect: false, isSelected: false },
          { id: 'b3', text: 'TLS/SSL', isCorrect: true, isSelected: true },
          { id: 'b4', text: 'SMTP', isCorrect: false, isSelected: false },
        ]
      },
      {
        id: 'q11', type: 'multiple', text: 'Выберите симметричные алгоритмы шифрования.',
        points: 1, earnedPoints: 0,
        answers: [
          { id: 'b5', text: 'AES', isCorrect: true, isSelected: true },
          { id: 'b6', text: 'RSA', isCorrect: false, isSelected: true },
          { id: 'b7', text: 'DES', isCorrect: true, isSelected: false },
          { id: 'b8', text: 'Blowfish', isCorrect: true, isSelected: false },
        ]
      },
      {
        id: 'q12', type: 'true_false', text: 'VPN полностью гарантирует анонимность пользователя в интернете.',
        points: 1, earnedPoints: 0,
        answers: [
          { id: 'b9', text: 'Правда', isCorrect: false, isSelected: true },
          { id: 'b10', text: 'Ложь', isCorrect: true, isSelected: false },
        ]
      },
      {
        id: 'q13', type: 'matching', text: 'Сопоставьте технологию защиты с её назначением.',
        points: 1, earnedPoints: 0,
        answers: [],
        pairs: [
          { left: 'Firewall', right: 'Фильтрация сетевого трафика', userRight: 'Фильтрация сетевого трафика' },
          { left: 'IDS', right: 'Обнаружение вторжений', userRight: 'Шифрование каналов' },
          { left: 'VPN', right: 'Шифрование каналов', userRight: 'Обнаружение вторжений' },
        ]
      },
      {
        id: 'q14', type: 'ordering', text: 'Расположите этапы шифрования в правильном порядке.',
        points: 1, earnedPoints: 0,
        answers: [],
        correctOrder: ['Генерация ключа', 'Шифрование данных', 'Передача', 'Дешифрование'],
        userOrder: ['Генерация ключа', 'Передача', 'Шифрование данных', 'Дешифрование'],
      }
    ]
  },
  'test-60-questions': {
    testTitle: 'Тест: Итоговый экзамен (60 вопросов)',
    studentName: 'Белов Андрей Геннадьевич',
    score: 48,
    maxScore: 60,
    passed: true,
    startedAt: '18.03.2026 10:00',
    finishedAt: '18.03.2026 11:30',
    duration: '1 ч 30 мин',
    questions: Array.from({ length: 60 }).map((_, i) => {
      const pool = [
        { text: 'Что такое фишинг?', a: ['Защита сети', 'Вид интернет-мошенничества для кражи данных', 'Антивирусная программа', 'Утилита для бэкапа'], c: 1 },
        { text: 'Какое правило создания пароля является верным?', a: ['Минимум 4 символа', 'Использование даты рождения', 'Длина не менее 12 символов, буквы разных регистров и цифры', 'Один пароль для всех сервисов'], c: 2 },
        { text: 'Что означает принцип "Чистого стола"?', a: ['Регулярная уборка клининговой службой', 'Отсутствие конфиденциальных документов на столе при уходе с рабочего места', 'Отсутствие личных вещей', 'Запрет на обеды на рабочем месте'], c: 1 },
        { text: 'Как правильно передавать пароль коллеге?', a: ['В рабочем мессенджере', 'По электронной почте', 'На стикере', 'Пароль нельзя передавать никому'], c: 3 },
        { text: 'Что делать, если вы потеряли рабочий смартфон?', a: ['Купить новый за свой счет', 'Немедленно сообщить в службу ИБ для блокировки', 'Подождать день, вдруг найдется', 'Сказать, что забыли дома'], c: 1 },
        { text: 'Для чего используется VPN при удаленной работе?', a: ['Для ускорения интернета', 'Для создания безопасного зашифрованного канала связи', 'Для обхода блокировок сайтов', 'Для экономии мобильного трафика'], c: 1 },
        { text: 'Что такое многофакторная аутентификация (MFA)?', a: ['Использование длинного пароля', 'Вход в систему с разных устройств', 'Система, требующая двух и более методов подтверждения личности', 'Система распознавания лиц'], c: 2 },
        { text: 'Что из перечисленного является конфиденциальной информацией?', a: ['Публичный устав компании', 'Финансовый отчет до его официального оглашения', 'Адрес центрального офиса', 'Рекламная брошюра'], c: 1 },
        { text: 'Какой вид вредоносного ПО блокирует доступ к данным и требует выкуп?', a: ['Spyware', 'Ransomware (шифровальщик)', 'Adware', 'Trojan'], c: 1 },
        { text: 'Как безопасно утилизировать бумажные документы с важными данными?', a: ['Выбросить в обычную урну', 'Разорвать пополам', 'Пропустить через офисный шредер', 'Забрать домой'], c: 2 },
        { text: 'Что такое социальная инженерия в контексте ИБ?', a: ['Разработка корпоративных соцсетей', 'Метод получения доступа к информации путем психологического манипулирования', 'Создание удобных интерфейсов', 'Анализ социальных связей сотрудников'], c: 1 },
        { text: 'Какое подключение к интернету в командировке наиболее опасно?', a: ['Корпоративный мобильный интернет', 'Открытый публичный Wi-Fi в кафе или аэропорту', 'Запароленный Wi-Fi в отеле', 'Режим модема со смартфона коллеги'], c: 1 },
        { text: 'Какое действие является грубым нарушением безопасности?', a: ['Смена пароля раз в квартал', 'Пересылка рабочих документов на личную почту (например, на Mail.ru)', 'Блокировка экрана (Win+L) при уходе', 'Использование корпоративного VPN'], c: 1 },
        { text: 'Что следует сделать при получении письма с вложением от неизвестного отправителя?', a: ['Открыть вложение из любопытства', 'Переслать коллегам', 'Удалить письмо и сообщить в службу поддержки ИБ', 'Ответить отправителю'], c: 2 },
        { text: 'Что значит статус документа "Коммерческая тайна"?', a: ['Документ можно публиковать в профильных СМИ', 'Доступ имеют только лица с оформленным допуском', 'Документ доступен всем сотрудникам', 'Документ необходимо немедленно уничтожить'], c: 1 }
      ];
      const q = pool[i % pool.length];
      const isWrong = i % 5 === 0; // Каждый пятый ответ неверный (итого 48/60)
      
      return {
        id: `q_big_${i}`,
        type: 'single',
        text: q.text,
        points: 1,
        earnedPoints: isWrong ? 0 : 1,
        answers: q.a.map((ans, aIdx) => ({
          id: `a_big_${i}_${aIdx}`,
          text: ans,
          isCorrect: aIdx === q.c,
          isSelected: isWrong ? (aIdx === (q.c + 1) % 4) : aIdx === q.c,
        }))
      };
    })
  }
};

// ─── Question type labels & icons ────────────────────────────────────────────

const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string; badge: string }> = {
  single:     { label: 'Один вариант',        badge: 'Один ответ' },
  multiple:   { label: 'Несколько вариантов', badge: 'Несколько' },
  true_false: { label: 'Правда / Ложь',       badge: 'Да / Нет' },
  matching:   { label: 'Соединение',          badge: 'Соединение' },
  ordering:   { label: 'Порядок',             badge: 'Порядок' },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface TestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
}

export function TestResultsModal({ isOpen, onClose, testId }: TestResultsModalProps) {
  const data = MOCK_TEST_RESULTS[testId];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [testId, isOpen, itemsPerPage]);

  if (!isOpen || !data) return null;

  const actualItemsPerPage = itemsPerPage === 'all' ? data.questions.length : itemsPerPage;
  const totalPages = Math.ceil(data.questions.length / actualItemsPerPage);
  const pagedQuestions = data.questions.slice((currentPage - 1) * actualItemsPerPage, currentPage * actualItemsPerPage);

  const renderQuestion = (q: Question, idx: number) => {
    // A question is correct ONLY if earnedPoints === points
    const isCorrect = q.earnedPoints === q.points;
    const cfg = QUESTION_TYPE_CONFIG[q.type];
    const globalIdx = (currentPage - 1) * actualItemsPerPage + idx + 1;

    return (
      <div key={q.id} className="border border-neutral-200 rounded-2xl overflow-hidden">
        {/* Question header */}
        <div className={`flex items-start gap-3 px-5 py-4 ${
          isCorrect ? 'bg-emerald-50/50' : 'bg-rose-50/50'
        }`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isCorrect ? 'bg-emerald-100' : 'bg-rose-100'
          }`}>
            {isCorrect ? <Check className="w-4 h-4 text-emerald-600" /> 
              : <XCircle className="w-4 h-4 text-rose-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-bold text-neutral-400">Вопрос {globalIdx}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500 uppercase tracking-wider">
                {cfg.badge}
              </span>
            </div>
            <p className="text-[14px] font-semibold text-neutral-900 leading-snug">{q.text}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-[15px] font-bold ${
              isCorrect ? 'text-emerald-600' : 'text-rose-600'
            }`}>{q.earnedPoints}</span>
            <span className="text-[13px] text-neutral-400">/{q.points}</span>
          </div>
        </div>

        {/* Answer body */}
        <div className="px-5 py-4 space-y-2">
          {/* Radio / Checkbox / True-False */}
          {(q.type === 'single' || q.type === 'multiple' || q.type === 'true_false') && q.answers.map(a => {
            const isRight = a.isCorrect;
            const picked = a.isSelected;
            const wrongPick = picked && !isRight;
            const correctNotPicked = isRight && !picked;
            
            // Radio = circle, Checkbox = square, True/False = circle
            const isCheckbox = q.type === 'multiple';
            
            return (
              <div key={a.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                wrongPick
                  ? 'bg-rose-50 border-rose-200'
                  : picked && isRight
                    ? 'bg-emerald-50 border-emerald-200'
                    : correctNotPicked
                      ? 'bg-neutral-50 border-neutral-200 border-dashed'
                      : 'bg-neutral-50 border-neutral-100'
              }`}>
                {/* Visual radio/checkbox indicator */}
                <div className="shrink-0">
                  {isCheckbox ? (
                    <div className={`w-4.5 h-4.5 rounded-[4px] border-2 flex items-center justify-center ${
                      picked && isRight ? 'bg-emerald-500 border-emerald-500' 
                        : wrongPick ? 'bg-rose-500 border-rose-500'
                        : 'border-neutral-300 bg-white'
                    }`}>
                      {picked && <Check className="w-3 h-3 text-white" />}
                    </div>
                  ) : (
                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                      picked && isRight ? 'border-emerald-500' 
                        : wrongPick ? 'border-rose-500'
                        : 'border-neutral-300 bg-white'
                    }`}>
                      {picked && <div className={`w-2 h-2 rounded-full ${isRight ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                    </div>
                  )}
                </div>

                <span className={`text-[13px] flex-1 ${
                  wrongPick ? 'text-rose-700' 
                    : picked && isRight ? 'text-emerald-800 font-medium'
                    : 'text-neutral-600'
                }`}>{a.text}</span>

                {picked && isRight && <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/50 px-2 py-1 rounded">Выбран (Верно)</span>}
                {wrongPick && <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/50 px-2 py-1 rounded">Выбран (Ошибка)</span>}
                {correctNotPicked && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-100/50 px-2 py-1 rounded">Верный ответ</span>}
              </div>
            );
          })}

          {/* Matching (Lines) */}
          {q.type === 'matching' && q.pairs && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-1 mb-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Элемент</span>
                <span />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ответ студента</span>
              </div>
              {q.pairs.map((pair, i) => {
                const pairCorrect = pair.right === pair.userRight;
                return (
                  <div key={i} className={`grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-3 rounded-xl border ${
                    pairCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <span className="text-[13px] font-medium text-neutral-800">{pair.left}</span>
                    <div className={`w-8 flex items-center justify-center ${pairCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <svg width="24" height="2" viewBox="0 0 24 2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polygon points="20,0 24,1 20,2" fill="currentColor" /></svg>
                    </div>
                    <div className="flex flex-col gap-1.5 justify-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] ${pairCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}`}>
                          {pair.userRight}
                        </span>
                        {pairCorrect && <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/50 px-1.5 py-0.5 rounded">Верно</span>}
                        {!pairCorrect && <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/50 px-1.5 py-0.5 rounded">Ошибка</span>}
                      </div>
                      {!pairCorrect && (
                        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-100/50 px-2 py-1 rounded w-fit border border-emerald-200 border-dashed">
                          Верный ответ: {pair.right}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ordering (Drag & Drop) */}
          {q.type === 'ordering' && q.userOrder && q.correctOrder && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Ответ студента</span>
                <div className="space-y-1.5">
                  {q.userOrder.map((item, i) => {
                    const isRightPos = q.correctOrder![i] === item;
                    return (
                      <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
                        isRightPos ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                      }`}>
                        <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                          isRightPos ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'
                        }`}>{i + 1}</span>
                        <span className={`text-[13px] flex-1 ${isRightPos ? 'text-emerald-800 font-medium' : 'text-rose-700 font-medium'}`}>{item}</span>
                        {isRightPos 
                          ? <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/50 px-1.5 py-0.5 rounded">Верно</span>
                          : <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/50 px-1.5 py-0.5 rounded">Ошибка</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Верный порядок</span>
                <div className="space-y-1.5">
                  {q.correctOrder.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 border-dashed">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-[13px] text-emerald-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.passed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <HelpCircle className={`w-5 h-5 ${data.passed ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">{data.testTitle}</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">{data.studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors">
              <Download className="w-3.5 h-3.5" /> Выгрузить
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Результат</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-[22px] font-bold ${data.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{data.score}</span>
                <span className="text-[14px] text-neutral-400">/ {data.maxScore}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md w-fit ${
                data.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {data.passed ? 'Сдан' : 'Не сдан'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Начало</span>
              <span className="text-[14px] font-semibold text-neutral-800">{data.startedAt}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Завершение</span>
              <span className="text-[14px] font-semibold text-neutral-800">{data.finishedAt}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Длительность</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-[14px] font-semibold text-neutral-800">{data.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">
              Вопросы · {data.questions.length}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-neutral-500">Показывать по:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-[12px] font-medium text-neutral-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer p-0"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value="all">Все</option>
                </select>
              </div>
              {totalPages > 1 && (
                <span className="text-[12px] font-medium text-neutral-400 border-l border-neutral-200 pl-4">
                  Страница {currentPage} из {totalPages}
                </span>
              )}
            </div>
          </div>
          {pagedQuestions.map((q, idx) => renderQuestion(q, idx))}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Назад
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                // Show a few pages around current page, or first/last
                if (totalPages > 7) {
                  if (i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                    if (i === 1 || i === totalPages - 2) return <span key={i} className="px-2 text-neutral-400">...</span>;
                    return null;
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-colors ${
                      currentPage === i + 1
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Далее <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
