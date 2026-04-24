import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { budgetProgress, isBudgetExceeded, isRuleActive } from "@/data/schedule";
import { brutal, colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function BlocksScreen() {
  const { activeSession, budgets, permissionStatus, rules, dispatch } = useFocusStore();
  const allTargets = useMemo(() => Array.from(new Set(rules.flatMap((rule) => rule.targetIds))), [rules]);

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="BLOCKS" />
      <View style={styles.title}>
        <PixelText variant="h1" uppercase>
          System Limits
        </PixelText>
        <PixelText muted>
          Configure schedules, app budgets, access lists, and how difficult it should be to break focus.
        </PixelText>
      </View>

      <PixelCard thick>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Enforcement Protocol
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {permissionStatus}
          </PixelText>
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
        <PixelText muted style={styles.copy}>
          Strict requires a breathing step before bypass. Lockdown removes bypass actions where native
          platform restrictions can enforce it.
        </PixelText>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Block Sessions
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Week rules
          </PixelText>
        </View>
        {rules.map((rule) => (
          <View key={rule.id} style={styles.rule}>
            <View style={styles.ruleTop}>
              <View>
                <PixelText style={styles.strong}>{rule.name}</PixelText>
                <PixelText variant="label" muted uppercase>
                  {rule.schedule.startTime}-{rule.schedule.endTime} // {rule.mode}
                </PixelText>
              </View>
              <PixelButton
                label={rule.enabled ? "On" : "Off"}
                variant={rule.enabled ? "primary" : "secondary"}
                compact
                onPress={() => dispatch({ type: "toggle-rule", ruleId: rule.id })}
              />
            </View>
            <PixelText variant="label" muted uppercase>
              {isRuleActive(rule) ? "Active now" : "Standing by"} // {rule.difficulty}
            </PixelText>
          </View>
        ))}
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            App Budgets
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Daily limits
          </PixelText>
        </View>
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budget}>
            <View style={styles.ruleTop}>
              <View>
                <PixelText style={styles.strong}>{budget.label}</PixelText>
                <PixelText variant="label" muted uppercase>
                  {budget.usedMinutes}/{budget.dailyLimitMinutes}m {isBudgetExceeded(budget) ? "locked" : "used"}
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
            <ProgressBar progress={budgetProgress(budget)} striped />
          </View>
        ))}
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Access Matrix
          </PixelText>
          <View style={styles.segment}>
            <PixelText variant="label" uppercase inverted style={styles.segmentActive}>
              Blocklist
            </PixelText>
            <PixelText variant="label" uppercase style={styles.segmentInactive}>
              Whitelist
            </PixelText>
          </View>
        </View>
        {allTargets.map((target) => (
          <View key={target} style={styles.target}>
            <View style={[styles.pixel, brutal.border]} />
            <PixelText variant="label" uppercase>
              {target}
            </PixelText>
            <PixelButton icon="close" compact variant="danger" />
          </View>
        ))}
      </PixelCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 4,
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  protocols: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  copy: {
    marginTop: spacing.sm
  },
  rule: {
    borderTopColor: colors.primary,
    borderTopWidth: 2,
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
  strong: {
    fontWeight: "900",
    textTransform: "uppercase"
  },
  budget: {
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  segment: {
    borderColor: colors.primary,
    borderWidth: 2,
    flexDirection: "row"
  },
  segmentActive: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  segmentInactive: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.base
  },
  target: {
    alignItems: "center",
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  pixel: {
    backgroundColor: colors.primary,
    height: 14,
    width: 14
  }
});
