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
  const sessionEvents = interventions.filter((event) => event.sessionId === session.id);
  const completedTasks = tasks.filter(
    (task) => session.taskIds.includes(task.id) && task.status === "completed"
  ).length;
  const bypasses = sessionEvents.filter((event) => event.action === "bypassed").length;
  const blockedAttempts = sessionEvents.filter((event) => event.action === "blocked").length;
  const adherence =
    session.plannedMinutes > 0 ? Math.min(session.actualMinutes / session.plannedMinutes, 1.15) : 0;
  const focusBase = session.actualMinutes * 8;
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
    focusMinutes: session.actualMinutes,
    completedTasks,
    bypasses,
    blockedAttempts
  };
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
