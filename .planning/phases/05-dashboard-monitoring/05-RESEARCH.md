# Phase 5: Dashboard & Monitoring - Research

**Researched:** 2026-02-18
**Domain:** Real-time command center dashboard, bento grid layout, animated counters, live activity feed (WebSocket), cost/usage charts, interactive dependency map, alert rules, in-app notifications
**Confidence:** HIGH (core libraries already installed -- Recharts, Zustand, TanStack Query, Sonner, shadcn/ui, radix-ui. Dependency map library @xyflow/react verified via npm and Context7. Number animation library verified via npm.)

## Summary

Phase 5 delivers the main `/dashboard` page (command center), the `/activity` and `/activity/history` pages (event stream and search), and the `/monitor` and `/monitor/alerts` pages (system health and alerts). It addresses 11 requirements: DASH-01 through DASH-07 plus MNTR-01 through MNTR-04.

The dashboard is a bento grid of mixed-size widget cards built with CSS Grid and Tailwind. The largest widget is the live activity feed (WebSocket-powered, last 20 events via EventBus subscriptions). Stat widgets use animated number transitions via `@number-flow/react` (24.4 kB, 350k+ weekly downloads, dependency-free). Cost charts use Recharts 2.15.4 (already installed) with the existing shadcn `ChartContainer` wrapper. The dependency map on `/monitor` uses `@xyflow/react` v12 (React Flow) for interactive node-based visualization with custom nodes colored by health status.

The architecture follows established patterns from Phases 1-3: Zustand stores for real-time PUSH state (WebSocket events update dashboard counters, activity feed, health status), TanStack Query for initial data loading and historical data (activity history search, cost summaries), and EventBus subscriptions for all real-time updates. Gateway disconnect triggers a persistent degraded-mode banner rather than blocking the UI. Alert rules are stored in PostgreSQL with Drizzle ORM and evaluated by a BullMQ worker that triggers in-app notifications (Sonner toasts + bell icon badge) and webhook delivery.

