// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — ПРОВЕРКА СЦЕНАРИЯ
//
// Пошаговой симуляции в MVP нет, но перед включением человек должен понимать,
// что произойдёт. Это статический разбор: он отвечает на вопросы пользователя
// («сколько людей, что им придёт, сколько это займёт»), а не перечисляет
// технические претензии к графу.
// ═══════════════════════════════════════════════════════════════════════════════

import { Edge } from '@xyflow/react';
import { Employee } from '@/lib/platform/profile';
import { NOTIFY_CHANNELS } from '@/lib/platform/channels';
import { FlowNode, FlowSettings, StepData } from './types';
import { isConfigured, stepDef, stepOutputs, notifyText } from './registry';
import { audienceOf, impossibleRules, totalReachable } from './audience';
import { Edition, EDITIONS, startEventAllowed, unsupportedSteps } from './editions';
import { CONTENT_TYPE_LABEL, pauseInDays } from './data';

export interface CheckItem {
  level: 'ok' | 'warn' | 'error';
  text: string;
  nodeId?: string;
}

export interface CheckReport {
  items: CheckItem[];
  errors: number;
  warnings: number;
  /** Сколько человек попадает в сценарий */
  reach: number;
  audience: Employee[];
  canActivate: boolean;
}

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

/** Самый длинный путь по сценарию в днях — оценка «сколько это тянется». */
function longestPathDays(nodes: FlowNode[], edges: Edge[], startId: string): number {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const out = new Map<string, Edge[]>();
  edges.forEach(e => { const a = out.get(e.source) || []; a.push(e); out.set(e.source, a); });

  // Обход идёт по всем путям, поэтому на сценарии с десятком развилок число
  // веток растёт лавинообразно — ограничиваем бюджет шагов.
  let budget = 5000;

  const walk = (id: string, seen: Set<string>, depth: number): number => {
    if (seen.has(id) || depth > 40 || budget-- <= 0) return 0;
    const node = byId.get(id);
    if (!node) return 0;
    const d = node.data;
    // Сценарий задерживают ТОЛЬКО шаги ожидания. Срок прохождения у контента —
    // это ограничение для сотрудника, а не пауза: назначение происходит мгновенно
    // и сценарий сразу идёт дальше.
    const own = d.step === 'wait'
      ? (d.waitMode === 'completion' ? (d.waitLimitDays ?? 0) : pauseInDays(d.pauseValue, d.pauseUnit))
      : 0;
    const next = out.get(id) || [];
    if (next.length === 0) return own;
    const nextSeen = new Set(seen).add(id);
    return own + Math.max(...next.map(e => walk(e.target, nextSeen, depth + 1)));
  };

  return Math.round(walk(startId, new Set(), 0));
}

/** Шаги, до которых вообще можно дойти от запуска. */
function reachableFrom(nodes: FlowNode[], edges: Edge[], startId: string): Set<string> {
  const out = new Map<string, string[]>();
  edges.forEach(e => { const a = out.get(e.source) || []; a.push(e.target); out.set(e.source, a); });
  const seen = new Set<string>();
  const stack = [startId];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    (out.get(id) || []).forEach(t => stack.push(t));
  }
  return seen;
}

/**
 * Шаги, из которых можно дойти до конца сценария.
 * Конец — это шаг «Финиш» либо шаг, из которого не выходит ни одной связи.
 * Всё, что не попало в это множество, зациклено: участник будет ходить по кругу
 * бесконечно, получая уведомления снова и снова.
 */
function canFinishFrom(nodes: FlowNode[], edges: Edge[]): Set<string> {
  const incoming = new Map<string, string[]>();
  const hasOutgoing = new Set<string>();
  edges.forEach(e => {
    hasOutgoing.add(e.source);
    const a = incoming.get(e.target) || [];
    a.push(e.source);
    incoming.set(e.target, a);
  });

  const terminals = nodes
    .filter(n => n.data.step === 'end' || !hasOutgoing.has(n.id))
    .map(n => n.id);

  const ok = new Set<string>();
  const stack = [...terminals];
  while (stack.length) {
    const id = stack.pop()!;
    if (ok.has(id)) continue;
    ok.add(id);
    (incoming.get(id) || []).forEach(src => stack.push(src));
  }
  return ok;
}

