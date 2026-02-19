"use client";

/**
 * Workflow detail/edit/run view at /workflows/[workflowId].
 *
 * Extends the Plan 03 WorkflowEditorView with:
 * - Loading a saved workflow into the canvas on mount
 * - Run / Save / Results buttons in the top bar
 * - isDirty indicator
 * - ExecutionStatusBar during live runs
 * - Cleanup on unmount to prevent stale state
 */

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import {
	Undo2,
	Redo2,
	Save,
	Play,
	ExternalLink,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { WorkflowCanvas } from "@/features/workflows/components/canvas/workflow-canvas";
import { NodePalette } from "@/features/workflows/components/canvas/node-palette";
import { NodeConfigPanel } from "@/features/workflows/components/canvas/node-config-panel";
import { ExecutionStatusBar } from "@/features/workflows/components/canvas/execution-overlay";
import { useWorkflowCanvasStore } from "@/features/workflows/model/workflow-canvas-store";
import { useExecutionStore } from "@/features/workflows/model/execution-store";
import { useWorkflowDetail } from "@/features/workflows/api/use-workflow-detail";
import { useSaveWorkflow, useRunWorkflow } from "@/features/workflows/api/use-workflow-mutations";
import type { Node, Edge } from "@xyflow/react";
import { cn } from "@/shared/lib/cn";

// ---------------------------------------------------------------------------
// Inner component (needs ReactFlowProvider ancestor)
// ---------------------------------------------------------------------------

function WorkflowDetailInner({ workflowId }: { workflowId: string }) {
	const { workflow, isLoading, error } = useWorkflowDetail(workflowId);

	// Canvas store
	const workflowName = useWorkflowCanvasStore((s) => s.workflowName);
	const isDirty = useWorkflowCanvasStore((s) => s.isDirty);
	const nodes = useWorkflowCanvasStore((s) => s.nodes);
	const edges = useWorkflowCanvasStore((s) => s.edges);
	const past = useWorkflowCanvasStore((s) => s.past);
	const future = useWorkflowCanvasStore((s) => s.future);
	const undo = useWorkflowCanvasStore((s) => s.undo);
	const redo = useWorkflowCanvasStore((s) => s.redo);
	const loadWorkflow = useWorkflowCanvasStore((s) => s.loadWorkflow);
	const clearCanvas = useWorkflowCanvasStore((s) => s.clearCanvas);

	// Execution store
	const isRunning = useExecutionStore((s) => s.isRunning);
	const clearRun = useExecutionStore((s) => s.clearRun);

	// Mutations
	const saveMutation = useSaveWorkflow();
	const runMutation = useRunWorkflow();

	// Hydrate canvas when data loads
	useEffect(() => {
		if (workflow) {
			loadWorkflow(
				workflow.id,
				workflow.name,
				workflow.nodes as Node[],
				workflow.edges as Edge[],
			);
		}
	}, [workflow, loadWorkflow]);

	// Cleanup on unmount to prevent stale state (Pitfall 6)
	useEffect(() => {
		return () => {
			clearCanvas();
			clearRun();
		};
	}, [clearCanvas, clearRun]);

	// Name update
	const setName = (name: string) => {
		useWorkflowCanvasStore.setState({ workflowName: name, isDirty: true });
	};

	// Save handler
	const handleSave = () => {
		saveMutation.mutate({
			workflowId,
			name: workflowName,
			nodes,
			edges,
		});
		// Clear dirty flag on save
		useWorkflowCanvasStore.setState({ isDirty: false });
	};

	// Run handler
	const handleRun = () => {
		runMutation.mutate({ workflowId });
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-64px)] flex-col">
				<div className="flex items-center gap-2 border-b px-4 py-2">
					<Skeleton className="h-8 w-48" />
					<div className="ml-auto flex items-center gap-1.5">
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-20" />
					</div>
				</div>
				<div className="flex flex-1 overflow-hidden">
					<Skeleton className="h-full w-60" />
					<Skeleton className="h-full flex-1" />
				</div>
			</div>
		);
	}

	// Error state
	if (error || !workflow) {
		return (
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<div className="text-center space-y-4">
					<h2 className="text-lg font-semibold">Workflow not found</h2>
					<p className="text-muted-foreground">
						The workflow you are looking for does not exist or has been deleted.
					</p>
					<Button asChild variant="outline">
						<Link href="/workflows">
							<ArrowLeft className="mr-1.5 size-4" />
							Back to Workflows
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-64px)] flex-col">
			{/* Top bar */}
			<div className="flex items-center gap-2 border-b px-4 py-2">
				{/* Back link */}
				<Button asChild variant="ghost" size="icon" className="size-8">
					<Link href="/workflows">
						<ArrowLeft className="size-4" />
						<span className="sr-only">Back</span>
					</Link>
				</Button>

				{/* Workflow name + dirty indicator */}
				<div className="relative">
					<Input
						value={workflowName}
						onChange={(e) => setName(e.target.value)}
						className="h-8 max-w-xs border-none bg-transparent text-sm font-semibold shadow-none focus-visible:ring-1"
						placeholder="Workflow name"
					/>
					{isDirty && (
						<span
							className="absolute -right-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-yellow-500"
							title="Unsaved changes"
						/>
					)}
				</div>

				<div className="ml-auto flex items-center gap-1.5">
					{/* Undo */}
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={undo}
						disabled={past.length === 0}
						title="Undo"
					>
						<Undo2 className="size-4" />
						<span className="sr-only">Undo</span>
					</Button>

					{/* Redo */}
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						onClick={redo}
						disabled={future.length === 0}
						title="Redo"
					>
						<Redo2 className="size-4" />
						<span className="sr-only">Redo</span>
					</Button>

					{/* Results link */}
					<Button asChild variant="ghost" size="sm">
						<Link href={`/workflows/${workflowId}/results`}>
							<ExternalLink className="mr-1.5 size-4" />
							Results
						</Link>
					</Button>

					{/* Run button */}
					<Button
						size="sm"
						variant="default"
						className={cn(
							"bg-green-600 hover:bg-green-700 text-white",
						)}
						onClick={handleRun}
						disabled={isRunning || runMutation.isPending}
					>
						{runMutation.isPending ? (
							<Loader2 className="mr-1.5 size-4 animate-spin" />
						) : (
							<Play className="mr-1.5 size-4" />
						)}
						Run
					</Button>

					{/* Save button */}
					<Button
						size="sm"
						onClick={handleSave}
						disabled={!isDirty || saveMutation.isPending}
					>
						{saveMutation.isPending ? (
							<Loader2 className="mr-1.5 size-4 animate-spin" />
						) : (
							<Save className="mr-1.5 size-4" />
						)}
						Save
					</Button>
				</div>
			</div>

			{/* Execution status bar (shown during runs) */}
			<ExecutionStatusBar />

			{/* Three-column layout */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left: Node palette */}
				<NodePalette />

				{/* Center: Canvas */}
				<div className="flex-1">
					<WorkflowCanvas />
				</div>

				{/* Right: Config panel (with execution I/O mode) */}
				<NodeConfigPanel isRunning={isRunning} />
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Exported view
// ---------------------------------------------------------------------------

export function WorkflowDetailView({ workflowId }: { workflowId: string }) {
	return (
		<ReactFlowProvider>
			<WorkflowDetailInner workflowId={workflowId} />
		</ReactFlowProvider>
	);
}
