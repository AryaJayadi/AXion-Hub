/** Provider authentication method */
export type ProviderAuthMethod = "api_key" | "oauth" | "none";

/** Provider connection status */
export type ProviderStatus = "connected" | "disconnected" | "error";

/** Supported provider slug identifiers */
export type ProviderSlug = "anthropic" | "openai" | "google" | "ollama" | string;

/** An AI model provider (e.g., Anthropic, OpenAI) */
export interface ModelProvider {
	id: string;
	name: string;
	slug: ProviderSlug;
	status: ProviderStatus;
	authMethod: ProviderAuthMethod;
	baseUrl: string | null;
	models: Model[];
}

/** An individual AI model offered by a provider */
export interface Model {
	id: string;
	name: string;
	providerId: string;
	contextWindow: number;
	maxOutputTokens: number;
	inputPricePerMTok: number; // price per million input tokens
	outputPricePerMTok: number; // price per million output tokens
	capabilities: string[];
}

/** A failover chain defining model fallback order */
export interface FailoverChain {
	id: string;
	name: string;
	models: FailoverModel[];
}

/** A model entry within a failover chain */
export interface FailoverModel {
	id: string;
	providerId: string;
	modelId: string;
	modelName: string;
	providerName: string;
	maxRetries: number;
	timeoutMs: number;
}

/** Token usage and cost tracking per model/agent/period */
export interface ModelUsage {
	period: string;
	providerId: string;
	modelId: string;
	agentId?: string | undefined;
	inputTokens: number;
	outputTokens: number;
	cost: number;
	requestCount: number;
}
