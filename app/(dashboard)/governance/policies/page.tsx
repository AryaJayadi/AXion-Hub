import { Suspense } from "react";
import { PoliciesView } from "@/views/governance/policies-view";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Governance Policies | AXion Hub",
};

export default function GovernancePoliciesPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-4">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			}
		>
			<PoliciesView />
		</Suspense>
	);
}
