"use client";

/**
 * TanStack Query mutations for workflow lifecycle.
 *
 * - useSaveWorkflow: persist workflow changes
 * - useRunWorkflow: trigger a mock execution
 * - useWorkflowRuns: query past execution history
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";
import type { Node, Edge } from "@xyflow/react";
import type { ExecutionNodeStatus } from "@/entities/workflow";
import { useExecutionStore } from "../model/execution-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SaveWorkflowInput {
	workflowId: string;
	name: string;
	nodes: Node[];
	edges: Edge[];
}

interface RunWorkflowInput {
	workflowId: string;
	overridePayload?: string;
}

export interface WorkflowRun {
	id: string;
	workflowId: string;
	status: "success" | "error" | "running";
	duration: number; // ms
	startedAt: Date;
	completedAt: Date | null;
	triggerType: "manual" | "cron" | "webhook" | "event";
	inputPayload: string;
	nodeResults: WorkflowRunNodeResult[];
}

export interface WorkflowRunNodeResult {
	nodeId: string;
	nodeName: string;
	status: ExecutionNodeStatus;
	duration: number; // ms
	input: unknown;
	output: unknown;
	error: string | null;
}

// ---------------------------------------------------------------------------
// Mock run history data
// ---------------------------------------------------------------------------

function createMockRuns(workflowId: string): WorkflowRun[] {
	const statuses = [
		"success",
		"success",
		"error",
		"success",
		"success",
		"error",
		"success",
	] as const;
	const triggers = ["manual", "webhook", "cron", "event", "manual", "webhook", "cron"] as const;
	const now = Date.now();

	return statuses.map((status, i) => {
		const startedAt = new Date(now - (i + 1) * 3_600_000 - Math.random() * 1_800_000);
		const duration = 2000 + Math.floor(Math.random() * 8000);
		const completedAt = new Date(startedAt.getTime() + duration);

		return {
			id: `run-${workflowId}-${i + 1}`,
			workflowId,
			status,
			duration,
			startedAt,
			completedAt,
			triggerType: triggers[i] ?? "manual",
			inputPayload: JSON.stringify(
				{
					source: triggers[i],
					timestamp: startedAt.toISOString(),
					data: { userId: `user-${100 + i}`, action: "process" },
				},
				null,
				2,
			),
			nodeResults: [
				{
					nodeId: "node-1",
					nodeName: "Webhook Trigger",
					status: "success" as ExecutionNodeStatus,
					duration: 120,
					input: { event: "incoming" },
					output: { triggered: true },
					error: null,
				},
				{
					nodeId: "node-2",
					nodeName: "Process Data",
					status: "success" as ExecutionNodeStatus,
					duration: 850,
					input: { payload: "raw-data" },
					output: { processed: true, score: 0.92 },
					error: null,
				},
				{
					nodeId: "node-3",
					nodeName: "Check Score",
					status: "success" as ExecutionNodeStatus,
					duration: 50,
					input: { score: 0.92 },
					output: { branch: "true" },
					error: null,
				},
				{
					nodeId: "node-4",
					nodeName: "Approve Action",
					status: status === "error" ? ("error" as ExecutionNodeStatus) : ("success" as ExecutionNodeStatus),
					duration: status === "error" ? 200 : 1500,
					input: { taskId: `task-${i}` },
					output: status === "error" ? null : { approved: true },
					error: status === "error" ? "Agent timeout: failed to complete within deadline" : null,
				},
				{
					nodeId: "node-5",
					nodeName: "Send Alert",
					status: status === "error" ? ("skipped" as ExecutionNodeStatus) : ("success" as ExecutionNodeStatus),
					duration: status === "error" ? 0 : 300,
					input: status === "error" ? null : { channel: "#alerts" },
					output: status === "error" ? null : { sent: true },
					error: null,
				},
			],
		};
	});
}

// ---------------------------------------------------------------------------
// Save mutation
// ---------------------------------------------------------------------------

export function useSaveWorkflow() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: SaveWorkflowInput) => {
			// Mock save delay
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { workflowId: input.workflowId };
		},
		onSuccess: (data) => {
			toast.success("Workflow saved");
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.detail(data.workflowId),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.lists(),
			});
		},
		onError: () => {
			toast.error("Failed to save workflow");
		},
	});
}

// ---------------------------------------------------------------------------
// Run mutation
// ---------------------------------------------------------------------------

export function useRunWorkflow() {
	const simulateExecution = useExecutionStore((s) => s.simulateExecution);

	return useMutation({
		mutationFn: async (input: RunWorkflowInput) => {
			// Mock API delay
			await new Promise((resolve) => setTimeout(resolve, 200));
			const runId = `run-${input.workflowId}-${Date.now()}`;
			return { runId, workflowId: input.workflowId };
		},
		onSuccess: (data) => {
			toast.success("Workflow execution started");
			// Get current canvas nodes to simulate
			const { useWorkflowCanvasStore } = require("../model/workflow-canvas-store") as {
				useWorkflowCanvasStore: { getState: () => { nodes: Node[] } };
			};
			const nodes = useWorkflowCanvasStore.getState().nodes;
			simulateExecution(
				data.runId,
				nodes.map((n) => ({ id: n.id, label: (n.data.label as string) ?? n.id })),
			);
		},
		onError: () => {
			toast.error("Failed to start workflow");
		},
	});
}

// ---------------------------------------------------------------------------
// Runs query hook
// ---------------------------------------------------------------------------

export function useWorkflowRuns(workflowId: string) {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.workflows.runs(workflowId),
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return createMockRuns(workflowId);
		},
		staleTime: 30_000,
		enabled: !!workflowId,
	});

	return {
		runs: data ?? [],
		isLoading,
		error,
	};
}
