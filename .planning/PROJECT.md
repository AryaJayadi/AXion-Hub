# AXion Hub

## What This Is

AXion Hub is a self-hosted web dashboard that replaces OpenClaw Gateway's built-in Lit web UI with a comprehensive mission control interface for orchestrating, monitoring, and governing AI agents. It connects to OpenClaw Gateway via WebSocket API and (when co-located) direct filesystem access to provide full visibility and control over agents, sessions, channels, memory, tools, and workflows.

## Core Value

A single pane of glass where you can see everything your AI agents are doing, direct their work, and maintain governance — replacing CLI-based management with a visual command center.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dashboard with gateway status, agent health, task status, cost summary, live feed
- [ ] Agent management — roster, detail views, identity editing, session browsing, memory, skills, tools, sandbox config, channel routing, logs, metrics
- [ ] Real-time chat with agents — streaming responses, tool call visualization, media support, session switching
- [ ] Mission board — Kanban task management with agent assignment, subtasks, deliverables, sign-off gates
- [ ] Gateway management — connection status, visual config editor, channel management, node pairing, multi-gateway
- [ ] Channel management — overview, per-channel config, routing/bindings editor, pairing flows, group settings
- [ ] Sessions & memory — session list, transcript viewer, global memory browser, semantic search
- [ ] Models & providers — provider config, model catalog, failover chains, usage & cost tracking
- [ ] Workflows & automation — multi-step sequences, visual builder, cron jobs, webhooks
- [ ] Approvals & governance — approval queue, audit log, policy management
- [ ] Activity & monitoring — live feed, history, health monitor, alerts
- [ ] Files & workspace — file browser, viewer/editor, deliverables, upload
- [ ] Skills & plugins — library, ClawHub browser, plugin management
- [ ] Settings — general, profile, security, team/org, API keys, notifications, integrations, backup, danger zone
- [ ] Auth — login, register, forgot password, invite acceptance
- [ ] Public/marketing pages — landing, features, pricing, docs, changelog, blog
- [ ] API reference & WebSocket playground

### Out of Scope

- Mobile native app — web-first, responsive design covers mobile use cases
- Building or modifying OpenClaw Gateway itself — AXion Hub is a consumer of its APIs
- Real-time voice/audio features — OpenClaw handles voice natively on device

## Context

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

AXion Hub replaces the existing built-in Lit web UI served by the Gateway. Similar projects exist in the community (e.g., openclaw-mission-control) but none approach the comprehensive scope of AXion Hub.

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
| Replace built-in UI rather than complement | AXion Hub provides a superset of functionality; maintaining two UIs creates confusion | — Pending |
| Next.js + shadcn/ui + Tailwind v4 | User preference; shadcn already installed; modern React stack with excellent component library | — Pending |
| PostgreSQL over SQLite | Scales to team use later; robust for audit logs, workflows, task management | — Pending |
| Docker deployment | Consistent environment; easy to compose alongside OpenClaw Gateway | — Pending |
| Dual-mode (local + remote) | Maximizes deployment flexibility without sacrificing capability when co-located | — Pending |
| ~87 pages in v1 scope | Comprehensive vision; built incrementally across many phases | — Pending |

---
*Last updated: 2026-02-17 after initialization*
