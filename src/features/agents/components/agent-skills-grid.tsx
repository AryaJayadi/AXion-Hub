"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { Download } from "lucide-react";
import type { AgentSkill } from "@/entities/agent";

const sourceBadgeVariant: Record<AgentSkill["source"], "default" | "secondary" | "outline"> = {
	"built-in": "default",
	clawhub: "secondary",
	custom: "outline",
};

interface AgentSkillsGridProps {
	skills: AgentSkill[];
	onToggleSkill: (skillId: string, enabled: boolean) => void;
}

export function AgentSkillsGrid({ skills, onToggleSkill }: AgentSkillsGridProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{skills.map((skill) => (
					<Card key={skill.id}>
						<CardContent className="p-4 space-y-3">
							<div className="flex items-start justify-between gap-2">
								<div className="space-y-1 min-w-0">
									<h3 className="text-sm font-semibold truncate">{skill.name}</h3>
									<Badge variant={sourceBadgeVariant[skill.source]} className="text-[10px]">
										{skill.source}
									</Badge>
								</div>
								<Switch
									checked={skill.enabled}
									onCheckedChange={(checked) => onToggleSkill(skill.id, checked)}
									aria-label={`Toggle ${skill.name}`}
								/>
							</div>
							<p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="inline-block">
							<Button variant="outline" disabled>
								<Download className="size-4 mr-2" />
								Install from ClawHub
							</Button>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>ClawHub skill marketplace coming soon</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
