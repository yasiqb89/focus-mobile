import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
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

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, activeSession, dispatch } = useFocusStore();
  const [title, setTitle] = useState("");
  const [estimateMinutes, setEstimateMinutes] = useState(25);
  const [category, setCategory] = useState("Focus");
  const [showPicker, setShowPicker] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const todoCount = useMemo(() => tasks.filter((task) => task.status !== "completed").length, [tasks]);
  const activeTask = tasks.find((task) => task.status === "in-progress");

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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
    <Screen>
      <AppHeader title="FOCUS" subtitle="QUEUE" />

      {/* Active task card */}
      <View style={styles.titleRow}>
        <PixelText variant="h1" uppercase>
          Current Flow
        </PixelText>
      </View>
      <PixelCard thick>
        <StatusChip
          label={
            activeSession.status === "running"
              ? "Running"
              : activeSession.status === "paused"
                ? "Paused"
                : "Idle"
          }
          tone={activeSession.status === "running" ? "good" : activeSession.status === "paused" ? "warn" : "neutral"}
          icon="timer"
        />
        <PixelText variant="h2">{activeTask?.title ?? "No active task"}</PixelText>
        {activeTask ? (
          <>
            <View style={styles.line} />
            <View style={styles.timeRow}>
              <View>
                <PixelText variant="label" muted uppercase>
                  Elapsed
                </PixelText>
                <PixelText variant="display" style={styles.tabular}>
                  {formatTimer(activeSession.elapsedSeconds)}
                </PixelText>
              </View>
              <View style={styles.timeDivider} />
              <View>
                <PixelText variant="label" muted uppercase>
                  Planned
                </PixelText>
                <PixelText variant="h1">{formatMinutes(activeSession.plannedMinutes)}</PixelText>
              </View>
            </View>
          </>
        ) : (
          <PixelText muted style={styles.description}>
            Pick a task below to bind it to the focus timer.
          </PixelText>
        )}
      </PixelCard>

      {/* Queue */}
      <View style={styles.titleRow}>
        <PixelText variant="h1" uppercase>
          Queue
        </PixelText>
        <PixelText variant="label" muted uppercase style={styles.count}>
          {tasks.length} Tasks
        </PixelText>
      </View>

      {tasks.length === 0 ? null : (
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
                  onComplete={() => dispatch({ type: "complete-task", taskId: task.id })}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon="bolt"
          title="Start Small"
          body="A production focus flow begins with a single clear task and a realistic time box."
        />
      ) : null}

      {/* Add task */}
      <View style={styles.addWrap}>
        <View style={styles.addRow}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={editingTaskId ? "Edit task..." : "Add new task..."}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Focus"
            placeholderTextColor={colors.textMuted}
            style={styles.categoryInput}
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
  titleRow: {
    alignItems: "flex-end",
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.xs
  },
  description: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    marginTop: spacing.sm,
    paddingLeft: spacing.sm
  },
  line: {
    backgroundColor: colors.primary,
    height: 2,
    marginVertical: spacing.sm
  },
  timeRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.md
  },
  timeDivider: {
    backgroundColor: colors.primary,
    height: 40,
    marginBottom: spacing.xs,
    width: 2
  },
  tabular: {
    fontVariant: ["tabular-nums"]
  },
  count: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
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
    borderWidth: layout.borderThick
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
  categoryInput: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    minHeight: 44,
    paddingHorizontal: spacing.xs,
    width: 78
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
