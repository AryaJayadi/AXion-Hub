---
phase: 03-agent-management
plan: 01
subsystem: ui
tags: [zustand, tanstack-query, nuqs, agent-management, shadcn-ui, zod]

# Dependency graph
requires:
  - phase: 01-foundation-infrastructure
    provides: shared UI components (Card, Avatar, Badge, Skeleton, EmptyState, PageHeader, SearchInput, Select, DropdownMenu), Zustand store pattern, TanStack Query setup, EventBus, GatewayClient
  - phase: 02-authentication-app-shell
    provides: dashboard layout with sidebar, auth-protected routes
provides:
  - Agent entity types (Agent, AgentSession, AgentSkill, AgentTool, AgentLogEntry, AgentMetrics, AgentTemplate, AgentIdentityFiles)
  - Zod schemas for agent data validation
  - 5 pre-built agent templates with rich identity file starter content
  - Agent utility functions (status colors, glow classes, uptime formatting)
  - Zustand agent store with WebSocket Event Bus subscription support
  - TanStack Query hooks for agent CRUD (mock data for now)
  - AgentCard, AgentGrid, AgentSearchBar components
  - /agents route with responsive card grid, status glow, and URL-persisted search/filter
  - NuqsAdapter in AppProviders for URL search param state
affects: [03-agent-management, 04-task-management, 05-channel-routing]

# Tech tracking
tech-stack:
  added: ["@uiw/react-md-editor@4.0.11", "use-debounce@10.1.0"]
  patterns: ["TanStack Query initial load + Zustand real-time sync", "nuqs URL state for search/filter", "CSS box-shadow glow for status indicators"]

key-files:
  created:
    - src/entities/agent/model/types.ts
    - src/entities/agent/model/schemas.ts
    - src/entities/agent/model/templates.ts
    - src/entities/agent/lib/agent-utils.ts
    - src/entities/agent/index.ts
    - src/features/agents/model/agent-store.ts
    - src/features/agents/api/use-agents.ts
    - src/features/agents/api/use-agent-mutations.ts
    - src/features/agents/components/agent-card.tsx
    - src/features/agents/components/agent-grid.tsx
    - src/features/agents/components/agent-search-bar.tsx
    - src/features/agents/index.ts
    - src/views/agents/agents-roster-view.tsx
    - app/(dashboard)/agents/page.tsx
    - src/shared/ui/tabs.tsx
    - src/shared/ui/dialog.tsx
    - src/shared/ui/scroll-area.tsx
    - src/shared/ui/switch.tsx
    - src/shared/ui/progress.tsx
    - src/shared/ui/chart.tsx
    - src/shared/ui/command.tsx
    - src/shared/ui/alert-dialog.tsx
  modified:
    - package.json
    - bun.lock
    - src/app/providers/app-providers.tsx

key-decisions:
  - "NuqsAdapter added to AppProviders for URL search param state across all dashboard pages"
  - "TanStack Query staleTime set to Infinity to prevent WebSocket/Query desync (per research Pitfall 5)"
  - "Mock data used for agent list until gateway client methods are wired"
  - "Agent status glow uses box-shadow (not border-width) to prevent layout shift"

patterns-established:
  - "Agent entity model: types.ts + schemas.ts + templates.ts + utils in FSD entities layer"
  - "Status glow pattern: getStatusGlowClasses() returns Tailwind classes for ambient card glow by status"
  - "Roster search/filter: nuqs useQueryState for URL persistence, useMemo for client-side filtering"

requirements-completed: [AGNT-01]

# Metrics
duration: 7min
completed: 2026-02-18
---

# Phase 3 Plan 1: Agent Entity and Roster Page Summary

**Agent entity model with types, schemas, 5 templates, Zustand store, and /agents roster page with employee badge cards, status glow borders, and URL-persisted search/filter**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-18T03:48:28Z
- **Completed:** 2026-02-18T03:56:00Z
- **Tasks:** 2
- **Files modified:** 25

## Accomplishments
- Complete agent entity model with 10 TypeScript interfaces, Zod validation schemas, and 5 richly-detailed agent templates
- Zustand agent store with real-time WebSocket Event Bus subscription support and TanStack Query initial load sync
- /agents page rendering a responsive card grid (1-4 columns) with employee badge-style cards featuring ambient status glow (green/yellow/blue/red/gray), three-dot action menus, and delete confirmation dialogs
- URL-persisted search by name and status dropdown filter via nuqs

