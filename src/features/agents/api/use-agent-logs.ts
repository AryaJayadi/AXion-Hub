"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgentLogEntry } from "@/entities/agent";

function generateMockLogs(): AgentLogEntry[] {
	const eventTypes: AgentLogEntry["eventType"][] = [
		"tool_call",
		"message",
		"error",
		"status_change",
		"compaction",
	];
	const statuses: AgentLogEntry["status"][] = ["success", "error", "pending"];
	const summaries: Record<AgentLogEntry["eventType"], string[]> = {
		tool_call: [
			"Called Read tool on src/index.ts",
			"Executed Bash: npm test",
			"Called Write tool on output.json",
			"Grep search for 'TODO' in src/",
			"Glob pattern match: **/*.tsx",
			"Called Edit tool on config.ts",
			"WebFetch: api.example.com/data",
			"WebSearch: 'React 19 migration guide'",
		],
		message: [
			"Received user message: 'Review the PR'",
			"Sent response with code review feedback",
			"Received follow-up question about test coverage",
			"Sent summary of changes needed",
			"Acknowledged task completion",
		],
		error: [
			"Tool execution failed: permission denied",
			"API rate limit exceeded, retrying in 30s",
			"Context window approaching limit (92%)",
			"Failed to parse JSON response from API",
			"Timeout waiting for external service",
		],
		status_change: [
			"Status changed: idle -> working",
			"Status changed: working -> idle",
			"Status changed: offline -> online",
			"Status changed: working -> error",
		],
		compaction: [
			"Context compaction triggered at 85% usage",
			"Compacted 12,000 tokens to 3,200 tokens",
			"Preserved 5 key context items during compaction",
		],
	};

	const now = Date.now();
	const logs: AgentLogEntry[] = [];

	for (let i = 0; i < 50; i++) {
		const eventType = eventTypes[i % eventTypes.length] as AgentLogEntry["eventType"];
		const typeSummaries = summaries[eventType];
		const summary = typeSummaries[i % typeSummaries.length] ?? "Unknown event";
		const status: AgentLogEntry["status"] =
			eventType === "error" ? "error" : (statuses[i % statuses.length] as AgentLogEntry["status"]);

		logs.push({
			id: `log-${String(i + 1).padStart(3, "0")}`,
			timestamp: new Date(now - i * 3 * 60 * 1000), // 3 min intervals
			eventType,
			summary,
			details:
				eventType === "tool_call"
					? { tool: summary.split(" ")[1], duration: Math.floor(Math.random() * 5000) }
					: eventType === "error"
						? { code: "ERR_" + String(Math.floor(Math.random() * 1000)), retryable: i % 2 === 0 }
						: undefined,
			status,
		});
	}

	return logs;
}

// TODO: Wire to WebSocket Event Bus for real-time log streaming
async function fetchAgentLogs(_agentId: string): Promise<AgentLogEntry[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return generateMockLogs();
}

/**
 * TanStack Query hook for fetching agent activity logs.
 *
 * Returns log entries sorted by timestamp (newest first).
 * staleTime Infinity matches other agent hooks; real-time updates
 * will come from WebSocket Event Bus subscriptions.
 */
export function useAgentLogs(agentId: string) {
	const query = useQuery({
		queryKey: ["agents", agentId, "logs"],
		queryFn: () => fetchAgentLogs(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	return {
		logs: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
	};
}
