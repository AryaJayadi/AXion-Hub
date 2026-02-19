import type { AgentSession } from "@/entities/agent";

/**
 * Cross-agent session extends AgentSession with agent metadata,
 * enabling the /sessions page to show sessions across all agents.
 */
export interface CrossAgentSession extends AgentSession {
	agentName: string;
	agentAvatar: string | undefined;
	model: string;
}

/**
 * Detailed session view with aggregated stats.
 */
export interface SessionDetail {
	session: CrossAgentSession;
	summary: SessionSummary;
}

export interface SessionSummary {
	totalTokens: number;
	inputTokens: number;
	outputTokens: number;
	estimatedCost: number;
	duration: number; // milliseconds
	messageCount: number;
	toolCallCount: number;
}

/**
 * A single message in a session transcript (JSONL replay).
 */
export interface TranscriptMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	tokenCount: number;
	toolCalls: TranscriptToolCall[];
	parentMessageId: string | undefined;
	isRetry: boolean;
	metadata:
		| {
				model: string;
				temperature: number;
				stopReason: string;
		  }
		| undefined;
}

/**
 * A tool call within a transcript message.
 */
export interface TranscriptToolCall {
	id: string;
	name: string;
	arguments: Record<string, unknown>;
	output: string | undefined;
	error: string | undefined;
	durationMs: number;
	status: "completed" | "error";
}
