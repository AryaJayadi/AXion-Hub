# Phase 8: Sessions, Memory, Files & Governance - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can review agent session histories with full transcripts, browse and search agent memories semantically, manage workspace files with inline editing, and enforce governance through approval queues, audit trails, and configurable policies. This is the "accountability layer" — understanding, verifying, and controlling agent behavior.

</domain>

<decisions>
## Implementation Decisions

### Transcript & session replay
- Session list at /sessions defaults to chronological DataTable, with a "Group by agent" toggle for switching perspectives
- Session detail shows token usage as a header summary (total tokens, cost, duration); per-message token details available on hover/click (expandable, not inline)
- Transcript view defaults to flat chronological thread with a tree toggle for power users who want to see branching/retry structure
- Tool calls in transcripts rendered as collapsed blocks (tool name + status) — expand to see arguments and output. Keeps focus on conversation flow

### Memory exploration & search
- Memory browser at /memory organized by agent first, then by memory type within each agent (persistent, daily, conversation)
- Memories are read-only — no editing or deleting from the browser. Modification happens through the agent itself or identity files
- Semantic search at /memory/search works cross-agent by default, with optional agent filter to narrow results
- Search results displayed as card grid with surrounding context (what came before/after the memory), showing agent name and relevance

### File workspace & deliverables
- File browser at /workspace uses tree sidebar + content layout (VS Code style) for navigating agent workspace directories
- File viewer includes a code editor with syntax highlighting, line numbers, and find/replace for full editing capability
- Upload supports both shared workspace area and per-agent directories — shared files accessible to all agents, per-agent files are private
- Deliverables at /deliverables are linked to tasks — grouped by task with click-through to the task or the file. Tight coupling with mission board

### Approval queue & governance
- Approval queue at /approvals uses inbox-style UX — linear list of items awaiting approval, newest first, click into each to review
- Reject/revision flow uses required comment only (text area for rejection reason) — consistent with Phase 6 sign-off pattern. No structured categories
- Governance policies at /governance/policies use a visual condition builder: IF [agent/task/cost] [operator] [value] THEN [action]. Like email filter rules
- Audit log at /audit uses compact single-line entries (timestamp, actor, action, target) with expandable detail. Maximizes scan-ability

### Claude's Discretion
- Loading skeleton designs for all new pages
- Exact condition builder operators and actions available in policy rules
- Memory card grid layout details and relevance scoring visualization
- Transcript tree view implementation approach
- File editor choice (Monaco vs CodeMirror vs lighter alternative)

</decisions>

<specifics>
## Specific Ideas

- Transcript tool calls should be consistent with Phase 4 chat tool call pattern (collapsed blocks) — reuse or adapt existing components
- Memory browser agent grouping mirrors the agent-centric navigation from Phase 3
- File workspace tree sidebar should feel like VS Code — familiar mental model for developers
- Approval inbox should feel focused and sequential, not overwhelming — prioritize actionable items
- Audit log should leverage existing DataTable component from shared library

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-sessions-memory-files-governance*
*Context gathered: 2026-02-18*
