import {
  AppBudget,
  BlockRule,
  FocusScore,
  FocusSession,
  FriendSummary,
  InterventionEvent,
  Task
} from "./types";

export const initialTasks: Task[] = [];

export const initialSession: FocusSession = {
  id: "session-init",
  taskIds: [],
  plannedMinutes: 25,
  actualMinutes: 0,
  difficulty: "standard",
  status: "idle"
};

export const initialRules: BlockRule[] = [
  {
    id: "rule-deep-work",
    name: "Deep Work Mornings",
    schedule: { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "12:00" },
    targetIds: ["social-feed.net", "news-portal.com"],
    mode: "focus",
    difficulty: "strict",
    enabled: false
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
    usedMinutes: 0,
    resetAt: new Date().toISOString()
  },
  {
    id: "budget-messaging",
    targetId: "messaging",
    label: "Messaging",
    dailyLimitMinutes: 45,
    usedMinutes: 0,
    resetAt: new Date().toISOString()
  }
];

export const initialInterventions: InterventionEvent[] = [];

export const initialScores: FocusScore[] = [];

export const friends: FriendSummary[] = [
  { id: "you", name: "You", focusHours: 0, score: 0, status: "flowing" }
];
