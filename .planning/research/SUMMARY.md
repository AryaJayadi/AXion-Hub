# Project Research Summary

**Project:** AXion Hub
**Domain:** Self-hosted AI Agent Orchestration Dashboard (Mission Control)
**Researched:** 2026-02-17
**Confidence:** MEDIUM (stack HIGH, features/architecture/pitfalls MEDIUM)

## Executive Summary

AXion Hub is a real-time, self-hosted dashboard for managing and directing AI agents — not an agent builder, not just an observer, but a command-and-control interface. The product occupies a genuine gap in the competitive landscape: every existing tool either watches agents (LangSmith, AgentOps), builds agents (Dify, FlowiseAI, n8n), or orchestrates them in code (CrewAI). AXion Hub owns the "operations-first" niche — giving operators a live Mission Control where they can see, direct, govern, and converse with agents across multiple messaging channels from one place. The recommended approach is a Next.js App Router frontend (treated as a client-heavy dashboard, not server-rendered), backed by Socket.IO for real-time communication with the OpenClaw Gateway, Zustand per-feature stores for state, and a feature-sliced architecture with ~10 independently testable feature modules.

The most important architectural decisions must be made in Phase 1 and cannot be changed cheaply later: a WebSocket Manager singleton with a typed Event Bus, a Gateway abstraction layer that insulates all features from raw OpenClaw API changes, audit logging middleware baked into every mutating endpoint, and a shared component library covering tables/forms/status patterns before any page development begins. Skipping any of these in the name of speed creates architectural debt that spans every subsequent phase. The 87-page scope makes this especially costly — inconsistency discovered on page 40 requires retroactive fixes to all 40 previous pages.

The key risks are: (1) WebSocket lifecycle mismanagement causing stale UI state that users cannot trust, (2) chat streaming breaking under real conditions (concurrent agents, tool calls, network interruptions), and (3) building an inconsistent component ecosystem across 87 pages without a shared library foundation. All three are Phase 1 concerns. The product's differentiators — multi-channel management, kanban task assignment for agents, and approval/governance workflows — are technically sound and buildable, but none of them matter if the real-time foundation is unreliable.

---

## Key Findings

### Recommended Stack

The stack is fully specified with npm-verified versions (as of 2026-02-17). Next.js 16 (App Router) + React 19 forms the framework, with Tailwind CSS v4 + shadcn/ui for styling, Drizzle ORM for PostgreSQL access, Socket.IO 4.x for WebSocket communication, and better-auth for self-hosted authentication. The stack is intentionally cohesive: every library choice is optimized for this specific combination. See `.planning/research/STACK.md` for full version table and Docker Compose baseline.

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework — App Router for file-based routing across 87 pages, Server Components for settings/config pages, client components for all real-time views
- **Socket.IO 4.8**: WebSocket infrastructure — built-in reconnection, room-based routing per agent session, Redis adapter for multi-instance scaling
- **Drizzle ORM 0.45 + PostgreSQL 17**: Database layer — type-safe SQL, zero binary runtime (critical for Docker), excellent migration tooling
- **better-auth 1.4**: Authentication — purpose-built for self-hosted, org/team support built in, first-class Next.js integration
- **Zustand 5 + TanStack Query 5**: State split — Zustand for WebSocket-driven live state per feature domain, TanStack Query for REST-fetched historical data with caching
- **@xyflow/react 12**: Workflow builder — open-source, React-native visual node graph (successor to react-flow)
- **BullMQ 5**: Job queue — Redis-backed, handles workflow automation, scheduled tasks, approval pipelines
- **Biome 2**: Single tool replacing ESLint + Prettier — 10-100x faster, less config surface

**What NOT to use:** Prisma (bundles 15MB Rust binary — wrong for Docker-first self-hosted), Redux (redundant when TanStack Query handles server state), CSS-in-JS (conflicts with React Server Components), MongoDB (wrong fit for relational agent/session/approval data), GraphQL (over-engineering for a single-frontend app).

### Expected Features

AXion Hub's feature positioning is clear: own "operations" and let competitors own "building." The competitive moat is multi-channel management (WhatsApp/Telegram/Discord/Slack in one pane), kanban task assignment for agents, and governance/approval workflows — none of which any single competitor addresses well. See `.planning/research/FEATURES.md` for full competitive analysis and dependency graph.