**Primary recommendation:** Build the dashboard Zustand stores and data hooks first (shared across all dashboard widgets), then the bento grid shell with stat widgets, then the activity feed with scroll-position-aware auto-scroll, then cost/usage charts, then the activity pages, then the monitor page with dependency map, and finally the alert rules system.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Bento grid layout with mixed-size cards -- widgets claim different grid spans
- Activity feed is the most visually prominent widget, takes the largest grid area
- Bento grid collapses to a single vertical column on smaller screens, all widgets remain visible
- Activity feed auto-scrolls with new events pushing in at the top; if user has scrolled down, show a "New events" indicator instead of disrupting position
- Dashboard stat widgets (agent count, task summary, costs) use subtle number transitions -- counters smoothly animate between values, status badges pulse briefly on change
- Gateway disconnect triggers a persistent degraded-mode banner ("Gateway disconnected -- showing last known state") with stale data indicators on affected widgets, not an overlay
- /activity page uses a split view: left panel = filterable event list, right panel = event detail on selection (like a log viewer)
- /monitor page features a dependency map -- visual diagram showing how services connect (gateway, providers, channels, nodes) with color-coded health (green/yellow/red)
- Dependency map is interactive: click a node to drill in, showing metrics, recent events, and connected services -- full exploration from the map without navigating away
- Alert rules configured via template presets (e.g., "Agent down for 5 min", "High error rate") with customizable thresholds -- faster setup than blank-slate forms
- Alert notifications: in-app (bell icon, toasts) plus webhook URL per rule -- lets users pipe to Slack, Discord, PagerDuty, etc.
- Token costs shown as both aggregate summary (with time toggle: session/today/week) and per-agent breakdown
- Context window usage displayed as horizontal progress bars per agent -- color shifts green -> yellow -> red as context fills
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User sees at-a-glance command center at `/dashboard` with gateway status indicator (connected/disconnected/degraded) | Bento grid layout via CSS Grid + Tailwind. Gateway status from existing `useConnectionState()` hook in `features/gateway-connection/model/hooks.ts`. Degraded-mode banner using `useIsConnected()` + `useConnectionError()`. StatusBadge component already supports connected/disconnected/degraded variants. |
| DASH-02 | Dashboard shows active agents count with health badges (online, idle, working, error) | Agent data from existing `useAgentStore` (Zustand, `features/agents/model/agent-store.ts`). Derive counts by status from agent array. Animated counter via `@number-flow/react`. StatusBadge (existing `shared/ui/status-badge.tsx`) supports all agent status variants. |
| DASH-03 | Dashboard shows tasks in flight grouped by status (inbox, assigned, in-progress, review, done) | New Zustand task summary store subscribing to future task EventBus events. Until Phase 6 wires tasks, show mock data. StatusBadge for task status, animated counters for counts. |
| DASH-04 | Dashboard shows context window usage gauge per active agent | Horizontal progress bars from existing `shared/ui/progress.tsx`. Color-shifting via dynamic className based on percentage thresholds (green < 60%, yellow 60-80%, red > 80%). Data from agent store `contextUsage` field (already in Agent entity type). |
| DASH-05 | Dashboard shows model & token cost summary (current session / today / this week) | Recharts 2.15.4 (already installed) with existing `shared/ui/chart.tsx` ChartContainer wrapper. Stacked BarChart for per-agent cost breakdown (input vs output tokens). Time toggle via Tabs component. `@number-flow/react` for aggregate totals. Side-by-side layout for tokens and dollar cost. |
| DASH-06 | Dashboard shows live activity feed (last 20 events, scrollable, real-time via WebSocket) | EventBus wildcard subscription (`eventBus.on("*", ...)` pattern). New Zustand activity store with circular buffer (max 20). ScrollArea (existing `shared/ui/scroll-area.tsx`) with scroll-position-aware auto-scroll: detect if user scrolled up via `useRef` + `scrollTop` comparison, show "New events" pill when not at top. |
| DASH-07 | Dashboard provides quick actions: New Task, New Agent, Send Message | Button group or floating action buttons. Link to `/agents/new` (Phase 3 route exists), `/missions/new` (Phase 6), and dialog trigger for Send Message. Use existing Button and Dialog components from shared UI. |
| MNTR-01 | User can view real-time event stream across all agents and channels at `/activity` | Split view: left panel = event list with EventBus subscription (reuses activity store), right panel = event detail on selection. nuqs for filter URL state. ResizablePanelGroup (radix-ui based) for split pane. |
| MNTR-02 | User can search and filter activity history at `/activity/history` | TanStack Query for fetching persisted events from API. DataTable (existing `shared/ui/data-table.tsx`) with search/filter. SearchInput and FilterBar (existing shared UI). Server-side pagination. |
| MNTR-03 | User can view system health dashboard at `/monitor` | `@xyflow/react` v12 for interactive dependency map. Custom node components for each service type (gateway, provider, channel, node) with color-coded health borders (green/yellow/red). Dagre layout algorithm for automatic node positioning. Click node to show detail panel (side panel or expanded node). |
| MNTR-04 | User can configure alert rules and view notification history at `/monitor/alerts` | New Drizzle schema for `alert_rules` and `alert_notifications` tables. Template presets as static config objects. react-hook-form + Zod for rule editing. BullMQ alert evaluation worker. Sonner toasts for in-app alerts. Bell icon badge counter in header bar. Webhook delivery via fetch. |
</phase_requirements>

## Standard Stack

### Core (New for Phase 5)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @number-flow/react | ^0.5.12 | Animated number transitions for dashboard counters | 24.4 kB, dependency-free, 350k+ weekly downloads. Automatically animates when value prop changes. No heavy animation library needed. Supports format/locale/prefix/suffix. |
| @xyflow/react | ^12.10.0 | Interactive dependency map on /monitor page | De facto standard for node-based UIs in React. 386 dependents on npm. Custom nodes with full React rendering. Built-in pan/zoom/minimap. Dagre integration for auto-layout. |
| @dagrejs/dagre | ^1.1.4 | Automatic graph layout algorithm for dependency map | Standard DAG layout algorithm. Used with React Flow for positioning nodes automatically. Lightweight, well-maintained. |

### Already Installed (Used by Phase 5)

