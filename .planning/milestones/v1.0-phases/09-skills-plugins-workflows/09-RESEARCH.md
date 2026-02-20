# Phase 9: Skills, Plugins & Workflows - Research

**Researched:** 2026-02-19
**Domain:** Skill library management, plugin browser/installer, visual workflow canvas with scheduling and webhooks
**Confidence:** HIGH

## Summary

Phase 9 spans three interconnected feature domains: a centralized skill library with ClawHub registry browsing, a plugin management system with per-agent granularity, and a visual workflow automation builder with cron scheduling and webhook triggers. The largest engineering challenge is the workflow canvas -- a fully interactive node-based editor where users drag nodes from a sidebar palette, connect them, configure each node via a right sidebar panel, and watch live execution results overlay on the canvas.

The project already has all the core dependencies needed. `@xyflow/react` v12.10.0 is installed and used in two places (dependency map in Phase 5 and routing graph in Phase 7), providing a proven pattern for custom nodes with `Handle` components, dagre layout, `Controls`, `Background`, and `MiniMap`. However, the existing usage is read-only (nodes are not draggable, no `onConnect`, no drag-from-sidebar). Phase 9 must upgrade to the full interactive pattern: `ReactFlowProvider`, `screenToFlowPosition` for drag-and-drop from sidebar, `addEdge` for connections, `isValidConnection` for connection rules, and backspace deletion. The CodeMirror editor (`@uiw/react-codemirror`) is already integrated in the workspace feature for syntax-highlighted code editing, and can be reused for the Code node editor and raw JSON config toggle. BullMQ with Redis is already set up in `src/shared/lib/queue.ts` (with a commented placeholder for `workflowQueue`), providing the server-side infrastructure for repeatable cron jobs via `upsertJobScheduler`.

For the cron schedule builder UI, `cronstrue` (v3.12.0, zero-dependency) converts cron expressions to human-readable descriptions. Combined with `croner` (used only for `nextRun()` / `nextRuns()` date previews on the client), this covers the hybrid visual builder + raw expression pattern. No other new dependencies are required -- the skill/plugin pages are standard CRUD UIs built with the existing DataTable, Card grid, SearchInput, Badge, Switch, and FormField components.

**Primary recommendation:** Build the three domains in dependency order: (1) entity types and mock data for skills, plugins, and workflows, (2) skill library and ClawHub pages (simplest, reuse existing AgentSkill patterns), (3) plugin management pages, (4) workflow canvas and execution infrastructure, (5) scheduling and webhook pages. The workflow canvas Zustand store is the architectural centerpiece -- it must hold the full workflow graph (nodes, edges, selected node), the node palette definition, undo/redo history, and execution state. Use the same FSD structure as all prior phases: entities for types/schemas, features for components/api/model, views for page composition, and thin app route wrappers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Skills library & ClawHub
- Card grid with category sections at /skills (e.g., Code, Communication, Data)
- Compact cards: icon, name, one-line description, status badge (enabled/disabled/update available); details on click
- ClawHub at /skills/clawhub is a separate marketplace-style page: featured/trending section, category tabs, search bar, install buttons
- Individual skill config at /skills/[skillId] uses JSON + form hybrid: structured form for common settings, raw JSON toggle for advanced config (reuses Phase 7 gateway config editor pattern)

#### Plugin management
- /plugins shows installed plugins in a DataTable: name, version, status (active/disabled/error), last updated, action menu (configure, disable, uninstall)
- /plugins/install is a visual GUI browser with plugin cards, search, and one-click Install button; npm happens behind the scenes with inline progress
- Plugins installed workspace-wide but with per-agent enable/disable toggles
- Plugin detail page is full-featured: readme/docs section, settings form, agent assignment toggles, permissions display, and update history

#### Workflow canvas
- /workflows/new starts with a blank canvas and sidebar palette of available node types (no wizard, no templates)
- Rich node palette: Trigger (manual/cron/webhook/event), Agent Action, Condition (if/else), Delay, Transform (data mapping), Output (notify/log), Loop, Parallel (fan-out/fan-in), HTTP Request, Code (custom JS/Python), Approval Gate, Sub-workflow
- Node configuration via right sidebar panel (like Figma properties panel); canvas stays visible
- Execution results: canvas overlay for live runs (colored node borders for pending/running/success/error, click node for I/O in sidebar) PLUS dedicated results page for detailed inspection of past runs

