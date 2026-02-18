"use client";

import { useState, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
	MessageSquare,
	Send,
	Hash,
	Globe,
	Smartphone,
	Pencil,
	Check,
	X,
	Plus,
} from "lucide-react";
import type { Channel, ChannelPlatform, ChannelRouting } from "@/entities/channel";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useUpdateRouting } from "../api/use-channel-routing";
import { MOCK_AGENT_OPTIONS } from "../api/use-channels";
import { toast } from "sonner";

const PLATFORM_ICONS: Record<ChannelPlatform, typeof MessageSquare> = {
	whatsapp: MessageSquare,
	telegram: Send,
	discord: Hash,
	slack: Hash,
	web: Globe,
	sms: Smartphone,
};

function getChannelName(
	channelId: string,
	channels: Channel[],
): { name: string; platform: ChannelPlatform } | null {
	const ch = channels.find((c) => c.id === channelId);
	if (!ch) return null;
	return { name: ch.name, platform: ch.platform };
}

function getAgentName(agentId: string): string {
	const agent = MOCK_AGENT_OPTIONS.find((a) => a.id === agentId);
	return agent?.name ?? agentId;
}

/** Row data combining routing + channel info */
interface RoutingRow {
	channelId: string;
	channelName: string;
	platform: ChannelPlatform;
	agentId: string;
	agentName: string;
	rule: string;
	priority: number;
}

interface RoutingTableProps {
	routing: ChannelRouting[];
	channels: Channel[];
}

export function RoutingTable({ routing, channels }: RoutingTableProps) {
	const updateRouting = useUpdateRouting();
	const [editingRow, setEditingRow] = useState<string | null>(null);
	const [editAgent, setEditAgent] = useState("");
	const [editRule, setEditRule] = useState("");

	const rows: RoutingRow[] = routing.map((r) => {
		const ch = getChannelName(r.channelId, channels);
		return {
			channelId: r.channelId,
			channelName: ch?.name ?? r.channelId,
			platform: ch?.platform ?? "web",
			agentId: r.agentId,
			agentName: getAgentName(r.agentId),
			rule: r.rule,
			priority: r.priority,
		};
	});

	const handleStartEdit = useCallback((row: RoutingRow) => {
		setEditingRow(row.channelId);
		setEditAgent(row.agentId);
		setEditRule(row.rule);
	}, []);

	const handleCancelEdit = useCallback(() => {
		setEditingRow(null);
		setEditAgent("");
		setEditRule("");
	}, []);

	const handleSaveEdit = useCallback(
		(channelId: string) => {
			updateRouting.mutate({
				channelId,
				agentId: editAgent,
				rule: editRule,
			});
			setEditingRow(null);
		},
		[editAgent, editRule, updateRouting],
	);

	const handleAddRule = useCallback(() => {
		toast.info("Add routing rule", {
			description: "New rule creation will be available when connected to gateway.",
		});
	}, []);

	const columns: ColumnDef<RoutingRow, unknown>[] = [
		{
			accessorKey: "channelName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Channel" />
			),
			cell: ({ row }) => {
				const Icon = PLATFORM_ICONS[row.original.platform];
				return (
					<div className="flex items-center gap-2">
						<Icon className="size-4 text-muted-foreground" />
						<span className="font-medium">
							{row.original.channelName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "agentName",
			header: "Agent",
			cell: ({ row }) => {
				if (editingRow === row.original.channelId) {
					return (
						<Select
							value={editAgent}
							onValueChange={setEditAgent}
						>
							<SelectTrigger className="h-8 w-[140px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MOCK_AGENT_OPTIONS.map((a) => (
									<SelectItem key={a.id} value={a.id}>
										{a.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				}
				return <span>{row.original.agentName}</span>;
			},
		},
		{
			accessorKey: "rule",
			header: "Routing Rule",
			cell: ({ row }) => {
				if (editingRow === row.original.channelId) {
					return (
						<Input
							value={editRule}
							onChange={(e) => setEditRule(e.target.value)}
							className="h-8 w-[200px]"
						/>
					);
				}
				return (
					<span className="text-muted-foreground">
						{row.original.rule}
					</span>
				);
			},
		},
		{
			accessorKey: "priority",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Priority" />
			),
			cell: ({ row }) => (
				<Badge variant="outline" className="tabular-nums">
					{row.original.priority}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				if (editingRow === row.original.channelId) {
					return (
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={() =>
									handleSaveEdit(row.original.channelId)
								}
								disabled={updateRouting.isPending}
							>
								<Check className="size-4 text-green-600" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={handleCancelEdit}
							>
								<X className="size-4 text-muted-foreground" />
							</Button>
						</div>
					);
				}
				return (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleStartEdit(row.original)}
					>
						<Pencil className="mr-1 size-3" />
						Edit
					</Button>
				);
			},
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Button variant="outline" size="sm" onClick={handleAddRule}>
					<Plus className="mr-1 size-3" />
					Add Routing Rule
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={rows}
				enablePagination={false}
			/>
		</div>
	);
}
