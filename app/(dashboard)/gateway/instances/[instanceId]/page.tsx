import { Suspense } from "react";
import { GatewayInstanceDetailView } from "@/views/gateway/gateway-instance-detail-view";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Instance Detail | AXion Hub",
};

export default async function GatewayInstanceDetailPage({
	params,
}: {
	params: Promise<{ instanceId: string }>;
}) {
	const { instanceId } = await params;
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<GatewayInstanceDetailView instanceId={instanceId} />
		</Suspense>
	);
}
