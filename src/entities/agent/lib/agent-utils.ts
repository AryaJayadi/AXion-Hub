import type { Agent, AgentStatus } from "../model/types";

/**
 * Returns the CSS color value for a given agent status.
 * Used for custom styling outside of Tailwind classes.
 */
export function getStatusColor(status: AgentStatus): string {
	switch (status) {
		case "online":
			return "rgb(34, 197, 94)"; // green-500
		case "idle":
			return "rgb(234, 179, 8)"; // yellow-500
		case "working":
			return "rgb(59, 130, 246)"; // blue-500
		case "error":
			return "rgb(239, 68, 68)"; // red-500
		case "offline":
			return "rgb(107, 114, 128)"; // gray-500
	}
}

/**
 * Returns Tailwind classes for the card glow effect based on agent status.
 * Uses box-shadow (not border-width) to prevent layout shift.
 */
export function getStatusGlowClasses(status: AgentStatus): string {
	switch (status) {
		case "online":
			return "shadow-[0_0_15px_-3px] shadow-green-500/40 border-green-500/30";
		case "idle":
			return "shadow-[0_0_15px_-3px] shadow-yellow-500/40 border-yellow-500/30";
		case "working":
			return "shadow-[0_0_15px_-3px] shadow-blue-500/40 border-blue-500/30";
		case "error":
			return "shadow-[0_0_15px_-3px] shadow-red-500/40 border-red-500/30";
		case "offline":
			return "border-border";
	}
}

/**
 * Formats uptime in seconds to a human-readable string.
 * Examples: "2h 35m", "3d 12h", "45m", "< 1m"
 */
export function formatUptime(seconds: number): string {
	if (seconds < 60) return "< 1m";

	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

/**
 * Derives a formatted key stat string from agent data.
 * Falls back to the agent's keyStat field if present.
 */
export function formatKeyStat(agent: Agent): string {
	if (agent.keyStat) return agent.keyStat;
	if (agent.currentTask) return `Working: ${agent.currentTask}`;
	return `${agent.contextUsage}% context`;
}
