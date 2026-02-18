"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgentMetrics } from "@/entities/agent";

function formatDate(date: Date): string {
	return date.toISOString().split("T")[0] ?? "";
}

function generateMockMetrics(): AgentMetrics {
	const days = 14;
	const tokenUsage: AgentMetrics["tokenUsage"] = [];
	const costBreakdown: AgentMetrics["costBreakdown"] = [];
	const tasksCompleted: AgentMetrics["tasksCompleted"] = [];
	const responseTimes: AgentMetrics["responseTimes"] = [];

	const now = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		const dateStr = formatDate(date);

		// Increasing trend for tokens
		const baseTokens = 5000 + (days - i) * 300;
		tokenUsage.push({
			date: dateStr,
			tokens: baseTokens + Math.floor(Math.random() * 2000),
		});

		// Cost correlated with tokens
		costBreakdown.push({
			date: dateStr,
			cost: Number.parseFloat(((baseTokens / 1000) * 0.015 + Math.random() * 0.5).toFixed(2)),
		});

		// Variable task completion
		tasksCompleted.push({
			date: dateStr,
			count: Math.floor(3 + Math.random() * 12),
		});

		// Stable response times (2-5s range)
		responseTimes.push({
			date: dateStr,
			avgMs: Math.floor(2000 + Math.random() * 3000),
		});
	}

	return { tokenUsage, costBreakdown, tasksCompleted, responseTimes };
}

// TODO: Replace with gatewayClient.agent.metrics(agentId)
async function fetchAgentMetrics(_agentId: string): Promise<AgentMetrics> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return generateMockMetrics();
}

/**
 * TanStack Query hook for fetching agent metrics data.
 *
 * Returns 14 days of mock metrics for token usage, cost breakdown,
 * tasks completed, and response times.
 */
export function useAgentMetrics(agentId: string) {
	const query = useQuery({
		queryKey: ["agents", agentId, "metrics"],
		queryFn: () => fetchAgentMetrics(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	return {
		metrics: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error,
	};
}
