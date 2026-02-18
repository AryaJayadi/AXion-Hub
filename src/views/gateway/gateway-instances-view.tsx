"use client";

import { useGatewayInstances } from "@/features/gateway/api/use-gateway-instances";
import { InstanceCard } from "@/features/gateway/components/instance-card";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

export function GatewayInstancesView() {
	const { data: instances, isLoading } = useGatewayInstances();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Instances"
				description="Manage and monitor connected gateway instances"
				breadcrumbs={[
					{ label: "Gateway", href: "/gateway" },
					{ label: "Instances" },
				]}
			/>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			) : !instances || instances.length === 0 ? (
				<EmptyState
					title="No gateway instances connected"
					description="Connect an OpenClaw gateway instance to start managing your AI agents."
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{instances.map((instance) => (
						<InstanceCard key={instance.id} instance={instance} />
					))}
				</div>
			)}
		</div>
	);
}
