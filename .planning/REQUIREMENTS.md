# Requirements: AXion Hub

**Defined:** 2026-02-17
**Core Value:** A single pane of glass where you can see everything your AI agents are doing, direct their work, and maintain governance — replacing CLI-based management with a visual command center.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases. All ~87 pages/views included.

### Foundation & Infrastructure

- [ ] **INFR-01**: Next.js 16 App Router project initialized with TypeScript, Tailwind CSS v4, shadcn/ui, and Biome
- [ ] **INFR-02**: PostgreSQL database with Drizzle ORM schema, migrations, and connection pooling
- [ ] **INFR-03**: Docker Compose setup with AXion Hub, PostgreSQL, and Redis services
- [ ] **INFR-04**: WebSocket Manager singleton with typed Event Bus for real-time OpenClaw Gateway communication via Socket.IO
- [ ] **INFR-05**: Gateway abstraction layer that insulates all features from raw OpenClaw API changes
- [ ] **INFR-06**: Dual-mode connection support — local (filesystem + WebSocket) and remote (WebSocket only)
- [ ] **INFR-07**: Shared UI component library (tables, forms, status indicators, badges) built on shadcn/ui before page development
- [ ] **INFR-08**: Feature-sliced architecture with independently organized domain modules
- [ ] **INFR-09**: Zustand stores for real-time WebSocket state + TanStack Query for REST-fetched historical data
- [ ] **INFR-10**: Audit logging middleware baked into every mutating API endpoint
- [ ] **INFR-11**: BullMQ job queue with Redis for background tasks, scheduled jobs, and workflow execution

### Authentication

- [x] **AUTH-01**: User can log in with email/password at `/login`
- [x] **AUTH-02**: User can log in via OAuth providers (Google, GitHub) at `/login`
- [x] **AUTH-03**: User can create an account at `/register`
- [x] **AUTH-04**: User can reset password via email link at `/forgot-password`
- [x] **AUTH-05**: User can accept an organization invitation via `/invite/[token]`
- [x] **AUTH-06**: User session persists across browser refresh with secure cookie/token management via better-auth

### Dashboard

- [x] **DASH-01**: User sees at-a-glance command center at `/dashboard` with gateway status indicator (connected/disconnected/degraded)
- [x] **DASH-02**: Dashboard shows active agents count with health badges (online, idle, working, error)
- [x] **DASH-03**: Dashboard shows tasks in flight grouped by status (inbox, assigned, in-progress, review, done)
- [x] **DASH-04**: Dashboard shows context window usage gauge per active agent
- [x] **DASH-05**: Dashboard shows model & token cost summary (current session / today / this week)
- [x] **DASH-06**: Dashboard shows live activity feed (last 20 events, scrollable, real-time via WebSocket)
- [x] **DASH-07**: Dashboard provides quick actions: New Task, New Agent, Send Message

### Mission Board (Task Management)

- [ ] **TASK-01**: User can view and manage tasks on a drag-and-drop Kanban board at `/missions` with columns: INBOX, ASSIGNED, IN PROGRESS, REVIEW, DONE, ARCHIVED
- [ ] **TASK-02**: User can view full task detail at `/missions/[taskId]` with title, Markdown description, priority (urgent/high/normal/low), assigned agent(s), human reviewer, skills/tags, subtasks/checklist
- [ ] **TASK-03**: User can create tasks via form/modal at `/missions/new` with all task fields
- [ ] **TASK-04**: Task detail shows activity timeline (status changes, comments, agent output) and dispatch log
- [ ] **TASK-05**: Task detail shows deliverables (uploaded files, code artifacts, links) with preview
- [ ] **TASK-06**: User can toggle sign-off gate on tasks (require human approval before DONE)
- [ ] **TASK-07**: User can comment on tasks with @agent and @human mentions
- [ ] **TASK-08**: User can organize boards by project/team at `/missions/boards`
- [ ] **TASK-09**: User can configure board settings at `/missions/boards/[boardId]/settings` with custom columns and automation rules

