import { calculateFocusScore } from "../data/scoring";
import {
  friends,
  initialBudgets,
  initialInterventions,
  initialMilestones,
  initialReminders,
  initialRules,
  initialScores,
  initialSession,
  initialTargets,
  initialTasks
} from "../data/seed";
import {
  AccessMode,
  AppBudget,
  AppTarget,
  BlockMode,
  BlockRule,
  Difficulty,
  FocusReminder,
  FocusScore,
  FocusSession,
  FriendSummary,
  InterventionEvent,
  Milestone,
  PermissionStatus,
  ProtectionStatus,
  SessionRecord,
  Task
} from "../data/types";

const SCHEMA_VERSION = 2;

export type FocusState = {
  schemaVersion: number;
  hydrated: boolean;
  onboarded: boolean;
  userName: string;
  permissionStatus: PermissionStatus;
  defaultSessionMinutes: number;
  tasks: Task[];
  activeSession: FocusSession;
  sessionRecords: SessionRecord[];
  rules: BlockRule[];
  budgets: AppBudget[];
  targets: AppTarget[];
  interventions: InterventionEvent[];
  scores: FocusScore[];
  milestones: Milestone[];
  reminders: FocusReminder[];
  friends: FriendSummary[];
  updatedAt?: string;
};

export type PersistedSession = Partial<Omit<FocusSession, "elapsedSeconds" | "accumulatedSeconds">> & {
  elapsedSeconds?: number;
  accumulatedSeconds?: number;
  actualMinutes?: number;
};

export type PersistedState = Partial<Omit<FocusState, "activeSession">> & {
  schemaVersion?: number;
  activeSession?: PersistedSession;
};

export type FocusAction =
  | { type: "hydrate"; snapshot: PersistedState | FocusState | null }
  | { type: "set-permission"; status: PermissionStatus }
  | { type: "set-name"; name: string }
  | { type: "set-default-session-minutes"; minutes: number }
  | { type: "finish-onboarding" }
  | { type: "add-task"; title: string; estimateMinutes: number; category: string }
  | { type: "update-task"; taskId: string; title: string; estimateMinutes: number; category: string }
  | { type: "delete-task"; taskId: string }
  | { type: "move-task"; taskId: string; direction: "up" | "down" }
  | { type: "start-task"; taskId: string }
  | { type: "complete-task"; taskId: string }
  | { type: "set-difficulty"; difficulty: Difficulty }
  | { type: "start-session"; taskId?: string }
  | { type: "pause-session" }
  | { type: "reset-session" }
  | { type: "complete-session" }
  | { type: "tick-second" }
  | { type: "reconcile-session"; now?: string }
  | { type: "set-protection"; status: ProtectionStatus; message?: string }
  | { type: "start-break"; minutes: number; reason: string }
  | { type: "end-break" }
  | { type: "toggle-rule"; ruleId: string }
  | { type: "add-rule"; name: string; mode: BlockMode; targetIds: string[]; startTime?: string; endTime?: string }
  | { type: "delete-rule"; ruleId: string }
  | { type: "set-rule-window"; ruleId: string; startTime: string; endTime: string }
  | { type: "set-rule-difficulty"; ruleId: string; difficulty: Difficulty }
  | { type: "set-rule-access-mode"; ruleId: string; accessMode: AccessMode }
  | { type: "set-rule-breaks"; ruleId: string; breaksAllowed: number }
  | { type: "add-target"; label: string; website?: string }
  | { type: "remove-target"; targetId: string }
  | { type: "set-budget-used"; budgetId: string; usedMinutes: number }
  | { type: "set-budget-limit"; budgetId: string; dailyLimitMinutes: number }
  | { type: "add-budget"; targetId: string; label: string; dailyLimitMinutes: number }
  | { type: "delete-budget"; budgetId: string }
  | { type: "reset-budget"; budgetId: string }
  | { type: "toggle-reminder"; reminderId: string }
  | { type: "set-reminder-time"; reminderId: string; time: string }
  | { type: "intervention"; targetId: string; action: InterventionEvent["action"] }
  | { type: "reset-local-data" };

