import { Suspense } from "react";
import { AgentChatView } from "@/views/chat/agent-chat-view";

export async function generateMetadata({
	params,
}: { params: Promise<{ agentId: string }> }) {
	const { agentId } = await params;
	return {
		title: `Chat with ${agentId} | AXion Hub`,
	};
}

export default async function AgentChatPage({
	params,
}: {
	params: Promise<{ agentId: string }>;
}) {
	const { agentId } = await params;

	return (
		<Suspense>
			<AgentChatView agentId={agentId} />
		</Suspense>
	);
}
