# Phase 3: Agent Management - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

A full management interface for AI agents: roster view, agent creation with templates, identity file editing, and deep-dive detail pages covering sessions, memory, skills, tools, sandbox, channels, logs, and metrics. Users can see, create, configure, and inspect every aspect of their agents from one place.

</domain>

<decisions>
## Implementation Decisions

### Agent roster presentation
- Card grid layout (no list/table toggle needed)
- Cards styled like employee badges — avatar, name, status, model, and one key stat. Not cluttered, not minimal. Clean mid-density
- Agent status communicated through subtle card border/glow that changes color by state (online = green, idle = yellow, working = blue, error = red)
- No text status label on cards — the ambient glow is the indicator
- Search bar with text search by name, plus a status dropdown filter (online, idle, working, error, all)

### Agent creation & templates
- Deep multi-step wizard for creation — covers basics, model config, identity files, skills & tools, sandbox config, channel routing, and a final review step
- Each wizard step has smart defaults pre-filled — user can accept defaults and skip forward, or customize
- Name + model are the minimum required; everything else can be skipped and configured later
- Template system: visual gallery of pre-built templates (e.g., "Code Assistant", "Research Agent", "Customer Support") plus ability to clone any existing agent
- When using a template or cloning, wizard steps are pre-populated with that source's config

### Identity editor experience
- Sidebar file list on the left showing all identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md)
- Click a file in the sidebar to load it into the editor
- Identity files always have template starter content — if created from a template, files are pre-filled with that template's content; if created from scratch, files get section headers, placeholder text, and guidance comments
- Auto-save with debounce (saves automatically after user stops typing)

### Claude's Discretion
- Markdown editor implementation style (split-pane, Monaco, WYSIWYG — pick what looks best and fits the product feel)
- Memory viewer approach (searchable list vs categorized browser)
- Sub-page edit patterns (inline editing vs edit modals — pick per sub-page based on what makes sense)
- Agent overview widget sizing and arrangement
- Loading skeleton design for all agent pages
- Error state handling across the management interface

### Agent detail & sub-pages
- Left sidebar navigation within agent detail page listing all sub-sections (overview, sessions, memory, skills, tools, sandbox, channels, logs, metrics)
- Overview page is dashboard-style: widget/card layout with status card, stats card, recent activity card, and quick actions card
- All sub-pages accessible from the persistent sidebar

</decisions>

<specifics>
## Specific Ideas

- Agent cards should feel like employee ID badges — clean, professional, recognizable at a glance
- The status glow on cards should be subtle/ambient, not flashy — think calm awareness, not alarm
- The creation wizard should feel complete but not overwhelming — smart defaults mean you CAN skip, but power users can go deep
- Identity file starters should genuinely help users write good identity files, not just be empty boilerplate

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-agent-management*
*Context gathered: 2026-02-17*
