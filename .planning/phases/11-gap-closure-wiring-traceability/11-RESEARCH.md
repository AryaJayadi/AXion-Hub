# Phase 11: Gap Closure — Cross-Phase Wiring & Traceability - Research

**Researched:** 2026-02-20
**Domain:** Cross-phase integration wiring, sidebar navigation, chat/agent/alert bridging, auth middleware, REQUIREMENTS.md traceability
**Confidence:** HIGH

## Summary

Phase 11 is a pure wiring phase: no new features, no new libraries, no new patterns. Every gap identified in the v1.0 milestone audit traces to code that already exists but is either (a) not connected, (b) has a no-op handler, (c) uses a fragile pattern, or (d) has stale documentation. The codebase already has all the UI components, stores, schemas, and patterns needed; the work is surgical edits to connect them.

There are six distinct work areas: (1) adding 7 missing sidebar navigation links to `navigationConfig`, (2) wiring chat entry points (New Chat, Start Chat, Send Message) to the existing `AgentPickerDialog` and fixing the TanStack Query key mismatch, (3) creating a `middleware.ts` at the project root using better-auth's `getSessionCookie` for edge-level route protection, (4) fixing the `SessionsTable` row click from DOM event delegation to proper component callback with a slide-over panel, (5) wiring the alert notification bridge (DB to Zustand to NotificationBell with sonner toast), and (6) updating REQUIREMENTS.md traceability (INFR checkboxes, SITE status, SESS-01 status).

**Primary recommendation:** Organize work into 3 waves: Wave 1 handles sidebar nav + REQUIREMENTS.md traceability (low risk, independent); Wave 2 handles chat wiring + agent quick actions + sessions table fix (medium complexity, interconnected); Wave 3 handles middleware.ts + alert bridge (infrastructure-level, requires careful testing).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- /monitor goes under **Operations** group (alongside Gateway, Channels, Models, Activity, Files)
- /sessions and /memory go under **Core** group (alongside Dashboard, Agents, Chat, Missions)
- /audit, /governance/policies, and /deliverables go under **System** group (alongside Approvals, Settings)
- /plugins goes under **Automation** group (alongside Workflows, Skills)
- Final sidebar structure:
  - **Core:** Dashboard, Agents, Chat, Missions, Sessions, Memory
  - **Operations:** Gateway, Channels, Models, Activity, Files, Monitor
  - **Automation:** Workflows, Skills, Plugins
  - **System:** Approvals, Deliverables, Audit, Governance, Settings
- "New Chat" button in chat hub opens the AgentPickerDialog
- "Start Chat" empty-state button in conversation sidebar opens the same AgentPickerDialog (consistent behavior)
- After picking an agent, resume existing conversation if one exists (navigate to /chat/[agentId])
- Fix TanStack Query key mismatch: align AgentPickerDialog to use ['agents'] matching useAgents (shared cache, instant visibility of new agents)
- Wire the DB→Zustand→NotificationBell bridge only; leave rule evaluation as TODO for when real gateway data is available
- When an alert fires: badge count on bell icon AND a sonner toast notification
- NotificationBell dropdown shows preview list of last 5-10 alerts with severity badges; clicking one navigates to /monitor/alerts
- Toast alert notification navigates to the specific alert detail (affected resource)
- "Send Message" opens the AgentPickerDialog with the agent pre-selected (confirm before navigating)
- Wire ALL quick actions that have working targets — not just Send Message
- SessionsTable row click fixed with proper component callback (not DOM event delegation)
- Session row click opens a slide-over panel (not full page navigation)
- Slide-over shows summary info: token usage, duration, status, agent name, and a "View full transcript" link to /sessions/[sessionId]

