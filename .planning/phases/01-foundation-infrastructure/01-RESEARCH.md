# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-02-17
**Domain:** Full-stack infrastructure scaffolding (Next.js, Docker, database, WebSocket, component library, state management, audit logging, job queues)
**Confidence:** HIGH (core stack verified via official docs and web research; OpenClaw protocol verified via official documentation)

## Summary

Phase 1 establishes every architectural foundation that subsequent phases build on. The core stack is Next.js 16 (App Router, Turbopack default, React 19.2) with Tailwind CSS v4 (CSS-first configuration, OKLCH colors), shadcn/ui (v3, Tailwind v4 compatible), Drizzle ORM for PostgreSQL, and bun as the package manager. All services run in Docker Compose containers.

A critical discovery during research: the OpenClaw Gateway uses **raw WebSocket with a custom JSON-RPC protocol** (not Socket.IO). The STACK.md recommendation of Socket.IO for gateway communication must be revised. The WebSocket Manager should use the native WebSocket API to speak the gateway's `{type:"req"|"res"|"event", ...}` frame protocol. Socket.IO remains valuable for AXion Hub's own real-time features (internal server-to-browser communication), but the gateway connection layer must use raw WebSocket.

The phase produces no user-facing features but defines the visual DNA (design system, component library), data infrastructure (database, migrations, audit logging), real-time infrastructure (WebSocket Manager, Event Bus), state management patterns (Zustand + TanStack Query), and DevEx tooling (Docker, Biome, Vitest, Storybook).

**Primary recommendation:** Build the gateway abstraction layer using raw WebSocket first (it is the most architecturally critical piece), then the design system and component library (they set visual consistency for all 87 pages), then everything else.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Aesthetic: Dark, sleek, techy -- Linear/Vercel mission control vibes
- Theme: System-aware (follow OS preference) + manual toggle for user override
- Colors: Existing Tailwind v4 OKLCH theme -- warm amber/orange primary (`oklch(0.7214 0.1337 49.98)` dark), teal secondary (`oklch(0.5940 0.0443 196.02)` dark), near-black background with subtle purple tint (`oklch(0.1797 0.0043 308.19)`)
- Typography: Outfit (sans), JetBrains Mono (mono), Merriweather (serif)
- Border radius: 0.75rem base
- Density: Comfortable -- generous padding, breathing room between elements. No compact mode toggle needed.
- Full OKLCH theme CSS provided (both light and dark mode variables) -- use as-is, do not redesign the palette
- DataTable: Virtual scrolling for large datasets (agents, sessions, logs). Smooth infinite scroll, virtualized off-screen rows
- Empty states: Illustrated + helpful -- custom illustrations with friendly copy and clear CTA ("No agents yet -- create your first one")
- Loading states: Skeleton screens with animated shimmer/pulse effect. Placeholder shapes mirror the layout about to appear
- StatusBadge: Theme-tinted semantic colors -- green becomes teal-green (leaning toward secondary palette), warning stays amber (aligned with primary), error stays red
- Connection state UX: Persistent top bar indicator (normal), full-width warning banner (disconnect), animated pulsing + attempt count (reconnecting), persistent banner with manual Retry (failed)
- Docker: Full Docker setup -- everything in containers (Next.js, PostgreSQL, Redis). One `docker compose up` starts it all
- Package manager: bun -- fast installs, TypeScript-native
- Testing: Vitest for unit tests + Storybook for visual component stories. Both from day one
- Code quality: Biome for linting + formatting (single tool)

### Claude's Discretion
- Code quality extras beyond Biome (knip, strict TypeScript, etc.)
- Exact skeleton shimmer animation implementation
- Empty state illustration style (line art, flat, etc.)
- Shadow and spacing fine-tuning within the comfortable density guideline
- Storybook configuration details
- Docker hot reload optimization approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | Next.js 16 App Router with TypeScript, Tailwind CSS v4, shadcn/ui, and Biome | Next.js 16 verified (Turbopack default, React 19.2, proxy.ts replaces middleware). Tailwind v4 CSS-first config verified. shadcn/ui v3 Tailwind v4 support verified. Biome 2 setup patterns documented. |
| INFR-02 | PostgreSQL with Drizzle ORM schema, migrations, and connection pooling | Drizzle ORM 0.45.x with `pg` driver or `bun:sql` driver verified. drizzle-kit for migrations. Pool via `pg.Pool`. Schema-as-code with `pgTable()`. |
| INFR-03 | Docker Compose with AXion Hub, PostgreSQL, and Redis services | Multi-stage bun Dockerfile pattern verified. Docker Compose with health checks, named volumes, configurable ports documented. |
| INFR-04 | WebSocket Manager singleton with typed Event Bus for real-time OpenClaw Gateway communication | **CRITICAL FINDING:** Gateway uses raw WebSocket JSON-RPC protocol, NOT Socket.IO. Must use native WebSocket/`ws` library. Protocol documented: `{type:"req"/"res"/"event", ...}` frames. |
| INFR-05 | Gateway abstraction layer insulating features from raw OpenClaw API changes | Gateway protocol fully documented: three-phase auth handshake, request/response/event frames, TypeBox validation, idempotency keys. Adapter pattern with Zod validation recommended. |
| INFR-06 | Dual-mode connection -- local (filesystem + WebSocket) and remote (WebSocket only) | Gateway runs at `ws://127.0.0.1:18789`. Local mode adds filesystem access to `~/.openclaw/agents/`. Connection mode detection and graceful degradation patterns documented. |
| INFR-07 | Shared UI component library built on shadcn/ui | shadcn/ui DataTable (TanStack Table v8), virtual scrolling (TanStack Virtual), StatusBadge, Skeleton, EmptyState patterns verified. Storybook with Tailwind v4 requires `@source` directive. |
| INFR-08 | Feature-sliced architecture with domain modules | FSD with Next.js App Router documented: `app/` at root for routes, `src/` for FSD layers (features, entities, shared, widgets). Re-export pattern verified. |
| INFR-09 | Zustand stores for WebSocket state + TanStack Query for REST data | Zustand v5 (React 19 compatible), TanStack Query v5 with Next.js App Router. Separation: Zustand for real-time push state, TanStack Query for REST pull state. |
| INFR-10 | Audit logging middleware in every mutating API endpoint | Next.js API route middleware pattern. Append-only audit table with hash chain. Drizzle schema for audit records with before/after diffs. |
| INFR-11 | BullMQ job queue with Redis for background tasks | BullMQ v5 with ioredis. Worker pattern in `src/workers/`. Redis connection with `maxRetriesPerRequest: null`. Queue/Worker/Job lifecycle documented. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.1.6 | Full-stack React framework | App Router for 87 pages, Turbopack default (2-5x faster builds), React 19.2, Cache Components, `proxy.ts` replaces middleware |
| React | ^19.2.4 | UI library | Required by Next.js 16. View Transitions, `useEffectEvent()`, `<Activity/>` component |
| TypeScript | ^5.9.3 | Type safety | Non-negotiable for 87+ pages. Strict mode recommended. |
| Tailwind CSS | ^4.1.18 | Styling | CSS-first config (`@import "tailwindcss"`), `@theme inline` for custom tokens, OKLCH native support, 70% smaller CSS output vs v3 |
| shadcn/ui | ^3.8.5 (CLI) | Component library | Copies components into codebase. Full ownership. Tailwind v4 + React 19 compatible. `data-slot` attributes, OKLCH colors, `new-york` style default |
| bun | latest | Package manager + runtime | 2-4x faster installs than npm. TypeScript-native. Drizzle supports `bun:sql` driver |

