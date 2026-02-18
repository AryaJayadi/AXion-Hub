"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Laptop, Smartphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import type { GatewayNode, NodePlatform } from "../api/use-gateway-nodes";

/** Platform icon mapping: Laptop for desktop, Smartphone for mobile */
const PLATFORM_ICON_MAP: Record<NodePlatform, typeof Laptop> = {
	macOS: Laptop,
	Windows: Laptop,
	Linux: Laptop,
	iOS: Smartphone,
	Android: Smartphone,
};

const columns: ColumnDef<GatewayNode, unknown>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const platform = row.original.platform;
			const Icon = PLATFORM_ICON_MAP[platform];
			return (
				<div className="flex items-center gap-2">
					<Icon className="size-4 text-muted-foreground" />
					<span className="font-medium">{row.getValue("name")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "platform",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Platform" />
		),
		cell: ({ row }) => (
			<Badge variant="outline">{row.getValue("platform")}</Badge>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => (
			<StatusBadge status={row.getValue("status")} size="sm" />
		),
	},
	{
		accessorKey: "capabilities",
		header: "Capabilities",
		cell: ({ row }) => {
			const capabilities = row.getValue("capabilities") as string[];
			return (
				<div className="flex flex-wrap gap-1">
					{capabilities.map((cap) => (
						<Badge key={cap} variant="secondary" className="text-xs">
							{cap}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: "lastSeen",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Last Seen" />
		),
		cell: ({ row }) => {
			const lastSeen = row.getValue("lastSeen") as Date;
			return (
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(lastSeen, { addSuffix: true })}
				</span>
			);
		},
	},
	{
		accessorKey: "version",
		header: "Version",
		cell: ({ row }) => (
			<span className="text-sm tabular-nums text-muted-foreground">
				v{row.getValue("version")}
			</span>
		),
	},
];

interface GatewayNodesTableProps {
	data: GatewayNode[];
	isLoading?: boolean;
}

/**
 * DataTable listing connected gateway nodes with platform icons and capabilities.
 * Shared between standalone /gateway/nodes page and instance detail views.
 */
export function GatewayNodesTable({ data, isLoading }: GatewayNodesTableProps) {
	return (
		<DataTable
			columns={columns}
			data={data}
			searchKey="name"
			searchPlaceholder="Search nodes..."
			enablePagination={false}
			{...(isLoading != null ? { isLoading } : {})}
		/>
	);
}