#### Scheduling & triggers
- Cron schedule builder at /workflows/cron uses hybrid: visual builder (dropdowns for frequency, day, time) as default, toggle to raw cron expression for power users; human-readable preview always shown
- Webhook endpoints at /workflows/webhooks managed via DataTable: URL, linked workflow, status, last triggered; create via dialog with URL generation, secret, and workflow assignment
- Run history shown as inline expandable rows in cron/webhook tables: last N runs with status, duration, timestamp
- Failed runs support retry with options: retry button plus ability to edit input payload before re-queuing

### Claude's Discretion
- Exact node visual design and color coding on canvas
- Workflow list page layout at /workflows (table vs cards)
- ClawHub category taxonomy
- Plugin browser layout specifics
- Canvas zoom/pan controls and minimap placement

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SKIL-01 | View installed skills at /skills | Card grid with category sections; reuse `AgentSkill` entity type extended with category, icon, version fields; mock data with TanStack Query |
| SKIL-02 | Browse and install skills from ClawHub at /skills/clawhub | Marketplace page with SearchInput, category tabs (nuqs URL state), featured section, install button with mutation + optimistic update |
| SKIL-03 | View skill config, SKILL.md, enable/disable per agent at /skills/[skillId] | JSON+form hybrid config editor reusing Phase 7 pattern (config-draft-store + ConfigRawJson); agent toggle switches; markdown preview with @uiw/react-md-editor |
| SKIL-04 | View plugins, enable/disable/configure at /plugins | DataTable with columns for name, version, status, last updated, action menu; per-agent toggle pattern from SKIL-03 |
| SKIL-05 | Install plugins from npm or browse at /plugins/install | Plugin card browser (model-catalog-browser pattern); mock install mutation with progress state; SearchInput + category filter |
| WORK-01 | View saved workflows at /workflows | List page (recommend card grid for visual preview thumbnails, with DataTable toggle option); workflow entity with status, trigger type, last run |
| WORK-02 | Build workflows with visual node editor at /workflows/new | @xyflow/react v12 interactive canvas with drag-from-sidebar, onConnect, custom node types, right sidebar config panel; workflow-canvas-store (Zustand) for graph state |
| WORK-03 | View/edit/run workflow at /workflows/[workflowId] | Load saved workflow into canvas store; Run button triggers execution; live overlay with colored node borders via WebSocket events |
| WORK-04 | Schedule via cron at /workflows/cron | DataTable of scheduled jobs; cronstrue for human-readable preview; croner for next run dates; visual builder component; BullMQ upsertJobScheduler backend pattern |
| WORK-05 | Webhook endpoints at /workflows/webhooks | DataTable with URL, linked workflow, status, last triggered; create dialog generates webhook URL + secret; nanoid for URL token generation |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xyflow/react | 12.10.0 | Visual workflow canvas (node editor) | Already used in Phase 5/7; de facto React node editor; supports drag-drop, connection validation, custom nodes |
| @dagrejs/dagre | 2.0.4 | Auto-layout for workflow graphs | Already used for dependency map and routing graph layout |
| @tanstack/react-table | 8.21.3 | DataTable for plugins, webhooks, cron jobs | Project standard for all tabular data |
| @tanstack/react-query | 5.90.21 | Server state for skills/plugins/workflows | Project standard for REST/pull state |
| zustand | 5.0.11 | Canvas state, execution state, draft stores | Project standard for push state and complex local state |
| @uiw/react-codemirror | 4.25.4 | Code node editor, raw JSON config toggle | Already integrated in workspace/code-editor.tsx with SSR-safe dynamic import |
| @codemirror/lang-json | 6.0.2 | JSON syntax highlighting for config editors | Already installed |
| @codemirror/lang-javascript | 6.2.4 | JS/TS syntax for Code node editor | Already installed |
| @codemirror/lang-python | 6.2.1 | Python syntax for Code node editor | Already installed |
| zod | 4.3.6 (v4) | Schema validation for workflow/skill/plugin data | Project standard; use `zod/v4` import |
| react-hook-form | 7.71.1 | Node config forms, skill config forms | Project standard for forms |
| nuqs | 2.8.8 | URL state for category tabs, search filters | Project standard for URL search params |
| framer-motion | 12.34.1 | Sidebar panel transitions, execution pulse | Project standard for animations |
| nanoid | 5.1.6 | Generate webhook URL tokens and node IDs | Already installed |
| bullmq | 5.69.3 | Server-side cron job scheduling | Already set up with Redis; workflowQueue placeholder exists |
| sonner | 2.0.7 | Toast notifications for actions | Project standard |