### Database & Infrastructure

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PostgreSQL | 17 (Docker) | Primary database | Relational data, JSONB for flexible fields, full-text search, table partitioning for audit logs |
| Drizzle ORM | ^0.45.1 | Database ORM | Zero runtime binary, schema-as-code, type-safe queries. `drizzle-orm/node-postgres` with `pg` driver for connection pooling |
| drizzle-kit | ^0.31.9 | Migration tooling | `drizzle-kit generate` + `drizzle-kit migrate`. Compares schema to DB, generates SQL migration files |
| Redis | 7 (Docker) | Cache + queues | BullMQ backend, WebSocket state caching, rate limiting |
| ioredis | ^5.9.3 | Redis client | Required by BullMQ (`maxRetriesPerRequest: null`). Connection pooling built-in |
| BullMQ | ^5.69.3 | Job queue | Redis-backed, priorities, retries, rate limiting, delayed jobs, cron scheduling, parent-child dependencies |

### Real-Time & State

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ws | ^8.19.0 | WebSocket client (gateway) | **OpenClaw Gateway uses raw WebSocket, not Socket.IO.** Must speak the gateway's JSON-RPC protocol directly |
| Zustand | ^5.0.11 | Client state (real-time) | Lightweight global store for WebSocket connection state, UI state, real-time agent data pushed via Event Bus |
| TanStack Query | ^5.90.21 | Server state (REST) | API data caching, background refetching, optimistic updates for REST-fetched historical data |
| nuqs | ^2.8.8 | URL search params state | Type-safe URL state for filters/pagination across 87 pages |

### UI & Design System

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.21.3 | DataTable headless logic | Sorting, filtering, pagination, column visibility. Used with shadcn/ui Table component |
| @tanstack/react-virtual | ^3.x | Virtual scrolling | Virtualize rows in DataTable for large datasets. Required by user decision |
| next-themes | ^0.4.6 | Theme switching | System-aware dark/light + manual toggle. Works with Tailwind v4 and shadcn/ui |
| lucide-react | ^0.574.0 | Icons | 1500+ icons, tree-shakeable, shadcn/ui default |
| sonner | ^2.0.7 | Toast notifications | Accessible, stackable toasts |
| class-variance-authority | ^0.7.1 | Component variants | Used by shadcn/ui for component variant definitions |
| clsx + tailwind-merge | ^2.1.1 / ^3.4.1 | Class merging | `cn()` utility for conditional Tailwind classes |

