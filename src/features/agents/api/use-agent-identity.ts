"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IDENTITY_FILE_DEFAULTS, IDENTITY_FILE_KEYS } from "../lib/identity-templates";

/**
 * Fetches all 4 identity files for an agent.
 *
 * TODO: Replace with gatewayClient.agent.getIdentityFiles(agentId)
 */
async function fetchIdentityFiles(_agentId: string): Promise<Record<string, string>> {
	// Simulate network delay for realistic loading state
	await new Promise((resolve) => setTimeout(resolve, 250));

	// Return default template content for all files
	const files: Record<string, string> = {};
	for (const key of IDENTITY_FILE_KEYS) {
		const template = IDENTITY_FILE_DEFAULTS[key];
		if (template) {
			files[key] = template.defaultContent;
		}
	}
	return files;
}

/**
 * Saves a single identity file for an agent.
 *
 * TODO: Replace with gatewayClient.agent.saveIdentityFile(agentId, fileKey, content)
 */
async function saveIdentityFile(
	_agentId: string,
	fileKey: string,
	_content: string,
): Promise<void> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 200));

	// eslint-disable-next-line no-console
	console.log(`[mock] Saved identity file "${fileKey}" for agent ${_agentId}`);
}

/**
 * TanStack Query hook for fetching and saving agent identity files.
 *
 * Returns all 4 identity files (SOUL.md, IDENTITY.md, USER.md, AGENTS.md)
 * and a saveFile mutation for persisting changes.
 *
 * Pattern: staleTime Infinity + refetchOnWindowFocus false, matching
 * useAgentDetail pattern. Identity file data does not change via WebSocket.
 */
export function useAgentIdentity(agentId: string) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["agents", agentId, "identity"],
		queryFn: () => fetchIdentityFiles(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	const mutation = useMutation({
		mutationFn: ({ fileKey, content }: { fileKey: string; content: string }) =>
			saveIdentityFile(agentId, fileKey, content),
		onSuccess: (_data, variables) => {
			// Optimistically update the query cache with the saved content
			queryClient.setQueryData<Record<string, string>>(["agents", agentId, "identity"], (prev) =>
				prev ? { ...prev, [variables.fileKey]: variables.content } : prev,
			);
		},
		onError: () => {
			toast.error("Failed to save identity file");
		},
	});

	return {
		files: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		saveFile: (fileKey: string, content: string) => mutation.mutateAsync({ fileKey, content }),
		isSaving: mutation.isPending,
	};
}
