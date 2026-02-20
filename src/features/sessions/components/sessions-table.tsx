"use client";

import { useMemo, useState } from "react";
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
import { SessionSlideOver } from "./session-slide-over";

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
	onRowClick: (session: CrossAgentSession) => void;
}

function AgentGroup({ agentName, sessions, onRowClick }: AgentGroupProps) {
	return (
		<Collapsible defaultOpen>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50 transition-colors">
				<span className="text-sm font-semibold">{agentName}</span>
				<Badge variant="secondary" className="text-xs">
					{sessions.length}
				</Badge>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="pl-2">
					<DataTable
						columns={groupedColumns}
						data={sessions}
						enablePagination={false}
						onRowClick={onRowClick}
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
	const [group, setGroup] = useQueryState("group", { defaultValue: "none" });
	const [selectedSession, setSelectedSession] = useState<CrossAgentSession | null>(null);

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

	const handleRowClick = (session: CrossAgentSession) => {
		setSelectedSession(session);
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
				<DataTable
					columns={columns}
					data={sortedSessions}
					enablePagination
					pageSize={10}
					onRowClick={handleRowClick}
				/>
			)}

			<SessionSlideOver
				session={selectedSession}
				open={selectedSession !== null}
				onClose={() => setSelectedSession(null)}
			/>
		</div>
	);
}
