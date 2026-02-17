# Phase 3: Agent Management - Research

**Researched:** 2026-02-17
**Domain:** Agent management UI -- roster grid, multi-step creation wizard, markdown identity editor, detail sub-pages (overview, sessions, memory, skills, tools, sandbox, channels, logs, metrics), Zustand agent store, real-time status via WebSocket
**Confidence:** HIGH (architecture patterns verified via Next.js docs, shadcn/ui registry, and existing Phase 1/2 research; markdown editor recommendation verified via npm/GitHub)

## Summary

Phase 3 is the largest feature phase so far, delivering 13 requirements (AGNT-01 through AGNT-13) across a full agent management interface. The core challenge is organizing ~12 distinct views (roster + 1 creation wizard + 1 template gallery + 9 agent detail sub-pages) under a coherent routing and layout architecture while keeping components focused and maintainable.

The architecture uses Next.js App Router nested layouts: the agent detail page at `/agents/[agentId]` gets its own layout.tsx with a persistent left sidebar for sub-page navigation. This sidebar persists across sub-page transitions (sessions, memory, skills, etc.) without re-rendering, thanks to Next.js partial rendering. Each sub-page is a separate route segment (`/agents/[agentId]/sessions`, `/agents/[agentId]/memory`, etc.) rendered inside this layout.

For the markdown identity editor, the recommendation is **@uiw/react-md-editor** -- a lightweight (~4.6 kB gzipped), actively maintained split-pane markdown editor with built-in dark mode support, CodeMirror under the hood, and toolbar customization. It fits the "dark, sleek, techy" aesthetic better than WYSIWYG alternatives like MDXEditor (851 kB gzipped, overkill for simple .md files). The split-pane approach (editor left, live preview right) gives users confidence in their markdown formatting while keeping the code-centric feel appropriate for identity files.

For the agent creation wizard, the pattern uses **react-hook-form + Zustand + Zod per-step validation** -- each wizard step is a separate form component with its own Zod schema, and stepping forward pushes validated data into a Zustand store. This keeps step validation independent, allows skipping steps (smart defaults), and enables the review step to read all accumulated data from the store. No wizard library is needed; the pattern is straightforward with shadcn/ui Tabs or a custom stepper component.

**Primary recommendation:** Build the agent entity model and Zustand store first (shared by all sub-pages), then the roster page (first user-visible feature), then the detail layout with overview, then creation wizard + templates, then identity editor, then remaining sub-pages in order of complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Card grid layout (no list/table toggle needed)
- Cards styled like employee badges -- avatar, name, status, model, and one key stat. Not cluttered, not minimal. Clean mid-density
- Agent status communicated through subtle card border/glow that changes color by state (online = green, idle = yellow, working = blue, error = red)
- No text status label on cards -- the ambient glow is the indicator
- Search bar with text search by name, plus a status dropdown filter (online, idle, working, error, all)
- Deep multi-step wizard for creation -- covers basics, model config, identity files, skills & tools, sandbox config, channel routing, and a final review step
- Each wizard step has smart defaults pre-filled -- user can accept defaults and skip forward, or customize
- Name + model are the minimum required; everything else can be skipped and configured later
- Template system: visual gallery of pre-built templates (e.g., "Code Assistant", "Research Agent", "Customer Support") plus ability to clone any existing agent
- When using a template or cloning, wizard steps are pre-populated with that source's config
- Sidebar file list on the left showing all identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md)
- Click a file in the sidebar to load it into the editor
- Identity files always have template starter content -- if created from a template, files are pre-filled with that template's content; if created from scratch, files get section headers, placeholder text, and guidance comments
- Auto-save with debounce (saves automatically after user stops typing)
- Left sidebar navigation within agent detail page listing all sub-sections (overview, sessions, memory, skills, tools, sandbox, channels, logs, metrics)
- Overview page is dashboard-style: widget/card layout with status card, stats card, recent activity card, and quick actions card
- All sub-pages accessible from the persistent sidebar

### Claude's Discretion
- Markdown editor implementation style (split-pane, Monaco, WYSIWYG -- pick what looks best and fits the product feel)
- Memory viewer approach (searchable list vs categorized browser)
- Sub-page edit patterns (inline editing vs edit modals -- pick per sub-page based on what makes sense)
- Agent overview widget sizing and arrangement
- Loading skeleton design for all agent pages
- Error state handling across the management interface

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AGNT-01 | User can view all agents in grid/list view with status badges at `/agents` | Card grid with CSS glow borders for status. Zustand agent store with real-time WebSocket status updates via Event Bus. nuqs for search/filter URL state. Grid uses CSS Grid with responsive breakpoints. |
| AGNT-02 | User can view agent overview at `/agents/[agentId]` showing status, model, context usage, uptime, current task | Nested layout with persistent sidebar navigation. Overview page uses shadcn Card widgets. Context usage rendered as progress bar. Data from gateway via GatewayClient + TanStack Query for initial load, Zustand for real-time updates. |
| AGNT-03 | User can create/provision a new agent at `/agents/new` | Multi-step wizard using react-hook-form + Zustand + Zod per-step schemas. Seven steps: basics, model config, identity files, skills & tools, sandbox config, channel routing, review. Smart defaults pre-filled. Name + model minimum required. |
| AGNT-04 | User can browse and use agent templates at `/agents/templates` | Template gallery page with card grid. Template data as static config objects with pre-filled wizard values. Clone existing agent by loading its config into wizard store. |
| AGNT-05 | User can edit agent identity files with Markdown editor at `/agents/[agentId]/identity` | @uiw/react-md-editor for split-pane markdown editing. Sidebar file list for SOUL.md, IDENTITY.md, USER.md, AGENTS.md. Auto-save via use-debounce's useDebouncedCallback (500ms). Template starter content for new agents. |
| AGNT-06 | User can view agent sessions with token counts and compaction history at `/agents/[agentId]/sessions` | DataTable (from Phase 1 shared UI) with session list. Token count columns. Expandable rows for compaction history. TanStack Query for session data fetching. |
| AGNT-07 | User can view/edit agent MEMORY.md and daily memory files, search memory index at `/agents/[agentId]/memory` | Categorized browser with file tree (MEMORY.md + daily files). Markdown viewer/editor for individual files. Search input with debounce for memory index search. |
| AGNT-08 | User can manage agent skills at `/agents/[agentId]/skills` | Card grid of installed skills with enable/disable toggle. "Install from ClawHub" button links to skills registry. Inline editing via toggle switches. |
| AGNT-09 | User can configure agent tool allow/deny lists at `/agents/[agentId]/tools` | Two-column layout: allowed tools (left), denied tools (right). Drag or button to move between lists. Elevated tool config as expandable section per tool. |
| AGNT-10 | User can configure agent sandbox at `/agents/[agentId]/sandbox` | Form-based configuration: sandbox mode toggle, Docker image selector, workspace path input. react-hook-form with inline editing. |
| AGNT-11 | User can view channel routing at `/agents/[agentId]/channels` | Read-only table of channel bindings with channel name, type, and routing rule. Links to channel config pages (Phase 7). |
| AGNT-12 | User can view agent activity log at `/agents/[agentId]/logs` | DataTable with virtual scrolling for log entries. Columns: timestamp, event type, details, status. Filter by event type. Real-time log streaming via WebSocket Event Bus subscription. |
| AGNT-13 | User can view agent metrics at `/agents/[agentId]/metrics` | shadcn/ui Chart component (Recharts) for token usage, cost, tasks completed, response times. Time range selector. Multiple chart types: area chart for usage over time, bar chart for tasks, line chart for response times. |
</phase_requirements>