### New Dependencies Required
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cronstrue | ^3.12.0 | Human-readable cron expression descriptions | Cron builder preview text (e.g., "Every day at 3:15 AM") |
| croner | ^9.0.0 | Cron expression parsing and next-run calculation | Client-side "Next 5 runs" preview in cron builder UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cronstrue + croner | cron-parser only | cron-parser handles parsing but lacks human-readable output; cronstrue is zero-dependency, 352+ npm dependents, handles all cron special characters |
| Custom undo/redo | immer patches | React Flow docs show snapshot-based undo/redo; immer (already installed) could power it but snapshot approach is simpler for graph state |
| Separate react-dnd for palette | HTML5 native drag | React Flow docs demonstrate native HTML5 drag+drop for sidebar-to-canvas; no need for react-dnd since we only drag into the flow canvas |

**Installation:**
```bash
npm install cronstrue croner
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── skill/              # Skill types, schemas, utils
│   │   ├── model/
│   │   │   ├── types.ts    # Skill, SkillConfig, ClawHubSkill
│   │   │   └── schemas.ts  # Zod schemas
│   │   └── index.ts        # Barrel export
│   ├── plugin/             # Plugin types, schemas
│   │   ├── model/
│   │   │   ├── types.ts    # Plugin, PluginConfig, PluginInstallStatus
│   │   │   └── schemas.ts
│   │   └── index.ts
│   └── workflow/           # Workflow types, schemas
│       ├── model/
│       │   ├── types.ts    # Workflow, WorkflowNode, WorkflowEdge, ExecutionRun
│       │   └── schemas.ts
│       ├── lib/
│       │   └── node-registry.ts  # Node type definitions (palette items, defaults, icons, handle config)
│       └── index.ts
├── features/
│   ├── skills/             # Skills library & ClawHub UI
│   │   ├── api/
│   │   │   ├── use-skills.ts
│   │   │   ├── use-skill-detail.ts
│   │   │   └── use-clawhub.ts
│   │   ├── components/
│   │   │   ├── skill-card.tsx
│   │   │   ├── skill-grid.tsx
│   │   │   ├── clawhub-browser.tsx
│   │   │   ├── skill-config-editor.tsx    # Form+JSON hybrid (reuses Phase 7 pattern)
│   │   │   └── skill-agent-toggles.tsx
│   │   └── model/
│   │       └── skill-config-store.ts      # Draft store (like config-draft-store)
│   ├── plugins/            # Plugin management UI
│   │   ├── api/
│   │   │   ├── use-plugins.ts
│   │   │   ├── use-plugin-detail.ts
│   │   │   └── use-plugin-install.ts
│   │   ├── components/
│   │   │   ├── plugin-table.tsx
│   │   │   ├── plugin-browser.tsx
│   │   │   ├── plugin-detail-panel.tsx
│   │   │   ├── plugin-settings-form.tsx
│   │   │   └── plugin-agent-toggles.tsx
│   │   └── model/
│   │       └── plugin-install-store.ts    # Install progress tracking
│   └── workflows/          # Workflow canvas, scheduling, webhooks
│       ├── api/
│       │   ├── use-workflows.ts
│       │   ├── use-workflow-detail.ts
│       │   ├── use-workflow-mutations.ts
│       │   ├── use-cron-schedules.ts
│       │   └── use-webhooks.ts
│       ├── components/
│       │   ├── canvas/
│       │   │   ├── workflow-canvas.tsx         # ReactFlow + drop handler + connect handler
│       │   │   ├── node-palette.tsx            # Left sidebar draggable items
│       │   │   ├── node-config-panel.tsx       # Right sidebar Figma-style properties
│       │   │   └── execution-overlay.tsx       # Live run colored borders + progress
│       │   ├── nodes/                          # Custom React Flow node components
│       │   │   ├── trigger-node.tsx
│       │   │   ├── agent-action-node.tsx
│       │   │   ├── condition-node.tsx
│       │   │   ├── delay-node.tsx
│       │   │   ├── transform-node.tsx
│       │   │   ├── output-node.tsx
│       │   │   ├── loop-node.tsx
│       │   │   ├── parallel-node.tsx
│       │   │   ├── http-request-node.tsx
│       │   │   ├── code-node.tsx
│       │   │   ├── approval-gate-node.tsx
│       │   │   └── sub-workflow-node.tsx
│       │   ├── cron-builder.tsx               # Visual builder + raw expression toggle
│       │   ├── cron-schedules-table.tsx
│       │   ├── webhook-table.tsx
│       │   ├── webhook-create-dialog.tsx
│       │   ├── workflow-card.tsx               # For list view
│       │   └── run-history-row.tsx            # Expandable row for run history
│       └── model/
│           ├── workflow-canvas-store.ts        # Central workflow graph state
│           └── execution-store.ts             # Live execution tracking
├── views/
│   ├── skills/
│   │   ├── skills-library-view.tsx
│   │   ├── clawhub-view.tsx
│   │   └── skill-detail-view.tsx
│   ├── plugins/
│   │   ├── plugins-list-view.tsx
│   │   ├── plugin-install-view.tsx
│   │   └── plugin-detail-view.tsx
│   └── workflows/
│       ├── workflows-list-view.tsx
│       ├── workflow-editor-view.tsx           # /workflows/new and /workflows/[id]
│       ├── workflow-results-view.tsx          # Detailed past-run inspection
│       ├── cron-schedules-view.tsx
│       └── webhooks-view.tsx
└── app/(dashboard)/
    ├── skills/
    │   ├── page.tsx
    │   ├── clawhub/page.tsx
    │   └── [skillId]/page.tsx
    ├── plugins/
    │   ├── page.tsx
    │   ├── install/page.tsx
    │   └── [pluginId]/page.tsx
    └── workflows/
        ├── page.tsx
        ├── new/page.tsx
        ├── [workflowId]/page.tsx
        ├── [workflowId]/results/page.tsx
        ├── cron/page.tsx
        └── webhooks/page.tsx
```

