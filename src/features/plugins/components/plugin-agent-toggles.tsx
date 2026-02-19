"use client";

import type { PluginAgent } from "@/entities/plugin";
import { Switch } from "@/shared/ui/switch";
import { useTogglePluginForAgent } from "../api/use-plugin-detail";

interface PluginAgentTogglesProps {
	pluginId: string;
	agents: PluginAgent[];
}

function AgentToggleRow({
	agent,
	pluginId,
}: {
	agent: PluginAgent;
	pluginId: string;
}) {
	const toggleAgent = useTogglePluginForAgent(pluginId);

	return (
		<div className="flex items-center justify-between py-3">
			<div className="flex items-center gap-3">
				{/* Avatar placeholder */}
				<div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
					{agent.name.charAt(0).toUpperCase()}
				</div>
				<p className="text-sm font-medium text-foreground">{agent.name}</p>
			</div>
			<Switch
				checked={agent.enabled}
				onCheckedChange={() => toggleAgent.mutate(agent.id)}
			/>
		</div>
	);
}

export function PluginAgentToggles({
	pluginId,
	agents,
}: PluginAgentTogglesProps) {
	return (
		<div className="space-y-1">
			<p className="text-sm text-muted-foreground pb-2">
				Plugins are installed workspace-wide. Toggle per-agent access below.
			</p>
			<div className="divide-y divide-border">
				{agents.map((agent) => (
					<AgentToggleRow
						key={agent.id}
						agent={agent}
						pluginId={pluginId}
					/>
				))}
			</div>
		</div>
	);
}
