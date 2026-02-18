# Phase 8: Sessions, Memory, Files & Governance - Research

**Researched:** 2026-02-18
**Domain:** Session transcript viewer, cross-agent memory browser/search, workspace file management with code editor, approval queue, audit log viewer, governance policy builder
**Confidence:** HIGH

## Summary

Phase 8 is the "accountability layer" -- it surfaces agent behavior for human review and control through four feature clusters: session replay (3 requirements), memory exploration (2 requirements), file workspace (4 requirements), and governance (4 requirements). Together these 13 requirements produce ~10 new routes and ~25 new components.

The architecture strategy is reuse-heavy. The project already has the foundational building blocks from 7 completed phases: DataTable for list views (sessions, audit log, approvals), `@uiw/react-md-editor` for markdown editing (identity files, memory files), `react-resizable-panels` for split-pane layouts (file workspace), Collapsible for expandable sections (tool calls in transcripts), FilterBar and SearchInput for filtering/search (audit log, memory search), and the sign-off modal pattern (approval queue). The audit logging backend (schema, middleware, BullMQ queue, hash chain) is already implemented in Phase 1 -- this phase only builds the viewer UI.

The main new capability needed is a code editor with syntax highlighting for the workspace file viewer/editor (FILE-02). The project uses `@uiw/react-md-editor` for markdown files, but workspace files include TypeScript, JSON, YAML, and other code files requiring proper syntax highlighting with line numbers and find/replace. The recommendation is **@uiw/react-codemirror** -- it shares the same `@uiw` ecosystem as the existing markdown editor, uses CodeMirror 6 under the hood (same engine), is 10x lighter than Monaco (~30 kB gzipped vs ~300 kB), supports lazy-loaded language extensions, and works with the existing `next/dynamic` SSR-disabled import pattern. For markdown files specifically, continue using `@uiw/react-md-editor` for its split-pane preview.

The file tree sidebar for the workspace browser uses a recursive component pattern rather than a third-party tree library, keeping it consistent with the project's preference for hand-built UI using shadcn/ui primitives (Collapsible, ScrollArea, Button). The existing agent memory browser sidebar pattern provides a direct template for this.

**Primary recommendation:** Build shared entity types and mock data generators first (session transcript, memory, workspace file, approval, audit log, governance policy). Then build the four feature clusters in dependency order: sessions (extends existing agent sessions table), memory (extends existing agent memory browser), workspace/files (most new code), governance (extends existing sign-off pattern). Each cluster follows the established FSD pattern: entities -> features/api -> features/components -> views -> app routes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Transcript & session replay
- Session list at /sessions defaults to chronological DataTable, with a "Group by agent" toggle for switching perspectives
- Session detail shows token usage as a header summary (total tokens, cost, duration); per-message token details available on hover/click (expandable, not inline)
- Transcript view defaults to flat chronological thread with a tree toggle for power users who want to see branching/retry structure
- Tool calls in transcripts rendered as collapsed blocks (tool name + status) -- expand to see arguments and output. Keeps focus on conversation flow

#### Memory exploration & search
- Memory browser at /memory organized by agent first, then by memory type within each agent (persistent, daily, conversation)
- Memories are read-only -- no editing or deleting from the browser. Modification happens through the agent itself or identity files
- Semantic search at /memory/search works cross-agent by default, with optional agent filter to narrow results
- Search results displayed as card grid with surrounding context (what came before/after the memory), showing agent name and relevance

#### File workspace & deliverables
- File browser at /workspace uses tree sidebar + content layout (VS Code style) for navigating agent workspace directories
- File viewer includes a code editor with syntax highlighting, line numbers, and find/replace for full editing capability
- Upload supports both shared workspace area and per-agent directories -- shared files accessible to all agents, per-agent files are private
- Deliverables at /deliverables are linked to tasks -- grouped by task with click-through to the task or the file. Tight coupling with mission board

#### Approval queue & governance
- Approval queue at /approvals uses inbox-style UX -- linear list of items awaiting approval, newest first, click into each to review
- Reject/revision flow uses required comment only (text area for rejection reason) -- consistent with Phase 6 sign-off pattern. No structured categories
- Governance policies at /governance/policies use a visual condition builder: IF [agent/task/cost] [operator] [value] THEN [action]. Like email filter rules
- Audit log at /audit uses compact single-line entries (timestamp, actor, action, target) with expandable detail. Maximizes scan-ability

