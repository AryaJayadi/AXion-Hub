# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** A single pane of glass where you can see everything your AI agents are doing, direct their work, and maintain governance.
**Current focus:** Phase 4 - Real-Time Chat

## Current Position

Phase: 4 of 10 (Real-Time Chat)
Plan: 2 of 4 in current phase
Status: In Progress
Last activity: 2026-02-18 -- Completed 04-02 Streaming Chat UI

Progress: [██████░░░░] 35%

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 7min
- Total execution time: 2.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 7 | 55min | 8min |
| 02 | 4 | 13min | 3min |
| 03 | 6 | 51min | 9min |
| 04 | 2 | 14min | 7min |

**Recent Trend:**
- Last 5 plans: 6min, 11min, 11min, 7min, 7min
- Trend: stable

*Updated after each plan completion*
| Phase 02 P02 | 8min | 2 tasks | 16 files |
| Phase 02 P03 | 9 | 2 tasks | 12 files |
| Phase 02 P04 | 2min | 2 tasks | 4 files |
| Phase 03 P01 | 7min | 2 tasks | 25 files |
| Phase 03 P02 | 10min | 2 tasks | 17 files |
| Phase 03 P03 | 8min | 2 tasks | 17 files |
| Phase 03 P04 | 6min | 1 task | 7 files |
| Phase 03 P05 | 11min | 2 tasks | 10 files |
| Phase 03 P06 | 11min | 2 tasks | 24 files |
| Phase 04 P01 | 7min | 2 tasks | 20 files |
| Phase 04 P02 | 7min | 2 tasks | 12 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 10 phases derived from 97 requirements at comprehensive depth
- [Roadmap]: Phases 4-7 can partially parallelize after Phase 3 completes (all depend on agents, not each other)
- [01-01]: Renamed FSD "pages" layer to "views" to avoid Next.js Pages Router detection conflict
- [01-01]: Biome 2 config uses tailwindDirectives for Tailwind v4 CSS parsing; CSS excluded from formatter
- [01-01]: Storybook v10 installed (addon-essentials bundled into core, no separate install needed)
- [01-01]: Zod v4 used via "zod/v4" import path with @t3-oss/env-nextjs
- [01-04]: Connect request registered as pending for hello-ok matching in three-phase handshake
- [01-04]: EventBus uses method overloads for KnownEvents type safety while accepting arbitrary string keys
- [01-04]: GatewayClient uses Zod .transform() adapter pattern to map gateway snake_case to internal camelCase
- [01-04]: ModeAwareResult<T> for dual-mode operations instead of throwing on remote-mode
- [01-02]: Dockerfile uses --no-verify on bun install for cross-platform lockfile integrity; oven/bun:slim for prod runner
- [01-02]: Docker dev mode uses anonymous volumes for /app/node_modules and /app/.next to prevent host overwrite
- [01-02]: Service hostnames in Docker: db for PostgreSQL, redis for Redis; host.docker.internal for gateway
- [01-06]: shadcn/ui generated code needs exactOptionalPropertyTypes fixes (defaults for optional props)
- [01-06]: StatusBadge maps 15 status strings to 6 variants; all optional props need `| undefined` for strict TS
- [01-05]: Zustand for PUSH state (WebSocket events), TanStack Query for PULL state (REST APIs) -- separate concerns
- [01-05]: GatewayProvider uses useRef for stack init; auto-connects gracefully when NEXT_PUBLIC_GATEWAY_URL set
- [01-05]: Query key factory uses hierarchical arrays for precise cache invalidation granularity
- [01-03]: db.ts and redis.ts use process.env directly (not env.ts) to avoid circular dep and allow drizzle-kit CLI usage
- [01-03]: Removed drizzle/meta/ from .gitignore -- migration metadata must be tracked in git
- [01-07]: BullMQ ConnectionOptions type assertion needed due to duplicate ioredis packages under exactOptionalPropertyTypes
- [01-07]: pg and ioredis added to serverExternalPackages for Turbopack compatibility in API routes
- [01-07]: Worker service shares codebase via bind mount but runs workers/index.ts instead of next dev
- [01-07]: Audit pattern: createAuditLog for direct logging, withAudit HOC for automatic route-level auditing
- [02-01]: Auth schema manually written (not CLI-generated) because better-auth CLI requires running database; verified against internal field definitions
- [02-01]: drizzle.config.ts schema glob extended to array pattern to include both schema.ts and auth-schema.ts files
- [02-01]: nodemailer added to serverExternalPackages for Turbopack compatibility
- [02-01]: Auto-create personal org wrapped in try/catch due to potential databaseHooks context issues in some better-auth versions
- [02-01]: Zod v4 API (z.email(), z.literal with error option) used consistent with project convention
- [Phase 02]: Used requestPasswordReset (not forgetPassword) as the correct better-auth client method for password reset requests
- [Phase 02]: Verify email page split into server page + client VerifyEmailContent component for useSearchParams Suspense boundary
- [Phase 02]: [02-03]: sidebar.tsx cn import fixed from @/shared/lib/utils to @/shared/lib/cn for project convention
- [Phase 02]: [02-03]: SidebarInset wraps content area; user data extracted once in server layout and threaded as props to client components
- [02-04]: OrgSwitcher uses deterministic color hash on org id for avatar backgrounds across 8 color options
- [02-04]: Create organization option is a console.log placeholder; full org creation UI deferred beyond Phase 2
- [02-04]: Invite acceptance uses standalone centered Card layout (not auth-layout) since it is a status/action page
- [03-01]: NuqsAdapter added to AppProviders for URL search param state across all dashboard pages
- [03-01]: TanStack Query staleTime set to Infinity to prevent WebSocket/Query desync (per research Pitfall 5)
- [03-01]: Mock data used for agent list until gateway client methods are wired
- [03-01]: Agent status glow uses box-shadow (not border-width) to prevent layout shift
- [03-02]: Agent detail sidebar uses usePathname for active state: exact match for overview, startsWith for sub-pages
- [03-02]: useAgentDetail uses staleTime Infinity and refetchOnWindowFocus false, matching useAgents pattern
- [03-02]: Send Message quick action disabled with tooltip (available after Phase 4)
- [03-02]: Loading skeletons use explicit static components instead of Array.from to satisfy Biome noArrayIndexKey rule
- [03-03]: Zustand persist with sessionStorage for wizard state survival across browser back/forward navigation
- [03-03]: zodResolver requires as-any cast with Zod v4 + exactOptionalPropertyTypes -- consistent pattern across wizard steps
- [03-03]: LucideIcon mapping uses explicit Record<string, LucideIcon> with named imports for strict TS compatibility
- [03-03]: Smart defaults pre-fill model config (claude-sonnet-4, temp 0.7, 4096 tokens) and sandbox (disabled, node:20-slim)
- [03-04]: Identity templates provide 20-40 lines of genuine helpful content per file with guidance HTML comments and section headers
- [03-04]: Editor syncs dark mode via data-color-mode attribute reading next-themes resolvedTheme
- [03-04]: Local state merged with server state for immediate editor responsiveness without waiting for query cache
- [03-04]: Debounced save flushes pending saves when switching files to prevent data loss
- [03-05]: MDEditor onChange uses conditional prop spread for exactOptionalPropertyTypes compatibility
- [03-05]: Sessions status filtering done client-side via useMemo + Select dropdown
- [03-05]: Memory file tree uses categorized sections (Persistent Memory / Daily Memory) per CONTEXT.md discretion
- [03-05]: MEMORY.md auto-save debounce at 500ms with visual Saving.../Saved indicators
- [03-06]: Skill toggle uses TanStack Query optimistic mutation with onMutate rollback for instant UI feedback
- [03-06]: Tools config uses local state with two-column allowed/denied layout (not drag-and-drop) for accessibility
- [03-06]: Channel table is read-only with note pointing to future Phase 7 channel management
- [03-06]: Logs virtual scrolling via useVirtualizer with 40px estimated row height and 10-item overscan
- [03-06]: Metrics charts use ChartConfig with CSS variable colors for theme consistency
- [03-06]: FormField error prop updated to string | undefined for exactOptionalPropertyTypes compatibility
- [04-01]: react-resizable-panels v4 uses orientation prop (not direction) and Panel has no order prop
- [04-01]: Hybrid conversation sidebar: pinned section, rooms section, direct section (per research discretion)
- [04-01]: StreamingLane keyed by conversationId:agentId for multi-agent parallel streaming
- [04-01]: Participant panel shows agentId as fallback name until wired to agent store
- [04-02]: Streamdown loaded via next/dynamic with ssr:false to avoid SSR issues with shiki
- [04-02]: Code plugin uses conditional spread for exactOptionalPropertyTypes: `{...(codePlugin ? { plugins: { code: codePlugin } } : {})}`
- [04-02]: Sticky-bottom auto-scroll uses 50px threshold with "New messages" button when scrolled up
- [04-02]: EventBus subscriptions use simplified sessionId:agent laneKey for 1:1 chats; multi-agent rooms use explicit agentId
- [04-02]: Optimistic user messages added to store before gateway roundtrip; errors logged but don't roll back

### Pending Todos

None yet.

### Blockers/Concerns

- OpenClaw Gateway API contract modeled in 01-04 based on protocol docs; full event catalog needs validation against a live gateway
- Tailwind v4 + shadcn/ui v3 compatibility validated in 01-01 -- works with CSS-first config and @theme inline

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 04-02-PLAN.md
Resume file: .planning/phases/04-real-time-chat/04-02-SUMMARY.md
