"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Link2,
  ListOrdered,
  Plus,
  Trash2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Eye,
  Download,
  FileText,
  Play,
  AlertTriangle,
  Lightbulb,
  Info,
  Zap,
  Shield,
  CheckCircle,
  Code,
  QrCode,
  Mic,
  X
} from "lucide-react";

// ─── Drag & Drop Item Type & Data ─────────────────────────────────────────────

interface SortableItemType {
  id: string;
  text: string;
  correctIndex: number;
}

const INITIAL_ORDER_ITEMS: SortableItemType[] = [
  { id: "step-1", text: "Создать новый проект с помощью команды npx create-next-app", correctIndex: 0 },
  { id: "step-2", text: "Настроить конфигурационные файлы tailwind.config.ts и next.config.ts", correctIndex: 1 },
  { id: "step-3", text: "Разработать базовую структуру папок и компонентов в директории src", correctIndex: 2 },
  { id: "step-4", text: "Подключить глобальные стили globals.css и импортировать шрифты", correctIndex: 3 },
  { id: "step-5", text: "Запустить локальный сервер разработки с помощью npm run dev для тестирования", correctIndex: 4 },
];

// ─── Sortable Component ───────────────────────────────────────────────────────

function SortableItem({ item, showResult, isCorrect }: { item: SortableItemType; showResult: boolean; isCorrect: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-4 p-4 bg-white border cursor-grab active:cursor-grabbing touch-none ${
        isDragging 
          ? "border-indigo-400 shadow-md scale-[1.01] z-50 bg-neutral-50/50" 
          : showResult 
            ? isCorrect 
              ? "border-emerald-500 bg-emerald-50/20" 
              : "border-rose-500 bg-rose-50/20"
            : "border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/30"
      } rounded-xl transition-all select-none`}
    >
      <div className="p-1 rounded-md text-neutral-400 shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-neutral-800 leading-normal">{item.text}</p>
      </div>

      {showResult && (
        <div className="shrink-0 ml-2">
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-500" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Column Matching Types & Data ─────────────────────────────────────────────

interface MatchingNode {
  id: string;
  text: string;
  type: "left" | "right";
  pairId: string;
}

const LEFT_NODES: MatchingNode[] = [
  { id: "l-html", text: "HTML", type: "left", pairId: "r-html" },
  { id: "l-css", text: "CSS", type: "left", pairId: "r-css" },
  { id: "l-js", text: "JavaScript", type: "left", pairId: "r-js" },
  { id: "l-react", text: "React", type: "left", pairId: "r-react" },
  { id: "l-ts", text: "TypeScript", type: "left", pairId: "r-ts" },
];

const RIGHT_NODES: MatchingNode[] = [
  { id: "r-js", text: "Язык программирования сценариев для реализации интерактивности на веб-страницах", type: "right", pairId: "l-js" },
  { id: "r-css", text: "Язык описания внешнего вида и стилизации элементов структуры документа", type: "right", pairId: "l-css" },
  { id: "r-react", text: "Библиотека для быстрого и простого построения динамичных компонентных интерфейсов", type: "right", pairId: "l-react" },
  { id: "r-ts", text: "Надмножество JavaScript со строгой типизацией данных и дополнительным синтаксисом", type: "right", pairId: "l-ts" },
  { id: "r-html", text: "Основной язык разметки документов, структурирующий информационные блоки на странице", type: "right", pairId: "l-html" },
];

const PREMIUM_COLORS = [
  "#2563EB", // Royal Blue
  "#7C3AED", // Violet
  "#0D9488", // Teal
  "#EA580C", // Orange
  "#DB2777", // Pink
  "#16A34A", // Green
  "#06B6D4", // Cyan
  "#D97706", // Amber
  "#E11D48", // Rose/Crimson
  "#4F46E5", // Indigo
];

const getDistinctColor = (index: number) => {
  return PREMIUM_COLORS[index % PREMIUM_COLORS.length];
};

interface Connection {
  leftId: string;
  rightId: string;
  isCorrect: boolean;
  colorIndex: number;
}

// Демо-мероприятие для витрины студента. Страница статичная, поэтому параметры лежат здесь.
// dateMode: 'period' — мероприятие идёт сплошным периодом «с … по …»;
//           'days'   — набор отдельных дней с расписанием.
const DEMO_EVENT = {
  dateMode: 'period' as 'days' | 'period',
  periodStart: '28.03.2026',
  periodEnd: '30.03.2026',
  periodTimeStart: '10:00',
  periodTimeEnd: '13:00',
  days: [
    { id: 'd1', label: '1 день', date: '28.03.2026', timeStart: '10:00', timeEnd: '13:00' },
    { id: 'd2', label: '2 день', date: '29.03.2026', timeStart: '10:00', timeEnd: '13:00' },
    { id: 'd3', label: '3 день', date: '30.03.2026', timeStart: '10:00', timeEnd: '14:00' },
  ],
  // Спикеры необязательны: пустой массив — блок «Спикеры» не показывается
  speakers: ['Каримов Алишер', 'Юсупова Дилноза', 'Иванов Иван Сергеевич'],
};

export default function UserViewPlayground() {
  const [currentView, setCurrentView] = useState<"dashboard" | "exercises" | "test" | "survey" | "event">("dashboard");
  const [isEventRegistered, setIsEventRegistered] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEventDaysModal, setShowEventDaysModal] = useState(false);
  const [showDatesTooltipMobile, setShowDatesTooltipMobile] = useState(false);
  const [showSpeakersTooltipMobile, setShowSpeakersTooltipMobile] = useState(false);

  // ─── Survey State ──────────────────────────────────────────────────────────
  const [surveyQ1, setSurveyQ1] = useState<string | null>(null);
  const [isQ1Submitted, setIsQ1Submitted] = useState(false);
  
  const [surveyQ1_1, setSurveyQ1_1] = useState<string | null>(null);
  const [isQ1_1Submitted, setIsQ1_1Submitted] = useState(false);

  const [surveyQ2, setSurveyQ2] = useState<number | null>(null); // Smileys scale (1-5), required
  const [surveyQ3, setSurveyQ3] = useState<number | null>(null); // Numbers scale (1-5)
  const [surveyQ4, setSurveyQ4] = useState<string[]>([]); // Multiple choices checkboxes
  const [surveyQ5, setSurveyQ5] = useState<string>(""); // Short answer
  const [surveyQ6, setSurveyQ6] = useState<string>(""); // Long answer
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);
  const [showSurveyErrors, setShowSurveyErrors] = useState(false);

  const q2Ref = useRef<HTMLDivElement>(null);

  const startSurvey = () => {
    setSurveyQ1(null);
    setIsQ1Submitted(false);
    setSurveyQ1_1(null);
    setIsQ1_1Submitted(false);
    setSurveyQ2(null);
    setSurveyQ3(null);
    setSurveyQ4([]);
    setSurveyQ5("");
    setSurveyQ6("");
    setIsSurveySubmitted(false);
    setShowSurveyErrors(false);
    setCurrentView("survey");
  };

  const submitSurvey = () => {
    if (surveyQ2 === null) {
      setShowSurveyErrors(true);
      setTimeout(() => {
        q2Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setIsSurveySubmitted(true);
  };

  // ─── Test Mode State ────────────────────────────────────────────────────────
  const [testQuestionIndex, setTestQuestionIndex] = useState<number>(0); // 0 = Order, 1 = Matching, 2 = True/False
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testOrderItems, setTestOrderItems] = useState<SortableItemType[]>([]);
  const [testConnections, setTestConnections] = useState<Connection[]>([]);
  const [testSelectedTrueFalse, setTestSelectedTrueFalse] = useState<boolean | null>(null);
  
  // Track drag overlays in test
  const [activeTestDragId, setActiveTestDragId] = useState<string | null>(null);
  const activeTestDragItem = useMemo(() => {
    return testOrderItems.find((item) => item.id === activeTestDragId);
  }, [activeTestDragId, testOrderItems]);

  const [testSelectedLeftId, setTestSelectedLeftId] = useState<string | null>(null);
  const [testHoveredRightId, setTestHoveredRightId] = useState<string | null>(null);
  const [testActiveMobileLeftId, setTestActiveMobileLeftId] = useState<string | null>(null);
  const [testDragStartPoint, setTestDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [testDragCurrentPoint, setTestDragCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [testActiveDragStartNode, setTestActiveDragStartNode] = useState<string | null>(null);

  const startTest = () => {
    setTestQuestionIndex(0);
    setIsTestSubmitted(false);
    setTestSelectedTrueFalse(null);
    setTestConnections([]);
    const shuffled = [...INITIAL_ORDER_ITEMS].sort(() => Math.random() - 0.5);
    setTestOrderItems(shuffled);
    setCurrentView("test");
  };

  // ─── True / False State ─────────────────────────────────────────────────────
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);
  const [showTrueFalseResults, setShowTrueFalseResults] = useState(false);
  const CORRECT_TRUE_FALSE_ANSWER = true; // "Правда" (True) is correct

  const resetTrueFalse = () => {
    setSelectedTrueFalse(null);
    setShowTrueFalseResults(false);
  };

  // ─── Drag & Drop Ordering State ─────────────────────────────────────────────
  const [orderItems, setOrderItems] = useState<SortableItemType[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showOrderResults, setShowOrderResults] = useState(false);

  useEffect(() => {
    resetOrder();
  }, []);

  const resetOrder = () => {
    const shuffled = [...INITIAL_ORDER_ITEMS].sort(() => Math.random() - 0.5);
    setOrderItems(shuffled);
    setShowOrderResults(false);
  };

  const checkOrder = () => {
    setShowOrderResults(true);
  };

  // Support touch sensors for mobile device drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 80,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      setOrderItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setShowOrderResults(false);
    }
  };

  const activeDragItem = useMemo(() => {
    return orderItems.find((item) => item.id === activeDragId);
  }, [activeDragId, orderItems]);

  const handleTestDragStart = (event: DragStartEvent) => {
    setActiveTestDragId(event.active.id as string);
  };

  const handleTestDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTestDragId(null);

    if (over && active.id !== over.id) {
      setTestOrderItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // ─── Column Matching State ──────────────────────────────────────────────────
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [hoveredRightId, setHoveredRightId] = useState<string | null>(null);
  const [showMatchingResults, setShowMatchingResults] = useState(false);

  // Mobile-specific popup/dropdown matching state
  const [activeMobileLeftId, setActiveMobileLeftId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Real-time tracking of pointer / touch for active line drawing
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentPoint, setDragCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [activeDragStartNode, setActiveDragStartNode] = useState<string | null>(null);

  const handleLeftNodeClick = (id: string) => {
    if (showMatchingResults) return;
    setConnections(prev => prev.filter(c => c.leftId !== id));

    if (selectedLeftId === id) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(id);
    }
  };

  const handleRightNodeClick = (rightId: string) => {
    if (showMatchingResults) return;
    if (!selectedLeftId) return;

    setConnections(prev => prev.filter(c => c.rightId !== rightId));

    const leftNode = LEFT_NODES.find(n => n.id === selectedLeftId);
    const rightNode = RIGHT_NODES.find(n => n.id === rightId);
    
    if (leftNode && rightNode) {
      const isCorrect = leftNode.pairId === rightNode.id;
      const colorIndex = LEFT_NODES.findIndex(n => n.id === selectedLeftId);
      setConnections(prev => [...prev, { leftId: selectedLeftId, rightId, isCorrect, colorIndex }]);
    }

    setSelectedLeftId(null);
  };

  // Mobile tap select match helper
  const handleMobileMatchSelect = (leftId: string, rightId: string) => {
    setConnections(prev => prev.filter(c => c.leftId !== leftId && c.rightId !== rightId));
    
    const leftNode = LEFT_NODES.find(n => n.id === leftId);
    const rightNode = RIGHT_NODES.find(n => n.id === rightId);
    
    if (leftNode && rightNode) {
      const isCorrect = leftNode.pairId === rightId;
      const colorIndex = LEFT_NODES.findIndex(n => n.id === leftId);
      setConnections(prev => [...prev, { leftId, rightId, isCorrect, colorIndex }]);
    }
    setActiveMobileLeftId(null);
  };

  // Drag Line mechanics (Pointer/Touch Down/Move/Up handlers)
  const handleNodePointerDown = (id: string, e: React.PointerEvent) => {
    if (showMatchingResults) return;

    const rect = dotRefs.current[id]?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (rect && containerRect) {
      const startX = (rect.left + rect.width / 2) - containerRect.left;
      const startY = (rect.top + rect.height / 2) - containerRect.top;
      
      setDragStartPoint({ x: startX, y: startY });
      setDragCurrentPoint({ x: startX, y: startY });
      setActiveDragStartNode(id);
      
      setConnections(prev => prev.filter(c => c.leftId !== id));
      setSelectedLeftId(id);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (activeDragStartNode && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setDragCurrentPoint({
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top
        });
      }
      
      if (testActiveDragStartNode && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setTestDragCurrentPoint({
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top
        });
      }
    };

    const handlePointerUp = () => {
      if (activeDragStartNode) {
        if (hoveredRightId) {
          const leftNode = LEFT_NODES.find(n => n.id === activeDragStartNode);
          const rightNode = RIGHT_NODES.find(n => n.id === hoveredRightId);
          
          if (leftNode && rightNode) {
            setConnections(prev => prev.filter(c => c.rightId !== hoveredRightId));

            const isCorrect = leftNode.pairId === hoveredRightId;
            const colorIndex = LEFT_NODES.findIndex(n => n.id === activeDragStartNode);
            setConnections(prev => [...prev, { leftId: activeDragStartNode, rightId: hoveredRightId, isCorrect, colorIndex }]);
          }
        }

        setDragStartPoint(null);
        setDragCurrentPoint(null);
        setActiveDragStartNode(null);
        setSelectedLeftId(null);
        setHoveredRightId(null);
      }
      
      if (testActiveDragStartNode) {
        if (testHoveredRightId) {
          const leftNode = LEFT_NODES.find(n => n.id === testActiveDragStartNode);
          const rightNode = RIGHT_NODES.find(n => n.id === testHoveredRightId);
          
          if (leftNode && rightNode) {
            setTestConnections(prev => prev.filter(c => c.rightId !== testHoveredRightId));

            const isCorrect = leftNode.pairId === testHoveredRightId;
            const colorIndex = LEFT_NODES.findIndex(n => n.id === testActiveDragStartNode);
            setTestConnections(prev => [...prev, { leftId: testActiveDragStartNode, rightId: testHoveredRightId, isCorrect, colorIndex }]);
          }
        }

        setTestDragStartPoint(null);
        setTestDragCurrentPoint(null);
        setTestActiveDragStartNode(null);
        setTestSelectedLeftId(null);
        setTestHoveredRightId(null);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeDragStartNode, hoveredRightId, testActiveDragStartNode, testHoveredRightId]);

  // Calculates coordinates of nodes relative to parent SVG container using exact dot centers
  const getConnectionCoordinates = (leftId: string, rightId: string) => {
    const leftDot = dotRefs.current[leftId];
    const rightDot = dotRefs.current[rightId];
    const container = containerRef.current;

    if (!leftDot || !rightDot || !container) return null;

    const leftRect = leftDot.getBoundingClientRect();
    const rightRect = rightDot.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x1: (leftRect.left + leftRect.width / 2) - containerRect.left,
      y1: (leftRect.top + leftRect.height / 2) - containerRect.top,
      x2: (rightRect.left + rightRect.width / 2) - containerRect.left,
      y2: (rightRect.top + rightRect.height / 2) - containerRect.top,
    };
  };

  const checkMatching = () => {
    setShowMatchingResults(true);
  };

  const resetMatching = () => {
    setConnections([]);
    setSelectedLeftId(null);
    setShowMatchingResults(false);
  };

  // Align right side items to be at the same vertical level as left side items
  const sortedRightNodes = useMemo(() => {
    return LEFT_NODES.map((_, idx) => RIGHT_NODES[idx]);
  }, []);

  const resetAllExercises = () => {
    resetOrder();
    resetMatching();
    resetTrueFalse();
  };

  const handleHeaderReset = () => {
    if (currentView === "exercises") {
      resetAllExercises();
    } else if (currentView === "test") {
      startTest();
    } else if (currentView === "survey") {
      startSurvey();
    }
  };

  return (
    <div className="absolute inset-0 bg-white overflow-y-auto flex flex-col z-10">
      {/* Header */}
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            {(currentView === "exercises" || currentView === "test" || currentView === "survey" || currentView === "event") && (
              <button 
                onClick={() => setCurrentView("dashboard")}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 transition-colors mr-1"
                title="Назад"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {currentView === "test" ? (
              <span className="font-bold text-neutral-900 flex items-center gap-2">
                <span>🚀</span> Kirish testi
              </span>
            ) : currentView === "survey" ? (
              <span className="font-bold text-neutral-900 flex items-center gap-2">
                <span>📋</span> Опрос удовлетворенности
              </span>
            ) : currentView === "event" ? (
              <span className="font-bold text-neutral-900 flex items-center gap-2">
                <span>📅</span> Основы искусственного интеллекта
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-neutral-900">
                  {currentView === "dashboard" ? "User View" : "Упражнения к уроку"}
                </span>
              </>
            )}
          </div>
        }
        actions={
          currentView !== "dashboard" ? (
            <button 
              onClick={handleHeaderReset}
              className="h-10 w-10 flex items-center justify-center text-neutral-500 hover:text-neutral-855 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all"
              title="Сбросить"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          ) : undefined
        }
      />

      {currentView === "dashboard" ? (
        <div className="flex-1 w-full max-w-[850px] mx-auto px-4 md:px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Предпросмотр ученика</h1>
            <p className="text-neutral-500 mt-2 text-[15px]">Выберите необходимый раздел для предварительного просмотра интерфейса ученика.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Упражнения к уроку */}
            <div 
              onClick={() => setCurrentView("exercises")}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-neutral-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors">Упражнения к уроку</h3>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                Интерактивные упражнения для закрепления пройденных материалов урока, включая Порядок, Соединение пар и Правда/Ложь.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform mt-auto pt-4">
                Открыть раздел &rarr;
              </div>
            </div>

            {/* Card 2: Тестирование знаний */}
            <div 
              onClick={startTest}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-neutral-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors">Тестирование знаний</h3>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                Комплексные тесты с пошаговыми вопросами без мгновенной проверки. Результаты отображаются в конце теста.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform mt-auto pt-4">
                Открыть раздел &rarr;
              </div>
            </div>

            {/* Card 3: Опросы */}
            <div 
              onClick={startSurvey}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-neutral-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors">Опросы к уроку</h3>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                Опросы удовлетворенности с различными типами вопросов: выбор, шкалы оценок, текстовые ответы и логика разделителей.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform mt-auto pt-4">
                Открыть раздел &rarr;
              </div>
            </div>

            {/* Card 4: Мероприятие */}
            <div 
              onClick={() => setCurrentView("event")}
              className="group relative flex flex-col p-6 rounded-2xl border-2 border-neutral-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors">Мероприятие</h3>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                Просмотр страницы мероприятия с программой, расписанием и материалами для участников.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform mt-auto pt-4">
                Открыть раздел &rarr;
              </div>
            </div>
          </div>
        </div>
      ) : currentView === "exercises" ? (
        <div className="flex-1 w-full max-w-[850px] mx-auto px-4 md:px-6 py-6 pb-20 space-y-16">
          
          {/* ─── Exercise 1: Drag & Drop Ordering ───────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Упражнение 1: Порядок</h3>
            
            {/* Clean 16:9 Image at the very top (no tag/overlay badge) */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[16/9] w-full max-h-[360px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200" 
                alt="Exercise banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Question Text below image */}
            <div className="py-2">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                Восстановите правильную последовательность развертывания проекта в продуктовой среде:
              </h2>
            </div>

            {/* Interactive answers */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col gap-3">
                <SortableContext
                  items={orderItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderItems.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      showResult={showOrderResults}
                      isCorrect={item.correctIndex === index}
                    />
                  ))}
                </SortableContext>
              </div>

              <DragOverlay>
                {activeDragItem ? (
                  <div className="flex items-center gap-4 p-4 bg-white border border-indigo-400 shadow-xl scale-[1.01] z-50 rounded-xl opacity-95 cursor-grabbing">
                    <div className="p-1 rounded-md text-neutral-450">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-neutral-800 leading-normal">{activeDragItem.text}</p>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Centered Actions */}
            {!showOrderResults && (
              <div className="pt-6 flex items-center justify-center">
                <Button onClick={checkOrder} variant="primary" className="h-11 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm">
                  Ответить
                </Button>
              </div>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* ─── Exercise 2: Column Matching ────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Упражнение 2: Соединение</h3>
            
            {/* Clean 16:9 Image at the very top (no tag/overlay badge) */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[16/9] w-full max-h-[360px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=1200" 
                alt="Matching banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Question Text below image */}
            <div className="py-2">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                Сопоставьте веб-технологии с их правильными и полными функциональными определениями:
              </h2>
            </div>

            {/* MOBILE INTERACTIVE MATCHING (No buggy SVG lines on phones, completely functional tap-to-match UX) */}
            <div className="block md:hidden space-y-4">
              {LEFT_NODES.map((node) => {
                const connection = connections.find(c => c.leftId === node.id);
                const isConnected = !!connection;
                const connectedNode = isConnected ? RIGHT_NODES.find(n => n.id === connection.rightId) : null;
                const isOpened = activeMobileLeftId === node.id;

                let cardBorderClass = "border-neutral-200 bg-white";
                if (showMatchingResults && connection) {
                  cardBorderClass = connection.isCorrect ? "border-emerald-500 bg-emerald-50/10" : "border-rose-500 bg-rose-50/10";
                } else if (isConnected) {
                  cardBorderClass = "border-indigo-400 bg-indigo-50/5";
                } else if (isOpened) {
                  cardBorderClass = "border-indigo-650 ring-2 ring-indigo-100";
                }

                const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                return (
                  <div key={node.id} className={`p-4 rounded-xl border transition-all ${cardBorderClass}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-bold text-neutral-850">{node.text}</span>
                      
                      {isConnected ? (
                        !showMatchingResults ? (
                          <button 
                            onClick={() => setConnections(prev => prev.filter(c => c.leftId !== node.id))}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Отсоединить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null
                      ) : (
                        <button
                          onClick={() => setActiveMobileLeftId(isOpened ? null : node.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Выбрать
                        </button>
                      )}
                    </div>

                    {/* Show selected description nested cleanly */}
                    {isConnected && connectedNode && (
                      <div 
                        className="mt-3 p-3 rounded-lg border text-[13px] font-semibold text-neutral-700 leading-relaxed transition-all"
                        style={{ 
                          borderColor: showMatchingResults ? (connection.isCorrect ? "#10B981" : "#EF4444") : connColor, 
                          borderLeftWidth: "4px" 
                        }}
                      >
                        {connectedNode.text}
                      </div>
                    )}

                    {/* Selector Dropdown inline */}
                    {isOpened && (
                      <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Выберите подходящее описание:</p>
                        {RIGHT_NODES.map((rightNode) => {
                          const isRightConnected = connections.some(c => c.rightId === rightNode.id);
                          if (isRightConnected) return null; // Hide already connected options
                          
                          return (
                            <button
                              key={rightNode.id}
                              onClick={() => handleMobileMatchSelect(node.id, rightNode.id)}
                              className="w-full text-left p-3 text-[13px] font-semibold text-neutral-755 bg-neutral-50 hover:bg-indigo-50/50 rounded-lg border border-neutral-200/80 transition-colors"
                            >
                              {rightNode.text}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DESKTOP INTERACTIVE MATCHING (Grid with exactly equal widths & svg canvas) */}
            <div 
              ref={containerRef}
              className="hidden md:grid grid-cols-2 gap-x-16 gap-y-4 py-4 relative"
            >
              
              {/* Left Column (Col A) */}
              <div className="flex flex-col gap-4 justify-between z-10">
                {LEFT_NODES.map((node) => {
                  const connection = connections.find(c => c.leftId === node.id);
                  const isConnected = !!connection;
                  const isSelected = selectedLeftId === node.id;
                  
                  let nodeBorderClass = "border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/30 bg-white";
                  let nodeBgClass = "";

                  if (isSelected) {
                    nodeBorderClass = "border-indigo-650 scale-[1.005]";
                    nodeBgClass = "bg-indigo-50/10";
                  } else if (showMatchingResults && connection) {
                    nodeBorderClass = connection.isCorrect 
                      ? "border-emerald-500 bg-emerald-50/10" 
                      : "border-rose-500 bg-rose-50/10";
                  } else if (isConnected) {
                    nodeBorderClass = "border-indigo-400 bg-indigo-50/5";
                  }

                  const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                  // Correct validation color for dot
                  let dotColor = connColor;
                  if (showMatchingResults && connection) {
                    dotColor = connection.isCorrect ? "#10B981" : "#EF4444";
                  }

                  return (
                    <div
                      key={node.id}
                      onClick={() => handleLeftNodeClick(node.id)}
                      onPointerDown={e => handleNodePointerDown(node.id, e)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all select-none group h-[84px] cursor-pointer touch-none ${nodeBorderClass} ${nodeBgClass}`}
                    >
                      <span className="text-[14px] font-bold text-neutral-800 whitespace-normal break-words pr-2">{node.text}</span>
                      
                      {/* Connection point dot */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <div 
                          ref={el => { dotRefs.current[node.id] = el; }}
                          className="w-4 h-4 rounded-full border-2 transition-all"
                          style={{
                            borderColor: isSelected ? "#4F46E5" : dotColor,
                            backgroundColor: isSelected ? "#4F46E5" : isConnected ? dotColor : "#FFFFFF"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Central canvas layer for SVG drawing - Clean solid lines */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="w-full h-full overflow-visible">
                  {connections.map((conn, idx) => {
                    const coords = getConnectionCoordinates(conn.leftId, conn.rightId);
                    if (!coords) return null;

                    let strokeColor = getDistinctColor(conn.colorIndex);
                    if (showMatchingResults) {
                      strokeColor = conn.isCorrect ? "#10B981" : "#EF4444";
                    }

                    const controlOffset = Math.abs(coords.x2 - coords.x1) / 2;
                    const pathD = `M ${coords.x1} ${coords.y1} C ${coords.x1 + controlOffset} ${coords.y1}, ${coords.x2 - controlOffset} ${coords.y2}, ${coords.x2} ${coords.y2}`;

                    return (
                      <path 
                        key={idx}
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        className="transition-all duration-200"
                      />
                    );
                  })}

                  {dragStartPoint && dragCurrentPoint && (
                    (() => {
                      const controlOffset = Math.abs(dragCurrentPoint.x - dragStartPoint.x) / 2;
                      const pathD = `M ${dragStartPoint.x} ${dragStartPoint.y} C ${dragStartPoint.x + controlOffset} ${dragStartPoint.y}, ${dragCurrentPoint.x - controlOffset} ${dragCurrentPoint.y}, ${dragCurrentPoint.x} ${dragCurrentPoint.y}`;
                      return (
                        <path 
                          d={pathD}
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                        />
                      );
                    })()
                  )}
                </svg>
              </div>

              {/* Right Column (Col B) */}
              <div className="flex flex-col gap-4 justify-between z-10">
                {sortedRightNodes.map((node) => {
                  const connection = connections.find(c => c.rightId === node.id);
                  const isConnected = !!connection;
                  const isHovered = hoveredRightId === node.id;
                  
                  let nodeBorderClass = "border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/30 bg-white";
                  let nodeBgClass = "";

                  if (isHovered) {
                    nodeBorderClass = "border-indigo-650 scale-[1.005]";
                    nodeBgClass = "bg-indigo-50/10";
                  } else if (showMatchingResults && connection) {
                    nodeBorderClass = connection.isCorrect 
                      ? "border-emerald-500 bg-emerald-50/10" 
                      : "border-rose-500 bg-rose-50/10";
                  } else if (isConnected) {
                    nodeBorderClass = "border-indigo-400 bg-indigo-50/5";
                  }

                  const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                  // Correct validation color for dot
                  let dotColor = connColor;
                  if (showMatchingResults && connection) {
                    dotColor = connection.isCorrect ? "#10B981" : "#EF4444";
                  }

                  return (
                    <div
                      key={node.id}
                      onClick={() => handleRightNodeClick(node.id)}
                      onMouseEnter={() => activeDragStartNode && setHoveredRightId(node.id)}
                      onMouseLeave={() => activeDragStartNode && setHoveredRightId(null)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all select-none group h-[84px] cursor-pointer touch-none ${nodeBorderClass} ${nodeBgClass}`}
                    >
                      {/* Connection dot on the left side of right node */}
                      <div className="flex items-center gap-1.5 shrink-0 mr-1">
                        <div 
                          ref={el => { dotRefs.current[node.id] = el; }}
                          className="w-4 h-4 rounded-full border-2 transition-all"
                          style={{
                            borderColor: isHovered ? "#4F46E5" : dotColor,
                            backgroundColor: isHovered ? "#4F46E5" : isConnected ? dotColor : "#FFFFFF"
                          }}
                        />
                      </div>
                      
                      <span className="text-[13px] font-semibold text-neutral-750 leading-normal flex-1 whitespace-normal break-words overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {node.text}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Centered Actions */}
            {!showMatchingResults && (
              <div className="pt-6 flex items-center justify-center">
                <Button 
                  onClick={checkMatching} 
                  disabled={connections.length === 0}
                  variant="primary" 
                  className="h-11 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm"
                >
                  Ответить
                </Button>
              </div>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* ─── Exercise 3: True / False (Да/Нет) ───────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Упражнение 3: Правда или Ложь</h3>
            
            {/* Clean 16:9 Image at the very top (no tag/overlay badge) */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[16/9] w-full max-h-[360px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200" 
                alt="True False banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Question Text below image */}
            <div className="py-2">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                Верно ли утверждение: Использование TypeScript полностью исключает возникновение любых ошибок на этапе выполнения (runtime)?
              </h2>
            </div>

            {/* Interactive choices (Правда / Ложь) */}
            <div className="grid grid-cols-2 gap-5 w-full">
              {[
                { label: "Правда", value: true },
                { label: "Ложь", value: false }
              ].map((opt) => {
                const isSelected = selectedTrueFalse === opt.value;
                const isCorrectOption = opt.value === CORRECT_TRUE_FALSE_ANSWER;
                
                // Base unselected state
                let cardClass = "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/30 text-neutral-800";
                let circleClass = "bg-neutral-50 border border-neutral-100 text-neutral-400";
                
                if (isSelected) {
                  // Selected state before checking
                  cardClass = "border-indigo-600 bg-indigo-50/10 text-indigo-900";
                  circleClass = "bg-indigo-600 text-white";
                }

                if (showTrueFalseResults) {
                  if (isSelected) {
                    if (isCorrectOption) {
                      cardClass = "border-emerald-500 bg-emerald-50/30 text-emerald-800";
                      circleClass = "bg-emerald-500 text-white";
                    } else {
                      cardClass = "border-rose-500 bg-rose-50/30 text-rose-800";
                      circleClass = "bg-rose-500 text-white";
                    }
                  } else {
                    if (isCorrectOption) {
                      // Highlight the correct option if it wasn't selected
                      cardClass = "border-emerald-500 bg-emerald-50/10 text-emerald-700 opacity-90";
                      circleClass = "bg-emerald-500 text-white";
                    } else {
                      cardClass = "border-neutral-200 bg-white opacity-40 text-neutral-400";
                      circleClass = "bg-neutral-100 text-neutral-300";
                    }
                  }
                }

                return (
                  <div
                    key={opt.label}
                    onClick={() => !showTrueFalseResults && setSelectedTrueFalse(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 select-none cursor-pointer min-h-[160px] md:min-h-[180px] text-center gap-4 ${cardClass}`}
                  >
                    {/* Centered Circle Icon */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                      {opt.value ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    <span className="text-[16px] md:text-[18px] font-bold transition-colors">{opt.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Centered Actions */}
            {!showTrueFalseResults && (
              <div className="pt-6 flex items-center justify-center">
                <Button 
                  onClick={() => setShowTrueFalseResults(true)} 
                  disabled={selectedTrueFalse === null}
                  variant="primary" 
                  className="h-11 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm"
                >
                  Ответить
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : currentView === "test" ? (
        /* ─── Test Mode View ─────────────────────────────────────────────────── */
        <div className="flex-1 w-full max-w-[850px] mx-auto px-4 md:px-6 py-6 pb-20">
          {isTestSubmitted ? (
            /* Results Screen (No images, strict green/red feedback for Q1, Q2, Q3) */
            <div className="space-y-12 bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm">

              {/* Q1 Results validation */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-bold text-neutral-900 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 font-bold shrink-0 mt-0.5">1</span>
                  <span>Восстановите правильную последовательность развертывания проекта в продуктовой среде:</span>
                </h3>
                <div className="flex flex-col gap-2.5">
                  {testOrderItems.map((item, index) => {
                    const isCorrect = item.correctIndex === index;
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-4 bg-white border rounded-xl select-none transition-all ${
                          isCorrect ? "border-emerald-500 bg-emerald-50/10" : "border-rose-500 bg-rose-50/10"
                        }`}
                      >
                        <span className="text-[14px] font-semibold text-neutral-800">{item.text}</span>
                        <div className="shrink-0 ml-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Q2 Results validation */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-bold text-neutral-900 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 font-bold shrink-0 mt-0.5">2</span>
                  <span>Сопоставьте веб-технологии с их правильными и полными функциональными определениями:</span>
                </h3>
                
                <div className="space-y-3">
                  {LEFT_NODES.map((leftNode) => {
                    const matchedConn = testConnections.find(c => c.leftId === leftNode.id);
                    const rightNode = matchedConn ? RIGHT_NODES.find(n => n.id === matchedConn.rightId) : null;
                    const isCorrect = matchedConn?.isCorrect === true;

                    return (
                      <div 
                        key={leftNode.id}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all bg-white ${
                          isCorrect ? "border-emerald-500" : "border-rose-500"
                        }`}
                      >
                        <div className="flex-1">
                          <span className="text-sm font-bold text-neutral-850 block">{leftNode.text}</span>
                          <span className="text-xs text-neutral-450 mt-0.5 block">Соединено с:</span>
                          <span className="text-sm text-neutral-600 mt-1 block">
                            {rightNode ? rightNode.text : "(Не сопоставлено)"}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {isCorrect ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Верно
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-rose-500" /> Неверно
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Q3 Results validation */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-bold text-neutral-900 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 font-bold shrink-0 mt-0.5">3</span>
                  <span>Верно ли утверждение: Использование TypeScript полностью исключает возникновение любых ошибок на этапе выполнения (runtime)?</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-5 w-full">
                  {[
                    { label: "Правда", value: true },
                    { label: "Ложь", value: false }
                  ].map((opt) => {
                    const isSelected = testSelectedTrueFalse === opt.value;
                    const isCorrectOption = opt.value === CORRECT_TRUE_FALSE_ANSWER;
                    
                    let cardClass = "border-neutral-200 bg-white text-neutral-400 opacity-60";
                    let circleClass = "bg-neutral-100 text-neutral-300";

                    if (isSelected) {
                      if (isCorrectOption) {
                        cardClass = "border-emerald-500 bg-emerald-50/20 text-emerald-850 opacity-100";
                        circleClass = "bg-emerald-500 text-white";
                      } else {
                        cardClass = "border-rose-500 bg-rose-50/20 text-rose-855 opacity-100";
                        circleClass = "bg-rose-500 text-white";
                      }
                    }

                    return (
                      <div
                        key={opt.label}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center gap-3 min-h-[140px] transition-all select-none ${cardClass}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleClass}`}>
                          {opt.value ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[15px] font-bold text-neutral-800">{opt.label}</span>
                        {isSelected && (
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isCorrectOption ? "text-emerald-600" : "text-rose-600"}`}>
                            {isCorrectOption ? "Верно" : "Неверно"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit actions */}
              <div className="pt-8 flex items-center justify-center gap-4">
                <Button 
                  onClick={startTest}
                  variant="primary" 
                  className="h-11 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm"
                >
                  Пройти заново
                </Button>
                <Button 
                  onClick={() => setCurrentView("dashboard")}
                  variant="outline" 
                  className="h-11 px-6 font-semibold text-neutral-600 border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all"
                >
                  На главную
                </Button>
              </div>
            </div>
          ) : (
            /* Question step wizard (No images) */
            <div className="space-y-8 bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
              
              <h2 className="text-[32px] font-bold text-neutral-900 flex items-center gap-3 select-none tracking-tight">
                <span className="text-[34px] leading-none">🚀</span> Kirish testi
              </h2>

              {/* Question progress pill and Arrow buttons */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="bg-[#d9f99d] text-[#3f6212] font-semibold px-5 py-1.5 rounded-full text-sm shrink-0 select-none">
                  Вопрос {testQuestionIndex + 1} из 3
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => testQuestionIndex > 0 && setTestQuestionIndex(prev => prev - 1)}
                    disabled={testQuestionIndex === 0}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#f4f4f5] hover:bg-neutral-200 disabled:opacity-40 text-neutral-500 transition-colors"
                  >
                    <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => testQuestionIndex < 2 && setTestQuestionIndex(prev => prev + 1)}
                    disabled={testQuestionIndex === 2}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#f4f4f5] hover:bg-neutral-200 disabled:opacity-40 text-neutral-500 transition-colors"
                  >
                    <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Question 1: Ordering */}
              {testQuestionIndex === 0 && (
                <div className="flex flex-col gap-6">
                  <div className="py-2">
                    <h2 className="text-lg md:text-[19px] font-bold text-neutral-900 leading-snug">
                      Восстановите правильную последовательность развертывания проекта в продуктовой среде:
                    </h2>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleTestDragStart}
                    onDragEnd={handleTestDragEnd}
                  >
                    <div className="flex flex-col gap-3">
                      <SortableContext
                        items={testOrderItems.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {testOrderItems.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            showResult={false}
                            isCorrect={false}
                          />
                        ))}
                      </SortableContext>
                    </div>

                    <DragOverlay>
                      {activeTestDragItem ? (
                        <div className="flex items-center gap-4 p-4 bg-white border border-indigo-400 shadow-xl scale-[1.01] z-50 rounded-xl opacity-95 cursor-grabbing">
                          <div className="p-1 rounded-md text-neutral-450">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-medium text-neutral-800 leading-normal">{activeTestDragItem.text}</p>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}

              {/* Question 2: Column Matching */}
              {testQuestionIndex === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="py-2">
                    <h2 className="text-lg md:text-[19px] font-bold text-neutral-900 leading-snug">
                      Сопоставьте веб-технологии с их правильными и полными функциональными определениями:
                    </h2>
                  </div>

                  {/* Mobile Interactive Matching */}
                  <div className="block md:hidden space-y-4">
                    {LEFT_NODES.map((node) => {
                      const connection = testConnections.find(c => c.leftId === node.id);
                      const isConnected = !!connection;
                      const connectedNode = isConnected ? RIGHT_NODES.find(n => n.id === connection.rightId) : null;
                      const isOpened = testActiveMobileLeftId === node.id;

                      let cardBorderClass = "border-neutral-200 bg-white";
                      if (isConnected) {
                        cardBorderClass = "border-indigo-450 bg-indigo-50/5";
                      } else if (isOpened) {
                        cardBorderClass = "border-indigo-650 ring-2 ring-indigo-100";
                      }

                      const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                      return (
                        <div key={node.id} className={`p-4 rounded-xl border transition-all ${cardBorderClass}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[15px] font-bold text-neutral-850">{node.text}</span>
                            
                            {isConnected ? (
                              <button 
                                onClick={() => setTestConnections(prev => prev.filter(c => c.leftId !== node.id))}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Отсоединить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setTestActiveMobileLeftId(isOpened ? null : node.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Выбрать
                              </button>
                            )}
                          </div>

                          {isConnected && connectedNode && (
                            <div 
                              className="mt-3 p-3 rounded-lg border text-[13px] font-semibold text-neutral-700 leading-relaxed transition-all"
                              style={{ 
                                borderColor: connColor, 
                                borderLeftWidth: "4px" 
                              }}
                            >
                              {connectedNode.text}
                            </div>
                          )}

                          {isOpened && (
                            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
                              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Выберите подходящее описание:</p>
                              {RIGHT_NODES.map((rightNode) => {
                                const isRightConnected = testConnections.some(c => c.rightId === rightNode.id);
                                if (isRightConnected) return null;
                                
                                return (
                                  <button
                                    key={rightNode.id}
                                    onClick={() => {
                                      setTestConnections(prev => prev.filter(c => c.leftId !== node.id && c.rightId !== rightNode.id));
                                      const leftNode = LEFT_NODES.find(n => n.id === node.id);
                                      if (leftNode) {
                                        const isCorrect = leftNode.pairId === rightNode.id;
                                        const colorIndex = LEFT_NODES.findIndex(n => n.id === node.id);
                                        setTestConnections(prev => [...prev, { leftId: node.id, rightId: rightNode.id, isCorrect, colorIndex }]);
                                      }
                                      setTestActiveMobileLeftId(null);
                                    }}
                                    className="w-full text-left p-3 text-[13px] font-semibold text-neutral-755 bg-neutral-50/50 hover:bg-indigo-50/30 rounded-lg border border-neutral-250 transition-colors"
                                  >
                                    {rightNode.text}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Interactive Matching */}
                  <div 
                    ref={containerRef}
                    className="hidden md:grid grid-cols-2 gap-x-16 gap-y-4 py-4 relative"
                  >
                    <div className="flex flex-col gap-4 justify-between z-10">
                      {LEFT_NODES.map((node) => {
                        const connection = testConnections.find(c => c.leftId === node.id);
                        const isConnected = !!connection;
                        const isSelected = testSelectedLeftId === node.id;
                        
                        let nodeBorderClass = "border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/30 bg-white";
                        let nodeBgClass = "";

                        if (isSelected) {
                          nodeBorderClass = "border-indigo-650 scale-[1.005]";
                          nodeBgClass = "bg-indigo-50/10";
                        } else if (isConnected) {
                          nodeBorderClass = "border-indigo-450 bg-indigo-50/5";
                        }

                        const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                        return (
                          <div
                            key={node.id}
                            onClick={() => {
                              setTestConnections(prev => prev.filter(c => c.leftId !== node.id));
                              if (testSelectedLeftId === node.id) {
                                setTestSelectedLeftId(null);
                              } else {
                                setTestSelectedLeftId(node.id);
                              }
                            }}
                            onPointerDown={e => {
                              const rect = dotRefs.current[node.id]?.getBoundingClientRect();
                              const containerRect = containerRef.current?.getBoundingClientRect();
                              if (rect && containerRect) {
                                const startX = (rect.left + rect.width / 2) - containerRect.left;
                                const startY = (rect.top + rect.height / 2) - containerRect.top;
                                setTestDragStartPoint({ x: startX, y: startY });
                                setTestDragCurrentPoint({ x: startX, y: startY });
                                setTestActiveDragStartNode(node.id);
                                setTestConnections(prev => prev.filter(c => c.leftId !== node.id));
                                setTestSelectedLeftId(node.id);
                              }
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all select-none group h-[84px] cursor-pointer touch-none ${nodeBorderClass} ${nodeBgClass}`}
                          >
                            <span className="text-[14px] font-bold text-neutral-800 whitespace-normal break-words pr-2">{node.text}</span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-3">
                              <div 
                                ref={el => { dotRefs.current[node.id] = el; }}
                                className="w-4 h-4 rounded-full border-2 transition-all"
                                style={{
                                  borderColor: isSelected ? "#4F46E5" : connColor,
                                  backgroundColor: isSelected ? "#4F46E5" : isConnected ? connColor : "#FFFFFF"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Canvas Layer for SVG Drawing */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <svg className="w-full h-full overflow-visible">
                        {testConnections.map((conn, idx) => {
                          const coords = getConnectionCoordinates(conn.leftId, conn.rightId);
                          if (!coords) return null;
                          const strokeColor = getDistinctColor(conn.colorIndex);
                          const controlOffset = Math.abs(coords.x2 - coords.x1) / 2;
                          const pathD = `M ${coords.x1} ${coords.y1} C ${coords.x1 + controlOffset} ${coords.y1}, ${coords.x2 - controlOffset} ${coords.y2}, ${coords.x2} ${coords.y2}`;

                          return (
                            <path 
                              key={idx}
                              d={pathD}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth="2.5"
                              className="transition-all duration-200"
                            />
                          );
                        })}

                        {testDragStartPoint && testDragCurrentPoint && (
                          (() => {
                            const controlOffset = Math.abs(testDragCurrentPoint.x - testDragStartPoint.x) / 2;
                            const pathD = `M ${testDragStartPoint.x} ${testDragStartPoint.y} C ${testDragStartPoint.x + controlOffset} ${testDragStartPoint.y}, ${testDragCurrentPoint.x - controlOffset} ${testDragCurrentPoint.y}, ${testDragCurrentPoint.x} ${testDragCurrentPoint.y}`;
                            return (
                              <path 
                                d={pathD}
                                fill="none"
                                stroke="#6366F1"
                                strokeWidth="2.5"
                                strokeDasharray="4 4"
                              />
                            );
                          })()
                        )}
                      </svg>
                    </div>

                    <div className="flex flex-col gap-4 justify-between z-10">
                      {sortedRightNodes.map((node) => {
                        const connection = testConnections.find(c => c.rightId === node.id);
                        const isConnected = !!connection;
                        const isHovered = testHoveredRightId === node.id;
                        
                        let nodeBorderClass = "border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/30 bg-white";
                        let nodeBgClass = "";

                        if (isHovered) {
                          nodeBorderClass = "border-indigo-650 scale-[1.005]";
                          nodeBgClass = "bg-indigo-50/10";
                        } else if (isConnected) {
                          nodeBorderClass = "border-indigo-450 bg-indigo-50/5";
                        }

                        const connColor = isConnected ? getDistinctColor(connection.colorIndex) : "#D1D5DB";

                        return (
                          <div
                            key={node.id}
                            onClick={() => {
                              if (!testSelectedLeftId) return;
                              setTestConnections(prev => prev.filter(c => c.rightId !== node.id));
                              const leftNode = LEFT_NODES.find(n => n.id === testSelectedLeftId);
                              if (leftNode) {
                                const isCorrect = leftNode.pairId === node.id;
                                const colorIndex = LEFT_NODES.findIndex(n => n.id === testSelectedLeftId);
                                setTestConnections(prev => [...prev, { leftId: testSelectedLeftId, rightId: node.id, isCorrect, colorIndex }]);
                              }
                              setTestSelectedLeftId(null);
                            }}
                            onMouseEnter={() => testActiveDragStartNode && setTestHoveredRightId(node.id)}
                            onMouseLeave={() => testActiveDragStartNode && setTestHoveredRightId(null)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all select-none group h-[84px] cursor-pointer touch-none ${nodeBorderClass} ${nodeBgClass}`}
                          >
                            <div className="flex items-center gap-1.5 shrink-0 mr-1">
                              <div 
                                ref={el => { dotRefs.current[node.id] = el; }}
                                className="w-4 h-4 rounded-full border-2 transition-all"
                                style={{
                                  borderColor: isHovered ? "#4F46E5" : connColor,
                                  backgroundColor: isHovered ? "#4F46E5" : isConnected ? connColor : "#FFFFFF"
                                }}
                              />
                            </div>
                            
                            <span className="text-[13px] font-semibold text-neutral-705 leading-normal flex-1 whitespace-normal break-words overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              {node.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Question 3: True / False */}
              {testQuestionIndex === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="py-2">
                    <h2 className="text-lg md:text-[19px] font-bold text-neutral-900 leading-snug">
                      Верно ли утверждение: Использование TypeScript полностью исключает возникновение любых ошибок на этапе выполнения (runtime)?
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5 w-full">
                    {[
                      { label: "Правда", value: true },
                      { label: "Ложь", value: false }
                    ].map((opt) => {
                      const isSelected = testSelectedTrueFalse === opt.value;
                      
                      let cardClass = "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/30 text-neutral-800";
                      let circleClass = "bg-neutral-50 border border-neutral-100 text-neutral-400";
                      
                      if (isSelected) {
                        cardClass = "border-indigo-600 bg-indigo-50/10 text-indigo-900";
                        circleClass = "bg-indigo-600 text-white";
                      }

                      return (
                        <div
                          key={opt.label}
                          onClick={() => setTestSelectedTrueFalse(opt.value)}
                          className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 select-none cursor-pointer min-h-[160px] md:min-h-[180px] text-center gap-4 ${cardClass}`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                            {opt.value ? (
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[16px] md:text-[18px] font-bold">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show results button if on the last question and not submitted */}
              {testQuestionIndex === 2 && !isTestSubmitted && (
                <div className="pt-6 border-t border-neutral-100 flex justify-center">
                  <button
                    onClick={() => setIsTestSubmitted(true)}
                    disabled={testSelectedTrueFalse === null}
                    className="h-11 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-40"
                  >
                    Показать результаты
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      ) : currentView === "survey" ? (
        /* ─── Survey Mode View ───────────────────────────────────────────────── */
        <div className="flex-1 w-full max-w-[850px] mx-auto px-4 md:px-6 py-6 pb-20">
          {isSurveySubmitted ? (
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-neutral-900">Спасибо за ответы!</h2>
                <p className="text-neutral-500 text-[15px] max-w-md mx-auto">
                  Ваш опрос успешно отправлен. Мы ценим вашу обратную связь и используем её для улучшения платформы.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-4">
                <button 
                  onClick={startSurvey}
                  className="h-11 px-6 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm"
                >
                  Заполнить еще раз
                </button>
                <button 
                  onClick={() => setCurrentView("dashboard")}
                  className="h-11 px-6 font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all"
                >
                  На главную
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Question 1: Single Choice + Divider Logic */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                <h3 className="text-[17px] font-bold text-neutral-900">
                  Как часто вы пользуетесь нашей платформой? <span className="text-rose-500 font-bold ml-1">*</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Каждый день", value: "daily" },
                    { label: "Несколько раз в неделю", value: "weekly" },
                    { label: "Редко", value: "rarely" }
                  ].map((opt) => {
                    const isSelected = surveyQ1 === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          if (!isQ1Submitted) {
                            setSurveyQ1(opt.value);
                          }
                        }}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                          isSelected 
                            ? "border-indigo-600 bg-indigo-50/10 text-indigo-900" 
                            : "border-neutral-200 bg-white hover:border-neutral-350 hover:bg-neutral-50/30 text-neutral-800"
                        } ${isQ1Submitted ? "opacity-75 cursor-default" : ""}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-300 bg-white"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>

                {!isQ1Submitted && (
                  <div className="pt-4 flex items-center justify-center">
                    <button
                      onClick={() => setIsQ1Submitted(true)}
                      disabled={surveyQ1 === null}
                      className="h-10 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-40"
                    >
                      Ответить
                    </button>
                  </div>
                )}
              </div>

              {/* Dependent Question: Show only if "Редко" is selected and Q1 is submitted */}
              {isQ1Submitted && surveyQ1 === "rarely" && (
                <div className="bg-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 transition-all">
                  <h3 className="text-[17px] font-bold text-neutral-900">
                    Почему вы пользуетесь платформой редко? <span className="text-rose-500 font-bold ml-1">*</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Сложно разобраться в интерфейсе", value: "interface" },
                      { label: "Не хватает свободного времени", value: "time" },
                      { label: "Мало интересного или полезного контента", value: "content" },
                      { label: "Другое", value: "other" }
                    ].map((opt) => {
                      const isSelected = surveyQ1_1 === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            if (!isQ1_1Submitted) {
                              setSurveyQ1_1(opt.value);
                            }
                          }}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                            isSelected 
                              ? "border-indigo-600 bg-indigo-50/10 text-indigo-900" 
                              : "border-neutral-200 bg-white hover:border-neutral-350 hover:bg-neutral-50/30 text-neutral-800"
                          } ${isQ1_1Submitted ? "opacity-75 cursor-default" : ""}`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-300 bg-white"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm font-semibold">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {!isQ1_1Submitted && (
                    <div className="pt-4 flex items-center justify-center">
                      <button
                        onClick={() => setIsQ1_1Submitted(true)}
                        disabled={surveyQ1_1 === null}
                        className="h-10 px-8 font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-40"
                      >
                        Ответить
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Remaining Questions: Show if Q1 is submitted AND (not "rarely" or Q1.1 is submitted) */}
              {isQ1Submitted && (surveyQ1 !== "rarely" || isQ1_1Submitted) && (
                <div className="space-y-8">
                  
                  {/* Question 2: Smiley Scale, Required */}
                  <div 
                    ref={q2Ref}
                    className={`bg-white border rounded-2xl p-6 md:p-8 shadow-sm space-y-4 transition-all ${
                      showSurveyErrors && surveyQ2 === null ? "border-rose-450 ring-1 ring-rose-100" : "border-neutral-200/80"
                    }`}
                  >
                    <h3 className="text-[17px] font-bold text-neutral-900">
                      Как вы оцениваете удобство интерфейса платформы? <span className="text-rose-500 font-bold ml-1">*</span>
                    </h3>
                    <div className="flex justify-start items-center gap-3 pt-2">
                      {[
                        { rate: 1, smiley: "😠" },
                        { rate: 2, smiley: "🙁" },
                        { rate: 3, smiley: "😐" },
                        { rate: 4, smiley: "🙂" },
                        { rate: 5, smiley: "😀" }
                      ].map((item) => {
                        const isSelected = surveyQ2 === item.rate;
                        return (
                          <button
                            key={item.rate}
                            onClick={() => setSurveyQ2(item.rate)}
                            type="button"
                            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-650 bg-indigo-50/10 text-indigo-900 scale-105"
                                : "border-neutral-100 hover:border-neutral-250 bg-neutral-50/30 text-neutral-500 hover:text-neutral-800"
                            }`}
                          >
                            <span className="text-2xl">{item.smiley}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 3: Numbers Scale (1-5) */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-[17px] font-bold text-neutral-900">
                      Насколько полезным был материал урока?
                    </h3>
                    <div className="flex justify-start items-center gap-3 pt-2">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = surveyQ3 === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setSurveyQ3(num)}
                            type="button"
                            className={`w-12 h-12 rounded-xl border-2 font-bold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-650 bg-indigo-600 text-white scale-105"
                                : "border-neutral-100 hover:border-neutral-250 bg-neutral-50 hover:bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 4: Checkboxes (Multiple Choice) */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-[17px] font-bold text-neutral-900">
                      Какие форматы контента вам наиболее интересны?
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Видеоуроки",
                        "Интерактивные упражнения",
                        "Тесты для самопроверки",
                        "Текстовые статьи и конспекты"
                      ].map((opt) => {
                        const isSelected = surveyQ4.includes(opt);
                        return (
                          <div
                            key={opt}
                            onClick={() => {
                              setSurveyQ4(prev => 
                                prev.includes(opt) 
                                  ? prev.filter(x => x !== opt) 
                                  : [...prev, opt]
                              );
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                              isSelected 
                                ? "border-indigo-600 bg-indigo-50/10 text-indigo-900" 
                                : "border-neutral-200 bg-white hover:border-neutral-350 hover:bg-neutral-50/30 text-neutral-800"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-300 bg-white"
                            }`}>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-semibold">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 5: Short Answer */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-[17px] font-bold text-neutral-900">
                      Ваше имя или контактные данные:
                    </h3>
                    <input
                      type="text"
                      value={surveyQ5}
                      onChange={(e) => setSurveyQ5(e.target.value)}
                      placeholder="Введите имя или email..."
                      className="w-full h-11 px-4 text-sm bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl transition-all outline-none"
                    />
                  </div>

                  {/* Question 6: Long Answer */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-[17px] font-bold text-neutral-900">
                      Что бы вы хотели улучшить в платформе?
                    </h3>
                    <textarea
                      value={surveyQ6}
                      onChange={(e) => setSurveyQ6(e.target.value)}
                      placeholder="Опишите ваши пожелания подробно..."
                      rows={4}
                      className="w-full p-4 text-sm bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 flex items-center justify-center">
                    <button
                      onClick={submitSurvey}
                      className="h-11 px-8 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm"
                    >
                      Отправить
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      ) : currentView === "event" ? (
        /* ─── Event Mode View ────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto">
          {/* Banner Cover */}
          <div className="h-44 w-full relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          </div>

          {/* Event Info Card overlapping the banner */}
          <div className="max-w-[850px] mx-auto w-full px-4 md:px-6 -mt-16 relative z-10">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 sm:p-8">
                {/* Event Title, badges and QR Button */}
                <div className="min-w-0 w-full flex flex-row items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border bg-neutral-100 text-neutral-600 border-neutral-200">Завершено</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border bg-violet-50 text-violet-600 border-violet-200">Воркшоп</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border bg-orange-50 text-orange-600 border-orange-200">Офлайн</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border bg-neutral-50 text-neutral-500 border-neutral-200">RUS</span>
                    </div>
                    <h1 className="text-lg md:text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight">Основы искусственного интеллекта</h1>
                  </div>

                  {/* QR Code Action Button - aligned side-by-side on all viewports */}
                  {isEventRegistered && (
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="inline-flex items-center justify-center w-10 h-10 border-2 border-indigo-650 hover:bg-indigo-50 text-indigo-650 rounded-xl transition-all shadow-sm shrink-0"
                      title="Электронный билет"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  )}
                </div>

              {/* Divider */}
              <div className="h-px bg-neutral-150/80 my-5" />

              {/* Event Parameters Grid - Responsive grid layout with separate rows for Dates & Locations */}
              <div className="flex flex-col gap-4">
                {/* Row 1: Location */}
                <div className="flex items-start gap-4 p-3 bg-neutral-50/50 rounded-xl border border-neutral-150">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Место проведения</span>
                    <span className="text-sm font-bold text-neutral-800 block underline decoration-dotted underline-offset-4 cursor-help" title="Главный офис, Зал A">
                      Главный офис, Зал A
                    </span>
                  </div>
                </div>

                {/* Row 2: Dates */}
                <div 
                  onClick={() => {
                    setShowDatesTooltipMobile(!showDatesTooltipMobile);
                  }}
                  className="flex items-start gap-4 p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl border border-neutral-150 cursor-pointer transition-colors group relative overflow-visible"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                      {DEMO_EVENT.dateMode === 'period' ? 'Период проведения' : 'Даты проведения'}
                    </span>
                    <span className="text-sm font-bold text-neutral-800 block underline decoration-dotted underline-offset-4 cursor-pointer">
                      {DEMO_EVENT.dateMode === 'period'
                        ? `${DEMO_EVENT.periodStart} — ${DEMO_EVENT.periodEnd}`
                        : `${DEMO_EVENT.days[0].date} — ${DEMO_EVENT.days[DEMO_EVENT.days.length - 1].date}`}
                    </span>
                    {/* Tooltip: visible on hover (desktop) OR when toggled clicked on mobile */}
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 ${showDatesTooltipMobile ? 'block' : 'hidden'} md:group-hover:block w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                      {DEMO_EVENT.dateMode === 'period' ? (
                        <>
                          <div className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-2">Период проведения</div>
                          <div className="space-y-2 text-xs font-semibold">
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">С</span>
                              <span className="text-neutral-800">{DEMO_EVENT.periodStart}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">По</span>
                              <span className="text-neutral-800">{DEMO_EVENT.periodEnd}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-neutral-100">
                              <span className="text-neutral-500">Ежедневно</span>
                              <span className="text-neutral-800 font-mono">{DEMO_EVENT.periodTimeStart}—{DEMO_EVENT.periodTimeEnd}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-2">Расписание по дням</div>
                          <div className="space-y-2">
                            {DEMO_EVENT.days.map(d => (
                              <div key={d.id} className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-neutral-500">{d.label} ({d.date})</span>
                                <span className="text-neutral-800 font-mono">{d.timeStart}—{d.timeEnd}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                    </div>
                  </div>
                </div>

                {/* Grid row for Registration and Participants */}
                <div className={`grid gap-4 ${DEMO_EVENT.speakers.length > 0 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-150">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Регистрация</span>
                      <span className="text-xs font-bold text-neutral-800 block truncate">Открытая</span>
                    </div>
                  </div>

                  {/* Спикеры — показываются только если указаны */}
                  {DEMO_EVENT.speakers.length > 0 && (
                    <div
                      onClick={() => setShowSpeakersTooltipMobile(!showSpeakersTooltipMobile)}
                      className="flex items-start gap-3 p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl border border-neutral-150 cursor-pointer transition-colors group relative overflow-visible"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Mic className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Спикеры</span>
                        <span className="text-xs font-bold text-neutral-800 block truncate underline decoration-dotted underline-offset-4">
                          {DEMO_EVENT.speakers[0]}
                          {DEMO_EVENT.speakers.length > 1 && (
                            <span className="text-neutral-400 font-bold"> +{DEMO_EVENT.speakers.length - 1}</span>
                          )}
                        </span>

                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 ${showSpeakersTooltipMobile ? 'block' : 'hidden'} md:group-hover:block w-64 bg-[#1A1A1A] text-white rounded-lg shadow-xl border border-white/10 p-3 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                          <div className="font-bold text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                            Спикеры мероприятия ({DEMO_EVENT.speakers.length})
                          </div>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {DEMO_EVENT.speakers.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-[11px] font-medium leading-relaxed">
                                <span className="text-neutral-500 shrink-0 font-mono">{i + 1}.</span>
                                <span className="break-words">{s}</span>
                              </div>
                            ))}
                          </div>
                          <div className="w-2 h-2 bg-[#1A1A1A] rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b border-white/10" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-150">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Участники</span>
                      <span className="text-xs font-bold text-neutral-800 block truncate">
                        {isEventRegistered ? "33" : "32"} / 111
                        <span className="text-[10px] text-neutral-400 font-bold ml-1">чел.</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Register Button inside the info card */}
                <div className="pt-2 flex justify-center w-full">
                  {isEventRegistered ? (
                    <button
                      onClick={() => setIsEventRegistered(false)}
                      className="w-full h-11 font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-all border border-neutral-300 text-sm active:scale-98"
                    >
                      Отменить регистрацию
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEventRegistered(true)}
                      className="w-full h-11 font-bold bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl transition-all text-sm shadow-md hover:shadow-lg active:scale-98"
                    >
                      Зарегистрироваться
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Content Container */}
          <div className="max-w-[850px] mx-auto w-full px-4 md:px-6 py-6 pb-20">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
              <div className="flex flex-col gap-6">

                {/* Day 1: Text */}
                <div 
                  className="prose prose-sm max-w-none text-neutral-800 leading-relaxed [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" 
                  dangerouslySetInnerHTML={{ __html: '<h2>День 1: Введение и основы нейросетей</h2><p>На первом дне мы обсудим базовую архитектуру трансформеров, научимся формулировать точные системные промпты и автоматизируем рутинные задачи с помощью OpenAI API.</p>' }} 
                />

                {/* Day 1: Callout */}
                <div className="rounded-2xl p-4 flex items-start gap-3 border border-neutral-200/50 shadow-sm" style={{ backgroundColor: '#FEF3C7' }}>
                  <div className="shrink-0 mt-0.5" style={{ color: '#F59E0B' }}><Lightbulb className="w-5 h-5" /></div>
                  <div className="text-[13px] text-neutral-800 leading-relaxed flex-1 prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: '<p><strong>Важная информация:</strong> Обязательно установите Python 3.10+ и VS Code перед началом практической части первого дня.</p>' }} />
                </div>

                {/* Day 1: File */}
                <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 hover:shadow transition-all group cursor-pointer w-full max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-neutral-900 leading-tight mb-0.5 truncate" title="Слайды_День_1_Введение.pdf">Слайды_День_1_Введение.pdf</p>
                    <p className="text-[12px] text-neutral-500 font-medium">PDF Документ • 8.4 MB</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer" title="Предпросмотр">
                      <Eye className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer" title="Скачать">
                      <Download className="w-4 h-4 text-neutral-600" />
                    </div>
                  </div>
                </div>

                {/* Day 2: Text */}
                <div 
                  className="prose prose-sm max-w-none text-neutral-800 leading-relaxed [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" 
                  dangerouslySetInnerHTML={{ __html: '<h2>День 2: Разработка RAG-систем (Retrieval-Augmented Generation)</h2><p>Изучим методы работы с локальной базой знаний. Разберем процесс токенизации документов, создание эмбеддингов, работу с векторными базами данных ChromaDB и LangChain.</p>' }} 
                />

                {/* Day 2: 3 Images in grid side-by-side */}
                <div className="w-full">
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm hover:shadow-md transition-all group/slide">
                      <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60" alt="Work space" className="w-full h-full object-cover group-hover/slide:scale-[1.02] transition-transform duration-300" />
                    </div>
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm hover:shadow-md transition-all group/slide">
                      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60" alt="Collaboration" className="w-full h-full object-cover group-hover/slide:scale-[1.02] transition-transform duration-300" />
                    </div>
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm hover:shadow-md transition-all group/slide">
                      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60" alt="Meeting" className="w-full h-full object-cover group-hover/slide:scale-[1.02] transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                {/* Day 2: File */}
                <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 hover:shadow transition-all group cursor-pointer w-full max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-neutral-900 leading-tight mb-0.5 truncate" title="Практическое_руководство_RAG.pdf">Практическое_руководство_RAG.pdf</p>
                    <p className="text-[12px] text-neutral-500 font-medium">PDF Документ • 12.1 MB</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer" title="Предпросмотр">
                      <Eye className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer" title="Скачать">
                      <Download className="w-4 h-4 text-neutral-600" />
                    </div>
                  </div>
                </div>

                {/* Day 3: Text */}
                <div 
                  className="prose prose-sm max-w-none text-neutral-800 leading-relaxed [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" 
                  dangerouslySetInnerHTML={{ __html: '<h2>День 3: Финальный проект и оптимизация</h2><p>Построение комплексного AI-агента для финансового анализа. Презентация проектов, защита работ участников и вручение сертификатов о прохождении курса.</p>' }} 
                />

                {/* Day 3: Warning Callout */}
                <div className="rounded-2xl p-4 flex items-start gap-3 border border-neutral-200/50 shadow-sm" style={{ backgroundColor: '#FEE2E2' }}>
                  <div className="shrink-0 mt-0.5" style={{ color: '#EF4444' }}><AlertTriangle className="w-5 h-5" /></div>
                  <div className="text-[13px] text-neutral-800 leading-relaxed flex-1 prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: '<p><strong>Внимание:</strong> Финальный тест и загрузка проекта должны быть выполнены до 20:00 последнего дня обучения.</p>' }} />
                </div>

                {/* Day 3: Submit Button */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-center">
                    <a href="#" className="px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all block text-center" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                      Сдать финальный проект
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* 🎫 QR Code Modal */}
          {showQrModal && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowQrModal(false)}
            >
              <div 
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Close button */}
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-6 text-center border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900 pr-6">Ваш билет</h3>
                  <p className="text-xs text-neutral-500 mt-1">Предъявите QR-код на входе организатору</p>
                </div>
                <div className="p-8 flex flex-col items-center bg-neutral-50 border-b border-neutral-100">
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center">
                    <div className="w-48 h-48 bg-neutral-905 rounded-xl flex items-center justify-center p-3">
                      <div className="w-full h-full border-4 border-white flex flex-wrap p-1 gap-1.5 opacity-90 justify-center items-center">
                        <div className="w-10 h-10 border-4 border-white bg-white shrink-0 self-start" />
                        <div className="w-10 h-10 border-4 border-white bg-white shrink-0 self-start" />
                        <div className="w-6 h-6 bg-white shrink-0" />
                        <div className="w-8 h-8 bg-white shrink-0" />
                        <div className="w-12 h-12 bg-white shrink-0" />
                        <div className="w-10 h-10 border-4 border-white bg-white shrink-0 self-end" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white flex justify-center">
                  <button 
                    onClick={() => {
                      alert("Билет сохранен на устройство");
                      setShowQrModal(false);
                    }}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    Скачать билет
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : null}
    </div>
  );
}
