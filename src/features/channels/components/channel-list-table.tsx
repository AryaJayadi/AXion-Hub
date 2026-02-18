"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
	MessageSquare,
	Send,
	Hash,
	Globe,
	Smartphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Channel, ChannelPlatform } from "@/entities/channel";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { SearchInput } from "@/shared/ui/search-input";
import { FilterBar, type FilterConfig } from "@/shared/ui/filter-bar";
import { MOCK_AGENT_OPTIONS } from "../api/use-channels";

/** Platform icon mapping */
const PLATFORM_ICONS: Record<ChannelPlatform, typeof MessageSquare> = {
	whatsapp: MessageSquare,
	telegram: Send,
	discord: Hash,
	slack: Hash,
	web: Globe,
	sms: Smartphone,
};

/** Platform display colors */
const PLATFORM_COLORS: Record<ChannelPlatform, string> = {
	whatsapp: "bg-green-500/10 text-green-600 border-green-500/30",
	telegram: "bg-blue-500/10 text-blue-600 border-blue-500/30",
	discord: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
	slack: "bg-purple-500/10 text-purple-600 border-purple-500/30",
	web: "bg-gray-500/10 text-gray-600 border-gray-500/30",
	sms: "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

function getAgentName(agentId: string | null): string {
	if (!agentId) return "Unrouted";
	const agent = MOCK_AGENT_OPTIONS.find((a) => a.id === agentId);
	return agent?.name ?? agentId;
}

const columns: ColumnDef<Channel, unknown>[] = [
	{
		accessorKey: "platform",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Platform" />
		),
		cell: ({ row }) => {
			const platform = row.original.platform;
			const Icon = PLATFORM_ICONS[platform];
			const colorClass = PLATFORM_COLORS[platform];
			return (
				<Badge variant="outline" className={colorClass}>
					<Icon className="size-3" />
					{platform.charAt(0).toUpperCase() + platform.slice(1)}
				</Badge>
			);
		},
	},
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
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
	},
	{
		accessorKey: "agentId",
		header: "Assigned Agent",
		cell: ({ row }) => {
			const name = getAgentName(row.original.agentId);
			return (
				<span
					className={
						row.original.agentId
							? "text-foreground"
							: "text-muted-foreground"
					}
				>
					{name}
				</span>
			);
		},
	},
	{
		accessorKey: "messageCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Messages" />
		),
		cell: ({ row }) => (
			<span className="tabular-nums">
				{row.original.messageCount.toLocaleString()}
			</span>
		),
	},
	{
		accessorKey: "connectedAt",
		header: "Connected Since",
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
];

const platformFilterConfig: FilterConfig = {
	key: "platform",
	label: "Platform",
	type: "multi-select",
	options: [
		{ label: "WhatsApp", value: "whatsapp" },
		{ label: "Telegram", value: "telegram" },
		{ label: "Discord", value: "discord" },
		{ label: "Slack", value: "slack" },
		{ label: "Web", value: "web" },
		{ label: "SMS", value: "sms" },
	],
};

interface ChannelListTableProps {
	channels: Channel[];
	isLoading?: boolean;
}

export function ChannelListTable({
	channels,
	isLoading,
}: ChannelListTableProps) {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState("");
	const [filterValues, setFilterValues] = useState<Record<string, unknown>>(
		{},
	);

	const handleFilterChange = useCallback((key: string, value: unknown) => {
		setFilterValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const handleFilterClear = useCallback(() => {
		setFilterValues({});
	}, []);

	const filteredChannels = useMemo(() => {
		let result = channels;

		// Search filter
		if (searchValue) {
			const lower = searchValue.toLowerCase();
			result = result.filter((ch) =>
				ch.name.toLowerCase().includes(lower),
			);
		}

		// Platform filter
		const platforms = filterValues.platform as string[] | undefined;
		if (platforms && platforms.length > 0) {
			result = result.filter((ch) => platforms.includes(ch.platform));
		}

		return result;
	}, [channels, searchValue, filterValues]);

	// Wrap columns in useMemo so row click handler uses fresh router
	const clickableColumns = useMemo(
		() => columns,
		[],
	);

	return (
		<div className="space-y-4">
			{/* Toolbar: search + filters */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<SearchInput
					value={searchValue}
					onChange={setSearchValue}
					placeholder="Search channels..."
					className="w-full sm:max-w-sm"
				/>
			</div>

			<FilterBar
				filters={[platformFilterConfig]}
				values={filterValues}
				onChange={handleFilterChange}
				onClear={handleFilterClear}
			/>

			<div
				className="[&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/50"
				onClick={(e) => {
					const row = (e.target as HTMLElement).closest("tr");
					if (!row) return;
					const index = row.getAttribute("data-index");
					// For non-virtualized: use row position in filtered list
					const rowIndex = index
						? Number.parseInt(index, 10)
						: Array.from(
								row.parentElement?.children ?? [],
							).indexOf(row);
					const channel = filteredChannels[rowIndex];
					if (channel) {
						router.push(`/channels/${channel.id}`);
					}
				}}
			>
				<DataTable
					columns={clickableColumns}
					data={filteredChannels}
					{...(isLoading != null ? { isLoading } : {})}
					enablePagination={true}
					pageSize={25}
				/>
			</div>
		</div>
	);
}
