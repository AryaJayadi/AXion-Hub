# Phase 7: Gateway, Channels & Models - Research

**Researched:** 2026-02-18
**Domain:** Gateway configuration management, messaging channel connections/routing, LLM provider setup with failover and cost tracking
**Confidence:** HIGH

## Summary

Phase 7 builds the full management UI for three interconnected domains: gateway instances and configuration, messaging channel connections and routing, and LLM model providers with failover chains and usage tracking. The good news is that all foundational infrastructure already exists -- the `gateway-connection` feature provides the WebSocket Manager, Event Bus, Gateway Client, and connection store patterns. Phase 7 extends this with UI pages for configuration editing, channel management, and model provider setup.

The core technical challenge is the gateway config editor, which requires a draft-then-apply pattern (edit -> diff -> apply) with both form-based and raw JSON editing modes. The config covers ~9 sections of the openclaw.json file, each with distinct schemas. The channel pairing wizard needs platform-specific flows (QR code scanning for WhatsApp, OAuth for Slack/Discord, bot token for Telegram). The model provider section needs a reorderable failover chain builder and multi-dimension usage/cost charts.

All required libraries are already in the project's dependencies. No new npm packages are needed -- react-hook-form with zod for config forms, @dnd-kit for the failover chain reordering, @xyflow/react for the optional visual routing graph, recharts for cost/usage charts, and @tanstack/react-table for tabular views. The JSON diff for draft-then-apply can be built as a lightweight custom component rather than adding a dependency.

**Primary recommendation:** Follow the established FSD (Feature-Sliced Design) patterns exactly. Create three new feature directories (`gateway`, `channels`, `models`) with the same api/components/model/schemas structure used by agents and missions. Use mock data with TanStack Query hooks (staleTime: Infinity) matching the existing pattern, and extend the gateway-connection GatewayClient with new RPC methods for config, channel, and model operations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Gateway Config Editing
- Claude's discretion on config editor layout (tabbed sections vs accordion -- pick best fit for openclaw.json structure)
- Draft-then-apply pattern: users save config changes as a draft, review a diff of changes, then explicitly apply to the gateway
- Raw JSON toggle shows the full openclaw.json file, not just the current section
- Validation errors shown both inline per field AND in a summary validation panel with jump-to-field links

#### Channel Pairing & Routing
- Step-by-step wizard for channel pairing: pick platform -> authenticate/scan QR -> configure -> confirm
- WhatsApp QR scanning in a focused full-screen/centered modal with instructions and refresh timer
- Channel-to-agent routing shown as table by default, with toggle to visual connection graph view
- Group channel settings managed per-channel within each channel's config page (not a dedicated groups page)

#### Model Provider Setup
- Model catalog organized by provider with expandable sections (Anthropic, OpenAI, etc.), not a flat list
- Claude's discretion on failover chain builder approach (reorderable list vs visual pipeline)
- Usage/cost tracking with multi-dimension toggle: per-provider, per-model, and per-agent views
- "Test Connection" button on provider config form to verify API key before saving

#### Multi-Instance Management
- Gateway instances displayed as card grid showing name, status, uptime, connected agents
- Health shown as aggregate status badge (healthy/degraded/down) with expandable drill-down to component-level health (DB, Redis, WS, etc.)
- Claude's discretion on instance navigation (global selector vs click-into-detail pattern)
- Gateway nodes listed within instance detail page, not a separate dedicated page