### Claude's Discretion
- Exact sidebar link ordering within each group
- Icon selection for new sidebar links
- Slide-over animation and sizing
- Toast notification auto-dismiss timing
- Alert preview list styling and severity badge design

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-06 | User session persists across browser refresh with secure cookie/token management via better-auth | Middleware.ts at project root using `getSessionCookie` from better-auth/cookies for edge-level route protection. Layout-level auth already works; this adds the missing edge layer. |
| CHAT-01 | User can access multi-pane chat interface at /chat showing all agent conversations | Fix "New Chat" button in ChatHubView and "Start Chat" in ConversationSidebar empty state to call `onNewChat` which opens AgentPickerDialog. Fix query key mismatch so new agents appear immediately. |
| AGNT-01 | User can view all agents in grid/list view with status badges at /agents | Fix TanStack Query key alignment: AgentPickerDialog uses `queryKeys.agents.lists()` = `['agents','list']` but useAgents uses `['agents']`. Align to single key so cache is shared. |
| AGNT-02 | User can view agent overview at /agents/[agentId] showing status, model, context usage, uptime, current task | Wire "Send Message" quick action (currently disabled) and all other quick actions with working targets. SessionsTable row click fix. |
| MNTR-01 | User can view real-time event stream across all agents and channels at /activity | Add /monitor sidebar link under Operations group so the monitoring pages are discoverable. |
| MNTR-04 | User can configure alert rules and view notification history at /monitor/alerts | Wire DB→Zustand→NotificationBell bridge: poll or subscribe for new alert_notifications rows, push to alertStore.addAlert(), show sonner toast. NotificationBell click navigates to /monitor/alerts. |
| SESS-01 | User can view all active sessions across all agents at /sessions | Fix SessionsTable row click from DOM event delegation to proper `onRowClick` callback. Add session slide-over panel using Sheet component. Add /sessions to sidebar. |
| MEMO-01 | User can browse memories across all agents at /memory | Add /memory to sidebar under Core group. Page already exists at `app/(dashboard)/memory/page.tsx`. |
| GOVR-03 | User can view immutable audit log of all actions at /audit | Add /audit to sidebar under System group. Page already exists at `app/(dashboard)/audit/page.tsx`. |
| FILE-03 | User can view all task deliverables in one place at /deliverables | Add /deliverables to sidebar under System group. Page already exists at `app/(dashboard)/deliverables/page.tsx`. |
</phase_requirements>

## Standard Stack

### Core (already installed, no new dependencies)
| Library | Purpose | Why Standard |
|---------|---------|--------------|
| better-auth | Auth middleware (getSessionCookie) | Already used for auth; provides cookie-only edge check |
| zustand | Alert store (useAlertStore) | Already used for all push-state stores |
| @tanstack/react-query | Query key alignment | Already used for all pull-state hooks |
| sonner | Toast notifications for alerts | Already used across settings features |
| shadcn/ui Sheet | Session slide-over panel | Already used for task-slide-over in missions |
| lucide-react | Icons for new sidebar links | Already the icon library for the entire project |

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| framer-motion (v12.34.1) | Slide-over animation polish | Optional for slide-over entrance if shadcn Sheet animation is insufficient |
| nuqs | URL state for session slide-over | Already used in SessionsTable for group query param |

### Alternatives Considered
None. This phase uses exclusively existing libraries and patterns. No new dependencies needed.

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Existing Project Structure (relevant paths)
```
src/
├── widgets/app-shell/config/navigation.ts    # Sidebar nav config (ADD 7 links)
├── features/chat/components/
│   ├── agent-picker-dialog.tsx               # FIX query key
│   ├── chat-layout.tsx                       # Already wires AgentPickerDialog
│   └── conversation-sidebar.tsx              # FIX empty state onClick
├── views/chat/chat-hub-view.tsx              # FIX "New Chat" onClick
├── features/agents/components/
│   ├── agent-quick-actions.tsx               # WIRE Send Message + others
│   └── agent-sessions-table.tsx              # Agent-specific (NOT the cross-agent one)
├── features/sessions/components/
│   └── sessions-table.tsx                    # FIX row click delegation
├── features/dashboard/
│   ├── model/alert-store.ts                  # EXISTS with addAlert, markRead
│   ├── model/alert-schema.ts                 # DB schema for alert_notifications
│   ├── components/notification-bell.tsx      # EXISTS, reads from alertStore
│   └── api/use-alert-rules.ts               # Existing alert rules hook
├── features/auth/lib/auth.ts                 # Server auth config
├── features/auth/lib/auth-client.ts          # Client auth exports
├── shared/lib/query-keys.ts                  # Centralized query key factory
├── shared/ui/sheet.tsx                       # Sheet component for slide-overs
app/
├── middleware.ts                             # CREATE (does not exist yet)
└── (dashboard)/
    ├── sessions/page.tsx                     # EXISTS
    ├── memory/page.tsx                       # EXISTS
    ├── audit/page.tsx                        # EXISTS
    ├── deliverables/page.tsx                 # EXISTS
    ├── plugins/page.tsx                      # EXISTS
    ├── monitor/page.tsx                      # EXISTS
    └── governance/policies/page.tsx          # EXISTS
.planning/
└── REQUIREMENTS.md                           # UPDATE checkboxes + traceability
```

