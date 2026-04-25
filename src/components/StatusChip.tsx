import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { brutal, colors, spacing } from "@/design/tokens";
import { PixelText } from "./PixelText";

type StatusChipProps = {
  label: string;
  tone?: "neutral" | "good" | "warn" | "danger" | "dark";
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function StatusChip({ label, tone = "neutral", icon }: StatusChipProps) {
  const dark = tone === "dark" || tone === "danger";
  return (
    <View style={[styles.chip, brutal.border, styles[tone]]}>
      {icon ? (
        <MaterialIcons
          name={icon}
          size={14}
          color={dark ? colors.onPrimary : colors.primary}
        />
      ) : null}
      <PixelText variant="label" uppercase inverted={dark} style={styles.label} numberOfLines={1}>
        {label}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.base,
    maxWidth: "100%",
    minHeight: 32,
    paddingHorizontal: spacing.xs
  },
  label: {
    flexShrink: 1
  },
  neutral: {
    backgroundColor: colors.surface
  },
  good: {
    backgroundColor: colors.successContainer
  },
  warn: {
    backgroundColor: colors.warningContainer
  },
  danger: {
    backgroundColor: colors.error
  },
  dark: {
    backgroundColor: colors.primary
  }
});
