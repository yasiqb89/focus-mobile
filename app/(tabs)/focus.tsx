import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { FocusRing } from "@/components/FocusRing";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskRow } from "@/components/TaskRow";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { formatMinutes } from "@/data/scoring";
import { colors, layout, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function FocusScreen() {
  const router = useRouter();
  const { activeSession, budgets, currentScore, rules, tasks, dispatch } = useFocusStore();

  const activeTask = tasks.find((task) => activeSession.taskIds.includes(task.id));
  const upNext = tasks.filter((task) => task.status === "todo");
  const sessionTargets = useMemo(
    () => rules.filter((rule) => rule.enabled).flatMap((rule) => rule.targetIds),
    [rules]
  );

  const todoTasks = tasks.filter((t) => t.status !== "completed");
  const activeIndex = activeTask ? todoTasks.findIndex((t) => t.id === activeTask.id) + 1 : 0;
  const sessionLabel =
    activeTask && activeIndex > 0
      ? `Task ${activeIndex} of ${todoTasks.length}`
      : todoTasks.length > 0
        ? `${todoTasks.length} queued`
        : "No tasks";

  useEffect(() => {
    if (activeSession.status !== "running") return;
    const interval = setInterval(() => dispatch({ type: "tick-minute" }), 60000);
    return () => clearInterval(interval);
  }, [activeSession.status, dispatch]);

  async function startSession() {
    dispatch({ type: "start-session" });
    await restrictionProvider.startFocusSession(activeSession, sessionTargets, activeSession.difficulty);
  }

  function completeSession() {
    dispatch({ type: "complete-session" });
    router.push("/session-complete");
  }

  const isRunning = activeSession.status === "running";
  const isPaused = activeSession.status === "paused";
  const isActive = isRunning || isPaused;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Sticky top: header + timer */}
      <View style={styles.sticky}>
        <AppHeader title="FOCUS" subtitle="FLOW" />
        <PixelCard thick style={styles.hero}>
          <PixelText variant="h1" uppercase numberOfLines={1}>
            {activeTask?.title ?? (todoTasks.length === 0 ? "Add a task" : "Select a task")}
          </PixelText>
          <PixelText muted>{sessionLabel}</PixelText>
          <FocusRing
            minutes={activeSession.actualMinutes}
            plannedMinutes={activeSession.plannedMinutes}
          />
          <View style={styles.controls}>
            {isRunning ? (
              <PixelButton
                label="Pause"
                icon="pause"
                variant="primary"
                onPress={() => dispatch({ type: "pause-session" })}
              />
            ) : (
              <PixelButton
                label={isPaused ? "Resume" : "Start Session"}
                icon="play-arrow"
                variant="primary"
                onPress={startSession}
              />
            )}
            {isActive && (
              <PixelButton label="Complete" icon="check" onPress={completeSession} />
            )}
            {isActive && (
              <PixelButton icon="restart-alt" compact onPress={() => dispatch({ type: "reset-session" })} />
            )}
          </View>
        </PixelCard>
      </View>

      {/* Scrollable queue */}
      <ScrollView
        style={styles.queue}
        contentContainerStyle={styles.queueContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score metrics */}
        <View style={styles.metrics}>
          <PixelCard style={styles.metric}>
            <PixelText variant="label" muted uppercase>
              Focus Score
            </PixelText>
            <PixelText variant="display">{currentScore.score}</PixelText>
          </PixelCard>
          <PixelCard style={styles.metric}>
            <PixelText variant="label" muted uppercase>
              Focus Time
            </PixelText>
            <PixelText variant="h1">{formatMinutes(currentScore.focusMinutes)}</PixelText>
          </PixelCard>
        </View>

        {/* Difficulty */}
        <PixelCard>
          <View style={styles.sectionHeader}>
            <PixelText variant="h2" uppercase>
              Difficulty
            </PixelText>
            <PixelText variant="label" muted uppercase>
              {activeSession.difficulty}
            </PixelText>
          </View>
          <View style={styles.segmented}>
            {(["standard", "strict", "lockdown"] as const).map((difficulty) => (
              <PixelButton
                key={difficulty}
                label={difficulty}
                variant={activeSession.difficulty === difficulty ? "primary" : "secondary"}
                compact
                onPress={() => dispatch({ type: "set-difficulty", difficulty })}
              />
            ))}
          </View>
        </PixelCard>

        {/* Up next */}
        <PixelCard>
          <View style={styles.sectionHeader}>
            <PixelText variant="h2" uppercase>
              Up Next
            </PixelText>
            <PixelText variant="label" muted uppercase>
              {upNext.length} queued
            </PixelText>
          </View>
          {upNext.length === 0 ? (
            <PixelText muted>All tasks completed or no tasks added yet.</PixelText>
          ) : (
            upNext.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStart={() => dispatch({ type: "start-task", taskId: task.id })}
              />
            ))
          )}
        </PixelCard>

        {/* Daily budgets */}
        {budgets.length > 0 && (
          <PixelCard dark>
            <PixelText variant="label" uppercase inverted>
              Daily Budgets
            </PixelText>
            {budgets.map((budget) => (
              <View key={budget.id} style={styles.budget}>
                <View style={styles.sectionHeader}>
                  <PixelText inverted>{budget.label}</PixelText>
                  <PixelText variant="label" inverted>
                    {budget.usedMinutes}/{budget.dailyLimitMinutes}m
                  </PixelText>
                </View>
                <ProgressBar progress={budget.usedMinutes / budget.dailyLimitMinutes} />
              </View>
            ))}
          </PixelCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1
  },
  sticky: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md
  },
  hero: {
    alignItems: "center",
    gap: spacing.sm
  },
  controls: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    width: "100%"
  },
  queue: {
    flex: 1
  },
  queueContent: {
    gap: spacing.md,
    paddingBottom: layout.bottomNavHeight + spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  metric: {
    flex: 1,
    minHeight: 120
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  segmented: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  budget: {
    gap: spacing.xs,
    marginTop: spacing.sm
  }
});
