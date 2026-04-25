import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { TaskRow } from "@/components/TaskRow";
import { WheelPicker } from "@/components/WheelPicker";
import { formatMinutes } from "@/data/scoring";
import { colors, layout, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const ESTIMATE_VALUES = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90, 120];

export default function TasksScreen() {
  const { tasks, activeSession, dispatch } = useFocusStore();
  const [title, setTitle] = useState("");
  const [estimateMinutes, setEstimateMinutes] = useState(25);
  const [showPicker, setShowPicker] = useState(false);

  const todoCount = useMemo(() => tasks.filter((task) => task.status !== "completed").length, [tasks]);
  const activeTask = tasks.find((task) => task.status === "in-progress");

  function addTask() {
    if (!title.trim()) return;
    dispatch({ type: "add-task", title, estimateMinutes, category: "Focus" });
    setTitle("");
    setEstimateMinutes(25);
    setShowPicker(false);
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle={`${todoCount} TASKS`} />

      {/* Active task card */}
      <View style={styles.titleRow}>
        <PixelText variant="h1" uppercase>
          Current Flow
        </PixelText>
      </View>
      <PixelCard thick>
        <View style={styles.badge}>
          <PixelText variant="label" uppercase inverted>
            {activeSession.status === "running"
              ? "Running"
              : activeSession.status === "paused"
                ? "Paused"
                : "Idle"}
          </PixelText>
        </View>
        <PixelText variant="h2">{activeTask?.title ?? "No active task"}</PixelText>
        {activeTask ? (
          <>
            <View style={styles.line} />
            <View style={styles.timeRow}>
              <View>
                <PixelText variant="label" muted uppercase>
                  Elapsed
                </PixelText>
                <PixelText variant="display">{formatMinutes(activeSession.actualMinutes)}</PixelText>
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

      {tasks.length === 0 ? (
        <PixelCard>
          <PixelText variant="h2" uppercase>
            Empty Queue
          </PixelText>
          <PixelText muted>Add your first task below to get started.</PixelText>
        </PixelCard>
      ) : (
        <View style={styles.queue}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onStart={() => dispatch({ type: "start-task", taskId: task.id })}
              onComplete={() => dispatch({ type: "complete-task", taskId: task.id })}
            />
          ))}
        </View>
      )}

      {/* Add task */}
      <View style={styles.addWrap}>
        <View style={styles.addRow}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add new task..."
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
          <PixelButton icon="add" compact onPress={addTask} />
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
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: "flex-end",
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.xs
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
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
