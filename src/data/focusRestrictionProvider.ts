import { Platform } from "react-native";
import { BlockRule, Difficulty, FocusSession, PermissionStatus, UsageReport } from "./types";

export type FocusRestrictionProvider = {
  requestPermissions(): Promise<PermissionStatus>;
  pickTargets(): Promise<string[]>;
  startFocusSession(
    session: FocusSession,
    targets: string[],
    difficulty: Difficulty
  ): Promise<{ applied: boolean; status: PermissionStatus; message: string }>;
  stopFocusSession(sessionId: string): Promise<void>;
  applyScheduledRules(rules: BlockRule[]): Promise<{ applied: number; status: PermissionStatus }>;
  getUsageReport(range: { start: Date; end: Date }): Promise<UsageReport>;
};

export const restrictionProvider: FocusRestrictionProvider = {
  async requestPermissions() {
    if (Platform.OS === "ios") return "limited";
    if (Platform.OS === "android") return "limited";
    return "granted";
  },
  async pickTargets() {
    return ["social-feed.net", "news-portal.com", "short-video"];
  },
  async startFocusSession(session, targets, difficulty) {
    const status = await this.requestPermissions();
    return {
      applied: status !== "denied",
      status,
      message:
        Platform.OS === "ios"
          ? "Screen Time shields require a development build with Family Controls entitlement."
          : Platform.OS === "android"
            ? "Android usage monitoring is enabled; hard app locking depends on device policy access."
            : `Simulated ${difficulty} focus block for ${targets.length} targets during ${session.plannedMinutes} minutes.`
    };
  },
  async stopFocusSession() {
    return;
  },
  async applyScheduledRules(rules) {
    const status = await this.requestPermissions();
    return { applied: rules.filter((rule) => rule.enabled).length, status };
  },
  async getUsageReport() {
    return {
      focusMinutes: 225,
      blockedAttempts: 7,
      bypasses: 1,
      topDistractions: [
        { targetId: "social-feed.net", label: "Social Feed", minutes: 32 },
        { targetId: "stream-media", label: "Stream Media", minutes: 42 },
        { targetId: "messaging", label: "Messaging", minutes: 31 }
      ]
    };
  }
};