| Library | Version | Purpose | Phase 5 Usage |
|---------|---------|---------|---------------|
| recharts | 2.15.4 | Charting library | Stacked bar charts for cost breakdown, line charts for trends |
| zustand | ^5.0.11 | Real-time state management | Dashboard store, activity store, alert notification store |
| @tanstack/react-query | ^5.90.21 | Data fetching | Activity history, cost summaries, alert rules CRUD |
| sonner | ^2.0.7 | Toast notifications | Alert notification delivery (in-app toasts) |
| nuqs | ^2.8.8 | URL search param state | Activity page filters, history search params |
| react-hook-form + zod | ^7.71.1 / ^4.3.6 | Form management | Alert rule configuration forms |
| date-fns | ^4.1.0 | Date formatting | Activity timestamps, relative times |
| lucide-react | ^0.574.0 | Icons | Bell icon, status icons, quick action icons |
| use-debounce | ^10.1.0 | Debounced callbacks | Activity search debounce, filter input debounce |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @number-flow/react | motion (framer-motion) AnimateNumber | motion is 40+ kB heavier, AnimateNumber requires motion-plus (paid). @number-flow/react is purpose-built, dependency-free, smaller. |
| @xyflow/react | Custom SVG + D3 | Enormous effort to build pan/zoom/drag/custom-nodes from scratch. React Flow provides this out of the box with excellent React integration. |
| @xyflow/react | vis-network or cytoscape | Not React-native. Require imperative DOM manipulation. React Flow renders custom React components as nodes. |
| CSS Grid bento | react-grid-layout (draggable) | Draggable grid is not a requirement. CSS Grid is simpler, zero-dependency, and Tailwind handles responsive breakpoints natively. |

### Installation

```bash
npm install @number-flow/react @xyflow/react @dagrejs/dagre
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── entities/
│   └── dashboard-event/         # Activity event entity (types, parser)
│       ├── model/types.ts       # DashboardEvent, EventFilter types
│       └── lib/parser.ts        # Gateway event to dashboard event mapper
├── features/
│   └── dashboard/
│       ├── model/
│       │   ├── dashboard-store.ts    # Zustand: agent counts, task summary, costs, gateway status
│       │   ├── activity-store.ts     # Zustand: circular buffer of last 20 events
│       │   └── alert-store.ts        # Zustand: unread notification count, recent alerts
│       ├── api/
│       │   ├── use-dashboard-stats.ts  # TanStack Query: initial dashboard data load
│       │   ├── use-activity-history.ts # TanStack Query: paginated history search
│       │   ├── use-cost-summary.ts     # TanStack Query: cost/usage data by time range
│       │   └── use-alert-rules.ts      # TanStack Query: CRUD for alert rules
│       ├── components/
│       │   ├── gateway-status-widget.tsx    # Connection status with degraded banner
│       │   ├── agent-count-widget.tsx       # Agent counts by status
│       │   ├── task-summary-widget.tsx      # Tasks by status
│       │   ├── context-usage-widget.tsx     # Per-agent context bars
│       │   ├── cost-summary-widget.tsx      # Token/dollar costs with time toggle
│       │   ├── activity-feed-widget.tsx     # Live feed with scroll-aware auto-scroll
│       │   ├── quick-actions.tsx            # New Task, New Agent, Send Message
│       │   ├── degraded-mode-banner.tsx     # Persistent "disconnected" banner
│       │   ├── activity-event-card.tsx      # Single event display in feed
│       │   ├── activity-split-view.tsx      # Split view for /activity page
│       │   ├── dependency-map.tsx           # React Flow dependency map
│       │   ├── dependency-node.tsx          # Custom node component
│       │   ├── alert-rule-form.tsx          # Alert rule editor with template presets
│       │   ├── alert-template-picker.tsx    # Template selection for new rules
│       │   └── notification-bell.tsx        # Bell icon with badge counter
│       └── lib/
│           ├── alert-templates.ts     # Static alert template definitions
│           ├── cost-formatter.ts      # Token and dollar formatting utilities
│           └── event-mapper.ts        # Maps raw EventBus events to display events
├── views/
│   └── dashboard/
│       ├── dashboard-view.tsx         # Main bento grid dashboard
│       ├── activity-view.tsx          # /activity split view
│       ├── activity-history-view.tsx  # /activity/history search/filter
│       ├── monitor-view.tsx           # /monitor dependency map
│       └── monitor-alerts-view.tsx    # /monitor/alerts rule management
└── widgets/
    └── dashboard-grid/
        └── components/
            └── bento-grid.tsx         # Reusable bento grid layout shell
```

### Pattern 1: Bento Grid with CSS Grid

**What:** A responsive grid layout where widget cards claim different grid spans (1x1, 2x1, 2x2, etc.) using CSS Grid with Tailwind utility classes.
**When to use:** Dashboard pages with mixed-size widget cards that need responsive collapse to single column on mobile.

