# Stack Research

**Domain:** Self-hosted AI agent orchestration dashboard (real-time WebSocket, ~87 pages/views)
**Researched:** 2026-02-17
**Confidence:** HIGH (all versions verified via npm registry; architecture rationale from established patterns)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | ^16.1.6 | Full-stack React framework | App Router provides file-based routing ideal for 87 pages; Server Components for data-heavy admin panels; middleware for auth gates; API routes proxy to OpenClaw Gateway; Docker-friendly with `output: 'standalone'`. Despite being a self-hosted app (no SEO need), Next.js wins on code organization, ecosystem alignment (shadcn, better-auth all optimize for it), and the ability to mix server/client rendering per-route. |
| React | ^19.2.4 | UI library | Required by Next.js 16. React 19 brings `use()`, `useOptimistic`, `useActionState` -- all useful for real-time dashboard form handling and optimistic updates. Server Components reduce client bundle for data-heavy pages. |
| TypeScript | ^5.9.3 | Type safety | Non-negotiable for 87+ pages. Drizzle ORM provides end-to-end type safety from DB to UI. TypeScript 5.9 has excellent inference and satisfies performance. |
| Tailwind CSS | ^4.1.18 | Styling | Tailwind v4 uses CSS-first configuration (no more `tailwind.config.js`), lightning-fast builds with Oxide engine. Pairs perfectly with shadcn/ui. v4 is a major rewrite -- simpler, faster. |
| shadcn/ui | ^3.8.5 (CLI) | Component library | Not a dependency -- copies components into your codebase. Full ownership, full customization. Provides 50+ accessible components built on Radix UI primitives. The dashboard component, data table, charts, command palette, kanban -- all directly relevant to AXion Hub's needs. Already in package.json. |

### Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PostgreSQL | 17 (Docker) | Primary database | Best fit for relational data (users, agents, sessions, workflows, approvals). JSONB for flexible agent config/metadata. Row-level security for multi-tenant governance. Full-text search for session/memory browsing. Self-hosted via Docker -- zero cost, zero vendor lock-in. |
| Drizzle ORM | ^0.45.1 | Database ORM | Type-safe SQL queries, zero runtime overhead (compiles to raw SQL), excellent migration system via drizzle-kit (^0.31.9). Better than Prisma for self-hosted: no binary engine to bundle, smaller Docker images, faster cold starts. Schema-as-code in TypeScript. |
| Redis | 7 (Docker) | Cache + pub/sub + queues | WebSocket scaling (pub/sub for multi-instance), session cache, real-time agent status, rate limiting. Used via ioredis (^5.9.3). Essential for BullMQ job queues (workflow automation). |

### Real-Time Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Socket.IO | ^4.8.3 (server + client) | WebSocket communication | Built-in reconnection, room/namespace support (one room per agent session), binary streaming, fallback to long-polling. Handles concurrent agent sessions naturally via rooms. More feature-rich than raw `ws` for a dashboard with many real-time views. |
| BullMQ | ^5.69.3 | Job queue / workflow engine | Redis-backed job queue for workflow automation, scheduled tasks, approval pipelines, agent task orchestration. Supports job priorities, retries, rate limiting, delayed jobs. Dashboard UI available via `@bull-board/api`. |

### Authentication & Authorization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| better-auth | ^1.4.18 | Authentication framework | Purpose-built for self-hosted apps. Supports email/password, OAuth, 2FA, session management, organization/team support -- all critical for admin/governance. Framework-agnostic but has first-class Next.js integration. More flexible than NextAuth for self-hosted scenarios (no forced cloud providers). |

### State Management & Data Fetching

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Query | ^5.90.21 | Server state management | Handles API data caching, background refetching, optimistic updates, infinite scrolling (session lists, activity logs). Pairs with Socket.IO for real-time cache invalidation. Mature, battle-tested for dashboards with many data sources. |
| Zustand | ^5.0.11 | Client state management | Lightweight (1KB) global store for UI state: sidebar open/close, active agent selection, theme, WebSocket connection status. Zustand 5 works with React 19. No boilerplate, no context providers, no re-render storms. |
| nuqs | ^2.8.8 | URL search params state | Type-safe URL state for filters, pagination, tab selection across 87 pages. Users can bookmark/share filtered views. Shallow routing keeps it fast. |