### Claude's Discretion
- Loading skeleton designs for all new pages
- Exact condition builder operators and actions available in policy rules
- Memory card grid layout details and relevance scoring visualization
- Transcript tree view implementation approach
- File editor choice (Monaco vs CodeMirror vs lighter alternative)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SESS-01 | View all active sessions across agents at /sessions | DataTable with chronological sort, agent name column, status badges. "Group by agent" toggle switches to grouped view using `groupBy` pattern. nuqs for URL filter state. Reuses existing `AgentSession` entity type with added `agentName` field. |
| SESS-02 | View full session detail with transcript and token usage at /sessions/[sessionId] | Header summary cards (total tokens, cost, duration). Transcript rendered as flat chronological message list with role-based styling. Per-message token counts on hover via Tooltip. Reuses message bubble pattern from Phase 4 chat. |
| SESS-03 | View JSONL session transcript with message tree at /sessions/[sessionId]/transcript | Flat thread view as default. Tree toggle renders branching/retry structure using indented nested layout (CSS margin-left per depth level). Tool calls as collapsed blocks reusing `ToolCallGroup` pattern from Phase 4. |
| MEMO-01 | Browse memories across all agents at /memory | Agent-first grouping with Collapsible sections per agent. Within each agent: persistent, daily, conversation memory types. Read-only markdown preview using `@uiw/react-md-editor` in preview mode. Extends existing `AgentMemoryBrowser` pattern. |
| MEMO-02 | Semantic search across all agent memories at /memory/search | SearchInput with debounce. Card grid results showing agent name, memory snippet, surrounding context, relevance indicator. Optional agent filter via Select dropdown. TanStack Query for search results. |
| FILE-01 | Browse agent workspace files at /workspace | Tree sidebar (recursive component) + content area using `react-resizable-panels`. Tree shows shared workspace + per-agent directories. File/folder icons from lucide-react. Extends existing memory browser sidebar pattern. |
| FILE-02 | View/edit workspace files at /workspace/[agentId]/[...path] | `@uiw/react-codemirror` for code files with syntax highlighting, line numbers, find/replace. `@uiw/react-md-editor` for .md files (split-pane preview). Auto-save with debounce (existing pattern). Language detection from file extension. |
| FILE-03 | View all task deliverables at /deliverables | DataTable grouped by task. Reuses `DeliverablePreviewCard` from Phase 6. Task name link to /missions/[taskId]. Filter by task status, agent. |
| FILE-04 | Upload files to agent workspace or task at /workspace/upload | Upload dialog with drag-and-drop zone. Target selector: shared workspace or per-agent directory. TanStack Query mutation for upload. File type validation. |
| GOVR-01 | View tasks awaiting human sign-off at /approvals | Inbox-style list using DataTable with newest-first sort. Columns: task title, agent, submitted date, priority. Click navigates to approval detail. Badge count in sidebar nav. Extends Phase 6 sign-off status banners. |
| GOVR-02 | Review agent output and approve/reject/request revision at /approvals/[taskId] | Split layout: deliverables on left, decision panel on right. Reuses `TaskSignOffModal` pattern but as full page. Required comment for reject/revision (existing pattern). Optimistic status update. |
| GOVR-03 | View immutable audit log at /audit | DataTable with virtual scrolling (audit logs can be large). Columns: timestamp, actor, action, resource type, resource ID. Expandable rows for before/after diff and metadata. FilterBar with actor, action, resource type, date range filters. Reads from existing `audit_logs` Drizzle schema. |
| GOVR-04 | Define governance policies at /governance/policies | Visual condition builder with row-based rules. Each rule: IF [field] [operator] [value] THEN [action]. Condition fields: agent, task priority, cost threshold, tool name. Operators: equals, not equals, greater than, less than, contains. Actions: require approval, block, notify, auto-approve. react-hook-form + Zod v4 for validation. |
</phase_requirements>

## Standard Stack

### Core (New for Phase 8)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @uiw/react-codemirror | ^4.23 | Code editor with syntax highlighting | Same @uiw ecosystem as existing react-md-editor. CodeMirror 6 engine. ~30 kB gzipped (vs Monaco ~300 kB). Lazy-loaded language extensions. Built-in search/replace (Ctrl+F). Line numbers, fold gutter, bracket matching out of box. SSR-safe with `next/dynamic` ssr:false pattern. |
| @codemirror/lang-javascript | ^6.2 | TypeScript/JavaScript syntax | Covers .ts, .tsx, .js, .jsx with `typescript: true` option |
| @codemirror/lang-json | ^6.0 | JSON syntax highlighting | For package.json, config files |
| @codemirror/lang-markdown | ^6.3 | Markdown syntax highlighting | For .md files when using CodeMirror directly (fallback) |
| @codemirror/lang-python | ^6.1 | Python syntax highlighting | Agent scripts may include Python |
| @codemirror/lang-yaml | ^6.1 | YAML syntax highlighting | For Docker/config YAML files |
| @codemirror/language-data | ^6.5 | Auto language detection | Maps file extensions to language support for dynamic loading |

### Existing (Carried Forward from Prior Phases)

