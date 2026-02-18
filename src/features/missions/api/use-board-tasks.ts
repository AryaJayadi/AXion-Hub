"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ActivityEntry, Task } from "@/entities/mission";
import { queryKeys } from "@/shared/lib/query-keys";
import { useBoardStore } from "../model/board-store";
import { useTaskStore } from "../model/task-store";

const now = new Date();
const oneDay = 86_400_000;
const oneHour = 3_600_000;

/** Mock tasks distributed across columns with varied priorities */
const MOCK_TASKS: Task[] = [
	// INBOX (2 tasks)
	{
		id: "task-001",
		boardId: "board-general",
		title: "Evaluate new vector DB options for knowledge retrieval",
		description: "Research and compare Pinecone, Weaviate, and Qdrant for agent memory.",
		priority: "medium",
		status: "inbox",
		assignedAgentIds: [],
		reviewerId: undefined,
		tags: ["research", "infrastructure"],
		subtasks: [],
		deliverables: [],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: new Date(now.getTime() + 7 * oneDay),
		createdAt: new Date(now.getTime() - 2 * oneDay),
		updatedAt: new Date(now.getTime() - 2 * oneDay),
		columnOrder: 0,
	},
	{
		id: "task-002",
		boardId: "board-general",
		title: "Draft quarterly performance report",
		description: "Compile agent metrics into a stakeholder-ready report.",
		priority: "low",
		status: "inbox",
		assignedAgentIds: [],
		reviewerId: undefined,
		tags: ["reporting"],
		subtasks: [
			{ id: "sub-001", title: "Gather metrics data", completed: false },
			{ id: "sub-002", title: "Create visualizations", completed: false },
			{ id: "sub-003", title: "Write executive summary", completed: false },
		],
		deliverables: [],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: new Date(now.getTime() + 14 * oneDay),
		createdAt: new Date(now.getTime() - 1 * oneDay),
		updatedAt: new Date(now.getTime() - 1 * oneDay),
		columnOrder: 1,
	},
	// QUEUED (1 task)
	{
		id: "task-003",
		boardId: "board-general",
		title: "Migrate authentication to OAuth2 flow",
		description: "Replace basic auth with OAuth2 PKCE for all agent endpoints.",
		priority: "high",
		status: "queued",
		assignedAgentIds: ["agent-atlas"],
		reviewerId: undefined,
		tags: ["security", "auth"],
		subtasks: [
			{ id: "sub-004", title: "Design OAuth flow", completed: true },
			{ id: "sub-005", title: "Implement token exchange", completed: false },
			{ id: "sub-006", title: "Update documentation", completed: false },
		],
		deliverables: [],
		signOffRequired: true,
		signOffStatus: "pending",
		parentTaskId: undefined,
		dueDate: new Date(now.getTime() + 5 * oneDay),
		createdAt: new Date(now.getTime() - 3 * oneDay),
		updatedAt: new Date(now.getTime() - 1 * oneDay),
		columnOrder: 0,
	},
	// IN PROGRESS (2 tasks -- one with agent actively working)
	{
		id: "task-004",
		boardId: "board-general",
		title: "Refactor data pipeline for streaming ingestion",
		description: "Convert batch processing to real-time streaming with backpressure handling.",
		priority: "critical",
		status: "in_progress",
		assignedAgentIds: ["agent-nova"],
		reviewerId: undefined,
		tags: ["backend", "performance"],
		subtasks: [
			{ id: "sub-007", title: "Design streaming architecture", completed: true },
			{ id: "sub-008", title: "Implement backpressure", completed: true },
			{ id: "sub-009", title: "Add metrics instrumentation", completed: false },
			{ id: "sub-010", title: "Load testing", completed: false },
		],
		deliverables: [],
		signOffRequired: true,
		signOffStatus: "pending",
		parentTaskId: undefined,
		dueDate: new Date(now.getTime() + 3 * oneDay),
		createdAt: new Date(now.getTime() - 5 * oneDay),
		updatedAt: now,
		columnOrder: 0,
	},
	{
		id: "task-005",
		boardId: "board-general",
		title: "Build custom Slack integration channel",
		description: "Create bidirectional Slack integration for agent notifications.",
		priority: "medium",
		status: "in_progress",
		assignedAgentIds: ["agent-scout"],
		reviewerId: undefined,
		tags: ["integrations", "slack"],
		subtasks: [],
		deliverables: [],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: undefined,
		createdAt: new Date(now.getTime() - 4 * oneDay),
		updatedAt: new Date(now.getTime() - 0.5 * oneDay),
		columnOrder: 1,
	},
	// IN REVIEW (1 task)
	{
		id: "task-006",
		boardId: "board-general",
		title: "Implement rate limiting for external API calls",
		description: "Add token bucket rate limiter with per-agent quotas.",
		priority: "high",
		status: "in_review",
		assignedAgentIds: ["agent-atlas"],
		reviewerId: "user-admin",
		tags: ["security", "api"],
		subtasks: [
			{ id: "sub-011", title: "Implement token bucket", completed: true },
			{ id: "sub-012", title: "Add quota configuration", completed: true },
			{ id: "sub-013", title: "Write integration tests", completed: true },
		],
		deliverables: [
			{
				id: "del-001",
				type: "code",
				title: "Rate limiter implementation",
				url: "/src/lib/rate-limiter.ts",
				thumbnailUrl: undefined,
				mimeType: undefined,
				submittedAt: new Date(now.getTime() - 0.5 * oneDay),
				submittedBy: "agent-atlas",
			},
			{
				id: "del-004",
				type: "file",
				title: "Rate limiting analysis report",
				url: "/docs/rate-limit-analysis.pdf",
				thumbnailUrl: undefined,
				mimeType: "application/pdf",
				submittedAt: new Date(now.getTime() - 0.4 * oneDay),
				submittedBy: "agent-atlas",
			},
			{
				id: "del-005",
				type: "link",
				title: "API Rate Limiting Documentation",
				url: "https://docs.example.com/api/rate-limiting",
				thumbnailUrl: undefined,
				mimeType: undefined,
				submittedAt: new Date(now.getTime() - 0.3 * oneDay),
				submittedBy: "agent-atlas",
			},
		],
		signOffRequired: true,
		signOffStatus: "pending",
		parentTaskId: undefined,
		dueDate: new Date(now.getTime() + 1 * oneDay),
		createdAt: new Date(now.getTime() - 6 * oneDay),
		updatedAt: new Date(now.getTime() - 0.5 * oneDay),
		columnOrder: 0,
	},
	// DONE (2 tasks)
	{
		id: "task-007",
		boardId: "board-general",
		title: "Set up CI/CD pipeline for agent deployments",
		description: "GitHub Actions workflow for automated agent builds and deployments.",
		priority: "medium",
		status: "done",
		assignedAgentIds: ["agent-nova"],
		reviewerId: undefined,
		tags: ["devops", "ci-cd"],
		subtasks: [
			{ id: "sub-014", title: "Create build workflow", completed: true },
			{ id: "sub-015", title: "Add deployment step", completed: true },
			{ id: "sub-016", title: "Configure notifications", completed: true },
		],
		deliverables: [
			{
				id: "del-006",
				type: "code",
				title: "CI/CD workflow config",
				url: "/.github/workflows/deploy.yml",
				thumbnailUrl: undefined,
				mimeType: undefined,
				submittedAt: new Date(now.getTime() - 3 * oneDay),
				submittedBy: "agent-nova",
			},
			{
				id: "del-007",
				type: "link",
				title: "Pipeline Dashboard",
				url: "https://github.com/org/repo/actions",
				thumbnailUrl: undefined,
				mimeType: undefined,
				submittedAt: new Date(now.getTime() - 2.5 * oneDay),
				submittedBy: "agent-nova",
			},
		],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: undefined,
		createdAt: new Date(now.getTime() - 10 * oneDay),
		updatedAt: new Date(now.getTime() - 2 * oneDay),
		columnOrder: 0,
	},
	{
		id: "task-008",
		boardId: "board-general",
		title: "Design agent communication protocol spec",
		description: "Document the inter-agent messaging format and routing rules.",
		priority: "low",
		status: "done",
		assignedAgentIds: ["agent-scout"],
		reviewerId: undefined,
		tags: ["documentation", "protocol"],
		subtasks: [],
		deliverables: [
			{
				id: "del-002",
				type: "file",
				title: "Protocol specification v1.0",
				url: "/docs/protocol-spec.md",
				thumbnailUrl: undefined,
				mimeType: "text/markdown",
				submittedAt: new Date(now.getTime() - 3 * oneDay),
				submittedBy: "agent-scout",
			},
		],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: undefined,
		createdAt: new Date(now.getTime() - 12 * oneDay),
		updatedAt: new Date(now.getTime() - 3 * oneDay),
		columnOrder: 1,
	},
	// ARCHIVED (1 task)
	{
		id: "task-009",
		boardId: "board-general",
		title: "Legacy monitoring dashboard cleanup",
		description: "Remove deprecated monitoring endpoints and old dashboard code.",
		priority: "low",
		status: "archived",
		assignedAgentIds: [],
		reviewerId: undefined,
		tags: ["cleanup"],
		subtasks: [],
		deliverables: [],
		signOffRequired: false,
		signOffStatus: undefined,
		parentTaskId: undefined,
		dueDate: undefined,
		createdAt: new Date(now.getTime() - 30 * oneDay),
		updatedAt: new Date(now.getTime() - 15 * oneDay),
		columnOrder: 0,
	},
];

