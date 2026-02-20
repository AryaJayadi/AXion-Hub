# Phase 10: Settings, Public Pages & Developer Tools - Research

**Researched:** 2026-02-19
**Domain:** Settings UI, internal documentation, interactive API reference, WebSocket playground
**Confidence:** HIGH

## Summary

Phase 10 spans three distinct surfaces -- all within the authenticated app shell: (1) a comprehensive settings center with sidebar navigation, (2) internal documentation with sidebar+markdown, and (3) developer tools comprising an interactive Scalar API reference and a WebSocket playground console. The SITE-01 through SITE-06 public marketing pages are deferred per user decision -- AXion Hub is an internal mission control tool.

The project's existing stack provides nearly everything needed. better-auth already supports organization management, 2FA/TOTP, session management, and has an API key plugin that can be added with minimal config. Scalar provides the interactive API reference via `@scalar/api-reference-react`. The WebSocket playground can reuse the existing `WebSocketManager` and `EventBus` from gateway-connection, wrapping them in a developer console UI with CodeMirror for JSON editing. The settings sidebar pattern uses the existing shadcn sidebar components already in the codebase.

**Primary recommendation:** Extend better-auth config with `twoFactor()` and `apiKey()` plugins, add `@scalar/api-reference-react` for API docs, and build the WebSocket playground on top of the existing gateway-connection infrastructure. Settings pages follow FSD feature pattern with react-hook-form + zod for each section's save-per-section forms.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Sidebar + separate pages pattern (like GitHub Settings) -- left nav with categories, each category is its own route
- Save button per section -- each card/section has its own Save button, changes are isolated
- API keys shown once on creation, masked forever after -- only last 4 chars visible post-creation (Stripe pattern)
- Danger zone uses type-workspace-name confirmation -- user must type exact workspace/org name to confirm destructive actions
- No pricing page, no landing page, no blog, no public changelog -- internal tool only
- Internal docs use sidebar + markdown pages format -- left nav tree with categories, searchable
- Docs live inside the authenticated app shell -- same sidebar, same nav, must be logged in
- API reference uses Scalar -- modern interactive OpenAPI viewer embedded within the app
- WebSocket playground is a full interactive console -- connect to gateway, send/receive events live, event log with timestamps
- Playground includes session log with JSON export -- events persist for current session, exportable for debugging
- Pre-built event templates + free-form JSON editor -- dropdown of common events as starting templates, plus raw JSON editor for custom payloads
- All three surfaces (settings, docs, dev tools) live inside the authenticated app shell
- Settings grouped by domain in sidebar -- near user menu area. Docs/Dev Tools get their own sidebar section
- Same OKLCH theme throughout -- settings, docs, and dev tools use the exact same theme and component library
- 2FA uses TOTP only -- Google Authenticator/Authy style with QR code + backup codes. No WebAuthn.

### Claude's Discretion
- Settings sidebar category ordering and grouping
- Docs content structure and categories
- Scalar integration specifics and configuration
- WebSocket playground event template catalog (based on OpenClaw event types)
- Export format details for playground session logs
- Backup/export data format choices
- Integration connection UI patterns

### Deferred Ideas (OUT OF SCOPE)
- Public-facing marketing site (landing, features, pricing) -- not applicable for internal tool; if needed in future, would be its own phase
- Public blog/changelog -- same as above
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETT-01 | User can configure app name, timezone, theme (dark/light), language at `/settings` | next-themes already integrated; workspace metadata in organization table; form-per-section pattern with react-hook-form |
| SETT-02 | User can manage profile (display name, avatar) at `/settings/profile` | better-auth `authClient.updateUser({ name, image })` API; file upload for avatar |
| SETT-03 | User can manage security settings (password, 2FA, API keys, sessions) at `/settings/security` | better-auth `twoFactor()` plugin for TOTP/2FA; `changePassword` API; `listSessions` / `revokeSession` APIs |
| SETT-04 | User can manage organization settings, members, and roles at `/settings/team` | better-auth organization plugin already configured; `updateMemberRole`, `removeMember` APIs |
| SETT-05 | User can invite users and manage pending invitations at `/settings/team/invites` | better-auth organization `createInvitation` / invitation table already in schema; `sendInvitationEmail` configured |
| SETT-06 | User can manage AXion Hub API keys for external integrations at `/settings/api` | better-auth `apiKey()` plugin; create/list/delete APIs; show-once pattern on creation |
| SETT-07 | User can configure notification preferences at `/settings/notifications` | Custom settings table in DB; form fields for email/webhook/Slack/Discord toggles |
| SETT-08 | User can connect external services (GitHub, Linear, Jira) at `/settings/integrations` | OAuth connection cards UI pattern; store connection status in custom table |
| SETT-09 | User can export config, sessions, and workspace data at `/settings/backup` | Server-side export API generating JSON/ZIP archives; download via blob |
| SETT-10 | User can access danger zone at `/settings/danger` | better-auth `deleteOrganization` API; type-name confirmation dialog pattern |
| ADEV-01 | Interactive REST API documentation at `/api-docs` | `@scalar/api-reference-react` with OpenAPI spec served from `/api/openapi.json` |
| ADEV-02 | WebSocket playground at `/api-docs/ws` | Reuse `WebSocketManager` and `EventBus`; CodeMirror JSON editor; event template catalog from `KnownEvents` |
</phase_requirements>

