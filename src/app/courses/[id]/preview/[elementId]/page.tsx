"use client";
import React, { use, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  Users, CheckCircle2, XCircle, Clock, Video, FileText, 
  HelpCircle, Eye, ChevronLeft, BarChart, BookOpen, Download,
  PlayCircle, Award, ListChecks, ArrowRight, MousePointerClick, AlignLeft, AlertTriangle, Check
} from 'lucide-react';

function PreviewContent({ courseId, elementId }: { courseId: string, elementId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // Identify if it's a test by search param or elementId fallback
  const isTest = typeParam === 'test' || elementId.includes('test') || elementId.startsWith('t');

  const [questionLimit, setQuestionLimit] = useState<number | 'all'>(10);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleExportCSV = () => {
    setIsExportOpen(false);
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Параметр;Значение\n";
    csvContent += `Название;"${isTest ? 'Тест: Защита данных' : 'Урок: Методы защиты данных'}"\n`;
    csvContent += "Студентов прошло;1248\n";
    csvContent += `Успешность;${isTest ? '85%' : '1120 завершили'}\n`;
    csvContent += "Среднее время;12 мин\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${isTest ? 'test' : 'lesson'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLS = () => {
    setIsExportOpen(false);
    let htmlTable = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"/></head><body><table border="1">';
    htmlTable += '<tr><th style="background-color:#F2F2F2">Параметр</th><th style="background-color:#F2F2F2">Значение</th></tr>';
    htmlTable += `<tr><td>Название</td><td>${isTest ? 'Тест: Защита данных' : 'Урок: Методы защиты данных'}</td></tr>`;
    htmlTable += '<tr><td>Студентов прошло</td><td>1248</td></tr>';
    htmlTable += `<tr><td>Успешность</td><td>${isTest ? '85%' : '1120 завершили'}</td></tr>`;
    htmlTable += '<tr><td>Среднее время</td><td>12 мин</td></tr>';
    htmlTable += '</table></body></html>';
    
    const blob = new Blob([`\uFEFF${htmlTable}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${isTest ? 'test' : 'lesson'}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)]">
      {/* HEADER: fixed z-index to z-50 to prevent overlap */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 lg:px-8 py-4 max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-neutral-900 leading-tight flex items-center gap-2">
                {isTest ? 'Тест: Защита данных' : 'Урок: Методы защиты данных'}
                <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-md ml-2">Предпросмотр</span>
              </h1>
              <p className="text-[13px] text-neutral-500">
                Курс: Введение в корпоративную безопасность
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-[200] animate-in fade-in slide-in-from-top-1 duration-150">
                  <button 
                    onClick={handleExportXLS}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Скачать Excel (.xls)</span>
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Скачать CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>
            <Button 
              onClick={() => router.push(`/courses/${courseId}/${isTest ? 'test' : 'lesson'}/${elementId}`)}
              variant="primary" 
              className="h-9 px-4 font-medium text-[13px] shadow-sm"
            >
              Редактировать
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        
        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-neutral-400" />
            Статистика элемента
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full" />
              <Users className="w-5 h-5 text-blue-500 mb-3 relative z-10" />
              <span className="text-2xl font-bold text-neutral-900 relative z-10">1,248</span>
              <span className="text-[12px] font-medium text-neutral-500 mt-1 relative z-10">Студентов прошло</span>
            </div>
            
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full" />
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3 relative z-10" />
              <span className="text-2xl font-bold text-neutral-900 relative z-10">{isTest ? '85%' : '1,120'}</span>
              <span className="text-[12px] font-medium text-neutral-500 mt-1 relative z-10">{isTest ? 'Успешных сдач' : 'Завершили урок'}</span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-50 rounded-full" />
              <XCircle className="w-5 h-5 text-rose-500 mb-3 relative z-10" />
              <span className="text-2xl font-bold text-neutral-900 relative z-10">{isTest ? '15%' : '128'}</span>
              <span className="text-[12px] font-medium text-neutral-500 mt-1 relative z-10">{isTest ? 'Неуспешных сдач' : 'Бросили на уроке'}</span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full" />
              <Clock className="w-5 h-5 text-amber-500 mb-3 relative z-10" />
              <span className="text-2xl font-bold text-neutral-900 relative z-10">{isTest ? '12 мин' : '8 мин'}</span>
              <span className="text-[12px] font-medium text-neutral-500 mt-1 relative z-10">Среднее время</span>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div>
          <h2 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-400" />
            Предпросмотр контента
          </h2>
          
          <div className={`border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px] relative ${isTest ? 'bg-neutral-50/80' : 'bg-white'}`}>
            {isTest ? (
              // ─── TEST UI ─────────────────────────────────────────────────────────
              <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-neutral-200 shadow-sm flex justify-center z-10 relative">
                  <div className="p-6 flex items-center justify-between w-full max-w-[900px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <ListChecks className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-neutral-900 leading-tight">Тест: Итоговая проверка</h1>
                        <div className="flex items-center gap-4 mt-1.5 text-[13px] text-neutral-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 45 минут</span>
                          <span className="flex items-center gap-1.5"><ListChecks className="w-4 h-4" /> 3 попытки</span>
                          <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Проходной балл: 80%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[13px] font-medium text-neutral-500">Показывать по:</span>
                      <select 
                        value={questionLimit}
                        onChange={(e) => setQuestionLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="h-9 px-3 border border-neutral-200 rounded-lg text-[13px] font-medium text-neutral-700 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                      >
                        <option value={10}>10 вопросов</option>
                        <option value={20}>20 вопросов</option>
                        <option value={50}>50 вопросов</option>
                        <option value="all">Все</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 lg:p-12 max-w-[900px] mx-auto w-full">
                  <div className="space-y-8">
                    {Array.from({ length: 20 })
                      .slice(0, questionLimit === 'all' ? 20 : questionLimit)
                      .map((_, i) => {
                      const type = ['single', 'multiple', 'matching', 'ordering', 'true_false'][i % 5];
                      return (
                        <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                          
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-lg text-[14px] font-bold bg-neutral-100 text-neutral-500">
                                {i + 1}
                              </span>
                              <span className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">Вопрос {i + 1}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-500" />
                              1 балл
                            </span>
                          </div>
                          
                          <h3 className="text-[17px] font-semibold text-neutral-900 mb-6 leading-relaxed">
                            {type === 'single' && 'Выберите основной метод криптографической защиты данных, который чаще всего используется в протоколах HTTPS.'}
                            {type === 'multiple' && 'Отметьте все правильные утверждения о безопасности корпоративных паролей согласно политике ISO 27001.'}
                            {type === 'matching' && 'Сопоставьте тип угрозы с её корректным определением из базы знаний ИБ.'}
                            {type === 'ordering' && 'Расставьте этапы реагирования на инцидент информационной безопасности в правильном хронологическом порядке.'}
                            {type === 'true_false' && 'Верно ли утверждение: социальная инженерия всегда связана с техническим взломом систем?'}
                          </h3>
                          
                          <div className="space-y-3">
                            {type === 'single' && ['Симметричное шифрование', 'Асимметричное шифрование', 'Хеширование SHA-256', 'Экранирование кабелей'].map((ans, j) => {
                              const isCorrect = j === 1;
                              return (
                                <div key={j} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-neutral-200 bg-white'}`}>
                                  <div className="relative flex items-center justify-center w-5 h-5">
                                    <div className={`w-5 h-5 rounded-full border-2 ${isCorrect ? 'border-emerald-500' : 'border-neutral-300'}`} />
                                    {isCorrect && <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                  </div>
                                  <span className={`text-[15px] font-medium ${isCorrect ? 'text-emerald-900' : 'text-neutral-800'}`}>{ans}</span>
                                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </div>
                              );
                            })}

                            {type === 'multiple' && ['Пароль должен содержать спецсимволы и цифры', 'Лучший пароль — дата рождения сотрудника', 'Длина пароля важнее его энтропии', 'Пароль нужно менять каждые 90 дней'].map((ans, j) => {
                              const isCorrect = j === 0 || j === 2;
                              return (
                                <div key={j} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-neutral-200 bg-white'}`}>
                                  <div className="relative flex items-center justify-center w-5 h-5">
                                    <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center ${isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'}`}>
                                      {isCorrect && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                    </div>
                                  </div>
                                  <span className={`text-[15px] font-medium ${isCorrect ? 'text-emerald-900' : 'text-neutral-800'}`}>{ans}</span>
                                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </div>
                              );
                            })}

                            {type === 'matching' && [
                              { left: 'Phishing', right: 'Рассылка писем от имени банка' },
                              { left: 'DDoS', right: 'Перегрузка сервера запросами' },
                              { left: 'Ransomware', right: 'Шифрование данных и требование выкупа' }
                            ].map((pair, j) => (
                              <div key={j} className="flex items-center gap-4">
                                <div className="flex-1 p-4 border-2 border-emerald-500 rounded-xl text-[14px] font-medium text-emerald-900 bg-emerald-50/30 flex items-center justify-center text-center">
                                  {pair.left}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex-1 p-4 border-2 border-emerald-500 rounded-xl text-[14px] font-medium text-emerald-900 bg-emerald-50/30 flex items-center justify-between text-center relative overflow-hidden group">
                                  <div className="flex-1 text-center pr-8">{pair.right}</div>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 absolute right-4" />
                                </div>
                              </div>
                            ))}

                            {type === 'ordering' && ['Идентификация угрозы', 'Изоляция скомпрометированной системы', 'Устранение уязвимости (патчинг)', 'Восстановление данных из бэкапа'].map((step, j) => (
                              <div key={j} className="flex items-center gap-4 p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 transition-all">
                                <div className="p-1.5 text-emerald-600 bg-emerald-100 rounded-lg shrink-0">
                                  <AlignLeft className="w-5 h-5" />
                                </div>
                                <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[13px] font-bold text-emerald-700 shrink-0">
                                  {j + 1}
                                </span>
                                <span className="text-[15px] font-medium text-emerald-900 flex-1 pr-4">{step}</span>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
                              </div>
                            ))}

                            {type === 'true_false' && ['Абсолютно верно', 'В корне неверно'].map((ans, j) => {
                              const isCorrect = j === 0;
                              return (
                                <div key={j} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-neutral-200 bg-white'}`}>
                                  <div className="relative flex items-center justify-center w-5 h-5">
                                    <div className={`w-5 h-5 rounded-full border-2 ${isCorrect ? 'border-emerald-500' : 'border-neutral-300'}`} />
                                    {isCorrect && <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                  </div>
                                  <span className={`text-[15px] font-medium ${isCorrect ? 'text-emerald-900' : 'text-neutral-800'}`}>{ans}</span>
                                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // ─── LESSON UI ───────────────────────────────────────────────────────
              <div className="p-10 lg:p-14 max-w-[850px] mx-auto w-full flex-1">
                <div className="mb-10 pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Модуль 1</span>
                    <span className="text-[13px] font-medium text-neutral-400">Урок 1.2</span>
                  </div>
                  <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">
                    Комплексная защита данных
                  </h1>
                </div>
                
                <div className="space-y-10">
                  {/* Video Block */}
                  <div className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-lg">
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center z-10 cursor-pointer shadow-[0_0_0_8px_rgba(37,99,235,0.2)] group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-10 h-10 text-white ml-1" />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                      <span className="text-white font-medium text-[15px]">1. Основы криптографии.mp4</span>
                      <span className="text-white/80 font-medium text-[13px] bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md">14:20</span>
                    </div>
                  </div>
                  
                  {/* Text Block */}
                  <div className="prose prose-neutral max-w-none prose-p:text-[16px] prose-p:leading-relaxed prose-headings:text-neutral-900">
                    <p>
                      В современном мире информация стала одним из наиболее ценных ресурсов любой компании. 
                      Ее утечка, искажение или уничтожение могут привести к серьезным финансовым и репутационным потерям.
                      Именно поэтому комплексный подход к защите данных является обязательным условием для успешного ведения бизнеса.
                    </p>
                  </div>

                  {/* Info Callout */}
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl" />
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-blue-900">Совет от эксперта</h4>
                      <p className="text-[15px] text-blue-800/80 mt-1.5 leading-relaxed">
                        Никогда не записывайте пароли на стикерах и не приклеивайте их к монитору. Используйте корпоративные менеджеры паролей, такие как 1Password или Bitwarden. Внедрение 2FA (двухфакторной аутентификации) снижает риск взлома на 99%.
                      </p>
                    </div>
                  </div>

                  {/* Inline Single File Attachment */}
                  <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 transition-colors group cursor-pointer w-full max-w-md">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-[14px] font-bold text-neutral-900 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] leading-tight"
                        title="Политика_безопасности_2026.pdf"
                      >
                        Политика_безопасности_2026.pdf
                      </p>
                      <p className="text-[12px] text-neutral-500 font-medium mt-0.5">PDF Документ • 2.4 MB</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div 
                        className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Предпросмотр"
                        onClick={(e) => { e.stopPropagation(); alert('Предпросмотр файла: Политика_безопасности_2026.pdf'); }}
                      >
                        <Eye className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Скачать"
                        onClick={(e) => { e.stopPropagation(); alert('Скачивание файла: Политика_безопасности_2026.pdf'); }}
                      >
                        <Download className="w-4 h-4 text-neutral-600" />
                      </div>
                    </div>
                  </div>

                  {/* Text Block */}
                  <div className="prose prose-neutral max-w-none prose-p:text-[16px] prose-p:leading-relaxed prose-headings:text-neutral-900">
                    <h3>Основные методы защиты</h3>
                    <p>
                      Существует три основных направления, по которым должна выстраиваться оборона корпоративной сети:
                    </p>
                    <ul className="space-y-3 mt-4">
                      <li><strong>Организационные методы</strong>: создание регламентов, политик безопасности, регулярный инструктаж сотрудников и проведение фишинговых учений.</li>
                      <li><strong>Технические методы</strong>: использование современного антивирусного ПО, межсетевых экранов (firewalls), систем обнаружения вторжений (IDS).</li>
                      <li><strong>Криптографические методы</strong>: обязательное шифрование данных при передаче и хранении, использование SSL/TLS сертификатов.</li>
                    </ul>
                  </div>

                  {/* Interactive Exercise Mockup (Test UI style inside lesson) */}
                  <div className="bg-white border-2 border-indigo-50 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50" />
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <MousePointerClick className="w-4 h-4" />
                      </div>
                      <h4 className="text-[16px] font-bold text-neutral-900">Закрепление материала</h4>
                    </div>
                    
                    <p className="text-[16px] font-semibold text-neutral-800 mb-5">Какой тип шифрования использует один и тот же ключ для шифрования и расшифровки?</p>
                    
                    <div className="space-y-3">
                      {['Асимметричное', 'Симметричное', 'Квантовое', 'Хеширование'].map((ans, j) => (
                        <label key={j} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          ans === 'Симметричное' 
                            ? 'border-emerald-500 bg-emerald-50/30' 
                            : 'border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/10'
                        }`}>
                          <div className="relative flex items-center justify-center w-5 h-5">
                            <input type="radio" name="mini-exercise" className="peer sr-only" defaultChecked={ans === 'Симметричное'} />
                            <div className={`w-5 h-5 rounded-full border-2 transition-colors ${ans === 'Симметричное' ? 'border-emerald-500' : 'border-neutral-300'}`} />
                            <div className={`absolute w-2.5 h-2.5 rounded-full scale-0 transition-transform ${ans === 'Симметричное' ? 'bg-emerald-500 scale-100' : ''}`} />
                          </div>
                          <span className={`text-[15px] font-medium ${ans === 'Симметричное' ? 'text-emerald-900' : 'text-neutral-800'}`}>
                            {ans}
                          </span>
                          {ans === 'Симметричное' && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Warning Callout */}
                  <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-l-2xl" />
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-rose-900">Строгое предупреждение</h4>
                      <p className="text-[15px] text-rose-800/80 mt-1.5 leading-relaxed">
                        Несоблюдение политик информационной безопасности может повлечь за собой дисциплинарную ответственность вплоть до увольнения. Безопасность компании — дело каждого сотрудника.
                      </p>
                    </div>
                  </div>
                  
                  {/* Multiple Files Attachment at bottom */}
                  <div>
                    <h4 className="text-[15px] font-bold text-neutral-900 flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-neutral-400" />
                      Дополнительные материалы к уроку
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 hover:shadow transition-all group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-[14px] font-bold text-neutral-900 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] leading-tight"
                            title="Презентация_к_уроку.pptx"
                          >
                            Презентация_к_уроку.pptx
                          </p>
                          <p className="text-[12px] text-neutral-500 font-medium mt-0.5">PowerPoint • 15.1 MB</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div 
                            className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                            title="Предпросмотр"
                            onClick={(e) => { e.stopPropagation(); alert('Предпросмотр файла: Презентация_к_уроку.pptx'); }}
                          >
                            <Eye className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div 
                            className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                            title="Скачать"
                            onClick={(e) => { e.stopPropagation(); alert('Скачивание файла: Презентация_к_уроку.pptx'); }}
                          >
                            <Download className="w-4 h-4 text-neutral-600" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:border-neutral-300 hover:shadow transition-all group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-[14px] font-bold text-neutral-900 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] leading-tight"
                            title="Чек_лист_рабочего_места.xlsx"
                          >
                            Чек_лист_рабочего_места.xlsx
                          </p>
                          <p className="text-[12px] text-neutral-500 font-medium mt-0.5">Excel • 1.2 MB</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div 
                            className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                            title="Предпросмотр"
                            onClick={(e) => { e.stopPropagation(); alert('Предпросмотр файла: Чек_лист_рабочего_места.xlsx'); }}
                          >
                            <Eye className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div 
                            className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                            title="Скачать"
                            onClick={(e) => { e.stopPropagation(); alert('Скачивание файла: Чек_лист_рабочего_места.xlsx'); }}
                          >
                            <Download className="w-4 h-4 text-neutral-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ElementPreviewPage({ params }: { params: Promise<{ id: string, elementId: string }> }) {
  const { id: courseId, elementId } = use(params);
  
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-500">Загрузка предпросмотра...</div>}>
      <PreviewContent courseId={courseId} elementId={elementId} />
    </Suspense>
  );
}
