"use client";

import { useEffect } from "react";
import { Bot } from "lucide-react";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { useChatStore } from "@/features/chat/model/chat-store";

interface AgentChatViewProps {
	agentId: string;
}

/**
 * Agent chat view -- renders when the user navigates to /chat/[agentId].
 *
 * Shows a 1:1 direct conversation with a specific agent.
 * The streaming chat UI will be added in 04-02; this is the
 * structural shell with layout and routing.
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
			<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
				<Bot className="size-10 text-muted-foreground/40" />
				<p className="text-sm">
					Chat with agent{" "}
					<span className="font-medium text-foreground">
						{agentId}
					</span>
				</p>
				<p className="text-xs">
					Streaming chat UI will be available in the next update.
				</p>
			</div>
		</ChatLayout>
	);
}
