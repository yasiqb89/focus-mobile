import { describe, expect, it } from "vitest";
import { budgetProgress, isBudgetExceeded, isRuleActive } from "./schedule";
import { AppBudget, BlockRule } from "./types";

const rule: BlockRule = {
  id: "rule",
  name: "Morning",
  schedule: { days: [1], startTime: "09:00", endTime: "12:00" },
  targetIds: ["social"],
  mode: "focus",
  difficulty: "strict",
  enabled: true
};

describe("isRuleActive", () => {
  it("matches enabled rules by day and time", () => {
    expect(isRuleActive(rule, new Date("2026-04-20T10:30:00"))).toBe(true);
    expect(isRuleActive(rule, new Date("2026-04-20T13:00:00"))).toBe(false);
  });

  it("supports schedules that cross midnight", () => {
    const overnight = { ...rule, schedule: { days: [1], startTime: "21:00", endTime: "02:00" } };
    expect(isRuleActive(overnight, new Date("2026-04-20T23:00:00"))).toBe(true);
  });
});

describe("budgets", () => {
  it("detects exceeded app limits", () => {
    const budget: AppBudget = {
      id: "budget",
      targetId: "video",
      label: "Video",
      dailyLimitMinutes: 30,
      usedMinutes: 45,
      resetAt: ""
    };
    expect(isBudgetExceeded(budget)).toBe(true);
    expect(budgetProgress(budget)).toBe(1);
  });
});
