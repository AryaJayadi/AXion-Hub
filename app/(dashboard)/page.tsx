import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export const metadata: Metadata = {
	title: "Dashboard | AXion Hub",
	description: "Command center overview for your AI agent ecosystem",
};

function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-6 animate-pulse">
			{/* Page header skeleton */}
			<div className="space-y-2 pb-8">
				<div className="h-7 w-36 rounded bg-muted" />
				<div className="h-4 w-56 rounded bg-muted" />
			</div>
			{/* Grid skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="h-[180px] rounded-xl border bg-card" />
				<div className="h-[180px] rounded-xl border bg-card" />
				<div className="h-[180px] rounded-xl border bg-card md:col-span-2" />
				<div className="h-[360px] rounded-xl border bg-card md:col-span-2" />
				<div className="h-[360px] rounded-xl border bg-card md:col-span-2" />
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardView />
		</Suspense>
	);
}
