import { AgentDetailShell } from "@/widgets/agent-detail-layout/components/agent-detail-shell";

export default async function AgentDetailLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return <AgentDetailShell agentId={agentId}>{children}</AgentDetailShell>;
}
