import { z } from "zod/v4";

export const providerAuthMethodSchema = z.enum(["api_key", "oauth", "none"]);

export const providerStatusSchema = z.enum(["connected", "disconnected", "error"]);

export const modelSchema = z.object({
	id: z.string(),
	name: z.string(),
	providerId: z.string(),
	contextWindow: z.number().min(0),
	maxOutputTokens: z.number().min(0),
	inputPricePerMTok: z.number().min(0),
	outputPricePerMTok: z.number().min(0),
	capabilities: z.array(z.string()),
});

export const modelProviderSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	status: providerStatusSchema,
	authMethod: providerAuthMethodSchema,
	baseUrl: z.string().nullable(),
	models: z.array(modelSchema),
});

export const failoverModelSchema = z.object({
	id: z.string(),
	providerId: z.string(),
	modelId: z.string(),
	modelName: z.string(),
	providerName: z.string(),
	maxRetries: z.number().min(0),
	timeoutMs: z.number().min(0),
});

export const failoverChainSchema = z.object({
	id: z.string(),
	name: z.string(),
	models: z.array(failoverModelSchema),
});

export const modelUsageSchema = z.object({
	period: z.string(),
	providerId: z.string(),
	modelId: z.string(),
	agentId: z.string().optional(),
	inputTokens: z.number().min(0),
	outputTokens: z.number().min(0),
	cost: z.number().min(0),
	requestCount: z.number().min(0),
});
