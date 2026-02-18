"use client";

import { Users, ListChecks, BrainCircuit, DollarSign, Wifi } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/widgets/dashboard-grid/components/bento-grid";
import { GatewayStatusWidget } from "@/features/dashboard/components/gateway-status-widget";
import { AgentCountWidget } from "@/features/dashboard/components/agent-count-widget";
import { TaskSummaryWidget } from "@/features/dashboard/components/task-summary-widget";
import { ContextUsageWidget } from "@/features/dashboard/components/context-usage-widget";
import { CostSummaryWidget } from "@/features/dashboard/components/cost-summary-widget";
import { DegradedModeBanner } from "@/features/dashboard/components/degraded-mode-banner";
import { ActivityFeedWidget } from "@/features/dashboard/components/activity-feed-widget";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { useDashboardStats } from "@/features/dashboard/api/use-dashboard-stats";
import { useCostSummary } from "@/features/dashboard/api/use-cost-summary";
import { useDashboardStore } from "@/features/dashboard";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * Dashboard page composition with bento grid layout.
 *
 * Renders all stat widgets (gateway status, agent counts, task summary,
 * context usage, cost summary) and the activity feed inside BentoGridItems
 * with responsive col-span/row-span sizing.
 *
 * Layout: 4 cols on lg, 2 on md, 1 on mobile.
 */
export function DashboardView() {
	// Trigger initial data loading
	useDashboardStats();
	useCostSummary("session");

	const isStale = useDashboardStore((s) => s.isStale);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Dashboard"
				description="Command center overview"
			/>

			<DegradedModeBanner />

			<QuickActions />

			<BentoGrid>
				{/* Gateway status -- small card (1x1) */}
				<BentoGridItem
					title="Gateway"
					icon={Wifi}
					isStale={isStale}
					className="col-span-1"
				>
					<GatewayStatusWidget />
				</BentoGridItem>

				{/* Agent count -- small card (1x1) */}
				<BentoGridItem
					title="Agents"
					icon={Users}
					isStale={isStale}
					className="col-span-1"
				>
					<AgentCountWidget />
				</BentoGridItem>

				{/* Task summary -- medium card (2 cols on md+) */}
				<BentoGridItem
					title="Tasks"
					icon={ListChecks}
					isStale={isStale}
					className="col-span-1 md:col-span-2"
				>
					<TaskSummaryWidget />
				</BentoGridItem>

				{/* Context usage -- tall card (2 cols, 2 rows) */}
				<BentoGridItem
					title="Context Usage"
					icon={BrainCircuit}
					isStale={isStale}
					className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2"
				>
					<ContextUsageWidget />
				</BentoGridItem>

				{/* Cost summary -- tall card (2 cols, 2 rows) */}
				<BentoGridItem
					title="Token Costs"
					icon={DollarSign}
					isStale={isStale}
					className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2"
				>
					<CostSummaryWidget />
				</BentoGridItem>

				{/* Activity feed -- tall card (2 cols, 3 rows) */}
				<BentoGridItem
					title="Activity Feed"
					className="col-span-1 md:col-span-2 lg:col-span-2 row-span-3"
				>
					<ActivityFeedWidget />
				</BentoGridItem>
			</BentoGrid>
		</div>
	);
}
