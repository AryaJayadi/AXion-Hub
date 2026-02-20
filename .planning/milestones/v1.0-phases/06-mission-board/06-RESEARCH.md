# Phase 6: Mission Board - Research

**Researched:** 2026-02-18
**Domain:** Kanban drag-and-drop task management with real-time agent integration
**Confidence:** HIGH

## Summary

Phase 6 adds a full Kanban mission board at `/missions` with drag-and-drop card management, task creation, detail views with deliverables and sign-off gates, comments with @mentions, and multi-board organization. The board integrates bidirectionally with agents via the existing gateway/EventBus infrastructure established in prior phases.

The core technical challenge is drag-and-drop across a 6-column pipeline with optimistic UI updates, combined with real-time agent status events that can auto-transition cards. The project already uses shadcn/ui + Tailwind v4, Zustand for push state, TanStack Query for pull state, framer-motion for animations, and react-hook-form + Zod v4 for forms -- all of which carry forward. The primary new dependency is a drag-and-drop library.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` (stable v6.3.1/v10.0.0) for drag-and-drop. These are the production-proven packages with full multi-container Kanban support, strong keyboard accessibility, and extensive community examples combining with shadcn/ui + Tailwind. Avoid the new `@dnd-kit/react` (v0.3.x pre-release) -- it is not yet stable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Board layout & card design
- Standard card density: title, priority badge, assigned agent(s), due date, and tag chips. Full detail on click.
- Priority shown via color-coded left border stripe (red=critical, orange=high, blue=medium, gray=low)
- Multiple assigned agents shown as stacked overlapping avatars (up to 3, then +N)
- Pulsing glow on cards when assigned agent is actively working on that task (matches Phase 3 agent card glow pattern)

#### Drag-and-drop & task flow
- Full 6-column pipeline: INBOX -> QUEUED -> IN PROGRESS -> IN REVIEW -> DONE -> ARCHIVED
- Auto-transitions from agent activity: agent starts working -> IN PROGRESS, submits deliverable -> IN REVIEW
- Semantic drag actions: dragging to IN PROGRESS dispatches task to assigned agent, dragging to ARCHIVED triggers cleanup
- Default sort by priority (critical on top) within each column, but users can manually drag to reorder (manual order overrides auto-sort until reset)

#### Task detail & deliverables
- Dual access: slide-over panel by default when clicking from board, full page at /missions/[taskId] via expand button or direct URL
- Deliverables shown as inline preview cards with thumbnails (images, code snippets, PDFs). Click to expand full view.
- Sign-off gate uses a focused review modal: shows deliverables side-by-side with approve/reject/request revision buttons and required comment for rejection/revision
- Activity timeline is layered: high-level events by default (status changes, comments, deliverable uploads, assignment changes) with a toggle to expand agent-level detail (tool calls, reasoning steps) for any event

#### Agent integration
- Agents interact with the board bidirectionally via the gateway: receive dispatched tasks and push status updates
- 6 core columns have fixed semantic roles agents understand (inbox, queued, working, review, done, archived)
- Users can add optional human-only columns between core columns (e.g., "DESIGN REVIEW" between REVIEW and DONE) -- agents skip these
- Agent-to-agent delegation creates separate linked cards on the board (not subtasks), with a relationship indicator to the parent task

#### Board organization
- Every org gets an auto-created "General" board by default -- can be renamed, additional boards created
- Board navigation via sidebar list (scales to many boards, like Notion's page tree)
- Board settings allow renaming, member access, and adding human-only columns between core columns

### Claude's Discretion
- Exact card hover/focus interactions
- Empty column placeholder design
- Board settings UI layout
- Automation rules configuration UX
- Exact animation timing for drag-and-drop transitions
- Column width and responsive breakpoints
- Comment thread UX within task detail

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TASK-01 | Drag-and-drop Kanban board at /missions with columns INBOX through ARCHIVED | dnd-kit multi-container sortable pattern; Zustand board store with column state; optimistic reorder via `arrayMove` |
| TASK-02 | Full task detail at /missions/[taskId] with all fields (title, markdown description, priority, assigned agents, reviewer, skills/tags, subtasks) | Sheet component for slide-over, dedicated page route for full view; react-hook-form + Zod v4 for editing; @uiw/react-md-editor for markdown |
| TASK-03 | Task creation form/modal at /missions/new | Dialog component + react-hook-form + Zod v4 schemas; mutation hook with optimistic insert |
| TASK-04 | Activity timeline with status changes, comments, agent output, dispatch log | Zustand activity array per task; EventBus subscriptions for real-time events; collapsible detail sections with framer-motion AnimatePresence |
| TASK-05 | Deliverables with preview (files, code artifacts, links) | Inline preview cards using existing Card component; thumbnail generation for images; code snippet rendering with existing streamdown |
| TASK-06 | Sign-off gate toggle with human approval before DONE | Review modal using Dialog with approve/reject/revision actions; required comment textarea for rejection; gate state in task store |
| TASK-07 | Comments with @agent and @human mentions | Mention popover using same pattern as SlashCommandPopover; cmdk for search filtering; notification events via EventBus |
| TASK-08 | Board organization by project/team at /missions/boards | Board list in sidebar; Zustand board store; TanStack Query for initial board list load |
| TASK-09 | Board settings at /missions/boards/[boardId]/settings with custom columns and automation rules | Settings form with react-hook-form; column management UI for human-only columns; automation rule builder |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop context, sensors, collision detection | Production-stable, extensible DnD framework with keyboard accessibility. Used in canonical shadcn+Tailwind Kanban implementations |
| @dnd-kit/sortable | ^10.0.0 | Sortable presets for reordering within/across columns | Multi-container sortable pattern is the standard approach for Kanban boards with dnd-kit |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities for smooth drag animations | Required companion for sortable transform styles |
| @dnd-kit/modifiers | ^9.0.0 | Restrict drag axis, snap to grid | Constrain drag behavior for polished UX |
| zustand | ^5.0.11 | Board/task PUSH state (real-time updates from agents) | Already in project. Board store follows same pattern as agent-store, chat-store, dashboard-store |
| @tanstack/react-query | ^5.90.21 | Initial board/task data loading (PULL state) | Already in project. Same fetch-then-sync-to-Zustand pattern used throughout |
| react-hook-form | ^7.71.1 | Task creation/edit forms | Already in project. Used in wizard steps and auth forms |
| zod | ^4.3.6 | Task/board schema validation | Already in project (imported as `zod/v4`). Used with @hookform/resolvers |
| framer-motion | ^12.34.1 | Card enter/exit animations, column transitions | Already in project. Used in chat tool-call-pipeline for AnimatePresence |
| @uiw/react-md-editor | ^4.0.11 | Markdown description editor in task detail | Already in project. Used in agent-identity-editor with SSR-disabled dynamic import |
| date-fns | ^4.1.0 | Due date formatting, relative timestamps | Already in project |
| nanoid | ^5.1.6 | Client-side ID generation for optimistic inserts | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| immer | ^10.x | Simplify complex nested board state updates in Zustand | When updating deeply nested task fields within column arrays; board store will have complex state shape |
| cmdk | ^1.1.1 | Searchable command menu for @mention popover and agent picker | Already in project. Reuse for mention autocomplete in comments |
| sonner | ^2.0.7 | Toast notifications for task actions | Already in project. Used in agent mutations |
| nuqs | ^2.8.8 | URL state for board filters, active board ID | Already in project. URL params for board selection, column filters |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core + sortable | @atlassian/pragmatic-drag-and-drop | Pragmatic DnD uses native HTML5 DnD API (lighter weight, better file drop support) but has less React-specific ergonomics and fewer community Kanban examples with shadcn. dnd-kit has proven multi-container sortable patterns that map directly to Kanban columns |
| @dnd-kit/core (stable) | @dnd-kit/react (v0.3.x) | New rewrite with cleaner hooks API, but v0.x pre-release with known issues (missing "use client" directive, modifier bugs). Not production-ready |
| Custom mention popover | tiptap/prosemirror editor | Full rich-text editor is overkill for task comments. A textarea + popover matches the existing slash-command pattern in ChatInput |
| Dice UI Kanban component | Building from dnd-kit primitives | Dice UI provides a ready-made Kanban component built on dnd-kit+shadcn, but it won't support the custom requirements (semantic columns, agent glow, human-only columns). Build from primitives for full control |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers immer
```

