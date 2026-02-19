import { Suspense } from "react";
import { DeliverablesView } from "@/views/workspace/deliverables-view";

export const metadata = {
	title: "Deliverables | AXion Hub",
};

export default function DeliverablesPage() {
	return (
		<Suspense>
			<DeliverablesView />
		</Suspense>
	);
}
