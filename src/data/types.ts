export type TaskStatus = "todo" | "in-progress" | "completed";
export type Priority = "low" | "normal" | "high";
export type Difficulty = "standard" | "strict" | "lockdown";
export type SessionStatus = "idle" | "running" | "paused" | "completed";
export type BlockMode = "focus" | "daily-limit" | "app-lock";
export type PermissionStatus = "unknown" | "granted" | "limited" | "denied";
export type FriendStatus = "flowing" | "idle" | "offline";
export type ProtectionStatus = "unavailable" | "permission-needed" | "simulated" | "applied" | "failed" | "expired";
export type AccessMode = "blocklist" | "allowlist";
export type ReminderTone = "gentle" | "firm";

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
  lastStartedAt?: string;
  pausedAt?: string;
  endAt?: string;
  plannedMinutes: number;
  elapsedSeconds: number;
  accumulatedSeconds: number;
  difficulty: Difficulty;
  protectionStatus: ProtectionStatus;
  protectionMessage?: string;
  breakEndsAt?: string;
  breakReason?: string;
  status: SessionStatus;
};

export type SessionRecord = FocusSession & {
  completedAt: string;
  score: number;
  completedTaskTitles: string[];
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
  accessMode: AccessMode;
  breaksAllowed: number;
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

export type AppTarget = {
  id: string;
  label: string;
  category: "social" | "video" | "news" | "messaging" | "work" | "custom";
  website?: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
};

export type FocusReminder = {
  id: string;
  label: string;
  time: string;
  days: number[];
  tone: ReminderTone;
  enabled: boolean;
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