```typescript
// Bento grid with Tailwind CSS Grid
// Source: Tailwind CSS documentation + verified CSS Grid spec

function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
      {children}
    </div>
  );
}

// Widget cards claim grid spans:
// <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2"> -- activity feed (large)
// <div className="col-span-1"> -- agent count (small)
// <div className="col-span-1 md:col-span-2"> -- cost summary (medium)
```

### Pattern 2: Scroll-Position-Aware Auto-Scroll

**What:** Activity feed that auto-scrolls to show new events when user is at the top, but pauses auto-scroll and shows a "New events" indicator when user has scrolled down. Clicking the indicator scrolls back to top and resumes auto-scroll.
**When to use:** Any live-updating list where disrupting user reading position is unacceptable.

```typescript
// Source: Standard React scroll management pattern
// Verified against Radix UI ScrollArea API

function useAutoScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [newEventCount, setNewEventCount] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    // "At top" means within 50px of the top
    const atTop = scrollTop < 50;
    setIsAtTop(atTop);
    if (atTop) setNewEventCount(0);
  }, [containerRef]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setNewEventCount(0);
  }, [containerRef]);

  // Called when new event arrives
  const onNewEvent = useCallback(() => {
    if (isAtTop) {
      // Auto-scroll is active, new event will appear at top naturally
    } else {
      setNewEventCount((c) => c + 1);
    }
  }, [isAtTop]);

  return { isAtTop, newEventCount, handleScroll, scrollToTop, onNewEvent };
}
```

### Pattern 3: Dashboard Zustand Store with EventBus Subscriptions

**What:** A Zustand store that aggregates real-time data from multiple EventBus events into dashboard-friendly summary state. Follows the established PUSH pattern from Phase 1.
**When to use:** Any widget that needs computed/aggregated real-time data from WebSocket events.

```typescript
// Source: Existing pattern from features/agents/model/agent-store.ts
// and features/gateway-connection/model/store.ts

import { create } from "zustand";
import type { EventBus } from "@/features/gateway-connection";

interface DashboardStore {
  // Agent summary (derived from agent events)
  agentCounts: Record<string, number>; // { online: 3, idle: 1, working: 2, error: 0 }
  totalAgents: number;

  // Task summary (derived from task events -- mock until Phase 6)
  taskCounts: Record<string, number>; // { inbox: 5, assigned: 3, ... }

  // Cost summary
  sessionCost: { tokens: number; dollars: number };
  todayCost: { tokens: number; dollars: number };
  weekCost: { tokens: number; dollars: number };

  // Actions
  updateAgentCounts: (counts: Record<string, number>) => void;
  updateCosts: (period: string, tokens: number, dollars: number) => void;
}

export function initDashboardStoreSubscriptions(eventBus: EventBus): () => void {
  const unsubs: Array<() => void> = [];

  unsubs.push(
    eventBus.on("agent.status", ({ agentId, status }) => {
      // Recalculate agent counts from agent store
      // This follows the existing pattern in agent-store.ts
    }),
  );

  // Subscribe to all events for activity feed
  // EventBus wildcard: eventBus.on("*", ...) would catch all events
  // But the current EventBus uses dot-notation wildcards: "agent.*", "chat.*", etc.
  // Need to subscribe to each namespace separately or add a catch-all

  return () => unsubs.forEach((fn) => fn());
}
```

### Pattern 4: React Flow Dependency Map with Custom Nodes

**What:** An interactive node graph using @xyflow/react where each node represents a service (gateway, provider, channel) with color-coded health status. Clicking a node shows a detail panel.
**When to use:** System health visualization with interconnected services.

```typescript
// Source: Context7 @xyflow/react documentation
// Verified: Custom node registration, nodeTypes, event handling

import { ReactFlow, useNodesState, useEdgesState, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface HealthNodeData {
  label: string;
  type: "gateway" | "provider" | "channel" | "node";
  health: "healthy" | "degraded" | "down";
  metrics?: { uptime: number; latency: number };
}

function HealthNode({ data }: { data: HealthNodeData }) {
  const borderColor = {
    healthy: "border-green-500",
    degraded: "border-yellow-500",
    down: "border-red-500",
  }[data.health];

  return (
    <div className={cn("rounded-lg border-2 bg-card p-4", borderColor)}>
      <div className="text-sm font-semibold">{data.label}</div>
      <StatusBadge status={data.health} size="sm" />
    </div>
  );
}

const nodeTypes = { health: HealthNode };
// Use dagre for automatic layout positioning
```

### Pattern 5: Activity Event Catch-All via EventBus

