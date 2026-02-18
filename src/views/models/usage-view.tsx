"use client";

import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";

import { useModelUsage } from "@/features/models/api/use-model-usage";
import { UsageCharts } from "@/features/models/components/usage-charts";
import {
	UsageDimensionToggle,
	useUsageFilters,
} from "@/features/models/components/usage-dimension-toggle";

export function UsageView() {
	const { dimension, period } = useUsageFilters();
	const { data, isLoading } = useModelUsage(dimension, period);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Model Usage & Costs"
				description="Track token usage and costs across providers, models, and agents"
				breadcrumbs={[
					{ label: "Models", href: "/models" },
					{ label: "Usage" },
				]}
			/>

			<UsageDimensionToggle />

			{isLoading || !data ? (
				<div className="space-y-4">
					<SkeletonCard />
					<SkeletonCard />
				</div>
			) : (
				<UsageCharts
					data={data.data}
					summary={data.summary}
					totalCost={data.totalCost}
					totalTokens={data.totalTokens}
					dimension={dimension}
					period={period}
				/>
			)}
		</div>
	);
}
