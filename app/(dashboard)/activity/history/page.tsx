import { Suspense } from "react";
import type { Metadata } from "next";
import { ActivityHistoryView } from "@/views/dashboard/activity-history-view";

export const metadata: Metadata = {
	title: "Activity History | AXion Hub",
};

export default function ActivityHistoryPage() {
	return (
		<Suspense>
			<ActivityHistoryView />
		</Suspense>
	);
}