## Standard Stack

### Core (New for Phase 3)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @uiw/react-md-editor | ^4.0.11 | Split-pane Markdown editor | 4.6 kB gzipped, built on CodeMirror, dark mode support via data-color-mode, toolbar customization, TypeScript types. Active maintenance (last release Dec 2024). Best size/feature ratio for editing .md files. |
| use-debounce | ^10.1.0 | Debounced callbacks | Auto-save debounce for identity editor. Provides useDebouncedCallback with cancel/flush/isPending. 1,395 dependents. Lightweight, TypeScript-native. |
| recharts | ^2.x | Chart rendering | Used by shadcn/ui Chart component internally. Area, Bar, Line, Pie, Radar charts. D3-based SVG rendering. Declarative JSX API. |
| react-hook-form | ^7.71.1 | Form management | Already in Phase 2 stack. Used for creation wizard steps and sandbox/tools config forms. Per-step Zod validation via zodResolver. |

### From Phase 1/2 (Already Installed)

| Library | Version | Purpose | How Used in Phase 3 |
|---------|---------|---------|---------------------|
| zustand | ^5.0.11 | Agent store | Real-time agent state (status, list, detail). WebSocket Event Bus subscriptions. Wizard form state persistence across steps. |
| @tanstack/react-query | ^5.90.21 | Data fetching | Initial agent list/detail fetch from gateway. Session, memory, skills data. Cache + background refetch. |
| @tanstack/react-table | ^8.21.3 | DataTable logic | Sessions table, logs table, tools list. Sorting, filtering, pagination. |
| @tanstack/react-virtual | ^3.x | Virtual scrolling | Logs page with potentially thousands of entries. |
| nuqs | ^2.8.8 | URL search params | Agent roster search/filter state in URL. Shareable filtered views. |
| zod | ^4.3.6 | Schema validation | Per-step wizard validation schemas. Agent entity validation. |
| lucide-react | ^0.574.0 | Icons | Agent status icons, sidebar nav icons, wizard step icons. |
| sonner | ^2.0.7 | Toast notifications | Success/error feedback for create, save, delete operations. |
| date-fns | ^4.1.0 | Date formatting | Session timestamps, log entries, uptime display, "last active" relative times. |

### shadcn/ui Components Required

| Component | Purpose | Notes |
|-----------|---------|-------|
| card | Agent cards, overview widgets, template cards | CardHeader, CardContent, CardAction for quick actions |
| avatar | Agent avatar on cards and detail pages | Fallback to initials when no image |
| badge | Status indicators, skill tags, template labels | Custom variants for agent status colors |
| tabs | Wizard step navigation (alternative to custom stepper) | TabsList, TabsTrigger, TabsContent for wizard steps |
| dialog | Confirmation dialogs (delete agent, discard changes) | AlertDialog for destructive actions |
| scroll-area | Sub-page sidebar, file list, log viewer | Custom scrollbar styling matching dark theme |
| select | Status filter dropdown, model selector | SelectTrigger, SelectContent, SelectItem |
| input | Search bar, form fields | With SearchInput wrapper from Phase 1 |
| textarea | Fallback text input for config fields | Used in sandbox config, tool config |
| switch | Enable/disable toggles (skills, sandbox mode) | Inline editing pattern |
| progress | Context usage bar, token usage bar | Percentage-based progress indicator |
| separator | Between sidebar sections, card sections | Visual dividers |
| skeleton | Loading states for all agent pages | Skeleton matching page layout shapes |
| chart | Metrics dashboard charts | ChartContainer, ChartTooltip, ChartTooltipContent wrapping Recharts |
| tooltip | Icon explanations, truncated text | Sidebar nav labels when collapsed |
| dropdown-menu | Agent card actions (edit, clone, delete) | Three-dot menu on cards |
| command | Template search/filter | Command palette for template gallery |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @uiw/react-md-editor | MDXEditor | MDXEditor is 851 kB gzipped vs 4.6 kB. Full WYSIWYG with React component embedding. Overkill for editing plain .md identity files. Performance concerns with multiple editors. |
| @uiw/react-md-editor | @uiw/react-codemirror + @codemirror/lang-markdown | More control over CodeMirror configuration but requires building the split-pane preview yourself. react-md-editor includes preview out of the box. |
| @uiw/react-md-editor | Monaco Editor (@monaco-editor/react) | Monaco is 2+ MB. Designed for code editing, not markdown. Excellent for code but heavy for .md files. |
| Custom wizard | react-albus or formkit/wizard | Libraries add abstraction. The react-hook-form + Zustand pattern is simple, type-safe, and well-documented. No dependency worth the coupling for 7 steps. |
| Recharts directly | tremor or nivo | shadcn/ui's Chart component wraps Recharts -- using it directly ensures visual consistency with the design system. No reason to add another charting library. |

**Installation:**
```bash
# Markdown editor
bun add @uiw/react-md-editor

# Debounce (auto-save)
bun add use-debounce

# shadcn/ui components (via CLI)
bunx shadcn@latest add card avatar badge tabs dialog scroll-area select switch progress skeleton chart tooltip dropdown-menu command separator
```

## Architecture Patterns

### Recommended Project Structure (Phase 3 Additions)