### Claude's Discretion
- Config editor layout (tabbed vs accordion)
- Failover chain builder approach (reorderable list vs visual pipeline)
- Instance navigation pattern (global selector vs click-into-detail)
- Loading skeletons and empty states across all gateway/channel/model pages
- Error state handling for connection failures, invalid configs, etc.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GATE-01 | View gateway connection status, health, uptime, version at /gateway | Extend existing `GatewayHealth` type from gateway-client.ts; use existing `useServiceHealth` pattern; aggregate status badge with drill-down |
| GATE-02 | Edit openclaw.json with form editor and raw JSON toggle at /gateway/config | Tabbed react-hook-form sections + raw JSON textarea; draft-then-apply pattern with diff comparison |
| GATE-03 | Config editor covers all sections: identity, session, channels, models, compaction, memory, security, plugins | Zod schemas per section; tabbed layout with one tab per config section |
| GATE-04 | View/manage connected channels with status and pairing at /gateway/channels | DataTable listing channels with StatusBadge; link to /channels for full management |
| GATE-05 | View/manage connected nodes (macOS/iOS/Android) at /gateway/nodes | Node list within instance detail page (per user decision); DataTable with capabilities column |
| GATE-06 | Manage multiple gateway instances at /gateway/instances | Card grid layout with StatusBadge; click-into-detail navigation pattern; Zustand store for multi-instance state |
| CHAN-01 | View all connected channels with status at /channels | DataTable with channel type badges (WhatsApp/Telegram/Discord/Slack); existing pattern from agent-channels-table.tsx |
| CHAN-02 | Configure individual channels at /channels/[channel] | Per-channel config form with react-hook-form; group settings inline per user decision |
| CHAN-03 | Edit channel-to-agent routing at /channels/routing | Default table view + toggle to @xyflow/react visual graph (existing dependency-map.tsx pattern) |
| CHAN-04 | Pair channels via QR code/pairing flow at /channels/pairing | Step wizard (existing wizard-shell.tsx pattern); WhatsApp QR in centered Dialog modal with timer |
| CHAN-05 | Manage group allowlists, mention patterns, broadcast groups at /channels/groups | Per-channel group settings within channel config page; useFieldArray for allowlist/pattern management |
| MODL-01 | View providers with auth status and model list at /models | Provider cards with expandable sections per user decision; Collapsible component for model lists |
| MODL-02 | Configure per-provider settings at /models/[provider] | react-hook-form with API key masking, "Test Connection" button, OAuth flow handling |
| MODL-03 | Browse model catalog with specs at /models/catalog | Organized by provider with expandable sections; Collapsible + search/filter |
| MODL-04 | Configure failover chains at /models/failover | Reorderable list using @dnd-kit/sortable (recommended over visual pipeline -- simpler, clearer UX) |
| MODL-05 | View usage/cost charts per agent/model/period at /models/usage | Recharts AreaChart + BarChart with dimension toggle tabs; extend existing cost-summary-widget pattern |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.1 | Config editor forms, channel config, provider settings | Already used in agent wizard; zod resolver for validation |
| @hookform/resolvers | ^5.2.2 | Zod schema validation adapter | Already used in agent wizard schemas |
| zod | ^4.3.6 | Config schema validation, form validation | Already used throughout codebase for gateway frame parsing |
| @tanstack/react-query | ^5.90.21 | Data fetching for config, channels, models | Already used in all feature hooks (useAgents, useCostSummary, etc.) |
| @tanstack/react-table | ^8.21.3 | Channel routing table, node tables, provider tables | Already used in DataTable shared component |
| zustand | ^5.0.11 | Gateway config draft state, channel store, model store | Already used in connection-store, agent-store, dashboard-store |
| @dnd-kit/core | ^6.3.1 | Failover chain drag-and-drop | Already used in kanban-board.tsx |
| @dnd-kit/sortable | ^10.0.0 | Reorderable failover chain list | Already installed; used with verticalListSortingStrategy |
| @xyflow/react | ^12.10.0 | Visual channel-to-agent routing graph (toggle view) | Already used in dependency-map.tsx |
| @dagrejs/dagre | ^2.0.4 | Auto-layout for routing graph | Already used in dagre-layout.ts |
| recharts | 2.15.4 | Cost/usage charts for model usage tracking | Already used in cost-summary-widget.tsx |
| @number-flow/react | ^0.5.12 | Animated number displays for usage stats | Already used in cost-summary-widget.tsx |
| lucide-react | ^0.574.0 | Icons for all UI components | Already used everywhere |
| framer-motion | ^12.34.1 | Transitions, expandable sections | Already installed |
| immer | ^11.1.4 | Immutable state updates in Zustand stores | Already installed |
| sonner | ^2.0.7 | Toast notifications for config apply, connection test results | Already installed |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^4.1.0 | Format uptime, timestamps | Used for relative time displays |
| nanoid | ^5.1.6 | Generate draft IDs, request IDs | Already used in gateway-client.ts |
| use-debounce | ^10.1.0 | Debounce config changes, search inputs | Already used in agent-identity-editor.tsx |
| cmdk | ^1.1.1 | Command palette for model search | Already installed |
| nuqs | ^2.8.8 | URL query state for tab persistence | Already installed |

