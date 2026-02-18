"use client";

import { useQuery } from "@tanstack/react-query";
import type { ServiceHealth } from "@/entities/dashboard-event";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Mock service health data with 8 services forming a realistic dependency graph.
 *
 * Topology:
 *   gateway -> provider-anthropic, provider-openai
 *   gateway -> channel-slack, channel-discord, channel-web
 *   provider-anthropic -> node-exec
 *   provider-openai -> node-exec
 *   node-exec -> node-storage
 */
const MOCK_SERVICES: ServiceHealth[] = [
	{
		id: "gateway",
		name: "API Gateway",
		type: "gateway",
		health: "healthy",
		metrics: { uptime: 0.999, latency: 12, errorRate: 0.001 },
		connectedTo: [
			"provider-anthropic",
			"provider-openai",
			"channel-slack",
			"channel-discord",
			"channel-web",
		],
	},
	{
		id: "provider-anthropic",
		name: "Anthropic Provider",
		type: "provider",
		health: "healthy",
		metrics: { uptime: 0.998, latency: 340, errorRate: 0.005 },
		connectedTo: ["node-exec"],
	},
	{
		id: "provider-openai",
		name: "OpenAI Provider",
		type: "provider",
		health: "degraded",
		metrics: { uptime: 0.985, latency: 890, errorRate: 0.032 },
		connectedTo: ["node-exec"],
	},
	{
		id: "channel-slack",
		name: "Slack Channel",
		type: "channel",
		health: "healthy",
		metrics: { uptime: 0.997, latency: 45, errorRate: 0.002 },
		connectedTo: [],
	},
	{
		id: "channel-discord",
		name: "Discord Channel",
		type: "channel",
		health: "healthy",
		metrics: { uptime: 0.996, latency: 62, errorRate: 0.003 },
		connectedTo: [],
	},
	{
		id: "channel-web",
		name: "Web Channel",
		type: "channel",
		health: "down",
		metrics: { uptime: 0.87, latency: 0, errorRate: 0.15 },
		connectedTo: [],
	},
	{
		id: "node-exec",
		name: "Execution Node",
		type: "node",
		health: "healthy",
		metrics: { uptime: 0.999, latency: 8, errorRate: 0.001 },
		connectedTo: ["node-storage"],
	},
	{
		id: "node-storage",
		name: "Storage Node",
		type: "node",
		health: "healthy",
		metrics: { uptime: 0.9999, latency: 3, errorRate: 0.0005 },
		connectedTo: [],
	},
];

// TODO: Replace with real API call when gateway health endpoint is available
async function fetchServiceHealth(): Promise<ServiceHealth[]> {
	await new Promise((resolve) => setTimeout(resolve, 350));
	return MOCK_SERVICES;
}

/**
 * TanStack Query hook for service health data.
 *
 * staleTime: Infinity -- real-time updates will come via EventBus subscriptions.
 */
export function useServiceHealth() {
	return useQuery({
		queryKey: queryKeys.gateway.health(),
		queryFn: fetchServiceHealth,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
