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
  onEdit?: () => void;
  onDelete?: () => void;
};

export function TaskRow({ task, onStart, onComplete, onEdit, onDelete }: TaskRowProps) {
  const completed = task.status === "completed";
  const active = task.status === "in-progress";

  return (
    <View style={[styles.row, active && styles.activeRow, completed && styles.completedRow]}>
      <View style={styles.copy}>
        <PixelText variant="body" style={[styles.title, completed && styles.done]} numberOfLines={2}>
          {task.title}
        </PixelText>
        <View style={styles.meta}>
          <PixelText variant="label" muted uppercase style={styles.tag}>
            {task.category}
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {task.estimateMinutes}m
          </PixelText>
        </View>
      </View>
      <View style={styles.actions}>
        {/* Toggle done / undo */}
        {onComplete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={completed ? "Mark as todo" : "Mark as done"}
            onPress={onComplete}
            style={[styles.iconButton, brutal.border, completed && styles.doneActive]}
          >
            <MaterialIcons
              name={completed ? "replay" : "check"}
              size={19}
              color={completed ? colors.onPrimary : colors.primary}
            />
          </Pressable>
        ) : null}
        {onEdit && !completed ? (
          <Pressable accessibilityRole="button" onPress={onEdit} style={[styles.iconButton, brutal.border]}>
            <MaterialIcons name="edit" size={19} color={colors.primary} />
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable accessibilityRole="button" onPress={onDelete} style={[styles.iconButton, brutal.border]}>
            <MaterialIcons name="delete-outline" size={19} color={colors.error} />
          </Pressable>
        ) : null}
        {!completed ? (
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={[styles.play, brutal.border, active && styles.playActive]}
          >
            <MaterialIcons
              name={active ? "pause" : "play-arrow"}
              size={28}
              color={active ? colors.onPrimary : colors.primary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  activeRow: {
    backgroundColor: colors.surfaceLow
  },
  completedRow: {
    backgroundColor: colors.surfaceMid,
    opacity: 0.72
  },
  copy: {
    flex: 1,
    gap: 3
  },
  title: {
    fontWeight: "700"
  },
  done: {
    textDecorationLine: "line-through",
    color: colors.textMuted
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
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.base
  },
  iconButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36
  },
  doneActive: {
    backgroundColor: colors.primary
  },
  play: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48
  },
  playActive: {
    backgroundColor: colors.primary
  }
});
