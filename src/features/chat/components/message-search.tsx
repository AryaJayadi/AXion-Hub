"use client";

/**
 * Message search component with current/global scope toggle.
 *
 * Provides a debounced search input with scope toggle (current chat vs all
 * chats). Results appear in a dropdown panel below the search input with
 * message preview, sender info, and click-to-navigate.
 *
 * Rendered in the conversation sidebar's top section.
 */

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { useChatStore } from "../model/chat-store";
import { useMessageSearch } from "../api/use-message-search";

interface MessageSearchProps {
	conversationId?: string | undefined;
}

export function MessageSearch({ conversationId }: MessageSearchProps) {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [scope, setScope] = useState<"current" | "global">(
		conversationId ? "current" : "global",
	);
	const [isExpanded, setIsExpanded] = useState(false);

	const debouncedSetQuery = useDebouncedCallback((value: string) => {
		setDebouncedQuery(value);
	}, 300);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setInputValue(value);
			debouncedSetQuery(value);
			if (value.length > 0) {
				setIsExpanded(true);
			}
		},
		[debouncedSetQuery],
	);

	const handleClear = useCallback(() => {
		setInputValue("");
		setDebouncedQuery("");
		setIsExpanded(false);
	}, []);

	const { data: results = [], isLoading } = useMessageSearch(
		debouncedQuery,
		scope,
		conversationId,
	);

	const handleResultClick = useCallback(
		(resultConversationId: string) => {
			useChatStore.getState().setActiveConversation(resultConversationId);

			// Navigate to the conversation
			const conversation = useChatStore
				.getState()
				.conversations.get(resultConversationId);
			if (conversation?.type === "direct") {
				const agentId =
					conversation.agentIds[0] ?? resultConversationId;
				router.push(`/chat/${agentId}`);
			} else {
				router.push(`/chat/team/${resultConversationId}`);
			}

			handleClear();
		},
		[router, handleClear],
	);

	const showResults = isExpanded && debouncedQuery.length >= 2;

	return (
		<div className="relative">
			{/* Search input */}
			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
				<Input
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() => {
						if (inputValue.length >= 2) setIsExpanded(true);
					}}
					placeholder="Search messages..."
					className="pl-8 pr-8"
				/>
				{inputValue && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
						aria-label="Clear search"
					>
						<X className="size-4" />
					</button>
				)}
			</div>

			{/* Scope toggle */}
			{showResults && (
				<div className="mt-1 flex gap-1">
					<Button
						size="sm"
						variant={scope === "current" ? "default" : "ghost"}
						className="h-6 px-2 text-xs"
						onClick={() => setScope("current")}
						disabled={!conversationId}
					>
						This Chat
					</Button>
					<Button
						size="sm"
						variant={scope === "global" ? "default" : "ghost"}
						className="h-6 px-2 text-xs"
						onClick={() => setScope("global")}
					>
						All Chats
					</Button>
				</div>
			)}

			{/* Results panel */}
			{showResults && (
				<div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover shadow-md">
					<ScrollArea className="max-h-[300px]">
						{isLoading && (
							<div className="space-y-2 p-2">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						)}

						{!isLoading && results.length === 0 && (
							<div className="px-3 py-6 text-center text-sm text-muted-foreground">
								No messages found
							</div>
						)}

						{!isLoading && results.length > 0 && (
							<div className="py-1">
								{results.map((result) => (
									<button
										key={`${result.conversationId}-${result.message.id}`}
										type="button"
										onClick={() =>
											handleResultClick(
												result.conversationId,
											)
										}
										className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-accent/50"
									>
										{scope === "global" && (
											<span className="text-[10px] font-medium text-muted-foreground">
												{result.conversationTitle}
											</span>
										)}
										<span className="line-clamp-2 text-sm text-foreground">
											{highlightMatch(
												result.message.content,
												debouncedQuery,
											)}
										</span>
										<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
											<span>
												{result.message.role ===
												"user"
													? "You"
													: (result.message
															.agentId ??
														"Agent")}
											</span>
											<span>
												{formatDistanceToNow(
													result.message.timestamp,
													{ addSuffix: true },
												)}
											</span>
										</div>
									</button>
								))}
							</div>
						)}
					</ScrollArea>
				</div>
			)}
		</div>
	);
}

/** Highlight matching text in a message preview (simple, no HTML injection) */
function highlightMatch(text: string, query: string): React.ReactNode {
	if (!query) return text.slice(0, 120);

	const preview = text.slice(0, 200);
	const lowerPreview = preview.toLowerCase();
	const lowerQuery = query.toLowerCase();
	const idx = lowerPreview.indexOf(lowerQuery);

	if (idx === -1) return preview.slice(0, 120);

	const before = preview.slice(0, idx);
	const match = preview.slice(idx, idx + query.length);
	const after = preview.slice(idx + query.length, idx + query.length + 60);

	return (
		<>
			{before.slice(-40)}
			<mark className="bg-yellow-200/50 dark:bg-yellow-500/30">
				{match}
			</mark>
			{after}
		</>
	);
}
