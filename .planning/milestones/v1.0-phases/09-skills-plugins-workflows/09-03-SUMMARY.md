---
phase: 09-skills-plugins-workflows
plan: 03
subsystem: ui
tags: [react-flow, xyflow, zustand, workflow-builder, canvas, drag-drop, visual-editor]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "FSD structure, shared UI components, Zustand patterns, TanStack Query"
  - phase: 05-dashboard-monitoring
    provides: "React Flow patterns (dependency-map.tsx, routing-graph.tsx)"
provides:
  - "Workflow entity types, Zod schemas, and 12-node type registry"
  - "Zustand canvas store with undo/redo for workflow graph state"
  - "Interactive React Flow canvas with drag-from-sidebar node creation"
  - "12 custom workflow node components with category-specific styling"
  - "Node config panel with type-specific form fields"
  - "Workflow list page at /workflows with card grid"
  - "Visual workflow editor at /workflows/new"
affects: [09-04-PLAN, 09-05-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: [module-level-nodeTypes, ReactFlowProvider-wrapping, canvas-store-pattern, dual-source-handles]

key-files:
  created:
    - src/entities/workflow/model/types.ts
    - src/entities/workflow/model/schemas.ts
    - src/entities/workflow/lib/node-registry.ts
    - src/entities/workflow/index.ts
    - src/features/workflows/api/use-workflows.ts
    - src/features/workflows/model/workflow-canvas-store.ts
    - src/features/workflows/components/workflow-card.tsx
    - src/features/workflows/components/nodes/base-workflow-node.tsx
    - src/features/workflows/components/nodes/trigger-node.tsx
    - src/features/workflows/components/nodes/agent-action-node.tsx
    - src/features/workflows/components/nodes/condition-node.tsx
    - src/features/workflows/components/nodes/delay-node.tsx
    - src/features/workflows/components/nodes/transform-node.tsx
    - src/features/workflows/components/nodes/output-node.tsx
    - src/features/workflows/components/nodes/loop-node.tsx
    - src/features/workflows/components/nodes/parallel-node.tsx
    - src/features/workflows/components/nodes/http-request-node.tsx
    - src/features/workflows/components/nodes/code-node.tsx
    - src/features/workflows/components/nodes/approval-gate-node.tsx
    - src/features/workflows/components/nodes/sub-workflow-node.tsx
    - src/features/workflows/components/canvas/workflow-canvas.tsx
    - src/features/workflows/components/canvas/node-palette.tsx
    - src/features/workflows/components/canvas/node-config-panel.tsx
    - src/views/workflows/workflows-list-view.tsx
    - src/views/workflows/workflow-editor-view.tsx
    - app/(dashboard)/workflows/page.tsx
    - app/(dashboard)/workflows/new/page.tsx
  modified:
    - src/shared/lib/query-keys.ts

key-decisions:
  - "nodeTypes defined at module level outside component to prevent React Flow re-renders"
  - "ReactFlowProvider wraps parent WorkflowEditorView, not the same component as ReactFlow"
  - "Canvas store uses plain Zustand (no immer) with functional updates for immutable state"
  - "Condition/approval-gate nodes use dual source handles at 30%/70% left positioning"
  - "Output node has no source handle (terminal), trigger node has no target handle (entry)"
  - "Undo/redo via past/future arrays with MAX_HISTORY=50 snapshots"

patterns-established:
  - "Module-level nodeTypes: all React Flow nodeTypes constants must be outside components"
  - "Canvas store pattern: Zustand store wrapping applyNodeChanges/applyEdgeChanges for external state management"
  - "Dual handle pattern: condition/approval/loop/parallel nodes with multiple named source handles"
  - "Node registry pattern: central registry defines all node types with palette metadata and defaults"

requirements-completed: [WORK-01, WORK-02]

# Metrics
duration: 8min
completed: 2026-02-19
---

# Phase 9 Plan 3: Workflow Canvas & Visual Builder Summary

**Interactive React Flow workflow canvas with 12 custom node types, drag-from-sidebar palette, right config panel, and undo/redo at /workflows/new**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-19T07:25:03Z
- **Completed:** 2026-02-19T07:33:37Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments
- Workflow entity layer with types, Zod schemas, and 12-node registry with 6 category color schemes
- Zustand canvas store managing nodes, edges, selection, dirty tracking, and 50-entry undo/redo
- 12 custom node components: trigger, agent-action, condition (dual handles), delay, transform, output (terminal), loop (dual handles), parallel (dual handles), http-request, code, approval-gate (dual handles), sub-workflow
- Interactive canvas with drag-from-sidebar node creation, handle-to-handle connections, keyboard delete, and MiniMap
- Left sidebar palette grouping nodes by 6 categories with draggable items
- Right sidebar config panel with type-specific form fields (selects, inputs, textareas) updating node data in real time
- Workflow list page at /workflows with card grid showing 6 mock workflows, trigger badges, status, and run indicators
- Visual workflow editor at /workflows/new with three-column layout and undo/redo toolbar

## Task Commits

Each task was committed atomically:

1. **Task 1: Workflow entity types, node registry, canvas store, query hooks, and workflow list page** - `89689cc` (feat)
2. **Task 2: Interactive workflow canvas with 12 custom nodes, palette, config panel, and editor view** - `5d6b850` (feat, shared with 09-02 parallel commit)

## Files Created/Modified
- `src/entities/workflow/model/types.ts` - Workflow types: status, trigger, node type, definition, execution state
- `src/entities/workflow/model/schemas.ts` - Zod v4 schemas for workflow entities
- `src/entities/workflow/lib/node-registry.ts` - Central registry for 12 node types with categories, icons, defaults, handles
- `src/entities/workflow/index.ts` - Barrel export for workflow entity
- `src/features/workflows/api/use-workflows.ts` - TanStack Query hooks with 6 mock workflows, create/delete mutations
- `src/features/workflows/model/workflow-canvas-store.ts` - Zustand store for canvas graph state with undo/redo
- `src/features/workflows/components/workflow-card.tsx` - Card for workflow list with trigger badges and run status
- `src/features/workflows/components/nodes/base-workflow-node.tsx` - Shared base node with category border, icon header, handles
- `src/features/workflows/components/nodes/trigger-node.tsx` - Entry point node, no target handle
- `src/features/workflows/components/nodes/agent-action-node.tsx` - Agent action with name and description
- `src/features/workflows/components/nodes/condition-node.tsx` - Boolean branch with true/false dual handles
- `src/features/workflows/components/nodes/delay-node.tsx` - Wait duration display
- `src/features/workflows/components/nodes/transform-node.tsx` - Data mapping description
- `src/features/workflows/components/nodes/output-node.tsx` - Terminal node, no source handle
- `src/features/workflows/components/nodes/loop-node.tsx` - Iteration with body/done dual handles
- `src/features/workflows/components/nodes/parallel-node.tsx` - Fan-out/fan-in dual handles
- `src/features/workflows/components/nodes/http-request-node.tsx` - Method + URL display
- `src/features/workflows/components/nodes/code-node.tsx` - Language badge (JS/Python)
- `src/features/workflows/components/nodes/approval-gate-node.tsx` - Approved/rejected dual handles
- `src/features/workflows/components/nodes/sub-workflow-node.tsx` - Referenced workflow display
- `src/features/workflows/components/canvas/workflow-canvas.tsx` - ReactFlow canvas with drag-drop, connect, keyboard delete
- `src/features/workflows/components/canvas/node-palette.tsx` - Left sidebar with draggable node items by category
- `src/features/workflows/components/canvas/node-config-panel.tsx` - Right sidebar with type-specific config forms
- `src/views/workflows/workflows-list-view.tsx` - Card grid view with loading/empty states
- `src/views/workflows/workflow-editor-view.tsx` - Three-column editor layout with undo/redo toolbar
- `app/(dashboard)/workflows/page.tsx` - Route page for /workflows
- `app/(dashboard)/workflows/new/page.tsx` - Route page for /workflows/new
- `src/shared/lib/query-keys.ts` - Added workflows domain with list/detail/runs/cron/webhooks keys

## Decisions Made
- nodeTypes defined at module level outside component to prevent React Flow re-renders (per research Pitfall 1)
- ReactFlowProvider wraps WorkflowEditorView parent, WorkflowEditorInner is the child (per research Pitfall 2)
- Canvas store uses plain Zustand with functional updates -- no immer needed for node/edge arrays
- Condition and approval-gate nodes use dual source handles at 30%/70% left positioning with green/red colors
- Output node is terminal (no source handle), trigger node is entry (no target handle)
- Undo/redo tracks past/future arrays with MAX_HISTORY=50 snapshots, taken on addNode and deleteSelectedNodes
- Node config panel uses framer-motion AnimatePresence for smooth open/close animation
- Base workflow node wraps all 12 types with memo() for React Flow performance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed strictness errors in node-registry and canvas store**
- **Found during:** Task 1 (verification)
- **Issue:** exactOptionalPropertyTypes flagged possibly-undefined values in getNodeCategory return and undo/redo array access
- **Fix:** Added explicit undefined guards and early returns
- **Files modified:** src/entities/workflow/lib/node-registry.ts, src/features/workflows/model/workflow-canvas-store.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** 89689cc (Task 1 commit)

**2. [Deviation] Task 2 files committed by parallel 09-02 executor**
- **Found during:** Task 2 commit
- **Issue:** Parallel plan 09-02 executor ran `git add` that captured newly created but unstaged Task 2 files
- **Fix:** No action needed -- files are correctly committed and verified
- **Impact:** Task 2 commit hash (5d6b850) is shared with 09-02 plan; content is correct

---

**Total deviations:** 1 auto-fixed (1 bug), 1 commit overlap (parallel execution artifact)
**Impact on plan:** Auto-fix was necessary for strict TypeScript compliance. Commit overlap is cosmetic only -- all content is correct.

## Issues Encountered
- Parallel Wave 1 executor (09-02) committed Task 2 files along with its own -- this is harmless as all file content is correct and verified

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Workflow canvas and editor are fully interactive, ready for Plan 04 (execution engine, run visualization)
- All 12 node types registered and renderable on canvas
- Canvas store provides foundation for execution overlay (node status coloring, progress indicators)

---
## Self-Check: PASSED

- All 27 created files verified present on disk
- All min_lines requirements met (node-registry: 269, canvas-store: 229, canvas: 177, palette: 155, config-panel: 503)
- Commit 89689cc verified in git log
- Commit 5d6b850 verified in git log
- `npx tsc --noEmit` passes with zero errors

---
*Phase: 09-skills-plugins-workflows*
*Completed: 2026-02-19*
