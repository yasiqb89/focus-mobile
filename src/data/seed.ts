import {
  AppBudget,
  AppTarget,
  BlockRule,
  FocusScore,
  FocusSession,
  FriendSummary,
  FocusReminder,
  InterventionEvent,
  Milestone,
  Task
} from "./types";

export const initialTasks: Task[] = [];

export const initialSession: FocusSession = {
  id: "session-init",
  taskIds: [],
  plannedMinutes: 25,
  elapsedSeconds: 0,
  accumulatedSeconds: 0,
  difficulty: "standard",
  protectionStatus: "unavailable",
  status: "idle"
};

export const initialTargets: AppTarget[] = [
  { id: "social-feed.net", label: "Social Feed", category: "social", website: "social-feed.net" },
  { id: "short-video", label: "Short Video", category: "video" },
  { id: "stream-media", label: "Stream Media", category: "video" },
  { id: "news-portal.com", label: "News Portal", category: "news", website: "news-portal.com" },
  { id: "messaging", label: "Messaging", category: "messaging" },
  { id: "email", label: "Email", category: "work" }
];

export const initialRules: BlockRule[] = [
  {
    id: "rule-deep-work",
    name: "Deep Work Mornings",
    schedule: { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "12:00" },
    targetIds: ["social-feed.net", "news-portal.com"],
    mode: "focus",
    difficulty: "strict",
    accessMode: "blocklist",
    breaksAllowed: 1,
    enabled: false
  },
  {
    id: "rule-evening",
    name: "Evening Lock",
    schedule: { days: [0, 1, 2, 3, 4, 5, 6], startTime: "21:30", endTime: "23:30" },
    targetIds: ["stream-media", "short-video"],
    mode: "app-lock",
    difficulty: "lockdown",
    accessMode: "blocklist",
    breaksAllowed: 0,
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

export const initialMilestones: Milestone[] = [
  {
    id: "first-session",
    title: "First Protected Session",
    description: "Complete one focus session."
  },
  {
    id: "first-hour",
    title: "One Hour Reclaimed",
    description: "Log 60 minutes of focused time."
  },
  {
    id: "lockdown-win",
    title: "Lockdown Finish",
    description: "Complete a lockdown session."
  },
  {
    id: "three-day-streak",
    title: "Three-Day Streak",
    description: "Complete focus sessions on three consecutive days."
  }
];

export const initialReminders: FocusReminder[] = [
  {
    id: "reminder-work-start",
    label: "Start work block",
    time: "09:00",
    days: [1, 2, 3, 4, 5],
    tone: "gentle",
    enabled: true
  }
];

export const friends: FriendSummary[] = [
  { id: "you", name: "You", focusHours: 0, score: 0, status: "flowing" }
];