### Agents

- [x] **AGNT-01**: User can view all agents in grid/list view with status badges at `/agents`
- [x] **AGNT-02**: User can view agent overview at `/agents/[agentId]` showing status, model, context usage, uptime, current task
- [x] **AGNT-03**: User can create/provision a new agent at `/agents/new`
- [x] **AGNT-04**: User can browse and use agent templates (Lead, Developer, Researcher, Writer, etc.) at `/agents/templates`
- [x] **AGNT-05**: User can edit agent identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md) with Markdown editor at `/agents/[agentId]/identity`
- [x] **AGNT-06**: User can view agent sessions with token counts and compaction history at `/agents/[agentId]/sessions`
- [x] **AGNT-07**: User can view/edit agent MEMORY.md and daily memory files, and search memory index at `/agents/[agentId]/memory`
- [x] **AGNT-08**: User can manage agent skills (installed, enable/disable, install from ClawHub) at `/agents/[agentId]/skills`
- [x] **AGNT-09**: User can configure agent tool allow/deny lists and elevated tool config at `/agents/[agentId]/tools`
- [x] **AGNT-10**: User can configure agent sandbox mode, Docker settings, and workspace access at `/agents/[agentId]/sandbox`
- [x] **AGNT-11**: User can view which channels/bindings route to an agent at `/agents/[agentId]/channels`
- [x] **AGNT-12**: User can view agent activity log, tool calls, and errors at `/agents/[agentId]/logs`
- [x] **AGNT-13**: User can view agent metrics (token usage, cost, tasks completed, response times) at `/agents/[agentId]/metrics`

### Chat & Conversations

- [x] **CHAT-01**: User can access multi-pane chat interface at `/chat` showing all agent conversations
- [x] **CHAT-02**: User can have a direct conversation with a specific agent at `/chat/[agentId]` with real-time streaming responses via WebSocket
- [x] **CHAT-03**: User can observe agent-to-agent conversations (observer mode) at `/chat/team/[conversationId]`
- [x] **CHAT-04**: Chat displays tool calls as expandable blocks showing tool name, arguments, and output
- [x] **CHAT-05**: Chat supports sending/receiving images, documents, and audio
- [x] **CHAT-06**: User can switch between agent sessions within chat
- [x] **CHAT-07**: Chat supports quick commands: `/new`, `/compact`, `/status`, `/reset`
- [x] **CHAT-08**: User can search messages across all conversations

### Gateway Management

- [ ] **GATE-01**: User can view gateway connection status, health, uptime, and version at `/gateway`
- [ ] **GATE-02**: User can visually edit `openclaw.json` configuration with form-based editor and raw JSON toggle at `/gateway/config`
- [ ] **GATE-03**: Gateway config editor covers all sections: identity, session settings, channel configs, model providers, compaction, memory search, security, plugins
- [ ] **GATE-04**: User can view and manage connected channels (WhatsApp, Telegram, Discord, etc.) with status and pairing at `/gateway/channels`
- [ ] **GATE-05**: User can view and manage connected nodes (macOS/iOS/Android) with capabilities and pairing at `/gateway/nodes`
- [ ] **GATE-06**: User can manage multiple gateway connections at `/gateway/instances`

### Channels

- [ ] **CHAN-01**: User can view all connected channels with status at `/channels`
- [ ] **CHAN-02**: User can configure individual channels (WhatsApp, Telegram, Discord, Slack, etc.) at `/channels/[channel]`
- [ ] **CHAN-03**: User can edit channel-to-agent bindings/routing at `/channels/routing`
- [ ] **CHAN-04**: User can pair channels via QR code / pairing flow (WhatsApp) and node pairing at `/channels/pairing`
- [ ] **CHAN-05**: User can manage group chat allowlists, mention patterns, and broadcast groups at `/channels/groups`

### Sessions & Memory

