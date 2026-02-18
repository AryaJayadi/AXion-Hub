/**
 * Selector-based React hooks for the chat store.
 *
 * Each hook uses a Zustand selector to subscribe only to the
 * specific slice of state it needs, minimizing React re-renders.
 * Follows the selector-hooks pattern from 01-05 (connection store hooks).
 */

import { useMemo } from "react";
import type { Conversation, StreamingLane } from "@/entities/chat-message";
import { useChatStore } from "./chat-store";

/**
 * Returns the active conversation object, or null if none is selected.
 */
export function useActiveConversation(): Conversation | null {
	const activeId = useChatStore((s) => s.activeConversationId);
	const conversations = useChatStore((s) => s.conversations);
	if (!activeId) return null;
	return conversations.get(activeId) ?? null;
}

/**
 * Returns the messages array for a specific conversation.
 */
export function useConversationMessages(conversationId: string | undefined) {
	const messages = useChatStore((s) => s.messages);
	if (!conversationId) return [];
	return messages.get(conversationId) ?? [];
}

/**
 * Returns the active streaming lanes for a specific conversation.
 * Filters the lane map by key prefix matching `conversationId:`.
 */
export function useStreamingLanes(
	conversationId: string | undefined,
): StreamingLane[] {
	const streamingLanes = useChatStore((s) => s.streamingLanes);

	return useMemo(() => {
		if (!conversationId) return [];
		const result: StreamingLane[] = [];
		for (const [key, lane] of streamingLanes) {
			if (key.startsWith(`${conversationId}:`)) {
				result.push(lane);
			}
		}
		return result;
	}, [conversationId, streamingLanes]);
}

/**
 * Returns the draft text for a specific conversation.
 */
export function useDraft(conversationId: string | undefined): string {
	const drafts = useChatStore((s) => s.drafts);
	if (!conversationId) return "";
	return drafts.get(conversationId) ?? "";
}

/**
 * Returns the conversation list sorted by: pinned first, then by
 * lastActivity descending (most recent first).
 */
export function useConversationList(): Conversation[] {
	const conversations = useChatStore((s) => s.conversations);

	return useMemo(() => {
		const list = Array.from(conversations.values());
		return list.sort((a, b) => {
			// Pinned conversations come first
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			// Then sort by lastActivity descending
			return b.lastActivity.getTime() - a.lastActivity.getTime();
		});
	}, [conversations]);
}
