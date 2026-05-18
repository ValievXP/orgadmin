const fs = require('fs');

let content = fs.readFileSync('src/app/surveys/create/page.tsx', 'utf8');

content = content.replace(
  `              <div className="border-t border-neutral-100" />

              {/* 2) Rating + Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Toggle checked={settings.ratingEnabled} onChange={v=>upd({ratingEnabled:v})} label="Оценка опроса" description="От 1 до 5 звёзд" icon={Star} />
                <Toggle checked={settings.reviewEnabled} onChange={v=>upd({reviewEnabled:v})} label="Развёрнутый отзыв" description="Текстовый комментарий" icon={MessageCircle} />
              </div>

              <div className="border-t border-neutral-100" />

              {/* 3) Timer + Homework */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 items-start">
                <div>
                  <Toggle checked={settings.timerEnabled} onChange={v=>upd({timerEnabled:v})} label="Таймер-блокировка" description="Мин. время на опрос" icon={Timer} />
                  {settings.timerEnabled && (
                    <div className="flex items-center gap-2 pl-10 mt-1">
                      <input type="number" min={1} value={settings.timerMinutes} onChange={e=>upd({timerMinutes:Number(e.target.value)})}
                        className="w-20 px-3 py-1.5 rounded-lg border border-neutral-200 text-[13px] text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      <span className="text-[12px] text-neutral-400">минут</span>
                    </div>
                  )}
                </div>
                <div>
                  <Toggle checked={settings.homeworkEnabled} onChange={v=>upd({homeworkEnabled:v})} label="Домашнее задание" description="Чат с куратором" icon={MessageSquare} />
                </div>
              </div>`,
  ''
);

content = content.replace(
  `    {id:'ordering', icon: ArrowUpDown, label:'Порядок'},
    {id:'matching', icon: Shuffle, label:'Соединение'},`,
  ``
);

content = content.replace(
  `      {/* Question (shared for all types) */}
      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})}
        placeholder="Введите вопрос..."
        className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />`,
  `      {/* Question (shared for all types) */}
      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})}
        placeholder="Вопрос..."
        className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium placeholder-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description || ''} onChange={e => onChange({...data, description: e.target.value})}
        placeholder="Описание (необязательно)"
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />`
);

content = content.replace(
  `{type:'exercise',label:'Упражнение',desc:'Выбор вариантов'`,
  `{type:'exercise',label:'Вопрос',desc:'Выбор вариантов'`
);

content = content.replace(
  `function ScaleBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Название/вопрос" className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />`,
  `function ScaleBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-end">
        <Toggle checked={data.isDivider} onChange={v => onChange({...data, isDivider: v})} label="Разделитель" icon={EyeOff} />
      </div>
      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Вопрос..." className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      
      {data.questionImage ? (
        <div className="relative rounded-lg overflow-hidden h-28 bg-neutral-100 group/qi">
          <img src={data.questionImage} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange({...data, questionImage:''})} className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover/qi:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <button className="w-full h-12 border border-dashed border-neutral-200 rounded-lg flex items-center justify-center gap-2 text-[11px] text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 transition-all">
          <ImageIcon className="w-3.5 h-3.5" /> Изображение к вопросу
        </button>
      )}`
);

content = content.replace(
  `function OpenQuestionBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => onChange({...data, format: 'short'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'short' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Короткий ответ</button>
        <button onClick={() => onChange({...data, format: 'detailed'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'detailed' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Развернутый ответ</button>
      </div>

      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Название/вопрос" className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      
      <div className="pt-2">`,
  `function OpenQuestionBlockEditor({ data, onChange }: any) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5 w-fit">
          <button onClick={() => onChange({...data, format: 'short'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'short' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Короткий ответ</button>
          <button onClick={() => onChange({...data, format: 'detailed'})} className={\`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all \${data.format === 'detailed' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}\`}>Развернутый ответ</button>
        </div>
        <Toggle checked={data.isDivider} onChange={v => onChange({...data, isDivider: v})} label="Разделитель" icon={EyeOff} />
      </div>

      <input type="text" value={data.question} onChange={e => onChange({...data, question: e.target.value})} placeholder="Вопрос..." className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-[14px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      <input type="text" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Описание (необязательно)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
      
      {data.questionImage ? (
        <div className="relative rounded-lg overflow-hidden h-28 bg-neutral-100 group/qi">
          <img src={data.questionImage} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange({...data, questionImage:''})} className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover/qi:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <button className="w-full h-12 border border-dashed border-neutral-200 rounded-lg flex items-center justify-center gap-2 text-[11px] text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 transition-all">
          <ImageIcon className="w-3.5 h-3.5" /> Изображение к вопросу
        </button>
      )}

      <div className="pt-2">`
);

content = content.replace(
  `{(block.type==='button'||block.type==='exercise')&&block.data.isDivider && (`,
  `{['button','exercise','scale','open_question'].includes(block.type) && block.data.isDivider && (`
);

fs.writeFileSync('src/app/surveys/create/page.tsx', content);
