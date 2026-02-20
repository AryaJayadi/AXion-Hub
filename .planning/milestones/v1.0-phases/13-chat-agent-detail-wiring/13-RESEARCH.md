# Phase 13: Gap Closure — Chat & Agent Detail Wiring - Research

**Researched:** 2026-02-20
**Domain:** Cross-phase state wiring (Zustand store hydration, Next.js routing, component composition)
**Confidence:** HIGH

## Summary

Phase 13 is a **pure wiring phase** — no new UI components, no new libraries, no new patterns. The work closes 4 integration gaps (INT-03, INT-04, INT-05, INT-07) identified in the v1.0 milestone audit. Every component already exists; the task is ensuring data flows correctly when users navigate across phase boundaries (dashboard to chat, agents to sessions, direct URL navigation).

The 4 fixes are all small, isolated changes in existing files. The primary risk is not technical complexity but rather getting the patterns exactly right: conditional spread for `exactOptionalPropertyTypes`, correct Zustand selector usage, and proper type mapping between `AgentSession` and `CrossAgentSession`. All patterns have verified precedents in the codebase (Phase 8 sessions table, Phase 11 DataTable onRowClick, Phase 5 quick actions).

**Primary recommendation:** Follow existing codebase patterns exactly. Every fix has a reference implementation in the project already. No new dependencies needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **INT-04 (Send Message navigation):** Dashboard "Send Message" button becomes `<Link href="/chat">` using shadcn `asChild` pattern. No AgentPickerDialog auto-open on arrival. Remove `toast.info()` stub entirely — silent navigation, no confirmation toast. File: `src/features/dashboard/components/quick-actions.tsx`.
- **INT-03 (Agent store at /chat):** Call `useAgents()` inside `ChatLayout` (`src/features/chat/components/chat-layout.tsx`) — the outermost client component. Do NOT call it in the route layout or inside `AgentPickerDialog`. Rely on TanStack Query stale-while-revalidate. Use store `isLoading` for picker skeleton. Show inline error with retry on fetch failure.
- **INT-05 (Per-agent session slide-over):** Add `onClick` handler + `cursor-pointer` to `TableRow` in `agent-sessions-table.tsx`. Add `selectedSession` state and render `SessionSlideOver` below the table. Map `AgentSession` to `CrossAgentSession`-compatible shape via lightweight mapping function. Reuse existing `SessionSlideOver` component. Add selected-row visual highlight. Do NOT refactor per-agent table to use shared `DataTable`.
- **INT-07 (Agent name in header):** Remove `agentName` prop from `AgentDetailShell` interface entirely. Read agent name from Zustand store using `agentId`: `useAgentStore((s) => s.agents.find((a) => a.id === agentId)?.name)`. Call `useAgents()` inside `AgentDetailShell` to ensure hydration on direct navigation. Fallback: show `agentId` as text if agent not found after loading.

### Claude's Discretion
- Exact loading skeleton design inside AgentPickerDialog
- Error message copy for failed agent fetch
- Mapping function implementation details (AgentSession to CrossAgentSession)
- Selected-row highlight styling (color, opacity, transition)
- Whether to add a brief inline comment explaining the `useAgents()` call purpose

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. All 4 gaps are tightly scoped wiring fixes.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | User can access multi-pane chat interface at `/chat` showing all agent conversations | INT-03 fix: `useAgents()` in ChatLayout ensures AgentPickerDialog has agents on direct `/chat` navigation |
| AGNT-01 | User can view all agents in grid/list view with status badges at `/agents` | INT-03 fix: agent store populated via useAgents() independently of /agents page visit |
| DASH-07 | Dashboard provides quick actions: New Task, New Agent, Send Message | INT-04 fix: Send Message navigates to /chat via Link instead of toast stub |
| SESS-01 | User can view all active sessions across all agents at `/sessions` | INT-05 fix: Per-agent sessions table row click opens SessionSlideOver matching global sessions table behavior |
| AGNT-02 | User can view agent overview at `/agents/[agentId]` showing status, model, context usage, uptime, current task | INT-07 fix: AgentDetailShell reads agent name from Zustand store, displays in sidebar header |
</phase_requirements>

## Standard Stack

### Core

No new libraries. Everything needed is already installed:

