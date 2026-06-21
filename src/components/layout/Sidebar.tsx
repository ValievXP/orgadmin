"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  Settings,
  LogOut,
  Moon,
  Globe,
  LayoutDashboard,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  UserCog,
  Wand2,
  Calendar
} from "lucide-react";

const navigation = [
  { name: "Курсы", href: "/courses", icon: GraduationCap },
  { name: "Тестирование", href: "/testing", icon: ClipboardCheck },
  { name: "Опросы", href: "/surveys", icon: ClipboardList },
  { name: "Мероприятия", href: "/events", icon: Calendar },
  { name: "Пользователи", href: "/users", icon: Users },
  { name: "Статистика", href: "/statistics", icon: BarChart3 },
  { name: "Команда", href: "/team", icon: UserCog },
  { name: "Инструменты", href: "/tools", icon: Wand2 },
  { name: "Настройки", href: "/settings", icon: Settings },
  { name: "User View", href: "/user-view", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<"RU" | "UZ">("RU");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Не закрываем меню при смене языка
    setLang(prev => prev === "RU" ? "UZ" : "RU");
  };

  return (
    <aside className="hidden md:flex w-64 bg-[var(--bg-surface)] border-r border-[var(--border-default)] flex-col h-full shrink-0">
      
      {/* Logo Zone */}
      <div className="p-4 pt-6 shrink-0 flex items-center">
        <img 
          src="https://my.osnovaedu.uz/assets/newLogo-db839e96.png" 
          alt="OSNOVA Logo" 
          className="max-w-[140px] max-h-[32px] object-contain ml-2" 
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href && item.href !== "#";
          return (
            <Link key={item.name} href={item.href} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? "bg-[var(--color-admin-primary-100)] text-[var(--text-strong)]" 
                : "text-[var(--text-default)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-strong)]"
            }`}>
              <item.icon className={`w-5 h-5 mr-3 shrink-0 text-[var(--text-subtle)]`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="relative p-4" ref={menuRef}>
        
        {/* Upward Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg rounded-xl overflow-hidden animate-slide-up origin-bottom z-50">
            
            <div 
              onClick={toggleLanguage}
              className="px-3 py-2.5 hover:bg-[var(--bg-surface-hover)] cursor-pointer flex items-center text-sm text-[var(--text-default)]"
            >
              <Globe className="w-4 h-4 mr-2 text-[var(--text-subtle)]" />
              Язык: <strong className="ml-1 text-[var(--text-strong)]">{lang}</strong>
            </div>
            
            <div className="px-3 py-2.5 hover:bg-[var(--bg-surface-hover)] cursor-pointer flex items-center text-sm text-[var(--text-default)]">
              <Moon className="w-4 h-4 mr-2 text-[var(--text-subtle)]" /> Тёмная тема
            </div>
            <div className="px-3 py-2.5 hover:bg-[var(--bg-surface-hover)] cursor-pointer flex items-center text-sm text-[var(--text-default)]">
              <Settings className="w-4 h-4 mr-2 text-[var(--text-subtle)]" /> Настройки
            </div>
            <div className="h-px bg-[var(--border-subtle)] my-1"></div>
            <div className="px-3 py-2.5 hover:bg-[var(--color-error-50)] text-[var(--color-error-600)] cursor-pointer flex items-center text-sm">
              <LogOut className="w-4 h-4 mr-2" /> Выйти
            </div>
          </div>
        )}

        {/* User Profile Button */}
        <div 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer select-none ${menuOpen ? 'bg-[var(--bg-surface-hover)]' : 'hover:bg-[var(--bg-surface-hover)]'}`}
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-admin-primary-100)] flex items-center justify-center text-[var(--text-strong)] font-semibold shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text-strong)] truncate">Администратор</div>
            <div className="text-xs text-[var(--text-subtle)] truncate">info@osnovaedu.uz</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
