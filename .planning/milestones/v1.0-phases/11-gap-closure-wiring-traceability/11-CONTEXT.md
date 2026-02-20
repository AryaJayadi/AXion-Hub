# Phase 11: Gap Closure — Cross-Phase Wiring & Traceability - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Close all integration gaps identified in the v1.0 milestone audit: fix 5 missing cross-phase connections, 1 partial requirement (SESS-01), 3 broken E2E flows, complete sidebar navigation with 7 missing links, and update REQUIREMENTS.md traceability to 100% accuracy. No new features — only wiring existing features together.

</domain>

<decisions>
## Implementation Decisions

### Sidebar navigation structure
- /monitor goes under **Operations** group (alongside Gateway, Channels, Models, Activity, Files)
- /sessions and /memory go under **Core** group (alongside Dashboard, Agents, Chat, Missions)
- /audit, /governance/policies, and /deliverables go under **System** group (alongside Approvals, Settings)
- /plugins goes under **Automation** group (alongside Workflows, Skills)
- Final sidebar structure:
  - **Core:** Dashboard, Agents, Chat, Missions, Sessions, Memory
  - **Operations:** Gateway, Channels, Models, Activity, Files, Monitor
  - **Automation:** Workflows, Skills, Plugins
  - **System:** Approvals, Deliverables, Audit, Governance, Settings

### Chat entry point flows
- "New Chat" button in chat hub opens the AgentPickerDialog
- "Start Chat" empty-state button in conversation sidebar opens the same AgentPickerDialog (consistent behavior)
- After picking an agent, resume existing conversation if one exists (navigate to /chat/[agentId])
- Fix TanStack Query key mismatch: align AgentPickerDialog to use ['agents'] matching useAgents (shared cache, instant visibility of new agents)

### Alert notification wiring
- Wire the DB→Zustand→NotificationBell bridge only; leave rule evaluation as TODO for when real gateway data is available
- When an alert fires: badge count on bell icon AND a sonner toast notification
- NotificationBell dropdown shows preview list of last 5-10 alerts with severity badges; clicking one navigates to /monitor/alerts
- Toast alert notification navigates to the specific alert detail (affected resource)

### Agent detail quick actions
- "Send Message" opens the AgentPickerDialog with the agent pre-selected (confirm before navigating)
- Wire ALL quick actions that have working targets — not just Send Message (e.g., any "coming soon" actions from Phases 5/6 that now have functional destinations)
- SessionsTable row click fixed with proper component callback (not DOM event delegation)
- Session row click opens a slide-over panel (not full page navigation)
- Slide-over shows summary info: token usage, duration, status, agent name, and a "View full transcript" link to /sessions/[sessionId]

### Claude's Discretion
- Exact sidebar link ordering within each group
- Icon selection for new sidebar links
- Slide-over animation and sizing
- Toast notification auto-dismiss timing
- Alert preview list styling and severity badge design

</decisions>

<specifics>
## Specific Ideas

- Agent picker dialog is the single entry point for starting chats — reused across "New Chat", "Start Chat", and "Send Message" actions
- Session slide-over is summary-only with a link to full page — keeps the sessions list usable without navigating away
- Alert bridge is wired but evaluation stays mock — pragmatic for gap closure, ready for real data later

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-gap-closure-wiring-traceability*
*Context gathered: 2026-02-20*
