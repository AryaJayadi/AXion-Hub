"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionDetail, CrossAgentSession } from "@/entities/session";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock session detail lookup keyed by sessionId. */
const MOCK_SESSION_MAP: Record<string, CrossAgentSession> = {
	"sess-001": {
		id: "sess-001",
		agentId: "agent-001",
		agentName: "Research Agent",
		agentAvatar: undefined,
		model: "claude-sonnet-4",
		startedAt: new Date("2026-02-19T01:00:00Z"),
		endedAt: undefined,
		tokenCount: 12450,
		compactionCount: 0,
		status: "active",
	},
	"sess-002": {
		id: "sess-002",
		agentId: "agent-002",
		agentName: "Code Agent",
		agentAvatar: undefined,
		model: "claude-sonnet-4",
		startedAt: new Date("2026-02-18T22:30:00Z"),
		endedAt: new Date("2026-02-19T00:15:00Z"),
		tokenCount: 34200,
		compactionCount: 1,
		status: "ended",
	},
	"sess-003": {
		id: "sess-003",
		agentId: "agent-003",
		agentName: "Data Agent",
		agentAvatar: undefined,
		model: "claude-opus-4",
		startedAt: new Date("2026-02-18T20:00:00Z"),
		endedAt: new Date("2026-02-18T21:45:00Z"),
		tokenCount: 8730,
		compactionCount: 0,
		status: "ended",
	},
	"sess-004": {
		id: "sess-004",
		agentId: "agent-004",
		agentName: "Writer Agent",
		agentAvatar: undefined,
		model: "claude-sonnet-4",
		startedAt: new Date("2026-02-18T18:00:00Z"),
		endedAt: new Date("2026-02-18T19:30:00Z"),
		tokenCount: 15600,
		compactionCount: 0,
		status: "ended",
	},
};

/** Derive realistic summary from session data. */
function deriveSummary(session: CrossAgentSession): SessionDetail["summary"] {
	const totalTokens = session.tokenCount;
	const inputTokens = Math.round(totalTokens * 0.6);
	const outputTokens = totalTokens - inputTokens;

	// Rough cost estimate: $3 per million input tokens, $15 per million output tokens
	const estimatedCost =
		(inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;

	const endTime = session.endedAt ? session.endedAt.getTime() : Date.now();
	const duration = endTime - session.startedAt.getTime();

	// Derive message count from tokens (~300 tokens per message average)
	const messageCount = Math.max(5, Math.round(totalTokens / 300));
	const toolCallCount = Math.max(1, Math.round(messageCount * 0.2));

	return {
		totalTokens,
		inputTokens,
		outputTokens,
		estimatedCost: Math.round(estimatedCost * 100) / 100,
		duration,
		messageCount,
		toolCallCount,
	};
}

async function fetchSessionDetail(
	sessionId: string,
): Promise<SessionDetail | null> {
	await new Promise((resolve) => setTimeout(resolve, 250));

	const session = MOCK_SESSION_MAP[sessionId];
	if (!session) return null;

	return {
		session,
		summary: deriveSummary(session),
	};
}

/**
 * Fetches session detail with summary stats.
 * Returns null data if session not found.
 */
export function useSessionDetail(sessionId: string) {
	return useQuery({
		queryKey: queryKeys.sessions.detail(sessionId),
		queryFn: () => fetchSessionDetail(sessionId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
