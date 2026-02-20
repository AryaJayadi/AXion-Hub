---
phase: 01-foundation-infrastructure
plan: 04
subsystem: infra
tags: [websocket, event-bus, gateway, zod, reconnection, json-rpc, real-time]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Project scaffold with FSD structure, Zod, nanoid, ws dependencies"
provides:
  - "WebSocketManager singleton for raw WebSocket gateway communication"
  - "Typed Event Bus with wildcard matching for pub/sub event routing"
  - "GatewayClient abstraction layer with Zod-validated domain types"
  - "Reconnection strategy with exponential backoff and jitter"
  - "Gateway frame types and Zod parsers (req/res/event discriminated union)"
  - "Dual-mode connection support (local filesystem + WS vs remote WS-only)"
  - "createGatewayStack() factory for one-step initialization"
affects: [01-05, 01-06, 02-01, 02-02, 02-03, 02-04, all-gateway-features]

# Tech tracking
tech-stack:
  added: []
  patterns: [raw-websocket-json-rpc, three-phase-handshake, typed-event-bus-wildcard, zod-transform-adapter, mode-aware-result, exponential-backoff-jitter, pending-request-map]

key-files:
  created: [src/entities/gateway-event/model/types.ts, src/entities/gateway-event/lib/parser.ts, src/entities/gateway-event/index.ts, src/features/gateway-connection/model/types.ts, src/features/gateway-connection/lib/event-bus.ts, src/features/gateway-connection/lib/reconnect.ts, src/features/gateway-connection/lib/ws-manager.ts, src/features/gateway-connection/lib/gateway-client.ts, src/features/gateway-connection/index.ts]
  modified: []

key-decisions:
  - "Connect request registered as pending request to match hello-ok response (three-phase handshake requires request/response tracking)"
  - "Event Bus uses overloaded methods with KnownEvents for type safety while accepting arbitrary string keys for unknown gateway events"
  - "GatewayClient uses Zod .transform() to map gateway snake_case fields to internal camelCase domain types (agent_id -> id, display_name -> name)"
  - "ModeAwareResult<T> discriminated union for operations that degrade in remote mode"
  - "Agent status mapping includes gateway aliases (busy -> working, stopped -> offline) for forward compatibility"

patterns-established:
  - "Gateway communication: all features go through GatewayClient, never raw WebSocket frames"
  - "Event routing: EventBus.emit(event, payload) with wildcard matching (agent.* matches agent.status)"
  - "Domain type validation: Zod schemas with .passthrough() for forward compatibility, .transform() for field mapping"
  - "Reconnection: ReconnectStrategy with configurable exponential backoff, jitter, and max attempts"
  - "Connection lifecycle: disconnected -> connecting -> authenticating -> connected (with reconnecting/failed branches)"

requirements-completed: [INFR-04, INFR-05, INFR-06]

# Metrics
duration: 8min
completed: 2026-02-17
---

# Phase 1 Plan 4: Gateway Connection Layer Summary

**Raw WebSocket Manager with three-phase handshake, typed Event Bus with wildcard routing, GatewayClient abstraction with Zod-validated domain types, and exponential backoff reconnection**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-17T16:21:46Z
- **Completed:** 2026-02-17T16:29:32Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Complete gateway communication stack implementing the OpenClaw raw WebSocket JSON-RPC protocol with three-phase handshake (challenge/connect/hello-ok)
- Typed Event Bus with wildcard matching (agent.* matches agent.status, agent.created, etc.) and cleanup via unsubscribe functions
- GatewayClient provides clean async API (getAgents, getAgent, getHealth, sendMessage, getConfig, getSessions) abstracting raw protocol details
- All gateway data Zod-validated before reaching feature code, with .passthrough() for forward compatibility
- Dual-mode support: local mode gets filesystem operations, remote mode gracefully degrades via ModeAwareResult
- 54 unit tests covering parser validation, event bus dispatch/wildcards, reconnect timing, ws-manager state machine, and gateway client Zod transforms

## Task Commits

Each task was committed atomically:

1. **Task 1: Create gateway event types, Zod parsers, Event Bus, and reconnection strategy** - `3c7680c` (feat)
2. **Task 2: Create WebSocket Manager, Gateway Client, and dual-mode connection support** - `c299505` (feat)

