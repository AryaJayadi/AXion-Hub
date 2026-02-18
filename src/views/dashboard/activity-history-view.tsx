"use client";

import { useMemo, useCallback } from "react";
import { useQueryState } from "nuqs";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { DashboardEvent } from "@/entities/dashboard-event";
import { useActivityHistory } from "@/features/dashboard/api/use-activity-history";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";
import { SearchInput } from "@/shared/ui/search-input";
import { FilterBar, type FilterConfig } from "@/shared/ui/filter-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageHeader } from "@/shared/ui/page-header";

const EVENT_TYPE_OPTIONS = [
	{ label: "Agent", value: "agent" },
	{ label: "Chat", value: "chat" },
	{ label: "Execution", value: "exec" },
	{ label: "System", value: "ws" },
];

const SEVERITY_OPTIONS = [
	{ label: "Info", value: "info" },
	{ label: "Warning", value: "warning" },
	{ label: "Error", value: "error" },
];

const FILTER_CONFIGS: FilterConfig[] = [
	{
		key: "types",
		label: "Event Type",
		type: "multi-select",
		options: EVENT_TYPE_OPTIONS,
	},
	{
		key: "severity",
		label: "Severity",
		type: "multi-select",
		options: SEVERITY_OPTIONS,
	},
	{
		key: "dateRange",
		label: "Date Range",
		type: "date-range",
	},
];

const columns: ColumnDef<DashboardEvent, unknown>[] = [
	{
		accessorKey: "timestamp",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Timestamp" />
		),
		cell: ({ row }) => (
			<time
				className="whitespace-nowrap text-xs"
				dateTime={row.original.timestamp.toISOString()}
			>
				{format(row.original.timestamp, "MMM d, HH:mm:ss")}
			</time>
		),
	},
	{
		accessorKey: "type",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Type" />
		),
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.original.type}</span>
		),
	},
	{
		accessorKey: "source",
		header: "Source",
		cell: ({ row }) => (
			<span className="capitalize text-sm">{row.original.source}</span>
		),
	},
	{
		accessorKey: "agentId",
		header: "Agent",
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				{row.original.agentId ?? "--"}
			</span>
		),
	},
	{
		accessorKey: "summary",
		header: "Summary",
		cell: ({ row }) => (
			<p className="max-w-[300px] truncate text-sm">{row.original.summary}</p>
		),
		filterFn: "includesString",
	},
	{
		accessorKey: "severity",
		header: "Severity",
		cell: ({ row }) => (
			<StatusBadge status={row.original.severity} size="sm" />
		),
	},
];

export function ActivityHistoryView() {
	const { data, isLoading } = useActivityHistory();

	// URL filter state
	const [search, setSearch] = useQueryState("q", { defaultValue: "" });
	const [typesFilter, setTypesFilter] = useQueryState("types", { defaultValue: "" });
	const [severityFilter, setSeverityFilter] = useQueryState("severity", { defaultValue: "" });
	const [dateRangeFilter, setDateRangeFilter] = useQueryState("dateRange", { defaultValue: "" });

	const filterValues: Record<string, unknown> = useMemo(() => ({
		types: typesFilter ? typesFilter.split(",") : undefined,
		severity: severityFilter ? severityFilter.split(",") : undefined,
		dateRange: dateRangeFilter || undefined,
	}), [typesFilter, severityFilter, dateRangeFilter]);

	const handleFilterChange = useCallback(
		(key: string, value: unknown) => {
			const arr = value as string[] | undefined;
			switch (key) {
				case "types":
					void setTypesFilter(arr && arr.length > 0 ? arr.join(",") : null);
					break;
				case "severity":
					void setSeverityFilter(arr && arr.length > 0 ? arr.join(",") : null);
					break;
				case "dateRange":
					void setDateRangeFilter((value as string) || null);
					break;
			}
		},
		[setTypesFilter, setSeverityFilter, setDateRangeFilter],
	);

	const handleClearFilters = useCallback(() => {
		void setTypesFilter(null);
		void setSeverityFilter(null);
		void setDateRangeFilter(null);
	}, [setTypesFilter, setSeverityFilter, setDateRangeFilter]);

	// Client-side filtering of mock data
	const filteredEvents = useMemo(() => {
		if (!data?.events) return [];
		return data.events.filter((event) => {
			// Text search
			if (search) {
				const q = search.toLowerCase();
				const matchesText =
					event.summary.toLowerCase().includes(q) ||
					event.type.toLowerCase().includes(q) ||
					event.source.toLowerCase().includes(q) ||
					(event.agentId?.toLowerCase().includes(q) ?? false);
				if (!matchesText) return false;
			}

			// Type filter
			const types = filterValues.types as string[] | undefined;
			if (types && types.length > 0) {
				const prefix = event.type.split(".")[0];
				if (!types.includes(prefix ?? "")) return false;
			}

			// Severity filter
			const severities = filterValues.severity as string[] | undefined;
			if (severities && severities.length > 0) {
				if (!severities.includes(event.severity)) return false;
			}

			return true;
		});
	}, [data?.events, search, filterValues]);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Activity History"
				description="Search and filter past events across all agents and channels"
				breadcrumbs={[
					{ label: "Activity", href: "/activity" },
					{ label: "History" },
				]}
			/>

			<SearchInput
				value={search}
				onChange={setSearch}
				placeholder="Search events..."
				className="max-w-sm"
			/>

			<FilterBar
				filters={FILTER_CONFIGS}
				values={filterValues}
				onChange={handleFilterChange}
				onClear={handleClearFilters}
			/>

			<DataTable
				columns={columns}
				data={filteredEvents}
				isLoading={isLoading}
				enablePagination
				pageSize={25}
			/>
		</div>
	);
}
