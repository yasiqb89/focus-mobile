export type TaskStatus = "todo" | "in-progress" | "completed";
export type Priority = "low" | "normal" | "high";
export type Difficulty = "standard" | "strict" | "lockdown";
export type SessionStatus = "idle" | "running" | "paused" | "completed";
export type BlockMode = "focus" | "daily-limit" | "app-lock";
export type PermissionStatus = "unknown" | "granted" | "limited" | "denied";
export type FriendStatus = "flowing" | "idle" | "offline";

export type Task = {
  id: string;
  title: string;
  category: string;
  estimateMinutes: number;
  priority: Priority;
  status: TaskStatus;
  completedAt?: string;
};

export type FocusSession = {
  id: string;
  taskIds: string[];
  startAt?: string;
  endAt?: string;
  plannedMinutes: number;
  actualMinutes: number;
  difficulty: Difficulty;
  status: SessionStatus;
};

export type BlockSchedule = {
  days: number[];
  startTime: string;
  endTime: string;
};

export type BlockRule = {
  id: string;
  name: string;
  schedule: BlockSchedule;
  targetIds: string[];
  mode: BlockMode;
  difficulty: Difficulty;
  enabled: boolean;
};

export type AppBudget = {
  id: string;
  targetId: string;
  label: string;
  dailyLimitMinutes: number;
  usedMinutes: number;
  resetAt: string;
};

export type InterventionEvent = {
  id: string;
  targetId: string;
  sessionId?: string;
  action: "blocked" | "bypassed" | "returned";
  createdAt: string;
};

export type FocusScore = {
  sessionId: string;
  score: number;
  focusMinutes: number;
  completedTasks: number;
  bypasses: number;
  blockedAttempts: number;
  completedAt?: string;
};

export type FriendSummary = {
  id: string;
  name: string;
  avatar?: string;
  focusHours: number;
  score: number;
  status: FriendStatus;
};

export type UsageReport = {
  focusMinutes: number;
  blockedAttempts: number;
  bypasses: number;
  topDistractions: Array<{ targetId: string; label: string; minutes: number }>;
};