## Standard Stack

### Core (Already in Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.4.18 | Auth, 2FA, API keys, sessions, org management | Already integrated; has twoFactor and apiKey plugins |
| react-hook-form | ^7.71.1 | Form state management | Already used across 28 files in the project |
| @hookform/resolvers | ^5.2.2 | Zod resolver for RHF | Already in project |
| zod | ^4.3.6 | Schema validation | Already used throughout |
| @uiw/react-codemirror | ^4.25.4 | Code/JSON editor | Already used for workspace and skill editors |
| @codemirror/lang-json | ^6.0.2 | JSON syntax highlighting | Already installed for editors |
| next-themes | ^0.4.6 | Theme switching | Already integrated in ThemeProvider |
| sonner | ^2.0.7 | Toast notifications | Already integrated |
| lucide-react | ^0.574.0 | Icons | Already integrated |
| nuqs | ^2.8.8 | URL search params state | Already integrated |

### New Dependencies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @scalar/api-reference-react | ^0.8.57 | Interactive OpenAPI API reference viewer | ADEV-01: Embeds Scalar API docs inside React |
| react-qr-code | ^2.0.18 | QR code generation for TOTP setup | SETT-03: Display QR code for authenticator app |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @scalar/api-reference-react | @scalar/nextjs-api-reference (route handler) | Route handler renders as standalone page; React component embeds inside app shell -- we need embedded |
| react-qr-code | qrcode.react | Both work; react-qr-code is lighter, SVG-based, matches better-auth docs example |

**Installation:**
```bash
npm install @scalar/api-reference-react react-qr-code
```

## Architecture Patterns

### Recommended Project Structure

