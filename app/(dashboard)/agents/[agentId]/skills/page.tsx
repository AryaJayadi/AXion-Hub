import { Suspense } from "react";
import { AgentSkillsView } from "@/views/agents/agent-skills-view";

export async function generateMetadata({ params }: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Skills - Agent ${agentId} | AXion Hub`,
	};
}

export default async function AgentSkillsPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentSkillsView agentId={agentId} />
		</Suspense>
	);
}
