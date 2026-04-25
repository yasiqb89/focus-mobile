import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { brutal, colors, spacing } from "@/design/tokens";
import { PixelButton } from "./PixelButton";
import { PixelText } from "./PixelText";

type EmptyStateProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, brutal.border]}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <PixelText variant="h2" uppercase>
          {title}
        </PixelText>
        <PixelText muted>{body}</PixelText>
      </View>
      {actionLabel && onAction ? (
        <PixelButton label={actionLabel} icon="arrow-forward" variant="primary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    gap: spacing.sm,
    padding: spacing.sm
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  copy: {
    gap: spacing.xs
  }
});