**What:** Subscribing to multiple EventBus namespaces to capture all gateway events for the activity feed. The current EventBus supports dot-notation wildcard matching (`agent.*` catches `agent.status`, `agent.created`, etc.).
**When to use:** Activity feed that needs to display all event types.

```typescript
// Source: Existing EventBus implementation (features/gateway-connection/lib/event-bus.ts)
// The EventBus already supports wildcard: "agent.*" matches "agent.status"

function initActivityFeedSubscriptions(eventBus: EventBus) {
  const unsubs: Array<() => void> = [];

  // Subscribe to each namespace wildcard
  const namespaces = ["agent.*", "chat.*", "exec.*", "ws.*"];
  for (const ns of namespaces) {
    unsubs.push(
      eventBus.on(ns, (payload) => {
        // Push to activity store circular buffer
      }),
    );
  }

  return () => unsubs.forEach((fn) => fn());
}
```

### Anti-Patterns to Avoid

- **Polling dashboard data on interval:** The gateway provides push events via WebSocket. Never poll for data that already arrives via EventBus subscriptions. Use TanStack Query only for initial load and historical data that cannot come from WebSocket.
- **Storing all events in memory:** The activity feed should use a circular buffer (max 20 events on dashboard, larger on /activity page). Do not accumulate events indefinitely in Zustand -- memory will grow unbounded.
- **Blocking the UI during gateway disconnect:** The user decision explicitly requires a persistent banner, not an overlay. Show stale data with visual indicators rather than blocking interaction.
- **Using motion/framer-motion just for number counters:** The entire motion library is 40+ kB. `@number-flow/react` at 24.4 kB is purpose-built for this exact use case with zero dependencies.
- **Building the dependency map with raw SVG/D3:** React Flow (@xyflow/react) handles pan, zoom, drag, custom node rendering, edge routing, and accessibility out of the box. Hand-rolling this would be hundreds of hours of work.
- **Evaluating alert rules on the client:** Alert evaluation MUST happen server-side via BullMQ worker. Client-side evaluation would miss events when the browser is closed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated number transitions | Custom CSS counter animations + rAF | @number-flow/react | Handles locale formatting, transitions through intermediate values, accessible, 24.4 kB |
| Interactive node graph | Custom SVG with pan/zoom/drag | @xyflow/react + dagre | Pan, zoom, drag, custom nodes, edge routing, minimap, accessibility -- years of work to replicate |
| Chart rendering | Custom SVG chart components | Recharts (already installed) + shadcn ChartContainer | Responsive, accessible, animation, tooltip, legend -- all handled |
| Toast notifications | Custom notification system | Sonner (already installed) | Queue management, animation, stacking, auto-dismiss, accessibility |
| Scroll position detection | Manual scroll event math | useRef + scrollTop comparison | Simple enough to hand-roll (3 lines), no library needed |
| Graph layout algorithm | Manual node positioning | @dagrejs/dagre | Directed acyclic graph layout is a solved problem. Dagre handles it in <5ms for small graphs. |

**Key insight:** The dashboard is a composition problem, not a primitive problem. Every visualization primitive (charts, graphs, counters, toasts) has battle-tested libraries. The real engineering challenge is wiring EventBus events to Zustand stores and rendering them in a responsive bento grid.

## Common Pitfalls

### Pitfall 1: WebSocket Event Flood Causing React Re-Renders

**What goes wrong:** Every WebSocket event triggers a Zustand state update, causing all dashboard widgets to re-render even if only one widget's data changed.
**Why it happens:** Zustand selectors not granular enough. A single store with all dashboard data means any change triggers re-renders for all subscribers.
**How to avoid:** Use separate Zustand stores for logically distinct data (dashboard-store for stats, activity-store for feed, alert-store for notifications). Each widget subscribes to its specific slice with a Zustand selector: `useStore((s) => s.agentCounts)`. Zustand only re-renders when the selected slice changes (referential equality check).
**Warning signs:** React DevTools Profiler shows widgets re-rendering on every WebSocket event, even unrelated ones.

### Pitfall 2: Activity Feed Scroll Jump on New Events

**What goes wrong:** New events prepended to the list cause the scroll position to jump, losing the user's reading position.
**Why it happens:** DOM elements inserted above the current scroll position shift all elements down. The browser maintains the same scrollTop value, which now points to a different element.
**How to avoid:** Detect if user is at the top of the scroll container. If at top, let new events push content naturally (user sees new events). If user has scrolled down, increment a counter and show a "N new events" pill. On pill click, scroll to top with `behavior: "smooth"`.
**Warning signs:** Users report "the feed keeps jumping" when they try to read older events.

