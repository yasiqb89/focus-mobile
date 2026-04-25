import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { formatMinutes } from "@/data/scoring";
import { FocusScore } from "@/data/types";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function buildWeeklyData(scores: FocusScore[]): { day: string; minutes: number }[] {
  const now = new Date();
  const minutesByDay = new Array(7).fill(0);
  scores.forEach((s) => {
    if (!s.completedAt) return;
    const d = new Date(s.completedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays >= 7) return;
    const dow = d.getDay();
    const mondayIdx = dow === 0 ? 6 : dow - 1;
    minutesByDay[mondayIdx] += s.focusMinutes;
  });
  return DAYS.map((day, i) => ({ day, minutes: minutesByDay[i] }));
}

function calculateStreak(scores: FocusScore[]): number {
  const datesWithFocus = new Set(
    scores
      .filter((s) => s.completedAt && s.focusMinutes > 0)
      .map((s) => {
        const d = new Date(s.completedAt!);
        d.setHours(0, 0, 0, 0);
        return d.toDateString();
      })
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (datesWithFocus.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildVectors(tasks: ReturnType<typeof useFocusStore>["tasks"]) {
  const completed = tasks.filter((t) => t.status === "completed");
  if (completed.length === 0) return [];
  const totals: Record<string, number> = {};
  completed.forEach((t) => {
    totals[t.category] = (totals[t.category] ?? 0) + t.estimateMinutes;
  });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, mins]) => ({ label, value: mins / grandTotal }));
}

