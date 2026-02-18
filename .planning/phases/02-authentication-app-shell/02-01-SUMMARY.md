---
phase: 02-authentication-app-shell
plan: 01
subsystem: auth
tags: [better-auth, drizzle, oauth, nodemailer, zod, next-js-proxy, session-management, organization]

# Dependency graph
requires:
  - phase: 01-foundation-infrastructure
    provides: Drizzle ORM with PostgreSQL, db.ts connection, project structure with FSD, Next.js 16 with Turbopack
provides:
  - better-auth server instance with email/password, OAuth, email verification, password reset, org plugin
  - Drizzle auth schema (user, session, account, verification, organization, member, invitation)
  - Auth client with signIn, signUp, signOut, useSession, organization methods
  - Zod validation schemas for login, register, forgot-password, reset-password forms
  - API route handler at /api/auth/[...all]
  - Route protection via proxy.ts with cookie-only check
  - Email utility via nodemailer with dev console fallback
affects: [02-02-auth-pages, 02-03-app-shell, 02-04-org-features, all-authenticated-features]

# Tech tracking
tech-stack:
  added: [better-auth@1.4.18, react-hook-form@7.71.1, @hookform/resolvers@5.2.2, nodemailer@8.0.1, @types/nodemailer@7.0.10]
  patterns: [better-auth-server-config, drizzle-adapter, cookie-based-session, proxy-ts-route-protection, fire-and-forget-email]

key-files:
  created:
    - src/features/auth/lib/auth.ts
    - src/features/auth/lib/auth-client.ts
    - src/features/auth/lib/email.ts
    - src/features/auth/schemas/auth-schemas.ts
    - src/entities/user/model/auth-schema.ts
    - app/api/auth/[...all]/route.ts
    - app/proxy.ts
    - drizzle/0001_loose_la_nuit.sql
  modified:
    - package.json
    - drizzle.config.ts
    - next.config.ts
    - .env.example

key-decisions:
  - "Auth schema manually written (not CLI-generated) because better-auth CLI requires running database; schema verified against better-auth internal field definitions"
  - "drizzle.config.ts schema glob extended to include auth-schema.ts pattern alongside existing schema.ts pattern"
  - "nodemailer added to serverExternalPackages for Turbopack compatibility"
  - "Auto-create personal org uses try/catch wrapper since databaseHooks context can be incomplete in some better-auth versions"
  - "Zod v4 import path (zod/v4) used consistent with project convention from Phase 1"

patterns-established:
  - "better-auth server config: centralized auth.ts with drizzleAdapter, nextCookies, organization plugins"
  - "proxy.ts route protection: cookie-only check via getSessionCookie, no database calls in proxy"
  - "Fire-and-forget email: void sendEmail() in auth callbacks, errors logged but never thrown"
  - "Auth client: 'use client' module exporting destructured better-auth methods for frontend use"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-06]

# Metrics
duration: 9min
completed: 2026-02-18
---

# Phase 2 Plan 1: Auth Foundation Summary

**better-auth server with email/password + OAuth (Google, GitHub) + organizations + email verification + password reset, Drizzle schema for 7 auth tables, proxy.ts route protection, and Zod form validation schemas**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-18T02:57:03Z
- **Completed:** 2026-02-18T03:07:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- better-auth server fully configured with Drizzle adapter, email/password auth, Google + GitHub OAuth, email verification, password reset, organization plugin, and cookie-cached sessions (7-day expiry, 1-day refresh, 5-min cookie cache)
- Drizzle schema created for all 7 better-auth tables (user, session, account, verification, organization, member, invitation) with proper foreign keys, indexes, and cascade deletes; migration SQL generated
- Auth client ready for frontend with signIn, signUp, signOut, useSession, useActiveOrganization, useListOrganizations, organization exports
- Zod v4 validation schemas for all 4 auth forms with password strength rules (min 8, uppercase, lowercase, number, max 128)
- Route protection via proxy.ts using cookie-only check -- no DB calls, fast redirect-only
- Email utility with nodemailer and development console fallback for SMTP-less dev environments

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and generate better-auth Drizzle schema** - `df18aba` (feat)
2. **Task 2: Configure better-auth server, email utility, auth client, validation schemas, API route, and proxy.ts** - `071a534` (feat)

