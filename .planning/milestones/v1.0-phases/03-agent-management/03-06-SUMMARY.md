---
phase: 03-agent-management
plan: 06
subsystem: ui
tags: [agent-skills, agent-tools, agent-sandbox, agent-channels, agent-logs, agent-metrics, recharts, virtual-scrolling, tanstack-query, react-hook-form, shadcn-chart]

# Dependency graph
requires:
  - phase: 03-agent-management/plan-02
    provides: Agent detail nested layout with persistent sidebar, useAgentDetail hook, AgentDetailShell widget
  - phase: 03-agent-management/plan-01
    provides: Agent entity types (AgentSkill, AgentTool, AgentLogEntry, AgentMetrics), Zustand agent store, shadcn UI components
  - phase: 01-foundation-infrastructure
    provides: TanStack Query setup, shared UI (Badge, Card, Switch, Chart, Select, Table), cn utility
provides:
  - Skills sub-page with card grid and enable/disable toggles
  - Tools sub-page with allow/deny lists and expandable elevated access config
  - Sandbox sub-page with react-hook-form inline configuration form
  - Channels sub-page with read-only routing table
  - Logs sub-page with virtual-scrolled activity log, event type filter, expandable details
  - Metrics sub-page with 4 Recharts charts (token usage, cost, tasks, response times)
  - useAgentSkills, useAgentLogs, useAgentMetrics TanStack Query hooks
  - Config schemas (sandboxConfigSchema, toolConfigSchema) with Zod v4
  - All 10 sidebar navigation sub-pages now resolve to working pages
affects: [04-task-management, 07-channel-management]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Skill toggle with optimistic mutation via TanStack Query onMutate/onError rollback", "Virtual scrolling with @tanstack/react-virtual useVirtualizer for log tables", "shadcn Chart (ChartContainer + ChartTooltip) wrapping Recharts AreaChart/BarChart", "Two-column allowed/denied tool layout with expandable config sections", "Time range selector pattern for metrics chart data slicing"]

key-files:
  created:
    - src/features/agents/schemas/config-schemas.ts
    - src/features/agents/api/use-agent-skills.ts
    - src/features/agents/api/use-agent-logs.ts
    - src/features/agents/api/use-agent-metrics.ts
    - src/features/agents/components/agent-skills-grid.tsx
    - src/features/agents/components/agent-tools-config.tsx
    - src/features/agents/components/agent-sandbox-form.tsx
    - src/features/agents/components/agent-channels-table.tsx
    - src/features/agents/components/agent-logs-table.tsx
    - src/features/agents/components/agent-metrics-charts.tsx
    - src/views/agents/agent-skills-view.tsx
    - src/views/agents/agent-tools-view.tsx
    - src/views/agents/agent-sandbox-view.tsx
    - src/views/agents/agent-channels-view.tsx
    - src/views/agents/agent-logs-view.tsx
    - src/views/agents/agent-metrics-view.tsx
    - app/(dashboard)/agents/[agentId]/skills/page.tsx
    - app/(dashboard)/agents/[agentId]/tools/page.tsx
    - app/(dashboard)/agents/[agentId]/sandbox/page.tsx
    - app/(dashboard)/agents/[agentId]/channels/page.tsx
    - app/(dashboard)/agents/[agentId]/logs/page.tsx
    - app/(dashboard)/agents/[agentId]/metrics/page.tsx
  modified:
    - src/features/agents/index.ts
    - src/shared/ui/form-field.tsx

key-decisions:
  - "Skill toggle uses TanStack Query optimistic mutation with onMutate rollback for instant UI feedback"
  - "Tools config uses local state with two-column layout (allowed/denied) rather than drag-and-drop"
  - "Sandbox form uses react-hook-form with zodResolver (as-any cast for Zod v4 exactOptionalPropertyTypes)"
  - "Channel table is read-only with note pointing to future Phase 7 channel management"
  - "Logs virtual scrolling via useVirtualizer with 40px estimated row height and 10-item overscan"
  - "Metrics charts use ChartConfig with CSS variable colors for theme consistency"
  - "FormField error prop updated to accept string | undefined for exactOptionalPropertyTypes compatibility"

