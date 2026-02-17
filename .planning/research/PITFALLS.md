# Pitfalls Research

**Domain:** AI Agent Orchestration Dashboard (self-hosted, real-time, ~87 pages)
**Researched:** 2026-02-17
**Confidence:** MEDIUM (training data, no web verification available; however this domain is well-covered in established engineering literature)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or architectural dead ends.

### Pitfall 1: WebSocket Connection Lifecycle Mismanagement

**What goes wrong:**
The dashboard assumes the WebSocket connection is always alive. Users open the dashboard, walk away, come back, and see stale data with no indication that the connection dropped. Worse, reconnection attempts either never happen, happen too aggressively (DDoS-ing the gateway), or reconnect but lose subscription state -- so the UI looks connected but receives no events.

**Why it happens:**
Developers build the happy path first (connect, receive messages, render) and treat disconnection as an edge case. In reality, WebSocket connections drop constantly -- network changes, laptop sleep, gateway restarts, Docker container cycling, load balancer timeouts (commonly 60s idle), and proxy/reverse-proxy misconfigurations.

**How to avoid:**
- Implement a connection state machine with explicit states: `CONNECTING`, `CONNECTED`, `RECONNECTING`, `DISCONNECTED`, `FAILED`. Show this state in the UI at all times (subtle status indicator in the header).
- Use exponential backoff with jitter for reconnection (start 1s, max 30s, add random 0-1s jitter to prevent thundering herd).
- After reconnect, re-subscribe to all active channels and fetch a state snapshot from REST to reconcile any missed events (the "reconnect gap").
- Implement heartbeat/ping-pong (every 30s) independent of the WebSocket protocol-level ping. If 2 pings go unanswered, consider the connection dead and trigger reconnect.
- Set explicit timeouts on the WebSocket open handshake (5s).
- In Docker/reverse-proxy setups, configure proper WebSocket upgrade headers and disable buffering in nginx (`proxy_buffering off; proxy_read_timeout 86400;`).

**Warning signs:**
- Dashboard shows "connected" but data stops updating
- Users report "I have to refresh the page to get updates"
- Reconnection storms visible in gateway logs after a brief network blip
- Memory usage climbs over time (event listeners accumulating on each reconnect)

**Phase to address:**
Phase 1 (Foundation) -- the WebSocket connection layer must be architected correctly from the start. Retrofitting a state machine onto ad-hoc connection code requires touching every component that subscribes to events.

---

### Pitfall 2: Chat Streaming That Breaks Under Real Conditions

**What goes wrong:**
Streaming LLM responses look great in demos but break in production. Common failures: (1) partial token renders cause layout thrashing as the message div resizes on every chunk, (2) the chat auto-scroll "fights" with the user who is trying to scroll up to read earlier messages, (3) tool call visualizations arrive mid-stream and blow up the message layout, (4) network interruption during a stream leaves a half-rendered message with no recovery, (5) concurrent streams from multiple agents interleave and corrupt the UI.

**Why it happens:**
Chat streaming is deceptively simple to prototype. A demo with a single agent, no tool calls, and no network issues works in an afternoon. But production chat involves: concurrent agents, tool calls that produce structured output mid-stream, user scrolling during streams, message persistence (when do you save a streaming message?), and retry logic for interrupted streams.

**How to avoid:**
- Decouple the streaming buffer from rendering. Accumulate chunks in a buffer, render on requestAnimationFrame or a 16ms throttle -- not on every chunk arrival.
- Implement a scroll anchor pattern: auto-scroll ONLY when the user is already at the bottom (within 50px). If they have scrolled up, show a "New messages" pill that scrolls to bottom on click.
- Design message models to handle streaming states: `{ status: 'streaming' | 'complete' | 'interrupted' | 'error', content: string, toolCalls: ToolCall[] }`. Persist to DB only on `complete` or `interrupted`.
- For tool calls mid-stream, design the message component to render tool call blocks inline. Parse the stream for tool call delimiters as they arrive, not after the stream completes.
- Handle stream interruption explicitly: mark the message as `interrupted`, show what was received, and offer a "Retry" button.
- For concurrent agent streams, use separate stream buffers keyed by `sessionId + messageId`. Never share a single stream handler across conversations.

