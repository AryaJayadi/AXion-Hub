"use client";

import { useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/cn";
import type { AgentLogEntry } from "@/entities/agent";

const eventTypeBadge: Record<
	AgentLogEntry["eventType"],
	{ label: string; className: string }
> = {
	tool_call: {
		label: "Tool Call",
		className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	},
	message: {
		label: "Message",
		className: "bg-green-500/10 text-green-500 border-green-500/20",
	},
	error: {
		label: "Error",
		className: "bg-red-500/10 text-red-500 border-red-500/20",
	},
	status_change: {
		label: "Status",
		className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	},
	compaction: {
		label: "Compaction",
		className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
	},
};

const statusBadgeVariant: Record<AgentLogEntry["status"], "default" | "destructive" | "secondary"> =
	{
		success: "default",
		error: "destructive",
		pending: "secondary",
	};

interface AgentLogsTableProps {
	logs: AgentLogEntry[];
}

export function AgentLogsTable({ logs }: AgentLogsTableProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [filter, setFilter] = useState<string>("all");
	const [expandedRow, setExpandedRow] = useState<string | null>(null);

	const filteredLogs = useMemo(() => {
		if (filter === "all") return logs;
		return logs.filter((log) => log.eventType === filter);
	}, [logs, filter]);

	const virtualizer = useVirtualizer({
		count: filteredLogs.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40,
		overscan: 10,
	});

	return (
		<div className="space-y-4">
			{/* Filter */}
			<div className="flex items-center gap-4">
				<Select value={filter} onValueChange={setFilter}>
					<SelectTrigger className="w-44">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Events</SelectItem>
						<SelectItem value="tool_call">Tool Calls</SelectItem>
						<SelectItem value="message">Messages</SelectItem>
						<SelectItem value="error">Errors</SelectItem>
						<SelectItem value="status_change">Status Changes</SelectItem>
						<SelectItem value="compaction">Compactions</SelectItem>
					</SelectContent>
				</Select>
				<span className="text-xs text-muted-foreground">
					{filteredLogs.length} entries
				</span>
			</div>

			{/* Header */}
			<div className="grid grid-cols-[140px_100px_1fr_80px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
				<span>Timestamp</span>
				<span>Event Type</span>
				<span>Summary</span>
				<span>Status</span>
			</div>

			{/* Virtual scrolled list */}
			<div
				ref={parentRef}
				className="h-[calc(100vh-16rem)] overflow-auto"
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const log = filteredLogs[virtualRow.index];
						if (!log) return null;

						const isExpanded = expandedRow === log.id;
						const typeConfig = eventTypeBadge[log.eventType];

						return (
							<div
								key={log.id}
								data-index={virtualRow.index}
								ref={virtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<button
									type="button"
									onClick={() =>
										setExpandedRow(isExpanded ? null : log.id)
									}
									className={cn(
										"grid grid-cols-[140px_100px_1fr_80px] gap-2 w-full items-center px-3 py-2 text-sm text-left hover:bg-accent/50 transition-colors rounded",
										isExpanded && "bg-accent/30",
									)}
								>
									<span className="text-xs text-muted-foreground tabular-nums">
										{formatDistanceToNow(log.timestamp, {
											addSuffix: true,
										})}
									</span>
									<span>
										<Badge
											variant="outline"
											className={typeConfig.className}
										>
											{typeConfig.label}
										</Badge>
									</span>
									<span className="truncate">{log.summary}</span>
									<span>
										<Badge variant={statusBadgeVariant[log.status]}>
											{log.status}
										</Badge>
									</span>
								</button>
								{isExpanded && log.details != null && (
									<div className="px-3 pb-2 pl-[140px]">
										<pre className="text-xs text-muted-foreground bg-muted/50 rounded p-2 overflow-x-auto">
											{JSON.stringify(log.details, null, 2)}
										</pre>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
