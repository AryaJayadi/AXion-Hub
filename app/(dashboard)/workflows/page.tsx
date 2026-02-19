import { Suspense } from "react";
import { WorkflowsListView } from "@/views/workflows/workflows-list-view";

export const metadata = {
	title: "Workflows | AXion Hub",
};

export default function WorkflowsPage() {
	return (
		<Suspense>
			<WorkflowsListView />
		</Suspense>
	);
}
