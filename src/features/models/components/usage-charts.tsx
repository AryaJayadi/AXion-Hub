"use client";

import { useMemo } from "react";
import NumberFlow from "@number-flow/react";
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Legend,
} from "recharts";
import type { ColumnDef } from "@tanstack/react-table";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/shared/ui/chart";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";

import type {
	UsageDataPoint,
	UsageSummaryRow,
	UsageDimension,
	UsagePeriod,
} from "../api/use-model-usage";

// Theme-consistent colors for up to 5 series
const SERIES_COLORS = [
	"var(--color-primary)",
	"var(--color-secondary)",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
];

function formatTokenCount(count: number): string {
	if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
	if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
	return count.toString();
}

function formatDollarCost(cost: number): string {
	return `$${cost.toFixed(2)}`;
}

interface UsageChartsProps {
	data: UsageDataPoint[];
	summary: UsageSummaryRow[];
	totalCost: number;
	totalTokens: number;
	dimension: UsageDimension;
	period: UsagePeriod;
}

export function UsageCharts({
	data,
	summary,
	totalCost,
	totalTokens,
	dimension,
}: UsageChartsProps) {
	// Get unique series names
	const seriesNames = useMemo(() => {
		const names = new Set<string>();
		for (const point of data) {
			names.add(point.series);
		}
		return Array.from(names);
	}, [data]);

	// Build chart config
	const chartConfig = useMemo<ChartConfig>(() => {
		const config: ChartConfig = {};
		for (let i = 0; i < seriesNames.length; i++) {
			const name = seriesNames[i];
			const color = SERIES_COLORS[i % SERIES_COLORS.length];
			if (name && color) {
				config[name] = { label: name, color };
			}
		}
		return config;
	}, [seriesNames]);

	// Transform data for usage over time (area chart)
	// Each date becomes a row with series as columns for tokens
	const areaChartData = useMemo(() => {
		const dateMap = new Map<string, Record<string, string | number>>();

		for (const point of data) {
			if (!dateMap.has(point.date)) {
				dateMap.set(point.date, { date: point.date });
			}
			const row = dateMap.get(point.date);
			if (row) {
				const prev = (row[point.series] as number) ?? 0;
				row[point.series] =
					prev + point.inputTokens + point.outputTokens;
			}
		}

		return Array.from(dateMap.values());
	}, [data]);

	// Transform data for cost breakdown (bar chart)
	// Group by series with input vs output cost
	const barChartData = useMemo(() => {
		return summary.map((row) => ({
			name: row.name,
			inputCost: Math.round(
				(row.inputTokens / 1000000) * 3 * 100,
			) / 100,
			outputCost: Math.round(
				(row.outputTokens / 1000000) * 15 * 100,
			) / 100,
		}));
	}, [summary]);

	const costChartConfig: ChartConfig = {
		inputCost: {
			label: "Input Cost",
			color: "var(--color-primary)",
		},
		outputCost: {
			label: "Output Cost",
			color: "var(--color-secondary)",
		},
	};

	// Table columns
	const columns: ColumnDef<UsageSummaryRow, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={
							dimension === "provider"
								? "Provider"
								: dimension === "model"
									? "Model"
									: "Agent"
						}
					/>
				),
				cell: ({ row }) => (
					<span className="font-medium">
						{row.getValue<string>("name")}
					</span>
				),
			},
			{
				accessorKey: "inputTokens",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Input Tokens" />
				),
				cell: ({ row }) =>
					formatTokenCount(row.getValue<number>("inputTokens")),
			},
			{
				accessorKey: "outputTokens",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Output Tokens" />
				),
				cell: ({ row }) =>
					formatTokenCount(row.getValue<number>("outputTokens")),
			},
			{
				accessorKey: "totalCost",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Total Cost" />
				),
				cell: ({ row }) =>
					formatDollarCost(row.getValue<number>("totalCost")),
			},
			{
				accessorKey: "requestCount",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Requests" />
				),
				cell: ({ row }) =>
					row.getValue<number>("requestCount").toLocaleString(),
			},
		],
		[dimension],
	);

	return (
		<div className="space-y-6">
			{/* Top: Animated totals */}
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground">
						Total Tokens
					</span>
					<NumberFlow
						value={totalTokens}
						format={{ notation: "compact" }}
						className="text-2xl font-bold tabular-nums"
					/>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground">
						Total Cost
					</span>
					<NumberFlow
						value={totalCost}
						format={{
							style: "currency",
							currency: "USD",
							minimumFractionDigits: 2,
						}}
						className="text-2xl font-bold tabular-nums"
					/>
				</div>
			</div>

			{/* Usage Over Time (Area Chart) */}
			<div className="space-y-2">
				<h3 className="text-sm font-semibold">Usage Over Time</h3>
				<ChartContainer
					config={chartConfig}
					className="min-h-[250px] w-full"
				>
					<AreaChart data={areaChartData}>
						<XAxis
							dataKey="date"
							fontSize={11}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							fontSize={11}
							tickLine={false}
							axisLine={false}
							tickFormatter={(v: number) => formatTokenCount(v)}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Legend />
						{seriesNames.map((name, i) => (
							<Area
								key={name}
								type="monotone"
								dataKey={name}
								stackId="tokens"
								fill={SERIES_COLORS[i % SERIES_COLORS.length]}
								stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
								fillOpacity={0.3}
							/>
						))}
					</AreaChart>
				</ChartContainer>
			</div>

			{/* Cost Breakdown (Bar Chart) */}
			<div className="space-y-2">
				<h3 className="text-sm font-semibold">Cost Breakdown</h3>
				<ChartContainer
					config={costChartConfig}
					className="min-h-[200px] w-full"
				>
					<BarChart data={barChartData}>
						<XAxis
							dataKey="name"
							fontSize={11}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							fontSize={11}
							tickLine={false}
							axisLine={false}
							tickFormatter={(v: number) => `$${v}`}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Legend />
						<Bar
							dataKey="inputCost"
							stackId="cost"
							fill="var(--color-inputCost)"
							radius={[0, 0, 0, 0]}
						/>
						<Bar
							dataKey="outputCost"
							stackId="cost"
							fill="var(--color-outputCost)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</div>

			{/* Detailed data table */}
			<div className="space-y-2">
				<h3 className="text-sm font-semibold">Detailed Breakdown</h3>
				<DataTable
					columns={columns}
					data={summary}
					enablePagination={false}
					enableVirtualization={false}
				/>
			</div>
		</div>
	);
}