```
app/(dashboard)/
  settings/
    page.tsx                   # /settings -> General (SETT-01)
    layout.tsx                 # Settings layout with sidebar
    profile/page.tsx           # /settings/profile (SETT-02)
    security/page.tsx          # /settings/security (SETT-03)
    team/page.tsx              # /settings/team (SETT-04)
    team/invites/page.tsx      # /settings/team/invites (SETT-05)
    api/page.tsx               # /settings/api (SETT-06)
    notifications/page.tsx     # /settings/notifications (SETT-07)
    integrations/page.tsx      # /settings/integrations (SETT-08)
    backup/page.tsx            # /settings/backup (SETT-09)
    danger/page.tsx            # /settings/danger (SETT-10)
  docs/
    page.tsx                   # /docs -> Docs landing
    layout.tsx                 # Docs layout with sidebar tree
    [...slug]/page.tsx         # Dynamic doc pages
  api-docs/
    page.tsx                   # /api-docs -> Scalar API reference (ADEV-01)
    ws/page.tsx                # /api-docs/ws -> WebSocket playground (ADEV-02)

src/
  features/
    settings/
      components/
        settings-sidebar.tsx         # Left nav component
        general-settings-form.tsx    # SETT-01 form
        profile-settings-form.tsx    # SETT-02 form
        security-settings-form.tsx   # SETT-03 form (password, sessions)
        totp-setup-card.tsx          # SETT-03 2FA setup
        api-key-manager.tsx          # SETT-06 key management
        team-members-table.tsx       # SETT-04 member list
        invite-manager.tsx           # SETT-05 invitations
        notification-prefs-form.tsx  # SETT-07 form
        integration-cards.tsx        # SETT-08 connection cards
        backup-export-card.tsx       # SETT-09 export
        danger-zone-card.tsx         # SETT-10 destructive actions
      api/
        use-settings.ts              # TanStack Query hooks for settings
        use-api-keys.ts              # API key CRUD hooks
      model/
        settings-types.ts            # TypeScript types
      schemas/
        settings-schemas.ts          # Zod schemas for forms
    docs/
      components/
        docs-sidebar.tsx             # Left nav tree for docs
        doc-renderer.tsx             # Markdown rendering
      lib/
        docs-content.ts              # Doc content loading
    developer-tools/
      components/
        ws-playground.tsx            # WebSocket playground console
        event-template-picker.tsx    # Pre-built event templates
        event-log.tsx                # Session event log with timestamps
        connection-panel.tsx         # Connection URL/token inputs
      model/
        playground-store.ts          # Zustand store for playground state
        event-templates.ts           # Pre-built event template catalog
      lib/
        playground-ws-manager.ts     # Thin wrapper over WebSocketManager
  views/
    settings/
      settings-general-view.tsx
      settings-profile-view.tsx
      settings-security-view.tsx
      settings-team-view.tsx
      settings-invites-view.tsx
      settings-api-view.tsx
      settings-notifications-view.tsx
      settings-integrations-view.tsx
      settings-backup-view.tsx
      settings-danger-view.tsx
    docs/
      docs-view.tsx
      doc-page-view.tsx
    developer-tools/
      api-docs-view.tsx
      ws-playground-view.tsx
```

### Pattern 1: Settings Sidebar Layout

**What:** Dedicated settings layout with left sidebar navigation and content area
**When to use:** Settings pages that share common navigation context

The settings layout uses a nested layout route at `app/(dashboard)/settings/layout.tsx` that renders a settings-specific sidebar alongside the page content. This is separate from the main AppSidebar.

```typescript
// app/(dashboard)/settings/layout.tsx
import { SettingsSidebar } from "@/features/settings/components/settings-sidebar";

export default function SettingsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <SettingsSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
```

```typescript
// src/features/settings/components/settings-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import {
  Settings, User, Shield, Users, Key,
  Bell, Plug, Download, AlertTriangle
} from "lucide-react";

const SETTINGS_NAV = [
  { label: "General", href: "/settings", icon: Settings },
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Team", href: "/settings/team", icon: Users },
  { label: "API Keys", href: "/settings/api", icon: Key },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
  { label: "Backup & Export", href: "/settings/backup", icon: Download },
  { label: "Danger Zone", href: "/settings/danger", icon: AlertTriangle },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-56 shrink-0 space-y-1">
      {SETTINGS_NAV.map((item) => {
        const isActive = item.href === "/settings"
          ? pathname === "/settings"
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Pattern 2: Save-Per-Section Form

**What:** Each settings card/section has its own form with isolated save
**When to use:** All SETT-* settings pages

```typescript
// Example: General settings section
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";

const generalSchema = z.object({
  appName: z.string().min(1).max(100),
  timezone: z.string(),
});

type GeneralValues = z.infer<typeof generalSchema>;

