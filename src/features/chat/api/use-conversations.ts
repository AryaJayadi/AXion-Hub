/**
 * TanStack Query hook for fetching the conversation list.
 *
 * Uses the gateway client to fetch sessions and transforms them into
 * Conversation objects. Conversations update primarily via WebSocket PUSH
 * events, so the REST fetch serves as a backup/initial load mechanism.
 *
 * On success, seeds the Zustand chat store so components using the store
 * directly (e.g., the conversation sidebar) have data available.
 */

import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@/entities/chat-message";
import { useGateway } from "@/app/providers/gateway-provider";
import { queryKeys } from "@/shared/lib/query-keys";
import { useChatStore } from "../model/chat-store";

export function useConversations(filters?: Record<string, unknown>) {
	const { gatewayClient } = useGateway();

	return useQuery({
		queryKey: queryKeys.conversations.list(filters),
		queryFn: async (): Promise<Conversation[]> => {
			try {
				// Gateway sessions map to conversations.
				// getSessions requires an agentId, but for a full conversation
				// list we'd need a dedicated endpoint. For now, return empty
				// and rely on WebSocket PUSH to populate conversations.
				// TODO: Replace with a gateway "conversations.list" endpoint
				// when the API contract supports listing all conversations.
				return [];
			} catch {
				return [];
			}
		},
		staleTime: 30_000,
		select: (data) => {
			// Seed Zustand store with fetched conversations
			const store = useChatStore.getState();
			for (const conversation of data) {
				store.addConversation(conversation);
			}
			return data;
		},
	});
}
