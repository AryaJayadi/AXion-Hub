"use client";

import { useState, useRef, useMemo } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { Bot, ChevronDown, ChevronRight, User } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import type { AuditLogEntry } from "../api/use-audit-log";
import { AuditDetailPanel } from "./audit-detail-panel";

interface AuditLogTableProps {
	data: AuditLogEntry[];
}

/** Action badge color mapping */
const ACTION_COLORS: Record<string, string> = {
	create: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	approve: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	reject: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	login: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
	logout: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

const ROW_HEIGHT = 40;

export function AuditLogTable({ data }: AuditLogTableProps) {
	const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([]);
	const parentRef = useRef<HTMLDivElement>(null);

	const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
		() => [
			{
				accessorKey: "timestamp",
				header: "Time",
				size: 120,
				cell: ({ row }) =>
					format(row.original.timestamp, "MMM dd, HH:mm"),
			},
			{
				accessorKey: "actor",
				header: "Actor",
				size: 160,
				cell: ({ row }) => {
					const actor = row.original.actor;
					const isSystem = actor === "system";
					const Icon = isSystem ? Bot : User;
					const display =
						actor.length > 20 ? `${actor.slice(0, 20)}...` : actor;
					return (
						<span className="flex items-center gap-1.5">
							<Icon className="size-3.5 shrink-0 text-muted-foreground" />
							<span className="truncate">{display}</span>
						</span>
					);
				},
			},
			{
				accessorKey: "action",
				header: "Action",
				size: 100,
				cell: ({ row }) => {
					const action = row.original.action;
					return (
						<Badge
							variant="secondary"
							className={cn(
								"text-xs font-medium px-1.5 py-0",
								ACTION_COLORS[action],
							)}
						>
							{action}
						</Badge>
					);
				},
			},
			{
				accessorKey: "resourceType",
				header: "Resource",
				size: 200,
				cell: ({ row }) => {
					const text = `${row.original.resourceType}: ${row.original.resourceId}`;
					const display =
						text.length > 30 ? `${text.slice(0, 30)}...` : text;
					return (
						<span className="font-mono text-xs text-muted-foreground">
							{display}
						</span>
					);
				},
			},
			{
				id: "expand",
				header: "",
				size: 40,
				cell: ({ row }) => {
					const isExpanded = expandedRowId === row.original.id;
					return isExpanded ? (
						<ChevronDown className="size-4 text-muted-foreground" />
					) : (
						<ChevronRight className="size-4 text-muted-foreground" />
					);
				},
			},
		],
		[expandedRowId],
	);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const { rows } = table.getRowModel();

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const row = rows[index];
			if (row && expandedRowId === row.original.id) {
				return ROW_HEIGHT + 200; // Expanded row estimate
			}
			return ROW_HEIGHT;
		},
		overscan: 10,
	});

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div className="rounded-md border border-border">
			<div
				ref={parentRef}
				className="max-h-[600px] overflow-auto"
				style={{ contain: "strict" }}
			>
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-card">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{ width: header.getSize() }}
										className="text-xs"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{/* Top spacer */}
						{virtualItems.length > 0 && virtualItems[0]!.start > 0 && (
							<tr>
								<td
									colSpan={columns.length}
									style={{ height: virtualItems[0]!.start }}
								/>
							</tr>
						)}
						{/* Virtualized rows */}
						{virtualItems.map((virtualRow) => {
							const row = rows[virtualRow.index]!;
							const isExpanded =
								expandedRowId === row.original.id;
							return (
								<TableRow
									key={row.id}
									data-index={virtualRow.index}
									className={cn(
										"cursor-pointer text-sm",
										isExpanded && "bg-muted/30",
									)}
									onClick={() =>
										setExpandedRowId(
											isExpanded
												? null
												: row.original.id,
										)
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-2 text-sm"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})}
						{/* Expanded detail panels rendered after their parent row */}
						{virtualItems.map((virtualRow) => {
							const row = rows[virtualRow.index]!;
							if (expandedRowId !== row.original.id) return null;
							return (
								<tr key={`${row.id}-detail`}>
									<td colSpan={columns.length} className="p-0">
										<AuditDetailPanel entry={row.original} />
									</td>
								</tr>
							);
						})}
						{/* Bottom spacer */}
						{virtualItems.length > 0 && (
							<tr>
								<td
									colSpan={columns.length}
									style={{
										height:
											virtualizer.getTotalSize() -
											(virtualItems.at(-1)?.end ?? 0),
									}}
								/>
							</tr>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
