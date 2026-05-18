const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the icon div with a tooltip wrapped version
const oldIconDiv = `<div className={\`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center \${
              course.type === 'Открытый' ? 'bg-emerald-50 text-emerald-600' :
              course.type === 'Закрытый' ? 'bg-neutral-100 text-neutral-500' :
              course.type === 'По расписанию' ? 'bg-blue-50 text-blue-600' :
              'bg-orange-50 text-orange-600'
            }\`}>
             {course.type === 'Открытый' ? <Unlock className="w-4 h-4" /> :
              course.type === 'Закрытый' ? <Lock className="w-4 h-4" /> :
              course.type === 'По расписанию' ? <CalendarDays className="w-4 h-4" /> :
              <Clock className="w-4 h-4" />}
          </div>`;

const newIconDiv = `<div className="relative group/tooltip flex items-center justify-center shrink-0">
            <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${
                course.type === 'Открытый' ? 'bg-emerald-50 text-emerald-600' :
                course.type === 'Закрытый' ? 'bg-neutral-100 text-neutral-500' :
                course.type === 'По расписанию' ? 'bg-blue-50 text-blue-600' :
                'bg-orange-50 text-orange-600'
              }\`}>
               {course.type === 'Открытый' ? <Unlock className="w-4 h-4" /> :
                course.type === 'Закрытый' ? <Lock className="w-4 h-4" /> :
                course.type === 'По расписанию' ? <CalendarDays className="w-4 h-4" /> :
                <Clock className="w-4 h-4" />}
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-50 flex flex-col items-center origin-bottom scale-95 group-hover/tooltip:scale-100">
              <div className="bg-[#1A1A1A] text-white text-[11px] leading-tight rounded-lg py-2 px-3 whitespace-nowrap shadow-xl border border-white/10">
                <div className="font-bold mb-1">{course.type}</div>
                {course.type === 'По расписанию' && <div className="text-neutral-400">Откроется: 25 апр 2026, 09:00</div>}
                {course.type === 'Ограниченное время' && <div className="text-neutral-400">Доступен до: 30 апр 2026</div>}
                {course.type === 'Открытый' && <div className="text-neutral-400">Доступен всем без ограничений</div>}
                {course.type === 'Закрытый' && <div className="text-neutral-400">Доступ только по ссылке</div>}
              </div>
              <div className="w-2 h-2 bg-[#1A1A1A] rotate-45 -mt-1 border-b border-r border-white/10" />
            </div>
          </div>`;

// In JS, escape backslashes when using replace with strings if there's any regex, but we can do a simple split/join to avoid regex escaping issues.
content = content.split(oldIconDiv).join(newIconDiv);

fs.writeFileSync(file, content, 'utf8');
