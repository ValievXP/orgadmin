const fs = require('fs');
const file = 'c:/Users/User/Desktop/OSNOVA/org-admin/src/app/courses/[id]/lesson/[lessonId]/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const target = `                  )}
                </div>
              );
            })}`;

const replacement = `                  )}
                </div>
                  <div className={"relative h-8 flex items-center justify-center -my-1 z-10 transition-all " + (insertIdx === idx + 1 ? "opacity-100 scale-100" : "opacity-0 hover:opacity-100 scale-95 hover:scale-100")}>
                    <div className={"absolute inset-x-8 h-px transition-colors " + (insertIdx === idx + 1 ? "bg-blue-300" : "bg-neutral-200")} />
                    <button onClick={() => setInsertIdx(insertIdx === idx + 1 ? null : idx + 1)} className={"relative px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm border " + (insertIdx === idx + 1 ? "text-blue-700 bg-blue-50 border-blue-200" : "text-neutral-500 bg-white border-neutral-200 hover:text-neutral-800")}>
                      <ArrowDown className="w-3 h-3" /> {insertIdx === idx + 1 ? "Добавление сюда..." : "Вставить блок здесь"}
                    </button>
                  </div>
                </React.Fragment>
              );
            })}`;

// Let's normalize CRLF to LF just in case, replace, and then if needed convert back
c = c.replace(/\r\n/g, '\n');
c = c.replace(target.replace(/\r\n/g, '\n'), replacement.replace(/\r\n/g, '\n'));

fs.writeFileSync(file, c, 'utf8');
console.log('Replaced end');