**Must have (table stakes for v1.0 — Operational Core):**
- Auth (login, password reset, session management) — cannot function without it
- Dashboard overview (system health, agent status, error rates, recent activity) — first thing users see
- Agent roster + detail view + configuration editing — the core entity; everything references agents
- Direct chat with streaming responses — primary interaction mode; bar is very high (ChatGPT-equivalent)
- Real-time WebSocket infrastructure — foundational; chat, events, monitoring, and approvals all depend on it
- Activity/event feed — users need to know what is happening right now
- Session browser + conversation transcripts — users need to review what agents said
- Gateway connection status — "is my gateway connected?" must be immediately answerable
- Model/provider configuration — set up which LLMs are available and at what cost
- Basic settings (profile, app config) — minimal but necessary

**Should have (competitive differentiators — v1.x):**
- Multi-channel management (WhatsApp, Telegram, Discord, Slack) — AXion Hub's true moat
- Channel binding editor — map agents to channels visually
- Kanban task board with agent assignment — novel; no competitor has this
- Approval queue + governance — increasingly demanded as agents take real actions
- Agent memory browser — understand and correct what agents remember
- RBAC beyond admin — needed when teams adopt the tool
- Cost tracking dashboard — LLM operators obsess over spend
- Error tracking + alerts — required for production confidence
- Audit log — accountability for governed operations
- Agent identity editor (SOUL.md / IDENTITY.md visual editor) — unique to AXion Hub

**Defer to v2+:**
- Visual workflow builder — Dify/FlowiseAI have massive head starts; compete on management not building
- Policy rules engine — advanced governance; validate basic approval flow first
- Multi-gateway support — enterprise feature; single gateway sufficient for v1
- Semantic memory search — requires vector infrastructure; defer until memory browser is validated
- Skills/plugin marketplace — requires ecosystem maturity
- Multi-agent team chat — single-agent chat must be excellent first
- Cross-channel conversation threading — hard data modeling problem; defer until channels are stable

**Anti-features to explicitly avoid:** Visual drag-and-drop agent builder, built-in LLM prompt IDE, custom model fine-tuning UI, Google Docs-style real-time collaboration, embeddable chat widget for external sites, multi-tenant SaaS mode.

### Architecture Approach

AXion Hub is architecturally a client-heavy dashboard: Next.js App Router provides routing and code-splitting across 87 pages, but the `"use client"` boundary sits high — most dashboard pages are React Client Components because real-time WebSocket state makes server rendering contradictory. The architecture uses a four-layer model: UI Foundation (shadcn/ui + design system), Shared Services (WebSocket Manager singleton + Event Bus + Zustand stores + Auth Guard), Feature Modules (10 independently organized domain modules: Chat, Agents, Tasks, Files, Channels, Monitoring, Audit, Plugins, Approvals, Settings), and the External Boundary (OpenClaw Gateway via WebSocket + REST). See `.planning/research/ARCHITECTURE.md` for full component diagrams, data flow patterns, and code examples.

**Major components:**
1. **WebSocket Manager + Event Bus** — Single persistent connection with typed pub/sub routing; all real-time data flows through here; never multiple connections
2. **Feature Stores (Zustand, per-domain)** — Agent store, Chat store, Task store, etc.; each subscribes to Event Bus and self-hydrates; no god store
3. **Gateway Abstraction Layer (`lib/gateway/GatewayClient`)** — Insulates all features from raw OpenClaw API shape changes; Zod validation on incoming messages; versioned API support
4. **Chat Streaming Infrastructure** — Token buffer in ref + requestAnimationFrame flush; prevents 50-100 setState calls/sec from thrashing React's render cycle
5. **Kanban with Optimistic Updates + Rollback** — Immediate visual feedback with explicit rollback on gateway rejection; three-state mutation pattern (idle/pending/success-or-error)
6. **Route-level code splitting** — Dynamic imports per route; essential for 87-page bundle management

### Critical Pitfalls

Research identified 7 critical pitfalls (architectural dead ends or rewrites) and numerous moderate pitfalls. The top 5 that must be addressed in Phase 1 are:

1. **WebSocket lifecycle mismanagement** — Implement a full connection state machine (CONNECTING / CONNECTED / RECONNECTING / DISCONNECTED / FAILED), exponential backoff with jitter, heartbeat/ping-pong, and post-reconnect state snapshot reconciliation. Missing this makes the entire real-time dashboard unreliable. Address in Phase 1.

2. **Chat streaming breaking under real conditions** — Buffer tokens in a ref, flush on requestAnimationFrame. Design message model for streaming states (streaming / complete / interrupted / error) from day one — retrofitting requires data migration. Scroll anchor pattern to prevent auto-scroll fighting user. Address data model in Phase 1, implementation in Phase 2-3.

