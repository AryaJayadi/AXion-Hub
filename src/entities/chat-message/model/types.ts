/**
 * Chat entity types for the AXion Hub chat system.
 *
 * These types model conversations, messages, streaming lanes for
 * multi-agent parallel display, tool call visualization, and
 * media attachments.
 */

/** Status of an individual tool call within an agent's response */
export type ToolCallStatus = "pending" | "running" | "completed" | "error";

/** Information about a single tool invocation during an agent response */
export interface ToolCallInfo {
	id: string;
	name: string;
	arguments: Record<string, unknown>;
	status: ToolCallStatus;
	output: string | undefined;
	error: string | undefined;
	startedAt: Date | undefined;
	completedAt: Date | undefined;
}

/** Supported attachment types for chat messages */
export type AttachmentType = "image" | "document" | "audio";

/** A media attachment on a chat message */
export interface Attachment {
	id: string;
	type: AttachmentType;
	name: string;
	url: string;
	mimeType: string;
	size: number;
}

/** Role of the message sender */
export type MessageRole = "user" | "assistant" | "system";

/** A single chat message within a conversation */
export interface ChatMessage {
	id: string;
	conversationId: string;
	role: MessageRole;
	agentId: string | undefined;
	content: string;
	timestamp: Date;
	toolCalls: ToolCallInfo[];
	attachments: Attachment[];
}

/**
 * A streaming lane represents an agent's in-progress response.
 *
 * When multiple agents stream simultaneously in a chatroom,
 * each gets a dedicated lane. Once streaming completes,
 * the lane content merges into the conversation feed as a
 * regular ChatMessage.
 */
export interface StreamingLane {
	agentId: string;
	agentName: string;
	messageId: string;
	accumulatedText: string;
	isActive: boolean;
	toolCalls: ToolCallInfo[];
}

/** The type of a conversation */
export type ConversationType = "direct" | "room" | "team";

/** A conversation (1:1 direct, multi-agent room, or agent-initiated team) */
export interface Conversation {
	id: string;
	type: ConversationType;
	agentIds: string[];
	title: string;
	lastMessage: string | undefined;
	lastActivity: Date;
	unreadCount: number;
	isPinned: boolean;
}
