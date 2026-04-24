"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Filter, Download, MoreHorizontal, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Data mocks
const regData = [
  { date: 'Jan 1', users: 120 },
  { date: 'Jan 15', users: 850 },
  { date: 'Feb 1', users: 2100 },
  { date: 'Feb 15', users: 3400 },
  { date: 'Mar 1', users: 5200 },
  { date: 'Mar 15', users: 6100 },
  { date: 'Apr 1', users: 8540 },
];

const activeUsersData = [
  { date: 'Jan 1', active: 800 },
  { date: 'Jan 15', active: 1500 },
  { date: 'Feb 1', active: 4200 },
  { date: 'Feb 15', active: 3800 },
  { date: 'Mar 1', active: 6100 },
  { date: 'Mar 15', active: 5900 },
  { date: 'Apr 1', active: 7200 },
];

const ratingData = [
  { date: 'Jan 1', rating: 4.8 },
  { date: 'Jan 15', rating: 4.5 },
  { date: 'Feb 1', rating: 3.8 },
  { date: 'Feb 15', rating: 4.9 },
  { date: 'Mar 1', rating: 4.2 },
  { date: 'Mar 15', rating: 4.7 },
  { date: 'Apr 1', rating: 5.0 },
];

const pieData = [
  { name: 'Ташкент (ГК)', value: 4500 },
  { name: 'Самарканд', value: 2100 },
  { name: 'Бухара', value: 1200 },
  { name: 'Фергана', value: 800 },
];
const COLORS = ['#1E3932', '#FFE68B', '#3b82f6', '#10b981'];

const studentsMock = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  email: `a.student${i}@osnova.uz`,
  name: `Студент ${i + 1} Тестович`,
  branch: ['Ташкент (ГК)', 'Самарканд', 'Бухара'][i % 3],
  dept: 'Коммерческий департамент',
  div: 'Отдел продаж B2B',
  role: 'Менеджер',
  course: 'Изменения по тарифным планам'
}));

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

function StatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col hover:border-neutral-300 transition-colors">
      <h3 className="text-[14px] font-bold text-neutral-900 mb-4">{title}</h3>
      <div className="text-[44px] font-bold text-neutral-900 leading-none tracking-tight">
        {value}
      </div>
      {subtitle && <p className="text-[13px] text-neutral-500 mt-2">{subtitle}</p>}
    </div>
  );
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'tests'>('courses');

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-app)] overflow-y-auto">
      <PageHeader 
        title="Статистика" 
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-4 text-[13px] font-semibold bg-white shadow-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Экспорт
            </Button>
          </div>
        }
      />

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">
        
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
            onClick={() => setActiveTab('tests')}
            className={`pb-4 text-[14px] font-semibold transition-all border-b-2 ${activeTab === 'tests' ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          >
            Тесты
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <Filter className="w-4 h-4 text-neutral-400 mx-1 shrink-0" />
          <FilterDropdown label="Все филиалы" />
          <FilterDropdown label="Все департаменты" />
          <FilterDropdown label="Все отделы" />
          <FilterDropdown label="Должность" />
          {activeTab === 'courses' && <FilterDropdown label="Выбор курса" />}
          {activeTab === 'tests' && <FilterDropdown label="Тестирование" />}
          <FilterDropdown label="Пользователь" />
          <FilterDropdown label="Диапазон дат" />
        </div>

        {/* Content Tabs */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StatCard title="Общее количество пользователей" value="14,302" />
            
            {/* Registration Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-neutral-900">Динамика регистрации</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-admin-primary-500, #1E3932)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-admin-primary-500, #1E3932)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="users" stroke="var(--color-admin-primary-500, #1E3932)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visits Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Визиты за сегодня" value="4,205" />
              <StatCard title="Визиты за неделю" value="28,491" />
              <StatCard title="Визиты за месяц" value="112,055" />
            </div>

            {/* Active Users Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-neutral-900">Активные пользователи</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeUsersData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Distribution Pie Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-neutral-900">Распределение по филиалам</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Назначено курсов" value="125,483" />
              <StatCard title="В процессе обучения" value="18,048" />
              <StatCard title="Кол-во завершенных" value="85,266" />
            </div>

            {/* Top Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-neutral-900">В процессе</h3>
                  <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 uppercase">Курс</th>
                        <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">В процессе</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">B2B Sales Pro</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">4,848</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Корпоративная этика</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">3,141</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Основы Excel</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">2,066</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Time Management</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">1,832</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Generative AI</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">1,417</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Курсы Microsoft</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">914</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Кредитные решения</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">820</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-neutral-900">Завершенные</h3>
                  <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 uppercase">Курс</th>
                        <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">Завершенные</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Введение в безопасность</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">12,048</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Time Management</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">11,042</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">B2B Sales Pro</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">9,837</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Кредитные решения</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">8,422</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Тестирование B2B</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">7,120</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Основы Excel</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">5,419</td></tr>
                      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Логическое мышление</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right font-semibold">4,312</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rating Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-neutral-900">Оценка материалов</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ratingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-admin-primary-500, #FFE68B)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-admin-primary-500, #FFE68B)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="step" dataKey="rating" stroke="var(--color-admin-primary-500, #FFE68B)" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Общее кол-во отзывов" value="18,909" />
              <StatCard title="Текущие показатели" value="4.82" />
              <StatCard title="Предыдущая неделя" value="4.71" />
            </div>

            {/* Students Table */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-neutral-900">Студенты</h3>
                <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Email</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">ФИО</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Филиал</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Департамент</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Отдел</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Должность</th>
                      <th className="py-3 px-4 text-[12px] font-semibold text-neutral-500">Курс</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsMock.map(student => (
                      <tr key={student.id} className="border-b border-neutral-100 hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 text-[13px] text-[var(--color-admin-primary-600)] font-medium"><a href={`/users/${student.id}`} className="hover:underline">{student.email}</a></td>
                        <td className="py-3 px-4 text-[13px] text-neutral-900">{student.name}</td>
                        <td className="py-3 px-4 text-[13px] text-neutral-600">{student.branch}</td>
                        <td className="py-3 px-4 text-[13px] text-neutral-600">{student.dept}</td>
                        <td className="py-3 px-4 text-[13px] text-neutral-600">{student.div}</td>
                        <td className="py-3 px-4 text-[13px] text-neutral-600">{student.role}</td>
                        <td className="py-3 px-4 text-[13px] text-neutral-900 font-medium truncate max-w-[200px]">{student.course}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-[13px] text-neutral-500">
                 <span>Showing first 15 rows of 125,483</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Пройдено тестов" value="12,504" />
              <StatCard title="Средний балл" value="84%" />
              <StatCard title="Успеваемость CSI" value="4.8/5" />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-bold text-neutral-900">Топ тестов с лучшими результатами</h3>
                    <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-neutral-100">
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 uppercase">Тест</th>
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">Сдано</th>
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">Средний балл</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">B2B Sales Тестирование</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">450</td><td className="py-3 px-2 text-[13px] text-emerald-600 font-bold text-right">95%</td></tr>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Корпоративная этика: Экзамен</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">312</td><td className="py-3 px-2 text-[13px] text-emerald-600 font-bold text-right">92%</td></tr>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Основы безопасности 101</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">290</td><td className="py-3 px-2 text-[13px] text-emerald-600 font-bold text-right">88%</td></tr>
                     </tbody>
                  </table>
               </div>
            </div>
            
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-neutral-900">Топ тестов с низкими результатами (Зона риска)</h3>
                  <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-neutral-100">
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 uppercase">Тест</th>
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">Сдано</th>
                           <th className="py-3 px-2 text-[12px] font-semibold text-neutral-500 text-right uppercase">Средний балл</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Сложные B2B переговоры</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">820</td><td className="py-3 px-2 text-[13px] text-rose-600 font-bold text-right">41%</td></tr>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Аттестация по продукту (1 кв.)</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">1,240</td><td className="py-3 px-2 text-[13px] text-rose-600 font-bold text-right">53%</td></tr>
                        <tr className="border-b border-neutral-50"><td className="py-3 px-2 text-[13px] text-neutral-900 font-medium">Финансовый комплаенс</td><td className="py-3 px-2 text-[13px] text-neutral-600 text-right">610</td><td className="py-3 px-2 text-[13px] text-amber-600 font-bold text-right">65%</td></tr>
                     </tbody>
                  </table>
               </div>
            </div>
           </div>
          </div>
        )}

      </div>
    </div>
  );
}