```
app/
├── (dashboard)/
│   ├── agents/
│   │   ├── page.tsx                        # Agent roster (AGNT-01)
│   │   ├── new/
│   │   │   └── page.tsx                    # Creation wizard (AGNT-03)
│   │   ├── templates/
│   │   │   └── page.tsx                    # Template gallery (AGNT-04)
│   │   └── [agentId]/
│   │       ├── layout.tsx                  # Agent detail layout (persistent sidebar)
│   │       ├── page.tsx                    # Overview (AGNT-02) - default sub-page
│   │       ├── identity/
│   │       │   └── page.tsx                # Identity editor (AGNT-05)
│   │       ├── sessions/
│   │       │   └── page.tsx                # Sessions list (AGNT-06)
│   │       ├── memory/
│   │       │   └── page.tsx                # Memory viewer (AGNT-07)
│   │       ├── skills/
│   │       │   └── page.tsx                # Skills management (AGNT-08)
│   │       ├── tools/
│   │       │   └── page.tsx                # Tool config (AGNT-09)
│   │       ├── sandbox/
│   │       │   └── page.tsx                # Sandbox config (AGNT-10)
│   │       ├── channels/
│   │       │   └── page.tsx                # Channel routing (AGNT-11)
│   │       ├── logs/
│   │       │   └── page.tsx                # Activity logs (AGNT-12)
│   │       └── metrics/
│   │           └── page.tsx                # Metrics dashboard (AGNT-13)
│   └── layout.tsx                          # Dashboard shell (from Phase 2)

src/
├── entities/
│   └── agent/
│       ├── model/
│       │   ├── types.ts                    # Agent entity types
│       │   ├── schemas.ts                  # Zod schemas for agent data
│       │   └── templates.ts                # Agent template definitions
│       ├── lib/
│       │   └── agent-utils.ts              # Status mapping, formatting
│       └── index.ts                        # Public API
│
├── features/
│   └── agents/
│       ├── model/
│       │   ├── agent-store.ts              # Zustand store for agent state
│       │   └── wizard-store.ts             # Zustand store for creation wizard
│       ├── api/
│       │   ├── use-agents.ts               # TanStack Query: fetch agent list
│       │   ├── use-agent-detail.ts          # TanStack Query: fetch single agent
│       │   ├── use-agent-sessions.ts        # TanStack Query: fetch sessions
│       │   ├── use-agent-memory.ts          # TanStack Query: fetch memory
│       │   ├── use-agent-skills.ts          # TanStack Query: fetch skills
│       │   ├── use-agent-logs.ts            # TanStack Query: fetch logs
│       │   ├── use-agent-metrics.ts         # TanStack Query: fetch metrics
│       │   └── use-agent-mutations.ts       # Mutations: create, update, delete
│       ├── components/
│       │   ├── agent-card.tsx               # Employee badge-style card
│       │   ├── agent-grid.tsx               # Responsive card grid
│       │   ├── agent-search-bar.tsx         # Search + status filter
│       │   ├── agent-detail-sidebar.tsx     # Sub-page navigation sidebar
│       │   ├── agent-overview-widgets.tsx    # Overview dashboard widgets
│       │   ├── agent-identity-editor.tsx     # Markdown editor with file sidebar
│       │   ├── agent-sessions-table.tsx      # Sessions DataTable
│       │   ├── agent-memory-browser.tsx      # Memory file browser + editor
│       │   ├── agent-skills-grid.tsx         # Skills card grid with toggles
│       │   ├── agent-tools-config.tsx        # Allow/deny tool lists
│       │   ├── agent-sandbox-form.tsx        # Sandbox configuration form
│       │   ├── agent-channels-table.tsx      # Channel routing table
│       │   ├── agent-logs-table.tsx          # Activity logs DataTable
│       │   └── agent-metrics-charts.tsx      # Recharts metrics dashboard
│       ├── wizard/
│       │   ├── wizard-shell.tsx              # Wizard layout with step navigation
│       │   ├── step-basics.tsx               # Name, description, avatar
│       │   ├── step-model-config.tsx         # Model selection, parameters
│       │   ├── step-identity.tsx             # Identity file templates
│       │   ├── step-skills-tools.tsx         # Skills and tool selection
│       │   ├── step-sandbox.tsx              # Sandbox configuration
│       │   ├── step-channels.tsx             # Channel routing setup
│       │   └── step-review.tsx               # Final review before creation
│       ├── schemas/
│       │   ├── wizard-schemas.ts             # Zod schemas per wizard step
│       │   └── config-schemas.ts             # Zod schemas for sub-page forms
│       └── index.ts                          # Public API
│
├── views/
│   └── agents/
│       ├── agents-roster-view.tsx            # Roster page composition
│       ├── agent-detail-view.tsx             # Detail overview composition
│       ├── agent-creation-view.tsx           # Wizard page composition
│       ├── agent-templates-view.tsx          # Template gallery composition
│       └── agent-sub-page-views.tsx          # Sub-page view compositions
│
└── widgets/
    └── agent-detail-layout/
        └── components/
            └── agent-detail-shell.tsx        # Detail layout with sidebar
```

### Pattern 1: Agent Detail Nested Layout

**What:** A Next.js nested layout that provides persistent sidebar navigation for agent sub-pages. The sidebar stays mounted across page transitions.

**When to use:** The `/agents/[agentId]` route and all its children.

```typescript
// app/(dashboard)/agents/[agentId]/layout.tsx

import { AgentDetailShell } from "@/widgets/agent-detail-layout/components/agent-detail-shell";

export default async function AgentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <AgentDetailShell agentId={agentId}>
      {children}
    </AgentDetailShell>
  );
}
```

```typescript
// src/widgets/agent-detail-layout/components/agent-detail-shell.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, MessageSquare, Brain,
  Wrench, Shield, Radio, ScrollText, BarChart3, Settings2,
} from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/cn";

const subPages = [
  { title: "Overview", href: "", icon: LayoutDashboard },
  { title: "Identity", href: "/identity", icon: FileText },
  { title: "Sessions", href: "/sessions", icon: MessageSquare },
  { title: "Memory", href: "/memory", icon: Brain },
  { title: "Skills", href: "/skills", icon: Wrench },
  { title: "Tools", href: "/tools", icon: Settings2 },
  { title: "Sandbox", href: "/sandbox", icon: Shield },
  { title: "Channels", href: "/channels", icon: Radio },
  { title: "Logs", href: "/logs", icon: ScrollText },
  { title: "Metrics", href: "/metrics", icon: BarChart3 },
];

interface AgentDetailShellProps {
  agentId: string;
  children: React.ReactNode;
}

export function AgentDetailShell({ agentId, children }: AgentDetailShellProps) {
  const pathname = usePathname();
  const basePath = `/agents/${agentId}`;

  return (
    <div className="flex h-full">
      {/* Left sidebar navigation */}
      <aside className="w-56 shrink-0 border-r border-border">
        <ScrollArea className="h-full py-4">
          <nav className="space-y-1 px-3">
            {subPages.map((page) => {
              const href = `${basePath}${page.href}`;
              const isActive = page.href === ""
                ? pathname === basePath
                : pathname.startsWith(href);

              return (
                <Link
                  key={page.title}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <page.icon className="size-4" />
                  {page.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

### Pattern 2: Agent Card with Status Glow

**What:** An agent card styled like an employee badge with a subtle CSS glow border that changes color by status.

**When to use:** The agent roster grid at `/agents`.

```typescript
// src/features/agents/components/agent-card.tsx
"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/cn";
import type { Agent } from "@/entities/agent";