### Pitfall 3: Stale Data Indicators Not Clearing After Reconnect

**What goes wrong:** After gateway disconnect and reconnect, stale data indicators remain on widgets even though fresh data has arrived.
**Why it happens:** The reconnect flow restores the connection but doesn't trigger a data refresh. TanStack Query has `staleTime: Infinity` (per prior decision [01-05]), so it won't refetch automatically.
**How to avoid:** On `ws.connected` EventBus event, explicitly invalidate TanStack Query caches for dashboard data: `queryClient.invalidateQueries({ queryKey: queryKeys.gateway.health() })`. Also clear the Zustand store's stale-data flag.
**Warning signs:** Dashboard shows "Last known state" banner is gone but widget data is clearly outdated.

### Pitfall 4: React Flow Rendering Performance with Many Nodes

**What goes wrong:** Dependency map becomes sluggish with 50+ nodes because React Flow renders every node as a full React component.
**Why it happens:** Each custom node is a React component in the DOM. With complex node internals (metrics, charts, status badges), the DOM tree becomes massive.
**How to avoid:** Keep default node rendering lightweight (name + status dot only). Load detailed metrics only when a node is clicked/selected, in a side panel or expanded view. Use React Flow's `nodesDraggable={false}` if dragging isn't needed (reduces event listeners).
**Warning signs:** Dependency map takes >500ms to render or becomes unresponsive on pan/zoom.

### Pitfall 5: Chart Container Height Collapse

**What goes wrong:** Recharts charts render as 0-height because `ResponsiveContainer` requires an explicit height on its parent container.
**Why it happens:** CSS Grid children need explicit dimensions or content to determine size. A `ResponsiveContainer` with `height="100%"` inside a grid cell with `auto` height collapses to 0.
**How to avoid:** Set a minimum height on chart container elements: `min-h-[200px]` or use `aspect-video` class (already used in shadcn ChartContainer). In bento grid cells, use `auto-rows-[minmax(180px,auto)]` to ensure minimum cell height.
**Warning signs:** Charts are invisible or render as thin horizontal lines.

### Pitfall 6: Alert Webhook Delivery Blocking the UI

**What goes wrong:** Alert webhook delivery is done synchronously in the API route, causing slow responses and timeouts.
**Why it happens:** Webhook endpoints may be slow or down. Synchronous delivery blocks the entire request.
**How to avoid:** Alert evaluation and webhook delivery MUST happen in BullMQ workers (background jobs). The existing infrastructure already has BullMQ + Redis set up (see `shared/lib/queue.ts`). Add an `alertQueue` similar to the existing `auditQueue`. Workers retry failed deliveries with exponential backoff.
**Warning signs:** Alert API endpoints take >5s to respond, or webhooks are never delivered when endpoints are slow.

## Code Examples

### Animated Number Counter with @number-flow/react

```typescript
// Source: https://number-flow.barvian.me/ (verified via npm)

import NumberFlow from "@number-flow/react";

function AgentCountWidget({ count }: { count: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Active Agents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NumberFlow
          value={count}
          className="text-3xl font-bold tabular-nums"
        />
      </CardContent>
    </Card>
  );
}
```

### Stacked Bar Chart for Cost Breakdown

```typescript
// Source: Context7 /recharts/recharts -- stacked bar chart pattern
// Uses existing shadcn ChartContainer from shared/ui/chart.tsx

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/ui/chart";

const chartConfig = {
  inputTokens: { label: "Input Tokens", color: "hsl(var(--primary))" },
  outputTokens: { label: "Output Tokens", color: "hsl(var(--secondary))" },
} satisfies ChartConfig;

function CostBreakdownChart({ data }: { data: AgentCostData[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <XAxis dataKey="agentName" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="inputTokens" stackId="tokens" fill="var(--color-inputTokens)" />
        <Bar dataKey="outputTokens" stackId="tokens" fill="var(--color-outputTokens)" />
      </BarChart>
    </ChartContainer>
  );
}
```

### Context Window Progress Bar with Color Shifting

