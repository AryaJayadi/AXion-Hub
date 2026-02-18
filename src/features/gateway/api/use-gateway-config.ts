"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OpenClawConfig } from "@/entities/gateway-config";
import { queryKeys } from "@/shared/lib/query-keys";

/** Comprehensive mock OpenClaw configuration with realistic values for all 9 sections */
const MOCK_CONFIG: OpenClawConfig = {
	identity: {
		botName: "AXion",
		persona:
			"You are AXion, a helpful AI assistant that manages development workflows, answers questions, and coordinates tasks across teams.",
		greeting:
			"Hello! I'm AXion, your AI assistant. How can I help you today?",
	},
	sessions: {
		maxDuration: 3600,
		compactionThreshold: 100000,
		maxTokens: 200000,
		branchingEnabled: true,
	},
	channels: {
		whatsapp: {
			enabled: true,
			platform: "whatsapp",
			settings: {
				phoneNumberId: "1234567890",
				businessAccountId: "BA-001",
				webhookVerifyToken: "verify-token-abc",
			},
		},
		telegram: {
			enabled: true,
			platform: "telegram",
			settings: {
				botToken: "tel-bot-token-xyz",
				webhookUrl: "https://gateway.example.com/telegram/webhook",
				allowedChatIds: ["-100123456789"],
			},
		},
	},
	models: {
		providers: {
			anthropic: {
				apiKey: "sk-ant-***",
				baseUrl: "https://api.anthropic.com",
			},
			openai: {
				apiKey: "sk-***",
				baseUrl: "https://api.openai.com/v1",
			},
		},
		defaultModel: "claude-sonnet-4",
		maxRetries: 3,
	},
	compaction: {
		enabled: true,
		strategy: "summarize",
		threshold: 80000,
	},
	memorySearch: {
		enabled: true,
		vectorModel: "text-embedding-3-small",
		maxResults: 10,
		minScore: 0.7,
	},
	security: {
		authMode: "token",
		allowedOrigins: ["*"],
		rateLimiting: {
			enabled: true,
			maxRequests: 100,
			windowMs: 60000,
		},
	},
	plugins: {
		enabled: ["web-search", "code-interpreter"],
		configs: {
			"web-search": {
				maxResults: 5,
				safeSearch: true,
			},
			"code-interpreter": {
				timeout: 30000,
				maxMemoryMb: 512,
			},
		},
	},
	gateway: {
		port: 8080,
		dataDir: "./data",
		logLevel: "info",
		cors: {
			enabled: true,
			origins: ["http://localhost:3000", "https://app.axion-hub.com"],
		},
	},
};

// TODO: Replace with gatewayClient.getConfig() when wired
async function fetchGatewayConfig(): Promise<OpenClawConfig> {
	await new Promise((resolve) => setTimeout(resolve, 400));
	return MOCK_CONFIG;
}

/**
 * Fetches the gateway OpenClaw configuration via TanStack Query.
 * staleTime: Infinity -- config changes only via explicit apply.
 */
export function useGatewayConfig() {
	return useQuery({
		queryKey: queryKeys.gateway.config(),
		queryFn: fetchGatewayConfig,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

// TODO: Replace with gatewayClient.applyConfig() when wired
async function applyConfig(config: OpenClawConfig): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	// Simulate applying config -- in production this sends to gateway
	void config;
}

/**
 * Mutation hook for applying config changes to the gateway.
 * Invalidates the config query on success to refetch fresh state.
 */
export function useApplyConfig() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: applyConfig,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.gateway.config(),
			});
		},
	});
}