### Pattern 1: Interactive Workflow Canvas (Drag-from-Sidebar)
**What:** Full React Flow v12 interactive editor with sidebar palette, drag-to-add nodes, connect nodes, and right-sidebar config panel.
**When to use:** The /workflows/new and /workflows/[workflowId] pages.
**Example:**
```typescript
// Source: @xyflow/react official drag-and-drop example + existing codebase patterns
// Key difference from existing read-only usage: ReactFlowProvider wrapper,
// onConnect, onDrop, screenToFlowPosition, nodesDraggable={true}

import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// nodeTypes MUST be defined outside component to prevent re-renders
const nodeTypes = {
  trigger: TriggerNode,
  agentAction: AgentActionNode,
  condition: ConditionNode,
  // ... etc
};

function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: nanoid(),
        type,
        position,
        data: getDefaultNodeData(type), // from node-registry.ts
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Controls />
      <Background />
      <MiniMap />
    </ReactFlow>
  );
}

// Wrapper MUST use ReactFlowProvider
export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-64px)]">
        <NodePalette />       {/* Left sidebar with draggable items */}
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
        <NodeConfigPanel />   {/* Right sidebar for selected node config */}
      </div>
    </ReactFlowProvider>
  );
}
```

### Pattern 2: Node Palette with HTML5 Drag
**What:** Sidebar component with draggable node type items that can be dropped onto the canvas.
**When to use:** Left sidebar of workflow editor.
**Example:**
```typescript
// Source: @xyflow/react official DnD example
interface PaletteItemProps {
  type: string;
  label: string;
  icon: LucideIcon;
}

function PaletteItem({ type, label, icon: Icon }: PaletteItemProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 rounded-md border p-2 cursor-grab active:cursor-grabbing hover:bg-muted/50"
    >
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
```

### Pattern 3: Skill/Plugin Config Editor (Phase 7 Reuse)
**What:** Form + raw JSON toggle with draft-then-apply, reusing the config-draft-store pattern.
**When to use:** /skills/[skillId] config page and plugin settings forms.
**Example:**
```typescript
// Source: Existing config-draft-store.ts + config-editor.tsx patterns
// Simplified for skill config (single object, not 9 sections)

interface SkillConfigDraftStore {
  originalConfig: Record<string, unknown> | null;
  draftConfig: Record<string, unknown> | null;
  isDirty: boolean;
  isRawJsonMode: boolean;
  validationErrors: ValidationError[];
  loadConfig: (config: Record<string, unknown>) => void;
  updateField: (path: string, value: unknown) => void;
  updateFromRawJson: (json: string) => boolean;
  toggleRawJsonMode: () => void;
  resetDraft: () => void;
}
```

### Pattern 4: Execution Overlay (Live Run Visualization)
**What:** Real-time node border coloring during workflow execution, driven by WebSocket events.
**When to use:** When user clicks "Run" on a workflow.
**Example:**
```typescript
// Execution states map to node border colors (CSS classes)
const EXECUTION_BORDER_COLORS = {
  pending: "border-muted-foreground",    // gray
  running: "border-blue-500 animate-pulse",  // blue + pulse
  success: "border-green-500",           // green
  error: "border-red-500",              // red
  skipped: "border-muted-foreground/50", // faded gray
} as const;

// execution-store.ts tracks per-node status
interface ExecutionStore {
  runId: string | null;
  nodeStates: Map<string, NodeExecutionState>;
  isRunning: boolean;
  startRun: (runId: string) => void;
  updateNodeState: (nodeId: string, state: NodeExecutionState) => void;
  clearRun: () => void;
}

// Custom node reads execution state to set border
function TriggerNode({ id, data }: NodeProps) {
  const nodeState = useExecutionStore((s) => s.nodeStates.get(id));
  const borderClass = nodeState
    ? EXECUTION_BORDER_COLORS[nodeState.status]
    : "border-border";
  // ... render with cn("border-2", borderClass)
}
```

