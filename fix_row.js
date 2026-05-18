const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert the missing row columns for list view
content = content.replace(
  /<div className="col-span-1 text-right relative" ref=\{menuRef\}>/g,
  `<div className="col-span-2 text-right text-neutral-900 font-semibold text-[13px]">{course.users}</div>\n<div className="col-span-2 text-right pr-6 flex justify-end flex-col text-[12px]"><span className="text-neutral-900 font-medium leading-none mb-1">12.05.2026</span><span className="text-neutral-400 leading-none">14:30</span></div>\n<div className="col-span-1 text-right relative" ref={menuRef}>`
);

fs.writeFileSync(file, content, 'utf8');
