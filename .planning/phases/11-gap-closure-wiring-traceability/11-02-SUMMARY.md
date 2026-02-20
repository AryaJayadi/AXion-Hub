---
phase: 11-gap-closure-wiring-traceability
plan: 02
subsystem: ui
tags: [zustand, react-context, chat, agent-picker, navigation]

# Dependency graph
requires:
  - phase: 04-real-time-chat
    provides: ChatLayout, AgentPickerDialog, ConversationSidebar, ChatHubView components
  - phase: 03-agent-management
    provides: Zustand agent store (useAgentStore)
provides:
  - Working chat flow where New Chat / Start Chat open AgentPickerDialog
  - AgentPickerDialog reads from Zustand (shared cache with useAgents)
  - ChatLayoutContext for propagating callbacks to child components
  - Resume-existing-conversation logic for direct chats
affects: [chat, agents]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ChatLayoutContext pattern: React context for propagating ChatLayout callbacks to children"
    - "Resume-existing-conversation: check conversations Map before creating new direct chat"

key-files:
  created: []
  modified:
    - src/features/chat/components/agent-picker-dialog.tsx
    - src/features/chat/components/chat-layout.tsx
    - src/features/chat/components/conversation-sidebar.tsx
    - src/views/chat/chat-hub-view.tsx

key-decisions:
  - "AgentPickerDialog reads from Zustand store instead of separate TanStack Query to eliminate query key mismatch"
  - "ChatLayoutContext created in chat-layout.tsx (co-located) since it is tightly coupled to ChatLayout"
  - "ChatHubView split into ChatHubView (wrapper) + ChatHubContent (consumer) for context access"
  - "ConversationSidebar empty state uses arrow function wrapper for optional onNewChat to satisfy required onClick type"

patterns-established:
  - "ChatLayoutContext: createContext + useChatLayoutContext hook for propagating ChatLayout state to deeply nested children"
  - "Provider-consumer split: wrapper component renders ChatLayout provider, inner component consumes context"

requirements-completed: [CHAT-01, AGNT-01]

# Metrics
duration: 4min
completed: 2026-02-20
---

# Phase 11 Plan 02: Chat Entry Point Wiring Summary

**Chat entry points wired to AgentPickerDialog with Zustand-based agent data and resume-existing-conversation logic**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T06:52:14Z
- **Completed:** 2026-02-20T06:56:32Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- AgentPickerDialog now reads from Zustand agent store (shared source of truth with useAgents), eliminating the query key mismatch that prevented newly created agents from appearing
- New Chat button in ChatHubView and Start Chat button in ConversationSidebar empty state both open the AgentPickerDialog via ChatLayoutContext
- Resume-existing-conversation logic checks for existing direct conversations before creating new ones, navigating to /chat/[agentId] in both cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix AgentPickerDialog to read from Zustand store** - `99977ce` (fix)
2. **Task 2: Wire chat entry points to AgentPickerDialog** - `611227e` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `src/features/chat/components/agent-picker-dialog.tsx` - Replaced TanStack Query with useAgentStore selector
- `src/features/chat/components/chat-layout.tsx` - Added ChatLayoutContext, useChatLayoutContext export, resume-existing-conversation logic, router.push navigation
- `src/features/chat/components/conversation-sidebar.tsx` - Wired empty state Start Chat button to onNewChat callback
- `src/views/chat/chat-hub-view.tsx` - Split into ChatHubView wrapper + ChatHubContent consumer using useChatLayoutContext

## Decisions Made
- Used Zustand store instead of TanStack Query in AgentPickerDialog to share the same agent data source as the useAgents hook, avoiding query key mismatch (`['agents', 'list']` vs `['agents']`)
- Created ChatLayoutContext in the same file as ChatLayout since it is tightly coupled; exported useChatLayoutContext for use by ChatHubView
- Split ChatHubView into wrapper (provides context) and inner content component (consumes context) to solve the provider-consumer ordering
- Used arrow function wrapper `() => onNewChat?.()` in ConversationSidebar empty state to satisfy the required onClick type while handling the optional onNewChat prop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error with conditional spread on EmptyState action**
- **Found during:** Task 2 (ConversationSidebar empty state)
- **Issue:** Plan suggested conditional spread `...(onNewChat ? { onClick: onNewChat } : {})` which produces a union type that doesn't satisfy the required `onClick` property in EmptyState's action type
- **Fix:** Used `onClick: () => onNewChat?.()` arrow function wrapper instead
- **Files modified:** src/features/chat/components/conversation-sidebar.tsx
- **Verification:** `npx tsc --noEmit` passes with no errors in this file
- **Committed in:** 611227e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type compatibility fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chat entry points fully wired; users can start new conversations from both ChatHubView and ConversationSidebar empty state
- Agent data flows through single Zustand store, ready for additional consumers

## Self-Check: PASSED

- All 4 modified files exist on disk
- Commit 99977ce (Task 1) found in git log
- Commit 611227e (Task 2) found in git log

---
*Phase: 11-gap-closure-wiring-traceability*
*Completed: 2026-02-20*