## Files Created/Modified
- `src/features/auth/lib/auth.ts` - better-auth server configuration with all plugins and features
- `src/features/auth/lib/auth-client.ts` - Client-side auth API with organization plugin
- `src/features/auth/lib/email.ts` - Nodemailer email utility with dev console fallback
- `src/features/auth/schemas/auth-schemas.ts` - Zod v4 validation schemas for all auth forms
- `src/entities/user/model/auth-schema.ts` - Drizzle schema for 7 better-auth tables
- `app/api/auth/[...all]/route.ts` - better-auth API route handler (GET + POST)
- `app/proxy.ts` - Route protection with cookie-only session check
- `drizzle/0001_loose_la_nuit.sql` - Migration SQL for auth tables
- `drizzle.config.ts` - Updated to include auth-schema.ts glob pattern
- `next.config.ts` - Added nodemailer to serverExternalPackages
- `.env.example` - Added all auth-related environment variables
- `package.json` - Added better-auth, react-hook-form, @hookform/resolvers, nodemailer dependencies

## Decisions Made
- **Auth schema written manually instead of CLI-generated:** The better-auth CLI `generate` command requires a running database connection to initialize the adapter. Since no database was running during plan execution, the schema was manually written based on introspecting better-auth's internal field definitions (`getAuthTables`). All 7 tables with correct column types, foreign keys, and indexes were verified against the library source.
- **drizzle.config.ts schema glob extended:** The existing config used `./src/**/schema.ts` but the auth schema file is named `auth-schema.ts`. Updated to an array pattern `["./src/**/schema.ts", "./src/**/auth-schema.ts"]` to match both.
- **nodemailer added to serverExternalPackages:** Nodemailer uses Node.js built-ins (net, tls, crypto) that Turbopack cannot bundle. Added alongside existing packages (pg, ioredis, etc.).
- **Auto-create personal org wrapped in try/catch:** The `databaseHooks.user.create.after` hook for auto-creating a personal organization is wrapped in error handling because some better-auth versions have incomplete hook context. If org creation fails, the user can create one manually.
- **Zod v4 API used:** Used `z.email()` and `z.literal(true, { error: ... })` syntax consistent with Zod v4 API and the project's existing `zod/v4` import convention.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Manual schema creation instead of CLI generation**
- **Found during:** Task 1 (Schema generation)
- **Issue:** `bunx @better-auth/cli generate` failed with "Failed to initialize database adapter" because no database was running
- **Fix:** Introspected better-auth's internal `getAuthTables()` function to extract exact field definitions, then manually wrote the Drizzle schema matching the output
- **Files modified:** src/entities/user/model/auth-schema.ts
- **Verification:** Migration generated successfully with all 7 tables; build passes without TypeScript errors
- **Committed in:** df18aba (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Schema is functionally identical to what the CLI would generate. Verified against library internals.

## Issues Encountered
- bun not available in PATH during bash execution -- resolved by using local `./node_modules/.bin/bun` after installing via npm

## User Setup Required

**External services require manual configuration.** The following env vars need to be set before auth features work:
- `BETTER_AUTH_SECRET` - Random string for signing tokens (required)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google Cloud Console OAuth credentials (optional for dev)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub Developer Settings OAuth app (optional for dev)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` - SMTP provider credentials (optional: dev uses console fallback)

See `.env.example` for all variables and defaults.

## Next Phase Readiness
- Auth backend infrastructure is complete and ready for Plan 02 (auth pages: login, register, forgot-password, reset-password)
- Auth client exports are ready for Plan 03 (app shell with session-aware sidebar and header)
- Organization plugin is configured for Plan 04 (org switcher, invitation acceptance)
- Database migration needs to be applied when Docker services are running (`bunx drizzle-kit migrate`)

## Self-Check: PASSED

All 9 created files verified on disk. Both task commits (df18aba, 071a534) verified in git log.

---
*Phase: 02-authentication-app-shell*
*Completed: 2026-02-18*
