import { nanoid } from "nanoid";
import type { DashboardEvent, EventSeverity } from "../model/types";

/**
 * Derive severity from event type.
 * Error-related events -> "error", warning events -> "warning", default -> "info".
 */
function deriveSeverity(eventType: string): EventSeverity {
	if (
		eventType.includes("error") ||
		eventType.includes("failed") ||
		eventType === "chat.tool.error"
	) {
		return "error";
	}
	if (eventType.includes("warning") || eventType.includes("degraded")) {
		return "warning";
	}
	return "info";
}

/**
 * Derive a human-readable summary from an event type and its payload.
 */
function deriveSummary(eventType: string, payload: Record<string, unknown>): string {
	const name = (payload.name as string) ?? (payload.agentId as string) ?? "unknown";
	const status = payload.status as string | undefined;

	switch (eventType) {
		case "agent.status":
			return `Agent ${name} changed to ${status ?? "unknown"}`;
		case "agent.created":
			return `Agent ${name} was created`;
		case "agent.deleted":
			return `Agent ${payload.agentId as string} was deleted`;
		case "chat.stream.start":
			return `Streaming started for session ${payload.sessionId as string}`;
		case "chat.stream.end":
			return `Streaming completed for session ${payload.sessionId as string}`;
		case "chat.tool.start":
			return `Tool ${payload.name as string} invoked`;
		case "chat.tool.end":
			return `Tool ${payload.toolCallId as string} completed`;
		case "chat.tool.error":
			return `Tool ${payload.toolCallId as string} failed: ${payload.error as string}`;
		case "exec.approval.requested":
			return `Approval requested for command: ${payload.command as string}`;
		case "exec.approval.resolved":
			return `Approval ${(payload.approved as boolean) ? "granted" : "denied"}`;
		case "ws.connected":
			return `Gateway connected in ${payload.mode as string} mode`;
		case "ws.failed":
			return `Gateway connection failed: ${payload.reason as string}`;
		case "ws.reconnecting":
			return `Reconnecting (attempt ${payload.attempt as number}/${payload.maxAttempts as number})`;
		default:
			return `Event: ${eventType}`;
	}
}

/**
 * Derive the source namespace from an event type.
 * e.g., "agent.status" -> "agent", "chat.stream.start" -> "chat"
 */
function deriveSource(eventType: string): string {
	const dotIndex = eventType.indexOf(".");
	return dotIndex > 0 ? eventType.slice(0, dotIndex) : eventType;
}

/**
 * Parse a raw EventBus event into a DashboardEvent.
 *
 * @param eventType - The EventBus event key (e.g., "agent.status", "chat.stream.start")
 * @param payload - The raw event payload
 * @returns A structured DashboardEvent
 */
export function parseGatewayEvent(
	eventType: string,
	payload: unknown,
): DashboardEvent {
	const data = (payload ?? {}) as Record<string, unknown>;

	return {
		id: nanoid(),
		timestamp: new Date(),
		type: eventType,
		source: deriveSource(eventType),
		agentId: (data.agentId as string | undefined) ?? undefined,
		summary: deriveSummary(eventType, data),
		details: data,
		severity: deriveSeverity(eventType),
	};
}
