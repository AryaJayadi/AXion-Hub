"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
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
 * on the right side. A dismissible banner informs the user they can
 * interject in agent-to-agent conversations as a full participant.
 * ChatView handles message list, streaming lanes (parallel display
 * per agent), and chat input.
 */
export function TeamChatView({ conversationId }: TeamChatViewProps) {
	const setActiveConversation = useChatStore((s) => s.setActiveConversation);
	const [showBanner, setShowBanner] = useState(true);

	// Set the active conversation on mount
	useEffect(() => {
		setActiveConversation(conversationId);
		return () => {
			setActiveConversation(null);
		};
	}, [conversationId, setActiveConversation]);

	return (
		<ChatLayout conversationId={conversationId} showParticipants>
			{/* Interjection banner */}
			{showBanner && (
				<div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
					<Info className="size-4 shrink-0" />
					<span className="flex-1">
						Agent-to-agent conversation &mdash; you can interject at
						any time
					</span>
					<button
						type="button"
						onClick={() => setShowBanner(false)}
						className="shrink-0 rounded p-0.5 hover:bg-accent"
						aria-label="Dismiss banner"
					>
						<X className="size-3.5" />
					</button>
				</div>
			)}
			<ChatView conversationId={conversationId} />
		</ChatLayout>
	);
}
