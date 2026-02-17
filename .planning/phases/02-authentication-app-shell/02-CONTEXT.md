# Phase 2: Authentication & App Shell - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

User accounts, login/register flows, OAuth, password reset, email verification, organization invitations, and the authenticated app shell with sidebar navigation and route protection. Onboarding wizards, team management, and settings are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Auth flow experience
- Separate pages for login (/login) and register (/register) — not tabbed
- Split-screen layout: left side branding/illustration, right side auth form
- Social login (Google, GitHub) buttons placed below the email/password form
- After login, redirect to last visited page (not a fixed destination)

### App shell layout
- Collapsible sidebar: full labels collapse to icon-only rail, user toggles
- Header bar shows breadcrumbs (left), global search (center-right), user avatar/menu (right)
- Sidebar navigation grouped with section headers (e.g., "Core", "Operations", "Settings") with visual dividers
- Mobile: responsive sidebar — auto-hides on mobile, hamburger button toggles it as overlay

### Registration & onboarding
- Registration fields: name, email, password
- Email verification required before app access (blocking)
- Required checkbox on register page: "I agree to Terms of Service and Privacy Policy" with links
- No onboarding wizard — each page uses contextual empty states to guide first actions

### Organization & invitations
- Multi-org support: users can belong to multiple organizations
- Invitation flow: invite link leads to auth (register or login), then auto-joins the org — no separate confirmation step
- Org switcher in the UI for switching between organizations

### Claude's Discretion
- Org creation strategy (auto-create personal org vs prompt after registration)
- Org switcher placement (top of sidebar vs user menu)
- Split-screen branding/illustration design for auth pages
- Password strength requirements and validation UX
- Error message styling and placement on auth forms
- Loading states during auth operations

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication-app-shell*
*Context gathered: 2026-02-17*
