---
status: testing
phase: 08-sessions-memory-files-governance
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md, 08-04-SUMMARY.md, 08-05-SUMMARY.md, 08-06-SUMMARY.md]
started: 2026-02-19T12:00:00Z
updated: 2026-02-19T12:00:00Z
---

## Current Test

number: 1
name: Session List with Group Toggle
expected: |
  Navigate to /sessions. A DataTable shows sessions across multiple agents with columns for agent, status, model, tokens, cost, and duration. A "Group by agent" toggle groups sessions under agent headers when enabled.
awaiting: user response

## Tests

### 1. Session List with Group Toggle
expected: Navigate to /sessions. A DataTable shows sessions across multiple agents with columns for agent, status, model, tokens, cost, and duration. A "Group by agent" toggle groups sessions under agent headers when enabled.
result: [pending]

### 2. Session Detail with Stats
expected: Click a session row in the table. Navigate to /sessions/[sessionId]. Four stat cards show tokens used, estimated cost, session duration, and message count. A "View Transcript" link is visible.
result: [pending]

### 3. Transcript Viewer with Flat/Tree Toggle
expected: Click "View Transcript" from session detail. The transcript page shows messages in chronological order. A flat/tree ToggleGroup switches between flat chronological view and branching tree view with depth indentation. Tool call blocks appear as collapsed/expandable sections showing tool name, args, and output.
result: [pending]

### 4. Memory Browser
expected: Navigate to /memory. A split layout shows a sidebar (w-72) with collapsible agent sections. Each agent expands to show memory types (persistent, daily, conversation). Clicking a memory file shows a read-only markdown preview in the content area.
result: [pending]

### 5. Memory Search
expected: Navigate to /memory/search. A search input and agent filter dropdown are visible. Typing a query shows search result cards in a grid with agent badges, relevance dots (5-dot scale), and highlighted snippet text. URL updates with search params (shareable link).
result: [pending]

### 6. Workspace File Browser
expected: Navigate to /workspace. A resizable split layout shows a recursive file tree sidebar on the left and a content editor on the right. The tree shows shared and per-agent directories with expand/collapse folders and file-type icons.
result: [pending]

### 7. Workspace Code Editor
expected: In /workspace, click a code file (e.g., .ts or .py). A CodeMirror editor opens with syntax highlighting. For .md files, an MDEditor opens in split-pane preview mode. An auto-save indicator shows "Saving..."/"Saved" status.
result: [pending]

### 8. Standalone File Editor
expected: Navigate to /workspace/[agentId]/[...path] (e.g., from a file link). A standalone file editor page opens with breadcrumb navigation showing the full path. The editor matches the inline workspace editor behavior.
result: [pending]

### 9. Deliverables Table
expected: Navigate to /deliverables. Deliverables are grouped by task with section headers showing task titles (clickable links to /missions/[taskId]). Filter dropdowns for task status and agent are present. Deliverable preview cards show file information.
result: [pending]

### 10. File Upload
expected: Navigate to /workspace/upload. A drag-and-drop upload zone accepts files (with 50MB size limit). A target selector lets you choose between shared workspace and per-agent directories. Dropping/selecting files shows a file list with upload button and toast feedback on completion.
result: [pending]

### 11. Approval Queue
expected: Navigate to /approvals. An inbox-style DataTable shows pending approvals with priority dots, task name, agent, deliverable count, and submission time. Clicking a row navigates to /approvals/[taskId].
result: [pending]

### 12. Approval Detail & Actions
expected: Click an approval row. A two-column layout shows deliverable preview cards with activity timeline on the left and task info on the right. Three action buttons (Approve, Reject, Request Revision) are available. Reject/Revision require comments. Submitting an action shows a toast and removes the item from the inbox list.
result: [pending]

### 13. Audit Log
expected: Navigate to /audit. A compact table shows audit log entries with actor, action, resource, and timestamp. Clicking/expanding a row reveals before/after JSON diff with change highlighting. Filter controls for actor, action type, resource type, and time period are present.
result: [pending]

### 14. Governance Policies
expected: Navigate to /governance/policies. A list of policy rules is shown as cards with visual IF/THEN condition badges and an enabled/disabled toggle switch. A "Create Policy" button opens a sheet with a condition builder form (dynamic rows for field/operator/value). Policies can be edited and deleted with confirmation.
result: [pending]

## Summary

total: 14
passed: 0
issues: 0
pending: 14
skipped: 0

## Gaps

[none yet]