### No New Dependencies Needed
All required functionality is covered by the existing dependency set. The JSON diff view for the draft-then-apply pattern can be built as a lightweight custom component using simple deep comparison and rendering of changed/added/removed keys -- this avoids adding a heavy diff library for a single use case.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom JSON diff | react-diff-viewer-continued | Adds ~50KB dependency for one view; custom is simpler for structured JSON comparison |
| @uiw/react-md-editor for JSON | Monaco Editor (@monaco-editor/react) | Monaco is 5MB+ bundle; overkill for JSON-only editing; a styled `<textarea>` with syntax highlighting is sufficient |
| @dnd-kit for failover chains | react-beautiful-dnd | react-beautiful-dnd is deprecated/unmaintained; @dnd-kit is already installed and proven in kanban |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── gateway-event/           # EXISTING - frame types, parser
│   ├── gateway-config/          # NEW - config section types, validation schemas
│   ├── channel/                 # NEW - channel types (WhatsApp, Telegram, etc.)
│   └── model-provider/          # NEW - provider types, model specs, failover chain types
├── features/
│   ├── gateway-connection/      # EXISTING - WS manager, event bus, client, store
│   ├── gateway/                 # NEW - config editor, instance management, health views
│   │   ├── api/                 # TanStack Query hooks (use-gateway-config.ts, use-gateway-instances.ts, etc.)
│   │   ├── components/          # Config form sections, instance cards, health drill-down, diff viewer
│   │   ├── model/               # Zustand stores (config-draft-store.ts, instance-store.ts)
│   │   └── schemas/             # Zod schemas for each config section
│   ├── channels/                # NEW - channel management, pairing wizard, routing
│   │   ├── api/                 # TanStack Query hooks (use-channels.ts, use-channel-routing.ts)
│   │   ├── components/          # Channel list, config forms, QR modal, routing table/graph
│   │   ├── model/               # Zustand stores (channel-store.ts, pairing-store.ts)
│   │   └── schemas/             # Zod schemas for channel config
│   └── models/                  # NEW - provider management, catalog, failover, usage
│       ├── api/                 # TanStack Query hooks (use-providers.ts, use-model-catalog.ts, use-model-usage.ts)
│       ├── components/          # Provider cards, config forms, failover builder, usage charts
│       ├── model/               # Zustand stores (provider-store.ts, failover-store.ts)
│       └── schemas/             # Zod schemas for provider config
├── views/
│   ├── gateway/                 # NEW - gateway-overview-view, gateway-config-view, gateway-instances-view
│   ├── channels/                # NEW - channels-list-view, channel-detail-view, channel-routing-view, channel-pairing-view
│   └── models/                  # NEW - models-overview-view, provider-detail-view, model-catalog-view, failover-view, usage-view
└── widgets/
    └── (no new widgets needed -- existing app-shell and page-header cover layout)
```

### Pattern 1: Draft-Then-Apply Config Editing
**What:** Users edit config in a draft state, review a diff of changes, then explicitly apply to the gateway. This prevents accidental config corruption.
**When to use:** Any time the gateway config is being modified (GATE-02, GATE-03).

```typescript
// src/features/gateway/model/config-draft-store.ts
interface ConfigDraftStore {
  // Original config from gateway (read-only reference)
  originalConfig: OpenClawConfig | null;
  // Draft being edited (mutable copy)
  draftConfig: OpenClawConfig | null;
  // Track which fields have been modified
  dirtyFields: Set<string>;
  // Validation errors from Zod
  validationErrors: ValidationError[];
  // Draft lifecycle
  isDirty: boolean;
  isApplying: boolean;

  // Actions
  loadConfig: (config: OpenClawConfig) => void;
  updateField: (path: string, value: unknown) => void;
  resetDraft: () => void;
  getDiff: () => ConfigDiff[];
  applyDraft: () => Promise<void>;
}
```

**Diff computation approach (no external dependency):**
```typescript
// src/features/gateway/lib/config-diff.ts
interface ConfigDiff {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: unknown;
  newValue?: unknown;
}

