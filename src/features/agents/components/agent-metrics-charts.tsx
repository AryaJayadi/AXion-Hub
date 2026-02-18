"use client";

import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/shared/ui/chart";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import type { AgentMetrics } from "@/entities/agent";

const tokenChartConfig: ChartConfig = {
	tokens: { label: "Tokens", color: "var(--primary)" },
};

const costChartConfig: ChartConfig = {
	cost: { label: "Cost ($)", color: "hsl(38 92% 50%)" },
};

const tasksChartConfig: ChartConfig = {
	count: { label: "Tasks", color: "hsl(142 76% 36%)" },
};

const responseChartConfig: ChartConfig = {
	avgMs: { label: "Avg (ms)", color: "var(--secondary)" },
};

const TIME_RANGES = [
	{ label: "7 days", value: 7 },
	{ label: "14 days", value: 14 },
	{ label: "30 days", value: 30 },
] as const;

interface AgentMetricsChartsProps {
	metrics: AgentMetrics;
}

export function AgentMetricsCharts({ metrics }: AgentMetricsChartsProps) {
	const [selectedRange, setSelectedRange] = useState(14);

	// Slice data to selected range (visual only for now, defaults to 14 days)
	const tokenData = metrics.tokenUsage.slice(-selectedRange);
	const costData = metrics.costBreakdown.slice(-selectedRange);
	const tasksData = metrics.tasksCompleted.slice(-selectedRange);
	const responseData = metrics.responseTimes.slice(-selectedRange);

	return (
		<div className="space-y-6">
			{/* Time range selector */}
			<div className="flex gap-1">
				{TIME_RANGES.map((range) => (
					<Button
						key={range.value}
						variant={selectedRange === range.value ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedRange(range.value)}
						className={cn(
							"text-xs",
							selectedRange === range.value && "pointer-events-none",
						)}
					>
						{range.label}
					</Button>
				))}
			</div>

			{/* 2x2 chart grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Token Usage */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Token Usage</h3>
					<ChartContainer config={tokenChartConfig} className="min-h-[200px]">
						<AreaChart data={tokenData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" fontSize={10} />
							<YAxis fontSize={10} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Area
								type="monotone"
								dataKey="tokens"
								fill="var(--color-tokens)"
								fillOpacity={0.2}
								stroke="var(--color-tokens)"
							/>
						</AreaChart>
					</ChartContainer>
				</div>

				{/* Cost Breakdown */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Cost Breakdown</h3>
					<ChartContainer config={costChartConfig} className="min-h-[200px]">
						<AreaChart data={costData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" fontSize={10} />
							<YAxis fontSize={10} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Area
								type="monotone"
								dataKey="cost"
								fill="var(--color-cost)"
								fillOpacity={0.2}
								stroke="var(--color-cost)"
							/>
						</AreaChart>
					</ChartContainer>
				</div>

				{/* Tasks Completed */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Tasks Completed</h3>
					<ChartContainer config={tasksChartConfig} className="min-h-[200px]">
						<BarChart data={tasksData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" fontSize={10} />
							<YAxis fontSize={10} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar
								dataKey="count"
								fill="var(--color-count)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				</div>

				{/* Response Times */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Response Times</h3>
					<ChartContainer config={responseChartConfig} className="min-h-[200px]">
						<AreaChart data={responseData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" fontSize={10} />
							<YAxis fontSize={10} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Area
								type="monotone"
								dataKey="avgMs"
								fill="var(--color-avgMs)"
								fillOpacity={0.2}
								stroke="var(--color-avgMs)"
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</div>
		</div>
	);
}
