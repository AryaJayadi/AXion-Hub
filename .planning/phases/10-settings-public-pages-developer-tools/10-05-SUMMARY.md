---
phase: 10-settings-public-pages-developer-tools
plan: 05
subsystem: ui
tags: [docs, markdown, openapi, scalar, api-reference, developer-tools]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: FSD structure, shared UI primitives, app shell layout
  - phase: 02-auth-org
    provides: Authenticated dashboard shell wrapping /docs and /api-docs routes
provides:
  - Internal documentation hub at /docs with sidebar navigation and 16 markdown pages
  - Interactive Scalar API reference at /api-docs with OpenAPI 3.1 spec
  - OpenAPI spec endpoint at /api/openapi.json covering auth, agents, sessions, tasks, workflows, audit, settings
affects: [10-06, api-integrations, developer-onboarding]

# Tech tracking
tech-stack:
  added: ["@scalar/api-reference-react"]
  patterns: ["docs content registry with static pages", "Scalar dynamic import with ssr:false", "OpenAPI spec JSON route with caching"]

key-files:
  created:
    - src/features/docs/lib/docs-content.ts
    - src/features/docs/components/docs-sidebar.tsx
    - src/features/docs/components/doc-renderer.tsx
    - src/views/docs/docs-view.tsx
    - src/views/docs/doc-page-view.tsx
    - app/(dashboard)/docs/layout.tsx
    - app/(dashboard)/docs/page.tsx
    - app/(dashboard)/docs/[...slug]/page.tsx
    - src/features/developer-tools/components/scalar-api-reference.tsx
    - src/shared/config/openapi-spec.json
    - app/api/openapi.json/route.ts
    - src/views/developer-tools/api-docs-view.tsx
    - app/(dashboard)/api-docs/page.tsx
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Scalar searchHotKey set to 'q' to avoid conflict with app Cmd+K shortcut"
  - "Docs content stored as static TypeScript registry (not MDX files) for type safety and zero-config rendering"
  - "DocRenderer reuses MDEditor preview-only mode pattern from memory-preview.tsx for consistency"
  - "OpenAPI spec hand-written as static JSON for initial version; auto-generation deferred"
  - "Scalar wrapped in isolate container to prevent CSS bleeding into app shell"

patterns-established:
  - "Static docs content registry: DocPage/DocCategory types with slug-based lookup helpers"
  - "Scalar API reference embedding: dynamic import with ssr:false, dark mode via useTheme"

requirements-completed: [ADEV-01]

# Metrics
duration: 8min
completed: 2026-02-19
---

# Phase 10 Plan 05: Docs Hub & API Reference Summary

**Internal documentation hub with 6 categories and 16 markdown pages at /docs, interactive Scalar API reference at /api-docs backed by OpenAPI 3.1 spec covering 12 endpoint groups**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-19T09:52:38Z
- **Completed:** 2026-02-19T10:01:00Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Documentation hub at /docs with collapsible sidebar navigation, client-side search filter, and 16 genuine-content markdown pages across 6 categories
- Interactive Scalar API reference at /api-docs with dark mode sync, isolated CSS, and searchHotKey conflict avoidance
- Comprehensive OpenAPI 3.1 spec documenting auth, agents, sessions, tasks, workflows, audit, and settings endpoints with typed schemas
- Previous/next page navigation on doc pages with 404 handling via EmptyState

## Task Commits

Each task was committed atomically:

1. **Task 1: Internal documentation hub with sidebar navigation and markdown pages** - `eab791e` (feat)
2. **Task 2: Scalar API reference and OpenAPI spec endpoint** - `749d5a1` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `src/features/docs/lib/docs-content.ts` - Static doc content registry with 6 categories, 16 pages, and lookup helpers
- `src/features/docs/components/docs-sidebar.tsx` - Collapsible category sections with search filter and active state
- `src/features/docs/components/doc-renderer.tsx` - MDEditor preview-only wrapper with dark mode sync
- `src/views/docs/docs-view.tsx` - Landing page with quick links and category grid
- `src/views/docs/doc-page-view.tsx` - Doc page with renderer, prev/next nav, and 404 handling
- `app/(dashboard)/docs/layout.tsx` - Flex layout with PageHeader and sidebar
- `app/(dashboard)/docs/page.tsx` - Server component rendering DocsView
- `app/(dashboard)/docs/[...slug]/page.tsx` - Dynamic route with generateMetadata
- `src/features/developer-tools/components/scalar-api-reference.tsx` - Scalar React component with dark mode and CSS isolation
- `src/shared/config/openapi-spec.json` - OpenAPI 3.1 spec (1163 lines) covering all API endpoints
- `app/api/openapi.json/route.ts` - Spec serving endpoint with cache headers
- `src/views/developer-tools/api-docs-view.tsx` - Full-height Scalar wrapper view
- `app/(dashboard)/api-docs/page.tsx` - API docs route page

## Decisions Made
- Scalar searchHotKey set to "q" instead of empty string (empty string not in enum); avoids Cmd+K conflict with app search
- Docs content stored as static TypeScript registry with typed interfaces rather than MDX files for zero-config builds and type safety
- DocRenderer reuses existing MDEditor preview-only pattern from memory-preview.tsx for project consistency
- OpenAPI spec hand-written as static JSON; auto-generation from route handlers deferred to future enhancement
- Scalar component wrapped in isolate container div to prevent CSS style bleeding
- ApiDocsView uses negative margins (-m-4 md:-m-6) to fill the dashboard content area edge-to-edge for Scalar

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Docs hub and API reference complete and accessible within the authenticated app shell
- /api-docs/ws (WebSocket playground) referenced in docs content; ready for Phase 10 Plan 06 implementation
- OpenAPI spec can be extended as new endpoints are added in future phases

## Self-Check: PASSED

All 13 created files verified on disk. Both task commits (eab791e, 749d5a1) verified in git log.

---
*Phase: 10-settings-public-pages-developer-tools*
*Completed: 2026-02-19*
