const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove 'Закрытый' and update SRV-724
content = content.replace(
  /id: 'SRV-724', title: 'Регистрация на вебинар', lang: 'UZB', status: 'Draft', type: 'Закрытый',/g,
  "id: 'SRV-724', title: 'Регистрация на вебинар', lang: 'UZB', status: 'Draft', type: 'Открытый',"
);

// Remove 'Закрытый' from icon rendering logic (there are multiple places, let's replace them carefully)
content = content.replace(
  /course\.type === 'Закрытый' \? 'bg-neutral-100 text-neutral-500' :/g,
  ''
);
content = content.replace(
  /course\.type === 'Закрытый' \? <Lock className="w-4 h-4" \/> :/g,
  ''
);
content = content.replace(
  /\{course\.type === 'Закрытый' && <div className="text-neutral-400">Доступ только по ссылке<\/div>\}/g,
  ''
);

// 2. Update filters UI
// The current code for tabs:
const oldTabs = `<div className="flex gap-2">
            {[
              { id: 'all', label: 'Все' },
              { id: 'active', label: 'Активные' },
              { id: 'draft', label: 'Черновики' },
              { id: 'closed', label: 'Завершенные' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={\`px-4 py-1.5 rounded-full text-sm font-medium transition-all \${
                  statusFilter === tab.id 
                    ? 'bg-neutral-900 text-white shadow-sm' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }\`}
              >
                {tab.label}
              </button>
            ))}
          </div>`;

const newTabs = `<div className="flex gap-2">
            <Button variant="outline" className="h-9 gap-2 bg-white shadow-sm border-neutral-200 rounded-xl px-4 text-sm font-medium text-neutral-700">
              <Filter className="w-4 h-4 text-neutral-500" />
              Фильтры
            </Button>
          </div>`;

content = content.replace(oldTabs, newTabs);

// 3. Fix DnD: Change closestCorners to closestCenter, and import it
content = content.replace(
  /import \{ DndContext, DragOverlay, closestCorners,/g,
  "import { DndContext, DragOverlay, closestCenter,"
);

content = content.replace(
  /collisionDetection=\{closestCorners\}/g,
  "collisionDetection={closestCenter}"
);

fs.writeFileSync(file, content, 'utf8');
