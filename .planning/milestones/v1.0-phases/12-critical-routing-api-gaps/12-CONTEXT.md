# Phase 12: Gap Closure — Critical Routing & API Gaps - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve three specific integration gaps from the v1.0 audit: delete the route conflict at `/`, fix the proxy.ts double-redirect, and create the missing `/api/alerts/notifications` endpoint. No new features or capabilities.

</domain>

<decisions>
## Implementation Decisions

### Notifications endpoint shape
- Return exactly the shape the bridge expects: `{ id, ruleId, ruleName, severity, message, createdAt, read }`
- No extra fields — keeps contract minimal and avoids drift
- `ruleName` via LEFT JOIN on `alertRules` — returns `null` when rule is deleted (bridge already handles fallback to "Alert")
- `createdAt` serialized as ISO string via `Response.json()` — matches bridge expectation
- GET only — no PATCH/PUT for mark-as-read (out of scope)

### Notifications limit behavior
- Accept `?limit=N` query param, default 10, capped at 50
- Clamp with `Math.min(Math.max(Number(param) || 10, 1), 50)` — no Zod overhead for a single numeric param
- No read/unread filtering — bridge fetches most recent regardless
- Ordered by `createdAt` DESC

### Route conflict cleanup
- Delete `app/page.tsx` entirely — it's the scaffolding splash page with no imports, consumers, or test coverage
- After deletion, `app/(dashboard)/page.tsx` becomes the sole handler for `/`
- That handler already does `redirect("/dashboard")`, so root URL behavior is unchanged for users

### Auth redirect behavior
- Change proxy.ts redirect target from `"/"` to `"/dashboard"` (line 32)
- Eliminates the double-redirect: was `/login` → `/` → `/dashboard`, becomes `/login` → `/dashboard`
- `callbackUrl` handling is unaffected — login page already reads `callbackUrl` from query params and redirects post-login

### Error & edge case handling
- Validate session in handler with `auth.api.getSession({ headers: await headers() })` — defense-in-depth, even though proxy middleware already protects the route
- Return `{ error: "Unauthorized" }` with status 401 if no session (JSON format, consistent with API conventions)
- Return empty array `[]` if no notifications exist — not an error
- Invalid/missing limit param falls back to default 10 via the clamping logic — no error response needed

### Claude's Discretion
- Exact error response wording for 401
- Whether to add the endpoint to shared API constants/query-keys (follow existing patterns — query key already exists)
- Test structure for the endpoint if tests are warranted

</decisions>

<specifics>
## Specific Ideas

No specific requirements — all three fixes are well-defined surgical changes following established codebase patterns. The bridge hook, query keys, and schema already exist.

</specifics>

<deferred>
## Deferred Ideas

- Mark-as-read API endpoint (PATCH `/api/alerts/notifications/[id]`) — future phase
- Alert notification filtering by severity or date range — future phase
- WebSocket-based push for real-time alert delivery (replace polling) — future phase

</deferred>

---

*Phase: 12-critical-routing-api-gaps*
*Context gathered: 2026-02-20*