### DevEx & Quality

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Biome | ^2.4.2 | Linting + formatting | Single Rust-based tool replacing ESLint + Prettier. Next.js 16 removed `next lint` -- recommends Biome or ESLint directly |
| Vitest | ^4.0.18 | Unit/integration testing | Fast, Vite-powered. With bun: use `bun run test` not `bun test` |
| Storybook | ^8.x | Component stories | Visual component development. Tailwind v4 requires `@source` directive for class scanning |
| knip | latest | Dead code detection | Finds unused files, exports, dependencies. Monorepo-aware. Recommended as code quality extra (Claude's Discretion) |

### Supporting (Phase 1 only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^4.3.6 | Schema validation | Validate gateway responses, API inputs, environment variables |
| @t3-oss/env-nextjs | ^0.13.10 | Environment validation | Validates env vars at build time (DATABASE_URL, REDIS_URL) |
| nanoid | ^5.1.6 | Short unique IDs | URL-friendly IDs for audit records, correlation IDs |
| pino | ^10.3.1 | Structured logging | JSON logging for production. pino-pretty for dev |
| date-fns | ^4.1.0 | Date formatting | Timestamps in audit logs, relative times |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw `ws` for gateway | Socket.IO client | Socket.IO adds features (reconnection, rooms) but gateway speaks raw WS JSON-RPC. Socket.IO framing would need to be stripped/adapted. Use raw `ws` + custom reconnection logic |
| `pg` driver for Drizzle | `bun:sql` (Drizzle's bun driver) | `bun:sql` is native to bun runtime but less battle-tested for production. `pg` driver with `pg.Pool` is the safest choice for connection pooling in Docker |
| Vitest | bun's built-in test runner | Bun test is fast but lacks Vitest's plugin ecosystem (React Testing Library integration, coverage). Vitest is the ecosystem standard |
| knip | ts-prune | ts-prune only finds unused exports. Knip finds unused files, dependencies, AND exports. More comprehensive |

**Installation (bun):**
```bash
# Core framework
bun add next@^16.1.6 react@^19.2.4 react-dom@^19.2.4

# Database
bun add drizzle-orm@^0.45.1 pg@^8.18.0 ioredis@^5.9.3

# Job queue
bun add bullmq@^5.69.3

# State management & data fetching
bun add zustand@^5.0.11 @tanstack/react-query@^5.90.21 nuqs@^2.8.8

# Validation
bun add zod@^4.3.6 @t3-oss/env-nextjs@^0.13.10

# UI (shadcn/ui deps)
bun add tailwindcss@^4.1.18 @tailwindcss/postcss postcss
bun add class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.4.1
bun add lucide-react@^0.574.0 next-themes@^0.4.6 sonner@^2.0.7

# Data display
bun add @tanstack/react-table@^8.21.3 @tanstack/react-virtual@^3

# Utilities
bun add date-fns@^4.1.0 nanoid@^5.1.6 pino@^10.3.1

# Dev dependencies
bun add -D typescript@^5.9.3 @types/react@^19 @types/react-dom@^19 @types/pg@^8
bun add -D drizzle-kit@^0.31.9
bun add -D @biomejs/biome@^2.4.2
bun add -D vitest@^4.0.18 @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react
bun add -D pino-pretty
bun add -D knip
```

## Architecture Patterns

### Recommended Project Structure (Feature-Sliced Design + Next.js App Router)

```
AXion-Hub/
├── app/                              # Next.js App Router (routing only, thin shells)
│   ├── (auth)/                       # Route group: unauthenticated pages
│   │   └── login/page.tsx
│   ├── (dashboard)/                  # Route group: authenticated dashboard
│   │   ├── layout.tsx                # Dashboard shell (sidebar, topbar, connection indicator)
│   │   ├── page.tsx                  # Dashboard home (re-exports from src/pages)
│   │   ├── agents/
│   │   ├── chat/
│   │   ├── missions/
│   │   └── settings/
│   ├── api/                          # API routes (audit middleware applies here)
│   │   └── health/route.ts
│   └── layout.tsx                    # Root layout (providers, fonts, theme)
│
├── src/                              # FSD layers (all business logic lives here)
│   ├── app/                          # FSD app layer: providers, global config
│   │   ├── providers/
│   │   │   ├── app-providers.tsx     # Composes all providers
│   │   │   ├── query-provider.tsx    # TanStack Query client
│   │   │   └── theme-provider.tsx    # next-themes wrapper
│   │   └── styles/
│   │       └── globals.css           # Tailwind v4 import + OKLCH theme tokens
│   │
│   ├── pages/                        # FSD pages layer: page compositions
│   │   └── dashboard/
│   │       ├── index.ts              # Public API
│   │       └── ui/dashboard-page.tsx
│   │
│   ├── widgets/                      # FSD widgets: composed UI blocks
│   │   ├── connection-status/        # Gateway connection banner (all states)
│   │   └── app-shell/                # Sidebar + topbar layout
│   │
│   ├── features/                     # FSD features: user-facing capabilities
│   │   ├── gateway-connection/       # WebSocket Manager, Event Bus, connection state
│   │   │   ├── lib/
│   │   │   │   ├── ws-manager.ts     # WebSocket connection manager (raw WS)
│   │   │   │   ├── event-bus.ts      # Typed pub/sub event routing
│   │   │   │   ├── gateway-client.ts # Abstraction layer (maps raw protocol to clean API)
│   │   │   │   └── reconnect.ts      # Exponential backoff with jitter
│   │   │   ├── model/
│   │   │   │   ├── store.ts          # Zustand connection state store
│   │   │   │   └── types.ts          # Connection state machine types
│   │   │   └── index.ts
│   │   └── audit/                    # Audit logging infrastructure
│   │       ├── lib/
│   │       │   └── middleware.ts      # API route audit middleware
│   │       └── model/
│   │           └── schema.ts          # Drizzle audit table schema
│   │
│   ├── entities/                     # FSD entities: business objects
│   │   └── gateway-event/            # Gateway event types and parsers
│   │       ├── model/
│   │       │   └── types.ts           # Discriminated union of all gateway events
│   │       └── lib/
│   │           └── parser.ts          # Zod schemas for gateway frame validation
│   │
│   └── shared/                       # FSD shared: reusable utilities and UI
│       ├── ui/                       # shadcn/ui primitives + custom components
│       │   ├── button.tsx            # shadcn/ui generated
│       │   ├── data-table.tsx        # Custom: TanStack Table + Virtual + shadcn Table
│       │   ├── status-badge.tsx      # Custom: theme-tinted semantic status
│       │   ├── form-field.tsx        # Custom: react-hook-form + shadcn Input
│       │   ├── page-header.tsx       # Custom: consistent page header layout
│       │   ├── empty-state.tsx       # Custom: illustrated empty states with CTA
│       │   ├── loading-skeleton.tsx  # Custom: shimmer skeleton screens
│       │   ├── action-menu.tsx       # Custom: dropdown action menus
│       │   ├── filter-bar.tsx        # Custom: filter/search bar
│       │   ├── error-boundary.tsx    # Custom: error fallback UI
│       │   └── search-input.tsx      # Custom: debounced search
│       ├── lib/                      # Pure utilities (React-free)
│       │   ├── cn.ts                 # Tailwind class merging
│       │   ├── db.ts                 # Drizzle instance + connection pool
│       │   ├── redis.ts              # ioredis singleton
│       │   ├── queue.ts              # BullMQ queue instances
│       │   └── env.ts                # @t3-oss/env-nextjs validated env
│       ├── config/                   # Constants, feature flags
│       └── types/                    # Global shared types
│
├── workers/                          # BullMQ worker processes
│   └── audit-worker.ts              # Processes audit log entries
│
├── drizzle/                          # Migration files (generated by drizzle-kit)
│   └── 0000_initial.sql
│
├── .storybook/                       # Storybook config
│   ├── main.ts
│   └── preview.ts                    # Import globals.css here
│
├── docker-compose.yml                # Dev: all services with hot reload
├── docker-compose.prod.yml           # Prod: optimized builds
├── Dockerfile                        # Multi-stage bun build
├── biome.json                        # Biome config
├── drizzle.config.ts                 # Drizzle migration config
├── vitest.config.mts                 # Vitest config
├── next.config.ts                    # Next.js config
├── postcss.config.mjs                # PostCSS with @tailwindcss/postcss
├── tsconfig.json                     # TypeScript strict config
└── bunfig.toml                       # Bun config (if needed)
```

### Pattern 1: OpenClaw Gateway WebSocket Manager (Raw WebSocket)

**What:** A singleton that manages the raw WebSocket connection to the OpenClaw Gateway, speaking the gateway's JSON-RPC protocol.

**CRITICAL:** The OpenClaw Gateway does NOT use Socket.IO. It uses a custom protocol with three frame types: `{type:"req"}`, `{type:"res"}`, `{type:"event"}`. The connection requires a three-phase handshake (challenge, connect, hello-ok).

**When to use:** Always. This is the single connection to the gateway.

```typescript
// Source: https://docs.openclaw.ai/gateway/protocol
// src/features/gateway-connection/lib/ws-manager.ts

import { nanoid } from 'nanoid';
import type { GatewayEvent, GatewayRequest, GatewayResponse } from '@/entities/gateway-event';

type ConnectionState = 'disconnected' | 'connecting' | 'authenticating' | 'connected' | 'reconnecting' | 'failed';

interface PendingRequest {
  resolve: (response: GatewayResponse) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private pendingRequests = new Map<string, PendingRequest>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5; // User decided: no auto-retry after exhaustion
  private reconnectDelay = 1000;
  private eventBus: EventBus;
  private messageQueue: GatewayRequest[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  async connect(url: string, token: string): Promise<void> {
    this.setState('connecting');
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      // Gateway sends connect.challenge first -- wait for it
      this.setState('authenticating');
    };

    this.ws.onmessage = (event) => {
      const frame = JSON.parse(event.data);

      switch (frame.type) {
        case 'event':
          if (frame.event === 'connect.challenge') {
            // Phase 2: Respond with connect request
            this.sendRaw({
              type: 'req',
              id: nanoid(),
              method: 'connect',
              params: {
                role: 'operator',
                scopes: ['operator.read', 'operator.write'],
                auth: { token },
                client: { name: 'AXion Hub', version: '1.0.0' },
              },
            });
          } else {
            // Regular event -- dispatch to Event Bus
            this.eventBus.emit(frame.event, frame.payload);
          }
          break;

        case 'res':
          // Match response to pending request
          const pending = this.pendingRequests.get(frame.id);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(frame.id);
            if (frame.ok) {
              if (frame.payload?.auth?.deviceToken) {
                // hello-ok: connection established
                this.setState('connected');
                this.reconnectAttempts = 0;
                this.flushMessageQueue();
              }
              pending.resolve(frame);
            } else {
              pending.reject(new Error(frame.error?.message || 'Request failed'));
            }
          }
          break;
      }
    };

    this.ws.onclose = (event) => {
      if (!event.wasClean && this.state !== 'failed') {
        this.scheduleReconnect(url, token);
      }
    };
  }

  async request(method: string, params: unknown): Promise<GatewayResponse> {
    const id = nanoid();
    const request: GatewayRequest = { type: 'req', id, method, params };

    if (this.state !== 'connected') {
      this.messageQueue.push(request);
      // Still return a promise that resolves when sent
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, 30_000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      if (this.state === 'connected') {
        this.ws?.send(JSON.stringify(request));
      }
    });
  }

  private scheduleReconnect(url: string, token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('failed');
      this.eventBus.emit('ws.failed', { reason: 'max_retries', attempts: this.reconnectAttempts });
      return;
    }
    this.setState('reconnecting');
    const jitter = Math.random() * 1000;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts) + jitter, 30_000);
    this.reconnectAttempts++;
    this.eventBus.emit('ws.reconnecting', { attempt: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts });
    setTimeout(() => this.connect(url, token), delay);
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.eventBus.emit('ws.state', { state });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.ws?.send(JSON.stringify(msg));
    }
  }

  private sendRaw(frame: unknown): void {
    this.ws?.send(JSON.stringify(frame));
  }
}
```

### Pattern 2: Gateway Abstraction Layer

**What:** A typed client that encapsulates the raw gateway protocol and exposes clean methods. All dashboard code goes through this layer -- never touching raw WebSocket frames.

**When to use:** Every feature that communicates with the gateway.

```typescript
// src/features/gateway-connection/lib/gateway-client.ts

import { z } from 'zod';
import type { WebSocketManager } from './ws-manager';

// Internal domain models (dashboard's own types, not gateway's)
interface Agent {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'working' | 'error' | 'offline';
  model: string;
  lastActive: Date;
}

// Zod schemas validate + transform gateway data into internal models
const GatewayAgentSchema = z.object({
  agent_id: z.string(),
  display_name: z.string(),
  agent_status: z.string(),
  current_model: z.string().optional(),
  last_activity: z.string().optional(),
}).transform((raw) => ({
  id: raw.agent_id,
  name: raw.display_name,
  status: mapAgentStatus(raw.agent_status), // Handles gateway version differences
  model: raw.current_model ?? 'unknown',
  lastActive: raw.last_activity ? new Date(raw.last_activity) : new Date(),
}));

class GatewayClient {
  constructor(private ws: WebSocketManager) {}

  async getAgents(): Promise<Agent[]> {
    const response = await this.ws.request('agent.list', {});
    return z.array(GatewayAgentSchema).parse(response.payload.agents);
  }

  async sendMessage(agentId: string, message: string): Promise<void> {
    await this.ws.request('agent.send', {
      agentId,
      message,
      idempotencyKey: nanoid(), // Required by gateway protocol
    });
  }

  async getHealth(): Promise<GatewayHealth> {
    const response = await this.ws.request('health', {});
    return GatewayHealthSchema.parse(response.payload);
  }
}
```

### Pattern 3: Event Bus with TypeScript Discriminated Unions

**What:** Typed pub/sub that decouples WebSocket events from feature stores.

```typescript
// src/features/gateway-connection/lib/event-bus.ts

type EventMap = {
  // Gateway events (from OpenClaw)
  'agent.status': { agentId: string; status: string; };
  'chat.stream.start': { sessionId: string; messageId: string; };
  'chat.stream.token': { sessionId: string; messageId: string; token: string; };
  'chat.stream.end': { sessionId: string; messageId: string; fullText: string; };
  // Internal events (AXion Hub)
  'ws.state': { state: ConnectionState; };
  'ws.reconnecting': { attempt: number; maxAttempts: number; };
  'ws.failed': { reason: string; attempts: number; };
};

type EventHandler<K extends keyof EventMap> = (payload: EventMap[K]) => void;
type Unsubscribe = () => void;

class EventBus {
  private listeners = new Map<string, Set<EventHandler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: EventHandler<K>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(payload));
    // Wildcard support: "agent.*" matches "agent.status"
    const parts = (event as string).split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      this.listeners.get(wildcard)?.forEach(handler => handler(payload));
    }
  }
}
```

### Pattern 4: Zustand Store with Event Bus Subscription

**What:** Feature stores subscribe to Event Bus topics for real-time data.

```typescript
// src/features/gateway-connection/model/store.ts

import { create } from 'zustand';
import type { ConnectionState } from './types';

interface ConnectionStore {
  state: ConnectionState;
  reconnectAttempt: number;
  maxAttempts: number;
  // Actions
  retry: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  state: 'disconnected',
  reconnectAttempt: 0,
  maxAttempts: 5,
  retry: () => {
    // Trigger manual reconnect via gateway client
  },
}));

// Initialize subscription (called once at app startup)
export function initConnectionStoreSubscriptions(eventBus: EventBus) {
  eventBus.on('ws.state', ({ state }) => {
    useConnectionStore.setState({ state });
  });
  eventBus.on('ws.reconnecting', ({ attempt, maxAttempts }) => {
    useConnectionStore.setState({ reconnectAttempt: attempt, maxAttempts });
  });
}
```

### Pattern 5: TanStack Query Provider for Next.js App Router

**What:** QueryClient setup for client components in App Router.

```typescript
// src/app/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false, // Dashboard is WebSocket-driven
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Pattern 6: Drizzle Schema with Audit Table

```typescript
// src/features/audit/model/schema.ts
import { pgTable, text, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  actor: text('actor').notNull(),         // userId or 'system'
  actorType: text('actor_type').notNull(), // 'user' | 'system' | 'webhook'
  action: text('action').notNull(),        // 'create' | 'update' | 'delete'
  resourceType: text('resource_type').notNull(), // 'agent' | 'task' | 'config'
  resourceId: text('resource_id').notNull(),
  before: jsonb('before'),                 // Snapshot before mutation
  after: jsonb('after'),                   // Snapshot after mutation
  metadata: jsonb('metadata'),             // IP, user agent, correlation ID
  prevHash: text('prev_hash'),             // Hash of previous record (tamper detection)
});
```

### Pattern 7: Audit Logging Middleware for Next.js API Routes

```typescript
// src/features/audit/lib/middleware.ts
import { db } from '@/shared/lib/db';
import { auditLogs } from '../model/schema';
import { nanoid } from 'nanoid';

type AuditContext = {
  actor: string;
  actorType: 'user' | 'system';
  action: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  before?: unknown;
  after?: unknown;
};

export async function createAuditLog(ctx: AuditContext, request?: Request) {
  const metadata = request ? {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    correlationId: nanoid(),
  } : { correlationId: nanoid() };

  // Scrub secrets from before/after diffs
  const sanitizedBefore = scrubSecrets(ctx.before);
  const sanitizedAfter = scrubSecrets(ctx.after);

  await db.insert(auditLogs).values({
    actor: ctx.actor,
    actorType: ctx.actorType,
    action: ctx.action,
    resourceType: ctx.resourceType,
    resourceId: ctx.resourceId,
    before: sanitizedBefore,
    after: sanitizedAfter,
    metadata,
  });
}

function scrubSecrets(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'api_key', 'token', 'secret', 'apiKey'];
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
      key,
      sensitiveKeys.some(k => key.toLowerCase().includes(k)) ? '[REDACTED]' : value,
    ])
  );
}
```

### Pattern 8: Docker Compose with Bun (Dev Mode)

```yaml
# docker-compose.yml (development)
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    ports:
      - "${APP_PORT:-3000}:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      DATABASE_URL: postgres://axion:axion@db:5432/axion
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: axion
      POSTGRES_USER: axion
      POSTGRES_PASSWORD: axion
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U axion"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

