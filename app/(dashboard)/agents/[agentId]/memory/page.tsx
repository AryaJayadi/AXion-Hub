import { Suspense } from "react";
import { AgentMemoryView } from "@/views/agents/agent-memory-view";

export const metadata = {
	title: "Memory | AXion Hub",
};

export default async function AgentMemoryPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentMemoryView agentId={agentId} />
		</Suspense>
	);
}
