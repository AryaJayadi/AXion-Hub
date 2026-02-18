"use client";

import { useEffect } from "react";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { ChatView } from "@/features/chat/components/chat-view";
import { useChatStore } from "@/features/chat/model/chat-store";

interface AgentChatViewProps {
	agentId: string;
}

/**
 * Agent chat view -- renders when the user navigates to /chat/[agentId].
 *
 * Shows a 1:1 direct conversation with a specific agent.
 * Wraps ChatView (message list + streaming + input) inside the
 * three-panel ChatLayout.
 */
export function AgentChatView({ agentId }: AgentChatViewProps) {
	const setActiveConversation = useChatStore((s) => s.setActiveConversation);

	// Set the active conversation on mount
	useEffect(() => {
		setActiveConversation(agentId);
		return () => {
			setActiveConversation(null);
		};
	}, [agentId, setActiveConversation]);

	return (
		<ChatLayout conversationId={agentId} showParticipants={false}>
			<ChatView conversationId={agentId} agentId={agentId} />
		</ChatLayout>
	);
}
