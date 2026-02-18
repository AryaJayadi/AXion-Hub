"use client";

import { useEffect } from "react";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { ChatView } from "@/features/chat/components/chat-view";
import { useChatStore } from "@/features/chat/model/chat-store";

interface TeamChatViewProps {
	conversationId: string;
}

/**
 * Team chat view -- renders when the user navigates to
 * /chat/team/[conversationId].
 *
 * Shows a multi-agent chatroom with the participant panel visible
 * on the right side. ChatView handles message list, streaming
 * lanes (parallel display per agent), and chat input.
 */
export function TeamChatView({ conversationId }: TeamChatViewProps) {
	const setActiveConversation = useChatStore((s) => s.setActiveConversation);

	// Set the active conversation on mount
	useEffect(() => {
		setActiveConversation(conversationId);
		return () => {
			setActiveConversation(null);
		};
	}, [conversationId, setActiveConversation]);

	return (
		<ChatLayout conversationId={conversationId} showParticipants>
			<ChatView conversationId={conversationId} />
		</ChatLayout>
	);
}