function computeConfigDiff(original: Record<string, unknown>, draft: Record<string, unknown>): ConfigDiff[] {
  const diffs: ConfigDiff[] = [];
  // Deep recursive comparison of two objects
  // Returns array of path-based changes
  function compare(path: string, a: unknown, b: unknown) {
    if (a === b) return;
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const allKeys = new Set([...Object.keys(a as Record<string, unknown>), ...Object.keys(b as Record<string, unknown>)]);
      for (const key of allKeys) {
        compare(`${path}.${key}`, (a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
      }
    } else {
      diffs.push({ path, type: a === undefined ? 'added' : b === undefined ? 'removed' : 'changed', oldValue: a, newValue: b });
    }
  }
  compare('', original, draft);
  return diffs;
}
```

### Pattern 2: Tabbed Config Section Editor (Recommended over Accordion)
**What:** Config editor uses tabs for top-level sections of openclaw.json, with each tab containing a form for that section.
**Why tabs over accordion:** The openclaw.json has ~9 distinct sections that are conceptually independent (identity, sessions, channels, models, compaction, memory, security, plugins, gateway). Tabs provide clear navigation and keep only one section visible at a time, reducing cognitive load. Accordion would create a very long scrolling page.

```typescript
// Config sections mapped to tabs
const CONFIG_SECTIONS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'sessions', label: 'Sessions', icon: Clock },
  { id: 'channels', label: 'Channels', icon: Globe },
  { id: 'models', label: 'Model Providers', icon: Brain },
  { id: 'compaction', label: 'Compaction', icon: Minimize },
  { id: 'memory', label: 'Memory Search', icon: Search },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'plugins', label: 'Plugins', icon: Plug },
  { id: 'gateway', label: 'Gateway', icon: Radio },
] as const;
```

### Pattern 3: Mock Data with Gateway Client Extension
**What:** Extend the existing GatewayClient with new RPC methods, backed by mock data during development.
**When to use:** Every new data-fetching hook in this phase.

```typescript
// src/features/gateway/api/use-gateway-config.ts
// Follow exact pattern from use-agents.ts and use-service-health.ts

const MOCK_CONFIG: OpenClawConfig = {
  identity: { botName: 'AXion', persona: 'Professional assistant' },
  sessions: { maxDuration: 3600, compactionThreshold: 100000 },
  // ... all sections
};

async function fetchGatewayConfig(): Promise<OpenClawConfig> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_CONFIG;
}

export function useGatewayConfig() {
  return useQuery({
    queryKey: queryKeys.gateway.config(),
    queryFn: fetchGatewayConfig,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });
}
```

### Pattern 4: Channel Pairing Wizard (Following Agent Wizard Pattern)
**What:** Step-by-step wizard for connecting new channels, following the existing agent creation wizard pattern from `wizard-shell.tsx`.
**When to use:** CHAN-04 - channel pairing flow.

```typescript
const PAIRING_STEPS = [
  { label: 'Platform', index: 0 },
  { label: 'Authenticate', index: 1 },  // Platform-specific: QR for WhatsApp, OAuth for Slack
  { label: 'Configure', index: 2 },
  { label: 'Confirm', index: 3 },
] as const;

// Zustand store for pairing wizard state
interface PairingStore {
  currentStep: number;
  platform: ChannelPlatform | null;
  authData: AuthData | null;
  config: ChannelConfig | null;
  setStep: (step: number) => void;
  setPlatform: (platform: ChannelPlatform) => void;
  // ...
}
```

### Pattern 5: Reorderable Failover Chain (Recommended over Visual Pipeline)
**What:** Use @dnd-kit/sortable for the failover chain builder as a vertical reorderable list.
**Why reorderable list over visual pipeline:** Failover chains are inherently linear (model A -> fallback to B -> fallback to C). A visual pipeline with nodes and edges (xyflow) adds unnecessary complexity for what is fundamentally a priority-ordered list. The reorderable list is clearer, more accessible, and already proven in the kanban implementation.

```typescript
// Failover chain as sortable list
interface FailoverChain {
  id: string;
  name: string;
  models: FailoverModel[];  // Ordered by priority
}

interface FailoverModel {
  id: string;
  providerId: string;
  modelId: string;
  maxRetries: number;
  timeoutMs: number;
}

// Using @dnd-kit/sortable - same pattern as kanban-board.tsx
// DndContext > SortableContext with verticalListSortingStrategy > SortableItem
```

### Pattern 6: Click-Into-Detail Instance Navigation (Recommended over Global Selector)
**What:** Gateway instances displayed as a card grid at /gateway/instances, clicking a card navigates to /gateway/instances/[instanceId] detail page.
**Why click-into-detail over global selector:** A global selector (dropdown in header) implies the selected instance affects all other pages, creating confusing scope. Click-into-detail keeps navigation explicit -- the user sees all instances, clicks one, sees its details. This matches the agent detail navigation pattern already in use.

### Pattern 7: Multi-Dimension Usage Charts with Tab Toggle
**What:** Usage/cost data displayed in charts with tabs to switch between per-provider, per-model, and per-agent views.
**When to use:** MODL-05 - usage tracking page.

```typescript
// Extends the existing cost-summary-widget.tsx pattern
type UsageDimension = 'provider' | 'model' | 'agent';

