"use client";

/**
 * Message bubble component for rendering individual chat messages.
 *
 * Uses full-width blocks (not bubbles) per discretion recommendation
 * for consistent alignment in multi-agent rooms. AI messages are
 * rendered with Streamdown for live markdown with code highlighting.
 *
 * Timestamp uses client-only mounting to avoid hydration mismatch
 * (Pitfall 5 from research).
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Bot, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/entities/chat-message";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { ToolCallGroup } from "./tool-call-group";
import { MediaPreview } from "./media-preview";

// Dynamic import Streamdown to avoid SSR issues with shiki
const Streamdown = dynamic(
	() => import("streamdown").then((mod) => mod.Streamdown),
	{ ssr: false },
);

// Dynamic import code plugin
let codePlugin: import("streamdown").PluginConfig["code"] | undefined;
import("@streamdown/code").then((mod) => {
	codePlugin = mod.code;
});

interface MessageBubbleProps {
	message: ChatMessage;
	isStreaming?: boolean | undefined;
}

/**
 * Renders a single chat message as a full-width block.
 *
 * - User messages: subtle background with user avatar
 * - AI messages: default background with agent avatar, Streamdown rendering
 * - System messages: centered, muted text
 */
export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
	// Client-only timestamp to avoid hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (message.role === "system") {
		return (
			<div className="flex justify-center py-2">
				<p className="text-xs text-muted-foreground">{message.content}</p>
			</div>
		);
	}

	const isUser = message.role === "user";
	const initials = isUser ? "U" : message.agentId?.slice(0, 2).toUpperCase() ?? "AI";

	return (
		<div
			className={cn(
				"flex gap-3 px-4 py-3",
				isUser && "bg-muted/50",
			)}
		>
			{/* Avatar */}
			<Avatar size="sm" className="mt-0.5 shrink-0">
				<AvatarFallback
					className={cn(
						isUser
							? "bg-primary/10 text-primary"
							: "bg-secondary/10 text-secondary",
					)}
				>
					{isUser ? (
						<User className="size-3.5" />
					) : (
						<Bot className="size-3.5" />
					)}
				</AvatarFallback>
			</Avatar>

			{/* Content */}
			<div className="min-w-0 flex-1">
				{/* Header: name + timestamp */}
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-foreground">
						{isUser ? "You" : (message.agentId ?? "Agent")}
					</span>
					{!isUser && message.agentId && (
						<span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
							AI
						</span>
					)}
					{mounted && (
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(message.timestamp, {
								addSuffix: true,
							})}
						</span>
					)}
				</div>

				{/* Attachments (rendered above text content) */}
				{message.attachments.length > 0 && (
					<div className="mt-1">
						<MediaPreview attachments={message.attachments} />
					</div>
				)}

				{/* Message content */}
				<div className="mt-1">
					{isUser ? (
						<p className="whitespace-pre-wrap text-sm text-foreground">
							{message.content}
						</p>
					) : (
						<div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
							<Streamdown
								{...(codePlugin ? { plugins: { code: codePlugin } } : {})}
								isAnimating={isStreaming ?? false}
							>
								{message.content}
							</Streamdown>
						</div>
					)}
				</div>

				{/* Tool call visualization (rendered below text content) */}
				{message.toolCalls.length > 0 && (
					<ToolCallGroup
						tools={message.toolCalls}
						isExecuting={message.toolCalls.some(
							(t) => t.status === "running" || t.status === "pending",
						)}
					/>
				)}
			</div>
		</div>
	);
}
