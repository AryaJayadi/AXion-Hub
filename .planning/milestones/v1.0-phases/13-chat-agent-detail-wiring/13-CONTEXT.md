# Phase 13: Gap Closure — Chat & Agent Detail Wiring - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the remaining cross-phase entry points so that chat is reachable from dashboard and agents, agent sessions are clickable, and agent detail shows the correct name. Closes INT-03, INT-04, INT-05, INT-07 from v1.0 audit and fixes 3 broken E2E flows.

**Fixed scope — 4 integration gaps, no new features:**
1. Navigating directly to `/chat` populates the AgentPickerDialog with agents
2. Dashboard "Send Message" quick action navigates to `/chat`
3. Per-agent sessions table row click opens SessionSlideOver
4. AgentDetailShell displays the agent's name in the header

</domain>

<decisions>
## Implementation Decisions

### "Send Message" navigation target (INT-04)
- Dashboard "Send Message" button becomes `<Link href="/chat">` using shadcn `asChild` pattern
- No AgentPickerDialog auto-open on arrival — user clicks "New Chat" from the chat hub
- Remove the `toast.info()` stub entirely — silent navigation, no confirmation toast
- This differs from agent detail "Send Message" which correctly deep-links to `/chat/[agentId]` (that already works)
- File: `src/features/dashboard/components/quick-actions.tsx` — replace the Button onClick with Link

### Agent store hydration at `/chat` (INT-03)
- Call `useAgents()` inside `ChatLayout` (`src/features/chat/components/chat-layout.tsx`) — the outermost client component owning the chat UI tree
- Do NOT call it in the route layout (`app/(dashboard)/chat/layout.tsx`) — keep that as a thin server wrapper
- Do NOT call it inside `AgentPickerDialog` — agents should load before the dialog opens
- Rely on TanStack Query's stale-while-revalidate — if store already has agents, show immediately; background refetch handles freshness
- AgentPickerDialog already reads `isLoading` from store — use that for loading skeleton in the picker
- If fetch fails, show inline error with retry button inside the dialog (not a full error boundary)

### Per-agent session slide-over wiring (INT-05)
- Add `onClick` handler + `cursor-pointer` class to each `TableRow` in `agent-sessions-table.tsx`
- Add `selectedSession` state and render `SessionSlideOver` below the table
- Map `AgentSession` → `CrossAgentSession`-compatible shape via a lightweight mapping function (the types overlap, just need to bridge the interface)
- Reuse the existing `SessionSlideOver` component — no duplication
- Add selected-row visual highlight (subtle background change on the active row)
- Do NOT refactor the per-agent table to use shared `DataTable` — that's scope creep for a gap closure phase
- Files: `src/features/agents/components/agent-sessions-table.tsx`, import `SessionSlideOver` from `src/features/sessions/components/session-slide-over.tsx`

### Agent name resolution in detail shell (INT-07)
- Remove `agentName` prop from `AgentDetailShell` interface entirely
- Have the component read agent name from Zustand store using `agentId`: `useAgentStore((s) => s.agents.find((a) => a.id === agentId)?.name)`
- Call `useAgents()` inside `AgentDetailShell` to ensure store is hydrated on direct navigation
- Fallback: show `agentId` as text if agent not found after loading
- This makes the component self-contained — no layout changes needed in `app/(dashboard)/agents/[agentId]/layout.tsx`
- Reactive: renaming an agent in the identity editor automatically updates the shell header via store subscription
- File: `src/widgets/agent-detail-layout/components/agent-detail-shell.tsx`

### Claude's Discretion
- Exact loading skeleton design inside AgentPickerDialog
- Error message copy for failed agent fetch
- Mapping function implementation details (AgentSession → CrossAgentSession)
- Selected-row highlight styling (color, opacity, transition)
- Whether to add a brief inline comment explaining the `useAgents()` call purpose

</decisions>

<specifics>
## Specific Ideas

- The global `SessionsTable` in `sessions-table.tsx` is the reference implementation for row-click + slide-over pattern — mirror its approach
- `AgentPickerDialog` already has `useAgentStore((s) => s.agents)` at line 44 and `isLoading` handling — the store just needs to be populated
- `quick-actions.tsx` already imports `Link` pattern via other buttons — follow the same `asChild` approach
- `AgentDetailShell` is already `"use client"` with `usePathname` — adding Zustand reads is natural, no boundary changes needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. All 4 gaps are tightly scoped wiring fixes.

</deferred>

---

*Phase: 13-gap-closure-chat-agent-detail-wiring*
*Context gathered: 2026-02-20*
