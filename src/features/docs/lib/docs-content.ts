// ---------------------------------------------------------------------------
// Internal documentation content registry
// Provides static doc pages organized by category for the /docs hub.
// ---------------------------------------------------------------------------

export interface DocPage {
	slug: string;
	title: string;
	category: string;
	content: string;
	order: number;
}

export interface DocCategory {
	id: string;
	label: string;
	order: number;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const DOC_CATEGORIES: DocCategory[] = [
	{ id: "getting-started", label: "Getting Started", order: 0 },
	{ id: "agents", label: "Agents", order: 1 },
	{ id: "missions", label: "Missions", order: 2 },
	{ id: "gateway", label: "Gateway", order: 3 },
	{ id: "api-reference", label: "API Reference", order: 4 },
	{ id: "administration", label: "Administration", order: 5 },
];

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const DOC_PAGES: DocPage[] = [
	// -- Getting Started -------------------------------------------------------
	{
		slug: "getting-started/quick-start",
		title: "Quick Start Guide",
		category: "getting-started",
		order: 0,
		content: `## Welcome to AXion Hub

AXion Hub is a unified mission-control dashboard for managing AI agents, directing their work through missions, and maintaining governance over every action they take.

### Prerequisites

- **Node.js 20+** or **Bun 1.1+** runtime
- **PostgreSQL 15+** database
- **Redis 7+** for queues and caching
- An OpenClaw Gateway instance (optional for initial setup)

### First Steps

1. **Sign in** to AXion Hub using your email and password or SSO provider.
2. **Create an organization** from the sidebar organization switcher.
3. **Register your first agent** using the agent creation wizard at \`/agents/new\`.
4. **Connect your gateway** by adding the WebSocket URL in Settings > Gateway.
5. **Create a mission board** to start assigning tasks to your agents.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | An AI entity registered in AXion Hub with its own identity, skills, and configuration |
| **Mission** | A Kanban board containing tasks assigned to agents |
| **Gateway** | The WebSocket bridge connecting AXion Hub to running agent instances |
| **Session** | A conversation or work session between a user and one or more agents |

Once your agent is connected through the gateway, you can start sending messages, assigning tasks, and monitoring activity from the dashboard.`,
	},
	{
		slug: "getting-started/architecture",
		title: "Architecture Overview",
		category: "getting-started",
		order: 1,
		content: `## Architecture Overview

AXion Hub follows a **Feature-Sliced Design (FSD)** architecture with clear layer boundaries.

### Application Layers

\`\`\`
app/           Next.js App Router pages and layouts
src/
  views/       Full-page view compositions
  widgets/     Complex UI blocks (app shell, dashboard grid)
  features/    Business logic and feature components
  entities/    Domain models and entity components
  shared/      Shared utilities, UI primitives, configuration
\`\`\`

### Communication Flow

\`\`\`
Browser <---> Next.js App <---> REST API Routes
                  |
                  +---> WebSocket <---> OpenClaw Gateway <---> AI Agents
\`\`\`

### State Management

- **Zustand** stores handle push state from WebSocket events (agent status, activity feed)
- **TanStack Query** handles pull state from REST API calls (agent lists, session data)
- **nuqs** manages URL search parameter state for filters and pagination

### Key Subsystems

- **Authentication**: better-auth with organization, 2FA, and API key plugins
- **Gateway Connection**: WebSocketManager + EventBus for real-time agent communication
- **Background Jobs**: BullMQ workers for async task processing and alert evaluation
- **Audit Trail**: Comprehensive logging of all user and agent actions`,
	},
	{
		slug: "getting-started/configuration",
		title: "Configuration Reference",
		category: "getting-started",
		order: 2,
		content: `## Configuration Reference

AXion Hub is configured through environment variables and the gateway configuration file.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| \`DATABASE_URL\` | Yes | PostgreSQL connection string |
| \`REDIS_URL\` | Yes | Redis connection string |
| \`BETTER_AUTH_SECRET\` | Yes | Secret key for authentication tokens |
| \`BETTER_AUTH_URL\` | Yes | Base URL of the application |
| \`NEXT_PUBLIC_GATEWAY_URL\` | No | WebSocket URL for the OpenClaw Gateway |
| \`SMTP_HOST\` | No | SMTP server for email notifications |
| \`SMTP_PORT\` | No | SMTP port (default: 587) |
| \`SMTP_USER\` | No | SMTP authentication username |
| \`SMTP_PASS\` | No | SMTP authentication password |

### Gateway Configuration

The OpenClaw Gateway is configured through \`openclaw.json\` in the gateway instance. Key sections include:

- **connection**: WebSocket endpoint, authentication mode, and TLS settings
- **agents**: Registered agent identities and their capability declarations
- **routing**: Channel-to-agent routing rules and priority chains
- **models**: AI model provider configuration and failover chains
- **security**: Rate limiting, allowed origins, and token validation

### Docker Deployment

AXion Hub ships with a \`docker-compose.yml\` that orchestrates:

- **app**: Next.js application server
- **worker**: BullMQ background job processor
- **db**: PostgreSQL database
- **redis**: Redis for queues and caching

Use \`docker compose up -d\` to start the full stack.`,
	},

	// -- Agents -----------------------------------------------------------------
	{
		slug: "agents/creating-agents",
		title: "Creating Agents",
		category: "agents",
		order: 0,
		content: `## Creating Agents

AXion Hub provides a step-by-step wizard for registering new AI agents.

### Using the Creation Wizard

Navigate to **Agents > New Agent** or click the "Register Agent" button on the agents page. The wizard guides you through four steps:

1. **Template Selection** -- Choose a pre-built template (Assistant, Coder, Researcher, Ops) or start from scratch
2. **Identity** -- Set the agent's name, description, avatar, and personality traits
3. **Model Configuration** -- Select the AI model provider, model name, temperature, and token limits
4. **Review & Create** -- Confirm all settings before creating the agent

### Agent Templates

| Template | Best For | Default Model |
|----------|----------|---------------|
| Assistant | General-purpose help, Q&A, writing | Claude Sonnet |
| Coder | Code generation, debugging, reviews | Claude Sonnet |
| Researcher | Data analysis, summarization, research | Claude Sonnet |
| Ops | DevOps, monitoring, infrastructure | Claude Sonnet |

### After Creation

Once created, your agent appears in the agent grid with an **offline** status. To bring it online:

1. Ensure your OpenClaw Gateway is running
2. The gateway will detect the agent configuration
3. The agent status will change to **idle** or **active**

You can edit the agent's configuration at any time from the agent detail page.`,
	},
	{
		slug: "agents/agent-configuration",
		title: "Agent Configuration",
		category: "agents",
		order: 1,
		content: `## Agent Configuration

Each agent has a detailed configuration that controls its behavior, capabilities, and resource limits.

### Identity Files

Every agent has three core identity files:

- **SYSTEM.md** -- The system prompt defining the agent's role, personality, and behavioral guidelines
- **CONTEXT.md** -- Background context and knowledge the agent should reference
- **MEMORY.md** -- Persistent memory that the agent updates over time

These files are editable from the agent detail page under the **Identity** tab. Changes are saved with debounced auto-save (500ms delay).

### Model Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Provider | AI model provider (Anthropic, OpenAI, etc.) | Anthropic |
| Model | Specific model name | claude-sonnet-4 |
| Temperature | Creativity/randomness (0.0-1.0) | 0.7 |
| Max Tokens | Maximum response length | 4096 |

### Sandbox Configuration

Agents can optionally run in a sandboxed container environment:

- **Enabled/Disabled** toggle for sandbox execution
- **Docker Image** selection (default: \`node:20-slim\`)
- **Resource Limits** for CPU and memory allocation
- **Network Access** restrictions for security`,
	},
	{
		slug: "agents/skills-and-tools",
		title: "Skills & Tools",
		category: "agents",
		order: 2,
		content: `## Skills & Tools

Skills and tools extend what an agent can do beyond basic conversation.

### Skills

Skills are reusable capability modules that can be assigned to agents. Browse the skill library from the **Skills** page to discover available skills.

Each skill has:
- A **name** and **description** explaining its purpose
- **Configuration parameters** that customize behavior
- **Version information** for tracking updates

Toggle skills on or off from the agent detail page under the **Skills** tab. Use the search and category filters to find specific skills.

### Tools

Tools provide agents with concrete capabilities like file access, API calls, or code execution. Manage tool permissions from the **Tools** tab on the agent detail page.

The tool configuration uses a two-column layout:
- **Allowed Tools** -- Tools the agent can use
- **Denied Tools** -- Tools explicitly blocked

### ClawHub

ClawHub is the marketplace for discovering and installing community-built skills and plugins. Browse by category, search by name, and install with one click.

Installed plugins appear in the **Plugins** page where you can configure settings, view documentation, and manage versions.`,
	},

	// -- Missions ---------------------------------------------------------------
	{
		slug: "missions/mission-boards",
		title: "Mission Boards",
		category: "missions",
		order: 0,
		content: `## Mission Boards

Mission boards are Kanban-style boards for organizing and tracking agent work.

### Board Structure

Each board has five columns representing task lifecycle stages:

| Column | Purpose |
|--------|---------|
| **Backlog** | Tasks waiting to be started |
| **Queued** | Tasks ready for agent assignment |
| **In Progress** | Tasks currently being worked on |
| **In Review** | Tasks awaiting human review or sign-off |
| **Done** | Completed tasks |

### Working with Boards

- **Drag and drop** tasks between columns to update their status
- **Click a task** to open its detail view with full description, deliverables, and activity timeline
- **Filter tasks** by status, assignee, priority, or due date using the sidebar filters
- **Search tasks** across all boards using the search input

### Creating Boards

Create a new board from the Mission Boards page. Each board has:
- A **name** and optional **description**
- **Board-level settings** for default assignees and automation rules
- **Column customization** options for work-in-progress limits`,
	},
	{
		slug: "missions/task-management",
		title: "Task Management",
		category: "missions",
		order: 1,
		content: `## Task Management

Tasks are the atomic units of work assigned to agents within mission boards.

### Creating Tasks

Click the **+ Add Task** button in any column header to create a new task. Fill in:

- **Title** -- A concise description of what needs to be done
- **Description** -- Detailed instructions in markdown format
- **Priority** -- Low, Medium, High, or Critical
- **Assignee** -- The agent responsible for completing the task
- **Due Date** -- Optional deadline for completion
- **Deliverables** -- Expected output files or artifacts

### Task Lifecycle

1. Tasks start in **Backlog** or **Queued**
2. When an agent picks up a task, it moves to **In Progress**
3. The agent works on the task, producing deliverables
4. When complete, the task moves to **In Review**
5. A human reviewer can **approve**, **request revisions**, or **reject**
6. Approved tasks move to **Done**

### Sign-off Flow

Tasks with sign-off enabled require explicit human approval before completion. The reviewer sees:
- Task description and deliverables
- Agent's work output and timeline
- Approve / Request Revision / Reject actions
- Required comment field for revision or rejection`,
	},

	// -- Gateway ----------------------------------------------------------------
	{
		slug: "gateway/connection-setup",
		title: "Connection Setup",
		category: "gateway",
		order: 0,
		content: `## Gateway Connection Setup

The OpenClaw Gateway is the WebSocket bridge between AXion Hub and your AI agents.

### Connection Configuration

Set the gateway URL in your environment:

\`\`\`bash
NEXT_PUBLIC_GATEWAY_URL=ws://localhost:8080
\`\`\`

Or configure it at runtime from **Settings > Gateway**.

### Authentication

The gateway uses a three-phase handshake for secure connections:

1. **Connect** -- Client sends a connection request with credentials
2. **Hello** -- Gateway acknowledges and sends capability information
3. **Ready** -- Connection is established and events can flow

### Connection Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Auto** | Connects automatically on app load | Production deployments |
| **Manual** | Requires explicit connect action | Development and testing |

### Status Indicators

The gateway status appears in the sidebar and header bar:
- **Connected** (green) -- Active WebSocket connection
- **Connecting** (yellow) -- Handshake in progress
- **Disconnected** (gray) -- No active connection
- **Error** (red) -- Connection failed`,
	},
	{
		slug: "gateway/event-reference",
		title: "Event Reference",
		category: "gateway",
		order: 1,
		content: `## Event Reference

AXion Hub communicates with the gateway using typed events over WebSocket.

### Common Event Types

| Event | Direction | Description |
|-------|-----------|-------------|
| \`agent.status\` | Gateway -> Hub | Agent came online, went offline, or changed status |
| \`agent.message\` | Bidirectional | Chat message between user and agent |
| \`agent.stream\` | Gateway -> Hub | Streaming token from agent response |
| \`agent.tool_call\` | Gateway -> Hub | Agent invoked a tool |
| \`session.started\` | Gateway -> Hub | New agent session began |
| \`session.ended\` | Gateway -> Hub | Agent session terminated |
| \`task.updated\` | Gateway -> Hub | Task status or content changed |
| \`ws.connected\` | Internal | WebSocket connection established |
| \`ws.disconnected\` | Internal | WebSocket connection lost |

### Event Payload Structure

All gateway events follow this envelope format:

\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "agent.status",
  "params": {
    "agentId": "agent-123",
    "status": "active",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

### Subscribing to Events

Use the EventBus in your components to listen for specific events. The gateway client automatically routes events to the appropriate Zustand stores for UI updates.`,
	},
	{
		slug: "gateway/troubleshooting",
		title: "Troubleshooting",
		category: "gateway",
		order: 2,
		content: `## Gateway Troubleshooting

Common issues and their solutions when connecting to the OpenClaw Gateway.

### Connection Refused

**Symptom:** Gateway shows "Disconnected" and console shows connection refused errors.

**Solutions:**
- Verify the gateway is running: \`curl http://localhost:8080/health\`
- Check the \`NEXT_PUBLIC_GATEWAY_URL\` environment variable is set correctly
- Ensure the gateway port is not blocked by a firewall
- In Docker, use \`host.docker.internal\` instead of \`localhost\`

### Authentication Failed

**Symptom:** Connection drops immediately after the initial handshake.

**Solutions:**
- Verify your authentication token is valid and not expired
- Check that the gateway accepts your authentication mode (token, API key, or session)
- Review gateway logs for detailed error messages

### Events Not Arriving

**Symptom:** Connected successfully but agent status updates are not reflected in the UI.

**Solutions:**
- Open the browser DevTools Network tab and filter by WebSocket messages
- Use the **WebSocket Playground** at \`/api-docs/ws\` to test events manually
- Verify the EventBus subscriptions are registered in your component
- Check that Zustand stores are properly subscribed to gateway events

### High Latency

**Symptom:** Events arrive with noticeable delay.

**Solutions:**
- Check network latency between AXion Hub and the gateway
- Review gateway load and connected client count
- Consider deploying the gateway closer to the AXion Hub instance`,
	},

	// -- API Reference -----------------------------------------------------------
	{
		slug: "api-reference/rest-api",
		title: "REST API",
		category: "api-reference",
		order: 0,
		content: `## REST API

AXion Hub exposes a REST API for programmatic access to all platform features.

### Interactive Documentation

For the full interactive API reference with request/response examples and a "Try It" feature, visit the [API Documentation](/api-docs) page.

### Base URL

All API endpoints are relative to your AXion Hub deployment URL:

\`\`\`
https://your-axion-hub.example.com/api
\`\`\`

### Authentication

API requests must include one of:
- **Session cookie** -- Automatically set after browser login
- **API key** -- Pass in the \`Authorization: Bearer axion_...\` header

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/api/agents\` | List all agents |
| POST | \`/api/agents\` | Create a new agent |
| GET | \`/api/agents/:id\` | Get agent details |
| GET | \`/api/sessions\` | List sessions |
| GET | \`/api/tasks\` | List tasks |
| POST | \`/api/tasks\` | Create a task |
| GET | \`/api/audit\` | Query audit logs |

### Response Format

All responses follow a consistent JSON structure with appropriate HTTP status codes. Error responses include a \`message\` field with a human-readable description.`,
	},
	{
		slug: "api-reference/websocket-protocol",
		title: "WebSocket Protocol",
		category: "api-reference",
		order: 1,
		content: `## WebSocket Protocol

AXion Hub communicates with the OpenClaw Gateway using a JSON-RPC 2.0 based WebSocket protocol.

### Interactive Playground

Use the [WebSocket Playground](/api-docs/ws) to connect to your gateway, send events, and inspect responses in real time.

### Protocol Overview

The protocol uses JSON-RPC 2.0 message envelopes:

\`\`\`json
// Request
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "agent.send",
  "params": { "agentId": "agent-123", "message": "Hello" }
}

// Response
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "result": { "status": "sent", "sessionId": "sess-456" }
}

// Notification (no id, no response expected)
{
  "jsonrpc": "2.0",
  "method": "agent.status",
  "params": { "agentId": "agent-123", "status": "active" }
}
\`\`\`

### Connection Lifecycle

1. Open WebSocket to \`ws://gateway-host:port\`
2. Send \`connect\` request with authentication credentials
3. Receive \`hello\` notification with gateway capabilities
4. Connection is ready for bidirectional communication
5. Send \`disconnect\` or close the socket to end the session

### Event Subscriptions

After connecting, you automatically receive notifications for agent status changes, messages, and other events. Use the Event Reference documentation for a complete list of event types and their payloads.`,
	},
	{
		slug: "api-reference/authentication",
		title: "Authentication",
		category: "api-reference",
		order: 2,
		content: `## API Authentication

AXion Hub supports multiple authentication methods for API access.

### Session Cookies

Browser-based authentication uses HTTP-only session cookies managed by better-auth. After logging in through the web UI, all API requests from the browser automatically include the session cookie.

### API Keys

For programmatic access, create an API key from **Settings > API Keys**.

Include the key in your request headers:

\`\`\`bash
curl -H "Authorization: Bearer axion_your_api_key_here" \\
     https://your-hub.example.com/api/agents
\`\`\`

**Important:** API keys are shown in full only once at creation time. Store them securely. After creation, only the last 4 characters are visible.

### Key Management

| Action | Description |
|--------|-------------|
| **Create** | Generate a new key with a name and optional expiration |
| **List** | View all keys with masked values (last 4 chars only) |
| **Delete** | Permanently revoke a key |

### Security Best Practices

- Rotate API keys regularly (every 90 days recommended)
- Use separate keys for different integrations
- Set expiration dates on keys when possible
- Monitor the audit log for unauthorized API access attempts
- Never commit API keys to version control`,
	},

	// -- Administration ----------------------------------------------------------
	{
		slug: "administration/user-management",
		title: "User Management",
		category: "administration",
		order: 0,
		content: `## User Management

AXion Hub uses organization-based access control for managing users and permissions.

### Roles

| Role | Permissions |
|------|------------|
| **Owner** | Full access, can delete organization, manage billing |
| **Admin** | Manage members, settings, agents, and missions |
| **Member** | View and interact with agents, create tasks, participate in missions |

### Inviting Users

Invite new members from **Settings > Team**:

1. Click **Invite Member**
2. Enter the email address
3. Select a role (Member or Admin)
4. Click **Send Invitation**

The invitee receives an email with a link to accept the invitation. Pending invitations can be managed from the **Invitations** tab.

### Managing Members

From the team settings page, admins and owners can:

- **View** all organization members and their roles
- **Update roles** by selecting a new role from the dropdown
- **Remove members** from the organization
- **View invitation status** and resend or cancel pending invitations

### Organization Settings

Configure organization-level settings including:
- Organization name and logo
- Default member role for new invitations
- Organization-wide preferences`,
	},
	{
		slug: "administration/security",
		title: "Security Settings",
		category: "administration",
		order: 1,
		content: `## Security Settings

AXion Hub provides comprehensive security controls to protect your account and organization.

### Two-Factor Authentication (2FA)

Enable TOTP-based two-factor authentication from **Settings > Security**:

1. Click **Enable 2FA**
2. Enter your current password to confirm identity
3. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
4. Enter the 6-digit verification code
5. Save your backup codes in a secure location

**Backup codes** are single-use recovery codes for when you lose access to your authenticator app. Each code can only be used once.

### Active Sessions

View and manage all active sessions from **Settings > Security**:

- See device type, IP address, and last active time for each session
- **Revoke** individual sessions to force sign-out on specific devices
- **Revoke all other sessions** to sign out everywhere except your current device

### Password Management

Change your password from the security settings page. You must enter your current password before setting a new one.

### API Key Security

API keys are hashed using SHA-256 before storage. The raw key is only available at creation time. See the Authentication documentation for best practices on key management.`,
	},
	{
		slug: "administration/backup",
		title: "Backup & Recovery",
		category: "administration",
		order: 2,
		content: `## Backup & Recovery

AXion Hub supports data export for backup and migration purposes.

### Export Options

| Export Type | Contents | Format |
|-------------|----------|--------|
| **Configuration** | Workspace settings, preferences, theme | JSON |
| **Agent Configs** | Agent identities, skills, tool permissions | JSON |
| **Session Data** | Conversation transcripts and metadata | JSON |
| **Full Workspace** | All data including files and configurations | ZIP |

### Creating a Backup

1. Navigate to **Settings > Backup & Export**
2. Select the export type
3. Click **Export**
4. The download starts automatically

### Data Included

A full workspace export contains:
- \`manifest.json\` -- Export metadata (version, date, user)
- \`config.json\` -- Workspace and organization settings
- \`agents/\` -- Individual agent configuration files
- \`sessions/\` -- Session transcripts organized by date
- \`workspace/\` -- Uploaded files and documents

### Recovery

To restore from a backup, contact your organization administrator. Import functionality allows re-creating agents and configurations from exported JSON files.

### Recommendations

- Schedule regular exports (weekly recommended for active workspaces)
- Store backups in a secure, offsite location
- Test restore procedures periodically
- Keep at least three recent backup copies`,
	},
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Look up a doc page by its slug segments.
 * e.g. getDocBySlug(["getting-started", "quick-start"])
 */
export function getDocBySlug(slug: string[]): DocPage | undefined {
	const joined = slug.join("/");
	return DOC_PAGES.find((page) => page.slug === joined);
}

/**
 * Get all doc pages belonging to a given category, sorted by order.
 */
export function getDocsByCategory(category: string): DocPage[] {
	return DOC_PAGES.filter((page) => page.category === category).sort(
		(a, b) => a.order - b.order,
	);
}

/**
 * Return all doc pages sorted by category order then page order.
 */
export function getAllDocs(): DocPage[] {
	const catOrder = new Map(DOC_CATEGORIES.map((c) => [c.id, c.order]));
	return [...DOC_PAGES].sort((a, b) => {
		const catDiff = (catOrder.get(a.category) ?? 0) - (catOrder.get(b.category) ?? 0);
		if (catDiff !== 0) return catDiff;
		return a.order - b.order;
	});
}

/**
 * Get the previous and next doc pages for navigation.
 */
export function getAdjacentDocs(slug: string[]): {
	prev: DocPage | undefined;
	next: DocPage | undefined;
} {
	const all = getAllDocs();
	const joined = slug.join("/");
	const idx = all.findIndex((p) => p.slug === joined);
	return {
		prev: idx > 0 ? all[idx - 1] : undefined,
		next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined,
	};
}
