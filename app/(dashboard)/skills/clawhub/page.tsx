import { Suspense } from "react";
import { ClawHubView } from "@/views/skills/clawhub-view";

export const metadata = {
	title: "ClawHub Registry | AXion Hub",
};

export default function ClawHubPage() {
	return (
		<Suspense>
			<ClawHubView />
		</Suspense>
	);
}