**Warning signs:**
- Chat container "jumps" or flickers during streaming
- Users complain that scrolling up during a response snaps them back to the bottom
- Half-rendered messages visible after network issues
- Tool call blocks appear garbled or at wrong positions

**Phase to address:**
Phase 2 or 3 (Chat/Agent Communication) -- but the message data model must be designed in Phase 1 to accommodate streaming states. Retrofitting streaming states onto a model that assumes complete messages requires a data migration.

---

### Pitfall 3: 87-Page Scope Without Shared Component Architecture

**What goes wrong:**
With 87 pages across 17 sections, teams build similar-but-different components for each section. The agent detail view has one kind of data table, the session list has another, the audit log has a third. Each has slightly different sorting, filtering, pagination, and empty states. The UI becomes inconsistent, bugs multiply (fix in one table, forget the others), and the codebase becomes unmaintainable.

**Why it happens:**
Pages get built section-by-section (gateway management, then agent management, then channels, etc.). Each section's developer makes locally-optimal decisions. Without a shared component library established first, divergence is inevitable and accelerates over time.

**How to avoid:**
- Build a shared component library BEFORE page development. The library must include at minimum: DataTable (with sorting, filtering, pagination, empty states, loading skeletons), DetailPanel (header + tabs + sections), StatusBadge, ActionMenu, ConfirmDialog, FormField (with validation), SearchInput, FilterBar, PageHeader, EmptyState, ErrorBoundary, LoadingSkeleton.
- Enforce the library through code review rules: "If it exists in the component library, you must use it. If you need something new, add it to the library first."
- Use a consistent page layout template: sidebar + header + content area with standard spacing. Every page should render inside this shell.
- Create a page template/generator: `npx create-page agent-detail` that scaffolds the standard structure.

**Warning signs:**
- Grep for `<table` or `<Table` returns dozens of different implementations
- Inconsistent empty states (some say "No data", some show illustrations, some show nothing)
- Different pagination patterns across pages
- New pages take longer to build than previous ones (compounding inconsistency)

**Phase to address:**
Phase 1 (Foundation) -- the component library is the single most important architectural decision for an 87-page app. It pays dividends on every subsequent page. Spend 2-3 weeks on it before any page development.

---

### Pitfall 4: Optimistic UI Without Proper Rollback in Multi-Agent State

**What goes wrong:**
The dashboard shows agents as "active" immediately when the user clicks "Start", but the gateway fails to start the agent. Now the UI says "active" while the agent is actually stopped. With multiple agents, the UI and actual state diverge across the fleet. Kanban cards show tasks as "assigned" but the assignment failed. The dashboard becomes unreliable -- users stop trusting what they see.

**Why it happens:**
Optimistic UI is a standard React pattern that works well for simple CRUD (toggle a like, update a name). But agent lifecycle operations are inherently slow and fallible -- starting an agent might take 5-30 seconds, involve container provisioning, model loading, and channel binding. Treating these as instant optimistic updates creates a trust gap.

**How to avoid:**
- Use a three-state pattern for mutations: `idle -> pending -> success/error`. Show explicit "pending" states (pulsing status dot, progress indicators) instead of optimistic flips.
- For agent lifecycle operations (start, stop, restart, assign task), ALWAYS wait for gateway confirmation before updating the UI state. Show a loading state during the operation.
- For less critical operations (rename, tag, configure), optimistic UI is fine but implement proper rollback: if the API call fails, revert the UI to previous state AND show an error toast explaining what happened.
- Store the "source of truth" state separately from the "display" state. The gateway's last-confirmed state is truth; the UI may show pending overlays on top of it.
- Implement periodic state reconciliation: every 30-60 seconds, fetch the full agent fleet status from the gateway and reconcile with the UI state. Log discrepancies.

**Warning signs:**
- Users report "the dashboard shows my agent is running but it's not responding"
- Status badges flicker between states
- Operations "succeed" in the UI but the gateway logs show failures
- The "refresh the page" fix becomes commonly needed

**Phase to address:**
Phase 2 (Agent Management) -- establish the mutation state pattern in the first agent management views. Apply consistently to all subsequent features (kanban, channels, workflows).

