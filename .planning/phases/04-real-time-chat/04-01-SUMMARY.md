---
phase: 04-real-time-chat
plan: 01
subsystem: ui
tags: [zustand, chat, resizable-panels, streaming, conversation-sidebar, react, shadcn-ui, streamdown]

# Dependency graph
requires:
  - phase: 01-05
    provides: "Zustand PUSH state pattern, query key factory, selector-based hooks pattern"
  - phase: 01-06
    provides: "shadcn/ui components (avatar, badge, separator, scroll-area, empty-state, search-input, status-badge)"
provides:
  - "ChatMessage, Conversation, StreamingLane, ToolCallInfo, Attachment entity types"
  - "Zustand chat store (useChatStore) with conversations, messages, streaming lanes, drafts"
  - "Selector hooks: useActiveConversation, useConversationMessages, useStreamingLanes, useDraft, useConversationList"
  - "Three-panel resizable chat layout (sidebar + main + participant panel)"
  - "Conversation sidebar with hybrid organization (pinned, rooms, direct)"
  - "Participant panel showing agents in conversation"
  - "ChatHubView, AgentChatView, TeamChatView compositions"
  - "Route pages: /chat, /chat/[agentId], /chat/team/[conversationId]"
  - "Query key factory: conversations and messages domains"
  - "shadcn/ui collapsible and resizable components installed"
  - "streamdown, @streamdown/code, use-debounce packages installed"
affects: [04-02, 04-03, 04-04]

# Tech tracking
tech-stack:
  added: [streamdown, "@streamdown/code", use-debounce, react-resizable-panels]
  patterns: [chat-zustand-store, hybrid-sidebar-organization, three-panel-resizable-layout, streaming-lane-model]

key-files:
  created: [src/entities/chat-message/model/types.ts, src/entities/chat-message/index.ts, src/features/chat/model/chat-store.ts, src/features/chat/model/hooks.ts, src/features/chat/components/chat-layout.tsx, src/features/chat/components/conversation-sidebar.tsx, src/features/chat/components/participant-panel.tsx, src/features/chat/index.ts, src/views/chat/chat-hub-view.tsx, src/views/chat/agent-chat-view.tsx, src/views/chat/team-chat-view.tsx, app/(dashboard)/chat/page.tsx, app/(dashboard)/chat/[agentId]/page.tsx, app/(dashboard)/chat/team/[conversationId]/page.tsx]
  modified: [src/shared/lib/query-keys.ts, src/shared/ui/collapsible.tsx, src/shared/ui/resizable.tsx, package.json, bun.lock]

key-decisions:
  - "react-resizable-panels v4 uses orientation prop instead of direction -- adjusted from plan"
  - "react-resizable-panels v4 Panel component has no order prop -- panels ordered by JSX position"
  - "Hybrid conversation sidebar: pinned section, rooms section, direct section (per research discretion)"
  - "Full-width message blocks layout (not bubbles) for multi-agent room compatibility"
  - "StreamingLane model: key is conversationId:agentId, finalizeStream moves to messages"
  - "Participant panel shows agentId as fallback name until wired to agent store"

patterns-established:
  - "Chat store pattern: Zustand Map-based state for conversations, messages, streaming lanes, drafts"
  - "Streaming lane lifecycle: startStream -> appendToStream -> finalizeStream (lane deleted, message added)"
  - "Three-panel resizable layout: sidebar (25%) + main (55-75%) + optional participants (20%)"
  - "Hybrid sidebar organization: pinned first, then rooms/teams, then direct chats"
  - "View composition: server page -> client view -> ChatLayout + content"

requirements-completed: [CHAT-01]

# Metrics
duration: 7min
completed: 2026-02-18
---

# Phase 4 Plan 1: Chat Hub Foundation Summary