## Task Commits

Each task was committed atomically:

1. **Task 1: Agent entity model, Zustand store, and TanStack Query hooks** - `a2683ca` (feat)
2. **Task 2: Agent roster page with card grid, status glow, and search/filter** - `eb5e39e` (feat)

## Files Created/Modified
- `src/entities/agent/model/types.ts` - Agent, AgentStatus, AgentSession, AgentMemoryFile, AgentSkill, AgentTool, AgentLogEntry, AgentMetrics, AgentTemplate, AgentIdentityFiles types
- `src/entities/agent/model/schemas.ts` - Zod v4 schemas for agent entity validation
- `src/entities/agent/model/templates.ts` - 5 pre-built agent templates with rich identity file content
- `src/entities/agent/lib/agent-utils.ts` - Status color/glow, uptime formatting, key stat utilities
- `src/entities/agent/index.ts` - Agent entity barrel export
- `src/features/agents/model/agent-store.ts` - Zustand store with roster/detail state and Event Bus subscriptions
- `src/features/agents/api/use-agents.ts` - TanStack Query hook with mock data and Zustand sync
- `src/features/agents/api/use-agent-mutations.ts` - Create/delete agent mutation hooks with toast notifications
- `src/features/agents/components/agent-card.tsx` - Employee badge card with status glow, dropdown menu, delete dialog
- `src/features/agents/components/agent-grid.tsx` - Responsive grid with loading skeletons and empty state
- `src/features/agents/components/agent-search-bar.tsx` - Search input + status filter dropdown + New Agent button
- `src/features/agents/index.ts` - Agents feature barrel export
- `src/views/agents/agents-roster-view.tsx` - Roster page composition with nuqs URL state
- `app/(dashboard)/agents/page.tsx` - Next.js route for /agents with Suspense boundary
- `src/app/providers/app-providers.tsx` - Added NuqsAdapter for URL search param state
- `src/shared/ui/` - 8 new shadcn/ui components (tabs, dialog, scroll-area, switch, progress, chart, command, alert-dialog)

## Decisions Made
- NuqsAdapter added to AppProviders at the application root, enabling URL search param state across all dashboard pages (not just agents)
- TanStack Query staleTime set to Infinity with refetchOnWindowFocus disabled to prevent WebSocket and Query data desync (per research Pitfall 5)
- Mock data used for agent list (8 agents with varied statuses) until gateway client methods are wired; TODO comments mark replacement points
- Agent status glow uses CSS box-shadow exclusively (not border-width changes) to prevent layout shift when status changes
- Alert-dialog installed separately from the batch shadcn install for delete confirmation UX

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] NuqsAdapter required for nuqs with Next.js App Router**
- **Found during:** Task 2 (AgentsRosterView using useQueryState)
- **Issue:** nuqs requires a NuqsAdapter provider for App Router to function
- **Fix:** Added NuqsAdapter from "nuqs/adapters/next/app" to AppProviders
- **Files modified:** src/app/providers/app-providers.tsx
- **Verification:** Build passes, useQueryState works correctly
- **Committed in:** eb5e39e (Task 2 commit)

**2. [Rule 3 - Blocking] Alert dialog component needed for delete confirmation**
- **Found during:** Task 1 (planning ahead for AgentCard delete flow in Task 2)
- **Issue:** alert-dialog shadcn component not in the install list but needed for destructive action confirmation per plan
- **Fix:** Installed alert-dialog via shadcn CLI
- **Files modified:** src/shared/ui/alert-dialog.tsx
- **Verification:** Build passes, component renders correctly
- **Committed in:** a2683ca (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were necessary for the plan's specified functionality. No scope creep.

## Issues Encountered
None - plan executed cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Agent entity model established and importable from @/entities/agent for all subsequent Phase 3 plans
- Zustand agent store ready for WebSocket integration and detail page views
- /agents route live and rendering mock data; ready for gateway client integration
- 8 new shadcn/ui components installed for use across remaining Phase 3 plans (wizard, detail pages, metrics)

## Self-Check: PASSED

- All 14 created files verified present on disk
- Commit a2683ca (Task 1) verified in git log
- Commit eb5e39e (Task 2) verified in git log
- `bun run build` succeeds with /agents route registered

---
*Phase: 03-agent-management*
*Completed: 2026-02-18*
