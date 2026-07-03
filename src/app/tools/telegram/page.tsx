"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  Send, 
  Trash2, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  Bot, 
  Info, 
  AppWindow,
  Link as LinkIcon,
  Copy
} from 'lucide-react';

export default function TelegramToolPage() {
  const [botToken, setBotToken] = useState('');
  const [botName, setBotName] = useState('');
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [checkedBotName, setCheckedBotName] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  // Persist state to/from localStorage
  useEffect(() => {
    const savedBot = localStorage.getItem('osnova_telegram_bot');
    if (savedBot) {
      try {
        const parsed = JSON.parse(savedBot);
        if (parsed && parsed.connected) {
          setIsConnected(true);
          setBotName(parsed.botName || 'OsnovaPlatformBot');
          setBotToken(parsed.botToken || '');
        }
      } catch (e) {
        console.error('Error loading Telegram bot state:', e);
      }
    }
  }, []);

  // Simple token regex validation: e.g., 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
  const validateTokenFormat = (token: string) => {
    return /^\d+:[\w-]{35,}$/.test(token.trim());
  };

  const handleCheckToken = () => {
    setTokenError('');
    setCheckedBotName('');

    if (!botToken.trim()) {
      setTokenError('Пожалуйста, введите токен');
      return;
    }

    if (!validateTokenFormat(botToken)) {
      setTokenError('Неверный формат токена. Пример: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
      return;
    }

    setIsCheckingToken(true);

    // Simulate validation request to BotFather / API
    setTimeout(() => {
      setIsCheckingToken(false);
      // Generate a mock bot name based on token or default
      const mockName = 'OsnovaPlatformBot';
      setCheckedBotName(mockName);
    }, 1200);
  };

  const handleConnect = () => {
    if (!checkedBotName) return;

    const botState = {
      connected: true,
      botName: checkedBotName,
      botToken: botToken.trim()
    };

    localStorage.setItem('osnova_telegram_bot', JSON.stringify(botState));
    setIsConnected(true);
    setBotName(checkedBotName);
    setCheckedBotName('');
  };

  const handleDisconnect = () => {
    localStorage.removeItem('osnova_telegram_bot');
    setIsConnected(false);
    setBotName('');
    setBotToken('');
    setCheckedBotName('');
    setTokenError('');
    setShowDisconnectModal(false);
  };

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F4F5F7] dark:bg-[var(--bg-app)] overflow-x-hidden relative">
      <div className="bg-white">
        <PageHeader 
          title="Telegram бот"
          breadcrumbs={[
            { label: 'Инструменты', href: '/tools' },
            { label: 'Telegram бот' }
          ]}
          backHref="/tools"
        />
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-32 gap-6">
        
        {/* Connection status card */}
        {isConnected ? (
          <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-900 text-[15px]">Бот успешно привязан</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    <Check className="w-3 h-3" /> Активен
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 mt-1">
                  Платформа подключена к Telegram-боту{' '}
                  <a 
                    href={`https://t.me/${botName}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-bold text-sky-600 hover:text-sky-700 underline inline-flex items-center gap-0.5"
                  >
                    @{botName} <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDisconnectModal(true)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 shrink-0 self-start md:self-center h-10 font-semibold text-xs rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Отвязать бота
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-[15px]">Подключение Telegram бота</h3>
                <p className="text-xs text-neutral-500">Укажите токен вашего бота для интеграции с платформой</p>
              </div>
            </div>

            {/* Instruction creation step-by-step */}
            <div className="bg-neutral-50 rounded-xl p-5 mb-6 border border-neutral-100">
              <h4 className="font-bold text-neutral-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-4 h-4 text-sky-500" /> Инструкция по созданию бота:
              </h4>
              <ol className="text-xs text-neutral-600 space-y-2.5 list-decimal pl-4 leading-relaxed font-medium">
                <li>Перейдите в <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline inline-flex items-center gap-0.5 font-bold">@BotFather <ExternalLink className="w-2.5 h-2.5" /></a> в Telegram.</li>
                <li>Отправьте команду <code className="bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">/newbot</code> и следуйте инструкциям для выбора имени и юзернейма бота.</li>
                <li>Скопируйте полученный API токен (выглядит как <code className="bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono">123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</code>).</li>
                <li>Вставьте его в поле ниже для автоматической проверки.</li>
              </ol>
            </div>

            {/* Token entry */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">API Токен бота</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={botToken}
                      onChange={(e) => {
                        setBotToken(e.target.value);
                        if (tokenError) setTokenError('');
                        if (checkedBotName) setCheckedBotName('');
                      }}
                      className="w-full bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-800 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-100)] focus:border-[var(--color-admin-primary-500)] transition-all shadow-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCheckToken}
                    disabled={isCheckingToken || !botToken}
                    className="h-10 sm:h-11 font-bold text-xs rounded-xl px-5 shrink-0"
                  >
                    {isCheckingToken ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Проверка...
                      </>
                    ) : (
                      'Проверить токен'
                    )}
                  </Button>
                </div>
                {tokenError && (
                  <p className="text-xs text-rose-500 font-semibold mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {tokenError}
                  </p>
                )}
              </div>

              {/* Show check result */}
              {checkedBotName && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-250">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Бот найден:</p>
                      <p className="text-xs font-bold text-sky-800">@{checkedBotName}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleConnect}
                    className="h-9 font-bold text-xs rounded-lg px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Привязать
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mini App creation instructions - visible to connected status too, or always */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-[15px]">Инструкция по созданию Mini App</h3>
              <p className="text-xs text-neutral-500">Настройте Mini App в Telegram для быстрого входа студентов в личный кабинет</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-3">1</span>
                <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                  В <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-2.5 h-2.5" /></a> введите команду <code className="bg-neutral-200 text-neutral-800 px-1 py-0.5 rounded font-mono font-bold">/newapp</code>.
                </p>
              </div>

              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-3">2</span>
                <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                  Выберите вашего привязанного бота из списка.
                </p>
              </div>

              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-3">3</span>
                <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                  Введите название и описание для вашего Mini App.
                </p>
              </div>

              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-3">4</span>
                <p className="text-xs text-neutral-700 font-semibold leading-relaxed">
                  Загрузите демонстрационную иконку (размер 640x360 px).
                </p>
              </div>
            </div>

            <div className="border border-neutral-100 rounded-xl p-4 bg-violet-50/30 border-l-4 border-l-violet-500 space-y-3">
              <div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">5</span>
                <p className="text-xs text-neutral-750 font-semibold leading-relaxed">
                  В качестве <strong>Web App URL</strong> укажите URL платформы (нажмите для копирования):
                </p>
                <div className="mt-1.5 flex items-center gap-2 bg-white border border-neutral-200 hover:border-violet-300 rounded-lg p-2.5 cursor-pointer select-none transition-all group/copy relative"
                  onClick={() => {
                    navigator.clipboard.writeText("https://[slug].osnovaedu.uz");
                    showToast("Ссылка скопирована");
                  }}
                >
                  <code className="text-xs text-violet-700 font-mono font-bold break-all flex-1">
                    https://[slug].osnovaedu.uz
                  </code>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider group-hover/copy:text-violet-600 transition-colors flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Копировать
                  </div>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">6</span>
                <p className="text-xs text-neutral-750 font-semibold leading-relaxed">
                  Задайте короткое имя (short name) для ссылки запуска.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setShowDisconnectModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-5">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Отвязать Telegram-бота?</h3>
            
            <p className="text-[13px] text-neutral-500 leading-relaxed mb-6">
              Вы действительно хотите отвязать Telegram-бота? Отправка уведомлений и запуск Mini App будут приостановлены.
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDisconnectModal(false)}
                className="w-full h-11 font-bold text-xs rounded-xl border-neutral-200 hover:bg-neutral-50"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleDisconnect}
                className="w-full h-11 font-bold text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Отвязать
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-[200] bg-neutral-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
