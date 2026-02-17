# Architecture Research: AXion Hub

**Domain:** Self-hosted AI agent orchestration dashboard
**Researched:** 2026-02-17
**Confidence:** MEDIUM (training data only -- no web/Context7 verification available; patterns are well-established but specific library versions unverified)

## System Overview

AXion Hub is a frontend-heavy dashboard ("Mission Control") that communicates with a separate backend gateway (OpenClaw Gateway) via WebSocket. The dashboard itself is not an API server -- it is a rich client that consumes the gateway's real-time streams and REST endpoints.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AXion Hub (Browser)                                │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Chat/Stream  │  │   Kanban     │  │  Monitoring   │  │   Files/     │    │
│  │  Interface    │  │   Board      │  │  Dashboard    │  │   Workspace  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────────┐  │
│  │                     Feature Modules Layer                              │  │
│  │  (Chat, Agents, Tasks, Files, Channels, Plugins, Audit, Settings)     │  │
│  └──────────────────────────┬────────────────────────────────────────────┘  │
│                              │                                              │
│  ┌──────────────────────────┴────────────────────────────────────────────┐  │
│  │                     Shared Services Layer                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │ WebSocket│  │  State   │  │  Event   │  │  Auth    │              │  │
│  │  │ Manager  │  │  Stores  │  │  Bus     │  │  Guard   │              │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────┬────────────────────────────────────────────┘  │
│                              │                                              │
│  ┌──────────────────────────┴────────────────────────────────────────────┐  │
│  │                     UI Foundation Layer                                │  │
│  │  shadcn/ui components, design tokens, layout system, theme            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    WebSocket + REST API
                                 │
┌────────────────────────────────┴────────────────────────────────────────────┐
│                       OpenClaw Gateway (External)                           │
│  Agent runtime, LLM routing, channel connectors, skill execution            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Decision: Next.js App Router SPA-style Dashboard

Use **Next.js App Router** but treat it primarily as a **client-rendered dashboard** with minimal server-side rendering. Rationale:

- The dashboard is behind authentication -- SSR/SEO provides no value for most pages
- Real-time WebSocket state makes server rendering contradictory (client state diverges immediately)
- App Router still provides excellent file-based routing, layouts, route groups, and code splitting
- Server Components are useful for the settings, configuration, and initial data loading pages
- The `"use client"` boundary sits high -- most dashboard pages are client components

**Do NOT** try to make this a server-first Next.js app. The real-time nature of agent orchestration means the client is the source of truth for live state.

## Component Boundaries

### Layer 1: UI Foundation

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Design System** (shadcn/ui + custom) | Buttons, inputs, cards, modals, toasts, data tables | All feature modules consume it |
| **Layout Shell** | Sidebar navigation, top bar, breadcrumbs, notification tray | Route groups, auth guard |
| **Theme Provider** | Dark/light mode, CSS variables, design tokens | Everything (context provider) |

### Layer 2: Shared Services

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **WebSocket Manager** | Single persistent connection to OpenClaw Gateway; reconnection, heartbeat, message routing | Event Bus, all feature stores |
| **Event Bus** | Decouples WebSocket messages from consumers; pub/sub within the client | WebSocket Manager, all feature modules |
| **State Stores** (Zustand) | Domain-specific state slices (agents, chat, tasks, files, etc.) | Event Bus (receives), UI components (read), actions (write) |
| **Auth Guard** | JWT/session management, route protection, permission checks | Layout Shell, API calls |
| **API Client** | REST calls to OpenClaw Gateway for CRUD operations (non-realtime) | State stores, feature modules |

