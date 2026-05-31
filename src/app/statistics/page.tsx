"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Filter, Download, MoreHorizontal, ChevronDown, Users, User, ArrowUpRight, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Data mocks for Users Tab
const regData = [
  { date: 'Jan 1', users: 120 },
  { date: 'Jan 15', users: 850 },
  { date: 'Feb 1', users: 2100 },
  { date: 'Feb 15', users: 3400 },
  { date: 'Mar 1', users: 5200 },
  { date: 'Mar 15', users: 6100 },
  { date: 'Apr 1', users: 8540 },
  { date: 'Apr 15', users: 10400 },
  { date: 'May 1', users: 12100 },
  { date: 'May 15', users: 14302 },
];

const activeUsersData = [
  { date: 'Jan 1', active: 800 },
  { date: 'Jan 15', active: 1500 },
  { date: 'Feb 1', active: 4200 },
  { date: 'Feb 15', active: 3800 },
  { date: 'Mar 1', active: 6100 },
  { date: 'Mar 15', active: 5900 },
  { date: 'Apr 1', active: 7200 },
  { date: 'Apr 15', active: 8100 },
  { date: 'May 1', active: 9400 },
  { date: 'May 15', active: 11050 },
];

const UZ_CITIES = [
  { name: 'Ташкент', users: 6436, x: 670, y: 150, pct: 45 },
  { name: 'Самарканд', users: 2431, x: 490, y: 220, pct: 17 },
  { name: 'Бухара', users: 1716, x: 380, y: 210, pct: 12 },
  { name: 'Фергана', users: 1144, x: 740, y: 170, pct: 8 },
  { name: 'Андижан', users: 858, x: 770, y: 150, pct: 6 },
  { name: 'Наманган', users: 715, x: 740, y: 130, pct: 5 },
  { name: 'Карши', users: 450, y: 260, x: 450, pct: 3 },
  { name: 'Нукус', users: 286, x: 120, y: 110, pct: 2 },
  { name: 'Ургенч', users: 143, x: 210, y: 150, pct: 1 },
  { name: 'Навои', users: 144, x: 410, y: 180, pct: 1 },
];

// Data mocks for Courses Tab
const coursesRatingData = [
  { date: 'Jan 1', rating: 4.8 },
  { date: 'Jan 15', rating: 4.5 },
  { date: 'Feb 1', rating: 4.2 },
  { date: 'Feb 15', rating: 4.9 },
  { date: 'Mar 1', rating: 4.6 },
  { date: 'Mar 15', rating: 4.7 },
  { date: 'Apr 1', rating: 4.85 },
];

const courseProgressMock = [
  { title: 'Введение в безопасность', active: 4848, completed: 12048, rate: 85 },
  { title: 'Time Management', active: 3141, completed: 11042, rate: 92 },
  { title: 'B2B Sales Pro', active: 2066, completed: 9837, rate: 76 },
  { title: 'Основы Excel', active: 1832, completed: 5419, rate: 88 },
  { title: 'Generative AI', active: 1417, completed: 4312, rate: 90 },
];

// Data mocks for Events Tab
const eventAttendanceData = [
  { name: 'Основы искусственного интеллекта', registered: 111, present: 32, absent: 79 },
  { name: 'Воркшоп по Figma UI/UX', registered: 85, present: 64, absent: 21 },
  { name: 'Безопасность корпоративной сети', registered: 150, present: 142, absent: 8 },
  { name: 'Методы криптозащиты', registered: 90, present: 52, absent: 38 },
];

// Data mocks for Surveys Tab
const surveyCompletionData = [
  { name: 'Опрос удовлетворенности', total: 142, completed: 118, rate: 83 },
  { name: 'Опрос по адаптации', total: 95, completed: 88, rate: 92 },
  { name: 'Оценка условий офиса', total: 320, completed: 150, rate: 47 },
];

