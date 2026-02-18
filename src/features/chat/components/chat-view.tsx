"use client";

/**
 * Complete chat view composing message list, streaming lanes, and input.
 *
 * Handles:
 * - Message sending via GatewayClient with optimistic UI update
 * - EventBus subscription initialization for stream events
 * - Layout: message list fills vertical space, input pinned at bottom
 */

import { useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { useGateway } from "@/app/providers/gateway-provider";
import { useChatStore } from "../model/chat-store";
import { initChatStreamSubscriptions } from "../lib/chat-stream-subscriptions";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

interface ChatViewProps {
	conversationId: string;
	agentId?: string | undefined;
}

/**
 * Full chat experience: message list + streaming lanes + input.
 *
 * - Sends messages via GatewayClient, adds optimistic user message to store
 * - Initializes EventBus subscriptions for streaming events on mount
 * - Cleans up subscriptions on unmount to prevent memory leaks
 */
export function ChatView({ conversationId, agentId }: ChatViewProps) {
	const { gatewayClient, eventBus } = useGateway();
	const cleanupRef = useRef<(() => void) | null>(null);

	// Initialize EventBus stream subscriptions
	useEffect(() => {
		cleanupRef.current = initChatStreamSubscriptions(eventBus);

		return () => {
			cleanupRef.current?.();
			cleanupRef.current = null;
		};
	}, [eventBus]);

	// Handle sending a message
	const handleSend = useCallback(
		(text: string) => {
			const targetAgentId = agentId ?? conversationId;

			// Optimistically add the user message to the store
			const optimisticId = nanoid();
			useChatStore.getState().addMessage(conversationId, {
				id: optimisticId,
				conversationId,
				role: "user",
				agentId: undefined,
				content: text,
				timestamp: new Date(),
				toolCalls: [],
				attachments: [],
			});

			// Send via gateway (fire and forget -- response arrives via EventBus)
			gatewayClient
				.sendMessage(targetAgentId, text, conversationId)
				.catch((error) => {
					// Log the error but don't throw -- the optimistic message
					// stays in the UI. Future: add error state to message.
					console.error("Failed to send message:", error);
				});
		},
		[agentId, conversationId, gatewayClient],
	);

	return (
		<div className="flex h-full flex-col">
			{/* Message list fills available space */}
			<MessageList conversationId={conversationId} />

			{/* Chat input pinned at bottom */}
			<ChatInput
				conversationId={conversationId}
				onSend={handleSend}
			/>
		</div>
	);
}