| Library | Version | Purpose | Already Used In |
|---------|---------|---------|-----------------|
| zustand | ^5.0.11 | Agent store (PUSH state via WebSocket) | `agent-store.ts`, all agent features |
| @tanstack/react-query | ^5.90.21 | Agent fetch hydration (PULL state via REST) | `use-agents.ts`, all data hooks |
| @tanstack/react-table | ^8.21.3 | Agent sessions table | `agent-sessions-table.tsx` |
| next | 16.1.6 | Routing, Link component | Throughout |
| react | 19.2.3 | Component model | Throughout |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | (installed) | Duration/distance formatting | SessionSlideOver, sessions table |
| lucide-react | (installed) | Icons | All UI components |

### Alternatives Considered

None — this phase uses exclusively what is already in the project. No library decisions needed.

**Installation:**
```bash
# No installation needed — all dependencies already present
```

## Architecture Patterns

### Pattern 1: Zustand Store Hydration via useAgents() Hook

**What:** `useAgents()` fires a TanStack Query fetch, then syncs the result into the Zustand `useAgentStore` via a `useEffect`. All downstream consumers read from Zustand (not TanStack Query directly). The query uses `staleTime: Infinity` so it fires once and never refetches — WebSocket events handle subsequent updates.

**When to use:** Whenever a component tree needs access to the agent list and the store might not be populated yet (direct URL navigation).

**Reference implementation:** `src/features/agents/api/use-agents.ts` (lines 126-153)

**Example (verified from codebase):**
```typescript
// Source: src/features/agents/api/use-agents.ts
export function useAgents() {
  const setAgents = useAgentStore((s) => s.setAgents);

  const query = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setAgents(query.data);
    }
  }, [query.data, setAgents]);

  const agents = useAgentStore((s) => s.agents);
  const isLoading = useAgentStore((s) => s.isLoading);

  return {
    agents,
    isLoading: query.isLoading || isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

**Key insight for INT-03 and INT-07:** Calling `useAgents()` in `ChatLayout` or `AgentDetailShell` is safe because TanStack Query deduplicates — if the store is already populated (user came from `/agents`), the query resolves instantly from cache. If the user navigated directly, the query fires and populates the store. The `staleTime: Infinity` ensures no unnecessary refetches.

### Pattern 2: shadcn asChild for Link-Wrapped Buttons

**What:** shadcn buttons accept an `asChild` prop that merges the button's styling onto the child element (typically a Next.js `<Link>`). This creates a button that navigates via client-side routing.

**When to use:** When a button needs to navigate to a route (INT-04: Send Message).

**Reference implementation:** `src/features/dashboard/components/quick-actions.tsx` (lines 16-21 for "New Agent")

**Example (verified from codebase):**
```typescript
// Source: src/features/dashboard/components/quick-actions.tsx
<Button variant="outline" size="sm" asChild>
  <Link href="/agents/new">
    <Bot className="size-4" />
    New Agent
  </Link>
