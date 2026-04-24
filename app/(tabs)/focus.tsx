import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { FocusRing } from "@/components/FocusRing";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { TaskRow } from "@/components/TaskRow";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { formatMinutes } from "@/data/scoring";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function FocusScreen() {
  const router = useRouter();
  const { activeSession, budgets, currentScore, rules, tasks, dispatch } = useFocusStore();
  const activeTask = tasks.find((task) => activeSession.taskIds.includes(task.id));
  const upNext = tasks.filter((task) => task.status === "todo").slice(0, 3);
  const sessionTargets = useMemo(
    () => rules.filter((rule) => rule.enabled).flatMap((rule) => rule.targetIds),
    [rules]
  );

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

  function simulateBlock() {
    dispatch({ type: "intervention", targetId: "social-feed.net", action: "blocked" });
    router.push("/intervention");
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="FLOW" />
      <PixelCard thick style={styles.hero}>
        <PixelText variant="h1" uppercase>
          {activeTask?.title ?? "Deep Work"}
        </PixelText>
        <PixelText muted>Session 2 of 4</PixelText>
        <FocusRing minutes={activeSession.actualMinutes} plannedMinutes={activeSession.plannedMinutes} />
        <View style={styles.controls}>
          {activeSession.status === "running" ? (
            <PixelButton label="Pause" icon="pause" variant="primary" onPress={() => dispatch({ type: "pause-session" })} />
          ) : (
            <PixelButton label="Start Session" icon="play-arrow" variant="primary" onPress={startSession} />
          )}
          <PixelButton icon="restart-alt" compact onPress={() => dispatch({ type: "reset-session" })} />
        </View>
        <View style={styles.controls}>
          <PixelButton label="Complete" icon="check" onPress={completeSession} />
          <PixelButton label="Test Block" icon="visibility-off" onPress={simulateBlock} />
        </View>
      </PixelCard>

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

      <PixelCard>
        <View style={styles.sectionHeader}>
          <PixelText variant="h2" uppercase>
            Up Next
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {upNext.length} queued
          </PixelText>
        </View>
        {upNext.map((task) => (
          <TaskRow key={task.id} task={task} onStart={() => dispatch({ type: "start-task", taskId: task.id })} />
        ))}
      </PixelCard>

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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  metric: {
    flex: 1,
    minHeight: 136
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
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
