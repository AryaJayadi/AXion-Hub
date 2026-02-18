"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { TimePeriod, CostSummary, AgentCostData } from "@/entities/dashboard-event";
import { queryKeys } from "@/shared/lib/query-keys";
import { useDashboardStore } from "@/features/dashboard";

interface CostResponse {
	summary: CostSummary;
	perAgent: AgentCostData[];
}

/** Mock cost data per period. */
const MOCK_COSTS: Record<TimePeriod, CostResponse> = {
	session: {
		summary: {
			tokens: 1_256_000,
			dollars: 7.52,
			inputTokens: 944_000,
			outputTokens: 312_000,
		},
		perAgent: [
			{ agentId: "agent-001", agentName: "Atlas", model: "claude-sonnet-4", inputTokens: 245_000, outputTokens: 82_000, cost: 1.97 },
			{ agentId: "agent-002", agentName: "Scout", model: "claude-sonnet-4", inputTokens: 189_000, outputTokens: 63_000, cost: 1.51 },
			{ agentId: "agent-004", agentName: "Scribe", model: "claude-sonnet-4", inputTokens: 120_000, outputTokens: 45_000, cost: 1.04 },
			{ agentId: "agent-007", agentName: "Relay", model: "claude-sonnet-4", inputTokens: 78_000, outputTokens: 24_000, cost: 0.59 },
			{ agentId: "agent-008", agentName: "Forge", model: "claude-sonnet-4", inputTokens: 312_000, outputTokens: 98_000, cost: 2.41 },
		],
	},
	today: {
		summary: {
			tokens: 3_420_000,
			dollars: 20.14,
			inputTokens: 2_565_000,
			outputTokens: 855_000,
		},
		perAgent: [
			{ agentId: "agent-001", agentName: "Atlas", model: "claude-sonnet-4", inputTokens: 680_000, outputTokens: 220_000, cost: 5.34 },
			{ agentId: "agent-002", agentName: "Scout", model: "claude-sonnet-4", inputTokens: 510_000, outputTokens: 175_000, cost: 4.16 },
			{ agentId: "agent-004", agentName: "Scribe", model: "claude-sonnet-4", inputTokens: 340_000, outputTokens: 120_000, cost: 2.82 },
			{ agentId: "agent-007", agentName: "Relay", model: "claude-sonnet-4", inputTokens: 225_000, outputTokens: 70_000, cost: 1.72 },
			{ agentId: "agent-008", agentName: "Forge", model: "claude-sonnet-4", inputTokens: 810_000, outputTokens: 270_000, cost: 6.10 },
		],
	},
	week: {
		summary: {
			tokens: 18_750_000,
			dollars: 112.50,
			inputTokens: 14_062_500,
			outputTokens: 4_687_500,
		},
		perAgent: [
			{ agentId: "agent-001", agentName: "Atlas", model: "claude-sonnet-4", inputTokens: 3_750_000, outputTokens: 1_250_000, cost: 30.00 },
			{ agentId: "agent-002", agentName: "Scout", model: "claude-sonnet-4", inputTokens: 2_800_000, outputTokens: 937_500, cost: 22.47 },
			{ agentId: "agent-004", agentName: "Scribe", model: "claude-sonnet-4", inputTokens: 1_875_000, outputTokens: 625_000, cost: 15.00 },
			{ agentId: "agent-007", agentName: "Relay", model: "claude-sonnet-4", inputTokens: 1_250_000, outputTokens: 375_000, cost: 9.38 },
			{ agentId: "agent-008", agentName: "Forge", model: "claude-sonnet-4", inputTokens: 4_387_500, outputTokens: 1_500_000, cost: 35.65 },
		],
	},
};

// TODO: Replace with real API call when gateway cost endpoints are available
async function fetchCostSummary(period: TimePeriod): Promise<CostResponse> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	return MOCK_COSTS[period];
}

/**
 * TanStack Query hook for cost summary by time period.
 *
 * Accepts a `period` parameter (session/today/week) and syncs
 * the result into the dashboard Zustand store.
 */
export function useCostSummary(period: TimePeriod) {
	const updateCosts = useDashboardStore((s) => s.updateCosts);
	const updatePerAgentCosts = useDashboardStore((s) => s.updatePerAgentCosts);

	const query = useQuery({
		queryKey: queryKeys.dashboard.costs(period),
		queryFn: () => fetchCostSummary(period),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});

	// Sync into Zustand store
	useEffect(() => {
		if (query.data) {
			updateCosts(period, query.data.summary);
			updatePerAgentCosts(query.data.perAgent);
		}
	}, [query.data, period, updateCosts, updatePerAgentCosts]);

	return query;
}
