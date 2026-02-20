# Phase 12: Gap Closure — Critical Routing & API Gaps - Research

**Researched:** 2026-02-20
**Domain:** Next.js App Router routing, middleware redirects, Drizzle ORM API routes
**Confidence:** HIGH

## Summary

Phase 12 closes three specific integration gaps identified in the v1.0 milestone audit: INT-01 (route conflict between `app/page.tsx` and `app/(dashboard)/page.tsx`), INT-06 (proxy.ts redirecting authenticated users to `/` instead of `/dashboard`), and INT-02 (missing `/api/alerts/notifications` endpoint that the `useAlertNotificationBridge` hook already polls).

All three fixes are surgical, well-defined changes to existing code. The route conflict is resolved by deleting a single scaffolding file. The redirect fix is a one-line change in `proxy.ts`. The API endpoint is a new `route.ts` file using Drizzle ORM left join and better-auth session validation, following established project patterns.

**Primary recommendation:** Execute all three fixes as a single atomic plan. No new dependencies are needed. All patterns are already established in the codebase -- this is pure wiring, not architecture.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Alert notifications endpoint at `app/api/alerts/notifications/route.ts`
- GET only -- no PATCH/PUT for mark-as-read (out of scope)
- Returns `RawAlertNotification[]` matching the shape the bridge already expects: `{ id, ruleId, ruleName, severity, message, createdAt, read }`
- `ruleName` via LEFT JOIN on `alertRules` table (rule may have been deleted)
- Ordered by `createdAt` DESC
- Accepts `?limit=N` query param (default 10, cap at 50)
- No read/unread filtering -- bridge fetches most recent regardless
- Validate session in handler (defense-in-depth, even though proxy middleware already protects non-public routes)
- Return 401 if no session, empty array `[]` if no notifications
- Proxy redirect target: change from `"/"` to `"/dashboard"` on line 32 of proxy.ts
- Delete `app/page.tsx` entirely -- it's the scaffolding splash page with no imports or test coverage
- After deletion, `app/(dashboard)/page.tsx` becomes the sole handler for `/`

### Claude's Discretion
- Exact error response format for 401 (JSON vs plain text)
- Whether to add the new endpoint to any shared API constants/query-keys (follow existing patterns)
- Test structure for the endpoint if tests are warranted

### Deferred Ideas (OUT OF SCOPE)
- Mark-as-read API endpoint (PATCH `/api/alerts/notifications/[id]`)
- Alert notification filtering by severity or date range
- WebSocket-based push for real-time alert delivery (replace polling)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | Next.js 16 App Router project initialized with TypeScript, Tailwind CSS v4, shadcn/ui, and Biome | Route conflict fix (delete `app/page.tsx`) ensures clean App Router routing without ambiguity |
| DASH-01 | User sees at-a-glance command center at `/dashboard` with gateway status indicator | Route conflict fix ensures `/` correctly resolves to the dashboard route group, not the scaffolding page |
| AUTH-06 | User session persists across browser refresh with secure cookie/token management via better-auth | Proxy redirect fix eliminates double-redirect hop; session validation in API route uses `auth.api.getSession` |
| MNTR-04 | User can configure alert rules and view notification history at `/monitor/alerts` | New `/api/alerts/notifications` endpoint enables the existing `useAlertNotificationBridge` to populate alert data |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, route groups, middleware (proxy.ts) | Already installed; route groups and middleware are core App Router features |
| Drizzle ORM | 0.45.1 | Database queries with type-safe left join | Already installed; leftJoin + partial select is the idiomatic pattern |
| better-auth | 1.4.18 | Session validation in API route handler | Already installed; `auth.api.getSession({ headers })` is established pattern |
| PostgreSQL | (Docker) | Data store for alert notifications and rules | Already running; no changes needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-orm (imports) | 0.45.1 | `eq`, `desc` from `drizzle-orm` for query building | Import in the new route.ts for join condition and ordering |

### Alternatives Considered

None. This phase uses exclusively existing project dependencies. No new packages are needed.

**Installation:**
```bash
# No installation needed -- all dependencies are already present
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── page.tsx                              # DELETE this file (route conflict)
├── (auth)/
│   └── layout.tsx                        # Already redirects session → /dashboard (correct)
├── (dashboard)/
│   ├── layout.tsx                        # Session check + app shell
│   ├── page.tsx                          # redirect("/dashboard") -- becomes sole / handler
│   └── dashboard/
│       └── page.tsx                      # Actual dashboard view
├── api/
│   ├── alerts/
│   │   └── notifications/
│   │       └── route.ts                  # NEW: GET handler
│   ├── auth/[...all]/route.ts            # Existing
│   └── health/route.ts                   # Existing
proxy.ts                                  # Fix redirect target on line 32
middleware.ts                             # No changes (re-exports proxy)
```