### Pattern 5: Cron Builder (Visual + Raw Hybrid)
**What:** Dropdown-based visual cron builder with toggle to raw expression, always showing human-readable preview.
**When to use:** /workflows/cron schedule creation/editing.
**Example:**
```typescript
// Source: cronstrue npm docs + croner Context7 docs
import cronstrue from "cronstrue";
import { Cron } from "croner";

// Human-readable description
const description = cronstrue.toString("0 15 3 * * *");
// -> "At 03:15 AM"

// Next 5 run dates
const nextRuns = new Cron("0 15 3 * * *").nextRuns(5);
// -> [Date, Date, Date, Date, Date]

// Visual builder state -> cron expression
interface CronBuilderState {
  frequency: "minute" | "hourly" | "daily" | "weekly" | "monthly" | "custom";
  minute: number;
  hour: number;
  dayOfWeek: number[];  // 0-6
  dayOfMonth: number;
  rawExpression: string;
  isRawMode: boolean;
}
```

### Anti-Patterns to Avoid
- **Defining nodeTypes inside component:** React Flow re-renders ALL nodes when nodeTypes reference changes. Always define `const nodeTypes = { ... }` outside the component or wrap in useMemo with stable references.
- **Mutating nodes/edges arrays directly:** Always use the setter functions from `useNodesState` / `useEdgesState` or the Zustand store. React Flow relies on referential equality.
- **Forgetting ReactFlowProvider:** The `useReactFlow()` hook (needed for `screenToFlowPosition`) requires `ReactFlowProvider` as an ancestor. The existing read-only usage didn't need it because it didn't use `useReactFlow()`.
- **CSS import missing:** Must import `@xyflow/react/dist/style.css` for proper node/edge rendering. The existing codebase already does this.
- **SSR with React Flow:** React Flow uses DOM APIs. The canvas component must be client-only (`"use client"` directive). The existing pattern with Next.js `"use client"` directive handles this.
- **Storing entire workflow in URL params:** Workflow graph state is too complex for URL params. Use Zustand store for canvas state, URL params only for workflowId and active tab.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Node-based graph editor | Custom SVG/Canvas renderer | @xyflow/react v12 | Handles zoom, pan, minimap, connection validation, keyboard shortcuts, accessibility, edge routing, node selection -- thousands of edge cases |
| Cron expression to human text | Regex-based parser | cronstrue | 27 languages, all cron special characters, zero dependencies, 352+ dependents |
| Cron next-run calculation | Date math utilities | croner | Handles DST, timezone, leap year, L/W/# modifiers correctly |
| Cron job scheduling (backend) | Custom setTimeout/setInterval | BullMQ repeatable jobs | Redis-backed, survives restarts, distributed, already in the project |
| Drag-and-drop (sidebar to canvas) | react-dnd / @dnd-kit | HTML5 native drag API | React Flow docs demonstrate native drag; @dnd-kit is for sortable lists (already used for missions kanban), not canvas drops |
| JSON syntax-highlighted editor | Custom textarea + highlighting | @uiw/react-codemirror (already installed) | Existing CodeEditor component in workspace feature handles SSR, theme sync, language extensions |
| Markdown rendering (SKILL.md) | Custom markdown parser | @uiw/react-md-editor (already installed) | Already a dependency; provides preview mode for skill readme/docs |

**Key insight:** The workflow canvas is where the complexity budget should go. Everything else (skill grids, plugin tables, cron/webhook tables) follows established DataTable/Card patterns from prior phases. Don't spend engineering effort on fancy custom UIs for skills/plugins when the proven patterns work.

## Common Pitfalls

### Pitfall 1: React Flow Node Type Registration
**What goes wrong:** Custom nodes don't render, or the entire canvas re-renders on every state change.
**Why it happens:** The `nodeTypes` object is created inside the component body, causing a new reference on every render. React Flow treats this as "all node types changed" and re-mounts everything.
**How to avoid:** Define `const nodeTypes = { trigger: TriggerNode, ... }` as a module-level constant outside any component. If dynamic registration is needed, wrap in `useMemo` with an empty dependency array.
**Warning signs:** Console warnings about nodeTypes changing, sluggish canvas interaction, nodes flickering.

