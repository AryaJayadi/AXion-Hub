import { Suspense } from "react";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { ChannelDetailView } from "@/views/channels/channel-detail-view";

export const metadata = {
	title: "Channel Detail | AXion Hub",
};

export default async function ChannelDetailPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	return (
		<Suspense fallback={<SkeletonDetail />}>
			<ChannelDetailView channelId={channel} />
		</Suspense>
	);
}