### Pattern 1: Sidebar Navigation Config (Data-Driven)
**What:** The sidebar is entirely data-driven from `navigationConfig` in `src/widgets/app-shell/config/navigation.ts`. Adding links is purely additive — add items to the appropriate group's `items` array.
**When to use:** Adding any new sidebar link.
**Current state:**
```typescript
// Current groups: Core (4 items), Operations (5 items), Automation (2 items), System (2 items)
// After: Core (6 items), Operations (6 items), Automation (3 items), System (5 items)
```
**Example (adding Sessions to Core):**
```typescript
import { Clock } from "lucide-react"; // or Terminal, MemoryStick, etc.

// In the Core group items array:
{ title: "Sessions", url: "/sessions", icon: Clock },
```

### Pattern 2: AgentPickerDialog Query Key Fix
**What:** `AgentPickerDialog` uses `queryKeys.agents.lists()` which resolves to `['agents', 'list']`, but `useAgents` in `src/features/agents/api/use-agents.ts` uses `['agents']` directly. The caches are separate, so creating a new agent via the wizard (which invalidates `['agents']`) does not update the picker.
**Fix:** Change AgentPickerDialog to use `['agents']` (matching `useAgents`), OR change `useAgents` to use `queryKeys.agents.lists()`. Since `useAgents` already uses `['agents']` with `staleTime: Infinity` and syncs to Zustand, the simpler fix is to align the AgentPickerDialog to query `['agents']` directly.
**Key insight:** The `useAgents` hook fetches with key `['agents']` and syncs to Zustand. The AgentPickerDialog should either: (a) read from Zustand via `useAgentStore`, or (b) use the same `['agents']` query key. Option (a) is better because it gets real-time WebSocket updates for free.

### Pattern 3: Chat Entry Point Wiring
**What:** ChatHubView and ConversationSidebar have no-op onClick handlers that should open the AgentPickerDialog.
**ChatHubView problem:** The `EmptyState` action `onClick` is an empty function. But `ChatHubView` renders inside `ChatLayout` which already manages `agentPickerOpen` state. The fix requires passing the open callback down.
**ConversationSidebar problem:** The `EmptyState` action `onClick` is also an empty function, but `ConversationSidebar` already receives `onNewChat` prop. The fix is to wire the empty state's `onClick` to call `onNewChat`.
**Example fix for ConversationSidebar:**
```typescript
// Currently:
action={{
    label: "Start Chat",
    onClick: () => {
        /* Agent picker dialog will be wired in 04-02 */
    },
}}

// Fixed:
action={{
    label: "Start Chat",
    onClick: () => onNewChat?.(),
}}
```

### Pattern 4: Better-Auth Edge Middleware
**What:** Create `middleware.ts` at project root (Next.js convention) using `getSessionCookie` from `better-auth/cookies` for optimistic cookie-based route protection.
**Important:** This is an optimistic check only (cookie existence, not validation). The actual secure check happens in the `(dashboard)/layout.tsx` server component which calls `auth.api.getSession()`. The middleware prevents unnecessary RSC rendering for unauthenticated users.
**Example (from better-auth official docs):**
```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_PATHS = [...AUTH_PAGES, "/verify-email", "/invite", "/api/auth"];

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

    // Allow public paths through
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        // Redirect authenticated users away from auth pages
        if (sessionCookie && AUTH_PAGES.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // Protected routes: redirect to login if no session
    if (!sessionCookie) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
    ],
};
```

