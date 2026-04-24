import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function InterventionScreen() {
  const router = useRouter();
  const { activeSession, tasks, dispatch } = useFocusStore();
  const task = tasks.find((item) => activeSession.taskIds.includes(item.id));
  const progress = activeSession.plannedMinutes > 0 ? activeSession.actualMinutes / activeSession.plannedMinutes : 0;

  function returnToFocus() {
    dispatch({ type: "intervention", targetId: "social-feed.net", action: "returned" });
    router.replace("/(tabs)/focus");
  }

  function bypass() {
    dispatch({ type: "intervention", targetId: "social-feed.net", action: "bypassed" });
    router.replace("/(tabs)/focus");
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="SHIELD" />
      <PixelCard thick dark style={styles.hero}>
        <PixelText variant="h1" uppercase inverted>
          Blocked
        </PixelText>
        <PixelText inverted>
          Social Feed is shielded because your active task still matters.
        </PixelText>
      </PixelCard>
      <PixelCard>
        <PixelText variant="label" muted uppercase>
          Current Task
        </PixelText>
        <PixelText variant="h2">{task?.title ?? "Deep Work"}</PixelText>
        <View style={styles.line} />
        <PixelText muted>
          "The cost of one quick check is the time it takes to rebuild attention."
        </PixelText>
        <View style={styles.progress}>
          <ProgressBar progress={progress} />
          <PixelText variant="label" muted uppercase>
            {activeSession.actualMinutes}/{activeSession.plannedMinutes} minutes protected
          </PixelText>
        </View>
      </PixelCard>
      {activeSession.difficulty === "lockdown" ? (
        <PixelCard>
          <PixelText variant="h2" uppercase>
            Lockdown Active
          </PixelText>
          <PixelText muted>No bypass is available until the session ends.</PixelText>
        </PixelCard>
      ) : null}
      <PixelButton label="Return to Focus" icon="keyboard-return" variant="primary" onPress={returnToFocus} />
      <PixelButton
        label={activeSession.difficulty === "strict" ? "Breathe Then Bypass" : "Bypass"}
        icon="warning"
        variant="danger"
        disabled={activeSession.difficulty === "lockdown"}
        onPress={bypass}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm
  },
  line: {
    backgroundColor: colors.primary,
    height: 2,
    marginVertical: spacing.sm
  },
  progress: {
    gap: spacing.xs,
    marginTop: spacing.sm
  }
});
