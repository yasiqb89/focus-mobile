import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { brutal, colors, spacing } from "@/design/tokens";
import { PixelText } from "./PixelText";

type PixelButtonProps = {
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  compact?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function PixelButton({
  label,
  icon,
  variant = "secondary",
  compact,
  disabled,
  style,
  onPress
}: PixelButtonProps) {
  const primary = variant === "primary";
  const danger = variant === "danger";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : styles.regular,
        brutal.border,
        brutal.shadow,
        primary && styles.primary,
        danger && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={compact ? 20 : 22}
          color={primary || danger ? colors.onPrimary : colors.primary}
        />
      ) : null}
      {label ? (
        <PixelText variant="label" uppercase inverted={primary || danger}>
          {label}
        </PixelText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center"
  },
  regular: {
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  compact: {
    height: 44,
    minWidth: 44,
    paddingHorizontal: spacing.xs
  },
  primary: {
    backgroundColor: colors.primary
  },
  danger: {
    backgroundColor: colors.error
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    ...(Platform.OS === "web" ? { boxShadow: "none" } : { shadowOpacity: 0 }),
    transform: [{ translateX: 4 }, { translateY: 4 }]
  }
});
