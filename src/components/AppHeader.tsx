import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { PixelText } from "./PixelText";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({ title = "FOCUS", subtitle }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onSettings = pathname === "/settings";

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.brand} activeOpacity={0.7} onPress={() => router.push("/(tabs)/focus")}>
        <MaterialIcons name="terminal" size={21} color={colors.primary} />
        <PixelText variant="h2" uppercase>
          {title}
        </PixelText>
      </TouchableOpacity>
      {subtitle ? (
        <PixelText variant="label" muted uppercase style={styles.subtitle}>
          {subtitle}
        </PixelText>
      ) : null}
      <TouchableOpacity
        onPress={() => (onSettings ? router.back() : router.push("/settings"))}
        style={styles.gearBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name={onSettings ? "close" : "settings"} size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs
  },
  brand: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs
  },
  subtitle: {
    flexShrink: 0
  },
  gearBtn: {
    padding: spacing.xs
  }
});