3. **87-page component inconsistency without a shared library** — Build DataTable, DetailPanel, StatusBadge, ActionMenu, FormField, SearchInput, FilterBar, PageHeader, EmptyState, ErrorBoundary, and LoadingSkeleton BEFORE any page development. Code review rule: use the library or add to it. Recovery cost is 1-2 weeks per 10 pages. Address in Phase 1.

4. **Audit log as an afterthought** — Implement audit middleware on the API layer from Day 1 (every mutating request auto-captures who/what/when/diff). Append-only storage pattern. Recovery is impossible after the fact — the events are gone. Address in Phase 1.

5. **Gateway coupling creating a house of cards** — Build the `GatewayClient` abstraction layer first. All dashboard code goes through typed methods (`getAgents()`, `startAgent(id)`, etc.); no component touches raw gateway data. Zod validation with defaults for missing fields. Version detection handshake. Address in Phase 1.

---

## Implications for Roadmap

Both the architecture research and pitfalls research converge on the same phase structure. The architecture's build order and the pitfalls' phase-to-pitfall mapping agree on 6 phases with clear dependencies.

### Phase 1: Foundation (Infrastructure Before Features)

**Rationale:** Seven of the identified critical pitfalls must be addressed here — WebSocket state machine, gateway abstraction, shared component library, audit middleware, Docker deployment, auth, and streaming message data model. These cannot be retrofitted cheaply. Everything else depends on getting this right.
**Delivers:** Working login flow, dashboard shell with navigation, gateway connection indicator, shared component library with all base components documented, typed WebSocket infrastructure, audit logging middleware, Docker Compose baseline with health checks.
**Addresses:** Auth (table stakes), gateway connection status (table stakes)
**Avoids:** All 7 critical pitfalls by establishing correct foundations before any feature work begins
**Research flag:** No deeper research needed — patterns are well-established. Validate OpenClaw Gateway's actual WebSocket event format and REST API shape via a spike before finalizing gateway types.
**Time-box:** 3-4 weeks maximum. Include one complete user flow (login → see dashboard shell → see gateway connection status) as architecture proof before proceeding.

### Phase 2: Core Agent Loop (Primary Value Proposition)

**Rationale:** Without this phase, the dashboard has no reason to exist. Agent roster, agent detail, and direct chat are the product's heartbeat. This phase also establishes the streaming chat patterns that every subsequent phase builds on.
**Delivers:** Agent list grid with status indicators, agent detail view (identity, config, sessions, metrics), agent configuration editing, direct chat with streaming responses and tool call visualization, basic real-time activity/event feed.
**Uses:** Socket.IO event routing, Chat streaming infrastructure (token buffer + rAF), Zustand agent store + chat store, TanStack Query for historical data, @tanstack/react-table for agent list, react-markdown + shiki for chat rendering
**Implements:** Agent Module + Chat Module from architecture
**Avoids:** Optimistic UI without rollback (three-state mutation pattern for agent lifecycle), chat streaming pitfalls (token buffer pattern)
**Research flag:** Needs validation of OpenClaw Gateway's chat streaming protocol (message format, tool call delimiters, stream end signaling). Spike against real gateway before building streaming infrastructure.

### Phase 3: Task Management (Directing Agents, Not Just Watching Them)

**Rationale:** The kanban board is AXion Hub's most novel differentiator — no competitor has visual task assignment for AI agents. It depends on agent identity from Phase 2 (you can't assign tasks to agents you don't know). The drag-and-drop optimistic update pattern is established here and reused in channel binding and other interactive features.
**Delivers:** Kanban task board with drag-and-drop columns, task creation and detail panel, task-to-agent assignment, task status transitions, session browser with conversation transcript viewer.
**Uses:** @dnd-kit/core + @dnd-kit/sortable, optimistic update + rollback pattern, Task Store with pending moves map, react-resizable-panels for task detail view
**Implements:** Task/Kanban Module from architecture
**Avoids:** Building a full project management tool (keep focused on agent task orchestration, not human project management); kanban board rendering all cards without virtualization
**Research flag:** Standard drag-and-drop patterns — no additional research needed. Validate task assignment API with OpenClaw Gateway spec.

### Phase 4: Governance and Control (Making It Production-Safe)

