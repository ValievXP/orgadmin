"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  CalendarDays, MapPin, Users, Clock, Edit3, QrCode, 
  Link as LinkIcon, Download, Search, Check, X, UserX, Plus, 
  UserCheck, Sparkles, Play, FileText, BookOpen, Layers, MousePointer, 
  Code, Table, Columns, ChevronDown, ChevronUp, Info, Zap, 
  AlertTriangle, HelpCircle, Lightbulb, Shield, XCircle, 
  CheckCircle, Trash2, Globe, Upload, ChevronLeft, ChevronRight, ArrowUpDown, Eye, FileSpreadsheet
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type BlockType = 'video' | 'file' | 'text' | 'image' | 'slider' | 'callout' | 'button' | 'iframe' | 'table' | 'columns';

interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
}

interface EventDate {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

interface RegistrationPeriod {
  id: string;
  dateStart: string;
  timeStart: string;
  dateEnd: string;
  timeEnd: string;
}

interface EventData {
  id: string;
  title: string;
  type: string;
  format: 'online' | 'offline';
  date: string;
  timeStart: string;
  timeEnd: string;
  speakers: string;
  location: string;
  status: 'draft' | 'registration' | 'in_progress' | 'completed' | 'upcoming' | 'ongoing';
  registrationOpen: boolean;
  participantsCount: number;
  participantLimit: number | null;
  description: string;
  lang?: 'RUS' | 'UZB' | 'ENG';
  registrationType?: 'open' | 'private';
  dates?: EventDate[];
  registrationDates?: RegistrationPeriod[];
  blocks?: ContentBlock[];
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  status: 'registered' | 'present' | 'absent';
  registeredAt: string;
  arrivalTime?: string;
  city?: string;
  school?: string;
  attendance?: {
    [dayId: string]: {
      status: 'registered' | 'present' | 'absent';
      arrivalTime?: string;
    };
  };
}

// ─── Constants & Fallback Data ────────────────────────────────────────────────

const CALLOUT_ICONS = [
  { id: 'none', icon: MinusIcon, label: 'Без иконки' },
  { id: 'zap', icon: Zap, label: 'Молния' },
  { id: 'info', icon: Info, label: 'Инфо' },
  { id: 'alert', icon: AlertTriangle, label: 'Внимание' },
  { id: 'help', icon: HelpCircle, label: 'Вопрос' },
  { id: 'bulb', icon: Lightbulb, label: 'Идея' },
  { id: 'shield', icon: Shield, label: 'Защита' },
  { id: 'error', icon: XCircle, label: 'Ошибка' },
  { id: 'success', icon: CheckCircle, label: 'Успех' },
];

function MinusIcon(props: any) {
  return <div className="w-4 h-0.5 bg-current rounded" {...props} />;
}

const INITIAL_EVENT: EventData = {
  id: 'EVT-001', 
  title: 'Основы искусственного интеллекта', 
  type: 'Воркшоп', 
  format: 'offline', 
  date: '2026-03-28', 
  timeStart: '10:00', 
  timeEnd: '13:00', 
  speakers: 'Азиз Каримов', 
  location: 'Главный офис, Зал A', 
  status: 'upcoming', 
  registrationOpen: true, 
  participantsCount: 32, 
  participantLimit: 111, 
  description: 'Практический воркшоп по внедрению современных AI-инструментов и нейросетей в финансовые процессы компании. Вы разберете реальные кейсы оптимизации аналитики, аудита и подготовки отчетности.',
  lang: 'RUS',
  registrationType: 'open',
  dates: [
    { id: 'd1', date: '2026-03-28', timeStart: '10:00', timeEnd: '13:00' },
    { id: 'd2', date: '2026-03-29', timeStart: '10:00', timeEnd: '13:00' },
    { id: 'd3', date: '2026-03-30', timeStart: '10:00', timeEnd: '14:00' }
  ],
  registrationDates: [
    { id: 'r1', dateStart: '2026-03-20', timeStart: '08:00', dateEnd: '2026-03-27', timeEnd: '18:00' }
  ],
  blocks: [
    {
      id: 'b-title-1',
      type: 'text',
      data: { html: '<h2>День 1: Введение и основы нейросетей</h2><p>На первом дне мы обсудим базовую архитектуру трансформеров, научимся формулировать точные системные промпты и автоматизируем рутинные задачи с помощью OpenAI API.</p>' }
    },
    {
      id: 'b-callout-1',
      type: 'callout',
      data: { icon: 'bulb', html: '<p><strong>Важная информация:</strong> Обязательно установите Python 3.10+ и VS Code перед началом практической части первого дня.</p>', iconColor: '#F59E0B', bgColor: '#FEF3C7' }
    },
    {
      id: 'b-file-1',
      type: 'file',
      data: { name: 'Слайды_День_1_Введение.pdf', size: '8.4 MB' }
    },
    {
      id: 'b-title-2',
      type: 'text',
      data: { html: '<h2>День 2: Разработка RAG-систем (Retrieval-Augmented Generation)</h2><p>Изучим методы работы с локальной базой знаний. Разберем процесс токенизации документов, создание эмбеддингов, работу с векторными базами данных ChromaDB и LangChain.</p>' }
    },
    {
      id: 'b-slider-1',
      type: 'slider',
      data: {
        images: [
          { id: 'img-1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60' },
          { id: 'img-2', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60' },
          { id: 'img-3', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60' }
        ]
      }
    },
    {
      id: 'b-file-2',
      type: 'file',
      data: { name: 'Практическое_руководство_RAG.pdf', size: '12.1 MB' }
    },
    {
      id: 'b-title-3',
      type: 'text',
      data: { html: '<h2>День 3: Финальный проект и оптимизация</h2><p>Построение комплексного AI-агента для финансового анализа. Презентация проектов, защита работ участников и вручение сертификатов о прохождении курса.</p>' }
    },
    {
      id: 'b-callout-2',
      type: 'callout',
      data: { icon: 'alert', html: '<p><strong>Внимание:</strong> Финальный тест и загрузка проекта должны быть выполнены до 20:00 последнего дня обучения.</p>', iconColor: '#EF4444', bgColor: '#FEE2E2' }
    },
    {
      id: 'b-button-1',
      type: 'button',
      data: { text: 'Сдать финальный проект', url: 'https://osnova.education/submit/evt-001', color: '#10B981', textColor: '#FFFFFF', isDivider: false }
    }
  ]
};

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Иван Сергеев', email: 'ivan@example.com', phone: '+7 900 123 45 67', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', role: 'Ведущий аналитик', status: 'present', registeredAt: '20.03.2026 14:30', arrivalTime: '28.03.2026 10:15', city: 'Москва', school: 'Школа №1', attendance: { d1: { status: 'present', arrivalTime: '28.03.2026 10:15' }, d2: { status: 'present', arrivalTime: '29.03.2026 10:05' }, d3: { status: 'registered' } } },
  { id: 'p2', name: 'Мария Власова', email: 'maria@example.com', phone: '+7 900 234 56 78', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', role: 'Менеджер проектов', status: 'registered', registeredAt: '21.03.2026 09:15', city: 'Санкт-Петербург', school: 'Лицей №2', attendance: { d1: { status: 'registered' }, d2: { status: 'present', arrivalTime: '29.03.2026 10:12' }, d3: { status: 'registered' } } },
  { id: 'p3', name: 'Петр Николаев', email: 'petr@example.com', phone: '+7 900 345 67 89', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', role: 'Senior Python Developer', status: 'absent', registeredAt: '25.03.2026 18:45', city: 'Москва', school: 'Школа №1', attendance: { d1: { status: 'absent' }, d2: { status: 'absent' }, d3: { status: 'absent' } } },
  { id: 'p4', name: 'Анна Смирнова', email: 'anna@example.com', phone: '+7 900 456 78 90', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60', role: 'Финансовый директор', status: 'present', registeredAt: '22.03.2026 11:20', arrivalTime: '28.03.2026 09:55', city: 'Казань', school: 'Гимназия №3', attendance: { d1: { status: 'present', arrivalTime: '28.03.2026 09:55' }, d2: { status: 'present', arrivalTime: '29.03.2026 09:50' }, d3: { status: 'present', arrivalTime: '30.03.2026 09:58' } } },
  { id: 'p5', name: 'Дмитрий Орлов', email: 'dmitry@example.com', phone: '+7 900 567 89 01', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', role: 'Бухгалтер', status: 'registered', registeredAt: '26.03.2026 10:05', city: 'Москва', school: 'МГУ', attendance: { d1: { status: 'registered' }, d2: { status: 'registered' }, d3: { status: 'registered' } } },
  { id: 'p6', name: 'Елена Соколова', email: 'elena.s@example.com', phone: '+7 900 678 90 12', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60', role: 'Data Scientist', status: 'present', registeredAt: '21.03.2026 11:40', arrivalTime: '28.03.2026 10:02', city: 'Самара', school: 'СГАУ' },
  { id: 'p7', name: 'Сардор Каримов', email: 'sardor@example.com', phone: '+998 90 123 45 67', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60', role: 'ML Engineer', status: 'present', registeredAt: '22.03.2026 16:10', arrivalTime: '28.03.2026 09:45', city: 'Ташкент', school: 'ТАТУ' },
  { id: 'p8', name: 'Лола Умарова', email: 'lola@example.com', phone: '+998 90 234 56 78', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60', role: 'UI/UX Designer', status: 'registered', registeredAt: '23.03.2026 09:30', city: 'Самарканд', school: 'СамГУ' },
  { id: 'p9', name: 'Алексей Козлов', email: 'a.kozlov@example.com', phone: '+7 905 111 22 33', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60', role: 'QA Lead', status: 'present', registeredAt: '24.03.2026 14:15', arrivalTime: '28.03.2026 10:11', city: 'Москва', school: 'Школа №1' },
  { id: 'p10', name: 'Мадина Саидова', email: 'm.saidova@example.com', phone: '+998 93 111 22 33', avatar: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?w=100&auto=format&fit=crop&q=60', role: 'Python Developer', status: 'registered', registeredAt: '25.03.2026 10:50', city: 'Ташкент', school: 'ТАТУ' },
  { id: 'p11', name: 'Рустам Валиев', email: 'r.valiev@example.com', phone: '+998 94 444 55 66', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60', role: 'System Analyst', status: 'present', registeredAt: '25.03.2026 17:22', arrivalTime: '28.03.2026 09:59', city: 'Самарканд', school: 'СамГУ' },
  { id: 'p12', name: 'Ольга Петрова', email: 'olga.p@example.com', phone: '+7 909 333 44 55', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=60', role: 'Product Owner', status: 'registered', registeredAt: '20.03.2026 10:00', city: 'Новосибирск', school: 'НГУ' },
  { id: 'p13', name: 'Сергей Иванов', email: 'sergey.i@example.com', phone: '+7 916 222 33 44', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60', role: 'Backend Engineer', status: 'present', registeredAt: '21.03.2026 12:35', arrivalTime: '28.03.2026 10:08', city: 'Москва', school: 'МГТУ' },
  { id: 'p14', name: 'Наталья Кузнецова', email: 'nataly@example.com', phone: '+7 925 555 66 77', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60', role: 'HR Business Partner', status: 'registered', registeredAt: '22.03.2026 15:40', city: 'Екатеринбург', school: 'УрФУ' },
  { id: 'p15', name: 'Артем Васильев', email: 'artem.v@example.com', phone: '+7 985 777 88 99', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=60', role: 'DevOps Engineer', status: 'present', registeredAt: '23.03.2026 08:20', arrivalTime: '28.03.2026 09:50', city: 'Санкт-Петербург', school: 'ИТМО' },
  { id: 'p16', name: 'Татьяна Морозова', email: 'tanya.m@example.com', phone: '+7 911 888 99 00', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&auto=format&fit=crop&q=60', role: 'Business Analyst', status: 'registered', registeredAt: '23.03.2026 11:15', city: 'Нижний Новгород', school: 'ННГУ' },
  { id: 'p17', name: 'Михаил Федоров', email: 'mikhail@example.com', phone: '+7 902 444 33 22', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=60', role: 'Fullstack Dev', status: 'present', registeredAt: '24.03.2026 16:30', arrivalTime: '28.03.2026 10:04', city: 'Казань', school: 'КФУ' },
  { id: 'p18', name: 'Ирина Волкова', email: 'irina.v@example.com', phone: '+7 903 555 44 33', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=60', role: 'Marketing Manager', status: 'registered', registeredAt: '24.03.2026 18:10', city: 'Москва', school: 'НИУ ВШЭ' },
  { id: 'p19', name: 'Андрей Семенов', email: 'andrey.s@example.com', phone: '+7 905 777 66 55', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60', role: 'Data Engineer', status: 'present', registeredAt: '25.03.2026 09:12', arrivalTime: '28.03.2026 10:15', city: 'Новосибирск', school: 'НГУ' },
  { id: 'p20', name: 'Екатерина Лебедева', email: 'kate.l@example.com', phone: '+7 906 888 77 66', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=60', role: 'Content Lead', status: 'registered', registeredAt: '25.03.2026 13:45', city: 'Краснодар', school: 'КубГУ' },
  { id: 'p21', name: 'Николай Павлов', email: 'kolya@example.com', phone: '+7 908 999 88 77', avatar: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=100&auto=format&fit=crop&q=60', role: 'Frontend Dev', status: 'present', registeredAt: '25.03.2026 14:20', arrivalTime: '28.03.2026 09:40', city: 'Самара', school: 'СГАУ' },
  { id: 'p22', name: 'Светлана Козлова', email: 'svetlana@example.com', phone: '+7 912 111 00 99', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60', role: 'Legal Counsel', status: 'registered', registeredAt: '26.03.2026 10:15', city: 'Москва', school: 'МГЮА' },
  { id: 'p23', name: 'Егор Степанов', email: 'egor.s@example.com', phone: '+7 915 222 11 88', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&auto=format&fit=crop&q=60', role: 'Security Specialist', status: 'present', registeredAt: '26.03.2026 11:30', arrivalTime: '28.03.2026 10:12', city: 'Казань', school: 'КНИТУ' },
  { id: 'p24', name: 'Юлия Семенова', email: 'yulia.s@example.com', phone: '+7 917 333 22 77', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&auto=format&fit=crop&q=60', role: 'Scrum Master', status: 'registered', registeredAt: '26.03.2026 15:45', city: 'Ростов-на-Дону', school: 'ЮФУ' },
  { id: 'p25', name: 'Денис Егоров', email: 'denis.e@example.com', phone: '+7 920 444 33 66', avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&auto=format&fit=crop&q=60', role: 'Solution Architect', status: 'present', registeredAt: '27.03.2026 09:10', arrivalTime: '28.03.2026 09:55', city: 'Санкт-Петербург', school: 'СПбГУ' },
  { id: 'p26', name: 'Олеся Романова', email: 'olesya@example.com', phone: '+7 926 777 55 44', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&auto=format&fit=crop&q=60', role: 'Agile Coach', status: 'registered', registeredAt: '27.03.2026 11:20', city: 'Москва', school: 'МГУ' },
  { id: 'p27', name: 'Вадим Никитин', email: 'vadim.n@example.com', phone: '+7 930 888 66 55', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=60', role: 'Delivery Manager', status: 'present', registeredAt: '27.03.2026 14:05', arrivalTime: '28.03.2026 10:20', city: 'Воронеж', school: 'ВГУ' },
  { id: 'p28', name: 'Алина Соболева', email: 'alina.s@example.com', phone: '+7 933 999 77 66', avatar: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=100&auto=format&fit=crop&q=60', role: 'UI/UX Researcher', status: 'registered', registeredAt: '27.03.2026 15:30', city: 'Казань', school: 'КФУ' },
  { id: 'p29', name: 'Тимур Хасанов', email: 'timur.h@example.com', phone: '+998 97 777 11 22', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60', role: 'Mobile Dev', status: 'present', registeredAt: '27.03.2026 16:50', arrivalTime: '28.03.2026 09:42', city: 'Ташкент', school: 'ТАТУ' },
  { id: 'p30', name: 'Дильбар Рахимова', email: 'dilbar@example.com', phone: '+998 90 999 44 55', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=60', role: 'Python Developer', status: 'registered', registeredAt: '27.03.2026 17:10', city: 'Ташкент', school: 'Вестминстерский университет' },
  { id: 'p31', name: 'Шерзод Усманов', email: 'sherzod@example.com', phone: '+998 91 222 33 44', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', role: 'Data Analyst', status: 'present', registeredAt: '27.03.2026 17:35', arrivalTime: '28.03.2026 10:05', city: 'Самарканд', school: 'СамГУ' },
  { id: 'p32', name: 'Камила Юсупова', email: 'kamila@example.com', phone: '+998 92 333 44 55', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&auto=format&fit=crop&q=60', role: 'Project Manager', status: 'registered', registeredAt: '27.03.2026 18:00', city: 'Бухара', school: 'БухГУ' }
];

// Mock database for Global Students Selection
const ALL_GLOBAL_STUDENTS = [
  { id: 'g1', name: 'Иван Сергеев', email: 'ivan@example.com', phone: '+7 900 123 45 67', city: 'Москва', school: 'Школа №1', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', role: 'Аналитик' },
  { id: 'g2', name: 'Мария Власова', email: 'maria@example.com', phone: '+7 900 234 56 78', city: 'Санкт-Петербург', school: 'Лицей №2', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', role: 'Менеджер' },
  { id: 'g3', name: 'Петр Николаев', email: 'petr@example.com', phone: '+7 900 345 67 89', city: 'Москва', school: 'Школа №1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', role: 'Разработчик' },
  { id: 'g4', name: 'Анна Смирнова', email: 'anna@example.com', phone: '+7 900 456 78 90', city: 'Казань', school: 'Гимназия №3', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60', role: 'Директор' },
  { id: 'g5', name: 'Дмитрий Орлов', email: 'dmitry@example.com', phone: '+7 900 567 89 01', city: 'Москва', school: 'МГУ', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', role: 'Ассистент' },
  { id: 'g6', name: 'Елена Соколова', email: 'elena.s@example.com', phone: '+7 900 678 90 12', city: 'Самара', school: 'СГАУ', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60', role: 'Инженер' },
  { id: 'g7', name: 'Сардор Каримов', email: 'sardor@example.com', phone: '+998 90 123 45 67', city: 'Ташкент', school: 'ТАТУ', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60', role: 'Специалист' },
  { id: 'g8', name: 'Лола Умарова', email: 'lola@example.com', phone: '+998 90 234 56 78', city: 'Самарканд', school: 'СамГУ', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60', role: 'Дизайнер' },
];

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
      <span className="text-sm font-semibold pr-2">{message}</span>
    </div>
  );
}

// ─── Multi-Select Dropdown ───────────────────────────────────────────────────

function MultiSelectDropdown({ values, options, onChange, placeholder }: { values: string[]; options: { label: string; value: string }[]; onChange: (vals: string[]) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  
  const toggleOption = (val: string) => {
    if (val === 'All') {
      onChange(['All']);
      return;
    }
    const newVals = values.filter(v => v !== 'All');
    if (newVals.includes(val)) {
      const updated = newVals.filter(v => v !== val);
      onChange(updated.length === 0 ? ['All'] : updated);
    } else {
      onChange([...newVals, val]);
    }
  };

  const selectedLabels = values.includes('All') || values.length === 0 
    ? [placeholder] 
    : options.filter(o => values.includes(o.value)).map(o => o.label);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-950 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/30 transition-all shadow-sm"
      >
        <span className="truncate">{selectedLabels.join(', ')}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); toggleOption(opt.value); }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors hover:bg-neutral-50 ${isSelected ? 'text-neutral-900 bg-neutral-50/50' : 'text-neutral-500'}`}
              >
                {opt.label}
                {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add Student Enrollment Modal ────────────────────────────────────────────

function AddStudentModal({
  open,
  onClose,
  onAddSelected,
  onAddAll,
}: {
  open: boolean;
  onClose: () => void;
  onAddSelected: (students: any[]) => void;
  onAddAll: (filteredList: any[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState<string[]>(['All']);
  const [filterSchool, setFilterSchool] = useState<string[]>(['All']);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = ALL_GLOBAL_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                       s.email.toLowerCase().includes(search.toLowerCase()) || 
                       s.phone.includes(search);
    const matchCity = filterCity.includes('All') || filterCity.includes(s.city);
    const matchSchool = filterSchool.includes('All') || filterSchool.includes(s.school);
    return matchSearch && matchCity && matchSchool;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddSelected = () => {
    const selectedStudents = ALL_GLOBAL_STUDENTS.filter(s => selectedIds.has(s.id));
    onAddSelected(selectedStudents);
    setSelectedIds(new Set());
    onClose();
  };

  const handleAddAll = () => {
    onAddAll(filtered);
    setSelectedIds(new Set());
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-neutral-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Добавить участников</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Выберите пользователей для добавления на мероприятие</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Поиск по ФИО, телефону или email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 pl-10 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 bg-neutral-50 hover:bg-white focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col z-[50]">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 block">Город</label>
              <MultiSelectDropdown
                values={filterCity}
                onChange={setFilterCity}
                placeholder="Все города"
                options={[
                  { value: 'All', label: 'Все города' },
                  { value: 'Москва', label: 'Москва' },
                  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
                  { value: 'Казань', label: 'Казань' },
                  { value: 'Ташкент', label: 'Ташкент' },
                  { value: 'Самарканд', label: 'Самарканд' }
                ]}
              />
            </div>
            <div className="flex flex-col z-[50]">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 block">Учебное заведение</label>
              <MultiSelectDropdown
                values={filterSchool}
                onChange={setFilterSchool}
                placeholder="Все заведения"
                options={[
                  { value: 'All', label: 'Все заведения' },
                  { value: 'Школа №1', label: 'Школа №1' },
                  { value: 'Лицей №2', label: 'Лицей №2' },
                  { value: 'Гимназия №3', label: 'Гимназия №3' },
                  { value: 'МГУ', label: 'МГУ' },
                  { value: 'СГАУ', label: 'СГАУ' },
                  { value: 'ТАТУ', label: 'ТАТУ' },
                  { value: 'СамГУ', label: 'СамГУ' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-hidden border-t border-neutral-100">
          <div className="max-h-[340px] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200 grid grid-cols-[36px_1fr_1fr_100px_100px] items-center px-4 py-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              <div className="flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(filtered.map(s => s.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 w-3.5 h-3.5 cursor-pointer" 
                />
              </div>
              <div className="pl-1">ФИО</div>
              <div>Email</div>
              <div>Город</div>
              <div>Заведение</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm font-medium text-neutral-400">
                По вашему запросу студенты не найдены
              </div>
            ) : filtered.map(s => {
              const isSelected = selectedIds.has(s.id);
              const initials = s.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div 
                  key={s.id} 
                  onClick={() => toggleSelect(s.id)}
                  className={`grid grid-cols-[36px_1fr_1fr_100px_100px] items-center px-4 py-2.5 border-b border-neutral-50 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--color-admin-primary-50)]/40' : 'hover:bg-neutral-50/60'}`}
                >
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelect(s.id)}
                      onClick={e => e.stopPropagation()}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 w-3.5 h-3.5 cursor-pointer" 
                    />
                  </div>
                  <div className="flex items-center gap-2.5 pl-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <span className="text-[13px] font-semibold text-neutral-900 truncate">{s.name}</span>
                  </div>
                  <div className="text-[12px] text-neutral-500 truncate pr-2" title={s.email}>{s.email}</div>
                  <div className="text-[12px] text-neutral-500 truncate">{s.city}</div>
                  <div className="text-[12px] text-neutral-400 truncate">{s.school}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="px-5 py-3.5 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-between">
          <button 
            onClick={handleAddAll} 
            className="text-[11px] font-semibold text-[var(--color-admin-primary-600)] hover:text-[var(--color-admin-primary-700)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-admin-primary-50)] transition-colors uppercase tracking-wider"
          >
            Добавить всех ({filtered.length})
          </button>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 px-4 py-2 hover:bg-neutral-100 rounded-xl transition-colors">Отмена</button>
            <Button 
              variant="primary" 
              disabled={selectedIds.size === 0} 
              onClick={handleAddSelected} 
              className="text-[11px] font-semibold px-4 h-8 shadow-sm"
            >
              Добавить выбранных ({selectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Import Participants Simulation Modal ────────────────────────────────────

function ImportParticipantsModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (newParticipants: any[]) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const mockParsedRows = [
    { name: 'Алексей Козлов', email: 'a.kozlov@example.com', phone: '+7 905 111 22 33', role: 'Senior QA', city: 'Москва', school: 'Школа №1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' },
    { name: 'Мадина Саидова', email: 'm.saidova@example.com', phone: '+998 93 111 22 33', role: 'UI/UX Designer', city: 'Ташкент', school: 'ТАТУ', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' },
    { name: 'Рустам Валиев', email: 'r.valiev@example.com', phone: '+998 94 444 55 66', role: 'HR Specialist', city: 'Самарканд', school: 'СамГУ', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60' },
  ];

  const handleSelectMockFile = () => {
    setSelectedFile('participants_list_export_2026.csv');
    setIsParsing(true);
    setTimeout(() => {
      setPreviewData(mockParsedRows);
      setIsParsing(false);
    }, 1200);
  };

  const handleConfirmImport = () => {
    onImport(previewData);
    setSelectedFile(null);
    setPreviewData([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-neutral-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Импорт участников</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Импортируйте список участников из Excel или CSV-файла</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!selectedFile ? (
            <div 
              onClick={handleSelectMockFile}
              className="border-2 border-dashed border-neutral-200 hover:border-[var(--color-admin-primary-500)] bg-neutral-50/50 hover:bg-[var(--color-admin-primary-50)]/10 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center group-hover:scale-110 transition-all text-neutral-400 group-hover:bg-white group-hover:text-[var(--color-admin-primary-500)] group-hover:shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800">Нажмите, чтобы выбрать файл</p>
                <p className="text-[11px] text-neutral-400 mt-1">Поддерживаемые форматы: CSV, XLSX · До 10 МБ</p>
              </div>
              <div className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 shadow-sm mt-1 hover:bg-neutral-50/50 transition-colors">
                Выбрать mock_participants.csv
              </div>
            </div>
          ) : isParsing ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin" />
              <p className="text-xs font-bold text-neutral-500">Чтение и валидация строк файла...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Успешно распознано участников: {previewData.length}</span>
                </div>
                <button onClick={() => { setSelectedFile(null); setPreviewData([]); }} className="text-neutral-400 hover:text-neutral-700 font-semibold">Сбросить</button>
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white max-h-[160px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-neutral-50 sticky top-0 border-b border-neutral-200 z-10">
                    <tr className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                      <th className="px-4 py-2">Участник</th>
                      <th className="px-4 py-2">Должность</th>
                      <th className="px-4 py-2">Город</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="font-semibold text-neutral-700">
                        <td className="px-4 py-2">
                          <div>{row.name}</div>
                          <div className="text-[10px] text-neutral-400">{row.email}</div>
                        </td>
                        <td className="px-4 py-2 font-medium">{row.role}</td>
                        <td className="px-4 py-2 font-medium text-neutral-400">{row.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 px-4 py-2 hover:bg-neutral-100 rounded-xl transition-colors">Отмена</button>
          <Button 
            variant="primary" 
            disabled={previewData.length === 0 || isParsing} 
            onClick={handleConfirmImport} 
            className="text-xs font-semibold px-4 h-9 shadow-sm"
          >
            Импортировать ({previewData.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Block Preview Renderer ───────────────────────────────────────────

function RenderSingleBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div 
          className="prose prose-sm max-w-none text-neutral-800 leading-relaxed [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500 [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" 
          dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} 
        />
      );
    case 'video':
      return (
        <div className="bg-neutral-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] relative overflow-hidden group shadow-md border border-neutral-800">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-6 h-6 text-white fill-white/20 ml-0.5" />
          </div>
          <div className="z-10">
            <p className="text-sm font-bold text-white max-w-md truncate">{block.data?.fileName || 'Видео-урок.mp4'}</p>
            <p className="text-[11px] text-white/50 mt-1">Кликните для начала воспроизведения</p>
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white/40 text-[10px] font-mono">
            <span>0:00</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-1/5 h-full bg-[var(--color-admin-primary-500)] rounded-full" />
            </div>
            <span>15:30</span>
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative group">
            <img src={block.data?.url} alt="" className="max-h-[450px] object-cover w-full" />
          </div>
          {block.data?.caption && <p className="text-[12px] text-neutral-500 font-medium text-center mt-1">{block.data.caption}</p>}
        </div>
      );
    case 'slider':
      return (
        <div className="w-full">
          <div className="flex gap-4 overflow-x-auto snap-x pb-3 scrollbar-thin">
            {block.data?.images?.map((img: any, i: number) => (
              <div key={img.id || i} className="w-80 h-52 shrink-0 rounded-2xl overflow-hidden border border-neutral-200 snap-start bg-neutral-100 shadow-sm hover:shadow-md transition-shadow group/slide">
                <img src={img.url} alt="" className="w-full h-full object-cover group-hover/slide:scale-[1.02] transition-transform duration-300" />
              </div>
            ))}
            {(!block.data?.images || block.data.images.length === 0) && (
              <div className="w-full h-40 flex items-center justify-center text-neutral-400 italic text-sm">Галерея изображений пуста</div>
            )}
          </div>
        </div>
      );
    case 'file': {
      const fileName = block.data?.name || 'Файл.pdf';
      const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
      const colorMap: Record<string, { bg: string; text: string; hoverText: string }> = {
        PDF: { bg: 'bg-rose-50', text: 'text-rose-500', hoverText: 'group-hover:text-rose-600' },
        XLSX: { bg: 'bg-emerald-50', text: 'text-emerald-500', hoverText: 'group-hover:text-emerald-600' },
        XLS: { bg: 'bg-emerald-50', text: 'text-emerald-500', hoverText: 'group-hover:text-emerald-600' },
        PPTX: { bg: 'bg-blue-50', text: 'text-blue-500', hoverText: 'group-hover:text-blue-600' },
        DOC: { bg: 'bg-blue-50', text: 'text-blue-500', hoverText: 'group-hover:text-blue-600' },
        DOCX: { bg: 'bg-blue-50', text: 'text-blue-500', hoverText: 'group-hover:text-blue-600' },
      };
      const colors = colorMap[ext] || { bg: 'bg-neutral-50', text: 'text-neutral-500', hoverText: 'group-hover:text-neutral-600' };
      return (
        <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 hover:shadow transition-all group cursor-pointer w-full max-w-md">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
            <FileText className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className="text-[14px] font-bold text-neutral-900 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] leading-tight mb-0.5"
              title={fileName}
            >
              {fileName}
            </p>
            <p className="text-[12px] text-neutral-500 font-medium">{ext} Документ • {block.data?.size || '0 KB'}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div 
              className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Предпросмотр"
              onClick={(e) => { e.stopPropagation(); alert('Предпросмотр файла: ' + fileName); }}
            >
              <Eye className="w-4 h-4 text-neutral-600" />
            </div>
            <div 
              className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Скачать"
              onClick={(e) => { e.stopPropagation(); alert('Скачивание файла: ' + fileName); }}
            >
              <Download className="w-4 h-4 text-neutral-600" />
            </div>
          </div>
        </div>
      );
    }
    case 'callout': {
      const ci = CALLOUT_ICONS.find(i => i.id === block.data?.icon) || CALLOUT_ICONS[2];
      const IC = ci.icon;
      const show = block.data?.icon !== 'none';
      return (
        <div className="rounded-2xl p-4 flex items-start gap-3 border border-neutral-200/50 shadow-sm" style={{ backgroundColor: block.data?.bgColor || '#F3F4F6' }}>
          {show && <div className="shrink-0 mt-0.5" style={{ color: block.data?.iconColor || '#4B5563' }}><IC className="w-5 h-5" /></div>}
          <div className="text-[13px] text-neutral-800 leading-relaxed flex-1 prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
        </div>
      );
    }
    case 'button':
      return (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-center">
            <a href={block.data?.url || '#'} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all block text-center" style={{ backgroundColor: block.data?.color || '#3B82F6', color: block.data?.textColor || '#FFFFFF' }}>
              {block.data?.text || 'Кнопка'}
            </a>
          </div>
          {block.data?.isDivider && <div className="h-px bg-neutral-200 my-4 w-full" />}
        </div>
      );
    case 'iframe':
      return (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest"><Code className="w-4 h-4" /> Встроенный виджет</div>
          {block.data?.code ? (
            <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: block.data.code }} />
          ) : (
            <div className="w-full h-20 flex items-center justify-center text-neutral-400 text-xs italic">Код iframe пуст</div>
          )}
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm w-full bg-white">
          <table className="w-full border-collapse text-left">
            <tbody>
              {block.data?.cells?.map((row: any[], ri: number) => (
                <tr key={ri} className={ri === 0 && block.data.headerRow ? "bg-neutral-50/80 border-b border-neutral-200 font-bold" : "border-b border-neutral-100 last:border-b-0"}>
                  {row.map((cell: any, ci: number) => {
                    const html = typeof cell === 'string' ? cell : cell?.html || '';
                    const bgColor = typeof cell === 'string' ? undefined : cell?.color;
                    return (
                      <td key={ci} style={{ backgroundColor: bgColor }} className={`px-4 py-3 text-xs text-neutral-800 border-r border-neutral-100 last:border-r-0 ${ri === 0 && block.data.headerRow ? "font-bold text-neutral-950" : "font-medium"}`} dangerouslySetInnerHTML={{ __html: html }} />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'columns':
      return (
        <div className={`grid gap-6 grid-cols-1 ${block.data?.count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} w-full`}>
          {block.data?.cols?.map((colBlocks: ContentBlock[], colIdx: number) => (
            <div key={colIdx} className="flex flex-col gap-4 w-full">
              {colBlocks?.map((cb: ContentBlock) => (
                <RenderSingleBlock key={cb.id} block={cb} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ─── Main EventDetailsPage Component ──────────────────────────────────────────

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  
  const [activeTab, setActiveTab] = useState<'general' | 'participants'>('general');
  const [event, setEvent] = useState<EventData>(INITIAL_EVENT);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<'10' | '20' | '50' | 'all'>('10');

  // Reset page to 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [unmarkTarget, setUnmarkTarget] = useState<Participant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  // Import/Export and Day Attendance state
  const [importExportOpen, setimportExportOpen] = useState(false);
  const [activeDayId, setActiveDayId] = useState<string>('');

  const eventDays = useMemo(() => {
    if (event.dates && event.dates.length > 0) {
      return event.dates.map((d, index) => ({
        id: d.id,
        label: `${index + 1} день`,
        date: d.date,
        timeStart: d.timeStart,
        timeEnd: d.timeEnd,
      }));
    }
    return [{
      id: 'default-day',
      label: '1 день',
      date: event.date || '',
      timeStart: event.timeStart || '',
      timeEnd: event.timeEnd || '',
    }];
  }, [event.dates, event.date, event.timeStart, event.timeEnd]);

  useEffect(() => {
    if (eventDays.length > 0) {
      if (!activeDayId || !eventDays.some(d => d.id === activeDayId)) {
        setActiveDayId(eventDays[0].id);
      }
    }
  }, [eventDays, activeDayId]);

  const getParticipantStatus = (p: Participant, dayId: string): 'registered' | 'present' | 'absent' => {
    if (p.attendance && p.attendance[dayId]) {
      return p.attendance[dayId].status;
    }
    const isFirstDay = eventDays[0]?.id === dayId || dayId === 'default-day';
    if (isFirstDay) {
      return p.status || 'registered';
    }
    return 'registered';
  };

  const getParticipantArrivalTime = (p: Participant, dayId: string): string | undefined => {
    if (p.attendance && p.attendance[dayId]) {
      return p.attendance[dayId].arrivalTime;
    }
    const isFirstDay = eventDays[0]?.id === dayId || dayId === 'default-day';
    if (isFirstDay) {
      return p.arrivalTime;
    }
    return undefined;
  };

  // Load from localStorage on mount/id change
  useEffect(() => {
    if (typeof window !== 'undefined' && params.id) {
      const storedEvents = localStorage.getItem('osnova_events');
      let foundEvent = null;
      if (storedEvents) {
        const eventsList = JSON.parse(storedEvents);
        foundEvent = eventsList.find((ev: any) => ev.id === params.id);
      }

      // If it's the main mock event EVT-001 or not found or has very few blocks, fall back to INITIAL_EVENT
      const targetEvent = (params.id === 'EVT-001' || !foundEvent || !foundEvent.blocks || foundEvent.blocks.length <= 1) ? INITIAL_EVENT : foundEvent;

      setEvent({
        id: targetEvent.id,
        title: targetEvent.title,
        type: targetEvent.type || 'Воркшоп',
        format: targetEvent.format,
        date: targetEvent.dates?.[0]?.date || targetEvent.date || '',
        timeStart: targetEvent.dates?.[0]?.timeStart || targetEvent.timeStart || '',
        timeEnd: targetEvent.dates?.[0]?.timeEnd || targetEvent.timeEnd || '',
        speakers: targetEvent.speakers,
        location: targetEvent.location,
        status: targetEvent.status || 'upcoming',
        registrationOpen: targetEvent.registrationOpen,
        participantsCount: targetEvent.participants || targetEvent.participantsCount || 0,
        participantLimit: targetEvent.participantLimit,
        description: targetEvent.description || 'Описание мероприятия.',
        lang: targetEvent.lang || 'RUS',
        registrationType: targetEvent.registrationType || 'open',
        dates: targetEvent.dates || [],
        registrationDates: targetEvent.registrationDates || [],
        blocks: targetEvent.blocks || []
      });

      // Load participants unique to this event
      const storedParticipants = localStorage.getItem(`osnova_event_participants_${params.id}`);
      if (storedParticipants) {
        const parsed = JSON.parse(storedParticipants);
        // Overwrite if size is small (<= 5) so the 32 participants are properly loaded for verification
        if (parsed && parsed.length <= 5) {
          setParticipants(INITIAL_PARTICIPANTS);
          localStorage.setItem(`osnova_event_participants_${params.id}`, JSON.stringify(INITIAL_PARTICIPANTS));
        } else {
          setParticipants(parsed);
        }
      } else {
        setParticipants(INITIAL_PARTICIPANTS);
        localStorage.setItem(`osnova_event_participants_${params.id}`, JSON.stringify(INITIAL_PARTICIPANTS));
      }
      setHasLoaded(true);
    }
  }, [params.id]);

  // Save participants when list updates
  useEffect(() => {
    if (hasLoaded && typeof window !== 'undefined' && params.id) {
      localStorage.setItem(`osnova_event_participants_${params.id}`, JSON.stringify(participants));
    }
  }, [participants, params.id, hasLoaded]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(message, 'success');
  };

  const handleToggleAttendance = (p: Participant) => {
    const currentStatus = getParticipantStatus(p, activeDayId);
    if (currentStatus === 'present') {
      setUnmarkTarget(p);
    } else {
      setParticipants(prev => prev.map(item => {
        if (item.id === p.id) {
          const now = new Date();
          const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          triggerToast(`Участник отмечен как присутствующий`, "success");
          
          const updatedAttendance = {
            ...(item.attendance || {}),
            [activeDayId]: {
              status: 'present' as const,
              arrivalTime: formattedDate
            }
          };
          
          const isFirstDay = eventDays[0]?.id === activeDayId || activeDayId === 'default-day';
          return { 
            ...item, 
            status: isFirstDay ? ('present' as const) : item.status, 
            arrivalTime: isFirstDay ? formattedDate : item.arrivalTime,
            attendance: updatedAttendance
          };
        }
        return item;
      }));
    }
  };

  const confirmUnmarkAttendance = () => {
    if (!unmarkTarget) return;
    setParticipants(prev => prev.map(item => {
      if (item.id === unmarkTarget.id) {
        triggerToast("Отметка присутствия успешно отменена", "info");
        
        const updatedAttendance = {
          ...(item.attendance || {}),
          [activeDayId]: {
            status: 'registered' as const,
            arrivalTime: undefined
          }
        };
        
        const isFirstDay = eventDays[0]?.id === activeDayId || activeDayId === 'default-day';
        return { 
          ...item, 
          status: isFirstDay ? ('registered' as const) : item.status, 
          arrivalTime: isFirstDay ? undefined : item.arrivalTime,
          attendance: updatedAttendance
        };
      }
      return item;
    }));
    setUnmarkTarget(null);
  };

  const confirmDeleteParticipant = () => {
    if (!deleteTarget) return;
    setParticipants(prev => prev.filter(item => item.id !== deleteTarget.id));
    triggerToast(`Участник ${deleteTarget.name} успешно удален из списка`, "info");
    setDeleteTarget(null);
  };

  const handleAddSelectedParticipants = (selectedUsers: any[]) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newPs: Participant[] = selectedUsers.map(u => ({
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar || '',
      role: u.role || 'Не указана',
      status: 'registered',
      registeredAt: formattedDate,
      city: u.city,
      school: u.school
    }));

    const nonDuplicates = newPs.filter(np => !participants.some(p => p.email === np.email || p.phone === np.phone));
    if (nonDuplicates.length > 0) {
      setParticipants(prev => [...prev, ...nonDuplicates]);
      triggerToast(`Успешно добавлено участников: ${nonDuplicates.length}`, "success");
    } else {
      triggerToast("Все выбранные участники уже есть в списке", "info");
    }
  };

  const handleAddAllFilteredParticipants = (filteredList: any[]) => {
    handleAddSelectedParticipants(filteredList);
  };

  const handleImportParsed = (newRows: any[]) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newPs: Participant[] = newRows.map(u => ({
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar || '',
      role: u.role || 'Не указана',
      status: 'registered',
      registeredAt: formattedDate,
      city: u.city,
      school: u.school
    }));

    const nonDuplicates = newPs.filter(np => !participants.some(p => p.email === np.email || p.phone === np.phone));
    if (nonDuplicates.length > 0) {
      setParticipants(prev => [...prev, ...nonDuplicates]);
      triggerToast(`Успешно импортировано участников: ${nonDuplicates.length}`, "success");
    } else {
      triggerToast("Все импортируемые участники уже есть в списке", "info");
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) || 
    (p.role && p.role.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedParticipants = useMemo(() => {
    if (pageSize === 'all') return filteredParticipants;
    const start = (currentPage - 1) * Number(pageSize);
    return filteredParticipants.slice(start, start + Number(pageSize));
  }, [filteredParticipants, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.ceil(filteredParticipants.length / Number(pageSize));
  }, [filteredParticipants.length, pageSize]);

  const handleExportCSV = () => {
    if (participants.length === 0) {
      triggerToast("Список участников пуст", "info");
      return;
    }
    const activeDay = eventDays.find(d => d.id === activeDayId);
    const dayLabel = activeDay ? activeDay.label : '1 день';
    const headers = ['ФИО', 'Email', 'Телефон', 'Роль', `Статус (${dayLabel})`, 'Дата регистрации', `Время прибытия (${dayLabel})`, 'Город', 'Учебное заведение'];
    const rows = participants.map(p => {
      const status = getParticipantStatus(p, activeDayId);
      const arrivalTime = getParticipantArrivalTime(p, activeDayId);
      return [
        p.name,
        p.email,
        p.phone,
        p.role || '',
        status === 'present' ? 'Присутствовал' : status === 'absent' ? 'Отсутствовал' : 'Зарегистрирован',
        p.registeredAt || '',
        arrivalTime || '',
        p.city || '',
        p.school || ''
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `event_participants_${event.id}_day_${activeDayId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Список участников экспортирован", "success");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('ru-RU');
        }
      }
      return dateStr;
    }
    return d.toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '—';
    const formattedDate = formatDate(dateStr);
    return timeStr ? `${formattedDate} в ${timeStr}` : formattedDate;
  };

  const tabs = [
    { id: 'general' as const, label: 'Общие данные', icon: BookOpen },
    { id: 'participants' as const, label: 'Участники и посещаемость', icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F9FAFB] dark:bg-[var(--bg-app)]">
      <PageHeader 
        breadcrumbs={[
          { label: 'Мероприятия', onClick: () => router.push('/events') },
          { label: event.title }
        ]}
      />

      <div className="flex-1 overflow-auto">
        {/* Banner Cover */}
        <div className="h-44 w-full relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 shrink-0 group/banner transition-all">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        {/* Event Info Card overlapping the banner */}
        <div className="max-w-6xl mx-auto w-full px-6 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Event Title and badges */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                    event.status === 'draft' ? 'bg-neutral-50 text-neutral-500 border-neutral-200' :
                    event.status === 'registration' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    event.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}>
                    {event.status === 'draft' ? 'Черновик' : event.status === 'registration' ? 'Регистрация' : event.status === 'in_progress' ? 'В процессе' : 'Завершено'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border bg-violet-50 text-violet-600 border-violet-200">
                    {event.type || 'Воркшоп'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                    event.format === 'offline' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-cyan-50 text-cyan-600 border-cyan-200'
                  }`}>
                    {event.format === 'offline' ? 'Офлайн' : 'Онлайн'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border bg-neutral-50 text-neutral-500 border-neutral-200">
                    {event.lang || 'RUS'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{event.title}</h1>
              </div>

              {/* Edit Button */}
              <Button 
                variant="outline"
                onClick={() => router.push(`/events/create?id=${event.id}`)} 
                className="gap-2 font-semibold text-neutral-700 border-neutral-200 shadow-sm h-9 hover:bg-neutral-50 text-xs shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                Редактировать
              </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-150/80 my-5" />

            {/* Event Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* 1. Location / Link */}
              <div className="flex items-start gap-3 group relative overflow-visible">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  event.format === 'offline' ? 'bg-orange-50 text-orange-600 border border-orange-100/50' : 'bg-violet-50 text-violet-600 border border-violet-100/50'
                }`}>
                  {event.format === 'offline' ? <MapPin className="w-4.5 h-4.5" /> : <LinkIcon className="w-4.5 h-4.5 text-violet-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">{event.format === 'offline' ? 'Место проведения' : 'Ссылка'}</span>
                  <span className="text-xs font-bold text-neutral-800 block truncate max-w-[200px] underline decoration-dotted underline-offset-4 cursor-help" title={event.location}>
                    {event.location || '—'}
                  </span>
                  {/* Tooltip for full location/link */}
                  {event.location && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 hidden group-hover:block max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl px-4 py-3 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-1.5">{event.format === 'offline' ? 'Полный адрес' : 'Полная ссылка'}</div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 break-all">{event.location}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-neutral-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Dates of Conducting */}
              <div className="flex items-start gap-3 group relative overflow-visible">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Даты проведения</span>
                  <span className="text-xs font-bold text-neutral-800 block underline decoration-dotted underline-offset-4 cursor-help whitespace-nowrap">
                    {eventDays.length > 1 ? (
                      `${formatDate(eventDays[0].date)} — ${formatDate(eventDays[eventDays.length - 1].date)}`
                    ) : eventDays.length === 1 ? (
                      `${formatDate(eventDays[0].date)}, ${eventDays[0].timeStart}—${eventDays[0].timeEnd}`
                    ) : (
                      `${event.date ? formatDate(event.date) : '—'}, ${event.timeStart}—${event.timeEnd}`
                    )}
                  </span>
                  
                  {/* Premium Date Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 hidden group-hover:block w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-2">Расписание по дням</div>
                    <div className="space-y-2">
                      {eventDays.map((d, index) => (
                        <div key={d.id} className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-500">{index + 1} день ({formatDate(d.date)})</span>
                          <span className="text-neutral-800 dark:text-neutral-200 font-mono">{d.timeStart}—{d.timeEnd}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-neutral-900" />
                  </div>
                </div>
              </div>

              {/* 3. Registration Period */}
              <div className="flex items-start gap-3 group relative overflow-visible">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100/50 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Регистрация</span>
                  <span className="text-xs font-bold text-neutral-800 block underline decoration-dotted underline-offset-4 cursor-help">
                    {event.registrationType === 'private' ? 'Приватная' : 'Открытая'}
                  </span>
                  
                  {/* Premium Registration Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 hidden group-hover:block w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-2">Период регистрации</div>
                    {event.registrationDates && event.registrationDates.length > 0 ? (
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">Начало:</span>
                          <span className="text-neutral-800 dark:text-neutral-200">{formatDateTime(event.registrationDates[0].dateStart, event.registrationDates[0].timeStart)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">Окончание:</span>
                          <span className="text-neutral-800 dark:text-neutral-200">{formatDateTime(event.registrationDates[0].dateEnd, event.registrationDates[0].timeEnd)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-neutral-500">
                        Период не настроен. Запись {event.registrationOpen ? 'открыта' : 'закрыта'}.
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-neutral-900" />
                  </div>
                </div>
              </div>

              {/* 4. Participants */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Участники</span>
                  <span className="text-xs font-bold text-neutral-800 block">
                    {participants.length}
                    {event.participantLimit ? ` / ${event.participantLimit}` : ''}
                    <span className="text-[10px] text-neutral-400 font-bold ml-1">чел.</span>
                  </span>
                </div>
              </div>
            </div>
            </div>

          </div>

        {/* Flat Underline Tabs */}
        <div className="max-w-6xl mx-auto w-full px-6 mt-6">
          <div className="flex gap-1 border-b border-neutral-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'participants' && ` (${participants.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="max-w-6xl mx-auto w-full px-6 py-6 pb-24">
          
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full flex flex-col gap-6">
                {/* Content blocks preview - now full width */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8 flex flex-col gap-6">
                  <div>
                    <h3 className="text-[15px] font-semibold text-neutral-900">Программа и материалы</h3>
                    <p className="text-[12px] text-neutral-400 mt-0.5">Внутренний контент страницы мероприятия, отображаемый для пользователей</p>
                  </div>

                  <div className="h-px bg-neutral-100" />

                  <div className="flex flex-col gap-6">
                    {event.blocks && event.blocks.length > 0 ? (
                      event.blocks.map((block) => (
                        <div key={block.id} className="w-full">
                          <RenderSingleBlock block={block} />
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-neutral-400 italic text-sm">
                        <FileText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                        Для этого мероприятия не добавлены контентные блоки.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS & ATTENDANCE */}
          {activeTab === 'participants' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Three compact cards of stats/actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Stats */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between gap-3 min-h-[90px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Посещаемость</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {participants.filter(p => getParticipantStatus(p, activeDayId) === 'present').length} из {participants.length}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${participants.length > 0 ? (participants.filter(p => getParticipantStatus(p, activeDayId) === 'present').length / participants.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* QR Code link */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 min-h-[90px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Регистрация по QR</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Скан на месте проведения</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowQrModal(true)} 
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100/50 shadow-sm"
                  >
                    Показать
                  </button>
                </div>

                {/* Confirmation link */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 min-h-[90px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Ссылка отметки</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Для ручной регистрации</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`https://osnova.events/check/${event.id}`, "Ссылка-подтверждение скопирована!") 
                    } 
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50/50 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors border border-violet-100/50 shadow-sm"
                  >
                    Копировать
                  </button>
                </div>

              </div>

              {/* Toolbar: Search, Import/Export Dropdown, and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-6">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск участников" 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Import/Export Dropdown */}
                  <div className="relative">
                    {importExportOpen && <div className="fixed inset-0 z-[90]" onClick={() => setimportExportOpen(false)} />}
                    <button
                      onClick={() => setimportExportOpen(!importExportOpen)}
                      className="flex items-center gap-2 px-3 h-9 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                      title="Импорт / Экспорт Excel"
                      type="button"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-neutral-500" />
                      <span>Excel</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-450" />
                    </button>
                    {importExportOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => {
                            setimportExportOpen(false);
                            handleExportCSV();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                          type="button"
                        >
                          <Download className="w-4 h-4 text-neutral-400" />
                          <span>Экспорт</span>
                        </button>
                        <button
                          onClick={() => {
                            setimportExportOpen(false);
                            setShowImportModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                          type="button"
                        >
                          <Upload className="w-4 h-4 text-neutral-400" />
                          <span>Импорт</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add Participant Button */}
                  <Button 
                    variant="primary" 
                    onClick={() => setAddStudentModalOpen(true)} 
                    className="font-semibold gap-2 shadow-sm text-xs h-9 px-4"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить участника
                  </Button>
                </div>
              </div>

              {/* Day Tab Selectors */}
              <div className="flex items-center gap-1.5 border-b border-neutral-150 pb-3 mb-4 mt-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-2">Дни проведения:</span>
                <div className="flex flex-wrap gap-1.5">
                  {eventDays.map((d) => {
                    const isActive = d.id === activeDayId;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setActiveDayId(d.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isActive 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table Card (overflow-visible to prevent clipping tooltips!) */}
              {filteredParticipants.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-1">{search ? 'Участники не найдены' : 'Нет участников'}</h3>
                  <p className="text-[13px] text-neutral-400 max-w-sm">{search ? 'Попробуйте изменить поисковый запрос' : 'Добавьте участников на мероприятие, чтобы отслеживать их посещаемость'}</p>
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-visible">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50/80 border-b border-neutral-100">
                        <th className="text-left pl-6 py-2.5">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Участник</span>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[140px]">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Статус</span>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[160px]">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Дата регистрации</span>
                        </th>
                        <th className="text-left px-2 py-2.5 w-[160px]">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Прибытие</span>
                        </th>
                        <th className="w-[120px] pr-6 text-center">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Действия</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedParticipants.map((p: Participant) => (
                        <tr 
                          key={p.id} 
                          className="group border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors"
                        >
                          <td className="pl-6 py-3">
                            <div className="flex items-center gap-3">
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-neutral-150 shadow-sm" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold text-xs flex items-center justify-center shadow-inner">
                                  {(p.name || p.email).charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-neutral-800 text-[13px] truncate animate-in fade-in duration-300" title={p.name}>
                                  {p.name || 'Не указано'}
                                </span>
                                <span className="text-[11px] text-neutral-400 font-medium truncate animate-in fade-in duration-300" title={p.email}>
                                  {p.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border shadow-sm ${
                              getParticipantStatus(p, activeDayId) === 'present' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                : getParticipantStatus(p, activeDayId) === 'absent'
                                  ? 'bg-rose-50 text-rose-700 border-rose-150'
                                  : 'bg-blue-50 text-blue-700 border-blue-150'
                            }`}>
                              {getParticipantStatus(p, activeDayId) === 'present' ? 'Присутствует' : getParticipantStatus(p, activeDayId) === 'absent' ? 'Отсутствует' : 'Зарегистрирован'}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <span className="text-[11px] text-neutral-500 font-medium tabular-nums">{p.registeredAt}</span>
                          </td>
                          <td className="px-2 py-3">
                            <span className="text-[11px] text-neutral-500 font-medium tabular-nums">
                              {getParticipantArrivalTime(p, activeDayId) || <span className="text-neutral-300 font-normal">—</span>}
                            </span>
                          </td>
                          <td className="pr-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-2.5">
                              {/* Checkbox attendance toggle */}
                              <div className="relative group/tooltip">
                                <button 
                                  onClick={() => handleToggleAttendance(p)}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                                    getParticipantStatus(p, activeDayId) === 'present' 
                                      ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95' 
                                      : 'bg-white border-neutral-300 text-neutral-300 hover:border-neutral-400 hover:text-neutral-500 hover:scale-105 active:scale-95 shadow-sm'
                                  }`}
                                >
                                  <Check className={`w-3 h-3 stroke-[3.5] transition-opacity ${getParticipantStatus(p, activeDayId) === 'present' ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap z-50 animate-in fade-in duration-150">
                                  {getParticipantStatus(p, activeDayId) === 'present' ? 'Отменить отметку' : 'Отметить присутствие'}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                                </div>
                              </div>

                              {/* Delete button */}
                              <div className="relative group/tooltip">
                                <button 
                                  onClick={() => setDeleteTarget(p)} 
                                  className="w-7 h-7 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap z-50 animate-in fade-in duration-150">
                                  Удалить участника
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination control panel */}
                  <div className="border-t border-neutral-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-50/20 rounded-b-2xl">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400 font-semibold">Показывать по:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(e.target.value as any)}
                          className="text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-300 shadow-sm cursor-pointer"
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="all">Все</option>
                        </select>
                      </div>
                      <span className="text-xs text-neutral-400 font-semibold">
                        Показано <span className="text-neutral-700 font-bold">{(currentPage - 1) * (pageSize === 'all' ? filteredParticipants.length : Number(pageSize)) + 1}–{pageSize === 'all' ? filteredParticipants.length : Math.min(currentPage * Number(pageSize), filteredParticipants.length)}</span> из <span className="text-neutral-700 font-bold">{filteredParticipants.length}</span>
                      </span>
                    </div>

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
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* QR PRESENTATION MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowQrModal(false)} />
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 p-6 flex flex-col items-center animate-in zoom-in-95 duration-200 border border-neutral-100">
            <button onClick={() => setShowQrModal(false)} className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-4 mt-2">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Отметка присутствия по QR</h2>
            <p className="text-xs text-neutral-400 font-semibold mb-6 text-center max-w-[340px]">Отсканируйте код камерой смартфона для автоматической регистрации посещения</p>
            
            <div className="w-60 h-60 bg-white border border-neutral-150 rounded-2xl shadow-inner p-5 flex items-center justify-center mb-6 relative">
               <div className="absolute inset-5 grid grid-cols-6 grid-rows-6 gap-1 opacity-80">
                 {Array.from({length: 36}).map((_, i) => (
                    <div key={i} className={`rounded-sm ${(i%2===0 || i%3===0) && i!==15 && i!==16 ? 'bg-neutral-950' : 'bg-transparent'}`} />
                 ))}
               </div>
               <div className="absolute top-5 left-5 w-10 h-10 border-[5px] border-neutral-950 rounded" />
               <div className="absolute top-5 right-5 w-10 h-10 border-[5px] border-neutral-950 rounded" />
               <div className="absolute bottom-5 left-5 w-10 h-10 border-[5px] border-neutral-950 rounded" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg shadow-md flex items-center justify-center text-[var(--color-admin-primary-500)]"><Sparkles className="w-4 h-4 fill-current"/></div>
               </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => triggerToast("Изображение QR-кода сохранено", "success")}
              className="w-full font-semibold h-10 border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 rounded-xl text-xs"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              Скачать изображение QR
            </Button>
          </div>
        </div>
      )}

      {/* ADD PARTICIPANT MODAL */}
      <AddStudentModal 
        open={addStudentModalOpen} 
        onClose={() => setAddStudentModalOpen(false)}
        onAddSelected={handleAddSelectedParticipants}
        onAddAll={handleAddAllFilteredParticipants}
      />

      {/* IMPORT PARTICIPANTS MODAL */}
      <ImportParticipantsModal 
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportParsed}
      />

      {/* DOUBLE-CONFIRMATION MODAL: UNMARK ATTENDANCE */}
      {unmarkTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setUnmarkTarget(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 p-6 flex flex-col text-center items-center animate-in zoom-in-95 duration-150 border border-neutral-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">Отменить отметку присутствия?</h3>
            <p className="text-[13px] text-neutral-500 mt-2 mb-6 max-w-[280px]">
              Вы действительно хотите отменить отметку присутствия для участника <strong className="text-neutral-800 font-semibold">«{unmarkTarget.name}»</strong>?
            </p>
            <div className="flex gap-3 w-full justify-end">
              <button 
                onClick={() => setUnmarkTarget(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={confirmUnmarkAttendance}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE-CONFIRMATION MODAL: DELETE PARTICIPANT */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteTarget(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 p-6 flex flex-col text-center items-center animate-in zoom-in-95 duration-150 border border-neutral-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">Удалить участника?</h3>
            <p className="text-[13px] text-neutral-500 mt-2 mb-6 max-w-[280px]">
              Вы действительно хотите удалить участника <strong className="text-neutral-800 font-semibold">«{deleteTarget.name}»</strong> из списка участников?
            </p>
            <div className="flex gap-3 w-full justify-end">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={confirmDeleteParticipant}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
}