### Pattern 1: Next.js Route Group Conflict Resolution
**What:** When `app/page.tsx` and `app/(group)/page.tsx` both exist, they both resolve to URL `/`, creating a route conflict. Next.js cannot determine which to serve.
**When to use:** Whenever a root-level page exists alongside a route group page at the same path.
**Resolution:** Delete the root-level `app/page.tsx`. The route group's `page.tsx` becomes the sole handler for that URL path.

**Verification after fix:**
- `app/page.tsx` does not exist
- `app/(dashboard)/page.tsx` resolves to `/` and redirects to `/dashboard`
- `app/(dashboard)/dashboard/page.tsx` renders the DashboardView

Source: [Next.js Route Groups docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) -- "Routes in different groups should not resolve to the same URL path"

### Pattern 2: Middleware Redirect Target
**What:** `proxy.ts` line 32 redirects authenticated users from auth pages to `"/"`. This causes a double redirect: `/login` -> `/` -> `/dashboard` (because `app/(dashboard)/page.tsx` at `/` does `redirect("/dashboard")`).
**When to use:** When middleware needs to redirect authenticated users away from login/register pages.
**Fix:** Change the redirect target from `"/"` to `"/dashboard"` for a single-hop redirect.

```typescript
// BEFORE (line 32 of proxy.ts):
return NextResponse.redirect(new URL("/", request.url));

// AFTER:
return NextResponse.redirect(new URL("/dashboard", request.url));
```

Source: Verified in codebase -- `proxy.ts` line 32, `app/(dashboard)/page.tsx` redirect, and `app/(dashboard)/dashboard/page.tsx` as final destination.

### Pattern 3: API Route Handler with Session Validation
**What:** A Next.js Route Handler that validates the better-auth session before executing a database query.
**When to use:** Any API endpoint that requires authentication (defense-in-depth behind proxy middleware).
**Example:**

```typescript
// Source: better-auth official docs + established project pattern in app/(dashboard)/layout.tsx
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ... proceed with query
}
```

