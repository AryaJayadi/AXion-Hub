# Phase 5: Dashboard & Monitoring - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Command center dashboard showing real-time health of the agent ecosystem — gateway status, agent states, task summary, cost tracking, live activity feeds, system health monitoring, and configurable alerts. Users can see everything at a glance and get proactive notifications when things go wrong.

</domain>

<decisions>
## Implementation Decisions

### Dashboard layout & widgets
- Bento grid layout with mixed-size cards — widgets claim different grid spans
- Activity feed is the most visually prominent widget, takes the largest grid area
- Bento grid collapses to a single vertical column on smaller screens, all widgets remain visible
- Quick actions placement is Claude's discretion (fixed bar, FAB, or inline — whatever fits the bento layout)

### Real-time behavior
- Activity feed auto-scrolls with new events pushing in at the top; if user has scrolled down, show a "New events" indicator instead of disrupting position
- Dashboard stat widgets (agent count, task summary, costs) use subtle number transitions — counters smoothly animate between values, status badges pulse briefly on change
- Gateway disconnect triggers a persistent degraded-mode banner ("Gateway disconnected — showing last known state") with stale data indicators on affected widgets, not an overlay
- /activity page uses a split view: left panel = filterable event list, right panel = event detail on selection (like a log viewer)

### Health & alerts experience
- /monitor page features a dependency map — visual diagram showing how services connect (gateway, providers, channels, nodes) with color-coded health (green/yellow/red)
- Dependency map is interactive: click a node to drill in, showing metrics, recent events, and connected services — full exploration from the map without navigating away
- Alert rules configured via template presets (e.g., "Agent down for 5 min", "High error rate") with customizable thresholds — faster setup than blank-slate forms
- Alert notifications: in-app (bell icon, toasts) plus webhook URL per rule — lets users pipe to Slack, Discord, PagerDuty, etc.

### Cost & usage display
- Token costs shown as both aggregate summary (with time toggle: session/today/week) and per-agent breakdown
- Context window usage displayed as horizontal progress bars per agent — color shifts green → yellow → red as context fills
- Cost format shows tokens and estimated dollar cost with equal visual weight (side by side, not one subordinate to the other)
- Per-agent cost breakdown shows both a stacked bar chart (input vs output tokens, easy to compare agents) and a compact sortable table (agent, model, tokens in/out, cost)

### Claude's Discretion
- Quick action button placement and style
- Bento grid exact sizing and gap spacing
- Activity feed event card design
- Dependency map node layout algorithm and styling
- Alert template catalog (which presets to include)
- Loading states and skeleton designs
- Error state handling

</decisions>

<specifics>
## Specific Ideas

- Activity feed should feel like a live ops console — events streaming in, but not overwhelming
- Split view on /activity page is like a log viewer — filterable list on left, detail on right
- Dependency map on /monitor is the centerpiece — think service mesh visualization, not a boring status grid
- Cost display gives equal weight to tokens and dollars — both matter for different audiences

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-dashboard-monitoring*
*Context gathered: 2026-02-18*
