"use client";

import { useState, useMemo } from "react";
import NumberFlow from "@number-flow/react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Legend,
} from "recharts";
import type { ColumnDef } from "@tanstack/react-table";
import type { TimePeriod, AgentCostData } from "@/entities/dashboard-event";
import { useDashboardStore, formatTokenCount, formatDollarCost } from "@/features/dashboard";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/shared/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { DataTable, DataTableColumnHeader } from "@/shared/ui/data-table";

const PERIODS: { value: TimePeriod; label: string }[] = [
	{ value: "session", label: "Session" },
	{ value: "today", label: "Today" },
	{ value: "week", label: "Week" },
];

const chartConfig: ChartConfig = {
	inputTokens: {
		label: "Input",
		color: "var(--color-primary)",
	},
	outputTokens: {
		label: "Output",
		color: "var(--color-secondary)",
	},
};

const costColumns: ColumnDef<AgentCostData, unknown>[] = [
	{
		accessorKey: "agentName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Agent" />
		),
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue<string>("agentName")}</span>
		),
	},
	{
		accessorKey: "model",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Model" />
		),
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.getValue<string>("model")}</span>
		),
	},
	{
		accessorKey: "inputTokens",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Input" />
		),
		cell: ({ row }) => formatTokenCount(row.getValue<number>("inputTokens")),
	},
	{
		accessorKey: "outputTokens",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Output" />
		),
		cell: ({ row }) => formatTokenCount(row.getValue<number>("outputTokens")),
	},
	{
		accessorKey: "cost",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Cost" />
		),
		cell: ({ row }) => formatDollarCost(row.getValue<number>("cost")),
	},
];

/**
 * Cost summary widget with time toggle, stacked bar chart, and sortable table.
 *
 * - Top: total tokens and dollar cost side-by-side (animated with NumberFlow)
 * - Middle: stacked BarChart (input vs output tokens per agent)
 * - Bottom: compact sortable DataTable for per-agent cost breakdown
 */
export function CostSummaryWidget() {
	const [period, setPeriod] = useState<TimePeriod>("session");
	const costByPeriod = useDashboardStore((s) => s.costByPeriod);
	const perAgentCosts = useDashboardStore((s) => s.perAgentCosts);

	const currentCost = costByPeriod[period];

	// Prepare chart data from per-agent costs
	const chartData = useMemo(
		() =>
			perAgentCosts.map((agent) => ({
				name: agent.agentName,
				inputTokens: agent.inputTokens,
				outputTokens: agent.outputTokens,
			})),
		[perAgentCosts],
	);

	return (
		<div className="flex flex-col gap-4">
			{/* Time period toggle */}
			<Tabs
				value={period}
				onValueChange={(v) => setPeriod(v as TimePeriod)}
			>
				<TabsList className="w-full">
					{PERIODS.map((p) => (
						<TabsTrigger key={p.value} value={p.value} className="flex-1">
							{p.label}
						</TabsTrigger>
					))}
				</TabsList>

				{PERIODS.map((p) => (
					<TabsContent key={p.value} value={p.value}>
						{/* Top: aggregate summary */}
						<div className="grid grid-cols-2 gap-4 py-3">
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground">Total Tokens</span>
								<NumberFlow
									value={currentCost.tokens}
									format={{ notation: "compact" }}
									className="text-2xl font-bold tabular-nums"
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground">Estimated Cost</span>
								<NumberFlow
									value={currentCost.dollars}
									format={{ style: "currency", currency: "USD", minimumFractionDigits: 2 }}
									className="text-2xl font-bold tabular-nums"
								/>
							</div>
						</div>
					</TabsContent>
				))}
			</Tabs>

			{/* Stacked bar chart */}
			{chartData.length > 0 && (
				<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
					<BarChart data={chartData}>
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
							tickFormatter={(v: number) => formatTokenCount(v)}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Legend />
						<Bar
							dataKey="inputTokens"
							stackId="tokens"
							fill="var(--color-inputTokens)"
							radius={[0, 0, 0, 0]}
						/>
						<Bar
							dataKey="outputTokens"
							stackId="tokens"
							fill="var(--color-outputTokens)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			)}

			{/* Per-agent cost table */}
			{perAgentCosts.length > 0 && (
				<div className="text-xs">
					<DataTable
						columns={costColumns}
						data={perAgentCosts}
						enablePagination={false}
						enableVirtualization={false}
						className="[&_td]:py-1.5 [&_th]:py-1.5"
					/>
				</div>
			)}
		</div>
	);
}
