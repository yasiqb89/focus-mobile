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
  const radius = compact ? 62 : 90;
  const strokeWidth = compact ? 8 : 10;
  const size = (radius + strokeWidth) * 2 + 4;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const plannedSeconds = plannedMinutes * 60;
  const progress = plannedSeconds > 0 ? Math.min(elapsedSeconds / plannedSeconds, 1) : 0;
  const animatedProgress = useSharedValue(progress);
  const remainingSeconds = Math.max(plannedSeconds - elapsedSeconds, 0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 600 });
  }, [animatedProgress, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value)
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceHigh}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>
        <PixelText
          variant={compact ? "h1" : "display"}
          style={[styles.timer, compact ? styles.timerCompact : styles.timerFull]}
        >
          {formatTimer(remainingSeconds)}
        </PixelText>
        <PixelText variant="label" muted uppercase style={styles.label}>
          Remaining
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  timer: {
    fontVariant: ["tabular-nums"],
    letterSpacing: 1
  },
  timerCompact: {
    fontSize: 26,
    lineHeight: 30
  },
  timerFull: {
    fontSize: 40,
    lineHeight: 44
  },
  label: {
    letterSpacing: 1
  }
});
