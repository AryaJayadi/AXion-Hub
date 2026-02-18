import { AgentIdentityView } from "@/views/agents/agent-identity-view";

export const metadata = { title: "Identity Editor | AXion Hub" };

export default async function AgentIdentityPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return <AgentIdentityView agentId={agentId} />;
}
