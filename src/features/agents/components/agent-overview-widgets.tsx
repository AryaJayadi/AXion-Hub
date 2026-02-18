"use client";

import { formatDistanceToNow } from "date-fns";
import type { Agent } from "@/entities/agent";
import { formatUptime } from "@/entities/agent";
import { cn } from "@/shared/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

interface AgentOverviewWidgetsProps {
	agent: Agent;
}

export function AgentOverviewWidgets({ agent }: AgentOverviewWidgetsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
			{/* Status Card */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"size-2 rounded-full",
								agent.status === "online" && "bg-green-500",
								agent.status === "idle" && "bg-yellow-500",
								agent.status === "working" && "bg-blue-500 animate-pulse",
								agent.status === "error" && "bg-red-500",
								agent.status === "offline" && "bg-gray-500",
							)}
						/>
						<span className="text-2xl font-bold capitalize">{agent.status}</span>
					</div>
					{agent.currentTask && (
						<p className="text-xs text-muted-foreground mt-1 truncate">
							Working on: {agent.currentTask}
						</p>
					)}
				</CardContent>
			</Card>

			{/* Model Card */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Model</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-lg font-semibold">{agent.model}</p>
				</CardContent>
			</Card>

			{/* Context Usage Card */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Context Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<span className="text-2xl font-bold">{agent.contextUsage}%</span>
						<Progress value={agent.contextUsage} />
					</div>
				</CardContent>
			</Card>

			{/* Uptime Card */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold">{formatUptime(agent.uptime)}</p>
					<p className="text-xs text-muted-foreground">
						Last active {formatDistanceToNow(agent.lastActive, { addSuffix: true })}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
