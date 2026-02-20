"use client";

import { useState, useMemo } from "react";
import {
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format, formatDistanceStrict } from "date-fns";
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import type { AgentSession } from "@/entities/agent";
import type { CrossAgentSession } from "@/entities/session";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { SessionSlideOver } from "@/features/sessions/components/session-slide-over";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";

function truncateId(id: string): string {
	return id.length > 16 ? `${id.slice(0, 16)}...` : id;
}

function formatTokenCount(count: number): string {
	return count.toLocaleString("en-US");
}

function getStatusVariant(status: AgentSession["status"]): "default" | "secondary" | "outline" {
	switch (status) {
		case "active":
			return "default";
		case "compacted":
			return "secondary";
		case "ended":
			return "outline";
	}
}

function getStatusColor(status: AgentSession["status"]): string {
	switch (status) {
		case "active":
			return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
		case "compacted":
			return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
		case "ended":
			return "bg-muted text-muted-foreground border-border";
	}
}

function computeDuration(session: AgentSession): string {
	if (!session.endedAt) {
		return "Active";
	}
	return formatDistanceStrict(session.endedAt, session.startedAt);
}

function computeDurationMs(session: AgentSession): number {
	const end = session.endedAt ? session.endedAt.getTime() : Date.now();
	return end - session.startedAt.getTime();
}

function toSlideOverSession(
	session: AgentSession,
	agentName: string,
	agentModel: string,
): CrossAgentSession {
	return {
		...session,
		agentName,
		agentAvatar: undefined,
		model: agentModel,
	};
}

function CopyableId({ id }: { id: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		void navigator.clipboard.writeText(id);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
			title={id}
		>
			<span>{truncateId(id)}</span>
			{copied ? (
				<Check className="size-3 text-emerald-500" />
			) : (
				<Copy className="size-3 opacity-50" />
			)}
		</button>
	);
}

const columns: ColumnDef<AgentSession>[] = [
	{
		accessorKey: "id",
		header: "Session ID",
		cell: ({ row }) => <CopyableId id={row.original.id} />,
		enableSorting: false,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<Badge
					variant={getStatusVariant(status)}
					className={cn("text-xs capitalize", getStatusColor(status))}
				>
					{status}
				</Badge>
			);
		},
		filterFn: "equals",
	},
	{
		accessorKey: "startedAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Started
				<ArrowUpDown className="ml-1 size-3" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-sm">
				{format(row.original.startedAt, "MMM d, HH:mm")}
			</span>
		),
	},
	{
		id: "duration",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Duration
				<ArrowUpDown className="ml-1 size-3" />
			</Button>
		),
		accessorFn: (row) => computeDurationMs(row),
		cell: ({ row }) => (
			<span className={cn("text-sm", !row.original.endedAt && "text-emerald-500 font-medium")}>
				{computeDuration(row.original)}
			</span>
		),
	},
	{
		accessorKey: "tokenCount",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Tokens
				<ArrowUpDown className="ml-1 size-3" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-sm font-mono">{formatTokenCount(row.original.tokenCount)}</span>
		),
	},
	{
		accessorKey: "compactionCount",
		header: "Compactions",
		cell: ({ row }) => (
			<span className="text-sm">{row.original.compactionCount}</span>
		),
	},
];

function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell><Skeleton className="h-4 w-28" /></TableCell>
			<TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
			<TableCell><Skeleton className="h-4 w-24" /></TableCell>
			<TableCell><Skeleton className="h-4 w-16" /></TableCell>
			<TableCell><Skeleton className="h-4 w-16" /></TableCell>
			<TableCell><Skeleton className="h-4 w-8" /></TableCell>
		</TableRow>
	);
}

export function AgentSessionsTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Session ID</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Started</TableHead>
							<TableHead>Duration</TableHead>
							<TableHead>Tokens</TableHead>
							<TableHead>Compactions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

interface AgentSessionsTableProps {
	sessions: AgentSession[];
}

export function AgentSessionsTable({ sessions }: AgentSessionsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "startedAt", desc: true },
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedSession, setSelectedSession] = useState<CrossAgentSession | null>(null);
	const agentId = sessions[0]?.agentId ?? "";
	const agent = useAgentStore((s) => s.agents.find((a) => a.id === agentId));

	const handleRowClick = (session: AgentSession) => {
		setSelectedSession(
			toSlideOverSession(
				session,
				agent?.name ?? agentId,
				agent?.model ?? "unknown",
			),
		);
	};

	const filteredSessions = useMemo(() => {
		if (statusFilter === "all") return sessions;
		return sessions.filter((s) => s.status === statusFilter);
	}, [sessions, statusFilter]);

	const table = useReactTable({
		data: filteredSessions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		state: { sorting, columnFilters },
		initialState: { pagination: { pageSize: 10 } },
	});

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center gap-3">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Filter status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All statuses</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="compacted">Compacted</SelectItem>
						<SelectItem value="ended">Ended</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className={cn(
										"cursor-pointer hover:bg-accent/30 transition-colors",
										selectedSession?.id === row.original.id && "bg-accent/50",
									)}
									onClick={() => handleRowClick(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
									No sessions found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""} total
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="size-4" />
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>

			<SessionSlideOver
				session={selectedSession}
				open={selectedSession !== null}
				onClose={() => setSelectedSession(null)}
			/>
		</div>
	);
}
