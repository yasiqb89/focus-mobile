# Focus Mobile

Focus is a mobile-first productivity MVP built with Expo Router and TypeScript. It keeps the existing design references in this folder and implements the app in the same Neo-Bit Monochrome direction: monochrome surfaces, thick borders, square controls, hard shadows, compact labels, and bottom tab navigation.

## Implemented MVP

- `TASKS`: task queue, quick add, start task, complete task, active-flow summary.
- `FOCUS`: session timer, focus ring, pause/reset/complete controls, difficulty selector, current score, daily budgets, blocked-app simulation.
- `BLOCKS`: block schedules, enforcement difficulty, app budgets, blocklist/whitelist access matrix.
- `STATS`: weekly focus chart, category split, streak, score metrics, Zen Circle leaderboard.
- Extra flows: onboarding/permission setup, mindful intervention shield, session-complete score, settings/privacy console.

## Native Restriction Boundary

The JavaScript app uses `FocusRestrictionProvider` as the shared interface for native blocking. The MVP ships with a mock/platform-aware adapter:

- iOS is prepared for FamilyControls, ManagedSettings, DeviceActivity, and ManagedSettingsUI in a development build with the required Family Controls entitlement.
- Android is prepared for UsageStatsManager-based reporting and monitored intervention. Full lock-task enforcement requires device-owner or policy-controller deployment.

## Local Commands

```sh
npm start
npm run typecheck
npm test
```
