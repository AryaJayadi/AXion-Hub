import { Suspense } from "react";
import type { Metadata } from "next";
import { ActivityView } from "@/views/dashboard/activity-view";

export const metadata: Metadata = {
	title: "Activity | AXion Hub",
};

export default function ActivityPage() {
	return (
		<Suspense>
			<ActivityView />
		</Suspense>
	);
}
