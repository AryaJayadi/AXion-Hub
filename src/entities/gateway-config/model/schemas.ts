import { z } from "zod/v4";

export const gatewayComponentStatusSchema = z.enum(["healthy", "degraded", "down"]);

export const gatewayComponentSchema = z.object({
	name: z.string(),
	status: gatewayComponentStatusSchema,
	latency: z.number().optional(),
	connections: z.number().optional(),
	details: z.string().optional(),
});

export const gatewayHealthSchema = z
	.object({
		status: gatewayComponentStatusSchema,
		uptime: z.number().min(0),
		version: z.string(),
		components: z.array(gatewayComponentSchema),
	})
	.passthrough();

export const gatewayInstanceSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		status: gatewayComponentStatusSchema,
		uptime: z.number().min(0),
		version: z.string(),
		connectedAgents: z.number().min(0),
		components: z.record(z.string(), gatewayComponentSchema),
	})
	.passthrough();

const identityConfigSchema = z
	.object({
		botName: z.string(),
		persona: z.string(),
		greeting: z.string(),
	})
	.passthrough();

const sessionsConfigSchema = z
	.object({
		maxDuration: z.number(),
		compactionThreshold: z.number(),
		maxTokens: z.number(),
		branchingEnabled: z.boolean(),
	})
	.passthrough();

const channelConfigSchema = z
	.object({
		enabled: z.boolean(),
		platform: z.string(),
		settings: z.record(z.string(), z.unknown()),
	})
	.passthrough();

const modelsConfigSchema = z
	.object({
		providers: z.record(
			z.string(),
			z
				.object({
					apiKey: z.string().optional(),
					baseUrl: z.string().optional(),
				})
				.passthrough(),
		),
		defaultModel: z.string(),
		maxRetries: z.number(),
	})
	.passthrough();

const compactionConfigSchema = z
	.object({
		enabled: z.boolean(),
		strategy: z.enum(["summarize", "truncate", "sliding-window"]),
		threshold: z.number(),
	})
	.passthrough();

const memorySearchConfigSchema = z
	.object({
		enabled: z.boolean(),
		vectorModel: z.string(),
		maxResults: z.number(),
		minScore: z.number(),
	})
	.passthrough();

const securityConfigSchema = z
	.object({
		authMode: z.enum(["none", "token", "oauth"]),
		allowedOrigins: z.array(z.string()),
		rateLimiting: z
			.object({
				enabled: z.boolean(),
				maxRequests: z.number(),
				windowMs: z.number(),
			})
			.passthrough(),
	})
	.passthrough();

const pluginsConfigSchema = z
	.object({
		enabled: z.array(z.string()),
		configs: z.record(z.string(), z.record(z.string(), z.unknown())),
	})
	.passthrough();

const gatewayServerConfigSchema = z
	.object({
		port: z.number(),
		dataDir: z.string(),
		logLevel: z.enum(["debug", "info", "warn", "error"]),
		cors: z
			.object({
				enabled: z.boolean(),
				origins: z.array(z.string()),
			})
			.passthrough(),
	})
	.passthrough();

export const openClawConfigSchema = z
	.object({
		identity: identityConfigSchema,
		sessions: sessionsConfigSchema,
		channels: z.record(z.string(), channelConfigSchema),
		models: modelsConfigSchema,
		compaction: compactionConfigSchema,
		memorySearch: memorySearchConfigSchema,
		security: securityConfigSchema,
		plugins: pluginsConfigSchema,
		gateway: gatewayServerConfigSchema,
	})
	.passthrough();

export const configDiffSchema = z.object({
	path: z.string(),
	type: z.enum(["added", "removed", "changed"]),
	oldValue: z.unknown().optional(),
	newValue: z.unknown().optional(),
});