### Pitfall 2: ReactFlowProvider Missing for Drag-Drop
**What goes wrong:** `useReactFlow()` throws "React Flow provider not found" error when trying to use `screenToFlowPosition`.
**Why it happens:** The existing codebase uses `ReactFlow` directly without `ReactFlowProvider` (works for read-only). Interactive features like DnD require the provider.
**How to avoid:** Always wrap the canvas parent in `<ReactFlowProvider>`. The provider MUST be an ancestor of the component calling `useReactFlow()`, NOT the same component that renders `<ReactFlow>`.
**Warning signs:** Runtime error on first drag attempt.

### Pitfall 3: CodeMirror SSR Crash
**What goes wrong:** Next.js server-side rendering fails because CodeMirror accesses `document` at import time.
**Why it happens:** CodeMirror uses DOM APIs during module initialization.
**How to avoid:** Follow the existing `workspace/code-editor.tsx` pattern: use `dynamic(() => import("@uiw/react-codemirror"), { ssr: false })`. This is already solved in the codebase but must be replicated for any new CodeMirror usage (Code node editor, raw JSON config toggles).
**Warning signs:** `document is not defined` error during build or SSR.

### Pitfall 4: Workflow Graph Serialization
**What goes wrong:** Saving a workflow fails because the graph state contains non-serializable data (React elements, functions, circular references).
**Why it happens:** React Flow node `data` objects or Zustand stores may accumulate runtime-only state that can't be JSON.stringify'd.
**How to avoid:** Define a clear `WorkflowDefinition` type that contains only serializable fields (node positions, types, data configs, edge connections). When saving, extract this from the canvas store. When loading, hydrate the canvas store from the definition.
**Warning signs:** `JSON.stringify` errors on save, or saved workflows missing node data on reload.

### Pitfall 5: Zustand Store with `exactOptionalPropertyTypes`
**What goes wrong:** TypeScript errors when optional properties in store types interact with strict config.
**Why it happens:** The project uses `exactOptionalPropertyTypes: true` in tsconfig. Optional properties must use `| undefined` or conditional spread.
**How to avoid:** Follow the established pattern: use `field?: Type | undefined` for optional store properties, or use conditional spread `...(value !== undefined ? { field: value } : {})` when updating.
**Warning signs:** TS2412 errors about `undefined` vs optional.

### Pitfall 6: Execution Overlay State Leaks
**What goes wrong:** Previous execution colors persist after starting a new run, or execution state from one workflow appears on another.
**Why it happens:** The execution store isn't cleared between runs or when navigating between workflows.
**How to avoid:** Clear execution state on: (1) starting a new run, (2) navigating away from the workflow, (3) loading a different workflow. Use React effect cleanup or route-change detection.
**Warning signs:** Nodes showing green/red borders when no execution is running.