### Pattern 5: Session Slide-Over (Sheet Component)
**What:** Replace DOM event delegation row click with proper `onRowClick` callback on DataTable rows. Open a Sheet (slide-over) panel on click instead of full-page navigation.
**Existing pattern:** `TaskSlideOver` in `src/features/missions/components/task-slide-over.tsx` uses the exact same pattern — Sheet from right, summary content, link to full detail.
**DataTable limitation:** The current `DataTable` component does NOT have an `onRowClick` prop. Two approaches:
  1. Add `onRowClick` to `DataTable` (additive, non-breaking change)
  2. Wrap rows with click handlers at the SessionsTable level (avoid modifying shared component)
**Recommendation:** Add `onRowClick?: (row: TData) => void` to `DataTable` — this is a clean, reusable addition that fixes the fragile DOM delegation pattern globally.

### Pattern 6: Alert Notification Bridge (DB → Zustand → UI)
**What:** Wire alert notifications from DB to the client. The alert worker writes to `alert_notifications` table but nothing reads them back to the client.
**Approach (per user decision):** Bridge only, no rule evaluation changes.
  1. Create an API route `GET /api/alerts/notifications` that queries recent `alert_notifications` from DB
  2. Create a TanStack Query hook `useAlertNotifications` that polls this endpoint (e.g., every 30 seconds)
  3. On new notifications arriving, call `alertStore.addAlert()` for each new one AND fire a `toast()` from sonner
  4. NotificationBell already reads from `alertStore` — no changes needed to the bell itself except adding navigation on click
**Alternative considered:** WebSocket push via EventBus. Rejected because the alert worker runs in a BullMQ process, not the Next.js server. Polling is simpler and matches the "bridge only" decision.

### Anti-Patterns to Avoid
- **DOM event delegation for row clicks:** The current `SessionsTable` finds the row index by traversing `parentElement.children`. This breaks with virtual scrolling (rows are repositioned) and row reordering. Use proper callback props instead.
- **Separate query keys for the same data:** `['agents']` vs `['agents', 'list']` creates cache fragmentation. One source of truth per data entity.
- **No-op handlers left as TODOs:** The chat entry points have empty functions with comments like "will be wired in 04-02". Phase 4 is long complete. Wire them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide-over panel | Custom animated drawer | shadcn Sheet component (`src/shared/ui/sheet.tsx`) | Already used by TaskSlideOver, has accessibility, animation, and responsive behavior built in |
| Toast notifications | Custom notification system | sonner (`toast()`) | Already imported and used in 10+ files across the project |
| Edge auth check | Custom cookie parsing | `getSessionCookie` from `better-auth/cookies` | Handles cookie name, prefix, encoding correctly for all better-auth configurations |
| Alert polling | Custom setInterval/fetch | TanStack Query with `refetchInterval` | Built-in polling, error handling, deduplication, and cache management |

**Key insight:** Every component needed already exists in the project. This phase is about connecting, not creating.

## Common Pitfalls

### Pitfall 1: Query Key Hierarchy Mismatch
**What goes wrong:** Using `['agents', 'list']` in one place and `['agents']` in another means cache invalidation of `['agents']` technically invalidates both (TanStack Query matches by prefix), but the data shapes may differ if the query functions return different things.
**Why it happens:** The `queryKeys` factory provides hierarchical keys by convention, but `useAgents` was written before the factory existed and uses a flat key.
**How to avoid:** Align the AgentPickerDialog to read from Zustand (useAgentStore) instead of making its own TanStack Query call. This is the cleanest fix because: (a) agents are already in Zustand via WebSocket updates, (b) no second network request, (c) instant visibility of new agents.
**Warning signs:** Agent created in wizard doesn't appear in chat picker without page refresh.

### Pitfall 2: Middleware Matcher Too Broad
**What goes wrong:** Next.js middleware runs on EVERY request including static assets if matcher is wrong. This causes redirect loops, broken images, and slow page loads.
**Why it happens:** Default `matcher: ['/(.*)]` catches everything.
**How to avoid:** Use the standard negative lookahead matcher that excludes `_next/static`, `_next/image`, and common static file extensions. This is the exact pattern from Next.js docs and better-auth integration guide.
**Warning signs:** Images/CSS failing to load, infinite redirect loops on auth pages.

