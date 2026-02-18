---
phase: 05-dashboard-monitoring
plan: 05
subsystem: dashboard
tags: [drizzle, bullmq, tanstack-query, react-hook-form, zod, lucide, alerts, webhooks]

# Dependency graph
requires:
  - phase: 05-04
    provides: "Dependency map and monitor page with 'Configure Alerts' link"
  - phase: 01-07
    provides: "BullMQ + Redis worker infrastructure and audit queue pattern"
provides:
  - "Drizzle schema for alert_rules and alert_notifications tables"
  - "6 alert template presets for quick rule creation"
  - "BullMQ alertQueue and alert worker for evaluation/webhook delivery"
  - "Alert rule CRUD hooks with TanStack Query"
  - "AlertTemplatePicker, AlertRuleForm, NotificationBell components"
  - "/monitor/alerts page with DataTable and inline rule management"
  - "NotificationBell in global HeaderBar"
affects: [phase-07-gateway, phase-08-webhooks]

# Tech tracking
tech-stack:
  added: []
  patterns: ["BullMQ dual-job-type worker", "template-to-form pre-fill pattern", "notification bell with Zustand store"]

key-files:
  created:
    - src/features/dashboard/model/alert-schema.ts
    - src/features/dashboard/lib/alert-templates.ts
    - src/features/dashboard/api/use-alert-rules.ts
    - src/features/dashboard/components/alert-rule-form.tsx
    - src/features/dashboard/components/alert-template-picker.tsx
    - src/features/dashboard/components/notification-bell.tsx
    - src/views/dashboard/monitor-alerts-view.tsx
    - app/(dashboard)/monitor/alerts/page.tsx
    - workers/alert-worker.ts
  modified:
    - src/shared/lib/queue.ts
    - workers/index.ts
    - src/widgets/app-shell/components/header-bar.tsx
    - drizzle.config.ts

key-decisions:
  - "drizzle.config.ts glob extended to ./src/**/*-schema.ts to pick up alert-schema.ts naming convention"
  - "Alert worker uses dual job types (evaluate-rule, deliver-webhook) in a single BullMQ worker"
  - "Webhook delivery retries only on 5xx/network errors; 4xx logged but not retried"
  - "exactOptionalPropertyTypes: form data normalized with undefined-to-null conversion before mutation"

patterns-established:
  - "BullMQ dual-job-type worker: single worker processes multiple job types via type discriminant"
  - "Template-to-form pre-fill: template picker passes values to form defaultValues via state"
  - "NotificationBell pattern: global header component reads from Zustand store for cross-page notifications"

requirements-completed: [MNTR-04]

# Metrics
duration: 6min
completed: 2026-02-18
---

# Phase 5 Plan 5: Alert Rules and Notifications Summary

**Alert rules system with Drizzle schema, 6 template presets, rule management DataTable at /monitor/alerts, notification bell in global header, and BullMQ worker for evaluation/webhook delivery**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T06:21:05Z
- **Completed:** 2026-02-18T06:27:51Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Drizzle schema for alert_rules and alert_notifications tables with indexes on ruleId and createdAt
- 6 alert template presets (agent-down, high-error-rate, context-window-full, gateway-disconnect, cost-spike, task-stuck)
- BullMQ alert worker handling evaluate-rule and deliver-webhook job types with proper retry semantics
- Full /monitor/alerts page with DataTable, inline toggle switches, create/edit/delete flows, and template-based rule creation
- NotificationBell with badge counter and recent alerts popover mounted in global HeaderBar

## Task Commits

Each task was committed atomically:

1. **Task 1: Create alert DB schema, templates, BullMQ worker, and queue setup** - `35caee7` (feat)
2. **Task 2: Build alert rule management UI, notification bell, and /monitor/alerts page** - `8001921` (feat)

## Files Created/Modified
- `src/features/dashboard/model/alert-schema.ts` - Drizzle schema for alert_rules and alert_notifications tables
- `src/features/dashboard/lib/alert-templates.ts` - 6 alert template preset definitions
- `src/shared/lib/queue.ts` - Added alertQueue for BullMQ alert processing
- `workers/alert-worker.ts` - BullMQ worker for evaluate-rule and deliver-webhook jobs
- `workers/index.ts` - Registered alert worker import
- `drizzle.config.ts` - Extended schema glob for *-schema.ts files
- `src/features/dashboard/api/use-alert-rules.ts` - TanStack Query hooks for alert rule CRUD with mock data
- `src/features/dashboard/components/alert-template-picker.tsx` - Template selection grid with severity badges
- `src/features/dashboard/components/alert-rule-form.tsx` - Alert rule form with react-hook-form + Zod validation
- `src/features/dashboard/components/notification-bell.tsx` - Bell icon with badge counter and popover
- `src/views/dashboard/monitor-alerts-view.tsx` - /monitor/alerts page with DataTable and dialog workflows
- `app/(dashboard)/monitor/alerts/page.tsx` - Next.js route for /monitor/alerts
- `src/widgets/app-shell/components/header-bar.tsx` - Mounted NotificationBell between search and UserMenu

## Decisions Made
- Extended drizzle.config.ts schema glob to `./src/**/*-schema.ts` so alert-schema.ts is picked up automatically (Rule 3 deviation)
- Alert worker uses type discriminant for dual job types in a single worker rather than separate workers
- Webhook delivery only retries on 5xx/network errors; 4xx responses are logged but not retried to avoid queue exhaustion
- Form data normalized with undefined-to-null conversion before passing to mutations for exactOptionalPropertyTypes compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended drizzle.config.ts schema glob**
- **Found during:** Task 1
- **Issue:** drizzle.config.ts schema glob `./src/**/schema.ts` would not match `alert-schema.ts`
- **Fix:** Added `./src/**/*-schema.ts` glob pattern to schema array
- **Files modified:** drizzle.config.ts
- **Verification:** Build passes
- **Committed in:** 35caee7 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed exactOptionalPropertyTypes mismatch in form submit**
- **Found during:** Task 2
- **Issue:** Form data had `description?: string | undefined` but mutation expected `string | null`; also initialValues prop needed `| undefined` for optional prop
- **Fix:** Normalized form data with undefined-to-null conversion; added explicit `| undefined` to AlertRuleForm prop type
- **Files modified:** src/views/dashboard/monitor-alerts-view.tsx, src/features/dashboard/components/alert-rule-form.tsx
- **Verification:** Build passes with zero TypeScript errors
- **Committed in:** 8001921 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes essential for correct compilation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 (Dashboard & Monitoring) is now complete with all 5 plans delivered
- Alert rules system ready for real evaluation logic once gateway data is available (Phase 7+)
- All dashboard pages, monitoring views, activity feeds, and alerting in place
- Ready to proceed to Phase 6+

## Self-Check: PASSED

All 13 files verified present. Both task commits (35caee7, 8001921) verified in git log.

---
*Phase: 05-dashboard-monitoring*
*Completed: 2026-02-18*
