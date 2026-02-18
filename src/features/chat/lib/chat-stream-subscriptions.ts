/**
 * EventBus subscription wiring for chat streaming events.
 *
 * Creates a single subscription point that routes all streaming
 * events from the EventBus into the chat Zustand store actions.
 * Called once at the chat layout level; returns a cleanup function
 * to prevent memory leaks from zombie handlers (Pitfall 3).
 *
 * Streaming flow:
 *   chat.stream.start -> startStream()
 *   chat.stream.token -> appendToStream() (via token buffer)
 *   chat.stream.end   -> finalizeStream()
 *   chat.tool.start   -> addToolCallToStream()
 *   chat.tool.end     -> updateToolCallInStream({ status: 'completed' })
 *   chat.tool.error   -> updateToolCallInStream({ status: 'error' })
 *   chat.room.created -> addConversation()
 */

import type { EventBus } from "@/features/gateway-connection/lib/event-bus";
import { useChatStore } from "../model/chat-store";

/**
 * Initialize EventBus subscriptions for chat stream events.
 *
 * @param eventBus - The EventBus instance from GatewayProvider
 * @returns Cleanup function that unsubscribes all handlers
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   const cleanup = initChatStreamSubscriptions(eventBus);
 *   return cleanup;
 * }, [eventBus]);
 * ```
 */
export function initChatStreamSubscriptions(
	eventBus: EventBus,
): () => void {
	const unsubs: Array<() => void> = [];

	// Stream lifecycle: start -> tokens -> end
	unsubs.push(
		eventBus.on(
			"chat.stream.start",
			({ sessionId, messageId }) => {
				// Use sessionId as both conversationId and a simplified agentId
				// In multi-agent rooms, the event would include an explicit agentId
				useChatStore
					.getState()
					.startStream(sessionId, "agent", "Agent", messageId);
			},
		),
	);

	unsubs.push(
		eventBus.on(
			"chat.stream.token",
			({ sessionId, token }) => {
				const laneKey = `${sessionId}:agent`;
				useChatStore.getState().appendToStream(laneKey, token);
			},
		),
	);

	unsubs.push(
		eventBus.on(
			"chat.stream.end",
			({ sessionId, fullText }) => {
				useChatStore
					.getState()
					.finalizeStream(sessionId, "agent", fullText);
			},
		),
	);

	// Tool call events
	unsubs.push(
		eventBus.on(
			"chat.tool.start",
			({ sessionId, toolCallId, name, arguments: args }) => {
				const laneKey = `${sessionId}:agent`;
				useChatStore.getState().addToolCallToStream(laneKey, {
					id: toolCallId,
					name,
					arguments: args,
					status: "running",
					output: undefined,
					error: undefined,
					startedAt: new Date(),
					completedAt: undefined,
				});
			},
		),
	);

	unsubs.push(
		eventBus.on(
			"chat.tool.end",
			({ sessionId, toolCallId, output }) => {
				const laneKey = `${sessionId}:agent`;
				useChatStore.getState().updateToolCallInStream(laneKey, toolCallId, {
					status: "completed",
					output,
					completedAt: new Date(),
				});
			},
		),
	);

	unsubs.push(
		eventBus.on(
			"chat.tool.error",
			({ sessionId, toolCallId, error }) => {
				const laneKey = `${sessionId}:agent`;
				useChatStore.getState().updateToolCallInStream(laneKey, toolCallId, {
					status: "error",
					error,
					completedAt: new Date(),
				});
			},
		),
	);

	// Room lifecycle: agent-initiated chatrooms
	unsubs.push(
		eventBus.on(
			"chat.room.created",
			({ conversationId, type, agentIds, title }) => {
				useChatStore.getState().addConversation({
					id: conversationId,
					type,
					agentIds,
					title,
					lastMessage: undefined,
					lastActivity: new Date(),
					unreadCount: 0,
					isPinned: false,
				});
			},
		),
	);

	// Return cleanup that unsubscribes all handlers
	return () => {
		for (const unsub of unsubs) {
			unsub();
		}
	};
}