patterns-established:
  - "Agent sub-page view pattern: 'use client' component with agentId prop, page header, data hook, loading/error states, feature component"
  - "Agent sub-page route pattern: async server component, await params, generateMetadata, Suspense boundary wrapping view"
  - "Optimistic toggle pattern: useMutation with onMutate/onError/onSuccess for instant UI updates with rollback"
  - "Virtual scrolled table pattern: useVirtualizer + absolute positioned rows with measureElement ref"

requirements-completed: [AGNT-08, AGNT-09, AGNT-10, AGNT-11, AGNT-12, AGNT-13]

# Metrics
duration: 11min
completed: 2026-02-18
---

# Phase 3 Plan 6: Agent Sub-Pages Summary

**Six remaining agent detail sub-pages: skills grid with toggle switches, tool allow/deny config, sandbox Docker form, channel routing table, virtually-scrolled activity logs, and Recharts metrics charts**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-18T04:12:18Z
- **Completed:** 2026-02-18T04:23:47Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- Skills page with card grid displaying 8 mock skills, source badges (built-in/clawhub/custom), and enable/disable Switch toggles with optimistic mutation
- Tools page with two-column allowed/denied layout, expandable elevated access configuration per tool, 10 mock tools
- Sandbox page with react-hook-form inline configuration: sandbox mode toggle, Docker image input, workspace path input with smart defaults
- Channels page with read-only routing table showing 4 mock channel bindings across WhatsApp, Telegram, Discord, and Slack with color-coded type badges
- Logs page with @tanstack/react-virtual virtual scrolling for 50 mock log entries, event type filter dropdown (all/tool_call/message/error/status_change/compaction), expandable JSON detail rows
- Metrics page with 4 shadcn Chart + Recharts charts in 2x2 responsive grid: token usage (AreaChart), cost breakdown (AreaChart), tasks completed (BarChart), response times (AreaChart), with 7/14/30 day time range selector
- All 10 agent detail sidebar navigation links now resolve to working pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Skills, tools, and sandbox sub-pages** - `829fdbd` (feat)
2. **Task 2: Channels, logs, and metrics sub-pages** - `c2f6a7e` (feat)

## Files Created/Modified
- `src/features/agents/schemas/config-schemas.ts` - Zod v4 schemas for sandbox and tool configuration
- `src/features/agents/api/use-agent-skills.ts` - TanStack Query hook with optimistic toggle mutation for skills
- `src/features/agents/api/use-agent-logs.ts` - TanStack Query hook with 50 mock log entries across 5 event types
- `src/features/agents/api/use-agent-metrics.ts` - TanStack Query hook with 14-day mock metrics data
- `src/features/agents/components/agent-skills-grid.tsx` - Card grid with Switch toggles and source badges
- `src/features/agents/components/agent-tools-config.tsx` - Two-column allowed/denied tool layout with expandable elevated config
- `src/features/agents/components/agent-sandbox-form.tsx` - react-hook-form with zodResolver for sandbox settings
- `src/features/agents/components/agent-channels-table.tsx` - Read-only channel routing table with type badges
- `src/features/agents/components/agent-logs-table.tsx` - Virtual-scrolled log table with filter and expandable details
- `src/features/agents/components/agent-metrics-charts.tsx` - 4 Recharts charts with ChartContainer and time range selector
- `src/views/agents/agent-skills-view.tsx` - Skills view with loading skeleton and error state
- `src/views/agents/agent-tools-view.tsx` - Tools view wrapper
- `src/views/agents/agent-sandbox-view.tsx` - Sandbox view wrapper
- `src/views/agents/agent-channels-view.tsx` - Channels view wrapper
- `src/views/agents/agent-logs-view.tsx` - Logs view with loading skeleton and log count
- `src/views/agents/agent-metrics-view.tsx` - Metrics view with loading skeleton and empty state
- `app/(dashboard)/agents/[agentId]/skills/page.tsx` - Route with dynamic metadata
- `app/(dashboard)/agents/[agentId]/tools/page.tsx` - Route with dynamic metadata
- `app/(dashboard)/agents/[agentId]/sandbox/page.tsx` - Route with dynamic metadata
- `app/(dashboard)/agents/[agentId]/channels/page.tsx` - Route with dynamic metadata
- `app/(dashboard)/agents/[agentId]/logs/page.tsx` - Route with dynamic metadata
- `app/(dashboard)/agents/[agentId]/metrics/page.tsx` - Route with dynamic metadata
- `src/features/agents/index.ts` - Updated barrel exports with all new components and hooks
- `src/shared/ui/form-field.tsx` - Fixed error prop type for exactOptionalPropertyTypes

