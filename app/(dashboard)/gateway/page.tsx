import { Suspense } from "react";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Gateway | AXion Hub",
};

// Placeholder -- will be replaced with GatewayOverviewView in Task 2
export default function GatewayPage() {
	return (
		<Suspense fallback={<SkeletonCard />}>
			<div>Gateway overview -- coming in Task 2</div>
		</Suspense>
	);
}
