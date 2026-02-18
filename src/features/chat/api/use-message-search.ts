/**
 * TanStack Query hook for searching messages across conversations.
 *
 * Searches the Zustand store's messages in-memory, filtering by content.
 * Supports scoping to the current conversation or searching globally.
 *
 * TODO: Replace with server-side search endpoint when available.
 */

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ChatMessage } from "@/entities/chat-message";
import { queryKeys } from "@/shared/lib/query-keys";
import { useChatStore } from "../model/chat-store";

export interface SearchResult {
	message: ChatMessage;
	conversationId: string;
	conversationTitle: string;
}

export function useMessageSearch(
	query: string,
	scope: "current" | "global",
	conversationId?: string | undefined,
) {
	const scopeKey = scope === "current" ? conversationId : "global";

	return useQuery({
		queryKey: queryKeys.messages.search(query, scopeKey),
		queryFn: async (): Promise<SearchResult[]> => {
			const store = useChatStore.getState();
			const results: SearchResult[] = [];
			const q = query.toLowerCase();

			const conversationIds =
				scope === "current" && conversationId
					? [conversationId]
					: Array.from(store.messages.keys());

			for (const convId of conversationIds) {
				const messages = store.messages.get(convId) ?? [];
				const conversation = store.conversations.get(convId);
				const title = conversation?.title ?? convId;

				for (const message of messages) {
					if (message.content.toLowerCase().includes(q)) {
						results.push({
							message,
							conversationId: convId,
							conversationTitle: title,
						});
					}
				}
			}

			return results;
		},
		enabled: query.length >= 2,
		placeholderData: keepPreviousData,
		staleTime: 5_000,
	});
}
