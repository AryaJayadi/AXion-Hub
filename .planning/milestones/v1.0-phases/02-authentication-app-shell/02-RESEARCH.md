# Phase 2: Authentication & App Shell - Research

**Researched:** 2026-02-17
**Domain:** Authentication (better-auth), OAuth, session management, organization/invitation flows, app shell layout (sidebar, breadcrumbs, route protection)
**Confidence:** HIGH (better-auth docs verified via official website, Next.js 16 proxy.ts verified via official docs, shadcn/ui sidebar verified via registry)

## Summary

Phase 2 adds user authentication and the authenticated application shell. The core technology is **better-auth v1.4.x**, which provides email/password login, OAuth (Google, GitHub), email verification, password reset, session management with cookie caching, and a full organization plugin with multi-org support and invitations. better-auth has first-class Next.js integration via `toNextJsHandler` for API routes, `nextCookies` plugin for server-side cookie management, and `auth.api.getSession()` for server component session access.

Route protection uses a two-layer strategy: (1) `proxy.ts` (Next.js 16's replacement for middleware.ts) checks for session cookie existence and redirects unauthenticated users to `/login` -- this is fast but optimistic, (2) individual layouts/pages call `auth.api.getSession()` for full server-side session validation. This follows the official better-auth and Next.js 16 recommendations.

The app shell uses shadcn/ui's `Sidebar` component (with `SidebarProvider`, `SidebarInset`, `SidebarRail`, `SidebarTrigger`) for the collapsible sidebar, `Breadcrumb` for breadcrumbs, and `DropdownMenu` + `Avatar` for the user menu. The split-screen auth pages use shadcn/ui's `login-02` block pattern (two-column grid with branding/image on one side, form on the other). Form validation uses react-hook-form + zod with shadcn/ui form components.

**Primary recommendation:** Implement better-auth server configuration first (with Drizzle adapter, organization plugin, email verification, OAuth providers), then build the auth pages (login, register, forgot-password, invite acceptance), then the app shell (sidebar, header, route protection), and finally wire up the organization switcher.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Separate pages for login (/login) and register (/register) -- not tabbed
- Split-screen layout: left side branding/illustration, right side auth form
- Social login (Google, GitHub) buttons placed below the email/password form
- After login, redirect to last visited page (not a fixed destination)
- Collapsible sidebar: full labels collapse to icon-only rail, user toggles
- Header bar shows breadcrumbs (left), global search (center-right), user avatar/menu (right)
- Sidebar navigation grouped with section headers (e.g., "Core", "Operations", "Settings") with visual dividers
- Mobile: responsive sidebar -- auto-hides on mobile, hamburger button toggles it as overlay
- Registration fields: name, email, password
- Email verification required before app access (blocking)
- Required checkbox on register page: "I agree to Terms of Service and Privacy Policy" with links
- No onboarding wizard -- each page uses contextual empty states to guide first actions
- Multi-org support: users can belong to multiple organizations
- Invitation flow: invite link leads to auth (register or login), then auto-joins the org -- no separate confirmation step
- Org switcher in the UI for switching between organizations

### Claude's Discretion
- Org creation strategy (auto-create personal org vs prompt after registration)
- Org switcher placement (top of sidebar vs user menu)
- Split-screen branding/illustration design for auth pages
- Password strength requirements and validation UX
- Error message styling and placement on auth forms
- Loading states during auth operations

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email/password at `/login` | better-auth `emailAndPassword.enabled: true`, client `signIn.email()`, server `auth.api.signInEmail()`. Session cookie auto-set via `nextCookies` plugin. Redirect to last visited page via `callbackURL` parameter. |
| AUTH-02 | User can log in via OAuth providers (Google, GitHub) at `/login` | better-auth `socialProviders.google` and `socialProviders.github` configuration. Client `signIn.social({ provider: "google" })`. Callback URL: `/api/auth/callback/google` and `/api/auth/callback/github`. |
| AUTH-03 | User can create an account at `/register` | better-auth `signUp.email()` with name, email, password. Email verification via `sendVerificationEmail` callback with `requireEmailVerification: true`. |
| AUTH-04 | User can reset password via email link at `/forgot-password` | better-auth `requestPasswordReset()` sends email via `sendResetPassword` callback. User clicks link to `/reset-password?token=...`, calls `resetPassword({ newPassword, token })`. |
| AUTH-05 | User can accept an organization invitation via `/invite/[token]` | better-auth organization plugin `acceptInvitation({ invitationId })`. Invitation flow: get invitation details via `getInvitation({ id })`, redirect to login/register if unauthenticated, auto-accept after auth. |
| AUTH-06 | User session persists across browser refresh with secure cookie/token management | better-auth cookie-based sessions with `expiresIn: 7 days`, `updateAge: 1 day`. Cookie caching for reduced DB queries. Redis secondary storage for session performance. `useSession()` hook for client-side reactive session state. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.4.18 | Authentication framework | Purpose-built for self-hosted apps. Email/password, OAuth, email verification, password reset, organization/team support, session management. First-class Next.js + Drizzle integration. |
| better-auth/plugins (organization) | ^1.4.18 | Multi-org support | Built-in organization plugin: create orgs, invite members, roles/permissions, active org on session. No custom org management needed. |
| react-hook-form | ^7.71.1 | Form management | Uncontrolled inputs for performance. Used for login, register, forgot-password, reset-password forms. |
| zod | ^4.3.6 | Schema validation | Shared validation schemas for auth forms (email format, password strength, name required). Used with `@hookform/resolvers/zod`. |
| @hookform/resolvers | ^5.x | Form resolver | Connects zod schemas to react-hook-form. One-line integration via `zodResolver`. |
| nodemailer | ^6.x | Email sending | SMTP-based email sending for verification and password reset. Self-hosted friendly (no vendor dependency). |

### shadcn/ui Components Required

| Component | Purpose | Notes |
|-----------|---------|-------|
| sidebar | App shell sidebar | Collapsible with rail mode. `SidebarProvider`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuButton`, `SidebarRail`, `SidebarTrigger`, `SidebarInset` |
| breadcrumb | Header breadcrumbs | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| dropdown-menu | User menu, org switcher | For avatar dropdown and org selection |
| avatar | User avatar in header | Displays user profile image or initials |
| button | Auth forms, navigation | Primary actions, social login buttons |
| input | Auth form fields | Email, password, name inputs |
| card | Auth page form container | Wraps login/register forms |
| separator | Visual dividers | Between sidebar groups, in auth forms |
| checkbox | Terms agreement | Required ToS checkbox on register |
| field | Form field wrapper | `Field`, `FieldLabel`, `FieldDescription`, `FieldGroup`, `FieldSeparator` (shadcn v4 form pattern) |
| form | React Hook Form integration | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` |
| tooltip | Icon-only sidebar labels | Shows label tooltip when sidebar is collapsed to rail |
| sheet | Mobile sidebar overlay | Slide-out panel for mobile nav |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nodemailer | ^6.x | SMTP email | Sending verification and password reset emails. Self-hosted, works with any SMTP provider. |
| @react-email/components | ^0.x | Email templates | Building HTML email templates for verification and reset emails. React-based, renders to HTML. Optional but recommended. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nodemailer | Resend / SendGrid | Cloud services are easier to set up but add vendor dependency. Nodemailer works with any SMTP server, fitting the self-hosted constraint. Use `SMTP_*` env vars so users can plug in any provider. |
| react-hook-form for auth forms | Server Actions only | Server Actions could handle auth form submission directly, but react-hook-form provides client-side validation UX (instant feedback, field-level errors) that Server Actions alone cannot. |
| Custom org management | better-auth organization plugin | Plugin provides everything: create, invite, accept, roles, active org. Building custom would duplicate tested functionality. |

**Installation:**
```bash
# Auth
bun add better-auth@^1.4.18

# Form handling
bun add react-hook-form@^7.71.1 @hookform/resolvers

# Email
bun add nodemailer
bun add -D @types/nodemailer

# Optional: email templates
bun add @react-email/components
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
app/
├── (auth)/                          # Route group: unauthenticated pages
│   ├── layout.tsx                   # Auth layout (split-screen shell)
│   ├── login/page.tsx               # Login page (AUTH-01, AUTH-02)
│   ├── register/page.tsx            # Register page (AUTH-03)
│   ├── forgot-password/page.tsx     # Forgot password (AUTH-04)
│   ├── reset-password/page.tsx      # Reset password (AUTH-04 completion)
│   ├── verify-email/page.tsx        # Email verification landing
│   └── invite/[token]/page.tsx      # Invitation acceptance (AUTH-05)
├── (dashboard)/                     # Route group: authenticated pages
│   ├── layout.tsx                   # App shell (sidebar + header)
│   └── page.tsx                     # Dashboard placeholder
├── api/
│   └── auth/[...all]/route.ts       # better-auth API handler
├── layout.tsx                       # Root layout
└── proxy.ts                         # Route protection (cookie check)

src/
├── features/
│   └── auth/                        # Auth feature module
│       ├── lib/
│       │   ├── auth.ts              # better-auth server config
│       │   ├── auth-client.ts       # better-auth client instance
│       │   └── email.ts             # Email sending utility
│       ├── components/
│       │   ├── login-form.tsx       # Login form component
│       │   ├── register-form.tsx    # Register form component
│       │   ├── forgot-password-form.tsx
│       │   ├── reset-password-form.tsx
│       │   ├── social-login-buttons.tsx  # Google + GitHub OAuth buttons
│       │   └── auth-layout.tsx      # Split-screen layout wrapper
│       ├── hooks/
│       │   └── use-auth.ts          # Auth convenience hooks
│       └── schemas/
│           └── auth-schemas.ts      # Zod validation schemas
│
├── widgets/
│   └── app-shell/                   # App shell widget
│       ├── components/
│       │   ├── app-sidebar.tsx      # Sidebar with nav groups
│       │   ├── sidebar-nav.tsx      # Navigation items
│       │   ├── header-bar.tsx       # Header with breadcrumbs + search + user menu
│       │   ├── user-menu.tsx        # Avatar + dropdown menu
│       │   ├── org-switcher.tsx     # Organization switcher
│       │   └── mobile-nav.tsx       # Mobile hamburger + sheet overlay
│       └── config/
│           └── navigation.ts        # Sidebar navigation configuration
│
├── entities/
│   └── user/
│       └── model/
│           └── auth-schema.ts       # Drizzle schema generated by better-auth CLI

└── shared/
    └── lib/
        └── auth-client.ts           # Re-export of auth client for shared use
```

### Pattern 1: better-auth Server Configuration

**What:** Central auth configuration that ties together email/password, OAuth, organizations, email verification, Drizzle adapter, and session management.

**When to use:** Once, at app initialization.

```typescript
// src/features/auth/lib/auth.ts
// Source: https://www.better-auth.com/docs/basic-usage

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { db } from "@/shared/lib/db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${url}">Click here to reset your password</a>`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Click here to verify your email</a>`,
      });
    },
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,       // Refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,              // 5 minutes
    },
  },

  plugins: [
    nextCookies(),
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      sendInvitationEmail: async (data) => {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/invite/${data.id}`;
        void sendEmail({
          to: data.email,
          subject: `You've been invited to ${data.organization.name}`,
          html: `<a href="${inviteLink}">Accept invitation</a>`,
        });
      },
    }),
  ],

  // Auto-create personal org after registration
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await auth.api.createOrganization({
            body: {
              name: `${user.name}'s Workspace`,
              slug: `personal-${user.id}`,
            },
            headers: new Headers(),
          });
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Set active org on session creation if not set
          // Implementation: find user's first org and set as active
          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Pattern 2: better-auth Client Instance

