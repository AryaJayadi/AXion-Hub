# Roadmap: AXion Hub

## Overview

AXion Hub transforms from an empty Next.js project into a comprehensive AI agent mission control dashboard across 10 phases. The journey starts with infrastructure and authentication (the foundation everything else sits on), then builds the core agent management and real-time chat loop (the product's heartbeat), layers on task orchestration and gateway/channel management (directing and connecting agents), adds governance and monitoring (making it production-safe), extends with workspace and extensibility features (files, skills, plugins), delivers workflow automation (the capstone feature), and finishes with settings, public pages, and developer tools. Every phase delivers a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Infrastructure** - Project scaffolding, Docker, database, WebSocket manager, gateway abstraction, shared component library, and architectural foundations
- [x] **Phase 2: Authentication & App Shell** - User accounts, login/register flows, session management, dashboard shell with navigation, and gateway status indicator (completed 2026-02-18)
- [ ] **Phase 3: Agent Management** - Agent roster, detail views, identity editing, session browsing, memory viewer, skills, tools, sandbox config, channel routing, logs, and metrics
- [ ] **Phase 4: Real-Time Chat** - Multi-pane chat hub, streaming agent conversations, tool call visualization, media support, session switching, quick commands, and message search
- [x] **Phase 5: Dashboard & Monitoring** - Command center dashboard with live widgets, activity feed, health monitoring, alerts, and real-time event streaming (completed 2026-02-18)
- [x] **Phase 6: Mission Board** - Kanban task management with drag-and-drop, task detail, agent assignment, deliverables, sign-off gates, comments, board organization, and board settings (completed 2026-02-18)
- [x] **Phase 7: Gateway, Channels & Models** - Gateway config editor, channel management, channel pairing, routing/bindings, model provider config, failover chains, and usage/cost tracking (completed 2026-02-18)
- [ ] **Phase 8: Sessions, Memory, Files & Governance** - Session browser, transcript viewer, memory explorer, semantic search, file browser, workspace editor, deliverables, approval queue, audit log, and governance policies
- [ ] **Phase 9: Skills, Plugins & Workflows** - Skills library, ClawHub browser, plugin management, visual workflow builder, cron jobs, and webhooks
- [ ] **Phase 10: Settings, Public Pages & Developer Tools** - All settings pages, landing page, features, pricing, docs, changelog, blog, API reference, and WebSocket playground

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: All architectural foundations are in place so that every subsequent phase builds on solid, consistent infrastructure rather than accumulating technical debt across 87 pages
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, INFR-06, INFR-07, INFR-08, INFR-09, INFR-10, INFR-11
**Success Criteria** (what must be TRUE):
  1. Running `docker compose up` starts AXion Hub, PostgreSQL, and Redis containers with health checks passing
  2. The shared component library renders DataTable, StatusBadge, FormField, PageHeader, EmptyState, and LoadingSkeleton components in a Storybook or test page
  3. The WebSocket Manager connects to an OpenClaw Gateway instance, maintains connection state (connecting/connected/reconnecting/disconnected), and dispatches typed events through the Event Bus
  4. Database migrations run on startup and Drizzle ORM can read/write to PostgreSQL
  5. A test mutating API endpoint produces an audit log entry in the database
**Plans**: 7 plans in 4 waves

Plans:
- [ ] 01-01-PLAN.md -- Next.js 16 scaffolding, Tailwind v4 OKLCH theme, shadcn/ui, Biome, Vitest, Storybook, FSD directory structure (Wave 1)
- [ ] 01-02-PLAN.md -- Docker Compose with PostgreSQL, Redis, multi-stage Dockerfile, dev/prod configs (Wave 2)
- [ ] 01-03-PLAN.md -- Drizzle ORM, PostgreSQL connection pool, Redis client, audit schema, migrations (Wave 3)
- [ ] 01-04-PLAN.md -- WebSocket Manager (raw WS, NOT Socket.IO), Event Bus, Gateway Client abstraction, dual-mode connection (Wave 2)
- [ ] 01-05-PLAN.md -- Zustand connection store, TanStack Query setup, gateway provider, state management patterns (Wave 3)
- [ ] 01-06-PLAN.md -- Shared UI component library: DataTable, StatusBadge, FormField, PageHeader, EmptyState, LoadingSkeleton, ActionMenu, FilterBar, ErrorBoundary, SearchInput (Wave 2)
- [ ] 01-07-PLAN.md -- Audit logging middleware, BullMQ job queue, audit worker, health endpoint (Wave 4)

### Phase 2: Authentication & App Shell
**Goal**: Users can securely access their accounts and see the authenticated application shell with navigation across all major sections
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. User can create an account at /register, log in at /login with email/password, and stay logged in across browser refreshes
  2. User can log in via Google or GitHub OAuth and land in the authenticated app
  3. User can reset a forgotten password via email link at /forgot-password
  4. User can accept an organization invitation via /invite/[token] and join the org
  5. Unauthenticated users are redirected to /login; authenticated users see the full app shell with sidebar navigation
**Plans**: 4 plans in 3 waves

Plans:
- [ ] 02-01-PLAN.md -- better-auth server config, Drizzle auth schema, API route, email utility, auth client, proxy.ts, validation schemas (Wave 1)
- [ ] 02-02-PLAN.md -- Auth pages: login, register, forgot-password, reset-password, verify-email with split-screen layout (Wave 2)
- [ ] 02-03-PLAN.md -- App shell: collapsible sidebar, header bar with breadcrumbs, user menu, dashboard layout with session validation (Wave 2)
- [ ] 02-04-PLAN.md -- Organization invitation acceptance flow and org switcher in sidebar (Wave 3)

### Phase 3: Agent Management
**Goal**: Users can see, create, configure, and deeply inspect every aspect of their AI agents from a single management interface
**Depends on**: Phase 2
**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, AGNT-07, AGNT-08, AGNT-09, AGNT-10, AGNT-11, AGNT-12, AGNT-13
**Success Criteria** (what must be TRUE):
  1. User can view all agents in a grid/list at /agents with live status badges showing online, idle, working, or error states
  2. User can create a new agent at /agents/new (or from a template at /agents/templates) and it appears in the roster
  3. User can edit an agent's identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md) with a Markdown editor at /agents/[agentId]/identity
  4. User can navigate every agent sub-page (sessions, memory, skills, tools, sandbox, channels, logs, metrics) and see relevant data populated from the gateway
  5. Agent detail at /agents/[agentId] shows current status, model, context usage, uptime, and current task in a unified overview
**Plans**: 6 plans in 3 waves

Plans:
- [ ] 03-01-PLAN.md -- Agent entity model, Zustand store, TanStack Query hooks, and roster page with card grid, status glow, search/filter (Wave 1)
- [ ] 03-02-PLAN.md -- Agent detail layout with persistent sidebar navigation and overview dashboard page (Wave 2)
- [ ] 03-03-PLAN.md -- Multi-step agent creation wizard and template gallery (Wave 2)
- [ ] 03-04-PLAN.md -- Identity editor with split-pane Markdown, file sidebar, and auto-save (Wave 3)
- [ ] 03-05-PLAN.md -- Agent sessions data table and memory browser/editor (Wave 3)
- [ ] 03-06-PLAN.md -- Skills, tools, sandbox, channels, logs, and metrics sub-pages (Wave 3)

### Phase 4: Real-Time Chat
**Goal**: Users can converse with any agent in real time with streaming responses, see tool calls as they happen, and manage multiple concurrent conversations
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08
**Success Criteria** (what must be TRUE):
  1. User can open /chat and see all agent conversations in a multi-pane layout, then click into any conversation
  2. User can send a message to an agent at /chat/[agentId] and see the response stream in token-by-token in real time
  3. Tool calls appear as expandable blocks showing tool name, arguments, and output inline with the conversation
  4. User can switch sessions, send images/documents, use quick commands (/new, /compact, /status, /reset), and search messages across conversations
  5. User can observe agent-to-agent conversations in read-only mode at /chat/team/[conversationId]
**Plans**: 4 plans in 3 waves

Plans:
- [ ] 04-01-PLAN.md -- Chat entity types, Zustand chat store, resizable three-panel layout, conversation sidebar, participant panel, route pages (Wave 1)
- [ ] 04-02-PLAN.md -- Token buffer with rAF flush, Streamdown markdown rendering, message list, streaming lanes, chat input, EventBus wiring (Wave 2)
- [ ] 04-03-PLAN.md -- Tool call collapsible pipeline visualization, tool output side panel, media upload/preview (drag-and-drop, paste, file picker) (Wave 2)
- [ ] 04-04-PLAN.md -- Slash command popover, Cmd+K command palette, agent picker dialog, message search with scope toggle, team chat observer with interjection (Wave 3)

### Phase 5: Dashboard & Monitoring
**Goal**: Users have a command center that shows the real-time health of their entire agent ecosystem at a glance, with proactive alerts when things go wrong
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, MNTR-01, MNTR-02, MNTR-03, MNTR-04
**Success Criteria** (what must be TRUE):
  1. The /dashboard page shows gateway connection status (connected/disconnected/degraded), active agent count with health badges, and tasks in flight by status
  2. Context window usage gauges and model/token cost summaries update in real time as agents work
  3. A live activity feed streams the last 20 events via WebSocket, and quick action buttons (New Task, New Agent, Send Message) work
  4. User can view a real-time event stream at /activity and search/filter historical activity at /activity/history
  5. User can view system health at /monitor and configure alert rules at /monitor/alerts that trigger notifications
**Plans**: 6 plans in 5 waves

Plans:
- [ ] 05-01-PLAN.md -- Foundation: install deps, dashboard-event entity, Zustand stores, query keys, BentoGrid widget (Wave 1)
- [ ] 05-02-PLAN.md -- Dashboard stat widgets: gateway status, agent counts, task summary, context gauges, cost charts, degraded banner, dashboard page (Wave 2)
- [ ] 05-03-PLAN.md -- Activity feed widget with scroll-aware auto-scroll and quick actions (Wave 2)
- [ ] 05-04-PLAN.md -- Activity pages (/activity, /activity/history) and health monitor (/monitor) with React Flow dependency map (Wave 3)
- [ ] 05-05-PLAN.md -- Alert system: DB schema, BullMQ worker, template presets, rule management UI, notification bell (Wave 4)
- [ ] 05-06-PLAN.md -- Gap closure: Wire store subscriptions in GatewayProvider for real-time data flow (Wave 5)

### Phase 6: Mission Board
**Goal**: Users can visually manage and assign tasks to agents using a Kanban board, track deliverables, enforce sign-off gates, and organize work across multiple boards
**Depends on**: Phase 3
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06, TASK-07, TASK-08, TASK-09
**Success Criteria** (what must be TRUE):
  1. User can view tasks on a drag-and-drop Kanban board at /missions with columns INBOX through ARCHIVED, and dragging a card moves it with optimistic UI update
  2. User can create a task at /missions/new with all fields (title, description, priority, assigned agents, reviewer, skills/tags, subtasks) and it appears on the board
  3. Task detail at /missions/[taskId] shows activity timeline, dispatch log, deliverables with preview, and a working sign-off gate toggle
  4. User can comment on tasks with @agent and @human mentions that trigger notifications
  5. User can organize boards by project at /missions/boards and configure custom columns and automation rules at board settings
**Plans**: 4 plans in 3 waves

Plans:
- [ ] 06-01-PLAN.md -- Mission entity types, dnd-kit Kanban board with drag-and-drop, board/task Zustand stores with immer, EventBus subscriptions (Wave 1)
- [ ] 06-02-PLAN.md -- Task creation dialog/form, task detail slide-over panel, full detail page at /missions/[taskId] (Wave 2)
- [ ] 06-03-PLAN.md -- Activity timeline with expandable agent detail, dispatch log, deliverables preview, sign-off gate review modal (Wave 3)
- [ ] 06-04-PLAN.md -- Task comments with @mention popover, board organization at /missions/boards, board settings with custom columns and automation rules (Wave 3)

### Phase 7: Gateway, Channels & Models
**Goal**: Users can fully manage their gateway configuration, connect and route messaging channels, and configure LLM providers with failover and cost tracking
**Depends on**: Phase 3
**Requirements**: GATE-01, GATE-02, GATE-03, GATE-04, GATE-05, GATE-06, CHAN-01, CHAN-02, CHAN-03, CHAN-04, CHAN-05, MODL-01, MODL-02, MODL-03, MODL-04, MODL-05
**Success Criteria** (what must be TRUE):
  1. User can view gateway health at /gateway and edit openclaw.json configuration with both a form editor and raw JSON toggle at /gateway/config covering all config sections
  2. User can view connected channels at /gateway/channels, manage nodes at /gateway/nodes, and manage multiple gateway instances at /gateway/instances
  3. User can view all channels at /channels, configure individual channels at /channels/[channel], and edit channel-to-agent routing at /channels/routing
  4. User can pair new channels via QR code or pairing flow at /channels/pairing and manage group settings at /channels/groups
  5. User can view providers at /models, configure per-provider settings, browse the model catalog, set up failover chains, and view usage/cost charts
**Plans**: 5 plans in 3 waves

Plans:
- [ ] 07-01-PLAN.md -- Entity types (gateway-config, channel, model-provider), Zod schemas, query key extensions, all route scaffolding, gateway overview with health display, multi-instance management (Wave 1)
- [ ] 07-02-PLAN.md -- Visual gateway config editor with tabbed form sections, raw JSON toggle, draft-then-apply with diff review, validation panel (Wave 2)
- [ ] 07-03-PLAN.md -- Channel list, channel detail with inline group settings, channel-to-agent routing editor with table/graph toggle, gateway channels view (Wave 2)
- [ ] 07-04-PLAN.md -- Channel pairing wizard (WhatsApp QR, Telegram/Discord tokens, Slack OAuth), gateway nodes management page (Wave 3)
- [ ] 07-05-PLAN.md -- Model provider overview, per-provider config with Test Connection, model catalog, failover chain builder with drag-and-drop, usage/cost charts (Wave 2)

### Phase 8: Sessions, Memory, Files & Governance
**Goal**: Users can review agent session histories, browse and search memories, manage workspace files, and enforce governance through approvals and audit trails
**Depends on**: Phase 6
**Requirements**: SESS-01, SESS-02, SESS-03, MEMO-01, MEMO-02, FILE-01, FILE-02, FILE-03, FILE-04, GOVR-01, GOVR-02, GOVR-03, GOVR-04
**Success Criteria** (what must be TRUE):
  1. User can browse all sessions at /sessions, view session detail with token usage at /sessions/[sessionId], and read JSONL transcripts with message tree at /sessions/[sessionId]/transcript
  2. User can browse memories at /memory and perform semantic search across all agent memories at /memory/search
  3. User can browse agent workspace files at /workspace, view/edit files at /workspace/[agentId]/[...path], view deliverables at /deliverables, and upload files at /workspace/upload
  4. User can view tasks awaiting sign-off at /approvals, approve/reject/request revision at /approvals/[taskId], and the approval status updates in real time
  5. User can view the immutable audit log at /audit with filtering and define governance policies (auto-approval rules, escalation rules, tool restrictions) at /governance/policies
**Plans**: 6 plans in 1 wave

Plans:
- [ ] 08-01-PLAN.md -- Session entity types, cross-agent session list with group toggle, session detail with token usage, JSONL transcript viewer with flat/tree toggle and tool call blocks (Wave 1)
- [ ] 08-02-PLAN.md -- Memory entity types, agent-first memory browser with collapsible sections, semantic memory search with card grid results (Wave 1)
- [ ] 08-03-PLAN.md -- Workspace entity types, CodeMirror install, recursive file tree sidebar, code editor with language detection, file viewer routing (Wave 1)
- [ ] 08-04-PLAN.md -- Deliverables table grouped by task with filtering, drag-and-drop file upload with target selector (Wave 1)
- [ ] 08-05-PLAN.md -- Approval entity types, inbox-style approval queue, approval detail with approve/reject/revision actions (Wave 1)
- [ ] 08-06-PLAN.md -- Audit log viewer with compact expandable entries and filtering, governance policy condition builder with IF/THEN rules (Wave 1)

### Phase 9: Skills, Plugins & Workflows
**Goal**: Users can manage agent skills and plugins from a central library, and build visual multi-step automation workflows with scheduling and webhook triggers
**Depends on**: Phase 7
**Requirements**: SKIL-01, SKIL-02, SKIL-03, SKIL-04, SKIL-05, WORK-01, WORK-02, WORK-03, WORK-04, WORK-05
**Success Criteria** (what must be TRUE):
  1. User can view installed skills at /skills, browse ClawHub registry at /skills/clawhub, and view/configure individual skills at /skills/[skillId]
  2. User can view installed plugins at /plugins and install new plugins from npm or the plugin browser at /plugins/install
  3. User can view saved workflows at /workflows and build new workflows with a visual node editor at /workflows/new
  4. User can view, edit, and run a workflow at /workflows/[workflowId] and see execution results
  5. User can schedule recurring tasks via cron jobs at /workflows/cron and create inbound webhook endpoints at /workflows/webhooks
**Plans**: 5 plans in 2 waves

Plans:
- [ ] 09-01-PLAN.md -- Skills library with category card grid, ClawHub marketplace browser, skill detail with JSON+form hybrid config editor (Wave 1)
- [ ] 09-02-PLAN.md -- Plugin management DataTable, visual plugin browser with install progress, plugin detail with settings/agents/docs/history tabs (Wave 1)
- [ ] 09-03-PLAN.md -- Workflow list card grid, interactive @xyflow/react canvas with 12 custom node types, drag-from-sidebar palette, right sidebar config panel (Wave 1)
- [ ] 09-04-PLAN.md -- Workflow detail/edit/run page with canvas loading, live execution overlay with colored node borders, past run results page (Wave 2)
- [ ] 09-05-PLAN.md -- Cron schedule management with hybrid visual/raw cron builder, webhook endpoint management with URL generation and create dialog (Wave 2)

### Phase 10: Settings, Public Pages & Developer Tools
**Goal**: Users can configure every aspect of their AXion Hub instance, visitors can learn about the product from public pages, and developers can explore the API
**Depends on**: Phase 2
**Requirements**: SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06, SETT-07, SETT-08, SETT-09, SETT-10, SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, ADEV-01, ADEV-02
**Success Criteria** (what must be TRUE):
  1. User can configure general settings, profile, security (password, 2FA), and notification preferences from the /settings pages
  2. User can manage team members, roles, invitations, and API keys at their respective settings pages
  3. User can connect integrations, export/backup data, and access the danger zone (delete workspace, reset data) at their respective settings pages
  4. Visitors can view the landing page, features, pricing, docs, changelog, and blog without authentication
  5. Developers can browse interactive API documentation at /api-docs and test WebSocket commands live at /api-docs/ws
**Plans**: 6 plans in 2 waves

NOTE: SITE-01 through SITE-06 (public marketing pages) are DROPPED per CONTEXT.md — AXion Hub is an internal tool. Success criterion #4 is N/A.

Plans:
- [ ] 10-01-PLAN.md -- Settings layout, sidebar, auth plugin extensions (twoFactor + apiKey), general settings, profile settings (Wave 1)
- [ ] 10-02-PLAN.md -- Security settings: password change, TOTP 2FA with QR code + backup codes, active sessions management (Wave 2)
- [ ] 10-03-PLAN.md -- Team member management, invitation system, API key CRUD with show-once creation pattern (Wave 2)
- [ ] 10-04-PLAN.md -- Notification preferences, integration connection cards, backup/export, danger zone with type-to-confirm (Wave 2)
- [ ] 10-05-PLAN.md -- Internal documentation hub with sidebar + markdown pages, Scalar interactive API reference (Wave 1)
- [ ] 10-06-PLAN.md -- WebSocket playground with connection panel, event templates, CodeMirror JSON editor, timestamped event log with export (Wave 2)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4/5/6/7 (partially parallel after 3) -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 7/7 | Complete | 2026-02-17 |
| 2. Authentication & App Shell | 3/4 | Complete    | 2026-02-18 |
| 3. Agent Management | 0/6 | Planned | - |
| 4. Real-Time Chat | 0/4 | Planned | - |
| 5. Dashboard & Monitoring | 0/5 | Complete    | 2026-02-18 |
| 6. Mission Board | 0/4 | Complete    | 2026-02-18 |
| 7. Gateway, Channels & Models | 0/5 | Complete    | 2026-02-18 |
| 8. Sessions, Memory, Files & Governance | 0/6 | Not started | - |
| 9. Skills, Plugins & Workflows | 0/5 | Not started | - |
| 10. Settings, Public Pages & Developer Tools | 0/6 | Planned | - |
