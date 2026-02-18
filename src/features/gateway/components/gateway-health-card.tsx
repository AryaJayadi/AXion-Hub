"use client";

import { formatDistanceStrict } from "date-fns";
import { Activity, Clock, Cpu, Users } from "lucide-react";
import type { GatewayHealth } from "@/entities/gateway-config";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

interface GatewayHealthCardProps {
	health: GatewayHealth;
	connectedAgents?: number | undefined;
}

/** Formats uptime in seconds to a human-readable distance string */
function formatUptime(seconds: number): string {
	const now = new Date();
	const startDate = new Date(now.getTime() - seconds * 1000);
	return formatDistanceStrict(startDate, now);
}

export function GatewayHealthCard({
	health,
	connectedAgents,
}: GatewayHealthCardProps) {
	const healthyComponents = health.components.filter(
		(c) => c.status === "healthy",
	).length;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Activity className="size-5 text-muted-foreground" />
						Gateway Health
					</CardTitle>
					<StatusBadge status={health.status} size="lg" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">Version</p>
						<p className="text-sm font-semibold">v{health.version}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
							<Clock className="size-3" />
							Uptime
						</p>
						<p className="text-sm font-semibold">{formatUptime(health.uptime)}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
							<Cpu className="size-3" />
							Components
						</p>
						<p className="text-sm font-semibold">
							{healthyComponents}/{health.components.length} healthy
						</p>
					</div>
					{connectedAgents !== undefined && (
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
								<Users className="size-3" />
								Agents
							</p>
							<p className="text-sm font-semibold">{connectedAgents} connected</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
