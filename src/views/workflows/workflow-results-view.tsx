"use client";

/**
 * Workflow results/history view at /workflows/[workflowId]/results.
 *
 * Shows past execution runs with expandable per-node details,
 * summary stats, and retry capabilities for failed runs.
 */

import { ArrowLeft, Clock, CheckCircle2, XCircle, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useWorkflowDetail } from "@/features/workflows/api/use-workflow-detail";
import { useWorkflowRuns } from "@/features/workflows/api/use-workflow-mutations";
import { RunHistoryRow } from "@/features/workflows/components/run-history-row";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowResultsView({
	workflowId,
}: {
	workflowId: string;
}) {
	const { workflow } = useWorkflowDetail(workflowId);
	const { runs, isLoading } = useWorkflowRuns(workflowId);

	// Stats
	const totalRuns = runs.length;
	const successRuns = runs.filter((r) => r.status === "success").length;
	const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
	const avgDuration = totalRuns > 0
		? Math.round(runs.reduce((sum, r) => sum + r.duration, 0) / totalRuns)
		: 0;
	const lastRun = runs[0] ?? null;

	const avgDurationStr = avgDuration >= 1000
		? `${(avgDuration / 1000).toFixed(1)}s`
		: `${avgDuration}ms`;

	return (
		<div className="flex h-[calc(100vh-64px)] flex-col">
			{/* Page header */}
			<div className="flex items-center gap-3 border-b px-6 py-4">
				<Button asChild variant="ghost" size="icon" className="size-8">
					<Link href={`/workflows/${workflowId}`}>
						<ArrowLeft className="size-4" />
						<span className="sr-only">Back to workflow</span>
					</Link>
				</Button>
				<div>
					<h1 className="text-lg font-semibold">
						{workflow?.name ?? "Workflow"} - Run History
					</h1>
					<p className="text-sm text-muted-foreground">
						View and inspect past workflow executions
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
				{/* Summary stats */}
				{isLoading ? (
					<div className="grid grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={`stat-skeleton-${i}`} className="h-20 rounded-lg" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-4 gap-4">
						<StatCard
							icon={<Activity className="size-4 text-blue-500" />}
							label="Total Runs"
							value={String(totalRuns)}
						/>
						<StatCard
							icon={<CheckCircle2 className="size-4 text-green-500" />}
							label="Success Rate"
							value={`${successRate}%`}
						/>
						<StatCard
							icon={<Clock className="size-4 text-amber-500" />}
							label="Avg Duration"
							value={avgDurationStr}
						/>
						<StatCard
							icon={
								lastRun?.status === "error" ? (
									<XCircle className="size-4 text-red-500" />
								) : (
									<CheckCircle2 className="size-4 text-green-500" />
								)
							}
							label="Last Run"
							value={
								lastRun
									? lastRun.startedAt.toLocaleDateString()
									: "Never"
							}
						/>
					</div>
				)}

				{/* Run list */}
				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={`row-skeleton-${i}`} className="h-14 rounded-lg" />
						))}
					</div>
				) : runs.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Activity className="size-12 text-muted-foreground/30 mb-4" />
						<h3 className="text-lg font-medium">No runs yet</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Run the workflow to see execution results here.
						</p>
						<Button asChild className="mt-4">
							<Link href={`/workflows/${workflowId}`}>
								Go to Workflow
							</Link>
						</Button>
					</div>
				) : (
					<div className="rounded-lg border">
						{runs.map((run) => (
							<RunHistoryRow key={run.id} run={run} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center gap-2 text-muted-foreground mb-1">
				{icon}
				<span className="text-xs font-medium">{label}</span>
			</div>
			<p className="text-2xl font-bold">{value}</p>
		</div>
	);
}