```dockerfile
# Dockerfile (multi-stage with bun)
FROM oven/bun:latest AS base
WORKDIR /app

# Dev stage
FROM base AS dev
COPY package.json bun.lock* ./
RUN bun install
COPY . .
CMD ["bun", "run", "dev"]

# Dependencies stage (prod)
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["bun", "server.js"]
```

### Anti-Patterns to Avoid

- **Using Socket.IO client for gateway communication:** The OpenClaw Gateway speaks raw WebSocket JSON-RPC. Socket.IO adds its own framing protocol on top of WebSocket. The gateway will not understand Socket.IO frames and will hard-close the connection.
- **Server Components for real-time data:** Dashboard pages showing live agent status, connection state, or streaming data must be `"use client"`. Reserve Server Components for initial data loading and settings pages.
- **Global Zustand store:** Separate stores per feature domain. The connection store, agent store, and chat store must be independent. Cross-feature communication goes through Event Bus.
- **Polling for gateway data:** The gateway pushes events via WebSocket. REST polling wastes resources and adds latency. Use WebSocket events for all real-time data.
- **Direct gateway protocol types in UI code:** All gateway data must pass through the GatewayClient abstraction layer with Zod validation. UI components never import gateway protocol types directly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table with sorting/filtering/pagination | Custom `<table>` with manual state | `@tanstack/react-table` + `@tanstack/react-virtual` + shadcn Table | Handles column resizing, row selection, virtual scrolling, accessibility. Thousands of edge cases |
| Theme toggling (dark/light/system) | Custom localStorage + media query listener | `next-themes` | Handles SSR flash prevention, system preference detection, localStorage persistence, class-based switching |
| Environment variable validation | Manual `process.env.X \|\| throw` | `@t3-oss/env-nextjs` with Zod | Validates at build time, provides TypeScript types, catches missing vars before runtime |
| Form state management | `useState` for each field + manual validation | `react-hook-form` + `zod` (future phases) | Uncontrolled inputs for performance, schema-based validation, error messages. Will be needed in Phase 2+ |
| Class name merging | String concatenation | `cn()` with `clsx` + `tailwind-merge` | Handles Tailwind class conflicts (e.g., `p-4` vs `p-2`), conditional classes |
| Toast notifications | Custom portal + animation | `sonner` | Accessible, stackable, auto-dismiss, promise-based, styled with Tailwind |
| WebSocket reconnection | setTimeout + counter | Dedicated reconnection module with exponential backoff + jitter | Thundering herd prevention, state machine, connection health monitoring |
| Job queue | Custom Redis LPUSH/BRPOP | BullMQ | Exactly-once delivery, retries, priorities, rate limiting, dead letter queue, dashboard |
| Structured logging | `console.log` + `JSON.stringify` | pino | 30x faster than console, structured JSON, log levels, redaction, pino-pretty for dev |
| Dead code detection | Manual review | knip | Automated, finds unused files + exports + dependencies, CI-friendly |

