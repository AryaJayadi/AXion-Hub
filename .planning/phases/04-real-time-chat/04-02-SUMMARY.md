---
phase: 04-real-time-chat
plan: 02
subsystem: ui
tags: [streamdown, streaming, token-buffer, rAF, eventbus, zustand, chat, markdown, multi-agent]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Chat entity types, Zustand chat store, three-panel layout, conversation sidebar, route pages"
  - phase: 01-04
    provides: "EventBus with typed events, GatewayClient.sendMessage(), WebSocket infrastructure"
  - phase: 01-05
    provides: "GatewayProvider with useGateway() hook, Zustand PUSH state pattern"
provides:
  - "useTokenBuffer hook with rAF-based flush and stale closure mitigation"
  - "EventBus extended with tool call events (start/progress/end/error) and room lifecycle (chat.room.created)"
  - "initChatStreamSubscriptions wiring EventBus stream events to Zustand store actions"
  - "MessageBubble with Streamdown markdown rendering for AI messages"
  - "StreamingLane and StreamingLanes for multi-agent parallel streaming display"
  - "ChatInput with auto-resize textarea, Enter to send, draft preservation"
  - "MessageList with sticky-bottom auto-scroll and 'New messages' indicator"
  - "ChatView composing message list + streaming lanes + input with GatewayClient send"
  - "AgentChatView and TeamChatView wired with full streaming chat UI"
