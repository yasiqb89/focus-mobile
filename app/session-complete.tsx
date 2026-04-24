import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { formatMinutes } from "@/data/scoring";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function SessionCompleteScreen() {
  const router = useRouter();
  const { currentScore } = useFocusStore();

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
        <PixelText inverted>
          Keep the next session shorter than the last one and protect the first 10 minutes with Lockdown.
        </PixelText>
      </PixelCard>
      <PixelButton label="View Stats" icon="bar-chart" variant="primary" onPress={() => router.replace("/(tabs)/stats")} />
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
  }
});