// Each dimension shows the same chart types but grouped differently
// - AreaChart for usage over time
// - BarChart for comparative cost breakdown
// - DataTable for detailed sortable data
```

### Anti-Patterns to Avoid
- **Importing raw gateway types in UI code:** Always go through the GatewayClient abstraction layer. UI components never import from `@/entities/gateway-event` directly.
- **Storing config in TanStack Query cache for editing:** Use a Zustand store for the draft config. TanStack Query is for the read-only original config only. Editing in the query cache causes stale data issues.
- **Building a full Monaco editor for JSON viewing:** The raw JSON toggle only needs a monospace `<textarea>` or a `<pre>` block with basic syntax highlighting. Monaco adds 5MB+ to the bundle for no proportional benefit.
- **Creating a separate /channels/groups page:** Per user decision, group settings are managed per-channel within each channel's config page.
- **Using xyflow for the failover chain:** Failover chains are linear, not graphs. A reorderable list is simpler and clearer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | react-hook-form + zod resolver | Already in codebase; handles async validation, field arrays, nested objects |
| Drag-and-drop reordering | Custom drag handlers | @dnd-kit/sortable with verticalListSortingStrategy | Already in codebase; handles keyboard accessibility, touch, animation |
| Data tables with sorting/filtering | Custom table components | @tanstack/react-table via shared DataTable | Already in codebase; virtual scrolling, pagination, column visibility |
| Chart rendering | Custom SVG charts | recharts via shared ChartContainer | Already in codebase; responsive, tooltips, legends |
| Graph visualization | Custom canvas rendering | @xyflow/react with dagre layout | Already in codebase; zoom, pan, minimap, custom nodes |
| Status indicators | Custom badge components | shared StatusBadge component | Already handles healthy/degraded/down/connected/offline mappings |
| Loading states | Custom skeleton loaders | shared LoadingSkeleton, SkeletonTable, SkeletonCard | Already in codebase with shimmer animation |
| Empty states | Custom empty views | shared EmptyState component | Already in codebase with consistent styling |
| Toast notifications | Custom notification system | sonner toast | Already installed; used for success/error feedback |
| Animated numbers | Custom counter animation | @number-flow/react NumberFlow | Already in cost-summary-widget.tsx |
| URL state management | Custom URL parsing | nuqs useQueryState | Already installed; type-safe URL search params |

**Key insight:** Phase 7 is a UI-heavy phase with no genuinely novel technical problems. Every pattern needed has been implemented in a prior phase. The value is in assembling existing patterns into new domain-specific views with correct mock data, not in inventing new approaches.

## Common Pitfalls

### Pitfall 1: Config Draft State Desync
**What goes wrong:** The draft config in the Zustand store gets out of sync with the form state in react-hook-form, causing "phantom changes" or lost edits.
**Why it happens:** Two sources of truth (RHF internal state and Zustand draft store) managing the same data.
**How to avoid:** Use Zustand as the single source of truth. The RHF form reads from and writes to the Zustand store via `watch()` and `setValue()`, or use RHF as the source of truth for the active tab and only sync to Zustand on tab change.
**Warning signs:** User sees stale values after switching tabs; diff shows changes the user didn't make.

### Pitfall 2: Raw JSON Toggle Overwriting Form Edits
**What goes wrong:** User edits fields in the form editor, switches to raw JSON, edits there, switches back -- form and JSON are now inconsistent.
**Why it happens:** Two editing modes need bidirectional sync.
**How to avoid:** When switching from form to JSON mode, serialize the current form state to JSON. When switching back, parse the JSON and populate the form. If JSON is invalid, show a validation error and prevent the switch. Always treat the most-recently-edited mode as authoritative.
**Warning signs:** Values in form don't match what was entered in JSON mode.

### Pitfall 3: QR Code Modal State Leaks
**What goes wrong:** WhatsApp QR code refresh timer continues running after the modal is closed, or the pairing state persists after navigating away.
**Why it happens:** Timer cleanup not tied to component lifecycle; wizard state not reset on unmount.
**How to avoid:** Use `useEffect` cleanup for QR refresh timer. Reset the pairing store on wizard unmount. Use React's `key` prop to force remount when re-opening.
**Warning signs:** Console warnings about state updates on unmounted components; stale QR codes showing.

### Pitfall 4: Failover Chain Empty State Confusion
**What goes wrong:** User creates a failover chain with zero models, or removes all models from an existing chain, leading to a broken config.
**Why it happens:** No minimum validation on the model list.
**How to avoid:** Enforce `minLength: 1` on the failover chain's model array in the Zod schema. Show a clear empty state with "Add at least one model" guidance.
**Warning signs:** Failover chain saved with empty models array; gateway receives invalid config.

### Pitfall 5: Route Mismatch Between Nav Config and App Router
**What goes wrong:** Navigation sidebar shows /gateway, /channels, /models links but no corresponding page.tsx files exist, leading to 404s.
**Why it happens:** Navigation config (`navigation.ts`) already has "Gateway" at `/gateway` and "Channels" at `/channels` -- but no app router pages exist yet.
**How to avoid:** Create all app/(dashboard)/gateway/*, app/(dashboard)/channels/*, and app/(dashboard)/models/* page.tsx files as the first task. Verify each route renders before building features on top.
**Warning signs:** 404 errors when clicking sidebar navigation; blank pages.

### Pitfall 6: Overloading the GatewayClient Class
**What goes wrong:** GatewayClient becomes a god object with 30+ methods.
**Why it happens:** All new gateway RPC calls (config.get, config.set, channels.list, channels.pair, models.list, etc.) get added to the single GatewayClient class.
**How to avoid:** GatewayClient already has the pattern of domain-grouped methods (agent operations, health, config, sessions). Continue this pattern but consider whether config/channel/model operations warrant sub-clients or keep them as method groups within the same class. For now, extending the existing class with grouped methods is fine -- refactoring to sub-clients is a future concern.
**Warning signs:** GatewayClient file exceeds 500 lines; methods have unrelated concerns mixed together.

## Code Examples

Verified patterns from the existing codebase:

### Gateway Config Section Form (Following Agent Wizard Pattern)
```typescript
// src/features/gateway/components/config-section-identity.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identityConfigSchema, type IdentityConfig } from "../schemas/config-schemas";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

