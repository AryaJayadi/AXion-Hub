# Phase 6: Mission Board - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Kanban task management for assigning, tracking, and governing agent work. Drag-and-drop boards with task creation, detail views, deliverables, sign-off gates, comments with @mentions, and multi-board organization. Agents interact bidirectionally — receiving dispatched tasks and pushing status updates back through the gateway.

</domain>

<decisions>
## Implementation Decisions

### Board layout & card design
- Standard card density: title, priority badge, assigned agent(s), due date, and tag chips. Full detail on click.
- Priority shown via color-coded left border stripe (red=critical, orange=high, blue=medium, gray=low)
- Multiple assigned agents shown as stacked overlapping avatars (up to 3, then +N)
- Pulsing glow on cards when assigned agent is actively working on that task (matches Phase 3 agent card glow pattern)

### Drag-and-drop & task flow
- Full 6-column pipeline: INBOX → QUEUED → IN PROGRESS → IN REVIEW → DONE → ARCHIVED
- Auto-transitions from agent activity: agent starts working → IN PROGRESS, submits deliverable → IN REVIEW
- Semantic drag actions: dragging to IN PROGRESS dispatches task to assigned agent, dragging to ARCHIVED triggers cleanup
- Default sort by priority (critical on top) within each column, but users can manually drag to reorder (manual order overrides auto-sort until reset)

### Task detail & deliverables
- Dual access: slide-over panel by default when clicking from board, full page at /missions/[taskId] via expand button or direct URL
- Deliverables shown as inline preview cards with thumbnails (images, code snippets, PDFs). Click to expand full view.
- Sign-off gate uses a focused review modal: shows deliverables side-by-side with approve/reject/request revision buttons and required comment for rejection/revision
- Activity timeline is layered: high-level events by default (status changes, comments, deliverable uploads, assignment changes) with a toggle to expand agent-level detail (tool calls, reasoning steps) for any event

### Agent integration
- Agents interact with the board bidirectionally via the gateway: receive dispatched tasks and push status updates
- 6 core columns have fixed semantic roles agents understand (inbox, queued, working, review, done, archived)
- Users can add optional human-only columns between core columns (e.g., "DESIGN REVIEW" between REVIEW and DONE) — agents skip these
- Agent-to-agent delegation creates separate linked cards on the board (not subtasks), with a relationship indicator to the parent task

### Board organization
- Every org gets an auto-created "General" board by default — can be renamed, additional boards created
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

</decisions>

<specifics>
## Specific Ideas

- Card pulsing glow should be consistent with the agent card glow from Phase 3 (box-shadow based, not border-width)
- Slide-over panel for quick task peek (like Notion's peek view), full page for deep dive (like Linear's issue page)
- Stacked avatars pattern similar to GitHub PR reviewers
- Board sidebar similar to Notion's page tree navigation
- Review modal should feel deliberate — not accidental approvals

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-mission-board*
*Context gathered: 2026-02-18*
