---
phase: 10-settings-public-pages-developer-tools
plan: 01
subsystem: ui
tags: [settings, better-auth, twoFactor, apiKey, react-hook-form, zod, next-themes]

# Dependency graph
requires:
  - phase: 02-auth-org
    provides: better-auth config, auth-client, auth-schema
  - phase: 01-foundation
    provides: query-keys, page-header, card, form-field
provides:
  - Settings layout with sidebar navigation pattern for all /settings/* routes
  - General settings form with app name, timezone, language
  - Theme toggle with Light/Dark/System via next-themes
  - Profile settings form with authClient.updateUser integration
  - better-auth twoFactor and apiKey server/client plugins
  - Settings query key domain
  - Settings types and Zod validation schemas
affects: [10-02, 10-03, 10-04, 10-05, 10-06]

# Tech tracking
tech-stack:
  added: [better-auth/plugins/twoFactor, better-auth/plugins/apiKey]
  patterns: [settings-sidebar-nav, save-per-section-form, theme-toggle-cards]

key-files:
  created:
    - src/features/settings/model/settings-types.ts
    - src/features/settings/schemas/settings-schemas.ts
    - src/features/settings/api/use-settings.ts
    - src/features/settings/components/settings-sidebar.tsx
    - src/features/settings/components/general-settings-form.tsx
    - src/features/settings/components/theme-settings-form.tsx
    - src/features/settings/components/profile-settings-form.tsx
    - src/views/settings/settings-general-view.tsx
    - src/views/settings/settings-profile-view.tsx
    - app/(dashboard)/settings/layout.tsx
    - app/(dashboard)/settings/page.tsx
    - app/(dashboard)/settings/profile/page.tsx
  modified:
    - src/features/auth/lib/auth.ts
    - src/features/auth/lib/auth-client.ts
    - src/shared/lib/query-keys.ts

key-decisions:
  - "SettingsSidebar uses plain <nav> element (not shadcn Sidebar component) per research Pitfall 5"
  - "zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)"
  - "Profile avatar is URL input for MVP; file upload deferred to later iteration"
  - "Theme toggle uses card-style buttons (not ToggleGroup) for visual clarity with icon + label"

patterns-established:
  - "Settings sidebar: usePathname exact match for /settings, startsWith for sub-pages"
  - "Save-per-section: each settings card has its own form and Save button"
  - "Theme toggle: instant switching via next-themes setTheme, no Save button needed"

requirements-completed: [SETT-01, SETT-02]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 10 Plan 01: Settings Foundation Summary

**Settings infrastructure with sidebar navigation, general workspace settings (app name/timezone/language), theme toggle, profile management, and better-auth twoFactor/apiKey plugins**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T09:52:38Z
- **Completed:** 2026-02-19T09:56:49Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Settings layout with sidebar navigation across 9 categories and active state highlighting
- General settings form with App Name, Timezone (12 options), Language (5 options) and save-per-section pattern
- Theme appearance card with Light/Dark/System instant toggle via next-themes
- Profile settings form with display name and avatar URL, saving via authClient.updateUser
- better-auth extended with twoFactor (issuer "AXion Hub") and apiKey (prefix "axion_") plugins on server and client

## Task Commits

Each task was committed atomically:

1. **Task 1: Settings foundation** - `29ee217` (feat)
2. **Task 2: General settings page and profile settings page** - `4358bc4` (feat)

## Files Created/Modified
- `src/features/auth/lib/auth.ts` - Extended with twoFactor and apiKey server plugins
- `src/features/auth/lib/auth-client.ts` - Extended with twoFactorClient and apiKeyClient plugins
- `src/shared/lib/query-keys.ts` - Added settings domain with general, profile, security, team, apiKeys, notifications, integrations sub-keys
- `src/features/settings/model/settings-types.ts` - GeneralSettings, ProfileSettings, SettingsNavItem types
- `src/features/settings/schemas/settings-schemas.ts` - Zod v4 schemas for general and profile settings
- `src/features/settings/api/use-settings.ts` - TanStack Query hooks for settings data
- `src/features/settings/components/settings-sidebar.tsx` - 9-item sidebar with active state detection
- `src/features/settings/components/general-settings-form.tsx` - App name, timezone, language form
- `src/features/settings/components/theme-settings-form.tsx` - Light/Dark/System theme toggle
- `src/features/settings/components/profile-settings-form.tsx` - Display name and avatar form
- `src/views/settings/settings-general-view.tsx` - Composes general + theme forms
- `src/views/settings/settings-profile-view.tsx` - Profile form with session defaults
- `app/(dashboard)/settings/layout.tsx` - Settings layout with PageHeader and sidebar
- `app/(dashboard)/settings/page.tsx` - General settings route
- `app/(dashboard)/settings/profile/page.tsx` - Profile settings route

## Decisions Made
- SettingsSidebar uses plain `<nav>` element (not shadcn Sidebar component) per research Pitfall 5
- zodResolver cast as-never for Zod v4 + exactOptionalPropertyTypes compatibility (consistent project pattern)
- Profile avatar is URL input for MVP; file upload deferred to later iteration
- Theme toggle uses card-style buttons (not ToggleGroup) for visual clarity with icon + label
- Profile form defaults derived from authClient.useSession() rather than separate API call

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Settings layout and sidebar ready for all subsequent settings plans (security, team, API keys, etc.)
- better-auth twoFactor plugin ready for 10-02 (security settings)
- better-auth apiKey plugin ready for 10-03 (API key management)
- Query keys extended for all planned settings domains

## Self-Check: PASSED

All 12 created files verified. Both commit hashes (29ee217, 4358bc4) confirmed in git log.

---
*Phase: 10-settings-public-pages-developer-tools*
*Plan: 01*
*Completed: 2026-02-19*
