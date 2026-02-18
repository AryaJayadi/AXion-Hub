"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { ActivitySplitView } from "@/features/dashboard/components/activity-split-view";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";

export function ActivityView() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Activity"
				description="Real-time event stream across all agents and channels"
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href="/activity/history">
							<History className="mr-1.5 size-4" />
							View History
						</Link>
					</Button>
				}
			/>

			<ActivitySplitView />
		</div>
	);
}
