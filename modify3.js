const fs = require('fs');

let content = fs.readFileSync('src/app/surveys/create/page.tsx', 'utf8');

// 1. Add `language: string;` to `LessonSettings` interface
content = content.replace(
  `  fileAccess: 'both' | 'preview' | 'download';\n}`,
  `  fileAccess: 'both' | 'preview' | 'download';\n  language: string;\n}`
);

// 2. Add `language: 'ru'` to `MOCK`
content = content.replace(
  `  fileAccess: 'both',\n};`,
  `  fileAccess: 'both',\n  language: 'ru',\n};`
);

// 3. Create EMPTY_MOCK and EMPTY_BLOCKS
content = content.replace(
  `const MOCK: LessonSettings = {`,
  `const EMPTY_MOCK: LessonSettings = {
  title: '',
  accessStatus: 'open',
  scheduledDate: '', startDate: '', endDate: '',
  ratingEnabled: true, reviewEnabled: false,
  homeworkEnabled: false, timerEnabled: true, timerMinutes: 5,
  fileAccess: 'both',
  language: 'ru',
};

const MOCK: LessonSettings = {`
);

// 4. Update the CreateSurveyPage to use URL params and fix overflow
content = content.replace(
  `export default function CreateSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [settings, setSettings] = useState<LessonSettings>(MOCK);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    typeof params.lessonId === 'string' && params.lessonId.startsWith('item-') ? [] : MOCK_BLOCKS
  );`,
  `export default function CreateSurveyPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<LessonSettings>(EMPTY_MOCK);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('id=')) {
      setSettings(MOCK);
      setBlocks(MOCK_BLOCKS);
    }
  }, []);`
);

// 5. Fix overflow-hidden and Settings UI
content = content.replace(
  `        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
          <button onClick={()=>setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-50/50 transition-colors">`,
  `        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 z-20 relative">
          <button onClick={()=>setSettingsOpen(!settingsOpen)}
            className={\`w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-50/50 transition-colors \${settingsOpen ? 'rounded-t-2xl' : 'rounded-2xl'}\`}>`
);

// 6. Add timer back and add language dropdown to settings
content = content.replace(
  `              <div className="border-t border-neutral-100" />
            </div>
          )}
        </div>`,
  `              <div className="border-t border-neutral-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 items-start">
                <div>
                  <Toggle checked={settings.timerEnabled} onChange={v=>upd({timerEnabled:v})} label="Время на опросе" description="Ограничение по времени" icon={Timer} />
                  {settings.timerEnabled && (
                    <div className="flex items-center gap-2 pl-10 mt-1">
                      <input type="number" min={1} value={settings.timerMinutes} onChange={e=>upd({timerMinutes:Number(e.target.value)})}
                        className="w-20 px-3 py-1.5 rounded-lg border border-neutral-200 text-[13px] text-center bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      <span className="text-[12px] text-neutral-400">минут</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Язык опроса</label>
                  <Dropdown value={settings.language || 'ru'} options={[
                    {id:'ru', label:'Русский'},
                    {id:'uz', label:'Узбекский'},
                    {id:'en', label:'Английский'},
                  ]} onChange={v=>upd({language:v})} />
                </div>
              </div>
            </div>
          )}
        </div>`
);

fs.writeFileSync('src/app/surveys/create/page.tsx', content);

// Now update page.tsx (Surveys list page) to pass ID
let listContent = fs.readFileSync('src/app/surveys/page.tsx', 'utf8');
listContent = listContent.replace(
  `onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router?.push('/surveys/create'); }}`,
  `onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router?.push('/surveys/create?id=' + course.id); }}`
);
fs.writeFileSync('src/app/surveys/page.tsx', listContent);
