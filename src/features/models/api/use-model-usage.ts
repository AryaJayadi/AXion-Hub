"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib/query-keys";

export type UsageDimension = "provider" | "model" | "agent";
export type UsagePeriod = "today" | "week" | "month";

export interface UsageDataPoint {
	date: string;
	series: string;
	inputTokens: number;
	outputTokens: number;
	cost: number;
	requestCount: number;
}

/** Aggregate row for the data table */
export interface UsageSummaryRow {
	name: string;
	inputTokens: number;
	outputTokens: number;
	totalCost: number;
	requestCount: number;
}

const PROVIDER_SERIES = ["Anthropic", "OpenAI"];
const MODEL_SERIES = ["Claude Sonnet 4", "GPT-4o", "Claude Haiku 3.5"];
const AGENT_SERIES = ["Research Agent", "Dev Agent", "Writer Agent"];

function getSeriesForDimension(dimension: UsageDimension): string[] {
	switch (dimension) {
		case "provider":
			return PROVIDER_SERIES;
		case "model":
			return MODEL_SERIES;
		case "agent":
			return AGENT_SERIES;
	}
}

function getDatePoints(period: UsagePeriod): string[] {
	const now = new Date();
	const dates: string[] = [];
	const count = period === "today" ? 24 : period === "week" ? 7 : 30;

	for (let i = count - 1; i >= 0; i--) {
		if (period === "today") {
			const hour = new Date(now);
			hour.setHours(now.getHours() - i, 0, 0, 0);
			dates.push(
				hour.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			);
		} else {
			const date = new Date(now);
			date.setDate(now.getDate() - i);
			dates.push(
				date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
			);
		}
	}
	return dates;
}

/** Seeded pseudo-random for deterministic mock data */
function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

function generateMockData(
	dimension: UsageDimension,
	period: UsagePeriod,
): UsageDataPoint[] {
	const series = getSeriesForDimension(dimension);
	const dates = getDatePoints(period);
	const rand = seededRandom(
		dimension.charCodeAt(0) * 100 + period.charCodeAt(0),
	);

	const dataPoints: UsageDataPoint[] = [];

	for (const date of dates) {
		for (const s of series) {
			const baseInput = 50000 + rand() * 500000;
			const baseOutput = 20000 + rand() * 200000;
			const inputTokens = Math.round(baseInput);
			const outputTokens = Math.round(baseOutput);
			// Rough cost: input at ~$3/MTok, output at ~$15/MTok
			const cost =
				(inputTokens / 1000000) * 3 + (outputTokens / 1000000) * 15;
			const requestCount = Math.round(10 + rand() * 200);

			dataPoints.push({
				date,
				series: s,
				inputTokens,
				outputTokens,
				cost: Math.round(cost * 100) / 100,
				requestCount,
			});
		}
	}

	return dataPoints;
}

/** Aggregate data points into summary rows for the table */
function aggregateToSummary(data: UsageDataPoint[]): UsageSummaryRow[] {
	const map = new Map<string, UsageSummaryRow>();

	for (const point of data) {
		const existing = map.get(point.series);
		if (existing) {
			existing.inputTokens += point.inputTokens;
			existing.outputTokens += point.outputTokens;
			existing.totalCost += point.cost;
			existing.requestCount += point.requestCount;
		} else {
			map.set(point.series, {
				name: point.series,
				inputTokens: point.inputTokens,
				outputTokens: point.outputTokens,
				totalCost: point.cost,
				requestCount: point.requestCount,
			});
		}
	}

	// Round costs
	for (const row of map.values()) {
		row.totalCost = Math.round(row.totalCost * 100) / 100;
	}

	return Array.from(map.values());
}

/** Hook returning model usage data for a given dimension and period */
export function useModelUsage(dimension: UsageDimension, period: UsagePeriod) {
	return useQuery({
		queryKey: queryKeys.models.usage(dimension, period),
		queryFn: async () => {
			const data = generateMockData(dimension, period);
			const summary = aggregateToSummary(data);
			const totalCost = summary.reduce((sum, r) => sum + r.totalCost, 0);
			const totalTokens = summary.reduce(
				(sum, r) => sum + r.inputTokens + r.outputTokens,
				0,
			);
			return { data, summary, totalCost, totalTokens };
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}
