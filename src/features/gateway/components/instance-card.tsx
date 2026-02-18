"use client";

import { useRouter } from "next/navigation";
import { formatDistanceStrict } from "date-fns";
import { Clock, Server, Users } from "lucide-react";
import type { GatewayInstance } from "@/entities/gateway-config";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

interface InstanceCardProps {
	instance: GatewayInstance;
}

/** Formats uptime in seconds to a human-readable distance string */
function formatUptime(seconds: number): string {
	const now = new Date();
	const startDate = new Date(now.getTime() - seconds * 1000);
	return formatDistanceStrict(startDate, now);
}

/**
 * Card for a single gateway instance.
 * Shows name, aggregate status, uptime, version, connected agents.
 * Click navigates to instance detail page.
 */
export function InstanceCard({ instance }: InstanceCardProps) {
	const router = useRouter();

	return (
		<Card
			className="cursor-pointer transition-shadow hover:shadow-md"
			onClick={() => router.push(`/gateway/instances/${instance.id}`)}
			role="link"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					router.push(`/gateway/instances/${instance.id}`);
				}
			}}
		>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<Server className="size-4 text-muted-foreground" />
						{instance.name}
					</CardTitle>
					<StatusBadge status={instance.status} size="sm" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-3">
					<div className="space-y-0.5">
						<p className="text-xs text-muted-foreground flex items-center gap-1">
							<Clock className="size-3" />
							Uptime
						</p>
						<p className="text-sm font-medium">
							{formatUptime(instance.uptime)}
						</p>
					</div>
					<div className="space-y-0.5">
						<p className="text-xs text-muted-foreground">Version</p>
						<p className="text-sm font-medium">v{instance.version}</p>
					</div>
					<div className="space-y-0.5">
						<p className="text-xs text-muted-foreground flex items-center gap-1">
							<Users className="size-3" />
							Agents
						</p>
						<p className="text-sm font-medium">{instance.connectedAgents}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
