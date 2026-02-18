"use client";

import { AlertCircle } from "lucide-react";
import { useAgentDetail } from "@/features/agents/api/use-agent-detail";
import { AgentOverviewWidgets } from "@/features/agents/components/agent-overview-widgets";
import { AgentQuickActions } from "@/features/agents/components/agent-quick-actions";
import { AgentRecentActivity } from "@/features/agents/components/agent-recent-activity";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface AgentDetailViewProps {
	agentId: string;
}

function StatCardSkeleton() {
	return (
		<div className="rounded-xl border p-6 space-y-3">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-8 w-32" />
		</div>
	);
}

function ActivityRowSkeleton() {
	return (
		<div className="flex items-center gap-3">
			<Skeleton className="size-2 rounded-full" />
			<Skeleton className="h-4 flex-1" />
		</div>
	);
}

function OverviewSkeleton() {
	return (
		<div className="space-y-6">
			{/* Row 1: 4 stat card skeletons */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
			</div>

			{/* Row 2: 2 wide card skeletons */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				<div className="lg:col-span-2 rounded-xl border p-6 space-y-4">
					<Skeleton className="h-4 w-28" />
					<ActivityRowSkeleton />
					<ActivityRowSkeleton />
					<ActivityRowSkeleton />
					<ActivityRowSkeleton />
					<ActivityRowSkeleton />
				</div>
				<div className="lg:col-span-2 rounded-xl border p-6 space-y-4">
					<Skeleton className="h-4 w-28" />
					<div className="grid grid-cols-2 gap-3">
						<Skeleton className="h-10 rounded-md" />
						<Skeleton className="h-10 rounded-md" />
						<Skeleton className="h-10 rounded-md" />
						<Skeleton className="h-10 rounded-md" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function AgentDetailView({ agentId }: AgentDetailViewProps) {
	const { agent, isLoading, error, refetch } = useAgentDetail(agentId);

	if (isLoading) {
		return <OverviewSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load agent</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		);
	}

	if (!agent) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<h2 className="text-lg font-semibold">Agent not found</h2>
				<p className="text-sm text-muted-foreground mt-1">
					The agent with ID &quot;{agentId}&quot; does not exist.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Row 1: 4 stat cards */}
			<AgentOverviewWidgets agent={agent} />

			{/* Row 2: Recent Activity + Quick Actions */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				<AgentRecentActivity agentId={agentId} />
				<AgentQuickActions agentId={agentId} />
			</div>
		</div>
	);
}
