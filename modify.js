const fs = require('fs');

let content = fs.readFileSync('src/app/surveys/create/page.tsx', 'utf8');

content = content.replace(
  "type BlockType = 'video' | 'file' | 'text' | 'image' | 'slider' | 'callout' | 'button' | 'exercise' | 'iframe' | 'table' | 'columns';",
  "type BlockType = 'video' | 'file' | 'text' | 'image' | 'slider' | 'callout' | 'button' | 'exercise' | 'iframe' | 'table' | 'columns' | 'scale' | 'open_question';"
);

content = content.replace(
  `interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
}`,
  `interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
  isRequired?: boolean;
}`
);

content = content.replace(
  `  columns: () => ({ count: 2, cols: [[], []] as ContentBlock[][] }),
};`,
  `  columns: () => ({ count: 2, cols: [[], []] as ContentBlock[][] }),
  scale: () => ({ question: '', description: '', useEmojis: false }),
  open_question: () => ({ question: '', description: '', format: 'short' }),
};`
);

content = content.replace(
  `const MOCK: LessonSettings = {
  title: 'Введение в корпоративную безопасность',`,
  `const MOCK: LessonSettings = {
  title: '',`
);

content = content.replace(
  `const MOCK_BLOCKS: ContentBlock[] = [
  { id: 'b1', type: 'text', data: { html: '<p>В этом уроке мы рассмотрим основные принципы корпоративной безопасности.</p>' } },
  { id: 'b2', type: 'video', data: { fileName: 'intro_lecture.mp4' } },
  { id: 'b3', type: 'callout', data: { icon: 'info', html: '<p>Материалы этого урока обязательны для изучения перед тестом.</p>', iconColor: '#378CFF', bgColor: '#EBF5FF' } },
];`,
  `const MOCK_BLOCKS: ContentBlock[] = [];`
);

content = content.replace(
  `function BlockToolbar({ index, total, onMoveUp, onMoveDown, onDuplicate, onDelete, label, onDragStart }: {
  index: number; total: number;
  onMoveUp: () => void; onMoveDown: () => void;
  onDuplicate: () => void; onDelete: () => void;
  label: string;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 bg-neutral-50/50">
      <div className="flex items-center gap-2">
        <div
          draggable
          onDragStart={onDragStart}
          className="p-0.5 cursor-grab active:cursor-grabbing rounded hover:bg-neutral-200 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-neutral-300" />
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={onMoveUp} disabled={index === 0} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
        <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
        <button onClick={onDuplicate} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}`,
  `function BlockToolbar({ index, total, onMoveUp, onMoveDown, onDuplicate, onDelete, label, onDragStart, isRequired, onToggleRequired }: {
  index: number; total: number;
  onMoveUp: () => void; onMoveDown: () => void;
  onDuplicate: () => void; onDelete: () => void;
  label: string;
  onDragStart: (e: React.DragEvent) => void;
  isRequired?: boolean;
  onToggleRequired?: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 bg-neutral-50/50">
      <div className="flex items-center gap-2">
        <div
          draggable
          onDragStart={onDragStart}
          className="p-0.5 cursor-grab active:cursor-grabbing rounded hover:bg-neutral-200 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-neutral-300" />
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {onToggleRequired !== undefined && (
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 mr-2 cursor-pointer">
            <input type="checkbox" checked={isRequired} onChange={e => onToggleRequired(e.target.checked)} className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 w-3.5 h-3.5" />
            Обязательный
          </label>
        )}
        <div className="flex items-center gap-0.5">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={onDuplicate} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}`
);

content = content.replace(
  `  const setCorrect = (id: string) => {
    if (data.type === 'radio') {
      onChange({...data, answers: answers.map((a: ExerciseAnswer) => ({...a, isCorrect: a.id === id}))});
    } else {
      onChange({...data, answers: answers.map((a: ExerciseAnswer) => a.id === id ? {...a, isCorrect: !a.isCorrect} : a)});
    }
  };`,
  `  const setCorrect = (id: string) => {
    // Disabled for surveys
  };`
);