| Library | Purpose | Phase 8 Usage |
|---------|---------|---------------|
| @tanstack/react-table + @tanstack/react-virtual | DataTable with virtual scroll | Sessions list, audit log, approvals list, deliverables list |
| @uiw/react-md-editor | Markdown editor/preview | Memory browser read-only preview, workspace .md file editing |
| react-resizable-panels | Split-pane layouts | Workspace file browser (tree sidebar + content) |
| use-debounce | Debounced callbacks | Auto-save in file editor, search debounce in memory search |
| nuqs | URL state persistence | Filter/search state in sessions, audit, memory, approvals |
| react-hook-form + @hookform/resolvers + zod | Form validation | Governance policy builder, file upload form |
| sonner | Toast notifications | Approval actions, file save, upload confirmations |
| date-fns | Date formatting | Session timestamps, audit log timestamps |
| lucide-react | Icons | File type icons, action icons, status indicators |
| framer-motion | Animations | Collapsible sections, page transitions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @uiw/react-codemirror | @monaco-editor/react | Monaco is the VS Code engine (full IDE features) but ~300 kB gzipped, slow cold start, complex SSR handling. Overkill for file viewing/editing -- we need syntax highlighting + find/replace, not IntelliSense. |
| @uiw/react-codemirror | Shiki (syntax highlighting only) | Shiki is render-only (no editing). Perfect for read-only code display but FILE-02 requires editing capability. Could use Shiki for read-only transcript code blocks as a future optimization. |
| Custom recursive tree | shadcn-tree-view (community) | Third-party shadcn tree components exist but add an external dependency for what is ~80 lines of recursive Collapsible. The existing memory browser sidebar pattern already demonstrates the approach. |
| Custom condition builder | react-querybuilder | Full-featured query builder library but heavy (~50 kB) and styled differently. The governance policy builder has a simple flat rule structure (no nested AND/OR groups), making a custom builder with shadcn Select + Input more appropriate and visually consistent. |

**Installation:**
```bash
npm install @uiw/react-codemirror @codemirror/lang-javascript @codemirror/lang-json @codemirror/lang-markdown @codemirror/lang-python @codemirror/lang-yaml @codemirror/language-data
```

## Architecture Patterns

### Recommended FSD Structure

```
src/
├── entities/
│   ├── session/                    # Session transcript entity
│   │   ├── model/types.ts          # SessionDetail, TranscriptMessage, TranscriptToolCall
│   │   └── index.ts
│   ├── memory/                     # Cross-agent memory entity
│   │   ├── model/types.ts          # MemoryEntry, MemorySearchResult
│   │   └── index.ts
│   ├── workspace/                  # Workspace file entity
│   │   ├── model/types.ts          # WorkspaceFile, FileTreeNode, UploadTarget
│   │   └── index.ts
│   ├── approval/                   # Approval queue entity
│   │   ├── model/types.ts          # ApprovalItem, ApprovalAction
│   │   └── index.ts
│   └── governance/                 # Governance policy entity
│       ├── model/types.ts          # GovernancePolicy, PolicyRule, PolicyCondition
│       ├── model/schemas.ts        # Zod v4 schemas for policy validation
│       └── index.ts
├── features/
│   ├── sessions/
│   │   ├── api/                    # TanStack Query hooks
│   │   │   ├── use-sessions.ts
│   │   │   ├── use-session-detail.ts
│   │   │   └── use-session-transcript.ts
│   │   └── components/
│   │       ├── sessions-table.tsx         # Cross-agent session DataTable
│   │       ├── session-summary-header.tsx # Token usage, cost, duration cards
│   │       ├── transcript-thread.tsx      # Flat chronological message thread
│   │       ├── transcript-tree.tsx        # Branching/retry tree view
│   │       └── transcript-tool-block.tsx  # Collapsed tool call block
│   ├── memory/
│   │   ├── api/
│   │   │   ├── use-memory-browser.ts
│   │   │   └── use-memory-search.ts
│   │   └── components/
│   │       ├── memory-agent-group.tsx     # Collapsible agent section
│   │       ├── memory-type-list.tsx       # Persistent/daily/conversation tabs
│   │       ├── memory-preview.tsx         # Read-only markdown preview
│   │       ├── memory-search-results.tsx  # Card grid with relevance
│   │       └── memory-search-card.tsx     # Individual search result card
│   ├── workspace/
│   │   ├── api/
│   │   │   ├── use-workspace-tree.ts
│   │   │   ├── use-workspace-file.ts
│   │   │   └── use-file-upload.ts
│   │   └── components/
│   │       ├── file-tree.tsx              # Recursive file tree sidebar
│   │       ├── file-tree-node.tsx         # Individual file/folder node
│   │       ├── code-editor.tsx            # CodeMirror wrapper
│   │       ├── file-viewer.tsx            # Routes to CodeMirror or MDEditor by extension
│   │       ├── upload-dialog.tsx          # Drag-and-drop upload
│   │       └── deliverables-table.tsx     # Task-grouped deliverables
│   ├── approvals/
│   │   ├── api/
│   │   │   ├── use-approvals.ts
│   │   │   └── use-approval-actions.ts
│   │   └── components/
│   │       ├── approval-inbox.tsx         # Inbox-style list
│   │       ├── approval-review.tsx        # Full review with deliverables
│   │       └── approval-action-panel.tsx  # Approve/reject/revision buttons
│   ├── governance/
│   │   ├── api/
│   │   │   ├── use-policies.ts
│   │   │   └── use-policy-mutations.ts
│   │   └── components/
│   │       ├── policy-list.tsx            # List of defined policies
│   │       ├── policy-rule-row.tsx        # Single IF/THEN rule row
│   │       └── condition-builder.tsx      # Visual condition builder form
│   └── audit/
│       ├── api/
│       │   └── use-audit-log.ts           # Reads from existing audit_logs table
│       └── components/
│           ├── audit-log-table.tsx         # Compact DataTable with expandable rows
│           └── audit-detail-panel.tsx      # Before/after diff + metadata
├── views/
│   ├── sessions/
│   │   ├── sessions-list-view.tsx
│   │   ├── session-detail-view.tsx
│   │   └── session-transcript-view.tsx
│   ├── memory/
│   │   ├── memory-browser-view.tsx
│   │   └── memory-search-view.tsx
│   ├── workspace/
│   │   ├── workspace-browser-view.tsx
│   │   ├── workspace-file-view.tsx
│   │   └── deliverables-view.tsx
│   ├── approvals/
│   │   ├── approvals-list-view.tsx
│   │   └── approval-detail-view.tsx
│   ├── governance/
│   │   └── policies-view.tsx
│   └── audit/
│       └── audit-log-view.tsx
└── app/(dashboard)/
    ├── sessions/
    │   ├── page.tsx                       # SESS-01
    │   └── [sessionId]/
    │       ├── page.tsx                   # SESS-02
    │       └── transcript/
    │           └── page.tsx               # SESS-03
    ├── memory/
    │   ├── page.tsx                       # MEMO-01
    │   └── search/
    │       └── page.tsx                   # MEMO-02
    ├── workspace/
    │   ├── page.tsx                       # FILE-01
    │   ├── upload/
    │   │   └── page.tsx                   # FILE-04 (or dialog on FILE-01)
    │   └── [agentId]/
    │       └── [...path]/
    │           └── page.tsx               # FILE-02
    ├── deliverables/
    │   └── page.tsx                       # FILE-03
    ├── approvals/
    │   ├── page.tsx                       # GOVR-01
    │   └── [taskId]/
    │       └── page.tsx                   # GOVR-02
    ├── audit/
    │   └── page.tsx                       # GOVR-03
    └── governance/
        └── policies/
            └── page.tsx                   # GOVR-04
```