const statusGlowClasses: Record<Agent["status"], string> = {
  online: "shadow-[0_0_15px_-3px] shadow-green-500/40 border-green-500/30",
  idle: "shadow-[0_0_15px_-3px] shadow-yellow-500/40 border-yellow-500/30",
  working: "shadow-[0_0_15px_-3px] shadow-blue-500/40 border-blue-500/30",
  error: "shadow-[0_0_15px_-3px] shadow-red-500/40 border-red-500/30",
  offline: "border-border",
};

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        "border",
        statusGlowClasses[agent.status]
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="size-12">
          <AvatarImage src={agent.avatar} alt={agent.name} />
          <AvatarFallback>
            {agent.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{agent.model}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {agent.keyStat}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: Zustand Agent Store with WebSocket Subscriptions

**What:** A Zustand store that holds the agent roster and individual agent details, updated in real-time via the Event Bus.

**When to use:** All agent pages. Roster reads `agents`, detail pages read `agentDetail`.

```typescript
// src/features/agents/model/agent-store.ts

import { create } from "zustand";
import type { Agent } from "@/entities/agent";

interface AgentStore {
  // Roster state
  agents: Agent[];
  isLoading: boolean;

  // Detail state
  agentDetail: Agent | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (agentId: string, status: Agent["status"]) => void;
  setAgentDetail: (agent: Agent | null) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  isLoading: true,
  agentDetail: null,

  setAgents: (agents) => set({ agents, isLoading: false }),

  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
      agentDetail:
        state.agentDetail?.id === agentId
          ? { ...state.agentDetail, status }
          : state.agentDetail,
    })),

  setAgentDetail: (agent) => set({ agentDetail: agent }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (agentId) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
    })),
}));

// Initialize subscriptions from Event Bus (called once at app startup)
export function initAgentStoreSubscriptions(eventBus: EventBus) {
  eventBus.on("agent.status", ({ agentId, status }) => {
    useAgentStore.getState().updateAgentStatus(agentId, status as Agent["status"]);
  });
}
```

### Pattern 4: Multi-Step Wizard with Per-Step Validation

**What:** A creation wizard using a Zustand store for cross-step state and react-hook-form + Zod for per-step validation.

**When to use:** Agent creation at `/agents/new`.

```typescript
// src/features/agents/model/wizard-store.ts

import { create } from "zustand";

interface WizardState {
  currentStep: number;
  // Step data
  basics: { name: string; description: string; avatar?: string } | null;
  modelConfig: { model: string; temperature: number; maxTokens: number } | null;
  identity: { soul: string; identity: string; user: string; agents: string } | null;
  skillsTools: { skills: string[]; tools: string[]; deniedTools: string[] } | null;
  sandbox: { enabled: boolean; image: string; workspacePath: string } | null;
  channels: { bindings: { channelId: string; rule: string }[] } | null;

  // Actions
  setStep: (step: number) => void;
  setBasics: (data: WizardState["basics"]) => void;
  setModelConfig: (data: WizardState["modelConfig"]) => void;
  setIdentity: (data: WizardState["identity"]) => void;
  setSkillsTools: (data: WizardState["skillsTools"]) => void;
  setSandbox: (data: WizardState["sandbox"]) => void;
  setChannels: (data: WizardState["channels"]) => void;
  loadTemplate: (template: AgentTemplate) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  basics: null,
  modelConfig: null,
  identity: null,
  skillsTools: null,
  sandbox: null,
  channels: null,

  setStep: (step) => set({ currentStep: step }),
  setBasics: (data) => set({ basics: data }),
  setModelConfig: (data) => set({ modelConfig: data }),
  setIdentity: (data) => set({ identity: data }),
  setSkillsTools: (data) => set({ skillsTools: data }),
  setSandbox: (data) => set({ sandbox: data }),
  setChannels: (data) => set({ channels: data }),

  loadTemplate: (template) =>
    set({
      basics: template.basics,
      modelConfig: template.modelConfig,
      identity: template.identity,
      skillsTools: template.skillsTools,
      sandbox: template.sandbox,
      channels: template.channels,
    }),

  reset: () =>
    set({
      currentStep: 0,
      basics: null,
      modelConfig: null,
      identity: null,
      skillsTools: null,
      sandbox: null,
      channels: null,
    }),
}));
```

```typescript
// src/features/agents/schemas/wizard-schemas.ts

import { z } from "zod";

export const basicsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(64),
  description: z.string().max(500).optional().default(""),
  avatar: z.string().url().optional(),
});

export const modelConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(256).max(200000).default(4096),
});

// Each step has its own schema -- wizard validates only the current step
export const identitySchema = z.object({
  soul: z.string().default(""),
  identity: z.string().default(""),
  user: z.string().default(""),
  agents: z.string().default(""),
});

export const skillsToolsSchema = z.object({
  skills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  deniedTools: z.array(z.string()).default([]),
});

export const sandboxSchema = z.object({
  enabled: z.boolean().default(false),
  image: z.string().default("node:20-slim"),
  workspacePath: z.string().default("/workspace"),
});

export const channelsSchema = z.object({
  bindings: z.array(z.object({
    channelId: z.string(),
    rule: z.string(),
  })).default([]),
});
```

```typescript
// src/features/agents/wizard/step-basics.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicsSchema } from "../schemas/wizard-schemas";
import { useWizardStore } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function StepBasics({ onNext }: { onNext: () => void }) {
  const { basics, setBasics } = useWizardStore();

  const form = useForm({
    resolver: zodResolver(basicsSchema),
    defaultValues: basics ?? { name: "", description: "", avatar: undefined },
  });

  function handleNext(data: z.infer<typeof basicsSchema>) {
    setBasics(data);
    onNext();
  }

  return (
    <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
      {/* form fields */}
      <Button type="submit">Next</Button>
    </form>
  );
}
```

### Pattern 5: Identity Editor with Auto-Save

**What:** Split-pane markdown editor with file sidebar and debounced auto-save.

**When to use:** The identity editor page at `/agents/[agentId]/identity`.

```typescript
// src/features/agents/components/agent-identity-editor.tsx
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDebouncedCallback } from "use-debounce";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/cn";
import { toast } from "sonner";

// Dynamic import -- react-md-editor uses browser APIs
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const IDENTITY_FILES = [
  { key: "soul", name: "SOUL.md", description: "Core personality and values" },
  { key: "identity", name: "IDENTITY.md", description: "Role and capabilities" },
  { key: "user", name: "USER.md", description: "User preferences and context" },
  { key: "agents", name: "AGENTS.md", description: "Known agents and relationships" },
] as const;

interface IdentityEditorProps {
  agentId: string;
  initialFiles: Record<string, string>;
  onSave: (fileKey: string, content: string) => Promise<void>;
}

export function AgentIdentityEditor({
  agentId,
  initialFiles,
  onSave,
}: IdentityEditorProps) {
  const [activeFile, setActiveFile] = useState<string>("soul");
  const [files, setFiles] = useState(initialFiles);
  const [saving, setSaving] = useState(false);

  const debouncedSave = useDebouncedCallback(
    async (fileKey: string, content: string) => {
      setSaving(true);
      try {
        await onSave(fileKey, content);
        toast.success("Saved");
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    500
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      const content = value ?? "";
      setFiles((prev) => ({ ...prev, [activeFile]: content }));
      debouncedSave(activeFile, content);
    },
    [activeFile, debouncedSave]
  );

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* File sidebar */}
      <aside className="w-48 shrink-0 border-r border-border">
        <ScrollArea className="h-full py-2">
          {IDENTITY_FILES.map((file) => (
            <button
              key={file.key}
              onClick={() => setActiveFile(file.key)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                activeFile === file.key
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <div className="font-mono text-xs">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {file.description}
              </div>
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* Editor area */}
      <div className="flex-1" data-color-mode="dark">
        <MDEditor
          value={files[activeFile] ?? ""}
          onChange={handleChange}
          height="100%"
          preview="live"
          visibleDragbar={false}
        />
        {saving && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
```

### Pattern 6: TanStack Query + Zustand Separation for Agent Data

**What:** TanStack Query fetches initial data from the gateway; Zustand receives real-time updates. Both stay in sync.

**When to use:** Any agent data that needs both initial load AND real-time updates.

```typescript
// src/features/agents/api/use-agents.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAgentStore } from "../model/agent-store";

async function fetchAgents(): Promise<Agent[]> {
  // Calls the GatewayClient abstraction from Phase 1
  const response = await gatewayClient.getAgents();
  return response;
}

export function useAgents() {
  const setAgents = useAgentStore((s) => s.setAgents);

  const query = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 60_000, // 1 minute -- real-time updates come via WebSocket
  });

  // Sync initial TanStack Query data into Zustand store
  useEffect(() => {
    if (query.data) {
      setAgents(query.data);
    }
  }, [query.data, setAgents]);

  // Components read from Zustand for real-time state
  const agents = useAgentStore((s) => s.agents);

  return {
    agents,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### Pattern 7: Agent Roster with Search and Status Filter

**What:** Card grid with URL-persisted search/filter state via nuqs.

```typescript
// Roster page with nuqs for URL state
"use client";

import { useQueryState } from "nuqs";
import { useAgents } from "@/features/agents/api/use-agents";
import { AgentCard } from "@/features/agents/components/agent-card";
import { AgentSearchBar } from "@/features/agents/components/agent-search-bar";
import { useMemo } from "react";

export function AgentsRosterView() {
  const { agents, isLoading } = useAgents();
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [statusFilter, setStatusFilter] = useQueryState("status", {
    defaultValue: "all",
  });

  const filtered = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = agent.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agents, search, statusFilter]);

  return (
    <div className="space-y-6">
      <AgentSearchBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **One massive agent page component:** The agent detail has 9+ sub-pages. Each MUST be a separate route segment with its own page.tsx, not tabs within a single component. Next.js nested layouts handle the shared sidebar without re-rendering.
- **Storing wizard state in react-hook-form across steps:** react-hook-form state is per-form. When a step component unmounts, its form state is lost. Use Zustand as the cross-step persistence layer; each step reads initial values from Zustand and writes validated values back.
- **Importing @uiw/react-md-editor without dynamic import:** The markdown editor uses browser APIs (document, window). It MUST be dynamically imported with `{ ssr: false }` in Next.js to prevent server-side rendering errors.
- **Polling for agent status updates:** Agent status is pushed via WebSocket Event Bus. Do NOT poll the gateway for status updates. Use the Zustand store subscription pattern from Pattern 3.
- **Using separate Zustand stores per sub-page:** Agent detail data (status, model, config) is shared across sub-pages. Use ONE agent store with slices, not separate stores that duplicate data.
- **Inline editing everywhere:** Not all sub-pages benefit from inline editing. Use inline editing for simple toggles (skills enable/disable, sandbox mode). Use dedicated forms for complex configuration (tool allow/deny, sandbox Docker settings). Use modals only for destructive confirmations (delete agent).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown editor with preview | Custom textarea + react-markdown | @uiw/react-md-editor | Toolbar, syntax highlighting, split-pane preview, dark mode, keyboard shortcuts. Dozens of edge cases in markdown rendering. |
| Debounced auto-save | Custom setTimeout + useRef | use-debounce's useDebouncedCallback | Handles cleanup on unmount, cancel/flush/isPending, stale closure prevention. Battle-tested. |
| Multi-step wizard navigation | Custom step state machine | Zustand store + react-hook-form per step | Step state persistence, back/forward navigation, skip-to-step, load template. Pattern is simple but error-prone to build from scratch. |
| Chart rendering | Custom SVG/Canvas charts | shadcn/ui Chart (Recharts) | Responsive, accessible, tooltips, legends, animations. Consistent with design system. |
| URL search params | Manual URLSearchParams | nuqs | Type-safe, React 19 compatible, shallow routing, serialization/deserialization built-in. |
| Virtual scrolling in log tables | Custom intersection observer | @tanstack/react-virtual | Handles variable row heights, overscan, scroll restoration, accessibility. |
| Agent card grid responsiveness | Manual media query logic | CSS Grid with responsive breakpoints | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` handles all breakpoints declaratively. |

**Key insight:** Phase 3 has 13 requirements across ~12 views. Any custom solution that saves 10 minutes per implementation but costs 2 hours to build is a net loss. Lean heavily on established libraries for this phase.

## Common Pitfalls

### Pitfall 1: SSR Errors with @uiw/react-md-editor
**What goes wrong:** Server-side rendering crashes with "document is not defined" or "window is not defined" errors.
**Why it happens:** @uiw/react-md-editor internally accesses browser APIs (document, window) that don't exist during server rendering.
**How to avoid:** Always use `next/dynamic` with `{ ssr: false }`:
```typescript
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
```
**Warning signs:** Build fails, or page shows hydration mismatch errors.

### Pitfall 2: Wizard State Lost on Browser Back
**What goes wrong:** User fills several wizard steps, hits browser back, comes back -- all progress is gone.
**Why it happens:** Zustand store is in-memory by default. Page navigation unmounts the wizard, and store resets.
**How to avoid:** Use Zustand's `persist` middleware with `sessionStorage` for the wizard store. State survives navigation within the session but clears on tab close:
```typescript
import { persist } from "zustand/middleware";
export const useWizardStore = create(
  persist<WizardState>((set) => ({ ... }), {
    name: "agent-wizard",
    storage: createJSONStorage(() => sessionStorage),
  })
);
```
**Warning signs:** Users report losing wizard progress. QA finds back-button issues.

### Pitfall 3: Agent Status Glow Causing Layout Shift
**What goes wrong:** The CSS box-shadow glow on agent cards causes cards to visually "jump" when status changes because shadow size changes.
**Why it happens:** If using `border-width` changes or padding changes for the glow effect, layout reflows occur.
**How to avoid:** Use `box-shadow` exclusively for the glow effect -- box-shadow does not affect layout. Keep border-width constant (1px). Only change shadow color/spread and border-color. Also add `transition-all duration-300` for smooth changes.
**Warning signs:** Cards in the grid shift position when an agent's status changes.

### Pitfall 4: react-md-editor Dark Mode Not Matching Theme
**What goes wrong:** The markdown editor renders with its default light theme even though the app is in dark mode.
**Why it happens:** @uiw/react-md-editor reads the `data-color-mode` attribute from the nearest parent element, not from the CSS class `.dark` that next-themes uses.
**How to avoid:** Wrap the editor in a container with `data-color-mode="dark"` (or sync it with next-themes):
```typescript
import { useTheme } from "next-themes";
const { resolvedTheme } = useTheme();
// ...
<div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
  <MDEditor ... />
</div>
```
**Warning signs:** Editor has white background in dark mode. Jarring contrast with rest of UI.

### Pitfall 5: TanStack Query and Zustand Data Desync
**What goes wrong:** TanStack Query refetches agent data in the background and overwrites Zustand state that had been updated by real-time WebSocket events. Agent status flickers.
**Why it happens:** Both TanStack Query and Zustand try to be the source of truth for the same data.
**How to avoid:** TanStack Query is the INITIAL loader only. Once data is in Zustand, subsequent updates come from WebSocket only. Disable automatic refetching or make the sync one-directional:
```typescript
const query = useQuery({
  queryKey: ["agents"],
  queryFn: fetchAgents,
  staleTime: Infinity, // Don't auto-refetch; WebSocket handles updates
  refetchOnWindowFocus: false,
});
```
Alternatively, merge strategies: only update fields that WebSocket doesn't control.
**Warning signs:** Agent status flickers between states. "Working" agent briefly shows "idle" then back to "working".

### Pitfall 6: Massive Bundle from Importing All Recharts Components
**What goes wrong:** Recharts adds significant bundle size because the entire library is imported.
**Why it happens:** Importing from the top-level `recharts` package includes all chart types, even unused ones.
**How to avoid:** Import specific components:
```typescript
// Good
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Bad - pulls everything
import * as Recharts from "recharts";
```
shadcn/ui's Chart component already handles this correctly.
**Warning signs:** Large bundle size warnings during build. Slow page load for metrics page.

### Pitfall 7: Next.js Dynamic Route Params are Async in v16
**What goes wrong:** `params.agentId` causes a TypeScript error or runtime crash.
**Why it happens:** In Next.js 16, `params` is a Promise that must be awaited.
**How to avoid:** Always `await params` in server components:
```typescript
export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  // ...
}
```
**Warning signs:** TypeScript errors about params being a Promise. Runtime: "Cannot read property 'agentId' of undefined."

## Code Examples

### Agent Entity Types

```typescript
// src/entities/agent/model/types.ts