export const initialState: FocusState = {
  schemaVersion: SCHEMA_VERSION,
  hydrated: false,
  onboarded: false,
  userName: "",
  permissionStatus: "unknown",
  defaultSessionMinutes: initialSession.plannedMinutes,
  tasks: initialTasks,
  activeSession: initialSession,
  sessionRecords: [],
  rules: initialRules,
  budgets: initialBudgets,
  targets: initialTargets,
  interventions: initialInterventions,
  scores: initialScores,
  milestones: initialMilestones,
  reminders: initialReminders,
  friends
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}

function clampMinutes(minutes: number, min = 5, max = 180): number {
  return Math.max(min, Math.min(Math.round(minutes), max));
}

function normalizedClock(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  return "09:00";
}

function activeTaskIds(tasks: Task[], fallbackTaskId?: string): string[] {
  const inProgress = tasks.filter((task) => task.status === "in-progress").map((task) => task.id);
  return inProgress.length ? inProgress : fallbackTaskId ? [fallbackTaskId] : [];
}

export function deriveElapsedSeconds(session: FocusSession, now = Date.now()): number {
  if (session.status !== "running" || !session.lastStartedAt) {
    return Math.max(0, Math.floor(session.accumulatedSeconds ?? session.elapsedSeconds ?? 0));
  }

  const startedAt = new Date(session.lastStartedAt).getTime();
  const liveSeconds = Number.isFinite(startedAt) ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  return Math.max(0, Math.floor((session.accumulatedSeconds ?? 0) + liveSeconds));
}

function reconcileSession(session: FocusSession, now = Date.now()): FocusSession {
  const elapsedSeconds = deriveElapsedSeconds(session, now);
  const breakEndsAt = session.breakEndsAt ? new Date(session.breakEndsAt).getTime() : undefined;
  const breakExpired = breakEndsAt !== undefined && breakEndsAt <= now;

  return {
    ...session,
    elapsedSeconds,
    breakEndsAt: breakExpired ? undefined : session.breakEndsAt,
    breakReason: breakExpired ? undefined : session.breakReason
  };
}

function normalizeSession(session?: PersistedSession): FocusSession {
  if (!session) return initialSession;

  const elapsedSeconds =
    typeof session.elapsedSeconds === "number"
      ? session.elapsedSeconds
      : typeof session.actualMinutes === "number"
        ? session.actualMinutes * 60
        : 0;
  const accumulatedSeconds =
    typeof session.elapsedSeconds !== "number" && typeof session.actualMinutes === "number"
      ? elapsedSeconds
      : typeof session.accumulatedSeconds === "number"
        ? session.accumulatedSeconds
        : elapsedSeconds;

  return reconcileSession({
    ...initialSession,
    ...session,
    id: session.id ?? createId("session"),
    taskIds: session.taskIds ?? [],
    plannedMinutes: clampMinutes(session.plannedMinutes ?? initialSession.plannedMinutes),
    elapsedSeconds,
    accumulatedSeconds,
    difficulty: session.difficulty ?? initialSession.difficulty,
    protectionStatus: session.protectionStatus ?? initialSession.protectionStatus,
    status: session.status ?? initialSession.status
  });
}

function normalizeRule(rule: Partial<BlockRule>): BlockRule {
  return {
    id: rule.id ?? createId("rule"),
    name: rule.name?.trim() || "Focus Block",
    schedule: {
      days: rule.schedule?.days?.length ? rule.schedule.days : [1, 2, 3, 4, 5],
      startTime: normalizedClock(rule.schedule?.startTime ?? "09:00"),
      endTime: normalizedClock(rule.schedule?.endTime ?? "10:00")
    },
    targetIds: rule.targetIds ?? [],
    mode: rule.mode ?? "focus",
    difficulty: rule.difficulty ?? "standard",
    accessMode: rule.accessMode ?? "blocklist",
    breaksAllowed: Math.max(0, Math.min(rule.breaksAllowed ?? 1, 5)),
    enabled: Boolean(rule.enabled)
  };
}

