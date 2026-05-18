const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/surveys/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The write_to_file tool inserted literal backslashes before backticks and dollar signs because it unescaped the JSON string.
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content, 'utf8');
