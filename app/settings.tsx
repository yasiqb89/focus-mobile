import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { permissionStatus, onboarded } = useFocusStore();

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="SETTINGS" />
      <PixelCard thick>
        <PixelText variant="h1" uppercase>
          Privacy Console
        </PixelText>
        <PixelText muted>
          Focus stores MVP data locally in SQLite. Friends and native restriction integrations are
          represented by adapters so the product can move to a backend and native extensions later.
        </PixelText>
      </PixelCard>
      <PixelCard>
        <View style={styles.row}>
          <PixelText variant="label" muted uppercase>
            Onboarded
          </PixelText>
          <PixelText variant="h2" uppercase>
            {onboarded ? "Yes" : "No"}
          </PixelText>
        </View>
        <View style={styles.line} />
        <View style={styles.row}>
          <PixelText variant="label" muted uppercase>
            Native Access
          </PixelText>
          <PixelText variant="h2" uppercase>
            {permissionStatus}
          </PixelText>
        </View>
      </PixelCard>
      <PixelButton label="Back" icon="arrow-back" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.xs
  },
  line: {
    backgroundColor: colors.primary,
    height: 2,
    marginVertical: spacing.xs
  }
});
