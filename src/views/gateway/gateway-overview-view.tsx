"use client";

import Link from "next/link";
import {
	Globe,
	Server,
	Settings,
	Workflow,
} from "lucide-react";
import { useGatewayHealth } from "@/features/gateway/api/use-gateway-health";
import { useGatewayInstances } from "@/features/gateway/api/use-gateway-instances";
import { GatewayHealthCard } from "@/features/gateway/components/gateway-health-card";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

interface QuickLinkItem {
	title: string;
	description: string;
	href: string;
	icon: React.ElementType;
}

const QUICK_LINKS: QuickLinkItem[] = [
	{
		title: "Configuration",
		description: "View and edit OpenClaw config",
		href: "/gateway/config",
		icon: Settings,
	},
	{
		title: "Instances",
		description: "Manage gateway instances",
		href: "/gateway/instances",
		icon: Server,
	},
	{
		title: "Channels",
		description: "Connected messaging channels",
		href: "/gateway/channels",
		icon: Globe,
	},
	{
		title: "Nodes",
		description: "Devices and platform nodes",
		href: "/gateway/nodes",
		icon: Workflow,
	},
];

export function GatewayOverviewView() {
	const { data: health, isLoading: healthLoading } = useGatewayHealth();
	const { data: instances, isLoading: instancesLoading } =
		useGatewayInstances();

	const totalAgents =
		instances?.reduce((sum, inst) => sum + inst.connectedAgents, 0) ?? 0;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway"
				description="OpenClaw gateway connection status and management"
			/>

			{/* Health card */}
			{healthLoading || !health ? (
				<SkeletonCard />
			) : (
				<GatewayHealthCard health={health} connectedAgents={totalAgents} />
			)}

			{/* Summary stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Active Instances
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{instancesLoading ? "..." : (instances?.length ?? 0)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Connected Channels
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{healthLoading
								? "..."
								: (health?.components.find((c) => c.name === "WebSocket")
										?.connections ?? 0)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick links */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{QUICK_LINKS.map((link) => (
					<Link key={link.href} href={link.href}>
						<Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-sm">
									<link.icon className="size-4 text-muted-foreground" />
									{link.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-muted-foreground">
									{link.description}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