### UI Components & Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-table | ^8.21.3 | Data tables | Agent lists, session tables, activity logs, model/provider config tables. Headless -- style with shadcn/ui's DataTable recipe. Supports sorting, filtering, pagination, column visibility. |
| @xyflow/react | ^12.10.0 | Workflow builder | Visual workflow automation editor. Drag-and-drop node graph for agent pipelines. Successor to react-flow (renamed). Supports custom nodes, edge types, minimap, controls. |
| @dnd-kit/core + @dnd-kit/sortable | ^6.3.1 / ^10.0.0 | Drag and drop | Kanban board card dragging, list reordering, file management drag-drop. More flexible and performant than alternatives. Accessible by default. |
| react-resizable-panels | ^4.6.4 | Resizable layouts | Chat interface panels, split views for agent monitoring (log + output), IDE-like workspace layouts. |
| @monaco-editor/react | ^4.7.0 | Code editor | Workflow script editing, agent prompt templates, JSON config editing. Full VS Code editing experience. |
| recharts | ^3.7.0 | Charts/visualization | Dashboard analytics, agent performance metrics, token usage graphs. Built on D3, React-friendly API. shadcn/ui chart components wrap recharts. |
| react-markdown | ^10.1.0 | Markdown rendering | Chat message rendering, agent response display, documentation views. |
| shiki | ^3.22.0 | Syntax highlighting | Code block highlighting in chat responses, config viewers. Tree-sitter based, accurate highlighting for 100+ languages. |
| lucide-react | ^0.574.0 | Icons | Consistent icon set across all 87 pages. 1500+ icons, tree-shakeable, used by shadcn/ui. |
| sonner | ^2.0.7 | Toast notifications | Agent status changes, approval requests, error notifications. Beautiful, accessible, stack-able. |
| cmdk | ^1.1.1 | Command palette | Global command palette (Cmd+K) for navigating 87 pages, searching agents, quick actions. Used by shadcn/ui's Command component. |
| framer-motion | ^12.34.1 | Animations | Page transitions, kanban card animations, collapsible panels, notification entrances. |
| vaul | ^1.1.2 | Drawer component | Mobile-responsive drawers for agent details, settings panels. |
| next-themes | ^0.4.6 | Theme switching | Dark/light mode toggle. Works with Next.js App Router and shadcn/ui's theming system. |
| date-fns | ^4.1.0 | Date formatting | Relative timestamps ("2 min ago"), session durations, activity log dates. Tree-shakeable, no Moment.js bloat. |

### Form Handling & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.71.1 | Form management | Every form: agent config (10 sub-tabs), settings, workflow parameters, model config. Uncontrolled inputs for performance with large forms. |
| zod | ^4.3.6 | Schema validation | Shared validation between client forms and API routes. Agent config schemas, workflow definitions, user input validation. Type inference with TypeScript. |
| @t3-oss/env-nextjs | ^0.13.10 | Environment validation | Validates all env vars at build time. Catches missing DATABASE_URL, REDIS_URL before runtime. Essential for self-hosted Docker deployment. |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Vitest | ^4.0.18 | Unit/integration testing | Fast, Vite-powered, Jest-compatible API. Tests Zustand stores, utility functions, API route handlers. |
| Playwright | ^1.58.2 | E2E testing | Cross-browser testing for complex UI flows (kanban drag-drop, chat streaming, workflow builder). Next.js 16 lists it as optional peer dep -- first-class support. |
| Biome | ^2.4.2 | Linting + formatting | Replaces ESLint + Prettier with a single Rust-based tool. 10-100x faster. Handles formatting, linting, import sorting in one pass. Less config surface than ESLint. |
| Docker Compose | - | Local development + deployment | PostgreSQL, Redis, Next.js app all in one `docker-compose.yml`. Matches production. |
| pino | ^10.3.1 | Structured logging | JSON logging for production. Fast, low-overhead. Pairs with pino-pretty for dev readability. |

