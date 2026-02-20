---
phase: 08-sessions-memory-files-governance
plan: 05
subsystem: ui
tags: [approvals, governance, tanstack-query, optimistic-updates, data-table]

requires:
  - phase: 01-foundation
    provides: "FSD architecture, shadcn/ui components, TanStack Query setup"
  - phase: 06-mission-board
    provides: "TaskSignOffModal pattern (approve/reject/revision with comments), DeliverablePreviewCard"
provides:
  - "ApprovalItem, ApprovalAction, ApprovalDetail entity types"
  - "useApprovals query hook with mock pending approval data"
  - "useApprovalActions mutation hook with optimistic list removal"
  - "ApprovalInbox DataTable component for inbox-style approval list"
  - "ApprovalReview two-column deliverable review component"
  - "ApprovalActionPanel approve/reject/revision component with required comments"
  - "/approvals and /approvals/[taskId] route pages"
affects: [governance, mission-board, agent-management]

tech-stack:
  added: []
  patterns:
    - "Optimistic list removal on approval action (removes item from cache immediately)"
    - "Event delegation for DataTable row click navigation"
    - "Mock detail generation per taskId for rich deliverable preview"

key-files:
  created:
    - src/entities/approval/model/types.ts
    - src/entities/approval/index.ts
    - src/features/approvals/api/use-approvals.ts
    - src/features/approvals/api/use-approval-actions.ts
    - src/features/approvals/components/approval-inbox.tsx
    - src/features/approvals/components/approval-review.tsx
    - src/features/approvals/components/approval-action-panel.tsx
    - src/views/approvals/approvals-list-view.tsx
    - src/views/approvals/approval-detail-view.tsx
    - app/(dashboard)/approvals/page.tsx
    - app/(dashboard)/approvals/[taskId]/page.tsx
  modified:
    - src/shared/lib/query-keys.ts

key-decisions:
  - "ApprovalInbox uses DataTable with event delegation for row click navigation instead of Link per-row"
  - "Optimistic removal from approval list on any action (approve/reject/revision) for instant feedback"
  - "ApprovalDetail mock data generated per taskId inline rather than separate fixture file"
  - "ApprovalActionPanel uses flat button layout (not modal) consistent with standalone page pattern"

patterns-established:
  - "Approval action panel: three toggle buttons with conditional comment textarea, consistent with Phase 6 sign-off modal"
  - "Approvals query staleTime 30s for more frequent refresh vs Infinity for other domains"

requirements-completed: [GOVR-01, GOVR-02]

duration: 4min
completed: 2026-02-19
---

# Phase 08 Plan 05: Approval Queue & Review Summary

**Inbox-style approval queue at /approvals with deliverable review and approve/reject/revision actions at /approvals/[taskId]**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T04:13:53Z
- **Completed:** 2026-02-19T04:17:57Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Built inbox-style approval list at /approvals with DataTable showing priority, task, agent, deliverable count, and submission time
- Created approval detail at /approvals/[taskId] with two-column deliverable review, activity timeline, and action panel
- Implemented approve/reject/revision actions with required comments for reject/revision, optimistic list removal, and toast feedback

## Task Commits

Each task was committed atomically:

1. **Task 1: Approval entity types, query hooks, and inbox-style approval queue** - `820d354` (feat)
2. **Task 2: Approval detail with deliverable review and action panel** - `634e6b0` (feat)

## Files Created/Modified
- `src/entities/approval/model/types.ts` - ApprovalItem, ApprovalAction, ApprovalDetail types
- `src/entities/approval/index.ts` - Barrel export for approval entity
- `src/features/approvals/api/use-approvals.ts` - TanStack Query hook with 6 mock pending approvals (30s staleTime)
- `src/features/approvals/api/use-approval-actions.ts` - Mutation hook with optimistic cache removal
- `src/features/approvals/components/approval-inbox.tsx` - DataTable inbox with priority dots, agent names, delivery counts
- `src/features/approvals/components/approval-review.tsx` - Two-column layout with deliverable cards, preview dialog, task info, activity timeline
- `src/features/approvals/components/approval-action-panel.tsx` - Three action buttons with required/optional comment support
- `src/views/approvals/approvals-list-view.tsx` - List view composition with PageHeader and count badge
- `src/views/approvals/approval-detail-view.tsx` - Detail view composition with breadcrumbs, review, and action panel
- `app/(dashboard)/approvals/page.tsx` - Route page with Suspense
- `app/(dashboard)/approvals/[taskId]/page.tsx` - Dynamic route with generateMetadata and Suspense
- `src/shared/lib/query-keys.ts` - Added approvals query key factory

## Decisions Made
- ApprovalInbox uses DataTable with event delegation on container div for row click navigation, avoiding per-row Link wrappers
- Optimistic removal from approval list on any action (approve/reject/revision) provides instant visual feedback
- ApprovalDetail mock data generated inline per taskId for rich review experience with code snippets, file info, and links
- ApprovalActionPanel uses flat button layout on the page (not a modal) since it has its own dedicated route
- Approval query staleTime set to 30s (vs Infinity for other domains) since approvals should refresh more frequently

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Approval queue and detail pages fully functional with mock data
- Ready for wiring to real API when governance backend is implemented
- Action panel pattern consistent with Phase 6 TaskSignOffModal for design coherence

## Self-Check: PASSED

All 11 created files verified on disk. Both task commits (820d354, 634e6b0) verified in git log.

---
*Phase: 08-sessions-memory-files-governance*
*Completed: 2026-02-19*
