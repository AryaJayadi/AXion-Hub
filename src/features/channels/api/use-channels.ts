"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Channel } from "@/entities/channel";
import { queryKeys } from "@/shared/lib/query-keys";
import type { UpdateChannelValues } from "../schemas/channel-schemas";

/** Mock channel data covering all platforms */
const MOCK_CHANNELS: Channel[] = [
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

// TODO: Replace with gatewayClient.getChannels() when wired
async function fetchChannels(): Promise<Channel[]> {
	await new Promise((resolve) => setTimeout(resolve, 350));
	return MOCK_CHANNELS;
}

/**
 * Fetches all connected channels via TanStack Query.
 * staleTime: Infinity prevents refetch from overwriting real-time updates.
 */
export function useChannels() {
	return useQuery({
		queryKey: queryKeys.channels.lists(),
		queryFn: fetchChannels,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

/**
 * Returns a single channel by id from the channels list.
 */
export function useChannel(id: string) {
	const { data: channels, ...rest } = useChannels();

	const channel = useMemo(
		() => channels?.find((ch) => ch.id === id) ?? null,
		[channels, id],
	);

	return {
		...rest,
		data: channel,
	};
}

/**
 * Mutation for updating a channel's configuration.
 * Simulates 500ms delay, invalidates channels queries, shows toast.
 */
export function useUpdateChannel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_data: {
			channelId: string;
			values: UpdateChannelValues;
		}) => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
			toast.success("Channel updated", {
				description: "Channel configuration saved successfully.",
			});
		},
		onError: () => {
			toast.error("Update failed", {
				description: "Failed to save channel configuration.",
			});
		},
	});
}

/** Mock agent list for channel assignment dropdowns */
export const MOCK_AGENT_OPTIONS = [
	{ id: "agent-001", name: "Atlas" },
	{ id: "agent-002", name: "Scout" },
	{ id: "agent-003", name: "Harbor" },
	{ id: "agent-004", name: "Scribe" },
	{ id: "agent-005", name: "Prism" },
] as const;