### ID Generation & Utilities

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | ^5.1.6 | Short unique IDs | URL-friendly IDs for agents, sessions, workflows. Shorter than UUIDs, cryptographically secure. |
| superjson | ^2.2.6 | Data serialization | Serialize Dates, Maps, Sets across server/client boundary. Useful with Server Actions and tRPC. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Framework | Next.js 16 | Vite + React Router 7 (SPA) | SPA loses: file-based routing for 87 pages, server components for data-heavy admin views, middleware auth gates, API route co-location. Vite SPA needs separate backend -- more infra complexity for self-hosted Docker. |
| Framework | Next.js 16 | Remix / React Router 7 (framework) | Smaller ecosystem. shadcn/ui, better-auth, and most dashboard tooling optimizes for Next.js first. Less community support for large dashboard apps. |
| ORM | Drizzle | Prisma (^7.4.0) | Prisma bundles a Rust query engine binary -- larger Docker images, slower cold starts. Drizzle compiles to raw SQL with zero runtime. For self-hosted Docker deployment, Drizzle's lightweight footprint wins. Prisma's Studio UI is nice but not needed when building our own admin UI. |
| ORM | Drizzle | Kysely (^0.28.11) | Kysely is excellent query builder but lacks built-in migration tooling and schema declaration. Drizzle gives schema-as-code + migrations + query builder in one package. |
| Auth | better-auth | NextAuth/Auth.js (^4.24.13) | NextAuth is moving to Auth.js with a rocky migration. better-auth is purpose-built for self-hosted, has org/team support built-in, and doesn't assume cloud deployment. More predictable for self-hosted Docker scenarios. |
| State | Zustand 5 | Jotai | Zustand's single-store model is simpler for global UI state. Jotai's atomic model adds complexity without benefit for dashboard-scale client state. Both are fine; Zustand has broader adoption for dashboards. |
| State | Zustand 5 | Redux Toolkit | Over-engineered for UI-only state. We use TanStack Query for server state -- Redux's main value (normalized cache) is redundant. |
| WebSocket | Socket.IO | raw `ws` (^8.19.0) | `ws` is lower-level -- no reconnection, no rooms, no namespaces, no fallback. We'd reimplement what Socket.IO provides. For a dashboard with many concurrent real-time views, Socket.IO's abstractions save weeks. |
| WebSocket | Socket.IO | tRPC subscriptions | tRPC (^11.10.0) subscriptions are good for typed real-time, but Socket.IO's room model maps better to agent sessions. Could layer tRPC on HTTP endpoints and Socket.IO for real-time. |
| DnD | @dnd-kit | @hello-pangea/dnd (^18.0.1) | hello-pangea/dnd (react-beautiful-dnd fork) only handles list-based DnD. @dnd-kit supports arbitrary drag surfaces, trees, grids -- needed for workflow builder and file management, not just kanban. |
| Charts | recharts | Apache ECharts / Chart.js | recharts is React-native (components, not imperative API). shadcn/ui chart components wrap recharts directly. Simpler integration, less bundle size for dashboard chart needs. |
| Workflow | @xyflow/react | JointJS / GoJS | @xyflow/react is open-source, React-native, actively maintained (was react-flow). JointJS/GoJS are commercial with complex licensing. xyflow handles everything we need for visual workflow building. |
| Linting | Biome | ESLint 10 + Prettier | Biome is a single tool replacing both, 10-100x faster. ESLint 10 flat config is fine but two tools (ESLint + Prettier) means more config, more deps, slower CI. |
| Code Editor | Monaco | CodeMirror 6 (^4.25.4) | Monaco provides the full VS Code experience out of the box. CodeMirror 6 is lighter but requires more setup for features like IntelliSense, multi-cursor, etc. For a dashboard editing prompts/configs, Monaco's batteries-included approach wins. |
| Markdown | react-markdown | marked (^17.0.2) | react-markdown renders to React components (no dangerouslySetInnerHTML). Safer for user-generated content in chat. Extensible with remark/rehype plugins. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Prisma for self-hosted Docker | Bundles ~15MB Rust query engine binary. Slower cold starts, larger images. Prisma Accelerate/Pulse assume cloud. | Drizzle ORM -- zero runtime binary, compiles to SQL strings. |
| Redux / MobX | Over-engineered for dashboard UI state when TanStack Query handles server state. Adds boilerplate without benefit. | Zustand for UI state, TanStack Query for server state. |
| CSS-in-JS (styled-components, Emotion) | Runtime CSS generation conflicts with React Server Components. Performance overhead in large dashboards. Tailwind v4 is faster in every metric. | Tailwind CSS v4 + shadcn/ui. |
| moment.js | 300KB+ bundle, mutable API, deprecated by maintainers. | date-fns (^4.1.0) -- tree-shakeable, immutable, 10KB for typical usage. |
| Material UI / Ant Design / Chakra UI | Opinionated styling fights with custom design. Large bundle sizes. Hard to customize deeply. Vendor lock-in on design system. | shadcn/ui -- own the code, full control, Tailwind-native. |
| react-beautiful-dnd | Officially deprecated. Maintained fork (hello-pangea/dnd) exists but only does list DnD. | @dnd-kit -- actively maintained, supports all DnD patterns. |
| express.js for API | Next.js API routes + Server Actions handle HTTP endpoints. Adding Express creates a second server process in Docker. | Next.js API routes for REST endpoints, Server Actions for mutations. |
| MongoDB | Schema-less is wrong fit for structured data (users, roles, sessions, approvals, workflows). Relational queries (joins) needed everywhere. | PostgreSQL -- relational data with JSONB for flexible fields. |
| GraphQL | Over-engineering for a single frontend consuming its own backend. REST/Server Actions are simpler. GraphQL adds schema management overhead for no multi-client benefit. | Next.js Server Actions + tRPC or plain REST API routes. |
| Webpack | Next.js 16 uses Turbopack by default in dev. No need to configure webpack separately. | Turbopack (built into Next.js 16). |

