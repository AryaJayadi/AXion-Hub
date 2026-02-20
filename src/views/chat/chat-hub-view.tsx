"use client";

import { MessageSquare } from "lucide-react";
import {
	ChatLayout,
	useChatLayoutContext,
} from "@/features/chat/components/chat-layout";
import { EmptyState } from "@/shared/ui/empty-state";

/**
 * Inner content component that consumes ChatLayoutContext.
 *
 * Separated from ChatHubView so that the context provider (ChatLayout)
 * wraps this component, making the context value available.
 */
function ChatHubContent() {
	const { onNewChat } = useChatLayoutContext();

	return (
		<div className="flex h-full items-center justify-center">
			<EmptyState
				icon={
					<MessageSquare className="size-12 text-muted-foreground/40" />
				}
				title="Select a conversation"
				description="Pick a conversation from the sidebar or start a new chat with an agent."
				action={{
					label: "New Chat",
					onClick: onNewChat,
				}}
			/>
		</div>
	);
}

/**
 * Chat hub view -- renders when the user navigates to /chat.
 *
 * Shows the conversation sidebar with an empty state in the main area
 * prompting the user to select a conversation or start a new chat.
 */
export function ChatHubView() {
	return (
		<ChatLayout showParticipants={false}>
			<ChatHubContent />
		</ChatLayout>
	);
}