### Pitfall 3: Alert Polling Race Condition
**What goes wrong:** If the polling hook fires while the component is unmounting, or if multiple components mount the same hook, duplicate toasts appear.
**Why it happens:** No deduplication between what's already in the Zustand store and what arrives from the API.
**How to avoid:** Track the last-seen notification ID or timestamp. Only call `addAlert()` for notifications newer than the last processed one. Use a `useRef` to track the last-processed ID.
**Warning signs:** Same alert appearing multiple times in the notification bell list.

### Pitfall 4: Sheet Component and exactOptionalPropertyTypes
**What goes wrong:** TypeScript errors when spreading props that might be undefined.
**Why it happens:** The project uses `exactOptionalPropertyTypes: true` in tsconfig, which means `{ prop?: string }` does NOT accept `undefined` as a value — you must either provide a string or omit the property entirely.
**How to avoid:** Use conditional spread: `...(value !== undefined ? { prop: value } : {})` instead of `prop: value ?? undefined`.
**Warning signs:** Type error "Type 'undefined' is not assignable to type 'string'" on optional props.

### Pitfall 5: ChatHubView Cannot Access AgentPickerDialog State
**What goes wrong:** `ChatHubView` renders an `EmptyState` with a "New Chat" button, but the `agentPickerOpen` state lives in `ChatLayout` (parent). The EmptyState is rendered as `children` of `ChatLayout`, so it cannot directly call `setAgentPickerOpen`.
**Why it happens:** React's one-way data flow — children can't call parent state setters without explicit callback passing.
**How to avoid:** Two options: (a) Pass a callback through ChatLayout's children via render prop or context, or (b) Lift the agent picker state to a Zustand store or use the chat store. Option (a) is simpler: add an `onNewChat` callback from ChatLayout that children can call, or pass it via React context.
**Warning signs:** "New Chat" button in hub empty state still does nothing after wiring conversation sidebar.

## Code Examples

### Example 1: Navigation Config Update
```typescript
// src/widgets/app-shell/config/navigation.ts
// Source: Codebase pattern (existing file)
import {
    LayoutDashboard, Bot, MessageSquare, Kanban,
    Radio, Globe, Brain, Activity, FolderOpen,
    Workflow, Plug, Shield, Settings,
    // New icons for added links:
    Clock, BookOpen, MonitorCheck, ScrollText, FileOutput, Package,
} from "lucide-react";

export const navigationConfig: NavGroup[] = [
    {
        label: "Core",
        items: [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            { title: "Agents", url: "/agents", icon: Bot },
            { title: "Chat", url: "/chat", icon: MessageSquare },
            { title: "Missions", url: "/missions", icon: Kanban },
            { title: "Sessions", url: "/sessions", icon: Clock },
            { title: "Memory", url: "/memory", icon: BookOpen },
        ],
    },
    {
        label: "Operations",
        items: [
            { title: "Gateway", url: "/gateway", icon: Radio },
            { title: "Channels", url: "/channels", icon: Globe },
            { title: "Models", url: "/models", icon: Brain },
            { title: "Activity", url: "/activity", icon: Activity },
            { title: "Files", url: "/workspace", icon: FolderOpen },
            { title: "Monitor", url: "/monitor", icon: MonitorCheck },
        ],
    },
    {
        label: "Automation",
        items: [
            { title: "Workflows", url: "/workflows", icon: Workflow },
            { title: "Skills", url: "/skills", icon: Plug },
            { title: "Plugins", url: "/plugins", icon: Package },
        ],
    },
    {
        label: "System",
        items: [
            { title: "Approvals", url: "/approvals", icon: Shield },
            { title: "Deliverables", url: "/deliverables", icon: FileOutput },
            { title: "Audit", url: "/audit", icon: ScrollText },
            { title: "Governance", url: "/governance/policies", icon: Shield },
            { title: "Settings", url: "/settings", icon: Settings },
        ],
    },
];
```

