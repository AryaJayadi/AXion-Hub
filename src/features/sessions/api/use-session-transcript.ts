"use client";

import { useQuery } from "@tanstack/react-query";
import type { TranscriptMessage } from "@/entities/session";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Generate a realistic mock transcript for a session.
 * Includes user/assistant exchanges, tool calls, and branching/retry examples.
 */
function generateMockTranscript(): TranscriptMessage[] {
	const baseTime = new Date("2026-02-18T22:30:00Z");
	const messages: TranscriptMessage[] = [];
	let msgIndex = 0;

	function t(offsetSeconds: number): Date {
		return new Date(baseTime.getTime() + offsetSeconds * 1000);
	}

	// System prompt
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "system",
		content:
			"You are a helpful code assistant. You can read files, search the web, and execute code to help the user.",
		timestamp: t(0),
		tokenCount: 42,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// User asks a question
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "user",
		content:
			"Can you analyze the performance of our API endpoints? I need to know which ones are slowest.",
		timestamp: t(5),
		tokenCount: 87,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// Assistant responds with tool calls
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"I'll analyze your API endpoint performance. Let me start by reading the route definitions and checking the recent logs.",
		timestamp: t(8),
		tokenCount: 340,
		toolCalls: [
			{
				id: "tc-001",
				name: "file_read",
				arguments: { path: "src/app/api/routes.ts" },
				output:
					'// API Routes\nexport const routes = [\n  { path: "/api/users", handler: "getUsers", avgMs: 245 },\n  { path: "/api/agents", handler: "getAgents", avgMs: 120 },\n  { path: "/api/sessions", handler: "getSessions", avgMs: 890 },\n  { path: "/api/tasks", handler: "getTasks", avgMs: 340 },\n  { path: "/api/analytics", handler: "getAnalytics", avgMs: 1520 },\n];',
				error: undefined,
				durationMs: 450,
				status: "completed",
			},
			{
				id: "tc-002",
				name: "web_search",
				arguments: { query: "API performance benchmarking best practices 2026" },
				output:
					"1. Use percentile-based metrics (p50, p95, p99) instead of averages\n2. Monitor endpoint-specific latency distributions\n3. Set SLOs per endpoint based on user impact\n4. Use distributed tracing for multi-service calls",
				error: undefined,
				durationMs: 1200,
				status: "completed",
			},
		],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Assistant follow-up with analysis
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"Based on the route definitions, here are the slowest endpoints:\n\n1. **`/api/analytics`** - 1,520ms average (critical)\n2. **`/api/sessions`** - 890ms average (needs optimization)\n3. **`/api/tasks`** - 340ms average (acceptable)\n4. **`/api/users`** - 245ms average (acceptable)\n5. **`/api/agents`** - 120ms average (good)\n\nThe analytics endpoint is significantly slower than the rest. Let me investigate further.",
		timestamp: t(15),
		tokenCount: 520,
		toolCalls: [
			{
				id: "tc-003",
				name: "code_execute",
				arguments: {
					language: "typescript",
					code: "import { analyzeEndpoint } from './perf';\nconst result = await analyzeEndpoint('/api/analytics');\nconsole.log(JSON.stringify(result, null, 2));",
				},
				output:
					'{\n  "endpoint": "/api/analytics",\n  "p50": 980,\n  "p95": 2100,\n  "p99": 4500,\n  "bottleneck": "database aggregation query",\n  "suggestion": "Add materialized view or cache layer"\n}',
				error: undefined,
				durationMs: 3200,
				status: "completed",
			},
		],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// User follow-up
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "user",
		content: "Can you also check if there are any N+1 query issues in the sessions endpoint?",
		timestamp: t(45),
		tokenCount: 72,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// Assistant with tool call error
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content: "Let me check the sessions endpoint handler for N+1 query patterns.",
		timestamp: t(48),
		tokenCount: 280,
		toolCalls: [
			{
				id: "tc-004",
				name: "file_read",
				arguments: { path: "src/app/api/sessions/route.ts" },
				output: undefined,
				error: "ENOENT: no such file or directory, open 'src/app/api/sessions/route.ts'",
				durationMs: 120,
				status: "error",
			},
		],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Retry message (branching)
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"The file wasn't found at the expected path. Let me search for the correct location.",
		timestamp: t(52),
		tokenCount: 350,
		toolCalls: [
			{
				id: "tc-005",
				name: "file_read",
				arguments: { path: "src/features/sessions/api/handler.ts" },
				output:
					'export async function getSessions() {\n  const sessions = await db.query.sessions.findMany();\n  // N+1: fetching agent details for each session individually\n  const enriched = await Promise.all(\n    sessions.map(async (s) => {\n      const agent = await db.query.agents.findFirst({ where: eq(agents.id, s.agentId) });\n      return { ...s, agentName: agent?.name };\n    })\n  );\n  return enriched;\n}',
				error: undefined,
				durationMs: 380,
				status: "completed",
			},
		],
		parentMessageId: `msg-${msgIndex - 1}`,
		isRetry: true,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Follow-up analysis
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"Found it! There is indeed an **N+1 query problem** in the sessions endpoint:\n\n```typescript\n// Current: N+1 pattern (1 query + N agent lookups)\nconst sessions = await db.query.sessions.findMany();\nconst enriched = await Promise.all(\n  sessions.map(async (s) => {\n    const agent = await db.query.agents.findFirst(...);\n    return { ...s, agentName: agent?.name };\n  })\n);\n```\n\n**Fix: Use a JOIN or batch query:**\n```typescript\nconst sessions = await db.query.sessions.findMany({\n  with: { agent: { columns: { name: true } } },\n});\n```\n\nThis reduces N+1 queries to a single query with a JOIN.",
		timestamp: t(60),
		tokenCount: 890,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// User asks for fix
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "user",
		content: "Great analysis! Can you implement the fix and verify it works?",
		timestamp: t(90),
		tokenCount: 65,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// Assistant implements fix
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"I'll implement the fix now and run the performance comparison.",
		timestamp: t(93),
		tokenCount: 1450,
		toolCalls: [
			{
				id: "tc-006",
				name: "code_execute",
				arguments: {
					language: "typescript",
					code: "// Applying fix and benchmarking\nconst before = performance.now();\nawait getSessionsOld();\nconst oldTime = performance.now() - before;\n\nconst before2 = performance.now();\nawait getSessionsNew();\nconst newTime = performance.now() - before2;\n\nconsole.log(`Old: ${oldTime}ms, New: ${newTime}ms, Improvement: ${((1 - newTime/oldTime) * 100).toFixed(1)}%`);",
				},
				output: "Old: 892ms, New: 145ms, Improvement: 83.7%",
				error: undefined,
				durationMs: 2800,
				status: "completed",
			},
		],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Final assistant summary
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"The fix has been applied successfully. Here's the performance improvement:\n\n| Metric | Before | After | Improvement |\n|--------|--------|-------|-------------|\n| Average latency | 892ms | 145ms | **83.7%** |\n| Database queries | N+1 | 1 (JOIN) | **Eliminated** |\n\nThe sessions endpoint is now well within acceptable performance thresholds. I'd also recommend:\n1. Adding a database index on `sessions.agentId`\n2. Implementing response caching for frequently accessed session lists\n3. Monitoring the p95 latency after deployment",
		timestamp: t(100),
		tokenCount: 680,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Another user question
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "user",
		content: "What about the analytics endpoint? That was the slowest one.",
		timestamp: t(120),
		tokenCount: 58,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// Branching retry example -- assistant gives initial response
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"The analytics endpoint bottleneck is the database aggregation query. I recommend creating a materialized view that pre-computes the aggregations on a schedule. This is a common pattern for dashboard-style analytics.",
		timestamp: t(125),
		tokenCount: 420,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Retry of the above with more detail
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"Let me provide a more detailed implementation plan for the analytics endpoint optimization:\n\n1. **Create a materialized view** for the aggregation query\n2. **Set up a refresh schedule** (every 5 minutes)\n3. **Add a cache layer** using Redis for sub-second responses\n4. **Implement stale-while-revalidate** pattern for the API\n\nThis should bring the p50 from 980ms down to under 50ms for cached responses.",
		timestamp: t(130),
		tokenCount: 560,
		toolCalls: [],
		parentMessageId: `msg-${msgIndex - 1}`,
		isRetry: true,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	// Final user message
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "user",
		content: "Perfect, thanks for the thorough analysis! I'll implement these changes.",
		timestamp: t(150),
		tokenCount: 52,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: undefined,
	});

	// Final assistant message
	messages.push({
		id: `msg-${++msgIndex}`,
		role: "assistant",
		content:
			"You're welcome! To summarize the action items:\n\n- [x] Identified slowest endpoints (analytics at 1,520ms, sessions at 890ms)\n- [x] Fixed N+1 query in sessions endpoint (83.7% improvement)\n- [ ] Create materialized view for analytics aggregations\n- [ ] Add Redis cache layer for analytics endpoint\n- [ ] Add database index on `sessions.agentId`\n\nLet me know if you need help implementing any of the remaining items!",
		timestamp: t(155),
		tokenCount: 380,
		toolCalls: [],
		parentMessageId: undefined,
		isRetry: false,
		metadata: {
			model: "claude-sonnet-4",
			temperature: 0.7,
			stopReason: "end_turn",
		},
	});

	return messages;
}

const MOCK_TRANSCRIPT = generateMockTranscript();

async function fetchSessionTranscript(
	_sessionId: string,
): Promise<TranscriptMessage[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_TRANSCRIPT;
}

/**
 * Fetches a session transcript (JSONL message replay).
 */
export function useSessionTranscript(sessionId: string) {
	return useQuery({
		queryKey: queryKeys.sessions.transcript(sessionId),
		queryFn: () => fetchSessionTranscript(sessionId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