export type AgentStatus = "online" | "idle" | "working" | "error" | "offline";

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  status: AgentStatus;
  model: string;
  keyStat: string; // e.g., "42 tasks completed" or "3.2k tokens/hr"
  contextUsage: number; // 0-100 percentage
  uptime: number; // seconds
  currentTask?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface AgentSession {
  id: string;
  agentId: string;
  startedAt: Date;
  endedAt?: Date;
  tokenCount: number;
  compactionCount: number;
  status: "active" | "compacted" | "ended";
}

export interface AgentMemoryFile {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  source: "built-in" | "clawhub" | "custom";
}

export interface AgentTool {
  name: string;
  description: string;
  allowed: boolean;
  elevated: boolean;
}

export interface AgentLogEntry {
  id: string;
  timestamp: Date;
  eventType: "tool_call" | "message" | "error" | "status_change" | "compaction";
  summary: string;
  details?: unknown;
  status: "success" | "error" | "pending";
}

export interface AgentMetrics {
  tokenUsage: { date: string; tokens: number }[];
  costBreakdown: { date: string; cost: number }[];
  tasksCompleted: { date: string; count: number }[];
  responseTimes: { date: string; avgMs: number }[];
}
```

### Agent Template Definitions

```typescript
// src/entities/agent/model/templates.ts

