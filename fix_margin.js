const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove mb-6 to normalize spacing
content = content.replace(
  /<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">/g,
  '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">'
);

fs.writeFileSync(file, content, 'utf8');