function calculateStreak(scores: FocusScore[]): number {
  const dates = new Set(
    scores
      .filter((score) => score.completedAt && score.focusMinutes > 0)
      .map((score) => {
        const date = new Date(score.completedAt!);
        date.setHours(0, 0, 0, 0);
        return date.toDateString();
      })
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dates.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function unlockMilestones(milestones: Milestone[], scores: FocusScore[], session: FocusSession): Milestone[] {
  const totalMinutes = scores.reduce((sum, score) => sum + score.focusMinutes, 0);
  const streak = calculateStreak(scores);
  const timestamp = nowIso();

  return milestones.map((milestone) => {
    if (milestone.unlockedAt) return milestone;
    const unlocked =
      (milestone.id === "first-session" && scores.length > 0) ||
      (milestone.id === "first-hour" && totalMinutes >= 60) ||
      (milestone.id === "lockdown-win" && session.difficulty === "lockdown" && session.status === "completed") ||
      (milestone.id === "three-day-streak" && streak >= 3);
    return unlocked ? { ...milestone, unlockedAt: timestamp } : milestone;
  });
}

export function migrateSnapshot(snapshot: PersistedState | FocusState | null): FocusState | null {
  if (!snapshot || typeof snapshot !== "object") return null;

  const activeSession = normalizeSession(snapshot.activeSession);
  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : initialTasks;
  const scores = Array.isArray(snapshot.scores) ? snapshot.scores : initialScores;
  const userName = snapshot.userName ?? "";

  return {
    ...initialState,
    ...snapshot,
    schemaVersion: SCHEMA_VERSION,
    hydrated: true,
    onboarded: Boolean(snapshot.onboarded),
    userName,
    permissionStatus: snapshot.permissionStatus ?? "unknown",
    defaultSessionMinutes: clampMinutes(snapshot.defaultSessionMinutes ?? activeSession.plannedMinutes),
    tasks,
    activeSession,
    sessionRecords: Array.isArray(snapshot.sessionRecords) ? snapshot.sessionRecords : [],
    rules: Array.isArray(snapshot.rules) ? snapshot.rules.map(normalizeRule) : initialRules,
    budgets: Array.isArray(snapshot.budgets) ? snapshot.budgets : initialBudgets,
    targets: Array.isArray(snapshot.targets) && snapshot.targets.length ? snapshot.targets : initialTargets,
    interventions: Array.isArray(snapshot.interventions) ? snapshot.interventions : initialInterventions,
    scores,
    milestones:
      Array.isArray(snapshot.milestones) && snapshot.milestones.length
        ? snapshot.milestones
        : initialMilestones,
    reminders:
      Array.isArray(snapshot.reminders) && snapshot.reminders.length ? snapshot.reminders : initialReminders,
    friends: snapshot.friends?.length
      ? snapshot.friends
      : friends.map((friend) => (friend.id === "you" ? { ...friend, name: userName || "You" } : friend)),
    updatedAt: snapshot.updatedAt ?? nowIso()
  };
}

function touch(state: FocusState): FocusState {
  return { ...state, updatedAt: nowIso() };
}

export function reducer(state: FocusState, action: FocusAction): FocusState {
  switch (action.type) {
    case "hydrate":
      return migrateSnapshot(action.snapshot) ?? { ...state, hydrated: true, schemaVersion: SCHEMA_VERSION };
    case "set-permission":
      return touch({ ...state, permissionStatus: action.status });
    case "set-name":
      return touch({
        ...state,
        userName: action.name,
        friends: state.friends.map((f) => (f.id === "you" ? { ...f, name: action.name || "You" } : f))
      });
    case "set-default-session-minutes": {
      const minutes = clampMinutes(action.minutes);
      return touch({
        ...state,
        defaultSessionMinutes: minutes,
        activeSession:
          state.activeSession.status === "idle"
            ? { ...state.activeSession, plannedMinutes: minutes }
            : state.activeSession
      });
    }
    case "finish-onboarding":
      return touch({ ...state, onboarded: true });
    case "add-task": {
      if (!action.title.trim()) return state;
      const task: Task = {
        id: createId("task"),
        title: action.title.trim(),
        category: action.category.trim() || "Focus",
        estimateMinutes: clampMinutes(action.estimateMinutes),
        priority: "normal",
        status: "todo"
      };
      return touch({ ...state, tasks: [task, ...state.tasks] });
    }
    case "update-task":
      return touch({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                title: action.title.trim() || task.title,
                category: action.category.trim() || task.category,
                estimateMinutes: clampMinutes(action.estimateMinutes)
              }
            : task
        ),
        activeSession: state.activeSession.taskIds.includes(action.taskId)
          ? { ...state.activeSession, plannedMinutes: clampMinutes(action.estimateMinutes) }
          : state.activeSession
      });
    case "delete-task": {
      const wasActive = state.activeSession.taskIds.includes(action.taskId);
      return touch({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        activeSession: wasActive
          ? {
              ...state.activeSession,
              taskIds: state.activeSession.taskIds.filter((taskId) => taskId !== action.taskId),
              elapsedSeconds: 0,
              accumulatedSeconds: 0,
              status: "idle",
              startAt: undefined,
              lastStartedAt: undefined,
              pausedAt: undefined,
              endAt: undefined
            }
          : state.activeSession
      });
    }
    case "move-task": {
      const index = state.tasks.findIndex((task) => task.id === action.taskId);
      const nextIndex = action.direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= state.tasks.length) return state;
      const tasks = [...state.tasks];
      const [task] = tasks.splice(index, 1);
      tasks.splice(nextIndex, 0, task);
      return touch({ ...state, tasks });
    }
    case "start-task": {
      const startedAt = nowIso();
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
      return touch({
        ...state,
        tasks,
        activeSession: {
          ...initialSession,
          id: createId("session"),
          taskIds: activeTaskIds(tasks, action.taskId),
          plannedMinutes: selected?.estimateMinutes ?? state.defaultSessionMinutes,
          status: "running",
          startAt: startedAt,
          lastStartedAt: startedAt,
          protectionStatus: "permission-needed",
          difficulty: state.activeSession.difficulty
        }
      });
    }
    case "complete-task":
      return touch({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? { ...task, status: "completed" as const, completedAt: nowIso() }
            : task
        )
      });
    case "set-difficulty":
      return touch({ ...state, activeSession: { ...state.activeSession, difficulty: action.difficulty } });
    case "start-session": {
      const selected = action.taskId
        ? state.tasks.find((task) => task.id === action.taskId)
        : state.tasks.find((task) => task.status === "in-progress") ??
          state.tasks.find((task) => task.status === "todo");
      const startedAt = nowIso();
      const resumed = state.activeSession.status === "paused";
      const taskIds = selected ? [selected.id] : state.activeSession.taskIds;
      return touch({
        ...state,
        tasks: selected
          ? state.tasks.map((task) => ({
              ...task,
              status:
                task.id === selected.id
                  ? ("in-progress" as const)
                  : task.status === "in-progress"
                    ? ("todo" as const)
                    : task.status
            }))
          : state.tasks,
        activeSession: {
          ...state.activeSession,
          id:
            state.activeSession.status === "idle" || state.activeSession.status === "completed"
              ? createId("session")
              : state.activeSession.id,
          taskIds,
          plannedMinutes:
            selected?.estimateMinutes ?? (state.activeSession.plannedMinutes || state.defaultSessionMinutes),
          status: "running",
          startAt: state.activeSession.startAt ?? startedAt,
          lastStartedAt: startedAt,
          pausedAt: undefined,
          accumulatedSeconds: resumed ? state.activeSession.elapsedSeconds : state.activeSession.accumulatedSeconds,
          endAt: undefined,
          protectionStatus:
            state.activeSession.status === "idle" ||
            state.activeSession.status === "completed" ||
            state.activeSession.protectionStatus === "expired"
              ? "permission-needed"
              : state.activeSession.protectionStatus
        }
      });
    }
    case "pause-session": {
      if (state.activeSession.status !== "running") return state;
      const elapsedSeconds = deriveElapsedSeconds(state.activeSession);
      return touch({
        ...state,
        activeSession: {
          ...state.activeSession,
          elapsedSeconds,
          accumulatedSeconds: elapsedSeconds,
          status: "paused",
          pausedAt: nowIso(),
          lastStartedAt: undefined
        }
      });
    }
    case "reset-session":
      return touch({
        ...state,
        activeSession: {
          ...initialSession,
          plannedMinutes: state.defaultSessionMinutes,
          difficulty: state.activeSession.difficulty
        },
        tasks: state.tasks.map((task) =>
          task.status === "in-progress" ? { ...task, status: "todo" as const } : task
        )
      });
    case "complete-session": {
      const completedAt = nowIso();
      const completedSession = {
        ...reconcileSession(state.activeSession),
        status: "completed" as const,
        endAt: completedAt,
        protectionStatus: "expired" as const,
        lastStartedAt: undefined,
        pausedAt: undefined
      };
      const tasks = state.tasks.map((task) =>
        completedSession.taskIds.includes(task.id)
          ? { ...task, status: "completed" as const, completedAt }
          : task
      );
      const score = {
        ...calculateFocusScore(completedSession, tasks, state.interventions),
        completedAt
      };
      const record: SessionRecord = {
        ...completedSession,
        completedAt,
        score: score.score,
        completedTaskTitles: tasks
          .filter((task) => completedSession.taskIds.includes(task.id))
          .map((task) => task.title)
      };
      const scores = [score, ...state.scores.filter((item) => item.sessionId !== score.sessionId)];
      const totalFocusMinutes = scores.reduce((sum, s) => sum + s.focusMinutes, 0);
      const updatedFriends = state.friends.map((f) =>
        f.id === "you"
          ? { ...f, focusHours: Math.round((totalFocusMinutes / 60) * 10) / 10, score: score.score }
          : f
      );
      return touch({
        ...state,
        tasks,
        activeSession: completedSession,
        sessionRecords: [record, ...state.sessionRecords.filter((item) => item.id !== record.id)],
        scores,
        milestones: unlockMilestones(state.milestones, scores, completedSession),
        friends: updatedFriends
      });
    }
    case "tick-second":
    case "reconcile-session":
      return touch({
        ...state,
        activeSession: reconcileSession(
          state.activeSession,
          action.type === "reconcile-session" && action.now ? new Date(action.now).getTime() : Date.now()
        )
      });
    case "set-protection":
      return touch({
        ...state,
        activeSession: {
          ...state.activeSession,
          protectionStatus: action.status,
          protectionMessage: action.message
        }
      });
    case "start-break": {
      const elapsedSeconds = deriveElapsedSeconds(state.activeSession);
      const breakEndsAt = new Date(Date.now() + clampMinutes(action.minutes, 1, 30) * 60 * 1000).toISOString();
      return touch({
        ...state,
        activeSession: {
          ...state.activeSession,
          elapsedSeconds,
          accumulatedSeconds: elapsedSeconds,
          status: "paused",
          pausedAt: nowIso(),
          lastStartedAt: undefined,
          breakEndsAt,
          breakReason: action.reason.trim() || "Intentional break"
        }
      });
    }
    case "end-break":
      return touch({
        ...state,
        activeSession: {
          ...state.activeSession,
          breakEndsAt: undefined,
          breakReason: undefined
        }
      });
    case "toggle-rule":
      return touch({
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId ? { ...rule, enabled: !rule.enabled } : rule
        )
      });
    case "add-rule":
      return touch({
        ...state,
        rules: [
          normalizeRule({
            id: createId("rule"),
            name: action.name,
            mode: action.mode,
            targetIds: action.targetIds,
            schedule: {
              days: [1, 2, 3, 4, 5],
              startTime: action.startTime ?? "09:00",
              endTime: action.endTime ?? "10:00"
            },
            enabled: true,
            difficulty: state.activeSession.difficulty
          }),
          ...state.rules
        ]
      });
    case "delete-rule":
      return touch({ ...state, rules: state.rules.filter((rule) => rule.id !== action.ruleId) });
    case "set-rule-window":
      return touch({
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId
            ? { ...rule, schedule: { ...rule.schedule, startTime: action.startTime, endTime: action.endTime } }
            : rule
        )
      });
    case "set-rule-difficulty":
      return touch({
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId ? { ...rule, difficulty: action.difficulty } : rule
        )
      });
    case "set-rule-access-mode":
      return touch({
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId ? { ...rule, accessMode: action.accessMode } : rule
        )
      });
    case "set-rule-breaks":
      return touch({
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.ruleId
            ? { ...rule, breaksAllowed: Math.max(0, Math.min(action.breaksAllowed, 5)) }
            : rule
        )
      });
    case "add-target": {
      if (!action.label.trim()) return state;
      const id = action.website?.trim() || action.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (state.targets.some((target) => target.id === id)) return state;
      return touch({
        ...state,
        targets: [
          { id, label: action.label.trim(), website: action.website?.trim(), category: "custom" },
          ...state.targets
        ]
      });
    }
    case "remove-target":
      return touch({
        ...state,
        targets: state.targets.filter((target) => target.id !== action.targetId),
        rules: state.rules.map((rule) => ({
          ...rule,
          targetIds: rule.targetIds.filter((id) => id !== action.targetId)
        })),
        budgets: state.budgets.filter((budget) => budget.targetId !== action.targetId)
      });
    case "set-budget-used":
      return touch({
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.budgetId
            ? { ...budget, usedMinutes: Math.max(0, Math.min(action.usedMinutes, budget.dailyLimitMinutes)) }
            : budget
        )
      });
    case "set-budget-limit":
      return touch({
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.budgetId
            ? {
                ...budget,
                dailyLimitMinutes: clampMinutes(action.dailyLimitMinutes, 5, 360),
                usedMinutes: Math.min(budget.usedMinutes, clampMinutes(action.dailyLimitMinutes, 5, 360))
              }
            : budget
        )
      });
    case "add-budget":
      if (state.budgets.some((budget) => budget.targetId === action.targetId)) return state;
      return touch({
        ...state,
        budgets: [
          {
            id: createId("budget"),
            targetId: action.targetId,
            label: action.label,
            dailyLimitMinutes: clampMinutes(action.dailyLimitMinutes, 5, 360),
            usedMinutes: 0,
            resetAt: nowIso()
          },
          ...state.budgets
        ]
      });
    case "delete-budget":
      return touch({ ...state, budgets: state.budgets.filter((budget) => budget.id !== action.budgetId) });
    case "reset-budget":
      return touch({
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.budgetId ? { ...budget, usedMinutes: 0, resetAt: nowIso() } : budget
        )
      });
    case "toggle-reminder":
      return touch({
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.reminderId ? { ...reminder, enabled: !reminder.enabled } : reminder
        )
      });
    case "set-reminder-time":
      return touch({
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.reminderId ? { ...reminder, time: normalizedClock(action.time) } : reminder
        )
      });
    case "intervention": {
      const event: InterventionEvent = {
        id: createId("event"),
        targetId: action.targetId,
        sessionId: state.activeSession.id,
        action: action.action,
        createdAt: nowIso()
      };
      return touch({ ...state, interventions: [event, ...state.interventions] });
    }
    case "reset-local-data":
      return {
        ...initialState,
        hydrated: true,
        onboarded: state.onboarded,
        userName: state.userName,
        permissionStatus: state.permissionStatus,
        friends: initialState.friends.map((friend) =>
          friend.id === "you" ? { ...friend, name: state.userName || "You" } : friend
        ),
        updatedAt: nowIso()
      };
    default:
      return state;
  }
}
