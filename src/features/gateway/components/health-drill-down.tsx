"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { GatewayComponent } from "@/entities/gateway-config";
import { cn } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";

interface HealthDrillDownProps {
	components: GatewayComponent[];
	defaultOpen?: boolean | undefined;
}

/** Computes an aggregate status from a set of components */
function aggregateStatus(
	components: GatewayComponent[],
): "healthy" | "degraded" | "down" {
	if (components.some((c) => c.status === "down")) return "down";
	if (components.some((c) => c.status === "degraded")) return "degraded";
	return "healthy";
}

/**
 * Expandable component showing per-component health.
 * Displays an aggregate status badge with drill-down into individual
 * component rows showing name, status, latency, and connection count.
 */
export function HealthDrillDown({
	components,
	defaultOpen = false,
}: HealthDrillDownProps) {
	const [open, setOpen] = useState(defaultOpen);
	const aggregate = aggregateStatus(components);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<CollapsibleTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex w-full items-center justify-between rounded-md border px-4 py-3",
						"bg-card hover:bg-accent/50 transition-colors",
						"cursor-pointer",
					)}
				>
					<div className="flex items-center gap-3">
						{open ? (
							<ChevronDown className="size-4 text-muted-foreground" />
						) : (
							<ChevronRight className="size-4 text-muted-foreground" />
						)}
						<span className="text-sm font-medium">
							Component Health ({components.length})
						</span>
					</div>
					<StatusBadge status={aggregate} size="sm" />
				</button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="mt-2 space-y-1">
					{components.map((component) => (
						<ComponentRow key={component.name} component={component} />
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function ComponentRow({ component }: { component: GatewayComponent }) {
	return (
		<div className="flex items-center justify-between rounded-md border border-border/50 px-4 py-2.5">
			<div className="flex items-center gap-3">
				<StatusBadge status={component.status} size="sm" showDot />
				<span className="text-sm font-medium">{component.name}</span>
			</div>
			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				{component.latency !== undefined && (
					<span>{component.latency}ms</span>
				)}
				{component.connections !== undefined && (
					<span>{component.connections} conn</span>
				)}
				{component.details && (
					<span className="hidden max-w-48 truncate sm:inline">
						{component.details}
					</span>
				)}
			</div>
		</div>
	);
}