Note: `zustand/middleware/immer` requires `immer` as a peer dependency. All other libraries are already installed.

## Architecture Patterns

### Recommended Project Structure (FSD)
```
src/
├── entities/
│   └── mission/                    # Mission/task domain entity
│       ├── model/
│       │   ├── types.ts            # Task, Board, Column, Deliverable, Comment types
│       │   └── schemas.ts          # Zod v4 schemas for task validation
│       ├── lib/
│       │   ├── priority-utils.ts   # Priority color mapping, sort comparators
│       │   └── column-utils.ts     # Column semantic roles, ordering helpers
│       └── index.ts                # Barrel export
├── features/
│   └── missions/                   # Mission board feature slice
│       ├── model/
│       │   ├── board-store.ts      # Zustand store: boards, columns, card positions
│       │   ├── task-store.ts       # Zustand store: task detail, comments, deliverables
│       │   └── hooks.ts            # Derived selectors, board-specific hooks
│       ├── api/
│       │   ├── use-boards.ts       # TanStack Query: fetch board list
│       │   ├── use-board-tasks.ts  # TanStack Query: fetch tasks for a board
│       │   ├── use-task-detail.ts  # TanStack Query: fetch single task detail
│       │   └── use-task-mutations.ts # Mutations: create, update, move, delete tasks
│       ├── schemas/
│       │   ├── task-schemas.ts     # Zod schemas for task creation/edit forms
│       │   └── board-schemas.ts    # Zod schemas for board settings
│       ├── lib/
│       │   ├── mission-subscriptions.ts  # EventBus subscriptions for task events
│       │   └── drag-utils.ts       # DnD helpers: collision detection, reorder logic
│       └── components/
│           ├── kanban-board.tsx     # DndContext + SortableContext multi-container board
│           ├── kanban-column.tsx    # Individual column with droppable zone
│           ├── kanban-card.tsx      # Draggable task card with priority stripe + glow
│           ├── kanban-overlay.tsx   # DragOverlay portal for drag preview
│           ├── task-create-dialog.tsx # Task creation modal/form
│           ├── task-slide-over.tsx  # Sheet-based task peek panel
│           ├── task-detail-page.tsx # Full task detail page content
│           ├── task-activity-timeline.tsx # Activity feed with expandable agent detail
│           ├── task-deliverables.tsx # Deliverable preview cards
│           ├── task-sign-off-modal.tsx # Review modal with approve/reject/revise
│           ├── task-comments.tsx    # Comment thread with @mention support
│           ├── mention-popover.tsx  # @mention autocomplete popover
│           ├── board-sidebar.tsx    # Board list in sidebar (Notion-like tree)
│           └── board-settings.tsx   # Board configuration form
├── views/
│   └── missions/
│       ├── missions-board-view.tsx  # Main board view at /missions
│       ├── mission-detail-view.tsx  # Full task detail at /missions/[taskId]
│       ├── mission-create-view.tsx  # Task creation at /missions/new
│       ├── boards-list-view.tsx     # Board list at /missions/boards
│       └── board-settings-view.tsx  # Board settings at /missions/boards/[boardId]/settings
└── widgets/
    └── mission-board-layout/
        └── components/
            └── mission-board-shell.tsx # Layout shell (like agent-detail-shell)
```

