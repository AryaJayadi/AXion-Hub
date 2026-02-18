---
phase: 07-gateway-channels-models
plan: 02
subsystem: ui
tags: [gateway, config-editor, zustand, react-hook-form, zod, diff, validation, tabs, draft-apply]

# Dependency graph
requires:
  - phase: 07-gateway-channels-models
    provides: Gateway entity types (OpenClawConfig, ConfigSection, ConfigDiff), query keys, route scaffolding
  - phase: 01-foundation
    provides: shared UI components (Tabs, FormField, Input, Textarea, Select, Switch, Dialog, Collapsible, Badge), query key factory
provides:
  - Zustand config draft store with load/update/diff/validate/reset lifecycle
  - Deep config diff utility with dot-path notation
  - Zod v4 validation schemas for all 9 openclaw.json sections
  - useGatewayConfig and useApplyConfig TanStack Query hooks with mock data
  - CONFIG_SECTIONS metadata array mapping section IDs to labels, icons, schemas
  - 9 tabbed config section form components (identity, sessions, channels, models, compaction, memory, security, plugins, gateway)
  - Config editor shell with tab navigation, form/JSON toggle, draft-then-apply workflow
  - Raw JSON editor with debounced sync and parse error display
  - Config diff viewer with color-coded change types
  - Validation panel with grouped errors and jump-to-section navigation
  - Gateway config view page at /gateway/config
