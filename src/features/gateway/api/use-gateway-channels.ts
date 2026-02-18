"use client";

import { useQuery } from "@tanstack/react-query";
import type { Channel } from "@/entities/channel";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock gateway channels -- same data as useChannels (gateway-perspective view) */
const MOCK_GATEWAY_CHANNELS: Channel[] = [
	{
		id: "ch-001",
		name: "Sales WhatsApp",
		platform: "whatsapp",
		status: "connected",
		agentId: "agent-001",
		phoneNumber: "+1 (555) 123-4567",
		connectedAt: new Date("2026-01-15T08:00:00Z"),
		messageCount: 1247,
	},
	{
		id: "ch-002",
		name: "Support Bot",
		platform: "telegram",
		status: "connected",
		agentId: "agent-002",
		username: "@axion_support_bot",
		connectedAt: new Date("2026-01-20T10:30:00Z"),
		messageCount: 892,
	},
	{
		id: "ch-003",
		name: "Dev Community",
		platform: "discord",
		status: "connected",
		agentId: "agent-003",
		username: "AXion-Dev#1234",
		connectedAt: new Date("2026-02-01T14:00:00Z"),
		messageCount: 3451,
	},
	{
		id: "ch-004",
		name: "Team Workspace",
		platform: "slack",
		status: "disconnected",
		agentId: null,
		username: "#axion-workspace",
		connectedAt: null,
		messageCount: 0,
	},
	{
		id: "ch-005",
		name: "Website Chat",
		platform: "web",
		status: "connected",
		agentId: "agent-001",
		connectedAt: new Date("2026-02-10T09:15:00Z"),
		messageCount: 567,
	},
];

// TODO: Replace with gatewayClient methods when wired
async function fetchGatewayChannels(): Promise<Channel[]> {
	await new Promise((resolve) => setTimeout(resolve, 350));
	return MOCK_GATEWAY_CHANNELS;
}

/**
 * Fetches channels from the gateway perspective.
 * Returns same channel data as useChannels but via gateway query key.
 */
export function useGatewayChannels() {
	return useQuery({
		queryKey: [...queryKeys.gateway.all, "channels"],
		queryFn: fetchGatewayChannels,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
