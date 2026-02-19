"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useMemo } from "react";

import { StatusBadge } from "@/shared/ui/status-badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { DeliverablePreviewCard } from "@/features/missions/components/deliverable-preview-card";
import type { TaskDeliverable } from "../api/use-deliverables";

/** Group deliverables by their taskId */
interface TaskGroup {
	taskId: string;
	taskTitle: string;
	taskStatus: string;
	agentName: string;
	deliverables: TaskDeliverable[];
}

interface DeliverablesTableProps {
	deliverables: TaskDeliverable[];
}

export function DeliverablesTable({ deliverables }: DeliverablesTableProps) {
	const groups = useMemo(() => {
		const groupMap = new Map<string, TaskGroup>();

		for (const d of deliverables) {
			const existing = groupMap.get(d.taskId);
			if (existing) {
				existing.deliverables.push(d);
			} else {
				groupMap.set(d.taskId, {
					taskId: d.taskId,
					taskTitle: d.taskTitle,
					taskStatus: d.taskStatus,
					agentName: d.agentName,
					deliverables: [d],
				});
			}
		}

		return Array.from(groupMap.values());
	}, [deliverables]);

	if (deliverables.length === 0) {
		return (
			<EmptyState
				icon={<Package className="size-12 text-muted-foreground/40" />}
				title="No deliverables found"
				description="No deliverables match the current filters. Try adjusting your filter criteria."
			/>
		);
	}

	return (
		<div className="space-y-8">
			{groups.map((group) => (
				<section key={group.taskId} className="space-y-3">
					{/* Group header */}
					<div className="flex items-center gap-3 border-b pb-2">
						<Link
							href={`/missions/${group.taskId}`}
							className="text-sm font-semibold hover:text-primary hover:underline transition-colors"
						>
							{group.taskTitle}
						</Link>
						<StatusBadge
							status={group.taskStatus.replace("_", "-")}
							label={group.taskStatus.replace("_", " ")}
							size="sm"
						/>
						<span className="text-xs text-muted-foreground">
							{group.agentName}
						</span>
						<span className="ml-auto text-xs text-muted-foreground">
							{group.deliverables.length}{" "}
							{group.deliverables.length === 1
								? "deliverable"
								: "deliverables"}
						</span>
					</div>

					{/* Deliverable cards grid */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{group.deliverables.map((deliverable) => (
							<DeliverablePreviewCard
								key={deliverable.id}
								deliverable={deliverable}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
