"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/lib/auth-client";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Active sessions hooks
// ---------------------------------------------------------------------------

/**
 * Fetch active sessions for the current user.
 */
export function useActiveSessions() {
	return useQuery({
		queryKey: queryKeys.settings.security(),
		queryFn: async () => {
			const { data, error } = await authClient.listSessions();
			if (error) throw new Error("Failed to load sessions");
			return data ?? [];
		},
		staleTime: 30_000,
	});
}

/**
 * Revoke a specific session by its token.
 */
export function useRevokeSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (token: string) => {
			const { error } = await authClient.revokeSession({ token });
			if (error) throw new Error("Failed to revoke session");
		},
		onMutate: async (token) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.settings.security(),
			});

			const previous = queryClient.getQueryData(
				queryKeys.settings.security(),
			);

			// Optimistic removal
			queryClient.setQueryData(
				queryKeys.settings.security(),
				(old: Array<{ token: string }> | undefined) =>
					old?.filter((s) => s.token !== token) ?? [],
			);

			return { previous };
		},
		onError: (_err, _token, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.settings.security(),
					context.previous,
				);
			}
			toast.error("Failed to revoke session");
		},
		onSuccess: () => {
			toast.success("Session revoked");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.security(),
			});
		},
	});
}

/**
 * Revoke all sessions except the current one.
 */
export function useRevokeOtherSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const { error } = await authClient.revokeOtherSessions();
			if (error) throw new Error("Failed to revoke other sessions");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.security(),
			});
			toast.success("All other sessions revoked");
		},
		onError: () => {
			toast.error("Failed to revoke other sessions");
		},
	});
}

// ---------------------------------------------------------------------------
// Password change hook
// ---------------------------------------------------------------------------

/**
 * Change the current user's password.
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: async ({
			currentPassword,
			newPassword,
		}: {
			currentPassword: string;
			newPassword: string;
		}) => {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Password changed successfully");
		},
		onError: () => {
			toast.error("Failed to change password. Check your current password.");
		},
	});
}
