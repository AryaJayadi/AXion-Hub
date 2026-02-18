"use client";

import { format } from "date-fns";
import type { DashboardEvent } from "@/entities/dashboard-event";
import { getEventDisplayInfo } from "@/features/dashboard/lib/event-mapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { EmptyState } from "@/shared/ui/empty-state";

interface ActivityEventDetailProps {
	event: DashboardEvent | null;
}

export function ActivityEventDetail({ event }: ActivityEventDetailProps) {
	if (!event) {
		return (
			<EmptyState
				title="No event selected"
				description="Select an event to view details"
			/>
		);
	}

	const displayInfo = getEventDisplayInfo(event.type);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-base">{displayInfo.label} Event</CardTitle>
					<StatusBadge status={event.severity} size="sm" />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Event type */}
				<div>
					<p className="text-xs font-medium text-muted-foreground">Type</p>
					<p className="text-sm">{event.type}</p>
				</div>

				{/* Timestamp */}
				<div>
					<p className="text-xs font-medium text-muted-foreground">Timestamp</p>
					<p className="text-sm">
						{format(event.timestamp, "PPpp")}
					</p>
				</div>

				{/* Source */}
				<div>
					<p className="text-xs font-medium text-muted-foreground">Source</p>
					<p className="text-sm">{event.source}</p>
				</div>

				{/* Agent ID (if present) */}
				{event.agentId && (
					<div>
						<p className="text-xs font-medium text-muted-foreground">Agent</p>
						<p className="text-sm font-mono">{event.agentId}</p>
					</div>
				)}

				{/* Summary */}
				<div>
					<p className="text-xs font-medium text-muted-foreground">Summary</p>
					<p className="text-sm">{event.summary}</p>
				</div>

				{/* Details (rendered as JSON) */}
				{event.details !== undefined && event.details !== null && (
					<div>
						<p className="text-xs font-medium text-muted-foreground">Details</p>
						<pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
							{JSON.stringify(event.details, null, 2)}
						</pre>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
