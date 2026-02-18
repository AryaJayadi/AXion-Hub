"use client";

import { BentoGrid, BentoGridItem } from "@/widgets/dashboard-grid/components/bento-grid";
import { ActivityFeedWidget } from "@/features/dashboard/components/activity-feed-widget";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * Dashboard page composition with bento grid layout.
 *
 * Renders quick actions and the activity feed in a bento grid.
 * Stat widgets (gateway status, agent counts, task summary, context usage,
 * cost summary) and the degraded-mode banner will be added by Plan 05-02.
 *
 * Layout: 4 cols on lg, 2 on md, 1 on mobile.
 */
export function DashboardView() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Dashboard"
				description="Command center overview"
			/>

			<QuickActions />

			<BentoGrid>
				{/* Activity feed -- most visually prominent widget (2 cols, 3 rows) */}
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
