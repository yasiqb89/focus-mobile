import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelText } from "@/components/PixelText";
import { Screen } from "@/components/Screen";
import { restrictionProvider } from "@/data/focusRestrictionProvider";
import { formatMinutes } from "@/data/scoring";
import { colors, spacing } from "@/design/tokens";
import { useFocusStore } from "@/state/FocusStore";

export default function SettingsScreen() {
  const router = useRouter();
  const {
    budgets,
    defaultSessionMinutes,
    milestones,
    onboarded,
    permissionStatus,
    reminders,
    rules,
    scores,
    sessionRecords,
    schemaVersion,
    tasks,
    targets,
    updatedAt,
    dispatch
  } = useFocusStore();
  const [loading, setLoading] = useState(false);

  async function refreshPermissions() {
    setLoading(true);
    try {
      const status = await restrictionProvider.requestPermissions();
      dispatch({ type: "set-permission", status });
    } finally {
      setLoading(false);
    }
  }

  function showExportSummary() {
    const payload = {
      schemaVersion,
      exportedAt: new Date().toISOString(),
      tasks,
      rules,
      budgets,
      targets,
      scores,
      sessionRecords,
      milestones,
      reminders
    };
    Alert.alert(
      "Export Ready",
      `Local export contains ${JSON.stringify(payload).length} bytes. File sharing is planned for the native TestFlight build.`
    );
  }

  return (
    <Screen>
      <AppHeader title="FOCUS" subtitle="SETTINGS" />
      <PixelCard thick>
        <PixelText variant="h1" uppercase>
          Control Room
        </PixelText>
        <PixelText muted>
          Tune the local app, review privacy state, and reset your workspace without leaving the device.
        </PixelText>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Session Defaults
          </PixelText>
          <PixelText variant="label" muted uppercase>
            {formatMinutes(defaultSessionMinutes)}
          </PixelText>
        </View>
        <View style={styles.controls}>
          <PixelButton
            icon="remove"
            compact
            onPress={() =>
              dispatch({ type: "set-default-session-minutes", minutes: defaultSessionMinutes - 5 })
            }
          />
          <PixelText variant="display" style={styles.defaultValue}>
            {defaultSessionMinutes}
          </PixelText>
          <PixelButton
            icon="add"
            compact
            onPress={() =>
              dispatch({ type: "set-default-session-minutes", minutes: defaultSessionMinutes + 5 })
            }
          />
        </View>
        <PixelText muted>Used for new sessions when no task estimate is selected.</PixelText>
      </PixelCard>

      <PixelCard>
        <View style={styles.header}>
          <PixelText variant="h2" uppercase>
            Data & Privacy
          </PixelText>
          <PixelText variant="label" muted uppercase>
            Schema v{schemaVersion}
          </PixelText>
        </View>
        <PixelText muted>
          Tasks, targets, rules, sessions, and reports stay on this device in the local beta.
        </PixelText>
        <View style={styles.controls}>
          <PixelButton label="Export Summary" icon="ios-share" compact onPress={showExportSummary} />
          <PixelButton label="Diagnostics" icon="bug-report" compact onPress={() => Alert.alert("Diagnostics", `Updated: ${updatedAt ?? "never"}\nRecords: ${sessionRecords.length}\nTargets: ${targets.length}\nReminders: ${reminders.length}`)} />
        </View>
      </PixelCard>

      <PixelCard>
        <View style={styles.row}>
          <View>
            <PixelText variant="label" muted uppercase>
              Native Access
            </PixelText>
            <PixelText variant="h2" uppercase>
              {permissionStatus}
            </PixelText>
          </View>
          <PixelButton
            label={loading ? "Checking" : "Refresh"}
            icon="verified-user"
            compact
            onPress={refreshPermissions}
          />
        </View>
        <View style={styles.line} />
        <View style={styles.row}>
          <View>
            <PixelText variant="label" muted uppercase>
              Onboarded
            </PixelText>
            <PixelText variant="h2" uppercase>
              {onboarded ? "Yes" : "No"}
            </PixelText>
          </View>
          <PixelButton label="Back" icon="arrow-back" compact onPress={() => router.back()} />
        </View>
      </PixelCard>

      <View style={styles.grid}>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Tasks
          </PixelText>
          <PixelText variant="h2">{tasks.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Scores
          </PixelText>
          <PixelText variant="h2">{scores.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Rules
          </PixelText>
          <PixelText variant="h2">{rules.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Budgets
          </PixelText>
          <PixelText variant="h2">{budgets.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Targets
          </PixelText>
          <PixelText variant="h2">{targets.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.tile}>
          <PixelText variant="label" muted uppercase>
            Sessions
          </PixelText>
          <PixelText variant="h2">{sessionRecords.length}</PixelText>
        </PixelCard>
      </View>

      <PixelCard dark>
        <PixelText variant="h2" uppercase inverted>
          Reset Workspace
        </PixelText>
        <PixelText inverted>
          Clears tasks, sessions, scores, budget usage, and rule edits while keeping onboarding and permission state.
        </PixelText>
        <View style={styles.dangerAction}>
          <PixelButton
            label="Reset Local Data"
            icon="restart-alt"
            variant="danger"
            onPress={() =>
              Alert.alert(
                "Reset Workspace",
                "This will permanently delete all tasks, sessions, scores, and budget usage. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => dispatch({ type: "reset-local-data" })
                  }
                ]
              )
            }
          />
        </View>
      </PixelCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  controls: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
    marginVertical: spacing.sm
  },
  defaultValue: {
    minWidth: 110,
    textAlign: "center"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingVertical: spacing.xs
  },
  line: {
    backgroundColor: colors.primary,
    height: 2,
    marginVertical: spacing.xs
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  tile: {
    minHeight: 104,
    width: "46%"
  },
  dangerAction: {
    marginTop: spacing.sm
  }
});
