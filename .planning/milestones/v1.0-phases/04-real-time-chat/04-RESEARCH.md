# Phase 4: Real-Time Chat - Research

**Researched:** 2026-02-18
**Domain:** Real-time streaming chat interface -- multi-pane layout, token-by-token streaming, markdown rendering during stream, tool call visualization, multi-agent chatrooms with parallel streaming lanes, media attachments, session management, slash commands, Cmd+K command palette, message search
**Confidence:** HIGH (core libraries verified via npm + Context7; streaming patterns verified via official docs + multiple sources; Streamdown verified as Vercel's production solution for AI streaming markdown)

## Summary

Phase 4 delivers the real-time chat experience -- the core interaction loop between users and AI agents. The primary technical challenge is rendering streaming markdown token-by-token without visual jitter, while simultaneously supporting multi-agent chatrooms where multiple agents can stream responses in parallel visual lanes. A secondary challenge is the tool call visualization system that shows agent thinking as an animated step-through pipeline.

The critical discovery in this research is **Streamdown** (v2.2.0) by Vercel -- a purpose-built drop-in replacement for react-markdown specifically designed for AI streaming. Streamdown solves the incomplete markdown rendering problem (unclosed bold, partial code blocks, unterminated links) that react-markdown handles poorly during token-by-token streaming. It includes built-in Shiki code highlighting via the `@streamdown/code` plugin, GFM support, security hardening against prompt injection, and Tailwind CSS styling. This eliminates the need to hand-roll a streaming markdown renderer or fight with react-markdown's limitations during active streaming.

The chat layout uses **react-resizable-panels** (v4.6.4, already in the project stack via shadcn/ui's Resizable wrapper) for the sidebar + main area split. The conversation sidebar sits in the left panel, the active chat fills the main panel, and the collapsible participant panel sits on the right for multi-agent rooms. For state management, the pattern follows the established project convention: **Zustand** for real-time PUSH state (streaming tokens, message buffer, active conversation, typing indicators) and **TanStack Query** for PULL state (conversation history, message search results). The existing WebSocket infrastructure (EventBus, WebSocketManager, GatewayClient) from Phase 1 provides the transport layer for streaming tokens -- the chat feature subscribes to `chat.stream.start`, `chat.stream.token`, and `chat.stream.end` events already defined in the EventBus type system.

**Primary recommendation:** Use Streamdown for all AI message rendering (streaming and static). Build the token buffer as a Zustand store slice with requestAnimationFrame-based flushing to batch high-frequency token events into smooth visual updates. Use react-resizable-panels (via shadcn/ui Resizable) for the pane layout. Build the slash command autocomplete as a custom popover triggered by `/` keypress in the chat input, and wire the Cmd+K command palette through shadcn/ui's existing Command component (backed by cmdk).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Chat layout & panes
- Sidebar + single chat layout: conversation list in left sidebar, one active chat fills main area
- Multi-agent chatrooms supported -- not just 1:1. Users can create rooms with multiple agents
- Agents can also initiate chatrooms with other agents autonomously
- Collapsible right panel for participants: lists all agents in the room with status, role, and model info
- When observing agent-to-agent conversations, user can interject -- sends messages as a full participant, not read-only

#### Streaming & message display
- Smooth character-by-character token rendering with blinking cursor during streaming
- When multiple agents stream simultaneously in a room, each gets a separate visual lane/section -- parallel but organized, no interleaving
- Messages merge into the conversation feed once streaming completes

#### Tool call presentation
- Tool calls grouped as a "thinking step" with a progress indicator (like Claude.ai's approach)
- Expanding a step shows individual tool calls
- In-progress tools shown as animated step-through: a visual mini-pipeline where each tool call is a node that lights up as it executes
- Tool call output opens in a side panel on click -- chat stays clean
- Error presentation: Claude's discretion

#### Session & conversation flow
- New chat flow: pick agent(s) first from a picker, then start typing. Room is created with selected agents
- Quick commands: both slash command autocomplete in input (type '/' for dropdown) AND a Cmd+K command palette -- two ways to access same actions
- Switching conversations: unsent draft text is preserved, but chat scrolls to bottom on return
- Message search: default search scopes to current chat, with toggle/shortcut to switch to global search across all conversations

### Claude's Discretion
- Conversation sidebar organization (grouped by type, flat recent, or hybrid)
- Message visual style (bubbles vs full-width blocks) -- pick what suits multi-agent rooms best
- Markdown rendering timing (live during stream vs after complete)
- Tool call error visual treatment
- Loading skeleton design
- Exact spacing, typography, and animations

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | User can access multi-pane chat interface at `/chat` showing all agent conversations | react-resizable-panels (shadcn Resizable) for sidebar + main split. Zustand chat store with conversation list. ScrollArea for conversation sidebar. Conversation list sorted by recency with agent avatar, name, last message preview, timestamp. |
| CHAT-02 | User can have a direct conversation with a specific agent at `/chat/[agentId]` with real-time streaming responses via WebSocket | Streamdown for streaming markdown rendering. Token buffer in Zustand with rAF flush. EventBus subscriptions to `chat.stream.start/token/end`. GatewayClient.sendMessage() for outbound messages. Blinking cursor caret via Streamdown's `isAnimating` prop. |
| CHAT-03 | User can observe agent-to-agent conversations at `/chat/team/[conversationId]` | Same streaming infrastructure as CHAT-02. Parallel visual lanes for multi-agent streaming -- each agent gets a dedicated streaming section that merges into the feed on completion. User can interject as full participant. Participant panel shows agent status/role/model. |
| CHAT-04 | Chat displays tool calls as expandable blocks showing tool name, arguments, and output | shadcn Collapsible/Accordion for expandable tool call groups. Animated step-through pipeline using framer-motion for tool node progression. Tool output opens in Sheet (side panel) to keep chat clean. Error states use destructive badge variant. |
| CHAT-05 | Chat supports sending/receiving images, documents, and audio | Native File API + drag-and-drop via HTML5 events (onDragOver/onDrop) on chat input area. Paste-to-upload support (clipboard API). Image preview inline in messages. Document/audio as downloadable cards with icon + filename. GatewayClient extended with sendMediaMessage method. |
| CHAT-06 | User can switch between agent sessions within chat | Zustand store tracks active conversation ID + draft text per conversation. Switching preserves unsent drafts. Auto-scroll to bottom on conversation switch. Session list from GatewayClient.getSessions(). |
| CHAT-07 | Chat supports quick commands: /new, /compact, /status, /reset | Dual approach: (1) Slash command popover triggered by `/` keypress in chat input with filtered command list, (2) Cmd+K command palette via shadcn Command component (cmdk). Both execute the same action handlers. |
| CHAT-08 | User can search messages across all conversations | SearchInput component with scope toggle (current chat vs global). Debounced search via use-debounce. API endpoint for message search (gateway or local DB). Results rendered in dropdown/panel with conversation context and click-to-navigate. |
</phase_requirements>

## Standard Stack

### Core (New for Phase 4)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| streamdown | ^2.2.0 | Streaming markdown renderer | Vercel's purpose-built replacement for react-markdown for AI streaming. Handles unterminated markdown blocks (unclosed bold, partial code blocks, hanging links) that break react-markdown during token-by-token streaming. Built-in Tailwind styling, GFM support, security hardening against prompt injection. Peer dep: react ^18 or ^19. |
| @streamdown/code | ^1.0.2 | Shiki code highlighting plugin for Streamdown | Tree-shakeable plugin providing syntax-highlighted code blocks with copy/download buttons. Uses shiki ^3.19.0 internally. Eliminates need to configure shiki + rehype-shiki manually. |
| remend | ^1.2.0 | Standalone incomplete markdown completer | Powers Streamdown's streaming mode internally but also usable standalone for pre-processing markdown before rendering in non-Streamdown contexts (e.g., tool call output previews). |
| use-debounce | ^10.1.0 | Debounced callbacks | Search input debounce, draft auto-save. Provides useDebouncedCallback with cancel/flush/isPending. Already planned for Phase 3 -- will be installed by then. |

### From Phase 1/2/3 (Already Installed or Planned)

| Library | Version | Purpose | How Used in Phase 4 |
|---------|---------|---------|---------------------|
| react-resizable-panels | ^4.6.4 | Resizable pane layout | Chat pane layout via shadcn/ui Resizable wrapper (ResizablePanelGroup, ResizablePanel, ResizableHandle). Sidebar + main chat + collapsible participant panel. |
| zustand | ^5.0.11 | Chat store | Real-time chat state: active conversation, streaming token buffer, message list per conversation, draft text per conversation, typing indicators, active streaming lanes. |
| @tanstack/react-query | ^5.90.21 | Data fetching | Conversation history loading, message search results, session list. Cache invalidation on new messages via queryClient.setQueryData. |
| cmdk | ^1.1.1 | Command palette | Cmd+K command palette for quick commands (/new, /compact, /status, /reset). Already a shadcn/ui dependency. TypeScript-native with keyword search. |
| framer-motion | ^12.34.1 | Animations | Tool call step-through animation (nodes lighting up), streaming lane transitions, message entrance animations. |
| lucide-react | ^0.574.0 | Icons | Chat icons: Send, Paperclip (attach), Search, Plus, Settings, Bot, User, ChevronRight, etc. |
| sonner | ^2.0.7 | Toast notifications | Error feedback, command execution confirmations. |
| date-fns | ^4.1.0 | Date formatting | Message timestamps, conversation "last active" relative times (formatDistanceToNow). |
| nanoid | ^5.1.6 | ID generation | Optimistic message IDs, idempotency keys for sendMessage. |
| nuqs | ^2.8.8 | URL state | Search query in URL, active conversation ID in URL for shareable links. |

### shadcn/ui Components Required

| Component | Purpose | Notes |
|-----------|---------|-------|
| resizable | Chat pane layout (sidebar + main + right panel) | Wraps react-resizable-panels v4. ResizablePanelGroup, ResizablePanel, ResizableHandle. |
| scroll-area | Conversation list, message area, participant list | Custom scrollbar styling. ScrollArea + ScrollBar. |
| command | Cmd+K command palette | Command.Dialog, Command.Input, Command.List, Command.Group, Command.Item. |
| avatar | Agent/user avatars in messages and conversation list | Fallback to initials. |
| badge | Agent status in participant panel, message role labels | StatusBadge from Phase 1 for agent status. |
| tooltip | Truncated conversation names, button labels | Standard tooltip pattern. |
| collapsible | Tool call expandable groups | CollapsibleTrigger + CollapsibleContent for thinking steps. |
| sheet | Tool call output side panel | Sheet from right side, keeps chat visible. |
| popover | Slash command autocomplete dropdown | Positioned above chat input, shows filtered command list. |
| separator | Between conversation groups in sidebar | Visual dividers. |
| skeleton | Loading states for conversation list, messages | Skeleton matching chat layout shapes. |
| button | Send button, attach button, action buttons | Icon buttons in chat input area. |
| input | Chat message input (or textarea) | May use native textarea for multi-line with custom styling. |
| dialog | New chat agent picker, confirmation dialogs | Agent selection dialog for new conversations. |
| checkbox | Agent selection in multi-agent room creation | Multi-select agent picker. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Streamdown | react-markdown + custom streaming handler | react-markdown breaks on incomplete markdown during streaming (unclosed bold, partial code blocks). Would need custom pre-processing with remend + manual shiki integration. Streamdown solves this out of the box. Only advantage of react-markdown: more mature ecosystem of rehype/remark plugins. |
| Streamdown | @ai-sdk/react useChat | Vercel AI SDK provides useChat hook with built-in streaming. However, it assumes Vercel AI SDK backend (not our OpenClaw Gateway WebSocket protocol). Would need heavy adaptation to work with our custom EventBus streaming model. Not worth it. |
| Slash command popover | react-textarea-autocomplete | External library for textarea autocomplete. Adds dependency for a simple feature (detect `/`, show popover, filter items). Custom implementation with Popover is lighter and more integrated with shadcn/ui. |
| Custom token buffer | Direct state updates per token | Would cause 30-100+ React re-renders per second during streaming. The ref buffer + rAF flush pattern batches updates to ~20/sec, keeping the UI smooth. |

### Installation

```bash
npm install streamdown @streamdown/code use-debounce
```

Note: react-resizable-panels, cmdk, framer-motion, and other dependencies are either already installed or will be installed in Phase 3 (which Phase 4 depends on).

## Architecture Patterns

### Recommended Project Structure

```
src/
├── entities/
│   └── chat-message/
│       ├── model/
│       │   └── types.ts              # ChatMessage, Conversation, StreamingLane, ToolCall types
│       └── index.ts
├── features/
│   └── chat/
│       ├── model/
│       │   ├── chat-store.ts         # Zustand store: conversations, messages, streaming state
│       │   └── hooks.ts              # useActiveConversation, useStreamingMessages, etc.
│       ├── api/
│       │   ├── use-conversations.ts  # TanStack Query hooks for conversation list
│       │   ├── use-messages.ts       # TanStack Query hooks for message history
│       │   └── use-message-search.ts # TanStack Query hook for search
│       ├── lib/
│       │   ├── token-buffer.ts       # rAF-based token buffer logic
│       │   ├── commands.ts           # Quick command definitions and handlers
│       │   └── media-upload.ts       # File upload utilities
│       ├── components/
│       │   ├── chat-layout.tsx        # ResizablePanelGroup with sidebar + main + right panel
│       │   ├── conversation-sidebar.tsx  # Conversation list with search
│       │   ├── chat-view.tsx          # Active chat: message list + input
│       │   ├── message-list.tsx       # ScrollArea with messages
│       │   ├── message-bubble.tsx     # Individual message with Streamdown
│       │   ├── streaming-lane.tsx     # Single agent's streaming area
│       │   ├── streaming-lanes.tsx    # Multi-agent parallel streaming container
│       │   ├── chat-input.tsx         # Textarea + send + attach + slash commands
│       │   ├── slash-command-popover.tsx  # Autocomplete dropdown for /commands
│       │   ├── command-palette.tsx    # Cmd+K global command palette
│       │   ├── tool-call-group.tsx    # Collapsible thinking step with progress
│       │   ├── tool-call-pipeline.tsx # Animated step-through visualization
│       │   ├── tool-output-panel.tsx  # Sheet for tool call output detail
│       │   ├── participant-panel.tsx  # Right panel: agents in room
│       │   ├── agent-picker-dialog.tsx  # New chat agent selection
│       │   ├── message-search.tsx     # Search input with scope toggle
│       │   └── media-preview.tsx      # Inline image/document/audio preview
│       └── index.ts
├── views/
│   └── chat/
│       ├── chat-hub-view.tsx          # /chat page composition
│       ├── agent-chat-view.tsx        # /chat/[agentId] composition
│       └── team-chat-view.tsx         # /chat/team/[conversationId] composition
app/
├── (dashboard)/
│   └── chat/
│       ├── page.tsx                   # /chat -> ChatHubView
│       ├── [agentId]/
│       │   └── page.tsx              # /chat/[agentId] -> AgentChatView
│       └── team/
│           └── [conversationId]/
│               └── page.tsx          # /chat/team/[conversationId] -> TeamChatView
```

### Pattern 1: Token Buffer with requestAnimationFrame Flush

**What:** Accumulate streaming tokens in a ref (not state) and flush to Zustand store at screen refresh rate, preventing re-render storms during high-frequency token emission.

**When to use:** Every streaming chat message. The gateway emits tokens at 30-100+ per second; directly calling setState per token would cause severe jank.

**Example:**

```typescript
// src/features/chat/lib/token-buffer.ts
import { useRef, useEffect, useCallback } from "react";

interface TokenBuffer {
  /** Accumulated tokens since last flush */
  buffer: string;
  /** Active rAF handle for cancellation */
  rafId: number | null;
  /** Whether a flush is scheduled */
  pending: boolean;
}

/**
 * Hook that buffers incoming tokens and flushes to a callback
 * at requestAnimationFrame rate (~60fps = ~16ms intervals).
 *
 * Usage:
 *   const appendToken = useTokenBuffer((flushed) => {
 *     chatStore.appendToStreamingMessage(messageId, flushed);
 *   });
 *
 *   eventBus.on('chat.stream.token', ({ token }) => appendToken(token));
 */
export function useTokenBuffer(
  onFlush: (tokens: string) => void,
): (token: string) => void {
  const bufferRef = useRef<TokenBuffer>({
    buffer: "",
    rafId: null,
    pending: false,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bufferRef.current.rafId !== null) {
        cancelAnimationFrame(bufferRef.current.rafId);
      }
    };
  }, []);

  const appendToken = useCallback(
    (token: string) => {
      bufferRef.current.buffer += token;

      if (!bufferRef.current.pending) {
        bufferRef.current.pending = true;
        bufferRef.current.rafId = requestAnimationFrame(() => {
          const flushed = bufferRef.current.buffer;
          bufferRef.current.buffer = "";
          bufferRef.current.pending = false;
          bufferRef.current.rafId = null;
          onFlush(flushed);
        });
      }
    },
    [onFlush],
  );

  return appendToken;
}
```

### Pattern 2: Chat Zustand Store with Streaming State

**What:** Zustand store managing all real-time chat state -- conversations, messages, active streaming lanes, draft text preservation, and typing indicators.

**When to use:** All chat components access shared state through this store.

**Example:**

```typescript
// src/features/chat/model/chat-store.ts (core structure)
import { create } from "zustand";
import type { ChatMessage, Conversation, StreamingLane } from "@/entities/chat-message";

interface ChatStore {
  // Conversation management
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;

  // Messages per conversation
  messages: Map<string, ChatMessage[]>;

  // Streaming state (multi-agent support)
  streamingLanes: Map<string, StreamingLane>; // key: `${conversationId}:${agentId}`

  // Draft preservation
  drafts: Map<string, string>; // conversationId -> unsent text

  // Actions
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  appendToStream: (conversationId: string, agentId: string, token: string) => void;
  finalizeStream: (conversationId: string, agentId: string, fullText: string) => void;
  saveDraft: (conversationId: string, text: string) => void;
  getDraft: (conversationId: string) => string;
}
```

### Pattern 3: Streaming Lane for Multi-Agent Parallel Display

**What:** When multiple agents stream simultaneously in a chatroom, each gets a dedicated visual "lane" (a section below the last message) showing their in-progress response. Once streaming completes, the lane content merges into the main conversation feed as a regular message.

**When to use:** Multi-agent chatrooms (CHAT-03) and any conversation where an agent is actively streaming.

**Example:**

```tsx
// src/features/chat/components/streaming-lanes.tsx (conceptual)
function StreamingLanes({ conversationId }: { conversationId: string }) {
  const lanes = useChatStore((s) => {
    const result: StreamingLane[] = [];
    for (const [key, lane] of s.streamingLanes) {
      if (key.startsWith(conversationId + ":")) {
        result.push(lane);
      }
    }
    return result;
  });

  if (lanes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border/50 pt-3">
      {lanes.map((lane) => (
        <StreamingLane
          key={lane.agentId}
          agentId={lane.agentId}
          content={lane.accumulatedText}
          isStreaming={lane.isActive}
        />
      ))}
    </div>
  );
}
```

### Pattern 4: Streamdown Integration for AI Messages

**What:** Use Streamdown component for all AI-generated message rendering, with `isAnimating` prop controlling the streaming cursor.

**When to use:** Every AI message in the chat.

**Example:**

```tsx
// src/features/chat/components/message-bubble.tsx (conceptual)
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

function AIMessageContent({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  return (
    <Streamdown
      plugins={{ code }}
      isAnimating={isStreaming}
    >
      {content}
    </Streamdown>
  );
}
```

### Pattern 5: Tool Call Visualization as Collapsible Pipeline

**What:** Tool calls during agent responses are grouped into a "thinking step" block. The block shows a progress indicator during execution and is expandable to show individual tool calls as an animated pipeline.

**When to use:** When the gateway emits tool call events during an agent's response.

**Example:**

```tsx
// src/features/chat/components/tool-call-group.tsx (conceptual)
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { motion } from "framer-motion";

function ToolCallGroup({
  tools,
  isExecuting,
}: {
  tools: ToolCallInfo[];
  isExecuting: boolean;
}) {
  const completedCount = tools.filter((t) => t.status === "completed").length;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground">
        {isExecuting ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        <span>
          {isExecuting
            ? `Running tools (${completedCount}/${tools.length})...`
            : `Used ${tools.length} tool${tools.length > 1 ? "s" : ""}`}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-1 pl-6 pt-2">
          {tools.map((tool, i) => (
            <ToolCallNode key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### Pattern 6: Event Bus Subscription for Chat Streaming

**What:** Wire the existing EventBus stream events into the chat Zustand store. The EventBus already has typed events for `chat.stream.start`, `chat.stream.token`, and `chat.stream.end`.

**When to use:** At the chat feature level -- a single subscription point that routes all streaming events to the appropriate store actions.

**Example:**

```typescript
// src/features/chat/lib/chat-stream-subscriptions.ts
import type { EventBus } from "@/features/gateway-connection/lib/event-bus";
import { useChatStore } from "../model/chat-store";

export function initChatStreamSubscriptions(eventBus: EventBus): () => void {
  const unsubs: Array<() => void> = [];

  unsubs.push(
    eventBus.on("chat.stream.start", ({ sessionId, messageId }) => {
      useChatStore.getState().startStream(sessionId, messageId);
    }),
  );

  unsubs.push(
    eventBus.on("chat.stream.token", ({ sessionId, messageId, token }) => {
      // Token goes to buffer, not directly to store
      // Buffer flush calls appendToStream
      useChatStore.getState().bufferToken(sessionId, messageId, token);
    }),
  );

  unsubs.push(
    eventBus.on("chat.stream.end", ({ sessionId, messageId, fullText }) => {
      useChatStore.getState().finalizeStream(sessionId, messageId, fullText);
    }),
  );

  return () => unsubs.forEach((fn) => fn());
}
```

### Discretion Recommendations

#### Conversation Sidebar Organization: Hybrid (Recommended)

**Recommendation:** Hybrid approach -- pinned conversations at top, then "Rooms" section (multi-agent chatrooms), then "Direct" section (1:1 agent chats), sorted by recency within each group.

**Reasoning:** Pure flat-recent loses the ability to distinguish room types at a glance. Pure grouped-by-type forces users to scan multiple sections to find recent conversations. The hybrid gives structure without sacrificing recency. The pinned section (max 3-5) lets users keep their most active conversations accessible regardless of type.

#### Message Visual Style: Full-Width Blocks (Recommended)

**Recommendation:** Full-width message blocks (not bubbles).

**Reasoning:** In multi-agent rooms with parallel streaming lanes, bubbles would create chaotic zigzagging layouts. Full-width blocks stack cleanly, provide consistent alignment for the streaming lanes, and give markdown content (code blocks, tables, lists) room to breathe. This matches Claude.ai, ChatGPT, and most professional AI chat UIs. User messages distinguished by subtle background color shift (slightly lighter than AI messages), not by alignment.

#### Markdown Rendering Timing: Live During Stream (Recommended)

**Recommendation:** Render markdown live during streaming using Streamdown's `isAnimating` prop.

**Reasoning:** Streamdown was built specifically for this purpose. It handles unterminated markdown blocks gracefully via its `remend` engine. Waiting until streaming completes to render markdown would show raw text during streaming, which is jarring and defeats the purpose of token-by-token display. Streamdown's approach of completing incomplete markdown syntax during streaming provides the best user experience.

#### Tool Call Error Visual Treatment (Recommended)

**Recommendation:** Error states use a destructive badge variant (red) on the tool call node, with the node showing an X icon instead of a checkmark. The tool call group header shows "Tool error" in destructive text. Clicking the errored tool opens the Sheet side panel showing the full error message, stack trace (if available), and a "Retry" action button.

**Reasoning:** Errors should be visible but not alarming to the point of disrupting the chat flow. The red badge provides clear visual signal without blocking the conversation. The side panel keeps error details accessible without cluttering the chat.

### Anti-Patterns to Avoid

- **Direct setState per token:** Never call `setState` or `setMessages` for every individual streaming token. This causes 30-100+ re-renders/second and severe UI jank. Always buffer tokens and flush at rAF rate.
- **Re-rendering entire message list on token:** Use Zustand selectors so only the actively streaming message component re-renders, not the entire message list.
- **Storing streaming text in TanStack Query:** TanStack Query is for server state (fetched data). Streaming token accumulation is transient local state -- use Zustand. Only move finalized messages into TanStack Query cache.
- **Using react-markdown for streaming content:** react-markdown breaks on incomplete markdown (unclosed bold `**text`, partial code blocks). Use Streamdown instead.
- **Interleaving multi-agent streaming tokens in one view:** The user decision explicitly requires separate visual lanes. Never mix tokens from different agents into one stream.
- **Using contentEditable for chat input:** Causes hydration mismatches and accessibility issues. Use a native `<textarea>` with controlled state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming markdown rendering | Custom markdown parser with incomplete block handling | Streamdown ^2.2.0 | Handles 10+ types of unterminated markdown blocks (bold, italic, code, links, headings, strikethrough, math). Vercel battle-tested. |
| Incomplete markdown completion | Custom regex to close unclosed markdown tags | remend ^1.2.0 (bundled with Streamdown) | Handles nested cases, code blocks within bold, images, KaTeX. Context-aware -- knows if you're inside a code block vs inline code. |
| Code syntax highlighting | Manual shiki + rehype-shiki configuration for streaming | @streamdown/code ^1.0.2 | Tree-shakeable plugin, pre-configured with Shiki, includes copy/download buttons, handles partial code blocks during stream. |
| Resizable pane layout | Custom CSS resize handles | react-resizable-panels (shadcn Resizable) | Keyboard accessible, touch optimized, persistence support, battle-tested drag mechanics. |
| Command palette | Custom keyboard listener + dialog + filtering | cmdk ^1.1.1 (shadcn Command) | Fast, unstyled, accessible, keyword search, group support, TypeScript-native. |
| Token batching | Custom setInterval-based batching | useTokenBuffer with requestAnimationFrame | rAF syncs with browser paint cycle for optimal smoothness. setInterval can fire between frames causing wasted renders. |

**Key insight:** The streaming markdown problem is deceptively complex. What seems like "just render markdown as it comes in" actually involves handling 10+ types of unterminated syntax, avoiding flashing/flickering as markdown structures complete mid-stream, and maintaining consistent DOM structure as content grows. Streamdown has solved this problem thoroughly; hand-rolling it would take weeks and produce an inferior result.

## Common Pitfalls

### Pitfall 1: Re-Render Storm During Streaming

**What goes wrong:** Every streaming token triggers a React state update and full component tree re-render. At 50+ tokens/second, this causes visible jank, dropped frames, and unresponsive UI.

**Why it happens:** Naive implementation directly calls `setState` in the WebSocket message handler for each token.

**How to avoid:** Use the token buffer pattern (ref-based accumulation + rAF flush). The buffer collects tokens between animation frames and flushes once per frame (~60 times/second max). Additionally, use Zustand selectors to ensure only the actively streaming message component re-renders -- not the entire message list.

**Warning signs:** Laggy typing in the input while an agent is streaming. Browser dev tools showing thousands of React commits per second. Message text appearing in chunks rather than smoothly.

### Pitfall 2: Scroll Position Jumping During Streaming

**What goes wrong:** As new tokens add content and the message grows, the scroll position jumps erratically. Users trying to read earlier messages get pulled to the bottom. Or conversely, the view doesn't auto-scroll when the user is at the bottom.

**Why it happens:** Content height changes during streaming without coordinated scroll management.

**How to avoid:** Implement "sticky bottom" behavior: auto-scroll to bottom ONLY if the user is already at/near the bottom (within ~50px threshold). If the user has scrolled up to read earlier messages, do NOT auto-scroll -- instead show a "New messages below" indicator. Use `scrollTo({ behavior: 'smooth' })` for auto-scrolling and track scroll position via `onScroll` handler.

**Warning signs:** Users complaining about losing their place while reading. Scroll position flickering rapidly during fast streaming.

### Pitfall 3: Memory Leak from Uncleared Event Bus Subscriptions

**What goes wrong:** Chat components subscribe to EventBus events (`chat.stream.*`) but don't clean up when unmounting. Over time, zombie handlers accumulate, causing memory leaks and duplicate message handling.

**Why it happens:** Forgetting to return cleanup functions from useEffect, or subscribing in event handlers that fire multiple times.

**How to avoid:** Always store the unsubscribe function returned by `eventBus.on()` and call it in the useEffect cleanup. For the chat feature, create a single subscription initialization function (like `initChatStreamSubscriptions`) called once at the chat layout level, returning a cleanup function.

**Warning signs:** Messages appearing multiple times. Memory usage growing over time. Console warnings about state updates on unmounted components.

### Pitfall 4: Stale Closure in Token Buffer

**What goes wrong:** The rAF callback captures a stale reference to the store action, causing tokens to be flushed with outdated context (wrong conversation, wrong message).

**Why it happens:** JavaScript closure semantics -- the rAF callback closes over the `onFlush` value at creation time, not at execution time.

**How to avoid:** Use `useCallback` with proper dependencies for the flush handler. Alternatively, use a ref to always access the latest flush function: `const onFlushRef = useRef(onFlush); onFlushRef.current = onFlush;` and call `onFlushRef.current(flushed)` in the rAF callback.

**Warning signs:** Tokens appearing in the wrong conversation after switching. Streaming content freezing after conversation switch.

### Pitfall 5: Hydration Mismatch with Dynamic Timestamps

**What goes wrong:** Server-rendered message timestamps (e.g., "2 minutes ago") don't match client-rendered timestamps, causing React hydration errors.

**Why it happens:** Server renders at time T, client hydrates at time T+N, relative timestamps differ.

**How to avoid:** For message timestamps, either (a) render the absolute time on the server and enhance to relative time on the client via useEffect, or (b) use `suppressHydrationWarning` on timestamp elements, or (c) render timestamps only on the client with a `useEffect` guard. The cleanest approach: render timestamps as a client-only component with a `mounted` state guard.

**Warning signs:** React hydration warnings in the console mentioning timestamp text content mismatch.

### Pitfall 6: Oversized Bundle from Shiki Language Grammars

**What goes wrong:** Importing all Shiki languages loads 5MB+ of TextMate grammars into the client bundle.

**Why it happens:** Using `shiki` directly with all languages bundled, or not configuring lazy loading.

**How to avoid:** The `@streamdown/code` plugin handles this by using Shiki's lazy loading. If customizing: use `shiki/bundle/web` (common web languages only) or configure explicit language lists. Tree-shaking only works when using the fine-grained imports.

**Warning signs:** Slow initial page load. Bundle analyzer showing multi-megabyte shiki chunks.

## Code Examples

### Chat Store Initialization with EventBus Wiring

```typescript
// src/features/chat/model/chat-store.ts
import { create } from "zustand";
import type { EventBus } from "@/features/gateway-connection/lib/event-bus";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  agentId?: string;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallInfo[];
  attachments?: Attachment[];
}

export interface ToolCallInfo {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "error";
  output?: string;
  error?: string;
}

export interface StreamingLane {
  agentId: string;
  agentName: string;
  messageId: string;
  accumulatedText: string;
  isActive: boolean;
  toolCalls: ToolCallInfo[];
}

export interface Conversation {
  id: string;
  type: "direct" | "room" | "team"; // 1:1, multi-agent user-created, agent-initiated
  agentIds: string[];
  title: string;
  lastMessage?: string;
  lastActivity: Date;
  unreadCount: number;
  isPinned: boolean;
}

interface ChatStore {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  messages: Map<string, ChatMessage[]>;
  streamingLanes: Map<string, StreamingLane>;
  drafts: Map<string, string>;

  // Actions
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  startStream: (conversationId: string, agentId: string, messageId: string) => void;
  appendToStream: (laneKey: string, token: string) => void;
  finalizeStream: (conversationId: string, agentId: string, fullText: string) => void;
  saveDraft: (conversationId: string, text: string) => void;
  getDraft: (conversationId: string) => string;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: new Map(),
  activeConversationId: null,
  messages: new Map(),
  streamingLanes: new Map(),
  drafts: new Map(),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const messages = new Map(state.messages);
      const existing = messages.get(conversationId) ?? [];
      messages.set(conversationId, [...existing, message]);
      return { messages };
    }),

  startStream: (conversationId, agentId, messageId) =>
    set((state) => {
      const lanes = new Map(state.streamingLanes);
      const key = `${conversationId}:${agentId}`;
      lanes.set(key, {
        agentId,
        agentName: "", // Resolved from agent store
        messageId,
        accumulatedText: "",
        isActive: true,
        toolCalls: [],
      });
      return { streamingLanes: lanes };
    }),

  appendToStream: (laneKey, token) =>
    set((state) => {
      const lanes = new Map(state.streamingLanes);
      const lane = lanes.get(laneKey);
      if (lane) {
        lanes.set(laneKey, {
          ...lane,
          accumulatedText: lane.accumulatedText + token,
        });
      }
      return { streamingLanes: lanes };
    }),

  finalizeStream: (conversationId, agentId, fullText) =>
    set((state) => {
      const laneKey = `${conversationId}:${agentId}`;
      const lane = state.streamingLanes.get(laneKey);
      const lanes = new Map(state.streamingLanes);
      lanes.delete(laneKey);

      // Move finalized content to message list
      const messages = new Map(state.messages);
      const existing = messages.get(conversationId) ?? [];
      messages.set(conversationId, [
        ...existing,
        {
          id: lane?.messageId ?? "",
          conversationId,
          role: "assistant",
          agentId,
          content: fullText,
          timestamp: new Date(),
          toolCalls: lane?.toolCalls ?? [],
        },
      ]);

      return { streamingLanes: lanes, messages };
    }),

  saveDraft: (conversationId, text) =>
    set((state) => {
      const drafts = new Map(state.drafts);
      if (text.trim()) {
        drafts.set(conversationId, text);
      } else {
        drafts.delete(conversationId);
      }
      return { drafts };
    }),

  getDraft: (conversationId) => get().drafts.get(conversationId) ?? "",
}));
```

### Quick Command Definitions

```typescript
// src/features/chat/lib/commands.ts
import type { LucideIcon } from "lucide-react";
import { Plus, Minimize2, Activity, RotateCcw } from "lucide-react";

