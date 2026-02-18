"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { FailoverChain } from "@/entities/model-provider/model/types";
import { queryKeys } from "@/shared/lib/query-keys";

const MOCK_FAILOVER_CHAINS: FailoverChain[] = [
	{
		id: "chain-production",
		name: "Production Chain",
		models: [
			{
				id: "fc-1",
				providerId: "provider-anthropic",
				modelId: "claude-sonnet-4",
				modelName: "Claude Sonnet 4",
				providerName: "Anthropic",
				maxRetries: 3,
				timeoutMs: 30000,
			},
			{
				id: "fc-2",
				providerId: "provider-openai",
				modelId: "gpt-4o",
				modelName: "GPT-4o",
				providerName: "OpenAI",
				maxRetries: 2,
				timeoutMs: 30000,
			},
			{
				id: "fc-3",
				providerId: "provider-google",
				modelId: "gemini-2.0-flash",
				modelName: "Gemini 2.0 Flash",
				providerName: "Google",
				maxRetries: 1,
				timeoutMs: 60000,
			},
		],
	},
	{
		id: "chain-fast",
		name: "Fast Chain",
		models: [
			{
				id: "fc-4",
				providerId: "provider-anthropic",
				modelId: "claude-haiku-3.5",
				modelName: "Claude Haiku 3.5",
				providerName: "Anthropic",
				maxRetries: 2,
				timeoutMs: 15000,
			},
			{
				id: "fc-5",
				providerId: "provider-openai",
				modelId: "gpt-4o-mini",
				modelName: "GPT-4o mini",
				providerName: "OpenAI",
				maxRetries: 2,
				timeoutMs: 15000,
			},
		],
	},
];

/** Hook returning all failover chains */
export function useFailoverChains() {
	return useQuery({
		queryKey: queryKeys.models.failover(),
		queryFn: async (): Promise<FailoverChain[]> => MOCK_FAILOVER_CHAINS,
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/** Mutation to create a new failover chain */
export function useCreateFailoverChain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_chain: Omit<FailoverChain, "id">) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.models.failover(),
			});
			toast.success("Failover chain created");
		},
		onError: () => {
			toast.error("Failed to create failover chain");
		},
	});
}

/** Mutation to update/reorder a failover chain */
export function useUpdateFailoverChain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_chain: FailoverChain) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.models.failover(),
			});
			toast.success("Failover chain updated");
		},
		onError: () => {
			toast.error("Failed to update failover chain");
		},
	});
}

/** Mutation to delete a failover chain */
export function useDeleteFailoverChain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_chainId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.models.failover(),
			});
			toast.success("Failover chain deleted");
		},
		onError: () => {
			toast.error("Failed to delete failover chain");
		},
	});
}
