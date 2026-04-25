import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { StatusChip } from "@/components/StatusChip";
import { WheelPicker } from "@/components/WheelPicker";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { Difficulty } from "@/data/types";
import { brutal, colors, layout, spacing, typography } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const ESTIMATE_VALUES = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90, 120];
const TOTAL_STEPS = 5;

type PendingTask = { title: string; estimateMinutes: number };

export default function OnboardingScreen() {
  const router = useRouter();
  const { dispatch, permissionStatus, targets } = useFocusStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Work without checking feeds");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskMinutes, setTaskMinutes] = useState(25);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("strict");
  const [selectedTargets, setSelectedTargets] = useState<string[]>(targets.slice(0, 3).map((target) => target.id));
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  function advanceTo(next: number) {
    setStep(next);
    Animated.timing(progressAnim, {
      toValue: next / TOTAL_STEPS,
      duration: 260,
      useNativeDriver: false
    }).start();
  }

  function addTask() {
    if (!taskTitle.trim()) return;
    setPendingTasks((prev) => [...prev, { title: taskTitle.trim(), estimateMinutes: taskMinutes }]);
    setTaskTitle("");
    setTaskMinutes(25);
  }

  async function requestAccess() {
    setLoading(true);
    try {
      const status = await restrictionProvider.requestPermissions();
      dispatch({ type: "set-permission", status });
    } finally {
      setLoading(false);
    }
  }

  function toggleTarget(id: string) {
    setSelectedTargets((current) =>
      current.includes(id) ? current.filter((targetId) => targetId !== id) : [...current, id]
    );
  }

  function finish() {
    if (name.trim()) dispatch({ type: "set-name", name: name.trim() });
    dispatch({ type: "set-difficulty", difficulty });
    pendingTasks.forEach((task) =>
      dispatch({ type: "add-task", title: task.title, estimateMinutes: task.estimateMinutes, category: "Focus" })
    );
    if (selectedTargets.length) {
      dispatch({
        type: "add-rule",
        name: "Daily Focus Routine",
        mode: "focus",
        targetIds: selectedTargets,
        startTime: workStart,
        endTime: workEnd
      });
    }
    dispatch({ type: "finish-onboarding" });
    router.replace("/home" as never);
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.stepRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[styles.stepDot, i + 1 === step && styles.stepDotActive, i + 1 < step && styles.stepDotDone]} />
            ))}
            <PixelText variant="label" muted uppercase>
              {step} of {TOTAL_STEPS}
            </PixelText>
          </View>

          {step === 1 ? (
            <View style={styles.stepContent}>
              <View style={styles.hero}>
                <MaterialIcons name="shield" size={32} color={colors.primary} />
                <PixelText variant="display" uppercase>
                  Focus
                </PixelText>
              </View>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Set Your Intent.
                </PixelText>
                <PixelText muted>A premium focus app starts by knowing what you are protecting.</PixelText>
              </View>
              <View style={styles.inputWrap}>
                <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textMuted} style={styles.input} />
              </View>
              <View style={styles.goalGrid}>
                {["Work without checking feeds", "Study with fewer loops", "Protect sleep", "Use my phone intentionally"].map((item) => (
                  <PixelButton
                    key={item}
                    label={item}
                    variant={goal === item ? "primary" : "secondary"}
                    onPress={() => setGoal(item)}
                    style={styles.goalButton}
                  />
                ))}
              </View>
              <PixelButton label="Continue" icon="arrow-forward" variant="primary" onPress={() => advanceTo(2)} />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Build Queue.
                </PixelText>
                <PixelText muted>Add the first task your focus session will protect.</PixelText>
              </View>
              <View style={styles.inputWrap}>
                <TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder="Task name..." placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="done" onSubmitEditing={addTask} />
              </View>
              <PixelCard>
                <View style={styles.pickerHeader}>
                  <PixelText variant="label" muted uppercase>
                    Estimated Time
                  </PixelText>
                  <StatusChip label={`${taskMinutes}m`} tone="dark" />
                </View>
                <WheelPicker values={ESTIMATE_VALUES} selected={taskMinutes} onSelect={setTaskMinutes} />
              </PixelCard>
              <PixelButton label="Add Task" icon="add" onPress={addTask} />
              {pendingTasks.length ? (
                <View style={styles.taskList}>
                  {pendingTasks.map((task, i) => (
                    <View key={`${task.title}-${i}`} style={styles.taskItem}>
                      <View style={styles.taskItemDot} />
                      <PixelText style={styles.taskItemTitle}>{task.title}</PixelText>
                      <PixelText variant="label" muted>
                        {task.estimateMinutes}m
                      </PixelText>
                      <TouchableOpacity onPress={() => setPendingTasks((prev) => prev.filter((_, index) => index !== i))} style={styles.taskRemove}>
                        <MaterialIcons name="close" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.stepNav}>
                <PixelButton label="Continue" icon="arrow-forward" variant="primary" onPress={() => advanceTo(3)} />
                {!pendingTasks.length ? <PixelButton label="Skip" variant="secondary" onPress={() => advanceTo(3)} /> : null}
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Choose Protection.
                </PixelText>
                <PixelText muted>Pick the friction level and apps/sites that usually pull you away.</PixelText>
              </View>
              <View style={styles.goalGrid}>
                {(["standard", "strict", "lockdown"] as const).map((item) => (
                  <PixelButton key={item} label={item} variant={difficulty === item ? "primary" : "secondary"} onPress={() => setDifficulty(item)} style={styles.goalButton} />
                ))}
              </View>
              <PixelCard>
                <View style={styles.pickerHeader}>
                  <PixelText variant="h2" uppercase>
                    Targets
                  </PixelText>
                  <StatusChip label={`${selectedTargets.length} selected`} tone="neutral" />
                </View>
                <View style={styles.targetGrid}>
                  {targets.map((target) => (
                    <PixelButton
                      key={target.id}
                      label={target.label}
                      icon={selectedTargets.includes(target.id) ? "check" : "add"}
                      variant={selectedTargets.includes(target.id) ? "primary" : "secondary"}
                      compact
                      onPress={() => toggleTarget(target.id)}
                      style={styles.targetButton}
                    />
                  ))}
                </View>
              </PixelCard>
              <PixelCard>
                <PixelText variant="h2" uppercase>
                  Native Access
                </PixelText>
                <PixelText muted style={styles.permCopy}>
                  Optional for this local beta. Required later for true app blocking on device.
                </PixelText>
                <View style={styles.permStatus}>
                  <PixelText variant="label" uppercase muted>
                    Status
                  </PixelText>
                  <PixelText variant="label" uppercase>
                    {permissionStatus}
                  </PixelText>
                </View>
                <PixelButton label={loading ? "Requesting..." : "Request Access"} icon="verified-user" onPress={requestAccess} />
              </PixelCard>
              <PixelButton label="Continue" icon="arrow-forward" variant="primary" onPress={() => advanceTo(4)} />
            </View>
          ) : null}

          {step === 4 ? (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Schedule Routine.
                </PixelText>
                <PixelText muted>Set a default work block. You can refine it from Blocks.</PixelText>
              </View>
              <View style={styles.timeGrid}>
                <View style={styles.timeBox}>
                  <PixelText variant="label" muted uppercase>
                    Start
                  </PixelText>
                  <TextInput value={workStart} onChangeText={setWorkStart} style={styles.timeInput} placeholder="09:00" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.timeBox}>
                  <PixelText variant="label" muted uppercase>
                    End
                  </PixelText>
                  <TextInput value={workEnd} onChangeText={setWorkEnd} style={styles.timeInput} placeholder="12:00" placeholderTextColor={colors.textMuted} />
                </View>
              </View>
              <PixelCard dark>
                <PixelText variant="label" uppercase inverted>
                  Goal
                </PixelText>
                <PixelText variant="h2" inverted>
                  {goal}
                </PixelText>
                <PixelText inverted>
                  {workStart}-{workEnd} · {difficulty} · {selectedTargets.length} targets
                </PixelText>
              </PixelCard>
              <PixelButton label="Continue" icon="arrow-forward" variant="primary" onPress={() => advanceTo(5)} />
            </View>
          ) : null}

          {step === 5 ? (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Ready.
                </PixelText>
                <PixelText muted>Your local focus OS is configured. Start from Today or jump into Focus.</PixelText>
              </View>
              <PixelCard dark>
                <View style={styles.summaryRow}>
                  <PixelText variant="label" uppercase inverted>
                    Tasks queued
                  </PixelText>
                  <PixelText variant="h2" inverted>
                    {pendingTasks.length}
                  </PixelText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <PixelText variant="label" uppercase inverted>
                    Protection
                  </PixelText>
                  <PixelText variant="h2" inverted>
                    {difficulty}
                  </PixelText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <PixelText variant="label" uppercase inverted>
                    Targets
                  </PixelText>
                  <PixelText variant="h2" inverted>
                    {selectedTargets.length}
                  </PixelText>
                </View>
              </PixelCard>
              <PixelButton label="Enter Focus" icon="arrow-forward" variant="primary" onPress={finish} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1
  },
  flex: {
    flex: 1
  },
  progressTrack: {
    backgroundColor: colors.surfaceHigh,
    height: 4
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: 4
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md
  },
  stepRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  stepDot: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.primary,
    borderRadius: 0,
    borderWidth: layout.border,
    height: 10,
    width: 10
  },
  stepDotActive: {
    backgroundColor: colors.primary
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    opacity: 0.4
  },
  stepContent: {
    gap: spacing.md
  },
  hero: {
    alignItems: "flex-start",
    gap: spacing.xs
  },
  heading: {
    gap: spacing.xs
  },
  inputWrap: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 4
  },
  input: {
    ...typography.h2,
    color: colors.text,
    minHeight: 56,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  goalButton: {
    flexGrow: 1
  },
  pickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  taskList: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    gap: spacing.xs,
    padding: spacing.sm
  },
  taskItem: {
    alignItems: "center",
    borderTopColor: colors.surfaceHigh,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  taskItemDot: {
    backgroundColor: colors.primary,
    height: 8,
    width: 8
  },
  taskItemTitle: {
    flex: 1,
    fontWeight: "600"
  },
  taskRemove: {
    padding: spacing.base
  },
  stepNav: {
    gap: spacing.xs
  },
  targetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  targetButton: {
    maxWidth: "100%"
  },
  permCopy: {
    marginVertical: spacing.xs
  },
  permStatus: {
    alignItems: "center",
    backgroundColor: colors.surfaceMid,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  timeGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  timeBox: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    flex: 1,
    padding: spacing.sm
  },
  timeInput: {
    ...typography.h2,
    color: colors.text,
    minHeight: 52
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryDivider: {
    backgroundColor: colors.onPrimary,
    height: 1,
    marginVertical: spacing.sm,
    opacity: 0.2
  }
});