### Layer 3: Feature Modules

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Chat Module** | Streaming conversations, message history, multi-agent threads | WebSocket Manager (streaming), Chat Store |
| **Agent Module** | Agent cards, status monitoring, configuration, lifecycle | Agent Store, WebSocket (status events) |
| **Task/Kanban Module** | Task boards, drag-and-drop, status transitions, assignments | Task Store, Agent Store (assignments) |
| **File Module** | File browser, upload/download, workspace management | File Store, API Client |
| **Channel Module** | Multi-channel routing config (WhatsApp, Telegram, Discord, Slack) | Channel Store, Agent Store |
| **Monitoring Module** | Real-time event feed, metrics, system health, logs | Event Bus (subscribe all), Monitoring Store |
| **Audit Module** | Audit log viewer, filtering, export | API Client (paginated queries) |
| **Plugin/Skill Module** | Plugin registry, skill configuration, enable/disable | Plugin Store, API Client |
| **Approval Module** | Human-in-the-loop approval queues, accept/reject workflows | WebSocket (approval events), Approval Store |
| **Settings Module** | System config, user preferences, gateway connection settings | API Client, Auth Guard |

### Layer 4: External Boundary

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **OpenClaw Gateway** | Agent runtime, LLM calls, channel connectors, everything backend | AXion Hub via WebSocket + REST |
| **Docker Host** | Container orchestration for self-hosted deployment | Next.js server, static assets |

## Data Flow

### Primary Data Flow: WebSocket Event Stream

This is the most critical architectural flow. The gateway pushes events; the dashboard reacts.

```
OpenClaw Gateway
    │
    │  WebSocket frames (JSON)
    │  Events: agent.status, chat.message, task.update, approval.request, etc.
    ▼
┌──────────────────┐
│  WebSocket        │  Single connection, auto-reconnect, heartbeat
│  Manager          │  Parses frames, validates schema
└────────┬─────────┘
         │
         │  Typed event objects
         ▼
┌──────────────────┐
│  Event Bus        │  Routes events to subscribers by event type
│  (publish/        │  Supports wildcard subscriptions (e.g., "agent.*")
│   subscribe)      │  Buffers events during reconnection
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Chat   │ │ Agent  │ │ Task   │ │ Monitor│ │Approval│
│ Store  │ │ Store  │ │ Store  │ │ Store  │ │ Store  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    ▼          ▼          ▼          ▼          ▼
  React Components (auto-re-render via Zustand selectors)
```

### Chat Streaming Flow (Critical Path)

Chat streaming is the highest-complexity real-time flow. Tokens arrive individually from the LLM via gateway.

```
User types message
    │
    ▼
Chat Component → Chat Store (optimistic: add user message)
    │
    ▼
WebSocket Manager → send({ type: "chat.send", payload: { agentId, message, threadId } })
    │
    ▼
Gateway processes, begins LLM streaming
    │
    │  chat.stream.start  { threadId, messageId }
    │  chat.stream.token  { threadId, messageId, token: "Hello" }
    │  chat.stream.token  { threadId, messageId, token: " world" }
    │  ...
    │  chat.stream.end    { threadId, messageId, fullText, metadata }
    ▼
Event Bus → Chat Store
    │
    │  On stream.start:  Create placeholder message in store
    │  On stream.token:  Append token to message buffer (NOT full re-render per token)
    │  On stream.end:    Finalize message, update metadata
    ▼
Chat Component re-renders via selector on message list
    │
    │  IMPORTANT: Use a streaming buffer pattern, NOT individual token state updates.
    │  Buffer tokens in a ref, flush to state on requestAnimationFrame or throttled interval.
    │  This prevents 100+ re-renders per second during fast streaming.
```

### REST CRUD Flow (Secondary)

For non-realtime operations: fetching history, updating settings, uploading files.

```
Feature Component
    │
    ▼
Action (Zustand action or TanStack Query mutation)
    │
    ▼
API Client → HTTP request to OpenClaw Gateway REST endpoint
    │
    ▼
Response → Update store / invalidate query cache
    │
    ▼
Component re-renders
```

### Kanban Drag-and-Drop Flow

```
User drags task card
    │
    ▼
dnd-kit sensors detect drag
    │
    ▼
DragOverlay renders ghost card (pure visual, no state change yet)
    │
    ▼
User drops on target column
    │
    ▼
onDragEnd handler:
    1. Optimistic update: Move task in Task Store immediately
    2. Send via WebSocket: { type: "task.move", payload: { taskId, newStatus, newPosition } }
    3. Gateway confirms or rejects
    4. On reject: Revert optimistic update, show toast
```

