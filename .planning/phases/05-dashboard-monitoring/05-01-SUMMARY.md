---
phase: 05-dashboard-monitoring
plan: 01
subsystem: ui, state
tags: [zustand, eventbus, css-grid, dashboard, bento-grid, number-flow, xyflow, dagre]

# Dependency graph
requires:
  - phase: 01-project-foundation
    provides: "EventBus, Zustand, query key factory, shadcn/ui Card"
  - phase: 03-agent-management
    provides: "Agent entity types, agent store, AgentStatus"
provides:
  - "DashboardEvent entity with types, parser, barrel export"
  - "Dashboard Zustand store with agent counts, task summary, cost data"
  - "Activity Zustand store with 20/200 circular buffer"
  - "Alert notification Zustand store"
  - "EventBus subscription initializers for dashboard and activity stores"
  - "Query key factory extended with dashboard, activity, alerts domains"
  - "Cost formatting utilities (formatTokenCount, formatDollarCost, estimateCost)"
  - "Event display info mapper (icon, color, label per event namespace)"
  - "BentoGrid responsive CSS Grid layout widget with stale-data indicator"
affects: [05-02, 05-03, 05-04, 05-05]

# Tech tracking
tech-stack:
  added: ["@number-flow/react@0.5.12", "@xyflow/react@12.10.0", "@dagrejs/dagre@2.0.4"]
  patterns: ["Circular buffer store for bounded event history", "EventBus subscription initializer pattern extended to dashboard domain"]

key-files:
  created:
    - src/entities/dashboard-event/model/types.ts
    - src/entities/dashboard-event/lib/parser.ts
    - src/entities/dashboard-event/index.ts
    - src/features/dashboard/model/dashboard-store.ts
    - src/features/dashboard/model/activity-store.ts
    - src/features/dashboard/model/alert-store.ts
    - src/features/dashboard/index.ts
    - src/features/dashboard/lib/cost-formatter.ts
    - src/features/dashboard/lib/event-mapper.ts
    - src/widgets/dashboard-grid/components/bento-grid.tsx
  modified:
    - src/shared/lib/query-keys.ts
    - package.json

key-decisions:
  - "Activity store uses dual buffer: 20 events for dashboard widget, 200 for /activity page"
  - "Dashboard store recalculates agent counts from agent store on every agent event rather than maintaining independent state"
  - "ws.failed used for disconnect detection (ws.disconnected not in KnownEvents); ws.connected for reconnect"

patterns-established:
  - "Circular buffer pattern: prepend + slice for bounded arrays in Zustand"
  - "initStoreSubscriptions pattern: returns cleanup function, used at app startup"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06]

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 5 Plan 1: Dashboard Data Layer Summary

**Dashboard-event entity, three Zustand stores wired to EventBus, cost formatter, event mapper, and BentoGrid responsive layout widget**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T05:54:50Z
- **Completed:** 2026-02-18T05:59:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Installed Phase 5 dependencies: @number-flow/react, @xyflow/react, @dagrejs/dagre
- Created DashboardEvent entity with 7 types, parser, and barrel export
- Built three Zustand stores (dashboard, activity, alert) with EventBus subscription initializers
- Extended query key factory with dashboard, activity, and alerts domains
- Created cost formatting utilities with model-aware pricing estimates
- Built BentoGrid responsive CSS Grid widget with stale-data indicator support

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create dashboard-event entity with types and utilities** - `c2286f1` (feat)
2. **Task 2: Create Zustand stores, extend query keys, and build BentoGrid widget** - `d5dc5ac` (feat)

## Files Created/Modified

- `src/entities/dashboard-event/model/types.ts` - DashboardEvent, CostSummary, TaskSummary, AgentCostData, TimePeriod, ServiceHealth types
- `src/entities/dashboard-event/lib/parser.ts` - parseGatewayEvent maps raw EventBus events to DashboardEvent objects
- `src/entities/dashboard-event/index.ts` - Barrel export for dashboard-event entity
- `src/features/dashboard/model/dashboard-store.ts` - Zustand store for agent counts, task summary, cost data with EventBus subscriptions
- `src/features/dashboard/model/activity-store.ts` - Zustand store with 20/200 circular buffer and unread counter
- `src/features/dashboard/model/alert-store.ts` - Zustand store for alert notifications with read/unread tracking
- `src/features/dashboard/index.ts` - Barrel export for all dashboard stores, lib, and types
- `src/features/dashboard/lib/cost-formatter.ts` - formatTokenCount (K/M suffixes), formatDollarCost, estimateCost
- `src/features/dashboard/lib/event-mapper.ts` - EVENT_NAMESPACES and getEventDisplayInfo for event display metadata
- `src/widgets/dashboard-grid/components/bento-grid.tsx` - BentoGrid and BentoGridItem responsive layout components
- `src/shared/lib/query-keys.ts` - Extended with dashboard, activity, alerts domains
- `package.json` - Added @number-flow/react, @xyflow/react, @dagrejs/dagre

## Decisions Made

- **Activity store dual buffer:** 20 events for dashboard widget (fast render), 200 for /activity page (deeper history). Both use prepend + slice circular buffer pattern.
- **Dashboard agent counts from agent store:** Rather than maintaining independent agent count state, the dashboard store recalculates counts from `useAgentStore.getState().agents` on each agent event, ensuring single source of truth.
- **ws.failed for disconnect detection:** The EventBus KnownEvents doesn't define a `ws.disconnected` event, so `ws.failed` is used to trigger stale state. `ws.connected` resets it and re-syncs agent counts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All dashboard data layer artifacts are ready for Plan 05-02 (dashboard page with stat widgets)
- Stores are importable from `@/features/dashboard`
- BentoGrid widget is importable from `@/widgets/dashboard-grid/components/bento-grid`
- Query keys are extended and ready for TanStack Query hooks
- Cost formatter and event mapper are ready for widget consumption

## Self-Check: PASSED

- All 11 created/modified files verified present on disk
- Commit c2286f1 (Task 1) verified in git log
- Commit d5dc5ac (Task 2) verified in git log
- `bun run build` passes with zero TypeScript errors

---
*Phase: 05-dashboard-monitoring*
*Completed: 2026-02-18*
