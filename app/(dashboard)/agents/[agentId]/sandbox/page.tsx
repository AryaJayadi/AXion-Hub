import { Suspense } from "react";
import { AgentSandboxView } from "@/views/agents/agent-sandbox-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Sandbox - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentSandboxPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentSandboxView agentId={agentId} />
		</Suspense>
	);
}
