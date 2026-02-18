"use client";

import { type ReactNode, useState, useCallback } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/shared/ui/resizable";
import { ConversationSidebar } from "./conversation-sidebar";
import { ParticipantPanel } from "./participant-panel";
import { CommandPalette } from "./command-palette";
import { AgentPickerDialog } from "./agent-picker-dialog";
import { useChatStore } from "../model/chat-store";

interface ChatLayoutProps {
	children: ReactNode;
	conversationId?: string | undefined;
	showParticipants?: boolean | undefined;
}

/**
 * Three-panel resizable chat layout.
 *
 * - Left panel: Conversation sidebar (list of conversations)
 * - Main panel: Active chat view (children)
 * - Right panel: Participant panel (agents in the conversation, collapsible)
 * - Global: Cmd+K command palette (rendered once at layout level)
 * - Global: Agent picker dialog (opened via /new command or sidebar button)
 *
 * Uses shadcn/ui Resizable (wraps react-resizable-panels) for
 * drag-to-resize, keyboard accessibility, and touch support.
 */
export function ChatLayout({
	children,
	conversationId,
	showParticipants = false,
}: ChatLayoutProps) {
	const [agentPickerOpen, setAgentPickerOpen] = useState(false);

	const handleOpenAgentPicker = useCallback(() => {
		setAgentPickerOpen(true);
	}, []);

	const handleCreateConversation = useCallback(
		(agentIds: string[], title?: string) => {
			const store = useChatStore.getState();
			const id = crypto.randomUUID();
			const type = agentIds.length > 1 ? "room" : "direct";

			store.addConversation({
				id,
				type,
				agentIds,
				title: title ?? `Chat with ${agentIds.join(", ")}`,
				lastMessage: undefined,
				lastActivity: new Date(),
				unreadCount: 0,
				isPinned: false,
			});
			store.setActiveConversation(id);
		},
		[],
	);

	return (
		<>
			{/* Global command palette (Cmd+K) */}
			<CommandPalette onOpenAgentPicker={handleOpenAgentPicker} />

			{/* Agent picker dialog */}
			<AgentPickerDialog
				open={agentPickerOpen}
				onOpenChange={setAgentPickerOpen}
				onCreateConversation={handleCreateConversation}
			/>

			<ResizablePanelGroup orientation="horizontal" className="h-full">
				{/* Left panel: Conversation sidebar */}
				<ResizablePanel
					defaultSize={25}
					minSize={15}
					maxSize={35}
					collapsible
					id="chat-sidebar"
				>
					<ConversationSidebar
						onNewChat={handleOpenAgentPicker}
					/>
				</ResizablePanel>

				<ResizableHandle withHandle />

				{/* Main panel: Active chat content */}
				<ResizablePanel
					defaultSize={showParticipants ? 55 : 75}
					minSize={40}
					id="chat-main"
				>
					<div className="flex h-full flex-col">{children}</div>
				</ResizablePanel>

				{/* Right panel: Participant panel (only shown for rooms/teams) */}
				{showParticipants && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel
							defaultSize={20}
							minSize={15}
							maxSize={30}
							collapsible
							id="chat-participants"
						>
							<ParticipantPanel
								conversationId={conversationId}
							/>
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</>
	);
}
