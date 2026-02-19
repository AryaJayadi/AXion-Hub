---
phase: 10-settings-public-pages-developer-tools
plan: 04
subsystem: ui
tags: [settings, notifications, integrations, backup, export, danger-zone, react-hook-form, zod, blob-download]

# Dependency graph
requires:
  - phase: 10-settings-public-pages-developer-tools
    plan: 01
    provides: Settings layout, sidebar navigation, save-per-section Card pattern, query keys, settings schemas
  - phase: 02-auth-org
    provides: authClient with organization.delete for workspace deletion
provides:
  - Notification preferences form with email/webhook/Slack/Discord channel toggles
  - Integration connection cards grid with connect/disconnect mutations
  - Backup export with three JSON download options (config, sessions, full workspace)
  - Danger zone with type-workspace-name exact-match confirmation gates
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [blob-download-pattern, type-to-confirm-destructive, optimistic-disconnect]

key-files:
  created:
    - src/features/settings/api/use-notifications.ts
    - src/features/settings/api/use-integrations.ts
    - src/features/settings/components/notification-prefs-form.tsx
    - src/features/settings/components/integration-cards.tsx
    - src/features/settings/components/backup-export-card.tsx
    - src/features/settings/components/danger-zone-card.tsx
    - src/views/settings/settings-notifications-view.tsx
    - src/views/settings/settings-integrations-view.tsx
    - src/views/settings/settings-backup-view.tsx
    - src/views/settings/settings-danger-view.tsx
    - app/(dashboard)/settings/notifications/page.tsx
    - app/(dashboard)/settings/integrations/page.tsx
    - app/(dashboard)/settings/backup/page.tsx
    - app/(dashboard)/settings/danger/page.tsx
  modified:
    - src/features/settings/schemas/settings-schemas.ts

key-decisions:
  - "Notification prefs use single form with per-channel Card sections and one Save button"
  - "Integration disconnect uses optimistic TanStack Query cache update with rollback on error"
  - "Blob download pattern: Blob + URL.createObjectURL + programmatic anchor click for JSON export"
  - "Danger zone type-to-confirm uses strict equality (no trim, no case-insensitive) per locked decision"

patterns-established:
  - "Blob download: generate JSON, create Blob, createObjectURL, anchor click, revokeObjectURL"
  - "Type-to-confirm: const canConfirm = confirmText === orgName with disabled button until exact match"
  - "Integration cards: icon map Record<string, LucideIcon> with connect/disconnect optimistic mutations"

requirements-completed: [SETT-07, SETT-08, SETT-09, SETT-10]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 10 Plan 04: Settings Remaining Pages Summary

**Notification preferences with 4 channel toggles, integration connection cards with optimistic status, JSON backup export via Blob download, and danger zone with type-workspace-name confirmation gates**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T10:20:30Z
- **Completed:** 2026-02-19T10:24:28Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Notification preferences page with email, webhook, Slack, Discord channel toggles and conditional URL inputs
- Integration cards grid showing GitHub (connected), Linear, Jira with connect/disconnect and optimistic cache updates
- Three-option backup export (config, sessions, full workspace) with JSON Blob download pattern
- Danger zone with red destructive border, three sections (reset data, disconnect gateway, delete workspace), and type-to-confirm exact match gates
- Delete workspace calls authClient.organization.delete with strict string confirmation

## Task Commits

Each task was committed atomically:

1. **Task 1: Notification preferences and integration connection cards** - `dd8f2ae` (feat)
2. **Task 2: Backup/export and danger zone pages** - `f2772ad` (feat)

## Files Created/Modified
- `src/features/settings/schemas/settings-schemas.ts` - Added notificationPrefsSchema with channel toggles and webhook URLs
- `src/features/settings/api/use-notifications.ts` - TanStack Query hooks for notification prefs CRUD
- `src/features/settings/api/use-integrations.ts` - Integration hooks with optimistic disconnect rollback
- `src/features/settings/components/notification-prefs-form.tsx` - Per-channel Card sections with Switch toggles
- `src/features/settings/components/integration-cards.tsx` - Responsive card grid with status badges and confirmation dialogs
- `src/features/settings/components/backup-export-card.tsx` - Three export options with Blob + anchor download
- `src/features/settings/components/danger-zone-card.tsx` - Red-bordered card with three destructive action sections
- `src/views/settings/settings-notifications-view.tsx` - Notifications view with loading skeleton
- `src/views/settings/settings-integrations-view.tsx` - Integrations view composing IntegrationCards
- `src/views/settings/settings-backup-view.tsx` - Backup view composing BackupExportCard
- `src/views/settings/settings-danger-view.tsx` - Danger view with useActiveOrganization for org name
- `app/(dashboard)/settings/notifications/page.tsx` - Route page with metadata
- `app/(dashboard)/settings/integrations/page.tsx` - Route page with metadata
- `app/(dashboard)/settings/backup/page.tsx` - Route page with metadata
- `app/(dashboard)/settings/danger/page.tsx` - Route page with metadata

## Decisions Made
- Notification prefs use single form with per-channel Card sections and one Save button (save-per-section pattern within a single domain)
- Integration disconnect uses optimistic TanStack Query cache update with onMutate snapshot rollback on error
- Blob download pattern: Blob + URL.createObjectURL + programmatic anchor click + revokeObjectURL for clean memory
- Danger zone type-to-confirm uses strict equality (`confirmText === orgName`) per locked decision -- no trim, no case-insensitive
- DangerZoneCard receives orgName and organizationId as props from parent view that calls useActiveOrganization

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All nine settings sub-pages now complete (general, profile, security, team, team/invites, api, notifications, integrations, backup, danger)
- Settings surface fully built; remaining phase 10 plans cover docs hub and developer tools
- Integration cards are stubs for future OAuth connection implementation

## Self-Check: PASSED

All 15 files verified present. Both commit hashes (dd8f2ae, f2772ad) confirmed in git log.

---
*Phase: 10-settings-public-pages-developer-tools*
*Plan: 04*
*Completed: 2026-02-19*
