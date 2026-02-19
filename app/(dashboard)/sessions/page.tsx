import { Suspense } from "react";
import { SessionsListView } from "@/views/sessions/sessions-list-view";
import { SkeletonTable } from "@/shared/ui/loading-skeleton";

export const metadata = {
	title: "Sessions | AXion Hub",
};

export default function SessionsPage() {
	return (
		<Suspense fallback={<SkeletonTable rows={8} columns={6} />}>
			<SessionsListView />
		</Suspense>
	);
}