### Pitfall 7: Cron Expression Validation Mismatch
**What goes wrong:** User enters a cron expression that cronstrue accepts but BullMQ rejects (or vice versa).
**Why it happens:** Different libraries support different cron syntax extensions (seconds field, L/W/# modifiers).
**How to avoid:** Use the same cron format on both client and server. BullMQ uses `cron-parser` internally which supports standard 5-field and optional seconds (6-field). cronstrue also supports both. Standardize on 5-field cron expressions for the visual builder and validate with the same library on both ends.
**Warning signs:** Schedule saves but never fires, or fires at wrong times.

## Code Examples

Verified patterns from official sources and existing codebase:

### Custom Workflow Node with Multiple Handles
```typescript
// Source: @xyflow/react docs + existing DependencyNode pattern
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/shared/lib/cn";

interface ConditionNodeData {
  label: string;
  expression: string;
  [key: string]: unknown;
}

function ConditionNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div
        className={cn(
          "flex w-[200px] flex-col gap-2 rounded-lg border-2 bg-card p-3 shadow-sm",
          selected ? "border-primary ring-2 ring-primary/20" : "border-amber-500",
        )}
      >
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-amber-500" />
          <span className="text-sm font-semibold">{nodeData.label}</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {nodeData.expression || "Click to configure"}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "30%" }}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "70%" }}
        className="!bg-red-500"
      />
    </>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
```

### Workflow Canvas Store (Zustand)
```typescript
// Source: Project pattern from config-draft-store.ts, adapted for workflow canvas
import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";

interface WorkflowCanvasStore {
  // Graph state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Metadata
  workflowId: string | null;
  workflowName: string;
  isDirty: boolean;

  // Undo/redo (snapshot-based per React Flow docs)
  past: Array<{ nodes: Node[]; edges: Edge[] }>;
  future: Array<{ nodes: Node[]; edges: Edge[] }>;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  deleteSelectedNodes: () => void;
  loadWorkflow: (id: string, name: string, nodes: Node[], edges: Edge[]) => void;
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
}
```

### BullMQ Cron Job Scheduling (Backend Pattern)
```typescript
// Source: BullMQ docs via Context7 + existing queue.ts pattern
import { Queue } from "bullmq";
import { createRedisConnection } from "@/shared/lib/redis";

// Workflow execution queue (uncomment existing placeholder in queue.ts)
export const workflowQueue = new Queue("workflow", {
  connection: createRedisConnection() as unknown as ConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 2000 },
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
});

// Upsert a cron schedule
await workflowQueue.upsertJobScheduler(
  `cron-${scheduleId}`,
  { pattern: "0 15 3 * * *" },          // cron expression
  {
    name: "execute-workflow",
    data: { workflowId, triggeredBy: "cron", scheduleId },
    opts: { attempts: 3 },
  },
);

// Remove a cron schedule
await workflowQueue.removeJobScheduler(`cron-${scheduleId}`);

// List all schedulers
const schedulers = await workflowQueue.getJobSchedulers();
```

### Cron Builder with Human-Readable Preview
```typescript
// Source: cronstrue npm + croner Context7 docs
import cronstrue from "cronstrue";
import { Cron } from "croner";

function CronPreview({ expression }: { expression: string }) {
  let description = "";
  let nextRuns: Date[] = [];
  let error: string | null = null;

  try {
    description = cronstrue.toString(expression);
    nextRuns = new Cron(expression).nextRuns(5);
  } catch (e) {
    error = e instanceof Error ? e.message : "Invalid expression";
  }

  if (error) return <p className="text-xs text-destructive">{error}</p>;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{description}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        {nextRuns.map((date, i) => (
          <p key={i}>{date.toLocaleString()}</p>
        ))}
      </div>
    </div>
  );
}
```

### API Hook with Mock Data (Project Pattern)
```typescript
// Source: Existing use-gateway-config.ts, use-agent-skills.ts patterns
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";

// Add to query-keys.ts:
// skills: { all, lists, list, detail, clawhub },
// plugins: { all, lists, detail, install },
// workflows: { all, lists, detail, runs, cron, webhooks },

const MOCK_WORKFLOWS: Workflow[] = [/* ... */];

async function fetchWorkflows(): Promise<Workflow[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_WORKFLOWS;
}

export function useWorkflows() {
  return useQuery({
    queryKey: queryKeys.workflows.lists(),
    queryFn: fetchWorkflows,
    staleTime: 30_000,
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| reactflow (old package name) | @xyflow/react (v12+) | 2024 | Import paths changed; `useReactFlow` is the primary hook; v12 uses `useNodesState`/`useEdgesState` |
| BullMQ `queue.add` with `repeat` option | BullMQ `queue.upsertJobScheduler` | BullMQ v5+ | Job schedulers are a separate concept from repeatable jobs; `upsertJobScheduler` is the recommended API for cron scheduling |
| react-flow-renderer (very old) | @xyflow/react | 2023 | Complete rename and rewrite; old package is deprecated |

**Deprecated/outdated:**
- `QueueScheduler` class in BullMQ: Removed in v4+. Schedulers are now built into the Queue/Worker. Do NOT import `QueueScheduler`.
- `reactflow` npm package: Renamed to `@xyflow/react`. The project already uses the correct package.
- `react.repeat.cron` in BullMQ: Use `repeat.pattern` (not `repeat.cron`) for the current API.

## Discretion Recommendations

### Node Visual Design and Color Coding
**Recommendation:** Use a consistent color scheme based on node category with a shared base card design.
- **Triggers:** Blue border (blue-500) -- represents input/start
- **Actions:** Purple border (purple-500) -- represents agent work
- **Control flow (condition/loop/parallel):** Amber border (amber-500) -- represents branching logic
- **I/O (HTTP, output, transform):** Slate border (slate-500) -- represents data movement
- **Special (approval gate, sub-workflow):** Indigo border (indigo-500) -- represents human/system interaction
- **Code node:** Emerald border (emerald-500) -- represents custom logic

All nodes share the same card structure: 200px wide, rounded-lg, border-2, bg-card, with icon + label header. Selected nodes get `ring-2 ring-primary/20`.

### Workflow List Page Layout (/workflows)
**Recommendation:** Card grid as primary view. Each card shows workflow name, trigger type badge, last run status, node count preview, and last edited timestamp. This is more visually informative than a table for workflows because users benefit from seeing at-a-glance status. Add a "Table view" toggle button for users who prefer density.

### ClawHub Category Taxonomy
**Recommendation:** Start with 6 pragmatic categories:
1. **Code** -- analysis, generation, refactoring, testing
2. **Communication** -- messaging, notifications, email drafting
3. **Data** -- transformation, parsing, extraction, search
4. **Productivity** -- scheduling, summarization, task management
5. **Integration** -- API connectors, platform bridges
6. **Security** -- scanning, compliance, audit

### Plugin Browser Layout
**Recommendation:** Grid of plugin cards (similar to ClawHub but focused on installed/available states). Cards show: icon, name, short description, version, install/installed badge, and a one-click action button (Install / Configure / Update). Use a SearchInput at top with category chips for filtering (same pattern as ClawHub).

### Canvas Zoom/Pan Controls and Minimap Placement
**Recommendation:** Follow the existing dependency-map.tsx pattern:
- `<Controls>` in bottom-left (React Flow default) with `showInteractive={false}` since we handle interactivity differently
- `<MiniMap>` in bottom-right with `className="!bg-muted/50"` (matches existing dark theme integration)
- `<Background>` with default dot pattern
- Add custom zoom controls in the top-right corner if needed (but React Flow's built-in controls are sufficient)

## Open Questions

1. **Workflow Persistence Format**
   - What we know: The canvas state is React Flow nodes/edges. We need a serializable format for saving/loading.
   - What's unclear: Whether to store the raw React Flow format or define a normalized schema that maps to/from it.
   - Recommendation: Define a `WorkflowDefinition` type that contains only the essential data (node types, positions, data configs, connections). Convert to/from React Flow format on load/save. This decouples storage from the UI library.

2. **Execution Engine Scope**
   - What we know: The UI needs to show live execution status. BullMQ handles scheduling on the backend.
   - What's unclear: How deep the workflow execution engine goes in this phase (UI-only mock execution vs. actual server-side step execution).
   - Recommendation: Phase 9 focuses on the UI. Use mock execution data pushed via WebSocket events for the live overlay. Actual server-side workflow execution can be a Phase 10+ concern. The UI infrastructure (stores, overlays, result pages) is built now regardless.

3. **Sub-workflow Node Implementation**
   - What we know: The palette includes a "Sub-workflow" node type.
   - What's unclear: Whether sub-workflows are just references (link to another workflow ID) or can be inlined.
   - Recommendation: Implement as a reference node that links to another workflow by ID. Show the referenced workflow name and a "View" link. Inline expansion is complex and can be deferred.

## Sources

### Primary (HIGH confidence)
- `/xyflow/web` (Context7) -- React Flow v12 drag-and-drop patterns, custom nodes, connection validation, undo/redo
- `/taskforcesh/bullmq` (Context7) -- Job schedulers, repeatable jobs with cron patterns, upsertJobScheduler API
- `/hexagon/croner` (Context7) -- Cron expression parsing, nextRun/nextRuns date calculation
- Existing codebase: `src/features/dashboard/components/dependency-map.tsx` -- React Flow read-only usage pattern
- Existing codebase: `src/features/channels/components/routing-graph.tsx` -- React Flow custom nodes with dagre
- Existing codebase: `src/features/gateway/model/config-draft-store.ts` -- Zustand draft-then-apply store pattern
- Existing codebase: `src/features/gateway/components/config-editor.tsx` -- Tab + form/JSON toggle pattern
- Existing codebase: `src/features/workspace/components/code-editor.tsx` -- CodeMirror SSR-safe dynamic import
- Existing codebase: `src/shared/lib/queue.ts` -- BullMQ queue setup with Redis connection pattern
- Existing codebase: `src/shared/lib/query-keys.ts` -- TanStack Query key factory pattern

### Secondary (MEDIUM confidence)
- [cronstrue npm](https://www.npmjs.com/package/cronstrue) -- v3.12.0, zero dependencies, 352+ dependents, human-readable cron descriptions
- [cronstrue GitHub](https://github.com/bradymholt/cRonstrue) -- API documentation, i18n support for 27 languages

### Tertiary (LOW confidence)
- None -- all findings verified against Context7 or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All core libraries already installed; only cronstrue + croner are new (both well-established, verified via npm + Context7)
- Architecture: HIGH -- Follows identical FSD patterns from 8 prior phases; React Flow interactive patterns verified via Context7 official examples
- Pitfalls: HIGH -- Verified against Context7 docs (nodeTypes outside component, ReactFlowProvider requirement), codebase patterns (SSR handling, exactOptionalPropertyTypes), and BullMQ API changes

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable libraries, no fast-moving dependencies)
