import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { formatMinutes } from "@/data/scoring";
import { FocusScore } from "@/data/types";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

function getNextBestMove(score: FocusScore): string {
  if (score.bypasses >= 3) {
    return "You bypassed the shield several times. Switch to Lockdown for your next session — no bypasses means deeper work.";
  }
  if (score.bypasses > 0 && score.focusMinutes < 20) {
    return "Short session with distractions. Try a 25-minute session in Strict mode and close all non-essential apps first.";
  }
  if (score.focusMinutes === 0) {
    return "No focus time recorded. Start with a clear, single task and set a 15-minute timer to build the habit.";
  }
  if (score.focusMinutes < 15) {
    return "Good start. Even short sessions build the habit. Aim for 25 minutes next time with a defined task.";
  }
  if (score.focusMinutes >= 60) {
    return "Excellent depth. Take a real break — step away from your screen for at least 10 minutes before your next session.";
  }
  if (score.completedTasks === 0) {
    return "No tasks completed. Before your next session, write a single specific outcome you want to achieve, not just a topic.";
  }
  if (score.bypasses === 0 && score.focusMinutes >= 25) {
    return "Clean session with no bypasses. Keep the streak going — start the next session within 30 minutes.";
  }
  return "Solid session. Review what's left in your queue and pick your single most important next task before resting.";
}

export default function SessionCompleteScreen() {
  const router = useRouter();
  const { currentScore } = useFocusStore();

  const nextMove = getNextBestMove(currentScore);

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="SCORE" />
      <PixelCard thick style={styles.hero}>
        <PixelText variant="h1" uppercase>
          Session Complete
        </PixelText>
        <PixelText variant="display">{currentScore.score}</PixelText>
        <PixelText variant="label" muted uppercase>
          Focus Score
        </PixelText>
      </PixelCard>
      <View style={styles.grid}>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Focus Time
          </PixelText>
          <PixelText variant="h2">{formatMinutes(currentScore.focusMinutes)}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Tasks Done
          </PixelText>
          <PixelText variant="h2">{currentScore.completedTasks}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Blocks Held
          </PixelText>
          <PixelText variant="h2">{currentScore.blockedAttempts}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Bypasses
          </PixelText>
          <PixelText variant="h2">{currentScore.bypasses}</PixelText>
        </PixelCard>
      </View>
      <PixelCard dark>
        <PixelText variant="h2" uppercase inverted>
          Next Best Move
        </PixelText>
        <PixelText inverted style={styles.advice}>
          {nextMove}
        </PixelText>
      </PixelCard>
      <PixelButton
        label="View Stats"
        icon="bar-chart"
        variant="primary"
        onPress={() => router.replace("/(tabs)/stats")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.xs
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  tile: {
    borderColor: colors.primary,
    minHeight: 116,
    width: "46%"
  },
  advice: {
    lineHeight: 22,
    marginTop: spacing.xs
  }
});
