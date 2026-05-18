const fs = require('fs');

let content = fs.readFileSync('src/app/courses/[id]/page.tsx', 'utf8');

// 1. Import AddElementModal
content = content.replace(
  `import { PageHeader } from '@/components/layout/PageHeader';\nimport { Button } from '@/components/ui/Button';`,
  `import { PageHeader } from '@/components/layout/PageHeader';\nimport { Button } from '@/components/ui/Button';\nimport { AddElementModal } from '@/components/modals/AddElementModal';`
);

// 2. Add onAddElement to ModuleItem props
content = content.replace(
  `function ModuleItem({ module, moduleIndex, onEdit, onAddLesson, onAddTest, onDelete, onDeleteItem, onEditItem, openMenuId, setOpenMenuId, onToggle }: {`,
  `function ModuleItem({ module, moduleIndex, onEdit, onAddLesson, onAddTest, onAddElement, onDelete, onDeleteItem, onEditItem, openMenuId, setOpenMenuId, onToggle }: {`
);

content = content.replace(
  `  onAddTest: () => void;`,
  `  onAddTest: () => void;\n  onAddElement: () => void;`
);

// 3. Use onAddElement in the menu
content = content.replace(
  `<button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); }}><PlusCircle className="w-3.5 h-3.5 text-neutral-400" />Добавить элемент</button>`,
  `<button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium" onClick={() => { setMenuOpen(false); onAddElement(); }}><PlusCircle className="w-3.5 h-3.5 text-neutral-400" />Добавить элемент</button>`
);

// 4. State in CourseDetailPage
content = content.replace(
  `  const [moduleModalOpen, setModuleModalOpen] = useState(false);`,
  `  const [moduleModalOpen, setModuleModalOpen] = useState(false);\n  const [addElementModalOpen, setAddElementModalOpen] = useState(false);\n  const [addElementTargetModule, setAddElementTargetModule] = useState<string | null>(null);`
);

// 5. Pass onAddElement to ModuleItem
content = content.replace(
  `                      onAddTest={() => router.push(\`/courses/\${courseId}/test/\${module.id}-new\`)}`,
  `                      onAddTest={() => router.push(\`/courses/\${courseId}/test/\${module.id}-new\`)}\n                      onAddElement={() => {\n                        setAddElementTargetModule(module.id);\n                        setAddElementModalOpen(true);\n                      }}`
);

// 6. Render AddElementModal
content = content.replace(
  `      <ModuleModal`,
  `      <AddElementModal\n        isOpen={addElementModalOpen}\n        onClose={() => {\n          setAddElementModalOpen(false);\n          setAddElementTargetModule(null);\n        }}\n        onSelect={(el) => {\n          console.log('Selected element', el, 'for module', addElementTargetModule);\n          // In a real app we would copy the element into the module.items here\n          setAddElementModalOpen(false);\n          setAddElementTargetModule(null);\n        }}\n      />\n\n      {/* Module Modal (Create / Edit) */}\n      <ModuleModal`
);

fs.writeFileSync('src/app/courses/[id]/page.tsx', content);