export interface QuickCommand {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  shortcut?: string;
  action: (context: CommandContext) => void | Promise<void>;
}

export interface CommandContext {
  conversationId: string | null;
  agentId: string | null;
  gatewayClient: import("@/features/gateway-connection/lib/gateway-client").GatewayClient;
}

export const quickCommands: QuickCommand[] = [
  {
    id: "new",
    label: "/new",
    description: "Start a new conversation",
    icon: Plus,
    keywords: ["new", "create", "start", "conversation", "chat"],
    shortcut: "Cmd+N",
    action: (ctx) => {
      // Open agent picker dialog
    },
  },
  {
    id: "compact",
    label: "/compact",
    description: "Compact the current session (reduce context)",
    icon: Minimize2,
    keywords: ["compact", "compress", "reduce", "context", "session"],
    action: async (ctx) => {
      if (ctx.agentId) {
        // Send compact command via gateway
      }
    },
  },
  {
    id: "status",
    label: "/status",
    description: "Show agent status and session info",
    icon: Activity,
    keywords: ["status", "info", "session", "agent", "health"],
    action: (ctx) => {
      // Insert status message into chat
    },
  },
  {
    id: "reset",
    label: "/reset",
    description: "Reset the current session",
    icon: RotateCcw,
    keywords: ["reset", "clear", "restart", "session"],
    action: async (ctx) => {
      // Confirm and reset session via gateway
    },
  },
];
```

### Query Key Extensions for Chat

```typescript
// Extend src/shared/lib/query-keys.ts
export const queryKeys = {
  // ... existing keys ...
  conversations: {
    all: ["conversations"] as const,
    lists: () => [...queryKeys.conversations.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.conversations.lists(), filters] as const,
    details: () => [...queryKeys.conversations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
  },
  messages: {
    all: ["messages"] as const,
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, "conversation", conversationId] as const,
    search: (query: string, scope?: string) =>
      [...queryKeys.messages.all, "search", { query, scope }] as const,
  },
} as const;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-markdown for streaming AI | Streamdown (Vercel) | 2025 | Handles unterminated blocks, built-in streaming cursor, Tailwind-native, security hardening. No more flickering markdown during streaming. |
| Manual shiki + rehype integration | @streamdown/code plugin | 2025 | Tree-shakeable, pre-configured, handles partial code blocks during stream. |
| Socket.IO rooms for chat | Raw WebSocket + EventBus | Phase 1 decision | AXion Hub uses raw WS to match OpenClaw Gateway protocol. EventBus provides typed pub/sub. Already built in Phase 1. |
| useState for streaming tokens | useRef buffer + rAF flush + Zustand | 2024+ | Industry standard for high-frequency streaming UIs. Reduces re-renders from 50+/sec to ~20/sec. |
| contentEditable chat input | Native textarea + custom styling | Ongoing | contentEditable causes hydration issues, accessibility problems, and inconsistent behavior across browsers. |

