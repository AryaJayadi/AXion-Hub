import { Suspense } from "react";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Instance Detail | AXion Hub",
};

// Placeholder -- will be replaced with GatewayInstanceDetailView in Task 2
export default async function GatewayInstanceDetailPage({
	params,
}: {
	params: Promise<{ instanceId: string }>;
}) {
	const { instanceId } = await params;
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<div>Instance detail for {instanceId} -- coming in Task 2</div>
		</Suspense>
	);
}
