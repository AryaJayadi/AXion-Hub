"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
	MessageSquare,
	Send,
	Hash,
	Globe,
	Smartphone,
	ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Channel, ChannelPlatform } from "@/entities/channel";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

const PLATFORM_ICONS: Record<ChannelPlatform, typeof MessageSquare> = {
	whatsapp: MessageSquare,
	telegram: Send,
	discord: Hash,
	slack: Hash,
	web: Globe,
	sms: Smartphone,
};

const columns: ColumnDef<Channel, unknown>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => (
			<span className="font-medium">{row.original.name}</span>
		),
	},
	{
		accessorKey: "platform",
		header: "Platform",
		cell: ({ row }) => {
			const platform = row.original.platform;
			const Icon = PLATFORM_ICONS[platform];
			return (
				<Badge variant="outline" className="gap-1 capitalize">
					<Icon className="size-3" />
					{platform}
				</Badge>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
	},
	{
		accessorKey: "connectedAt",
		header: "Last Active",
		cell: ({ row }) => {
			const date = row.original.connectedAt;
			if (!date) return <span className="text-muted-foreground">--</span>;
			return (
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(date, { addSuffix: true })}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<Button variant="ghost" size="sm" asChild>
				<Link href={`/channels/${row.original.id}`}>
					Manage
					<ExternalLink className="ml-1 size-3" />
				</Link>
			</Button>
		),
	},
];

interface GatewayChannelsTableProps {
	channels: Channel[];
	isLoading?: boolean;
}

export function GatewayChannelsTable({
	channels,
	isLoading,
}: GatewayChannelsTableProps) {
	return (
		<DataTable
			columns={columns}
			data={channels}
			searchKey="name"
			searchPlaceholder="Search channels..."
			{...(isLoading != null ? { isLoading } : {})}
			enablePagination={true}
			pageSize={25}
		/>
	);
}
