"use client";

/**
 * Card component for the workflow list page.
 *
 * Displays workflow name, description, trigger type badge, status,
 * node count, last edited time, and last run status.
 */

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
	Clock,
	Globe,
	Calendar,
	Zap,
	Play,
} from "lucide-react";
import type { WorkflowDefinition, WorkflowTriggerType } from "@/entities/workflow";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/shared/lib/cn";

// ---------------------------------------------------------------------------
// Trigger type config
// ---------------------------------------------------------------------------

const TRIGGER_CONFIG: Record<
	WorkflowTriggerType,
	{ label: string; icon: typeof Clock; className: string }
> = {
	manual: {
		label: "Manual",
		icon: Play,
		className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
	},
	cron: {
		label: "Scheduled",
		icon: Calendar,
		className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	webhook: {
		label: "Webhook",
		icon: Globe,
		className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	event: {
		label: "Event",
		icon: Zap,
		className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
};

// ---------------------------------------------------------------------------
// Run status indicator
// ---------------------------------------------------------------------------

const RUN_STATUS_COLORS: Record<string, string> = {
	success: "bg-green-500",
	error: "bg-red-500",
	running: "bg-blue-500 animate-pulse",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WorkflowCardProps {
	workflow: WorkflowDefinition;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
	const router = useRouter();
	const trigger = TRIGGER_CONFIG[workflow.triggerType];
	const TriggerIcon = trigger.icon;

	const statusMap: Record<string, string> = {
		draft: "pending",
		active: "active",
		paused: "idle",
		error: "error",
	};

	return (
		<button
			type="button"
			onClick={() => router.push(`/workflows/${workflow.id}`)}
			className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold text-foreground line-clamp-1">
					{workflow.name}
				</h3>
				<StatusBadge
					status={statusMap[workflow.status] ?? "unknown"}
					label={workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
					size="sm"
				/>
			</div>

			{/* Description */}
			<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
				{workflow.description}
			</p>

			{/* Meta row */}
			<div className="mt-3 flex flex-wrap items-center gap-2">
				{/* Trigger badge */}
				<span
					className={cn(
						"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
						trigger.className,
					)}
				>
					<TriggerIcon className="size-3" />
					{trigger.label}
				</span>

				{/* Node count */}
				<span className="text-xs text-muted-foreground">
					{workflow.nodeCount} nodes
				</span>

				{/* Separator */}
				<span className="text-muted-foreground/40">|</span>

				{/* Last edited */}
				<span className="text-xs text-muted-foreground">
					Edited{" "}
					{formatDistanceToNow(workflow.lastEditedAt, { addSuffix: true })}
				</span>
			</div>

			{/* Last run status */}
			{workflow.lastRunStatus && (
				<div className="mt-2 flex items-center gap-1.5">
					<span
						className={cn(
							"inline-block size-2 rounded-full",
							RUN_STATUS_COLORS[workflow.lastRunStatus] ?? "bg-gray-400",
						)}
					/>
					<span className="text-xs text-muted-foreground">
						Last run: {workflow.lastRunStatus}
						{workflow.lastRunAt
							? ` ${formatDistanceToNow(workflow.lastRunAt, { addSuffix: true })}`
							: ""}
					</span>
				</div>
			)}
		</button>
	);
}