affects: [04-03, 04-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [rAF-token-buffer, streamdown-dynamic-import, sticky-bottom-autoscroll, eventbus-stream-subscriptions, optimistic-message-send]

key-files:
  created: [src/features/chat/lib/token-buffer.ts, src/features/chat/lib/chat-stream-subscriptions.ts, src/features/chat/components/chat-view.tsx, src/features/chat/components/message-list.tsx, src/features/chat/components/message-bubble.tsx, src/features/chat/components/streaming-lane.tsx, src/features/chat/components/streaming-lanes.tsx, src/features/chat/components/chat-input.tsx]
  modified: [src/features/gateway-connection/lib/event-bus.ts, src/features/chat/index.ts, src/views/chat/agent-chat-view.tsx, src/views/chat/team-chat-view.tsx]

key-decisions:
  - "Streamdown loaded via next/dynamic with ssr:false to avoid SSR issues with shiki"
  - "Code plugin loaded asynchronously via top-level import() with conditional spread for exactOptionalPropertyTypes"
  - "Sticky-bottom auto-scroll uses 50px threshold with 'New messages' button when scrolled up"
  - "EventBus subscriptions use simplified sessionId:agent laneKey for 1:1 chats; multi-agent rooms will use explicit agentId from event payload"
  - "Optimistic user messages added to store immediately; gateway errors logged but don't remove the message"

patterns-established:
  - "Streamdown integration: dynamic import with conditional plugin spread for exactOptionalPropertyTypes compat"
  - "Token buffer: useRef accumulation + rAF flush + onFlushRef for stale closure mitigation"
  - "Stream subscription: single initChatStreamSubscriptions() entry point returning cleanup function"
  - "Message list auto-scroll: track isAtBottom state, scroll on new content only when at bottom"
  - "Chat input: native textarea with auto-resize, Enter/Shift+Enter handling, draft persistence per conversation"

requirements-completed: [CHAT-02]

# Metrics
duration: 7min
completed: 2026-02-18
---

# Phase 4 Plan 2: Streaming Chat UI Summary

**Token-buffered streaming chat with Streamdown markdown rendering, multi-agent streaming lanes, sticky-bottom auto-scroll, and GatewayClient message send with optimistic updates**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-18T04:48:46Z
- **Completed:** 2026-02-18T04:55:15Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Token buffer hook with rAF-based flush prevents re-render storms during high-frequency streaming (batches to ~60fps)
- EventBus extended with tool call events (start/progress/end/error) and room lifecycle for agent-initiated chatrooms
- Chat stream subscriptions wire all EventBus streaming events to Zustand store actions with proper cleanup
- MessageBubble renders AI messages with Streamdown live markdown + code highlighting, client-only timestamps
- Multi-agent streaming lanes display parallel agent responses with agent-specific border colors
- Chat input with auto-resize textarea, Enter to send, Shift+Enter for newline, draft preservation per conversation
- Message list with sticky-bottom auto-scroll and "New messages" indicator when scrolled up
- ChatView orchestrates full chat experience with optimistic message sending via GatewayClient

## Task Commits

Each task was committed atomically:

1. **Task 1: Create token buffer, EventBus subscriptions, and extend event types** - `270b839` (feat)
2. **Task 2: Build chat view, message list, message bubble, streaming lanes, and chat input** - `cf5fa1f` (feat)

## Files Created/Modified
- `src/features/chat/lib/token-buffer.ts` - useTokenBuffer hook with rAF flush and stale closure mitigation
- `src/features/chat/lib/chat-stream-subscriptions.ts` - EventBus subscription wiring to Zustand store
- `src/features/gateway-connection/lib/event-bus.ts` - Extended KnownEvents with tool call and room events
- `src/features/chat/components/message-bubble.tsx` - Single message with Streamdown markdown rendering
- `src/features/chat/components/streaming-lane.tsx` - Single agent streaming area with colored border
- `src/features/chat/components/streaming-lanes.tsx` - Multi-agent parallel streaming container
- `src/features/chat/components/chat-input.tsx` - Auto-resize textarea with send and attachment buttons
- `src/features/chat/components/message-list.tsx` - Scrollable message feed with sticky-bottom auto-scroll
- `src/features/chat/components/chat-view.tsx` - Complete chat view composing all sub-components
- `src/features/chat/index.ts` - Updated barrel with new component and lib exports
- `src/views/chat/agent-chat-view.tsx` - Replaced placeholder with ChatView for 1:1 agent chat
- `src/views/chat/team-chat-view.tsx` - Replaced placeholder with ChatView for multi-agent rooms

## Decisions Made
- Streamdown dynamically imported with `{ ssr: false }` to avoid SSR/hydration issues with shiki code highlighting
- Code plugin loaded via async top-level `import()` and conditionally spread onto Streamdown props (avoids `undefined` assignment with exactOptionalPropertyTypes)
- Sticky-bottom auto-scroll checks if user is within 50px of bottom; shows "New messages" button when scrolled up
- EventBus subscriptions use `sessionId:agent` as simplified lane key for 1:1 chats; multi-agent rooms will pass explicit agentId
- Optimistic user messages use nanoid for IDs and are added to store before gateway roundtrip; gateway errors are logged but don't roll back the message

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed exactOptionalPropertyTypes on Streamdown plugins prop**
- **Found during:** Task 2 (MessageBubble and StreamingLane)
- **Issue:** `plugins={codePlugin ? { code: codePlugin } : undefined}` fails strict TS because PluginConfig doesn't accept undefined
- **Fix:** Used conditional spread `{...(codePlugin ? { plugins: { code: codePlugin } } : {})}` pattern
- **Files modified:** src/features/chat/components/message-bubble.tsx, src/features/chat/components/streaming-lane.tsx
- **Verification:** Build passes
- **Committed in:** cf5fa1f (Task 2 commit)

**2. [Rule 1 - Bug] Fixed array index return type in getLaneColor**
- **Found during:** Task 2 (StreamingLane)
- **Issue:** `LANE_COLORS[index]` returns `string | undefined` in strict noUncheckedIndexedAccess mode
- **Fix:** Added nullish coalescing fallbacks: `?? LANE_COLORS[0] ?? "border-blue-500/50"`
- **Files modified:** src/features/chat/components/streaming-lane.tsx
- **Verification:** Build passes
- **Committed in:** cf5fa1f (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs -- exactOptionalPropertyTypes compatibility)
**Impact on plan:** Both fixes necessary for strict TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the TypeScript strictness fixes documented in deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Streaming chat UI complete; ready for tool call visualization (04-03)
- EventBus tool call events wired; 04-03 will build the Collapsible/Accordion tool call groups and animated pipeline
- Chat input has Paperclip button placeholder ready for 04-03 media attachment support
- ChatInput placeholder mentions slash commands ready for 04-04 implementation

## Self-Check: PASSED

All 8 created files verified present. Both task commits verified in git log (270b839, cf5fa1f). Build passes with no TypeScript errors.

---
*Phase: 04-real-time-chat*
*Completed: 2026-02-18*
