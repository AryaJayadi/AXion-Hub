import { Suspense } from "react";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { GatewayChannelsView } from "@/views/gateway/gateway-channels-view";

export const metadata = {
	title: "Gateway Channels | AXion Hub",
};

export default function GatewayChannelsPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={5} columns={5} />}>
			<GatewayChannelsView />
		</Suspense>
	);
}
