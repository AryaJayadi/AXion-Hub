import { Suspense } from "react";
import { AgentChannelsView } from "@/views/agents/agent-channels-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Channels - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentChannelsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentChannelsView agentId={agentId} />
		</Suspense>
	);
}
