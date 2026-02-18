"use client";

import { AgentChannelsTable } from "@/features/agents/components/agent-channels-table";

interface AgentChannelsViewProps {
	agentId: string;
}

export function AgentChannelsView({ agentId }: AgentChannelsViewProps) {
	void agentId; // used once gateway is wired
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-lg font-semibold">Channels</h1>
				<p className="text-sm text-muted-foreground">
					View channel routing for this agent. Channels determine how this agent receives
					and sends messages across different platforms.
				</p>
			</div>
			<AgentChannelsTable />
		</div>
	);
}
