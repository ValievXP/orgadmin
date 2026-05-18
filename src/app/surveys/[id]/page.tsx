"use client";
import React, { useState } from 'react';
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
  Folder 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SurveyEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('Название опроса');
  const [accessType, setAccessType] = useState('Открытый');
  
  // Toggles state
  const [toggles, setToggles] = useState({
    rating: true,
    timer: true,
    feedback: false,
    homework: false
  });
  
  const [timerMinutes, setTimerMinutes] = useState('5');

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
            <Link href="/surveys" className="hover:text-neutral-900 transition-colors">Опросы</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Содержание</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900">{surveyTitle}</span>
          </div>
          <Button variant="primary" className="h-9 gap-2 shadow-sm rounded-xl">
            <Save className="w-4 h-4" />
            Сохранить
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 lg:p-12 flex flex-col gap-8">
        {/* Title Editor */}
        <div>
          <input 
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            className="text-3xl md:text-4xl font-bold text-neutral-900 bg-transparent outline-none w-full placeholder:text-neutral-300"
            placeholder="Введите название опроса"
          />
        </div>

        {/* Settings Block */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between p-5 hover:bg-neutral-50/50 transition-colors"
          >
            <div className="flex items-center gap-3 text-neutral-900 font-bold">
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
                    className="w-full h-11 px-4 appearance-none bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-500)]/20 focus:border-[var(--color-admin-primary-500)] transition-all"
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
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
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
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
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
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
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
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900">Содержание</h3>
            <span className="text-sm font-medium text-neutral-400">0 блока</span>
          </div>
          
          <div className="relative border-2 border-dashed border-neutral-200 rounded-3xl bg-white/50 py-24 flex flex-col items-center justify-center transition-colors hover:bg-white hover:border-neutral-300">
            <div className="w-12 h-12 bg-white border border-neutral-200 shadow-sm rounded-2xl flex items-center justify-center text-neutral-400 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-900 mb-1">Начните создавать опрос</h4>
            <p className="text-sm text-neutral-400">Используйте панель инструментов внизу экрана</p>
            
            {/* Toolbar snippet at bottom of empty state */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border border-neutral-200 shadow-xl rounded-2xl p-2 flex items-center gap-1.5">
              {[
                { icon: Type, color: 'text-neutral-500', bg: 'hover:bg-neutral-100' },
                { icon: Video, color: 'text-rose-500', bg: 'hover:bg-rose-50' },
                { icon: ImageIcon, color: 'text-blue-500', bg: 'hover:bg-blue-50' },
                { icon: ListOrdered, color: 'text-purple-500', bg: 'hover:bg-purple-50' },
                { icon: FileText, color: 'text-amber-500', bg: 'hover:bg-amber-50' },
                { icon: Info, color: 'text-sky-500', bg: 'hover:bg-sky-50' },
                { icon: MousePointer2, color: 'text-emerald-500', bg: 'hover:bg-emerald-50' },
                { icon: HelpCircle, color: 'text-orange-500', bg: 'hover:bg-orange-50' },
                { icon: Code2, color: 'text-indigo-500', bg: 'hover:bg-indigo-50' },
                { icon: Table, color: 'text-teal-500', bg: 'hover:bg-teal-50' },
                { icon: LayoutGrid, color: 'text-indigo-500', bg: 'hover:bg-indigo-50' },
                { icon: Folder, color: 'text-rose-500', bg: 'hover:bg-rose-50' },
              ].map((tool, i) => (
                <button key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${tool.bg}`}>
                  <tool.icon className={`w-4 h-4 ${tool.color}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