content = content.replace(
  `              <button onClick={() => setCorrect(a.id)}
                className={\`w-5 h-5 shrink-0 flex items-center justify-center transition-all \${
                  data.type === 'radio' ? \`rounded-full border-2 \${a.isCorrect?'border-emerald-500 bg-emerald-500':'border-neutral-300'}\` : \`rounded-md border-2 \${a.isCorrect?'border-emerald-500 bg-emerald-500':'border-neutral-300'}\`
                }\`}>{a.isCorrect && <Check className="w-3 h-3 text-white" />}</button>
              <span className="text-[11px] font-bold text-neutral-400 w-4 shrink-0">{String.fromCharCode(65+ai)}</span>`,
  `              <span className="text-[11px] font-bold text-neutral-400 w-4 shrink-0 text-center">{String.fromCharCode(65+ai)}</span>`
);

content = content.replace(
  `            <button onClick={() => onChange({...data, correctAnswer: true})}
              className={\`p-5 rounded-xl border-2 text-center transition-all \${data.correctAnswer === true ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]' : 'border-neutral-200 bg-white hover:border-neutral-300'}\`}>
              <div className={\`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center \${data.correctAnswer === true ? 'bg-emerald-500' : 'bg-neutral-100'}\`}>
                <Check className={\`w-5 h-5 \${data.correctAnswer === true ? 'text-white' : 'text-neutral-400'}\`} />
              </div>
              <p className={\`text-[14px] font-semibold \${data.correctAnswer === true ? 'text-emerald-700' : 'text-neutral-600'}\`}>Правда</p>

            </button>
            <button onClick={() => onChange({...data, correctAnswer: false})}
              className={\`p-5 rounded-xl border-2 text-center transition-all \${data.correctAnswer === false ? 'border-rose-400 bg-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.2)]' : 'border-neutral-200 bg-white hover:border-neutral-300'}\`}>
              <div className={\`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center \${data.correctAnswer === false ? 'bg-rose-500' : 'bg-neutral-100'}\`}>
                <X className={\`w-5 h-5 \${data.correctAnswer === false ? 'text-white' : 'text-neutral-400'}\`} />
              </div>
              <p className={\`text-[14px] font-semibold \${data.correctAnswer === false ? 'text-rose-700' : 'text-neutral-600'}\`}>Ложь</p>
            </button>`,
  `            <button onClick={() => onChange({...data, correctAnswer: true})}
              className={\`p-5 rounded-xl border-2 text-center transition-all border-neutral-200 bg-white opacity-70 cursor-default\`}>
              <div className={\`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-neutral-100\`}>
                <Check className={\`w-5 h-5 text-neutral-400\`} />
              </div>
              <p className={\`text-[14px] font-semibold text-neutral-600\`}>Вариант: Да</p>
            </button>
            <button onClick={() => onChange({...data, correctAnswer: false})}
              className={\`p-5 rounded-xl border-2 text-center transition-all border-neutral-200 bg-white opacity-70 cursor-default\`}>
              <div className={\`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-neutral-100\`}>
                <X className={\`w-5 h-5 text-neutral-400\`} />
              </div>
              <p className={\`text-[14px] font-semibold text-neutral-600\`}>Вариант: Нет</p>
            </button>`
);

content = content.replace(
  `// ─── Registry ────────────────────────────────────────────────────────────────`,
  `function ScaleBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Название/вопрос" className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      
      <div className="flex items-center gap-3 pt-2">
        <Toggle checked={data.useEmojis} onChange={v => onChange({...data, useEmojis: v})} label="Использовать смайлики" />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 pb-4 px-4 border-t border-neutral-100">
        {[1,2,3,4,5].map(n => (
           <div key={n} className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-full border-2 border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-400">
               {data.useEmojis ? (
                 n === 1 ? '😠' : n === 2 ? '☹️' : n === 3 ? '😐' : n === 4 ? '🙂' : '🤩'
               ) : (
                 <span className="text-[16px] font-bold">{n}</span>
               )}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}

function OpenQuestionBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => onChange({...data, format: 'short'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'short' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Короткий ответ</button>
        <button onClick={() => onChange({...data, format: 'detailed'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'detailed' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Развернутый ответ</button>
      </div>

      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Название/вопрос" className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      
      <div className="pt-2">
        {data.format === 'short' ? (
          <input type="text" disabled placeholder="Поле для ответа пользователя..." className="w-full px-3 py-2.5 rounded-lg border border-dashed border-neutral-300 text-[13px] bg-neutral-50/50 cursor-not-allowed" />
        ) : (
          <textarea disabled placeholder="Поле для развернутого ответа пользователя..." rows={3} className="w-full px-3 py-2.5 rounded-lg border border-dashed border-neutral-300 text-[13px] bg-neutral-50/50 resize-none cursor-not-allowed" />
        )}
      </div>
    </div>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────────`
);

