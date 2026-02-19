"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Settings, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

import type { Plugin } from "@/entities/plugin";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/action-menu";
import { useTogglePlugin, useUninstallPlugin } from "../api/use-plugins";

function PluginActionsCell({ plugin }: { plugin: Plugin }) {
	const router = useRouter();
	const togglePlugin = useTogglePlugin();
	const uninstallPlugin = useUninstallPlugin();

	const items: ActionMenuItem[] = [
		{
			label: "Configure",
			icon: <Settings className="size-4" />,
			onClick: () => router.push(`/plugins/${plugin.id}`),
		},
		{
			label: plugin.status === "active" ? "Disable" : "Enable",
			icon:
				plugin.status === "active" ? (
					<ToggleLeft className="size-4" />
				) : (
					<ToggleRight className="size-4" />
				),
			onClick: () => togglePlugin.mutate(plugin.id),
		},
		{ type: "separator" },
		{
			label: "Uninstall",
			icon: <Trash2 className="size-4" />,
			onClick: () => uninstallPlugin.mutate(plugin.id),
			variant: "destructive",
		},
	];

	return <ActionMenu items={items} />;
}

const columns: ColumnDef<Plugin, unknown>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => (
			<div className="min-w-[180px]">
				<p className="font-medium text-foreground">{row.original.name}</p>
				<p className="text-xs text-muted-foreground line-clamp-1">
					{row.original.description}
				</p>
			</div>
		),
	},
	{
		accessorKey: "version",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Version" />
		),
		cell: ({ row }) => (
			<span className="font-mono text-sm">{row.original.version}</span>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => (
			<StatusBadge status={row.original.status} size="sm" />
		),
	},
	{
		accessorKey: "lastUpdated",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Last Updated" />
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{formatDistanceToNow(row.original.lastUpdated, { addSuffix: true })}
			</span>
		),
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <PluginActionsCell plugin={row.original} />,
		enableSorting: false,
	},
];

interface PluginTableProps {
	plugins: Plugin[];
	isLoading?: boolean;
}

export function PluginTable({ plugins, isLoading = false }: PluginTableProps) {
	const router = useRouter();

	return (
		<div
			className="[&_tr[data-state]]:cursor-pointer"
			onClick={(e) => {
				const row = (e.target as HTMLElement).closest("tr[data-state]");
				if (!row) return;
				// Don't navigate if clicking action menu
				const button = (e.target as HTMLElement).closest("button");
				if (button) return;
				const index = row.getAttribute("data-index");
				if (index !== null) {
					const plugin = plugins[Number.parseInt(index, 10)];
					if (plugin) router.push(`/plugins/${plugin.id}`);
				} else {
					// Non-virtualized: use row index from siblings
					const tbody = row.closest("tbody");
					if (!tbody) return;
					const rows = Array.from(tbody.querySelectorAll("tr[data-state]"));
					const idx = rows.indexOf(row);
					const plugin = plugins[idx];
					if (plugin) router.push(`/plugins/${plugin.id}`);
				}
			}}
		>
			<DataTable
				columns={columns}
				data={plugins}
				searchKey="name"
				searchPlaceholder="Search plugins..."
				enablePagination
				pageSize={10}
				{...(isLoading ? { isLoading: true } : {})}
			/>
		</div>
	);
}
