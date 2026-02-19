"use client";

/**
 * Expandable row component for workflow run history.
 *
 * Collapsed: run ID, status badge, duration, timestamp, trigger type.
 * Expanded: per-node execution results with I/O preview.
 * Failed runs show a "Retry" button with payload editor.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
	ChevronDown,
	ChevronRight,
	RefreshCw,
	ExternalLink,
	Clock,
	X,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/cn";
import type { WorkflowRun } from "../api/use-workflow-mutations";
import { useRunWorkflow } from "../api/use-workflow-mutations";
import type { ExecutionNodeStatus } from "@/entities/workflow";

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
	success: "bg-green-500/10 text-green-600 border-green-200",
	error: "bg-red-500/10 text-red-600 border-red-200",
	running: "bg-blue-500/10 text-blue-600 border-blue-200",
	pending: "bg-muted text-muted-foreground",
	skipped: "bg-muted text-muted-foreground/60",
};

function StatusBadge({ status }: { status: string }) {
	return (
		<Badge
			variant="outline"
			className={cn("text-xs capitalize", STATUS_COLORS[status])}
		>
			{status}
		</Badge>
	);
}

// ---------------------------------------------------------------------------
// Run history row
// ---------------------------------------------------------------------------

interface RunHistoryRowProps {
	run: WorkflowRun;
}

export function RunHistoryRow({ run }: RunHistoryRowProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showRetry, setShowRetry] = useState(false);
	const [retryPayload, setRetryPayload] = useState(run.inputPayload);
	const runWorkflow = useRunWorkflow();

	const durationStr = run.duration >= 1000
		? `${(run.duration / 1000).toFixed(1)}s`
		: `${run.duration}ms`;

	const handleRetry = () => {
		runWorkflow.mutate({
			workflowId: run.workflowId,
			overridePayload: retryPayload,
		});
		setShowRetry(false);
	};

	return (
		<div className="border-b last:border-b-0">
			{/* Collapsed row */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
			>
				{isExpanded ? (
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				) : (
					<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
				)}

				{/* Run ID (truncated) */}
				<span className="font-mono text-xs text-muted-foreground w-32 truncate">
					{run.id}
				</span>

				{/* Status */}
				<StatusBadge status={run.status} />

				{/* Duration */}
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<Clock className="size-3" />
					{durationStr}
				</div>

				{/* Trigger type */}
				<Badge variant="secondary" className="text-xs capitalize">
					{run.triggerType}
				</Badge>

				{/* Timestamp */}
				<span className="ml-auto text-xs text-muted-foreground">
					{run.startedAt.toLocaleString()}
				</span>
			</button>

			{/* Expanded details */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="border-t bg-muted/20 px-4 py-3 space-y-3">
							{/* Per-node results */}
							<div className="space-y-1">
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Node Execution
								</h4>
								<div className="rounded-md border bg-background">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b text-xs text-muted-foreground">
												<th className="px-3 py-2 text-left font-medium">Node</th>
												<th className="px-3 py-2 text-left font-medium">Status</th>
												<th className="px-3 py-2 text-left font-medium">Duration</th>
												<th className="px-3 py-2 text-left font-medium">I/O Preview</th>
											</tr>
										</thead>
										<tbody>
											{run.nodeResults.map((result) => (
												<NodeResultRow key={result.nodeId} result={result} />
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2">
								{run.status === "error" && (
									<Button
										variant="outline"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											setShowRetry(!showRetry);
										}}
									>
										<RefreshCw className="mr-1.5 size-3.5" />
										Retry
									</Button>
								)}
								<Link
									href={`/workflows/${run.workflowId}/results`}
									className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
									onClick={(e) => e.stopPropagation()}
								>
									View Results
									<ExternalLink className="size-3" />
								</Link>
							</div>

							{/* Retry payload editor */}
							<AnimatePresence>
								{showRetry && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.15 }}
										className="overflow-hidden"
									>
										<div className="rounded-md border bg-background p-3 space-y-2">
											<div className="flex items-center justify-between">
												<h4 className="text-xs font-medium">
													Edit Input Payload
												</h4>
												<Button
													variant="ghost"
													size="icon"
													className="size-6"
													onClick={() => setShowRetry(false)}
												>
													<X className="size-3.5" />
												</Button>
											</div>
											<Textarea
												value={retryPayload}
												onChange={(e) => setRetryPayload(e.target.value)}
												className="font-mono text-xs min-h-[120px]"
												rows={6}
											/>
											<div className="flex items-center gap-2 justify-end">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setShowRetry(false)}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													onClick={handleRetry}
													disabled={runWorkflow.isPending}
												>
													{runWorkflow.isPending ? "Starting..." : "Confirm Retry"}
												</Button>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Node result row
// ---------------------------------------------------------------------------

function NodeResultRow({
	result,
}: {
	result: WorkflowRun["nodeResults"][number];
}) {
	const durationStr = result.duration >= 1000
		? `${(result.duration / 1000).toFixed(1)}s`
		: `${result.duration}ms`;

	const ioPreview = result.output
		? truncateJSON(result.output, 60)
		: result.error
			? result.error.slice(0, 60)
			: "--";

	return (
		<tr className="border-b last:border-b-0">
			<td className="px-3 py-2 font-medium">{result.nodeName}</td>
			<td className="px-3 py-2">
				<StatusBadge status={result.status} />
			</td>
			<td className="px-3 py-2 text-muted-foreground">{durationStr}</td>
			<td className="px-3 py-2 font-mono text-xs text-muted-foreground truncate max-w-[200px]">
				{ioPreview}
			</td>
		</tr>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateJSON(value: unknown, maxLen: number): string {
	const str = JSON.stringify(value);
	if (str.length <= maxLen) return str;
	return `${str.slice(0, maxLen)}...`;
}
