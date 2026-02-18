import { Suspense } from "react";
import { GatewayInstancesView } from "@/views/gateway/gateway-instances-view";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Gateway Instances | AXion Hub",
};

export default function GatewayInstancesPage() {
	return (
		<Suspense fallback={<SkeletonCard />}>
			<GatewayInstancesView />
		</Suspense>
	);
}
