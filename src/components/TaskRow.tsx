import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { brutal, colors, spacing } from "@/design/tokens";
import { Task } from "@/data/types";
import { PixelText } from "./PixelText";

type TaskRowProps = {
  task: Task;
  onStart?: () => void;
  onComplete?: () => void;
};

export function TaskRow({ task, onStart, onComplete }: TaskRowProps) {
  const completed = task.status === "completed";
  const active = task.status === "in-progress";

  return (
    <View style={[styles.row, completed && styles.dim]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        onPress={onComplete}
        style={[styles.check, brutal.border, completed && styles.checked]}
      >
        {completed ? <View style={styles.dot} /> : null}
      </Pressable>
      <View style={styles.copy}>
        <PixelText variant="body" style={[styles.title, completed && styles.done]}>
          {task.title}
        </PixelText>
        <View style={styles.meta}>
          <PixelText variant="label" muted uppercase style={styles.tag}>
            {task.category}
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Est: {task.estimateMinutes}m
          </PixelText>
        </View>
      </View>
      <Pressable onPress={onStart} style={[styles.play, brutal.border, active && styles.playActive]}>
        <MaterialIcons name={active ? "pause" : "play-arrow"} size={28} color={active ? colors.onPrimary : colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  check: {
    alignItems: "center",
    backgroundColor: colors.surface,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  checked: {
    backgroundColor: colors.outline
  },
  dot: {
    backgroundColor: colors.surface,
    height: 9,
    width: 9
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontWeight: "800"
  },
  done: {
    textDecorationLine: "line-through"
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  tag: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.outline,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  play: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48
  },
  playActive: {
    backgroundColor: colors.primary
  },
  dim: {
    opacity: 0.48
  }
});
