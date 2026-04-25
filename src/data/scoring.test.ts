import { describe, expect, it } from "vitest";
import { calculateFocusScore, elapsedFocusMinutes, formatMinutes, formatTimer } from "./scoring";
import { FocusSession, InterventionEvent, Task } from "./types";

const session: FocusSession = {
  id: "session-test",
  taskIds: ["task-1"],
  plannedMinutes: 50,
  elapsedSeconds: 45 * 60,
  accumulatedSeconds: 45 * 60,
  difficulty: "strict",
  protectionStatus: "applied",
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

describe("second-based timer helpers", () => {
  it("derives whole focus minutes from elapsed seconds", () => {
    expect(elapsedFocusMinutes(59)).toBe(0);
    expect(elapsedFocusMinutes(60)).toBe(1);
    expect(elapsedFocusMinutes(125)).toBe(2);
  });

  it("formats live timer labels", () => {
    expect(formatTimer(0)).toBe("00:00");
    expect(formatTimer(65)).toBe("01:05");
    expect(formatTimer(3661)).toBe("1:01:01");
  });
});
