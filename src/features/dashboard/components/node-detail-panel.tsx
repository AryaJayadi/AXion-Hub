"use client";

import { useMemo } from "react";
import { X, Server, Cpu, MessageSquare, HardDrive, Link2 } from "lucide-react";
import type { ServiceHealth } from "@/entities/dashboard-event";
import { useActivityStore } from "@/features/dashboard";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import { ActivityEventCard } from "./activity-event-card";

const SERVICE_ICONS = {
	gateway: Server,
	provider: Cpu,
	channel: MessageSquare,
	node: HardDrive,
} as const;

interface NodeDetailPanelProps {
	service: ServiceHealth | null;
	onClose: () => void;
}

export function NodeDetailPanel({ service, onClose }: NodeDetailPanelProps) {
	if (!service) return null;

	const Icon = SERVICE_ICONS[service.type] ?? Server;

	return (
		<div className="absolute right-0 top-0 z-20 flex h-full w-80 flex-col border-l bg-card shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Icon className="size-4 text-muted-foreground" />
					<h3 className="font-semibold text-foreground">{service.name}</h3>
				</div>
				<Button variant="ghost" size="sm" onClick={onClose}>
					<X className="size-4" />
				</Button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* Health + Type */}
				<div className="flex items-center gap-3">
					<StatusBadge status={service.health} />
					<span className="text-sm capitalize text-muted-foreground">
						{service.type}
					</span>
				</div>

				{/* Metrics */}
				{service.metrics && (
					<div className="space-y-3">
						<h4 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
							Metrics
						</h4>
						<div className="grid grid-cols-3 gap-2">
							<div className="rounded-md bg-muted/50 p-2 text-center">
								<p className="text-lg font-semibold">
									{(service.metrics.uptime * 100).toFixed(1)}%
								</p>
								<p className="text-xs text-muted-foreground">Uptime</p>
							</div>
							<div className="rounded-md bg-muted/50 p-2 text-center">
								<p className="text-lg font-semibold">
									{service.metrics.latency}ms
								</p>
								<p className="text-xs text-muted-foreground">Latency</p>
							</div>
							<div className="rounded-md bg-muted/50 p-2 text-center">
								<p className="text-lg font-semibold">
									{(service.metrics.errorRate * 100).toFixed(1)}%
								</p>
								<p className="text-xs text-muted-foreground">Errors</p>
							</div>
						</div>
					</div>
				)}

				{/* Recent Events */}
				<RecentServiceEvents serviceId={service.id} serviceName={service.name} />

				{/* Connected Services */}
				{service.connectedTo.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
							Connected Services
						</h4>
						<ul className="space-y-1">
							{service.connectedTo.map((id) => (
								<li
									key={id}
									className="flex items-center gap-2 text-sm text-muted-foreground"
								>
									<Link2 className="size-3" />
									{id}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}

/** Render recent events filtered by service source or name */
function RecentServiceEvents({
	serviceId,
	serviceName,
}: {
	serviceId: string;
	serviceName: string;
}) {
	const fullEvents = useActivityStore((s) => s.fullEvents);

	const recentEvents = useMemo(() => {
		const nameLC = serviceName.toLowerCase();
		const idLC = serviceId.toLowerCase();
		return fullEvents
			.filter(
				(e) =>
					e.source.toLowerCase() === nameLC ||
					e.source.toLowerCase() === idLC ||
					e.agentId?.toLowerCase() === idLC,
			)
			.slice(0, 5);
	}, [fullEvents, serviceName, serviceId]);

	return (
		<div className="space-y-2">
			<h4 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
				Recent Events
			</h4>
			{recentEvents.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No recent events for this service
				</p>
			) : (
				<div className="space-y-1">
					{recentEvents.map((event) => (
						<ActivityEventCard key={event.id} event={event} />
					))}
				</div>
			)}
		</div>
	);
}
