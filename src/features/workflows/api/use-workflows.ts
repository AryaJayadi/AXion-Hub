/**
 * TanStack Query hooks for workflows.
 *
 * Returns mock WorkflowDefinition data until a backend API is available.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import type { WorkflowDefinition } from "@/entities/workflow";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_WORKFLOWS: WorkflowDefinition[] = [
	{
		id: "wf-1",
		name: "Customer Onboarding",
		description:
			"Automated onboarding flow: welcome email, account setup, initial meeting scheduling",
		status: "active",
		triggerType: "webhook",
		nodes: [],
		edges: [],
		nodeCount: 8,
		lastEditedAt: new Date("2026-02-18T14:30:00Z"),
		lastRunAt: new Date("2026-02-19T06:15:00Z"),
		lastRunStatus: "success",
	},
	{
		id: "wf-2",
		name: "Daily Report Generator",
		description:
			"Generates daily performance reports from agent metrics and sends to Slack",
		status: "active",
		triggerType: "cron",
		nodes: [],
		edges: [],
		nodeCount: 5,
		lastEditedAt: new Date("2026-02-17T10:00:00Z"),
		lastRunAt: new Date("2026-02-19T07:00:00Z"),
		lastRunStatus: "success",
	},
	{
		id: "wf-3",
		name: "Error Escalation Pipeline",
		description:
			"Monitors agent errors, applies retry logic, and escalates to human operators",
		status: "paused",
		triggerType: "event",
		nodes: [],
		edges: [],
		nodeCount: 12,
		lastEditedAt: new Date("2026-02-15T09:20:00Z"),
		lastRunAt: new Date("2026-02-16T11:45:00Z"),
		lastRunStatus: "error",
	},
	{
		id: "wf-4",
		name: "Content Moderation Review",
		description:
			"AI-assisted content review with human approval gates for flagged items",
		status: "draft",
		triggerType: "manual",
		nodes: [],
		edges: [],
		nodeCount: 6,
		lastEditedAt: new Date("2026-02-19T02:10:00Z"),
		lastRunAt: null,
		lastRunStatus: null,
	},
	{
		id: "wf-5",
		name: "Data Sync Pipeline",
		description:
			"Bi-directional sync between CRM and internal databases with conflict resolution",
		status: "active",
		triggerType: "cron",
		nodes: [],
		edges: [],
		nodeCount: 10,
		lastEditedAt: new Date("2026-02-18T16:45:00Z"),
		lastRunAt: new Date("2026-02-19T06:00:00Z"),
		lastRunStatus: "running",
	},
	{
		id: "wf-6",
		name: "Incident Response Playbook",
		description:
			"Automated incident triage, notification, and resolution tracking",
		status: "error",
		triggerType: "event",
		nodes: [],
		edges: [],
		nodeCount: 15,
		lastEditedAt: new Date("2026-02-14T08:30:00Z"),
		lastRunAt: new Date("2026-02-14T09:00:00Z"),
		lastRunStatus: "error",
	},
];

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

export function useWorkflows() {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.workflows.lists(),
		queryFn: async () => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_WORKFLOWS;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	return {
		workflows: data ?? [],
		isLoading,
		error,
	};
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateWorkflow() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			input: Pick<WorkflowDefinition, "name" | "description" | "triggerType">,
		) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			const newWorkflow: WorkflowDefinition = {
				id: `wf-${Date.now()}`,
				name: input.name,
				description: input.description,
				status: "draft",
				triggerType: input.triggerType,
				nodes: [],
				edges: [],
				nodeCount: 0,
				lastEditedAt: new Date(),
				lastRunAt: null,
				lastRunStatus: null,
			};
			return newWorkflow;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.all,
			});
		},
	});
}

export function useDeleteWorkflow() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (workflowId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return workflowId;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.all,
			});
		},
	});
}