content = content.replace(
  `const BLOCK_REG: { type: BlockType; label: string; desc: string; icon: any; color: string }[] = [
  {type:'text',label:'Текст',desc:'Форматируемый блок',icon:Type,color:'text-neutral-600 bg-neutral-100'},
  {type:'video',label:'Видео',desc:'Загрузить видео',icon:Video,color:'text-rose-600 bg-rose-50'},
  {type:'image',label:'Картинка',desc:'Загрузить изображение',icon:ImageIcon,color:'text-blue-600 bg-blue-50'},
  {type:'slider',label:'Слайдер',desc:'Галерея изображений',icon:Layers,color:'text-violet-600 bg-violet-50'},
  {type:'file',label:'Файл',desc:'PDF, Excel и др.',icon:FileText,color:'text-amber-600 bg-amber-50'},
  {type:'callout',label:'Подсказка',desc:'Блок-сноска',icon:Info,color:'text-sky-600 bg-sky-50'},
  {type:'button',label:'Кнопка',desc:'Ссылка / разделитель',icon:MousePointer,color:'text-emerald-600 bg-emerald-50'},
  {type:'exercise',label:'Упражнение',desc:'Мини-тест',icon:HelpCircle,color:'text-orange-600 bg-orange-50'},
  {type:'iframe',label:'Код',desc:'HTML / JS виджет',icon:Code,color:'text-purple-600 bg-purple-50'},
  {type:'table',label:'Таблица',desc:'Данные в таблице',icon:Table,color:'text-teal-600 bg-teal-50'},
  {type:'columns',label:'Колонки',desc:'Сетка 2–3',icon:Columns,color:'text-indigo-600 bg-indigo-50'},
];`,
  `const BLOCK_REG: { type: BlockType; label: string; desc: string; icon: any; color: string }[] = [
  {type:'scale',label:'Шкала',desc:'Оценка от 1 до 5',icon:Star,color:'text-amber-600 bg-amber-50'},
  {type:'open_question',label:'Открытый',desc:'Текстовый ответ',icon:MessageSquare,color:'text-purple-600 bg-purple-50'},
  {type:'exercise',label:'Упражнение',desc:'Выбор вариантов',icon:HelpCircle,color:'text-orange-600 bg-orange-50'},
  {type:'text',label:'Текст',desc:'Форматируемый блок',icon:Type,color:'text-neutral-600 bg-neutral-100'},
  {type:'video',label:'Видео',desc:'Загрузить видео',icon:Video,color:'text-rose-600 bg-rose-50'},
  {type:'image',label:'Картинка',desc:'Загрузить изображение',icon:ImageIcon,color:'text-blue-600 bg-blue-50'},
  {type:'slider',label:'Слайдер',desc:'Галерея изображений',icon:Layers,color:'text-violet-600 bg-violet-50'},
  {type:'file',label:'Файл',desc:'PDF, Excel и др.',icon:FileText,color:'text-amber-600 bg-amber-50'},
  {type:'callout',label:'Подсказка',desc:'Блок-сноска',icon:Info,color:'text-sky-600 bg-sky-50'},
  {type:'button',label:'Кнопка',desc:'Ссылка / разделитель',icon:MousePointer,color:'text-emerald-600 bg-emerald-50'},
  {type:'iframe',label:'Код',desc:'HTML / JS виджет',icon:Code,color:'text-purple-600 bg-purple-50'},
  {type:'table',label:'Таблица',desc:'Данные в таблице',icon:Table,color:'text-teal-600 bg-teal-50'},
  {type:'columns',label:'Колонки',desc:'Сетка 2–3',icon:Columns,color:'text-indigo-600 bg-indigo-50'},
];`
);

