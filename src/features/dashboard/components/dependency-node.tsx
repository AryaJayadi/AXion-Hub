"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Server, Cpu, MessageSquare, HardDrive } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/shared/lib/cn";
import type { DependencyNodeData } from "@/features/dashboard/lib/dagre-layout";

const BORDER_COLORS: Record<string, string> = {
	healthy: "border-green-500",
	degraded: "border-yellow-500",
	down: "border-red-500",
};

const SERVICE_ICONS = {
	gateway: Server,
	provider: Cpu,
	channel: MessageSquare,
	node: HardDrive,
} as const;

function DependencyNodeComponent({ data }: NodeProps) {
	const nodeData = data as unknown as DependencyNodeData;
	const Icon = SERVICE_ICONS[nodeData.type] ?? Server;
	const borderColor = BORDER_COLORS[nodeData.health] ?? BORDER_COLORS.healthy;

	return (
		<>
			<Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
			<div
				className={cn(
					"flex w-[200px] flex-col gap-2 rounded-lg border-2 bg-card p-3 shadow-sm",
					borderColor,
				)}
			>
				{/* Header: icon + name */}
				<div className="flex items-center gap-2">
					<Icon className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate text-sm font-semibold text-foreground">
						{nodeData.label}
					</span>
				</div>

				{/* Health badge */}
				<StatusBadge status={nodeData.health} size="sm" />

				{/* Latency metric if available */}
				{nodeData.metrics && (
					<p className="text-xs text-muted-foreground">
						{nodeData.metrics.latency}ms latency
					</p>
				)}
			</div>
			<Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
		</>
	);
}

export const DependencyNode = memo(DependencyNodeComponent);
