---
phase: 10-settings-public-pages-developer-tools
plan: 02
subsystem: ui
tags: [settings, security, totp, 2fa, react-qr-code, better-auth, sessions, password]

# Dependency graph
requires:
  - phase: 10-settings-public-pages-developer-tools
    provides: settings layout, sidebar, query keys, auth plugins (twoFactor, apiKey)
  - phase: 02-auth-org
    provides: better-auth config, auth-client with twoFactor/apiKey plugins
provides:
  - Password change form with Zod validation and better-auth changePassword
  - TOTP 2FA setup with QR code, backup codes, verify, and disable flows
  - Active sessions card with user agent parsing, revoke, and revoke-all
  - Security API hooks (useActiveSessions, useRevokeSession, useRevokeOtherSessions, useChangePassword)
  - /settings/security route page
affects: [10-03, 10-04]

# Tech tracking
tech-stack:
  added: [react-qr-code]
  patterns: [totp-multi-step-flow, session-optimistic-revoke, password-change-with-confirm]

key-files:
  created:
    - src/features/settings/api/use-security.ts
    - src/features/settings/components/password-change-form.tsx
    - src/features/settings/components/totp-setup-card.tsx
    - src/features/settings/components/active-sessions-card.tsx
    - src/views/settings/settings-security-view.tsx
    - app/(dashboard)/settings/security/page.tsx
  modified: []

key-decisions:
  - "TOTP setup uses multi-step flow (idle -> password -> scan -> verify -> enabled) managed by local state"
  - "Active sessions use optimistic removal from TanStack Query cache on revoke"
  - "zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes (consistent project pattern)"
  - "User agent parsed for browser name and mobile/desktop icon distinction"
  - "TOTP URI secret extracted via URL constructor for manual entry fallback"

patterns-established:
  - "Multi-step card flow: local step state with step-specific renders in single Card component"
  - "Backup codes: grid layout with copy-all via navigator.clipboard.writeText"
  - "Session list: device icon + browser label + IP + relative time + current badge"

requirements-completed: [SETT-03]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 10 Plan 02: Security Settings Summary

**Security settings with password change form, TOTP 2FA setup (QR code + backup codes + verify), and active sessions management with optimistic revoke**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T10:20:45Z
- **Completed:** 2026-02-19T10:23:22Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Password change form with current/new/confirm validation and better-auth changePassword integration
- TOTP 2FA multi-step setup: password confirmation, QR code scan (react-qr-code), manual key fallback, backup codes with copy-all, 6-digit verification, enable/disable flows
- Active sessions card with user agent parsing, IP address, relative time, current session badge, per-session revoke with optimistic cache removal, and revoke-all-other-sessions
- Security API hooks layer wrapping better-auth client methods with TanStack Query

## Task Commits

Each task was committed atomically:

1. **Task 1: Password change form and active sessions card** - `7f36725` (feat)
2. **Task 2: TOTP 2FA setup card and security view page** - `ed5b5c8` (feat)

## Files Created/Modified
- `src/features/settings/api/use-security.ts` - TanStack Query hooks for sessions, password change
- `src/features/settings/components/password-change-form.tsx` - Password change with Zod v4 validation
- `src/features/settings/components/totp-setup-card.tsx` - Multi-step TOTP 2FA setup with QR code
- `src/features/settings/components/active-sessions-card.tsx` - Sessions table with revoke buttons
- `src/views/settings/settings-security-view.tsx` - Composes all three security cards
- `app/(dashboard)/settings/security/page.tsx` - Route page with metadata

## Decisions Made
- TOTP setup uses multi-step flow (idle -> password -> scan -> verify -> enabled) managed by local state
- Active sessions use optimistic removal from TanStack Query cache on revoke
- zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes (consistent project pattern)
- User agent parsed for browser name and mobile/desktop icon distinction
- TOTP URI secret extracted via URL constructor for manual entry fallback
- Backup codes displayed in 2-column grid with copy-all button

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Security settings complete at /settings/security
- Password change, 2FA, and session management ready for users
- Security API hooks available for potential reuse in other settings pages
- 10-03 (team settings) and 10-04 (API keys) can proceed independently

## Self-Check: PASSED

All 6 created files verified. Both commit hashes (7f36725, ed5b5c8) confirmed in git log.

---
*Phase: 10-settings-public-pages-developer-tools*
*Plan: 02*
*Completed: 2026-02-19*