Source: [better-auth Next.js integration](https://www.better-auth.com/docs/integrations/next) -- `auth.api.getSession` accepts `headers` from `next/headers` in server components, server actions, and route handlers.

### Pattern 4: Drizzle ORM Left Join with Partial Select
**What:** Query `alertNotifications` with a LEFT JOIN on `alertRules` to get `ruleName`, selecting only the columns the bridge expects.
**When to use:** When a related row may not exist (rule deleted) but you still need the notification.
**Example:**

```typescript
// Source: Drizzle ORM docs - Partial Select with Left Join
import { db } from "@/shared/lib/db";
import { desc, eq } from "drizzle-orm";
import { alertNotifications, alertRules } from "@/features/dashboard/model/alert-schema";

const rows = await db
  .select({
    id: alertNotifications.id,
    ruleId: alertNotifications.ruleId,
    ruleName: alertRules.name,          // nullable due to LEFT JOIN
    severity: alertNotifications.severity,
    message: alertNotifications.message,
    createdAt: alertNotifications.createdAt,
    read: alertNotifications.read,
  })
  .from(alertNotifications)
  .leftJoin(alertRules, eq(alertNotifications.ruleId, alertRules.id))
  .orderBy(desc(alertNotifications.createdAt))
  .limit(limit);
```

Source: [Drizzle ORM Joins docs](https://orm.drizzle.team/docs/joins) -- "Drizzle ORM's partial select syntax. The query automatically infers return types based on the selected fields, with nullable fields for left-joined tables."

### Anti-Patterns to Avoid
- **Do NOT add `app/page.tsx` back as a redirect stub:** The `(dashboard)` route group already has `page.tsx` that handles `/`. Adding another file at the root creates the same conflict again.
- **Do NOT use `request.headers` directly in route handler:** Use `await headers()` from `next/headers` instead. The `request.headers` approach may not carry cookie context correctly in all Next.js versions. The project already uses `await headers()` consistently in `app/(auth)/layout.tsx` and `app/(dashboard)/layout.tsx`.
- **Do NOT use `db.query` (relational API) for this join:** The codebase does not use Drizzle's relational query API. Use the SQL-like `db.select().from().leftJoin()` pattern to stay consistent with the existing codebase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session validation | Custom cookie parsing or JWT verification | `auth.api.getSession({ headers: await headers() })` | better-auth handles cookie parsing, session lookup, and expiry checks; project already uses this pattern |
| Query parameter validation | Manual parseInt with fallback | `Math.min(Math.max(Number(param) \|\| 10, 1), 50)` | Simple clamping is sufficient; no need for Zod validation on a single numeric query param |
| Route conflict resolution | Custom rewrite rules or redirect chains | Delete the conflicting file | Next.js route groups are designed for this; adding complexity is wrong |

**Key insight:** This phase has zero architectural decisions to make. Every pattern is already established. The risk is introducing unnecessary complexity, not missing complexity.

## Common Pitfalls

### Pitfall 1: Route Group Conflict Silently Builds in Dev, Fails in Prod
**What goes wrong:** In development mode (Turbopack), Next.js may resolve the route conflict non-deterministically, serving one page or the other. In production builds, it throws a hard error.
**Why it happens:** Dev mode is more lenient about route conflicts; production mode enforces strict uniqueness.
**How to avoid:** Delete `app/page.tsx` and verify with `next build` (or at minimum `next dev` with a fresh start) that no route conflict warnings appear.
**Warning signs:** Console warning about "conflicting page" or "duplicate route" during build.

### Pitfall 2: Double Redirect Not Visible in Fast Networks
**What goes wrong:** The `/login` -> `/` -> `/dashboard` double redirect works but adds latency. On fast networks, it's invisible to developers. On slow connections or in production with CDN, users see a flash of the wrong page.
**Why it happens:** The redirect from `app/(dashboard)/page.tsx` to `/dashboard` is a server-side redirect, adding a full round-trip.
**How to avoid:** Change proxy.ts to redirect directly to `/dashboard`, eliminating the intermediate hop entirely.
**Warning signs:** Network tab shows two 307/302 redirects in sequence when visiting `/login` while authenticated.

### Pitfall 3: LEFT JOIN Nullable Type Not Handled
**What goes wrong:** When an `alertRule` has been deleted, the LEFT JOIN returns `null` for `ruleName`. If the API returns this as-is, the bridge already handles it (line 69: `n.ruleName ?? "Alert"`), but the TypeScript types must be correct.
**Why it happens:** Drizzle correctly infers `ruleName` as `string | null` for LEFT JOIN results, matching the `RawAlertNotification` interface which declares `ruleName: string | null`.
**How to avoid:** The types already align. Do not force `ruleName` to be non-null in the API response -- let the bridge handle the fallback.
**Warning signs:** TypeScript error about `string | null` not assignable to `string`.

### Pitfall 4: `createdAt` Serialization as Date vs String
**What goes wrong:** Drizzle returns `createdAt` as a JavaScript `Date` object. The bridge expects `createdAt` as a `string` (ISO format). `Response.json()` automatically serializes `Date` to ISO string, so this works correctly -- but only if you use `Response.json()`, not manual `JSON.stringify`.
**Why it happens:** `Response.json()` uses a JSON serializer that calls `.toISOString()` on Date objects.
**How to avoid:** Always return data via `Response.json(data)`, not `new Response(JSON.stringify(data))`.
**Warning signs:** `createdAt` appearing as `"2026-02-20T12:00:00.000Z"` (correct) vs `{}` (broken, if Date is somehow not serialized).

### Pitfall 5: Query Key Already Exists in query-keys.ts
**What goes wrong:** Developer creates a new query key for the notifications endpoint, duplicating what already exists.
**Why it happens:** `queryKeys.alerts.notifications()` already exists at line 132-133 of `src/shared/lib/query-keys.ts`, and the bridge hook already uses it at line 34 of `use-alert-notification-bridge.ts`.
**How to avoid:** Do NOT add any new query keys. The bridge hook already has everything wired. The API endpoint just needs to exist and return the right shape.
**Warning signs:** Duplicate query key definitions in `query-keys.ts`.

### Pitfall 6: exactOptionalPropertyTypes Interference
**What goes wrong:** TypeScript strict mode with `exactOptionalPropertyTypes: true` causes issues when optional properties are assigned `undefined` explicitly.
**Why it happens:** This project has `exactOptionalPropertyTypes` enabled, which is stricter than typical TypeScript projects.
**How to avoid:** For the API route, this is unlikely to be an issue since the response is a flat JSON array. If any optional fields appear in function signatures, use the conditional spread pattern established throughout the project: `{...(value ? { key: value } : {})}`.
**Warning signs:** TypeScript error about `undefined` not being assignable to an optional property type.

## Code Examples

Verified patterns from official sources and established project patterns:

### Complete API Route Handler: GET /api/alerts/notifications

```typescript
// app/api/alerts/notifications/route.ts
// Source: Combines patterns from better-auth docs, Drizzle ORM docs, and existing project code

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/shared/lib/db";
import {
  alertNotifications,
  alertRules,
} from "@/features/dashboard/model/alert-schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Defense-in-depth session validation (proxy.ts already protects this route)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and clamp limit parameter
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50);

  // Query with LEFT JOIN to get ruleName (may be null if rule deleted)
  const rows = await db
    .select({
      id: alertNotifications.id,
      ruleId: alertNotifications.ruleId,
      ruleName: alertRules.name,
      severity: alertNotifications.severity,
      message: alertNotifications.message,
      createdAt: alertNotifications.createdAt,
      read: alertNotifications.read,
    })
    .from(alertNotifications)
    .leftJoin(alertRules, eq(alertNotifications.ruleId, alertRules.id))
    .orderBy(desc(alertNotifications.createdAt))
    .limit(limit);

  return Response.json(rows);
}
```

### Proxy.ts Fix (Single Line Change)

```typescript
// proxy.ts line 32
// BEFORE:
return NextResponse.redirect(new URL("/", request.url));

// AFTER:
return NextResponse.redirect(new URL("/dashboard", request.url));
```

### Route Conflict Resolution

```bash
# Delete the scaffolding page -- this is the entire fix
rm app/page.tsx
```

### Verification: Login Flow After Fixes

```
# Authenticated user visits /login:
1. proxy.ts detects sessionCookie + isAuthPage → redirects to /dashboard (single hop)
2. app/(dashboard)/dashboard/page.tsx renders DashboardView

# Unauthenticated user visits /dashboard:
1. proxy.ts detects no sessionCookie + not public → redirects to /login?callbackUrl=/dashboard
2. User logs in → login page reads callbackUrl → redirects to /dashboard

# User visits / (root):
1. app/(dashboard)/page.tsx is the sole handler (no conflict)
2. redirect("/dashboard") → app/(dashboard)/dashboard/page.tsx renders DashboardView
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` export name | `proxy.ts` with `proxy` function name | Next.js 16 | This project already uses the correct Next.js 16 pattern -- `middleware.ts` re-exports from `proxy.ts` |
| Drizzle relational queries (db.query) | SQL-like API (db.select().from()) | Project convention | Project uses SQL-like API exclusively; relational API is not used |
| Manual cookie parsing for auth | `auth.api.getSession({ headers })` | better-auth convention | Established in both `(auth)/layout.tsx` and `(dashboard)/layout.tsx` |

**Deprecated/outdated:**
- None relevant to this phase. All existing patterns are current.

## Open Questions

1. **Does Next.js 16 throw a build error or warning for the route conflict?**
   - What we know: Next.js docs state route groups should not resolve to the same URL path. Search results confirm this causes errors.
   - What's unclear: Whether Next.js 16.1.6 specifically throws at build time or just in dev mode. The project may have been running in dev mode where the conflict is tolerated.
   - Recommendation: Delete `app/page.tsx` and verify with `next build`. LOW risk -- the file is a scaffolding placeholder with no consumers.
   - Confidence: HIGH that deletion is correct, MEDIUM on exact error behavior.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `proxy.ts`, `app/page.tsx`, `app/(dashboard)/page.tsx`, `app/(dashboard)/layout.tsx`, `app/(auth)/layout.tsx`, `src/features/dashboard/api/use-alert-notification-bridge.ts`, `src/features/dashboard/model/alert-schema.ts`, `src/shared/lib/db.ts`, `src/shared/lib/query-keys.ts`
- Context7: `/drizzle-team/drizzle-orm-docs` -- left join partial select syntax, nullable field inference
- Context7: `/llmstxt/better-auth_llms_txt` -- `auth.api.getSession` with `headers` from `next/headers` in server components and route handlers
- Context7: `/llmstxt/nextjs_llms_txt` -- route group convention, route conflict behavior

### Secondary (MEDIUM confidence)
- [Next.js Route Groups documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) -- route groups should not resolve to the same URL path
- [better-auth Next.js integration](https://www.better-auth.com/docs/integrations/next) -- getSession pattern in route handlers
- [Drizzle ORM Joins documentation](https://orm.drizzle.team/docs/joins) -- leftJoin with partial select
- [Drizzle ORM Select documentation](https://orm.drizzle.team/docs/select) -- orderBy, limit, desc

### Tertiary (LOW confidence)
- None. All findings verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified via `package.json`
- Architecture: HIGH -- all three fixes are direct modifications to existing files using established patterns
- Pitfalls: HIGH -- verified against codebase (types match, serialization works, query keys exist)

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable -- no moving parts, all patterns are locked in)