### Example 2: DataTable onRowClick Addition
```typescript
// Source: Codebase pattern (src/shared/ui/data-table.tsx)
// Add to DataTableProps interface:
interface DataTableProps<TData, TValue> {
    // ... existing props ...
    /** Callback when a row is clicked */
    onRowClick?: (row: TData) => void;
}

// In the non-virtualized table body:
<TableRow
    key={row.id}
    data-state={row.getIsSelected() ? "selected" : undefined}
    className={cn(onRowClick && "cursor-pointer")}
    onClick={() => onRowClick?.(row.original)}
>

// In the virtualized table body:
<TableRow
    key={row.id}
    data-index={virtualRow.index}
    className={cn(onRowClick && "cursor-pointer")}
    onClick={() => onRowClick?.(row.original)}
>
```

### Example 3: Session Slide-Over Component
```typescript
// Source: Pattern from TaskSlideOver (src/features/missions/components/task-slide-over.tsx)
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import type { CrossAgentSession } from "@/entities/session";

interface SessionSlideOverProps {
    session: CrossAgentSession | null;
    open: boolean;
    onClose: () => void;
}

export function SessionSlideOver({ session, open, onClose }: SessionSlideOverProps) {
    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{session?.agentName} Session</SheetTitle>
                    <SheetDescription>Session summary</SheetDescription>
                </SheetHeader>
                {session && (
                    <div className="space-y-4 p-4">
                        {/* Summary fields: status, token usage, duration, agent name */}
                    </div>
                )}
                <SheetFooter>
                    <Button asChild variant="outline">
                        <Link href={`/sessions/${session?.id}`}>
                            View full transcript
                        </Link>
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
```

### Example 4: Alert Notification Bridge Hook
```typescript
// Source: Pattern from existing TanStack Query hooks in the project
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAlertStore } from "@/features/dashboard";
import { queryKeys } from "@/shared/lib/query-keys";

export function useAlertNotificationBridge() {
    const addAlert = useAlertStore((s) => s.addAlert);
    const lastSeenRef = useRef<string | null>(null);

    const { data: notifications } = useQuery({
        queryKey: queryKeys.alerts.notifications(),
        queryFn: async () => {
            const res = await fetch("/api/alerts/notifications?limit=10");
            if (!res.ok) return [];
            return res.json();
        },
        refetchInterval: 30_000,  // Poll every 30 seconds
        staleTime: 15_000,
    });

    useEffect(() => {
        if (!notifications?.length) return;
        const newest = notifications[0];
        if (newest.id === lastSeenRef.current) return;

        // Find new notifications since last seen
        const lastIdx = lastSeenRef.current
            ? notifications.findIndex((n: { id: string }) => n.id === lastSeenRef.current)
            : notifications.length;
        const newOnes = notifications.slice(0, lastIdx === -1 ? notifications.length : lastIdx);

        for (const n of newOnes.reverse()) {
            addAlert({
                id: n.id,
                ruleId: n.ruleId,
                ruleName: n.ruleName ?? "Alert",
                severity: n.severity,
                message: n.message,
                timestamp: new Date(n.createdAt),
                read: n.read,
            });
            toast.warning(n.message, {
                description: n.ruleName,
                duration: 8000,
            });
        }

        lastSeenRef.current = newest.id;
    }, [notifications, addAlert]);
}
```

