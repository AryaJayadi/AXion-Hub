"use client";

import { useState, Fragment, useCallback } from "react";
import {
	type ColumnDef,
	flexRender,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
	ChevronRight,
	Copy,
	RotateCw,
	Trash2,
	RefreshCw,
	Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
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

import type { WebhookEndpoint, WebhookRunRecord } from "../api/use-webhooks";
import {
	useUpdateWebhook,
	useDeleteWebhook,
	useRetryWebhookRun,
	useRegenerateWebhookSecret,
} from "../api/use-webhooks";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WebhookTableProps {
	webhooks: WebhookEndpoint[];
	isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string, label: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(`${label} copied!`);
	} catch {
		toast.error("Failed to copy");
	}
}

// ---------------------------------------------------------------------------
// Inline run history row
// ---------------------------------------------------------------------------

function WebhookRunHistoryRow({
	run,
	webhookId,
}: {
	run: WebhookRunRecord;
	webhookId: string;
}) {
	const [showRetryEditor, setShowRetryEditor] = useState(false);
	const [retryPayload, setRetryPayload] = useState("");
	const retryMutation = useRetryWebhookRun();

	const handleRetryOpen = useCallback(() => {
		try {
			setRetryPayload(JSON.stringify(JSON.parse(run.payload), null, 2));
		} catch {
			setRetryPayload(run.payload);
		}
		setShowRetryEditor(true);
	}, [run.payload]);

	const handleRetryConfirm = useCallback(() => {
		retryMutation.mutate({
			webhookId,
			runId: run.id,
			overridePayload: retryPayload,
		});
		setShowRetryEditor(false);
	}, [retryMutation, webhookId, run.id, retryPayload]);

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-4 text-xs">
				<StatusBadge status={run.status} size="sm" />
				<span className="text-muted-foreground">
					{(run.duration / 1000).toFixed(1)}s
				</span>
				<span className="text-muted-foreground">
					{format(run.startedAt, "MMM d, HH:mm:ss")}
				</span>
				<span className="font-mono text-muted-foreground">
					{run.sourceIp}
				</span>
				<span className="max-w-[200px] truncate font-mono text-muted-foreground">
					{run.payload}
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
					<p className="text-xs font-medium">
						Edit payload before retry:
					</p>
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

export function WebhookTable({
	webhooks,
	isLoading = false,
}: WebhookTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const updateMutation = useUpdateWebhook();
	const deleteMutation = useDeleteWebhook();
	const regenerateMutation = useRegenerateWebhookSecret();

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

	const columns: ColumnDef<WebhookEndpoint, unknown>[] = [
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
			accessorKey: "url",
			header: "URL",
			cell: ({ row }) => {
				const url = row.original.url;
				const truncated =
					url.length > 40 ? `${url.slice(0, 40)}...` : url;
				return (
					<div className="flex items-center gap-1.5">
						<code className="max-w-[220px] truncate text-xs font-mono">
							{truncated}
						</code>
						<Button
							variant="ghost"
							size="icon"
							className="size-5"
							onClick={() => void copyToClipboard(url, "URL")}
						>
							<Copy className="size-3" />
						</Button>
					</div>
				);
			},
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
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<StatusBadge status={row.original.status} size="sm" />
			),
		},
		{
			accessorKey: "lastTriggeredAt",
			header: "Last Triggered",
			cell: ({ row }) =>
				row.original.lastTriggeredAt ? (
					<span className="text-sm text-muted-foreground">
						{formatDistanceToNow(row.original.lastTriggeredAt, {
							addSuffix: true,
						})}
					</span>
				) : (
					<span className="text-sm text-muted-foreground">Never</span>
				),
		},
		{
			id: "actions",
			header: () => null,
			cell: ({ row }) => {
				const webhook = row.original;
				const items: ActionMenuItem[] = [
					{
						label: "Copy URL",
						icon: <Copy className="size-3.5" />,
						onClick: () => void copyToClipboard(webhook.url, "URL"),
					},
					{
						label: "Copy Secret",
						icon: <Copy className="size-3.5" />,
						onClick: () =>
							void copyToClipboard(webhook.secret, "Secret"),
					},
					{
						label:
							webhook.status === "active" ? "Disable" : "Enable",
						onClick: () =>
							updateMutation.mutate({
								id: webhook.id,
								status:
									webhook.status === "active"
										? "disabled"
										: "active",
							}),
					},
					{
						label: "Regenerate Secret",
						icon: <RefreshCw className="size-3.5" />,
						onClick: () =>
							regenerateMutation.mutate(webhook.id),
					},
					{ type: "separator" },
					{
						label: "Delete",
						icon: <Trash2 className="size-3.5" />,
						variant: "destructive",
						onClick: () => deleteMutation.mutate(webhook.id),
					},
				];
				return <ActionMenu items={items} />;
			},
			size: 50,
		},
	];

	const table = useReactTable({
		data: webhooks,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (isLoading) {
		return <SkeletonTable rows={4} columns={7} />;
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
										<TableCell
											colSpan={columns.length}
											className="p-4"
										>
											<div className="space-y-2">
												<p className="text-xs font-medium text-muted-foreground mb-2">
													Trigger History (
													{row.original.runs.length}{" "}
													triggers)
												</p>
												{row.original.runs.length ===
												0 ? (
													<p className="text-xs text-muted-foreground">
														No triggers yet
													</p>
												) : (
													row.original.runs
														.slice(0, 5)
														.map((run) => (
															<WebhookRunHistoryRow
																key={run.id}
																run={run}
																webhookId={
																	row.original
																		.id
																}
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
								No webhook endpoints found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