**What:** Client-side auth API for sign in, sign up, sign out, session management, and organization operations.

```typescript
// src/features/auth/lib/auth-client.ts
// Source: https://www.better-auth.com/docs/basic-usage

"use client";

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

// Export convenience methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
  useListOrganizations,
  organization,
} = authClient;
```

### Pattern 3: Next.js 16 API Route Handler

**What:** Mount better-auth handler to catch-all API route.

```typescript
// app/api/auth/[...all]/route.ts
// Source: https://www.better-auth.com/docs/integrations/next

import { auth } from "@/features/auth/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Pattern 4: Route Protection with proxy.ts

**What:** Two-layer auth protection: fast cookie check in proxy.ts + full validation in layouts.

```typescript
// proxy.ts
// Source: https://www.better-auth.com/docs/integrations/next
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth pages: redirect to dashboard if already logged in
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.some((p) => pathname.startsWith(p));

  const sessionCookie = getSessionCookie(request);

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected pages: redirect to login if no session cookie
  const publicPaths = [
    "/login", "/register", "/forgot-password", "/reset-password",
    "/verify-email", "/invite", "/api/auth",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isPublic && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

### Pattern 5: Server-Side Session Validation in Layout

**What:** Full session validation in the dashboard layout for security.

```typescript
// app/(dashboard)/layout.tsx
// Source: https://www.better-auth.com/docs/integrations/next

import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/widgets/app-shell/components/app-sidebar";
import { HeaderBar } from "@/widgets/app-shell/components/header-bar";
import { SidebarProvider, SidebarInset } from "@/shared/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <HeaderBar user={session.user} />
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Pattern 6: Auth Form with react-hook-form + zod

**What:** Client-side form validation with zod schemas, integrated with better-auth client methods.

```typescript
// src/features/auth/schemas/auth-schemas.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms of Service" }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
```

### Pattern 7: Login Form Component

**What:** Login form with email/password + social login buttons + forgot password link.

```typescript
// src/features/auth/components/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { loginSchema, type LoginFormValues } from "../schemas/auth-schemas";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Field, FieldLabel, FieldGroup, FieldSeparator, FieldDescription } from "@/shared/ui/field";
import { SocialLoginButtons } from "./social-login-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: callbackUrl,
    });

    if (authError) {
      if (authError.status === 403) {
        setError("Please verify your email address before signing in.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* ... form fields, social login, forgot password link */}
      </FieldGroup>
    </form>
  );
}
```

### Pattern 8: Invitation Acceptance Flow

**What:** Accept organization invitation from email link. Handles both authenticated and unauthenticated users.

```typescript
// app/(auth)/invite/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/features/auth/lib/auth-client";

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "accepting" | "error">("loading");

  useEffect(() => {
    async function handleInvite() {
      // Check if user is authenticated
      const { data: session } = await authClient.getSession();

      if (!session) {
        // Redirect to login/register with invite token preserved
        router.push(`/login?callbackUrl=/invite/${params.token}`);
        return;
      }

      // User is authenticated -- accept the invitation
      setStatus("accepting");
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId: params.token,
      });

      if (error) {
        setStatus("error");
        return;
      }

      // Set the new org as active and redirect
      await authClient.organization.setActive({
        organizationId: data.member.organizationId,
      });
      router.push("/");
    }

    handleInvite();
  }, [params.token, router]);

  // Render loading/accepting/error states
}
```

### Pattern 9: App Sidebar with Navigation Groups

**What:** Collapsible sidebar with grouped navigation, org switcher, and user info.

```typescript
// src/widgets/app-shell/components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";
import { navigationConfig } from "../config/navigation";

