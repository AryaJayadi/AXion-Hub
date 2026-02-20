---
phase: 12-critical-routing-api-gaps
plan: 01
subsystem: api, routing
tags: [next.js, middleware, drizzle, api-route, auth-redirect]

# Dependency graph
requires:
  - phase: 05-dashboard-monitoring
    provides: alert-schema tables (alertNotifications, alertRules) and useAlertNotificationBridge hook
  - phase: 11-gap-closure-wiring-traceability
    provides: AlertBridge null-component pattern and middleware proxy.ts re-export
provides:
  - "Clean route resolution: only app/(dashboard)/page.tsx handles URL /"
  - "Single-hop auth redirect: proxy.ts sends authenticated users directly to /dashboard"
  - "GET /api/alerts/notifications endpoint with session validation and LEFT JOIN on alertRules"
affects: [13-chat-agent-detail-wiring, dashboard, alerts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "API route session validation via auth.api.getSession with headers from next/headers"
    - "Drizzle LEFT JOIN select pattern for nullable related fields"

key-files:
  created:
    - app/api/alerts/notifications/route.ts
  modified:
    - proxy.ts

key-decisions:
  - "No new app/page.tsx redirect stub needed -- route group (dashboard) already handles /"
  - "Response.json() used instead of new Response(JSON.stringify()) for correct Date serialization"

patterns-established:
  - "API route pattern: import auth + headers, call getSession, return 401 if null, then query with Drizzle"

requirements-completed: [INFR-01, DASH-01, AUTH-06, MNTR-04]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 12 Plan 01: Critical Routing & API Gaps Summary

**Eliminated route conflict at /, fixed proxy double-redirect to single-hop /dashboard, and created GET /api/alerts/notifications endpoint with Drizzle LEFT JOIN**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T08:44:29Z
- **Completed:** 2026-02-20T08:46:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Deleted scaffolding `app/page.tsx` that conflicted with `app/(dashboard)/page.tsx` at URL `/`
- Changed proxy.ts auth redirect from `/` to `/dashboard` -- eliminates intermediate redirect hop on login
- Created `GET /api/alerts/notifications` with session validation, limit clamping, and LEFT JOIN on alertRules for nullable ruleName

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete route conflict and fix proxy redirect target** - `4650d90` (fix)
2. **Task 2: Create GET /api/alerts/notifications endpoint** - `2f35a39` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `app/page.tsx` - Deleted (Next.js scaffolding splash page causing route conflict)
- `proxy.ts` - Changed auth redirect target from `"/"` to `"/dashboard"`
- `app/api/alerts/notifications/route.ts` - New GET handler returning alert notifications with session validation

## Decisions Made
- No new `app/page.tsx` redirect stub needed -- the route group `(dashboard)` already handles URL `/` via its own `page.tsx`
- Used `Response.json()` for automatic Date-to-ISO-string serialization (not `new Response(JSON.stringify())`)
- Simple numeric clamping for limit parameter (no Zod validation needed for single numeric param)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in `.next/dev/types/validator.ts` reference the deleted `app/page.tsx` -- these are stale Next.js generated types that will regenerate on next `next dev` or `next build`. Not caused by our changes; out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Route conflict eliminated; clean URL resolution for `/`
- `useAlertNotificationBridge` can now successfully poll the new endpoint
- All four requirement IDs (INFR-01, DASH-01, AUTH-06, MNTR-04) addressed
- Ready for Phase 13 chat/agent-detail wiring

## Self-Check: PASSED

- [x] 12-01-SUMMARY.md exists
- [x] app/api/alerts/notifications/route.ts exists
- [x] app/page.tsx deleted
- [x] Commit 4650d90 exists (Task 1)
- [x] Commit 2f35a39 exists (Task 2)

---
*Phase: 12-critical-routing-api-gaps*
*Completed: 2026-02-20*
