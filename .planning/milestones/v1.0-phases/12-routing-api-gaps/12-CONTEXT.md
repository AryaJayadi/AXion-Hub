# Phase 12: Gap Closure — Critical Routing & API Gaps - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve three specific integration gaps from the v1.0 audit: (1) delete the `app/page.tsx` route conflict so only the dashboard route group serves `/`, (2) fix `proxy.ts` to redirect authenticated users from auth pages to `/dashboard` instead of `/` to eliminate the double-redirect hop, and (3) create the missing `GET /api/alerts/notifications` endpoint that the existing `useAlertNotificationBridge` hook already polls.

</domain>

<decisions>
## Implementation Decisions

### Alert notifications endpoint
- Route file at `app/api/alerts/notifications/route.ts`
- GET only — no PATCH/PUT for mark-as-read (out of scope)
- Returns `RawAlertNotification[]` matching the shape the bridge already expects: `{ id, ruleId, ruleName, severity, message, createdAt, read }`
- `ruleName` via LEFT JOIN on `alertRules` table (rule may have been deleted)
- Ordered by `createdAt` DESC
- Accepts `?limit=N` query param (default 10, cap at 50)
- No read/unread filtering — bridge fetches most recent regardless
- Validate session in handler (defense-in-depth, even though proxy middleware already protects non-public routes)
- Return 401 if no session, empty array `[]` if no notifications

### Proxy redirect target
- Change `proxy.ts` line 32: redirect from `"/"` to `"/dashboard"`
- Affects all AUTH_PAGES equally (`/login`, `/register`, `/forgot-password`, `/reset-password`) — this is correct
- Does NOT affect callbackUrl flow (that's read by the login page post-auth, not by proxy)
- Does NOT affect OAuth callbacks (`/api/auth` is in PUBLIC_PATHS, passes through untouched)

### Route conflict cleanup
- Delete `app/page.tsx` entirely — it's the scaffolding splash page with no external imports or test coverage
- After deletion, `app/(dashboard)/page.tsx` (which does `redirect("/dashboard")`) becomes the sole handler for `/`
- No changes needed to root layout or route group layouts
- Researcher should verify no test files reference the deleted page

### Login flow after fixes
- Authenticated user hits `/login` → proxy redirects to `/dashboard` (single hop, no intermediate `/` redirect)
- Unauthenticated user hits `/dashboard` → proxy redirects to `/login?callbackUrl=/dashboard` → user logs in → login page reads callbackUrl → redirects to `/dashboard`
- No double-redirect in either direction

### Claude's Discretion
- Exact error response format for 401 (JSON vs plain text)
- Whether to add the new endpoint to any shared API constants/query-keys (follow existing patterns)
- Test structure for the endpoint if tests are warranted

</decisions>

<specifics>
## Specific Ideas

- The bridge hook at `src/features/dashboard/api/use-alert-notification-bridge.ts` already defines the exact contract — the endpoint must match it, not the other way around
- The `alertNotifications` schema in `src/features/dashboard/model/alert-schema.ts` has no `ruleName` column — it must be joined from `alertRules.name` via `ruleId`
- The bridge silently returns `[]` on fetch failure (line 38-39), so the endpoint doesn't need exotic error handling — standard HTTP status codes suffice

</specifics>

<deferred>
## Deferred Ideas

- Mark-as-read API endpoint (PATCH `/api/alerts/notifications/[id]`) — useful but not in Phase 12 success criteria
- Alert notification filtering by severity or date range — no current consumer needs it
- WebSocket-based push for real-time alert delivery (replace polling) — architectural improvement for later

</deferred>

---

*Phase: 12-routing-api-gaps*
*Context gathered: 2026-02-20*