---

### Pitfall 5: Audit Log as an Afterthought

**What goes wrong:**
The audit log gets added late as a simple "log everything to a table" feature. It then fails in several ways: (1) it does not capture who did what -- just "agent config changed" without diff of what changed, (2) it has no retention policy and the table grows unbounded, eventually slowing the entire database, (3) it is not tamper-evident -- an admin can delete audit records, defeating the purpose of governance, (4) it does not capture system actions (auto-approvals, escalations, scheduled operations), only user-initiated ones.

**Why it happens:**
Audit logging is treated as a feature rather than an infrastructure concern. It gets a backlog ticket late in development. By then, the mutation layer (API routes, state management) is built without audit hooks, so adding logging requires modifying every endpoint.

**How to avoid:**
- Implement audit logging as middleware/interceptor on the API layer from Day 1. Every mutating request (POST, PUT, PATCH, DELETE) automatically captures: who (user ID + role), what (resource type + ID + action), when (timestamp), where (IP, user agent), and the before/after diff.
- Use an append-only storage pattern. The audit table should never allow UPDATE or DELETE at the application level. Use database-level permissions to enforce this.
- Include a hash chain: each audit record includes a hash of the previous record. This makes tampering detectable (any gap or modification breaks the chain).
- Set up retention policies from the start: raw events for 90 days, aggregated summaries for 1 year, configurable per deployment.
- Capture both user actions AND system actions (cron jobs, auto-approvals, escalations, webhook triggers). System actions should have a synthetic "system" actor.

**Warning signs:**
- Audit log only shows user actions, not system-initiated events
- No way to see what changed in a configuration update (just "config updated")
- Audit table has no indexes and queries slow down after a few months
- No retention policy and disk usage grows linearly forever

**Phase to address:**
Phase 1 (Foundation) -- audit logging infrastructure (middleware, storage, schema) must exist before any mutating features are built. The actual audit log UI can come later, but the data capture must be there from the start.

---

### Pitfall 6: Gateway Coupling Creates a House of Cards

**What goes wrong:**
The dashboard tightly couples to the OpenClaw Gateway's API shape, WebSocket message format, and internal data models. When the gateway updates (new fields, changed message types, deprecated endpoints), the dashboard breaks in subtle ways -- partial rendering, missing data, crash-on-unknown-field errors. Since this is a self-hosted product, users will run mismatched versions of the gateway and dashboard.

**Why it happens:**
When building a dashboard FOR a specific gateway, the natural instinct is to match its API exactly. Gateway returns `{ agent_status: "running" }`, the dashboard directly checks `if (data.agent_status === "running")`. This works until the gateway starts returning `{ agent_status: "active" }` in a new version.

**How to avoid:**
- Define a clean internal domain model for the dashboard. Map gateway responses into this model via adapter/transformer functions. The dashboard code never touches raw gateway data directly.
- Version the gateway API integration. Support at minimum the current and previous gateway API version. Use a version detection handshake on connect.
- Validate incoming gateway data with a schema (Zod) that provides defaults for missing fields and strips unknown fields rather than crashing.
- Build a gateway abstraction layer: `GatewayClient` that exposes typed methods (`getAgents()`, `startAgent(id)`, `subscribeToEvents()`) and encapsulates all HTTP/WebSocket communication. All dashboard code goes through this client, never directly to the gateway.
- Show a compatibility warning banner if the detected gateway version is outside the supported range.

**Warning signs:**
- Dashboard crashes or shows blank sections after a gateway update
- Raw gateway field names visible in UI code (`data.ws_config.heartbeat_interval` instead of `gateway.heartbeat`)
- No schema validation on gateway responses
- User reports of "it worked before the gateway update"

**Phase to address:**
Phase 1 (Foundation) -- the gateway abstraction layer must be the very first thing built. Every subsequent feature uses this layer. Changing from direct gateway calls to an abstraction layer later requires touching every component.

---

### Pitfall 7: Docker Self-Hosted Deployment Ignoring Operational Reality