**Rationale:** Governance features (approvals, audit log viewer, channel management, RBAC) depend on the agent and task foundation being solid. The approval workflow depends on WebSocket infrastructure from Phase 1 and agent identity from Phase 2. Channel management depends on gateway connectivity. This phase transforms AXion Hub from a development tool into a production-grade command center.
**Delivers:** Approval queue with real-time notifications and approve/reject UI, audit log viewer with filtering and search, channel management UI (WhatsApp/Telegram/Discord/Slack status + binding editor), RBAC UI (admin/member/viewer roles), cost tracking dashboard, error tracking with basic alert rules.
**Uses:** Approval Store + WebSocket approval events, BullMQ for approval pipeline, Recharts for cost charts, better-auth org/team features for RBAC
**Implements:** Approval Module + Audit Module + Channel Module from architecture
**Avoids:** Over-complicating approval workflow (start with simple approve/reject, defer escalation policies and auto-approval rules); trying to abstract all messaging platforms into one leaky model (platform-specific adapters for WhatsApp/Telegram/Discord/Slack)
**Research flag:** Needs research on OpenClaw Gateway's channel API (WhatsApp QR pairing flow, Telegram bot configuration, Discord intent setup). Each platform has unique constraints. Flag for `/gsd:research-phase` during planning.

### Phase 5: Workspace and Extensibility

**Rationale:** File management and plugin/skill browsing are important but not blocking core agent operations. File browser depends on understanding what "agent workspaces" look like in OpenClaw. Plugin management depends on the gateway's skill/plugin API being stable.
**Delivers:** File browser for agent workspaces, file viewer with syntax highlighting, agent identity editor (SOUL.md / IDENTITY.md visual editor), agent memory browser with timeline view, agent templates library, plugin/skill registry browser, @monaco-editor/react for config/script editing.
**Uses:** @monaco-editor/react, agent memory API (TBD via gateway), Plugin Store, File Store
**Implements:** File Module + Plugin/Skill Module from architecture
**Avoids:** Full-featured IDE (Monaco is sufficient for prompt/config editing; link to VS Code for real development); memory browser scope creep (browse and prune first, semantic vector search is v2+)
**Research flag:** Agent memory API format and workspace file structure need validation against OpenClaw Gateway. Flag for `/gsd:research-phase` during planning.

### Phase 6: Polish, Advanced Features, and Developer Experience

**Rationale:** This phase enhances existing features and adds the developer-experience layer. Workflow builder, cron jobs, and webhooks are automation features that only make sense once the core operational layer is proven. Command palette and keyboard shortcuts enhance navigation across 87 pages but don't block core value.
**Delivers:** Visual workflow builder (@xyflow/react node editor with agent action nodes), cron job scheduling, webhook endpoints, interactive API documentation, WebSocket playground, global command palette (Cmd+K with cmdk), keyboard shortcuts for common operations, mobile-responsive refinements, dark/light theme polish, notification preferences system.
**Uses:** @xyflow/react workflow editor, BullMQ for cron jobs, cmdk for command palette, framer-motion for transitions and animations
**Implements:** Workflow Automation layer + developer tooling
**Avoids:** Building a visual agent creator (this is not Dify); building a prompt engineering IDE (this is not LangSmith); natural language agent configuration (unreliable, demo-not-production)
**Research flag:** Workflow builder node types need mapping to OpenClaw's actual agent action primitives. Flag for `/gsd:research-phase` during planning.

### Phase Ordering Rationale

- **Foundation first:** Seven critical pitfalls require Phase 1 fixes. Skipping any of them creates debt that spans the entire codebase. The gateway abstraction layer alone, retrofitted later, touches every component.
- **Agent loop second:** Without seeing and talking to agents, the dashboard has no value. This phase also stress-tests the WebSocket and streaming infrastructure under real-world conditions before those patterns are replicated elsewhere.
- **Task management third:** Kanban requires agent identity and produces the optimistic-update pattern that governance (Phase 4) also needs. Building it before governance means approval gates can be added to kanban in Phase 4 without changing the kanban foundation.
- **Governance fourth:** Approval workflows, channel management, and RBAC require the agent/task foundation to be meaningful. A channel binding editor without a stable agent list is useless.
- **Workspace fifth:** File management and memory browsing are important but not blocking. They depend on understanding what OpenClaw exposes for agent workspaces, which should be clear by Phase 4.
- **Polish last:** Workflow builder and developer tools enhance an already-working product. This order ensures the product ships value early and the complex features are added to a stable foundation.

### Research Flags

