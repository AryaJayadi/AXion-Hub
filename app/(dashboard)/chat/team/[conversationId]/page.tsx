import { Suspense } from "react";
import { TeamChatView } from "@/views/chat/team-chat-view";

export async function generateMetadata({
	params,
}: { params: Promise<{ conversationId: string }> }) {
	const { conversationId } = await params;
	return {
		title: `Team Chat ${conversationId} | AXion Hub`,
	};
}

export default async function TeamChatPage({
	params,
}: {
	params: Promise<{ conversationId: string }>;
}) {
	const { conversationId } = await params;

	return (
		<Suspense>
			<TeamChatView conversationId={conversationId} />
		</Suspense>
	);
}
