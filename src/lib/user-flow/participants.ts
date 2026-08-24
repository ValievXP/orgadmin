// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — УЧАСТНИКИ СЦЕНАРИЯ
//
// Включённый сценарий не должен быть чёрным ящиком: администратор обязан видеть,
// кто в нём, на каком шаге и кто застрял.
//
// В прототипе состояние участников ВЫЧИСЛЯЕТСЯ из схемы, аудитории и даты
// включения — стабильно для одного и того же сценария. В проде эта же структура
// приезжает из таблицы состояний: разработчику остаётся заменить источник,
// не трогая интерфейс.
//
// Развилки при этом разбираются по НАСТОЯЩИМ данным профиля — то есть распределение
// людей по веткам показывается честно; моделируется только время прохождения.
// ═══════════════════════════════════════════════════════════════════════════════

import { Edge } from '@xyflow/react';
import { Employee, employeeValue } from '@/lib/platform/profile';
import { FlowNode, FlowDoc, StepData } from './types';
import { stepDef, isConfigured } from './registry';
import { audienceOf } from './audience';
import { pauseInDays } from './data';

export type ParticipantState = 'running' | 'done' | 'stuck' | 'stopped';

export interface Participant {
  employee: Employee;
  enteredAt: number;
  /** Где человек находится сейчас */
  stepId?: string;
  where: string;
  state: ParticipantState;
  /** Сколько дней в сценарии */
  daysIn: number;
}

export interface ParticipantStats {
  entered: number;
  running: number;
  done: number;
  stuck: number;
  stopped: number;
}

const DAY = 864e5;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Куда шаг направит конкретного сотрудника. */
function chooseHandle(d: StepData, emp: Employee, rand: () => number): { handle?: string; timedOut?: boolean; cost: number } {
  switch (d.step) {
    case 'branch': {
      if (!d.branchField) return { cost: 0 };
      const value = employeeValue(emp, d.branchField);
      const hit = (d.branchValues || []).includes(value);
      return { handle: hit ? `b-${value}` : 'else', cost: 0 };
    }
    case 'wait': {
      if (d.waitMode === 'completion') {
        const limit = d.waitLimitDays === 0 ? 60 : (d.waitLimitDays ?? 7);
        // Сколько сотруднику нужно на прохождение — стабильная для него величина
        const need = Math.round(rand() * limit * 1.4) + 1;
        const timedOut = need > limit;
        return { handle: timedOut ? 'timeout' : 'done', timedOut, cost: Math.min(need, limit) };
      }
      return { cost: pauseInDays(d.pauseValue, d.pauseUnit) };
    }
    case 'check_result': {
      return { handle: rand() > 0.35 ? 'yes' : 'no', cost: 0 };
    }
    default:
      return { cost: 0 };
  }
}

function describeWhere(d: StepData): string {
  const def = stepDef(d.step);
  const summary = def.summary(d);
  return summary ? `${def.label}: ${summary}` : def.label;
}

/**
 * Состояние всех участников включённого сценария.
 *
 * `atTime` — момент, на который смотрим. По умолчанию сейчас; в прототипе
 * позволяет показать, как сценарий будет выглядеть через несколько дней,
 * не дожидаясь их наступления.
 */
export function participantsOf(flow: FlowDoc, atTime: number = Date.now()): Participant[] {
  if (!flow.active || !flow.activatedAt) return [];

  const nodes = (flow.nodes as FlowNode[]) || [];
  const edges = (flow.edges as Edge[]) || [];
  const start = nodes.find(n => n.data?.step === 'start');
  if (!start) return [];

  const byId = new Map(nodes.map(n => [n.id, n]));
  const outgoing = new Map<string, Edge[]>();
  edges.forEach(e => { const a = outgoing.get(e.source) || []; a.push(e); outgoing.set(e.source, a); });

  const elapsedDays = Math.max(0, (atTime - flow.activatedAt) / DAY);

  // «Только для новых» — люди подключаются постепенно, а не все в момент включения
  const pool = audienceOf(flow.settings.audience);

  return pool.flatMap<Participant>(emp => {
    const rand = rng(hash(flow.id) + emp.id * 7919);

    // Момент входа зависит от того, кого захватили при включении:
    //   all — все подходящие входят сразу в момент включения;
    //   new — входят только те, кто появится ПОСЛЕ включения, поэтому момент
    //         входа разбросан по горизонту и не зависит от того, сколько
    //         времени уже прошло. Сразу после включения участников нет вообще.
    const NEW_HORIZON = 45;                            // дней, за которые набирается аудитория
    const entryOffset = flow.settings.applyTo === 'all' ? 0 : rand() * NEW_HORIZON;
    if (entryOffset > elapsedDays) return [];          // ещё не появился на платформе

    const enteredAt = flow.activatedAt! + entryOffset * DAY;
    const budget = elapsedDays - entryOffset;

    let cur: FlowNode | undefined = start;
    let spent = 0;
    let guard = 0;

    while (cur && guard++ < 60) {
      const d = cur.data;

      if (d.step === 'end') {
        return [{
          employee: emp, enteredAt, stepId: cur.id,
          where: d.endStatus === 'aborted' ? 'Сценарий прерван' : 'Сценарий пройден',
          state: d.endStatus === 'aborted' ? 'stopped' : 'done',
          daysIn: Math.round(budget),
        }];
      }

      if (!isConfigured(d)) {
        return [{
          employee: emp, enteredAt, stepId: cur.id,
          where: `${stepDef(d.step).label} — шаг не заполнен`,
          state: 'stuck', daysIn: Math.round(budget),
        }];
      }

      const { handle, timedOut, cost } = chooseHandle(d, emp, rand);

      // Время на этом шаге ещё не вышло — человек находится здесь
      if (spent + cost > budget) {
        const waitingTooLong = d.step === 'wait' && d.waitMode === 'completion' && timedOut;
        return [{
          employee: emp, enteredAt, stepId: cur.id,
          where: describeWhere(d),
          state: waitingTooLong ? 'stuck' : 'running',
          daysIn: Math.round(budget),
        }];
      }

      spent += cost;
      const next = (outgoing.get(cur.id) || []).filter(e => handle === undefined || e.sourceHandle === handle);
      if (next.length === 0) {
        return [{
          employee: emp, enteredAt, stepId: cur.id,
          where: `${describeWhere(d)} — дальше ничего не настроено`,
          state: 'stopped', daysIn: Math.round(budget),
        }];
      }
      cur = byId.get(next[0].target);
    }

    return [{
      employee: emp, enteredAt, stepId: cur?.id,
      where: 'Сценарий зациклился',
      state: 'stopped', daysIn: Math.round(budget),
    }];
  });
}

export function participantStats(list: Participant[]): ParticipantStats {
  return {
    entered: list.length,
    running: list.filter(p => p.state === 'running').length,
    done:    list.filter(p => p.state === 'done').length,
    stuck:   list.filter(p => p.state === 'stuck').length,
    stopped: list.filter(p => p.state === 'stopped').length,
  };
}

export const STATE_LABEL: Record<ParticipantState, string> = {
  running: 'Идёт',
  done:    'Завершил',
  stuck:   'Застрял',
  stopped: 'Остановлен',
};

export const STATE_STYLE: Record<ParticipantState, string> = {
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  done:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  stuck:   'bg-amber-50 text-amber-700 border-amber-200',
  stopped: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};
