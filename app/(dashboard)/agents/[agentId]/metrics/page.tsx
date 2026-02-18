import { Suspense } from "react";
import { AgentMetricsView } from "@/views/agents/agent-metrics-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Metrics - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentMetricsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentMetricsView agentId={agentId} />
		</Suspense>
	);
}
