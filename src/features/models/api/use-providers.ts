"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ModelProvider } from "@/entities/model-provider/model/types";
import { queryKeys } from "@/shared/lib/query-keys";

const MOCK_PROVIDERS: ModelProvider[] = [
	{
		id: "provider-anthropic",
		name: "Anthropic",
		slug: "anthropic",
		status: "connected",
		authMethod: "api_key",
		baseUrl: null,
		models: [
			{
				id: "claude-opus-4",
				name: "Claude Opus 4",
				providerId: "provider-anthropic",
				contextWindow: 200000,
				maxOutputTokens: 32000,
				inputPricePerMTok: 15,
				outputPricePerMTok: 75,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "claude-sonnet-4",
				name: "Claude Sonnet 4",
				providerId: "provider-anthropic",
				contextWindow: 200000,
				maxOutputTokens: 16000,
				inputPricePerMTok: 3,
				outputPricePerMTok: 15,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "claude-haiku-3.5",
				name: "Claude Haiku 3.5",
				providerId: "provider-anthropic",
				contextWindow: 200000,
				maxOutputTokens: 8192,
				inputPricePerMTok: 0.8,
				outputPricePerMTok: 4,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "claude-sonnet-3.5",
				name: "Claude Sonnet 3.5",
				providerId: "provider-anthropic",
				contextWindow: 200000,
				maxOutputTokens: 8192,
				inputPricePerMTok: 3,
				outputPricePerMTok: 15,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "claude-3-opus",
				name: "Claude 3 Opus",
				providerId: "provider-anthropic",
				contextWindow: 200000,
				maxOutputTokens: 4096,
				inputPricePerMTok: 15,
				outputPricePerMTok: 75,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
		],
	},
	{
		id: "provider-openai",
		name: "OpenAI",
		slug: "openai",
		status: "connected",
		authMethod: "api_key",
		baseUrl: null,
		models: [
			{
				id: "gpt-4o",
				name: "GPT-4o",
				providerId: "provider-openai",
				contextWindow: 128000,
				maxOutputTokens: 16384,
				inputPricePerMTok: 2.5,
				outputPricePerMTok: 10,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "gpt-4o-mini",
				name: "GPT-4o mini",
				providerId: "provider-openai",
				contextWindow: 128000,
				maxOutputTokens: 16384,
				inputPricePerMTok: 0.15,
				outputPricePerMTok: 0.6,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "gpt-4-turbo",
				name: "GPT-4 Turbo",
				providerId: "provider-openai",
				contextWindow: 128000,
				maxOutputTokens: 4096,
				inputPricePerMTok: 10,
				outputPricePerMTok: 30,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "o1",
				name: "o1",
				providerId: "provider-openai",
				contextWindow: 200000,
				maxOutputTokens: 100000,
				inputPricePerMTok: 15,
				outputPricePerMTok: 60,
				capabilities: ["function-calling", "json-mode", "streaming"],
			},
		],
	},
	{
		id: "provider-google",
		name: "Google",
		slug: "google",
		status: "disconnected",
		authMethod: "api_key",
		baseUrl: null,
		models: [
			{
				id: "gemini-2.0-flash",
				name: "Gemini 2.0 Flash",
				providerId: "provider-google",
				contextWindow: 1000000,
				maxOutputTokens: 8192,
				inputPricePerMTok: 0.075,
				outputPricePerMTok: 0.3,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "gemini-1.5-pro",
				name: "Gemini 1.5 Pro",
				providerId: "provider-google",
				contextWindow: 2000000,
				maxOutputTokens: 8192,
				inputPricePerMTok: 1.25,
				outputPricePerMTok: 5,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
			{
				id: "gemini-1.5-flash",
				name: "Gemini 1.5 Flash",
				providerId: "provider-google",
				contextWindow: 1000000,
				maxOutputTokens: 8192,
				inputPricePerMTok: 0.075,
				outputPricePerMTok: 0.3,
				capabilities: ["vision", "function-calling", "json-mode", "streaming"],
			},
		],
	},
	{
		id: "provider-ollama",
		name: "Ollama",
		slug: "ollama",
		status: "connected",
		authMethod: "none",
		baseUrl: "http://localhost:11434",
		models: [
			{
				id: "llama-3.1-70b",
				name: "Llama 3.1 70B",
				providerId: "provider-ollama",
				contextWindow: 131072,
				maxOutputTokens: 4096,
				inputPricePerMTok: 0,
				outputPricePerMTok: 0,
				capabilities: ["function-calling", "streaming"],
			},
			{
				id: "mistral-7b",
				name: "Mistral 7B",
				providerId: "provider-ollama",
				contextWindow: 32768,
				maxOutputTokens: 4096,
				inputPricePerMTok: 0,
				outputPricePerMTok: 0,
				capabilities: ["streaming"],
			},
		],
	},
];

/** Hook returning all model providers */
export function useProviders() {
	return useQuery({
		queryKey: queryKeys.models.providers(),
		queryFn: async (): Promise<ModelProvider[]> => MOCK_PROVIDERS,
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/** Hook returning a single provider by slug */
export function useProvider(slug: string) {
	const { data: providers, ...rest } = useProviders();

	const provider = useMemo(
		() => providers?.find((p) => p.slug === slug) ?? null,
		[providers, slug],
	);

	return { data: provider, ...rest };
}

/** Mutation to update provider config */
export function useUpdateProvider() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_config: {
			slug: string;
			apiKey?: string;
			baseUrl?: string;
			enabled?: boolean;
			maxConcurrentRequests?: number;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.models.providers() });
			toast.success("Provider configuration saved");
		},
		onError: () => {
			toast.error("Failed to save configuration");
		},
	});
}

/** Mutation to test provider connection */
export function useTestConnection(slug: string) {
	return useMutation({
		mutationFn: async (): Promise<{
			success: boolean;
			latencyMs: number;
			error?: string;
		}> => {
			await new Promise((resolve) => setTimeout(resolve, 2000));

			if (slug === "google") {
				return { success: false, latencyMs: 0, error: "Invalid API key" };
			}

			const latencyMs = Math.floor(Math.random() * 150) + 50;
			return { success: true, latencyMs };
		},
	});
}
