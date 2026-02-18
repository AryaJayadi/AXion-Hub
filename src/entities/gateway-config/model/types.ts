/** Gateway component health status */
export type GatewayComponentStatus = "healthy" | "degraded" | "down";

/** Individual gateway component with health metrics */
export interface GatewayComponent {
	name: string;
	status: GatewayComponentStatus;
	latency?: number | undefined; // ms
	connections?: number | undefined;
	details?: string | undefined;
}

/** Aggregate gateway health summary */
export interface GatewayHealth {
	status: GatewayComponentStatus;
	uptime: number; // seconds
	version: string;
	components: GatewayComponent[];
}

/** Gateway instance in a multi-instance deployment */
export interface GatewayInstance {
	id: string;
	name: string;
	status: GatewayComponentStatus;
	uptime: number; // seconds
	version: string;
	connectedAgents: number;
	components: Record<string, GatewayComponent>;
}

/** Configuration section name literals */
export type ConfigSection =
	| "identity"
	| "sessions"
	| "channels"
	| "models"
	| "compaction"
	| "memorySearch"
	| "security"
	| "plugins"
	| "gateway";

/** Identity configuration section */
export interface IdentityConfig {
	botName: string;
	persona: string;
	greeting: string;
}

/** Sessions configuration section */
export interface SessionsConfig {
	maxDuration: number;
	compactionThreshold: number;
	maxTokens: number;
	branchingEnabled: boolean;
}

/** Channel-specific configuration entry */
export interface ChannelConfig {
	enabled: boolean;
	platform: string;
	settings: Record<string, unknown>;
}

/** Models configuration section */
export interface ModelsConfig {
	providers: Record<string, { apiKey?: string | undefined; baseUrl?: string | undefined }>;
	defaultModel: string;
	maxRetries: number;
}

/** Compaction configuration section */
export interface CompactionConfig {
	enabled: boolean;
	strategy: "summarize" | "truncate" | "sliding-window";
	threshold: number;
}

/** Memory search configuration section */
export interface MemorySearchConfig {
	enabled: boolean;
	vectorModel: string;
	maxResults: number;
	minScore: number;
}

/** Security configuration section */
export interface SecurityConfig {
	authMode: "none" | "token" | "oauth";
	allowedOrigins: string[];
	rateLimiting: {
		enabled: boolean;
		maxRequests: number;
		windowMs: number;
	};
}

/** Plugins configuration section */
export interface PluginsConfig {
	enabled: string[];
	configs: Record<string, Record<string, unknown>>;
}

/** Gateway server configuration section */
export interface GatewayServerConfig {
	port: number;
	dataDir: string;
	logLevel: "debug" | "info" | "warn" | "error";
	cors: {
		enabled: boolean;
		origins: string[];
	};
}

/** Full OpenClaw configuration */
export interface OpenClawConfig {
	identity: IdentityConfig;
	sessions: SessionsConfig;
	channels: Record<string, ChannelConfig>;
	models: ModelsConfig;
	compaction: CompactionConfig;
	memorySearch: MemorySearchConfig;
	security: SecurityConfig;
	plugins: PluginsConfig;
	gateway: GatewayServerConfig;
}

/** Configuration diff entry for tracking changes */
export interface ConfigDiff {
	path: string;
	type: "added" | "removed" | "changed";
	oldValue?: unknown;
	newValue?: unknown;
}
