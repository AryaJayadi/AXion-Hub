"use client";

import { useGatewayInstance } from "@/features/gateway/api/use-gateway-instances";
import { InstanceDetailPanel } from "@/features/gateway/components/instance-detail-panel";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

interface GatewayInstanceDetailViewProps {
	instanceId: string;
}

export function GatewayInstanceDetailView({
	instanceId,
}: GatewayInstanceDetailViewProps) {
	const { data: instance, isLoading } = useGatewayInstance(instanceId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<PageHeader
					title="Instance Detail"
					breadcrumbs={[
						{ label: "Gateway", href: "/gateway" },
						{ label: "Instances", href: "/gateway/instances" },
						{ label: "Loading..." },
					]}
				/>
				<SkeletonDetail />
			</div>
		);
	}

	if (!instance) {
		return (
			<div className="space-y-6">
				<PageHeader
					title="Instance Not Found"
					breadcrumbs={[
						{ label: "Gateway", href: "/gateway" },
						{ label: "Instances", href: "/gateway/instances" },
						{ label: instanceId },
					]}
				/>
				<EmptyState
					title="Instance not found"
					description={`No gateway instance found with ID "${instanceId}".`}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={instance.name}
				description={`Instance ${instance.id}`}
				breadcrumbs={[
					{ label: "Gateway", href: "/gateway" },
					{ label: "Instances", href: "/gateway/instances" },
					{ label: instance.name },
				]}
			/>
			<InstanceDetailPanel instance={instance} />
		</div>
	);
}
