import { describe, expect, it } from "vitest";
import { calculateFocusScore, formatMinutes } from "./scoring";
import { FocusSession, InterventionEvent, Task } from "./types";

const session: FocusSession = {
  id: "session-test",
  taskIds: ["task-1"],
  plannedMinutes: 50,
  actualMinutes: 45,
  difficulty: "strict",
  status: "completed"
};

const tasks: Task[] = [
  {
    id: "task-1",
    title: "Write plan",
    category: "Work",
    estimateMinutes: 50,
    priority: "high",
    status: "completed"
  }
];

it("scores focus sessions from time, completed tasks, blocked attempts, and bypasses", () => {
  const interventions: InterventionEvent[] = [
    { id: "1", targetId: "social", sessionId: "session-test", action: "blocked", createdAt: "" },
    { id: "2", targetId: "social", sessionId: "session-test", action: "blocked", createdAt: "" },
    { id: "3", targetId: "news", sessionId: "session-test", action: "bypassed", createdAt: "" }
  ];

  expect(calculateFocusScore(session, tasks, interventions)).toMatchObject({
    completedTasks: 1,
    blockedAttempts: 2,
    bypasses: 1,
    focusMinutes: 45
  });
});

describe("formatMinutes", () => {
  it("formats minutes as compact productivity labels", () => {
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(225)).toBe("3h 45m");
  });
});
