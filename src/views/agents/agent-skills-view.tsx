"use client";

import { AlertCircle } from "lucide-react";
import { useAgentSkills } from "@/features/agents/api/use-agent-skills";
import { AgentSkillsGrid } from "@/features/agents/components/agent-skills-grid";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface AgentSkillsViewProps {
	agentId: string;
}

function SkillsSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-32" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
			</div>
		</div>
	);
}

export function AgentSkillsView({ agentId }: AgentSkillsViewProps) {
	const { skills, isLoading, error, toggleSkill } = useAgentSkills(agentId);

	if (isLoading) {
		return <SkillsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load skills</h2>
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
				<h1 className="text-lg font-semibold">Skills</h1>
				<p className="text-sm text-muted-foreground">
					Manage installed skills for this agent. Enable or disable skills to control agent
					capabilities.
				</p>
			</div>
			<AgentSkillsGrid skills={skills} onToggleSkill={toggleSkill} />
		</div>
	);
}
