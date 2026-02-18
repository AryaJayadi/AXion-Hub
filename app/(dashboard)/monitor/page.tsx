import { Suspense } from "react";
import type { Metadata } from "next";
import { MonitorView } from "@/views/dashboard/monitor-view";

export const metadata: Metadata = {
	title: "System Health | AXion Hub",
};

export default function MonitorPage() {
	return (
		<Suspense>
			<MonitorView />
		</Suspense>
	);
}
