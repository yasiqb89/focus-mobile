import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/design/tokens";
import { PixelText } from "./PixelText";

type FocusRingProps = {
  minutes: number;
  plannedMinutes: number;
};

export function FocusRing({ minutes, plannedMinutes }: FocusRingProps) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const progress = plannedMinutes > 0 ? Math.min(minutes / plannedMinutes, 1) : 0;
  const offset = circumference * (1 - progress);
  const remaining = Math.max(plannedMinutes - minutes, 0);

  return (
    <View style={styles.wrap}>
      <Svg height="210" width="210" viewBox="0 0 210 210" style={styles.svg}>
        <Circle cx="105" cy="105" r={radius} stroke={colors.surfaceHigh} strokeWidth="14" fill="none" />
        <Circle
          cx="105"
          cy="105"
          r={radius}
          stroke={colors.primary}
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform="rotate(-90 105 105)"
        />
      </Svg>
      <View style={styles.center}>
        <PixelText variant="display">{remaining.toString().padStart(2, "0")}:00</PixelText>
        <PixelText variant="label" muted uppercase>
          Remaining
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    height: 230,
    justifyContent: "center"
  },
  svg: {
    position: "absolute"
  },
  center: {
    alignItems: "center"
  }
});