## Files Created/Modified
- `src/entities/gateway-event/model/types.ts` - Gateway frame types (GatewayRequest, GatewayResponse, GatewayEvent, GatewayFrame)
- `src/entities/gateway-event/lib/parser.ts` - Zod schemas and parseGatewayFrame() function with discriminated union validation
- `src/entities/gateway-event/index.ts` - Barrel export for gateway event entity
- `src/features/gateway-connection/model/types.ts` - ConnectionState, ConnectionMode, ConnectionConfig, PendingRequest types
- `src/features/gateway-connection/lib/event-bus.ts` - Typed EventBus class with on/off/emit/once and wildcard support
- `src/features/gateway-connection/lib/reconnect.ts` - ReconnectStrategy with exponential backoff (1s base, 30s cap) and random jitter
- `src/features/gateway-connection/lib/ws-manager.ts` - WebSocketManager handling full gateway protocol lifecycle
- `src/features/gateway-connection/lib/gateway-client.ts` - GatewayClient with Zod-validated domain types and dual-mode support
- `src/features/gateway-connection/index.ts` - Barrel export with createGatewayStack() factory
- `src/entities/gateway-event/__tests__/parser.test.ts` - 10 tests for frame parsing and validation
- `src/features/gateway-connection/__tests__/event-bus.test.ts` - 12 tests for event dispatch, wildcards, once, cleanup
- `src/features/gateway-connection/__tests__/reconnect.test.ts` - 9 tests for backoff timing, jitter, max attempts, reset
- `src/features/gateway-connection/__tests__/ws-manager.test.ts` - 13 tests for state transitions, handshake, request/response
- `src/features/gateway-connection/__tests__/gateway-client.test.ts` - 10 tests for Zod validation, mode-aware results

## Decisions Made
- Connect request registered as a pending request (with its own ID and timeout) so the hello-ok response is properly matched in the response handler -- the three-phase handshake requires this correlation
- EventBus uses TypeScript method overloads: strongly typed for KnownEvents, but accepts arbitrary string keys for unknown/future gateway events
- GatewayClient uses Zod `.transform()` to map gateway snake_case field names to internal camelCase domain types, providing a clean adapter layer
- Agent status mapping includes gateway aliases (busy -> working, stopped -> offline) so the UI handles gateway version differences gracefully
- ModeAwareResult<T> returns `{ available: false, reason: 'remote-mode' }` instead of throwing, letting UI code handle mode differences declaratively

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Connect request not tracked as pending request**
- **Found during:** Task 2 (WebSocketManager implementation)
- **Issue:** The connect request sent in response to connect.challenge was dispatched via sendRaw() without registering a pending request entry. When the hello-ok response arrived, no matching entry existed, so the state never transitioned to 'connected'.
- **Fix:** Generate a nanoid for the connect request, register it in pendingRequests with a timeout, then send via sendRaw(). The existing response handler now matches the hello-ok by ID and transitions state correctly.
- **Files modified:** src/features/gateway-connection/lib/ws-manager.ts
- **Verification:** ws-manager tests pass: "transitions to connected on hello-ok response" now works correctly
- **Committed in:** c299505 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correct three-phase handshake. No scope creep.

## Issues Encountered
- Pre-existing TypeScript errors in src/shared/ui/dropdown-menu.tsx, action-menu.tsx, and error-boundary.tsx due to `exactOptionalPropertyTypes: true` -- these are unrelated to gateway code and were not introduced by this plan. Logged as out-of-scope.

## User Setup Required
None - no external service configuration required. The gateway connection layer is ready to use when a gateway URL and token are provided.

## Next Phase Readiness
- Gateway communication stack is complete and ready for feature consumption
- Features can subscribe to events via EventBus, send requests via GatewayClient
- Connection state management (Zustand store) will be built in Plan 01-05
- Connection status UI widget will be built in later phases
- Note: Pre-existing TypeScript errors in shared UI components should be fixed in their respective plans

## Self-Check: PASSED

All 9 source files and 5 test files verified present. Both task commits verified in git log (3c7680c, c299505). 57 tests passing in full suite.

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-02-17*
