import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingSkeleton } from "@/shared/ui/loading-skeleton";
import { GatewayConfigView } from "@/views/gateway/gateway-config-view";

export const metadata: Metadata = {
	title: "Gateway Configuration",
};

export default function GatewayConfigPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-6 p-6">
					<LoadingSkeleton className="h-8 w-64 rounded" />
					<LoadingSkeleton className="h-4 w-96 rounded" />
					<LoadingSkeleton className="h-10 w-full rounded" />
					<LoadingSkeleton className="h-[400px] w-full rounded-lg" />
				</div>
			}
		>
			<GatewayConfigView />
		</Suspense>
	);
}
