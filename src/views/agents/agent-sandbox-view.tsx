"use client";

import { AgentSandboxForm } from "@/features/agents/components/agent-sandbox-form";

interface AgentSandboxViewProps {
	agentId: string;
}

export function AgentSandboxView({ agentId }: AgentSandboxViewProps) {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-lg font-semibold">Sandbox</h1>
				<p className="text-sm text-muted-foreground">
					Configure the sandboxed execution environment for this agent. When enabled, the
					agent runs inside an isolated Docker container.
				</p>
			</div>
			<AgentSandboxForm agentId={agentId} />
		</div>
	);
}
