const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change Filters UI
const oldTabsRegex = /<div className="flex gap-2">\s*\{\[\s*\{ id: 'all', label: 'Все' \},\s*\{ id: 'active', label: 'Активные' \},\s*\{ id: 'draft', label: 'Черновики' \},\s*\{ id: 'closed', label: 'Завершенные' \}\s*\].map\(tab => \(\s*<button[\s\S]*?<\/button>\s*\)\)\}\s*<\/div>/;

const newTabs = `<div className="flex gap-2">
            <Button variant="outline" className="h-9 gap-2 bg-white shadow-sm border-neutral-200 rounded-xl px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4 text-neutral-500" />
              Фильтры
            </Button>
          </div>`;

content = content.replace(oldTabsRegex, newTabs);

// 2. Change closestCenter to pointerWithin
content = content.replace(
  /import \{ DndContext, DragOverlay, closestCenter,/g,
  "import { DndContext, DragOverlay, pointerWithin,"
);

content = content.replace(
  /collisionDetection=\{closestCenter\}/g,
  "collisionDetection={pointerWithin}"
);

fs.writeFileSync(file, content, 'utf8');