**Key insight:** With 87 pages ahead, every utility that saves 5 minutes per page saves 7+ hours total. Invest in the tooling layer now.

## Common Pitfalls

### Pitfall 1: Socket.IO for Gateway Communication
**What goes wrong:** Developer installs Socket.IO client assuming the gateway uses it. Socket.IO adds its own framing protocol (packet types, namespace prefixes, Engine.IO handshake). The gateway expects raw JSON frames and closes the connection immediately.
**Why it happens:** The project's STACK.md recommends Socket.IO. This was based on general dashboard best practices, not verified against the actual OpenClaw Gateway protocol.
**How to avoid:** Use the native `WebSocket` API or the `ws` library. The gateway protocol is documented at `docs.openclaw.ai/gateway/protocol`. Frame format is `{type:"req"|"res"|"event", ...}`.
**Warning signs:** Connection opens but immediately closes. Gateway logs show "non-JSON or non-connect first frame."

### Pitfall 2: Missing Three-Phase Authentication Handshake
**What goes wrong:** Client sends data immediately after WebSocket opens. Gateway expects a specific handshake: (1) gateway sends `connect.challenge`, (2) client sends `connect` request with role + auth, (3) gateway responds with `hello-ok`. Skipping this causes a hard close.
**Why it happens:** Most WebSocket tutorials show immediate send-after-open. The gateway's challenge-response handshake is non-standard.
**How to avoid:** Implement the full handshake state machine in WebSocketManager. Test against a real gateway instance early.
**Warning signs:** "WebSocket connection to 'ws://...' failed" in browser console.

