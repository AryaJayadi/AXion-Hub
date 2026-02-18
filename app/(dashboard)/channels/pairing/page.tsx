import { Suspense } from "react";
import type { Metadata } from "next";
import { ChannelPairingView } from "@/views/channels/channel-pairing-view";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";

export const metadata: Metadata = {
	title: "Pair Channel | AXion Hub",
};

export default function ChannelPairingPage() {
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<ChannelPairingView />
		</Suspense>
	);
}
