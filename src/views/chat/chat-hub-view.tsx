"use client";

import { MessageSquare } from "lucide-react";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { EmptyState } from "@/shared/ui/empty-state";

/**
 * Chat hub view -- renders when the user navigates to /chat.
 *
 * Shows the conversation sidebar with an empty state in the main area
 * prompting the user to select a conversation or start a new chat.
 */
export function ChatHubView() {
	return (
		<ChatLayout showParticipants={false}>
			<div className="flex h-full items-center justify-center">
				<EmptyState
					icon={
						<MessageSquare className="size-12 text-muted-foreground/40" />
					}
					title="Select a conversation"
					description="Pick a conversation from the sidebar or start a new chat with an agent."
					action={{
						label: "New Chat",
						onClick: () => {
							/* Agent picker dialog will be wired in 04-02 */
						},
					}}
				/>
			</div>
		</ChatLayout>
	);
}