### Pattern 1: Multi-Container Sortable Kanban (dnd-kit)
**What:** Using DndContext with multiple SortableContext providers for column-to-column card movement
**When to use:** The core board view -- every Kanban column gets its own SortableContext
**Example:**
```typescript
// Source: Context7 /websites/dndkit - Sortable multiple containers pattern
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function KanbanBoard() {
  const columns = useBoardStore((s) => s.columns);
  const moveCard = useBoardStore((s) => s.moveCard);
  const reorderInColumn = useBoardStore((s) => s.reorderInColumn);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragOver={handleDragOver}    // Move card between columns
      onDragEnd={handleDragEnd}      // Finalize position + trigger semantic actions
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {columns.map((col) => (
          <SortableContext
            key={col.id}
            items={col.taskIds}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn column={col} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeId ? <KanbanCardOverlay taskId={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### Pattern 2: Zustand Board Store with Immer (PUSH state)
**What:** Complex nested board state managed with Zustand + immer middleware for clean updates
**When to use:** Board store that holds columns and card positions, updated by both user DnD and agent EventBus events
**Example:**
```typescript
// Source: Context7 /pmndrs/zustand - Immer middleware pattern
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface BoardStore {
  boards: Board[];
  activeBoard: string | null;
  columns: Column[];  // ordered columns for active board
  tasks: Map<string, Task>;

  // DnD actions
  moveCard: (taskId: string, fromCol: string, toCol: string, newIndex: number) => void;
  reorderInColumn: (columnId: string, oldIndex: number, newIndex: number) => void;

  // Agent-driven actions
  autoTransition: (taskId: string, toColumn: string) => void;
}

