"use client";

import { useQuery } from "@tanstack/react-query";
import type { Deliverable } from "@/entities/mission";
import { queryKeys } from "@/shared/lib/query-keys";

/** Extended deliverable type with task and agent context */
export interface TaskDeliverable extends Deliverable {
	taskId: string;
	taskTitle: string;
	taskStatus: string;
	agentId: string;
	agentName: string;
}

export interface DeliverableFilters {
	taskStatus?: string | undefined;
	agentId?: string | undefined;
}

/** Mock deliverables across multiple tasks and agents */
const MOCK_DELIVERABLES: TaskDeliverable[] = [
	// Research Summary task - Research Agent
	{
		id: "wdel-001",
		type: "file",
		title: "report.md",
		url: "/workspace/shared/report.md",
		thumbnailUrl: undefined,
		mimeType: "text/markdown",
		submittedAt: new Date("2026-02-18T10:30:00Z"),
		submittedBy: "Scout",
		taskId: "task-rs-001",
		taskTitle: "Research Summary",
		taskStatus: "done",
		agentId: "agent-002",
		agentName: "Scout",
	},
	{
		id: "wdel-002",
		type: "file",
		title: "sources.json",
		url: "/workspace/shared/sources.json",
		thumbnailUrl: undefined,
		mimeType: "application/json",
		submittedAt: new Date("2026-02-18T10:35:00Z"),
		submittedBy: "Scout",
		taskId: "task-rs-001",
		taskTitle: "Research Summary",
		taskStatus: "done",
		agentId: "agent-002",
		agentName: "Scout",
	},
	// Data Pipeline task - Data Agent (Prism)
	{
		id: "wdel-003",
		type: "code",
		title: "pipeline.py",
		url: "/workspace/agent-005/pipeline.py",
		thumbnailUrl: undefined,
		mimeType: "text/x-python",
		submittedAt: new Date("2026-02-18T14:00:00Z"),
		submittedBy: "Prism",
		taskId: "task-dp-002",
		taskTitle: "Data Pipeline",
		taskStatus: "in_review",
		agentId: "agent-005",
		agentName: "Prism",
	},
	{
		id: "wdel-004",
		type: "file",
		title: "output.csv",
		url: "/workspace/agent-005/output.csv",
		thumbnailUrl: undefined,
		mimeType: "text/csv",
		submittedAt: new Date("2026-02-18T14:05:00Z"),
		submittedBy: "Prism",
		taskId: "task-dp-002",
		taskTitle: "Data Pipeline",
		taskStatus: "in_review",
		agentId: "agent-005",
		agentName: "Prism",
	},
	{
		id: "wdel-005",
		type: "file",
		title: "logs.txt",
		url: "/workspace/agent-005/logs.txt",
		thumbnailUrl: undefined,
		mimeType: "text/plain",
		submittedAt: new Date("2026-02-18T14:10:00Z"),
		submittedBy: "Prism",
		taskId: "task-dp-002",
		taskTitle: "Data Pipeline",
		taskStatus: "in_review",
		agentId: "agent-005",
		agentName: "Prism",
	},
	// Feature Implementation task - Code Agent (Atlas)
	{
		id: "wdel-006",
		type: "code",
		title: "component.tsx",
		url: "/workspace/agent-001/component.tsx",
		thumbnailUrl: undefined,
		mimeType: "text/typescript",
		submittedAt: new Date("2026-02-18T16:20:00Z"),
		submittedBy: "Atlas",
		taskId: "task-fi-003",
		taskTitle: "Feature Implementation",
		taskStatus: "in_progress",
		agentId: "agent-001",
		agentName: "Atlas",
	},
	{
		id: "wdel-007",
		type: "code",
		title: "test.ts",
		url: "/workspace/agent-001/test.ts",
		thumbnailUrl: undefined,
		mimeType: "text/typescript",
		submittedAt: new Date("2026-02-18T16:25:00Z"),
		submittedBy: "Atlas",
		taskId: "task-fi-003",
		taskTitle: "Feature Implementation",
		taskStatus: "in_progress",
		agentId: "agent-001",
		agentName: "Atlas",
	},
	// Content Draft task - Writer Agent (Scribe)
	{
		id: "wdel-008",
		type: "file",
		title: "draft.md",
		url: "/workspace/agent-004/draft.md",
		thumbnailUrl: undefined,
		mimeType: "text/markdown",
		submittedAt: new Date("2026-02-18T11:00:00Z"),
		submittedBy: "Scribe",
		taskId: "task-cd-004",
		taskTitle: "Content Draft",
		taskStatus: "done",
		agentId: "agent-004",
		agentName: "Scribe",
	},
	{
		id: "wdel-009",
		type: "file",
		title: "images/",
		url: "/workspace/agent-004/images/",
		thumbnailUrl: undefined,
		mimeType: "inode/directory",
		submittedAt: new Date("2026-02-18T11:05:00Z"),
		submittedBy: "Scribe",
		taskId: "task-cd-004",
		taskTitle: "Content Draft",
		taskStatus: "done",
		agentId: "agent-004",
		agentName: "Scribe",
	},
	// API Integration task - Code Agent (Atlas)
	{
		id: "wdel-010",
		type: "code",
		title: "client.ts",
		url: "/workspace/agent-001/client.ts",
		thumbnailUrl: undefined,
		mimeType: "text/typescript",
		submittedAt: new Date("2026-02-18T09:00:00Z"),
		submittedBy: "Atlas",
		taskId: "task-ai-005",
		taskTitle: "API Integration",
		taskStatus: "in_review",
		agentId: "agent-001",
		agentName: "Atlas",
	},
	{
		id: "wdel-011",
		type: "code",
		title: "types.ts",
		url: "/workspace/agent-001/types.ts",
		thumbnailUrl: undefined,
		mimeType: "text/typescript",
		submittedAt: new Date("2026-02-18T09:05:00Z"),
		submittedBy: "Atlas",
		taskId: "task-ai-005",
		taskTitle: "API Integration",
		taskStatus: "in_review",
		agentId: "agent-001",
		agentName: "Atlas",
	},
	// Extra deliverable for richer data
	{
		id: "wdel-012",
		type: "link",
		title: "API Documentation",
		url: "https://docs.example.com/api/v2",
		thumbnailUrl: undefined,
		mimeType: undefined,
		submittedAt: new Date("2026-02-18T09:15:00Z"),
		submittedBy: "Atlas",
		taskId: "task-ai-005",
		taskTitle: "API Integration",
		taskStatus: "in_review",
		agentId: "agent-001",
		agentName: "Atlas",
	},
];

