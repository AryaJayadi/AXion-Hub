import { Suspense } from "react";
import { AgentSessionsView } from "@/views/agents/agent-sessions-view";

export const metadata = {
	title: "Sessions | AXion Hub",
};

export default async function AgentSessionsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentSessionsView agentId={agentId} />
		</Suspense>
	);
}
