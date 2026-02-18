import { Suspense } from "react";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { ChannelsListView } from "@/views/channels/channels-list-view";

export const metadata = {
	title: "Channels | AXion Hub",
};

export default function ChannelsPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={5} columns={6} />}>
			<ChannelsListView />
		</Suspense>
	);
}