- [ ] **SESS-01**: User can view all active sessions across all agents at `/sessions`
- [ ] **SESS-02**: User can view full session detail with transcript and token usage at `/sessions/[sessionId]`
- [ ] **SESS-03**: User can view JSONL session transcript with message tree at `/sessions/[sessionId]/transcript`
- [ ] **MEMO-01**: User can browse memories across all agents at `/memory`
- [ ] **MEMO-02**: User can perform semantic search across all agent memories at `/memory/search`

### Models & Providers

- [ ] **MODL-01**: User can view connected providers with auth status and model list at `/models`
- [ ] **MODL-02**: User can configure per-provider settings (API keys, OAuth, base URL) at `/models/[provider]`
- [ ] **MODL-03**: User can browse all available models with specs at `/models/catalog`
- [ ] **MODL-04**: User can configure primary + fallback model chains at `/models/failover`
- [ ] **MODL-05**: User can view token usage charts and cost breakdown per agent/model/period at `/models/usage`

### Workflows & Automation

- [ ] **WORK-01**: User can view saved multi-step automation sequences at `/workflows`
- [ ] **WORK-02**: User can build workflows with visual node editor (trigger, steps, output) at `/workflows/new` using @xyflow/react
- [ ] **WORK-03**: User can view/edit/run a workflow at `/workflows/[workflowId]`
- [ ] **WORK-04**: User can schedule agent tasks via cron jobs at `/workflows/cron`
- [ ] **WORK-05**: User can create and manage inbound webhook endpoints at `/workflows/webhooks`

### Approvals & Governance

- [ ] **GOVR-01**: User can view tasks awaiting human sign-off at `/approvals`
- [ ] **GOVR-02**: User can review agent output and approve/reject/request revision at `/approvals/[taskId]`
- [ ] **GOVR-03**: User can view immutable audit log of all actions at `/audit`
- [ ] **GOVR-04**: User can define governance policies (auto-approval rules, escalation rules, tool restrictions) at `/governance/policies`

### Activity & Monitoring

- [x] **MNTR-01**: User can view real-time event stream across all agents and channels at `/activity`
- [x] **MNTR-02**: User can search and filter activity history at `/activity/history`
- [x] **MNTR-03**: User can view system health dashboard (gateway, providers, channels, nodes) at `/monitor`
- [x] **MNTR-04**: User can configure alert rules and view notification history at `/monitor/alerts`

### Files & Workspace

- [ ] **FILE-01**: User can browse agent workspace files at `/workspace`
- [ ] **FILE-02**: User can view/edit workspace files (SOUL.md, AGENTS.md, etc.) at `/workspace/[agentId]/[...path]`
- [ ] **FILE-03**: User can view all task deliverables in one place at `/deliverables`
- [ ] **FILE-04**: User can upload files to agent workspace or task at `/workspace/upload`

### Skills & Plugins

- [ ] **SKIL-01**: User can view installed skills across all agents at `/skills`
- [ ] **SKIL-02**: User can browse and install skills from ClawHub registry at `/skills/clawhub`
- [ ] **SKIL-03**: User can view skill config, SKILL.md, and enable/disable per agent at `/skills/[skillId]`
- [ ] **SKIL-04**: User can view installed plugins and enable/disable/configure at `/plugins`
- [ ] **SKIL-05**: User can install plugins from npm or browse available plugins at `/plugins/install`

### Settings

- [ ] **SETT-01**: User can configure app name, timezone, theme (dark/light), language at `/settings`
- [ ] **SETT-02**: User can manage profile (display name, avatar) at `/settings/profile`
- [ ] **SETT-03**: User can manage security settings (password, 2FA, API keys, sessions) at `/settings/security`
- [ ] **SETT-04**: User can manage organization settings, members, and roles at `/settings/team`
- [ ] **SETT-05**: User can invite users and manage pending invitations at `/settings/team/invites`
- [ ] **SETT-06**: User can manage AXion Hub API keys for external integrations at `/settings/api`
- [ ] **SETT-07**: User can configure notification preferences (email, webhook, Slack/Discord) at `/settings/notifications`
- [ ] **SETT-08**: User can connect external services (GitHub, Linear, Jira) at `/settings/integrations`
- [ ] **SETT-09**: User can export config, sessions, and workspace data at `/settings/backup`
- [ ] **SETT-10**: User can access danger zone (delete workspace, reset data, disconnect gateway) at `/settings/danger`

