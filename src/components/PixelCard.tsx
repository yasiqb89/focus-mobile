import React, { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { brutal, colors, spacing } from "@/design/tokens";

type PixelCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
  thick?: boolean;
}>;

export function PixelCard({ children, style, dark, thick }: PixelCardProps) {
  return (
    <View
      style={[
        styles.card,
        thick ? brutal.borderThick : brutal.border,
        brutal.shadow,
        dark && styles.dark,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.sm
  },
  dark: {
    backgroundColor: colors.primary
  }
});
