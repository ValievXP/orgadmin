// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW — АУДИТОРИЯ
//
// Правила отбора и подсчёт охвата. Ключевое требование: число на экране и
// реальный список людей должны считаться ОДНОЙ функцией — иначе они разъедутся,
// и пользователь перестанет доверять инструменту.
// ═══════════════════════════════════════════════════════════════════════════════

import { Employee, EMPLOYEES, employeeValue, getFieldLabel, isActiveEmployee } from '@/lib/platform/profile';
import { AudienceRule } from './types';

export const newRuleId = () => `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/** Подходит ли сотрудник под все правила. Между правилами — И. */
export function matches(emp: Employee, rules: AudienceRule[]): boolean {
  return rules.every(rule => {
    if (rule.values.length === 0) return true;   // правило без значений ничего не отсекает
    const hit = rule.values.includes(employeeValue(emp, rule.field));
    return rule.op === 'not' ? !hit : hit;
  });
}

/**
 * Список сотрудников, попадающих в сценарий.
 * Уволенные исключаются всегда — назначать обучение уволенному бессмысленно,
 * и это ровно тот случай, когда «умолчание» важнее гибкости.
 */
export function audienceOf(rules: AudienceRule[]): Employee[] {
  return EMPLOYEES.filter(isActiveEmployee).filter(e => matches(e, rules));
}

export const audienceSize = (rules: AudienceRule[]) => audienceOf(rules).length;

/** Всего людей, доступных для сценариев. */
export const totalReachable = () => EMPLOYEES.filter(isActiveEmployee).length;

/** Пересказ правил одной строкой — для карточки сценария и шапки. */
export function describeAudience(rules: AudienceRule[]): string {
  const meaningful = rules.filter(r => r.values.length > 0);
  if (meaningful.length === 0) return 'Все сотрудники';
  return meaningful
    .map(r => {
      const v = r.values.length === 1 ? r.values[0] : `${r.values.length} значений`;
      return `${getFieldLabel(r.field)} ${r.op === 'not' ? '≠' : '='} ${v}`;
    })
    .join(' · ');
}

/** Правила, которые не отбирают никого — частая причина «сценарий не работает». */
export function impossibleRules(rules: AudienceRule[]): AudienceRule[] {
  return rules.filter(r => r.values.length > 0 && audienceOf([r]).length === 0);
}
