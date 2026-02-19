"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";
import type { NotificationPrefsFormValues } from "../schemas/settings-schemas";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATION_PREFS: NotificationPrefsFormValues = {
	emailEnabled: true,
	webhookEnabled: false,
	webhookUrl: "",
	slackEnabled: false,
	slackWebhookUrl: "",
	discordEnabled: false,
	discordWebhookUrl: "",
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch notification preferences.
 */
export function useNotificationPrefs() {
	return useQuery({
		queryKey: queryKeys.settings.notifications(),
		queryFn: async (): Promise<NotificationPrefsFormValues> => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_NOTIFICATION_PREFS;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/**
 * Mutation hook for saving notification preferences.
 */
export function useSaveNotificationPrefs() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			prefs: NotificationPrefsFormValues,
		): Promise<NotificationPrefsFormValues> => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return prefs;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.settings.notifications(), data);
			toast.success("Notification preferences saved");
		},
		onError: () => {
			toast.error("Failed to save notification preferences");
		},
	});
}
