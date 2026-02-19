import { Suspense } from "react";
import { ApprovalsListView } from "@/views/approvals/approvals-list-view";

export const metadata = {
	title: "Approvals | AXion Hub",
};

export default function ApprovalsPage() {
	return (
		<Suspense>
			<ApprovalsListView />
		</Suspense>
	);
}
