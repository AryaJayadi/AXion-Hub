"use client";

import { useState, Fragment, useCallback } from "react";
import { type ColumnDef, flexRender, useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from "@tanstack/react-table";
import cronstrue from "cronstrue";
import { formatDistanceToNow, format } from "date-fns";
import { ChevronRight, RotateCw, Pencil, Trash2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { StatusBadge } from "@/shared/ui/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/action-menu";
import { Textarea } from "@/shared/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

import type { CronSchedule, CronRunRecord } from "../api/use-cron-schedules";
import { useUpdateCronSchedule, useDeleteCronSchedule, useRetryCronRun } from "../api/use-cron-schedules";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CronSchedulesTableProps {
	schedules: CronSchedule[];
	isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Inline run history row
// ---------------------------------------------------------------------------

function RunHistoryRow({
	run,
	scheduleId,
}: {
	run: CronRunRecord;
	scheduleId: string;
}) {
	const [showRetryEditor, setShowRetryEditor] = useState(false);
	const [retryPayload, setRetryPayload] = useState("");
	const retryMutation = useRetryCronRun();

	const handleRetryOpen = useCallback(() => {
		setRetryPayload(
			run.payload
				? JSON.stringify(JSON.parse(run.payload), null, 2)
				: "{}",
		);
		setShowRetryEditor(true);
	}, [run.payload]);

	const handleRetryConfirm = useCallback(() => {
		retryMutation.mutate({
			scheduleId,
			runId: run.id,
			overridePayload: retryPayload,
		});
		setShowRetryEditor(false);
	}, [retryMutation, scheduleId, run.id, retryPayload]);

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-4 text-xs">
				<StatusBadge
					status={run.status}
					size="sm"
				/>
				<span className="text-muted-foreground">
					{(run.duration / 1000).toFixed(1)}s
				</span>
				<span className="text-muted-foreground">
					{format(run.startedAt, "MMM d, HH:mm:ss")}
				</span>
				<span className="text-muted-foreground">
					by {run.triggeredBy}
				</span>
				{run.status === "error" && (
					<Button
						variant="ghost"
						size="sm"
						className="h-6 px-2 text-xs"
						onClick={handleRetryOpen}
					>
						<RotateCw className="mr-1 size-3" />
						Retry
					</Button>
				)}
			</div>
			{showRetryEditor && (
				<div className="space-y-2 rounded-md border border-border bg-muted/30 p-2">
					<p className="text-xs font-medium">Edit payload before retry:</p>
					<Textarea
						value={retryPayload}
						onChange={(e) => setRetryPayload(e.target.value)}
						className="h-20 font-mono text-xs"
					/>
					<div className="flex gap-2">
						<Button
							size="sm"
							className="h-6 text-xs"
							onClick={handleRetryConfirm}
							disabled={retryMutation.isPending}
						>
							Confirm Retry
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 text-xs"
							onClick={() => setShowRetryEditor(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Table component
// ---------------------------------------------------------------------------

export function CronSchedulesTable({
	schedules,
	isLoading = false,
}: CronSchedulesTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const updateMutation = useUpdateCronSchedule();
	const deleteMutation = useDeleteCronSchedule();

	const toggleRow = useCallback((id: string) => {
		setExpandedRows((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const columns: ColumnDef<CronSchedule, unknown>[] = [
		{
			id: "expand",
			header: () => null,
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					className="size-6"
					onClick={() => toggleRow(row.original.id)}
				>
					<ChevronRight
						className={cn(
							"size-4 transition-transform",
							expandedRows.has(row.original.id) && "rotate-90",
						)}
					/>
				</Button>
			),
			size: 36,
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<span className="font-medium">{row.original.name}</span>
			),
		},
		{
			accessorKey: "workflowName",
			header: "Workflow",
			cell: ({ row }) => (
				<Link
					href={`/workflows/${row.original.workflowId}`}
					className="flex items-center gap-1 text-primary hover:underline"
				>
					<LinkIcon className="size-3" />
					{row.original.workflowName}
				</Link>
			),
		},
		{
			accessorKey: "expression",
			header: "Schedule",
			cell: ({ row }) => {
				try {
					return (
						<span className="text-sm">
							{cronstrue.toString(row.original.expression, { use24HourTimeFormat: true })}
						</span>
					);
				} catch {
					return (
						<code className="text-xs font-mono text-muted-foreground">
							{row.original.expression}
						</code>
					);
				}
			},
		},
		{
			accessorKey: "enabled",
			header: "Status",
			cell: ({ row }) => (
				<Switch
					size="sm"
					checked={row.original.enabled}
					onCheckedChange={(checked) =>
						updateMutation.mutate({
							id: row.original.id,
							enabled: checked,
						})
					}
				/>
			),
		},
		{
			accessorKey: "nextRunAt",
			header: "Next Run",
			cell: ({ row }) => (
				<span className="text-sm text-muted-foreground">
					{row.original.enabled
						? formatDistanceToNow(row.original.nextRunAt, { addSuffix: true })
						: "Disabled"}
				</span>
			),
		},
		{
			accessorKey: "lastRunAt",
			header: "Last Run",
			cell: ({ row }) => {
				if (!row.original.lastRunAt) {
					return <span className="text-sm text-muted-foreground">Never</span>;
				}
				return (
					<div className="flex items-center gap-2">
						{row.original.lastRunStatus && (
							<StatusBadge status={row.original.lastRunStatus} size="sm" />
						)}
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(row.original.lastRunAt, { addSuffix: true })}
						</span>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: () => null,
			cell: ({ row }) => {
				const schedule = row.original;
				const items: ActionMenuItem[] = [
					{
						label: "Edit",
						icon: <Pencil className="size-3.5" />,
						onClick: () => {
							// Placeholder for edit dialog
						},
					},
					{
						label: schedule.enabled ? "Disable" : "Enable",
						onClick: () =>
							updateMutation.mutate({
								id: schedule.id,
								enabled: !schedule.enabled,
							}),
					},
					{ type: "separator" },
					{
						label: "Delete",
						icon: <Trash2 className="size-3.5" />,
						variant: "destructive",
						onClick: () => deleteMutation.mutate(schedule.id),
					},
				];
				return <ActionMenu items={items} />;
			},
			size: 50,
		},
	];

	const table = useReactTable({
		data: schedules,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (isLoading) {
		return <SkeletonTable rows={5} columns={8} />;
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
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
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<Fragment key={row.id}>
								<TableRow>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
								{expandedRows.has(row.original.id) && (
									<TableRow className="bg-muted/20 hover:bg-muted/30">
										<TableCell colSpan={columns.length} className="p-4">
											<div className="space-y-2">
												<p className="text-xs font-medium text-muted-foreground mb-2">
													Run History ({row.original.runs.length} runs)
												</p>
												{row.original.runs.length === 0 ? (
													<p className="text-xs text-muted-foreground">No runs yet</p>
												) : (
													row.original.runs.slice(0, 5).map((run) => (
														<RunHistoryRow
															key={run.id}
															run={run}
															scheduleId={row.original.id}
														/>
													))
												)}
											</div>
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center text-muted-foreground"
							>
								No cron schedules found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
