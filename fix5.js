const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newMockData = `const INITIAL_FOLDERS = [
  { id: 'f1', title: 'HR Опросы', coursesCount: 4, parentId: null, colorId: 'blue' },
  { id: 'f2', title: 'Фидбек от клиентов', coursesCount: 12, parentId: null, colorId: 'purple' },
  { id: 'f3', title: 'Секретные опросы', coursesCount: 2, parentId: 'f1', colorId: 'yellow' },
];

const INITIAL_SURVEYS = [
  { 
    id: 'SRV-821', title: 'Опрос удовлетворенности сотрудников', lang: 'RUS', status: 'Active', type: 'Открытый',
    users: 142, parentId: null
  },
  { 
    id: 'SRV-724', title: 'Регистрация на вебинар', lang: 'UZB', status: 'Draft', type: 'Закрытый',
    users: 0, parentId: null
  },
  { 
    id: 'SRV-612', title: 'Оценка качества обучения', lang: 'RUS', status: 'Active', type: 'По расписанию',
    users: 89, parentId: null
  },
  { 
    id: 'SRV-509', title: 'Сбор заявок на парковку', lang: 'RUS', status: 'Closed', type: 'Ограниченное время',
    users: 512, parentId: null
  },
  { 
    id: 'SRV-990', title: 'Анкета предзаписи на новый курс', lang: 'RUS', status: 'Active', type: 'Открытый',
    users: 1240, parentId: 'f1'
  },
];`;

content = content.replace(/const INITIAL_FOLDERS = [\s\S]*?\];\s*const INITIAL_COURSES = [\s\S]*?\];/, newMockData);

content = content.replace(/INITIAL_COURSES/g, 'INITIAL_SURVEYS');

// Fix headers
content = content.replace(
  /<div className="col-span-5">Опрос<\/div>[\s\S]*?<div className="col-span-1"><\/div>/,
  `<div className="col-span-4">Опрос</div>
                          <div className="col-span-2">Тип</div>
                          <div className="col-span-1">Язык</div>
                          <div className="col-span-1">Статус</div>
                          <div className="col-span-1 text-right">Ответов</div>
                          <div className="col-span-2 text-right pr-6">Создан</div>
                          <div className="col-span-1"></div>`
);

// Fix row contents
content = content.replace(
  /<div className="col-span-5 flex items-center gap-4 overflow-hidden pr-4">[\s\S]*?<div className="col-span-1 text-right relative" ref=\{menuRef\}>/g,
  `<div className="col-span-4 flex items-center gap-4 overflow-hidden pr-4">
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <MarqueeText text={course.title} className="font-bold text-neutral-900 hover:text-[var(--color-admin-primary-600)] transition-colors max-w-full" />
          </div>
        </div>
        <div className="col-span-2 text-neutral-600 font-medium text-[13px]">{course.type || 'Открытый'}</div>
        <div className="col-span-1 text-neutral-600 font-medium text-[13px]">{course.lang}</div>
        <div className="col-span-1 flex flex-wrap gap-2 items-center">
          <span className={\`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
            \${course.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
              course.status === 'Draft' ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}\`}>
            {course.status === 'Active' ? 'Активен' : course.status === 'Draft' ? 'Черновик' : 'Завершен'}
          </span>
        </div>
        <div className="col-span-1 text-right text-neutral-900 font-semibold text-[13px]">{course.users}</div>
        <div className="col-span-2 text-right pr-6 flex justify-end flex-col text-[12px]"><span className="text-neutral-900 font-medium leading-none mb-1">12.05.2026</span><span className="text-neutral-400 leading-none">14:30</span></div>
        <div className="col-span-1 text-right relative" ref={menuRef}>`
);

fs.writeFileSync(file, content, 'utf8');
