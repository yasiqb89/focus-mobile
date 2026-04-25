import { describe, expect, it } from "vitest";
import { FocusState, deriveElapsedSeconds, initialState, migrateSnapshot, reducer } from "./focusReducer";

function hydratedState(overrides: Partial<FocusState> = {}): FocusState {
  return {
    ...initialState,
    hydrated: true,
    onboarded: true,
    ...overrides
  };
}

describe("focus reducer session timing", () => {
  it("starts a task-backed session and derives elapsed time from timestamps", () => {
    const state = hydratedState({
      tasks: [
        {
          id: "task-1",
          title: "Write",
          category: "Focus",
          estimateMinutes: 25,
          priority: "normal",
          status: "todo"
        }
      ]
    });

    const started = reducer(state, { type: "start-task", taskId: "task-1" });
    expect(started.activeSession).toMatchObject({
      taskIds: ["task-1"],
      plannedMinutes: 25,
      elapsedSeconds: 0,
      accumulatedSeconds: 0,
      status: "running"
    });

    const startedAt = new Date(started.activeSession.lastStartedAt!).getTime();
    expect(deriveElapsedSeconds(started.activeSession, startedAt + 61_000)).toBe(61);
  });

  it("reconciles, pauses, and resets session time", () => {
    const lastStartedAt = "2026-04-25T10:00:00.000Z";
    const running = hydratedState({
      activeSession: {
        ...initialState.activeSession,
        startAt: lastStartedAt,
        lastStartedAt,
        elapsedSeconds: 0,
        accumulatedSeconds: 42,
        status: "running"
      }
    });

    const reconciled = reducer(running, { type: "reconcile-session", now: "2026-04-25T10:01:00.000Z" });
    expect(reconciled.activeSession.elapsedSeconds).toBe(102);

    const paused = reducer(reconciled, { type: "pause-session" });
    expect(reducer(paused, { type: "tick-second" }).activeSession.status).toBe("paused");
    expect(reducer(paused, { type: "reset-session" }).activeSession).toMatchObject({
      elapsedSeconds: 0,
      accumulatedSeconds: 0,
      status: "idle"
    });
  });
});

describe("snapshot migration", () => {
  it("migrates old minute-based snapshots to elapsed seconds", () => {
    const { elapsedSeconds, ...legacySession } = initialState.activeSession;
    const migrated = migrateSnapshot({
      ...hydratedState(),
      activeSession: {
        ...legacySession,
        actualMinutes: 7
      }
    });

    expect(migrated?.activeSession.elapsedSeconds).toBe(420);
  });
});
