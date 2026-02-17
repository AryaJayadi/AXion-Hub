"use client";

import { useRef, useState, useMemo, type ReactNode } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type RowSelectionState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

interface DataTableProps<TData, TValue> {
	/** Column definitions for TanStack Table */
	columns: ColumnDef<TData, TValue>[];
	/** Row data */
	data: TData[];
	/** Column key used for global text search */
	searchKey?: string;
	/** Placeholder text for the search input */
	searchPlaceholder?: string;
	/** Enable virtual scrolling. Default: auto (true if data.length > 50) */
	enableVirtualization?: boolean;
	/** Enable pagination controls. Default: true */
	enablePagination?: boolean;
	/** Number of rows per page. Default: 25 */
	pageSize?: number;
	/** Enable row selection via checkboxes */
	enableRowSelection?: boolean;
	/** Callback when row selection changes */
	onRowSelectionChange?: (rows: TData[]) => void;
	/** Custom empty state content */
	emptyState?: ReactNode;
	/** Show loading skeleton */
	isLoading?: boolean;
	/** Additional class names for the container */
	className?: string;
}

const ROW_HEIGHT_ESTIMATE = 48;

function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search...",
	enableVirtualization,
	enablePagination = true,
	pageSize = 25,
	enableRowSelection = false,
	onRowSelectionChange,
	emptyState,
	isLoading = false,
	className,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const shouldVirtualize =
		enableVirtualization ?? data.length > 50;

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		enableRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: (updater) => {
			const newSelection =
				typeof updater === "function" ? updater(rowSelection) : updater;
			setRowSelection(newSelection);

			if (onRowSelectionChange) {
				const selectedRows = Object.keys(newSelection)
					.filter((key) => newSelection[key])
					.map((key) => data[Number.parseInt(key, 10)])
					.filter((row): row is TData => row !== undefined);
				onRowSelectionChange(selectedRows);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		...(enablePagination && !shouldVirtualize
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
		initialState: {
			pagination: {
				pageSize,
			},
		},
	});

	const { rows } = table.getRowModel();

	// Virtual scrolling
	const parentRef = useRef<HTMLDivElement>(null);
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => ROW_HEIGHT_ESTIMATE,
		overscan: 10,
		enabled: shouldVirtualize,
	});

	// Loading state
	if (isLoading) {
		return (
			<div className={cn("w-full", className)}>
				{searchKey && (
					<div className="pb-4">
						<Input
							disabled
							placeholder={searchPlaceholder}
							className="max-w-sm"
						/>
					</div>
				)}
				<SkeletonTable
					rows={pageSize > 10 ? 10 : pageSize}
					columns={columns.length}
				/>
			</div>
		);
	}

	// Empty state
	if (data.length === 0) {
		return (
			<div className={cn("w-full", className)}>
				{searchKey && (
					<div className="pb-4">
						<Input
							disabled
							placeholder={searchPlaceholder}
							className="max-w-sm"
						/>
					</div>
				)}
				{emptyState ?? (
					<EmptyState
						title="No data"
						description="There are no items to display yet."
					/>
				)}
			</div>
		);
	}

	const paginationInfo = enablePagination && !shouldVirtualize && (
		<div className="flex items-center justify-between px-2 py-4">
			<p className="text-sm text-muted-foreground">
				{table.getFilteredRowModel().rows.length} row(s) total
				{enableRowSelection &&
					Object.keys(rowSelection).length > 0 &&
					` | ${Object.values(rowSelection).filter(Boolean).length} selected`}
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
				<p className="text-sm text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</p>
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
	);

	return (
		<div className={cn("w-full", className)}>
			{/* Search bar */}
			{searchKey && (
				<div className="pb-4">
					<Input
						placeholder={searchPlaceholder}
						value={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
						onChange={(e) =>
							table.getColumn(searchKey)?.setFilterValue(e.target.value)
						}
						className="max-w-sm"
					/>
				</div>
			)}

			{/* Table */}
			<div className="rounded-md border border-border">
				{shouldVirtualize ? (
					<VirtualizedTable
						table={table}
						rows={rows}
						columns={columns}
						virtualizer={virtualizer}
						parentRef={parentRef}
					/>
				) : (
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
							{rows.length > 0 ? (
								rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() ? "selected" : undefined}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center text-muted-foreground"
									>
										No results found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Pagination */}
			{paginationInfo}

			{/* Virtual scroll info */}
			{shouldVirtualize && (
				<div className="flex items-center justify-between px-2 py-4">
					<p className="text-sm text-muted-foreground">
						{table.getFilteredRowModel().rows.length} row(s) total
						{enableRowSelection &&
							Object.keys(rowSelection).length > 0 &&
							` | ${Object.values(rowSelection).filter(Boolean).length} selected`}
					</p>
					<p className="text-sm text-muted-foreground">
						Virtual scrolling active
					</p>
				</div>
			)}
		</div>
	);
}

/** Internal virtualized table renderer */
function VirtualizedTable<TData, TValue>({
	table,
	rows,
	columns,
	virtualizer,
	parentRef,
}: {
	table: ReturnType<typeof useReactTable<TData>>;
	rows: ReturnType<ReturnType<typeof useReactTable<TData>>["getRowModel"]>["rows"];
	columns: ColumnDef<TData, TValue>[];
	virtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;
	parentRef: React.RefObject<HTMLDivElement | null>;
}) {
	const virtualItems = virtualizer.getVirtualItems();

	return (
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
						return (
							<TableRow
								key={row.id}
								data-index={virtualRow.index}
								data-state={row.getIsSelected() ? "selected" : undefined}
								style={{ height: `${virtualRow.size}px` }}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
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
	);
}

/** Sortable column header helper */
function DataTableColumnHeader({
	column,
	title,
}: {
	column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" };
	title: string;
}) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8 data-[state=open]:bg-accent"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{title}
			<ArrowUpDown className="ml-1 size-3.5" />
		</Button>
	);
}

export { DataTable, DataTableColumnHeader };
export type { DataTableProps };
