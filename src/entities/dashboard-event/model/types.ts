export type EventSeverity = "info" | "warning" | "error";

export interface DashboardEvent {
	id: string;
	timestamp: Date;
	type: string;
	source: string;
	agentId?: string | undefined;
	summary: string;
	details?: unknown;
	severity: EventSeverity;
}

export interface EventFilter {
	types?: string[] | undefined;
	sources?: string[] | undefined;
	agentId?: string | undefined;
	severity?: EventSeverity[] | undefined;
	search?: string | undefined;
	dateRange?: { from: Date; to: Date } | undefined;
}

export interface CostSummary {
	tokens: number;
	dollars: number;
	inputTokens: number;
	outputTokens: number;
}

export interface TaskSummary {
	inbox: number;
	assigned: number;
	inProgress: number;
	review: number;
	done: number;
}

export interface AgentCostData {
	agentId: string;
	agentName: string;
	model: string;
	inputTokens: number;
	outputTokens: number;
	cost: number;
}

export type TimePeriod = "session" | "today" | "week";

export interface ServiceHealth {
	id: string;
	name: string;
	type: "gateway" | "provider" | "channel" | "node";
	health: "healthy" | "degraded" | "down";
	metrics?: { uptime: number; latency: number; errorRate: number } | undefined;
	connectedTo: string[];
}