/** Unique agents for filter dropdown */
export const DELIVERABLE_AGENTS = [
	{ id: "agent-001", name: "Atlas" },
	{ id: "agent-002", name: "Scout" },
	{ id: "agent-004", name: "Scribe" },
	{ id: "agent-005", name: "Prism" },
] as const;

/** Unique task statuses for filter dropdown */
export const DELIVERABLE_TASK_STATUSES = [
	"done",
	"in_review",
	"in_progress",
] as const;

async function fetchDeliverables(
	filters?: DeliverableFilters,
): Promise<TaskDeliverable[]> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	let results = [...MOCK_DELIVERABLES];

	if (filters?.taskStatus && filters.taskStatus !== "all") {
		results = results.filter((d) => d.taskStatus === filters.taskStatus);
	}

	if (filters?.agentId && filters.agentId !== "all") {
		results = results.filter((d) => d.agentId === filters.agentId);
	}

	return results;
}

/**
 * Fetches deliverables across all tasks with optional filtering.
 *
 * Returns TaskDeliverable[] which extends Deliverable with task and agent context.
 * staleTime: Infinity to prevent unnecessary refetches (consistent with project pattern).
 */
export function useDeliverables(filters?: DeliverableFilters) {
	const query = useQuery({
		queryKey: queryKeys.deliverables.list(
			filters as Record<string, unknown> | undefined,
		),
		queryFn: () => fetchDeliverables(filters),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});

	return {
		deliverables: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