**What goes wrong:**
The Docker deployment "works on my machine" but fails in real self-hosted scenarios: (1) the docker-compose.yml hardcodes ports that conflict with common services (80, 443, 3000, 5432), (2) no volume mounts for persistent data -- a container restart loses all configuration, (3) no health checks so orchestrators (Docker Compose, Kubernetes) cannot detect unhealthy containers, (4) the container runs as root, (5) no resource limits causing OOM kills on shared servers, (6) database migrations run on every container start, sometimes corrupting data on concurrent starts, (7) no backup/restore story.

**Why it happens:**
Developers test with `docker-compose up` on a clean machine. They never test: upgrades between versions, migration from v1 to v2, running alongside other Docker services, running on low-memory VPS instances, or container restart/crash recovery.

**How to avoid:**
- Use configurable ports via environment variables with sensible non-conflicting defaults (e.g., 8420 not 3000 or 8080).
- Explicitly declare all persistent data as named Docker volumes in docker-compose.yml. Document what each volume contains.
- Add health check endpoints (`/api/health`) and declare HEALTHCHECK in Dockerfile.
- Run as non-root user (create a dedicated user in Dockerfile, `USER node`).
- Set memory and CPU limits in docker-compose.yml (`deploy.resources.limits`).
- Separate migration from application start. Provide a `docker compose run --rm app migrate` command. Never auto-migrate on start in production.
- Provide a documented backup/restore procedure from Day 1, even if it is just `docker compose exec db pg_dump`.
- Test every release with an upgrade scenario: start v1, populate data, upgrade to v2, verify data intact.

**Warning signs:**
- GitHub issues about port conflicts
- Data loss reports after container restarts
- Users unable to run alongside other Docker services
- No upgrade documentation

**Phase to address:**
Phase 1 (Foundation) -- Docker configuration is infrastructure. Getting it right early avoids angry users and data loss. Test upgrade scenarios starting from Phase 2.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Polling instead of WebSocket subscriptions | Simpler implementation for status pages | Server load scales linearly with clients; stale data between polls; poor UX for real-time features | Only for non-time-critical data like settings pages, never for agent status or chat |
| Single global WebSocket connection for everything | Simple connection management | Message routing becomes complex; one slow subscription blocks others; no topic-level backpressure | MVP only, must migrate to multiplexed/channelized approach before adding more than 5 subscription types |
| Storing chat messages in the same DB as operational data | Single database simplifies ops | Chat history grows orders of magnitude faster; query performance degrades for operational queries; cannot independently scale chat storage | Never -- separate chat storage from the start, even if same DB engine |
| Inline styles/one-off components for "just this one page" | Faster delivery of individual page | Inconsistency compounds; 87 pages x 3 one-offs = 261 inconsistent elements | Never in an 87-page app |
| Skipping loading/error/empty states | Page ships faster | Users see blank screens, uncaught errors, and "No data" confusion; makes debugging support requests impossible | Never for user-facing pages; acceptable for internal dev tools |
| Using localStorage for auth tokens | Simple auth implementation | XSS vulnerability exposes tokens; no way to invalidate sessions server-side; tokens persist after logout in some browsers | Never -- use httpOnly cookies with CSRF protection |
| Direct database queries in API routes (no service layer) | Faster initial development | Business logic duplicated across routes; impossible to add audit logging/caching/validation consistently; testing requires HTTP calls | Only for read-only queries in early prototyping; refactor before adding second consumer |

## Integration Gotchas

