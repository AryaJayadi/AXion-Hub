"use client";

import type { SkillDetailAgent } from "@/entities/skill";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Switch } from "@/shared/ui/switch";
import { useToggleSkillForAgent } from "../api/use-skill-detail";

interface SkillAgentTogglesProps {
	skillId: string;
	agents: SkillDetailAgent[];
}

export function SkillAgentToggles({
	skillId,
	agents,
}: SkillAgentTogglesProps) {
	const toggleMutation = useToggleSkillForAgent();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-semibold">Agent Access</h2>
			<div className="space-y-2">
				{agents.map((agent) => (
					<div
						key={agent.id}
						className="flex items-center justify-between rounded-lg border p-3"
					>
						<div className="flex items-center gap-3">
							<Avatar className="size-8">
								<AvatarFallback className="text-xs">
									{agent.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">
								{agent.name}
							</span>
						</div>
						<Switch
							checked={agent.enabled}
							onCheckedChange={(checked) =>
								toggleMutation.mutate({
									skillId,
									agentId: agent.id,
									enabled: checked,
								})
							}
							aria-label={`Toggle ${agent.name}`}
						/>
					</div>
				))}
			</div>
			{agents.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No agents available. Create agents first to assign this skill.
				</p>
			)}
		</div>
	);
}
