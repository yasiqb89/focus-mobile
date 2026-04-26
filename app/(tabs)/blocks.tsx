import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { BottomSheet } from "@/components/BottomSheet";
import { EmptyState } from "@/components/EmptyState";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { StatusChip } from "@/components/StatusChip";
import { budgetProgress, isBudgetExceeded, isRuleActive } from "@/data/schedule";
import { BlockMode } from "@/data/types";
import { brutal, colors, layout, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

type SheetMode = "rule" | "target" | "budget" | null;

function shiftClock(clock: string, deltaMinutes: number): string {
  const [hours, minutes] = clock.split(":").map(Number);
  const total = (hours * 60 + minutes + deltaMinutes + 1440) % 1440;
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

export default function BlocksScreen() {
  const { activeSession, budgets, permissionStatus, rules, targets, dispatch } = useFocusStore();
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [ruleName, setRuleName] = useState("Focus Block");
  const [ruleMode, setRuleMode] = useState<BlockMode>("focus");
  const [selectedTargets, setSelectedTargets] = useState<string[]>(targets.slice(0, 2).map((target) => target.id));
  const [targetLabel, setTargetLabel] = useState("");
  const [targetWebsite, setTargetWebsite] = useState("");
  const [budgetTargetId, setBudgetTargetId] = useState(targets[0]?.id ?? "");
  const [budgetMinutes, setBudgetMinutes] = useState("30");

  const activeRules = rules.filter((rule) => isRuleActive(rule));
  const selectedTargetLabels = useMemo(
    () => selectedTargets.map((id) => targets.find((target) => target.id === id)?.label ?? id),
    [selectedTargets, targets]
  );

  function toggleTarget(id: string) {
    setSelectedTargets((current) =>
      current.includes(id) ? current.filter((targetId) => targetId !== id) : [...current, id]
    );
  }

  function createRule() {
    dispatch({
      type: "add-rule",
      name: ruleName,
      mode: ruleMode,
      targetIds: selectedTargets.length ? selectedTargets : targets.slice(0, 1).map((target) => target.id)
    });
    setSheetMode(null);
  }

  function createTarget() {
    if (!targetLabel.trim()) return;
    dispatch({ type: "add-target", label: targetLabel, website: targetWebsite });
    setTargetLabel("");
    setTargetWebsite("");
    setSheetMode(null);
  }

  function createBudget() {
    const target = targets.find((item) => item.id === budgetTargetId);
    if (!target) return;
    dispatch({
      type: "add-budget",
      targetId: target.id,
      label: target.label,
      dailyLimitMinutes: Number(budgetMinutes) || 30
    });
    setSheetMode(null);
  }

  function deleteRule(ruleId: string) {
    Alert.alert("Delete Block", "Remove this local block schedule?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch({ type: "delete-rule", ruleId }) }
    ]);
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="BLOCKS" />
      <View style={styles.title}>
        <PixelText variant="h1" uppercase>
          Protection
        </PixelText>
        <PixelText muted>
          Create scheduled blocks, daily limits, app locks, and allowlists that match real routines.
        </PixelText>
      </View>

      <PixelCard thick>
        <View style={styles.header}>
          <View style={styles.flex}>
            <PixelText variant="h2" uppercase>
              Enforcement
            </PixelText>
            <PixelText muted>
              Native blocking is staged behind the local adapter until the TestFlight native build is ready.
            </PixelText>
          </View>
          <StatusChip
            label={permissionStatus}
            tone={permissionStatus === "granted" ? "good" : permissionStatus === "denied" ? "danger" : "warn"}
            icon="verified-user"
          />
        </View>
        <View style={styles.protocols}>
          {(["standard", "strict", "lockdown"] as const).map((difficulty) => (
            <PixelButton
              key={difficulty}
              label={difficulty}
              variant={activeSession.difficulty === difficulty ? "primary" : "secondary"}
              onPress={() => dispatch({ type: "set-difficulty", difficulty })}
              compact
            />
          ))}
        </View>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <View>
            <PixelText variant="h2" uppercase>
              Block Sessions
            </PixelText>
            <PixelText variant="label" muted uppercase>
              {activeRules.length} active now
            </PixelText>
          </View>
          <PixelButton label="New" icon="add" compact variant="primary" onPress={() => setSheetMode("rule")} />
        </View>
        {rules.length === 0 ? (
          <EmptyState icon="event-busy" title="No Blocks" body="Create one recurring block to protect work or sleep." />
        ) : (
          rules.map((rule) => (
            <View key={rule.id} style={styles.rule}>
              <View style={styles.ruleTop}>
                <View style={styles.ruleInfo}>
                  <PixelText style={styles.strong}>{rule.name}</PixelText>
                  <PixelText variant="label" muted uppercase>
                    {rule.schedule.startTime}-{rule.schedule.endTime} · {rule.mode} · {rule.accessMode}
                  </PixelText>
                </View>
                <PixelButton
                  label={rule.enabled ? "On" : "Off"}
                  variant={rule.enabled ? "primary" : "secondary"}
                  compact
                  onPress={() => dispatch({ type: "toggle-rule", ruleId: rule.id })}
                />
              </View>
              <View style={styles.targetLine}>
                {rule.targetIds.slice(0, 4).map((targetId) => (
                  <StatusChip
                    key={targetId}
                    label={targets.find((target) => target.id === targetId)?.label ?? targetId}
                    tone="neutral"
                  />
                ))}
              </View>
              <View style={styles.inlineControls}>
                <PixelButton
                  icon="remove"
                  compact
                  onPress={() =>
                    dispatch({
                      type: "set-rule-window",
                      ruleId: rule.id,
                      startTime: shiftClock(rule.schedule.startTime, -15),
                      endTime: rule.schedule.endTime
                    })
                  }
                />
                <PixelText variant="label" muted uppercase>
                  {rule.schedule.startTime}
                </PixelText>
                <PixelButton
                  icon="add"
                  compact
                  onPress={() =>
                    dispatch({
                      type: "set-rule-window",
                      ruleId: rule.id,
                      startTime: shiftClock(rule.schedule.startTime, 15),
                      endTime: rule.schedule.endTime
                    })
                  }
                />
                <PixelButton
                  label={rule.accessMode === "blocklist" ? "Blocklist" : "Allowlist"}
                  compact
                  onPress={() =>
                    dispatch({
                      type: "set-rule-access-mode",
                      ruleId: rule.id,
                      accessMode: rule.accessMode === "blocklist" ? "allowlist" : "blocklist"
                    })
                  }
                />
                <PixelButton icon="delete" compact variant="danger" onPress={() => deleteRule(rule.id)} />
              </View>
              <View style={styles.protocols}>
                {(["standard", "strict", "lockdown"] as const).map((difficulty) => (
                  <PixelButton
                    key={difficulty}
                    label={difficulty}
                    variant={rule.difficulty === difficulty ? "primary" : "secondary"}
                    compact
                    onPress={() => dispatch({ type: "set-rule-difficulty", ruleId: rule.id, difficulty })}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <View>
            <PixelText variant="h2" uppercase>
              App Budgets
            </PixelText>
            <PixelText variant="label" muted uppercase>
              Daily limits
            </PixelText>
          </View>
          <PixelButton label="New" icon="add" compact onPress={() => setSheetMode("budget")} />
        </View>
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budget}>
            <View style={styles.ruleTop}>
              <View style={styles.ruleInfo}>
                <PixelText style={styles.strong}>{budget.label}</PixelText>
                <PixelText variant="label" muted uppercase>
                  {budget.usedMinutes}/{budget.dailyLimitMinutes}m {isBudgetExceeded(budget) ? "· locked" : "used"}
                </PixelText>
              </View>
              <PixelButton
                icon="add"
                compact
                onPress={() =>
                  dispatch({
                    type: "set-budget-used",
                    budgetId: budget.id,
                    usedMinutes: Math.min(budget.usedMinutes + 5, budget.dailyLimitMinutes)
                  })
                }
              />
            </View>
            <View style={styles.inlineControls}>
              <PixelButton
                icon="remove"
                compact
                onPress={() =>
                  dispatch({
                    type: "set-budget-limit",
                    budgetId: budget.id,
                    dailyLimitMinutes: budget.dailyLimitMinutes - 15
                  })
                }
              />
              <PixelText variant="label" muted uppercase>
                Limit {budget.dailyLimitMinutes}m
              </PixelText>
              <PixelButton
                icon="add"
                compact
                onPress={() =>
                  dispatch({
                    type: "set-budget-limit",
                    budgetId: budget.id,
                    dailyLimitMinutes: budget.dailyLimitMinutes + 15
                  })
                }
              />
              <PixelButton label="Reset" compact onPress={() => dispatch({ type: "reset-budget", budgetId: budget.id })} />
              <PixelButton icon="delete" compact variant="danger" onPress={() => dispatch({ type: "delete-budget", budgetId: budget.id })} />
            </View>
            <ProgressBar progress={budgetProgress(budget)} striped />
          </View>
        ))}
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <View>
            <PixelText variant="h2" uppercase>
              Target Library
            </PixelText>
            <PixelText variant="label" muted uppercase>
              Apps and websites
            </PixelText>
          </View>
          <PixelButton label="Add" icon="add" compact onPress={() => setSheetMode("target")} />
        </View>
        {targets.map((target) => (
          <View key={target.id} style={styles.target}>
            <View style={[styles.pixel, brutal.border]} />
            <View style={styles.flex}>
              <PixelText variant="label" uppercase style={styles.targetLabel}>
                {target.label}
              </PixelText>
              <PixelText variant="label" muted uppercase>
                {target.category}
              </PixelText>
            </View>
            <PixelButton
              icon="close"
              compact
              variant="danger"
              onPress={() => dispatch({ type: "remove-target", targetId: target.id })}
            />
          </View>
        ))}
      </PixelCard>

      <BottomSheet visible={sheetMode === "rule"} title="New Block" onClose={() => setSheetMode(null)}>
        <TextInput
          value={ruleName}
          onChangeText={setRuleName}
          placeholder="Block name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <View style={styles.protocols}>
          {(["focus", "daily-limit", "app-lock"] as const).map((mode) => (
            <PixelButton
              key={mode}
              label={mode}
              variant={ruleMode === mode ? "primary" : "secondary"}
              compact
              onPress={() => setRuleMode(mode)}
            />
          ))}
        </View>
        <ScrollView style={styles.sheetList}>
          {targets.map((target) => (
            <PixelButton
              key={target.id}
              label={target.label}
              icon={selectedTargets.includes(target.id) ? "check" : "add"}
              variant={selectedTargets.includes(target.id) ? "primary" : "secondary"}
              onPress={() => toggleTarget(target.id)}
              style={styles.sheetButton}
            />
          ))}
        </ScrollView>
        <PixelText muted>Selected: {selectedTargetLabels.join(", ") || "none"}</PixelText>
        <PixelButton label="Create Block" icon="check" variant="primary" onPress={createRule} />
      </BottomSheet>

      <BottomSheet visible={sheetMode === "target"} title="Add Target" onClose={() => setSheetMode(null)}>
        <TextInput
          value={targetLabel}
          onChangeText={setTargetLabel}
          placeholder="App or website name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={targetWebsite}
          onChangeText={setTargetWebsite}
          placeholder="website.com optional"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          style={styles.input}
        />
        <PixelButton label="Add Target" icon="add" variant="primary" onPress={createTarget} />
      </BottomSheet>

      <BottomSheet visible={sheetMode === "budget"} title="New Budget" onClose={() => setSheetMode(null)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.targetPicker}>
          {targets.map((target) => (
            <PixelButton
              key={target.id}
              label={target.label}
              variant={budgetTargetId === target.id ? "primary" : "secondary"}
              compact
              onPress={() => setBudgetTargetId(target.id)}
            />
          ))}
        </ScrollView>
        <TextInput
          value={budgetMinutes}
          onChangeText={setBudgetMinutes}
          keyboardType="number-pad"
          placeholder="30"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <PixelButton label="Create Budget" icon="check" variant="primary" onPress={createBudget} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    borderBottomColor: colors.surfaceHigh,
    borderBottomWidth: 2,
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  flex: {
    flex: 1
  },
  protocols: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  rule: {
    borderTopColor: colors.surfaceHigh,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm
  },
  ruleTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  ruleInfo: {
    flex: 1,
    gap: 2
  },
  strong: {
    fontWeight: "900",
    textTransform: "uppercase"
  },
  targetLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  budget: {
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  inlineControls: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  target: {
    alignItems: "center",
    borderTopColor: colors.surfaceHigh,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  targetLabel: {
    flex: 1
  },
  pixel: {
    backgroundColor: colors.primary,
    height: 14,
    width: 14
  },
  input: {
    borderColor: colors.primary,
    borderWidth: layout.border,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.sm
  },
  sheetList: {
    maxHeight: 260
  },
  sheetButton: {
    marginBottom: spacing.xs
  },
  targetPicker: {
    gap: spacing.xs,
    paddingRight: spacing.sm
  }
});
