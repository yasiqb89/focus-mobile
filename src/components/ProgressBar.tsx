import React from "react";
import { StyleSheet, View } from "react-native";
import { brutal, colors } from "@/design/tokens";

type ProgressBarProps = {
  progress: number;
  striped?: boolean;
};

export function ProgressBar({ progress, striped }: ProgressBarProps) {
  return (
    <View style={[styles.track, brutal.border]}>
      <View
        style={[
          styles.fill,
          striped && styles.striped,
          { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceHigh,
    height: 18,
    padding: 2,
    width: "100%"
  },
  fill: {
    backgroundColor: colors.primary,
    height: "100%"
  },
  striped: {
    borderRightColor: colors.surface,
    borderRightWidth: 2
  }
});
