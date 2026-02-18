"use client";

import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { useChannel } from "@/features/channels/api/use-channels";
import { ChannelConfigForm } from "@/features/channels/components/channel-config-form";
import { ChannelGroupSettings } from "@/features/channels/components/channel-group-settings";

interface ChannelDetailViewProps {
	channelId: string;
}

export function ChannelDetailView({ channelId }: ChannelDetailViewProps) {
	const { data: channel, isLoading } = useChannel(channelId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<SkeletonDetail />
			</div>
		);
	}

	if (!channel) {
		return (
			<div className="space-y-6">
				<PageHeader
					title="Channel Not Found"
					description="The requested channel could not be found."
					breadcrumbs={[
						{ label: "Channels", href: "/channels" },
						{ label: "Not Found" },
					]}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={channel.name}
				description="Configure channel settings and group behavior"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: channel.name },
				]}
				actions={
					<Badge variant="outline" className="text-sm capitalize">
						{channel.platform}
					</Badge>
				}
			/>

			{/* Channel Configuration Form */}
			<section className="max-w-2xl">
				<h2 className="mb-4 text-lg font-semibold">
					Channel Configuration
				</h2>
				<ChannelConfigForm channel={channel} />
			</section>

			<Separator />

			{/* Group Settings */}
			<section className="max-w-2xl">
				<h2 className="mb-4 text-lg font-semibold">Group Settings</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					Configure how this channel handles group messages,
					allowlists, and mention patterns.
				</p>
				<ChannelGroupSettings channelId={channelId} />
			</section>
		</div>
	);
}
