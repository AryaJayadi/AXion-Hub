"use client";

import { useEffect } from "react";
import { Users } from "lucide-react";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { useChatStore } from "@/features/chat/model/chat-store";

interface TeamChatViewProps {
	conversationId: string;
}

/**
 * Team chat view -- renders when the user navigates to
 * /chat/team/[conversationId].
 *
 * Shows a multi-agent chatroom with the participant panel visible
 * on the right side. The streaming chat UI with parallel lanes
 * will be added in 04-02; this is the structural shell.
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
			<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
				<Users className="size-10 text-muted-foreground/40" />
				<p className="text-sm">
					Team conversation{" "}
					<span className="font-medium text-foreground">
						{conversationId}
					</span>
				</p>
				<p className="text-xs">
					Multi-agent streaming UI will be available in the next
					update.
				</p>
			</div>
		</ChatLayout>
	);
}