export default function StatsScreen() {
  const router = useRouter();
  const { currentScore, interventions, milestones, scores, sessionRecords, tasks } = useFocusStore();

  const allScores = useMemo(
    () => [currentScore, ...scores].filter((s) => s.focusMinutes > 0),
    [currentScore, scores]
  );

  const totalFocus = allScores.reduce((sum, s) => sum + s.focusMinutes, 0);
  const topScore = allScores.length > 0 ? Math.max(...allScores.map((s) => s.score)) : 0;
  const streak = useMemo(() => calculateStreak(scores), [scores]);
  const weekly = useMemo(() => buildWeeklyData(scores), [scores]);
  const maxMinutes = Math.max(...weekly.map((d) => d.minutes), 1);
  const vectors = useMemo(() => buildVectors(tasks), [tasks]);
  const weekNumber = getISOWeek(new Date());
  const blockedCount = interventions.filter((e) => e.action === "blocked").length;

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="PROFILE" />
      <View style={styles.title}>
        <PixelText variant="display" uppercase>
          Profile
        </PixelText>
        <PixelText variant="h2" muted uppercase>
          Week {weekNumber}
        </PixelText>
      </View>

      {/* Weekly output chart */}
      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Output Log
          </PixelText>
          <PixelText variant="label" uppercase inverted style={styles.chip}>
            Min / Day
          </PixelText>
        </View>
        {totalFocus === 0 ? (
          <PixelText muted style={styles.empty}>
            No sessions completed yet. Start your first session to see your output log.
          </PixelText>
        ) : (
          <View style={styles.chart}>
            {weekly.map((item, index) => (
              <Animated.View
                key={item.day}
                entering={FadeInUp.delay(40 * index).duration(260)}
                layout={Layout.springify().damping(18)}
                style={styles.barWrap}
              >
                <Animated.View
                  style={[
                    styles.bar,
                    { height: `${Math.max(item.minutes > 0 ? 8 : 0, (item.minutes / maxMinutes) * 100)}%` }
                  ]}
                />
                <PixelText variant="label" muted>
                  {item.day}
                </PixelText>
              </Animated.View>
            ))}
          </View>
        )}
      </PixelCard>

      {/* Focus vectors */}
      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Vectors
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Focus split
          </PixelText>
        </View>
        {vectors.length === 0 ? (
          <PixelText muted style={styles.empty}>
            Complete tasks to see your focus breakdown by category.
          </PixelText>
        ) : (
          vectors.map((item, i) => (
            <View key={item.label} style={styles.vector}>
              <View style={styles.header}>
                <PixelText style={styles.strong}>{item.label}</PixelText>
                <PixelText>{Math.round(item.value * 100)}%</PixelText>
              </View>
              <ProgressBar progress={item.value} striped={i > 0} />
            </View>
          ))
        )}
      </PixelCard>

      {/* Streak + top score */}
      <PixelCard dark>
        <View style={styles.header}>
          <View>
            <PixelText variant="label" uppercase inverted>
              Current Streak
            </PixelText>
            <PixelText variant="display" inverted>
              {streak}d
            </PixelText>
          </View>
          <View>
            <PixelText variant="label" uppercase inverted>
              Top Score
            </PixelText>
            <PixelText variant="h1" inverted>
              {topScore}
            </PixelText>
          </View>
        </View>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Milestones
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {milestones.filter((item) => item.unlockedAt).length}/{milestones.length}
          </PixelText>
        </View>
        {milestones.map((milestone) => (
          <View key={milestone.id} style={styles.milestone}>
            <View style={styles.friendCopy}>
              <PixelText style={styles.strong}>{milestone.title}</PixelText>
              <PixelText muted>{milestone.description}</PixelText>
            </View>
            <StatusChip
              label={milestone.unlockedAt ? "Unlocked" : "Locked"}
              tone={milestone.unlockedAt ? "good" : "neutral"}
            />
          </View>
        ))}
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Session History
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {sessionRecords.length} logs
          </PixelText>
        </View>
        {sessionRecords.length === 0 ? (
          <PixelText muted style={styles.empty}>
            Completed sessions will appear here with score, difficulty, and task context.
          </PixelText>
        ) : (
          sessionRecords.slice(0, 6).map((record) => (
            <View key={record.id} style={styles.historyRow}>
              <View style={styles.friendCopy}>
                <PixelText style={styles.strong} numberOfLines={1}>
                  {record.completedTaskTitles[0] ?? "Focus session"}
                </PixelText>
                <PixelText variant="label" muted uppercase>
                  {formatMinutes(Math.floor(record.elapsedSeconds / 60))} · {record.difficulty}
                </PixelText>
              </View>
              <PixelText variant="h2">{record.score}</PixelText>
            </View>
          ))
        )}
      </PixelCard>

      {/* Summary metrics */}
      <View style={styles.metrics}>
        <PixelCard style={styles.metric}>
          <PixelText variant="label" muted uppercase>
            Focus Time
          </PixelText>
          <PixelText variant="h2">{formatMinutes(totalFocus)}</PixelText>
        </PixelCard>
        <PixelCard style={styles.metric}>
          <PixelText variant="label" muted uppercase>
            Blocked
          </PixelText>
          <PixelText variant="h2">{blockedCount}</PixelText>
        </PixelCard>
      </View>

      {/* Local privacy summary */}
      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Privacy
          </PixelText>
          <StatusChip label="Local only" tone="dark" />
        </View>
        <PixelText muted>
          This beta stores focus history, task queue, targets, and settings on this device. Social and
          cloud sync are intentionally deferred.
        </PixelText>
        <PixelButton label="Settings" icon="settings" compact onPress={() => router.push("/settings")} />
      </PixelCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  chip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  empty: {
    marginTop: spacing.sm
  },
  chart: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.xs,
    height: 180,
    marginTop: spacing.md
  },
  barWrap: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
    height: "100%",
    justifyContent: "flex-end"
  },
  bar: {
    backgroundColor: colors.primary,
    minHeight: 0,
    width: "100%"
  },
  vector: {
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  strong: {
    fontWeight: "900",
    textTransform: "uppercase"
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  metric: {
    flex: 1
  },
  friend: {
    alignItems: "center",
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  friendActive: {
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  avatarActive: {
    borderColor: colors.onPrimary
  },
  friendCopy: {
    flex: 1
  },
  friendScore: {
    alignItems: "flex-end"
  },
  milestone: {
    alignItems: "center",
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  historyRow: {
    alignItems: "center",
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingVertical: spacing.sm
  }
});