import type { AgentTemplate } from "./types";

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "code-assistant",
    name: "Code Assistant",
    description: "A developer-focused agent for code review, generation, and debugging",
    icon: "Code",
    category: "Development",
    basics: {
      name: "Code Assistant",
      description: "Helps with code review, generation, debugging, and refactoring",
    },
    modelConfig: {
      model: "claude-sonnet-4-20250514",
      temperature: 0.3,
      maxTokens: 8192,
    },
    identity: {
      soul: "# SOUL.md\n\nYou are a precise, detail-oriented software engineer...",
      identity: "# IDENTITY.md\n\n## Role\nSenior Software Engineer\n\n## Capabilities\n- Code review\n- Bug fixing\n- Refactoring\n- Architecture guidance\n",
      user: "# USER.md\n\n## Preferences\n- Language: TypeScript\n- Framework: React/Next.js\n- Style: Clean, readable, well-documented\n",
      agents: "# AGENTS.md\n\n## Known Agents\n(None configured yet)\n",
    },
    skillsTools: {
      skills: ["code-analysis", "git-operations"],
      tools: ["Read", "Write", "Bash", "Grep", "Glob"],
      deniedTools: [],
    },
    sandbox: {
      enabled: true,
      image: "node:20-slim",
      workspacePath: "/workspace",
    },
    channels: { bindings: [] },
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Gathers, analyzes, and synthesizes information from multiple sources",
    icon: "Search",
    category: "Research",
    basics: {
      name: "Research Agent",
      description: "Gathers information, analyzes data, and produces research reports",
    },
    modelConfig: {
      model: "claude-sonnet-4-20250514",
      temperature: 0.5,
      maxTokens: 16384,
    },
    identity: {
      soul: "# SOUL.md\n\nYou are a thorough, methodical researcher...",
      identity: "# IDENTITY.md\n\n## Role\nResearch Analyst\n\n## Capabilities\n- Web research\n- Data synthesis\n- Report generation\n",
      user: "# USER.md\n\n## Preferences\n- Output format: Markdown reports\n- Citation style: Inline links\n",
      agents: "# AGENTS.md\n\n## Known Agents\n(None configured yet)\n",
    },
    skillsTools: {
      skills: ["web-search", "summarization"],
      tools: ["Read", "Write", "WebSearch", "WebFetch"],
      deniedTools: ["Bash"],
    },
    sandbox: {
      enabled: false,
      image: "node:20-slim",
      workspacePath: "/workspace",
    },
    channels: { bindings: [] },
  },
  // Additional templates: "Customer Support", "Writer", "Data Analyst"
];
```

### Metrics Dashboard with shadcn/ui Chart

```typescript
// src/features/agents/components/agent-metrics-charts.tsx
"use client";

