import { Suspense } from "react";
import type { Metadata } from "next";
import { GatewayNodesView } from "@/views/gateway/gateway-nodes-view";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

export const metadata: Metadata = {
	title: "Gateway Nodes | AXion Hub",
};

export default function GatewayNodesPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={3} columns={6} />}>
			<GatewayNodesView />
		</Suspense>
	);
}