### Pitfall 3: Tailwind v4 CSS-First Config Confusion
**What goes wrong:** Developer creates a `tailwind.config.js` or `tailwind.config.ts` file (v3 pattern). Tailwind v4 uses CSS-first configuration via `@theme inline` in CSS files. Config JS files are ignored or cause conflicts.
**Why it happens:** Most tutorials and training data still reference v3 patterns.
**How to avoid:** All theme customization goes in `globals.css` using `@theme inline { ... }`. No JS config file. Use `@import "tailwindcss"` instead of `@tailwind base/components/utilities`.
**Warning signs:** Custom colors/fonts not applying despite being defined.

### Pitfall 4: Storybook Not Scanning Component Classes
**What goes wrong:** Components render in Storybook but with no styling. Tailwind v4's automatic content detection doesn't find classes in stories because Storybook builds independently.
**Why it happens:** Tailwind v4 auto-detects content sources, but Storybook's build pipeline is separate from Next.js.
**How to avoid:** Add `@source` directive in your CSS: `@source "../src"` and `@source "../.storybook"` to tell Tailwind where to scan.
**Warning signs:** Components appear unstyled in Storybook but work fine in Next.js.

### Pitfall 5: Bun Test vs Vitest Confusion
**What goes wrong:** Running `bun test` invokes bun's built-in test runner instead of Vitest. Tests may appear to pass (different assertion library) or fail cryptically.
**Why it happens:** Bun intercepts the `test` command. Vitest requires `bun run test` (which executes the package.json script) or `bunx vitest`.
**How to avoid:** Always use `bun run test` in scripts and CI. Document this in the project README.
**Warning signs:** Tests pass locally but fail in CI, or different test output format than expected.

### Pitfall 6: Next.js 16 Breaking Changes Not Addressed
**What goes wrong:** Code uses patterns removed in Next.js 16: sync `params`/`searchParams`, sync `cookies()`/`headers()`, `middleware.ts` without understanding it's deprecated, `next lint` command (removed).
**Why it happens:** Most examples online are for Next.js 14/15.
**How to avoid:** All dynamic APIs are async: `await params`, `await searchParams`, `await cookies()`. Use `proxy.ts` instead of `middleware.ts`. Use Biome instead of `next lint`.
**Warning signs:** Build errors about sync access to dynamic APIs.