**Phases needing `/gsd:research-phase` during roadmap planning:**
- **Phase 2 (Chat/Agent):** OpenClaw Gateway's streaming protocol — exact WebSocket event format, tool call delimiters, stream end signaling, correlation ID pattern. Do a spike before finalizing the chat streaming architecture.
- **Phase 4 (Governance/Channels):** Each messaging platform (WhatsApp/Telegram/Discord/Slack) has unique auth, rate limits, and event models. WhatsApp has 24h session windows. Telegram has bot API rate limits. Discord uses intent-based event filtering. Slack has workspace-level OAuth. These need platform-specific research before building the channel management UI.
- **Phase 5 (Workspace):** Agent memory format, workspace file structure, and plugin/skill API shape need OpenClaw Gateway documentation review. Cannot design the memory browser or file browser without knowing what data the gateway exposes.
- **Phase 6 (Workflows):** Workflow node types must map to OpenClaw's actual agent action primitives. Research what actions agents can take before designing the workflow builder nodes.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** WebSocket state machines, audit middleware, Docker deployment, shared component libraries — all well-documented, established patterns.
- **Phase 3 (Kanban/Tasks):** Drag-and-drop with @dnd-kit + optimistic updates — well-documented, established patterns. Kanban board architecture is solved.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified via npm registry on 2026-02-17. Framework choice rationale is sound. Version compatibility confirmed via peer dependency checks. |
| Features | MEDIUM | Competitive analysis based on training data (cutoff May 2025). Competitor features may have changed. Core positioning (operations-first vs. builder-first) is durable. Re-validate specific competitor features before finalizing roadmap. |
| Architecture | MEDIUM | Patterns (WebSocket singleton, Event Bus, feature-sliced stores, token buffer) are well-established across multiple real-time dashboard projects. Specific Next.js 16 + Socket.IO integration details need validation during Phase 1 spike. |
| Pitfalls | MEDIUM | Pitfall identification is based on established engineering patterns, not AXion Hub-specific experience. Most pitfalls are universal (chat streaming, WebSocket lifecycle, component inconsistency at scale) and highly likely to apply. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **OpenClaw Gateway API contract:** The single biggest unknown. Architecture, data models, and WebSocket event schemas all depend on what OpenClaw actually exposes. Before Phase 2 begins, spike against a real gateway instance and document: REST endpoints, WebSocket event types, streaming protocol, authentication mechanism, and versioning scheme. Make this a Phase 1 deliverable.

- **Tailwind v4 + shadcn/ui v3 compatibility in practice:** Both are major rewrites. The research confirms they claim compatibility, but early Phase 1 work should validate that shadcn component generation, CSS variable theming, and the Tailwind v4 CSS-first configuration work correctly together before building the full component library on top of them.

- **BullMQ sufficiency for complex workflow DAGs:** BullMQ handles job queues excellently. Whether it can express complex conditional workflow DAGs (branch on agent output, retry on specific errors, fan-out to multiple agents) needs validation in Phase 6. If not sufficient, Temporal.io or a custom DAG engine may be needed — but this should not block earlier phases.

- **better-auth org/team feature depth:** The self-hosted claims and org/team support are verified at the npm description level. Validate the actual API surface (org creation, member invitation, role assignment, permission checking middleware) against the better-auth documentation during Phase 1 auth implementation.

- **Competitor feature parity (2026):** Feature research is based on training data through May 2025. Specific competitor features (especially LangSmith and Dify which iterate quickly) may have advanced. Recommend re-validating key differentiator claims before Phase 4 (multi-channel, approval workflows) to ensure AXion Hub is still differentiated.

---

## Sources

### Primary (HIGH confidence)
- **npm registry** (2026-02-17) — All package versions in STACK.md verified via `npm view [package] version` and peer dependency inspection
- **AXion Hub `.planning/PROJECT.md`** — Project goals, scope, feature list, domain context
- **Existing `package.json`** — Confirmed shadcn CLI v3.8.5 as existing dependency

### Secondary (MEDIUM confidence)
- Training data on WebSocket architecture, Socket.IO patterns, real-time dashboard design (through May 2025)
- Training data on LLM streaming patterns (Vercel AI SDK, OpenAI streaming, Anthropic streaming)
- Training data on feature-sliced architecture patterns for large React codebases
- Training data on competitor products: LangSmith, AgentOps, CrewAI, Dify, FlowiseAI, n8n, AutoGen Studio
- Training data on Docker self-hosted deployment, approval workflow systems, audit logging patterns

### Tertiary (LOW confidence — needs live validation)
- Competitor feature claims (LangSmith, Dify, AgentOps) — features may have changed since May 2025 cutoff
- OpenClaw Gateway API shape — assumed JSON/WebSocket but not verified against live documentation
- BullMQ workflow DAG capabilities — needs validation against complex multi-step workflow requirements

---
*Research completed: 2026-02-17*
*Ready for roadmap: yes*
