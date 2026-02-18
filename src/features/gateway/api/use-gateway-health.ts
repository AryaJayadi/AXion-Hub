"use client";

import { useQuery } from "@tanstack/react-query";
import type { GatewayHealth } from "@/entities/gateway-config";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock gateway health data for development */
const MOCK_HEALTH: GatewayHealth = {
	status: "healthy",
	uptime: 2592000, // 30 days
	version: "1.4.2",
	components: [
		{
			name: "Database",
			status: "healthy",
			latency: 2,
			connections: 12,
			details: "PostgreSQL 16.1 -- all connections healthy",
		},
		{
			name: "Redis",
			status: "healthy",
			latency: 0.4,
			connections: 8,
			details: "Redis 7.2 -- memory usage nominal",
		},
		{
			name: "WebSocket",
			status: "healthy",
			connections: 47,
			details: "47 active WebSocket connections",
		},
		{
			name: "Queue",
			status: "healthy",
			latency: 1.2,
			details: "BullMQ -- 0 jobs waiting, 3 active",
		},
	],
};

// TODO: Replace with gatewayClient.getHealth() when wired
async function fetchGatewayHealth(): Promise<GatewayHealth> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_HEALTH;
}

/**
 * Fetches gateway health summary via TanStack Query.
 * staleTime: Infinity prevents refetch from overwriting real-time updates.
 */
export function useGatewayHealth() {
	return useQuery({
		queryKey: queryKeys.gateway.health(),
		queryFn: fetchGatewayHealth,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