affects: [07-03, 07-04, 07-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Draft-then-apply pattern: edit in draft store, review diffs in dialog, explicit apply with toast feedback"
    - "Section form pattern: react-hook-form with zodResolver (as-never cast), debounced 300ms watch callback"
    - "Config diff utility: recursive deep comparison producing dot-path ConfigDiff array"
    - "CONFIG_SECTIONS metadata array: section ID, label, LucideIcon, ZodSchema in single source of truth"

key-files:
  created:
    - src/features/gateway/api/use-gateway-config.ts
    - src/features/gateway/model/config-draft-store.ts
    - src/features/gateway/lib/config-diff.ts
    - src/features/gateway/schemas/config-schemas.ts
    - src/features/gateway/components/config-section-identity.tsx
    - src/features/gateway/components/config-section-sessions.tsx
    - src/features/gateway/components/config-section-channels.tsx
    - src/features/gateway/components/config-section-models.tsx
    - src/features/gateway/components/config-section-compaction.tsx
    - src/features/gateway/components/config-section-memory.tsx
    - src/features/gateway/components/config-section-security.tsx
    - src/features/gateway/components/config-section-plugins.tsx
    - src/features/gateway/components/config-section-gateway.tsx
    - src/features/gateway/components/config-editor.tsx
    - src/features/gateway/components/config-raw-json.tsx
    - src/features/gateway/components/config-diff-viewer.tsx
    - src/features/gateway/components/config-validation-panel.tsx
    - src/views/gateway/gateway-config-view.tsx
  modified:
    - app/(dashboard)/gateway/config/page.tsx

key-decisions:
  - "Zustand without immer: simple state updates sufficient for config draft store (no nested mutation needed)"
  - "structuredClone for deep cloning config on load and reset, avoiding lodash dependency"
  - "Security section flattens nested rateLimiting fields into top-level form fields then reconstructs on update"
  - "Channels section is read-only table with link to /channels for full management"
  - "Models section shows editable defaultModel/maxRetries with read-only provider badges linking to /models"
  - "Plugins section uses controlled add/remove list with badge-based UI instead of form fields"
  - "Raw JSON editor shows full openclaw.json (not per-section) with 500ms debounced sync"
  - "zodResolver cast as never for Zod v4 compatibility consistent with project pattern"

patterns-established:
  - "Draft-then-apply: loadConfig sets both original and draft; isDirty tracks divergence; getDiffs computes changes; apply mutation with cache invalidation"
  - "Section form debounce: react-hook-form watch subscription with 300ms setTimeout for store sync"
  - "Validation panel: grouped by section with clickable jump-to-section switching to form mode"

requirements-completed: [GATE-02, GATE-03]

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 7 Plan 02: Gateway Config Editor with Tabbed Forms, Draft-Apply, and Diff Viewer Summary

**Tabbed config editor at /gateway/config covering all 9 openclaw.json sections with form/JSON toggle, Zustand draft store, diff review dialog, and inline validation with jump-to-section navigation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T13:56:36Z
- **Completed:** 2026-02-18T14:02:15Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Built Zustand config draft store managing full edit lifecycle: load, update per-section, raw JSON sync, diff computation, validation, reset, and apply state tracking
- Created deep recursive config diff utility producing dot-path ConfigDiff arrays with countDiffsBySection grouping
- Implemented 9 config section form components using react-hook-form with Zod validation and debounced store sync
- Composed ConfigEditor shell with tabbed navigation, form/JSON toggle, sticky unsaved-changes bar, and Review & Apply dialog with diff viewer
- Added validation panel with collapsible error groups and clickable jump-to-section links that switch to form mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Config draft store, diff utility, schemas, and API hook** - `3ca5112` (feat)
2. **Task 2: Config section forms, editor shell, raw JSON, diff viewer, and config view** - `88da847` (feat)

## Files Created/Modified
- `src/features/gateway/api/use-gateway-config.ts` - useGatewayConfig and useApplyConfig hooks with mock OpenClawConfig
- `src/features/gateway/model/config-draft-store.ts` - Zustand store managing draft config lifecycle
- `src/features/gateway/lib/config-diff.ts` - Deep recursive diff utility with dot-path notation
- `src/features/gateway/schemas/config-schemas.ts` - Zod v4 schemas for all 9 sections + CONFIG_SECTIONS metadata
- `src/features/gateway/components/config-section-identity.tsx` - Bot name, persona, greeting form
- `src/features/gateway/components/config-section-sessions.tsx` - Duration, thresholds, branching form
- `src/features/gateway/components/config-section-channels.tsx` - Read-only channel table
- `src/features/gateway/components/config-section-models.tsx` - Default model, retries, provider summary
- `src/features/gateway/components/config-section-compaction.tsx` - Enabled toggle, strategy select, threshold
- `src/features/gateway/components/config-section-memory.tsx` - Vector model, results, score threshold
- `src/features/gateway/components/config-section-security.tsx` - Auth mode, origins, rate limiting
- `src/features/gateway/components/config-section-plugins.tsx` - Add/remove plugin list with config display
- `src/features/gateway/components/config-section-gateway.tsx` - Port, data dir, log level, CORS toggle
- `src/features/gateway/components/config-editor.tsx` - Main editor shell with tabs, toggle, apply workflow
- `src/features/gateway/components/config-raw-json.tsx` - Full JSON textarea with debounced sync
- `src/features/gateway/components/config-diff-viewer.tsx` - Color-coded diff display
- `src/features/gateway/components/config-validation-panel.tsx` - Grouped validation errors with jump links
- `src/views/gateway/gateway-config-view.tsx` - Config view page composition
- `app/(dashboard)/gateway/config/page.tsx` - Route page with Suspense and metadata

## Decisions Made
- Zustand without immer middleware: config draft updates are simple property spreads, no deep nested mutation needed
- structuredClone for deep cloning config on load and reset, avoiding lodash dependency
- Security section flattens nested rateLimiting into top-level form fields then reconstructs the nested structure on update
- Channels section is read-only table with navigation link to /channels for full channel management
- Models section provides editable defaultModel/maxRetries with read-only provider badges linking to /models
- Plugins section uses badge-based add/remove list with read-only JSON config display (not form fields for arbitrary configs)
- Raw JSON editor shows the full openclaw.json (not per-section) with 500ms debounced sync back to store
- zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict indexing in countDiffsBySection**
- **Found during:** Task 1
- **Issue:** `split(".")[0]` returns `string | undefined` under strict TS, cannot be used as Record index
- **Fix:** Added `as string` assertion since split always returns at least one element
- **Files modified:** src/features/gateway/lib/config-diff.ts
- **Committed in:** 3ca5112 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial type assertion fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Config editor fully functional at /gateway/config
- Draft store and diff utilities ready for reuse in gateway management workflows
- CONFIG_SECTIONS metadata array available for any future section-aware UI
- Plans 07-03 through 07-05 can proceed with channel management, model configuration, and advanced features

## Self-Check: PASSED

- All 19 key files verified present on disk
- Commits 3ca5112 and 88da847 verified in git log
- TypeScript compilation passes with zero errors

---
*Phase: 07-gateway-channels-models*
*Completed: 2026-02-18*
