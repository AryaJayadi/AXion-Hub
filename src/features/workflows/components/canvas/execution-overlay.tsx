"use client";

/**
 * Execution overlay for the workflow canvas.
 *
 * Provides:
 * - EXECUTION_BORDER_COLORS: mapping of execution states to Tailwind border classes
 * - useNodeExecutionBorder(nodeId): hook returning CSS class for a node's execution state
 * - ExecutionStatusBar: progress bar during workflow execution
 */

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useExecutionStore } from "../../model/execution-store";
import type { ExecutionNodeStatus } from "@/entities/workflow";
import { cn } from "@/shared/lib/cn";

// ---------------------------------------------------------------------------
// Border color mapping
// ---------------------------------------------------------------------------

export const EXECUTION_BORDER_COLORS: Record<ExecutionNodeStatus, string> = {
	pending: "border-muted-foreground",
	running: "border-blue-500 animate-pulse",
	success: "border-green-500",
	error: "border-red-500",
	skipped: "border-muted-foreground/50",
};

// ---------------------------------------------------------------------------
// Hook: useNodeExecutionBorder
// ---------------------------------------------------------------------------

/**
 * Returns the CSS border class for a node's current execution state.
 * Returns null if no execution is running (so callers use default category border).
 */
export function useNodeExecutionBorder(nodeId: string): string | null {
	const isRunning = useExecutionStore((s) => s.isRunning);
	const nodeStates = useExecutionStore((s) => s.nodeStates);

	if (!isRunning && nodeStates.size === 0) return null;

	const state = nodeStates.get(nodeId);
	if (!state) return null;

	return EXECUTION_BORDER_COLORS[state.status];
}

// ---------------------------------------------------------------------------
// ExecutionStatusBar
// ---------------------------------------------------------------------------

export function ExecutionStatusBar() {
	const isRunning = useExecutionStore((s) => s.isRunning);
	const nodeStates = useExecutionStore((s) => s.nodeStates);
	const startedAt = useExecutionStore((s) => s.startedAt);
	const [elapsed, setElapsed] = useState(0);

	// Update elapsed time every 100ms while running
	useEffect(() => {
		if (!isRunning || !startedAt) {
			setElapsed(0);
			return;
		}

		const interval = setInterval(() => {
			setElapsed(Date.now() - startedAt.getTime());
		}, 100);

		return () => clearInterval(interval);
	}, [isRunning, startedAt]);

	// Don't render if no execution state
	if (nodeStates.size === 0) return null;

	const total = nodeStates.size;
	let completed = 0;
	let failed = 0;
	let running = 0;

	for (const state of nodeStates.values()) {
		if (state.status === "success" || state.status === "skipped") completed++;
		if (state.status === "error") {
			completed++;
			failed++;
		}
		if (state.status === "running") running++;
	}

	const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
	const elapsedStr = (elapsed / 1000).toFixed(1);

	const allDone = !isRunning && completed > 0;
	const hasErrors = failed > 0;

	return (
		<div
			className={cn(
				"flex items-center gap-3 border-b px-4 py-2 text-sm",
				isRunning && "bg-blue-500/5",
				allDone && !hasErrors && "bg-green-500/5",
				allDone && hasErrors && "bg-red-500/5",
			)}
		>
			{/* Status icon */}
			{isRunning ? (
				<Loader2 className="size-4 shrink-0 animate-spin text-blue-500" />
			) : hasErrors ? (
				<XCircle className="size-4 shrink-0 text-red-500" />
			) : (
				<CheckCircle2 className="size-4 shrink-0 text-green-500" />
			)}

			{/* Progress text */}
			<span className="font-medium">
				{isRunning
					? `Running: ${completed}/${total} nodes complete`
					: hasErrors
						? `Failed: ${completed}/${total} nodes (${failed} error${failed > 1 ? "s" : ""})`
						: `Completed: ${completed}/${total} nodes`}
			</span>

			{/* Progress bar */}
			<div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-300",
						isRunning && "bg-blue-500",
						allDone && !hasErrors && "bg-green-500",
						allDone && hasErrors && "bg-red-500",
					)}
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Elapsed time */}
			<div className="ml-auto flex items-center gap-1 text-muted-foreground">
				<Clock className="size-3.5" />
				<span>{elapsedStr}s</span>
			</div>

			{running > 0 && (
				<span className="text-blue-500">
					{running} node{running > 1 ? "s" : ""} active
				</span>
			)}
		</div>
	);
}
