---
phase: 07-gateway-channels-models
plan: 05
subsystem: ui
tags: [models, providers, failover, usage, dnd-kit, recharts, nuqs, zod, tanstack-query]

# Dependency graph
requires:
  - phase: 07-gateway-channels-models
    provides: Model-provider entity types, Zod schemas, query keys for models domain, route page scaffolding at /models/*
  - phase: 05-dashboard-monitoring
    provides: CostSummaryWidget pattern with Recharts BarChart and NumberFlow animated values
provides:
  - Provider overview page at /models with 4 mock providers (Anthropic, OpenAI, Google, Ollama) with expandable model lists
  - Per-provider configuration at /models/[provider] with API key masking, Test Connection button, and save
  - Model catalog at /models/catalog organized by provider with search filter and expandable sections
  - Failover chain builder at /models/failover with drag-and-drop reordering via @dnd-kit/sortable
  - Multi-dimension usage/cost tracking at /models/usage with provider/model/agent toggles and period selection
  - Model feature schemas (providerConfigSchema, failoverChainFormSchema) for form validation
  - ToggleGroup shadcn component installed for reuse
affects: []

# Tech tracking
tech-stack:
  added: [toggle-group (shadcn)]
  patterns:
    - "Provider mock data pattern: 4 providers with realistic model specs, pricing, and capabilities"
    - "Test Connection mutation: simulate latency, return success/failure with latency metric"
    - "Failover chain builder: DndContext + SortableContext with verticalListSortingStrategy for reorderable lists"
    - "Usage dimension toggle: nuqs useQueryState with parseAsStringLiteral for URL-persisted enum state"
    - "Seeded pseudo-random generator for deterministic mock usage data across dimensions and periods"

key-files:
  created:
    - src/features/models/schemas/model-schemas.ts
    - src/features/models/api/use-providers.ts
    - src/features/models/api/use-model-catalog.ts
    - src/features/models/api/use-failover-chains.ts
    - src/features/models/api/use-model-usage.ts
    - src/features/models/components/provider-card.tsx
    - src/features/models/components/provider-config-form.tsx
    - src/features/models/components/model-catalog-browser.tsx
    - src/features/models/components/failover-chain-builder.tsx
    - src/features/models/components/failover-chain-item.tsx
    - src/features/models/components/usage-charts.tsx
    - src/features/models/components/usage-dimension-toggle.tsx
    - src/views/models/models-overview-view.tsx
    - src/views/models/provider-detail-view.tsx
    - src/views/models/model-catalog-view.tsx
    - src/views/models/failover-view.tsx
    - src/views/models/usage-view.tsx
    - src/shared/ui/toggle.tsx
    - src/shared/ui/toggle-group.tsx
  modified:
    - app/(dashboard)/models/page.tsx
    - app/(dashboard)/models/[provider]/page.tsx
    - app/(dashboard)/models/catalog/page.tsx
    - app/(dashboard)/models/failover/page.tsx
    - app/(dashboard)/models/usage/page.tsx

key-decisions:
  - "zodResolver uses as-any cast for Zod v4 + exactOptionalPropertyTypes compatibility (consistent with wizard steps)"
  - "Provider config form uses conditional spread for exactOptionalPropertyTypes on optional mutation fields"
  - "Failover chain builder uses local state copy of server chains for optimistic editing before save"
  - "Usage mock data uses seeded pseudo-random for deterministic output across dimension/period combos"
  - "ChartConfig color assignment guards against undefined with explicit null check for exactOptionalPropertyTypes"
  - "Area chart data uses Record<string, string | number> to allow mixed date string and numeric token columns"

patterns-established:
  - "Provider hook pattern: useProviders() for list, useProvider(slug) derives single via useMemo (mirroring useGatewayInstance pattern)"
  - "Test Connection pattern: mutation with success/failure/latency result, toast feedback for both outcomes"
  - "Failover chain builder: local state + save button pattern for complex multi-step editing before committing"
  - "Usage dimension toggle: nuqs parseAsStringLiteral with exported useUsageFilters hook for sharing state between toggle and chart"

requirements-completed: [MODL-01, MODL-02, MODL-03, MODL-04, MODL-05]

# Metrics
duration: 8min
completed: 2026-02-18
---

# Phase 7 Plan 05: Model Provider Management, Failover Chains, and Usage Tracking Summary

**Full model provider management with 4 providers, per-provider config with Test Connection, model catalog with search, drag-and-drop failover chain builder, and multi-dimension usage/cost charts with URL-persisted toggles**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-18T13:56:40Z
- **Completed:** 2026-02-18T14:04:59Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- Built provider overview at /models with 4 mock providers (Anthropic, OpenAI, Google, Ollama) displaying status badges, model counts, expandable model lists, and configure links
- Built per-provider configuration at /models/[provider] with API key masking, show/hide toggle, Test Connection button with latency feedback, and save form using react-hook-form + Zod validation
- Built model catalog at /models/catalog organized by provider with Collapsible expandable sections, search filtering across all providers, and capability badges per model
- Built failover chain builder at /models/failover with DndContext + SortableContext drag-and-drop reordering, inline editing for retries/timeout, Add Model popover grouped by provider, chain CRUD with confirmation dialog, and minimum 1 model validation
- Built usage/cost tracking at /models/usage with multi-dimension toggle (provider/model/agent), period toggle (today/week/month) persisted via nuqs URL state, Recharts AreaChart for usage over time, BarChart for cost breakdown, and DataTable for detailed summary

## Task Commits

Each task was committed atomically:

1. **Task 1: Provider overview, per-provider config, and model catalog** - `840a255` (feat)
2. **Task 2: Failover chain builder and usage/cost tracking charts** - `ff68e40` (feat)

## Files Created/Modified
- `src/features/models/schemas/model-schemas.ts` - providerConfigSchema and failoverChainFormSchema for form validation
- `src/features/models/api/use-providers.ts` - useProviders, useProvider, useUpdateProvider, useTestConnection hooks with 4 mock providers
- `src/features/models/api/use-model-catalog.ts` - useModelCatalog hook flattening all models with provider info
- `src/features/models/api/use-failover-chains.ts` - useFailoverChains, useCreateFailoverChain, useUpdateFailoverChain, useDeleteFailoverChain hooks
- `src/features/models/api/use-model-usage.ts` - useModelUsage hook with seeded random data generator for 3 dimensions and 3 periods
- `src/features/models/components/provider-card.tsx` - Provider card with status, model count, expandable model list, configure link
- `src/features/models/components/provider-config-form.tsx` - Config form with API key masking, Test Connection, save
- `src/features/models/components/model-catalog-browser.tsx` - Catalog browser with search, per-provider Collapsible sections, capability badges
- `src/features/models/components/failover-chain-builder.tsx` - Full chain management with DndContext, chain CRUD, Add Model popover, validation
- `src/features/models/components/failover-chain-item.tsx` - Sortable chain item with drag handle, inline edit, remove
- `src/features/models/components/usage-charts.tsx` - AreaChart for usage over time, BarChart for cost breakdown, DataTable for details
- `src/features/models/components/usage-dimension-toggle.tsx` - ToggleGroup for dimension and period with nuqs URL persistence
- `src/views/models/models-overview-view.tsx` - Provider grid with sub-nav pills (Catalog, Failover, Usage)
- `src/views/models/provider-detail-view.tsx` - Provider detail with config form and model table
- `src/views/models/model-catalog-view.tsx` - Catalog page composing ModelCatalogBrowser
- `src/views/models/failover-view.tsx` - Failover page composing FailoverChainBuilder
- `src/views/models/usage-view.tsx` - Usage page composing dimension toggle and charts
- `app/(dashboard)/models/page.tsx` - Renders ModelsOverviewView
- `app/(dashboard)/models/[provider]/page.tsx` - Renders ProviderDetailView with slug param
- `app/(dashboard)/models/catalog/page.tsx` - Renders ModelCatalogView
- `app/(dashboard)/models/failover/page.tsx` - Renders FailoverView
- `app/(dashboard)/models/usage/page.tsx` - Renders UsageView
- `src/shared/ui/toggle.tsx` - shadcn Toggle component
- `src/shared/ui/toggle-group.tsx` - shadcn ToggleGroup component

## Decisions Made
- zodResolver uses `as any` cast for Zod v4 + exactOptionalPropertyTypes (consistent with all wizard step forms in Phase 3)
- Provider config form uses conditional spread for optional fields to satisfy exactOptionalPropertyTypes on mutation params
- Failover chain builder maintains local state copy of server chains, only committing on explicit "Save Chain" button click
- Usage mock data uses seeded pseudo-random (seed derived from dimension + period char codes) for deterministic output
- ChartConfig color assignment uses explicit null guard for array access to avoid undefined color values under exactOptionalPropertyTypes
- Area chart data typed as `Record<string, string | number>` to handle mixed date strings and numeric token columns in the same row object

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 Model provider management pages complete: overview, provider detail, catalog, failover, usage
- Phase 7 (Gateway, Channels & Models) model provider subsystem fully implemented
- ToggleGroup shadcn component available for reuse in future phases
- Usage dimension toggle pattern with nuqs available as reference for similar filter UIs

## Self-Check: PASSED

- All 19 key files verified present on disk
- Commits 840a255 and ff68e40 verified in git log
- TypeScript compilation passes with zero new errors

---
*Phase: 07-gateway-channels-models*
*Completed: 2026-02-18*
