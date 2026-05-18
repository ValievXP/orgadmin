const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Rename occurrences of Course/Курс to Survey/Опрос
content = content.replace(/Курсы/g, 'Опросы');
content = content.replace(/Создать курс/g, 'Создать опрос');
content = content.replace(/курсов<\/p>/g, 'опросов</p>');

// Remove grid view toggles and make viewMode fixed to 'list'
content = content.replace(/const \[viewMode, setViewMode\] = useState<'grid' \| 'list'>\('grid'\);/g, "const viewMode = 'list';");
content = content.replace(/<div className="flex items-center border border-neutral-200 rounded-lg bg-white p-0\.5 shadow-sm h-9">[\s\S]*?<\/div>\s*<Button variant="outline" size="sm" className="h-9 gap-2 bg-white shadow-sm border-neutral-200">\s*<Filter className="w-4 h-4 text-neutral-500" \/>\s*Фильтры\s*<\/Button>/g, "");

// Tabs for filters
const tabsCode = `<div className="flex gap-2">
            {[
              { id: 'all', label: 'Все' },
              { id: 'active', label: 'Активные' },
              { id: 'draft', label: 'Черновики' },
              { id: 'closed', label: 'Завершенные' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {}} 
                className={\`px-4 py-2 rounded-xl text-[13px] font-medium transition-all \${
                  'all' === tab.id
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }\`}
              >
                {tab.label}
              </button>
            ))}
          </div>`;

content = content.replace(/<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">/g, '<div className="flex flex-col sm:flex-row gap-4 mb-6">');
content = content.replace(/<div className="flex items-center gap-3 w-full sm:w-auto">/g, tabsCode);

// Table Headers and row data
content = content.replace(/<div className="col-span-2 hidden md:flex items-center gap-2 text-neutral-500">.*?<\/div>/g, '');
content = content.replace(/<div className="col-span-3 hidden md:flex items-center gap-6 text-neutral-500">[\s\S]*?<\/div>/g, 
  '<div className="col-span-2 hidden md:flex items-center gap-2 text-neutral-500"><Users className="w-4 h-4" /><span className="text-[13px] font-medium">{course.users} ответов</span></div><div className="col-span-2 flex flex-col text-[12px] text-neutral-500"><span className="text-neutral-900 font-medium">12.05.2026</span><span className="text-neutral-400">14:30</span></div>');

// Remove list/grid conditionals that wrap the list view
// Actually, since we set viewMode = 'list', React will just render the list view block and skip the grid view block.

// Update row click
content = content.replace(/router\?\.push\(\`\/courses\/\$\{course\.id\}\`\)/g, "router?.push(`/surveys/${course.id}?tab=preview`)");

// Update action menu to only edit
content = content.replace(/onMenuClick\?\.\('edit', course\.id\)/g, "router?.push(`/surveys/${course.id}?tab=editor`)");

// Remove Square Cover from List View
content = content.replace(/<div className=\{`w-10 h-10 rounded-lg shrink-0 \$\{course\.cover\}`\}><\/div>/g, '');

// Fix folder dragging sizing bug
content = content.replace(/opacity-40 scale-\[0\.98\] shadow-inner/g, 'opacity-50 shadow-md');

fs.writeFileSync(file, content, 'utf8');
