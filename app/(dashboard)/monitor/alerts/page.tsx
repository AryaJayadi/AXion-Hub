import { Suspense } from "react";
import type { Metadata } from "next";
import { MonitorAlertsView } from "@/views/dashboard/monitor-alerts-view";

export const metadata: Metadata = {
	title: "Alert Rules | AXion Hub",
};

export default function MonitorAlertsPage() {
	return (
		<Suspense>
			<MonitorAlertsView />
		</Suspense>
	);
}
