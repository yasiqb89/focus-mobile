import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { formatMinutes } from "@/data/scoring";
import { isRuleActive } from "@/data/schedule";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

function protectionTone(status: string): "neutral" | "good" | "warn" | "danger" | "dark" {
  if (status === "applied") return "good";
  if (status === "simulated") return "warn";
  if (status === "failed" || status === "permission-needed") return "danger";
  return "neutral";
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSession,
    budgets,
    currentScore,
    milestones,
    reminders,
    rules,
    scores,
    sessionRecords,
    tasks,
    dispatch
  } = useFocusStore();

  const queuedTasks = tasks.filter((task) => task.status !== "completed");
  const activeRule = rules.find((rule) => isRuleActive(rule));
  const nextRule = rules.find((rule) => rule.enabled) ?? rules[0];
  const totalMinutes = scores.reduce((sum, score) => sum + score.focusMinutes, 0);
  const unlocked = milestones.filter((milestone) => milestone.unlockedAt).length;
  const nextTask = queuedTasks[0];
  const topBudget = budgets[0];
  const nextReminder = reminders.find((reminder) => reminder.enabled);
  const recentRecord = sessionRecords[0];

  const weeklyInsight = useMemo(() => {
    if (scores.length === 0) return "Complete one session to unlock your first weekly report.";
    const blocked = scores.reduce((sum, score) => sum + score.blockedAttempts, 0);
    const bypasses = scores.reduce((sum, score) => sum + score.bypasses, 0);
    if (bypasses === 0 && blocked > 0) return "You are resisting distraction without bypassing protection.";
    if (totalMinutes >= 60) return "Your strongest pattern is sustained focus over quick checks.";
    return "Build consistency with one protected block today.";
  }, [scores, totalMinutes]);

  function quickStart() {
    if (!nextTask) {
      router.push("/(tabs)/tasks");
      return;
    }
    dispatch({ type: "start-session", taskId: nextTask.id });
    router.push("/(tabs)/focus");
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="TODAY" />

      <Animated.View entering={FadeInUp.duration(220)} layout={Layout.springify().damping(20)}>
        <PixelCard thick style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <StatusChip
                label={activeSession.protectionStatus.replace("-", " ")}
                tone={protectionTone(activeSession.protectionStatus)}
                icon="shield"
              />
              <PixelText variant="display" uppercase style={styles.score}>
                {currentScore.score}
              </PixelText>
              <PixelText variant="h2" uppercase>
                Focus Score
              </PixelText>
            </View>
            <View style={styles.deviceMark}>
              <MaterialIcons name="phone-iphone" size={34} color={colors.onPrimary} />
              <PixelText variant="label" inverted uppercase>
                Local
              </PixelText>
            </View>
          </View>
          <PixelText muted>{weeklyInsight}</PixelText>
          <PixelButton
            label={nextTask ? "Start Protected Focus" : "Build First Queue"}
            icon={nextTask ? "play-arrow" : "add"}
            variant="primary"
            onPress={quickStart}
          />
        </PixelCard>
      </Animated.View>

      <View style={styles.grid}>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Time Saved
          </PixelText>
          <PixelText variant="h2">{formatMinutes(totalMinutes)}</PixelText>
          <ProgressBar progress={Math.min(totalMinutes / 120, 1)} striped />
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Milestones
          </PixelText>
          <PixelText variant="h2">
            {unlocked}/{milestones.length}
          </PixelText>
          <ProgressBar progress={milestones.length ? unlocked / milestones.length : 0} />
        </PixelCard>
      </View>

      {nextTask ? (
        <PixelCard>
          <View style={styles.row}>
            <View style={styles.flex}>
              <PixelText variant="label" muted uppercase>
                Up Next
              </PixelText>
              <PixelText variant="h2" numberOfLines={2}>
                {nextTask.title}
              </PixelText>
              <PixelText muted>
                {nextTask.category} · {formatMinutes(nextTask.estimateMinutes)}
              </PixelText>
            </View>
            <PixelButton icon="play-arrow" compact variant="primary" onPress={quickStart} />
          </View>
        </PixelCard>
      ) : (
        <EmptyState
          icon="checklist"
          title="No Queue Yet"
          body="Add one meaningful task and start a protected focus block from here."
          actionLabel="Add Task"
          onAction={() => router.push("/(tabs)/tasks")}
        />
      )}

      <PixelCard dark>
        <View style={styles.row}>
          <View style={styles.flex}>
            <PixelText variant="label" inverted uppercase>
              {activeRule ? "Active Block" : "Next Block"}
            </PixelText>
            <PixelText variant="h2" inverted numberOfLines={2}>
              {(activeRule ?? nextRule)?.name ?? "No block scheduled"}
            </PixelText>
            {(activeRule ?? nextRule) ? (
              <PixelText variant="label" inverted uppercase>
                {(activeRule ?? nextRule).schedule.startTime}-{(activeRule ?? nextRule).schedule.endTime} ·{" "}
                {(activeRule ?? nextRule).difficulty}
              </PixelText>
            ) : null}
          </View>
          <PixelButton label="Edit" icon="tune" compact onPress={() => router.push("/(tabs)/blocks")} />
        </View>
      </PixelCard>

      <View style={styles.grid}>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Daily Limit
          </PixelText>
          <PixelText variant="h2" numberOfLines={1}>
            {topBudget ? `${topBudget.usedMinutes}/${topBudget.dailyLimitMinutes}m` : "None"}
          </PixelText>
          {topBudget ? <ProgressBar progress={topBudget.usedMinutes / topBudget.dailyLimitMinutes} /> : null}
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Reminder
          </PixelText>
          <PixelText variant="h2">{nextReminder?.time ?? "--:--"}</PixelText>
          <PixelText muted numberOfLines={1}>
            {nextReminder?.label ?? "No reminders"}
          </PixelText>
        </PixelCard>
      </View>

      {recentRecord ? (
        <PixelCard>
          <View style={styles.row}>
            <View style={styles.flex}>
              <PixelText variant="label" muted uppercase>
                Last Session
              </PixelText>
              <PixelText variant="h2">{recentRecord.score}</PixelText>
              <PixelText muted numberOfLines={1}>
                {recentRecord.completedTaskTitles[0] ?? "Protected focus"} ·{" "}
                {formatMinutes(Math.floor(recentRecord.elapsedSeconds / 60))}
              </PixelText>
            </View>
            <StatusChip label={recentRecord.difficulty} tone="dark" />
          </View>
        </PixelCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  score: {
    lineHeight: 46
  },
  deviceMark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    gap: spacing.base,
    justifyContent: "center",
    minHeight: 92,
    width: 74
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  tile: {
    flex: 1,
    gap: spacing.xs,
    minHeight: 118,
    padding: spacing.xs
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  flex: {
    flex: 1,
    gap: spacing.base
  }
});
