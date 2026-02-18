import { Suspense } from "react";
import { AgentLogsView } from "@/views/agents/agent-logs-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Logs - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentLogsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentLogsView agentId={agentId} />
		</Suspense>
	);
}