export function AppSidebar({ user }: { user: { name: string; image?: string } }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {navigationConfig.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

### Pattern 10: Sidebar Navigation Configuration

**What:** Data-driven navigation structure with grouped sections.

```typescript
// src/widgets/app-shell/config/navigation.ts

import {
  LayoutDashboard, Bot, MessageSquare, Kanban,
  Radio, Plug, Settings, Shield, Activity,
  FolderOpen, Workflow, Globe,
} from "lucide-react";

export const navigationConfig = [
  {
    label: "Core",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Agents", url: "/agents", icon: Bot },
      { title: "Chat", url: "/chat", icon: MessageSquare },
      { title: "Missions", url: "/missions", icon: Kanban },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Gateway", url: "/gateway", icon: Radio },
      { title: "Channels", url: "/channels", icon: Globe },
      { title: "Activity", url: "/activity", icon: Activity },
      { title: "Files", url: "/workspace", icon: FolderOpen },
    ],
  },
  {
    label: "Automation",
    items: [
      { title: "Workflows", url: "/workflows", icon: Workflow },
      { title: "Skills", url: "/skills", icon: Plug },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Approvals", url: "/approvals", icon: Shield },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];
```

### Anti-Patterns to Avoid

- **Full session validation in proxy.ts:** Proxy.ts (formerly middleware.ts) should ONLY check for cookie existence, not make database or API calls. Full validation belongs in layouts/pages. This is per both Next.js 16 and better-auth official guidance. proxy.ts runs on every request -- keep it fast.
- **Storing auth state in Zustand:** better-auth provides `useSession()` which is reactive and handles caching. Do not duplicate session state in a Zustand store. Use `useSession()` directly in components.
- **Custom session management alongside better-auth:** Do not build custom JWT/cookie handling. better-auth manages the full session lifecycle including creation, refresh, revocation, and cookie caching. Trust the library.
- **Awaiting email sends in auth handlers:** Both `sendVerificationEmail` and `sendResetPassword` should fire-and-forget (use `void sendEmail(...)`) to prevent timing attacks. On serverless, use `waitUntil`.
- **Building custom organization CRUD:** The organization plugin provides `create`, `list`, `update`, `delete`, `invite`, `accept`, `reject`, `leave`, `setActive`. Use these APIs, not custom Drizzle queries against org tables.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email/password auth | Custom bcrypt + session cookies | better-auth `emailAndPassword` | Handles password hashing (scrypt), session tokens, cookie management, CSRF protection, rate limiting. Hundreds of security edge cases. |
| OAuth flow | Custom OAuth redirect + callback | better-auth `socialProviders` | Manages OAuth state, PKCE, token exchange, account linking, callback verification. Easy to get wrong. |
| Session management | Custom JWT tokens | better-auth sessions | Cookie-based with auto-refresh, cookie caching, secondary storage (Redis), revocation, multi-device support. |
| Email verification | Custom tokens in DB | better-auth `emailVerification` | Generates secure tokens, manages verification state, blocks unverified login, auto-sign-in after verify. |
| Password reset | Custom reset token flow | better-auth `sendResetPassword` + `resetPassword` | Handles token generation, expiry (1 hour default), one-time use, password hash update. |
| Organization management | Custom org/member tables | better-auth `organization` plugin | Provides tables, APIs, roles, permissions, invitations, active org tracking. Full RBAC. |
| Route protection | Custom auth checking per page | proxy.ts + layout validation | Two-layer approach is the established pattern for Next.js + better-auth. |
| Form validation | Manual `if/else` checks | react-hook-form + zod | Type-safe schemas, instant field-level feedback, composable validators, shared between client/server. |

**Key insight:** better-auth is specifically designed for the self-hosted use case with Drizzle + Next.js. It provides more built-in functionality than most teams realize -- organization management, email verification, password reset, session caching, and secondary storage are all plugin-level features, not custom code.

## Common Pitfalls

### Pitfall 1: Forgetting to Set baseURL
**What goes wrong:** OAuth callbacks fail with `redirect_uri_mismatch`. Password reset and verification links point to wrong domain.
**Why it happens:** better-auth tries to infer the base URL from the request, but this is unreliable behind Docker/reverse proxies.
**How to avoid:** Always set `BETTER_AUTH_URL` in environment variables AND `baseURL` in auth config. For Docker: `BETTER_AUTH_URL=http://localhost:3000`. For production: your actual domain.
**Warning signs:** OAuth login redirects to wrong URL. Email links broken.

### Pitfall 2: Email Verification Blocks Login but No Email Sent
**What goes wrong:** User registers, `requireEmailVerification: true` blocks login, but no verification email arrives. User is stuck.
**Why it happens:** `sendOnSignUp: true` not set in `emailVerification` config, or `sendVerificationEmail` function throws silently.
**How to avoid:** Set `sendOnSignUp: true`. Log email sending errors. Test email flow early with a real SMTP server (or use `console.log` during development to see the verification URL).
**Warning signs:** No email in inbox/spam after registration. No errors in server logs.

### Pitfall 3: proxy.ts Making Database Calls
**What goes wrong:** Every request (including static assets, prefetches) triggers a database query. Performance tanks. Under load, auth check becomes a bottleneck.
**Why it happens:** Developer puts `auth.api.getSession()` in proxy.ts thinking it's the auth layer.
**How to avoid:** proxy.ts should only use `getSessionCookie(request)` from `better-auth/cookies` -- a zero-cost cookie existence check. Full validation goes in the dashboard layout's server component.
**Warning signs:** Slow page loads, high database CPU, every navigation triggers session query.

### Pitfall 4: Organization Not Set After Login
**What goes wrong:** User logs in, lands in dashboard, but `useActiveOrganization()` returns null. Org-scoped features fail.
**Why it happens:** No active organization is set on the session after login. The organization plugin requires explicit `setActive` call.
**How to avoid:** Use `databaseHooks.session.create.before` to set `activeOrganizationId` on session creation. Or call `organization.setActive()` on the client after login.
**Warning signs:** Org switcher shows nothing. API calls that need org context fail.

### Pitfall 5: OAuth Callback URL Mismatch
**What goes wrong:** Google/GitHub OAuth fails with "redirect_uri_mismatch" error.
**Why it happens:** The callback URL in the OAuth provider console doesn't match what better-auth sends. Default callback pattern is `/api/auth/callback/{provider}`.
**How to avoid:** Set callback URL in Google Cloud Console: `http://localhost:3000/api/auth/callback/google`. For GitHub: `http://localhost:3000/api/auth/callback/github`. Update for production domain.
**Warning signs:** OAuth redirects to error page. Console shows redirect_uri_mismatch.

### Pitfall 6: Drizzle Schema Out of Sync with better-auth
**What goes wrong:** better-auth throws errors about missing columns or tables.
**Why it happens:** The Drizzle schema was generated once but plugins were added later (e.g., organization plugin adds org, member, invitation tables).
**How to avoid:** After changing better-auth plugins, regenerate schema: `bunx @better-auth/cli generate`. Then generate migration: `bunx drizzle-kit generate`. Then apply: `bunx drizzle-kit migrate`.
**Warning signs:** Database errors about missing tables/columns. TypeScript errors in auth-related Drizzle queries.

### Pitfall 7: Invitation Link Not Working for New Users
**What goes wrong:** New user clicks invite link, registers, but doesn't auto-join the org.
**Why it happens:** After registration + email verification, the user is redirected away from the invite flow. The invitation token is lost.
**How to avoid:** Preserve the invite token in the URL through the entire auth flow. Login/register pages must pass `callbackUrl=/invite/{token}` so the user returns to the invite acceptance page after authenticating.
**Warning signs:** User registers via invite link but has no org membership. Must be manually added.

## Code Examples

### better-auth Drizzle Schema Generation

```bash
# Generate schema from auth config (includes all plugin tables)
# Source: https://www.better-auth.com/docs/adapters/drizzle
bunx @better-auth/cli@latest generate

# This creates auth-schema.ts with tables:
# - user (id, name, email, emailVerified, image, createdAt, updatedAt)
# - session (id, token, userId, expiresAt, ipAddress, userAgent, activeOrganizationId)
# - account (id, userId, accountId, providerId, accessToken, refreshToken, ...)
# - verification (id, identifier, value, expiresAt, createdAt, updatedAt)
# - organization (id, name, slug, logo, metadata, createdAt)
# - member (id, userId, organizationId, role, createdAt)
# - invitation (id, email, inviterId, organizationId, role, status, expiresAt)

# Then generate Drizzle migration
bunx drizzle-kit generate

# Apply migration
bunx drizzle-kit migrate
```

### Email Sending Utility (Nodemailer)

```typescript
// src/features/auth/lib/email.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AXion Hub <noreply@axionhub.local>",
      ...options,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw -- email failure should not block auth flow
  }
}
```

### Secondary Storage with Redis

```typescript
// In auth.ts configuration
// Source: https://www.better-auth.com/docs/guides/optimizing-for-performance

import { redis } from "@/shared/lib/redis";

export const auth = betterAuth({
  // ... other config
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, "EX", ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
```

### Split-Screen Auth Layout

```typescript
// src/features/auth/components/auth-layout.tsx
// Based on: shadcn/ui login-02 block pattern

import { GalleryVerticalEnd } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: string;
  description: string;
}

export function AuthLayout({ children, heading, description }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: Form side */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            AXion Hub
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-2 text-center mb-6">
              <h1 className="text-2xl font-bold">{heading}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Right: Branding/illustration side */}
      <div className="bg-muted relative hidden lg:block">
        {/* Dark sleek illustration or gradient matching OKLCH theme */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* SVG illustration or branded content */}
        </div>
      </div>
    </div>
  );
}
```

### Client-Side Session Hook Usage

```typescript
// Source: https://www.better-auth.com/docs/basic-usage

"use client";

import { authClient } from "@/features/auth/lib/auth-client";

export function UserDisplay() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Skeleton className="h-8 w-32" />;
  if (!session) return null;

  return <span>{session.user.name}</span>;
}
```

### Redirect to Last Visited Page After Login

```typescript
// In login form: capture callbackUrl from search params
const callbackUrl = searchParams.get("callbackUrl") || "/";

// Pass to better-auth signIn
await authClient.signIn.email({
  email: values.email,
  password: values.password,
  callbackURL: callbackUrl,
});

// For OAuth:
await authClient.signIn.social({
  provider: "google",
  callbackURL: callbackUrl,
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` for auth | `proxy.ts` (cookie check) + layout validation | Next.js 16 (Oct 2025) | proxy.ts is fast redirect-only. Full auth validation in server components. |
| NextAuth/Auth.js | better-auth | 2024-2025 | better-auth is purpose-built for self-hosted. Better org/team support, Drizzle adapter, no cloud assumptions. |
| `forwardRef` in form components | Standard props | React 19 / shadcn v3 | shadcn form components no longer use forwardRef. |
| `shadcn/ui Form` (old pattern) | `Field`, `FieldGroup`, `FieldLabel`, `FieldSeparator` | shadcn v4 (2025) | New form primitives replace the old Form/FormField pattern. Both still work. |
| JWT-only sessions | Cookie-based with cookie cache | better-auth default | Cookie-based sessions are simpler, more secure (httpOnly), with optional cookie caching for performance. |
| Custom org tables | better-auth organization plugin | better-auth 1.0+ | Plugin provides full org CRUD, invitations, roles, permissions, active org tracking. |

**Deprecated/outdated:**
- `middleware.ts` -- deprecated in Next.js 16, use `proxy.ts`
- NextAuth `getServerSession()` -- better-auth uses `auth.api.getSession()`
- Manual JWT creation/verification -- better-auth handles the full session lifecycle
- `@auth/drizzle-adapter` (Auth.js) -- better-auth has its own `drizzleAdapter`

## Claude's Discretion Recommendations

### Org Creation Strategy (Recommended: Auto-create personal org)

**Recommendation:** Auto-create a personal organization for every user upon registration, using the `databaseHooks.user.create.after` hook.

**Rationale:**
- Every user needs at least one org to use org-scoped features (which all features will be in later phases)
- The alternative (prompting after registration) adds friction and another page to build
- Personal org can be named "{name}'s Workspace" with a `personal-{userId}` slug
- Users can create additional orgs later
- This is the pattern used by Vercel, Clerk, and similar platforms

**Known issue:** There is a bug in some better-auth versions where `auth.api.createOrganization` fails in hooks when `allowUserToCreateOrganization` is false. Keep `allowUserToCreateOrganization: true` or use the `afterCreateUser` hook approach shown in the organization plugin docs.

### Org Switcher Placement (Recommended: Top of sidebar)

**Recommendation:** Place the org switcher at the top of the sidebar header, above navigation items.

**Rationale:**
- Org context affects everything below it (all nav items are org-scoped)
- Top-of-sidebar placement is the established pattern (Vercel, Linear, Slack)
- shadcn/ui's sidebar-01 block uses a "VersionSwitcher" in `SidebarHeader` -- same position
- User menu placement would bury a frequently-used control under a click

**Implementation:** Use a `DropdownMenu` in `SidebarHeader` showing current org name + chevron, with org list and "Create organization" option.

### Split-Screen Branding Design (Recommended: Dark gradient with subtle illustration)

**Recommendation:** Right panel uses a dark gradient background (using the OKLCH theme colors) with a subtle geometric/tech illustration and the AXion Hub logo.

**Rationale:**
- Matches the "dark, sleek, techy -- Linear/Vercel mission control vibes" aesthetic from Phase 1
- shadcn/ui's login-02 block uses `dark:brightness-[0.2] dark:grayscale` on its image -- we want a purpose-built dark panel instead
- Gradient from `--background` to `--primary` (amber/orange) with low opacity creates visual interest without needing a photo
- SVG geometric pattern (grid lines, circuit-like paths) reinforces the "mission control" feel

### Password Strength Requirements (Recommended)

**Recommendation:** Minimum 8 characters with at least one uppercase, one lowercase, and one number. Show a password strength meter below the field.

**Implementation:**
- Zod schema enforces: min 8, max 128, regex for uppercase/lowercase/number
- Visual strength indicator: bar that fills from red (weak) to green (strong)
- Real-time feedback as user types (react-hook-form mode: "onChange" for password field)
- better-auth config: `minPasswordLength: 8`, `maxPasswordLength: 128`

### Error Message Styling (Recommended)

**Recommendation:** Inline error messages below each field in `text-destructive` (red), with a top-level error alert for server errors.

**Implementation:**
- Field-level errors: shadcn `FieldDescription` or `FormMessage` in destructive color below each input
- Server errors (wrong password, account not found): `Alert` component with `variant="destructive"` at the top of the form
- Use `sonner` toast for success messages (e.g., "Password reset email sent")
- Avoid disabling the submit button -- show errors instead, so users know what to fix

### Loading States (Recommended)

**Recommendation:** Button loading state during auth operations. Disable form interactions while submitting.

**Implementation:**
- Submit button shows spinner + "Signing in..." / "Creating account..." text
- All form inputs get `disabled` attribute during submission
- Social login buttons also show loading state when clicked
- Use react-hook-form's `formState.isSubmitting` for automatic state tracking
- Page-level: skeleton for dashboard layout while session is being validated

## Open Questions

1. **Email sending in development**
   - What we know: Nodemailer needs an SMTP server. In production, users configure their own.
   - What's unclear: Best DX for development email testing without a real SMTP server.
   - Recommendation: Log email contents to console in development mode. Optionally integrate Mailpit (Docker container that captures emails locally). Add `SMTP_HOST=localhost` and `SMTP_PORT=1025` defaults for Mailpit.

2. **better-auth auto-create org hook reliability**
   - What we know: Community reports issues with `auth.api.createOrganization` in database hooks when `allowUserToCreateOrganization` is false.
   - What's unclear: Whether this is fixed in v1.4.18 or still present.
   - Recommendation: Keep `allowUserToCreateOrganization: true` during implementation. Test the hook flow early. If it fails, fall back to client-side org creation after first login.

3. **Invite token format: invitation ID vs custom token**
   - What we know: better-auth uses invitation ID for `acceptInvitation`. The `sendInvitationEmail` callback receives `data.id`.
   - What's unclear: Whether the invitation ID is a UUID or a short token suitable for URLs.
   - Recommendation: Use the invitation ID directly in the URL `/invite/{id}`. If it's too long, create a URL-friendly alias and store it in invitation metadata.

## Sources

### Primary (HIGH confidence)
- [better-auth Next.js integration](https://www.better-auth.com/docs/integrations/next) -- API route handler, server component session, proxy.ts/middleware protection
- [better-auth email/password docs](https://www.better-auth.com/docs/authentication/email-password) -- Sign up, sign in, email verification, password reset, all options
- [better-auth organization plugin](https://www.better-auth.com/docs/plugins/organization) -- Create org, invite, accept, roles, permissions, schema, hooks
- [better-auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle) -- Setup, schema generation, migration
- [better-auth session management](https://www.better-auth.com/docs/concepts/session-management) -- Cookie caching, secondary storage, session options
- [better-auth email concepts](https://www.better-auth.com/docs/concepts/email) -- Email verification, password reset email configuration
- [better-auth Google OAuth](https://www.better-auth.com/docs/authentication/google) -- Google provider setup, callback URL
- [better-auth GitHub OAuth](https://www.better-auth.com/docs/authentication/github) -- GitHub provider setup, email scope requirement
- [better-auth performance guide](https://www.better-auth.com/docs/guides/optimizing-for-performance) -- Cookie cache, Redis secondary storage, DB indexes
- [better-auth options reference](https://www.better-auth.com/docs/reference/options) -- All configuration options
- [Next.js 16 proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) -- Route protection, matcher, cookie checking, migration from middleware
- [shadcn/ui sidebar component](https://ui.shadcn.com/) -- Sidebar, SidebarProvider, SidebarRail, SidebarTrigger, SidebarInset (verified via registry)
- [shadcn/ui login-02 block](https://ui.shadcn.com/) -- Two-column split-screen login page pattern (verified via registry)
- [shadcn/ui login-04 block](https://ui.shadcn.com/) -- Card-based login with image (verified via registry)
- [shadcn/ui breadcrumb](https://ui.shadcn.com/) -- Breadcrumb component (verified via registry)

### Secondary (MEDIUM confidence)
- [better-auth auto-create org discussion](https://github.com/better-auth/better-auth/issues/2010) -- Community patterns for auto-creating orgs on signup
- [better-auth auto-create org on signup issue #4334](https://github.com/better-auth/better-auth/issues/4334) -- `autoCreateOrganizationOnSignUp` implementation status
- [Next.js 16 auth patterns (Auth0)](https://auth0.com/blog/whats-new-nextjs-16/) -- proxy.ts auth patterns, CVE-2025-29927 context
- [react-hook-form + zod + shadcn](https://ui.shadcn.com/docs/forms/react-hook-form) -- Form integration patterns

### Tertiary (LOW confidence)
- better-auth `autoCreateOrganizationOnSignUp` option -- Referenced in issues but unclear if fully implemented in v1.4.18. Using `databaseHooks` approach instead.
- Mailpit for dev email testing -- Standard community practice, not verified against better-auth specifically.

## Metadata

**Confidence breakdown:**
- Standard stack (better-auth): HIGH -- All APIs verified via official docs. Version 1.4.18 confirmed. Drizzle adapter, organization plugin, OAuth, email verification, session management all documented.
- Architecture (proxy.ts + layout validation): HIGH -- Official Next.js 16 docs + better-auth integration guide both recommend this pattern.
- shadcn/ui components: HIGH -- Sidebar, breadcrumb, login blocks verified via shadcn registry. Exact component APIs confirmed.
- Org auto-creation: MEDIUM -- Community confirms the pattern works but there are reported bugs with `allowUserToCreateOrganization: false`. Workaround documented.
- Email sending: MEDIUM -- Nodemailer is standard but dev experience (Mailpit) needs validation during implementation.

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- better-auth and Next.js 16 are stable releases)
