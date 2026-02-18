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
export { ChatView } from "./components/chat-view";
export { ConversationSidebar } from "./components/conversation-sidebar";
export { ParticipantPanel } from "./components/participant-panel";
export { MessageList } from "./components/message-list";
export { MessageBubble } from "./components/message-bubble";
export { StreamingLanes } from "./components/streaming-lanes";
export { StreamingLane } from "./components/streaming-lane";
export { ChatInput } from "./components/chat-input";

// Lib
export { useTokenBuffer } from "./lib/token-buffer";
export { initChatStreamSubscriptions } from "./lib/chat-stream-subscriptions";

// Re-export entity types for convenience
export type {
	Attachment,
	AttachmentType,
	ChatMessage,
	Conversation,
	ConversationType,
	MessageRole,
	StreamingLane as StreamingLaneType,
	ToolCallInfo,
	ToolCallStatus,
} from "@/entities/chat-message";
