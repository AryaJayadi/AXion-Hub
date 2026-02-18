"use client";

import { formatDistanceStrict } from "date-fns";
import { Clock, Server, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { GatewayInstance } from "@/entities/gateway-config";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { DataTable } from "@/shared/ui/data-table";
import { HealthDrillDown } from "./health-drill-down";

interface InstanceDetailPanelProps {
	instance: GatewayInstance;
}

/** Formats uptime in seconds to a human-readable distance string */
function formatUptime(seconds: number): string {
	const now = new Date();
	const startDate = new Date(now.getTime() - seconds * 1000);
	return formatDistanceStrict(startDate, now);
}

/** Mock gateway node type */
interface GatewayNode {
	id: string;
	name: string;
	platform: string;
	capabilities: string[];
	status: "online" | "offline";
}

/** Mock gateway nodes */
const MOCK_NODES: GatewayNode[] = [
	{
		id: "node-001",
		name: "MacBook Pro (Primary)",
		platform: "macOS",
		capabilities: ["code-execution", "file-system", "shell"],
		status: "online",
	},
	{
		id: "node-002",
		name: "iPhone 15 Pro",
		platform: "iOS",
		capabilities: ["notifications", "shortcuts"],
		status: "online",
	},
	{
		id: "node-003",
		name: "Pixel 8",
		platform: "Android",
		capabilities: ["notifications", "tasker"],
		status: "offline",
	},
];

const nodeColumns: ColumnDef<GatewayNode, unknown>[] = [
	{
		accessorKey: "name",
		header: "Node",
	},
	{
		accessorKey: "platform",
		header: "Platform",
	},
	{
		accessorKey: "capabilities",
		header: "Capabilities",
		cell: ({ row }) => {
			const caps = row.getValue<string[]>("capabilities");
			return caps.join(", ");
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue<string>("status");
			return <StatusBadge status={status} size="sm" />;
		},
	},
];

/**
 * Full detail view for a single gateway instance.
 * Shows instance header with status/version/uptime, component health
 * drill-down, and a gateway nodes table.
 */
export function InstanceDetailPanel({ instance }: InstanceDetailPanelProps) {
	const components = Object.values(instance.components);

	return (
		<div className="space-y-6">
			{/* Instance header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Server className="size-5 text-muted-foreground" />
							{instance.name}
						</CardTitle>
						<StatusBadge status={instance.status} size="lg" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">
								Version
							</p>
							<p className="text-sm font-semibold">v{instance.version}</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
								<Clock className="size-3" />
								Uptime
							</p>
							<p className="text-sm font-semibold">
								{formatUptime(instance.uptime)}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
								<Users className="size-3" />
								Connected Agents
							</p>
							<p className="text-sm font-semibold">
								{instance.connectedAgents}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">
								Components
							</p>
							<p className="text-sm font-semibold">{components.length}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Component health drill-down */}
			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-foreground">
					Component Health
				</h3>
				<HealthDrillDown components={components} defaultOpen />
			</div>

			{/* Gateway nodes */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Gateway Nodes</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={nodeColumns}
						data={MOCK_NODES}
						enablePagination={false}
						enableVirtualization={false}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