/** Mock activity entries for tasks beyond inbox */
const MOCK_ACTIVITY_ENTRIES: ActivityEntry[] = [
	// task-003 (queued) -- created + status change + assignment
	{
		id: "act-001",
		taskId: "task-003",
		type: "status_change",
		summary: "Created task",
		timestamp: new Date(now.getTime() - 3 * oneDay),
		actorId: "user-admin",
		actorType: "system",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-002",
		taskId: "task-003",
		type: "status_change",
		summary: "Changed status to Queued",
		timestamp: new Date(now.getTime() - 2.5 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-003",
		taskId: "task-003",
		type: "assignment",
		summary: "Assigned to agent-atlas",
		timestamp: new Date(now.getTime() - 2 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	// task-004 (in_progress) -- full lifecycle with agent detail
	{
		id: "act-004",
		taskId: "task-004",
		type: "status_change",
		summary: "Created task",
		timestamp: new Date(now.getTime() - 5 * oneDay),
		actorId: "user-admin",
		actorType: "system",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-005",
		taskId: "task-004",
		type: "assignment",
		summary: "Assigned to agent-nova",
		timestamp: new Date(now.getTime() - 4.5 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-006",
		taskId: "task-004",
		type: "status_change",
		summary: "Changed status to In Progress",
		timestamp: new Date(now.getTime() - 4 * oneDay),
		actorId: "agent-nova",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-007",
		taskId: "task-004",
		type: "agent_detail",
		summary: "Agent processing: analyzing streaming architecture patterns",
		timestamp: new Date(now.getTime() - 3 * oneDay),
		actorId: "agent-nova",
		actorType: "agent",
		details: undefined,
		agentDetails: [
			{
				type: "tool_call",
				content: "search_codebase({ query: 'batch processing pipeline', scope: 'src/services' })",
				timestamp: new Date(now.getTime() - 3 * oneDay),
			},
			{
				type: "reasoning",
				content: "The current batch pipeline processes records in chunks of 1000. Converting to streaming requires implementing backpressure to prevent memory exhaustion during high-throughput periods.",
				timestamp: new Date(now.getTime() - 3 * oneDay + 5000),
			},
			{
				type: "output",
				content: "Identified 3 batch processing endpoints. Proposed streaming architecture with Transform streams and configurable high-water mark.",
				timestamp: new Date(now.getTime() - 3 * oneDay + 10000),
			},
		],
	},
	{
		id: "act-008",
		taskId: "task-004",
		type: "comment",
		summary: "Backpressure implementation complete. Starting metrics instrumentation next.",
		timestamp: new Date(now.getTime() - 1 * oneDay),
		actorId: "agent-nova",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	// task-005 (in_progress) -- shorter lifecycle
	{
		id: "act-009",
		taskId: "task-005",
		type: "status_change",
		summary: "Created task",
		timestamp: new Date(now.getTime() - 4 * oneDay),
		actorId: "user-admin",
		actorType: "system",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-010",
		taskId: "task-005",
		type: "assignment",
		summary: "Assigned to agent-scout",
		timestamp: new Date(now.getTime() - 3.5 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-011",
		taskId: "task-005",
		type: "status_change",
		summary: "Changed status to In Progress",
		timestamp: new Date(now.getTime() - 3 * oneDay),
		actorId: "agent-scout",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-012",
		taskId: "task-005",
		type: "agent_detail",
		summary: "Agent working: setting up Slack webhook integration",
		timestamp: new Date(now.getTime() - 2 * oneDay),
		actorId: "agent-scout",
		actorType: "agent",
		details: undefined,
		agentDetails: [
			{
				type: "tool_call",
				content: "create_webhook({ platform: 'slack', events: ['message', 'reaction'], channel: '#agent-notifications' })",
				timestamp: new Date(now.getTime() - 2 * oneDay),
			},
			{
				type: "output",
				content: "Webhook created successfully. Listening for message and reaction events on #agent-notifications.",
				timestamp: new Date(now.getTime() - 2 * oneDay + 3000),
			},
		],
	},
	// task-006 (in_review) -- full lifecycle with deliverable
	{
		id: "act-013",
		taskId: "task-006",
		type: "status_change",
		summary: "Created task",
		timestamp: new Date(now.getTime() - 6 * oneDay),
		actorId: "user-admin",
		actorType: "system",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-014",
		taskId: "task-006",
		type: "assignment",
		summary: "Assigned to agent-atlas",
		timestamp: new Date(now.getTime() - 5.5 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-015",
		taskId: "task-006",
		type: "status_change",
		summary: "Changed status to In Progress",
		timestamp: new Date(now.getTime() - 5 * oneDay),
		actorId: "agent-atlas",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-016",
		taskId: "task-006",
		type: "agent_detail",
		summary: "Agent processing: implementing token bucket algorithm",
		timestamp: new Date(now.getTime() - 3 * oneDay),
		actorId: "agent-atlas",
		actorType: "agent",
		details: undefined,
		agentDetails: [
			{
				type: "reasoning",
				content: "Token bucket is preferred over leaky bucket for API rate limiting because it allows burst handling while maintaining average rate limits.",
				timestamp: new Date(now.getTime() - 3 * oneDay),
			},
			{
				type: "tool_call",
				content: "write_file({ path: 'src/lib/rate-limiter.ts', content: 'export class TokenBucket { ... }' })",
				timestamp: new Date(now.getTime() - 3 * oneDay + 5000),
			},
			{
				type: "output",
				content: "Token bucket rate limiter implemented with configurable refill rate and burst capacity.",
				timestamp: new Date(now.getTime() - 3 * oneDay + 10000),
			},
		],
	},
	{
		id: "act-017",
		taskId: "task-006",
		type: "deliverable",
		summary: "Submitted deliverable: Rate limiter implementation",
		timestamp: new Date(now.getTime() - 0.5 * oneDay),
		actorId: "agent-atlas",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-018",
		taskId: "task-006",
		type: "status_change",
		summary: "Changed status to In Review",
		timestamp: new Date(now.getTime() - 0.5 * oneDay),
		actorId: "agent-atlas",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
	// task-007 (done) -- completed lifecycle
	{
		id: "act-019",
		taskId: "task-007",
		type: "status_change",
		summary: "Created task",
		timestamp: new Date(now.getTime() - 10 * oneDay),
		actorId: "user-admin",
		actorType: "system",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-020",
		taskId: "task-007",
		type: "assignment",
		summary: "Assigned to agent-nova",
		timestamp: new Date(now.getTime() - 9 * oneDay),
		actorId: "user-admin",
		actorType: "user",
		details: undefined,
		agentDetails: undefined,
	},
	{
		id: "act-021",
		taskId: "task-007",
		type: "status_change",
		summary: "Changed status to Done",
		timestamp: new Date(now.getTime() - 2 * oneDay),
		actorId: "agent-nova",
		actorType: "agent",
		details: undefined,
		agentDetails: undefined,
	},
];

/** Get activity entries for a specific task */
export function getActivityEntriesForTask(
	taskId: string,
): ActivityEntry[] {
	return MOCK_ACTIVITY_ENTRIES.filter((e) => e.taskId === taskId);
}

/**
 * Column ID to status mapping for distributing tasks
 */
const STATUS_TO_COLUMN: Record<string, string> = {
	inbox: "col-inbox",
	queued: "col-queued",
	in_progress: "col-in-progress",
	in_review: "col-in-review",
	done: "col-done",
	archived: "col-archived",
};

async function fetchBoardTasks(_boardId: string): Promise<Task[]> {
	// Simulate API latency
	await new Promise((r) => setTimeout(r, 300));
	return MOCK_TASKS;
}

export function useBoardTasks(boardId: string) {
	const setTasks = useTaskStore((s) => s.setTasks);
	const setTaskOrder = useBoardStore((s) => s.setTaskOrder);

	const query = useQuery({
		queryKey: queryKeys.tasks.byBoard(boardId),
		queryFn: () => fetchBoardTasks(boardId),
		staleTime: Number.POSITIVE_INFINITY, // WebSocket handles freshness
		enabled: !!boardId,
	});

	useEffect(() => {
		if (query.data) {
			setTasks(query.data);

			// Distribute tasks into columns by status
			const columnMap: Record<string, string[]> = {};
			for (const task of query.data) {
				const colId = STATUS_TO_COLUMN[task.status];
				if (colId) {
					if (!columnMap[colId]) {
						columnMap[colId] = [];
					}
					columnMap[colId].push(task.id);
				}
			}

			// Set task ordering per column
			for (const [colId, taskIds] of Object.entries(columnMap)) {
				setTaskOrder(colId, taskIds);
			}
		}
	}, [query.data, setTasks, setTaskOrder]);

	return {
		tasks: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
	};
}