const useBoardStore = create<BoardStore>()(
  immer((set) => ({
    boards: [],
    activeBoard: null,
    columns: [],
    tasks: new Map(),

    moveCard: (taskId, fromCol, toCol, newIndex) =>
      set((state) => {
        const from = state.columns.find((c) => c.id === fromCol);
        const to = state.columns.find((c) => c.id === toCol);
        if (!from || !to) return;
        from.taskIds = from.taskIds.filter((id) => id !== taskId);
        to.taskIds.splice(newIndex, 0, taskId);
      }),

    reorderInColumn: (columnId, oldIndex, newIndex) =>
      set((state) => {
        const col = state.columns.find((c) => c.id === columnId);
        if (!col) return;
        const [removed] = col.taskIds.splice(oldIndex, 1);
        col.taskIds.splice(newIndex, 0, removed);
      }),

    autoTransition: (taskId, toColumn) =>
      set((state) => {
        // Remove from current column, add to target
        for (const col of state.columns) {
          const idx = col.taskIds.indexOf(taskId);
          if (idx !== -1) {
            col.taskIds.splice(idx, 1);
            break;
          }
        }
        const target = state.columns.find((c) => c.id === toColumn);
        if (target) target.taskIds.unshift(taskId); // Add to top
      }),
  }))
);
```

### Pattern 3: EventBus Subscriptions for Mission Events
**What:** Wire gateway task events into the board store, following the same pattern as agent-store and dashboard-store
**When to use:** GatewayProvider initialization -- add mission store subscriptions alongside existing ones
**Example:**
```typescript
// Follows pattern from: src/features/agents/model/agent-store.ts
// and src/features/dashboard/model/dashboard-store.ts

export function initMissionStoreSubscriptions(eventBus: EventBus): () => void {
  const unsubs: Array<() => void> = [];

  // Agent starts working on task -> auto-transition to IN_PROGRESS
  unsubs.push(
    eventBus.on('task.agent.started', ({ taskId }) => {
      useBoardStore.getState().autoTransition(taskId, 'in_progress');
    }),
  );

  // Agent submits deliverable -> auto-transition to IN_REVIEW
  unsubs.push(
    eventBus.on('task.deliverable.submitted', ({ taskId, deliverable }) => {
      useTaskStore.getState().addDeliverable(taskId, deliverable);
      useBoardStore.getState().autoTransition(taskId, 'in_review');
    }),
  );

  // Agent status update on task
  unsubs.push(
    eventBus.on('task.status.updated', ({ taskId, status, agentId }) => {
      useTaskStore.getState().addActivityEntry(taskId, {
        type: 'status_change',
        agentId,
        status,
        timestamp: new Date(),
      });
    }),
  );

  return () => unsubs.forEach((fn) => fn());
}
```

### Pattern 4: Optimistic Drag with Rollback
**What:** Immediately update UI on drag-end, then sync to server; rollback on failure
**When to use:** Every card move via drag-and-drop
**Example:**
```typescript
// In onDragEnd handler:
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  // 1. Optimistic: update Zustand immediately
  const previousState = useBoardStore.getState().columns;
  useBoardStore.getState().moveCard(active.id, sourceCol, targetCol, newIndex);

  // 2. Semantic action check
  if (targetCol === 'in_progress') {
    dispatchTaskToAgent(active.id);  // Gateway RPC call
  }

  // 3. Persist to server (async)
  try {
    await updateTaskPosition(active.id, targetCol, newIndex);
  } catch {
    // 4. Rollback on failure
    useBoardStore.setState({ columns: previousState });
    toast.error('Failed to move task');
  }
}
```

### Pattern 5: Dual-Access Task Detail (Slide-over + Full Page)
**What:** Click card -> Sheet slide-over; expand button -> full page at /missions/[taskId]
**When to use:** Task detail view
**Example:**
```typescript
// Uses existing Sheet component from src/shared/ui/sheet.tsx
// Sheet is built on Radix Dialog, already supports right-side slide-in

