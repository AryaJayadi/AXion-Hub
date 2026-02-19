"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
	GeneralSettings,
	ProfileSettings,
} from "../model/settings-types";
import { authClient } from "@/features/auth/lib/auth-client";

// ---------------------------------------------------------------------------
// Mock data (replaced by real API when backend is wired)
// ---------------------------------------------------------------------------

const MOCK_GENERAL_SETTINGS: GeneralSettings = {
	appName: "AXion Hub",
	timezone: "UTC",
	language: "en",
};

// ---------------------------------------------------------------------------
// General settings hooks
// ---------------------------------------------------------------------------

/**
 * Fetch general workspace settings.
 */
export function useGeneralSettings() {
	return useQuery({
		queryKey: queryKeys.settings.general(),
		queryFn: async (): Promise<GeneralSettings> => {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_GENERAL_SETTINGS;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/**
 * Mutation hook for saving general settings.
 */
export function useSaveGeneralSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (settings: GeneralSettings): Promise<GeneralSettings> => {
			// Simulate API save
			await new Promise((resolve) => setTimeout(resolve, 500));
			return settings;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.settings.general(), data);
		},
	});
}

// ---------------------------------------------------------------------------
// Profile settings hooks
// ---------------------------------------------------------------------------

/**
 * Derive profile settings from the current auth session.
 */
export function useProfileSettings(): {
	data: ProfileSettings | undefined;
	isLoading: boolean;
	error: Error | null;
} {
	const session = authClient.useSession();

	if (session.isPending) {
		return { data: undefined, isLoading: true, error: null };
	}

	if (session.error) {
		return {
			data: undefined,
			isLoading: false,
			error: session.error as Error,
		};
	}

	const user = session.data?.user;
	return {
		data: user
			? {
					displayName: user.name,
					avatar: user.image ?? null,
				}
			: undefined,
		isLoading: false,
		error: null,
	};
}
