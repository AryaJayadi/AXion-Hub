---
phase: 05-dashboard-monitoring
plan: 04
subsystem: ui
tags: [react-flow, dagre, split-view, activity-feed, dependency-map, nuqs, tanstack-query]

# Dependency graph
requires:
  - phase: 05-01
    provides: activity store with dual buffer (fullEvents for /activity page)
  - phase: 05-03
    provides: useAutoScroll hook, ActivityEventCard component
  - phase: 05-02
    provides: dashboard stat widgets, cost summary hook patterns
provides:
  - /activity page with real-time split view (event list + detail panel)
  - /activity/history page with searchable DataTable of past events
  - /monitor page with interactive React Flow dependency map
  - Dagre layout engine for automatic service graph positioning
  - useActivityHistory TanStack Query hook with mock data
  - useServiceHealth TanStack Query hook with 8 mock services
affects: [05-05-alert-rules, phase-06, phase-07]

# Tech tracking
tech-stack:
  added: ["@xyflow/react (React Flow v12)", "@dagrejs/dagre (graph layout)"]
  patterns: [split-view-layout, dagre-auto-layout, custom-react-flow-nodes, url-filter-persistence]

key-files:
  created:
    - src/features/dashboard/components/activity-split-view.tsx
    - src/features/dashboard/components/activity-event-detail.tsx
    - src/features/dashboard/api/use-activity-history.ts
    - src/views/dashboard/activity-view.tsx
    - src/views/dashboard/activity-history-view.tsx
    - src/features/dashboard/components/dependency-map.tsx
    - src/features/dashboard/components/dependency-node.tsx
    - src/features/dashboard/components/node-detail-panel.tsx
    - src/features/dashboard/lib/dagre-layout.ts
    - src/features/dashboard/api/use-service-health.ts
    - src/views/dashboard/monitor-view.tsx
    - app/(dashboard)/activity/page.tsx
    - app/(dashboard)/activity/history/page.tsx
    - app/(dashboard)/monitor/page.tsx
  modified: []

key-decisions:
  - "Split view uses flex layout (60/40) with vertical stacking on mobile instead of ResizablePanel"
  - "nuqs URL state for multi-select filters serialized as comma-separated strings"
  - "DependencyNode uses memo + custom nodeTypes registration for React Flow performance"
  - "NodeDetailPanel is absolutely positioned inside the map container instead of a Sheet overlay"
  - "Dagre layout with rankdir TB, 60px nodesep, 80px ranksep for clean service graph spacing"
  - "nodesDraggable=false per research Pitfall 4 to reduce event listeners on the dependency map"

patterns-established:
  - "Split view: flex layout with md:w-3/5 and md:w-2/5 proportions, vertical stack on mobile"
  - "Multi-select URL filter: comma-separated string serialization via nuqs"
  - "Custom React Flow node: registered via nodeTypes object, data typed via DependencyNodeData"
  - "Service health mock: 8-service topology (gateway -> providers -> nodes, gateway -> channels)"

requirements-completed: [MNTR-01, MNTR-02, MNTR-03]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 5 Plan 4: Activity Pages and Dependency Map Summary

**Real-time activity split view, searchable history DataTable, and interactive React Flow dependency map with dagre auto-layout and color-coded health nodes**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T06:12:57Z
- **Completed:** 2026-02-18T06:18:01Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- /activity page with real-time split view: left panel shows filterable event list from activity store, right panel shows detailed event info on selection
- /activity/history page with DataTable (50 mock events), search, multi-select filters for type/severity, sortable columns for timestamp and type
- /monitor page with interactive React Flow dependency map showing 8 services with color-coded health borders (green/yellow/red), click-to-drill-in detail panel with metrics

## Task Commits

Each task was committed atomically:

1. **Task 1: Build /activity split view and /activity/history pages** - `5adce61` (feat)
2. **Task 2: Build /monitor page with interactive React Flow dependency map** - `9971dc6` (feat)

## Files Created/Modified
- `src/features/dashboard/components/activity-event-detail.tsx` - Event detail card with JSON rendering
- `src/features/dashboard/components/activity-split-view.tsx` - Split view with filterable event list and detail panel
- `src/features/dashboard/api/use-activity-history.ts` - TanStack Query hook with 50 mock history events
- `src/views/dashboard/activity-view.tsx` - /activity page composition with PageHeader
- `src/views/dashboard/activity-history-view.tsx` - /activity/history with DataTable, search, filters
- `app/(dashboard)/activity/page.tsx` - Next.js route for /activity
- `app/(dashboard)/activity/history/page.tsx` - Next.js route for /activity/history
- `src/features/dashboard/lib/dagre-layout.ts` - Dagre graph layout engine for service topology
- `src/features/dashboard/components/dependency-node.tsx` - Custom React Flow node with health colors
- `src/features/dashboard/components/node-detail-panel.tsx` - Side panel with metrics, events, connections
- `src/features/dashboard/components/dependency-map.tsx` - ReactFlow container with Controls, Background, MiniMap
- `src/features/dashboard/api/use-service-health.ts` - TanStack Query hook with 8 mock services
- `src/views/dashboard/monitor-view.tsx` - /monitor page composition with loading skeleton
- `app/(dashboard)/monitor/page.tsx` - Next.js route for /monitor

## Decisions Made
- Split view uses 60/40 flex layout (not ResizablePanel) for simplicity; stacks vertically on mobile
- nuqs multi-select filters serialized as comma-separated strings in URL
- DependencyNode uses memo for React Flow performance optimization
- NodeDetailPanel absolutely positioned inside map container (not a Sheet overlay) for spatial context
- Dagre layout uses TB direction with 60px nodesep and 80px ranksep
- nodesDraggable=false per research Pitfall 4 to minimize event listener overhead

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three monitoring pages complete (/activity, /activity/history, /monitor)
- Ready for 05-05 alert rules and notification configuration page
- Activity store integration provides real-time events when gateway connected
- Service health mock data ready to replace with real gateway health endpoint

## Self-Check: PASSED

All 14 created files verified on disk. Both task commits (5adce61, 9971dc6) confirmed in git log.

---
*Phase: 05-dashboard-monitoring*
*Completed: 2026-02-18*