### Public / Marketing Pages

- [ ] **SITE-01**: Landing page at `/` with hero, feature highlights, demo video, CTA
- [ ] **SITE-02**: Features page at `/features` with detailed feature breakdown and visuals
- [ ] **SITE-03**: Pricing page at `/pricing` with plans (Self-host Free / Pro / Team)
- [ ] **SITE-04**: Documentation hub at `/docs`
- [ ] **SITE-05**: Changelog at `/changelog` with release notes and version history
- [ ] **SITE-06**: Blog at `/blog` with tutorials, case studies, announcements

### API & Developer

- [ ] **ADEV-01**: Interactive REST API documentation (Swagger/OpenAPI) at `/api-docs`
- [ ] **ADEV-02**: WebSocket playground for testing Gateway WebSocket commands live at `/api-docs/ws`

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

(None — all features included in v1 per project scope)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Mobile native app (iOS/Android) | Web-first with responsive design; OpenClaw has native mobile apps already |
| Visual drag-and-drop agent builder | AXion Hub is operations/management, not agent building; Dify/FlowiseAI own this space |
| Built-in LLM prompt IDE / playground | Prompt engineering is a separate product concern; use chat interface for quick tests |
| Custom model fine-tuning UI | Model training belongs in dedicated tools (W&B, MLflow); AXion Hub manages agents, not models |
| Google Docs-style real-time collaboration | Massive complexity (CRDT/OT) for marginal value; use optimistic locking instead |
| Embeddable chat widget for external sites | Separate product concern; provide API for users to build their own |
| Multi-tenant SaaS mode | Destroys self-hosted simplicity; one org per instance |
| Auto-scaling agent infrastructure | Infrastructure scaling belongs in the gateway/orchestrator layer |
| Modifying OpenClaw Gateway code | AXion Hub is a consumer of Gateway APIs, not a contributor to Gateway itself |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | Phase 1 | Pending |
| INFR-02 | Phase 1 | Pending |
| INFR-03 | Phase 1 | Pending |
| INFR-04 | Phase 1 | Pending |
| INFR-05 | Phase 1 | Pending |
| INFR-06 | Phase 1 | Pending |
| INFR-07 | Phase 1 | Pending |
| INFR-08 | Phase 1 | Pending |
| INFR-09 | Phase 1 | Pending |
| INFR-10 | Phase 1 | Pending |
| INFR-11 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| AUTH-06 | Phase 2 | Complete |
| AGNT-01 | Phase 3 | Complete |
| AGNT-02 | Phase 3 | Complete |
| AGNT-03 | Phase 3 | Complete |
| AGNT-04 | Phase 3 | Complete |
| AGNT-05 | Phase 3 | Complete |
| AGNT-06 | Phase 3 | Complete |
| AGNT-07 | Phase 3 | Complete |
| AGNT-08 | Phase 3 | Complete |
| AGNT-09 | Phase 3 | Complete |
| AGNT-10 | Phase 3 | Complete |
| AGNT-11 | Phase 3 | Complete |
| AGNT-12 | Phase 3 | Complete |
| AGNT-13 | Phase 3 | Complete |
| CHAT-01 | Phase 4 | Complete |
| CHAT-02 | Phase 4 | Complete |
| CHAT-03 | Phase 4 | Complete |
| CHAT-04 | Phase 4 | Complete |
| CHAT-05 | Phase 4 | Complete |
| CHAT-06 | Phase 4 | Complete |
| CHAT-07 | Phase 4 | Complete |
| CHAT-08 | Phase 4 | Complete |
| DASH-01 | Phase 5 | Complete |
| DASH-02 | Phase 5 | Complete |
| DASH-03 | Phase 5 | Complete |
| DASH-04 | Phase 5 | Complete |
| DASH-05 | Phase 5 | Complete |
| DASH-06 | Phase 5 | Complete |
| DASH-07 | Phase 5 | Complete |
| MNTR-01 | Phase 5 | Complete |
| MNTR-02 | Phase 5 | Complete |
| MNTR-03 | Phase 5 | Complete |
| MNTR-04 | Phase 5 | Complete |
| TASK-01 | Phase 6 | Pending |
| TASK-02 | Phase 6 | Pending |
| TASK-03 | Phase 6 | Pending |
| TASK-04 | Phase 6 | Pending |
| TASK-05 | Phase 6 | Pending |
| TASK-06 | Phase 6 | Pending |
| TASK-07 | Phase 6 | Pending |
| TASK-08 | Phase 6 | Pending |
| TASK-09 | Phase 6 | Pending |
| GATE-01 | Phase 7 | Pending |
| GATE-02 | Phase 7 | Pending |
| GATE-03 | Phase 7 | Pending |
| GATE-04 | Phase 7 | Pending |
| GATE-05 | Phase 7 | Pending |
| GATE-06 | Phase 7 | Pending |
| CHAN-01 | Phase 7 | Pending |
| CHAN-02 | Phase 7 | Pending |
| CHAN-03 | Phase 7 | Pending |
| CHAN-04 | Phase 7 | Pending |
| CHAN-05 | Phase 7 | Pending |
| MODL-01 | Phase 7 | Pending |
| MODL-02 | Phase 7 | Pending |
| MODL-03 | Phase 7 | Pending |
| MODL-04 | Phase 7 | Pending |
| MODL-05 | Phase 7 | Pending |
| SESS-01 | Phase 8 | Pending |
| SESS-02 | Phase 8 | Pending |
| SESS-03 | Phase 8 | Pending |
| MEMO-01 | Phase 8 | Pending |
| MEMO-02 | Phase 8 | Pending |
| FILE-01 | Phase 8 | Pending |
| FILE-02 | Phase 8 | Pending |
| FILE-03 | Phase 8 | Pending |
| FILE-04 | Phase 8 | Pending |
| GOVR-01 | Phase 8 | Pending |
| GOVR-02 | Phase 8 | Pending |
| GOVR-03 | Phase 8 | Pending |
| GOVR-04 | Phase 8 | Pending |
| SKIL-01 | Phase 9 | Pending |
| SKIL-02 | Phase 9 | Pending |
| SKIL-03 | Phase 9 | Pending |
| SKIL-04 | Phase 9 | Pending |
| SKIL-05 | Phase 9 | Pending |
| WORK-01 | Phase 9 | Pending |
| WORK-02 | Phase 9 | Pending |
| WORK-03 | Phase 9 | Pending |
| WORK-04 | Phase 9 | Pending |
| WORK-05 | Phase 9 | Pending |
| SETT-01 | Phase 10 | Pending |
| SETT-02 | Phase 10 | Pending |
| SETT-03 | Phase 10 | Pending |
| SETT-04 | Phase 10 | Pending |
| SETT-05 | Phase 10 | Pending |
| SETT-06 | Phase 10 | Pending |
| SETT-07 | Phase 10 | Pending |
| SETT-08 | Phase 10 | Pending |
| SETT-09 | Phase 10 | Pending |
| SETT-10 | Phase 10 | Pending |
| SITE-01 | Phase 10 | Pending |
| SITE-02 | Phase 10 | Pending |
| SITE-03 | Phase 10 | Pending |
| SITE-04 | Phase 10 | Pending |
| SITE-05 | Phase 10 | Pending |
| SITE-06 | Phase 10 | Pending |
| ADEV-01 | Phase 10 | Pending |
| ADEV-02 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 115 total
- Mapped to phases: 115
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after roadmap creation*
