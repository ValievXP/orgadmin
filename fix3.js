const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{course\.inCatalog && \([\s\S]*?<\/span>\s*\)\}/g, '');
content = content.replace(/inCatalog: [a-z]+,/g, '');

content = content.replace(/<div className="col-span-3 hidden md:flex items-center gap-6 text-neutral-500">[\s\S]*?<\/div>/g, '');

content = content.replace(/<span className="text-neutral-900 font-medium">12\.05\.2026<\/span><span className="text-neutral-400">14:30<\/span>/g, '<span className="text-neutral-900 font-medium">12.05.2026</span><span className="text-neutral-400">14:30</span>');

fs.writeFileSync(file, content, 'utf8');
