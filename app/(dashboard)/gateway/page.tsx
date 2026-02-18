import { Suspense } from "react";
import { GatewayOverviewView } from "@/views/gateway/gateway-overview-view";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Gateway | AXion Hub",
};

export default function GatewayPage() {
	return (
		<Suspense fallback={<SkeletonCard />}>
			<GatewayOverviewView />
		</Suspense>
	);
}
