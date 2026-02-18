"use client";

import { AlertCircle } from "lucide-react";
import { useAgentLogs } from "@/features/agents/api/use-agent-logs";
import { AgentLogsTable } from "@/features/agents/components/agent-logs-table";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface AgentLogsViewProps {
	agentId: string;
}

function LogsSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-8 w-40" />
			<Skeleton className="h-10 w-44" />
			<div className="space-y-2">
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		</div>
	);
}

export function AgentLogsView({ agentId }: AgentLogsViewProps) {
	const { logs, isLoading, error } = useAgentLogs(agentId);

	if (isLoading) {
		return <LogsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load logs</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-lg font-semibold">Activity Logs</h1>
				<p className="text-sm text-muted-foreground">
					{logs.length} log entries recorded for this agent.
				</p>
			</div>
			<AgentLogsTable logs={logs} />
		</div>
	);
}
