# AXion Hub

## What This Is

AXion Hub is a self-hosted web dashboard for orchestrating, monitoring, and governing AI agents connected to OpenClaw Gateway. It provides a comprehensive mission control interface with real-time streaming chat, Kanban task management, visual workflow builder, agent configuration, channel routing, session/memory browsing, governance policies, and developer tools — all built on Next.js 16 with shadcn/ui and Tailwind v4.

## Core Value

A single pane of glass where you can see everything your AI agents are doing, direct their work, and maintain governance — replacing CLI-based management with a visual command center.

## Requirements

### Validated

- Dashboard with gateway status, agent health, task status, cost summary, live feed — v1.0
- Agent management — roster, detail views, identity editing, session browsing, memory, skills, tools, sandbox config, channel routing, logs, metrics — v1.0
- Real-time chat with agents — streaming responses, tool call visualization, media support, session switching — v1.0
- Mission board — Kanban task management with agent assignment, subtasks, deliverables, sign-off gates — v1.0
- Gateway management — connection status, visual config editor, channel management, node pairing, multi-gateway — v1.0
- Channel management — overview, per-channel config, routing/bindings editor, pairing flows, group settings — v1.0
- Sessions & memory — session list, transcript viewer, global memory browser, semantic search — v1.0
- Models & providers — provider config, model catalog, failover chains, usage & cost tracking — v1.0
- Workflows & automation — multi-step sequences, visual builder, cron jobs, webhooks — v1.0
- Approvals & governance — approval queue, audit log, policy management — v1.0
- Activity & monitoring — live feed, history, health monitor, alerts — v1.0
- Files & workspace — file browser, viewer/editor, deliverables, upload — v1.0
- Skills & plugins — library, ClawHub browser, plugin management — v1.0
- Settings — general, profile, security, team/org, API keys, notifications, integrations, backup, danger zone — v1.0
- Auth — login, register, forgot password, invite acceptance — v1.0
- API reference & WebSocket playground — v1.0

### Active

- [ ] Wire all feature API hooks to real gateway data (replace mock data layer)
- [ ] Alert evaluation logic — add trigger/evaluator to alert pipeline
- [ ] Activity feed task event coverage — add `task.*` to event namespaces
- [ ] OAuth integration connections (GitHub/Linear/Jira) — replace stubs with real OAuth flows

### Out of Scope

- Mobile native app — web-first, responsive design covers mobile use cases
- Building or modifying OpenClaw Gateway itself — AXion Hub is a consumer of its APIs
- Real-time voice/audio features — OpenClaw handles voice natively on device
- Public/marketing pages — dropped in v1.0, AXion Hub is internal tool (SITE-01–06)
- Offline mode — real-time gateway connection is core value

## Context

Shipped v1.0 with 69,878 LOC TypeScript across 856 files.
Tech stack: Next.js 16, Tailwind CSS v4, shadcn/ui, PostgreSQL (Drizzle ORM), Redis (BullMQ), better-auth, Zustand + TanStack Query, @xyflow/react, dnd-kit, CodeMirror, Recharts.
Frontend-first approach: all UI surfaces built with mock data; gateway API integration is primary v1.1 work.
~25 tech debt items tracked in milestone audit (mostly mock data TODOs).

**OpenClaw Gateway** is an open source AI agent platform (200k+ GitHub stars) created by Peter Steinberger. It's a Node.js gateway process that sits between messaging channels (WhatsApp, Telegram, Discord, Slack, etc.) and LLM providers (Anthropic, OpenAI, Gemini, local models). Key architecture:

- **WebSocket API** at `ws://127.0.0.1:18789` — control plane for clients, tools, and events
- **Multi-agent routing** — channels/peers route to isolated agent instances with independent workspaces
- **Sessions** — append-only event logs at `~/.openclaw/agents/<agentId>/sessions/*.jsonl`, supports branching and compaction
- **Memory** — SQLite with vector embeddings at `~/.openclaw/memory/<agentId>.sqlite`, hybrid search (vector + BM25)
- **Tool execution** — sandboxed via Docker for untrusted sessions, direct host exec for operator
- **Config** — `openclaw.json` (JSON5) with agent definitions, channel configs, model providers, security settings
- **Agent workspace files** — `SOUL.md`, `IDENTITY.md`, `USER.md`, `AGENTS.md`, `MEMORY.md`, `TOOLS.md` per agent
- **Canvas/A2UI** — visual workspace where agents render interactive HTML (port 18793)
- **Authentication** — token, password, Tailscale, or trusted proxy modes
- **Channel pairing** — QR codes (WhatsApp), tokens (Telegram/Discord), allowlists

**Integration modes:**
- **Local mode** (co-located with Gateway): Full access — WebSocket API + direct filesystem read/write for config, sessions, memory DBs, workspace files, credentials, sandbox directories
- **Remote mode** (separate host): WebSocket API only — chat, real-time monitoring, session control; no file/memory/config introspection

## Constraints

- **Tech stack**: Next.js + shadcn/ui + Tailwind CSS v4 — decided, non-negotiable
- **Database**: PostgreSQL for AXion Hub's own data (tasks, workflows, audit logs, user accounts)
- **Deployment**: Docker (docker-compose alongside OpenClaw Gateway)
- **UI/UX**: Must use `ui-ux-pro-max` skill for all UI/UX design and implementation
- **OpenClaw compatibility**: Must work with current OpenClaw Gateway WebSocket protocol and filesystem layout
- **Self-hosted**: No external dependencies or SaaS requirements — everything runs on user's infrastructure
- **Dual-mode**: All features must gracefully degrade when running in remote mode (WS-only) vs local mode

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace built-in UI rather than complement | AXion Hub provides a superset of functionality; maintaining two UIs creates confusion | Good — clean separation of concerns |
| Next.js 16 + shadcn/ui + Tailwind v4 | User preference; modern React stack with excellent component library | Good — fast iteration, consistent design |
| PostgreSQL over SQLite | Scales to team use later; robust for audit logs, workflows, task management | Good — Drizzle ORM works well |
| Docker deployment | Consistent environment; easy to compose alongside OpenClaw Gateway | Good — multi-stage builds, dev/prod configs |
| Dual-mode (local + remote) | Maximizes deployment flexibility without sacrificing capability when co-located | Good — ModeAwareResult pattern works cleanly |
| ~87 pages in v1 scope | Comprehensive vision; built incrementally across 13 phases | Good — all surfaces built, mock data is acceptable trade-off |
| Frontend-first with mock data | Build complete UI surface before gateway integration | Good — validated all UI patterns; mock→real swap is mechanical |
| better-auth for authentication | Full-featured auth with org support, 2FA, API keys, OAuth | Good — minimal custom code needed |
| Zustand (push) + TanStack Query (pull) | WebSocket state in Zustand, REST data in TanStack Query — clear separation | Good — predictable data flow |
| Feature-sliced design (FSD) | Domain-organized modules with clear boundaries | Good — 13 feature domains cleanly separated |
| exactOptionalPropertyTypes: true | Strict TypeScript catches real bugs despite verbose conditional spreads | Revisit — creates widespread `as never` casts and conditional spread boilerplate |

---
*Last updated: 2026-02-20 after v1.0 milestone*
