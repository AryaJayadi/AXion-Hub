# Phase 9: Skills, Plugins & Workflows - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Manage agent skills from a central library with ClawHub registry browsing, install and configure plugins with per-agent granularity, and build visual multi-step automation workflows with cron scheduling and webhook triggers. Skill/plugin creation authoring tools and workflow marketplace are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Skills library & ClawHub
- Card grid with category sections at /skills (e.g., Code, Communication, Data)
- Compact cards: icon, name, one-line description, status badge (enabled/disabled/update available); details on click
- ClawHub at /skills/clawhub is a separate marketplace-style page: featured/trending section, category tabs, search bar, install buttons
- Individual skill config at /skills/[skillId] uses JSON + form hybrid: structured form for common settings, raw JSON toggle for advanced config (reuses Phase 7 gateway config editor pattern)

### Plugin management
- /plugins shows installed plugins in a DataTable: name, version, status (active/disabled/error), last updated, action menu (configure, disable, uninstall)
- /plugins/install is a visual GUI browser with plugin cards, search, and one-click Install button; npm happens behind the scenes with inline progress
- Plugins installed workspace-wide but with per-agent enable/disable toggles
- Plugin detail page is full-featured: readme/docs section, settings form, agent assignment toggles, permissions display, and update history

### Workflow canvas
- /workflows/new starts with a blank canvas and sidebar palette of available node types (no wizard, no templates)
- Rich node palette: Trigger (manual/cron/webhook/event), Agent Action, Condition (if/else), Delay, Transform (data mapping), Output (notify/log), Loop, Parallel (fan-out/fan-in), HTTP Request, Code (custom JS/Python), Approval Gate, Sub-workflow
- Node configuration via right sidebar panel (like Figma properties panel); canvas stays visible
- Execution results: canvas overlay for live runs (colored node borders for pending/running/success/error, click node for I/O in sidebar) PLUS dedicated results page for detailed inspection of past runs

### Scheduling & triggers
- Cron schedule builder at /workflows/cron uses hybrid: visual builder (dropdowns for frequency, day, time) as default, toggle to raw cron expression for power users; human-readable preview always shown
- Webhook endpoints at /workflows/webhooks managed via DataTable: URL, linked workflow, status, last triggered; create via dialog with URL generation, secret, and workflow assignment
- Run history shown as inline expandable rows in cron/webhook tables: last N runs with status, duration, timestamp
- Failed runs support retry with options: retry button plus ability to edit input payload before re-queuing

### Claude's Discretion
- Exact node visual design and color coding on canvas
- Workflow list page layout at /workflows (table vs cards)
- ClawHub category taxonomy
- Plugin browser layout specifics
- Canvas zoom/pan controls and minimap placement

</decisions>

<specifics>
## Specific Ideas

- Skill config should feel like the gateway config editor from Phase 7 — form for common stuff, JSON toggle for advanced
- Plugin detail page should be rich like a product page, not just a settings form
- Workflow canvas is power-user oriented — blank canvas, not templates
- Execution overlay on canvas should feel like watching the workflow run in real time (node status updates live)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-skills-plugins-workflows*
*Context gathered: 2026-02-19*