**Deprecated/outdated:**
- **react-markdown for AI streaming:** Still works for static markdown, but breaks on incomplete streaming content. Streamdown is the purpose-built replacement.
- **marked for React rendering:** Uses raw innerHTML injection which is unsafe for user/AI-generated content in chat. Streamdown and react-markdown both render to React elements safely.

## Open Questions

1. **Gateway tool call event protocol**
   - What we know: EventBus has `chat.stream.start/token/end` typed events. The gateway sends tool execution events during agent responses.
   - What's unclear: The exact event names and payload shapes for tool call start, progress, completion, and error. Are they `tool.call.start`, `tool.call.result`? Or nested within `chat.stream.*`?
   - Recommendation: Extend the EventBus KnownEvents with provisional tool call event types. Validate against live gateway in integration testing. The planner should define placeholder event types that can be adjusted.

2. **Media upload protocol**
   - What we know: GatewayClient has `sendMessage(agentId, message, sessionId)` for text. CHAT-05 requires images, documents, and audio.
   - What's unclear: Does the OpenClaw Gateway accept binary/multipart uploads via WebSocket? Or does it require a separate HTTP upload endpoint with the URL passed in the message?
   - Recommendation: Plan for HTTP upload to a local/remote storage endpoint that returns a URL, then include the URL in the message payload. This is the most common pattern and doesn't require WebSocket binary frame support.

