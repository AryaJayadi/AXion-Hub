/**
 * EventBus namespace subscriptions and display metadata for dashboard events.
 */

/** Namespaces to subscribe to for dashboard event tracking. */
export const EVENT_NAMESPACES = [
	"agent.*",
	"chat.*",
	"exec.*",
	"ws.*",
] as const;

export interface EventDisplayInfo {
	/** Lucide icon name */
	icon: string;
	/** Tailwind color token (e.g., "blue", "green") */
	color: string;
	/** Human-readable label */
	label: string;
}

/**
 * Map event type prefixes to display metadata.
 *
 * @param type - Full event type string (e.g., "agent.status", "chat.stream.start")
 * @returns Display info with icon name, color, and label
 */
export function getEventDisplayInfo(type: string): EventDisplayInfo {
	const prefix = type.split(".")[0];

	switch (prefix) {
		case "agent":
			return { icon: "Bot", color: "blue", label: "Agent" };
		case "chat":
			return { icon: "MessageSquare", color: "green", label: "Chat" };
		case "exec":
			return { icon: "Cog", color: "orange", label: "Execution" };
		case "ws":
			return { icon: "Wifi", color: "purple", label: "System" };
		default:
			return { icon: "Activity", color: "gray", label: "Other" };
	}
}
