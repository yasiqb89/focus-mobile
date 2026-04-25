import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, layout, spacing } from "@/design/tokens";

type ScreenProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grain}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function FixedScreen({ children, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={[styles.fixed, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    paddingBottom: layout.bottomNavHeight + spacing.lg
  },
  grain: {
    gap: spacing.md,
    minHeight: "100%",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md
  },
  fixed: {
    flex: 1,
    gap: spacing.sm,
    paddingBottom: layout.bottomNavHeight + spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm
  }
});
