"use client";

import { AlertCircle } from "lucide-react";
import { useAgentSessions } from "@/features/agents/api/use-agent-sessions";
import {
	AgentSessionsTable,
	AgentSessionsTableSkeleton,
} from "@/features/agents/components/agent-sessions-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface AgentSessionsViewProps {
	agentId: string;
}

export function AgentSessionsView({ agentId }: AgentSessionsViewProps) {
	const { sessions, isLoading, error } = useAgentSessions(agentId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<h2 className="text-xl font-semibold">Sessions</h2>
				</div>
				<AgentSessionsTableSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load sessions</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<h2 className="text-xl font-semibold">Sessions</h2>
				<Badge variant="secondary">{sessions.length}</Badge>
			</div>
			<AgentSessionsTable sessions={sessions} />
		</div>
	);
}
