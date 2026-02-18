import { Suspense } from "react";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Gateway Instances | AXion Hub",
};

// Placeholder -- will be replaced with GatewayInstancesView in Task 2
export default function GatewayInstancesPage() {
	return (
		<Suspense fallback={<SkeletonCard />}>
			<div>Gateway instances -- coming in Task 2</div>
		</Suspense>
	);
}