### Pattern 1: Cross-Agent Session Table with Group Toggle

**What:** The sessions table extends the existing per-agent `AgentSessionsTable` to show sessions across ALL agents, with a toggle to group by agent.
**When to use:** SESS-01, any list view that needs optional grouping.

```typescript
// Entity type extending existing AgentSession
interface CrossAgentSession extends AgentSession {
  agentName: string;
  agentAvatar?: string | undefined;
  model: string;
}

// Toggle state via nuqs
const [groupBy, setGroupBy] = useQueryState("group", { defaultValue: "none" });

// When groupBy === "agent", render grouped sections:
// - Group sessions by agentId
// - Render Collapsible per agent with agent name header
// - Each section contains a DataTable of that agent's sessions
// When groupBy === "none", render flat DataTable with agent column
```

### Pattern 2: Transcript Message Rendering with Tool Call Blocks

**What:** Session transcripts render as a chronological message thread, reusing the chat message bubble pattern from Phase 4 but in read-only mode with token metadata.
**When to use:** SESS-02, SESS-03.

```typescript
// Transcript message entity
interface TranscriptMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokenCount: number;         // per-message tokens
  toolCalls: TranscriptToolCall[];
  parentMessageId?: string | undefined; // for tree view branching
  isRetry: boolean;
}

// Tool calls reuse the collapsed block pattern from Phase 4 chat
// Existing component: src/features/chat/components/tool-call-group.tsx
// Adapt: make read-only (no real-time execution state), add timing info
```

### Pattern 3: Recursive File Tree Component

**What:** A recursive component that renders a file/folder hierarchy using Collapsible from shadcn/ui.
**When to use:** FILE-01, workspace file browser sidebar.

```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[] | undefined;
  size?: number | undefined;
  lastModified?: Date | undefined;
}

// Recursive rendering pattern (same approach as existing memory browser sidebar)
function FileTreeItem({ node, depth, activePath, onSelect }: {
  node: FileTreeNode;
  depth: number;
  activePath: string;
  onSelect: (path: string) => void;
}) {
  if (node.type === "file") {
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={cn(
          "w-full text-left px-3 py-1.5 text-sm flex items-center gap-2",
          activePath === node.path
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50",
        )}
        style={{ paddingLeft: `${(depth * 12) + 12}px` }}
      >
        <FileIcon extension={node.name.split('.').pop()} />
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>
    );
  }

  return (
    <Collapsible defaultOpen={depth < 2}>
      <CollapsibleTrigger className="w-full" style={{ paddingLeft: `${depth * 12}px` }}>
        {/* folder row with chevron */}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.children?.map(child => (
          <FileTreeItem key={child.path} node={child} depth={depth + 1} ... />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### Pattern 4: CodeMirror File Editor with Language Detection

**What:** A wrapper around @uiw/react-codemirror that auto-detects language from file extension and loads the appropriate language extension.
**When to use:** FILE-02, workspace file editing.

```typescript
// Dynamic import for SSR safety (same pattern as MDEditor)
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

