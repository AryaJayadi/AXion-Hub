"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Agent } from "@/entities/agent";
import { useAgentStore } from "../model/agent-store";

/** Mock agent data for development until gateway client methods are wired. */
const MOCK_AGENTS: Agent[] = [
	{
		id: "agent-001",
		name: "Atlas",
		description: "Primary code assistant for the frontend team",
		status: "online",
		model: "claude-sonnet-4",
		keyStat: "142 tasks completed",
		contextUsage: 34,
		uptime: 259200, // 3 days
		currentTask: "Reviewing PR #47",
		createdAt: new Date("2026-01-15"),
		lastActive: new Date("2026-02-18T03:30:00Z"),
	},
	{
		id: "agent-002",
		name: "Scout",
		description: "Research agent for library evaluation",
		status: "working",
		model: "claude-sonnet-4",
		keyStat: "28 reports generated",
		contextUsage: 72,
		uptime: 86400, // 1 day
		currentTask: "Comparing auth libraries",
		createdAt: new Date("2026-01-20"),
		lastActive: new Date("2026-02-18T03:45:00Z"),
	},
	{
		id: "agent-003",
		name: "Harbor",
		description: "Customer support frontline agent",
		status: "idle",
		model: "claude-sonnet-4",
		keyStat: "89% satisfaction",
		contextUsage: 12,
		uptime: 172800, // 2 days
		createdAt: new Date("2026-01-25"),
		lastActive: new Date("2026-02-18T02:15:00Z"),
	},
	{
		id: "agent-004",
		name: "Scribe",
		description: "Technical documentation writer",
		status: "online",
		model: "claude-sonnet-4",
		keyStat: "34 docs written",
		contextUsage: 45,
		uptime: 43200, // 12 hours
		currentTask: "Writing API reference",
		createdAt: new Date("2026-02-01"),
		lastActive: new Date("2026-02-18T03:40:00Z"),
	},
	{
		id: "agent-005",
		name: "Prism",
		description: "Data analysis and reporting agent",
		status: "error",
		model: "claude-sonnet-4",
		keyStat: "17 analyses run",
		contextUsage: 91,
		uptime: 7200, // 2 hours
		createdAt: new Date("2026-02-05"),
		lastActive: new Date("2026-02-18T01:00:00Z"),
	},
	{
		id: "agent-006",
		name: "Sentinel",
		description: "Security audit and compliance checker",
		status: "offline",
		model: "claude-sonnet-4",
		keyStat: "6 audits completed",
		contextUsage: 0,
		uptime: 0,
		createdAt: new Date("2026-02-10"),
		lastActive: new Date("2026-02-17T18:00:00Z"),
	},
	{
		id: "agent-007",
		name: "Relay",
		description: "Cross-team communication and routing agent",
		status: "online",
		model: "claude-sonnet-4",
		keyStat: "312 messages routed",
		contextUsage: 22,
		uptime: 345600, // 4 days
		createdAt: new Date("2026-01-18"),
		lastActive: new Date("2026-02-18T03:48:00Z"),
	},
	{
		id: "agent-008",
		name: "Forge",
		description: "CI/CD and deployment automation agent",
		status: "working",
		model: "claude-sonnet-4",
		keyStat: "53 deployments",
		contextUsage: 58,
		uptime: 129600, // 1.5 days
		currentTask: "Running staging deploy",
		createdAt: new Date("2026-02-03"),
		lastActive: new Date("2026-02-18T03:47:00Z"),
	},
];

// TODO: Replace with gatewayClient.getAgent(agentId) when gateway methods are wired
async function fetchAgentDetail(agentId: string): Promise<Agent | null> {
	// Simulate network delay for realistic loading state
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_AGENTS.find((a) => a.id === agentId) ?? null;
}

/**
 * Fetches a single agent by ID via TanStack Query and syncs into Zustand store.
 *
 * Pattern: TanStack Query is the initial loader only. Once data is in Zustand,
 * real-time updates come via WebSocket Event Bus subscriptions.
 * staleTime: Infinity prevents refetch from overwriting WebSocket updates.
 */
export function useAgentDetail(agentId: string) {
	const setAgentDetail = useAgentStore((s) => s.setAgentDetail);

	const query = useQuery({
		queryKey: ["agents", agentId],
		queryFn: () => fetchAgentDetail(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	// Sync TanStack Query data into Zustand store
	useEffect(() => {
		if (query.data) {
			setAgentDetail(query.data);
		}
	}, [query.data, setAgentDetail]);

	// Components read from Zustand for real-time state
	const agent = useAgentStore((s) => s.agentDetail);

	return {
		agent,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
