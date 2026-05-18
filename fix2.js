const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<div className="col-span-4">.*?КУРС.*?<\/div>/, '<div className="col-span-5">ОПРОС</div>');
content = content.replace(/<div className="col-span-1 text-right">СТУДЕНТЫ<\/div>/, '');
content = content.replace(/<div className="col-span-1 text-right">МОДУЛИ<\/div>/, '');
content = content.replace(/<div className="col-span-1 text-right">ЭЛЕМЕНТЫ<\/div>/, '<div className="col-span-2 text-right">ОТВЕТОВ</div><div className="col-span-2 text-right">СОЗДАН</div>');
content = content.replace(/<div className="col-span-1">ЯЗЫК<\/div>/, '');
content = content.replace(/<div className="col-span-1 text-neutral-700 font-semibold text-sm">\{course\.lang\}<\/div>/g, '');
content = content.replace(/<div className="col-span-1 text-right text-neutral-900 font-semibold text-sm">\{course\.users\}<\/div>/g, '');
content = content.replace(/<div className="col-span-1 text-right text-neutral-900 font-semibold text-sm">\{course\.modules\}<\/div>/g, '');
content = content.replace(/<div className="col-span-1 text-right text-neutral-900 font-semibold text-sm">\{course\.lessons\}<\/div>/g, '');

content = content.replace(/Archived/g, 'Closed');
content = content.replace(/Архив/g, 'Завершен');

fs.writeFileSync(file, content, 'utf8');