// Language extension mapping
const LANG_MAP: Record<string, () => Promise<Extension>> = {
  ts: () => import("@codemirror/lang-javascript").then(m => m.javascript({ typescript: true, jsx: false })),
  tsx: () => import("@codemirror/lang-javascript").then(m => m.javascript({ typescript: true, jsx: true })),
  js: () => import("@codemirror/lang-javascript").then(m => m.javascript({ jsx: false })),
  jsx: () => import("@codemirror/lang-javascript").then(m => m.javascript({ jsx: true })),
  json: () => import("@codemirror/lang-json").then(m => m.json()),
  md: () => import("@codemirror/lang-markdown").then(m => m.markdown()),
  py: () => import("@codemirror/lang-python").then(m => m.python()),
  yaml: () => import("@codemirror/lang-yaml").then(m => m.yaml()),
  yml: () => import("@codemirror/lang-yaml").then(m => m.yaml()),
};

// Use useMemo + useEffect to load language extension lazily
// This avoids bundling ALL language extensions upfront
```

### Pattern 5: Visual Condition Builder for Governance Policies

**What:** Row-based rule builder where each row is IF [field] [operator] [value] THEN [action].
**When to use:** GOVR-04.

```typescript
interface PolicyCondition {
  field: "agent" | "task_priority" | "cost" | "tool" | "task_status";
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: string;
}

interface PolicyRule {
  id: string;
  conditions: PolicyCondition[];   // AND logic within a rule
  action: "require_approval" | "block" | "notify" | "auto_approve";
  actionConfig?: Record<string, string> | undefined; // e.g., { notifyChannel: "slack" }
  enabled: boolean;
}

// Each rule renders as a Card with:
// - Condition rows using Select (field) + Select (operator) + Input (value)
// - "+ Add condition" button for AND conditions
// - Action selector: Select with action options
// - Enable/disable toggle
// - Delete button
// react-hook-form useFieldArray for dynamic rule/condition management
```

### Pattern 6: Audit Log with Expandable Detail Rows

**What:** Compact DataTable showing one line per audit entry (timestamp, actor, action, target), expanding to show before/after diff and metadata.
**When to use:** GOVR-03.

```typescript
// Reads directly from existing audit_logs Drizzle schema
// Entity type already exists: src/shared/types/database.ts -> AuditLog

// DataTable with custom row expansion:
// - Default: compact single line (timestamp | actor | action | resourceType:resourceId)
// - Expand: shows before/after JSON diff, metadata (IP, user agent, correlation ID)
// - Virtual scrolling enabled (audit logs can be very large)
// - FilterBar with: actor, action type, resource type, date range
// - nuqs for URL filter state persistence

