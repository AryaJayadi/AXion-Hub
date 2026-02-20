---
status: testing
phase: 05-dashboard-monitoring
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md, 05-06-SUMMARY.md
started: 2026-02-18T11:00:00Z
updated: 2026-02-18T12:30:00Z
---

## Current Test

number: 2
name: Gateway Status & Degraded Mode Banner
expected: |
  The Gateway Status widget shows current connection state (likely "Disconnected" with a red/gray StatusBadge if no gateway is running). If disconnected, a yellow/orange degraded-mode banner with AlertTriangle icon should appear above the grid warning about limited functionality.
awaiting: user response

## Tests

### 1. Dashboard Page Loads with Bento Grid
expected: Navigate to /dashboard. The page renders a responsive bento grid layout with multiple widget cards visible: Gateway Status, Agent Counts, Task Summary, Context Usage, Cost Summary, and Activity Feed. On desktop, cards arrange in a multi-column grid (up to 4 cols). A PageHeader with "Dashboard" title and Quick Actions bar appear at the top.
result: issue
reported: "GET http://localhost:3001/dashboard returns HTTP/1.1 404 Not Found"
severity: blocker

### 2. Gateway Status & Degraded Mode Banner
expected: The Gateway Status widget shows current connection state (likely "Disconnected" with a red/gray StatusBadge if no gateway is running). If disconnected, a yellow/orange degraded-mode banner with AlertTriangle icon should appear above the grid warning about limited functionality.
result: [pending]

### 3. Agent Counts Widget
expected: The Agent Counts widget displays animated number counters (NumberFlow) grouped by status (online, idle, working, error). Numbers animate when they change. Each status has a colored badge. If no agents are connected, counts show 0.
result: [pending]

### 4. Context Usage & Cost Widgets
expected: Context Usage widget shows per-agent progress bars with color coding (green < 60%, yellow 60-80%, red > 80%). Cost Summary widget has a time period toggle (session/today/week), shows token and dollar totals with animated numbers, a stacked bar chart, and a sortable DataTable with per-agent breakdown.
result: [pending]

### 5. Activity Feed Widget
expected: Activity Feed widget shows a card with "Activity" title and a live indicator dot. Events (if any from mock/store) display as cards with colored left border, icon, summary text, and relative timestamp. If scrolled away from top, a "N new events" pill appears. Empty state shows placeholder text when no events exist.
result: [pending]

### 6. Quick Actions Bar
expected: Three quick action buttons appear near the top: "New Agent", "New Task", and "Send Message". Clicking "New Agent" navigates to /agents/new. Clicking "New Task" navigates to /missions/new. Clicking "Send Message" shows a "Coming soon" toast notification.
result: [pending]

### 7. Activity Split View Page
expected: Navigate to /activity. A split view appears: left panel (60%) shows a filterable list of recent events from the activity store, right panel (40%) shows detailed info when an event is selected. On mobile, panels stack vertically. Filter controls are available for event type/severity.
result: [pending]

### 8. Activity History Page
expected: Navigate to /activity/history. A DataTable shows historical events with columns for timestamp, type, severity, and summary. A search box filters events by text. Multi-select filter dropdowns for type and severity are available (persisted in URL via nuqs). Columns are sortable.
result: [pending]

### 9. Health Monitor with Dependency Map
expected: Navigate to /monitor. An interactive React Flow dependency map shows service nodes (gateway, providers, channels, etc.) with color-coded health borders (green=healthy, yellow=degraded, red=down). Clicking a node opens a detail panel showing metrics, events, and connections. Controls (zoom, fit) and a MiniMap are visible.
result: [pending]

### 10. Alert Rules Management
expected: Navigate to /monitor/alerts. A DataTable lists alert rules with columns for name, condition, severity, and enabled toggle. A "Create Rule" button opens a form/dialog. An "Alert Templates" option shows 6 preset templates (agent-down, high-error-rate, context-window-full, gateway-disconnect, cost-spike, task-stuck) that pre-fill the form when selected.
result: [pending]

### 11. Notification Bell in Header
expected: A bell icon appears in the global header bar (between search and user menu). It shows a badge counter when unread alerts exist. Clicking it opens a popover showing recent alert notifications.
result: [pending]

## Summary

total: 11
passed: 0
issues: 1
pending: 10
skipped: 0

## Gaps

- truth: "Dashboard page loads at /dashboard with bento grid layout and all widgets"
  status: failed
  reason: "User reported: GET http://localhost:3001/dashboard returns HTTP/1.1 404 Not Found"
  severity: blocker
  test: 1
  artifacts: []
  missing: []
  debug_session: ""