**Chat entity types, Zustand store with streaming lanes, three-panel resizable layout, conversation sidebar with hybrid organization, and three route pages (/chat, /chat/[agentId], /chat/team/[conversationId])**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-18T04:38:55Z
- **Completed:** 2026-02-18T04:46:02Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- Chat entity types defined: ChatMessage, Conversation, StreamingLane, ToolCallInfo, Attachment with strict TypeScript (all optional props use `| undefined`)
- Zustand chat store with full CRUD for conversations, messages, streaming lanes (multi-agent), and draft preservation
- Three-panel resizable layout using shadcn/ui Resizable (react-resizable-panels v4) with collapsible sidebar and participant panels
- Conversation sidebar with search, hybrid organization (pinned/rooms/direct), avatar initials, relative timestamps, unread badge
- Three route pages wired to view compositions with proper Next.js 16 async params pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat entity types, Zustand store, and query key extensions** - `e689992` (feat)
2. **Task 2: Build chat layout, conversation sidebar, participant panel, route pages, and view compositions** - `362a92d` (feat)

## Files Created/Modified
- `src/entities/chat-message/model/types.ts` - ChatMessage, Conversation, StreamingLane, ToolCallInfo, Attachment types
- `src/entities/chat-message/index.ts` - Barrel export for chat entity types
- `src/features/chat/model/chat-store.ts` - Zustand chat store with conversations, messages, streaming lanes, drafts
- `src/features/chat/model/hooks.ts` - Selector-based hooks (useActiveConversation, useConversationMessages, etc.)
- `src/features/chat/components/chat-layout.tsx` - Three-panel resizable layout
- `src/features/chat/components/conversation-sidebar.tsx` - Conversation list with hybrid organization
- `src/features/chat/components/participant-panel.tsx` - Right-side agent list panel
- `src/features/chat/index.ts` - Feature barrel export
- `src/views/chat/chat-hub-view.tsx` - /chat page composition
- `src/views/chat/agent-chat-view.tsx` - /chat/[agentId] page composition
- `src/views/chat/team-chat-view.tsx` - /chat/team/[conversationId] page composition
- `app/(dashboard)/chat/page.tsx` - Chat hub route page
- `app/(dashboard)/chat/[agentId]/page.tsx` - Agent chat route page
- `app/(dashboard)/chat/team/[conversationId]/page.tsx` - Team chat route page
- `src/shared/lib/query-keys.ts` - Extended with conversations and messages domains
- `src/shared/ui/collapsible.tsx` - New shadcn/ui component
- `src/shared/ui/resizable.tsx` - New shadcn/ui component
- `package.json` / `bun.lock` - Added streamdown, @streamdown/code, use-debounce

## Decisions Made
- react-resizable-panels v4 API changed: uses `orientation` prop (not `direction`) and Panel has no `order` prop -- panels are ordered by JSX position
- Hybrid sidebar organization chosen per research discretion: pinned conversations at top, then rooms/teams, then direct chats
- Participant panel shows agentId as fallback display name until agent store integration in later plans
- StreamingLane keyed by `${conversationId}:${agentId}` for multi-agent parallel streaming support

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ResizablePanelGroup direction prop**
- **Found during:** Task 2 (Chat layout)
- **Issue:** Plan specified `direction="horizontal"` but react-resizable-panels v4 uses `orientation` prop
- **Fix:** Changed to `orientation="horizontal"`
- **Files modified:** src/features/chat/components/chat-layout.tsx
- **Verification:** Build passes
- **Committed in:** 362a92d (Task 2 commit)

**2. [Rule 1 - Bug] Removed order prop from ResizablePanel**
- **Found during:** Task 2 (Chat layout)
- **Issue:** Plan implied `order` prop but react-resizable-panels v4 Panel has no order prop
- **Fix:** Removed `order` prop from all ResizablePanel instances
- **Files modified:** src/features/chat/components/chat-layout.tsx
- **Verification:** Build passes
- **Committed in:** 362a92d (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary due to react-resizable-panels v4 API changes from v2/v3. No scope creep.

## Issues Encountered
None beyond the API prop changes documented in deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chat entity types and store ready for streaming UI implementation (04-02)
- Layout shell ready for chat view, message list, and chat input components
- Route pages wired and serving views for all three chat routes
- streamdown and @streamdown/code installed and ready for streaming markdown rendering
- Query key factory ready for TanStack Query hooks for conversation/message fetching

## Self-Check: PASSED

All 16 key files verified present. Both task commits verified in git log (e689992, 362a92d). Build passes with no TypeScript errors.

---
*Phase: 04-real-time-chat*
*Completed: 2026-02-18*
