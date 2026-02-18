"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";

/** Platform types for gateway nodes */
export type NodePlatform = "macOS" | "iOS" | "Android" | "Windows" | "Linux";

/** Connection status for a gateway node */
export type NodeStatus = "connected" | "disconnected";

/** A physical device connected to the gateway */
export interface GatewayNode {
	id: string;
	name: string;
	platform: NodePlatform;
	status: NodeStatus;
	capabilities: string[];
	lastSeen: Date;
	version: string;
}

/** Mock node data representing connected devices */
const MOCK_NODES: GatewayNode[] = [
	{
		id: "node-001",
		name: "Arya's MacBook Pro",
		platform: "macOS",
		status: "connected",
		capabilities: ["filesystem", "terminal", "browser"],
		lastSeen: new Date(Date.now() - 5 * 60_000), // 5 minutes ago
		version: "2.1.0",
	},
	{
		id: "node-002",
		name: "Arya's iPhone 15",
		platform: "iOS",
		status: "connected",
		capabilities: ["notifications", "camera", "location"],
		lastSeen: new Date(Date.now() - 12 * 60_000), // 12 minutes ago
		version: "2.0.5",
	},
	{
		id: "node-003",
		name: "Dev Tablet",
		platform: "Android",
		status: "disconnected",
		capabilities: ["notifications", "camera"],
		lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60_000), // 2 days ago
		version: "1.9.8",
	},
];

// TODO: Replace with gatewayClient.getNodes() when wired
async function fetchNodes(): Promise<GatewayNode[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_NODES;
}

/**
 * Fetches all connected gateway nodes.
 * staleTime: Infinity prevents refetch from overwriting real-time updates.
 */
export function useGatewayNodes() {
	return useQuery({
		queryKey: [...queryKeys.gateway.all, "nodes"],
		queryFn: fetchNodes,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
