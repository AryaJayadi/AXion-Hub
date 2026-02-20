"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import type { Conversation } from "@/entities/chat-message";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { SearchInput } from "@/shared/ui/search-input";
import { Separator } from "@/shared/ui/separator";
import { useChatStore } from "../model/chat-store";
import { useConversationList } from "../model/hooks";
import { MessageSearch } from "./message-search";

/**
 * Conversation sidebar with hybrid organization.
 *
 * Organizes conversations into three sections:
 *   1. Pinned -- conversations marked as pinned, any type
 *   2. Rooms  -- multi-agent rooms and team conversations
 *   3. Direct -- 1:1 agent conversations
 *
 * Each section is sorted by lastActivity descending.
 */
export function ConversationSidebar({
	onNewChat,
}: { onNewChat?: (() => void) | undefined } = {}) {
	const router = useRouter();
	const conversations = useConversationList();
	const activeConversationId = useChatStore((s) => s.activeConversationId);
	const setActiveConversation = useChatStore((s) => s.setActiveConversation);
	const [search, setSearch] = useState("");

	// Filter conversations by search query
	const filtered = useMemo(() => {
		if (!search.trim()) return conversations;
		const q = search.toLowerCase();
		return conversations.filter(
			(c) =>
				c.title.toLowerCase().includes(q) ||
				(c.lastMessage && c.lastMessage.toLowerCase().includes(q)),
		);
	}, [conversations, search]);

	// Partition into sections
	const { pinned, rooms, direct } = useMemo(() => {
		const pinnedList: Conversation[] = [];
		const roomList: Conversation[] = [];
		const directList: Conversation[] = [];

		for (const c of filtered) {
			if (c.isPinned) {
				pinnedList.push(c);
			} else if (c.type === "room" || c.type === "team") {
				roomList.push(c);
			} else {
				directList.push(c);
			}
		}

		return { pinned: pinnedList, rooms: roomList, direct: directList };
	}, [filtered]);

	const handleSelect = useCallback(
		(conversation: Conversation) => {
			setActiveConversation(conversation.id);

			// Navigate to appropriate route based on conversation type
			if (conversation.type === "direct") {
				// For direct chats, use the first agent ID
				const agentId = conversation.agentIds[0] ?? conversation.id;
				router.push(`/chat/${agentId}`);
			} else {
				// For rooms and team conversations
				router.push(`/chat/team/${conversation.id}`);
			}
		},
		[setActiveConversation, router],
	);

	const hasConversations = conversations.length > 0;
	const hasResults = filtered.length > 0;

	return (
		<div className="flex h-full flex-col border-r">
			{/* Header with search and new chat button */}
			<div className="flex items-center gap-2 border-b p-3">
				<SearchInput
					value={search}
					onChange={setSearch}
					placeholder="Search conversations..."
					className="flex-1"
				/>
				<Button
					size="icon"
					variant="ghost"
					aria-label="New chat"
					className="shrink-0"
					onClick={onNewChat}
				>
					<MessageSquarePlus className="size-4" />
				</Button>
			</div>

			{/* Message search */}
			<div className="border-b px-3 py-2">
				<MessageSearch conversationId={activeConversationId ?? undefined} />
			</div>

			{/* Conversation list */}
			<ScrollArea className="flex-1">
				{!hasConversations && (
					<EmptyState
						title="No conversations yet"
						description="Start a new chat with an agent to get started."
						action={{
							label: "Start Chat",
							onClick: () => onNewChat?.(),
						}}
					/>
				)}

				{hasConversations && !hasResults && (
					<div className="px-4 py-8 text-center text-sm text-muted-foreground">
						No conversations match your search.
					</div>
				)}

				{hasResults && (
					<div className="py-1">
						{/* Pinned section */}
						{pinned.length > 0 && (
							<ConversationSection
								label="Pinned"
								conversations={pinned}
								activeId={activeConversationId}
								onSelect={handleSelect}
							/>
						)}

						{/* Rooms section */}
						{rooms.length > 0 && (
							<ConversationSection
								label="Rooms"
								conversations={rooms}
								activeId={activeConversationId}
								onSelect={handleSelect}
							/>
						)}

						{/* Direct section */}
						{direct.length > 0 && (
							<ConversationSection
								label="Direct"
								conversations={direct}
								activeId={activeConversationId}
								onSelect={handleSelect}
							/>
						)}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}

// --- Section component ---

function ConversationSection({
	label,
	conversations,
	activeId,
	onSelect,
}: {
	label: string;
	conversations: Conversation[];
	activeId: string | null;
	onSelect: (conversation: Conversation) => void;
}) {
	return (
		<div>
			<div className="flex items-center gap-2 px-4 py-2">
				<Separator className="flex-1" />
				<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					{label}
				</span>
				<Separator className="flex-1" />
			</div>
			{conversations.map((conversation) => (
				<ConversationItem
					key={conversation.id}
					conversation={conversation}
					isActive={conversation.id === activeId}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}

// --- Conversation item component ---

function ConversationItem({
	conversation,
	isActive,
	onSelect,
}: {
	conversation: Conversation;
	isActive: boolean;
	onSelect: (conversation: Conversation) => void;
}) {
	// Generate initials from title
	const initials = conversation.title
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<button
			type="button"
			onClick={() => onSelect(conversation)}
			className={cn(
				"flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
				isActive && "bg-accent",
			)}
		>
			<Avatar size="sm">
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<span className="truncate text-sm font-medium">
						{conversation.title}
					</span>
					<span className="shrink-0 text-[10px] text-muted-foreground">
						{formatDistanceToNow(conversation.lastActivity, {
							addSuffix: false,
						})}
					</span>
				</div>
				{conversation.lastMessage && (
					<p className="truncate text-xs text-muted-foreground">
						{conversation.lastMessage}
					</p>
				)}
			</div>
			{conversation.unreadCount > 0 && (
				<Badge variant="default" className="ml-auto shrink-0 text-[10px]">
					{conversation.unreadCount}
				</Badge>
			)}
		</button>
	);
}
