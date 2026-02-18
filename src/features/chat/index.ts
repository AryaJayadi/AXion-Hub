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