</Button>
```

### Pattern 3: Row Click + SessionSlideOver (Reference Pattern)

**What:** The global `SessionsTable` component manages a `selectedSession` state, passes an `onRowClick` handler to `DataTable`, and renders `SessionSlideOver` below the table. The slide-over opens when `selectedSession` is non-null.

**When to use:** INT-05 needs to replicate this exact pattern in `agent-sessions-table.tsx`, but without using `DataTable` (the per-agent table uses raw TanStack Table directly).

**Reference implementation:** `src/features/sessions/components/sessions-table.tsx` (lines 163-251)

**Example (verified from codebase):**
```typescript
// Source: src/features/sessions/components/sessions-table.tsx
export function SessionsTable({ sessions, isLoading }: SessionsTableProps) {
  const [selectedSession, setSelectedSession] = useState<CrossAgentSession | null>(null);

  const handleRowClick = (session: CrossAgentSession) => {
    setSelectedSession(session);
  };

  return (
    <div className="space-y-4">
      {/* ... table content with onRowClick={handleRowClick} ... */}
      <DataTable
        columns={columns}
        data={sortedSessions}
        onRowClick={handleRowClick}
      />

      <SessionSlideOver
        session={selectedSession}
        open={selectedSession !== null}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
```

### Pattern 4: Zustand Selector for Single Agent Lookup

**What:** Reading a single agent from the Zustand store by ID using `useAgentStore` with a selector that calls `.find()`.

**When to use:** INT-07 needs to read the agent name from the store by `agentId`.

**Example (derived from store structure):**
```typescript
// Read agent name from store by ID
const agentName = useAgentStore(
  (s) => s.agents.find((a) => a.id === agentId)?.name
);
```

**Stability note:** This selector creates a new function reference on every render, which means it will trigger a re-render on every store update (even unrelated ones). However, since the agent list is small (typically < 100 agents) and updates are infrequent (only on WebSocket events), this is fine. If performance ever matters, use `useShallow` from `zustand/react/shallow` — but that is unnecessary here.

### Pattern 5: AgentSession to CrossAgentSession Type Mapping

**What:** `SessionSlideOver` accepts `CrossAgentSession`, which extends `AgentSession` with `agentName`, `agentAvatar`, and `model`. The per-agent sessions table has `AgentSession[]` but needs to feed `CrossAgentSession` to the slide-over.

**When to use:** INT-05 mapping function.

**Type difference (verified from codebase):**
```typescript
// Source: src/entities/agent/model/types.ts
interface AgentSession {
  id: string;
  agentId: string;
  startedAt: Date;
  endedAt?: Date | undefined;
  tokenCount: number;
  compactionCount: number;
  status: "active" | "compacted" | "ended";
}

// Source: src/entities/session/model/types.ts
interface CrossAgentSession extends AgentSession {
  agentName: string;
  agentAvatar: string | undefined;
  model: string;
}
```

**Mapping approach:** The per-agent sessions view knows the `agentId`. The agent's name and model can be read from the Zustand store (same store `useAgents()` populates). The mapping function bridges the interface:

```typescript
function toSlideOverSession(
  session: AgentSession,
  agentName: string,
  agentModel: string,
): CrossAgentSession {
  return {
    ...session,
    agentName,
    agentAvatar: undefined,
    model: agentModel,
  };
}
```

### Anti-Patterns to Avoid
- **Calling useAgents() in server components:** `useAgents()` is a client hook (uses `useQuery`, `useEffect`, `useAgentStore`). It must only be called in `"use client"` components. The route layout `app/(dashboard)/chat/layout.tsx` is a server component — do NOT add `useAgents()` there. Add it in `ChatLayout` (already `"use client"`).
- **Duplicating SessionSlideOver:** Do NOT create a new slide-over component for agent sessions. Reuse the existing one from `src/features/sessions/components/session-slide-over.tsx`.
- **Adding useAgents() inside AgentPickerDialog:** The dialog should already have agents available when it opens. Hydration happens in the parent (`ChatLayout`), not the consumer.
- **Using router.push for Send Message:** The locked decision is `<Link href="/chat">` with `asChild`, NOT `onClick={() => router.push('/chat')}`. Link enables prefetching and follows the existing pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agent store hydration | Custom fetch logic in ChatLayout | `useAgents()` hook | Already handles fetch, cache, store sync, deduplication |
| Session slide-over | New per-agent slide-over component | `SessionSlideOver` from sessions feature | Exact same UI; just needs correct data shape |
| Navigation buttons | Custom onClick + router.push | shadcn `asChild` + Next.js `Link` | Enables prefetching, follows existing pattern |
| Selected row styling | Custom CSS module or styled-component | Tailwind classes matching DataTable pattern | `cursor-pointer` + conditional `bg-accent/50` |

**Key insight:** This phase has zero custom solutions. Every fix reuses an existing hook, component, or pattern.

## Common Pitfalls

### Pitfall 1: exactOptionalPropertyTypes Conditional Spread

**What goes wrong:** TypeScript error when passing an optional prop that could be `undefined` to a component that expects the prop to be either absent or a concrete value. Example: `onRowClick={undefined}` fails; the prop must be conditionally spread.

**Why it happens:** The project uses `exactOptionalPropertyTypes: true` in tsconfig. This means `{ foo?: string }` is NOT the same as `{ foo: string | undefined }` — the former means "may be absent" while the latter means "must be present but can be undefined."

**How to avoid:** Use conditional spread pattern:
```typescript
// WRONG
<VirtualizedTable onRowClick={undefined} />

// RIGHT
<VirtualizedTable {...(onRowClick ? { onRowClick } : {})} />
```

**Warning signs:** TypeScript error `Type 'undefined' is not assignable to type '...'` on optional props.

**Applies to:** INT-05 if the agent sessions table ever passes props conditionally. However, since this table uses raw TanStack Table (not DataTable), the pattern applies to the `SessionSlideOver` `session` prop, which is already `CrossAgentSession | null` and handled by the component.

### Pitfall 2: Stale Store on Direct Navigation

**What goes wrong:** User navigates directly to `/chat` or `/agents/[agentId]`. The Zustand agent store is empty because `useAgents()` was never called (the user didn't visit `/agents` first).

**Why it happens:** Zustand stores initialize with `agents: []` and `isLoading: true`. Without a `useAgents()` call, no fetch fires and the store stays empty.

**How to avoid:** Call `useAgents()` in any component that needs agents on first render. TanStack Query deduplicates, so multiple `useAgents()` calls across the tree are safe and don't cause extra fetches.

**Warning signs:** Empty agent list in picker dialog, missing agent name in header. The `isLoading` flag from the store covers the "loading but not yet populated" state.

### Pitfall 3: AgentSession Missing `model` Field

**What goes wrong:** `AgentSession` does not have a `model` field. `CrossAgentSession` requires one. If the mapping function doesn't supply it, TypeScript will error.

**Why it happens:** `AgentSession` is a session-level type (token counts, timing). The `model` field lives on the `Agent` entity, not the session. The mapping function must pull model from the agent store.

**How to avoid:** Read the agent from store via `useAgentStore`, extract `model`, and pass it to the mapping function. If the agent is not found in store (edge case on direct navigation before hydration), fall back to `"unknown"`.

### Pitfall 4: Click Event Propagation on CopyableId

**What goes wrong:** Clicking the copy button in the Session ID column of `agent-sessions-table.tsx` triggers both the copy action AND the row click handler (opening the slide-over).

**Why it happens:** The `CopyableId` button is a child of the `TableRow`. Click events bubble up from the button to the row.

**How to avoid:** Add `e.stopPropagation()` in the `CopyableId` click handler:
```typescript
const handleCopy = (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent row click
  void navigator.clipboard.writeText(id);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
};
```

**Warning signs:** Slide-over opens when user tries to copy a session ID.

### Pitfall 5: Removing agentName Prop Without Updating Layout

**What goes wrong:** After removing `agentName` from `AgentDetailShell`'s props interface, the route layout file (`app/(dashboard)/agents/[agentId]/layout.tsx`) might still pass it. TypeScript will catch this, but it's worth noting.

**Why it happens:** The layout currently passes `agentId` but NOT `agentName` (the prop was optional and never wired). So removing the prop is actually clean — no call sites need updating.

**Current layout (verified):**
```typescript
// Source: app/(dashboard)/agents/[agentId]/layout.tsx
return <AgentDetailShell agentId={agentId}>{children}</AgentDetailShell>;
```
No `agentName` prop is being passed, so removing it from the interface causes zero breakage.

## Code Examples

Verified patterns from the codebase for each fix:

### INT-03: useAgents() Call in ChatLayout

```typescript
// Source: Target file — src/features/chat/components/chat-layout.tsx
// Add this import:
import { useAgents } from "@/features/agents/api/use-agents";

// Inside ChatLayout function body (before return):
// Hydrate agent store for AgentPickerDialog (handles direct /chat navigation)
useAgents();
```

### INT-04: Link-Wrapped Send Message Button

```typescript
// Source: Target file — src/features/dashboard/components/quick-actions.tsx
// Replace the onClick toast button with:
<Button variant="outline" size="sm" asChild>
  <Link href="/chat">
    <MessageSquare className="size-4" />
    Send Message
  </Link>
</Button>
```

The `toast` import and `sonner` import become unused and should be removed.

### INT-05: Row Click + SessionSlideOver in Agent Sessions Table

```typescript
// Source: Target file — src/features/agents/components/agent-sessions-table.tsx
// Add to imports:
import type { CrossAgentSession } from "@/entities/session";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { SessionSlideOver } from "@/features/sessions/components/session-slide-over";

// Mapping function:
function toSlideOverSession(
  session: AgentSession,
  agentName: string,
  agentModel: string,
): CrossAgentSession {
  return {
    ...session,
    agentName,
    agentAvatar: undefined,
    model: agentModel,
  };
}

// Inside AgentSessionsTable component, add state + agent lookup:
const [selectedSession, setSelectedSession] = useState<CrossAgentSession | null>(null);
const agentId = sessions[0]?.agentId ?? "";
const agent = useAgentStore((s) => s.agents.find((a) => a.id === agentId));

// Row click handler:
const handleRowClick = (session: AgentSession) => {
  setSelectedSession(
    toSlideOverSession(
      session,
      agent?.name ?? agentId,
      agent?.model ?? "unknown",
    )
  );
};

// On each TableRow, add onClick and cursor:
<TableRow
  key={row.id}
  className={cn(
    "cursor-pointer",
    selectedSession?.id === row.original.id && "bg-accent/50",
  )}
  onClick={() => handleRowClick(row.original)}
>

// After the table's closing div, render the slide-over:
<SessionSlideOver
  session={selectedSession}
  open={selectedSession !== null}
  onClose={() => setSelectedSession(null)}
/>
```

### INT-07: Agent Name from Zustand Store

```typescript
// Source: Target file — src/widgets/agent-detail-layout/components/agent-detail-shell.tsx
// Add imports:
import { useAgentStore } from "@/features/agents/model/agent-store";
import { useAgents } from "@/features/agents/api/use-agents";

// Remove agentName from interface:
interface AgentDetailShellProps {
  agentId: string;
  children: React.ReactNode;
}

// Inside component, before return:
// Hydrate agent store (handles direct /agents/[id] navigation)
useAgents();
const agentName = useAgentStore((s) => s.agents.find((a) => a.id === agentId)?.name);

// The template already handles conditional rendering:
{agentName && (
  <div className="px-4 py-3 border-b border-border">
    <p className="text-sm font-semibold truncate">{agentName}</p>
  </div>
)}
```

Fallback behavior: while agents load, `agentName` is `undefined` so the header section is hidden. Once the store populates, it renders reactively. If the agent is genuinely not found (deleted, invalid ID), the section stays hidden and the agent ID is visible in the URL — acceptable for an edge case.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Props drilling agent name from server layout | Zustand store read in client component | This phase | Self-contained component, no layout coupling |
| Toast stubs for unfinished features | Real navigation links | This phase (Phase 5 used toast; now wired) | Users can actually reach /chat from dashboard |
| Separate session tables per context | Shared SessionSlideOver with type mapping | Phase 8 established, Phase 13 extends | Consistent session detail UX across routes |

**Deprecated/outdated:**
- `agentName` prop on `AgentDetailShell`: removed in this phase. Store-based lookup replaces it.
- `toast.info("Coming soon")` pattern for Send Message: replaced with actual Link navigation.

## Open Questions

1. **CopyableId stopPropagation**
   - What we know: The `CopyableId` button exists in `agent-sessions-table.tsx` rows. Adding row click will create event bubbling.
   - What's unclear: Whether the current `handleCopy` implementation already handles this.
   - Recommendation: Add `e.stopPropagation()` to `handleCopy` as a preventive measure. It is currently missing (verified in codebase lines 83-87).

2. **AgentPickerDialog isLoading skeleton**
   - What we know: The dialog already checks `agents.length === 0` for empty state messaging. The store has `isLoading`.
   - What's unclear: Whether a loading skeleton is needed or if the existing empty-state message is sufficient during the brief loading window.
   - Recommendation: The existing empty state text "No agents available. Connect to a gateway to see agents." covers it. The fetch takes ~400ms (mock delay). Adding a skeleton is optional (Claude's discretion per CONTEXT.md).

## Sources

### Primary (HIGH confidence)
- Codebase files read directly:
  - `src/features/agents/api/use-agents.ts` — useAgents() hook pattern
  - `src/features/agents/model/agent-store.ts` — Zustand store structure
  - `src/features/chat/components/chat-layout.tsx` — ChatLayout component
  - `src/features/chat/components/agent-picker-dialog.tsx` — AgentPickerDialog consumer
  - `src/features/dashboard/components/quick-actions.tsx` — Send Message button
  - `src/features/agents/components/agent-sessions-table.tsx` — Per-agent sessions table
  - `src/features/sessions/components/sessions-table.tsx` — Reference row-click + slide-over pattern
  - `src/features/sessions/components/session-slide-over.tsx` — SessionSlideOver component
  - `src/widgets/agent-detail-layout/components/agent-detail-shell.tsx` — AgentDetailShell
  - `src/entities/agent/model/types.ts` — AgentSession type
  - `src/entities/session/model/types.ts` — CrossAgentSession type
  - `src/shared/ui/data-table.tsx` — DataTable onRowClick + conditional spread
  - `app/(dashboard)/agents/[agentId]/layout.tsx` — Route layout (confirms no agentName passed)
  - `app/(dashboard)/chat/layout.tsx` — Chat route layout (server component)
  - `package.json` — Library versions

### Secondary (MEDIUM confidence)
- `.planning/v1.0-MILESTONE-AUDIT.md` — Integration gap definitions (INT-03/04/05/07)
- `.planning/phases/13-gap-closure-chat-agent-detail-wiring/13-CONTEXT.md` — User decisions

### Tertiary (LOW confidence)
None — all findings verified directly from codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all versions verified from package.json
- Architecture: HIGH — all patterns verified by reading existing implementations in the codebase
- Pitfalls: HIGH — all identified from code inspection of actual files involved

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable — no library changes expected; all fixes use existing code)
