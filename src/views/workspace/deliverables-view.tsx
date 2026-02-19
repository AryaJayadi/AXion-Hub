"use client";

import { useQueryState } from "nuqs";
import { useMemo } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import {
	useDeliverables,
	DELIVERABLE_AGENTS,
	DELIVERABLE_TASK_STATUSES,
} from "@/features/workspace/api/use-deliverables";
import { DeliverablesTable } from "@/features/workspace/components/deliverables-table";

function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
		</div>
	);
}

export function DeliverablesView() {
	const [statusFilter, setStatusFilter] = useQueryState("status", {
		defaultValue: "all",
	});
	const [agentFilter, setAgentFilter] = useQueryState("agent", {
		defaultValue: "all",
	});

	const filters = useMemo(
		() => ({
			taskStatus: statusFilter !== "all" ? statusFilter : undefined,
			agentId: agentFilter !== "all" ? agentFilter : undefined,
		}),
		[statusFilter, agentFilter],
	);

	const { deliverables, isLoading } = useDeliverables(filters);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Deliverables"
				description="All task deliverables across agents"
			/>

			{/* Filter bar */}
			<div className="flex flex-wrap items-center gap-3">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Task status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All statuses</SelectItem>
						{DELIVERABLE_TASK_STATUSES.map((status) => (
							<SelectItem key={status} value={status}>
								{status.replace("_", " ")}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={agentFilter} onValueChange={setAgentFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Agent" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All agents</SelectItem>
						{DELIVERABLE_AGENTS.map((agent) => (
							<SelectItem key={agent.id} value={agent.id}>
								{agent.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Content */}
			{isLoading ? (
				<LoadingSkeleton />
			) : (
				<DeliverablesTable deliverables={deliverables} />
			)}
		</div>
	);
}
