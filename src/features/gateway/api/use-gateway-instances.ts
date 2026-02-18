"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GatewayInstance } from "@/entities/gateway-config";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock gateway instances for development */
const MOCK_INSTANCES: GatewayInstance[] = [
	{
		id: "gw-001",
		name: "Production Gateway",
		status: "healthy",
		uptime: 2592000, // 30 days
		version: "1.4.2",
		connectedAgents: 6,
		components: {
			database: {
				name: "Database",
				status: "healthy",
				latency: 2,
				connections: 12,
				details: "PostgreSQL 16.1 -- all connections healthy",
			},
			redis: {
				name: "Redis",
				status: "healthy",
				latency: 0.4,
				connections: 8,
				details: "Redis 7.2 -- memory usage nominal",
			},
			websocket: {
				name: "WebSocket",
				status: "healthy",
				connections: 47,
				details: "47 active WebSocket connections",
			},
			queue: {
				name: "Queue",
				status: "healthy",
				latency: 1.2,
				details: "BullMQ -- 0 jobs waiting, 3 active",
			},
		},
	},
	{
		id: "gw-002",
		name: "Staging Gateway",
		status: "degraded",
		uptime: 432000, // 5 days
		version: "1.5.0-beta.3",
		connectedAgents: 2,
		components: {
			database: {
				name: "Database",
				status: "healthy",
				latency: 5,
				connections: 4,
				details: "PostgreSQL 16.1 -- healthy",
			},
			redis: {
				name: "Redis",
				status: "degraded",
				latency: 12,
				connections: 3,
				details: "Redis 7.2 -- elevated memory usage (78%)",
			},
			websocket: {
				name: "WebSocket",
				status: "healthy",
				connections: 8,
				details: "8 active WebSocket connections",
			},
		},
	},
];

// TODO: Replace with gatewayClient.getInstances() when wired
async function fetchGatewayInstances(): Promise<GatewayInstance[]> {
	await new Promise((resolve) => setTimeout(resolve, 350));
	return MOCK_INSTANCES;
}

/**
 * Fetches all gateway instances via TanStack Query.
 * staleTime: Infinity prevents refetch from overwriting real-time updates.
 */
export function useGatewayInstances() {
	return useQuery({
		queryKey: queryKeys.gateway.instances(),
		queryFn: fetchGatewayInstances,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

/**
 * Returns a single gateway instance by id from the instances list.
 */
export function useGatewayInstance(id: string) {
	const { data: instances, ...rest } = useGatewayInstances();

	const instance = useMemo(
		() => instances?.find((inst) => inst.id === id) ?? null,
		[instances, id],
	);

	return {
		...rest,
		data: instance,
	};
}
