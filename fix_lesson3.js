const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/courses/[id]/lesson/[lessonId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement logic from fix_lesson2.js for parts 1 to 5.
content = content.replace(/Minus, Pipette, MessageCircle/g, 'Minus, Pipette, MessageCircle, Palette, ArrowDown');

const fileBlockRegex = /function FileBlockEditor\(\{\s*data,\s*onChange\s*\}\s*:\s*\{\s*data:\s*any;\s*onChange:\s*\(d:\s*any\)\s*=>\s*void\s*\}\)\s*\{\s*return \(\s*<div className="px-4 py-4">\s*\{data\.name \?\s*\(\s*<div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">\s*<FileText className="w-5 h-5 text-amber-600 shrink-0" \/>\s*<div className="flex-1 min-w-0"><p className="text-\[13px\] font-medium text-neutral-800 truncate">\{data\.name\}<\/p><p className="text-\[11px\] text-neutral-400">\{data\.size\}<\/p><\/div>\s*<button onClick=\{\(\) => onChange\(\{name:'',size:''\}\)\} className="p-1 rounded text-neutral-400 hover:text-rose-500"><X className="w-3\.5 h-3\.5" \/><\/button>\s*<\/div>/g;

const newFileBlockReturn = `function FileBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="px-4 py-4">
      {data.name ? (
        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-800 truncate">{data.name}</p>
            <p className="text-[11px] text-neutral-400">{data.size}</p>
          </div>
          <div className="relative">
            <select 
              value={data.access || 'download'} 
              onChange={e => onChange({...data, access: e.target.value})}
              className="appearance-none bg-white border border-neutral-200 rounded-lg px-3 py-1.5 pr-8 text-[12px] font-medium text-neutral-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="download">Скачать</option>
              <option value="preview">Предпросмотр</option>
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button onClick={() => onChange({name:'',size:''})} className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X className="w-4 h-4" /></button>
        </div>`;

content = content.replace(fileBlockRegex, newFileBlockReturn);

content = content.replace(
  /\{ cmd: \(\) => \{ const url = prompt\('Введите URL:'\); if \(url\) exec\('createLink', url\); \}, icon: Link, title: 'Ссылка' \},\s*\]\.map\(\(b, i\)/g,
  `{ cmd: () => { const url = prompt('Введите URL:'); if (url) exec('createLink', url); }, icon: Link, title: 'Ссылка' },
          { cmd: () => { const c = prompt('Цвет текста (hex/имя):', '#ff0000'); if (c) exec('foreColor', c); }, icon: Palette, title: 'Цвет текста' },
        ].map((b, i)`
);

content = content.replace(
  /\{ cmd: \(\) => \{ const u=prompt\('URL:'\); if\(u\) execC\('createLink',u\); \}, icon: Link, title: 'Ссылка' \},\s*\]\.map\(\(b,i\)/g,
  `{ cmd: () => { const u=prompt('URL:'); if(u) execC('createLink',u); }, icon: Link, title: 'Ссылка' },
            { cmd: () => { const c = prompt('Цвет текста (hex/имя):', '#ff0000'); if (c) execC('foreColor', c); }, icon: Palette, title: 'Цвет текста' },
          ].map((b,i)`
);

const tableEditorRegex = /function TableBlockEditor\(\{ data, onChange \}: \{ data: any; onChange: \(d: any\) => void \}\) \{[\s\S]*?(?=\n\/\/ Mini block type selector)/;

const newTableEditor = `function TableBlockEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const cells = data.cells || [[{html:''},{html:''}],[{html:''},{html:''}]];
  const colWidths = data.colWidths || Array(cells[0]?.length || 2).fill('auto');
  const [activeCell, setActiveCell] = useState(null);

  const updateCell = (r,c,html) => {
    const n=cells.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,html}:cell));
    onChange({...data,cells:n});
  };
  const updateCellColor = (color) => {
    if(!activeCell) return;
    const {r,c} = activeCell;
    const n=cells.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,color}:cell));
    onChange({...data,cells:n});
  };
  const updateColWidth = (c, width) => {
    const nw=[...colWidths]; nw[c]=width;
    onChange({...data,colWidths:nw});
  };

  const execT = (cmd, val) => { document.execCommand(cmd, false, val); };
  const normCells = cells.map(row => row.map(cell => typeof cell === 'string' ? {html: cell} : cell));

  return (
    <div className="px-4 py-4 space-y-3">
      {activeCell !== null && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border border-neutral-200 rounded-lg bg-white mb-2 flex-wrap">
          {[
            { cmd: () => execT('bold'), icon: Bold, title: 'Жирный' },
            { cmd: () => execT('italic'), icon: Italic, title: 'Курсив' },
            { cmd: () => execT('underline'), icon: Underline, title: 'Подчёркнутый' },
            { cmd: () => { const u=prompt('URL:'); if(u) execT('createLink',u); }, icon: Link, title: 'Ссылка' },
            { cmd: () => { const c = prompt('Цвет текста (hex/имя):', '#ff0000'); if (c) execT('foreColor', c); }, icon: Palette, title: 'Цвет текста' },
          ].map((b,i) => (
            <button key={i} onMouseDown={e => { e.preventDefault(); b.cmd(); }} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"><b.icon className="w-3.5 h-3.5" /></button>
          ))}
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-neutral-400 font-semibold pl-1">Фон:</span>
            <input type="color" value={normCells[activeCell.r]?.[activeCell.c]?.color || '#ffffff'} onChange={e=>updateCellColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer p-0 border-0" />
          </div>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <div className="flex items-center gap-2">
             <span className="text-[10px] uppercase text-neutral-400 font-semibold pl-1">Ширина (px/%):</span>
             <input type="text" value={colWidths[activeCell.c] || 'auto'} onChange={e=>updateColWidth(activeCell.c, e.target.value)} placeholder="auto" className="w-16 px-2 py-0.5 text-[11px] border border-neutral-200 rounded bg-neutral-50" />
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse">
          <tbody>{normCells.map((row,ri)=>(
            <tr key={ri}>{row.map((cell,ci)=>(
              <td key={ci} style={{backgroundColor: cell.color || (ri===0&&data.headerRow?'#f5f5f5':'transparent'), width: colWidths[ci]||'auto'}} 
                className={"border-r border-b border-neutral-200 last:border-r-0 p-0 transition-colors " + (ri===0&&data.headerRow?'font-semibold':'')}>
                <div onFocus={()=>setActiveCell({r:ri,c:ci})}>
                  <RichEditor
                    html={cell.html}
                    onUpdate={h=>updateCell(ri,ci,h)}
                    placeholder={ri===0&&data.headerRow?'Заголовок':''}
                    className="w-full px-2.5 py-2 min-h-[36px] text-[13px] text-neutral-800 focus:outline-none focus:bg-blue-50/20"
                  />
                </div>
              </td>
            ))}<td className="w-6 border-b border-neutral-200 text-center">{normCells.length>1&&<button onClick={()=>onChange({...data,cells:normCells.filter((_,i)=>i!==ri)})} className="p-0.5 text-neutral-300 hover:text-rose-500"><X className="w-3.5 h-3.5 mx-auto" /></button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={()=>onChange({...data,cells:[...normCells,Array(normCells[0]?.length||2).fill({html:''})], colWidths})} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Строка</button>
        <button onClick={()=>{
          onChange({...data,
            cells:normCells.map(r=>[...r,{html:''}]), 
            colWidths: [...colWidths, 'auto']
          })
        }} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100"><Plus className="w-3 h-3" /> Столбец</button>
        <div className="flex-1" />
        <Toggle checked={data.headerRow} onChange={v=>onChange({...data,headerRow:v})} label="Заголовок" />
      </div>
    </div>
  );
}`;

content = content.replace(tableEditorRegex, newTableEditor);

content = content.replace(
  /const \[isDragging, setIsDragging\] = useState\(false\);/g,
  `const [isDragging, setIsDragging] = useState(false);\n  const [insertIdx, setInsertIdx] = useState<number | null>(null);`
);

const addBlockRegex = /const addBlock = \(type: BlockType\) => \{\s*setBlocks\(prev => \[\.\.\.prev, \{id: mkId\(\), type, data: DEFAULT_BLOCK\[type\]\(\)\}\]\);\s*\};/g;
const newAddBlock = `const addBlock = (type: BlockType) => {
    const newBlock = {id: mkId(), type, data: DEFAULT_BLOCK[type]()};
    if (insertIdx !== null) {
      setBlocks(prev => {
        const next = [...prev];
        next.splice(insertIdx, 0, newBlock);
        return next;
      });
      setInsertIdx(insertIdx + 1);
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }
  };`;
content = content.replace(addBlockRegex, newAddBlock);

// Here is the fix for adding the indicator properly at the exact location.
content = content.replace(
  /<div key=\{block\.id\} data-block/g,
  '<React.Fragment key={block.id}><div data-block'
);

const chunkToReplace = `                  {(block.type==='button'||block.type==='exercise')&&block.data.isDivider && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
                        <EyeOff className="w-3.5 h-3.5" /> Контент ниже скрыт до взаимодействия
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>`;

const replacementChunk = `                  {(block.type==='button'||block.type==='exercise')&&block.data.isDivider && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
                        <EyeOff className="w-3.5 h-3.5" /> Контент ниже скрыт до взаимодействия
                      </div>
                    </div>
                  )}
                </div>
                  <div className={"relative h-8 flex items-center justify-center -my-1 z-10 transition-all " + (insertIdx === idx + 1 ? "opacity-100 scale-100" : "opacity-0 hover:opacity-100 scale-95 hover:scale-100")}>
                    <div className={"absolute inset-x-8 h-px transition-colors " + (insertIdx === idx + 1 ? "bg-blue-300" : "bg-neutral-200")} />
                    <button onClick={() => setInsertIdx(insertIdx === idx + 1 ? null : idx + 1)} className={"relative px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm border " + (insertIdx === idx + 1 ? "text-blue-700 bg-blue-50 border-blue-200" : "text-neutral-500 bg-white border-neutral-200 hover:text-neutral-800")}>
                      <ArrowDown className="w-3 h-3" /> {insertIdx === idx + 1 ? "Добавление сюда..." : "Вставить блок здесь"}
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>`;

content = content.replace(chunkToReplace, replacementChunk);

fs.writeFileSync(file, content, 'utf8');
