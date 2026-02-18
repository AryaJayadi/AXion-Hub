"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardEvent, EventFilter, EventSeverity } from "@/entities/dashboard-event";
import { queryKeys } from "@/shared/lib/query-keys";

interface ActivityHistoryResult {
	events: DashboardEvent[];
	total: number;
	page: number;
	pageSize: number;
}

/** Generate 50 mock events with varied types spread over past 7 days. */
function generateMockHistory(): DashboardEvent[] {
	const types = [
		"agent.status",
		"agent.registered",
		"agent.error",
		"chat.message",
		"chat.stream.start",
		"chat.stream.end",
		"exec.start",
		"exec.complete",
		"exec.error",
		"ws.connected",
		"ws.disconnected",
	];

	const sources = ["gateway", "provider", "channel", "node"];

	const severities: EventSeverity[] = ["info", "warning", "error"];

	const summaries = [
		"Agent Atlas came online",
		"Chat session started with Scout",
		"Execution pipeline completed successfully",
		"WebSocket connection established",
		"Agent Scribe processing document batch",
		"Rate limit warning on provider endpoint",
		"Gateway health check passed",
		"Token budget threshold reached",
		"Agent Relay dispatched message",
		"Sandbox environment initialized",
		"Model response latency spike detected",
		"Channel webhook received",
		"Agent configuration updated",
		"Execution timeout on task #42",
		"Memory snapshot saved",
	];

	const agentIds = ["agent-001", "agent-002", "agent-004", "agent-007", "agent-008", undefined];

	const now = Date.now();
	const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

	return Array.from({ length: 50 }, (_, i) => ({
		id: `hist-${(i + 1).toString().padStart(3, "0")}`,
		timestamp: new Date(now - Math.random() * sevenDaysMs),
		type: types[i % types.length] ?? "agent.status",
		source: sources[i % sources.length] ?? "gateway",
		agentId: agentIds[i % agentIds.length],
		summary: summaries[i % summaries.length] ?? "Event occurred",
		details: i % 5 === 0 ? { taskId: `task-${i}`, duration: Math.floor(Math.random() * 5000) } : undefined,
		severity: severities[i % severities.length] ?? "info",
	})).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const MOCK_HISTORY = generateMockHistory();

// TODO: Replace with real API call when gateway history endpoint is available
async function fetchActivityHistory(
	_filters: EventFilter,
): Promise<ActivityHistoryResult> {
	await new Promise((resolve) => setTimeout(resolve, 400));
	return {
		events: MOCK_HISTORY,
		total: MOCK_HISTORY.length,
		page: 1,
		pageSize: 50,
	};
}

/**
 * TanStack Query hook for fetching activity history.
 *
 * Accepts EventFilter for server-side filtering.
 * staleTime: 5 minutes (historical data can afford to refetch).
 */
export function useActivityHistory(filters: EventFilter = {}) {
	return useQuery({
		queryKey: queryKeys.activity.list(filters as Record<string, unknown>),
		queryFn: () => fetchActivityHistory(filters),
		staleTime: 5 * 60 * 1000,
	});
}
