"use client";

/**
 * Scrollable message feed with sticky-bottom auto-scroll.
 *
 * Implements the "sticky bottom" scroll behavior: auto-scrolls to
 * bottom ONLY when the user is already near the bottom (within 50px).
 * Shows a "New messages" button when the user has scrolled up and
 * new content arrives.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { SkeletonList } from "@/shared/ui/loading-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { useConversationMessages, useStreamingLanes } from "../model/hooks";
import { MessageBubble } from "./message-bubble";
import { StreamingLanes } from "./streaming-lanes";

interface MessageListProps {
	conversationId: string;
}

/** Threshold in pixels to consider "near bottom" for auto-scroll */
const SCROLL_THRESHOLD = 50;

/**
 * Message list with auto-scroll and streaming lanes.
 *
 * Features:
 * - Sticky-bottom: auto-scrolls during streaming when at bottom
 * - "New messages" indicator when scrolled up
 * - Empty state for fresh conversations
 * - Streaming lanes rendered below messages
 */
export function MessageList({ conversationId }: MessageListProps) {
	const messages = useConversationMessages(conversationId);
	const lanes = useStreamingLanes(conversationId);
	const scrollRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [showNewMessages, setShowNewMessages] = useState(false);

	// Check if user is near bottom
	const checkScrollPosition = useCallback(() => {
		const container = scrollRef.current;
		if (!container) return;
		const { scrollTop, scrollHeight, clientHeight } = container;
		const atBottom =
			scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
		setIsAtBottom(atBottom);
		if (atBottom) {
			setShowNewMessages(false);
		}
	}, []);

	// Auto-scroll to bottom when new content arrives and user is at bottom
	useEffect(() => {
		if (isAtBottom) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		} else if (messages.length > 0 || lanes.length > 0) {
			setShowNewMessages(true);
		}
	}, [messages.length, lanes, isAtBottom]);

	// Scroll to bottom on conversation switch
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "instant" });
		setIsAtBottom(true);
		setShowNewMessages(false);
	}, [conversationId]);

	const scrollToBottom = useCallback(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		setShowNewMessages(false);
		setIsAtBottom(true);
	}, []);

	// Empty state
	if (messages.length === 0 && lanes.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<EmptyState
					icon={<MessageSquare className="size-10 text-muted-foreground/40" />}
					title="No messages yet"
					description="Start the conversation! Type a message below."
				/>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-hidden">
			<ScrollArea className="h-full">
				<div
					ref={scrollRef}
					className="h-full overflow-y-auto"
					onScroll={checkScrollPosition}
				>
					{/* Messages */}
					<div className="flex flex-col">
						{messages.map((msg) => (
							<MessageBubble
								key={msg.id}
								message={msg}
								isStreaming={false}
							/>
						))}
					</div>

					{/* Active streaming lanes */}
					<StreamingLanes conversationId={conversationId} />

					{/* Scroll anchor */}
					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* "New messages" indicator */}
			{showNewMessages && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
					<Button
						size="sm"
						variant="secondary"
						onClick={scrollToBottom}
						className="shadow-md"
					>
						<ChevronDown className="mr-1 size-3.5" />
						New messages
					</Button>
				</div>
			)}
		</div>
	);
}
