# Production Readiness Checklist

## Local-First TestFlight Beta

- Run `npm run typecheck` and `npm test` before every build.
- Verify onboarding, Today, Focus, Blocks, Tasks, Profile, Settings, and Session Complete on iPhone SE, standard iPhone, and Pro Max simulators.
- Confirm Focus has no root scrolling, no overlapping text, and live second updates while active.
- Background the app for at least two minutes during an active session, reopen it, and confirm elapsed time reconciles from wall clock.
- Start a session from Today, Focus, and Tasks and confirm protection status changes from permission-needed to simulated/applied/failed.
- Complete a session and verify Profile updates session history, milestones, weekly chart, score, and total focus time.
- Create, edit, toggle, and delete block rules, targets, and app budgets.
- Verify destructive actions show confirmation: reset session, delete task, delete block, and reset local data.
- Review Settings diagnostics and export summary before TestFlight upload.

## Native Release Blockers

- Replace the simulated restriction provider with iOS Screen Time / FamilyControls implementation.
- Fix current native iOS build/linking issue before TestFlight.
- Add final icon, splash, adaptive icon, screenshots, privacy copy, and App Store metadata.
- Add crash reporting only after privacy copy is finalized.
- Add native notification scheduling and Live Activity/widget integration after session engine stabilizes.

## Design QA

- Check every screen with Dynamic Type larger text.
- Confirm all tap targets are at least 44px high/wide.
- Confirm bottom sheets fit on small screens and keyboard entry does not hide primary actions.
- Confirm reduced-motion behavior before public beta.
- Keep the Neo-Bit monochrome direction but avoid dense nested cards and cramped inline controls.