### Approval Workflow Flow

```
Gateway detects action requiring approval
    │
    │  approval.request { id, agentId, action, context, urgency }
    ▼
Event Bus → Approval Store
    │
    ▼
Notification tray shows badge + toast
    │
    ▼
User opens Approval Queue, reviews context
    │
    ▼
User clicks Approve/Reject
    │
    ▼
WebSocket Manager → send({ type: "approval.respond", payload: { id, decision, note } })
    │
    ▼
Gateway executes or cancels action
    │
    │  approval.resolved { id, decision, result }
    ▼
Approval Store updates, Monitoring Store logs event
```

## Recommended Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Route group: unauthenticated pages
│   │   ├── login/page.tsx
│   │   └── setup/page.tsx
│   ├── (dashboard)/               # Route group: authenticated dashboard
│   │   ├── layout.tsx             # Dashboard shell (sidebar, topbar)
│   │   ├── page.tsx               # Home/overview dashboard
│   │   ├── chat/
│   │   │   ├── page.tsx           # Chat list / inbox
│   │   │   └── [threadId]/page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx           # Agent grid
│   │   │   └── [agentId]/page.tsx # Agent detail
│   │   ├── tasks/
│   │   │   └── page.tsx           # Kanban board
│   │   ├── files/
│   │   │   └── page.tsx           # File browser
│   │   ├── channels/
│   │   │   └── page.tsx           # Channel configuration
│   │   ├── monitoring/
│   │   │   └── page.tsx           # Event feed + metrics
│   │   ├── approvals/
│   │   │   └── page.tsx           # Approval queue
│   │   ├── audit/
│   │   │   └── page.tsx           # Audit log
│   │   ├── plugins/
│   │   │   └── page.tsx           # Plugin registry
│   │   └── settings/
│   │       └── page.tsx           # System settings
│   ├── api/                       # Minimal: only for auth callbacks, health checks
│   └── layout.tsx                 # Root layout (providers, fonts)
│
├── components/                    # Shared UI components
│   ├── ui/                        # shadcn/ui primitives (button, input, dialog, etc.)
│   ├── layout/                    # Shell components (sidebar, topbar, breadcrumbs)
│   ├── data-display/              # Tables, cards, badges, status indicators
│   ├── feedback/                  # Toasts, alerts, loading states, error boundaries
│   └── composed/                  # Higher-order composed components (agent-card, message-bubble)
│
├── features/                      # Feature module co-location
│   ├── chat/
│   │   ├── components/            # Chat-specific components
│   │   │   ├── chat-thread.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── streaming-message.tsx
│   │   │   ├── chat-input.tsx
│   │   │   └── thread-list.tsx
│   │   ├── hooks/                 # Chat-specific hooks
│   │   │   ├── use-chat-stream.ts
│   │   │   └── use-thread.ts
│   │   ├── store.ts               # Chat Zustand slice
│   │   └── types.ts               # Chat domain types
│   ├── agents/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store.ts
│   │   └── types.ts
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── task-card.tsx
│   │   │   └── task-detail-panel.tsx
│   │   ├── hooks/
│   │   │   └── use-drag-task.ts
│   │   ├── store.ts
│   │   └── types.ts
│   ├── files/
│   ├── channels/
│   ├── monitoring/
│   ├── approvals/
│   ├── audit/
│   ├── plugins/
│   └── settings/
│
├── lib/                           # Shared utilities and services
│   ├── ws/                        # WebSocket infrastructure
│   │   ├── manager.ts             # WebSocket connection manager
│   │   ├── event-bus.ts           # Pub/sub event routing
│   │   ├── types.ts               # WebSocket message types
│   │   ├── reconnect.ts           # Reconnection strategy
│   │   └── heartbeat.ts           # Connection health
│   ├── api/                       # REST API client
│   │   ├── client.ts              # Base HTTP client (fetch wrapper)
│   │   └── endpoints.ts           # Typed endpoint definitions
│   ├── auth/                      # Authentication utilities
│   │   ├── guard.tsx              # Route protection component
│   │   ├── session.ts             # Session management
│   │   └── permissions.ts         # RBAC helpers
│   └── utils/                     # Pure utility functions
│       ├── format.ts              # Date, number formatting
│       ├── cn.ts                  # Tailwind class merging
│       └── constants.ts           # App constants
│
├── hooks/                         # Shared React hooks
│   ├── use-websocket.ts           # Hook to consume WebSocket events
│   ├── use-event-bus.ts           # Hook to subscribe to event bus topics
│   ├── use-optimistic.ts          # Optimistic update pattern hook
│   └── use-keyboard-shortcuts.ts  # Global keyboard shortcuts
│
├── providers/                     # React context providers
│   ├── app-providers.tsx          # Composes all providers
│   ├── websocket-provider.tsx     # WebSocket lifecycle management
│   ├── theme-provider.tsx         # Dark/light mode
│   └── query-provider.tsx         # TanStack Query client
│
└── types/                         # Global type definitions
    ├── gateway.ts                 # OpenClaw Gateway API types
    ├── events.ts                  # WebSocket event type unions
    ├── models.ts                  # Domain models (Agent, Task, Message, etc.)
    └── ui.ts                      # UI-specific types