## Decisions Made
- Skill toggle uses TanStack Query optimistic mutation with `onMutate` for instant UI feedback and `onError` rollback for data consistency -- matches the pattern users expect from toggle interactions
- Tools config uses local component state with two-column allowed/denied layout and Switch toggles rather than drag-and-drop -- simpler, more accessible, and consistent with the skills toggle pattern
- Sandbox form uses `zodResolver(sandboxConfigSchema) as any` cast due to Zod v4 input/output type divergence with exactOptionalPropertyTypes -- consistent with wizard step pattern from Plan 03-03
- Channel table is read-only with informational note pointing to future Phase 7 channel management -- avoids scope creep while still showing channel routing data
- Log virtual scrolling uses 40px estimated row height with 10-item overscan for smooth scrolling without rendering all 50+ entries
- Metrics charts use `ChartConfig` objects with CSS variable colors (`var(--primary)`, `var(--secondary)`) for automatic theme consistency, plus explicit HSL values for warning (cost) and success (tasks) charts
- FormField `error` prop updated from `error?: string` to `error?: string | undefined` to accept react-hook-form's `errors.field?.message` which returns `string | undefined`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FormField error prop exactOptionalPropertyTypes incompatibility**
- **Found during:** Task 1 (Sandbox form build verification)
- **Issue:** FormField's `error?: string` prop rejected `errors.image?.message` (type `string | undefined`) under strictest TS settings
- **Fix:** Changed prop type to `error?: string | undefined` in FormFieldProps interface
- **Files modified:** `src/shared/ui/form-field.tsx`
- **Verification:** Build passes, type check clean for all plan files
- **Committed in:** `829fdbd` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix needed for strict TypeScript compatibility. No scope creep.

## Issues Encountered
- Intermittent Turbopack ENOENT race condition (`_buildManifest.js.tmp` / `middleware-manifest.json` not found) requiring multiple build retries with `.next` cache deletion. Same known issue from Plan 03-02. Build passes consistently after clean `.next` removal with brief delay.
- Pre-existing type error in `agent-memory-browser.tsx` (Plan 03-05) detected by `tsc --noEmit` but not blocking Next.js build. Logged to `deferred-items.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 10 agent detail sidebar sub-pages now resolve to working pages (overview, identity, sessions, memory, skills, tools, sandbox, channels, logs, metrics)
- Phase 3 Agent Management is now complete -- all 6 plans executed, all 13 AGNT requirements implemented
- Phase 4 (Task Management) can begin, depending on agent entity types and detail layout established in Phase 3
- Mock data used throughout; gateway client integration deferred to when live gateway is available

## Self-Check: PASSED

- All 16 created source files verified present on disk
- All 6 page routes verified present on disk
- Commit 829fdbd (Task 1) verified in git log
- Commit c2f6a7e (Task 2) verified in git log
- `bun run build` succeeds with all 6 new routes registered

---
*Phase: 03-agent-management*
*Completed: 2026-02-18*