import {
  Area, AreaChart, Bar, BarChart,
  CartesianGrid, XAxis, YAxis,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/shared/ui/chart";
import type { AgentMetrics } from "@/entities/agent";

const chartConfig = {
  tokens: { label: "Tokens", color: "var(--primary)" },
  cost: { label: "Cost ($)", color: "var(--warning)" },
  tasks: { label: "Tasks", color: "var(--success)" },
  avgMs: { label: "Avg (ms)", color: "var(--secondary)" },
};

export function AgentMetricsCharts({ metrics }: { metrics: AgentMetrics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Token Usage Over Time */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Token Usage</h3>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <AreaChart data={metrics.tokenUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="tokens"
              fill="var(--primary)"
              fillOpacity={0.2}
              stroke="var(--primary)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Tasks Completed */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tasks Completed</h3>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <BarChart data={metrics.tasksCompleted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--success)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
```

### Agent Overview Widgets

```typescript
// src/features/agents/components/agent-overview-widgets.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Agent } from "@/entities/agent";

export function AgentOverviewWidgets({ agent }: { agent: Agent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-2 rounded-full",
              agent.status === "online" && "bg-green-500",
              agent.status === "idle" && "bg-yellow-500",
              agent.status === "working" && "bg-blue-500 animate-pulse",
              agent.status === "error" && "bg-red-500",
            )} />
            <span className="text-2xl font-bold capitalize">{agent.status}</span>
          </div>
          {agent.currentTask && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Working on: {agent.currentTask}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Model Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{agent.model}</p>
        </CardContent>
      </Card>

      {/* Context Usage Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Context Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <span className="text-2xl font-bold">{agent.contextUsage}%</span>
            <Progress value={agent.contextUsage} />
          </div>
        </CardContent>
      </Card>

      {/* Uptime Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Uptime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatDistanceToNow(new Date(Date.now() - agent.uptime * 1000))}
          </p>
          <p className="text-xs text-muted-foreground">
            Last active {formatDistanceToNow(agent.lastActive, { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tab-based detail views in single component | Route-based sub-pages with nested layout | Next.js 13+ App Router | Each sub-page is code-split. Sidebar persists without re-render. URL is shareable. |
| WYSIWYG rich text editors (Draft.js, Slate) | Lightweight markdown editors (@uiw/react-md-editor) | 2023-2024 | For .md files, WYSIWYG is overkill. Split-pane shows raw markdown + preview. Simpler, lighter. |
| Global wizard state via React Context | Zustand wizard store with sessionStorage persist | Zustand 4+ (2023) | No context provider boilerplate. State survives navigation. Clear reset on wizard complete. |
| Custom chart components | shadcn/ui Chart wrapping Recharts | shadcn/ui 2024 | Charts match design system out of the box. Theme-aware colors. Consistent tooltips. |
| Sync `params` in page components | `await params` (Promise) | Next.js 16 (Oct 2025) | All dynamic route params are async. TypeScript enforces this. |

**Deprecated/outdated:**
- `react-markdown-editor-lite` and `react-simplemde-editor` -- no recent commits, abandoned
- `Draft.js` -- Meta deprecated it in favor of Lexical
- Tab-based detail navigation for complex entities -- prefer route-based for code-splitting and deep linking

## Claude's Discretion Recommendations

### Markdown Editor: Split-Pane (@uiw/react-md-editor)

**Recommendation:** Use @uiw/react-md-editor in "live" preview mode (side-by-side editor + preview).

**Rationale:**
- Identity files are plain markdown, not rich content. Users need to see the raw markdown structure.
- Split-pane gives immediate visual feedback without hiding the source.
- 4.6 kB gzipped vs MDXEditor's 851 kB. Dramatically smaller bundle for the same outcome.
- Built-in dark mode via `data-color-mode` attribute, easy to sync with next-themes.
- CodeMirror under the hood provides syntax highlighting and keyboard shortcuts.
- The "techy, mission control" aesthetic is better served by seeing the markdown source than a WYSIWYG surface.

### Memory Viewer: Categorized Browser with Search

**Recommendation:** Use a categorized file browser (tree view) with a global search bar, NOT a flat searchable list.

**Rationale:**
- Memory in OpenClaw is structured: MEMORY.md (persistent) + daily files (YYYY-MM-DD.md). This naturally maps to a tree/category view.
- A flat list loses the temporal organization. Users want to browse "what happened last Tuesday" or "what's in persistent memory."
- Tree structure: top-level shows MEMORY.md (always first), then daily files sorted by date (newest first).
- Search bar searches across all memory file contents. Results highlight which file(s) matched.
- Clicking a memory file opens it in a read-only markdown viewer (same @uiw/react-md-editor in preview-only mode for consistency). MEMORY.md is editable; daily files are read-only.

### Sub-Page Edit Patterns (per sub-page)

**Recommendation:**

| Sub-page | Edit Pattern | Why |
|----------|-------------|-----|
| Identity | Dedicated editor page (split-pane) | Complex content, needs full screen |
| Skills | Inline toggle switches | Simple enable/disable, no modal needed |
| Tools | Inline with expandable sections | Allow/deny is a toggle; elevated config needs more space |
| Sandbox | Inline form | Few fields, all visible at once |
| Channels | Read-only table (editing is in Phase 7) | Channel config is complex, belongs in its own feature |
| Memory | Inline editor for MEMORY.md, read-only for daily files | MEMORY.md is user-managed; daily files are system-generated |
| Sessions, Logs, Metrics | Read-only with filters | Observability data, not editable |

### Agent Overview Widget Layout

**Recommendation:** 4-column grid on desktop (xl), 2-column on tablet (md), 1-column on mobile.

- **Row 1 (top):** Status | Model | Context Usage | Uptime -- four equal-width stat cards
- **Row 2:** Recent Activity (spans 2 columns) | Quick Actions (spans 2 columns)
- **Row 3:** (future: mini charts, currently not needed)

Quick Actions card includes: "Send Message", "View Sessions", "Edit Identity", "View Logs" as button links.

### Loading Skeleton Design

**Recommendation:** Match the exact layout shapes of each page:
- **Roster:** Grid of card-shaped skeletons (same dimensions as real cards)
- **Detail overview:** 4 stat card skeletons + 2 wide card skeletons
- **Identity editor:** File sidebar skeleton + editor area skeleton
- **Tables (sessions, logs):** Table header skeleton + 5 row skeletons
- **Charts (metrics):** Chart container skeletons with axis placeholders

Use the shimmer animation already defined in globals.css (`@keyframes shimmer`).

### Error State Handling

**Recommendation:** Three levels of error handling:
1. **Page-level error:** ErrorBoundary (from Phase 1 shared UI) wraps each sub-page. Shows error message + "Retry" button.
2. **Widget-level error:** Individual widgets (overview cards, charts) show inline error state with retry. Other widgets remain functional.
3. **Action-level error:** Failed mutations (create, save, delete) show toast notification via sonner with error details and optional retry action.

Gateway disconnection shows the persistent connection status banner from Phase 1 at the top of the page. Sub-pages show stale data with a "Connection lost -- showing cached data" notice.

## Open Questions

1. **Gateway API methods for agent management**
   - What we know: The GatewayClient abstraction from Phase 1 provides `getAgents()`. Agent status events come via WebSocket.
   - What's unclear: The exact gateway RPC methods for creating agents, updating config, fetching sessions/memory/skills/logs/metrics. The OpenClaw gateway protocol docs enumerate frame formats but not the full method catalog.
   - Recommendation: Implement the GatewayClient methods optimistically based on reasonable names (`agent.create`, `agent.sessions`, `agent.memory.list`, etc.). If methods don't match the actual gateway, the abstraction layer isolates the changes. Test against a real gateway early.

2. **Agent avatar storage**
   - What we know: Agent cards show an avatar.
   - What's unclear: Where avatar images are stored (gateway filesystem? uploaded to AXion Hub? URL reference?).
   - Recommendation: Store avatar as a URL string in agent config. For the creation wizard, allow URL input or a simple upload that stores in the public directory. Keep it simple -- most agents will use generated initials via Avatar fallback.

3. **Real-time log streaming volume**
   - What we know: Agent logs page (AGNT-12) shows activity log, tool calls, and errors. Virtual scrolling is planned.
   - What's unclear: Volume of log entries. Could be dozens per hour or thousands per minute depending on agent activity.
   - Recommendation: Implement virtual scrolling from the start. Use a ring buffer in the Zustand log store (keep last 1,000 entries in memory). Older entries fetched via TanStack Query pagination from gateway.

4. **Identity file format verification**
   - What we know: OpenClaw uses SOUL.md, IDENTITY.md, USER.md, AGENTS.md files.
   - What's unclear: Whether these are strictly markdown or have special sections/frontmatter that the gateway parses.
   - Recommendation: Treat as plain markdown for now. The editor should not impose structure beyond the template starter content. If gateway requires specific sections, add validation later.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages) -- Nested layouts for agent detail sub-pages, partial rendering behavior
- [Next.js Dynamic Route Segments](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) -- `[agentId]` route parameter, async params in Next.js 16
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/radix/chart) -- Recharts integration, ChartContainer, ChartTooltip, installation
- [shadcn/ui Components Registry](https://ui.shadcn.com/docs/components) -- Card, Avatar, Badge, Tabs, Dialog, ScrollArea, Select, Switch, Progress, Skeleton
- [Zustand v5 Documentation](https://github.com/pmndrs/zustand) -- Store creation, persist middleware, selectors, React 19 compatibility
- [TanStack Query v5](https://tanstack.com/query/latest) -- useQuery, mutations, staleTime, refetchOnWindowFocus
- [react-hook-form Advanced Usage](https://www.react-hook-form.com/advanced-usage/) -- Multi-step forms, FormProvider, per-step validation
- Phase 1 Research (01-RESEARCH.md) -- Gateway protocol, Event Bus, Zustand patterns, TanStack Query setup, design tokens
- Phase 2 Research (02-RESEARCH.md) -- Auth patterns, app shell, sidebar, route protection

### Secondary (MEDIUM confidence)
- [@uiw/react-md-editor npm](https://www.npmjs.com/package/@uiw/react-md-editor) -- v4.0.11, weekly downloads, feature set, dark mode support
- [@uiw/react-md-editor GitHub](https://github.com/uiwjs/react-md-editor) -- Active maintenance, split-pane preview, toolbar customization
- [use-debounce npm](https://www.npmjs.com/package/use-debounce) -- v10.1.0, useDebouncedCallback, cancel/flush/isPending
- [react-hook-form + Zustand multi-step discussion](https://github.com/orgs/react-hook-form/discussions/6382) -- Community-validated pattern
- [react-hook-form + Zustand + Zod tutorial](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps) -- Step-by-step implementation
- [Zustand WebSocket integration discussion](https://github.com/pmndrs/zustand/discussions/1651) -- Best practices for real-time data
- [CSS glow border with Tailwind](https://tailwindflex.com/@prashant/glowing-gradient-border) -- box-shadow approach for status glow

### Tertiary (LOW confidence)
- Gateway RPC method names for agent operations -- Assumed based on pattern (`agent.create`, `agent.sessions`, etc.). Not verified against actual gateway API.
- Identity file format constraints -- Assumed plain markdown. May have frontmatter or required sections.
- Log streaming volume -- Unknown. Ring buffer approach is preventive, may need adjustment.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- @uiw/react-md-editor verified via npm/GitHub. use-debounce verified. Recharts verified via shadcn/ui docs. All other libraries from Phase 1/2 stack.
- Architecture (nested layouts + route-based sub-pages): HIGH -- Official Next.js App Router documentation. Well-established pattern.
- Zustand + TanStack Query pattern: HIGH -- Documented in Phase 1 research. Community-validated for real-time + REST hybrid.
- Wizard pattern (react-hook-form + Zustand): MEDIUM-HIGH -- Community pattern, multiple tutorials and discussions confirm it. Not an official react-hook-form feature, but well-tested.
- Gateway API methods for agent operations: LOW -- Method names assumed, not verified against actual gateway protocol.
- Pitfalls: HIGH -- Based on verified library constraints (SSR issues with md-editor, Next.js 16 async params, Zustand persist).

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- all libraries are stable releases, no fast-moving dependencies)
