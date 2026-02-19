---
phase: 09-skills-plugins-workflows
plan: 05
subsystem: ui
tags: [cron, cronstrue, croner, webhooks, datatable, tanstack-query, react-hook-form, zod]

# Dependency graph
requires:
  - phase: 09-skills-plugins-workflows
    provides: "Workflow entity types, canvas store, query keys with cron/webhooks domains"
  - phase: 01-foundation
    provides: "FSD structure, shared UI components, TanStack Query patterns, DataTable"
provides:
  - "Cron schedule management page with visual builder at /workflows/cron"
  - "Webhook endpoint management page with create dialog at /workflows/webhooks"
  - "Hybrid visual/raw cron builder with human-readable preview and next-run calculation"
  - "Inline expandable run history with retry+payload-editing for failed runs"
affects: []

# Tech tracking
tech-stack:
  added: [cronstrue, croner]
  patterns: [inline-expandable-rows, cron-visual-builder, webhook-url-generation, copy-to-clipboard]

key-files:
  created:
    - src/features/workflows/api/use-cron-schedules.ts
    - src/features/workflows/api/use-webhooks.ts
    - src/features/workflows/components/cron-builder.tsx
    - src/features/workflows/components/cron-schedules-table.tsx
    - src/features/workflows/components/webhook-table.tsx
    - src/features/workflows/components/webhook-create-dialog.tsx
    - src/views/workflows/cron-schedules-view.tsx
    - src/views/workflows/webhooks-view.tsx
    - app/(dashboard)/workflows/cron/page.tsx
    - app/(dashboard)/workflows/webhooks/page.tsx
  modified:
    - package.json
    - bun.lock

key-decisions:
  - "CronBuilder uses builderStateToExpression converter to sync visual controls to cron string"
  - "parseExpressionToState attempts to reverse-parse cron into visual builder state on mode toggle"
  - "Expandable rows use Fragment + conditional TableRow pattern (not DataTable subRow API)"
  - "WebhookCreateDialog uses two-phase UI: form state then success state showing generated URL/secret"
  - "zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility"
  - "Copy-to-clipboard uses navigator.clipboard.writeText with toast feedback"

patterns-established:
  - "Inline expandable rows: Fragment wrapping data row + conditional detail row with colSpan"
  - "Retry with payload editing: Textarea pre-populated with JSON.stringify(parsed, null, 2)"
  - "Two-phase dialog: form submission flips to success state showing generated credentials"

requirements-completed: [WORK-04, WORK-05]

# Metrics
duration: 7min
completed: 2026-02-19
---

# Phase 9 Plan 5: Cron Schedules & Webhook Endpoints Summary

**Cron schedule management with hybrid visual/raw builder using cronstrue/croner, and webhook endpoint CRUD with URL generation, secret display, and inline run history**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T07:37:16Z
- **Completed:** 2026-02-19T07:44:17Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Visual cron builder with frequency presets (minute/hourly/daily/weekly/monthly), human-readable descriptions via cronstrue, and next 5 runs via croner
- Cron schedules DataTable with enable/disable toggle, expandable run history, and retry with payload editing
- Webhook endpoints DataTable with monospace truncated URLs, copy buttons, and status management
- Webhook create dialog with two-phase UI: form input then generated URL + signing secret display with copy and warning
- Inline expandable rows in both tables showing run history with status badges, duration, timestamps, and failed-run retry

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, cron API hooks, cron builder component, and cron schedules page** - `53b6b5f` (feat)
2. **Task 2: Webhook API hooks, webhook table, create dialog, and webhooks page** - `6445fde` (feat)

## Files Created/Modified
- `src/features/workflows/api/use-cron-schedules.ts` - TanStack Query hooks with 5 mock cron schedules, CRUD mutations, and retry
- `src/features/workflows/api/use-webhooks.ts` - TanStack Query hooks with 4 mock webhooks, CRUD, retry, and secret regeneration
- `src/features/workflows/components/cron-builder.tsx` - Hybrid visual/raw cron expression builder with cronstrue preview and croner next-runs
- `src/features/workflows/components/cron-schedules-table.tsx` - DataTable with expandable run history and retry-with-payload editing
- `src/features/workflows/components/webhook-table.tsx` - DataTable with copy buttons, expandable trigger history, and retry
- `src/features/workflows/components/webhook-create-dialog.tsx` - Two-phase dialog: form then generated URL/secret display
- `src/views/workflows/cron-schedules-view.tsx` - Cron schedules page with PageHeader and create schedule dialog
- `src/views/workflows/webhooks-view.tsx` - Webhooks page with PageHeader and create webhook dialog
- `app/(dashboard)/workflows/cron/page.tsx` - Route page for /workflows/cron
- `app/(dashboard)/workflows/webhooks/page.tsx` - Route page for /workflows/webhooks
- `package.json` - Added cronstrue and croner dependencies
- `bun.lock` - Updated lockfile

## Decisions Made
- CronBuilder uses a `builderStateToExpression` converter function to map visual controls to cron string, and a reverse `parseExpressionToState` for switching from raw back to visual mode
- Expandable rows implemented with Fragment wrapping data row + conditional detail TableRow rather than using TanStack Table subRow API, for more control over expansion styling
- WebhookCreateDialog uses two-phase UI (form state -> success state) so generated credentials are prominently displayed after creation
- zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)
- Copy-to-clipboard uses navigator.clipboard.writeText with sonner toast feedback
- Run retry opens inline Textarea pre-populated with pretty-printed JSON payload for editing before re-queue

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 plans in Phase 9 (Skills, Plugins & Workflows) are now complete
- Cron and webhook management pages fully functional with mock data
- Ready for Phase 10 or integration with backend APIs

---
## Self-Check: PASSED

- All 10 created files verified present on disk
- All min_lines requirements met (cron-builder: 544, cron-schedules-table: 381, webhook-table: 422, webhook-create-dialog: 273)
- Commit 53b6b5f verified in git log
- Commit 6445fde verified in git log
- `npx tsc --noEmit` passes with zero errors

---
*Phase: 09-skills-plugins-workflows*
*Completed: 2026-02-19*