content = content.replace(
  `  button:ButtonBlockEditor,exercise:ExerciseBlockEditor,iframe:IframeBlockEditor,
  table:TableBlockEditor,columns:ColumnsBlockEditor,
};`,
  `  button:ButtonBlockEditor,exercise:ExerciseBlockEditor,iframe:IframeBlockEditor,
  table:TableBlockEditor,columns:ColumnsBlockEditor,
  scale:ScaleBlockEditor,open_question:OpenQuestionBlockEditor,
};`
);

content = content.replace(
  `export default function LessonEditorPage() {`,
  `export default function CreateSurveyPage() {`
);

content = content.replace(
  `  const addBlock = (type: BlockType) => {
    const newBlock = {id: mkId(), type, data: DEFAULT_BLOCK[type]()};`,
  `  const addBlock = (type: BlockType) => {
    const newBlock = {id: mkId(), type, data: DEFAULT_BLOCK[type](), isRequired: false};`
);

content = content.replace(
  `  const updateBlock = (id:string,data:any) => setBlocks(p=>p.map(b=>b.id===id?{...b,data}:b));
  const deleteBlock = (id:string) => setBlocks(p=>p.filter(b=>b.id!==id));`,
  `  const updateBlock = (id:string,data:any) => setBlocks(p=>p.map(b=>b.id===id?{...b,data}:b));
  const toggleRequired = (id:string,req:boolean) => setBlocks(p=>p.map(b=>b.id===id?{...b,isRequired:req}:b));
  const deleteBlock = (id:string) => setBlocks(p=>p.filter(b=>b.id!==id));`
);

content = content.replace(
  `        breadcrumbs={[{label:'Курсы',href:'/courses'},{label:'Содержание',href:\`/courses/\${courseId}\`},{label:settings.title||'Новый урок'}]}`,
  `        breadcrumbs={[{label:'Опросы',href:'/surveys'},{label:settings.title||'Новый опрос'}]}`
);

content = content.replace(
  `          placeholder="Название урока..."`,
  `          placeholder="Название опроса..."`
);

content = content.replace(
  `              <span className="text-[14px] font-semibold text-neutral-900">Настройки урока</span>`,
  `              <span className="text-[14px] font-semibold text-neutral-900">Настройки опроса</span>`
);

content = content.replace(
  `                <Toggle checked={settings.ratingEnabled} onChange={v=>upd({ratingEnabled:v})} label="Оценка урока" description="От 1 до 5 звёзд" icon={Star} />`,
  `                <Toggle checked={settings.ratingEnabled} onChange={v=>upd({ratingEnabled:v})} label="Оценка опроса" description="От 1 до 5 звёзд" icon={Star} />`
);

content = content.replace(
  `                  <Toggle checked={settings.timerEnabled} onChange={v=>upd({timerEnabled:v})} label="Таймер-блокировка" description="Мин. время на уроке" icon={Timer} />`,
  `                  <Toggle checked={settings.timerEnabled} onChange={v=>upd({timerEnabled:v})} label="Таймер-блокировка" description="Мин. время на опрос" icon={Timer} />`
);

content = content.replace(
  `            <h3 className="font-semibold text-neutral-800 mb-1">Начните создавать урок</h3>`,
  `            <h3 className="font-semibold text-neutral-800 mb-1">Начните создавать опрос</h3>`
);

content = content.replace(
  `                    onDragStart={e=>handleDragStart(e,idx)}
                  />`,
  `                    onDragStart={e=>handleDragStart(e,idx)}
                    isRequired={['scale', 'open_question', 'exercise'].includes(block.type) ? block.isRequired : undefined}
                    onToggleRequired={['scale', 'open_question', 'exercise'].includes(block.type) ? (v: boolean) => toggleRequired(block.id, v) : undefined}
                  />`
);

content = content.replace(
  `  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };`,
  `  const save = () => { 
    setSaved(true); 
    setTimeout(()=> {
      setSaved(false);
      router.push('/surveys');
    }, 800); 
  };`
);


fs.writeFileSync('src/app/surveys/create/page.tsx', content);