### Pitfall 7: Docker Volume Mounts Breaking bun Install
**What goes wrong:** Docker volume mount `- .:/app` overwrites the container's `node_modules` with the host's (possibly empty or different platform). Modules built for Linux in the container get replaced with macOS modules from the host.
**Why it happens:** Bind mounts replace the entire container directory tree.
**How to avoid:** Use anonymous volume for `node_modules`: `- /app/node_modules` in docker-compose volumes. This preserves the container's installed modules.
**Warning signs:** Module not found errors, native binary crashes in container.

## Code Examples

### Drizzle ORM Connection Setup

```typescript
// Source: https://orm.drizzle.team/docs/get-started-postgresql
// src/shared/lib/db.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20, // Connection pool size
});

export const db = drizzle({ client: pool });
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Biome Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.4.2/schema.json",
  "files": {
    "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json", "**/*.css"]
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "noNonNullAssertion": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  }
}
```

### Vitest Configuration

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
// vitest.config.mts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

### BullMQ Worker Setup

```typescript
// Source: https://docs.bullmq.io/readme-1
// workers/audit-worker.ts

import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const auditQueue = new Queue('audit', { connection });

const auditWorker = new Worker(
  'audit',
  async (job) => {
    // Process audit log entry
    const { actor, action, resourceType, resourceId, before, after, metadata } = job.data;
    // Insert into database
    await db.insert(auditLogs).values({
      actor,
      actorType: metadata.actorType,
      action,
      resourceType,
      resourceId,
      before,
      after,
      metadata,
    });
  },
  {
    connection,
    concurrency: 5,
  }
);

auditWorker.on('completed', (job) => {
  console.log(`Audit log ${job.id} processed`);
});

auditWorker.on('failed', (job, err) => {
  console.error(`Audit log ${job?.id} failed:`, err);
});
```

### next-themes Setup with Tailwind v4 OKLCH

```typescript
// src/app/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"          // Tailwind v4 uses .dark class
      defaultTheme="system"      // System-aware by default
      enableSystem               // Follow OS preference
      disableTransitionOnChange  // Prevent flash during switch
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Tailwind v4 CSS with OKLCH Theme Tokens

```css
/* src/app/styles/globals.css */
@import "tailwindcss";

/* Light theme */
:root {
  --background: oklch(0.9846 0.0020 308.19);
  --foreground: oklch(0.1797 0.0043 308.19);
  --primary: oklch(0.5424 0.1337 49.98);
  --primary-foreground: oklch(0.9846 0.0020 308.19);
  --secondary: oklch(0.4940 0.0443 196.02);
  --secondary-foreground: oklch(0.9846 0.0020 308.19);
  /* ... remaining tokens from user-provided OKLCH theme */
  --radius: 0.75rem;
}

/* Dark theme */
.dark {
  --background: oklch(0.1797 0.0043 308.19);
  --foreground: oklch(0.9846 0.0020 308.19);
  --primary: oklch(0.7214 0.1337 49.98);
  --primary-foreground: oklch(0.1797 0.0043 308.19);
  --secondary: oklch(0.5940 0.0443 196.02);
  --secondary-foreground: oklch(0.1797 0.0043 308.19);
  /* ... remaining tokens */
}

/* Map CSS variables to Tailwind theme */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --radius-base: var(--radius);
  /* Font families */
  --font-sans: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-serif: 'Merriweather', serif;
}