3. **Conversation persistence**
   - What we know: Sessions exist in the gateway (GatewayClient.getSessions). Messages are in JSONL session files on the gateway filesystem.
   - What's unclear: Whether conversations (which map to sessions) should also be stored in AXion Hub's PostgreSQL database for faster search/indexing, or fetched purely from the gateway.
   - Recommendation: Store conversation metadata (id, type, agents, last activity, pinned state) in PostgreSQL for fast sidebar loading. Fetch actual messages from the gateway on demand. This gives fast conversation list rendering without duplicating message storage.

4. **Agent-initiated chatrooms**
   - What we know: User decision says "Agents can also initiate chatrooms with other agents autonomously."
   - What's unclear: What gateway event signals an agent-initiated chatroom? How does the UI learn about a new room created by agents?
   - Recommendation: Plan for a `chat.room.created` event (or similar) from the gateway EventBus. The chat store should handle new conversations appearing without user action. Show a notification when an agent-initiated room appears.

## Sources

### Primary (HIGH confidence)
- Context7: `/vercel/streamdown` -- Streaming markdown rendering, remend integration, plugin system, API reference
- Context7: `/bvaughn/react-resizable-panels` -- Panel layout API, conditional panels, persistent layouts, nested groups
- Context7: `/pacocoursey/cmdk` -- Command palette Dialog, keyboard shortcut, groups, items, keywords, TypeScript types
- Context7: `/shikijs/shiki` -- Rehype integration, fine-grained bundles, async highlighting
- npm registry (verified 2026-02-18): streamdown@2.2.0, @streamdown/code@1.0.2, remend@1.2.0, react-resizable-panels@4.6.4, cmdk@1.1.1
- Existing codebase: EventBus types (`chat.stream.start/token/end`), GatewayClient.sendMessage(), WebSocketManager, Zustand connection store pattern