export function checkFlow(
  nodes: FlowNode[],
  edges: Edge[],
  settings: FlowSettings,
  edition: Edition,
): CheckReport {
  const items: CheckItem[] = [];

  // ── Версия инструмента ──
  // Шаг из Pro мог попасть в MVP-сценарий импортом файла или вставкой из буфера.
  // Включать такой сценарий нельзя: платформа остановится на неизвестном шаге.
  const foreign = unsupportedSteps(edition, nodes.map(n => n.data.step));
  foreign.forEach(step => {
    const label = stepDef(step).label;
    items.push({
      level: 'error',
      text: `Шаг «${label}» доступен только в ${EDITIONS.pro.title}`,
      nodeId: nodes.find(n => n.data.step === step)?.id,
    });
  });

  if (!startEventAllowed(edition, settings.startEvent)) {
    items.push({
      level: 'error',
      text: `Выбранное событие запуска доступно только в ${EDITIONS.pro.title}`,
    });
  }

  const audience = audienceOf(settings.audience);
  const start = nodes.find(n => n.data.step === 'start');

  // ── Аудитория ──
  if (settings.audience.filter(r => r.values.length > 0).length === 0) {
    items.push({
      level: 'warn',
      text: `Условий отбора нет — сценарий получат все ${totalReachable()} сотрудников`,
    });
  }
  const dead = impossibleRules(settings.audience);
  dead.forEach(r => items.push({
    level: 'error',
    text: `Под условие «${r.values.join(', ')}» не подходит ни один сотрудник`,
  }));

  if (audience.length === 0 && dead.length === 0) {
    items.push({ level: 'error', text: 'Под условия отбора не подходит ни один сотрудник' });
  } else if (audience.length > 0) {
    const n = audience.length;
    items.push({
      level: 'ok',
      text: `${plural(n, 'Попадает', 'Попадают', 'Попадают')} ${n} ${plural(n, 'сотрудник', 'сотрудника', 'сотрудников')}`,
    });
  }

  if (!start) {
    items.push({ level: 'error', text: 'В сценарии нет шага «Запуск»' });
    return { items, errors: items.filter(i => i.level === 'error').length, warnings: 0, reach: audience.length, audience, canActivate: false };
  }

  const reachable = reachableFrom(nodes, edges, start.id);

  // ── Что назначается ──
  const contentSteps = nodes.filter(n => n.data.step === 'content' && reachable.has(n.id) && n.data.item);
  if (contentSteps.length > 0) {
    const byType = new Map<string, number>();
    contentSteps.forEach(n => {
      const t = n.data.item!.type;
      byType.set(t, (byType.get(t) || 0) + 1);
    });
    const parts = [...byType.entries()].map(([t, n]) => `${n} × ${(CONTENT_TYPE_LABEL[t] || t).toLowerCase()}`);
    items.push({ level: 'ok', text: `Назначается: ${parts.join(', ')}` });
  }

  // ── Уведомления ──
  const notifySteps = nodes.filter(n => n.data.step === 'notify' && reachable.has(n.id));
  if (notifySteps.length > 0) {
    const n = notifySteps.length;
    items.push({
      level: 'ok',
      text: n === 1
        ? 'Каждый получит одно уведомление'
        : `Каждый получит до ${n} ${plural(n, 'уведомления', 'уведомлений', 'уведомлений')}`,
    });
  }

  // ── Сроки ──
  const days = longestPathDays(nodes, edges, start.id);
  if (days > 0) {
    items.push({ level: 'ok', text: `Полный путь занимает около ${days} ${plural(days, 'дня', 'дней', 'дней')}` });
  }

  // ── Тихие часы ──
  if (settings.quietHours.enabled && notifySteps.length > 0) {
    items.push({
      level: 'ok',
      text: `Уведомления уходят только с ${settings.quietHours.from} до ${settings.quietHours.to}`,
    });
  }

  // ── Проблемы по шагам ──
  nodes.forEach(n => {
    const def = stepDef(n.data.step);
    const d: StepData = n.data;

    if (!isConfigured(d)) {
      items.push({ level: 'error', text: `Шаг «${def.label}» не заполнен до конца`, nodeId: n.id });
    }

    if (d.step !== 'start' && !edges.some(e => e.target === n.id)) {
      items.push({ level: 'error', text: `Шаг «${def.label}» ни с чем не соединён — до него никто не дойдёт`, nodeId: n.id });
    } else if (d.step !== 'start' && !reachable.has(n.id)) {
      items.push({ level: 'warn', text: `До шага «${def.label}» нельзя дойти от запуска`, nodeId: n.id });
    }

    const outs = stepOutputs(d);
    if (outs.length > 1) {
      outs.forEach(o => {
        if (!edges.some(e => e.source === n.id && e.sourceHandle === o.id)) {
          items.push({
            level: 'warn',
            text: `«${def.label}»: не указано, что делать дальше в случае «${o.label}»`,
            nodeId: n.id,
          });
        }
      });
    } else if (outs.length === 1 && d.step !== 'end' && !edges.some(e => e.source === n.id)) {
      items.push({ level: 'warn', text: `После шага «${def.label}» ничего не произойдёт`, nodeId: n.id });
    }

    // Развилка без «остальных» — часть людей просто выпадет из сценария
    if (d.step === 'branch' && d.branchElse === false && d.branchField && (d.branchValues?.length ?? 0) > 0) {
      const covered = new Set(d.branchValues);
      const dropped = audience.filter(e => !covered.has(String(e[d.branchField!] ?? ''))).length;
      if (dropped > 0) {
        const where = def.summary(d) || def.label;
        items.push({
          level: 'warn',
          text: `На развилке «${where}» ${dropped} ${plural(dropped, 'сотрудник выпадет', 'сотрудника выпадут', 'сотрудников выпадут')} из сценария — включите ветку «Все остальные»`,
          nodeId: n.id,
        });
      }
    }

    // Каналы и язык уведомления
    if (d.step === 'notify' && reachable.has(n.id)) {
      const chosen = d.channels || [];
      const broken = chosen.filter(c => !NOTIFY_CHANNELS.find(x => x.value === c)?.connected);
      broken.forEach(c => items.push({
        level: 'error',
        text: `Канал ${NOTIFY_CHANNELS.find(x => x.value === c)?.label} не подключён — уведомление не уйдёт`,
        nodeId: n.id,
      }));

      const usable = chosen.filter(c => !broken.includes(c));
      if (usable.length > 0 && d.recipient === 'employee') {
        const noChannel = audience.filter(e => !usable.some(c => e.channels.includes(c as never)));
        if (noChannel.length > 0) {
          items.push({
            level: 'warn',
            text: `${noChannel.length} ${plural(noChannel.length, 'сотрудник не получит', 'сотрудника не получат', 'сотрудников не получат')} это уведомление: нет ни одного из выбранных каналов`,
            nodeId: n.id,
          });
        }
      }

      if (!notifyText(d, 'uz').trim() && notifyText(d, 'ru').trim()) {
        const uz = audience.filter(e => e.lang === 'UZ').length;
        if (uz > 0) {
          items.push({
            level: 'warn',
            text: `Узбекский текст не заполнен — ${uz} ${plural(uz, 'сотрудник получит', 'сотрудника получат', 'сотрудников получат')} русскую версию`,
            nodeId: n.id,
          });
        }
      }
    }
  });

  // ── Зацикливание ──
  const finishing = canFinishFrom(nodes, edges);
  const looped = nodes.filter(n => reachable.has(n.id) && !finishing.has(n.id));
  if (looped.length > 0) {
    const names = [...new Set(looped.map(n => stepDef(n.data.step).label))].slice(0, 3).join(', ');
    items.push({
      level: 'error',
      text: `Сценарий зациклен: из шагов «${names}» нельзя дойти до конца — участники будут ходить по кругу бесконечно`,
      nodeId: looped[0].id,
    });
  }

  if (!nodes.some(n => n.data.step === 'end')) {
    items.push({ level: 'warn', text: 'В сценарии нет шага «Финиш» — непонятно, где он заканчивается' });
  }

  const errors = items.filter(i => i.level === 'error').length;
  const warnings = items.filter(i => i.level === 'warn').length;

  return {
    items,
    errors,
    warnings,
    reach: audience.length,
    audience,
    canActivate: errors === 0,
  };
}
