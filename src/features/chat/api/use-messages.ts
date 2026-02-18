/**
 * TanStack Query hook for fetching message history for a conversation.
 *
 * Currently returns an empty array as message history fetching depends
 * on a gateway API that isn't fully defined yet. Real-time messages
 * arrive via WebSocket and are stored directly in the Zustand chat store.
 *
 * TODO: Replace with gateway session transcript fetch when API contract
 * is finalized.
 */

import { useQuery } from "@tanstack/react-query";
import type { ChatMessage } from "@/entities/chat-message";
import { queryKeys } from "@/shared/lib/query-keys";
import { useChatStore } from "../model/chat-store";

export function useMessages(conversationId: string) {
	return useQuery({
		queryKey: queryKeys.messages.byConversation(conversationId),
		queryFn: async (): Promise<ChatMessage[]> => {
			// TODO: Replace with gateway session transcript fetch when
			// API contract is finalized. Real-time messages come via
			// WebSocket and are stored in the Zustand chat store.
			return [];
		},
		enabled: !!conversationId,
		staleTime: Number.POSITIVE_INFINITY,
		select: (data) => {
			// Seed Zustand store with fetched messages
			if (data.length > 0) {
				const store = useChatStore.getState();
				const existing = store.messages.get(conversationId) ?? [];
				if (existing.length === 0) {
					for (const message of data) {
						store.addMessage(conversationId, message);
					}
				}
			}
			return data;
		},
	});
}
