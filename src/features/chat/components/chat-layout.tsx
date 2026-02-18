"use client";

import type { ReactNode } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/shared/ui/resizable";
import { ConversationSidebar } from "./conversation-sidebar";
import { ParticipantPanel } from "./participant-panel";

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
 *
 * Uses shadcn/ui Resizable (wraps react-resizable-panels) for
 * drag-to-resize, keyboard accessibility, and touch support.
 */
export function ChatLayout({
	children,
	conversationId,
	showParticipants = false,
}: ChatLayoutProps) {
	return (
		<ResizablePanelGroup orientation="horizontal" className="h-full">
			{/* Left panel: Conversation sidebar */}
			<ResizablePanel
				defaultSize={25}
				minSize={15}
				maxSize={35}
				collapsible
				id="chat-sidebar"
			>
				<ConversationSidebar />
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
						<ParticipantPanel conversationId={conversationId} />
					</ResizablePanel>
				</>
			)}
		</ResizablePanelGroup>
	);
}
