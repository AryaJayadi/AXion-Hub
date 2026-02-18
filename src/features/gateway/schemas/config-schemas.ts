import { z } from "zod/v4";
import type { LucideIcon } from "lucide-react";
import {
	User,
	Clock,
	Globe,
	Brain,
	Minimize2,
	Search,
	Shield,
	Plug,
	Radio,
} from "lucide-react";
import type { ConfigSection } from "@/entities/gateway-config";

/** Identity section -- bot name, persona, greeting */
export const identityConfigSchema = z
	.object({
		botName: z.string().min(1, "Bot name is required").max(100, "Bot name must be 100 characters or fewer"),
		persona: z.string().min(1, "Persona is required"),
		greeting: z.string().min(1, "Greeting is required"),
	})
	.passthrough();

/** Sessions section -- duration, token limits, branching */
export const sessionsConfigSchema = z
	.object({
		maxDuration: z.number().min(60, "Minimum duration is 60 seconds"),
		compactionThreshold: z.number().min(1000, "Threshold must be at least 1000"),
		maxTokens: z.number().min(1000, "Max tokens must be at least 1000"),
		branchingEnabled: z.boolean(),
	})
	.passthrough();

/** Channels section -- record of channel configs */
export const channelsConfigSchema = z
	.record(
		z.string(),
		z
			.object({
				enabled: z.boolean(),
				platform: z.string().min(1, "Platform is required"),
				settings: z.record(z.string(), z.unknown()),
			})
			.passthrough(),
	);

/** Models section -- providers, default model, retries */
export const modelsConfigSchema = z
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
		defaultModel: z.string().min(1, "Default model is required"),
		maxRetries: z.number().min(0, "Max retries cannot be negative").max(10, "Max retries cannot exceed 10"),
	})
	.passthrough();

/** Compaction section -- enabled, strategy, threshold */
export const compactionConfigSchema = z
	.object({
		enabled: z.boolean(),
		strategy: z.enum(["summarize", "truncate", "sliding-window"]),
		threshold: z.number().min(1000, "Threshold must be at least 1000"),
	})
	.passthrough();

/** Memory search section -- vector model, result limits */
export const memorySearchConfigSchema = z
	.object({
		enabled: z.boolean(),
		vectorModel: z.string().min(1, "Vector model is required"),
		maxResults: z.number().min(1, "Must return at least 1 result").max(100, "Cannot exceed 100 results"),
		minScore: z.number().min(0, "Score must be 0 or greater").max(1, "Score must be 1 or less"),
	})
	.passthrough();

/** Security section -- auth mode, origins, rate limiting */
export const securityConfigSchema = z
	.object({
		authMode: z.enum(["none", "token", "oauth"]),
		allowedOrigins: z.array(z.string()),
		rateLimiting: z
			.object({
				enabled: z.boolean(),
				maxRequests: z.number().min(1, "Must allow at least 1 request"),
				windowMs: z.number().min(1000, "Window must be at least 1000ms"),
			})
			.passthrough(),
	})
	.passthrough();

/** Plugins section -- enabled list, config records */
export const pluginsConfigSchema = z
	.object({
		enabled: z.array(z.string()),
		configs: z.record(z.string(), z.record(z.string(), z.unknown())),
	})
	.passthrough();

/** Gateway server section -- port, paths, logging, CORS */
export const gatewayConfigSchema = z
	.object({
		port: z.number().min(1, "Port must be at least 1").max(65535, "Port cannot exceed 65535"),
		dataDir: z.string().min(1, "Data directory is required"),
		logLevel: z.enum(["debug", "info", "warn", "error"]),
		cors: z
			.object({
				enabled: z.boolean(),
				origins: z.array(z.string()),
			})
			.passthrough(),
	})
	.passthrough();

/** Config section metadata for building the editor UI */
export interface ConfigSectionMeta {
	id: ConfigSection;
	label: string;
	icon: LucideIcon;
	schema: z.ZodType;
}

/** All 9 config sections with labels, icons, and schemas */
export const CONFIG_SECTIONS: ConfigSectionMeta[] = [
	{ id: "identity", label: "Identity", icon: User, schema: identityConfigSchema },
	{ id: "sessions", label: "Sessions", icon: Clock, schema: sessionsConfigSchema },
	{ id: "channels", label: "Channels", icon: Globe, schema: channelsConfigSchema },
	{ id: "models", label: "Models", icon: Brain, schema: modelsConfigSchema },
	{ id: "compaction", label: "Compaction", icon: Minimize2, schema: compactionConfigSchema },
	{ id: "memorySearch", label: "Memory Search", icon: Search, schema: memorySearchConfigSchema },
	{ id: "security", label: "Security", icon: Shield, schema: securityConfigSchema },
	{ id: "plugins", label: "Plugins", icon: Plug, schema: pluginsConfigSchema },
	{ id: "gateway", label: "Gateway", icon: Radio, schema: gatewayConfigSchema },
];

/** Map from section ID to its Zod schema */
export const SECTION_SCHEMA_MAP: Record<ConfigSection, z.ZodType> = {
	identity: identityConfigSchema,
	sessions: sessionsConfigSchema,
	channels: channelsConfigSchema,
	models: modelsConfigSchema,
	compaction: compactionConfigSchema,
	memorySearch: memorySearchConfigSchema,
	security: securityConfigSchema,
	plugins: pluginsConfigSchema,
	gateway: gatewayConfigSchema,
};
