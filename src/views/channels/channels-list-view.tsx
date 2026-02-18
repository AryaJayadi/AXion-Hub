"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { useChannels } from "@/features/channels/api/use-channels";
import { ChannelListTable } from "@/features/channels/components/channel-list-table";

export function ChannelsListView() {
	const { data: channels, isLoading } = useChannels();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Channels"
				description="Manage messaging channel connections"
				actions={
					<Button asChild>
						<Link href="/channels/pairing">
							<Plus className="mr-1 size-4" />
							Pair New Channel
						</Link>
					</Button>
				}
			/>

			{isLoading ? (
				<SkeletonTable rows={5} columns={6} />
			) : !channels || channels.length === 0 ? (
				<EmptyState
					title="No channels connected"
					description="Connect your first messaging channel to start routing messages to agents."
					action={{
						label: "Pair New Channel",
						onClick: () => {
							window.location.href = "/channels/pairing";
						},
					}}
				/>
			) : (
				<ChannelListTable channels={channels} />
			)}
		</div>
	);
}
