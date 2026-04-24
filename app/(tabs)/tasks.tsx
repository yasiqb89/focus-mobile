import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { TaskRow } from "@/components/TaskRow";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function TasksScreen() {
  const { tasks, activeSession, dispatch } = useFocusStore();
  const [title, setTitle] = useState("");
  const todoCount = useMemo(() => tasks.filter((task) => task.status !== "completed").length, [tasks]);
  const activeTask = tasks.find((task) => task.status === "in-progress");

  function addTask() {
    if (!title.trim()) return;
    dispatch({ type: "add-task", title, estimateMinutes: 25, category: "Focus" });
    setTitle("");
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle={`${todoCount} TASKS`} />
      <View style={styles.titleRow}>
        <PixelText variant="h1" uppercase>
          Current Flow
        </PixelText>
      </View>
      <PixelCard thick>
        <View style={styles.badge}>
          <PixelText variant="label" uppercase inverted>
            {activeSession.status === "running" ? "In Progress" : activeSession.status}
          </PixelText>
        </View>
        <PixelText variant="h2">{activeTask?.title ?? "No active task selected"}</PixelText>
        <PixelText muted style={styles.description}>
          Pick a task from the queue to bind it to the focus timer and activate the relevant block rules.
        </PixelText>
        <View style={styles.line} />
        <PixelText variant="label" muted uppercase>
          Elapsed Time
        </PixelText>
        <PixelText variant="display">{activeSession.actualMinutes}:00</PixelText>
        <PixelText muted>/ {activeSession.plannedMinutes}m est.</PixelText>
      </PixelCard>

      <View style={styles.titleRow}>
        <PixelText variant="h1" uppercase>
          Queue
        </PixelText>
        <PixelText variant="label" muted uppercase style={styles.count}>
          {tasks.length} Tasks
        </PixelText>
      </View>

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

      {tasks.length === 0 ? (
        <PixelCard>
          <PixelText variant="h2" uppercase>
            Empty Queue
          </PixelText>
          <PixelText muted>Add one task and Focus will turn it into a timed work block.</PixelText>
        </PixelCard>
      ) : null}

      <View style={styles.addRow}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Add new task..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={addTask}
        />
        <PixelButton icon="add" compact onPress={addTask} />
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
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  description: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    marginVertical: spacing.sm,
    paddingLeft: spacing.sm
  },
  line: {
    backgroundColor: colors.primary,
    height: 2,
    marginVertical: spacing.sm
  },
  count: {
    borderColor: colors.primary,
    borderWidth: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  queue: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  addRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    minHeight: 52,
    paddingHorizontal: spacing.sm
  }
});
