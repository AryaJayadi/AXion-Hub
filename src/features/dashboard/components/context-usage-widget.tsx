"use client";

import { useMemo } from "react";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/cn";

/**
 * Return the color class for the Progress indicator based on usage %.
 *
 * green < 60%, yellow 60-80%, red > 80%
 */
function getUsageColorClass(usage: number): string {
	if (usage > 80) return "[&_[data-slot=progress-indicator]]:bg-red-500";
	if (usage >= 60) return "[&_[data-slot=progress-indicator]]:bg-yellow-500";
	return "[&_[data-slot=progress-indicator]]:bg-green-500";
}

/**
 * Context usage widget showing per-agent horizontal progress bars.
 *
 * Color shifts green -> yellow -> red as context fills.
 * Sorted by usage descending so the fullest agent is at top.
 * Only shows active agents (not offline).
 */
export function ContextUsageWidget() {
	const agents = useAgentStore((s) => s.agents);

	const activeAgents = useMemo(() => {
		return agents
			.filter((a) => a.status !== "offline")
			.sort((a, b) => b.contextUsage - a.contextUsage);
	}, [agents]);

	if (activeAgents.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No active agents to display.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{activeAgents.map((agent) => (
				<div key={agent.id} className="flex flex-col gap-1">
					<div className="flex items-center justify-between text-xs">
						<span className="truncate font-medium max-w-[140px]">
							{agent.name}
						</span>
						<span className="text-muted-foreground tabular-nums">
							{agent.contextUsage}%
						</span>
					</div>
					<Progress
						value={agent.contextUsage}
						className={cn("h-2", getUsageColorClass(agent.contextUsage))}
					/>
				</div>
			))}
		</div>
	);
}