Common mistakes when connecting to external services specific to AXion Hub's architecture.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenClaw Gateway WebSocket | Treating the WS connection as stateless -- sending a message and expecting a response on the same connection without correlation IDs | Use correlation IDs (UUID) on every request; maintain a pending-requests map; implement timeouts per request (30s); handle response-to-wrong-request routing |
| OpenClaw Gateway REST API | Assuming the gateway is always available; building pages that crash when the gateway is unreachable | Every gateway API call must have: timeout (10s), retry with backoff (3 attempts), and graceful degradation (show "Gateway Unreachable" with cached data rather than crash) |
| WhatsApp/Telegram/Discord/Slack channels | Building a unified "channel" abstraction that papers over fundamental differences between platforms | Model shared capabilities (send text, receive text) in the abstraction, but expose platform-specific features (reactions, threads, rich embeds) through extension points. WhatsApp has 24h session windows; Telegram has bot API rate limits; Discord has intent-based event filtering; Slack has workspace-level auth. Each has unique constraints that cannot be abstracted away |
| LLM Provider APIs (via gateway) | Not handling rate limits and treating all errors the same | Distinguish between: rate limit (429 -- back off and retry), auth error (401 -- alert user), model unavailable (503 -- try failover), context too long (400 -- truncate/summarize). Display appropriate UI for each |
| File system / workspace access | Allowing unrestricted file paths from the UI | Validate all file paths server-side. Canonicalize paths to prevent directory traversal (`../../etc/passwd`). Restrict to a configurable workspace root. Never pass user-provided paths directly to `fs` operations |
| Database (for self-hosted) | Assuming PostgreSQL is installed and configured correctly on user's machine | Ship with embedded SQLite for zero-config start, offer PostgreSQL migration for scale. OR require PostgreSQL but provide it in docker-compose.yml with health checks and automatic schema setup |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering full chat history on conversation open | Page load takes 5+ seconds for long conversations; browser tab uses 500MB+ RAM | Virtual scrolling (react-window or react-virtuoso) for chat. Load only last 50 messages on open, fetch older messages on scroll-up. Store message count, not full content, in list views | 500+ messages per conversation |
| Unthrottled real-time event feed | Dashboard becomes unresponsive during high activity; browser CPU at 100% | Batch event rendering (collect events for 100ms, render batch). Show a "paused - X new events" indicator if rate exceeds 50/sec. Client-side event filtering by type/severity | 10+ events per second sustained |
| Kanban board rendering all cards in all columns | Drag-and-drop stutters; page scroll janks; initial render takes 2s+ | Virtual scrolling per column. Limit visible cards per column (e.g., 20) with "Show more" at bottom. Use CSS contain: content on columns to isolate layout recalculations. Use `will-change: transform` on drag items only during drag | 100+ cards total across columns |
| Fetching full agent detail on agent list page | Agent list API call returns 2MB+ of data; list renders slowly | API should have list endpoint (minimal fields: id, name, status, lastActive) separate from detail endpoint (full config, sessions, metrics). Never fetch full detail for list views | 20+ agents |
| Client-side filtering/sorting of large datasets | Browser freezes during sort; search input lags | Move filtering/sorting to server for any dataset >100 items. Use debounced search (300ms delay). For client-side: use Web Workers for sort/filter operations to keep UI thread free | 500+ rows in any table |
| Unbounded WebSocket subscription scope | Client receives events for all agents/sessions even when viewing a single agent detail page | Subscribe to only the topics the current view needs. Unsubscribe when navigating away (cleanup in useEffect return). Implement topic-based filtering on the server side so irrelevant events never leave the gateway | 10+ agents with active sessions |
| Storing all audit logs in a single unpartitioned table | Audit log queries slow to 10+ seconds; daily DB maintenance windows needed | Partition audit logs by month (PostgreSQL table partitioning). Index on (timestamp, actor_id, resource_type). Archive partitions older than retention period. For SQLite: use separate database file for audit logs | 1M+ audit records (roughly 3-6 months of active usage) |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing gateway API keys in client-side code | Anyone can view source and control the entire gateway -- start/stop agents, read conversations, modify configs | All gateway communication must happen server-side. The dashboard backend is the only component that holds gateway credentials. Client authenticates to dashboard; dashboard authenticates to gateway |
| WebSocket connections without authentication | Anyone who discovers the WebSocket endpoint can subscribe to all events -- reading live conversations, agent status, etc. | Require authentication token on WebSocket upgrade request (as query param or first message). Validate token on server before accepting the connection. Re-validate periodically |
| Chat message injection | Malicious content in agent responses rendered as HTML could execute in the dashboard (stored XSS via the agent) | Always render agent messages as plain text or through a sanitized markdown renderer. Never use `dangerouslySetInnerHTML` or equivalent for agent-generated content. Sanitize with DOMPurify even for markdown output |
| File management directory traversal | Users can read/write files outside the intended workspace by crafting paths like `../../etc/shadow` | Server-side path canonicalization with `path.resolve()` + verify the resolved path starts with the workspace root. Reject any path that resolves outside the root. Do not rely on client-side validation |
| Approval workflow bypass via direct API calls | Users bypass the UI approval queue by calling the gateway API directly, executing unapproved actions | The dashboard backend must be the enforcement point for approvals, not just the UI. Gate all restricted operations through the approval system server-side. If possible, configure the gateway to only accept requests from the dashboard's IP/credentials |
| Credential leakage in audit logs | API keys, tokens, and passwords get logged in audit records as part of "config changed" diffs | Implement a secret scrubbing filter in the audit middleware. Identify fields containing secrets (password, api_key, token, secret) and replace values with "[REDACTED]" before writing to audit storage |
| Insecure default configuration | Default docker-compose ships with `DEBUG=true`, default admin password, no HTTPS, exposed database port | Ship with secure defaults: DEBUG=false, force password change on first login, no exposed database port (internal Docker network only), document HTTPS setup prominently. Run a security checklist on first login |