// Audit entries are immutable -- no edit/delete actions
// Hash chain verification shown as a small shield icon (verified/unverified)
```

### Anti-Patterns to Avoid

- **Loading all transcript messages at once:** Session transcripts can be thousands of messages. Use pagination or virtual scrolling, not `useQuery` that fetches everything.
- **Editing memories from the browser:** User decision explicitly locks this as read-only. Do not add edit buttons or save mutations to the memory browser.
- **Monaco for file editing:** Monaco is ~300 kB gzipped and requires complex Web Worker setup. CodeMirror achieves the needed features at 1/10th the bundle size.
- **Nested AND/OR groups in policy builder:** User decided on flat "email filter rules" style. Keep it simple: each rule has AND conditions and one action. No nested groups.
- **Building a custom audit log backend:** The audit backend already exists (Phase 1). This phase only builds the viewer UI that reads from the existing `audit_logs` table.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code syntax highlighting | Custom tokenizer/highlighter | @uiw/react-codemirror with language extensions | Hundreds of languages, theme support, find/replace built in |
| File type icon mapping | Manual icon switch statement | lucide-react icon map by extension | Consistent icon set already in project |
| Markdown preview | Custom markdown parser | @uiw/react-md-editor in preview mode | Already used in Phase 3, handles GFM, code blocks, etc. |
| JSON diff visualization | Custom diff algorithm | `JSON.stringify` with indentation + line-by-line comparison | Audit before/after diffs are JSON objects; simple formatting suffices for v1 |
| Virtual scrolling for audit log | Custom intersection observer | DataTable's built-in virtualization via @tanstack/react-virtual | Already implemented in shared DataTable component with auto-enable at 50+ rows |
| Debounced auto-save | Custom setTimeout management | use-debounce's `useDebouncedCallback` with cancel/flush | Existing pattern in identity editor and memory browser |

**Key insight:** This phase is 80% UI composition from existing building blocks. The novelty is in connecting those blocks to new data shapes (transcripts, cross-agent memories, workspace files, audit entries, governance policies) rather than building new UI primitives.

## Common Pitfalls

### Pitfall 1: CodeMirror SSR Crash
**What goes wrong:** CodeMirror accesses `document` and `window` during import, causing "document is not defined" in Next.js SSR.
**Why it happens:** CodeMirror 6 DOM measurement happens at module load time, not just at render time.
**How to avoid:** Use `next/dynamic` with `ssr: false`, exactly as the project already does for `@uiw/react-md-editor`. Show a Skeleton placeholder during load.
**Warning signs:** Build errors mentioning `document is not defined` or `window is not defined`.

```typescript
// Correct pattern (already used in project for MDEditor)
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});
```

### Pitfall 2: Language Extension Bundle Bloat
**What goes wrong:** Importing all CodeMirror language extensions statically bundles every language into the main chunk.
**Why it happens:** Direct imports like `import { javascript } from "@codemirror/lang-javascript"` at module top level.
**How to avoid:** Lazy-load language extensions based on file extension using dynamic imports. Only the viewed file's language extension gets loaded.
**Warning signs:** Main bundle size jumps by 100+ kB after adding CodeMirror.

### Pitfall 3: Transcript Pagination vs. Virtual Scroll
**What goes wrong:** Loading an entire session transcript (potentially 5000+ messages) into memory causes browser freeze.
**Why it happens:** TanStack Query fetches all messages, React renders all DOM nodes.
**How to avoid:** Use cursor-based pagination for API calls (load 50 messages at a time with "Load more" button or intersection observer). For rendering, use virtual scrolling with `@tanstack/react-virtual` (already in the project).
**Warning signs:** Slow page loads on long sessions, high memory usage.

### Pitfall 4: File Tree Performance with Deep Nesting
**What goes wrong:** Recursive component re-renders the entire tree when any node expands/collapses.
**Why it happens:** State changes at the tree root propagate to all children via props.
**How to avoid:** Keep expanded/collapsed state in a `Set<string>` at the tree root. Only the toggled node's Collapsible re-renders. Use `React.memo` on `FileTreeItem` with path-based comparison.
**Warning signs:** Noticeable lag when expanding/collapsing folders in large workspaces.

### Pitfall 5: Audit Log Query Performance
**What goes wrong:** Fetching audit logs without filters loads the entire history, which grows unbounded.
**Why it happens:** No default date range filter, no pagination.
**How to avoid:** Default to "last 7 days" filter. Use server-side pagination (page + pageSize params). The existing Drizzle schema has indexes on `timestamp`, `resource_type+resource_id`, and `actor`.
**Warning signs:** Slow audit page load, increasing over time.

### Pitfall 6: Workspace File Save Race Conditions
**What goes wrong:** Rapid typing in the editor triggers multiple overlapping save requests, causing stale content to overwrite newer edits.
**Why it happens:** Debounced save fires while a previous save is still in flight.
**How to avoid:** Use `useDebouncedCallback` with the flush-before-switch pattern (already implemented in `AgentIdentityEditor`). Cancel in-flight saves when a new save starts. The existing debounced save pattern handles this correctly -- follow it exactly.
**Warning signs:** Content jumping back to older versions after edits.

### Pitfall 7: zodResolver as-never Cast for Zod v4
**What goes wrong:** TypeScript errors when using `zodResolver` with Zod v4 schemas and `exactOptionalPropertyTypes: true`.
**Why it happens:** `@hookform/resolvers` types don't account for Zod v4's stricter optional property types.
**How to avoid:** Cast `zodResolver(schema) as never` -- this is the established project pattern used since Phase 3. Apply to governance policy form validation.
**Warning signs:** Type errors on form resolver assignment.

## Code Examples

### Cross-Agent Session Entity Type

```typescript
// Source: extends existing src/entities/agent/model/types.ts AgentSession
import type { AgentSession } from "@/entities/agent";

export interface CrossAgentSession extends AgentSession {
  agentName: string;
  agentAvatar?: string | undefined;
  model: string;
}

export interface SessionDetail {
  session: CrossAgentSession;
  summary: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    duration: number; // ms
    messageCount: number;
    toolCallCount: number;
  };
}
```

### Transcript Message Type

```typescript
export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokenCount: number;
  toolCalls: TranscriptToolCall[];
  parentMessageId?: string | undefined; // null = root, set = branch/retry
  isRetry: boolean;
  metadata?: {
    model?: string | undefined;
    temperature?: number | undefined;
    stopReason?: string | undefined;
  } | undefined;
}

export interface TranscriptToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  output?: string | undefined;
  error?: string | undefined;
  durationMs: number;
  status: "completed" | "error";
}
```

### Memory Search Result Type

```typescript
export interface MemorySearchResult {
  id: string;
  agentId: string;
  agentName: string;
  memoryType: "persistent" | "daily" | "conversation";
  filePath: string;
  snippet: string;           // matched text with surrounding context
  beforeContext: string;      // text before the match
  afterContext: string;       // text after the match
  relevanceScore: number;    // 0-1
  lastModified: Date;
}
```

### Workspace File Tree Type

```typescript
export interface FileTreeNode {
  name: string;
  path: string;              // relative path from workspace root
  type: "file" | "directory";
  children?: FileTreeNode[] | undefined;
  size?: number | undefined;
  lastModified?: Date | undefined;
  mimeType?: string | undefined;
}