interface ConfigSectionIdentityProps {
  values: IdentityConfig;
  onUpdate: (values: IdentityConfig) => void;
}

export function ConfigSectionIdentity({ values, onUpdate }: ConfigSectionIdentityProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<IdentityConfig>({
    resolver: zodResolver(identityConfigSchema),
    defaultValues: values,
  });

  return (
    <form onChange={handleSubmit(onUpdate)} className="space-y-4">
      <FormField label="Bot Name" error={errors.botName?.message} required>
        <Input {...register("botName")} />
      </FormField>
      <FormField label="Persona" description="How the agent presents itself" error={errors.persona?.message}>
        <Textarea {...register("persona")} />
      </FormField>
    </form>
  );
}
```

### Config Diff Viewer Component
```typescript
// src/features/gateway/components/config-diff-viewer.tsx
"use client";

import type { ConfigDiff } from "../lib/config-diff";
import { cn } from "@/shared/lib/cn";

interface ConfigDiffViewerProps {
  diffs: ConfigDiff[];
}

export function ConfigDiffViewer({ diffs }: ConfigDiffViewerProps) {
  if (diffs.length === 0) {
    return <p className="text-sm text-muted-foreground">No changes detected.</p>;
  }

  return (
    <div className="rounded-lg border divide-y text-sm font-mono">
      {diffs.map((diff) => (
        <div key={diff.path} className={cn(
          "px-3 py-2",
          diff.type === 'added' && "bg-green-500/10",
          diff.type === 'removed' && "bg-red-500/10",
          diff.type === 'changed' && "bg-yellow-500/10",
        )}>
          <span className="text-muted-foreground">{diff.path}</span>
          {diff.type === 'changed' && (
            <>
              <span className="text-destructive line-through ml-2">{JSON.stringify(diff.oldValue)}</span>
              <span className="text-green-600 ml-2">{JSON.stringify(diff.newValue)}</span>
            </>
          )}
          {diff.type === 'added' && <span className="text-green-600 ml-2">+ {JSON.stringify(diff.newValue)}</span>}
          {diff.type === 'removed' && <span className="text-destructive ml-2">- {JSON.stringify(diff.oldValue)}</span>}
        </div>
      ))}
    </div>
  );
}
```

### Sortable Failover Chain Item
```typescript
// src/features/models/components/failover-chain-item.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

