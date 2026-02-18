"use client";

import { useQueryState } from "nuqs";
import { TableProperties, GitBranch } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { Skeleton } from "@/shared/ui/skeleton";
import { useChannelRouting } from "@/features/channels/api/use-channel-routing";
import { useChannels } from "@/features/channels/api/use-channels";
import { RoutingTable } from "@/features/channels/components/routing-table";
import { RoutingGraph } from "@/features/channels/components/routing-graph";
import { cn } from "@/shared/lib/cn";

export function ChannelRoutingView() {
	const [view, setView] = useQueryState("view", { defaultValue: "table" });
	const { data: routing, isLoading: routingLoading } = useChannelRouting();
	const { data: channels, isLoading: channelsLoading } = useChannels();

	const isLoading = routingLoading || channelsLoading;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Channel Routing"
				description="Configure how channels route messages to agents"
				breadcrumbs={[
					{ label: "Channels", href: "/channels" },
					{ label: "Routing" },
				]}
				actions={
					<div className="flex items-center gap-1 rounded-lg border p-1">
						<Button
							variant={view === "table" ? "secondary" : "ghost"}
							size="sm"
							className={cn(
								"gap-1.5",
								view === "table" && "shadow-sm",
							)}
							onClick={() => setView("table")}
						>
							<TableProperties className="size-4" />
							Table
						</Button>
						<Button
							variant={view === "graph" ? "secondary" : "ghost"}
							size="sm"
							className={cn(
								"gap-1.5",
								view === "graph" && "shadow-sm",
							)}
							onClick={() => setView("graph")}
						>
							<GitBranch className="size-4" />
							Graph
						</Button>
					</div>
				}
			/>

			{isLoading ? (
				view === "table" ? (
					<SkeletonTable rows={5} columns={5} />
				) : (
					<div className="flex h-[500px] items-center justify-center rounded-lg border bg-card">
						<Skeleton className="h-64 w-64 rounded-lg" />
					</div>
				)
			) : routing && channels ? (
				view === "table" ? (
					<RoutingTable routing={routing} channels={channels} />
				) : (
					<RoutingGraph routing={routing} channels={channels} />
				)
			) : null}
		</div>
	);
}
