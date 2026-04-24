import { AppBudget, BlockRule } from "./types";

function minutesFromClock(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isRuleActive(rule: BlockRule, date = new Date()): boolean {
  if (!rule.enabled) return false;
  if (!rule.schedule.days.includes(date.getDay())) return false;

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const start = minutesFromClock(rule.schedule.startTime);
  const end = minutesFromClock(rule.schedule.endTime);

  if (start <= end) {
    return nowMinutes >= start && nowMinutes <= end;
  }

  return nowMinutes >= start || nowMinutes <= end;
}

export function isBudgetExceeded(budget: AppBudget): boolean {
  return budget.usedMinutes >= budget.dailyLimitMinutes;
}

export function budgetProgress(budget: AppBudget): number {
  if (budget.dailyLimitMinutes <= 0) return 1;
  return Math.min(budget.usedMinutes / budget.dailyLimitMinutes, 1);
}
