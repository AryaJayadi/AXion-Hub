"use client";

import NumberFlow from "@number-flow/react";
import { useDashboardStore } from "@/features/dashboard";
import { StatusBadge } from "@/shared/ui/status-badge";

const TASK_STATUSES = [
	{ key: "inbox" as const, label: "Inbox", status: "pending" },
	{ key: "assigned" as const, label: "Assigned", status: "idle" },
	{ key: "inProgress" as const, label: "In Progress", status: "working" },
	{ key: "review" as const, label: "Review", status: "warning" },
	{ key: "done" as const, label: "Done", status: "connected" },
];

/**
 * Task summary widget showing counts grouped by status.
 *
 * Displays animated NumberFlow counters for each task status.
 * Shows a "Preview" badge since tasks are mock data until Phase 6.
 */
export function TaskSummaryWidget() {
	const taskSummary = useDashboardStore((s) => s.taskSummary);

	const total = Object.values(taskSummary).reduce((sum, n) => sum + n, 0);

	return (
		<div className="flex flex-col gap-4">
			{/* Header row */}
			<div className="flex items-baseline justify-between">
				<div className="flex items-baseline gap-2">
					<NumberFlow
						value={total}
						className="text-3xl font-bold tabular-nums"
					/>
					<span className="text-sm text-muted-foreground">tasks</span>
				</div>
				<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
					Preview
				</span>
			</div>

			{/* Status breakdown */}
			<div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
				{TASK_STATUSES.map(({ key, label, status }) => (
					<div key={key} className="flex items-center justify-between gap-2">
						<StatusBadge status={status} label={label} size="sm" showDot={false} />
						<NumberFlow
							value={taskSummary[key]}
							className="text-sm font-medium tabular-nums"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
