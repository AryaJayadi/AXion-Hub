---
phase: 07-gateway-channels-models
plan: 01
subsystem: ui
tags: [gateway, channels, models, zod, tanstack-query, entity-types, route-scaffolding]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: shared UI components (Card, StatusBadge, EmptyState, DataTable), query key factory, navigation config
provides:
  - Gateway-config entity types and Zod schemas (GatewayInstance, GatewayHealth, OpenClawConfig)
  - Channel entity types and Zod schemas (Channel, ChannelRouting, PairingState)
  - Model-provider entity types and Zod schemas (ModelProvider, Model, FailoverChain, ModelUsage)
  - Query keys for gateway instances, channels, and models domains
  - Gateway overview page with health display at /gateway
  - Gateway instance card grid at /gateway/instances
  - Gateway instance detail with component health drill-down at /gateway/instances/[instanceId]
  - All 16 Phase 7 route pages scaffolded (no 404s)
  - Models nav item in sidebar
affects: [07-02, 07-03, 07-04, 07-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "HealthDrillDown: Collapsible aggregate status with per-component rows"
    - "InstanceCard: Click-to-navigate card with formatDistanceStrict uptime"
    - "Gateway mock data pattern following useAgents hook convention"

key-files:
  created:
    - src/entities/gateway-config/model/types.ts
    - src/entities/gateway-config/model/schemas.ts
    - src/entities/channel/model/types.ts
    - src/entities/channel/model/schemas.ts
    - src/entities/model-provider/model/types.ts
    - src/entities/model-provider/model/schemas.ts
    - src/features/gateway/api/use-gateway-health.ts
    - src/features/gateway/api/use-gateway-instances.ts
    - src/features/gateway/components/gateway-health-card.tsx
    - src/features/gateway/components/health-drill-down.tsx
    - src/features/gateway/components/instance-card.tsx
    - src/features/gateway/components/instance-detail-panel.tsx
    - src/views/gateway/gateway-overview-view.tsx
    - src/views/gateway/gateway-instances-view.tsx
    - src/views/gateway/gateway-instance-detail-view.tsx
  modified:
    - src/shared/lib/query-keys.ts
    - src/widgets/app-shell/config/navigation.ts

key-decisions:
  - "Gateway health card uses formatDistanceStrict from date-fns for uptime display (30 days, 5 days)"
  - "HealthDrillDown aggregates component statuses: any down = down, any degraded = degraded, else healthy"
  - "InstanceDetailPanel includes mock GatewayNode table with 3 mock nodes (macOS, iOS, Android platforms)"
  - "channels/groups route redirects to /channels via next/navigation redirect -- group settings managed inline per-channel"
  - "Mock instances: Production (healthy, v1.4.2, 6 agents) and Staging (degraded due to Redis, v1.5.0-beta.3, 2 agents)"

patterns-established:
  - "Gateway hook pattern: useGatewayInstances() for list, useGatewayInstance(id) derives single from list via useMemo"
  - "Placeholder route pattern: server component with PageHeader title and 'Coming in plan XX' message"
  - "Health drill-down: Collapsible with aggregate badge trigger and per-component detail rows"

requirements-completed: [GATE-01, GATE-06]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 7 Plan 01: Entity Types, Route Scaffolding, and Gateway Health UI Summary

**Three domain entity type systems (gateway-config, channel, model-provider) with Zod schemas, 16 route pages scaffolded, and gateway overview/instance management UI with component-level health drill-down**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T13:47:33Z
- **Completed:** 2026-02-18T13:53:06Z
- **Tasks:** 2
- **Files modified:** 39

## Accomplishments
- Created three entity type systems with comprehensive Zod v4 schemas: gateway-config (GatewayInstance, GatewayHealth, OpenClawConfig with 9 config sections), channel (Channel, ChannelRouting, PairingState), model-provider (ModelProvider, Model, FailoverChain, ModelUsage)
- Extended query key factory with gateway.instances, channels, and models domains for cache management
- Scaffolded all 16 Phase 7 route pages across /gateway/*, /channels/*, /models/* (including redirect for /channels/groups)
- Built gateway overview page with health status card, summary stats, and quick-link navigation grid
- Built instance management with responsive card grid and click-into-detail navigation showing component-level health drill-down and gateway nodes table

## Task Commits

Each task was committed atomically:

1. **Task 1: Entity types, schemas, query keys, and route scaffolding** - `be57a53` (feat)
2. **Task 2: Gateway overview, health display, and instance management** - `fcdb234` (feat)

## Files Created/Modified
- `src/entities/gateway-config/model/types.ts` - GatewayInstance, GatewayHealth, OpenClawConfig, ConfigDiff types
- `src/entities/gateway-config/model/schemas.ts` - Zod v4 schemas with .passthrough() for all config sections
- `src/entities/gateway-config/index.ts` - Barrel export
- `src/entities/channel/model/types.ts` - Channel, ChannelRouting, PairingState, ChannelGroupSettings types
- `src/entities/channel/model/schemas.ts` - Zod v4 schemas for channel entities
- `src/entities/channel/index.ts` - Barrel export
- `src/entities/model-provider/model/types.ts` - ModelProvider, Model, FailoverChain, ModelUsage types
- `src/entities/model-provider/model/schemas.ts` - Zod v4 schemas for model-provider entities
- `src/entities/model-provider/index.ts` - Barrel export
- `src/shared/lib/query-keys.ts` - Extended with gateway.instances, channels, and models domains
- `src/widgets/app-shell/config/navigation.ts` - Added Models nav item with Brain icon
- `src/features/gateway/api/use-gateway-health.ts` - useGatewayHealth hook with mock data
- `src/features/gateway/api/use-gateway-instances.ts` - useGatewayInstances and useGatewayInstance hooks
- `src/features/gateway/components/gateway-health-card.tsx` - Health status card with version, uptime, components
- `src/features/gateway/components/health-drill-down.tsx` - Expandable per-component health display
- `src/features/gateway/components/instance-card.tsx` - Clickable instance card with status and metrics
- `src/features/gateway/components/instance-detail-panel.tsx` - Full detail with health drill-down and nodes table
- `src/views/gateway/gateway-overview-view.tsx` - Overview page composing health card, stats, quick links
- `src/views/gateway/gateway-instances-view.tsx` - Instance card grid with loading/empty states
- `src/views/gateway/gateway-instance-detail-view.tsx` - Instance detail with breadcrumbs and error states
- `app/(dashboard)/gateway/page.tsx` - Gateway overview route
- `app/(dashboard)/gateway/instances/page.tsx` - Instances list route
- `app/(dashboard)/gateway/instances/[instanceId]/page.tsx` - Instance detail route
- `app/(dashboard)/gateway/config/page.tsx` - Config placeholder
- `app/(dashboard)/gateway/channels/page.tsx` - Gateway channels placeholder
- `app/(dashboard)/gateway/nodes/page.tsx` - Nodes placeholder
- `app/(dashboard)/channels/page.tsx` - Channels placeholder
- `app/(dashboard)/channels/[channel]/page.tsx` - Channel detail placeholder
- `app/(dashboard)/channels/routing/page.tsx` - Routing placeholder
- `app/(dashboard)/channels/groups/page.tsx` - Redirects to /channels
- `app/(dashboard)/channels/pairing/page.tsx` - Pairing placeholder
- `app/(dashboard)/models/page.tsx` - Models placeholder
- `app/(dashboard)/models/[provider]/page.tsx` - Provider detail placeholder
- `app/(dashboard)/models/catalog/page.tsx` - Catalog placeholder
- `app/(dashboard)/models/failover/page.tsx` - Failover placeholder
- `app/(dashboard)/models/usage/page.tsx` - Usage placeholder

## Decisions Made
- Gateway health card uses formatDistanceStrict from date-fns for uptime display consistency
- HealthDrillDown computes aggregate status: any component "down" = down, any "degraded" = degraded, otherwise healthy
- InstanceDetailPanel includes mock GatewayNode table with 3 nodes (macOS, iOS, Android) per plan spec
- channels/groups route uses server-side redirect to /channels since group settings are managed inline per-channel (per user decision)
- Mock instances mirror research: Production (healthy, v1.4.2, 6 agents, 4 components) and Staging (degraded, v1.5.0-beta.3, 2 agents, 3 components with degraded Redis)
- useGatewayInstance(id) derives single instance from useGatewayInstances() list via useMemo (avoids separate query)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Entity types ready for consumption by plans 07-02 through 07-05
- Gateway overview and instance management pages complete
- All Phase 7 routes scaffolded with placeholders preventing 404s
- Query keys extended for future hooks in channel management and model configuration plans

## Self-Check: PASSED

- All 18 key files verified present on disk
- Commits be57a53 and fcdb234 verified in git log
- TypeScript compilation passes with zero errors

---
*Phase: 07-gateway-channels-models*
*Completed: 2026-02-18*
