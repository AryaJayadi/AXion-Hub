/**
 * Pre-built event template catalog for the WebSocket Playground.
 *
 * Templates cover common OpenClaw Gateway JSON-RPC methods,
 * providing developers with ready-made payloads for testing.
 * Each template can be selected from a dropdown and customized
 * before sending.
 */

export interface EventTemplate {
	id: string;
	label: string;
	description: string;
	method: string;
	params: Record<string, unknown>;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
	{
		id: "health",
		label: "Health Check",
		description: "Check gateway health status",
		method: "health",
		params: {},
	},
	{
		id: "agent-list",
		label: "List Agents",
		description: "List all connected agents",
		method: "agent.list",
		params: {},
	},
	{
		id: "agent-get",
		label: "Get Agent",
		description: "Get details for a specific agent",
		method: "agent.get",
		params: { agentId: "<agent-id>" },
	},
	{
		id: "agent-send",
		label: "Send Message",
		description: "Send a chat message to an agent",
		method: "agent.send",
		params: {
			agentId: "<agent-id>",
			message: "Hello from playground",
			sessionId: "<session-id>",
		},
	},
	{
		id: "config-get",
		label: "Get Config",
		description: "Retrieve gateway configuration",
		method: "config.get",
		params: {},
	},
	{
		id: "sessions-list",
		label: "List Sessions",
		description: "List active agent sessions",
		method: "sessions.list",
		params: {},
	},
	{
		id: "session-get",
		label: "Get Session",
		description: "Get details for a specific session",
		method: "sessions.get",
		params: { sessionId: "<session-id>" },
	},
	{
		id: "events-subscribe",
		label: "Subscribe Events",
		description: "Subscribe to real-time event patterns",
		method: "events.subscribe",
		params: { patterns: ["agent.*", "session.*"] },
	},
	{
		id: "session-compact",
		label: "Compact Session",
		description: "Compact a session's context window",
		method: "session.compact",
		params: { sessionId: "<session-id>" },
	},
	{
		id: "custom",
		label: "Custom",
		description: "Free-form JSON payload",
		method: "",
		params: {},
	},
];

/** Find a template by its ID. */
export function getTemplateById(id: string): EventTemplate | undefined {
	return EVENT_TEMPLATES.find((t) => t.id === id);
}

/** Convert a template to a formatted JSON string for the editor. */
export function templateToJson(template: EventTemplate): string {
	return JSON.stringify(
		{ method: template.method, params: template.params },
		null,
		2,
	);
}
