const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The issue is `overflow-hidden` on the col-span-5 wrapper which crops the absolute positioned tooltip.
content = content.replace(
  /<div className="col-span-5 flex items-center gap-3 overflow-hidden pr-4">/g,
  '<div className="col-span-5 flex items-center gap-3 pr-4 min-w-0">'
);

fs.writeFileSync(file, content, 'utf8');
