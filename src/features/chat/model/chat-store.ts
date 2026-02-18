/**
 * Zustand chat store for real-time chat state.
 *
 * Manages conversations, messages, streaming lanes (multi-agent parallel
 * display), and draft text preservation. Follows the PUSH state pattern
 * established in 01-05: EventBus events drive state updates.
 *
 * Streaming flow:
 *   1. startStream() creates a lane for an agent in a conversation
 *   2. appendToStream() accumulates tokens (called via rAF-buffered flush)
 *   3. addToolCallToStream() / updateToolCallInStream() track tool execution
 *   4. finalizeStream() moves lane content to messages and deletes the lane
 */

import { create } from "zustand";
import type {
	ChatMessage,
	Conversation,
	StreamingLane,
	ToolCallInfo,
} from "@/entities/chat-message";

interface ChatStore {
	// State
	conversations: Map<string, Conversation>;
	activeConversationId: string | null;
	messages: Map<string, ChatMessage[]>;
	streamingLanes: Map<string, StreamingLane>; // key: `${conversationId}:${agentId}`
	drafts: Map<string, string>; // conversationId -> unsent text

	// Conversation actions
	setActiveConversation: (id: string | null) => void;
	addConversation: (conversation: Conversation) => void;
	removeConversation: (id: string) => void;
	updateConversation: (
		id: string,
		partial: Partial<Omit<Conversation, "id">>,
	) => void;

	// Message actions
	addMessage: (conversationId: string, message: ChatMessage) => void;

	// Streaming actions
	startStream: (
		conversationId: string,
		agentId: string,
		agentName: string,
		messageId: string,
	) => void;
	appendToStream: (laneKey: string, token: string) => void;
	addToolCallToStream: (laneKey: string, toolCall: ToolCallInfo) => void;
	updateToolCallInStream: (
		laneKey: string,
		toolCallId: string,
		partial: Partial<Omit<ToolCallInfo, "id">>,
	) => void;
	finalizeStream: (
		conversationId: string,
		agentId: string,
		fullText: string,
	) => void;

	// Draft actions
	saveDraft: (conversationId: string, text: string) => void;
	getDraft: (conversationId: string) => string;
}

export const useChatStore = create<ChatStore>((set, get) => ({
	conversations: new Map(),
	activeConversationId: null,
	messages: new Map(),
	streamingLanes: new Map(),
	drafts: new Map(),

	// --- Conversation actions ---

	setActiveConversation: (id) => set({ activeConversationId: id }),

	addConversation: (conversation) =>
		set((state) => {
			const conversations = new Map(state.conversations);
			conversations.set(conversation.id, conversation);
			return { conversations };
		}),

	removeConversation: (id) =>
		set((state) => {
			const conversations = new Map(state.conversations);
			conversations.delete(id);

			// Also clean up messages, drafts, and streaming lanes for this conversation
			const messages = new Map(state.messages);
			messages.delete(id);

			const drafts = new Map(state.drafts);
			drafts.delete(id);

			const streamingLanes = new Map(state.streamingLanes);
			for (const key of streamingLanes.keys()) {
				if (key.startsWith(`${id}:`)) {
					streamingLanes.delete(key);
				}
			}

			return {
				conversations,
				messages,
				drafts,
				streamingLanes,
				activeConversationId:
					state.activeConversationId === id
						? null
						: state.activeConversationId,
			};
		}),

	updateConversation: (id, partial) =>
		set((state) => {
			const conversations = new Map(state.conversations);
			const existing = conversations.get(id);
			if (existing) {
				conversations.set(id, { ...existing, ...partial });
			}
			return { conversations };
		}),

	// --- Message actions ---

	addMessage: (conversationId, message) =>
		set((state) => {
			const messages = new Map(state.messages);
			const existing = messages.get(conversationId) ?? [];
			messages.set(conversationId, [...existing, message]);

			// Update conversation's lastMessage and lastActivity
			const conversations = new Map(state.conversations);
			const convo = conversations.get(conversationId);
			if (convo) {
				conversations.set(conversationId, {
					...convo,
					lastMessage:
						message.content.slice(0, 100) || convo.lastMessage,
					lastActivity: message.timestamp,
				});
			}

			return { messages, conversations };
		}),

	// --- Streaming actions ---

	startStream: (conversationId, agentId, agentName, messageId) =>
		set((state) => {
			const lanes = new Map(state.streamingLanes);
			const key = `${conversationId}:${agentId}`;
			lanes.set(key, {
				agentId,
				agentName,
				messageId,
				accumulatedText: "",
				isActive: true,
				toolCalls: [],
			});
			return { streamingLanes: lanes };
		}),

	appendToStream: (laneKey, token) =>
		set((state) => {
			const lanes = new Map(state.streamingLanes);
			const lane = lanes.get(laneKey);
			if (lane) {
				lanes.set(laneKey, {
					...lane,
					accumulatedText: lane.accumulatedText + token,
				});
			}
			return { streamingLanes: lanes };
		}),

	addToolCallToStream: (laneKey, toolCall) =>
		set((state) => {
			const lanes = new Map(state.streamingLanes);
			const lane = lanes.get(laneKey);
			if (lane) {
				lanes.set(laneKey, {
					...lane,
					toolCalls: [...lane.toolCalls, toolCall],
				});
			}
			return { streamingLanes: lanes };
		}),

	updateToolCallInStream: (laneKey, toolCallId, partial) =>
		set((state) => {
			const lanes = new Map(state.streamingLanes);
			const lane = lanes.get(laneKey);
			if (lane) {
				lanes.set(laneKey, {
					...lane,
					toolCalls: lane.toolCalls.map((tc) =>
						tc.id === toolCallId ? { ...tc, ...partial } : tc,
					),
				});
			}
			return { streamingLanes: lanes };
		}),

	finalizeStream: (conversationId, agentId, fullText) =>
		set((state) => {
			const laneKey = `${conversationId}:${agentId}`;
			const lane = state.streamingLanes.get(laneKey);

			// Delete the lane
			const streamingLanes = new Map(state.streamingLanes);
			streamingLanes.delete(laneKey);

			// Move finalized content to message list
			const messages = new Map(state.messages);
			const existing = messages.get(conversationId) ?? [];
			const finalizedMessage: ChatMessage = {
				id: lane?.messageId ?? crypto.randomUUID(),
				conversationId,
				role: "assistant",
				agentId,
				content: fullText,
				timestamp: new Date(),
				toolCalls: lane?.toolCalls ?? [],
				attachments: [],
			};
			messages.set(conversationId, [...existing, finalizedMessage]);

			// Update conversation's lastMessage and lastActivity
			const conversations = new Map(state.conversations);
			const convo = conversations.get(conversationId);
			if (convo) {
				conversations.set(conversationId, {
					...convo,
					lastMessage: fullText.slice(0, 100),
					lastActivity: finalizedMessage.timestamp,
				});
			}

			return { streamingLanes, messages, conversations };
		}),

	// --- Draft actions ---

	saveDraft: (conversationId, text) =>
		set((state) => {
			const drafts = new Map(state.drafts);
			if (text.trim()) {
				drafts.set(conversationId, text);
			} else {
				drafts.delete(conversationId);
			}
			return { drafts };
		}),

	getDraft: (conversationId) => get().drafts.get(conversationId) ?? "",
}));
