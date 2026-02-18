"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChannelRouting } from "@/entities/channel";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock routing rules matching the 5 channels from use-channels.ts */
const MOCK_ROUTING: ChannelRouting[] = [
	{
		channelId: "ch-001",
		agentId: "agent-001",
		rule: "All messages",
		priority: 1,
	},
	{
		channelId: "ch-002",
		agentId: "agent-002",
		rule: "Direct messages",
		priority: 2,
	},
	{
		channelId: "ch-003",
		agentId: "agent-003",
		rule: "Mentions only",
		priority: 3,
	},
	{
		channelId: "ch-004",
		agentId: "agent-001",
		rule: "All messages",
		priority: 4,
	},
	{
		channelId: "ch-005",
		agentId: "agent-001",
		rule: "Direct messages",
		priority: 5,
	},
];

// TODO: Replace with gatewayClient.getRouting() when wired
async function fetchChannelRouting(): Promise<ChannelRouting[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_ROUTING;
}

/**
 * Fetches channel routing rules via TanStack Query.
 * staleTime: Infinity prevents refetch from overwriting real-time updates.
 */
export function useChannelRouting() {
	return useQuery({
		queryKey: queryKeys.channels.routing(),
		queryFn: fetchChannelRouting,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

/**
 * Mutation for updating channel routing configuration.
 * Simulates 500ms delay, invalidates routing queries, shows toast.
 */
export function useUpdateRouting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_data: {
			channelId: string;
			agentId: string;
			rule: string;
		}) => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.channels.routing(),
			});
			toast.success("Routing updated", {
				description: "Channel routing rule saved successfully.",
			});
		},
		onError: () => {
			toast.error("Update failed", {
				description: "Failed to save routing rule.",
			});
		},
	});
}
