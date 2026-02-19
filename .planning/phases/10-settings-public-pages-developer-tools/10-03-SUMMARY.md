---
phase: 10-settings-public-pages-developer-tools
plan: 03
subsystem: ui
tags: [settings, team, invitations, api-keys, better-auth, organization, stripe-pattern]

# Dependency graph
requires:
  - phase: 10-settings-public-pages-developer-tools
    provides: settings layout, sidebar navigation, query keys, settings types/schemas
  - phase: 02-auth-org
    provides: better-auth config, auth-client, organization plugin, apiKey plugin
provides:
  - Team members table with role management at /settings/team
  - Invitation management with invite form and pending list at /settings/team/invites
  - API key CRUD with Stripe show-once creation pattern at /settings/api
  - Team and API key TanStack Query hooks wrapping better-auth organization and apiKey APIs
affects: [10-04, 10-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [show-once-key-reveal, two-phase-dialog, optimistic-member-removal, masked-key-display]

key-files:
  created:
    - src/features/settings/api/use-team.ts
    - src/features/settings/api/use-api-keys.ts
    - src/features/settings/components/team-members-table.tsx
    - src/features/settings/components/invite-manager.tsx
    - src/features/settings/components/api-key-manager.tsx
    - src/features/settings/components/api-key-create-dialog.tsx
    - src/views/settings/settings-team-view.tsx
    - src/views/settings/settings-invites-view.tsx
    - src/views/settings/settings-api-view.tsx
    - app/(dashboard)/settings/team/page.tsx
    - app/(dashboard)/settings/team/invites/page.tsx
    - app/(dashboard)/settings/api/page.tsx
  modified: []

key-decisions:
  - "ApiKeyCreateDialog uses two-phase pattern: form phase then reveal phase with full key display and copy button"
  - "API keys displayed as prefix****start (e.g., axion_****a1b2) matching Stripe masked pattern"
  - "zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)"
  - "Team hooks fall back to mock data when better-auth API not available for development"

patterns-established:
  - "Show-once dialog: two-phase dialog with form then reveal, key cleared from state on close"
  - "Masked key display: prefix + **** + last 4 chars for post-creation key listing"
  - "Optimistic member/invitation removal with rollback on error"

requirements-completed: [SETT-04, SETT-05, SETT-06]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 10 Plan 03: Team & API Key Management Summary

**Team member/role management with better-auth organization API, invitation system with email invite form, and API key CRUD with Stripe show-once creation dialog**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T10:21:36Z
- **Completed:** 2026-02-19T10:25:41Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Team members table at /settings/team with avatar, role dropdown (owner badge, admin/member select), and remove with confirmation dialog
- Invitation management at /settings/team/invites with email+role invite form (zod validation) and pending invitations table with cancel
- API key management at /settings/api with masked key list, create dialog showing full key exactly once with copy button and "won't be shown again" warning
- TanStack Query hooks for team members, invitations, and API keys with optimistic cache updates and better-auth API integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Team members table, invite manager, and route pages** - `63fd974` (feat)
2. **Task 2: API key management with show-once creation pattern** - `4bab0d2` (feat)

## Files Created/Modified
- `src/features/settings/api/use-team.ts` - TanStack Query hooks for team members, invitations (useTeamMembers, useUpdateMemberRole, useRemoveMember, useInviteMember, usePendingInvitations, useCancelInvitation)
- `src/features/settings/api/use-api-keys.ts` - TanStack Query hooks for API keys (useApiKeys, useCreateApiKey, useDeleteApiKey) with optimistic cache updates
- `src/features/settings/components/team-members-table.tsx` - Member table with avatar, role select, remove button, confirmation dialog
- `src/features/settings/components/invite-manager.tsx` - Invite form (email + role) with zod validation and pending invitations table with cancel
- `src/features/settings/components/api-key-manager.tsx` - API key list with masked display (prefix****start), delete confirmation, empty state, create button
- `src/features/settings/components/api-key-create-dialog.tsx` - Two-phase dialog: form (name + expiration) then reveal (full key + copy + warning)
- `src/views/settings/settings-team-view.tsx` - Team view with members table and link to invitations
- `src/views/settings/settings-invites-view.tsx` - Invites view with back-to-team breadcrumb and invite manager
- `src/views/settings/settings-api-view.tsx` - API view rendering ApiKeyManager
- `app/(dashboard)/settings/team/page.tsx` - Team settings route with metadata
- `app/(dashboard)/settings/team/invites/page.tsx` - Invitations route with metadata
- `app/(dashboard)/settings/api/page.tsx` - API keys route with metadata

## Decisions Made
- ApiKeyCreateDialog uses two-phase pattern (form then reveal) matching Phase 9 webhook create dialog pattern
- API keys displayed as `prefix****start` (e.g., `axion_****a1b2`) per Stripe masked pattern and user locked decision
- zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)
- Team hooks fall back to mock data when better-auth organization API not available for development
- Owner role shown as Badge (not dropdown) and cannot be removed or demoted

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Team management fully functional with member CRUD and invitation system
- API key management ready with show-once pattern for external integrations
- All settings routes (/settings/team, /settings/team/invites, /settings/api) accessible from settings sidebar

## Self-Check: PASSED

All 12 created files verified. Both commit hashes (63fd974, 4bab0d2) confirmed in git log.

---
*Phase: 10-settings-public-pages-developer-tools*
*Plan: 03*
*Completed: 2026-02-19*