/* Storybook content scanning */
@source "../src";
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS config) | CSS-first config via `@theme inline` in CSS | Tailwind v4 (2025) | No JS config file. All customization in CSS. `@import "tailwindcss"` replaces directives |
| `middleware.ts` | `proxy.ts` | Next.js 16 (Oct 2025) | `middleware.ts` deprecated. Rename to `proxy.ts`, export `proxy` function. Runs on Node.js runtime |
| `next lint` command | Biome or ESLint directly | Next.js 16 (Oct 2025) | `next lint` removed. `next build` no longer runs linting |
| Sync `params`/`searchParams` | Async: `await params` | Next.js 16 (Oct 2025) | All dynamic APIs require `await` |
| `forwardRef` in components | Standard component props | React 19 / shadcn v3 | `forwardRef` removed from shadcn components |
| HSL color values | OKLCH color values | shadcn/ui + Tailwind v4 | `data-slot` attributes added. Default style is `new-york` |
| Socket.IO assumed for all WS | Raw WebSocket for gateway | OpenClaw protocol research | Gateway uses custom JSON-RPC over raw WebSocket, not Socket.IO |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts` -- Tailwind v4 uses CSS-first configuration
- `@tailwind base; @tailwind components; @tailwind utilities;` -- replaced by `@import "tailwindcss"`
- `middleware.ts` -- deprecated in Next.js 16, use `proxy.ts`
- `next lint` -- removed in Next.js 16
- `experimental.ppr` -- removed, replaced by `cacheComponents`
- `serverRuntimeConfig` / `publicRuntimeConfig` -- removed, use `.env` files

## Claude's Discretion Recommendations

### Code Quality Extras (Recommended)

1. **TypeScript strict mode:** Enable in `tsconfig.json`. Set `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`. Catches null/undefined errors at compile time. Essential for 87 pages.

2. **knip:** Add to CI pipeline. Run `bunx knip` to find unused files, exports, and dependencies. Prevents dead code accumulation across a large codebase. Configure in `knip.json` with Next.js plugin.

3. **Biome import sorting:** Already included in Biome config via `organizeImports.enabled: true`. No extra tooling needed.

### Skeleton Shimmer Animation (Recommended)

Use CSS `@keyframes` with a gradient overlay. This is performant (GPU-composited) and works with any element shape:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    var(--muted-foreground) 37%,
    var(--muted) 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Empty State Illustration Style (Recommended)

Line art with the primary amber/orange accent color. Simple, geometric, "techy" feel that matches the Linear/Vercel mission control aesthetic. Not cute/playful -- professional and minimal. SVG-based for crisp rendering at any size.

### Storybook Configuration (Recommended)

Use `@storybook/nextjs` framework adapter. Import `globals.css` in `.storybook/preview.ts` for Tailwind styles. Add `@storybook/addon-themes` for dark/light mode toggle. Configure `@source` directive in CSS for class scanning.

### Docker Hot Reload (Recommended)

Use Docker Compose `develop.watch` with `action: sync` for source files and `action: rebuild` for package.json changes. Combined with Turbopack's fast refresh (2-5s cold start), this provides a responsive dev experience in containers. Mount source as volumes for file watching, but use anonymous volumes for `node_modules` and `.next` to avoid platform conflicts.

## Open Questions

1. **OpenClaw Gateway event catalog completeness**
   - What we know: The protocol uses `{type:"event", event, payload}` frames. Event types include `agent.status`, `chat.stream.token`, `exec.approval.requested`, `system-presence`.
   - What's unclear: The full catalog of event types and their payload shapes. The protocol documentation describes the frame format but doesn't enumerate all events.
   - Recommendation: During implementation, connect to a running gateway instance and capture all event types. Build the Zod schemas incrementally as events are discovered. The GatewayClient abstraction layer must handle unknown events gracefully (log and ignore, don't crash).

2. **Gateway REST API vs WebSocket-only**
   - What we know: The gateway has REST-like endpoints accessible via WebSocket RPC methods (e.g., `agent.list`, `config.get`, `sessions.list`). The web UI connects via WebSocket.
   - What's unclear: Whether there are also HTTP REST endpoints, or if everything goes through WebSocket RPC. The `health` endpoint appears to be HTTP.
   - Recommendation: Assume WebSocket RPC for most operations, HTTP for health checks. Validate during implementation with a real gateway.

3. **BullMQ worker process in Next.js**
   - What we know: BullMQ workers need to run as long-lived processes. Next.js API routes are request-scoped (serverless model).
   - What's unclear: Whether to run workers as a separate process in Docker or embed them in the Next.js server.
   - Recommendation: Run workers as a separate Docker service or as a separate bun process started alongside the Next.js server. Do NOT embed workers in API routes -- they need persistent Redis connections and continuous polling.

4. **Connection mode auto-detection**
   - What we know: Local mode = filesystem + WebSocket. Remote mode = WebSocket only.
   - What's unclear: How to reliably detect whether the gateway is co-located (same filesystem).
   - Recommendation: Use an environment variable (`AXION_MODE=local|remote`) with auto-detection fallback: check if `~/.openclaw/` directory exists and is accessible.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- All breaking changes, new features, version requirements verified
- [Next.js CSS documentation](https://nextjs.org/docs/app/getting-started/css) -- Tailwind v4 integration
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) -- Migration guide, OKLCH support, `data-slot` attributes
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) -- CLI init process
- [Drizzle ORM PostgreSQL docs](https://orm.drizzle.team/docs/get-started-postgresql) -- Connection setup, driver options, schema patterns
- [OpenClaw Gateway Protocol](https://docs.openclaw.ai/gateway/protocol) -- Frame format, handshake, authentication, event types
- [Socket.IO v4 TypeScript docs](https://socket.io/docs/v4/typescript/) -- Type interfaces (for potential internal use, not gateway)
- [Socket.IO v4 client options](https://socket.io/docs/v4/client-options/) -- Reconnection config
- [BullMQ quick start](https://docs.bullmq.io/readme-1) -- Queue/Worker setup
- [BullMQ connections](https://docs.bullmq.io/guide/connections) -- Redis connection requirements
- [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest) -- Official setup with App Router
- [Feature-Sliced Design with Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs) -- App Router integration pattern

### Secondary (MEDIUM confidence)
- [OpenClaw Gateway Architecture (DeepWiki)](https://deepwiki.com/openclaw/openclaw/15.1-architecture-deep-dive) -- Architecture details, port config, event flow
- [OpenClaw Gateway Commands (DeepWiki)](https://deepwiki.com/openclaw/openclaw/12.1-gateway-commands) -- CLI commands, configuration keys
- [Storybook Tailwind CSS recipe](https://storybook.js.org/recipes/tailwindcss) -- PostCSS handling, `@source` directive
- [Docker multi-stage builds with bun](https://medium.com/@vimothy/deploying-nextjs-using-bun-82dc30879f6c) -- Dockerfile pattern, image sizes
- [Zustand + TanStack Query patterns](https://medium.com/@zerebkov.artjom/how-to-structure-next-js-project-with-zustand-and-react-query-c4949544b0fe) -- Store/query separation
- [Knip documentation](https://knip.dev/) -- Dead code detection setup
- [Biome with Next.js](https://www.timsanteford.com/posts/how-to-use-biome-with-next-js-for-linting-and-formatting/) -- Configuration patterns
- [next-themes with Tailwind v4](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) -- OKLCH theme switching

### Tertiary (LOW confidence)
- Virtual scrolling with shadcn DataTable -- community discussions, no official shadcn recipe. TanStack Virtual is the standard approach, verified compatible.
- BullMQ in Next.js architecture -- limited official guidance on worker process management. Recommendation based on architectural reasoning, not verified docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified via npm/official docs. Next.js 16 features confirmed via blog post.
- Architecture: HIGH -- FSD with Next.js App Router documented officially. Gateway protocol verified via official docs.
- Gateway protocol: HIGH -- OpenClaw protocol docs confirm raw WebSocket (not Socket.IO). This contradicts STACK.md and is a critical correction.
- Pitfalls: HIGH -- Based on verified breaking changes (Next.js 16) and protocol research (gateway handshake).
- Docker patterns: MEDIUM -- Based on community guides, not official bun Docker documentation.
- BullMQ worker architecture: MEDIUM -- Worker process management in Next.js needs validation during implementation.

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- stack is stable, Next.js 16 is released)
