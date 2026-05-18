const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add icons to imports
content = content.replace(
  /import \{ Search, Filter, Plus, Users, BookOpen, MoreVertical, LayoutGrid, List, Folder, Globe, Layers, Edit3, Move, Trash2, Check \} from 'lucide-react';/,
  "import { Search, Filter, Plus, Users, BookOpen, MoreVertical, LayoutGrid, List, Folder, Globe, Layers, Edit3, Move, Trash2, Check, Unlock, Lock, CalendarDays, Clock } from 'lucide-react';"
);

// Update Header
content = content.replace(
  /<div className="col-span-4">Опрос<\/div>\s*<div className="col-span-2">Тип<\/div>\s*<div className="col-span-1">Язык<\/div>\s*<div className="col-span-1">Статус<\/div>/,
  `<div className="col-span-5">Опрос</div>
                          <div className="col-span-1">Язык</div>
                          <div className="col-span-2">Статус</div>`
);

// Update mapping to include index
content = content.replace(
  /visibleCourses\.map\(course => <SortableCourseCard key=\{course\.id\} course=\{course\} viewMode="list"/g,
  'visibleCourses.map((course, index) => <SortableCourseCard key={course.id} course={course} index={index} viewMode="list"'
);

// Update SortableCourseCard props
content = content.replace(
  /function SortableCourseCard\(\{ course, viewMode, onMenuClick, openMenuId, setOpenMenuId \}: \{ course: any, viewMode: 'grid' \| 'list', onMenuClick\?: \(action: 'edit' \| 'move' \| 'duplicate' \| 'delete', courseId: string\) => void, openMenuId\?: string \| null, setOpenMenuId\?: \(id: string \| null\) => void \}\) \{/,
  "function SortableCourseCard({ course, index = 0, viewMode, onMenuClick, openMenuId, setOpenMenuId }: { course: any, index?: number, viewMode: 'grid' | 'list', onMenuClick?: (action: 'edit' | 'move' | 'duplicate' | 'delete', courseId: string) => void, openMenuId?: string | null, setOpenMenuId?: (id: string | null) => void }) {"
);

// Update Row content
content = content.replace(
  /<div className="col-span-4 flex items-center gap-4 overflow-hidden pr-4">\s*<div className="flex flex-col min-w-0 flex-1 justify-center">\s*<MarqueeText text=\{course\.title\} className="font-bold text-neutral-900 hover:text-\[var\(--color-admin-primary-600\)\] transition-colors max-w-full" \/>\s*<\/div>\s*<\/div>\s*<div className="col-span-2 text-neutral-600 font-medium text-\[13px\]">\{course\.type \|\| 'Открытый'\}<\/div>\s*<div className="col-span-1 text-neutral-600 font-medium text-\[13px\]">\{course\.lang\}<\/div>\s*<div className="col-span-1 flex flex-wrap gap-2 items-center">/,
  `<div className="col-span-5 flex items-center gap-3 overflow-hidden pr-4">
          <div className="w-5 text-neutral-400 font-semibold text-[13px] text-center shrink-0">{index + 1}</div>
          <div className={\`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center \${
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
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <MarqueeText text={course.title} className="font-bold text-neutral-900 hover:text-[var(--color-admin-primary-600)] transition-colors max-w-full" />
          </div>
        </div>
        <div className="col-span-1 text-neutral-600 font-medium text-[13px]">{course.lang}</div>
        <div className="col-span-2 flex flex-wrap gap-2 items-center">`
);

fs.writeFileSync(file, content, 'utf8');
