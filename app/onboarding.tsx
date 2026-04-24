import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { brutal, colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const { dispatch, permissionStatus } = useFocusStore();
  const [loading, setLoading] = useState(false);

  async function requestAccess() {
    setLoading(true);
    const status = await restrictionProvider.requestPermissions();
    dispatch({ type: "set-permission", status });
    setLoading(false);
  }

  function finish() {
    dispatch({ type: "finish-onboarding" });
    router.replace("/(tabs)/focus");
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <MaterialIcons name="terminal" size={34} color={colors.primary} />
        <PixelText variant="display" uppercase>
          Focus
        </PixelText>
        <PixelText muted>
          Save time by turning intent into a session, then letting the phone get out of the way.
        </PixelText>
      </View>
      <PixelCard thick>
        <PixelText variant="h2" uppercase>
          Permission Setup
        </PixelText>
        <View style={styles.rule} />
        <PixelText muted>
          iOS uses Screen Time shields when the Family Controls entitlement is available. Android uses
          usage access and a monitored intervention flow unless device policy control is configured.
        </PixelText>
        <View style={styles.status}>
          <PixelText variant="label" uppercase>
            Current Access
          </PixelText>
          <PixelText variant="h2" uppercase>
            {permissionStatus}
          </PixelText>
        </View>
        <PixelButton
          label={loading ? "Requesting" : "Request Access"}
          icon="verified-user"
          variant="primary"
          onPress={requestAccess}
        />
      </PixelCard>
      <PixelCard>
        <PixelText variant="h2" uppercase>
          MVP Modules
        </PixelText>
        {["Task queue", "Focus timer", "Blocking rules", "Score reports", "Zen Circle"].map((item) => (
          <View key={item} style={styles.item}>
            <View style={[styles.square, brutal.border]} />
            <PixelText>{item}</PixelText>
          </View>
        ))}
      </PixelCard>
      <PixelButton label="Enter Focus" icon="arrow-forward" variant="primary" onPress={finish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs
  },
  rule: {
    backgroundColor: colors.primary,
    height: 4,
    marginVertical: spacing.sm
  },
  status: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.primary,
    borderWidth: 2,
    gap: spacing.xs,
    marginVertical: spacing.sm,
    padding: spacing.sm
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  square: {
    backgroundColor: colors.primary,
    height: 14,
    width: 14
  }
});
