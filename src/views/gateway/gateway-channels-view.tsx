"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { useGatewayChannels } from "@/features/gateway/api/use-gateway-channels";
import { GatewayChannelsTable } from "@/features/gateway/components/gateway-channels-table";

export function GatewayChannelsView() {
	const { data: channels, isLoading } = useGatewayChannels();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Connected Channels"
				description="Channels connected to this gateway instance"
				actions={
					<Button variant="outline" asChild>
						<Link href="/channels">
							Full Channel Management
							<ExternalLink className="ml-1 size-4" />
						</Link>
					</Button>
				}
			/>

			{isLoading ? (
				<SkeletonTable rows={5} columns={5} />
			) : !channels || channels.length === 0 ? (
				<EmptyState
					title="No channels connected"
					description="No messaging channels are connected to this gateway."
				/>
			) : (
				<GatewayChannelsTable channels={channels} />
			)}
		</div>
	);
}
