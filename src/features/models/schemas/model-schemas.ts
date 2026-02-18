import { z } from "zod/v4";

/** Schema for per-provider configuration */
export const providerConfigSchema = z.object({
	apiKey: z.string().min(1, "API key is required").or(z.literal("")),
	baseUrl: z.string().url("Must be a valid URL").optional(),
	enabled: z.boolean(),
	maxConcurrentRequests: z.number().min(1, "Must be at least 1").optional(),
});

export type ProviderConfig = z.infer<typeof providerConfigSchema>;

/** Schema for a model entry within a failover chain */
export const failoverChainModelSchema = z.object({
	providerId: z.string(),
	modelId: z.string(),
	maxRetries: z.number().min(0, "Min 0").max(10, "Max 10"),
	timeoutMs: z.number().min(1000, "Min 1000ms").max(120000, "Max 120000ms"),
});

/** Schema for a complete failover chain */
export const failoverChainFormSchema = z.object({
	name: z.string().min(1, "Chain name is required"),
	models: z
		.array(failoverChainModelSchema)
		.min(1, "Chain must have at least 1 model"),
});

export type FailoverChainForm = z.infer<typeof failoverChainFormSchema>;
