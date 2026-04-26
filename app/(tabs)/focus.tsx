import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, AppStateStatus, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOut, Layout } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { BottomSheet } from "@/components/BottomSheet";
import { EmptyState } from "@/components/EmptyState";
import { FocusRing } from "@/components/FocusRing";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { FixedScreen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { TaskRow } from "@/components/TaskRow";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { elapsedFocusMinutes, formatMinutes, formatTimer } from "@/data/scoring";
import { colors, layout, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const MIN_COMPLETE_SECONDS = 60;
const BREAK_OPTIONS = [3, 5, 10];

function protectionTone(status: string): "neutral" | "good" | "warn" | "danger" | "dark" {
  if (status === "applied") return "good";
  if (status === "simulated") return "warn";
  if (status === "failed" || status === "permission-needed") return "danger";
  if (status === "expired") return "neutral";
  return "neutral";
}

export default function FocusScreen() {
  const router = useRouter();
  const { activeSession, budgets, currentScore, rules, tasks, dispatch } = useFocusStore();
  const [breakSheetOpen, setBreakSheetOpen] = useState(false);
  const [breakReason, setBreakReason] = useState("Clear my head");
  const appliedSessionRef = useRef<string | null>(null);

  const activeTask = tasks.find((task) => activeSession.taskIds.includes(task.id));
  const queuedTasks = tasks.filter((task) => task.status !== "completed");
  const upNext = tasks.filter((task) => task.status === "todo").slice(0, 4);
  const sessionTargets = rules.filter((rule) => rule.enabled).flatMap((rule) => rule.targetIds);
  const plannedSeconds = activeSession.plannedMinutes * 60;
  const elapsedSeconds = activeSession.elapsedSeconds;
  const isRunning = activeSession.status === "running";
  const isPaused = activeSession.status === "paused";
  const isActive = isRunning || isPaused;
  const hasTasks = queuedTasks.length > 0;
  const canComplete = elapsedSeconds >= MIN_COMPLETE_SECONDS;
  const breakSeconds = activeSession.breakEndsAt
    ? Math.max(0, Math.floor((new Date(activeSession.breakEndsAt).getTime() - Date.now()) / 1000))
    : 0;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => dispatch({ type: "tick-second" }), 1000);
    return () => clearInterval(interval);
  }, [dispatch, isRunning]);

  useEffect(() => {
    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === "active") {
        dispatch({ type: "reconcile-session" });
      }
    }

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [dispatch]);

  useEffect(() => {
    if (!isRunning || activeSession.protectionStatus !== "permission-needed") return;
    if (appliedSessionRef.current === activeSession.id) return;
    appliedSessionRef.current = activeSession.id;
    restrictionProvider
      .startFocusSession(activeSession, sessionTargets, activeSession.difficulty)
      .then((result) => {
        dispatch({ type: "set-protection", status: result.protectionStatus, message: result.message });
      })
      .catch(() => {
        dispatch({
          type: "set-protection",
          status: "failed",
          message: "Focus protection could not be applied. Timer remains local."
        });
      });
  }, [activeSession, dispatch, isRunning, sessionTargets]);

  async function startSession() {
    if (!hasTasks) {
      router.push("/(tabs)/tasks");
      return;
    }

    dispatch({ type: "start-session", taskId: activeTask?.id ?? upNext[0]?.id });
  }

  async function completeSession() {
    if (!canComplete) {
      Alert.alert("Keep Going", "Complete at least 1 minute before closing the session.");
      return;
    }
    dispatch({ type: "complete-session" });
    await restrictionProvider.stopFocusSession(activeSession.id);
    router.push("/session-complete");
  }

  function confirmReset() {
    if (activeSession.difficulty === "lockdown" && isActive) {
      Alert.alert("Lockdown Active", "Reset is disabled while a lockdown session is active.");
      return;
    }
    Alert.alert("Reset Session", "This clears the current timer and returns the task to your queue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => dispatch({ type: "reset-session" }) }
    ]);
  }

  function startBreak(minutes: number) {
    if (activeSession.difficulty === "lockdown") return;
    dispatch({ type: "start-break", minutes, reason: breakReason });
    setBreakSheetOpen(false);
  }

  if (!hasTasks && !isActive) {
    return (
      <FixedScreen>
        <AppHeader title="FOCUS" subtitle="FLOW" />
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="checklist"
            title="Build Your Queue"
            body="Focus starts with one clear task. Add a task, choose a time, then return here for a protected session."
            actionLabel="Add First Task"
            onAction={() => router.push("/(tabs)/tasks")}
          />
        </View>
      </FixedScreen>
    );
  }

  return (
    <FixedScreen>
      <AppHeader title="FOCUS" subtitle="FLOW" />

      <Animated.View entering={FadeInUp.duration(180)} layout={Layout.springify().damping(18)} style={styles.hero}>
        <PixelCard thick style={styles.timerCard}>
          <View style={styles.sessionTop}>
            <View style={styles.sessionCopy}>
              <StatusChip
                label={activeSession.protectionStatus.replace("-", " ")}
                tone={protectionTone(activeSession.protectionStatus)}
                icon="shield"
              />
              <PixelText variant="h2" uppercase numberOfLines={2} style={styles.taskTitle}>
                {activeTask?.title ?? "Ready to focus"}
              </PixelText>
              <PixelText muted numberOfLines={1}>
                {activeTask ? `${activeTask.category} · ${formatMinutes(activeSession.plannedMinutes)}` : "Select a task"}
              </PixelText>
            </View>
            <View style={styles.scoreChip}>
              <PixelText variant="label" inverted uppercase>
                Score
              </PixelText>
              <PixelText variant="h2" inverted>
                {currentScore.score}
              </PixelText>
            </View>
          </View>

          <FocusRing compact elapsedSeconds={elapsedSeconds} plannedMinutes={activeSession.plannedMinutes} />

          <View style={styles.timeGrid}>
            <View style={styles.timeCell}>
              <PixelText variant="label" muted uppercase>
                Elapsed
              </PixelText>
              <PixelText variant="h2" style={styles.tabular}>
                {formatTimer(elapsedSeconds)}
              </PixelText>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeCell}>
              <PixelText variant="label" muted uppercase>
                Remaining
              </PixelText>
              <PixelText variant="h2" style={styles.tabular}>
                {formatTimer(Math.max(plannedSeconds - elapsedSeconds, 0))}
              </PixelText>
            </View>
          </View>

          <ProgressBar progress={plannedSeconds > 0 ? elapsedSeconds / plannedSeconds : 0} />

          {activeSession.breakEndsAt ? (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.breakBanner}>
              <PixelText variant="label" uppercase>
                Break · {formatTimer(breakSeconds)}
              </PixelText>
              <PixelButton
                label="Return"
                icon="keyboard-return"
                compact
                onPress={() => {
                  dispatch({ type: "end-break" });
                  dispatch({ type: "start-session" });
                }}
              />
            </Animated.View>
          ) : null}

          <View style={styles.controls}>
            {isRunning ? (
              <PixelButton
                label="Pause"
                icon="pause"
                variant="primary"
                style={styles.mainControl}
                onPress={() => dispatch({ type: "pause-session" })}
              />
            ) : (
              <PixelButton
                label={isPaused ? "Resume" : "Start"}
                icon="play-arrow"
                variant="primary"
                style={styles.mainControl}
                onPress={startSession}
              />
            )}
            <PixelButton icon="free-breakfast" compact disabled={!isActive} onPress={() => setBreakSheetOpen(true)} />
            <PixelButton icon="check" compact disabled={!canComplete} onPress={completeSession} />
            <PixelButton icon="restart-alt" compact onPress={confirmReset} />
          </View>
        </PixelCard>
      </Animated.View>

      <View style={styles.detailGrid}>
        <PixelCard style={styles.detailCard}>
          <View style={styles.sectionHeader}>
            <PixelText variant="label" muted uppercase>
              Protected
            </PixelText>
            <PixelText variant="h2">{formatMinutes(elapsedFocusMinutes(elapsedSeconds))}</PixelText>
          </View>
          <View style={styles.segmented}>
            {(["standard", "strict", "lockdown"] as const).map((difficulty) => (
              <PixelButton
                key={difficulty}
                label={difficulty === "standard" ? "Std" : difficulty === "lockdown" ? "Lck" : "Str"}
                variant={activeSession.difficulty === difficulty ? "primary" : "secondary"}
                compact
                disabled={isRunning && activeSession.difficulty === "lockdown"}
                onPress={() => dispatch({ type: "set-difficulty", difficulty })}
              />
            ))}
          </View>
        </PixelCard>

        <PixelCard dark style={styles.detailCard}>
          <PixelText variant="label" uppercase inverted>
            Limits
          </PixelText>
          {budgets.slice(0, 2).map((budget) => (
            <View key={budget.id} style={styles.budget}>
              <View style={styles.sectionHeader}>
                <PixelText inverted numberOfLines={1} style={styles.flex}>
                  {budget.label}
                </PixelText>
                <PixelText variant="label" inverted>
                  {budget.usedMinutes}/{budget.dailyLimitMinutes}m
                </PixelText>
              </View>
              <ProgressBar progress={budget.usedMinutes / budget.dailyLimitMinutes} />
            </View>
          ))}
        </PixelCard>
      </View>

      <PixelCard style={styles.queuePanel}>
        <View style={styles.sectionHeader}>
          <PixelText variant="h2" uppercase>
            Up Next
          </PixelText>
          <PixelButton icon="add" compact onPress={() => router.push("/(tabs)/tasks")} />
        </View>
        {upNext.length === 0 ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.emptyPanel}>
            <PixelText muted>No upcoming tasks.</PixelText>
            <PixelButton
              label="Add a Task"
              icon="add"
              compact
              onPress={() => router.push("/(tabs)/tasks")}
            />
          </Animated.View>
        ) : (
          <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
            {upNext.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStart={() => dispatch({ type: "start-session", taskId: task.id })}
              />
            ))}
          </ScrollView>
        )}
      </PixelCard>

      <BottomSheet visible={breakSheetOpen} title="Intentional Break" onClose={() => setBreakSheetOpen(false)}>
        <PixelText muted>
          Breaks are timed and return you to focus automatically. Lockdown sessions do not allow breaks.
        </PixelText>
        <TextInput
          value={breakReason}
          onChangeText={setBreakReason}
          placeholder="Why do you need this break?"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <View style={styles.breakOptions}>
          {BREAK_OPTIONS.map((minutes) => (
            <PixelButton
              key={minutes}
              label={`${minutes}m`}
              icon="timer"
              disabled={activeSession.difficulty === "lockdown"}
              onPress={() => startBreak(minutes)}
            />
          ))}
        </View>
      </BottomSheet>
    </FixedScreen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: "center"
  },
  hero: {
    flexShrink: 0
  },
  timerCard: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 4
  },
  sessionTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between"
  },
  sessionCopy: {
    flex: 1,
    gap: 3
  },
  taskTitle: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.3
  },
  scoreChip: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: layout.border,
    minWidth: 56,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base,
    borderRadius: 2
  },
  timeGrid: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.base
  },
  timeCell: {
    alignItems: "center",
    flex: 1,
    gap: 2
  },
  timeDivider: {
    backgroundColor: colors.surfaceHigh,
    height: 30,
    width: 1
  },
  tabular: {
    fontVariant: ["tabular-nums"]
  },
  breakBanner: {
    alignItems: "center",
    backgroundColor: colors.warningContainer,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.xs
  },
  controls: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingTop: spacing.base
  },
  mainControl: {
    flex: 1
  },
  detailGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  detailCard: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 96,
    padding: spacing.xs
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between"
  },
  segmented: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.base
  },
  budget: {
    gap: 3,
    marginTop: spacing.xs
  },
  queuePanel: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 0,
    padding: spacing.xs
  },
  queueList: {
    minHeight: 0
  },
  emptyPanel: {
    alignItems: "flex-start",
    borderColor: colors.outline,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm
  },
  input: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.sm
  },
  breakOptions: {
    flexDirection: "row",
    gap: spacing.xs
  },
  flex: {
    flex: 1
  }
});