## Stack Patterns by Variant

**If adding tRPC for type-safe API layer:**
- Use tRPC (^11.10.0) with Next.js App Router adapter
- Provides end-to-end type safety from API to client without code generation
- Recommended if team prefers explicit API contracts over Server Actions
- Can coexist: Server Actions for simple mutations, tRPC for complex query endpoints

**If scaling to multiple server instances (high availability):**
- Use Socket.IO with Redis adapter (`@socket.io/redis-adapter`)
- Redis pub/sub distributes WebSocket events across instances
- BullMQ workers can run on separate containers
- PostgreSQL connection pooling via PgBouncer in Docker

**If adding real-time collaboration (multi-user editing):**
- Add Yjs (^13.x) + y-websocket for CRDT-based collaboration
- Enables multiple admins editing same workflow/config simultaneously
- Layer on top of existing Socket.IO transport

**If deploying without Docker (bare metal / systemd):**
- Use `next start` with PM2 for process management
- PostgreSQL and Redis as system services
- Still works, but Docker Compose is strongly recommended for reproducibility

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@^16.1.6 | react@^19.0.0, react-dom@^19.0.0 | Next.js 16 requires React 19. Confirmed via npm peer deps. |
| next@^16.1.6 | typescript@^5.x | TypeScript 5.9 works. Next.js handles tsconfig generation. |
| tailwindcss@^4.1.18 | next@^16.x | Tailwind v4 uses `@import "tailwindcss"` in CSS -- no JS config file. PostCSS plugin or Vite plugin. Next.js supports both. |
| shadcn@^3.8.5 | tailwindcss@^4.x, next@^16.x | shadcn CLI v3 supports Tailwind v4 and Next.js 16. Generates compatible components. |
| drizzle-orm@^0.45.1 | drizzle-kit@^0.31.9, pg@^8.18.0 | Use `drizzle-orm/pg-core` with `pg` driver. drizzle-kit for migrations. |
| socket.io@^4.8.3 | socket.io-client@^4.8.3 | Server and client versions must match major version (4.x). |
| better-auth@^1.4.18 | next@^16.x, drizzle-orm@^0.45.x | Has official Drizzle adapter and Next.js integration. |
| zustand@^5.0.11 | react@^19.x | Zustand 5 supports React 19 concurrent features. |
| @tanstack/react-query@^5.90.21 | react@^19.x | v5 fully supports React 19 and Suspense. |
| @xyflow/react@^12.10.0 | react@^19.x | Renamed from reactflow. v12 supports React 19. |
| @dnd-kit/core@^6.3.1 | react@^19.x | Works with React 19. |
| framer-motion@^12.34.1 | react@^19.x | v12 has full React 19 support. |
| vitest@^4.0.18 | typescript@^5.x | Vitest 4 handles TypeScript natively. |
| @biomejs/biome@^2.4.2 | - | Standalone binary, no framework coupling. |

## Installation

