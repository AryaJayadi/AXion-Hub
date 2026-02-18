"use client";

import { Info } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";
import { GatewayNodesTable } from "@/features/gateway/components/gateway-nodes-table";
import { useGatewayNodes } from "@/features/gateway/api/use-gateway-nodes";

export function GatewayNodesView() {
	const { data: nodes, isLoading } = useGatewayNodes();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Gateway Nodes"
				description="Connected devices and their capabilities"
			/>

			{/* Info alert */}
			<div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
				<Info className="mt-0.5 size-4 shrink-0 text-primary" />
				<p className="text-sm text-muted-foreground">
					Nodes are physical devices running the OpenClaw client. They provide
					filesystem access, terminal, browser, and other capabilities to your
					agents.
				</p>
			</div>

			{/* Content */}
			{isLoading ? (
				<SkeletonTable rows={3} columns={6} />
			) : !nodes || nodes.length === 0 ? (
				<EmptyState
					title="No nodes connected"
					description="Connect a device by installing the OpenClaw client and pairing it with your gateway instance."
				/>
			) : (
				<GatewayNodesTable data={nodes} />
			)}
		</div>
	);
}
