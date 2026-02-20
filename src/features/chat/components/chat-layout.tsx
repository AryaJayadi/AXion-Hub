"use client";

import {
	type ReactNode,
	createContext,
	useContext,
	useState,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
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

/* ---- ChatLayout context ---- */

interface ChatLayoutContextValue {
	onNewChat: () => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null);

export function useChatLayoutContext() {
	const ctx = useContext(ChatLayoutContext);
	if (!ctx)
		throw new Error(
			"useChatLayoutContext must be used within ChatLayout",
		);
	return ctx;
}

/* ---- ChatLayout component ---- */

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
	const router = useRouter();
	const [agentPickerOpen, setAgentPickerOpen] = useState(false);

	const handleOpenAgentPicker = useCallback(() => {
		setAgentPickerOpen(true);
	}, []);

	const handleCreateConversation = useCallback(
		(agentIds: string[], title?: string) => {
			const store = useChatStore.getState();

			// Resume existing conversation if one exists with the selected agent (direct chat only)
			if (agentIds.length === 1) {
				const existingConvo = Array.from(
					store.conversations.values(),
				).find(
					(c) =>
						c.type === "direct" &&
						c.agentIds.length === 1 &&
						c.agentIds[0] === agentIds[0],
				);
				if (existingConvo) {
					store.setActiveConversation(existingConvo.id);
					router.push(`/chat/${agentIds[0]}`);
					return;
				}
			}

			// No existing conversation -- create new
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
			router.push(`/chat/${agentIds[0]}`);
		},
		[router],
	);

	const contextValue: ChatLayoutContextValue = {
		onNewChat: handleOpenAgentPicker,
	};

	return (
		<ChatLayoutContext.Provider value={contextValue}>
			<div className="flex h-full flex-col">
				{/* Global command palette (Cmd+K) */}
				<CommandPalette onOpenAgentPicker={handleOpenAgentPicker} />

				{/* Agent picker dialog */}
				<AgentPickerDialog
					open={agentPickerOpen}
					onOpenChange={setAgentPickerOpen}
					onCreateConversation={handleCreateConversation}
				/>

				<ResizablePanelGroup orientation="horizontal">
					{/* Left panel: Conversation sidebar */}
					<ResizablePanel
						defaultSize="25%"
						minSize="15%"
						maxSize="35%"
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
						defaultSize={showParticipants ? "55%" : "75%"}
						minSize="40%"
						id="chat-main"
					>
						<div className="flex h-full flex-col">
							{children}
						</div>
					</ResizablePanel>

					{/* Right panel: Participant panel (only shown for rooms/teams) */}
					{showParticipants && (
						<>
							<ResizableHandle withHandle />
							<ResizablePanel
								defaultSize="20%"
								minSize="15%"
								maxSize="30%"
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
			</div>
		</ChatLayoutContext.Provider>
	);
}