interface FailoverChainItemProps {
  id: string;
  provider: string;
  model: string;
  index: number;
  onRemove: () => void;
}

export function FailoverChainItem({ id, provider, model, index, onRemove }: FailoverChainItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
    >
      <button type="button" className="cursor-grab text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="size-4" />
      </button>
      <span className="text-xs font-medium text-muted-foreground w-6">{index + 1}.</span>
      <div className="flex-1">
        <span className="font-medium">{model}</span>
        <span className="ml-2 text-xs text-muted-foreground">({provider})</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
```

### Channel Routing Table (Default View)
```typescript
// Follows exact DataTable pattern from agent-channels-table.tsx
// Default table view with columns: Channel, Type, Agent, Rule, Status
// Toggle button switches to xyflow graph view (same as dependency-map.tsx pattern)
```

### Mock Data Pattern for Gateway Instances
```typescript
// src/features/gateway/api/use-gateway-instances.ts
const MOCK_INSTANCES: GatewayInstance[] = [
  {
    id: "gw-001",
    name: "Production Gateway",
    status: "healthy",
    uptime: 2592000, // 30 days
    version: "1.4.2",
    connectedAgents: 5,
    components: {
      database: { status: "healthy", latency: 3 },
      redis: { status: "healthy", latency: 1 },
      websocket: { status: "healthy", connections: 12 },
    },
  },
  {
    id: "gw-002",
    name: "Staging Gateway",
    status: "degraded",
    uptime: 86400,
    version: "1.4.3-beta",
    connectedAgents: 2,
    components: {
      database: { status: "healthy", latency: 5 },
      redis: { status: "degraded", latency: 45 },
      websocket: { status: "healthy", connections: 3 },
    },
  },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd for reordering | @dnd-kit/sortable | 2023 | react-beautiful-dnd deprecated; @dnd-kit is actively maintained, already in project |
| Socket.IO for gateway WS | Raw WebSocket with custom JSON-RPC | Project decision | Gateway uses custom protocol, not Socket.IO; already implemented in ws-manager.ts |
| Class-based form validation | Zod v4 schema validation | zod v4 (2025) | Project uses zod/v4 import path; schemas are composable and type-safe |
| REST API for config management | WebSocket RPC (config.get, config.set) | Project architecture | All gateway communication goes through the WebSocket Manager |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated since 2023, do not use. @dnd-kit replaces it.
- formik: Superseded by react-hook-form in this project's stack.

## Route Planning

### Required App Router Pages
Based on success criteria and requirements, these page.tsx files need to be created:

```
app/(dashboard)/
├── gateway/
│   ├── page.tsx                    # GATE-01: Gateway overview (health, status, uptime)
│   ├── config/
│   │   └── page.tsx                # GATE-02, GATE-03: Config editor
│   ├── channels/
│   │   └── page.tsx                # GATE-04: Connected channels (gateway view)
│   ├── nodes/
│   │   └── page.tsx                # GATE-05: Connected nodes
│   └── instances/
│       ├── page.tsx                # GATE-06: Instance card grid
│       └── [instanceId]/
│           └── page.tsx            # Instance detail with node list
├── channels/
│   ├── page.tsx                    # CHAN-01: All channels list
│   ├── [channel]/
│   │   └── page.tsx                # CHAN-02 + CHAN-05: Channel config + group settings
│   ├── routing/
│   │   └── page.tsx                # CHAN-03: Channel-to-agent routing
│   ├── pairing/
│   │   └── page.tsx                # CHAN-04: Channel pairing wizard
│   └── groups/
│       └── page.tsx                # CHAN-05: Redirect/link to per-channel group settings
└── models/
    ├── page.tsx                    # MODL-01: Provider overview
    ├── [provider]/
    │   └── page.tsx                # MODL-02: Provider detail/config
    ├── catalog/
    │   └── page.tsx                # MODL-03: Model catalog
    ├── failover/
    │   └── page.tsx                # MODL-04: Failover chain builder
    └── usage/
        └── page.tsx                # MODL-05: Usage/cost charts
```

**Note on /channels/groups:** Per user decision, group settings are managed per-channel within `/channels/[channel]`. The /channels/groups page can be a simple redirect or an overview linking to each channel's group settings.

### Required Query Keys Extension
```typescript
// Add to src/shared/lib/query-keys.ts
gateway: {
  all: ["gateway"] as const,
  health: () => [...queryKeys.gateway.all, "health"] as const,
  config: () => [...queryKeys.gateway.all, "config"] as const,
  instances: () => [...queryKeys.gateway.all, "instances"] as const,
  instance: (id: string) => [...queryKeys.gateway.all, "instance", id] as const,
  nodes: (instanceId: string) => [...queryKeys.gateway.all, "nodes", instanceId] as const,
},
channels: {
  all: ["channels"] as const,
  lists: () => [...queryKeys.channels.all, "list"] as const,
  detail: (id: string) => [...queryKeys.channels.all, "detail", id] as const,
  routing: () => [...queryKeys.channels.all, "routing"] as const,
},
models: {
  all: ["models"] as const,
  providers: () => [...queryKeys.models.all, "providers"] as const,
  provider: (id: string) => [...queryKeys.models.all, "provider", id] as const,
  catalog: () => [...queryKeys.models.all, "catalog"] as const,
  failover: () => [...queryKeys.models.all, "failover"] as const,
  usage: (dimension: string, period: string) => [...queryKeys.models.all, "usage", dimension, period] as const,
},
```

## Open Questions

1. **OpenClaw Config Schema Completeness**
   - What we know: The config has sections for identity, sessions, channels, models, compaction, memory search, security, and plugins. The existing GatewayClient has a basic `GatewayConfig` type with `gatewayPort`, `dataDir`, `logLevel`.
   - What's unclear: The full schema of each section in openclaw.json. We have section names but not the complete field definitions for every section.
   - Recommendation: Define comprehensive Zod schemas based on reasonable defaults for each section. When the gateway API is wired, the schemas can be refined. Use `.passthrough()` on schemas to tolerate unknown fields from the gateway.

2. **Gateway RPC Methods for Config Write Operations**
   - What we know: The gateway protocol has `config.get` (already in GatewayClient). We need `config.set` or `config.update` for the apply operation.
   - What's unclear: Whether the gateway accepts partial updates or requires the full config object.
   - Recommendation: Implement `applyConfig` in the GatewayClient as sending the full config object (config.set). This is safer and simpler -- the draft-then-apply pattern means we always have the full config available.

3. **Channel Pairing Protocol Specifics**
   - What we know: WhatsApp needs QR code scanning; other platforms use OAuth or bot tokens.
   - What's unclear: The exact gateway RPC methods for initiating and completing channel pairing.
   - Recommendation: Mock the pairing flow with realistic state transitions (generating -> scanned -> connected). Define the RPC interface (channels.pair.init, channels.pair.status, channels.pair.confirm) and implement with mock responses.

## Sources

### Primary (HIGH confidence)
- Codebase analysis of `/home/arya/projects/AXion-Hub/src/features/gateway-connection/` -- full WebSocket Manager, Event Bus, Gateway Client, connection store patterns
- Codebase analysis of existing feature patterns (agents, dashboard, missions) -- FSD structure, mock data, TanStack Query hooks, Zustand stores
- Context7 `/react-hook-form/documentation` -- useFieldArray with nested fields, Zod resolver integration
- Context7 `/websites/dndkit` -- useSortable hook, verticalListSortingStrategy, SortableContext patterns
- Context7 `/recharts/recharts` -- AreaChart, BarChart, ComposedChart, custom tooltips, dual axes

### Secondary (MEDIUM confidence)
- Navigation config analysis (`navigation.ts`) -- Gateway and Channels routes already defined in sidebar
- Existing component patterns (StatusBadge, DataTable, EmptyState, LoadingSkeleton, FormField) -- verified in shared/ui/
- Agent channels table (`agent-channels-table.tsx`) -- mock channel data pattern with type badges

### Tertiary (LOW confidence)
- OpenClaw config schema completeness -- inferred from section names in requirements; full schema not verified against gateway source
- Gateway RPC method names for config/channel/model operations -- assumed based on existing naming patterns (config.get -> config.set, channels.list, etc.)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in prior phases; no new dependencies needed
- Architecture: HIGH -- follows established FSD patterns, extends existing gateway-connection foundation
- Pitfalls: HIGH -- identified from actual codebase patterns and common form/config editing issues
- Config schema: MEDIUM -- section names known but full field definitions inferred
- Gateway RPC protocol: MEDIUM -- method naming inferred from existing patterns; not verified against gateway API docs

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable -- no fast-moving external dependencies)