## UX Pitfalls

Common user experience mistakes specific to AI agent dashboards.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Agent status represented only by color | Colorblind users (8% of males) cannot distinguish red/green status; meaning unclear even for sighted users -- is yellow "warning" or "starting up"? | Use color + icon + text label. Green circle + checkmark + "Running". Red circle + X + "Stopped". Yellow circle + spinner + "Starting". Always have the text label |
| Chat interface that looks like a toy | Users managing production agents need a professional tool, not a ChatGPT clone. Bubble-style messages with rounded corners and bright colors undermine trust | Use a denser, IDE-like layout for the chat panel. Monospace font for code blocks. Clear visual hierarchy: user messages left-aligned plain, agent responses full-width with subtle background. Metadata (timestamp, model, tokens used) visible but not dominant |
| Overwhelming dashboard on first visit | New user sees 17 navigation sections, dozens of metrics, live feeds, and status indicators. They close the tab | Progressive disclosure: start with 3-5 key sections visible. Collapse advanced sections by default. Show a "Getting Started" wizard on first login that walks through: connect gateway, add first agent, send first message |
| Modal dialogs for critical operations | "Are you sure you want to stop all agents?" in a modal that can be dismissed by clicking outside or pressing Escape. Users accidentally confirm destructive actions | For destructive operations, use inline confirmation with typed confirmation (type the agent name to confirm stop). For non-destructive operations, use toast with undo ("Agent paused. Undo?") |
| No indication of what the gateway is doing | User clicks "Deploy Agent" and sees a spinner for 30 seconds with no progress indication. They click again, creating a duplicate. They click a third time | Show step-by-step progress for long operations: "Creating container... Loading model... Binding channels... Ready." Disable the action button during operation. Show estimated time if possible |
| Kanban board that forces rigid workflow | Predefined columns (Backlog/Todo/In Progress/Done) that do not match how the user actually works with agents | Let users customize columns, labels, and transitions. Support "quick actions" from any state (not just adjacent columns). Allow tasks to be in multiple boards/views |
| Audit log that is only for compliance | Audit log exists but is buried 5 clicks deep. Users never look at it. When something goes wrong, they do not know it exists | Surface audit information contextually: on each agent's detail page, show recent activity. On each configuration page, show "Last modified by X, 2 hours ago." Make the full audit log searchable and filterable, not just a chronological dump |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **WebSocket connection:** Often missing reconnection with state recovery -- verify connection survives: laptop sleep/wake, network switch (WiFi to cellular), gateway restart, 1-hour idle timeout, proxy timeout (60s)
- [ ] **Chat streaming:** Often missing interrupted stream recovery -- verify: what happens when network drops mid-stream? Does the partial message persist? Can the user retry? Is the message marked as incomplete?
- [ ] **Agent list:** Often missing offline/unreachable agent handling -- verify: what shows when the gateway is down? Do agents show "unknown" status or cached last-known status? Is there a "last seen" timestamp?
- [ ] **Kanban drag-and-drop:** Often missing conflict resolution -- verify: what happens when two users drag the same card simultaneously? Is there a locking mechanism or last-write-wins with notification?
- [ ] **File browser:** Often missing large file handling -- verify: what happens with 100MB files? Is there a size limit? Does the viewer/editor handle binary files gracefully (show hex dump or "Preview not available")?
- [ ] **Approval queue:** Often missing escalation and timeout -- verify: what happens when an approval request sits for 24 hours? Is there auto-escalation? Does the requesting agent block indefinitely or timeout?
- [ ] **Settings pages:** Often missing validation feedback -- verify: do all settings validate on blur/submit? Do invalid values show inline errors? Does saving show success confirmation? Does the page handle concurrent edits?
- [ ] **Search functionality:** Often missing empty results UX -- verify: does search across 17 sections show "No results in Agents, 3 results in Sessions, ..."? Or does it show a blank screen? Are there search suggestions on empty results?
- [ ] **Role-based access:** Often missing UI-level enforcement -- verify: do restricted users see buttons they cannot click? Or are unauthorized actions hidden entirely? Do API-level and UI-level permissions match?
- [ ] **Data export:** Often missing for large datasets -- verify: what happens when exporting 100k audit records? Is there streaming CSV export? Is there a size warning? Does it run async with a download notification?
- [ ] **Multi-gateway support:** Often missing gateway switching UX -- verify: is it clear which gateway the user is currently connected to? Can they switch without losing context? Are agents correctly scoped to their gateway?
- [ ] **Notification preferences:** Often missing granularity -- verify: can users configure notification level per agent, per event type? Or is it all-or-nothing? Do preferences persist across sessions?

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| WebSocket state desync (UI shows wrong agent states) | LOW | Add a "Refresh All" button that fetches complete state from gateway and reconciles. Implement automatic periodic reconciliation (every 60s). No data loss, just stale UI |
| Chat messages lost due to interrupted streams without persistence | MEDIUM | Implement WAL (write-ahead log) pattern: write stream chunks to temporary storage as they arrive. On stream completion, persist final message. On interruption, recover from WAL. Requires message schema migration |
| Inconsistent components across 87 pages | HIGH | Component audit: grep for common patterns (tables, forms, status badges), create canonical versions, migrate page by page. Budget 1-2 weeks per 10 pages. Cannot be done incrementally -- partially-migrated state is worse |
| Audit log gaps (operations not logged) | MEDIUM | Backfill is impossible (events are gone). Add middleware-level logging and verify with integration tests that every mutating endpoint produces an audit record. Accept the gap and move forward |
| Gateway coupling causing breakage on gateway updates | HIGH | Build the adapter layer. Every existing gateway call must be routed through it. This touches every component that communicates with the gateway. Budget 1-2 weeks for a codebase-wide refactor |
| Docker deployment data loss on upgrade | HIGH | If data is already lost, it is unrecoverable. Implement named volumes, migration tooling, and backup scripts. Add upgrade testing to CI. Communicate to existing users how to back up before upgrading |
| Security breach via chat XSS or file traversal | HIGH | Incident response: audit what was accessed, patch the vulnerability, rotate credentials, notify affected users. Post-incident: add security linting rules, automated penetration testing, input validation middleware |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| WebSocket lifecycle mismanagement | Phase 1 (Foundation) | Integration test: simulate network drop, verify reconnect + state recovery within 10s. Load test: 50 concurrent WS connections with simulated instability |
| Chat streaming breakage | Phase 1 (data model), Phase 2-3 (implementation) | E2E test: stream a 2000-token response, kill network at token 500, verify partial message saved and retry works. Manual test: scroll up during stream, verify no snap-back |
| 87-page component inconsistency | Phase 1 (Foundation) | Component library has Storybook or equivalent with all variants documented. Code review checklist item: "Uses shared components from library?" |
| Optimistic UI without rollback | Phase 2 (Agent Management) | Integration test: trigger agent start, simulate gateway 500 error, verify UI shows error state (not success). Repeat for all lifecycle operations |
| Audit log gaps | Phase 1 (Foundation infrastructure) | Integration test: for every mutating API endpoint, verify an audit record is created with correct actor, action, resource, and diff. Run this test in CI |
| Gateway coupling | Phase 1 (Foundation) | Architecture review: no component outside `lib/gateway/` imports gateway-specific types. All gateway communication goes through `GatewayClient`. Enforce via ESLint import rules |
| Docker deployment issues | Phase 1 (Foundation) | CI pipeline: build Docker image, start with docker-compose, run health check, stop, upgrade to new image, verify data persists. Test on 1GB RAM instance |
| Chat message XSS | Phase 2-3 (Chat) | Automated security test: send messages containing `<script>`, `<img onerror>`, markdown with embedded HTML. Verify none execute in the browser. Add to CI |
| File traversal attacks | Phase relevant to File Management | Automated security test: attempt `../../etc/passwd`, `..\\..\\windows\\system32`, null bytes in paths. All must return 403. Add to CI |
| Approval workflow bypass | Phase relevant to Governance | Integration test: attempt restricted operation via direct API without approval. Verify 403 response. Test with multiple auth roles |
| Performance degradation at scale | Each phase as features are built | Load test suite: 50 agents, 1000 chat messages, 500 kanban cards, 100k audit records. Measure render time, API latency, memory usage. Run before each release |
| Scope creep / building 87 pages without prioritization | All phases (project management) | Define MVP scope (15-20 most critical pages). Ship and validate before building remaining 67 pages. Phase gates: "Does anyone use the pages we already built?" |

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation / Setup | Over-engineering the foundation before validating the product | Time-box foundation to 3-4 weeks. Include one complete user flow (login -> see dashboard -> see agent status) as proof of architecture |
| Authentication | Building a custom auth system with security holes | Use a proven auth library (NextAuth.js, Lucia, or similar). Do not build password hashing, session management, or CSRF protection from scratch |
| Agent Management | Building agent CRUD without understanding gateway capabilities | Spike against real OpenClaw Gateway first. Document actual API endpoints, response shapes, and WebSocket event types before building UI |
| Chat Interface | Underestimating the complexity of multi-agent concurrent chat | Build single-agent chat first. Validate the streaming, tool call, and persistence patterns. Then extend to multi-agent with separate session management |
| Kanban / Task Board | Building a full project management tool instead of agent task orchestration | Keep it focused: tasks are assigned to agents, not humans. Columns represent agent workflow states, not project management stages. Do not build Jira |
| Channel Management | Trying to abstract all messaging platforms into one model | Each channel platform (WhatsApp, Telegram, Discord, Slack) has unique constraints. Build platform-specific adapters, not a leaky universal abstraction |
| Workflow Builder | Building a visual programming environment from scratch | Use an existing flow/node editor library (reactflow). Focus on the agent-specific node types and actions, not the editor mechanics |
| Governance / Approvals | Over-complicating the approval workflow | Start with simple approve/reject. Add escalation, auto-approval rules, and policy engine only after the basic flow is validated with real usage |
| Settings (17 settings pages) | Building all settings pages at once | Build settings on-demand as features that need configuration are built. Do not build a notification settings page before notifications exist |
| Public Pages (landing, docs, blog) | Building public pages before the product works | Defer all public/marketing pages to the last phase. They contribute nothing to core product validation |

## Sources

- Training data on WebSocket architecture patterns, Socket.IO best practices, and real-time application design (MEDIUM confidence -- well-established patterns but not verified against 2026-specific documentation)
- Training data on LLM streaming patterns from OpenAI, Anthropic, and Vercel AI SDK documentation (MEDIUM confidence)
- Training data on React performance patterns, virtual scrolling, and large application architecture (MEDIUM confidence)
- Training data on Docker deployment best practices, self-hosted application patterns (MEDIUM confidence)
- Training data on approval workflow systems, audit logging, and RBAC patterns (MEDIUM confidence)
- Project context from `.planning/PROJECT.md` (HIGH confidence -- direct project documentation)

**NOTE:** Web search and web fetch were unavailable during this research session. All technical claims are based on training data (cutoff ~May 2025) and should be verified against current library documentation during implementation, particularly for specific API patterns and version-specific behavior of chosen libraries.

---
*Pitfalls research for: AI Agent Orchestration Dashboard (AXion Hub)*
*Researched: 2026-02-17*
