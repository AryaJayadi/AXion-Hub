---
phase: 01-foundation-infrastructure
plan: 05
subsystem: infra
tags: [zustand, tanstack-query, websocket, state-management, react-context, event-bus, query-keys]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Project scaffold with FSD structure, Zustand, TanStack Query, provider composition pattern"
  - phase: 01-04
    provides: "WebSocket Manager, Event Bus, Gateway Client, createGatewayStack factory"
provides:
  - "Zustand connection store with Event Bus subscriptions for real-time state"
  - "Selector-based React hooks for connection state (useIsConnected, useConnectionState, etc.)"
  - "initConnectionStoreSubscriptions() for wiring Event Bus to Zustand store"
  - "GatewayProvider with React context exposing gatewayClient and eventBus"
  - "TanStack Query key factory for agents, sessions, gateway, audit domains"
  - "Complete provider composition: ThemeProvider > QueryProvider > GatewayProvider"
affects: [01-07, 02-01, 02-02, 02-03, 02-04, 03-01, 03-02, all-feature-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [zustand-event-bus-subscription, selector-hooks-minimal-rerenders, query-key-factory, gateway-provider-context, push-state-vs-pull-state]

key-files:
  created: [src/features/gateway-connection/model/store.ts, src/features/gateway-connection/model/hooks.ts, src/shared/lib/query-keys.ts, src/app/providers/gateway-provider.tsx]
  modified: [src/features/gateway-connection/index.ts, src/app/providers/app-providers.tsx, .env.example]

key-decisions:
  - "Zustand for PUSH state (WebSocket events), TanStack Query for PULL state (REST APIs) -- separate concerns"
  - "useRef for gateway stack initialization prevents recreation on re-renders"
  - "GatewayProvider auto-connects when NEXT_PUBLIC_GATEWAY_URL is set; failure is graceful (expected in Phase 1)"
  - "Query key factory uses hierarchical arrays for precise cache invalidation granularity"

patterns-established:
  - "PUSH state: Event Bus events -> Zustand store (connection store pattern, reuse for agent store, chat store)"
  - "PULL state: TanStack Query with queryKeys factory for consistent cache keys"
  - "Provider order: ThemeProvider > QueryProvider > GatewayProvider > children + Toaster"
  - "useGateway() hook for accessing gatewayClient and eventBus from any component"
  - "Selector-based hooks (useConnectionStore(s => s.field)) to minimize React re-renders"

requirements-completed: [INFR-09]

# Metrics
duration: 3min
completed: 2026-02-17
---

# Phase 1 Plan 5: State Management & Gateway Provider Summary

**Zustand connection store with Event Bus subscriptions, selector-based React hooks, TanStack Query key factory, and GatewayProvider wiring WebSocket stack to React context**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-17T16:38:35Z
- **Completed:** 2026-02-17T16:41:31Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Zustand connection store tracks state/mode/reconnectAttempt/error with retry() and disconnect() actions, subscribed to Event Bus events via initConnectionStoreSubscriptions()
- Seven selector-based React hooks provide minimal-rerender access to connection state (useIsConnected, useConnectionState, useReconnectInfo, etc.)
- TanStack Query key factory covers agents, sessions, gateway, and audit domains with hierarchical keys for precise cache invalidation
- GatewayProvider creates the WebSocket stack once (via useRef), provides gatewayClient and eventBus via React context, and auto-connects gracefully

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand connection store, React hooks, and query key factory** - `e3da392` (feat)
2. **Task 2: Create gateway provider and integrate into app providers** - `48696d4` (feat)

## Files Created/Modified
- `src/features/gateway-connection/model/store.ts` - Zustand connection store with Event Bus subscriptions
- `src/features/gateway-connection/model/hooks.ts` - Seven selector-based React hooks for connection state
- `src/shared/lib/query-keys.ts` - TanStack Query key factory for agents, sessions, gateway, audit
- `src/app/providers/gateway-provider.tsx` - GatewayProvider with React context for gateway stack
- `src/features/gateway-connection/index.ts` - Updated barrel export with store, hooks, subscription initializer
- `src/app/providers/app-providers.tsx` - Added GatewayProvider to provider composition
- `.env.example` - Added NEXT_PUBLIC_GATEWAY_URL and NEXT_PUBLIC_AXION_MODE

## Decisions Made
- Zustand for PUSH state (WebSocket events update stores directly) vs TanStack Query for PULL state (REST API calls with caching) -- clean separation of concerns per RESEARCH.md Pattern 4
- GatewayProvider uses useRef (not useState) to create the stack once, preventing re-creation on re-renders. Cleanup on unmount via useEffect return.
- Auto-connect behavior: if NEXT_PUBLIC_GATEWAY_URL is set, GatewayProvider connects on mount. Failure is graceful (expected in Phase 1 with no gateway running).
- Query key factory uses hierarchical constant arrays (e.g., ['agents', 'detail', id]) enabling granular cache invalidation at any level.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. The GatewayProvider gracefully handles missing gateway connections.

## Next Phase Readiness
- State management patterns (PUSH and PULL) established and ready for all feature development
- Connection store pattern can be replicated for agent store, chat store, etc.
- GatewayProvider wires the WebSocket stack to React; any component can access via useGateway()
- Query key factory ready for TanStack Query hooks in feature development
- Build succeeds with all providers in place

## Self-Check: PASSED

All 7 key files verified present. Both task commits verified in git log (e3da392, 48696d4).

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-02-17*
