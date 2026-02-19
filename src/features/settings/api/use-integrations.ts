"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Integration {
	id: string;
	name: string;
	icon: string;
	connected: boolean;
	lastSynced: Date | null;
	description: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_INTEGRATIONS: Integration[] = [
	{
		id: "github",
		name: "GitHub",
		icon: "Github",
		connected: true,
		lastSynced: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
		description:
			"Connect repositories for code review, PR management, and commit tracking.",
	},
	{
		id: "linear",
		name: "Linear",
		icon: "Trello",
		connected: false,
		lastSynced: null,
		description:
			"Sync issues and projects for seamless task management integration.",
	},
	{
		id: "jira",
		name: "Jira",
		icon: "Briefcase",
		connected: false,
		lastSynced: null,
		description:
			"Connect Jira projects for issue tracking and sprint management.",
	},
];

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch integration statuses.
 */
export function useIntegrations() {
	return useQuery({
		queryKey: queryKeys.settings.integrations(),
		queryFn: async (): Promise<Integration[]> => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_INTEGRATIONS;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/**
 * Mutation stub for connecting an integration (OAuth flow placeholder).
 */
export function useConnectIntegration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (integrationId: string): Promise<string> => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return integrationId;
		},
		onSuccess: (_data, integrationId) => {
			toast.success(
				`OAuth flow would start here for ${integrationId}. Connection simulated.`,
			);
			// Optimistically update the integration status
			queryClient.setQueryData<Integration[]>(
				queryKeys.settings.integrations(),
				(old) =>
					old?.map((i) =>
						i.id === integrationId
							? { ...i, connected: true, lastSynced: new Date() }
							: i,
					),
			);
		},
		onError: () => {
			toast.error("Failed to connect integration");
		},
	});
}

/**
 * Mutation stub for disconnecting an integration with optimistic status toggle.
 */
export function useDisconnectIntegration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (integrationId: string): Promise<string> => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return integrationId;
		},
		onMutate: async (integrationId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.settings.integrations(),
			});

			// Snapshot previous value
			const previous = queryClient.getQueryData<Integration[]>(
				queryKeys.settings.integrations(),
			);

			// Optimistically update
			queryClient.setQueryData<Integration[]>(
				queryKeys.settings.integrations(),
				(old) =>
					old?.map((i) =>
						i.id === integrationId
							? { ...i, connected: false, lastSynced: null }
							: i,
					),
			);

			return { previous };
		},
		onSuccess: (_data, integrationId) => {
			toast.success(`Disconnected ${integrationId}`);
		},
		onError: (_err, _id, context) => {
			// Rollback on error
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.settings.integrations(),
					context.previous,
				);
			}
			toast.error("Failed to disconnect integration");
		},
	});
}
