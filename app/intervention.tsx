import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { elapsedFocusMinutes } from "@/data/scoring";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

// Seconds the user must wait before "Breathe Then Bypass" becomes available in strict mode.
const STRICT_COOLDOWN = 5;

export default function InterventionScreen() {
  const router = useRouter();
  const { activeSession, interventions, tasks, dispatch } = useFocusStore();

  // Use the most recent blocked intervention event's targetId if available, otherwise fall back.
  const lastBlocked = interventions.find((e) => e.action === "blocked");
  const targetId = lastBlocked?.targetId ?? "the blocked app";

  const task = tasks.find((item) => activeSession.taskIds.includes(item.id));
  const protectedMinutes = elapsedFocusMinutes(activeSession.elapsedSeconds);
  const progress =
    activeSession.plannedMinutes > 0
      ? activeSession.elapsedSeconds / (activeSession.plannedMinutes * 60)
      : 0;

  const isLockdown = activeSession.difficulty === "lockdown";
  const isStrict = activeSession.difficulty === "strict";

  const [countdown, setCountdown] = useState(isStrict ? STRICT_COOLDOWN : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isStrict || countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStrict]);

  function returnToFocus() {
    dispatch({ type: "intervention", targetId, action: "returned" });
    router.replace("/(tabs)/focus");
  }

  function attemptBypass() {
    if (isLockdown) return;

    if (isStrict && countdown > 0) return;

    if (!isStrict) {
      Alert.alert(
        "Break Focus?",
        "Bypassing will count against your score. Are you sure you want to leave?",
        [
          { text: "Stay Focused", style: "cancel" },
          {
            text: "Bypass",
            style: "destructive",
            onPress: () => {
              dispatch({ type: "intervention", targetId, action: "bypassed" });
              router.replace("/(tabs)/focus");
            }
          }
        ]
      );
      return;
    }

    // Strict mode, countdown expired — allow bypass.
    dispatch({ type: "intervention", targetId, action: "bypassed" });
    router.replace("/(tabs)/focus");
  }

  const bypassLabel = isStrict
    ? countdown > 0
      ? `Breathe… ${countdown}s`
      : "Bypass Now"
    : "Bypass";

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="SHIELD" />
      <PixelCard thick dark style={styles.hero}>
        <PixelText variant="h1" uppercase inverted>
          Blocked
        </PixelText>
        <PixelText inverted>
          {targetId} is shielded because your active task still matters.
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
            {protectedMinutes}/{activeSession.plannedMinutes} minutes protected
          </PixelText>
        </View>
      </PixelCard>
      {isLockdown ? (
        <PixelCard>
          <PixelText variant="h2" uppercase>
            Lockdown Active
          </PixelText>
          <PixelText muted>No bypass is available until the session ends.</PixelText>
        </PixelCard>
      ) : null}
      <PixelButton label="Return to Focus" icon="keyboard-return" variant="primary" onPress={returnToFocus} />
      <PixelButton
        label={bypassLabel}
        icon="warning"
        variant="danger"
        disabled={isLockdown || (isStrict && countdown > 0)}
        onPress={attemptBypass}
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
