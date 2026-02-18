import { Suspense } from "react";
import { AgentsRosterView } from "@/views/agents/agents-roster-view";

export const metadata = {
	title: "Agents | AXion Hub",
};

export default function AgentsPage() {
	return (
		<Suspense>
			<AgentsRosterView />
		</Suspense>
	);
}