```typescript
// Source: Existing shared/ui/progress.tsx + Tailwind dynamic classes
// Decision: color shifts green -> yellow -> red as context fills

import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/cn";

function ContextGauge({ agentName, usage }: { agentName: string; usage: number }) {
  const colorClass = usage < 60
    ? "[&_[data-slot=progress-indicator]]:bg-green-500"
    : usage < 80
    ? "[&_[data-slot=progress-indicator]]:bg-yellow-500"
    : "[&_[data-slot=progress-indicator]]:bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-24 truncate">{agentName}</span>
      <Progress value={usage} className={cn("flex-1 h-2", colorClass)} />
      <span className="text-xs text-muted-foreground w-10 text-right">{usage}%</span>
    </div>
  );
}
```

### Degraded Mode Banner

```typescript
// Source: Existing useConnectionState + useConnectionError hooks
// Decision: persistent banner, not overlay. Stale data indicators on affected widgets.

import { useIsConnected, useConnectionError } from "@/features/gateway-connection";
import { AlertTriangle } from "lucide-react";

function DegradedModeBanner() {
  const isConnected = useIsConnected();
  const error = useConnectionError();

  if (isConnected) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 px-4 py-2 text-sm text-warning-foreground">
      <AlertTriangle className="size-4 text-warning" />
      <span>
        Gateway disconnected — showing last known state
        {error && <span className="text-muted-foreground ml-1">({error})</span>}
      </span>
    </div>
  );
}
```

### React Flow Dependency Map Setup

```typescript
// Source: Context7 /websites/reactflow_dev -- custom nodes, Turbo Flow pattern
// Uses dagre for automatic layout

import { ReactFlow, useNodesState, useEdgesState, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";

// Custom node types
const nodeTypes = {
  gateway: GatewayNode,
  provider: ProviderNode,
  channel: ChannelNode,
  agent: AgentNode,
};

function DependencyMap({ services }: { services: ServiceHealth[] }) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => computeDagreLayout(services),
    [services],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  return (
    <div className="h-[600px] w-full rounded-lg border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </div>
  );
}
```

### Alert Rule Template Presets

