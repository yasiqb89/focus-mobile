import React from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { formatMinutes } from "@/data/scoring";
import { brutal, colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const weekly = [
  { day: "MON", hours: 3.2 },
  { day: "TUE", hours: 5.1 },
  { day: "WED", hours: 7.4 },
  { day: "THU", hours: 2.1 },
  { day: "FRI", hours: 8.2 },
  { day: "SAT", hours: 1.5 },
  { day: "SUN", hours: 0.8 }
];

export default function StatsScreen() {
  const { currentScore, friends, interventions, scores } = useFocusStore();
  const totalFocus = scores.reduce((sum, score) => sum + score.focusMinutes, currentScore.focusMinutes);
  const topScore = Math.max(currentScore.score, ...scores.map((score) => score.score));

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="TELEMETRY" />
      <View style={styles.title}>
        <PixelText variant="display" uppercase>
          Telemetry
        </PixelText>
        <PixelText variant="h2" muted uppercase>
          Week 42 // Global Rank: 84
        </PixelText>
      </View>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Output Log
          </PixelText>
          <PixelText variant="label" uppercase inverted style={styles.chip}>
            Hrs / Day
          </PixelText>
        </View>
        <View style={styles.chart}>
          {weekly.map((item) => (
            <View key={item.day} style={styles.barWrap}>
              <View style={[styles.bar, { height: `${Math.max(12, item.hours * 10)}%` }]} />
              <PixelText variant="label" muted>
                {item.day}
              </PixelText>
            </View>
          ))}
        </View>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Vectors
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Focus split
          </PixelText>
        </View>
        {[
          { label: "Deep Work", value: 0.64 },
          { label: "Admin / Ops", value: 0.22 },
          { label: "Learning", value: 0.14 }
        ].map((item) => (
          <View key={item.label} style={styles.vector}>
            <View style={styles.header}>
              <PixelText style={styles.strong}>{item.label}</PixelText>
              <PixelText>{Math.round(item.value * 100)}%</PixelText>
            </View>
            <ProgressBar progress={item.value} striped={item.label !== "Deep Work"} />
          </View>
        ))}
      </PixelCard>

      <PixelCard dark>
        <View style={styles.header}>
          <View>
            <PixelText variant="label" uppercase inverted>
              Current Streak
            </PixelText>
            <PixelText variant="display" inverted>
              12d
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
          <PixelText variant="h2">{interventions.filter((event) => event.action === "blocked").length}</PixelText>
        </PixelCard>
      </View>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Zen Circle
          </PixelText>
          <PixelButton label="Invite" icon="add" compact />
        </View>
        {friends.map((friend, index) => (
          <View key={friend.id} style={[styles.friend, index === 0 && styles.friendActive]}>
            <PixelText variant="h2" inverted={index === 0} muted={index !== 0}>
              {String(index + 1).padStart(2, "0")}
            </PixelText>
            <View style={[styles.avatar, brutal.border, index === 0 && styles.avatarActive]}>
              <PixelText variant="label" inverted={index === 0}>
                {friend.name.slice(0, 2).toUpperCase()}
              </PixelText>
            </View>
            <View style={styles.friendCopy}>
              <PixelText style={styles.strong} inverted={index === 0}>
                {friend.name}
              </PixelText>
              <PixelText variant="label" muted={index !== 0} inverted={index === 0}>
                Status: {friend.status}
              </PixelText>
            </View>
            <View style={styles.friendScore}>
              <PixelText variant="h2" inverted={index === 0}>
                {friend.focusHours}h
              </PixelText>
              <PixelText variant="label" muted={index !== 0} inverted={index === 0}>
                {friend.score}
              </PixelText>
            </View>
          </View>
        ))}
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
    minHeight: 12,
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
  }
});
