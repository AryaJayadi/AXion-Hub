---
phase: 09-skills-plugins-workflows
plan: 01
subsystem: ui
tags: [skills, clawhub, zustand, tanstack-query, codemirror, nuqs, marketplace]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: FSD structure, shadcn/ui components, TanStack Query setup, Zustand, nuqs
  - phase: 07-gateway-management
    provides: config-draft-store pattern, CodeMirror SSR-safe dynamic import pattern
  - phase: 03-agent-management
    provides: AgentSkill type, ICON_MAP pattern, optimistic mutation pattern
provides:
  - Skill entity types (Skill, ClawHubSkill, SkillDetail) with Zod v4 schemas
  - Skills library page at /skills with category-sectioned card grid
  - ClawHub marketplace browser at /skills/clawhub with featured/trending/search
  - Skill detail page at /skills/[skillId] with JSON+form hybrid config editor
  - Zustand skill-config-store with dot-path field updates
  - TanStack Query hooks with mock data for skills, skill detail, and ClawHub
affects: [09-02-plugins, 09-03-workflows, 10-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [skill entity FSD layer, ClawHub marketplace browse pattern, skill config draft store]

key-files:
  created:
    - src/entities/skill/model/types.ts
    - src/entities/skill/model/schemas.ts
    - src/entities/skill/index.ts
    - src/features/skills/api/use-skills.ts
    - src/features/skills/api/use-skill-detail.ts
    - src/features/skills/api/use-clawhub.ts
    - src/features/skills/components/skill-card.tsx
    - src/features/skills/components/skill-grid.tsx
    - src/features/skills/components/clawhub-browser.tsx
    - src/features/skills/components/skill-config-editor.tsx
    - src/features/skills/components/skill-agent-toggles.tsx
    - src/features/skills/model/skill-config-store.ts
    - src/views/skills/skills-library-view.tsx
    - src/views/skills/clawhub-view.tsx
    - src/views/skills/skill-detail-view.tsx
    - app/(dashboard)/skills/page.tsx
    - app/(dashboard)/skills/clawhub/page.tsx
    - app/(dashboard)/skills/[skillId]/page.tsx
  modified:
    - src/shared/lib/query-keys.ts

key-decisions:
  - "SkillCard uses ICON_MAP Record<string, LucideIcon> pattern from Phase 3 for dynamic lucide icon rendering"
  - "Zustand skill-config-store uses structuredClone (not lodash) matching Phase 7 config-draft-store pattern"
  - "setByDotPath uses 'as string' cast for array index access under exactOptionalPropertyTypes"
  - "ClawHub browser uses nuqs URL state for search query and category tab persistence"
  - "MDEditor loaded via next/dynamic with ssr:false for skill readme preview"

patterns-established:
  - "Skill entity layer: types.ts + schemas.ts + barrel index.ts following FSD conventions"
  - "ClawHub marketplace: featured/trending horizontal scroll rows + filterable main grid"
  - "Skill config editor: form/JSON mode toggle with Zustand draft-then-apply workflow"

requirements-completed: [SKIL-01, SKIL-02, SKIL-03]

# Metrics
duration: 7min
completed: 2026-02-19
---

# Phase 9 Plan 01: Skills Library Summary

**Skills library at /skills with category-sectioned card grid, ClawHub marketplace browser with featured/trending/search, and skill detail page with JSON+form hybrid config editor and per-agent toggles**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T07:24:55Z
- **Completed:** 2026-02-19T07:31:58Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Skill entity layer with Skill, ClawHubSkill, SkillDetail types and Zod v4 schemas
- 10 mock installed skills across 6 categories with TanStack Query hooks and optimistic mutations
- 18 mock ClawHub registry skills with featured/trending flags for marketplace browser
- Skills library page at /skills with category-grouped card grid, search, and link to ClawHub
- ClawHub marketplace at /skills/clawhub with featured section, trending section, category tabs, and search filtering
- Skill detail page at /skills/[skillId] with form/JSON hybrid config editor, per-agent toggle switches, and markdown readme

## Task Commits

Each task was committed atomically:

1. **Task 1: Skill entity types, query keys, and TanStack Query hooks** - `9a7e234` (feat)
2. **Task 2: Skills library, ClawHub browser, and skill detail pages** - `e965ac8` (feat)

## Files Created/Modified

- `src/entities/skill/model/types.ts` - Skill, ClawHubSkill, SkillDetail, SkillConfig types
- `src/entities/skill/model/schemas.ts` - Zod v4 schemas for skill entities
- `src/entities/skill/index.ts` - Barrel export for skill entity
- `src/features/skills/api/use-skills.ts` - useSkills, useInstallSkill, useToggleSkill hooks with 10 mock skills
- `src/features/skills/api/use-skill-detail.ts` - useSkillDetail, useUpdateSkillConfig, useToggleSkillForAgent hooks
- `src/features/skills/api/use-clawhub.ts` - useClawHubSkills, useInstallFromClawHub hooks with 18 mock skills
- `src/features/skills/components/skill-card.tsx` - Compact skill card with dynamic icon, status badge, nav
- `src/features/skills/components/skill-grid.tsx` - Category-sectioned card grid
- `src/features/skills/components/clawhub-browser.tsx` - Marketplace with featured/trending/category/search
- `src/features/skills/components/skill-config-editor.tsx` - Form/JSON toggle editor with CodeMirror
- `src/features/skills/components/skill-agent-toggles.tsx` - Per-agent enable/disable switch list
- `src/features/skills/model/skill-config-store.ts` - Zustand draft-then-apply config store
- `src/views/skills/skills-library-view.tsx` - Installed skills page composition
- `src/views/skills/clawhub-view.tsx` - ClawHub marketplace page composition
- `src/views/skills/skill-detail-view.tsx` - Skill detail with config editor, agent toggles, readme
- `app/(dashboard)/skills/page.tsx` - Route for /skills
- `app/(dashboard)/skills/clawhub/page.tsx` - Route for /skills/clawhub
- `app/(dashboard)/skills/[skillId]/page.tsx` - Route for /skills/[skillId]
- `src/shared/lib/query-keys.ts` - Added skills and clawhub query key domains

## Decisions Made

- SkillCard uses ICON_MAP Record<string, LucideIcon> pattern from Phase 3 for dynamic lucide icon rendering
- Zustand skill-config-store uses structuredClone (not lodash) matching Phase 7 config-draft-store pattern
- setByDotPath uses `as string` cast for array index access under exactOptionalPropertyTypes
- ClawHub browser uses nuqs URL state for search query and category tab persistence
- MDEditor loaded via next/dynamic with ssr:false for skill readme preview
- Skill status maps to StatusBadge via STATUS_MAP: enabled=online, disabled=offline, update_available=warning

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed setByDotPath array index type under exactOptionalPropertyTypes**
- **Found during:** Task 2 (skill-config-store.ts)
- **Issue:** `parts[i]` returns `string | undefined` under exactOptionalPropertyTypes, cannot be used as index
- **Fix:** Added `as string` cast on array index access (consistent with project pattern for array indexing)
- **Files modified:** src/features/skills/model/skill-config-store.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** e965ac8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor TypeScript strictness fix, no scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Skill entity layer ready for plugin and workflow plans to reference
- Query key factory extended with skills and clawhub domains
- Config editor pattern reusable for plugin configuration in Plan 02
- ClawHub marketplace pattern reusable for plugin marketplace

## Self-Check: PASSED

- All 19 files verified present on disk
- Both task commits (9a7e234, e965ac8) verified in git log
- `npx tsc --noEmit` passes with zero errors in plan files

---
*Phase: 09-skills-plugins-workflows*
*Completed: 2026-02-19*
