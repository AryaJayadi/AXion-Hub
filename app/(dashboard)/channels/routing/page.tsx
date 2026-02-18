import { Suspense } from "react";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { ChannelRoutingView } from "@/views/channels/channel-routing-view";

export const metadata = {
	title: "Channel Routing | AXion Hub",
};

export default function ChannelRoutingPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={5} columns={5} />}>
			<ChannelRoutingView />
		</Suspense>
	);
}
