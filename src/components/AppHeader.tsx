import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { PixelButton } from "./PixelButton";
import { PixelText } from "./PixelText";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({ title = "FOCUS", subtitle }: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <MaterialIcons name="terminal" size={21} color={colors.primary} />
        <PixelText variant="h2" uppercase>
          {title}
        </PixelText>
      </View>
      {subtitle ? (
        <PixelText variant="label" muted uppercase style={styles.subtitle}>
          {subtitle}
        </PixelText>
      ) : null}
      <Link href="/settings" asChild>
        <PixelButton icon="settings" compact />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  brand: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs
  },
  subtitle: {
    flexShrink: 0
  }
});
