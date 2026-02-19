"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/lib/auth-client";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiKeyEntry {
	id: string;
	name: string | null;
	prefix: string;
	start: string;
	createdAt: Date;
	expiresAt: Date | null;
}

// ---------------------------------------------------------------------------
// Mock data (replaced by real API when backend is wired)
// ---------------------------------------------------------------------------

const MOCK_API_KEYS: ApiKeyEntry[] = [
	{
		id: "key-1",
		name: "CI/CD Pipeline",
		prefix: "axion_",
		start: "a1b2",
		createdAt: new Date("2025-11-01"),
		expiresAt: new Date("2026-05-01"),
	},
	{
		id: "key-2",
		name: "Monitoring Integration",
		prefix: "axion_",
		start: "x9y8",
		createdAt: new Date("2025-12-15"),
		expiresAt: null,
	},
];

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * List API keys for the current user.
 * Returns metadata only -- no raw key values (Stripe show-once pattern).
 */
export function useApiKeys() {
	return useQuery({
		queryKey: queryKeys.settings.apiKeys(),
		queryFn: async (): Promise<ApiKeyEntry[]> => {
			try {
				const { data, error } = await authClient.apiKey.list();
				if (error || !data) throw new Error("Failed to load API keys");

				return (data as Record<string, unknown>[]).map(
					(k: Record<string, unknown>) => ({
						id: (k.id as string) ?? "",
						name: (k.name as string | null) ?? null,
						prefix: (k.prefix as string) ?? "axion_",
						start: (k.start as string) ?? "",
						createdAt: new Date(
							(k.createdAt as string) ?? Date.now(),
						),
						expiresAt: k.expiresAt
							? new Date(k.expiresAt as string)
							: null,
					}),
				);
			} catch {
				// Fall back to mock data if API not available
				return MOCK_API_KEYS;
			}
		},
		staleTime: 30_000,
	});
}

/**
 * Create a new API key.
 * Returns the full raw key value ONCE in the response -- this is the only
 * time the key is accessible in plaintext (Stripe show-once pattern).
 */
export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			name,
			expiresIn,
		}: {
			name: string;
			expiresIn?: number | null;
		}): Promise<{ key: string }> => {
			const opts: Record<string, unknown> = { name };
			if (expiresIn) {
				opts.expiresIn = expiresIn;
			}

			const { data, error } = await authClient.apiKey.create(opts);
			if (error || !data) throw new Error("Failed to create API key");

			return { key: (data as Record<string, unknown>).key as string };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.apiKeys(),
			});
		},
		onError: () => {
			toast.error("Failed to create API key");
		},
	});
}

/**
 * Delete an API key by ID.
 * Uses optimistic removal from the cache.
 */
export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (keyId: string) => {
			const { error } = await authClient.apiKey.delete({ keyId });
			if (error) throw new Error("Failed to delete API key");
		},
		onMutate: async (keyId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.settings.apiKeys(),
			});

			const previous = queryClient.getQueryData<ApiKeyEntry[]>(
				queryKeys.settings.apiKeys(),
			);

			// Optimistic removal
			queryClient.setQueryData<ApiKeyEntry[]>(
				queryKeys.settings.apiKeys(),
				(old) => old?.filter((k) => k.id !== keyId) ?? [],
			);

			return { previous };
		},
		onError: (_err, _keyId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.settings.apiKeys(),
					context.previous,
				);
			}
			toast.error("Failed to delete API key");
		},
		onSuccess: () => {
			toast.success("API key deleted");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.apiKeys(),
			});
		},
	});
}
