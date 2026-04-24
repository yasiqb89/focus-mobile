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
import { WheelPicker } from "@/components/WheelPicker";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { brutal, colors, layout, spacing, typography } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

const ESTIMATE_VALUES = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90, 120];
const TOTAL_STEPS = 3;

type PendingTask = { title: string; estimateMinutes: number };

export default function OnboardingScreen() {
  const router = useRouter();
  const { dispatch, permissionStatus } = useFocusStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskMinutes, setTaskMinutes] = useState(25);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  function advanceTo(next: number) {
    setStep(next);
    Animated.timing(progressAnim, {
      toValue: next / TOTAL_STEPS,
      duration: 280,
      useNativeDriver: false
    }).start();
  }

  function addTask() {
    if (!taskTitle.trim()) return;
    setPendingTasks((prev) => [...prev, { title: taskTitle.trim(), estimateMinutes: taskMinutes }]);
    setTaskTitle("");
    setTaskMinutes(25);
  }

  function removeTask(index: number) {
    setPendingTasks((prev) => prev.filter((_, i) => i !== index));
  }

  async function requestAccess() {
    setLoading(true);
    const status = await restrictionProvider.requestPermissions();
    dispatch({ type: "set-permission", status });
    setLoading(false);
  }

  function finish() {
    if (name.trim()) dispatch({ type: "set-name", name: name.trim() });
    pendingTasks.forEach((task) =>
      dispatch({ type: "add-task", title: task.title, estimateMinutes: task.estimateMinutes, category: "Focus" })
    );
    dispatch({ type: "finish-onboarding" });
    router.replace("/(tabs)/focus");
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicators */}
          <View style={styles.stepRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[styles.stepDot, i + 1 === step && styles.stepDotActive, i + 1 < step && styles.stepDotDone]}
              />
            ))}
            <PixelText variant="label" muted uppercase>
              {step} of {TOTAL_STEPS}
            </PixelText>
          </View>

          {/* ─── Step 1: Name ─── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.hero}>
                <MaterialIcons name="terminal" size={32} color={colors.primary} />
                <PixelText variant="display" uppercase>
                  Focus
                </PixelText>
              </View>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Hello.
                </PixelText>
                <PixelText muted>What should we call you?</PixelText>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => advanceTo(2)}
                />
              </View>
              <PixelButton
                label="Continue"
                icon="arrow-forward"
                variant="primary"
                onPress={() => advanceTo(2)}
              />
            </View>
          )}

          {/* ─── Step 2: Tasks ─── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  Build your queue.
                </PixelText>
                <PixelText muted>What are you working on{name ? `, ${name}` : ""}?</PixelText>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder="Task name..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={addTask}
                />
              </View>

              {/* Watch-style time picker */}
              <PixelCard>
                <View style={styles.pickerHeader}>
                  <PixelText variant="label" muted uppercase>
                    Estimated Time
                  </PixelText>
                  <View style={styles.pickerValue}>
                    <PixelText variant="h2">{taskMinutes}m</PixelText>
                  </View>
                </View>
                <WheelPicker
                  values={ESTIMATE_VALUES}
                  selected={taskMinutes}
                  onSelect={setTaskMinutes}
                />
              </PixelCard>

              <PixelButton label="Add Task" icon="add" onPress={addTask} />

              {/* Added tasks list */}
              {pendingTasks.length > 0 && (
                <View style={styles.taskList}>
                  <View style={styles.taskListHeader}>
                    <PixelText variant="label" uppercase muted>
                      Queue
                    </PixelText>
                    <View style={[styles.badge, brutal.border]}>
                      <PixelText variant="label" uppercase>
                        {pendingTasks.length}
                      </PixelText>
                    </View>
                  </View>
                  {pendingTasks.map((task, i) => (
                    <View key={i} style={styles.taskItem}>
                      <View style={styles.taskItemDot} />
                      <PixelText style={styles.taskItemTitle}>{task.title}</PixelText>
                      <PixelText variant="label" muted>
                        {task.estimateMinutes}m
                      </PixelText>
                      <TouchableOpacity onPress={() => removeTask(i)} style={styles.taskRemove}>
                        <MaterialIcons name="close" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.stepNav}>
                <PixelButton label="Continue" icon="arrow-forward" variant="primary" onPress={() => advanceTo(3)} />
                {pendingTasks.length === 0 && (
                  <PixelButton label="Skip" variant="secondary" onPress={() => advanceTo(3)} />
                )}
              </View>
            </View>
          )}

          {/* ─── Step 3: Ready ─── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.heading}>
                <PixelText variant="h1" uppercase>
                  {name ? `You're set, ${name}.` : "You're set."}
                </PixelText>
                <PixelText muted>
                  Focus will turn your tasks into timed work blocks and get distractions out of the way.
                </PixelText>
              </View>

              {/* Summary */}
              <PixelCard dark>
                <View style={styles.summaryRow}>
                  <PixelText variant="label" uppercase inverted>
                    Tasks queued
                  </PixelText>
                  <PixelText variant="h2" inverted>
                    {pendingTasks.length}
                  </PixelText>
                </View>
                {pendingTasks.length > 0 && (
                  <>
                    <View style={styles.summaryDivider} />
                    {pendingTasks.slice(0, 3).map((task, i) => (
                      <View key={i} style={styles.summaryTask}>
                        <View style={styles.summaryDot} />
                        <PixelText inverted style={styles.summaryTaskTitle}>
                          {task.title}
                        </PixelText>
                        <PixelText variant="label" inverted>
                          {task.estimateMinutes}m
                        </PixelText>
                      </View>
                    ))}
                    {pendingTasks.length > 3 && (
                      <PixelText variant="label" muted style={styles.summaryMore}>
                        +{pendingTasks.length - 3} more
                      </PixelText>
                    )}
                  </>
                )}
              </PixelCard>

              {/* Optional permission */}
              <PixelCard>
                <PixelText variant="h2" uppercase>
                  Native Access
                </PixelText>
                <PixelText muted style={styles.permCopy}>
                  Optional. Grants Focus screen-time controls for real app blocking on device.
                </PixelText>
                <View style={styles.permStatus}>
                  <PixelText variant="label" uppercase muted>
                    Status
                  </PixelText>
                  <PixelText variant="label" uppercase>
                    {permissionStatus}
                  </PixelText>
                </View>
                <PixelButton
                  label={loading ? "Requesting…" : "Request Access"}
                  icon="verified-user"
                  variant="secondary"
                  onPress={requestAccess}
                />
              </PixelCard>

              <PixelButton label="Start Focusing" icon="arrow-forward" variant="primary" onPress={finish} />
            </View>
          )}
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
  pickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  pickerValue: {
    backgroundColor: colors.surfaceMid,
    borderColor: colors.primary,
    borderWidth: layout.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  taskList: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    gap: spacing.xs,
    padding: spacing.sm
  },
  taskListHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
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
  },
  summaryTask: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.base
  },
  summaryDot: {
    backgroundColor: colors.onPrimary,
    height: 6,
    opacity: 0.6,
    width: 6
  },
  summaryTaskTitle: {
    flex: 1
  },
  summaryMore: {
    marginTop: spacing.xs
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
  }
});
