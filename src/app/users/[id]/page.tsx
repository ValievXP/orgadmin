"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Briefcase, 
  Edit3, 
  Trash2, 
  Lock,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Award,
  Calendar
} from 'lucide-react';

const mockUser = {
  id: 1,
  initials: 'АС',
  name: 'Алексей Смирнов',
  email: 'a.smirnov@osnova.uz',
  phone: '+998 90 123-45-67',
  birthDate: '12/05/1990',
  customFields: [
    { label: 'Филиал', value: 'Ташкент (ГК)' },
    { label: 'Департамент', value: 'Коммерческий департамент' },
    { label: 'Отдел', value: 'Отдел продаж B2B' },
    { label: 'Должность', value: 'Руководитель отдела' }
  ],
  status: 'Работает',
  visit: '24/04/2026 10:30',
  reg: '15/01/2025 09:00',
  courses: [
    { id: 101, title: 'B2B Продажи: Продвинутый уровень', progress: 100, status: 'Завершен', date: '12/03/2026' },
    { id: 102, title: 'Управление командой', progress: 45, status: 'В процессе', date: '22/04/2026' },
    { id: 103, title: 'Корпоративная этика', progress: 0, status: 'Назначен', date: '25/04/2026' },
  ],
  testings: [
    { id: 201, title: 'Аттестация по продукту (1 кв. 2026)', score: 95, maxScore: 100, status: 'Сдан', date: '05/04/2026' },
    { id: 202, title: 'Промежуточный тест: Управление', score: null, maxScore: 50, status: 'Назначен', date: '30/04/2026' },
  ],
  certificates: [
    { id: 301, title: 'Сертифицированный B2B Эксперт', issueDate: '15/03/2026' }
  ]
};

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'courses' | 'testings' | 'certificates'>('courses');
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  // In a real app, you would fetch user data using params.id
  const user = mockUser; 

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] pb-12">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 lg:px-8 py-4 max-w-[1800px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-neutral-900 leading-tight">Профиль пользователя</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="primary" className="flex items-center gap-2 font-medium shadow-sm">
              <Edit3 className="w-4 h-4" /> Редактировать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: User Info */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex flex-col items-center text-center border-b border-neutral-100 pb-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-neutral-100 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-neutral-700 mb-4">
                  {user.initials}
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">{user.name}</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-neutral-500 font-medium">Email</span>
                    <span className="text-[14px] text-neutral-900">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-neutral-500 font-medium">Дата рождения</span>
                    <span className="text-[14px] text-neutral-900">{user.birthDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-neutral-500 font-medium">Телефон</span>
                    <span className="text-[14px] text-neutral-900">{user.phone}</span>
                  </div>
                </div>
              </div>

              {user.customFields && user.customFields.length > 0 && (
                <>
                  <div className="h-px bg-neutral-100 my-6" />
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Дополнительная информация</h4>
                    {user.customFields.map((field, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[12px] text-neutral-500 font-medium">{field.label}</span>
                        <span className="text-[14px] text-neutral-900">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Content Tabs */}
          <div className="xl:col-span-8 flex flex-col">
            
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.courses.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Курсов назначено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">1</span>
                <span className="text-[12px] font-medium text-neutral-500">Завершено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.testings.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Тестов пройдено</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[20px] font-bold text-neutral-900">{user.certificates.length}</span>
                <span className="text-[12px] font-medium text-neutral-500">Сертификатов</span>
              </div>
            </div>

            <div className="flex items-end justify-between border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-3 text-[14px] font-semibold transition-all border-b-2 ${
                    activeTab === 'courses' 
                      ? 'border-[var(--color-admin-primary-500)] text-[var(--color-admin-primary-600)]' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  Курсы
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Тестирования
                </button>
                <button 
                  disabled
                  className="px-4 py-3 text-[14px] font-semibold transition-all border-b-2 border-transparent text-neutral-400 opacity-60 cursor-not-allowed"
                >
                  Сертификаты
                </button>
              </div>
              
              {activeTab === 'courses' && (
                <div className="pb-2">
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold">Назначить курс</Button>
                </div>
              )}
              {activeTab === 'testings' && (
                <div className="pb-2">
                  <Button variant="primary" className="h-9 px-4 text-[13px] font-semibold">Назначить тест</Button>
                </div>
              )}
            </div>

            {/* Courses List */}
            {activeTab === 'courses' && (
              <div className="flex flex-col gap-4">
                {user.courses.map(course => (
                  <div key={course.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 transition-all group flex flex-col">
                    <div 
                      className="p-5 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer"
                      onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6 text-neutral-500" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h4 className="text-[15px] font-bold text-neutral-900 truncate mb-1">{course.title}</h4>
                        <div className="flex items-center gap-4 text-[13px] text-neutral-500 font-medium">
                          {course.status === 'Завершен' ? (
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Завершен: 15.03.2026 10:00</span>
                          ) : (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Последняя активность: 14.03.2026 14:30</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:w-48 flex flex-col gap-2 shrink-0">
                        <div className="flex items-center justify-between text-[12px] font-semibold">
                          <span className={course.status === 'Завершен' ? 'text-emerald-600' : 'text-neutral-700'}>
                            {course.status}
                          </span>
                          <span className="text-neutral-900">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-[var(--color-admin-primary-500,bg-neutral-800)]'}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {expandedCourseId === course.id && (
                      <div className="border-t border-neutral-100 p-6 bg-neutral-50/50">
                        
                        {/* Progress and Activity Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                           <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Прогресс</span>
                              <span className="text-[32px] font-bold text-emerald-500 leading-none">{course.progress}%</span>
                           </div>
                           <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Активность</span>
                              <div className="flex flex-col gap-0.5 text-[13px] text-neutral-500 font-medium mb-auto">
                                 <span>Назначен: {course.date}</span>
                                 <span>Посл. акт: 15.03.2026</span>
                              </div>
                              <div className="mt-3 inline-flex items-center w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded">
                                 Завершен 15.03.2026 10:00
                              </div>
                           </div>
                        </div>

                        <h5 className="text-[15px] font-bold text-neutral-900 mb-5">Прохождение модулей и уроков</h5>
                        
                        <div className="flex flex-col gap-6">
                          {/* Module 1 */}
                          <div className="flex flex-col relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-[14px] font-medium text-neutral-900">1. Введение в корпоративную безопасность</span>
                              </div>
                              <span className="text-[13px] text-neutral-500">15.03.2026</span>
                            </div>
                            
                            {/* Inner lessons */}
                            <div className="flex flex-col gap-3 pl-[11px] ml-2.5 border-l border-emerald-200/60 pb-2">
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <span className="text-[13px] text-neutral-700">1.1 Что такое корпоративная безопасность</span>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Пройден (14.03.2026 12:15)</span>
                              </div>
                              
                              <div className="ml-4 p-4 bg-white border border-neutral-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] max-w-[400px]">
                                <div className="flex items-center gap-1 mb-2 text-amber-400 text-[14px]">
                                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                  <span className="text-[12px] text-neutral-500 ml-2 font-medium">5/5</span>
                                </div>
                                <p className="text-[13px] text-neutral-500 italic">"Отличное введение, всё кратко и по делу!"</p>
                              </div>

                              <div className="flex items-center justify-between pl-4 relative mt-1">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <div className="flex flex-col">
                                  <span className="text-[13px] text-neutral-700">1.2 Тест: Основные понятия</span>
                                  <span className="text-[12px] text-emerald-600 font-medium">Оценка: 100/100 (Сдан)</span>
                                </div>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Пройден (15.03.2026 10:00)</span>
                              </div>
                            </div>
                          </div>

                          {/* Module 2 */}
                          <div className="flex flex-col relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-[14px] font-medium text-neutral-900">2. Защита информации</span>
                              </div>
                              <span className="text-[13px] text-neutral-500">В процессе</span>
                            </div>
                            
                            {/* Inner lessons */}
                            <div className="flex flex-col gap-4 pl-[11px] ml-2.5 border-l border-amber-200/60">
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-emerald-500" />
                                <span className="text-[13px] text-neutral-700">2.1 Методы защиты данных</span>
                                <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Пройден (16.03.2026 11:30)</span>
                              </div>
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-neutral-300" />
                                <span className="text-[13px] text-neutral-700">2.2 Шифрование и VPN</span>
                                <span className="text-[12px] font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">Не начат</span>
                              </div>
                              <div className="flex items-center justify-between pl-4 relative">
                                <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-rose-500" />
                                <div className="flex flex-col">
                                  <span className="text-[13px] text-neutral-700">2.3 Тест: Защита данных</span>
                                  <span className="text-[12px] text-rose-600 font-medium">Оценка: 40/100 (Провален)</span>
                                </div>
                                <span className="text-[12px] font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">Не сдан (17.03.2026 14:15)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-neutral-200/60">
                           <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-4 rounded-xl text-[13px] font-medium shadow-none">Открепить курс</Button>
                           <Button className="h-9 px-4 rounded-xl text-[13px] font-medium bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm text-neutral-700">Подробнее о курсе</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Testings List */}
            {activeTab === 'testings' && (
              <div className="flex flex-col gap-4">
                {user.testings.map(test => (
                  <div key={test.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-indigo-200 transition-all group flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      test.status === 'Сдан' ? 'bg-emerald-50' : 'bg-indigo-50'
                    }`}>
                      {test.status === 'Сдан' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <h4 className="text-[15px] font-bold text-neutral-900 truncate mb-1">{test.title}</h4>
                      <div className="flex items-center gap-4 text-[13px] text-neutral-500 font-medium">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.status === 'Сдан' ? 'Сдан: ' : 'Дедлайн: '} {test.date}</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-32 flex flex-col shrink-0 items-start sm:items-end">
                      {test.score !== null ? (
                        <>
                          <div className="text-[20px] font-bold text-emerald-600 leading-none mb-1">
                            {test.score} <span className="text-[14px] text-neutral-400 font-medium">/ {test.maxScore}</span>
                          </div>
                          <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Пройден успешно</span>
                        </>
                      ) : (
                        <Button variant="outline" className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm flex items-center justify-center gap-2">
                          <PlayCircle className="w-4 h-4" /> Напомнить
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certificates List */}
            {activeTab === 'certificates' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.certificates.map(cert => (
                  <div key={cert.id} className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[14px] font-bold text-neutral-900 leading-snug line-clamp-2">{cert.title}</h4>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-50">
                      <span className="text-[12px] text-neutral-500 font-medium">{cert.issueDate}</span>
                      <button className="text-[13px] font-medium text-[var(--color-admin-primary-600)] hover:text-[var(--color-admin-primary-700)] transition-colors">
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