export interface WorkspaceFile {
  path: string;
  agentId: string | null;    // null = shared workspace
  content: string;
  language: string;           // detected from extension
  size: number;
  lastModified: Date;
  isReadOnly: boolean;
}

export type UploadTarget =
  | { type: "shared" }
  | { type: "agent"; agentId: string }
  | { type: "task"; taskId: string };
```

### Governance Policy Type

```typescript
export type ConditionField = "agent" | "task_priority" | "cost" | "tool" | "task_status";
export type ConditionOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
export type PolicyAction = "require_approval" | "block" | "notify" | "auto_approve";

export interface PolicyCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description?: string | undefined;
  conditions: PolicyCondition[];    // AND logic
  action: PolicyAction;
  actionConfig?: Record<string, string> | undefined;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Query Keys Extension

```typescript
// Add to existing src/shared/lib/query-keys.ts
// Note: sessions and audit keys already exist in the current query-keys.ts

export const queryKeys = {
  // ... existing keys ...

  memory: {
    all: ["memory"] as const,
    browser: (agentId?: string) =>
      [...queryKeys.memory.all, "browser", agentId] as const,
    search: (query: string, agentId?: string) =>
      [...queryKeys.memory.all, "search", { query, agentId }] as const,
  },
  workspace: {
    all: ["workspace"] as const,
    tree: (agentId?: string) =>
      [...queryKeys.workspace.all, "tree", agentId] as const,
    file: (agentId: string, path: string) =>
      [...queryKeys.workspace.all, "file", agentId, path] as const,
  },
  deliverables: {
    all: ["deliverables"] as const,
    lists: () => [...queryKeys.deliverables.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.deliverables.lists(), filters] as const,
  },
  approvals: {
    all: ["approvals"] as const,
    lists: () => [...queryKeys.approvals.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.approvals.lists(), filters] as const,
    detail: (taskId: string) =>
      [...queryKeys.approvals.all, "detail", taskId] as const,
  },
  governance: {
    all: ["governance"] as const,
    policies: () => [...queryKeys.governance.all, "policies"] as const,
    policy: (id: string) =>
      [...queryKeys.governance.policies(), id] as const,
  },
} as const;
```

### CodeMirror Editor Wrapper with Auto-Save

```typescript
// Source: Pattern from Context7 @uiw/react-codemirror docs + existing project auto-save pattern
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Extension } from "@codemirror/state";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "@/shared/ui/skeleton";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

// Lazy language extension loader
async function getLanguageExtension(ext: string): Promise<Extension | null> {
  switch (ext) {
    case "ts": case "tsx":
      return import("@codemirror/lang-javascript")
        .then(m => m.javascript({ typescript: true, jsx: ext === "tsx" }));
    case "js": case "jsx":
      return import("@codemirror/lang-javascript")
        .then(m => m.javascript({ jsx: ext === "jsx" }));
    case "json":
      return import("@codemirror/lang-json").then(m => m.json());
    case "md": case "mdx":
      return import("@codemirror/lang-markdown").then(m => m.markdown());
    case "py":
      return import("@codemirror/lang-python").then(m => m.python());
    case "yaml": case "yml":
      return import("@codemirror/lang-yaml").then(m => m.yaml());
    default:
      return null;
  }
}

interface CodeEditorProps {
  value: string;
  filePath: string;
  onChange?: ((value: string) => void) | undefined;
  onSave?: ((content: string) => Promise<void>) | undefined;
  readOnly?: boolean | undefined;
}

export function CodeEditor({ value, filePath, onChange, onSave, readOnly }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [langExt, setLangExt] = useState<Extension | null>(null);

  const ext = filePath.split(".").pop() ?? "";

  useEffect(() => {
    getLanguageExtension(ext).then(setLangExt);
  }, [ext]);

  const extensions = useMemo(() => {
    const exts: Extension[] = [];
    if (langExt) exts.push(langExt);
    return exts;
  }, [langExt]);

  const debouncedSave = useDebouncedCallback(async (content: string) => {
    if (onSave) await onSave(content);
  }, 500);

  const handleChange = (val: string) => {
    onChange?.(val);
    debouncedSave(val);
  };

  return (
    <div data-color-mode={resolvedTheme === "light" ? "light" : "dark"} className="h-full">
      <CodeMirror
        value={value}
        extensions={extensions}
        onChange={readOnly ? undefined : handleChange}
        readOnly={readOnly}
        height="100%"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          bracketMatching: true,
          highlightActiveLine: true,
          searchKeymap: true, // Enables Ctrl+F find/replace
          tabSize: 2,
        }}
        theme={resolvedTheme === "light" ? "light" : "dark"}
      />
    </div>
  );
}
```

### Approval Inbox Pattern

