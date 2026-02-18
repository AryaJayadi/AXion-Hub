"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgentSession } from "@/entities/agent";

/** Mock session data for development until gateway client methods are wired. */
function generateMockSessions(agentId: string): AgentSession[] {
	const now = Date.now();
	const hour = 3_600_000;
	const day = 24 * hour;

	return [
		{
			id: `sess-${agentId}-001`,
			agentId,
			startedAt: new Date(now - 0.5 * hour),
			status: "active",
			tokenCount: 3_240,
			compactionCount: 0,
		},
		{
			id: `sess-${agentId}-002`,
			agentId,
			startedAt: new Date(now - 6 * hour),
			endedAt: new Date(now - 4 * hour),
			status: "ended",
			tokenCount: 12_450,
			compactionCount: 1,
		},
		{
			id: `sess-${agentId}-003`,
			agentId,
			startedAt: new Date(now - 1 * day),
			endedAt: new Date(now - 22 * hour),
			status: "compacted",
			tokenCount: 48_200,
			compactionCount: 5,
		},
		{
			id: `sess-${agentId}-004`,
			agentId,
			startedAt: new Date(now - 1.5 * day),
			endedAt: new Date(now - 1.2 * day),
			status: "ended",
			tokenCount: 8_900,
			compactionCount: 0,
		},
		{
			id: `sess-${agentId}-005`,
			agentId,
			startedAt: new Date(now - 2 * day),
			endedAt: new Date(now - 1.8 * day),
			status: "compacted",
			tokenCount: 35_600,
			compactionCount: 3,
		},
		{
			id: `sess-${agentId}-006`,
			agentId,
			startedAt: new Date(now - 3 * day),
			endedAt: new Date(now - 2.7 * day),
			status: "ended",
			tokenCount: 1_200,
			compactionCount: 0,
		},
		{
			id: `sess-${agentId}-007`,
			agentId,
			startedAt: new Date(now - 4 * day),
			endedAt: new Date(now - 3.5 * day),
			status: "compacted",
			tokenCount: 42_100,
			compactionCount: 4,
		},
		{
			id: `sess-${agentId}-008`,
			agentId,
			startedAt: new Date(now - 5 * day),
			endedAt: new Date(now - 4.9 * day),
			status: "ended",
			tokenCount: 520,
			compactionCount: 0,
		},
		{
			id: `sess-${agentId}-009`,
			agentId,
			startedAt: new Date(now - 6 * day),
			endedAt: new Date(now - 5.5 * day),
			status: "ended",
			tokenCount: 22_300,
			compactionCount: 2,
		},
		{
			id: `sess-${agentId}-010`,
			agentId,
			startedAt: new Date(now - 7 * day),
			endedAt: new Date(now - 6.8 * day),
			status: "compacted",
			tokenCount: 50_000,
			compactionCount: 5,
		},
	];
}

// TODO: Replace with gatewayClient.agent.sessions(agentId)
async function fetchAgentSessions(agentId: string): Promise<AgentSession[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return generateMockSessions(agentId);
}

/**
 * Fetches sessions for a given agent via TanStack Query.
 * Returns sessions list with loading/error state.
 */
export function useAgentSessions(agentId: string) {
	const query = useQuery({
		queryKey: ["agents", agentId, "sessions"],
		queryFn: () => fetchAgentSessions(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	return {
		sessions: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
	};
}
