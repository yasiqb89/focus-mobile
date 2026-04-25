import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { formatTimer } from "@/data/scoring";
import { colors } from "@/design/tokens";
import { PixelText } from "./PixelText";

type FocusRingProps = {
  elapsedSeconds: number;
  plannedMinutes: number;
  compact?: boolean;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function FocusRing({ elapsedSeconds, plannedMinutes, compact }: FocusRingProps) {
  const radius = compact ? 43 : 78;
  const size = compact ? 126 : 210;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const plannedSeconds = plannedMinutes * 60;
  const progress = plannedSeconds > 0 ? Math.min(elapsedSeconds / plannedSeconds, 1) : 0;
  const animatedProgress = useSharedValue(progress);
  const remainingSeconds = Math.max(plannedSeconds - elapsedSeconds, 0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 420 });
  }, [animatedProgress, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value)
  }));

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.surfaceHigh} strokeWidth="14" fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primary}
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="butt"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>
        <PixelText variant={compact ? "h1" : "display"} style={styles.timer}>
          {formatTimer(remainingSeconds)}
        </PixelText>
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
  wrapCompact: {
    height: 132
  },
  svg: {
    position: "absolute"
  },
  center: {
    alignItems: "center"
  },
  timer: {
    fontVariant: ["tabular-nums"]
  }
});
