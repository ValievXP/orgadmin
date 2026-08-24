"use client";
import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArrowUpRight, Flame, Ticket, AlignLeft, Image, Bell, BookOpen, Send, Route, GitBranch } from 'lucide-react';
import Link from 'next/link';

const TOOLS = [
  {
    id: 'user-flow',
    title: 'User Flow',
    description: 'Автоматические сценарии для сотрудников: кому и когда назначить обучение, что написать и как разделить людей по признакам.',
    icon: Route,
    colorClass: 'text-teal-500 bg-teal-50',
    href: '/tools/user-flow'
  },
  {
    id: 'user-flow-pro',
    title: 'User Flow Pro',
    description: 'Расширенные сценарии: запуск по расписанию и при переводе сотрудника, проверка результатов обучения и назначение кураторов.',
    icon: GitBranch,
    colorClass: 'text-violet-500 bg-violet-50',
    href: '/tools/user-flow-pro'
  },
  {
    id: 'stories',
    title: 'Stories баннер',
    description: 'Почти как в Instagram только лучше, потому своё родное!',
    icon: Flame,
    colorClass: 'text-orange-500 bg-orange-50',
    href: '/tools/stories'
  },
  {
    id: 'promo',
    title: 'Промо-коды',
    description: 'Создавайте и отслеживайте скидочные купоны для стимуляции продаж платных курсов.',
    icon: Ticket,
    colorClass: 'text-pink-500 bg-pink-50',
    href: '/tools/promo'
  },
  {
    id: 'text',
    title: 'Текст',
    description: 'Настройка приветственного текста на главной странице студента (например, «Привет, {Имя}»).',
    icon: AlignLeft,
    colorClass: 'text-blue-500 bg-blue-50',
    href: '/tools/text'
  },
  {
    id: 'banner',
    title: 'Баннер',
    description: 'Управление статичным баннером (одной картинкой) на главной странице студента.',
    icon: Image,
    colorClass: 'text-amber-500 bg-amber-50',
    href: '/tools/banner'
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    description: 'Система массовых и триггерных push, Telegram и SMS рассылок для связи со студентами.',
    icon: Bell,
    colorClass: 'text-indigo-500 bg-indigo-50',
    href: '/tools/notifications'
  },
  {
    id: 'homeworks',
    title: 'Домашние задания',
    description: 'Единый центр проверки заданий, выставления оценок и обратной связи от кураторов.',
    icon: BookOpen,
    colorClass: 'text-emerald-500 bg-emerald-50',
    href: '/tools/homeworks'
  },
  {
    id: 'telegram',
    title: 'Telegram бот',
    description: 'Свяжите Telegram бота с платформой для отправки уведомлений и запуска Mini App прямо внутри мессенджера.',
    icon: Send,
    colorClass: 'text-sky-500 bg-sky-50',
    href: '/tools/telegram'
  }
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[#F4F5F7] dark:bg-[var(--bg-app)] overflow-x-hidden relative">
      <div className="bg-white">
        <PageHeader 
          title="Инструменты"
        />
      </div>
      
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link 
              href={tool.href} 
              key={tool.id}
              className="group bg-white rounded-[16px] p-8 flex flex-col min-h-[220px] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative"
            >
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-6 shrink-0 ${tool.colorClass}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-[17px] font-bold text-neutral-900 mb-2.5 tracking-tight">{tool.title}</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed font-medium">
                {tool.description}
              </p>
              
              <div className="absolute top-8 right-8 text-neutral-300 group-hover:text-neutral-900 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
