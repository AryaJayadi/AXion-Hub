"use client";

/**
 * TanStack Query hook for loading a single workflow by ID.
 *
 * Returns a WorkflowDefinition with populated nodes and edges
 * suitable for hydrating the canvas store.
 */

import { useQuery } from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";
import { queryKeys } from "@/shared/lib/query-keys";
import type { WorkflowDefinition } from "@/entities/workflow";

// ---------------------------------------------------------------------------
// Mock data with populated nodes/edges for canvas hydration
// ---------------------------------------------------------------------------

function createMockWorkflowDetail(workflowId: string): WorkflowDefinition {
	const mockNodes: Node[] = [
		{
			id: "node-1",
			type: "trigger",
			position: { x: 250, y: 0 },
			data: { label: "Webhook Trigger", subType: "webhook" },
		},
		{
			id: "node-2",
			type: "agentAction",
			position: { x: 250, y: 120 },
			data: {
				label: "Process Data",
				agentName: "Research Agent",
				actionDescription: "Analyze incoming webhook payload",
			},
		},
		{
			id: "node-3",
			type: "condition",
			position: { x: 250, y: 260 },
			data: { label: "Check Score", expression: "data.score > 0.8" },
		},
		{
			id: "node-4",
			type: "agentAction",
			position: { x: 100, y: 400 },
			data: {
				label: "Approve Action",
				agentName: "Code Assistant",
				actionDescription: "Execute approved task",
			},
		},
		{
			id: "node-5",
			type: "output",
			position: { x: 400, y: 400 },
			data: { label: "Send Alert", outputType: "notify", target: "#alerts" },
		},
	];

	const mockEdges: Edge[] = [
		{
			id: "edge-1-2",
			source: "node-1",
			target: "node-2",
			type: "smoothstep",
		},
		{
			id: "edge-2-3",
			source: "node-2",
			target: "node-3",
			type: "smoothstep",
		},
		{
			id: "edge-3-4",
			source: "node-3",
			sourceHandle: "true",
			target: "node-4",
			type: "smoothstep",
		},
		{
			id: "edge-3-5",
			source: "node-3",
			sourceHandle: "false",
			target: "node-5",
			type: "smoothstep",
		},
	];

	// Map of known workflow names
	const nameMap: Record<string, string> = {
		"wf-1": "Customer Onboarding",
		"wf-2": "Daily Report Generator",
		"wf-3": "Error Escalation Pipeline",
		"wf-4": "Content Moderation Review",
		"wf-5": "Data Sync Pipeline",
		"wf-6": "Incident Response Playbook",
	};

	return {
		id: workflowId,
		name: nameMap[workflowId] ?? `Workflow ${workflowId}`,
		description: "Automated workflow with connected nodes",
		status: "active",
		triggerType: "webhook",
		nodes: mockNodes,
		edges: mockEdges,
		nodeCount: mockNodes.length,
		lastEditedAt: new Date("2026-02-19T06:15:00Z"),
		lastRunAt: new Date("2026-02-19T07:00:00Z"),
		lastRunStatus: "success",
	};
}

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

export function useWorkflowDetail(workflowId: string) {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.workflows.detail(workflowId),
		queryFn: async () => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 300));
			return createMockWorkflowDetail(workflowId);
		},
		staleTime: 30_000,
		enabled: !!workflowId,
	});

	return {
		workflow: data ?? null,
		isLoading,
		error,
	};
}
