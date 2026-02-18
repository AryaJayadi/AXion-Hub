import { Suspense } from "react";
import { AgentDetailView } from "@/views/agents/agent-detail-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentDetailPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentDetailView agentId={agentId} />
		</Suspense>
	);
}