function TaskSlideOver({ taskId, open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{task.title}</SheetTitle>
        </SheetHeader>
        <TaskDetailContent taskId={taskId} />
        <SheetFooter>
          <Button asChild variant="outline">
            <Link href={`/missions/${taskId}`}>
              <Expand className="size-4 mr-2" /> Open full page
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Pattern 6: Card Glow for Active Agent (Consistent with Phase 3)
**What:** Pulsing box-shadow glow on Kanban cards when assigned agent is actively working
**When to use:** Cards in IN PROGRESS column with a working agent
**Example:**
```typescript
// Matches existing pattern from src/entities/agent/lib/agent-utils.ts
// getStatusGlowClasses() uses shadow-[0_0_6px_-1px] pattern

// For Kanban cards, add a pulsing variant:
function getTaskGlowClasses(isAgentWorking: boolean): string {
  if (!isAgentWorking) return '';
  return 'shadow-[0_0_8px_-1px] shadow-blue-500/50 border-blue-500/30 animate-pulse';
}
// animate-pulse is built into Tailwind -- provides the pulsing effect
// blue-500 matches the "working" status color from agent-utils.ts
```

### Pattern 7: Priority Stripe via Left Border
**What:** Color-coded left border stripe on cards indicating priority
**When to use:** Every Kanban card
**Example:**
```typescript
const PRIORITY_BORDER: Record<TaskPriority, string> = {
  critical: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-gray-400',
};

// In KanbanCard component:
<Card className={cn(
  'cursor-grab active:cursor-grabbing',
  PRIORITY_BORDER[task.priority],
  getTaskGlowClasses(isAgentWorking),
)}>
```

### Anti-Patterns to Avoid
- **Don't use `@dnd-kit/react` (v0.x):** Pre-release with known bugs. Stick with stable `@dnd-kit/core` + `@dnd-kit/sortable`
- **Don't put DnD state in TanStack Query cache:** Card positions change rapidly during drag. Use Zustand for board state, TanStack Query only for initial load
- **Don't use border-width for glow effects:** Causes layout shift. Use box-shadow only (established in Phase 3)
- **Don't auto-sort columns during drag:** Auto-sort by priority is the default, but during an active drag operation, disable auto-sort to prevent jarring reflows
- **Don't use contentEditable for comments:** Use a textarea + mention popover, matching the existing chat input pattern. ContentEditable is brittle across browsers

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom pointer event handlers | @dnd-kit/core + @dnd-kit/sortable | Touch/keyboard/screen reader support, collision detection, multi-container sorting -- months of work to replicate |
| Sortable lists | Manual array splice + DOM manipulation | @dnd-kit/sortable `arrayMove` | Edge cases with indices, especially cross-container moves. Off-by-one errors are endemic |
| Drag preview overlay | Cloning DOM nodes | @dnd-kit `DragOverlay` component | Portaled overlay avoids z-index issues and clip-path clipping from scroll containers |
| Stacked avatar display | Manual CSS overlap + counting | Existing `AvatarGroup` + `AvatarGroupCount` components | Already built in `src/shared/ui/avatar.tsx` with proper ring spacing and size variants |
| Slide-over panel | Custom animated panel | Existing `Sheet` component from shadcn | Already built in `src/shared/ui/sheet.tsx` with Radix Dialog, proper focus trap, animations |
| Review/approval modal | Custom modal with form | Existing `Dialog` + `AlertDialog` components | Focus management, escape handling, overlay, all already solved |
| Markdown editor | Custom textarea + preview | `@uiw/react-md-editor` (already installed) | SSR-safe dynamic import pattern already established in agent-identity-editor |
| Mention autocomplete | Custom popover + search | Reuse `SlashCommandPopover` pattern + `cmdk` | Keyboard navigation, filtering, active index management all solved in chat feature |
| Toast notifications | Custom notification system | `sonner` (already installed) | Used throughout for mutation success/error feedback |
| URL state management | useState + manual URL sync | `nuqs` (already installed) | Board ID, filter state in URL params. Used in agents roster view |

**Key insight:** This project has already solved most UI patterns in prior phases. The mission board should reuse `Sheet`, `Dialog`, `Avatar`/`AvatarGroup`, `Badge`, `Card`, `EmptyState`, `PageHeader`, `FormField`, slash-command popover pattern, and the Zustand+EventBus subscription wiring pattern. The only genuinely new library is @dnd-kit.

## Common Pitfalls

### Pitfall 1: DragOverlay Not Using Portal
**What goes wrong:** Drag preview gets clipped by overflow:hidden on scroll containers (column scrolling)
**Why it happens:** dnd-kit's default drag behavior moves the actual element, which stays in the DOM flow
**How to avoid:** Always use `<DragOverlay>` component which portals the preview to document.body. Render a clone/snapshot of the card as the overlay content
**Warning signs:** Card disappears or gets cut off when dragging between columns

### Pitfall 2: Stale Closures in onDragOver/onDragEnd
**What goes wrong:** Card moves to wrong position or reverts because handler captured stale column state
**Why it happens:** React closures capture state at render time; rapid drag events can fire faster than re-renders
**How to avoid:** Read state from Zustand's `getState()` (outside React) in drag handlers instead of from hook selectors. Example: `useBoardStore.getState().columns` not `columns` from `useBoardStore((s) => s.columns)`
**Warning signs:** Dragging fast between columns produces wrong ordering; undo/redo reveals phantom states

### Pitfall 3: Collision Detection Misses on Empty Columns
**What goes wrong:** Cannot drop cards into empty columns because there are no sortable items to collide with
**Why it happens:** `SortableContext` with an empty items array has no collision targets
**How to avoid:** Add a droppable zone around each SortableContext column (as noted in dnd-kit docs). Use a minimum-height placeholder div inside empty columns that acts as a drop target via `useDroppable`
**Warning signs:** User drags all cards out of a column and cannot drag any back in

### Pitfall 4: Auto-Transition Conflicts with Active Drag
**What goes wrong:** Agent pushes a status update that moves a card while the user is actively dragging it
**Why it happens:** EventBus subscription fires autoTransition() during an ongoing drag operation
**How to avoid:** Guard auto-transitions: if the card being moved is currently the active drag item (`activeId`), queue the transition and apply after drag ends. Store a `pendingTransitions` queue in the board store
**Warning signs:** Card teleports during drag, or drag-end places card in wrong column because state changed underneath

### Pitfall 5: Optimistic Update Without Proper Rollback
**What goes wrong:** Card appears moved, but server rejects the move, and UI stays in inconsistent state
**Why it happens:** No snapshot of pre-move state to restore on error
**How to avoid:** Snapshot `columns` array before optimistic update. On mutation error, restore snapshot and show toast. Pattern: `const prev = structuredClone(columns); try { move(); await persist(); } catch { rollback(prev); }`
**Warning signs:** After network error, board shows cards in positions that don't match server state

### Pitfall 6: Performance with Many Cards
**What goes wrong:** Board lags when columns have 50+ cards, especially during drag
**Why it happens:** Every card re-renders on every drag movement event
**How to avoid:** Memoize `KanbanCard` with `React.memo`. Use `useSortable` only on visible cards (combine with `@tanstack/react-virtual` for long columns). Keep card components lightweight
**Warning signs:** Frame drops below 30fps during drag; visible lag between cursor movement and card position

### Pitfall 7: Markdown Editor SSR Crash
**What goes wrong:** "document is not defined" error on server render
**Why it happens:** `@uiw/react-md-editor` uses browser APIs internally
**How to avoid:** Dynamic import with `ssr: false` -- already established pattern in `agent-identity-editor.tsx`: `const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })`
**Warning signs:** Build-time or SSR errors mentioning `document` or `window`

### Pitfall 8: Mention Popover Positioning Near Edges
**What goes wrong:** @mention popover renders off-screen when comment input is near bottom/right edge
**Why it happens:** Popover positioned relative to cursor without boundary awareness
**How to avoid:** Use Radix Popover with `collisionPadding` and `avoidCollisions` props. Or position the mention list above the input (like the existing SlashCommandPopover uses `bottom-full`)
**Warning signs:** Popover partially hidden or causes horizontal scroll

## Code Examples

### Task Entity Types
```typescript
// Source: Derived from project patterns (entities/agent/model/types.ts style)

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'inbox' | 'queued' | 'in_progress' | 'in_review' | 'done' | 'archived';

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string; // Markdown
  priority: TaskPriority;
  status: TaskStatus;
  assignedAgentIds: string[];
  reviewerId?: string | undefined;
  tags: string[];
  subtasks: Subtask[];
  deliverables: Deliverable[];
  signOffRequired: boolean;
  signOffStatus?: 'pending' | 'approved' | 'rejected' | 'revision_requested' | undefined;
  parentTaskId?: string | undefined; // For agent-to-agent delegation linked cards
  dueDate?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  columnOrder: number; // Position within column (for manual reorder)
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Deliverable {
  id: string;
  type: 'file' | 'code' | 'link';
  title: string;
  url: string;
  thumbnailUrl?: string | undefined;
  mimeType?: string | undefined;
  submittedAt: Date;
  submittedBy: string; // agentId or userId
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorType: 'user' | 'agent';
  content: string;
  mentions: Mention[];
  createdAt: Date;
}

export interface Mention {
  type: 'agent' | 'human';
  id: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
  orgId: string;
  columns: BoardColumn[];
  createdAt: Date;
}

export interface BoardColumn {
  id: string;
  name: string;
  semanticRole: TaskStatus | null; // null for human-only columns
  order: number;
  isHumanOnly: boolean;
}

export interface ActivityEntry {
  id: string;
  taskId: string;
  type: 'status_change' | 'comment' | 'deliverable' | 'assignment' | 'agent_detail';
  summary: string;
  timestamp: Date;
  actorId: string;
  actorType: 'user' | 'agent' | 'system';
  details?: unknown;
  // Agent-level detail (expandable)
  agentDetails?: AgentActivityDetail[] | undefined;
}

export interface AgentActivityDetail {
  type: 'tool_call' | 'reasoning' | 'output';
  content: string;
  timestamp: Date;
}
```

### Zod Validation Schemas for Task Creation
```typescript
// Source: Follows pattern from src/features/agents/schemas/wizard-schemas.ts
import { z } from 'zod/v4';

export const taskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const taskStatusSchema = z.enum([
  'inbox', 'queued', 'in_progress', 'in_review', 'done', 'archived',
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().default(''),
  priority: taskPrioritySchema.default('medium'),
  assignedAgentIds: z.array(z.string()).default([]),
  reviewerId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  signOffRequired: z.boolean().default(false),
  dueDate: z.date().optional(),
  boardId: z.string().min(1),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
```

### QueryKeys Extension for Missions
```typescript
// Source: Extends pattern from src/shared/lib/query-keys.ts
export const queryKeys = {
  // ... existing keys ...
  boards: {
    all: ['boards'] as const,
    lists: () => [...queryKeys.boards.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.boards.all, 'detail', id] as const,
    settings: (id: string) => [...queryKeys.boards.all, 'settings', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byBoard: (boardId: string) => [...queryKeys.tasks.all, 'board', boardId] as const,
    detail: (taskId: string) => [...queryKeys.tasks.all, 'detail', taskId] as const,
    comments: (taskId: string) => [...queryKeys.tasks.all, 'comments', taskId] as const,
    activity: (taskId: string) => [...queryKeys.tasks.all, 'activity', taskId] as const,
  },
} as const;
```

### EventBus Extension for Mission Events
```typescript
// New events to add to KnownEvents in src/features/gateway-connection/lib/event-bus.ts
// Follows existing pattern of typed event payloads

// Gateway task events (agents push these)
'task.agent.started': { taskId: string; agentId: string };
'task.agent.progress': { taskId: string; agentId: string; summary: string };
'task.deliverable.submitted': {
  taskId: string;
  agentId: string;
  deliverable: { id: string; type: string; title: string; url: string };
};
'task.status.updated': { taskId: string; agentId: string; status: string };
'task.comment.added': {
  taskId: string;
  authorId: string;
  authorType: 'agent' | 'user';
  content: string;
};
```

### Stacked Avatar Pattern for Assigned Agents
```typescript
// Uses existing AvatarGroup from src/shared/ui/avatar.tsx
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/shared/ui/avatar';

function AssignedAgents({ agentIds, agents }: Props) {
  const visible = agentIds.slice(0, 3);
  const overflow = agentIds.length - 3;

  return (
    <AvatarGroup>
      {visible.map((id) => {
        const agent = agents.get(id);
        return (
          <Avatar key={id} size="sm">
            <AvatarImage src={agent?.avatar} alt={agent?.name} />
            <AvatarFallback>{agent?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        );
      })}
      {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
    </AvatarGroup>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core + sortable | 2023 (rbd deprecated) | rbd is unmaintained; dnd-kit is the community standard for React DnD |
| @dnd-kit/core (v5) | @dnd-kit/core v6.3.1 + sortable v10 | 2024 | Stable releases with improved collision detection and accessibility |
| @dnd-kit/react (new rewrite) | Still in v0.x pre-release | 2025-2026 | Cleaner API but not production-ready; stick with stable packages |
| react-dnd | @dnd-kit or pragmatic-drag-and-drop | 2024 | react-dnd has React 19 compatibility issues |
| Custom mention system | cmdk + popover pattern | Ongoing | Project already uses cmdk; reuse for mention autocomplete |
| useState for board state | Zustand + immer | Project standard | Complex nested board state benefits from immer's direct mutation pattern |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Deprecated by Atlassian. Replaced by `pragmatic-drag-and-drop` or `@dnd-kit`
- `react-dnd`: Has unresolved React 19 compatibility issues (GitHub issue #3655). Avoid
- `@dnd-kit/react` v0.x: Pre-release, not stable enough for production use yet

## Open Questions

1. **Gateway RPC methods for task operations**
   - What we know: Gateway uses JSON-RPC protocol with methods like `agent.send`, `agent.list`. Task operations will need similar methods
   - What's unclear: Exact method names and payload shapes for task dispatch, status updates, deliverable submission
   - Recommendation: Define methods in types first (`task.dispatch`, `task.update`, `task.deliverable`), implement with mock handlers (same pattern as existing `fetchAgents` mock). Wire real gateway when backend is ready

2. **Database schema for tasks/boards**
   - What we know: Project uses Drizzle ORM with PostgreSQL. Existing `audit_logs` schema shows the pattern (pgTable, indexes)
   - What's unclear: Whether task data will be in PostgreSQL or if the gateway/backend manages its own persistence
   - Recommendation: Define Drizzle schemas for boards, tasks, comments, deliverables. Even if backend ultimately stores them, having the schema defined helps type safety. Follow audit-logs pattern with proper indexes

3. **Board sidebar integration with app sidebar**
   - What we know: App sidebar (`app-sidebar.tsx`) uses the shadcn Sidebar component with `navigationConfig` for routes. Missions already has a nav entry at `/missions` with the Kanban icon
   - What's unclear: Whether the board list sidebar should be inside the main content area (like Notion's in-page sidebar) or nested within the app sidebar
   - Recommendation: Use an in-content secondary sidebar (like the chat conversation sidebar pattern), not nested in the app sidebar. The app sidebar handles top-level navigation; the board list is feature-level navigation within `/missions`

4. **Automation rules configuration (TASK-09)**
   - What we know: Board settings allow custom columns and automation rules
   - What's unclear: What automation rules look like -- triggers (e.g., "when card enters REVIEW") + actions (e.g., "notify reviewer")? How complex?
   - Recommendation: Start with a simple trigger-action model (dropdown trigger + dropdown action + optional condition). Don't build a visual workflow editor. Can iterate later

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/dndkit` -- dnd-kit sortable multi-container patterns, useSortable hook, DragOverlay (315 code snippets)
- Context7 `/atlassian/pragmatic-drag-and-drop` -- Alternative DnD library patterns, Kanban board isolation (316 code snippets)
- Context7 `/pmndrs/zustand` -- Immer middleware for complex state updates (691 code snippets)
- Codebase analysis: `src/features/gateway-connection/lib/event-bus.ts` -- EventBus typed pub/sub pattern
- Codebase analysis: `src/features/agents/model/agent-store.ts` -- Zustand + EventBus subscription pattern
- Codebase analysis: `src/entities/agent/lib/agent-utils.ts` -- `getStatusGlowClasses()` box-shadow pattern
- Codebase analysis: `src/shared/ui/avatar.tsx` -- AvatarGroup + AvatarGroupCount components
- Codebase analysis: `src/shared/ui/sheet.tsx` -- Sheet slide-over component (for task peek)
- Codebase analysis: `src/features/chat/components/slash-command-popover.tsx` -- Mention/autocomplete pattern

### Secondary (MEDIUM confidence)
- [Dice UI Kanban Component](https://www.diceui.com/docs/components/kanban) -- shadcn-compatible Kanban component built on @dnd-kit/core+sortable. Verified component API and structure
- [GitHub: react-dnd-kit-tailwind-shadcn-ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui) -- Reference implementation of Kanban with dnd-kit + Tailwind + shadcn
- [dnd-kit GitHub releases](https://github.com/clauderic/dnd-kit/releases) -- Verified @dnd-kit/react is v0.3.1 pre-release (not stable)
- [npm @dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core) -- Verified stable version 6.3.1
- [npm @dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable) -- Verified stable version 10.0.0

### Tertiary (LOW confidence)
- [Puck Editor blog: Top 5 DnD Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- Comparison article (could not fetch full content)
- [Marmelab: Kanban Board with shadcn 2026](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) -- Recent implementation guide (could not fetch full content)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- dnd-kit is well-documented, stable, with extensive community patterns. All other libraries already in project
- Architecture: HIGH -- FSD patterns established in prior phases. Board store follows exact same Zustand+EventBus pattern as agent-store and dashboard-store
- Pitfalls: HIGH -- Well-documented in dnd-kit community; verified against project-specific patterns (glow effects, SSR, EventBus conflicts)
- Agent integration: MEDIUM -- Gateway event names and RPC methods are hypothetical (backend not yet built), but the wiring pattern is proven

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable domain, dnd-kit unlikely to change significantly)
