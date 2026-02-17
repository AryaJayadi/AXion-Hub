# AXion Hub

## What This Is

A self-hosted web dashboard for orchestrating, monitoring, and governing AI agents powered by OpenClaw Gateway. AXion Hub serves as "Mission Control" — a unified interface where users manage agent lifecycles, assign and track tasks, monitor conversations, configure gateway connections, and enforce governance policies across their entire AI agent fleet.

## Core Value

Users can see and control all their AI agents from one place — knowing what every agent is doing, directing their work, and ensuring nothing happens without appropriate oversight.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Self-hosted web dashboard with auth (login, register, password reset, org invites)
- [ ] Overview dashboard with gateway status, agent health, task summaries, cost tracking, and live activity feed
- [ ] Mission board with kanban task management, assignment to agents, sign-off gates, and activity timelines
- [ ] Agent management — roster, detail views (identity, sessions, memory, skills, tools, sandbox, channels, logs, metrics), templates
- [ ] Real-time chat with agents — direct conversations, team/observer mode, tool call visualization, streaming responses
- [ ] Gateway management — connection status, visual config editor, channel management, node management, multi-gateway support
- [ ] Channel management — WhatsApp/Telegram/Discord/Slack integration, routing/bindings editor, QR pairing, group management
- [ ] Session & memory management — session list/detail/transcripts, global memory browser, semantic memory search
- [ ] Model & provider management — provider config, model catalog, failover chains, usage/cost dashboards
- [ ] Workflow automation — visual workflow builder, cron jobs, webhook endpoints
- [ ] Approvals & governance — approval queue, audit log, policy rules for auto-approval/escalation/tool restrictions
- [ ] Activity monitoring — live event feed, searchable history, health monitor, alert rules
- [ ] File & workspace management — file browser, viewer/editor, deliverables hub, file upload
- [ ] Skills & plugins — skill library, ClawHub browser, plugin management
- [ ] Settings — general, profile, security (2FA), team/org, API keys, notifications, integrations, backup/export
- [ ] Public pages — landing page, features, pricing, docs, changelog, blog
- [ ] API & developer tools — REST API docs (Swagger/OpenAPI), WebSocket playground

### Out of Scope

- Mobile native apps — web-first, responsive design covers mobile use
- Custom AI model training — AXion Hub orchestrates agents, doesn't train models
- Direct cloud hosting service — self-hosted only, no managed SaaS offering in v1
- End-to-end encryption for agent conversations — would add significant complexity for v1
- White-labeling / multi-tenant SaaS — single-org deployment in v1

## Context

- **OpenClaw Gateway** is the underlying engine that manages AI agent sessions, channels (WhatsApp, Telegram, Discord, Slack), model providers, and tool execution. AXion Hub is the visual control layer on top of it.
- Agents have identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md), memory systems (MEMORY.md + daily files), skills, and sandboxed workspaces.
- The gateway communicates via WebSocket, so AXion Hub needs real-time connectivity for chat, status updates, and live monitoring.
- The app has ~87 unique pages/views across 17 sections, making this a substantial full-stack application.
- Target users are developers and teams running AI agent fleets for automation, development, research, and content creation.

## Constraints

- **Self-hosted**: Must be deployable on user's own infrastructure (Docker-first)
- **Real-time**: WebSocket connectivity to OpenClaw Gateway is essential for chat and monitoring
- **Scale**: Must handle multiple agents, concurrent sessions, and high event throughput
- **Security**: Auth, role-based access, API key management, audit logging are non-negotiable
- **OpenClaw dependency**: Gateway API/protocol shapes what AXion Hub can do — design around its capabilities

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Self-hosted only (no SaaS) | Reduces complexity, aligns with OpenClaw philosophy | — Pending |
| Single org per instance in v1 | Multi-tenant adds significant auth/data complexity | — Pending |
| WebSocket for real-time features | OpenClaw Gateway uses WebSocket, natural fit | — Pending |
| Comprehensive depth (8-12 phases) | ~87 pages demands thorough phase planning | — Pending |

---
*Last updated: 2026-02-17 after initialization*
