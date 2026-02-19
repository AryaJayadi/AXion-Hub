"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Package } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import type { ApprovalItem, ApprovalPriority } from "@/entities/approval";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

/** Priority color mapping */
const PRIORITY_COLORS: Record<ApprovalPriority, string> = {
	critical: "bg-red-500",
	high: "bg-orange-500",
	medium: "bg-blue-500",
	low: "bg-gray-400",
};

const PRIORITY_LABELS: Record<ApprovalPriority, string> = {
	critical: "Critical",
	high: "High",
	medium: "Medium",
	low: "Low",
};

interface ApprovalInboxProps {
	items: ApprovalItem[];
}

export function ApprovalInbox({ items }: ApprovalInboxProps) {
	const router = useRouter();

	const columns = useMemo<ColumnDef<ApprovalItem, unknown>[]>(
		() => [
			{
				id: "priority",
				accessorKey: "priority",
				header: () => (
					<span className="text-xs text-muted-foreground">
						Priority
					</span>
				),
				cell: ({ row }) => {
					const priority = row.original.priority;
					return (
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"size-2.5 rounded-full shrink-0",
									PRIORITY_COLORS[priority],
								)}
							/>
							<span className="text-xs text-muted-foreground">
								{PRIORITY_LABELS[priority]}
							</span>
						</div>
					);
				},
				size: 120,
			},
			{
				id: "task",
				accessorKey: "taskTitle",
				header: () => (
					<span className="text-xs text-muted-foreground">Task</span>
				),
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="text-sm font-medium truncate">
							{row.original.taskTitle}
						</p>
						<p className="text-xs text-muted-foreground truncate">
							{row.original.agentName}
						</p>
					</div>
				),
			},
			{
				id: "deliverables",
				accessorKey: "deliverableCount",
				header: () => (
					<span className="text-xs text-muted-foreground">
						Deliverables
					</span>
				),
				cell: ({ row }) => (
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Package className="size-3.5" />
						<span className="text-xs">
							{row.original.deliverableCount}
						</span>
					</div>
				),
				size: 110,
			},
			{
				id: "submitted",
				accessorKey: "submittedAt",
				header: () => (
					<span className="text-xs text-muted-foreground">
						Submitted
					</span>
				),
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{formatDistanceToNow(row.original.submittedAt, {
							addSuffix: true,
						})}
					</span>
				),
				size: 140,
			},
		],
		[],
	);

	if (items.length === 0) {
		return (
			<EmptyState
				icon={
					<CheckCircle className="size-12 text-green-500 opacity-60" />
				}
				title="All caught up!"
				description="No approvals pending."
			/>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={items}
			enablePagination={false}
			searchKey="task"
			searchPlaceholder="Search approvals..."
			emptyState={
				<EmptyState
					icon={
						<CheckCircle className="size-12 text-green-500 opacity-60" />
					}
					title="All caught up!"
					description="No approvals pending."
				/>
			}
			className="[&_tbody_tr]:cursor-pointer [&_tbody_tr:hover]:bg-muted/50"
		/>
	);
}

/**
 * Wrapper that adds row click navigation.
 * Uses event delegation on the table container.
 */
export function ApprovalInboxWithNavigation({
	items,
}: ApprovalInboxProps) {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const row = (e.target as HTMLElement).closest("tbody tr");
		if (!row) return;
		const index = Array.from(
			row.parentElement?.children ?? [],
		).indexOf(row);
		const item = items[index];
		if (item) {
			router.push(`/approvals/${item.taskId}`);
		}
	};

	return (
		<div onClick={handleClick}>
			<ApprovalInbox items={items} />
		</div>
	);
}
