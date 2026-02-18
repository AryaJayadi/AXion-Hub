export type AgentStatus = "online" | "idle" | "working" | "error" | "offline";

export interface Agent {
	id: string;
	name: string;
	description: string;
	avatar?: string | undefined;
	status: AgentStatus;
	model: string;
	keyStat: string;
	contextUsage: number; // 0-100 percentage
	uptime: number; // seconds
	currentTask?: string | undefined;
	createdAt: Date;
	lastActive: Date;
}

export interface AgentSession {
	id: string;
	agentId: string;
	startedAt: Date;
	endedAt?: Date | undefined;
	tokenCount: number;
	compactionCount: number;
	status: "active" | "compacted" | "ended";
}

export interface AgentMemoryFile {
	name: string;
	path: string;
	content: string;
	lastModified: Date;
}

export interface AgentSkill {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	source: "built-in" | "clawhub" | "custom";
}

export interface AgentTool {
	name: string;
	description: string;
	allowed: boolean;
	elevated: boolean;
}

export interface AgentLogEntry {
	id: string;
	timestamp: Date;
	eventType: "tool_call" | "message" | "error" | "status_change" | "compaction";
	summary: string;
	details?: unknown;
	status: "success" | "error" | "pending";
}

export interface AgentMetrics {
	tokenUsage: { date: string; tokens: number }[];
	costBreakdown: { date: string; cost: number }[];
	tasksCompleted: { date: string; count: number }[];
	responseTimes: { date: string; avgMs: number }[];
}

export interface AgentIdentityFiles {
	soul: string;
	identity: string;
	user: string;
	agents: string;
}

export interface AgentTemplate {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: string;
	basics: {
		name: string;
		description: string;
		avatar?: string | undefined;
	};
	modelConfig: {
		model: string;
		temperature: number;
		maxTokens: number;
	};
	identity: AgentIdentityFiles;
	skillsTools: {
		skills: string[];
		tools: string[];
		deniedTools: string[];
	};
	sandbox: {
		enabled: boolean;
		image: string;
		workspacePath: string;
	};
	channels: {
		bindings: { channelId: string; rule: string }[];
	};
}
