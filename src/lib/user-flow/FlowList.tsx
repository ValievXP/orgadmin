"use client";
// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — СПИСОК ФЛОУ (общий для MVP и Pro)
// Несколько маршрутов на инструмент: создание, шаблон, переименование,
// дублирование, экспорт/импорт JSON, удаление.
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Plus, Route, Copy, Trash2, Download, Upload, Edit3, Check, GitBranch, ArrowUpRight, Zap,
} from 'lucide-react';
import { Edition, EDITIONS } from './editions';
import { StoredFlow, loadFlows, upsertFlow, deleteFlow, duplicateFlow, newFlowId } from './storage';
import { makeTemplate } from './FlowBuilder';

const fmtDateTime = (ms: number) =>
  new Date(ms).toLocaleDateString('ru-RU') + ' ' + new Date(ms).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function UserFlowList({ edition }: { edition: Edition }) {
  const feats = EDITIONS[edition];
  const router = useRouter();
  const [flows, setFlows] = useState<StoredFlow[]>([]);
  const [loadedList, setLoadedList] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setFlows(loadFlows(edition)), [edition]);
  useEffect(() => { refresh(); setLoadedList(true); }, [refresh]);

  const createFlow = (withTemplate: boolean) => {
    const tpl = withTemplate ? makeTemplate(edition) : { nodes: [], edges: [] };
    const rec: StoredFlow = {
      id: newFlowId(),
      name: withTemplate ? 'Онбординг сотрудника' : `Новый флоу ${flows.length + 1}`,
      active: false,
      updatedAt: Date.now(),
      nodes: tpl.nodes,
      edges: tpl.edges,
    };
    upsertFlow(edition, rec);
    router.push(`${feats.basePath}/${rec.id}`);
  };

  const startRename = (f: StoredFlow) => { setRenamingId(f.id); setRenameValue(f.name); };
  const commitRename = (f: StoredFlow) => {
    const name = renameValue.trim() || f.name;
    upsertFlow(edition, { ...f, name, updatedAt: Date.now() });
    setRenamingId(null);
    refresh();
  };

  const handleDuplicate = (id: string) => { duplicateFlow(edition, id); refresh(); };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); setTimeout(() => setConfirmDeleteId(c => c === id ? null : c), 3000); return; }
    deleteFlow(edition, id);
    setConfirmDeleteId(null);
    refresh();
  };

  const handleExport = (f: StoredFlow) => {
    const blob = new Blob([JSON.stringify({ name: f.name, nodes: f.nodes, edges: f.edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${f.name.replace(/[^\wа-яА-ЯёЁ -]/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.nodes)) throw new Error('bad file');
        const rec: StoredFlow = {
          id: newFlowId(),
          name: typeof parsed.name === 'string' && parsed.name.trim() ? `${parsed.name} (импорт)` : 'Импортированный флоу',
          active: false,
          updatedAt: Date.now(),
          nodes: parsed.nodes,
          edges: Array.isArray(parsed.edges) ? parsed.edges : [],
        };
        upsertFlow(edition, rec);
        refresh();
      } catch { alert('Не удалось импортировать: файл не похож на экспорт User Flow'); }
    };
    reader.readAsText(file);
  };

  const nodeCount = (f: StoredFlow) => Array.isArray(f.nodes) ? f.nodes.length : 0;
  const edgeCount = (f: StoredFlow) => Array.isArray(f.edges) ? f.edges.length : 0;

  return (
    <div className="flex flex-col min-h-full w-full bg-[#F4F5F7] overflow-x-hidden relative">
      <div className="bg-white">
        <PageHeader
          breadcrumbs={[{ label: 'Инструменты', href: '/tools' }, { label: feats.title }]}
          actions={
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="application/json" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }} />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-[13px] font-semibold hover:bg-neutral-50 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Импорт
              </button>
              <button onClick={() => createFlow(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Создать флоу
              </button>
            </div>
          }
        />
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-32">
        {/* Edition banner */}
        {edition === 'mvp' ? (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-teal-50 border border-teal-100 rounded-2xl">
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
            <p className="text-[13px] text-teal-800 flex-1">
              <span className="font-bold">MVP-версия.</span> Ядро: триггеры, контент, ожидание событий, условия по сотруднику, задержки и уведомления.
              Switch-ветвления, условия по контенту, кураторы, расписания и симуляция — в
              <a href="/tools/user-flow-pro" className="font-bold underline underline-offset-2 ml-1 hover:text-teal-900">User Flow Pro</a>.
            </p>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-violet-50 border border-violet-100 rounded-2xl">
            <GitBranch className="w-4 h-4 text-violet-600 shrink-0" />
            <p className="text-[13px] text-violet-800 flex-1">
              <span className="font-bold">Pro-версия.</span> Полный набор нод: Switch-ветвления, условия по контенту, кураторы, триггеры по расписанию и симуляция прохождения на реальных сотрудниках.
            </p>
          </div>
        )}

        {loadedList && flows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Route className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="text-[17px] font-bold text-neutral-700 mb-1">Пока нет ни одного флоу</p>
            <p className="text-[13px] text-neutral-400 mb-5">Создайте маршрут с нуля или начните с готового шаблона</p>
            <div className="flex items-center gap-2">
              <button onClick={() => createFlow(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[13px] font-semibold hover:bg-neutral-800 transition-colors">
                <Plus className="w-4 h-4" /> Создать флоу
              </button>
              <button onClick={() => createFlow(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-[13px] font-semibold hover:bg-neutral-50 transition-colors shadow-sm">
                <Route className="w-4 h-4 text-teal-500" /> Шаблон: Онбординг сотрудника
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {flows.map(f => (
              <div key={f.id}
                className="group bg-white rounded-[16px] p-6 flex flex-col transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 relative cursor-pointer"
                onClick={() => renamingId !== f.id && router.push(`${feats.basePath}/${f.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 ${edition === 'pro' ? 'text-violet-500 bg-violet-50' : 'text-teal-500 bg-teal-50'}`}>
                    <Route className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${f.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {f.active ? 'Активен' : 'Черновик'}
                  </span>
                </div>

                {renamingId === f.id ? (
                  <div className="flex items-center gap-1.5 mb-1" onClick={e => e.stopPropagation()}>
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(f); if (e.key === 'Escape') setRenamingId(null); }}
                      className="flex-1 min-w-0 text-[15px] font-bold text-neutral-900 bg-neutral-50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <button onClick={() => commitRename(f)}
                      className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-[16px] font-bold text-neutral-900 mb-1 truncate pr-6">{f.name}</h3>
                )}
                <p className="text-[12px] text-neutral-400 mb-4">{nodeCount(f)} нод · {edgeCount(f)} связей · обновлён {fmtDateTime(f.updatedAt)}</p>

                <div className="mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startRename(f)} title="Переименовать"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDuplicate(f.id)} title="Дублировать"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExport(f)} title="Экспорт JSON"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(f.id)} title={confirmDeleteId === f.id ? 'Нажмите ещё раз для удаления' : 'Удалить'}
                    className={`h-8 rounded-lg flex items-center justify-center transition-all ${confirmDeleteId === f.id ? 'px-2.5 bg-red-500 text-white text-[11px] font-bold gap-1' : 'w-8 text-neutral-400 hover:bg-red-50 hover:text-red-500'}`}>
                    <Trash2 className="w-3.5 h-3.5" />{confirmDeleteId === f.id && 'Точно?'}
                  </button>
                </div>

                <div className="absolute top-6 right-6 text-neutral-300 group-hover:text-neutral-900 transition-colors pointer-events-none opacity-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            ))}

            {/* Create card */}
            <button onClick={() => createFlow(true)}
              className="border-2 border-dashed border-neutral-200 rounded-[16px] p-6 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 hover:bg-white/60 transition-all min-h-[180px]">
              <Route className="w-6 h-6" />
              <span className="text-[13px] font-semibold">Из шаблона: Онбординг сотрудника</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