### Secondary (MEDIUM confidence)
- [Streamdown official site](https://streamdown.ai/) -- Plugin API, props, security features
- [Vercel changelog](https://vercel.com/changelog/introducing-streamdown) -- Streamdown introduction and purpose
- [akashbuilds.com](https://akashbuilds.com/blog/chatgpt-stream-text-react) -- rAF token buffer pattern, performance optimization
- [patterns.dev](https://www.patterns.dev/react/ai-ui-patterns/) -- AI UI patterns for streaming
- [shadcn/ui docs](https://ui.shadcn.com/docs/components/radix/resizable) -- Resizable component API (wraps react-resizable-panels v4)

### Tertiary (LOW confidence)
- Tool call event protocol -- based on inference from existing EventBus types and Claude.ai's UI approach. Needs validation against live OpenClaw Gateway.
- Media upload protocol -- assumed HTTP upload pattern. Needs validation against OpenClaw Gateway capabilities.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified via npm registry. Streamdown confirmed as Vercel's production solution. react-resizable-panels and cmdk confirmed via Context7 docs.
- Architecture: HIGH -- Patterns follow established project conventions (Zustand for PUSH, TanStack Query for PULL, EventBus subscriptions). Token buffer pattern is industry standard, verified via multiple sources.
- Pitfalls: HIGH -- Re-render storms, scroll management, and stale closures are well-documented challenges in streaming chat UIs. Shiki bundle size is a known issue with documented mitigations.
- Streaming integration: MEDIUM -- EventBus events for chat streaming exist in type definitions but haven't been tested against a live gateway. Tool call events are inferred.
- Media support: MEDIUM -- Upload protocol is assumed (HTTP upload + URL in message). Needs gateway validation.

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days -- Streamdown is actively developed, check for new releases)
