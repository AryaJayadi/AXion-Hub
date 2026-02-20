# Phase 4: Real-Time Chat - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-pane chat interface for conversing with AI agents in real time. Supports 1:1 agent chats, multi-agent chatrooms (user-created and agent-initiated), streaming responses with tool call visualization, media support, session management, quick commands, and message search. Creating/managing agents is Phase 3; workflow automation is Phase 9.

</domain>

<decisions>
## Implementation Decisions

### Chat layout & panes
- Sidebar + single chat layout: conversation list in left sidebar, one active chat fills main area
- Multi-agent chatrooms supported — not just 1:1. Users can create rooms with multiple agents
- Agents can also initiate chatrooms with other agents autonomously
- Collapsible right panel for participants: lists all agents in the room with status, role, and model info
- When observing agent-to-agent conversations, user can interject — sends messages as a full participant, not read-only

### Streaming & message display
- Smooth character-by-character token rendering with blinking cursor during streaming
- When multiple agents stream simultaneously in a room, each gets a separate visual lane/section — parallel but organized, no interleaving
- Messages merge into the conversation feed once streaming completes

### Tool call presentation
- Tool calls grouped as a "thinking step" with a progress indicator (like Claude.ai's approach)
- Expanding a step shows individual tool calls
- In-progress tools shown as animated step-through: a visual mini-pipeline where each tool call is a node that lights up as it executes
- Tool call output opens in a side panel on click — chat stays clean
- Error presentation: Claude's discretion

### Session & conversation flow
- New chat flow: pick agent(s) first from a picker, then start typing. Room is created with selected agents
- Quick commands: both slash command autocomplete in input (type '/' for dropdown) AND a Cmd+K command palette — two ways to access same actions
- Switching conversations: unsent draft text is preserved, but chat scrolls to bottom on return
- Message search: default search scopes to current chat, with toggle/shortcut to switch to global search across all conversations

### Claude's Discretion
- Conversation sidebar organization (grouped by type, flat recent, or hybrid)
- Message visual style (bubbles vs full-width blocks) — pick what suits multi-agent rooms best
- Markdown rendering timing (live during stream vs after complete)
- Tool call error visual treatment
- Loading skeleton design
- Exact spacing, typography, and animations

</decisions>

<specifics>
## Specific Ideas

- Multi-agent simultaneous streaming with separate visual lanes is a key differentiator — should feel like watching a team work in parallel, not a chaotic group chat
- Animated tool call step-through should feel like a mini workflow visualization, giving transparency into what the agent is doing
- Agent-to-agent rooms where the user can interject positions the user as a supervisor/director, not just an observer
- The participant panel should make it immediately clear who's in the room and what each agent's current state is

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-real-time-chat*
*Context gathered: 2026-02-18*
