const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Headers
content = content.replace(
  /<div className="col-span-4">Курс<\/div>[\s\S]*?<div className="col-span-1"><\/div>/,
  `<div className="col-span-5">Опрос</div>
                          <div className="col-span-2">Статус</div>
                          <div className="col-span-2 text-right">Ответов</div>
                          <div className="col-span-2 text-right pr-6">Создан</div>
                          <div className="col-span-1"></div>`
);

// 2. Fix Grid Tabs layout
content = content.replace(
  /<div className="flex flex-col sm:flex-row gap-4 mb-6">/,
  '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">'
);

// 3. Fix MarqueeText
content = content.replace(
  /<MarqueeText text=\{course\.title\} className="font-bold text-neutral-900 hover:text-\[var\(--color-admin-primary-600\)\] transition-colors" \/>/g,
  '<MarqueeText text={course.title} className="font-bold text-neutral-900 hover:text-[var(--color-admin-primary-600)] transition-colors max-w-full" />'
);

// 4. Update Badge Color for Closed
content = content.replace(
  /bg-neutral-50 text-neutral-500 border border-neutral-200/g,
  'bg-rose-50 text-rose-600 border border-rose-200'
);

// 5. Replace texts
content = content.replace(/Новый обучающий материал/g, 'Новая форма или опрос');
content = content.replace(/Удалить курс\?/g, 'Удалить опрос?');
content = content.replace(/Вы действительно хотите безвозвратно удалить курс/g, 'Вы действительно хотите безвозвратно удалить опрос');
content = content.replace(/Переместить курс/g, 'Переместить опрос');
content = content.replace(/Дублирование курса/g, 'Дублирование опроса');
content = content.replace(/Новое название курса/g, 'Новое название опроса');
content = content.replace(/Название курса/g, 'Название опроса');
content = content.replace(/Описание курса/g, 'Описание опроса');
content = content.replace(/Язык курса/g, 'Язык опроса');
content = content.replace(/Доступ к курсу/g, 'Доступ к опросу');

// 6. Col-span updates in SortableCourseCard (List View)
content = content.replace(/<div className="col-span-4 flex items-center gap-4 overflow-hidden pr-4">/, '<div className="col-span-5 flex items-center gap-4 overflow-hidden pr-4">');

// We also replaced `course.lang` `course.users` etc with `Ответов` and `Создан` earlier.
// Wait, I replaced them with a block in fix.js earlier, but let's make sure the col-spans match the header (5, 2, 2, 2, 1).
// Let's re-rewrite the list view columns if needed.
content = content.replace(
  /<div className="col-span-3 flex flex-wrap gap-2 items-center">/,
  '<div className="col-span-2 flex flex-wrap gap-2 items-center">'
);

fs.writeFileSync(file, content, 'utf8');
