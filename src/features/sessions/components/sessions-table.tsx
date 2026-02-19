"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Layers, List } from "lucide-react";
import type { CrossAgentSession } from "@/entities/session";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { DataTable } from "@/shared/ui/data-table";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { StatusBadge } from "@/shared/ui/status-badge";

function formatTokenCount(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toLocaleString("en-US");
}

function formatDuration(session: CrossAgentSession): string {
	if (!session.endedAt) return "Active";
	const ms = session.endedAt.getTime() - session.startedAt.getTime();
	const minutes = Math.round(ms / 60000);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m`;
}

function AgentCell({
	name,
	avatar,
}: {
	name: string;
	avatar: string | undefined;
}) {
	const initials = name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return (
		<div className="flex items-center gap-2">
			<Avatar size="sm">
				{avatar ? null : <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>}
			</Avatar>
			<span className="text-sm font-medium">{name}</span>
		</div>
	);
}

const columns: ColumnDef<CrossAgentSession, unknown>[] = [
	{
		accessorKey: "agentName",
		header: "Agent",
		cell: ({ row }) => (
			<AgentCell
				name={row.original.agentName}
				avatar={row.original.agentAvatar}
			/>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge status={row.original.status} size="sm" />
		),
	},
	{
		accessorKey: "model",
		header: "Model",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground font-mono">
				{row.original.model}
			</span>
		),
	},
	{
		accessorKey: "startedAt",
		header: "Started",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{formatDistanceToNow(row.original.startedAt, { addSuffix: true })}
			</span>
		),
	},
	{
		id: "duration",
		header: "Duration",
		cell: ({ row }) => (
			<span
				className={cn(
					"text-sm",
					!row.original.endedAt && "text-emerald-500 font-medium",
				)}
			>
				{formatDuration(row.original)}
			</span>
		),
	},
	{
		accessorKey: "tokenCount",
		header: "Tokens",
		cell: ({ row }) => (
			<span className="text-sm font-mono">
				{formatTokenCount(row.original.tokenCount)}
			</span>
		),
	},
];

/** Grouped columns without agent column. */
const groupedColumns: ColumnDef<CrossAgentSession, unknown>[] = columns.filter(
	(c) => "accessorKey" in c && c.accessorKey !== "agentName",
);

interface AgentGroupProps {
	agentName: string;
	sessions: CrossAgentSession[];
	onRowClick: (sessionId: string) => void;
}

function AgentGroup({ agentName, sessions, onRowClick }: AgentGroupProps) {
	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const row = (e.target as HTMLElement).closest("tbody tr");
		if (!row) return;
		const index = Array.from(
			row.parentElement?.children ?? [],
		).indexOf(row);
		const session = sessions[index];
		if (session) {
			onRowClick(session.id);
		}
	};

	return (
		<Collapsible defaultOpen>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50 transition-colors">
				<span className="text-sm font-semibold">{agentName}</span>
				<Badge variant="secondary" className="text-xs">
					{sessions.length}
				</Badge>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="pl-2 [&_tbody_tr]:cursor-pointer [&_tbody_tr:hover]:bg-muted/50" onClick={handleClick}>
					<DataTable
						columns={groupedColumns}
						data={sessions}
						enablePagination={false}
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

interface SessionsTableProps {
	sessions: CrossAgentSession[];
	isLoading?: boolean;
}

export function SessionsTable({ sessions, isLoading }: SessionsTableProps) {
	const router = useRouter();
	const [group, setGroup] = useQueryState("group", { defaultValue: "none" });

	const sortedSessions = useMemo(
		() =>
			[...sessions].sort(
				(a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
			),
		[sessions],
	);

	const groupedByAgent = useMemo(() => {
		const map = new Map<string, CrossAgentSession[]>();
		for (const session of sortedSessions) {
			const existing = map.get(session.agentId);
			if (existing) {
				existing.push(session);
			} else {
				map.set(session.agentId, [session]);
			}
		}
		return map;
	}, [sortedSessions]);

	const handleRowClick = (sessionId: string) => {
		router.push(`/sessions/${sessionId}`);
	};

	if (isLoading) {
		return <SkeletonTable rows={8} columns={6} />;
	}

	const isGrouped = group === "agent";

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-end">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setGroup(isGrouped ? "none" : "agent")}
					className="gap-2"
				>
					{isGrouped ? (
						<>
							<List className="size-4" />
							Chronological
						</>
					) : (
						<>
							<Layers className="size-4" />
							Group by agent
						</>
					)}
				</Button>
			</div>

			{isGrouped ? (
				<div className="space-y-2">
					{Array.from(groupedByAgent.entries()).map(
						([agentId, agentSessions]) => (
							<AgentGroup
								key={agentId}
								agentName={agentSessions[0]?.agentName ?? agentId}
								sessions={agentSessions}
								onRowClick={handleRowClick}
							/>
						),
					)}
				</div>
			) : (
				<div
					className="[&_tbody_tr]:cursor-pointer [&_tbody_tr:hover]:bg-muted/50"
					onClick={(e) => {
						const row = (e.target as HTMLElement).closest("tbody tr");
						if (!row) return;
						const index = Array.from(
							row.parentElement?.children ?? [],
						).indexOf(row);
						const session = sortedSessions[index];
						if (session) {
							handleRowClick(session.id);
						}
					}}
				>
					<DataTable
						columns={columns}
						data={sortedSessions}
						enablePagination
						pageSize={10}
					/>
				</div>
			)}
		</div>
	);
}
