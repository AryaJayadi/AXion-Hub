"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";

import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import type { UsageDimension, UsagePeriod } from "../api/use-model-usage";

const DIMENSIONS: { value: UsageDimension; label: string }[] = [
	{ value: "provider", label: "By Provider" },
	{ value: "model", label: "By Model" },
	{ value: "agent", label: "By Agent" },
];

const PERIODS: { value: UsagePeriod; label: string }[] = [
	{ value: "today", label: "Today" },
	{ value: "week", label: "This Week" },
	{ value: "month", label: "This Month" },
];

const dimensionParser = parseAsStringLiteral([
	"provider",
	"model",
	"agent",
] as const).withDefault("provider");

const periodParser = parseAsStringLiteral([
	"today",
	"week",
	"month",
] as const).withDefault("week");

export function useUsageFilters() {
	const [dimension, setDimension] = useQueryState("dim", dimensionParser);
	const [period, setPeriod] = useQueryState("period", periodParser);
	return { dimension, setDimension, period, setPeriod };
}

export function UsageDimensionToggle() {
	const { dimension, setDimension, period, setPeriod } = useUsageFilters();

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
			<ToggleGroup
				type="single"
				value={dimension}
				onValueChange={(v) => {
					if (v) setDimension(v as UsageDimension);
				}}
				className="justify-start"
			>
				{DIMENSIONS.map((d) => (
					<ToggleGroupItem
						key={d.value}
						value={d.value}
						className="text-xs px-3"
					>
						{d.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<ToggleGroup
				type="single"
				value={period}
				onValueChange={(v) => {
					if (v) setPeriod(v as UsagePeriod);
				}}
				className="justify-start"
			>
				{PERIODS.map((p) => (
					<ToggleGroupItem
						key={p.value}
						value={p.value}
						className="text-xs px-3"
					>
						{p.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
