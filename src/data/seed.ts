import {
  AppBudget,
  BlockRule,
  FocusScore,
  FocusSession,
  FriendSummary,
  InterventionEvent,
  Task
} from "./types";

export const initialTasks: Task[] = [
  {
    id: "task-design-system",
    title: "Compile design system JSON schema",
    category: "Design",
    estimateMinutes: 45,
    priority: "high",
    status: "in-progress"
  },
  {
    id: "task-navigation",
    title: "Refactor navigation logic",
    category: "Code",
    estimateMinutes: 90,
    priority: "normal",
    status: "todo"
  },
  {
    id: "task-brand",
    title: "Update brand tokens",
    category: "Design",
    estimateMinutes: 45,
    priority: "normal",
    status: "todo"
  },
  {
    id: "task-sync",
    title: "Weekly sync prep",
    category: "Admin",
    estimateMinutes: 15,
    priority: "low",
    status: "todo"
  }
];

export const initialSession: FocusSession = {
  id: "session-current",
  taskIds: ["task-design-system"],
  plannedMinutes: 45,
  actualMinutes: 24,
  difficulty: "strict",
  status: "paused",
  startAt: new Date(Date.now() - 24 * 60 * 1000).toISOString()
};

export const initialRules: BlockRule[] = [
  {
    id: "rule-deep-work",
    name: "Deep Work Mornings",
    schedule: { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "12:00" },
    targetIds: ["social-feed.net", "news-portal.com", "shop-endless.io"],
    mode: "focus",
    difficulty: "strict",
    enabled: true
  },
  {
    id: "rule-evening",
    name: "Evening Lock",
    schedule: { days: [0, 1, 2, 3, 4, 5, 6], startTime: "21:30", endTime: "23:30" },
    targetIds: ["stream-media", "short-video"],
    mode: "app-lock",
    difficulty: "lockdown",
    enabled: false
  }
];

export const initialBudgets: AppBudget[] = [
  {
    id: "budget-stream",
    targetId: "stream-media",
    label: "Stream Media",
    dailyLimitMinutes: 90,
    usedMinutes: 42,
    resetAt: new Date().toISOString()
  },
  {
    id: "budget-messaging",
    targetId: "messaging",
    label: "Messaging",
    dailyLimitMinutes: 45,
    usedMinutes: 31,
    resetAt: new Date().toISOString()
  }
];

export const initialInterventions: InterventionEvent[] = [
  {
    id: "event-social",
    targetId: "social-feed.net",
    sessionId: "session-current",
    action: "blocked",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: "event-news",
    targetId: "news-portal.com",
    sessionId: "session-current",
    action: "returned",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString()
  }
];

export const initialScores: FocusScore[] = [
  {
    sessionId: "session-yesterday",
    score: 84,
    focusMinutes: 225,
    completedTasks: 4,
    bypasses: 1,
    blockedAttempts: 7
  }
];

export const friends: FriendSummary[] = [
  { id: "you", name: "You", focusHours: 28.5, score: 9420, status: "flowing" },
  { id: "node", name: "Node_Rider", focusHours: 24.1, score: 8105, status: "offline" },
  { id: "pixel", name: "Pixel_Ghost", focusHours: 18, score: 6022, status: "idle" },
  { id: "data", name: "Data_Punk", focusHours: 9.2, score: 3100, status: "offline" }
];
