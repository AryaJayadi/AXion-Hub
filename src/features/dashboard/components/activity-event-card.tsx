"use client";

import { formatDistanceToNow } from "date-fns";
import {
	Activity,
	Bot,
	Cog,
	MessageSquare,
	Wifi,
	type LucideIcon,
} from "lucide-react";
import type { DashboardEvent } from "@/entities/dashboard-event";
import { getEventDisplayInfo } from "@/features/dashboard/lib/event-mapper";
import { cn } from "@/shared/lib/cn";

const iconMap: Record<string, LucideIcon> = {
	Bot,
	MessageSquare,
	Cog,
	Wifi,
	Activity,
};

const colorMap: Record<string, string> = {
	blue: "border-l-blue-500 bg-blue-500/10",
	green: "border-l-green-500 bg-green-500/10",
	orange: "border-l-orange-500 bg-orange-500/10",
	purple: "border-l-purple-500 bg-purple-500/10",
	gray: "border-l-muted-foreground bg-muted/50",
};

const iconColorMap: Record<string, string> = {
	blue: "text-blue-500",
	green: "text-green-500",
	orange: "text-orange-500",
	purple: "text-purple-500",
	gray: "text-muted-foreground",
};

const severityDot: Record<string, string> = {
	info: "bg-blue-400",
	warning: "bg-yellow-400",
	error: "bg-red-400",
};

interface ActivityEventCardProps {
	event: DashboardEvent;
}

export function ActivityEventCard({ event }: ActivityEventCardProps) {
	const displayInfo = getEventDisplayInfo(event.type);
	const Icon = iconMap[displayInfo.icon] ?? Activity;
	const borderColor = colorMap[displayInfo.color] ?? colorMap.gray;
	const iconColor = iconColorMap[displayInfo.color] ?? iconColorMap.gray;
	const dotColor = severityDot[event.severity] ?? severityDot.info;

	return (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-md border-l-2 px-3 py-2 transition-colors hover:bg-accent/50",
				borderColor,
			)}
		>
			{/* Icon */}
			<div
				className={cn(
					"flex size-7 shrink-0 items-center justify-center rounded-md",
					iconColor,
				)}
			>
				<Icon className="size-4" />
			</div>

			{/* Summary */}
			<p className="min-w-0 flex-1 truncate text-sm text-foreground">
				{event.summary}
			</p>

			{/* Severity dot */}
			<span
				className={cn("size-1.5 shrink-0 rounded-full", dotColor)}
				title={event.severity}
			/>

			{/* Timestamp */}
			<time
				className="shrink-0 text-xs text-muted-foreground"
				dateTime={event.timestamp.toISOString()}
				title={event.timestamp.toLocaleString()}
			>
				{formatDistanceToNow(event.timestamp, { addSuffix: true })}
			</time>
		</div>
	);
}
