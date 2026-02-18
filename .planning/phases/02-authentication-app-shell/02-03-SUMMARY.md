---
phase: 02-authentication-app-shell
plan: 03
subsystem: ui
tags: [shadcn-sidebar, breadcrumbs, app-shell, session-validation, navigation, responsive-layout]

# Dependency graph
requires:
  - phase: 01-foundation-infrastructure
    provides: FSD project structure, shadcn/ui components.json config, Tailwind v4, Next.js 16
  - phase: 02-authentication-app-shell
    plan: 01
    provides: better-auth server instance, auth client with signOut, auth.api.getSession for session validation
provides:
  - Authenticated app shell with collapsible sidebar, header bar, and session-protected dashboard layout
  - Navigation config with 4 groups (Core, Operations, Automation, System) and 12 nav items
  - Server-side session validation in dashboard layout redirecting unauthenticated users to /login
  - User menu with avatar dropdown, sign out, profile/settings links
  - Dynamic breadcrumbs derived from pathname
  - Mobile-responsive sidebar with hamburger toggle overlay
  - Dashboard home page with contextual welcome empty state
affects: [02-04-org-features, all-dashboard-pages, phase-03-agents, phase-04-chat, phase-05-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: [sidebar-collapsible-icon-rail, server-side-session-layout, pathname-breadcrumbs, sidebar-provider-wrapper]

key-files:
  created:
    - src/widgets/app-shell/config/navigation.ts
    - src/widgets/app-shell/components/app-sidebar.tsx
    - src/widgets/app-shell/components/header-bar.tsx
    - src/widgets/app-shell/components/user-menu.tsx
    - app/(dashboard)/page.tsx
    - src/shared/ui/sidebar.tsx
    - src/shared/ui/breadcrumb.tsx
    - src/shared/ui/avatar.tsx
    - src/shared/ui/sheet.tsx
    - src/shared/lib/use-mobile.ts
  modified:
    - app/(dashboard)/layout.tsx
    - src/app/styles/globals.css

key-decisions:
  - "sidebar.tsx cn import fixed from @/shared/lib/utils to @/shared/lib/cn to match project convention"
  - "SidebarInset used instead of raw <main> to get proper sidebar-aware layout spacing"
  - "Dashboard layout uses div wrapper instead of SidebarInset's main tag to avoid nested main elements"
  - "Breadcrumb segments derived from pathname with dash-to-space and title-case transformation"
  - "Search placeholder styled as non-functional button with Cmd+K hint for future implementation"

patterns-established:
  - "App shell pattern: SidebarProvider > AppSidebar + SidebarInset > HeaderBar + content area"
  - "Server-side session validation: auth.api.getSession with headers() in server component layout"
  - "Navigation config: data-driven NavGroup[] array with lucide icons for sidebar rendering"
  - "User prop threading: session.user extracted in server layout, passed as props to client components"

requirements-completed: [AUTH-06]

# Metrics
duration: 9min
completed: 2026-02-18
---

# Phase 2 Plan 3: App Shell Summary

**Authenticated app shell with collapsible sidebar (4 nav groups, icon rail mode), header bar (dynamic breadcrumbs, search placeholder, user avatar menu), and server-side session validation in dashboard layout**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-18T03:10:33Z
- **Completed:** 2026-02-18T03:19:51Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Collapsible sidebar with 4 navigation groups (Core, Operations, Automation, System) containing 12 nav items, icon-only rail mode via SidebarRail toggle, and active item highlighting using pathname comparison
- Header bar with dynamic breadcrumbs (derived from pathname), global search placeholder with Cmd+K hint, SidebarTrigger for mobile hamburger, and user avatar menu
- Server-side session validation in dashboard layout using auth.api.getSession -- unauthenticated users redirected to /login before any client code runs
- User menu dropdown with avatar fallback initials, name/email display, Profile/Settings links, and sign out with loading state
- Dashboard home page with contextual welcome empty state per locked decision (no onboarding wizard)
- Mobile-responsive layout: sidebar auto-hides on mobile, hamburger button toggles as overlay via Sheet component

## Task Commits

Each task was committed atomically:

1. **Task 1: Install sidebar/breadcrumb components and create navigation config + app sidebar** - `17b0ebb` (feat)
2. **Task 2: Build header bar, user menu, and dashboard layout with session validation** - `f91e619` (feat)

## Files Created/Modified
- `src/widgets/app-shell/config/navigation.ts` - Data-driven navigation config with 4 groups and 12 items
- `src/widgets/app-shell/components/app-sidebar.tsx` - Collapsible sidebar with grouped nav, active highlighting, SidebarRail
- `src/widgets/app-shell/components/header-bar.tsx` - Header with breadcrumbs, search placeholder, SidebarTrigger, UserMenu
- `src/widgets/app-shell/components/user-menu.tsx` - Avatar dropdown with sign out, profile/settings links
- `app/(dashboard)/layout.tsx` - Server component with session validation, SidebarProvider + AppSidebar + HeaderBar
- `app/(dashboard)/page.tsx` - Dashboard home with welcome empty state
- `src/shared/ui/sidebar.tsx` - shadcn/ui Sidebar component (installed via CLI)
- `src/shared/ui/breadcrumb.tsx` - shadcn/ui Breadcrumb component (installed via CLI)
- `src/shared/ui/avatar.tsx` - shadcn/ui Avatar component (installed via CLI)
- `src/shared/ui/sheet.tsx` - shadcn/ui Sheet component for mobile sidebar overlay
- `src/shared/lib/use-mobile.ts` - Mobile breakpoint detection hook (sidebar dependency)
- `src/app/styles/globals.css` - Updated CSS variables for sidebar theming

## Decisions Made
- **sidebar.tsx import path fix:** The shadcn CLI generated sidebar.tsx with `import { cn } from "@/shared/lib/utils"` but the project convention is `@/shared/lib/cn`. Fixed to match project convention.
- **SidebarInset wrapping:** Used SidebarInset (renders as `<main>`) as the content wrapper, with a `<div>` for the scrollable content area to avoid nested `<main>` elements.
- **Breadcrumb derivation:** Breadcrumbs automatically derive from the URL pathname -- splitting by `/`, converting dashes to spaces, and title-casing each segment. The root `/` shows just "Dashboard".
- **Search placeholder design:** Styled as a non-functional button with `Search...` text and `Cmd+K` keyboard hint, ready for future search implementation.
- **User prop threading:** Session user data is extracted once in the server layout and passed as a simple `{ name, email, image }` prop to client components, avoiding client-side session fetches.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed sidebar.tsx import path**
- **Found during:** Task 1 (shadcn component installation)
- **Issue:** shadcn CLI generated sidebar.tsx importing `cn` from `@/shared/lib/utils` which doesn't exist in this project
- **Fix:** Changed import to `@/shared/lib/cn` matching project convention
- **Files modified:** src/shared/ui/sidebar.tsx
- **Verification:** TypeScript compilation passes, build succeeds
- **Committed in:** 17b0ebb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Trivial import path fix required by shadcn CLI generating non-project-standard paths. No scope creep.

## Issues Encountered
- Turbopack build exhibited intermittent ENOENT filesystem race conditions during static generation, requiring multiple build attempts. TypeScript check (`tsc --noEmit`) always passed cleanly -- issue is in Turbopack's output artifact writing, not in code.

## User Setup Required
None - no external service configuration required. Auth environment variables from Plan 01 are sufficient.

## Next Phase Readiness
- App shell is complete and ready for Plan 04 (organization switcher in sidebar header, invitation acceptance)
- All future dashboard pages will render inside this shell automatically via the (dashboard) route group
- Navigation config can be extended by adding items to the NavGroup arrays
- Search placeholder is ready for future implementation (Phase 5+)

## Self-Check: PASSED

All 11 created files verified on disk. Both task commits (17b0ebb, f91e619) verified in git log.

---
*Phase: 02-authentication-app-shell*
*Completed: 2026-02-18*
