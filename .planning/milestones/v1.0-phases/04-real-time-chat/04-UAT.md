---
status: testing
phase: 04-real-time-chat
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md]
started: 2026-02-18T05:20:00Z
updated: 2026-02-18T06:15:00Z
---

## Current Test

number: 2
name: Conversation Sidebar Organization
expected: |
  The conversation sidebar shows sections for pinned conversations, rooms/teams, and direct chats. Each entry shows avatar initials, conversation name, relative timestamp, and unread badge. A search input filters conversations.
awaiting: user response

## Tests

### 1. Chat Hub Layout
expected: Navigating to /chat shows a three-panel resizable layout: conversation sidebar on the left, main chat area in the center, and a collapsible participant panel on the right. Panels can be resized by dragging handles.
result: pass
notes: Fixed — required chat route layout (has() selector for full-bleed), div wrapper in ChatLayout, and string percentages for panel sizes (v4 API change: numbers = pixels, strings = percentages)

### 2. Conversation Sidebar Organization
expected: The conversation sidebar shows sections for pinned conversations, rooms/teams, and direct chats. Each entry shows avatar initials, conversation name, relative timestamp, and unread badge. A search input filters conversations.
result: [pending]

### 3. Agent Chat Route
expected: Navigating to /chat/[agentId] (e.g. clicking a direct conversation) opens a 1:1 chat view with the agent in the main panel. The participant panel shows the agent.
result: [pending]

### 4. Chat Input Behavior
expected: The chat input textarea auto-resizes as you type multiple lines. Pressing Enter sends the message. Pressing Shift+Enter inserts a newline without sending.
result: [pending]

### 5. Message Rendering with Markdown
expected: AI messages in the chat render with formatted markdown (headings, bold, code blocks with syntax highlighting). User messages appear as plain text bubbles with author info.
result: [pending]

### 6. Sticky-Bottom Auto-Scroll
expected: When at the bottom of the message list, new messages auto-scroll into view. When scrolled up, a "New messages" button appears. Clicking it scrolls back to the bottom.
result: [pending]

### 7. Tool Call Visualization
expected: When an AI message includes tool calls, they appear as collapsible "thinking step" blocks showing tool name, status (running/completed/error), and animated pipeline with connecting lines.
result: [pending]

### 8. Tool Output Side Panel
expected: Clicking on a tool call node opens a Sheet side panel showing the tool's arguments, output, error details, and timing information.
result: [pending]

### 9. Media Upload via Drag-and-Drop
expected: Dragging an image file over the chat area shows a drop overlay. Dropping the file adds it as a pending attachment chip below the chat input with a remove button.
result: [pending]

### 10. Media Upload via File Picker
expected: Clicking the paperclip/attachment button in the chat input opens a file picker. Selecting a file adds it as a pending attachment chip. Images show a thumbnail preview; documents show a file icon.
result: [pending]

### 11. Slash Command Popover
expected: Typing "/" at the start of the chat input opens an autocomplete popover showing available commands (/new, /compact, /status, /reset). Arrow keys navigate the list, Enter selects a command.
result: [pending]

### 12. Cmd+K Command Palette
expected: Pressing Cmd+K (or Ctrl+K) opens a global command palette overlay showing available quick commands. Typing filters the list. Selecting a command executes it.
result: [pending]

### 13. Agent Picker Dialog
expected: Triggering "New conversation" (via /new command or new chat button) opens a dialog where you can search and select one or more agents to start a conversation with.
result: [pending]

### 14. Message Search
expected: The conversation sidebar has a search feature. Typing a query filters/searches messages. A scope toggle switches between "current chat" and "all chats" search.
result: [pending]

### 15. Team Chat View
expected: Navigating to /chat/team/[conversationId] shows a read-only view of agent-to-agent conversation with a dismissible interjection banner indicating you can jump in.
result: [pending]

## Summary

total: 15
passed: 1
issues: 0
pending: 14
skipped: 0

## Gaps

[none yet]