export function GeneralSettingsForm({ defaults }: { defaults: GeneralValues }) {
  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: GeneralValues) {
    try {
      // API call
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Configure your workspace basics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="App Name" error={form.formState.errors.appName?.message}>
            <Input {...form.register("appName")} />
          </FormField>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: API Key Show-Once (Stripe Pattern)

**What:** API key is shown in full exactly once at creation, then masked forever
**When to use:** SETT-06 API key management

```typescript
// After creation, key value is shown in a dialog
// State: { justCreatedKey: string | null }
// When justCreatedKey is set, show dialog with:
//   - Full key visible
//   - Copy to clipboard button
//   - Warning: "This key won't be shown again"
//   - Close dismisses the key permanently

// In the key list table, show:
//   name | prefix + "****" + last4 | created | actions(delete)
```

### Pattern 4: Type-to-Confirm Danger Zone

**What:** Destructive actions require typing the workspace/org name exactly
**When to use:** SETT-10 danger zone

```typescript
// Pattern: Input must match organization name exactly
// Button stays disabled until input matches
// Visual: red border card, destructive variant button
const [confirmText, setConfirmText] = useState("");
const canDelete = confirmText === organization.name;
```

### Pattern 5: Scalar API Reference Embedding

**What:** Embed Scalar interactive API docs inside the app shell
**When to use:** ADEV-01

```typescript
"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useTheme } from "next-themes";

export function ApiDocsView() {
  const { resolvedTheme } = useTheme();

  return (
    <ApiReferenceReact
      configuration={{
        url: "/api/openapi.json",
        darkMode: resolvedTheme === "dark",
        layout: "modern",
        hideModels: false,
        customCss: `
          .scalar-app { font-family: var(--font-outfit), sans-serif; }
        `,
      }}
    />
  );
}
```

### Pattern 6: WebSocket Playground Console

**What:** Interactive console for sending/receiving gateway WebSocket events
**When to use:** ADEV-02

The playground creates its own standalone `WebSocketManager` instance (separate from the app's main gateway connection) so that developer testing does not interfere with production connections. It maintains a Zustand store for event log, connection state, and selected template.

```typescript
// Zustand store shape for playground
interface PlaygroundStore {
  // Connection
  url: string;
  token: string;
  connectionState: ConnectionState;

  // Event log
  events: PlaygroundEvent[];
  addEvent: (event: PlaygroundEvent) => void;
  clearEvents: () => void;

  // Template
  selectedTemplate: string | null;
  jsonPayload: string;
  setJsonPayload: (json: string) => void;
}

interface PlaygroundEvent {
  id: string;
  timestamp: Date;
  direction: "sent" | "received";
  type: "req" | "res" | "event";
  raw: string; // Full JSON
}
```

### Anti-Patterns to Avoid
- **Global settings form:** Do NOT create one giant form for all settings. Each section (Card) is an independent form with its own submit handler and validation schema.
- **Storing API keys in plaintext:** better-auth hashes keys by default. Never disable key hashing. Only the creation response contains the raw key.
- **Reusing the main gateway connection for playground:** The playground must create its own WebSocket connection to avoid interfering with the production gateway client.
- **SSR for Scalar/CodeMirror:** Both access browser APIs at import time. Always use `"use client"` and dynamic imports with `ssr: false` for CodeMirror.
- **Editing org/member data without checking roles:** Always verify user has admin/owner role before showing management actions. better-auth's organization plugin handles auth on the server side.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 2FA/TOTP | Custom TOTP generation, QR codes, secret management | `better-auth twoFactor()` plugin | Handles secret generation, TOTP verification, backup codes, clock drift |
| API key management | Custom key generation, hashing, storage | `better-auth apiKey()` plugin | Handles key generation, SHA-256 hashing, rate limiting, permissions |
| Session management | Custom session listing, IP tracking | `better-auth listSessions() / revokeSession()` | Already tracks IP, user agent, expiry per session |
| Organization/team management | Custom RBAC, invitation system | `better-auth organization()` plugin (already configured) | Already handles roles, invites, member CRUD |
| Interactive API docs | Custom OpenAPI renderer | `@scalar/api-reference-react` | Full-featured: try-it, code samples, search, auth handling |
| QR code generation | Canvas-based QR rendering | `react-qr-code` | SVG-based, zero dependencies, handles UTF-8 |
| JSON editor | Custom textarea with highlighting | `@uiw/react-codemirror` with `@codemirror/lang-json` | Already in project; syntax highlighting, folding, error markers |
| Form validation | Manual validation logic | `react-hook-form` + `zod` + `@hookform/resolvers` | Already used in 28 files; consistent error handling |
| Password change | Custom password update API | `authClient.changePassword()` | Handles current password verification, optional session revocation |
| User profile update | Custom profile API | `authClient.updateUser({ name, image })` | Built into better-auth core |

**Key insight:** better-auth already provides 80% of the settings backend. The twoFactor and apiKey plugins fill the remaining gaps. The main work is building the UI layer.

## Common Pitfalls

### Pitfall 1: Scalar CSS Conflicts with App Theme
**What goes wrong:** Scalar ships its own stylesheet that can conflict with Tailwind/shadcn styles, causing broken layouts or overridden colors.
**Why it happens:** `@scalar/api-reference-react/style.css` includes global styles that may clash with app CSS.
**How to avoid:** Wrap Scalar in a container div with `isolate` CSS or scope via `customCss` config option. Test both light and dark modes. Override Scalar's theme to match OKLCH values.
**Warning signs:** Fonts changing, colors looking off, sidebar styles bleeding between Scalar and app.

### Pitfall 2: better-auth 2FA Database Migration
**What goes wrong:** Adding `twoFactor()` plugin requires new database tables/columns. Forgetting migration breaks auth.
**Why it happens:** The plugin adds a `twoFactor` table and `twoFactorEnabled` column to the user table.
**How to avoid:** Run `npx @better-auth/cli generate` after adding twoFactor plugin, then run Drizzle migration. Same for `apiKey()` plugin which adds an `apiKey` table.
**Warning signs:** Runtime errors about missing columns or tables.

### Pitfall 3: API Key Shown After Creation Only
**What goes wrong:** Developer accidentally shows masked key value and thinks it is the real key.
**Why it happens:** better-auth hashes the key after creation. The raw key is only in the creation response.
**How to avoid:** Capture the full key from the creation response, display it in a modal with copy-to-clipboard, and explicitly warn the user. The list endpoint only returns metadata (name, prefix, last 4 chars, created date).
**Warning signs:** Users reporting "my API key doesn't work" because they copied the masked version.

### Pitfall 4: WebSocket Playground Connection Conflicts
**What goes wrong:** Playground and main app both try to connect to gateway, causing auth conflicts or duplicate events.
**Why it happens:** Both create WebSocket connections to the same gateway endpoint.
**How to avoid:** Playground creates its own independent `WebSocketManager` instance with its own `EventBus`. Do NOT reuse the singleton from `GatewayProvider`. Consider using a different client identifier in the connect handshake.
**Warning signs:** Events appearing in main app when sent from playground, or gateway rejecting connections.

### Pitfall 5: Settings Layout Breaking Main Sidebar
**What goes wrong:** Adding a nested sidebar for settings breaks the main AppSidebar layout.
**Why it happens:** The settings layout tries to render its own sidebar within the `SidebarInset` content area.
**How to avoid:** Settings sidebar is NOT a shadcn `<Sidebar>` component. It is a simple `<nav>` with links rendered inside the content area. The main AppSidebar continues to work as the primary sidebar, and settings navigation is a secondary nav within the page content.
**Warning signs:** Double sidebars, broken mobile layout, sidebar state conflicts.

### Pitfall 6: TOTP QR Code Not Scannable
**What goes wrong:** Generated QR code does not scan or authenticator app shows wrong issuer.
**Why it happens:** The TOTP URI must follow the `otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}` format exactly. Missing or incorrect encoding breaks scanner compatibility.
**How to avoid:** Use the `totpURI` returned by better-auth directly -- it is already properly formatted. Pass it to `react-qr-code` as the `value` prop without modification. Set the `issuer` in the `twoFactor()` plugin config to match the app name.
**Warning signs:** QR code scans but authenticator shows "Unknown" as issuer, or codes don't match.

### Pitfall 7: Danger Zone Actions Not Properly Gated
**What goes wrong:** Delete workspace or reset data executes without proper confirmation, causing data loss.
**Why it happens:** Confirmation dialog is dismissed too easily, or the type-to-confirm doesn't enforce exact match.
**How to avoid:** Use strict string comparison (no trim, no case-insensitive). Disable the button entirely until exact match. Add a loading state and prevent double-clicks. Server-side should also verify the user has owner role.
**Warning signs:** Users accidentally deleting workspaces.

## Code Examples

### better-auth twoFactor Plugin Setup

```typescript
// src/features/auth/lib/auth.ts -- additions
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  // ...existing config
  plugins: [
    nextCookies(),
    organization({ /* ...existing config */ }),
    twoFactor({
      issuer: "AXion Hub",
      // TOTP only -- no OTP config needed
    }),
  ],
});
```

```typescript
// src/features/auth/lib/auth-client.ts -- additions
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    twoFactorClient(),
  ],
});
```

### better-auth apiKey Plugin Setup

```typescript
// src/features/auth/lib/auth.ts -- additions
import { apiKey } from "better-auth/plugins";

export const auth = betterAuth({
  // ...existing config
  plugins: [
    nextCookies(),
    organization({ /* ...existing config */ }),
    twoFactor({ issuer: "AXion Hub" }),
    apiKey({
      defaultPrefix: "axion_",
      startingCharactersConfig: {
        shouldStore: true,
        charactersLength: 4,
      },
      keyExpiration: {
        defaultExpiresIn: null, // No default expiry
        disableCustomExpiresTime: false,
      },
    }),
  ],
});
```

```typescript
// src/features/auth/lib/auth-client.ts -- additions
import { apiKeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    twoFactorClient(),
    apiKeyClient(),
  ],
});
```

### TOTP QR Code Display

```typescript
// src/features/settings/components/totp-setup-card.tsx
"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { authClient } from "@/features/auth/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

export function TotpSetupCard() {
  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  async function handleEnable(password: string) {
    const { data, error } = await authClient.twoFactor.enable({
      password,
      issuer: "AXion Hub",
    });
    if (error) { toast.error("Failed to enable 2FA"); return; }
    setTotpURI(data.totpURI);
    setBackupCodes(data.backupCodes);
    setStep("verify");
  }

  // Verify step: user enters code from authenticator
  async function handleVerify(code: string) {
    const { data, error } = await authClient.twoFactor.verifyTOTP({
      code,
    });
    if (error) { toast.error("Invalid code"); return; }
    toast.success("2FA enabled successfully");
    setStep("idle");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        {totpURI && (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCode value={totpURI} size={200} />
          </div>
        )}
        {/* Backup codes, verify input, etc. */}
      </CardContent>
    </Card>
  );
}
```

### Session Management

```typescript
// List and revoke sessions
const sessions = await authClient.listSessions();
// Returns: Array<{ id, token, expiresAt, ipAddress, userAgent, createdAt }>

// Revoke a specific session
await authClient.revokeSession({ token: "session-token" });

// Revoke all other sessions (keep current)
await authClient.revokeOtherSessions();
```

### API Key CRUD

```typescript
// Create key (raw key only in this response)
const { data } = await authClient.apiKey.create({
  name: "My Integration Key",
  prefix: "axion_",
  expiresIn: 60 * 60 * 24 * 90, // 90 days
});
// data.key = "axion_abc123...full_key_here" -- show once, then mask

// List keys (returns metadata only, no raw key)
const { data: keys } = await authClient.apiKey.list();

// Delete key
await authClient.apiKey.delete({ keyId: "key-id" });
```

### Organization Management

```typescript
// Update org (already available via better-auth)
await authClient.organization.update({
  data: { name: "New Name", logo: "url" },
  organizationId: "org-id",
});

// List members
const { data: members } = await authClient.organization.getFullOrganization();

// Invite
await authClient.organization.inviteMember({
  email: "user@example.com",
  role: "member",
});

// Remove member
await authClient.organization.removeMember({
  memberIdOrEmail: "user@example.com",
});

// Update role
await authClient.organization.updateMemberRole({
  memberId: "member-id",
  role: "admin",
});

// Delete org (SETT-10 danger zone)
await authClient.organization.delete({
  organizationId: "org-id",
});
```

### WebSocket Playground Event Templates

```typescript
// src/features/developer-tools/model/event-templates.ts
import type { KnownGatewayMethod } from "@/entities/gateway-event";

export interface EventTemplate {
  label: string;
  description: string;
  method: string;
  params: Record<string, unknown>;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    label: "Health Check",
    description: "Check gateway health status",
    method: "health",
    params: {},
  },
  {
    label: "List Agents",
    description: "List all connected agents",
    method: "agent.list",
    params: {},
  },
  {
    label: "Get Agent",
    description: "Get details for a specific agent",
    method: "agent.get",
    params: { agentId: "<agent-id>" },
  },
  {
    label: "Send Message to Agent",
    description: "Send a chat message to an agent",
    method: "agent.send",
    params: {
      agentId: "<agent-id>",
      message: "Hello from playground",
      sessionId: "<session-id>",
    },
  },
  {
    label: "Get Config",
    description: "Retrieve gateway configuration",
    method: "config.get",
    params: {},
  },
  {
    label: "List Sessions",
    description: "List active agent sessions",
    method: "sessions.list",
    params: {},
  },
];
```

### Playground Session Export

```typescript
// Export format: JSON array of all events in session
function exportSessionLog(events: PlaygroundEvent[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    gatewayUrl: url,
    eventCount: events.length,
    events: events.map(e => ({
      timestamp: e.timestamp.toISOString(),
      direction: e.direction,
      type: e.type,
      payload: JSON.parse(e.raw),
    })),
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ws-playground-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Docs Sidebar with Markdown Pages

```typescript
// Docs content can be static markdown files loaded at build time
// or dynamic content from a docs directory.
// Since docs live inside authenticated app, use app routes:

// app/(dashboard)/docs/layout.tsx
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <DocsSidebar />
      <article className="flex-1 min-w-0 prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </article>
    </div>
  );
}
```

### OpenAPI Spec Route

```typescript
// app/api/openapi.json/route.ts
import { NextResponse } from "next/server";

// The OpenAPI spec can be a static JSON file or dynamically generated.
// For now, serve a static spec file.
export async function GET() {
  const spec = await import("@/shared/config/openapi-spec.json");
  return NextResponse.json(spec.default);
}
```

## Settings Sidebar Category Ordering (Claude's Discretion)

**Recommendation:** Group settings by user proximity -- personal first, team second, system third.

| Category | Route | Rationale |
|----------|-------|-----------|
| General | /settings | Most common: app name, timezone, theme, language |
| Profile | /settings/profile | Personal: display name, avatar |
| Security | /settings/security | Personal: password, 2FA, active sessions |
| Team | /settings/team | Organization: members, roles |
| API Keys | /settings/api | Developer: external integration keys |
| Notifications | /settings/notifications | Personal: email, webhook, Slack/Discord prefs |
| Integrations | /settings/integrations | Organization: GitHub, Linear, Jira connections |
| Backup & Export | /settings/backup | Admin: data export and backup |
| Danger Zone | /settings/danger | Admin (bottom): destructive actions, visually separated |

The "Team" item expands to show "Invites" as a sub-route (`/settings/team/invites`).

## Docs Content Structure (Claude's Discretion)

**Recommendation:** Use a tree structure with these top-level categories:

```
Getting Started
  - Quick Start
  - Architecture Overview
  - Configuration Reference
Agents
  - Creating Agents
  - Agent Configuration
  - Skills & Tools
Missions
  - Mission Boards
  - Task Management
  - Automation Rules
Gateway
  - Connection Setup
  - Event Reference
  - Troubleshooting
API Reference
  - REST API (links to /api-docs)
  - WebSocket Protocol (links to /api-docs/ws)
  - Authentication
Administration
  - User Management
  - Security Settings
  - Backup & Recovery
```

Docs content stored as MDX/markdown files in a `content/docs/` directory, loaded statically. The `@uiw/react-md-editor` (already installed) can render markdown in view mode, or use Next.js built-in MDX support.

## Scalar Integration Configuration (Claude's Discretion)

**Recommendation:**

```typescript
configuration={{
  url: "/api/openapi.json",
  darkMode: resolvedTheme === "dark",
  theme: "none",  // Use 'none' to prevent Scalar's built-in themes, apply custom CSS
  layout: "modern",
  showSidebar: true,
  searchHotKey: "",  // Disable Scalar's search hotkey to avoid conflict with app's Cmd+K
  hiddenClients: [],  // Show all language clients
  customCss: `
    .scalar-app {
      --scalar-font: var(--font-outfit), sans-serif;
      --scalar-font-code: var(--font-jetbrains-mono), monospace;
    }
  `,
}}
```

## Backup Export Format (Claude's Discretion)

**Recommendation:** JSON export with optional ZIP for large datasets.

- **Config export:** Single JSON file with settings, preferences, theme config
- **Sessions export:** JSON array of session data with metadata
- **Full workspace export:** ZIP file containing:
  - `config.json` -- workspace settings
  - `agents/` -- agent configurations
  - `sessions/` -- session transcripts
  - `workspace/` -- workspace files
  - `manifest.json` -- export metadata (version, date, user)

## Integration Connection UI Patterns (Claude's Discretion)

**Recommendation:** Card-based grid with connection status indicators.

Each integration shows as a Card with:
- Service icon + name (GitHub, Linear, Jira)
- Connection status badge (Connected / Not connected)
- Connect/Disconnect button
- Last synced timestamp (when connected)

Connection flow:
1. Click "Connect" opens OAuth popup/redirect
2. After auth, callback stores token securely
3. Card updates to show "Connected" status
4. "Disconnect" button revokes token and clears connection

For Phase 10, connections are UI scaffolding -- actual OAuth flows can be implemented as the integration matures. The UI should show the connection state and provide connect/disconnect buttons.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Swagger UI for API docs | Scalar API Reference | 2024-2025 | Better UX, modern design, built-in auth, React component |
| Custom TOTP libraries (otplib) | better-auth twoFactor plugin | 2024 | Integrated with auth system, handles backup codes |
| Custom API key management | better-auth apiKey plugin | 2024 | Hashing, rate limiting, permissions built in |
| Per-page form state | react-hook-form with section isolation | Stable pattern | Prevents cross-contamination between settings sections |

**Deprecated/outdated:**
- Swagger UI: While still functional, Scalar provides a superior developer experience with modern UI, built-in Try It, and better React integration
- Redoc: Read-only docs viewer; Scalar provides interactive capabilities

## Open Questions

1. **OpenAPI Spec Generation**
   - What we know: Scalar needs an OpenAPI JSON/YAML spec to render
   - What's unclear: Whether to hand-write the spec or auto-generate from Next.js API routes
   - Recommendation: Start with a hand-written OpenAPI 3.1 spec in `src/shared/config/openapi-spec.json`. Auto-generation can be added later. The spec documents the REST API endpoints (auth, agents, sessions, etc.) that already exist or will exist.

2. **Notification Preferences Storage**
   - What we know: SETT-07 needs to store per-user notification prefs (email, webhook, Slack/Discord)
   - What's unclear: Whether to use a dedicated `notification_preferences` table or store in user metadata
   - Recommendation: Create a `notification_preferences` Drizzle table with userId FK, since preferences are structured (channel type, enabled, webhook URL, etc.) and benefit from typed schema.

3. **Integration OAuth Tokens**
   - What we know: SETT-08 shows connection cards for GitHub, Linear, Jira
   - What's unclear: Full OAuth implementation scope for each service
   - Recommendation: For Phase 10, build the UI and data model (connection status, token storage). Actual OAuth flows are complex and service-specific -- implement the connection flow for one service (e.g., GitHub) as proof of concept, with others as "Coming Soon" placeholders.

4. **Docs Content Authoring**
   - What we know: Docs live inside authenticated app, use sidebar + markdown
   - What's unclear: Who writes the content and how it's updated
   - Recommendation: Store docs as static MDX files in the repo. Build the viewer and sidebar. Content can be populated incrementally. The doc viewer infrastructure is the Phase 10 deliverable; content is ongoing.

## Sources

### Primary (HIGH confidence)
- `/websites/better-auth` Context7 -- 2FA plugin setup, API key plugin, session management, organization APIs, user management
- `/scalar/scalar` Context7 -- React component integration, configuration options, theming, layout
- Codebase analysis -- Existing auth config (`src/features/auth/lib/auth.ts`), gateway-connection (`src/features/gateway-connection/`), CodeMirror patterns (`src/features/workspace/components/code-editor.tsx`)

### Secondary (MEDIUM confidence)
- [better-auth 2FA docs](https://www.better-auth.com/docs/plugins/2fa) -- TOTP plugin setup, QR code flow, backup codes
- [better-auth Session Management](https://www.better-auth.com/docs/concepts/session-management) -- listSessions, revokeSession APIs
- [Scalar Next.js integration](https://github.com/scalar/scalar/blob/main/documentation/integrations/nextjs.md) -- React component vs route handler approaches
- [@scalar/api-reference-react npm](https://www.npmjs.com/package/@scalar/api-reference-react) -- Version 0.8.57, React component for embedding
- [react-qr-code npm](https://www.npmjs.com/package/react-qr-code) -- Version 2.0.18, SVG QR code generation

### Tertiary (LOW confidence)
- None -- all findings verified through Context7 or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All core libraries already in project; new deps (Scalar, react-qr-code) verified via Context7 and npm
- Architecture: HIGH -- FSD patterns well-established from 9 prior phases; settings sidebar is a standard UI pattern; gateway-connection provides proven WebSocket infrastructure
- Pitfalls: HIGH -- Verified through Context7 docs (better-auth plugin requirements) and codebase analysis (CodeMirror SSR issues already solved)

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- stable domain, no fast-moving dependencies)
