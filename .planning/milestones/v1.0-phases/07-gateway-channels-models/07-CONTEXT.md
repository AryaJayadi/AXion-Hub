# Phase 7: Gateway, Channels & Models - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Full management of gateway configuration, messaging channel connections and routing, and LLM provider setup with failover and cost tracking. Users can view gateway health, edit openclaw.json config, connect and route channels to agents, and configure model providers with failover chains and usage tracking. Multi-gateway instance management included.

</domain>

<decisions>
## Implementation Decisions

### Gateway Config Editing
- Claude's discretion on config editor layout (tabbed sections vs accordion — pick best fit for openclaw.json structure)
- Draft-then-apply pattern: users save config changes as a draft, review a diff of changes, then explicitly apply to the gateway
- Raw JSON toggle shows the full openclaw.json file, not just the current section
- Validation errors shown both inline per field AND in a summary validation panel with jump-to-field links

### Channel Pairing & Routing
- Step-by-step wizard for channel pairing: pick platform → authenticate/scan QR → configure → confirm
- WhatsApp QR scanning in a focused full-screen/centered modal with instructions and refresh timer
- Channel-to-agent routing shown as table by default, with toggle to visual connection graph view
- Group channel settings managed per-channel within each channel's config page (not a dedicated groups page)

### Model Provider Setup
- Model catalog organized by provider with expandable sections (Anthropic, OpenAI, etc.), not a flat list
- Claude's discretion on failover chain builder approach (reorderable list vs visual pipeline)
- Usage/cost tracking with multi-dimension toggle: per-provider, per-model, and per-agent views
- "Test Connection" button on provider config form to verify API key before saving

### Multi-Instance Management
- Gateway instances displayed as card grid showing name, status, uptime, connected agents
- Health shown as aggregate status badge (healthy/degraded/down) with expandable drill-down to component-level health (DB, Redis, WS, etc.)
- Claude's discretion on instance navigation (global selector vs click-into-detail pattern)
- Gateway nodes listed within instance detail page, not a separate dedicated page

### Claude's Discretion
- Config editor layout (tabbed vs accordion)
- Failover chain builder approach (reorderable list vs visual pipeline)
- Instance navigation pattern (global selector vs click-into-detail)
- Loading skeletons and empty states across all gateway/channel/model pages
- Error state handling for connection failures, invalid configs, etc.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key emphasis on the draft-then-apply pattern for config safety and the multi-dimension cost tracking view.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-gateway-channels-models*
*Context gathered: 2026-02-18*
