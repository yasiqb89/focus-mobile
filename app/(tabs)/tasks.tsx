import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { TaskRow } from "@/components/TaskRow";
import { WheelPicker } from "@/components/WheelPicker";
import { formatMinutes, formatTimer } from "@/data/scoring";
import { colors, layout, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const ESTIMATE_VALUES = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90, 120];
const CATEGORIES = ["Focus", "Work", "Health", "Personal", "Learning", "Creative", "Admin"];

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, activeSession, dispatch } = useFocusStore();
  const [title, setTitle] = useState("");
  const [estimateMinutes, setEstimateMinutes] = useState(25);
  const [category, setCategory] = useState("Focus");
  const [showPicker, setShowPicker] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const activeTask = tasks.find((task) => task.status === "in-progress");
  const taskCount = useMemo(() => tasks.filter((task) => task.status !== "completed").length, [tasks]);

  function addTask() {
    if (!title.trim()) return;
    if (editingTaskId) {
      dispatch({ type: "update-task", taskId: editingTaskId, title, estimateMinutes, category });
      setEditingTaskId(null);
    } else {
      dispatch({ type: "add-task", title, estimateMinutes, category });
    }
    setTitle("");
    setEstimateMinutes(25);
    setCategory("Focus");
    setShowPicker(false);
  }

  function editTask(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setEditingTaskId(task.id);
    setTitle(task.title);
    setEstimateMinutes(task.estimateMinutes);
    setCategory(task.category);
    setShowPicker(true);
  }

  function startTask(taskId: string) {
    dispatch({ type: "start-task", taskId });
    router.push("/(tabs)/focus");
  }

  function confirmDelete(taskId: string) {
    Alert.alert("Delete Task", "Remove this task from your local queue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch({ type: "delete-task", taskId }) }
    ]);
  }

  const sessionStatus = activeSession.status === "running"
    ? "Running"
    : activeSession.status === "paused"
      ? "Paused"
      : "Idle";
  const sessionTone = activeSession.status === "running" ? "good" : activeSession.status === "paused" ? "warn" : "neutral";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <Screen>
        <AppHeader title="FOCUS" subtitle="QUEUE" />

        {/* Compact current flow strip */}
        <PixelCard style={styles.flowStrip}>
          <View style={styles.flowRow}>
            <StatusChip label={sessionStatus} tone={sessionTone} icon="timer" />
            <PixelText variant="body" style={styles.flowTitle} numberOfLines={1}>
              {activeTask?.title ?? "No active task"}
            </PixelText>
            {activeTask ? (
              <PixelText variant="label" muted uppercase style={styles.flowMeta}>
                {formatTimer(activeSession.elapsedSeconds)} / {formatMinutes(activeSession.plannedMinutes)}
              </PixelText>
            ) : null}
          </View>
        </PixelCard>

        {/* Queue header */}
        <View style={styles.queueHeader}>
          <PixelText variant="label" muted uppercase>
            Queue
          </PixelText>
          {taskCount > 0 ? (
            <PixelText variant="label" muted uppercase>
              {taskCount} pending
            </PixelText>
          ) : null}
        </View>

        {/* Task list */}
        {tasks.length === 0 ? (
          <View style={styles.emptyHint}>
            <PixelText muted>No tasks yet — add one below to get started.</PixelText>
          </View>
        ) : (
          <View style={styles.queue}>
            {tasks.map((task, index) => (
              <View key={task.id} style={styles.taskWrap}>
                <View style={styles.reorderRail}>
                  <PixelButton
                    icon="keyboard-arrow-up"
                    compact
                    disabled={index === 0}
                    onPress={() => dispatch({ type: "move-task", taskId: task.id, direction: "up" })}
                  />
                  <PixelButton
                    icon="keyboard-arrow-down"
                    compact
                    disabled={index === tasks.length - 1}
                    onPress={() => dispatch({ type: "move-task", taskId: task.id, direction: "down" })}
                  />
                </View>
                <View style={styles.taskMain}>
                  <TaskRow
                    task={task}
                    onStart={() => startTask(task.id)}
                    onEdit={() => editTask(task.id)}
                    onDelete={() => confirmDelete(task.id)}
                    onComplete={() => dispatch({ type: task.status === "completed" ? "uncomplete-task" : "complete-task", taskId: task.id })}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add task — visually anchored at bottom */}
        <View style={styles.addWrap}>
          <View style={styles.addLabel}>
            <MaterialIcons name="add-task" size={14} color={colors.primary} />
            <PixelText variant="label" uppercase>
              {editingTaskId ? "Edit Task" : "New Task"}
            </PixelText>
          </View>
          <View style={styles.addRow}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={editingTaskId ? "Edit task title..." : "What needs to get done?"}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              onSubmitEditing={addTask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.timeChip, showPicker && styles.timeChipActive]}
              onPress={() => setShowPicker((v) => !v)}
            >
              <MaterialIcons
                name="schedule"
                size={14}
                color={showPicker ? colors.onPrimary : colors.textMuted}
              />
              <PixelText
                variant="label"
                uppercase
                style={showPicker ? styles.chipTextActive : styles.chipText}
              >
                {estimateMinutes}m
              </PixelText>
            </TouchableOpacity>
            <PixelButton icon={editingTaskId ? "check" : "add"} compact onPress={addTask} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
            contentContainerStyle={styles.categoryRowContent}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <PixelText
                  variant="label"
                  uppercase
                  style={category === cat ? styles.chipTextActive : styles.chipText}
                >
                  {cat}
                </PixelText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {showPicker && (
            <View style={styles.pickerWrap}>
              <PixelText variant="label" muted uppercase style={styles.pickerLabel}>
                Estimated time
              </PixelText>
              <WheelPicker
                values={ESTIMATE_VALUES}
                selected={estimateMinutes}
                onSelect={setEstimateMinutes}
              />
            </View>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  flowStrip: {
    padding: spacing.xs
  },
  flowRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  flowTitle: {
    flex: 1,
    fontWeight: "700"
  },
  flowMeta: {
    flexShrink: 0
  },
  queueHeader: {
    alignItems: "center",
    borderBottomColor: colors.surfaceHigh,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    marginTop: spacing.xs
  },
  emptyHint: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm
  },
  queue: {
    borderColor: colors.primary,
    borderWidth: layout.border
  },
  taskWrap: {
    alignItems: "stretch",
    borderBottomColor: colors.primary,
    borderBottomWidth: 1,
    flexDirection: "row"
  },
  reorderRail: {
    borderRightColor: colors.primary,
    borderRightWidth: 1,
    gap: spacing.base,
    justifyContent: "center",
    padding: spacing.base
  },
  taskMain: {
    flex: 1
  },
  addWrap: {
    borderColor: colors.primary,
    borderWidth: layout.borderThick,
    marginTop: spacing.sm
  },
  addLabel: {
    alignItems: "center",
    backgroundColor: colors.surfaceLow,
    borderBottomColor: colors.primary,
    borderBottomWidth: layout.border,
    flexDirection: "row",
    gap: spacing.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base
  },
  addRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    minHeight: 44,
    paddingHorizontal: spacing.xs
  },
  categoryRow: {
    borderTopColor: colors.primary,
    borderTopWidth: layout.border
  },
  categoryRowContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  categoryChip: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  categoryChipActive: {
    backgroundColor: colors.primary
  },
  timeChip: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.primary,
    borderWidth: layout.border,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  timeChipActive: {
    backgroundColor: colors.primary
  },
  chipText: {
    color: colors.textMuted
  },
  chipTextActive: {
    color: colors.onPrimary
  },
  pickerWrap: {
    borderTopColor: colors.primary,
    borderTopWidth: layout.border,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs
  },
  pickerLabel: {
    marginBottom: spacing.xs
  }
});
