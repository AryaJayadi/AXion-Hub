"use client";

import { AlertCircle } from "lucide-react";
import { useAgentMetrics } from "@/features/agents/api/use-agent-metrics";
import { AgentMetricsCharts } from "@/features/agents/components/agent-metrics-charts";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface AgentMetricsViewProps {
	agentId: string;
}

function MetricsSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-32" />
			<div className="flex gap-1">
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-16" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Skeleton className="h-[200px] rounded-xl" />
				<Skeleton className="h-[200px] rounded-xl" />
				<Skeleton className="h-[200px] rounded-xl" />
				<Skeleton className="h-[200px] rounded-xl" />
			</div>
		</div>
	);
}

export function AgentMetricsView({ agentId }: AgentMetricsViewProps) {
	const { metrics, isLoading, error } = useAgentMetrics(agentId);

	if (isLoading) {
		return <MetricsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load metrics</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</div>
		);
	}

	if (!metrics) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<h2 className="text-lg font-semibold">No metrics available</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Metrics data will appear once the agent has been active.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-lg font-semibold">Metrics</h1>
				<p className="text-sm text-muted-foreground">
					Token usage, cost, task completion, and response time analytics.
				</p>
			</div>
			<AgentMetricsCharts metrics={metrics} />
		</div>
	);
}
