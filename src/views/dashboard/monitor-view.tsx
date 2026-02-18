"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { DependencyMap } from "@/features/dashboard/components/dependency-map";
import { useServiceHealth } from "@/features/dashboard/api/use-service-health";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function MonitorView() {
	const { data: services, isLoading } = useServiceHealth();

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="System Health"
				description="Service dependency map with real-time health status"
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href="/monitor/alerts">
							<Bell className="mr-1.5 size-4" />
							Configure Alerts
						</Link>
					</Button>
				}
			/>

			{isLoading || !services ? (
				<Skeleton className="h-[600px] w-full rounded-lg" />
			) : (
				<DependencyMap services={services} />
			)}
		</div>
	);
}
