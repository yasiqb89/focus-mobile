import { Difficulty, FocusScore, FocusSession, InterventionEvent, Task } from "./types";

const difficultyMultiplier: Record<Difficulty, number> = {
  standard: 1,
  strict: 1.12,
  lockdown: 1.25
};

export function calculateFocusScore(
  session: FocusSession,
  tasks: Task[],
  interventions: InterventionEvent[]
): FocusScore {
  const focusMinutes = elapsedFocusMinutes(session.elapsedSeconds);
  const sessionEvents = interventions.filter((event) => event.sessionId === session.id);
  const completedTasks = tasks.filter(
    (task) => session.taskIds.includes(task.id) && task.status === "completed"
  ).length;
  const bypasses = sessionEvents.filter((event) => event.action === "bypassed").length;
  const blockedAttempts = sessionEvents.filter((event) => event.action === "blocked").length;
  const adherence =
    session.plannedMinutes > 0 ? Math.min(focusMinutes / session.plannedMinutes, 1.15) : 0;
  const focusBase = focusMinutes * 8;
  const completionBonus = completedTasks * 120;
  const resistanceBonus = blockedAttempts * 24;
  const bypassPenalty = bypasses * 90;
  const raw =
    (focusBase + completionBonus + resistanceBonus - bypassPenalty) *
    adherence *
    difficultyMultiplier[session.difficulty];

  return {
    sessionId: session.id,
    score: Math.max(0, Math.round(raw)),
    focusMinutes,
    completedTasks,
    bypasses,
    blockedAttempts
  };
}

export function elapsedFocusMinutes(seconds: number): number {
  return Math.floor(Math.max(seconds, 0) / 60);
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTimer(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