```typescript
// Source: Extends Phase 6 sign-off pattern from task-sign-off-modal.tsx

export interface ApprovalItem {
  taskId: string;
  taskTitle: string;
  agentId: string;
  agentName: string;
  priority: TaskPriority;
  deliverableCount: number;
  submittedAt: Date;
  signOffStatus: "pending"; // only pending items appear in inbox
}

// Inbox list columns for DataTable
const columns: ColumnDef<ApprovalItem>[] = [
  { accessorKey: "taskTitle", header: "Task" },
  { accessorKey: "agentName", header: "Agent" },
  { accessorKey: "priority", header: "Priority", cell: /* priority badge */ },
  { accessorKey: "deliverableCount", header: "Deliverables" },
  { accessorKey: "submittedAt", header: "Submitted", cell: /* relative time */ },
  // Row click navigates to /approvals/[taskId]
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monaco for all code editing | CodeMirror 6 for embedded editors, Monaco for IDEs | CodeMirror 6 stable 2022+ | 10x smaller bundle for the same core features. Monaco reserved for full IDE experiences. |
| react-md-editor preview only | CodeMirror 6 for code + react-md-editor for markdown | Stable since 2023 | Proper syntax highlighting for non-markdown files without MDEditor's markdown-centric limitations. |
| Custom virtualized lists | @tanstack/react-virtual | v3 stable 2023 | Already in project. Virtual scrolling for audit logs, long transcripts. |
| Manual URL state | nuqs | v2 stable 2024 | Already in project. URL persistence for all filter/search states. |

**Deprecated/outdated:**
- CodeMirror 5: Legacy API. CodeMirror 6 is a complete rewrite with better performance and modularity.
- react-ace: Ace editor wrapper, largely replaced by CodeMirror 6 in the React ecosystem.
- Monaco for lightweight editing: Overkill; use CodeMirror 6 unless you need IntelliSense.

## Open Questions

1. **Semantic search backend for MEMO-02**
   - What we know: The memory search needs to work cross-agent with relevance scoring. The existing `useAgentMemory` hook does simple text matching on the client.
   - What's unclear: Whether the gateway provides a semantic search API or if this phase should mock the semantic search with client-side text matching (as the project does for all current features).
   - Recommendation: Mock with client-side fuzzy text search using the same pattern as `useAgentMemory`. Add a `relevanceScore` to results based on match position/frequency. The mock data layer is the established pattern -- gateway integration happens later.

2. **Session transcript JSONL format**
   - What we know: SESS-03 specifies "JSONL session transcript with message tree." The format likely matches the OpenClaw gateway's session export format.
   - What's unclear: The exact JSONL schema (field names, nesting) from the gateway.
   - Recommendation: Define a reasonable mock schema based on standard LLM conversation formats (role, content, timestamp, tool_calls, parent_id). The gateway client abstraction layer will map real data to this schema later.

3. **File upload storage**
   - What we know: FILE-04 requires uploading files to agent workspace or task. The project runs in Docker with bind mounts.
   - What's unclear: Whether uploads go to the local filesystem (via API route) or to the gateway.
   - Recommendation: Mock the upload mutation as with all other features. The API route will eventually write to the workspace directory. For now, optimistic add to the file tree after "upload."

## Sources

### Primary (HIGH confidence)
- Context7 `/uiwjs/react-codemirror` - React CodeMirror 6 setup, language extensions, themes, basicSetup options
- Context7 `/suren-atoyan/monaco-react` - Monaco React SSR handling, bundle size, props API (used for comparison)
- Existing codebase `src/features/agents/components/agent-memory-browser.tsx` - File tree sidebar pattern, markdown preview, auto-save
- Existing codebase `src/features/chat/components/tool-call-group.tsx` - Collapsed tool call block pattern
- Existing codebase `src/features/missions/components/task-sign-off-modal.tsx` - Approve/reject/revision pattern
- Existing codebase `src/features/audit/` - Audit schema, middleware, hash chain (backend already built)
- Existing codebase `src/shared/ui/data-table.tsx` - DataTable with virtual scrolling, search, pagination
- Existing codebase `src/shared/lib/query-keys.ts` - Query key factory pattern (sessions, audit keys already exist)
- Existing codebase `src/views/dashboard/activity-history-view.tsx` - FilterBar + DataTable + nuqs URL state pattern

### Secondary (MEDIUM confidence)
- shadcn/ui tree view community components - Validated that custom recursive approach is preferred over third-party for simple trees
- CodeMirror 6 vs Monaco bundle size comparison - Multiple sources confirm ~30 kB vs ~300 kB gzipped

### Tertiary (LOW confidence)
- None -- all findings verified through codebase inspection or Context7

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - CodeMirror 6 is well-documented via Context7, existing project patterns cover 80% of needs, only one new major dependency
- Architecture: HIGH - All patterns extend existing Phase 3/4/5/6 patterns (DataTable, memory browser, sign-off modal, chat tool calls, activity history). FSD structure is well-established.
- Pitfalls: HIGH - Most pitfalls are already solved in the codebase (SSR dynamic imports, debounced auto-save, virtual scrolling, zodResolver cast). CodeMirror SSR and bundle bloat are well-documented.

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable -- no fast-moving dependencies)