```typescript
// Claude's discretion: alert template catalog

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  condition: {
    metric: string;
    operator: ">" | "<" | "==" | "!=";
    threshold: number;
    duration: number; // seconds
  };
  severity: "critical" | "warning" | "info";
}

export const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: "agent-down",
    name: "Agent Down",
    description: "Alert when an agent is offline for more than 5 minutes",
    icon: "bot",
    condition: { metric: "agent.status", operator: "==", threshold: 0, duration: 300 },
    severity: "critical",
  },
  {
    id: "high-error-rate",
    name: "High Error Rate",
    description: "Alert when error rate exceeds 10% in 15 minutes",
    icon: "alert-triangle",
    condition: { metric: "error.rate", operator: ">", threshold: 10, duration: 900 },
    severity: "warning",
  },
  {
    id: "context-window-full",
    name: "Context Window Full",
    description: "Alert when any agent's context usage exceeds 90%",
    icon: "gauge",
    condition: { metric: "agent.context_usage", operator: ">", threshold: 90, duration: 0 },
    severity: "warning",
  },
  {
    id: "gateway-disconnect",
    name: "Gateway Disconnected",
    description: "Alert when gateway connection is lost for more than 1 minute",
    icon: "unplug",
    condition: { metric: "gateway.status", operator: "==", threshold: 0, duration: 60 },
    severity: "critical",
  },
  {
    id: "high-cost-spike",
    name: "Cost Spike",
    description: "Alert when hourly cost exceeds $5",
    icon: "dollar-sign",
    condition: { metric: "cost.hourly", operator: ">", threshold: 5, duration: 0 },
    severity: "info",
  },
  {
    id: "task-stuck",
    name: "Task Stuck",
    description: "Alert when a task is in-progress for more than 30 minutes",
    icon: "clock",
    condition: { metric: "task.duration", operator: ">", threshold: 1800, duration: 0 },
    severity: "warning",
  },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion for all animations | Purpose-built micro-libraries (number-flow, CSS transitions) | 2024-2025 | Smaller bundles, better perf for specific use cases |
| reactflow package | @xyflow/react v12 (rebranded) | 2024 | Package name changed, node dimensions in node.measured, style import path changed |
| recharts v2 | recharts 2.15.x (stable, pre-v3) | Current | Project uses 2.15.4 which is stable. v3 exists but 2.x is still maintained |
| Socket.IO for real-time dashboards | Raw WebSocket + EventBus | Phase 1 decision | Already established in this project. Less overhead, custom protocol |
| Polling for dashboard stats | PUSH via WebSocket + Zustand | Phase 1 decision [01-05] | Already established. staleTime: Infinity prevents refetch from overwriting WS updates |

**Deprecated/outdated:**
- `reactflow` npm package: Use `@xyflow/react` instead (rebranded in v12)
- `framer-motion` package name: Now `motion` (rebranded, but framer-motion still works as alias)

## Open Questions

1. **EventBus catch-all subscription**
   - What we know: EventBus supports dot-notation wildcards (`agent.*` catches `agent.status`). It does NOT have a global catch-all (`*`) pattern.
   - What's unclear: Should we add a catch-all pattern to EventBus, or subscribe to each known namespace separately for the activity feed?
   - Recommendation: Subscribe to each namespace wildcard separately (`agent.*`, `chat.*`, `exec.*`, `ws.*`). This is explicit, type-safe, and avoids modifying Phase 1 infrastructure. A new namespace requires adding one subscription line -- acceptable maintenance cost.

2. **Alert rule storage and evaluation timing**
   - What we know: BullMQ + Redis infrastructure exists (`shared/lib/queue.ts`). Alert rules need persistence in PostgreSQL. Evaluation needs to happen server-side.
   - What's unclear: Should alert evaluation be triggered on every incoming event (push), or on a periodic schedule (poll)?
   - Recommendation: Hybrid approach. Simple threshold alerts (e.g., context > 90%) evaluate on each relevant event via EventBus subscription on the server. Duration-based alerts (e.g., "agent down for 5 min") use a BullMQ cron job that checks rule conditions every 60 seconds. This avoids missing events while keeping duration checks reliable.

3. **Activity history persistence**
   - What we know: The activity feed stores 20 events in memory (Zustand). Activity history at `/activity/history` needs searchable historical data.
   - What's unclear: Where are historical events stored? The existing audit log table stores mutations, not all events.
   - Recommendation: Create an `activity_events` table in PostgreSQL with a BullMQ worker that persists gateway events. Index on timestamp, event_type, agent_id for efficient filtering. Keep 30 days of history by default with a cleanup cron job.

4. **Task summary data source before Phase 6**
   - What we know: DASH-03 requires task summary by status. Phase 6 (Mission Board) hasn't been built yet.
   - What's unclear: Where does task data come from if Phase 6 isn't done?
   - Recommendation: Use mock data for the task summary widget, same pattern as Phase 3's mock agents. Mark with `// TODO: Replace with task store when Phase 6 is built`. The widget structure and Zustand store shape should be built correctly so Phase 6 just needs to wire it up.

## Sources

### Primary (HIGH confidence)
- Context7 `/recharts/recharts` -- stacked bar chart, responsive container, animation patterns
- Context7 `/websites/reactflow_dev` -- custom nodes, interactive graph, Turbo Flow example
- Context7 `/websites/motion_dev_react` -- AnimateNumber pattern (used as negative comparison -- too heavy)
- Existing codebase: `src/features/gateway-connection/` -- EventBus, connection hooks, Zustand store patterns
- Existing codebase: `src/shared/ui/chart.tsx` -- shadcn ChartContainer wrapper for Recharts
- Existing codebase: `src/shared/ui/progress.tsx` -- Progress bar component (Radix UI)
- Existing codebase: `src/features/agents/model/agent-store.ts` -- Zustand store + EventBus subscription pattern
- Existing codebase: `src/shared/lib/queue.ts` -- BullMQ queue setup pattern

### Secondary (MEDIUM confidence)
- npm: `@number-flow/react` v0.5.12, 350k+ weekly downloads, 24.4 kB -- verified active package
- npm: `@xyflow/react` v12.10.0, 386 dependents -- verified active package
- number-flow.barvian.me -- official docs for NumberFlow component API
- reactflow.dev -- official React Flow v12 documentation for custom nodes, dagre layout

### Tertiary (LOW confidence)
- None -- all critical claims verified against Context7 or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- core libraries already installed (Recharts, Zustand, TanStack Query); new libraries verified via npm + Context7
- Architecture: HIGH -- follows established patterns from Phases 1-3 (EventBus subscriptions, Zustand stores, TanStack Query, FSD structure)
- Pitfalls: HIGH -- derived from direct codebase analysis and known React rendering behavior
- Dependency map: MEDIUM -- @xyflow/react is well-documented but the specific service-mesh visualization pattern is project-specific

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days -- stable ecosystem, no fast-moving dependencies)