### Example 5: ConversationSidebar Empty State Fix
```typescript
// Source: Codebase (src/features/chat/components/conversation-sidebar.tsx)
// Current broken code:
action={{
    label: "Start Chat",
    onClick: () => {
        /* Agent picker dialog will be wired in 04-02 */
    },
}}

// Fixed code:
action={{
    label: "Start Chat",
    ...(onNewChat ? { onClick: onNewChat } : { onClick: () => {} }),
}}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| proxy.ts as app/proxy.ts (Next.js 14 convention) | middleware.ts at project root (Next.js 15+ convention) | Next.js 15 | middleware.ts is the standard location; app/proxy.ts never worked because it was never imported into a middleware.ts |
| DOM event delegation for table rows | onRowClick callback prop | Best practice | Fragile DOM traversal breaks with virtual scrolling; callback is reliable |
| Separate query keys per consumer | Shared Zustand store for real-time data | Project pattern established Phase 3 | AgentPickerDialog should read from Zustand (useAgentStore) not make its own TanStack Query call |

**Deprecated/outdated:**
- `app/proxy.ts` — Was planned but never created. The Phase 2 plan called for it but the actual implementation put auth checks in the layout.tsx server components only. The middleware.ts approach is the correct modern pattern.

## Open Questions

1. **Alert API route authorization**
   - What we know: The alert notification bridge needs a `GET /api/alerts/notifications` endpoint. The project has a pattern for API routes at `app/api/auth/[...all]/route.ts`.
   - What's unclear: Should this endpoint require authentication? Layout-level auth protects the pages, but API routes may need their own auth check.
   - Recommendation: Add auth check using `auth.api.getSession({ headers: await headers() })` in the API route, matching the pattern used in layout.tsx. This is a one-liner guard.

2. **ChatHubView callback propagation**
   - What we know: ChatHubView renders EmptyState as children of ChatLayout. ChatLayout owns the agentPickerOpen state. Children cannot call parent setState directly.
   - What's unclear: The cleanest propagation pattern.
   - Recommendation: Use a lightweight context or callback passed through ChatLayout. ChatLayout already manages `handleOpenAgentPicker` — expose it via a `ChatLayoutContext` that children can consume. Alternative: use the existing `useChatStore` Zustand store to add an `openAgentPicker` boolean, letting ChatHubView and ChatLayout coordinate via store.

3. **Governance sidebar link URL**
   - What we know: The governance/policies page is at `/governance/policies`. The sidebar link should go directly there.
   - What's unclear: Whether the sidebar should link to `/governance` (if other governance sub-pages exist) or directly to `/governance/policies`.
   - Recommendation: Link to `/governance/policies` directly since that's the only governance sub-page. The `startsWith` check in the sidebar active state detection will still work.

## Sources

### Primary (HIGH confidence)
- **better-auth/better-auth (Context7)** — Verified middleware pattern using `getSessionCookie` from `better-auth/cookies`. Cookie-only check at edge, no DB calls. Supports Next.js 13-16.
- **Codebase direct inspection** — All findings based on reading actual source files:
  - `src/widgets/app-shell/config/navigation.ts` — Current sidebar config (4 groups, 13 links)
  - `src/features/chat/components/agent-picker-dialog.tsx` — Uses `queryKeys.agents.lists()` = `['agents','list']`
  - `src/features/agents/api/use-agents.ts` — Uses `['agents']` directly
  - `src/features/chat/components/conversation-sidebar.tsx` — Empty state onClick is no-op
  - `src/views/chat/chat-hub-view.tsx` — "New Chat" onClick is no-op
  - `src/features/agents/components/agent-quick-actions.tsx` — "Send Message" is disabled
  - `src/features/sessions/components/sessions-table.tsx` — DOM event delegation pattern
  - `src/features/dashboard/model/alert-store.ts` — Has addAlert, markRead, markAllRead
  - `src/features/dashboard/components/notification-bell.tsx` — Reads from alertStore
  - `workers/alert-worker.ts` — conditionMet hardcoded false
  - `src/shared/ui/data-table.tsx` — No onRowClick prop
  - `src/shared/ui/sheet.tsx` — Full Sheet component available
  - `.planning/v1.0-MILESTONE-AUDIT.md` — Definitive gap list
  - `.planning/REQUIREMENTS.md` — Current traceability state

### Secondary (MEDIUM confidence)
- **v1.0 Milestone Audit Report** — Cross-referenced against actual code. All 5 missing connections and 3 broken flows confirmed by direct file inspection.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new dependencies, all libraries already in use
- Architecture: HIGH — All patterns derived from existing codebase conventions
- Pitfalls: HIGH — Based on direct code inspection of actual bugs/gaps
- Middleware pattern: HIGH — Verified against better-auth official docs via Context7

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable — no external dependency changes expected)
