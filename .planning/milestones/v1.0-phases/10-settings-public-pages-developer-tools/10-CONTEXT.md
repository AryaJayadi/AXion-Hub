# Phase 10: Settings, Public Pages & Developer Tools - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

All settings pages for authenticated users to configure their workspace, profile, security, team, API keys, integrations, and danger zone actions. Internal documentation hub with sidebar navigation. Interactive API reference (Scalar) and WebSocket playground for developers. No public marketing pages — AXion Hub is an internal mission control tool, not a SaaS product.

**Dropped from original roadmap scope:** Landing page, features page, pricing page, public changelog, blog (SITE-01 through SITE-06). These are not applicable — AXion Hub is for internal teams, not public visitors.

</domain>

<decisions>
## Implementation Decisions

### Settings architecture
- Sidebar + separate pages pattern (like GitHub Settings) — left nav with categories, each category is its own route
- Save button per section — each card/section has its own Save button, changes are isolated
- API keys shown once on creation, masked forever after — only last 4 chars visible post-creation (Stripe pattern)
- Danger zone uses type-workspace-name confirmation — user must type exact workspace/org name to confirm destructive actions

### Docs & content
- No pricing page, no landing page, no blog, no public changelog — internal tool only
- Internal docs use sidebar + markdown pages format — left nav tree with categories, searchable
- Docs live inside the authenticated app shell — same sidebar, same nav, must be logged in

### Developer tools
- API reference uses Scalar — modern interactive OpenAPI viewer embedded within the app
- WebSocket playground is a full interactive console — connect to gateway, send/receive events live, event log with timestamps
- Playground includes session log with JSON export — events persist for current session, exportable for debugging
- Pre-built event templates + free-form JSON editor — dropdown of common events as starting templates, plus raw JSON editor for custom payloads

### Cross-cutting identity
- All three surfaces (settings, docs, dev tools) live inside the authenticated app shell
- Settings grouped by domain in sidebar — near user menu area. Docs/Dev Tools get their own sidebar section
- Same OKLCH theme throughout — settings, docs, and dev tools use the exact same theme and component library
- 2FA uses TOTP only — Google Authenticator/Authy style with QR code + backup codes. No WebAuthn.

### Claude's Discretion
- Settings sidebar category ordering and grouping
- Docs content structure and categories
- Scalar integration specifics and configuration
- WebSocket playground event template catalog (based on OpenClaw event types)
- Export format details for playground session logs
- Backup/export data format choices
- Integration connection UI patterns

</decisions>

<specifics>
## Specific Ideas

- Scalar for API reference (not Swagger UI or Redoc) — user explicitly chose this
- WebSocket playground should feel like a developer console, not a simple form
- Settings should follow GitHub's sidebar pattern for familiarity
- API key reveal-once pattern matches Stripe's approach

</specifics>

<deferred>
## Deferred Ideas

- Public-facing marketing site (landing, features, pricing) — not applicable for internal tool; if needed in future, would be its own phase
- Public blog/changelog — same as above

</deferred>

---

*Phase: 10-settings-public-pages-developer-tools*
*Context gathered: 2026-02-19*
