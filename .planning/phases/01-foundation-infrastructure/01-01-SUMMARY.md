---
phase: 01-foundation-infrastructure
plan: 01
subsystem: infra
tags: [nextjs, tailwind-v4, oklch, shadcn-ui, biome, vitest, storybook, fsd, typescript, bun]

# Dependency graph
requires: []
provides:
  - "Next.js 16 project scaffold with Turbopack, TypeScript strict mode"
  - "Tailwind CSS v4 OKLCH theme with light/dark mode support"
  - "FSD directory structure (views, widgets, features, entities, shared)"
  - "Biome 2 linting and formatting"
  - "Vitest 4 test runner with jsdom"
  - "Storybook 10 with @storybook/nextjs framework"
  - "shadcn/ui configured with FSD path aliases"
  - "AppProviders composition (theme, query, toast)"
  - "Environment variable validation via @t3-oss/env-nextjs"
  - "All Phase 1 production and dev dependencies installed"
affects: [01-02, 01-03, 01-04, 01-05, 01-06, 01-07, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: [next@16.1.6, react@19.2.3, tailwindcss@4.1.18, typescript@5.9.3, biome@2.4.2, vitest@4.0.18, storybook@10.2.9, drizzle-orm@0.45.1, zustand@5.0.11, tanstack-query@5.90.21, zod@4.3.6, shadcn-ui@3.8.5, next-themes@0.4.6, sonner@2.0.7, bullmq@5.69.3, ioredis@5.9.3, pino@10.3.1, ws@8.19.0, nanoid@5.1.6, date-fns@4.1.0, nuqs@2.8.8]
  patterns: [FSD-with-nextjs-app-router, css-first-tailwind-v4, oklch-theme-tokens, provider-composition-pattern, zod-v4-env-validation]

key-files:
  created: [package.json, tsconfig.json, biome.json, vitest.config.mts, next.config.ts, postcss.config.mjs, components.json, src/app/styles/globals.css, src/shared/lib/cn.ts, src/shared/lib/env.ts, src/app/providers/app-providers.tsx, src/app/providers/theme-provider.tsx, src/app/providers/query-provider.tsx, app/layout.tsx, app/page.tsx, "app/(dashboard)/layout.tsx", .storybook/main.ts, .storybook/preview.tsx, .env.example]
  modified: []

key-decisions:
  - "Renamed FSD 'pages' layer to 'views' to avoid Next.js Pages Router detection conflict"
  - "Excluded CSS files from Biome linting/formatting; used tailwindDirectives parser option for Tailwind v4 @theme syntax"
  - "Used Zod v4 (zod/v4 import) with @t3-oss/env-nextjs for environment validation"
  - "Installed Storybook v10 (latest) with @storybook/nextjs framework, removed v8 addon-essentials due to version incompatibility"
  - "Used bun as package manager (installed from scratch as it was not present on system)"

patterns-established:
  - "FSD layers: src/views (renamed from pages), src/widgets, src/features, src/entities, src/shared -- app/ at root for Next.js routing"
  - "Provider composition: ThemeProvider > QueryProvider > children + Toaster in AppProviders"
  - "cn() utility: clsx + tailwind-merge at src/shared/lib/cn.ts"
  - "OKLCH theme tokens: CSS variables in :root/.dark, mapped via @theme inline to Tailwind utilities"
  - "Biome 2 config: tab indentation, 100 line width, CSS with tailwindDirectives enabled"

requirements-completed: [INFR-01, INFR-08]

# Metrics
duration: 11min
completed: 2026-02-17
---

# Phase 1 Plan 1: Project Scaffold Summary

**Next.js 16 with Turbopack, Tailwind v4 OKLCH theme, FSD directory structure, Biome/Vitest/Storybook tooling, and 24 production dependencies**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-17T16:05:35Z
- **Completed:** 2026-02-17T16:17:29Z
- **Tasks:** 2
- **Files modified:** 43

## Accomplishments
- Next.js 16.1.6 project with TypeScript strict mode, Turbopack, and standalone output builds successfully
- Full OKLCH theme with 24 CSS custom properties per mode, Tailwind v4 CSS-first config, and system-aware dark/light switching
- Feature-Sliced Design directory structure with views/widgets/features/entities/shared layers
- All Phase 1 dependencies installed (24 production, 17 dev) with Biome linting clean, Vitest tests passing, Storybook building

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js 16 project with all dependencies, TypeScript strict mode, and tooling configs** - `0e9db83` (feat)
2. **Task 2: Create FSD directory structure, OKLCH theme, root layout with providers, and Storybook** - `a35b522` (feat)

## Files Created/Modified
- `package.json` - Project manifest with all Phase 1 dependencies and scripts
- `tsconfig.json` - TypeScript strict mode with noUncheckedIndexedAccess, path aliases to src/
- `next.config.ts` - Standalone output, serverExternalPackages for pino/bullmq
- `biome.json` - Biome 2 linter/formatter with Tailwind CSS directive support
- `vitest.config.mts` - Vitest 4 with jsdom, React plugin, tsconfig paths
- `components.json` - shadcn/ui config pointing to src/shared/ui and src/shared/lib/cn
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss plugin
- `src/app/styles/globals.css` - Full OKLCH theme with light/dark mode, @theme inline tokens, shimmer animation
- `src/shared/lib/cn.ts` - Tailwind class merging utility (clsx + tailwind-merge)
- `src/shared/lib/env.ts` - Environment variable validation with @t3-oss/env-nextjs and Zod v4
- `src/app/providers/app-providers.tsx` - Composed ThemeProvider + QueryProvider + Toaster
- `src/app/providers/theme-provider.tsx` - next-themes with class attribute, system default
- `src/app/providers/query-provider.tsx` - TanStack Query with 60s stale time
- `app/layout.tsx` - Root layout with Outfit/JetBrains Mono/Merriweather fonts, AppProviders wrapper
- `app/page.tsx` - Placeholder page demonstrating primary/secondary/destructive theme colors
- `app/(dashboard)/layout.tsx` - Dashboard layout shell (sidebar placeholder for Phase 2)
- `.storybook/main.ts` - Storybook 10 config with @storybook/nextjs framework
- `.storybook/preview.tsx` - Preview config importing globals.css with dark mode decorator
- `src/shared/ui/button-placeholder.stories.tsx` - Placeholder story demonstrating theme integration
- `.env.example` - Required environment variables template

## Decisions Made
- Renamed FSD "pages" layer to "views" because Next.js 16 detects any directory named `pages` as a Pages Router directory, causing a build error when `app/` is at root level
- Excluded CSS from Biome linting/formatting -- Tailwind v4 `@theme inline` and `@source` directives are not standard CSS and require Biome's `tailwindDirectives` parser option to parse without errors
- Used Storybook v10 (latest stable) instead of v8 as specified in research -- v8 addon-essentials caused export mismatch errors with v10 core; removed addon-essentials in favor of v10's built-in functionality
- Installed bun from scratch (was not present in the environment) as the project requires it per user decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed bun package manager**
- **Found during:** Task 1 (project initialization)
- **Issue:** bun command not found on the system; required for all package management
- **Fix:** Installed bun via official install script (curl -fsSL https://bun.sh/install)
- **Files modified:** None (system-level install)
- **Verification:** `bun --version` returns 1.3.9
- **Committed in:** 0e9db83 (part of Task 1 commit)

**2. [Rule 1 - Bug] Fixed Biome 2 config schema (include -> includes, organizeImports -> assist)**
- **Found during:** Task 1 (biome.json creation)
- **Issue:** Biome 2.4.2 changed config keys: `include` became `includes`, `organizeImports` moved under `assist.actions.source`, `ignore` removed
- **Fix:** Updated biome.json to use Biome 2 schema with correct key names and added `tailwindDirectives: true` for CSS parser
- **Files modified:** biome.json
- **Verification:** `bun run lint` passes with zero errors
- **Committed in:** 0e9db83 (part of Task 1 commit)

**3. [Rule 1 - Bug] Fixed FSD pages/Next.js App Router collision**
- **Found during:** Task 2 (FSD directory creation)
- **Issue:** `src/pages/` directory caused Next.js build error: "pages and app directories should be under the same folder"
- **Fix:** Renamed FSD pages layer from `src/pages/` to `src/views/`
- **Files modified:** Directory rename only
- **Verification:** `bun run build` completes successfully
- **Committed in:** a35b522 (part of Task 2 commit)

**4. [Rule 3 - Blocking] Fixed Storybook addon version mismatch**
- **Found during:** Task 2 (Storybook setup)
- **Issue:** @storybook/addon-essentials@8.6.14 had export mismatch with storybook@10.2.9 core (Icons export not found)
- **Fix:** Removed @storybook/addon-essentials and @storybook/blocks; Storybook v10 includes essentials built-in
- **Files modified:** package.json, .storybook/main.ts
- **Verification:** `bun run build-storybook` completes successfully
- **Committed in:** a35b522 (part of Task 2 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep. The FSD layer rename (pages -> views) is a permanent architectural decision that all future plans must follow.

## Issues Encountered
- create-next-app rejected "AXion-Hub" as a project name (npm naming restriction: no capital letters). Scaffolded in a temp directory with a valid npm name, then copied files back.

## User Setup Required
None - no external service configuration required. The `.env.example` file documents required variables for when database and Redis are set up in Plan 01-03 (Docker).

## Next Phase Readiness
- Project builds, lints clean, and tests pass -- ready for all subsequent Phase 1 plans
- shadcn/ui configured and ready for component library work (Plan 01-07)
- FSD directory structure in place for feature development
- Storybook ready for component stories
- Note: FSD "pages" layer renamed to "views" -- all plans referencing `src/pages/` should use `src/views/` instead

## Self-Check: PASSED

All 19 key files verified present. Both task commits verified in git log (0e9db83, a35b522).

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-02-17*
