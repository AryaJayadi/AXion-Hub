import { Suspense } from "react";
import { AgentToolsView } from "@/views/agents/agent-tools-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Tools - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentToolsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentToolsView agentId={agentId} />
		</Suspense>
	);
}
