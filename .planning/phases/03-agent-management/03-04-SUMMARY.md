---
phase: 03-agent-management
plan: 04
subsystem: ui
tags: [markdown-editor, identity-files, split-pane, auto-save, debounce, react-md-editor, tanstack-query, next-themes]

# Dependency graph
requires:
  - phase: 03-agent-management/plan-02
    provides: Agent detail nested layout with sidebar navigation, AgentDetailShell, useAgentDetail hook
  - phase: 03-agent-management/plan-01
    provides: Agent entity types (AgentIdentityFiles), Zustand agent store, shadcn ScrollArea/Skeleton
  - phase: 01-foundation-infrastructure
    provides: shared UI components (Button, Skeleton), TanStack Query setup, cn utility, next-themes
provides:
  - Split-pane Markdown editor for agent identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md)
  - AgentIdentitySidebar with file list and active file highlighting
  - AgentIdentityEditor with @uiw/react-md-editor, dark mode sync, debounced auto-save, save status indicator
  - useAgentIdentity TanStack Query hook with mock data and save mutation
  - Identity file default templates with genuine section headers, guidance comments, and starter content
  - /agents/[agentId]/identity route page
affects: [03-agent-management, 04-task-management]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Dynamic import with ssr: false for @uiw/react-md-editor browser API compatibility", "useDebouncedCallback for auto-save with flush on file switch", "data-color-mode sync with next-themes resolvedTheme for editor dark mode", "Local state + server state merge pattern for immediate editor responsiveness"]

key-files:
  created:
    - src/features/agents/lib/identity-templates.ts
    - src/features/agents/api/use-agent-identity.ts
    - src/features/agents/components/agent-identity-editor.tsx
    - src/features/agents/components/agent-identity-sidebar.tsx
    - src/views/agents/agent-identity-view.tsx
    - app/(dashboard)/agents/[agentId]/identity/page.tsx
  modified:
    - src/features/agents/index.ts

key-decisions:
  - "Identity templates provide 20-40 lines of genuine helpful content per file with guidance HTML comments and section headers"
  - "Editor syncs dark mode via data-color-mode attribute reading next-themes resolvedTheme"
  - "Local state merged with server state for immediate editor responsiveness without waiting for query cache updates"
  - "Debounced save flushes pending saves when switching files to prevent data loss"

patterns-established:
  - "Identity editor pattern: dynamic import MDEditor with ssr: false, useDebouncedCallback 500ms auto-save, data-color-mode theme sync"
  - "Sidebar + editor composition: AgentIdentityView owns activeFile state and passes it to both sidebar and editor"

requirements-completed: [AGNT-05]

# Metrics
duration: 6min
completed: 2026-02-18
---

# Phase 3 Plan 4: Agent Identity File Editor Summary

**Split-pane Markdown editor for 4 agent identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md) with file sidebar, @uiw/react-md-editor dynamic import, debounced auto-save, and helpful template starter content**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T04:12:12Z
- **Completed:** 2026-02-18T04:18:29Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments
- Identity file editor at /agents/[agentId]/identity with split-pane Markdown display (raw editor left, live preview right) using @uiw/react-md-editor loaded via dynamic import with SSR disabled
- File sidebar listing all 4 identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md) with monospace names and short descriptions, active file highlighted with accent background
- Debounced auto-save (500ms) with visual status indicator ("Saving..." while in progress, "Saved" for 2 seconds after success, fades out)
- Template starter content with genuine guidance: each file has 20-40 lines of section headers, HTML guidance comments explaining what to write, and example placeholder text
- Dark mode sync using next-themes resolvedTheme mapped to data-color-mode attribute on the editor container
- Pending save flushed when switching files to prevent data loss

## Task Commits

Each task was committed atomically:

1. **Task 1: Identity file editor with split-pane Markdown, file sidebar, and auto-save** - `8ce6f97` (feat)

## Files Created/Modified
- `src/features/agents/lib/identity-templates.ts` - Default starter content for all 4 identity files with section headers, guidance comments, and placeholder text
- `src/features/agents/api/use-agent-identity.ts` - TanStack Query hook with mock fetch/save, optimistic cache updates, staleTime Infinity pattern
- `src/features/agents/components/agent-identity-sidebar.tsx` - File list sidebar with active highlight and skeleton loading state
- `src/features/agents/components/agent-identity-editor.tsx` - Split-pane MDEditor with dynamic import, debounced auto-save, theme sync, save status indicator
- `src/views/agents/agent-identity-view.tsx` - View composing sidebar + editor with loading/error/empty states, local state merge for responsiveness
- `app/(dashboard)/agents/[agentId]/identity/page.tsx` - Server component route page with async params and metadata
- `src/features/agents/index.ts` - Updated barrel exports with new components, hook, templates, and types

## Decisions Made
- Identity templates provide genuine helpful content (not empty boilerplate): each file has 20-40 lines of section headers with HTML guidance comments explaining what to write and example starter text
- Editor dark mode syncs via data-color-mode attribute reading next-themes resolvedTheme -- handles both light and dark modes
- Local state merged with server state pattern: editor updates local state immediately for responsiveness, debounced save syncs to server, query cache updated optimistically on success
- Debounced save automatically flushes when switching files (via useEffect comparing previousFileRef) to prevent data loss from pending saves
- Skeleton loading states match the sidebar + editor layout shape for smooth visual transition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Next.js 16.1.6 Turbopack build fails with intermittent ENOENT on _buildManifest.js.tmp and pages-manifest.json (pre-existing environment issue documented in 03-02-SUMMARY). Build with webpack flag succeeds through compilation and TypeScript checking. Prerender error on "/" is a pre-existing auth/database context issue unrelated to identity editor changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Identity editor route fully functional at /agents/[agentId]/identity, rendering inside the AgentDetailShell layout with sidebar navigation
- useAgentIdentity hook ready to swap mock data for real gateway calls when available
- IDENTITY_FILE_DEFAULTS exported for use by creation wizard step-identity (pre-populated identity content)
- Pattern established for sub-page views within the agent detail layout

## Self-Check: PASSED

- All 7 files verified present on disk
- Commit 8ce6f97 (Task 1) verified in git log

---
*Phase: 03-agent-management*
*Completed: 2026-02-18*