function FilterDropdown({ label }: { label: string }) {
  return (
    <div className="relative group flex-1 min-w-[140px]">
      <button className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium text-neutral-700 hover:border-neutral-300 transition-colors shadow-sm">
        <span className="truncate">{label}</span>
        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
      </button>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col hover:border-neutral-300 transition-colors">
      <h3 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="text-[36px] font-bold text-neutral-900 leading-none tracking-tight">
        {value}
      </div>
      {subtitle && <div className="mt-2 text-xs font-semibold">{subtitle}</div>}
    </div>
  );
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'events' | 'surveys'>('users');
  const [hoveredCity, setHoveredCity] = useState<typeof UZ_CITIES[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent, city: typeof UZ_CITIES[0]) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 45,
    });
    setHoveredCity(city);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-app)] overflow-y-auto pb-12">
      <PageHeader 
        title="Статистика" 
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-4 text-[13px] font-semibold bg-white shadow-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Экспорт Excel
            </Button>
          </div>
        }
      />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-200">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-[14px] font-semibold transition-all border-b-2 ${activeTab === 'users' ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          >
            Пользователи
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`pb-4 text-[14px] font-semibold transition-all border-b-2 ${activeTab === 'courses' ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          >
            Курсы
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`pb-4 text-[14px] font-semibold transition-all border-b-2 ${activeTab === 'events' ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          >
            Мероприятия
          </button>
          <button 
            onClick={() => setActiveTab('surveys')}
            className={`pb-4 text-[14px] font-semibold transition-all border-b-2 ${activeTab === 'surveys' ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          >
            Опросы
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <Filter className="w-4 h-4 text-neutral-400 mx-1 shrink-0" />
          <FilterDropdown label="Все филиалы" />
          <FilterDropdown label="Все департаменты" />
          <FilterDropdown label="Все отделы" />
          <FilterDropdown label="Должность" />
          <FilterDropdown label="Диапазон дат" />
        </div>

        {/* ========================================================================= */}
        {/* USERS TAB                                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard 
                title="Всего студентов" 
                value="14,302" 
                subtitle={<span className="text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> +12% за месяц</span>}
              />
              <StatCard 
                title="Активные сессии" 
                value="7,200" 
                subtitle={<span className="text-neutral-500">DAU: Ежедневная активность</span>}
              />
              <StatCard 
                title="Визиты за сегодня" 
                value="4,205" 
                subtitle={<span className="text-neutral-500">Уникальные переходы</span>}
              />
              
              {/* Gender Split Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Разделение по полу</h3>
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
                    <span className="text-blue-600 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Мужчины: 58%</span>
                    <span className="text-rose-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Женщины: 42%</span>
                  </div>
                </div>
                <div className="h-3.5 w-full bg-neutral-100 rounded-full overflow-hidden flex border border-neutral-200/50">
                  <div className="h-full bg-blue-500" style={{ width: '58%' }} />
                  <div className="h-full bg-rose-500" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            {/* Geographical Distribution: Interactive SVG Map of Uzbekistan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Interactive Map */}
              <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col relative">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-neutral-900">Интерактивная карта Узбекистана</h3>
                  <p className="text-[12px] text-neutral-400 mt-1">Определение концентрации студентов по IP-адресам подключения</p>
                </div>
                
                {/* SVG Outline Map container */}
                <div className="flex-1 flex items-center justify-center min-h-[360px] relative bg-neutral-50/50 rounded-xl border border-neutral-100">
                  <svg viewBox="0 0 850 420" className="w-full h-full max-w-[800px] select-none">
                    {/* Abstract outline path representing Uzbekistan */}
                    <path 
                      d="M 50,140 Q 90,80 180,60 T 320,80 T 450,90 T 580,100 L 620,110 L 680,130 L 720,120 L 770,120 L 790,140 L 780,170 L 740,180 L 680,180 L 640,170 L 580,180 L 530,220 L 500,280 L 490,340 L 460,310 L 440,270 L 410,260 L 370,240 L 290,230 L 210,190 L 170,180 L 120,170 L 80,160 Z" 
                      fill="#F8FAFC" 
                      stroke="#E2E8F0" 
                      strokeWidth="2.5" 
                      strokeLinejoin="round"
                    />

                    {/* Regional Nodes */}
                    {UZ_CITIES.map((city) => (
                      <g 
                        key={city.name} 
                        className="cursor-pointer group"
                        onMouseMove={(e) => handleMouseMove(e, city)}
                        onMouseLeave={() => setHoveredCity(null)}
                      >
                        {/* Pulse Ring for Tashkent/Big cities */}
                        {city.users > 1000 && (
                          <circle 
                            cx={city.x} 
                            cy={city.y} 
                            r="12" 
                            className="fill-indigo-500/20 animate-ping origin-center"
                            style={{ animationDuration: city.users > 3000 ? '1.5s' : '2.5s' }}
                          />
                        )}
                        {/* Node core dot */}
                        <circle 
                          cx={city.x} 
                          cy={city.y} 
                          r={city.users > 4000 ? '8' : city.users > 1000 ? '6' : '4.5'} 
                          className="fill-indigo-600 stroke-white stroke-2 group-hover:fill-indigo-500 transition-colors shadow-md"
                        />
                        {/* Small City Name labels */}
                        <text 
                          x={city.x} 
                          y={city.y - 12} 
                          textAnchor="middle" 
                          className="fill-neutral-600 font-semibold text-[10px] select-none opacity-80 group-hover:opacity-100"
                        >
                          {city.name}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Floating Map Node Tooltip */}
                  {hoveredCity && (
                    <div 
                      className="absolute z-[180] bg-neutral-900 text-white rounded-xl py-2 px-3 shadow-xl text-xs font-semibold flex flex-col gap-1 border border-white/10 pointer-events-none"
                      style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                    >
                      <span className="font-bold border-b border-white/10 pb-0.5 mb-0.5">{hoveredCity.name}</span>
                      <span className="text-neutral-400">Студентов: <span className="text-white font-bold">{hoveredCity.users.toLocaleString()}</span></span>
                      <span className="text-neutral-400">Доля: <span className="text-white font-bold">{hoveredCity.pct}%</span></span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Top 10 Cities List */}
              <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 mb-4">Топ-10 городов</h3>
                  <div className="flex flex-col gap-3.5">
                    {UZ_CITIES.map((city, i) => (
                      <div key={city.name} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-800 flex items-center gap-1.5">
                            <span className="w-4 h-4 bg-neutral-100 text-neutral-400 rounded-md flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                            {city.name}
                          </span>
                          <span className="text-neutral-500 font-bold">
                            {city.users.toLocaleString()} <span className="text-[10px] text-neutral-400 font-semibold">({city.pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-50 rounded-full overflow-hidden border border-neutral-100">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${city.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Registration Dynamic Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Dynamic registrations chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[14px] font-bold text-neutral-900">Динамика регистрации</h3>
                  <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={regData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-admin-primary-500, #1E3932)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--color-admin-primary-500, #1E3932)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="users" stroke="var(--color-admin-primary-500, #1E3932)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic visits/activities chart */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[14px] font-bold text-neutral-900">Активные пользователи в сессиях</h3>
                  <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeUsersData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActive)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* COURSES TAB                                                               */}
        {/* ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Назначено курсов" value="125,483" />
              <StatCard title="В процессе обучения" value="18,048" />
              <StatCard title="Кол-во завершенных" value="85,266" />
            </div>

            {/* Courses progress board */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-neutral-900 mb-4">Статистика обучения по курсам</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 uppercase">Название курса</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">В процессе</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Завершили</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Успеваемость</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseProgressMock.map((course, idx) => (
                      <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-3 text-[14px] text-neutral-900 font-semibold">{course.title}</td>
                        <td className="py-4 px-3 text-[14px] text-neutral-600 text-right font-medium">{course.active.toLocaleString()}</td>
                        <td className="py-4 px-3 text-[14px] text-neutral-600 text-right font-medium">{course.completed.toLocaleString()}</td>
                        <td className="py-4 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${course.rate >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {course.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Courses Rating Trend */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-neutral-900">Средняя оценка полезности материалов</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coursesRatingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFE68B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#FFE68B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                    <YAxis domain={[3.5, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="rating" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRating)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* EVENTS TAB                                                                */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Проведено мероприятий" value="48" />
              <StatCard title="Всего регистраций" value="4,850" />
              <StatCard title="Средняя посещаемость" value="76%" />
            </div>

            {/* Events attendance details */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-neutral-900 mb-4">Статистика по недавним мероприятиям</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 uppercase">Мероприятие</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Зарегистрировано</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Присутствовало</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Отсутствовало</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventAttendanceData.map((ev, idx) => (
                      <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-3 text-[14px] text-neutral-900 font-semibold">{ev.name}</td>
                        <td className="py-4 px-3 text-[14px] text-neutral-600 text-right font-medium">{ev.registered}</td>
                        <td className="py-4 px-3 text-[14px] text-emerald-600 text-right font-bold">{ev.present}</td>
                        <td className="py-4 px-3 text-[14px] text-rose-500 text-right font-medium">{ev.absent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SURVEYS TAB                                                               */}
        {/* ========================================================================= */}
        {activeTab === 'surveys' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Назначено опросов" value="12" />
              <StatCard title="Получено ответов" value="1,490" />
              <StatCard title="Средний отклик (CSI)" value="82%" />
            </div>

            {/* Surveys completion stats */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-neutral-900 mb-4">Статистика активности по опросам</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 uppercase">Опрос</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Целевая аудитория</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Завершено ответов</th>
                      <th className="py-3 px-3 text-[12px] font-semibold text-neutral-400 text-right uppercase">Процент участия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyCompletionData.map((survey, idx) => (
                      <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-3 text-[14px] text-neutral-900 font-semibold">{survey.name}</td>
                        <td className="py-4 px-3 text-[14px] text-neutral-600 text-right font-medium">{survey.total}</td>
                        <td className="py-4 px-3 text-[14px] text-neutral-600 text-right font-medium">{survey.completed}</td>
                        <td className="py-4 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${survey.rate >= 80 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                            {survey.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
