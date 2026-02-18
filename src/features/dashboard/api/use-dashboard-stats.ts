"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { TaskSummary, AgentCostData, CostSummary } from "@/entities/dashboard-event";
import { queryKeys } from "@/shared/lib/query-keys";
import { useDashboardStore } from "@/features/dashboard";

interface DashboardStats {
	taskSummary: TaskSummary;
	perAgentCosts: AgentCostData[];
	costSummary: CostSummary;
}

/** Mock dashboard stats data until gateway wires up real endpoints. */
const MOCK_STATS: DashboardStats = {
	taskSummary: {
		inbox: 4,
		assigned: 7,
		inProgress: 3,
		review: 2,
		done: 18,
	},
	perAgentCosts: [
		{
			agentId: "agent-001",
			agentName: "Atlas",
			model: "claude-sonnet-4",
			inputTokens: 245_000,
			outputTokens: 82_000,
			cost: 1.97,
		},
		{
			agentId: "agent-002",
			agentName: "Scout",
			model: "claude-sonnet-4",
			inputTokens: 189_000,
			outputTokens: 63_000,
			cost: 1.51,
		},
		{
			agentId: "agent-004",
			agentName: "Scribe",
			model: "claude-sonnet-4",
			inputTokens: 120_000,
			outputTokens: 45_000,
			cost: 1.04,
		},
		{
			agentId: "agent-007",
			agentName: "Relay",
			model: "claude-sonnet-4",
			inputTokens: 78_000,
			outputTokens: 24_000,
			cost: 0.59,
		},
		{
			agentId: "agent-008",
			agentName: "Forge",
			model: "claude-sonnet-4",
			inputTokens: 312_000,
			outputTokens: 98_000,
			cost: 2.41,
		},
	],
	costSummary: {
		tokens: 1_256_000,
		dollars: 7.52,
		inputTokens: 944_000,
		outputTokens: 312_000,
	},
};

// TODO: Replace with real API call when gateway cost endpoints are available
async function fetchDashboardStats(): Promise<DashboardStats> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_STATS;
}

/**
 * TanStack Query hook for initial dashboard data load.
 *
 * Fetches agent counts and task summary, then syncs into Zustand store.
 * staleTime: Infinity prevents refetch from overwriting WebSocket updates.
 */
export function useDashboardStats() {
	const updateTaskSummary = useDashboardStore((s) => s.updateTaskSummary);
	const updatePerAgentCosts = useDashboardStore((s) => s.updatePerAgentCosts);
	const updateAgentCounts = useDashboardStore((s) => s.updateAgentCounts);
	const updateCosts = useDashboardStore((s) => s.updateCosts);

	const query = useQuery({
		queryKey: queryKeys.dashboard.stats(),
		queryFn: fetchDashboardStats,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});

	// Sync TanStack Query data into Zustand store
	useEffect(() => {
		if (query.data) {
			updateTaskSummary(query.data.taskSummary);
			updatePerAgentCosts(query.data.perAgentCosts);
			updateAgentCounts();
			updateCosts("session", query.data.costSummary);
		}
	}, [query.data, updateTaskSummary, updatePerAgentCosts, updateAgentCounts, updateCosts]);

	return query;
}
