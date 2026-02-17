# Phase 1: Foundation & Infrastructure - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

All architectural foundations: project scaffolding, Docker, database, WebSocket manager, shared component library, state management patterns, audit logging, and job queue. This phase produces the infrastructure every subsequent phase builds on — no user-facing features, but the design system and component library set the visual DNA for the entire app.

</domain>

<decisions>
## Implementation Decisions

### Design system direction
- Aesthetic: Dark, sleek, techy — Linear/Vercel mission control vibes
- Theme: System-aware (follow OS preference) + manual toggle for user override
- Colors: Existing Tailwind v4 OKLCH theme — warm amber/orange primary (`oklch(0.7214 0.1337 49.98)` dark), teal secondary (`oklch(0.5940 0.0443 196.02)` dark), near-black background with subtle purple tint (`oklch(0.1797 0.0043 308.19)`)
- Typography: Outfit (sans), JetBrains Mono (mono), Merriweather (serif)
- Border radius: 0.75rem base
- Density: Comfortable — generous padding, breathing room between elements. No compact mode toggle needed.
- Full OKLCH theme CSS provided (both light and dark mode variables) — use as-is, do not redesign the palette

### Component behavior defaults
- DataTable: Virtual scrolling for large datasets (agents, sessions, logs). Smooth infinite scroll, virtualized off-screen rows
- Empty states: Illustrated + helpful — custom illustrations with friendly copy and clear CTA ("No agents yet — create your first one")
- Loading states: Skeleton screens with animated shimmer/pulse effect. Placeholder shapes mirror the layout about to appear
- StatusBadge: Theme-tinted semantic colors — green becomes teal-green (leaning toward secondary palette), warning stays amber (aligned with primary), error stays red. Semantic meaning preserved but tinted toward the OKLCH palette for visual cohesion and accessibility

### Connection state UX
- Normal state: Persistent top bar indicator showing gateway connection status (icon + text like "Gateway: Connected")
- Disconnect: Full-width warning banner takeover at top — "Gateway disconnected — reconnecting..." Unmissable, blocks nothing below
- Reconnecting: Animated pulsing/spinning indicator + attempt count in the banner — "Reconnecting (attempt 3/5)..."
- Failed state: Persistent banner stays with manual "Retry" button — "Gateway unreachable." No auto-retry after all attempts exhausted; user decides when to try again

### Dev experience priorities
- Docker: Full Docker setup — everything in containers (Next.js, PostgreSQL, Redis). One `docker compose up` starts it all
- Package manager: bun — fast installs, TypeScript-native
- Testing: Vitest for unit tests (utilities, stores, logic) + Storybook for visual component stories. Both from day one
- Code quality: Biome for linting + formatting (single tool). Additional specialized tooling at Claude's discretion (e.g., knip for dead code, TypeScript strict mode)

### Claude's Discretion
- Code quality extras beyond Biome (knip, strict TypeScript, etc.)
- Exact skeleton shimmer animation implementation
- Empty state illustration style (line art, flat, etc.)
- Shadow and spacing fine-tuning within the comfortable density guideline
- Storybook configuration details
- Docker hot reload optimization approach

</decisions>

<specifics>
## Specific Ideas

- Full Tailwind v4 OKLCH theme CSS already defined (both `:root` and `.dark` with `@theme inline` block) — this is the source of truth for all color tokens
- Fonts: Outfit, JetBrains Mono, Merriweather — these are already specified in the theme
- "Mission control" feel — the app should feel like you're in a control room directing AI agents
- Virtual scrolling preference signals power-user orientation despite comfortable density — users want to see lots of data without friction

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-infrastructure*
*Context gathered: 2026-02-17*
