---
phase: 06-mission-board
plan: 04
subsystem: ui
tags: [cmdk, mention-popover, board-sidebar, board-settings, automation-rules, zod-v4, react-hook-form, kanban, comments]

# Dependency graph
requires:
  - phase: 06-mission-board
    provides: Board store, task store, KanbanBoard, TaskDetailContent, entity types (TaskComment, Mention, BoardColumn)
  - phase: 01-foundation
    provides: shadcn/ui components (Command, Dialog, AlertDialog, DropdownMenu), EventBus, GatewayProvider
  - phase: 03-agent-management
    provides: Agent store for mention popover agent list
provides:
  - Task comments component with @mention support via cmdk Command popover
  - MentionPopover autocomplete for @agent and @human mentions
  - Board sidebar for navigation between boards (Notion-like page tree)
  - Board list page at /missions/boards with grid cards and task counts
  - Board settings at /missions/boards/[boardId]/settings with column management
  - Automation rules with trigger-action model (card_enters_column, card_assigned, etc.)
  - Board mutation hooks (create/update/delete) with optimistic store updates
  - Board form schemas (create, update, column, automation rule)
affects: [07-governance, notifications, board-access-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [mention-popover-cmdk, mention-format-@[name](type:id), trigger-action-automation, board-sidebar-in-content]

key-files:
  created:
    - src/features/missions/components/task-comments.tsx
    - src/features/missions/components/mention-popover.tsx
    - src/features/missions/components/board-sidebar.tsx
    - src/features/missions/components/board-settings.tsx
    - src/features/missions/schemas/board-schemas.ts
    - src/features/missions/api/use-board-mutations.ts
    - src/views/missions/boards-list-view.tsx
    - src/views/missions/board-settings-view.tsx
    - app/(dashboard)/missions/boards/page.tsx
    - app/(dashboard)/missions/boards/[boardId]/settings/page.tsx
  modified:
    - src/features/missions/components/task-detail-content.tsx
    - src/views/missions/missions-board-view.tsx
    - src/features/missions/index.ts

key-decisions:
  - "MentionPopover reuses cmdk Command component for searchable agent/human list (matching existing slash-command popover pattern)"
  - "Mention format @[Name](type:id) enables parsing and rendering as colored inline badges"
  - "Comment submit emits task.comment.added EventBus event with mentions for notification handling"
  - "BoardSidebar rendered as in-content secondary sidebar (w-56 border-r), hidden on mobile"
  - "Core columns read-only with lock icon; human-only columns insertable with position selector"
  - "Automation rules use simple trigger-action model stored in local state for initial version"

patterns-established:
  - "mention-format: @[Name](type:id) parsed with regex for inline badge rendering in comments"
  - "mention-popover: cmdk Command with agent/team groups, positioned relative to textarea cursor"
  - "board-sidebar: in-content w-56 flex-shrink-0 sidebar with board list and create/rename/delete"
  - "automation-rule: trigger enum + action enum + actionConfig Record for extensible rule model"

requirements-completed: [TASK-07, TASK-08, TASK-09]

# Metrics
duration: 10min
completed: 2026-02-18
---

# Phase 6 Plan 04: Task Comments and Board Organization Summary

**Task comments with @mention cmdk popover, board sidebar navigation, board list/settings pages with column management, and trigger-action automation rules**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-18T13:05:18Z
- **Completed:** 2026-02-18T13:15:48Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Comment thread with @mention support: typing @ opens cmdk-based popover with searchable agent/human list, mentions render as colored inline badges (blue for agents, purple for humans)
- Board sidebar in missions view with board list, create dialog, rename/delete actions, and settings navigation
- Board list page at /missions/boards with grid of board cards showing task counts and creation dates
- Board settings at /missions/boards/[boardId]/settings with general rename, column management (core read-only, human-only addable), and automation rule configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Task comments with @mention popover and wire into task detail** - `c9acc4d` (feat)
2. **Task 2: Board organization pages, board sidebar, and board settings** - `44a3277` (feat)

## Files Created/Modified
- `src/features/missions/components/task-comments.tsx` - Comment thread with @mention parsing, inline badges, EventBus emit
- `src/features/missions/components/mention-popover.tsx` - cmdk Command popover with agent/human groups
- `src/features/missions/components/board-sidebar.tsx` - Board list sidebar with create/rename/delete actions
- `src/features/missions/components/board-settings.tsx` - Board settings form with column management and automation rules
- `src/features/missions/schemas/board-schemas.ts` - Zod v4 schemas for board CRUD, columns, and automation rules
- `src/features/missions/api/use-board-mutations.ts` - Create/update/delete board mutation hooks with optimistic updates
- `src/views/missions/boards-list-view.tsx` - Board grid view with task counts and create dialog
- `src/views/missions/board-settings-view.tsx` - Board settings page with breadcrumb navigation
- `app/(dashboard)/missions/boards/page.tsx` - Route page for board list
- `app/(dashboard)/missions/boards/[boardId]/settings/page.tsx` - Route page for board settings
- `src/features/missions/components/task-detail-content.tsx` - Replaced comments placeholder with TaskComments component
- `src/views/missions/missions-board-view.tsx` - Added BoardSidebar in flex layout alongside KanbanBoard
- `src/features/missions/index.ts` - Extended barrel exports with board schemas and mutation hooks

## Decisions Made
- MentionPopover reuses cmdk Command component for searchable agent/human list (matching existing slash-command popover pattern)
- Mention format @[Name](type:id) enables parsing and rendering as colored inline badges
- Comment submit emits task.comment.added EventBus event with mentions payload for notification handling
- BoardSidebar rendered as in-content secondary sidebar (w-56 border-r), hidden on mobile via hidden md:flex
- Core columns shown read-only with lock icon and semantic role label; human-only columns can be added with position selector
- Automation rules use simple trigger-action model stored in local state for initial version (no persistence yet)
- Mock team members (Arya, Admin, Reviewer) used for human mention list until real user directory is wired

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Linter auto-removing imports required re-application**
- **Found during:** Task 1 (wiring TaskComments into TaskDetailContent)
- **Issue:** An auto-formatter/linter was removing the TaskComments import between Edit calls, before the JSX usage was written. The import was stripped because the JSX change hadn't been applied yet.
- **Fix:** Re-applied both the import and JSX replacement, then amended the commit to capture the correct state.
- **Files modified:** task-detail-content.tsx
- **Verification:** Build passes, both import and JSX usage verified in committed version
- **Committed in:** c9acc4d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking linter race condition)
**Impact on plan:** Minor -- linter timing issue resolved with re-application. No scope creep.

## Issues Encountered
- Stale .next/lock file and corrupted build cache required removal of .next directory before clean rebuild

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 Mission Board feature set is now complete (all 4 plans executed)
- Comment system ready for future real-time comment delivery via EventBus subscriptions
- Board organization provides foundation for multi-board project management
- Automation rules provide extensible trigger-action framework for future governance automation
- All components exported via barrel index for consumption by downstream features

## Self-Check: PASSED

All 10 created files verified present. Both task commits (c9acc4d, 44a3277) verified in git log.

---
*Phase: 06-mission-board*
*Completed: 2026-02-18*
