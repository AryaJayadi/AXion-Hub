---
status: testing
phase: 06-mission-board
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md]
started: 2026-02-18T13:30:00Z
updated: 2026-02-18T13:30:00Z
---

## Current Test

number: 1
name: View Kanban Board
expected: |
  Navigate to /missions. A Kanban board loads with 6 columns: INBOX, QUEUED, IN PROGRESS, IN REVIEW, DONE, ARCHIVED. Mock task cards are distributed across columns. A board sidebar appears on the left with board navigation.
awaiting: user response

## Tests

### 1. View Kanban Board
expected: Navigate to /missions. A Kanban board loads with 6 columns (INBOX, QUEUED, IN PROGRESS, IN REVIEW, DONE, ARCHIVED). Mock task cards are distributed across columns. A board sidebar appears on the left with board navigation.
result: [pending]

### 2. Drag-and-Drop Card Movement
expected: Drag a task card from one column to another. The card moves to the target column with smooth animation. A drag overlay appears while dragging.
result: [pending]

### 3. Card Visual Details
expected: Task cards show a colored priority border stripe on the left, agent avatars (with working-glow for active agents), due date, tags, and subtask progress indicator.
result: [pending]

### 4. Create a Task
expected: Click "New Task" button on the board (or navigate to /missions/new). A creation form appears with fields for title, description, priority, assigned agents, reviewer, tags, subtasks, due date, and sign-off toggle. Submitting creates the task and it appears on the board.
result: [pending]

### 5. Click Card Opens Slide-Over
expected: Click (not drag) a task card. A slide-over sheet panel opens from the right showing task details, with an "expand to full page" link and delete button with confirmation dialog.
result: [pending]

### 6. Full Task Detail Page
expected: Navigate to /missions/[taskId] (or expand from slide-over). A two-column layout shows task content on the left (description, subtask checklist, activity tabs) and metadata sidebar on the right (status dropdown, priority, agents, sign-off toggle).
result: [pending]

### 7. Activity Timeline and Dispatch Log
expected: In task detail, an Activity tab shows a vertical timeline with timestamped entries, actor avatars, and type-specific icons/colors. Agent detail entries have an expandable toggle showing tool calls and reasoning. A Dispatch Log tab filters to agent-only events in table format.
result: [pending]

### 8. Deliverable Preview Cards
expected: In task detail, deliverables section shows preview cards with type-specific rendering: file deliverables show thumbnails, code deliverables show first 3 lines of code (click to expand full snippet), link deliverables show clickable URLs.
result: [pending]

### 9. Sign-Off Gate and Review Modal
expected: On a task with sign-off required, a status banner shows the sign-off state (pending/approved/rejected/revision). Clicking "Review" opens a modal with deliverable list and three action buttons (Approve, Reject, Request Revision). Reject and Revision require a non-empty comment.
result: [pending]

### 10. Task Comments with @Mentions
expected: In task detail, a comments section shows existing comments. Type a new comment and press @. A popover opens with searchable agent and human lists. Selecting a mention inserts it. Submitted mentions render as colored inline badges (blue for agents, purple for humans).
result: [pending]

### 11. Board List Page
expected: Navigate to /missions/boards. A grid of board cards appears showing board names, task counts, and creation dates. A "Create Board" button is available.
result: [pending]

### 12. Board Settings
expected: Navigate to a board's settings page. General section allows renaming. Columns section shows core columns as read-only (with lock icon) and allows adding custom columns. An automation rules section shows trigger-action configuration.
result: [pending]

## Summary

total: 12
passed: 0
issues: 0
pending: 12
skipped: 0

## Gaps

[none yet]
