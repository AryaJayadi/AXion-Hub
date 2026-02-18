// Chat store
export { useChatStore } from "./model/chat-store";

// Selector hooks
export {
	useActiveConversation,
	useConversationList,
	useConversationMessages,
	useDraft,
	useStreamingLanes,
} from "./model/hooks";

// Components
export { ChatLayout } from "./components/chat-layout";
export { ConversationSidebar } from "./components/conversation-sidebar";
export { ParticipantPanel } from "./components/participant-panel";

// Re-export entity types for convenience
export type {
	Attachment,
	AttachmentType,
	ChatMessage,
	Conversation,
	ConversationType,
	MessageRole,
	StreamingLane,
	ToolCallInfo,
	ToolCallStatus,
} from "@/entities/chat-message";
