import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { calculateFocusScore } from "@/data/scoring";
import { friends, initialBudgets, initialInterventions, initialRules, initialScores, initialSession, initialTasks } from "@/data/seed";
import { loadSnapshot, saveSnapshot } from "@/data/sqliteStore";
import {
  AppBudget,
  BlockRule,
  Difficulty,
  FocusScore,
  FocusSession,
  FriendSummary,
  InterventionEvent,
  PermissionStatus,
  Task
} from "@/data/types";

export type FocusState = {
  hydrated: boolean;
  onboarded: boolean;
  userName: string;
  permissionStatus: PermissionStatus;
  tasks: Task[];
  activeSession: FocusSession;
  rules: BlockRule[];
  budgets: AppBudget[];
  interventions: InterventionEvent[];
  scores: FocusScore[];
  friends: FriendSummary[];
};

type FocusAction =
  | { type: "hydrate"; snapshot: FocusState | null }
  | { type: "set-permission"; status: PermissionStatus }
  | { type: "set-name"; name: string }
  | { type: "finish-onboarding" }
  | { type: "add-task"; title: string; estimateMinutes: number; category: string }
  | { type: "start-task"; taskId: string }
  | { type: "complete-task"; taskId: string }
  | { type: "set-difficulty"; difficulty: Difficulty }
  | { type: "start-session" }
  | { type: "pause-session" }
  | { type: "reset-session" }
  | { type: "complete-session" }
  | { type: "tick-minute" }
  | { type: "toggle-rule"; ruleId: string }
  | { type: "set-budget-used"; budgetId: string; usedMinutes: number }
  | { type: "remove-target"; targetId: string }
  | { type: "intervention"; targetId: string; action: InterventionEvent["action"] };

const initialState: FocusState = {
  hydrated: false,
  onboarded: false,
  userName: "",
  permissionStatus: "unknown",
  tasks: initialTasks,
  activeSession: initialSession,
  rules: initialRules,
  budgets: initialBudgets,
  interventions: initialInterventions,
  scores: initialScores,
  friends
};

function activeTaskIds(tasks: Task[], fallbackTaskId?: string): string[] {
  const inProgress = tasks.filter((task) => task.status === "in-progress").map((task) => task.id);
  return inProgress.length ? inProgress : fallbackTaskId ? [fallbackTaskId] : [];
}

function reducer(state: FocusState, action: FocusAction): FocusState {
  switch (action.type) {
    case "hydrate":
      return action.snapshot ? { ...action.snapshot, hydrated: true } : { ...state, hydrated: true };
    case "set-permission":
      return { ...state, permissionStatus: action.status };
    case "set-name":
      return {
        ...state,
        userName: action.name,
        friends: state.friends.map((f) => (f.id === "you" ? { ...f, name: action.name || "You" } : f))
      };
    case "finish-onboarding":
      return { ...state, onboarded: true };
    case "add-task": {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: action.title.trim(),
        category: action.category,
        estimateMinutes: action.estimateMinutes,
        priority: "normal",
        status: "todo"
      };
      return { ...state, tasks: [task, ...state.tasks] };
    }
    case "start-task": {
      const tasks = state.tasks.map((task) => ({
        ...task,
        status:
          task.id === action.taskId
            ? ("in-progress" as const)
            : task.status === "in-progress"
              ? ("todo" as const)
              : task.status
      }));
      const selected = tasks.find((task) => task.id === action.taskId);
      return {
        ...state,
        tasks,
        activeSession: {
          ...state.activeSession,
          id: `session-${Date.now()}`,
          taskIds: activeTaskIds(tasks, action.taskId),
          plannedMinutes: selected?.estimateMinutes ?? state.activeSession.plannedMinutes,
          actualMinutes: 0,
          status: "running",
          startAt: new Date().toISOString(),
          endAt: undefined
        }
      };
    }
    case "complete-task": {
      const tasks = state.tasks.map((task) =>
        task.id === action.taskId
          ? { ...task, status: "completed" as const, completedAt: new Date().toISOString() }
          : task
      );
      return { ...state, tasks };
    }
    case "set-difficulty":
      return { ...state, activeSession: { ...state.activeSession, difficulty: action.difficulty } };
    case "start-session":
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          id: state.activeSession.status === "completed" ? `session-${Date.now()}` : state.activeSession.id,
          status: "running",
          startAt: state.activeSession.startAt ?? new Date().toISOString(),
          endAt: undefined
        }
      };
    case "pause-session":
      return { ...state, activeSession: { ...state.activeSession, status: "paused" } };
    case "reset-session":
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          actualMinutes: 0,
          status: "idle",
          startAt: undefined,
          endAt: undefined
        }
      };
    case "complete-session": {
      const completedSession = {
        ...state.activeSession,
        status: "completed" as const,
        endAt: new Date().toISOString()
      };
      const tasks = state.tasks.map((task) =>
        completedSession.taskIds.includes(task.id)
          ? { ...task, status: "completed" as const, completedAt: new Date().toISOString() }
          : task
      );
      const score = {
        ...calculateFocusScore(completedSession, tasks, state.interventions),
        completedAt: new Date().toISOString()
      };
      const totalFocusMinutes = state.scores.reduce((sum, s) => sum + s.focusMinutes, 0) + score.focusMinutes;
      const updatedFriends = state.friends.map((f) =>
        f.id === "you"
          ? { ...f, focusHours: Math.round((totalFocusMinutes / 60) * 10) / 10, score: score.score }
          : f
      );
      return {
        ...state,
        tasks,
        activeSession: completedSession,
        scores: [score, ...state.scores.filter((item) => item.sessionId !== score.sessionId)],
        friends: updatedFriends
      };
    }
    case "tick-minute":
      if (state.activeSession.status !== "running") return state;
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          actualMinutes: state.activeSession.actualMinutes + 1
        }
      };
    case "toggle-rule":
      return {
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId ? { ...rule, enabled: !rule.enabled } : rule
        )
      };
    case "set-budget-used":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.budgetId ? { ...budget, usedMinutes: action.usedMinutes } : budget
        )
      };
    case "remove-target":
      return {
        ...state,
        rules: state.rules.map((rule) => ({
          ...rule,
          targetIds: rule.targetIds.filter((id) => id !== action.targetId)
        }))
      };
    case "intervention": {
      const event: InterventionEvent = {
        id: `event-${Date.now()}`,
        targetId: action.targetId,
        sessionId: state.activeSession.id,
        action: action.action,
        createdAt: new Date().toISOString()
      };
      return { ...state, interventions: [event, ...state.interventions] };
    }
    default:
      return state;
  }
}

type FocusContextValue = FocusState & {
  dispatch: React.Dispatch<FocusAction>;
  currentScore: FocusScore;
};

const FocusContext = createContext<FocusContextValue | null>(null);

export function FocusProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "hydrate", snapshot: loadSnapshot<FocusState>() });
  }, []);

  useEffect(() => {
    if (state.hydrated) saveSnapshot(state);
  }, [state]);

  const currentScore = useMemo(
    () => calculateFocusScore(state.activeSession, state.tasks, state.interventions),
    [state.activeSession, state.tasks, state.interventions]
  );

  const value = useMemo(() => ({ ...state, dispatch, currentScore }), [state, currentScore]);

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusStore() {
  const value = useContext(FocusContext);
  if (!value) throw new Error("useFocusStore must be used inside FocusProvider");
  return value;
}
