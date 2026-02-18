"use client";

import { AgentToolsConfig } from "@/features/agents/components/agent-tools-config";

interface AgentToolsViewProps {
	agentId: string;
}

export function AgentToolsView({ agentId }: AgentToolsViewProps) {
	void agentId; // used once gateway is wired
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-lg font-semibold">Tools</h1>
				<p className="text-sm text-muted-foreground">
					Configure which tools this agent can use. Toggle tools between allowed and denied
					lists, and set elevated access permissions.
				</p>
			</div>
			<AgentToolsConfig />
		</div>
	);
}