```bash
# Core framework
npm install next@^16.1.6 react@^19.2.4 react-dom@^19.2.4

# Database
npm install drizzle-orm@^0.45.1 pg@^8.18.0 ioredis@^5.9.3

# Real-time
npm install socket.io@^4.8.3 socket.io-client@^4.8.3

# Authentication
npm install better-auth@^1.4.18

# State management & data fetching
npm install zustand@^5.0.11 @tanstack/react-query@^5.90.21 nuqs@^2.8.8

# Forms & validation
npm install react-hook-form@^7.71.1 zod@^4.3.6 @t3-oss/env-nextjs@^0.13.10

# UI components (shadcn/ui copies into project, these are its dependencies)
npm install tailwindcss@^4.1.18 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.4.1
npm install lucide-react@^0.574.0 next-themes@^0.4.6 sonner@^2.0.7 cmdk@^1.1.1 vaul@^1.1.2

# Data display & interaction
npm install @tanstack/react-table@^8.21.3 recharts@^3.7.0 react-resizable-panels@^4.6.4
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0
npm install @xyflow/react@^12.10.0

# Content rendering
npm install react-markdown@^10.1.0 shiki@^3.22.0 @monaco-editor/react@^4.7.0

# Animation
npm install framer-motion@^12.34.1

# Utilities
npm install date-fns@^4.1.0 nanoid@^5.1.6 superjson@^2.2.6 pino@^10.3.1

# Job queue
npm install bullmq@^5.69.3

# Dev dependencies
npm install -D typescript@^5.9.3 @types/react@^19 @types/react-dom@^19 @types/pg@^8
npm install -D drizzle-kit@^0.31.9
npm install -D @biomejs/biome@^2.4.2
npm install -D vitest@^4.0.18 @playwright/test@^1.58.2
npm install -D pino-pretty
```

## Docker Compose Baseline

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://axion:axion@db:5432/axion
      REDIS_URL: redis://redis:6379
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_started }

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: axion
      POSTGRES_USER: axion
      POSTGRES_PASSWORD: axion
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U axion"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes: ["redisdata:/data"]

volumes:
  pgdata:
  redisdata:
```

```dockerfile
# Dockerfile (Next.js standalone)
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Sources

- **npm registry** (all versions verified 2026-02-17) -- HIGH confidence
  - `npm view [package] version` for every listed package
  - `npm view next@16.1.6 peerDependencies` confirmed React ^19.0.0 requirement
- **Next.js 16.x** -- Exists on npm with 16.0.0 through 16.1.6 releases. Confirmed via registry.
- **shadcn@3.8.5** -- Already in project's package.json as devDependency. Confirmed current.
- **Tailwind CSS v4** -- Major rewrite from v3. Version 4.1.18 confirmed on npm.
- **Drizzle ORM vs Prisma** -- Drizzle's zero-binary approach verified via npm (no native deps in drizzle-orm). Prisma's engine binary verified via npm (prisma@7.4.0 still bundles engines).
- **better-auth** -- Description from npm: "The most comprehensive authentication framework for TypeScript." Version 1.4.18 confirmed.
- **Socket.IO 4.x** -- Server and client both at 4.8.3 confirmed.
- **BullMQ 5.x** -- Version 5.69.3 confirmed on npm.
- **@xyflow/react** -- Successor to reactflow (v11 -> xyflow v12). Version 12.10.0 confirmed.

### Confidence Notes

| Area | Confidence | Notes |
|------|------------|-------|
| Package versions | HIGH | All verified via npm registry on 2026-02-17 |
| Framework choice (Next.js 16) | HIGH | Verified exists, peer deps confirmed, ecosystem alignment with shadcn evident from project's existing package.json |
| Drizzle over Prisma | MEDIUM | Rationale based on known architectural differences (binary vs no-binary). Drizzle's migration system maturity should be validated during implementation. |
| better-auth over NextAuth | MEDIUM | better-auth's self-hosted claims verified via npm description. Org/team support should be validated against actual docs during auth phase. |
| Tailwind v4 compatibility | MEDIUM | v4 is a major rewrite. shadcn CLI v3 claims support -- verify component generation works correctly early in development. |
| Socket.IO architecture | HIGH | Room model for agent sessions is well-established pattern. Redis adapter for multi-instance is documented in Socket.IO docs. |
| BullMQ for workflows | MEDIUM | BullMQ handles job queues well. Whether it's sufficient for complex workflow DAGs (vs a dedicated workflow engine like Temporal) needs validation during workflow phase. |

---
*Stack research for: AXion Hub -- Self-hosted AI Agent Orchestration Dashboard*
*Researched: 2026-02-17*