```

### Structure Rationale

- **`features/` over `modules/`:** Co-locating components, hooks, store, and types per feature prevents cross-feature imports and makes each feature independently testable. This is the "feature-sliced" pattern widely adopted in large React codebases.
- **`components/` is feature-agnostic:** Only truly shared, reusable UI primitives live here. Feature-specific components stay in `features/X/components/`.
- **`lib/` is React-free:** Pure TypeScript utilities and services with no React dependencies. This makes them testable without React rendering and reusable if the UI framework changes.
- **`providers/` wraps the app:** Keeps provider composition clean and out of layout files.
- **`app/` is thin:** Route files are thin wrappers that import from `features/`. No business logic in route files.

## Architectural Patterns

### Pattern 1: WebSocket Manager Singleton

**What:** A single WebSocket connection shared across the entire dashboard, managed outside of React's lifecycle.

**When to use:** Always. Multiple WebSocket connections to the same gateway waste resources and create synchronization nightmares.

**Trade-offs:** Requires careful lifecycle management (connect on auth, disconnect on logout, reconnect on network loss). Worth the complexity.

```typescript
// lib/ws/manager.ts
type EventHandler = (event: GatewayEvent) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  connect(url: string, token: string): void {
    this.ws = new WebSocket(`${url}?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.eventBus.emit('ws.connected', {});
    };

    this.ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as GatewayEvent;
      this.eventBus.emit(parsed.type, parsed.payload);
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      if (!event.wasClean) {
        this.scheduleReconnect(url, token);
      }
    };
  }

  send(message: GatewayCommand): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for send after reconnect
      this.messageQueue.push(message);
    }
  }

  private scheduleReconnect(url: string, token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.eventBus.emit('ws.failed', { reason: 'max_retries' });
      return;
    }
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(url, token), delay);
  }
}
```

### Pattern 2: Event Bus with Typed Subscriptions

**What:** A lightweight pub/sub system that decouples WebSocket message parsing from feature-specific handling.

**When to use:** Always. Without it, the WebSocket manager needs to know about every feature module.

**Trade-offs:** Adds a layer of indirection. Worth it for testability and separation of concerns.

```typescript
// lib/ws/event-bus.ts
type Unsubscribe = () => void;

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  on(eventType: string, handler: EventHandler): Unsubscribe {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
    return () => this.listeners.get(eventType)?.delete(handler);
  }

  // Support wildcards: "agent.*" matches "agent.status", "agent.error"
  emit(eventType: string, payload: unknown): void {
    // Exact match
    this.listeners.get(eventType)?.forEach(handler => handler(payload));

    // Wildcard match
    const parts = eventType.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      this.listeners.get(wildcard)?.forEach(handler => handler(payload));
    }

    // Global catch-all for monitoring
    this.listeners.get('*')?.forEach(handler =>
      handler({ type: eventType, payload })
    );
  }
}
```

### Pattern 3: Streaming Token Buffer

**What:** Buffer incoming LLM tokens in a ref and flush to state on a throttled schedule, preventing excessive re-renders.

**When to use:** Any time you display streaming text from an LLM.

**Trade-offs:** Slight visual delay (16-50ms) in token display. Invisible to humans, massive performance win.

```typescript
// features/chat/hooks/use-chat-stream.ts
function useChatStream(threadId: string) {
  const bufferRef = useRef<string>('');
  const [displayText, setDisplayText] = useState('');
  const rafRef = useRef<number>();

  useEffect(() => {
    const unsubscribe = eventBus.on(`chat.stream.token`, (payload) => {
      if (payload.threadId !== threadId) return;
      bufferRef.current += payload.token;

      // Flush on next animation frame (max ~60fps)
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setDisplayText(bufferRef.current);
          rafRef.current = undefined;
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [threadId]);

  return displayText;
}
```

### Pattern 4: Optimistic Updates with Rollback

**What:** Update local state immediately on user action, then reconcile with server response.

**When to use:** Kanban drag-and-drop, approval actions, message sending -- any action where waiting for server response creates perceptible lag.

**Trade-offs:** Requires rollback logic. Keep optimistic state minimal (just move the card, don't recompute everything).

```typescript
// features/tasks/store.ts
interface TaskStore {
  tasks: Map<string, Task>;
  pendingMoves: Map<string, { from: TaskStatus; position: number }>;

  moveTask: (taskId: string, toStatus: TaskStatus, position: number) => void;
  confirmMove: (taskId: string) => void;
  revertMove: (taskId: string) => void;
}

const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: new Map(),
  pendingMoves: new Map(),

  moveTask: (taskId, toStatus, position) => {
    const task = get().tasks.get(taskId);
    if (!task) return;

    // Save rollback state
    set(state => ({
      pendingMoves: new Map(state.pendingMoves).set(taskId, {
        from: task.status,
        position: task.position,
      }),
    }));

    // Optimistic update
    set(state => {
      const tasks = new Map(state.tasks);
      tasks.set(taskId, { ...task, status: toStatus, position });
      return { tasks };
    });

    // Send to gateway
    wsManager.send({ type: 'task.move', payload: { taskId, toStatus, position } });
  },

  revertMove: (taskId) => {
    const rollback = get().pendingMoves.get(taskId);
    if (!rollback) return;
    // Restore previous state
    set(state => {
      const tasks = new Map(state.tasks);
      const task = tasks.get(taskId);
      if (task) {
        tasks.set(taskId, { ...task, status: rollback.from, position: rollback.position });
      }
      const pendingMoves = new Map(state.pendingMoves);
      pendingMoves.delete(taskId);
      return { tasks, pendingMoves };
    });
  },
}));
```

### Pattern 5: Feature Store Slices with Event Bus Hydration

**What:** Each feature module has its own Zustand store that subscribes to relevant Event Bus topics and self-hydrates.

**When to use:** Every feature module.

**Trade-offs:** Stores must handle their own Event Bus subscriptions. Use a shared `createFeatureStore` helper to reduce boilerplate.

```typescript
// features/agents/store.ts
const useAgentStore = create<AgentStore>((set, get) => ({
  agents: new Map(),
  connectionStatus: 'disconnected',

  // Called once when the store initializes
  initialize: () => {
    eventBus.on('agent.status', (payload: AgentStatusEvent) => {
      set(state => {
        const agents = new Map(state.agents);
        const existing = agents.get(payload.agentId);
        agents.set(payload.agentId, { ...existing, ...payload });
        return { agents };
      });
    });

    eventBus.on('agent.registered', (payload: AgentRegisteredEvent) => {
      set(state => {
        const agents = new Map(state.agents);
        agents.set(payload.agent.id, payload.agent);
        return { agents };
      });
    });
  },
}));
```

### Pattern 6: Route-Level Code Splitting via Feature Modules

**What:** Each route page file is a thin shell that lazy-imports its feature module. Heavy components (kanban, chat, code editors) load only when their route is visited.

**When to use:** All feature routes.

```typescript
// app/(dashboard)/tasks/page.tsx
import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(
  () => import('@/features/tasks/components/kanban-board'),
  {
    loading: () => <KanbanSkeleton />,
    ssr: false, // No SSR for interactive dashboard components
  }
);

export default function TasksPage() {
  return <KanbanBoard />;
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Multiple WebSocket Connections

**What people do:** Each feature module opens its own WebSocket connection to the gateway.
**Why it's wrong:** Browsers limit concurrent WebSocket connections per origin (typically 6-30). Multiple connections create synchronization issues, duplicate event processing, and wasted server resources. Gateway must track multiple sessions per user.
**Do this instead:** Single WebSocket connection via WebSocket Manager, routed through Event Bus.

### Anti-Pattern 2: Server Components for Real-Time Data

**What people do:** Try to use Next.js Server Components to fetch agent status, chat messages, or task state.
**Why it's wrong:** Server Components render once on the server. Real-time data is stale immediately. You end up with flash-of-stale-content followed by client hydration that replaces everything.
**Do this instead:** Use `"use client"` for all real-time data views. Reserve Server Components for static content (settings pages, documentation, initial page shells).

### Anti-Pattern 3: State Per Token in Chat Streaming

**What people do:** Call `setState` for every individual token received from the LLM stream.
**Why it's wrong:** Fast LLM streaming can produce 50-100+ tokens per second. Each `setState` triggers a React re-render cycle. The UI becomes janky, CPU spikes, and the browser tab may become unresponsive.
**Do this instead:** Buffer tokens in a ref, flush to state on `requestAnimationFrame` (see Pattern 3 above).

### Anti-Pattern 4: Prop Drilling WebSocket Events

**What people do:** Pass WebSocket events down through component trees via props.
**Why it's wrong:** Creates tight coupling between layout components and data needs. Every new event type requires threading props through intermediate components.
**Do this instead:** Feature stores subscribe to Event Bus directly. Components read from stores via Zustand selectors. No props needed for real-time data.

### Anti-Pattern 5: God Store

**What people do:** Put all application state in a single massive Zustand store.
**Why it's wrong:** Every state change triggers selector re-evaluation across the entire store. Feature modules become coupled. Testing requires mocking the entire application state.
**Do this instead:** Separate Zustand stores per feature domain (chat store, agent store, task store, etc.). Cross-feature communication goes through Event Bus, not store imports.

### Anti-Pattern 6: REST Polling for Real-Time Data

**What people do:** Use `setInterval` + `fetch` to poll for agent status updates, new messages, or task changes.
**Why it's wrong:** Wastes bandwidth, creates unnecessary server load, and introduces latency (updates arrive only on next poll interval). For a system monitoring dozens of agents, polling is fundamentally inadequate.
**Do this instead:** WebSocket for all real-time data. REST only for historical queries, file uploads, and CRUD operations that don't need real-time feedback.

### Anti-Pattern 7: Untyped WebSocket Messages

**What people do:** Use `any` types for WebSocket message payloads and parse them ad-hoc in components.
**Why it's wrong:** Runtime errors from unexpected message shapes. No autocomplete. Impossible to refactor confidently.
**Do this instead:** Define a discriminated union type for all gateway events. Validate incoming messages at the WebSocket Manager boundary. Everything downstream is fully typed.

```typescript
// types/events.ts
type GatewayEvent =
  | { type: 'agent.status'; payload: AgentStatusPayload }
  | { type: 'chat.stream.token'; payload: ChatTokenPayload }
  | { type: 'chat.stream.end'; payload: ChatCompletePayload }
  | { type: 'task.update'; payload: TaskUpdatePayload }
  | { type: 'approval.request'; payload: ApprovalRequestPayload }
  // ... exhaustive union
```

## Integration Points

### External: OpenClaw Gateway

| Interface | Protocol | Purpose | Notes |
|-----------|----------|---------|-------|
| WebSocket `/ws` | WS/WSS | Real-time bidirectional communication | Primary interface. All live events flow here. |
| REST API `/api/v1/*` | HTTP/HTTPS | CRUD operations, historical data, file upload | Secondary interface. For non-realtime needs. |
| Health `/health` | HTTP | Gateway availability check | Poll on reconnect to distinguish gateway-down from network-down. |

**Gateway message protocol assumptions (to be validated with OpenClaw docs):**
- JSON-encoded frames
- Event envelope: `{ type: string, payload: object, timestamp: string, correlationId?: string }`
- Command envelope: `{ type: string, payload: object, requestId: string }`
- Correlation IDs for request-response patterns over WebSocket

### Internal Module Boundaries

| Boundary | Communication | Direction | Notes |
|----------|---------------|-----------|-------|
| WebSocket Manager <-> Event Bus | Direct function calls | WS Manager publishes to Event Bus | Synchronous within same JS context |
| Event Bus <-> Feature Stores | Pub/sub subscriptions | Event Bus pushes to stores | Stores subscribe on initialization |
| Feature Stores <-> UI Components | Zustand selectors | Components pull from stores | Reactive -- re-renders on selected state change |
| Feature A <-> Feature B | Event Bus or shared types | Through Event Bus, never direct store imports | Prevents circular dependencies |
| UI Components <-> API Client | Async function calls | Components invoke, client returns | For REST operations only |

### Critical Integration: WebSocket Reconnection

The reconnection strategy is architecturally significant because it affects every feature module.

```
Connection Lost
    │
    ▼
WebSocket Manager detects close (not clean)
    │
    ▼
Event Bus emits "ws.disconnected"
    │
    ▼
All stores mark their data as "possibly stale"
UI shows connection status indicator (yellow banner)
    │
    ▼
Exponential backoff reconnect attempts (1s, 2s, 4s, 8s, 16s, 32s, cap at 30s)
    │
    ├──▶ Reconnect successful
    │       │
    │       ▼
    │    Event Bus emits "ws.connected"
    │       │
    │       ▼
    │    Each store requests a state snapshot from gateway
    │    (gateway sends current state for agents, active chats, pending approvals)
    │       │
    │       ▼
    │    Stores reconcile snapshot with local state
    │    UI removes connection warning
    │
    └──▶ Max retries exceeded
            │
            ▼
         Event Bus emits "ws.failed"
            │
            ▼
         UI shows "Connection lost" overlay with manual retry button
```

## Scaling Considerations

Since AXion Hub is a **self-hosted dashboard** (not a SaaS), scaling concerns are different from typical web apps. The primary concern is: how many concurrent agents/streams can one dashboard instance handle?

| Concern | 1-5 agents | 10-50 agents | 100+ agents |
|---------|------------|--------------|-------------|
| WebSocket messages/sec | Trivial (~10/s) | Moderate (~100/s) | Needs throttling/batching |
| Chat streams | 1-2 concurrent | 5-10 concurrent | Must virtualize, only stream visible threads |
| Kanban cards | All in DOM | All in DOM | Virtualize with react-window |
| Event feed | Keep all in memory | Ring buffer (last 1000) | Ring buffer + lazy load from API |
| Agent status cards | Simple grid | Paginated grid | Search + filter, lazy render |
| Browser memory | <50MB | <200MB | Aggressive cleanup of old chat history |

### Scaling Priorities

1. **First bottleneck: Chat streaming with many agents** -- If multiple agents stream simultaneously, the token buffer pattern (Pattern 3) is essential. Also need UI to show only the active/focused chat stream, not render all streams simultaneously.

2. **Second bottleneck: Event feed volume** -- The monitoring event feed can accumulate thousands of events per minute with many active agents. Use a ring buffer (fixed-size array, overwrite oldest) and persist to gateway for historical queries.

3. **Third bottleneck: Browser tab memory** -- Long-running dashboard sessions accumulate state. Implement a store cleanup strategy: evict chat history for threads not viewed in 30+ minutes, compress old event logs, release file preview data.

## Build Order (Dependency Graph)

The build order is driven by what each component depends on. Here is the recommended sequence:

```
Phase 1: Foundation (no feature depends on another feature)
├── UI Foundation (shadcn/ui setup, layout shell, theme)
├── WebSocket Manager + Event Bus
├── Auth Guard + Session Management
└── Zustand store infrastructure + provider wiring

Phase 2: Core Agent Loop (the primary value proposition)
├── Agent Store + Agent status display
├── Chat Store + Chat streaming (depends on WS Manager, Event Bus)
└── Basic monitoring event feed (depends on Event Bus)

Phase 3: Task Management (depends on Agent identity from Phase 2)
├── Task Store
├── Kanban board with drag-and-drop (depends on Task Store)
└── Task-Agent assignment (depends on Agent Store)

Phase 4: Governance & Control (depends on agent + task foundation)
├── Approval workflow (depends on WS Manager, Agent Store)
├── Audit log viewer (depends on API Client)
└── Channel routing configuration

Phase 5: Workspace & Extensibility
├── File browser + workspace management
├── Plugin/skill registry
└── Advanced settings & system configuration

Phase 6: Polish & Advanced Features
├── Multi-stream chat (multiple concurrent agent chats)
├── Advanced monitoring (charts, metrics, dashboards)
├── Keyboard shortcuts, command palette
└── Mobile-responsive refinements
```

**Build order rationale:**
- Phase 1 is pure infrastructure. Everything depends on it, nothing depends on each other within it.
- Phase 2 is the core value: seeing agents and talking to them. Without this, the dashboard is pointless.
- Phase 3 adds task orchestration. Kanban requires agent identity to assign tasks, so it comes after Phase 2.
- Phase 4 adds governance (approvals, audit). These are critical for production use but require the agent/task foundation to be meaningful.
- Phase 5 is workspace tooling. Important but not blocking the core agent loop.
- Phase 6 is refinement. These features enhance existing functionality rather than adding new capabilities.

## Key Architectural Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering strategy | Client-heavy with `"use client"` | Real-time dashboard; SSR provides no value for live state |
| WebSocket architecture | Single connection + Event Bus | Prevent connection sprawl, enable decoupled features |
| State management | Zustand (per-feature stores) | Lightweight, no boilerplate, excellent selector performance |
| Chat streaming | Token buffer + rAF flush | Prevent render thrashing at 50-100 tokens/sec |
| Drag-and-drop | Optimistic update + rollback | Instant feedback for Kanban operations |
| Code splitting | Dynamic imports per route | 87 pages means massive bundle without splitting |
| Feature organization | Feature-sliced architecture | Co-locate related code, prevent cross-feature coupling |
| REST data fetching | TanStack Query | Caching, deduplication, background refresh for non-realtime data |
| Realtime data fetching | Event Bus -> Zustand stores | Not TanStack Query -- WebSocket events are push, not pull |

## Sources

- Architectural patterns derived from training data on established React dashboard, real-time, and WebSocket architectures (May 2025 cutoff)
- WebSocket reconnection patterns from production real-time application architectures
- Chat streaming buffer pattern from LLM integration best practices (Vercel AI SDK, similar tools)
- Feature-sliced architecture from community-adopted React project organization patterns
- dnd-kit kanban patterns from drag-and-drop dashboard implementations
- **Confidence note:** Web search and Context7 were unavailable during this research session. All library version claims and specific API details should be verified against current documentation before implementation. The architectural patterns themselves are stable and well-established.

---
*Architecture research for: AXion Hub -- Self-hosted AI Agent Orchestration Dashboard*
*Researched: 2026-02-17*
