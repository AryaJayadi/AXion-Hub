"use client";

/**
 * Task comment thread with @mention support.
 *
 * Renders existing comments with highlighted @mentions, and provides a
 * comment input textarea that opens a MentionPopover when typing @.
 * On submit, emits a 'task.comment.added' EventBus event with mentions
 * payload for notification handling.
 */

import {
	useCallback,
	useRef,
	useState,
	type ChangeEvent,
	type KeyboardEvent,
} from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, MessageSquare, Send, User } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { Mention, TaskComment } from "@/entities/mission";
import { useGateway } from "@/app/providers/gateway-provider";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { MentionPopover } from "./mention-popover";

/** Regex to detect @[Name](type:id) mention format in content */
const MENTION_REGEX = /@\[([^\]]+)\]\((agent|human):([^)]+)\)/g;

/** Parse mentions from content string */
function parseMentions(content: string): Mention[] {
	const mentions: Mention[] = [];
	const regex = new RegExp(MENTION_REGEX.source, "g");
	let match = regex.exec(content);
	while (match !== null) {
		const name = match[1];
		const type = match[2] as "agent" | "human";
		const id = match[3];
		if (name && id) {
			mentions.push({ type, id, name });
		}
		match = regex.exec(content);
	}
	return mentions;
}

/** Render content with highlighted mentions as inline badges */
function renderContentWithMentions(content: string) {
	const parts: Array<string | { mention: Mention; key: string }> = [];
	let lastIndex = 0;
	const regex = new RegExp(MENTION_REGEX.source, "g");

	let match = regex.exec(content);
	while (match !== null) {
		// Text before the mention
		if (match.index > lastIndex) {
			parts.push(content.slice(lastIndex, match.index));
		}
		const name = match[1] ?? "";
		const type = match[2] as "agent" | "human";
		const id = match[3] ?? "";
		parts.push({
			mention: { type, id, name },
			key: `${id}-${match.index}`,
		});
		lastIndex = match.index + match[0].length;
		match = regex.exec(content);
	}

	// Remaining text
	if (lastIndex < content.length) {
		parts.push(content.slice(lastIndex));
	}

	return (
		<span>
			{parts.map((part, i) => {
				if (typeof part === "string") {
					return <span key={`text-${i}`}>{part}</span>;
				}
				return (
					<Badge
						key={part.key}
						variant="secondary"
						className={cn(
							"inline-flex items-center gap-0.5 px-1 py-0 text-xs font-normal",
							part.mention.type === "agent"
								? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
								: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
						)}
					>
						{part.mention.type === "agent" ? (
							<Bot className="size-2.5" />
						) : (
							<User className="size-2.5" />
						)}
						{part.mention.name}
					</Badge>
				);
			})}
		</span>
	);
}

/** Mock comments for demonstration */
function getMockComments(taskId: string): TaskComment[] {
	return [
		{
			id: `comment-${taskId}-1`,
			taskId,
			authorId: "user-arya",
			authorType: "user",
			content:
				"@[CodeBot](agent:agent-1) can you start working on the API integration? Let me know if you need anything.",
			mentions: [{ type: "agent", id: "agent-1", name: "CodeBot" }],
			createdAt: new Date(Date.now() - 3600_000 * 2), // 2 hours ago
		},
		{
			id: `comment-${taskId}-2`,
			taskId,
			authorId: "agent-1",
			authorType: "agent",
			content:
				"Sure, I will start on the API integration now. @[Arya](human:user-arya) I might need access to the staging environment credentials.",
			mentions: [{ type: "human", id: "user-arya", name: "Arya" }],
			createdAt: new Date(Date.now() - 3600_000), // 1 hour ago
		},
		{
			id: `comment-${taskId}-3`,
			taskId,
			authorId: "user-arya",
			authorType: "user",
			content:
				"Credentials shared in the vault. Let me know when you have a draft ready for review.",
			mentions: [],
			createdAt: new Date(Date.now() - 1800_000), // 30 min ago
		},
	];
}

interface TaskCommentsProps {
	taskId: string;
	comments?: TaskComment[] | undefined;
}

export function TaskComments({ taskId, comments }: TaskCommentsProps) {
	const [localComments, setLocalComments] = useState<TaskComment[]>(
		() => comments ?? getMockComments(taskId),
	);
	const [inputValue, setInputValue] = useState("");
	const [mentionOpen, setMentionOpen] = useState(false);
	const [mentionQuery, setMentionQuery] = useState("");
	const [mentionPosition, setMentionPosition] = useState({
		top: 0,
		left: 0,
	});
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const mentionStartRef = useRef<number | null>(null);

	let eventBus: ReturnType<typeof useGateway>["eventBus"] | null = null;
	try {
		const gateway = useGateway();
		eventBus = gateway.eventBus;
	} catch {
		// GatewayProvider may not be mounted in all contexts
	}

	/** Detect @ character and manage mention popover state */
	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value;
			const cursorPos = e.target.selectionStart ?? 0;
			setInputValue(value);

			// Check if we just typed @
			const charBefore = value[cursorPos - 1];
			if (charBefore === "@") {
				// Start mention tracking
				mentionStartRef.current = cursorPos;
				setMentionQuery("");
				setMentionOpen(true);

				// Calculate position for popover
				const textarea = textareaRef.current;
				if (textarea) {
					setMentionPosition({
						top: textarea.offsetTop,
						left: Math.min(
							textarea.offsetLeft + cursorPos * 7,
							textarea.offsetWidth - 64,
						),
					});
				}
				return;
			}

			// If mention popover is open, update search query
			if (mentionOpen && mentionStartRef.current !== null) {
				const queryText = value.slice(mentionStartRef.current, cursorPos);
				// Close if user deleted the @ or typed a space
				if (
					cursorPos < mentionStartRef.current ||
					queryText.includes(" ")
				) {
					setMentionOpen(false);
					mentionStartRef.current = null;
				} else {
					setMentionQuery(queryText);
				}
			}
		},
		[mentionOpen],
	);

	/** Insert mention text at cursor position */
	const handleMentionSelect = useCallback(
		(mention: Mention) => {
			if (mentionStartRef.current === null) return;

			const before = inputValue.slice(0, mentionStartRef.current - 1); // before the @
			const after = inputValue.slice(
				textareaRef.current?.selectionStart ?? mentionStartRef.current,
			);
			const mentionText = `@[${mention.name}](${mention.type}:${mention.id})`;
			const newValue = `${before}${mentionText} ${after}`;

			setInputValue(newValue);
			setMentionOpen(false);
			mentionStartRef.current = null;

			// Refocus textarea
			requestAnimationFrame(() => {
				const textarea = textareaRef.current;
				if (textarea) {
					const newCursorPos =
						before.length + mentionText.length + 1;
					textarea.focus();
					textarea.setSelectionRange(newCursorPos, newCursorPos);
				}
			});
		},
		[inputValue],
	);

	/** Submit a new comment */
	const handleSubmit = useCallback(() => {
		const content = inputValue.trim();
		if (!content) return;

		const mentions = parseMentions(content);
		const comment: TaskComment = {
			id: nanoid(),
			taskId,
			authorId: "current-user",
			authorType: "user",
			content,
			mentions,
			createdAt: new Date(),
		};

		setLocalComments((prev) => [...prev, comment]);
		setInputValue("");
		toast.success("Comment added");

		// Emit event for notification handling
		if (eventBus) {
			eventBus.emit("task.comment.added", {
				taskId,
				authorId: "current-user",
				authorType: "user",
				content,
				mentions,
			});
		}
	}, [inputValue, taskId, eventBus]);

	/** Handle Enter to submit (Shift+Enter for newline) */
	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey && !mentionOpen) {
				e.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit, mentionOpen],
	);

	return (
		<div className="space-y-4">
			{/* Comment list */}
			{localComments.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6">
					<MessageSquare className="size-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						No comments yet. Start the conversation.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{localComments.map((comment) => (
						<div
							key={comment.id}
							className="flex gap-3 rounded-md px-1 py-2"
						>
							{/* Avatar */}
							<Avatar size="sm" className="mt-0.5 shrink-0">
								<AvatarFallback
									className={cn(
										comment.authorType === "agent"
											? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
											: "bg-muted",
									)}
								>
									{comment.authorType === "agent" ? (
										<Bot className="size-3" />
									) : (
										comment.authorId[0]?.toUpperCase() ??
										"U"
									)}
								</AvatarFallback>
							</Avatar>

							{/* Content */}
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">
										{comment.authorId}
									</span>
									{comment.authorType === "agent" && (
										<Badge
											variant="secondary"
											className="px-1 py-0 text-[10px]"
										>
											<Bot className="mr-0.5 size-2.5" />
											Agent
										</Badge>
									)}
									<span className="text-xs text-muted-foreground">
										{formatDistanceToNow(
											comment.createdAt,
											{ addSuffix: true },
										)}
									</span>
								</div>
								<p className="text-sm leading-relaxed">
									{renderContentWithMentions(comment.content)}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Comment input */}
			<div className="relative space-y-2 rounded-md border p-2">
				<MentionPopover
					open={mentionOpen}
					onSelect={handleMentionSelect}
					onClose={() => {
						setMentionOpen(false);
						mentionStartRef.current = null;
					}}
					position={mentionPosition}
					searchQuery={mentionQuery}
				/>

				<textarea
					ref={textareaRef}
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder="Add a comment... (type @ to mention)"
					className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
					rows={2}
				/>

				<div className="flex justify-end">
					<Button
						size="sm"
						onClick={handleSubmit}
						disabled={!inputValue.trim()}
						className="h-7 gap-1 text-xs"
					>
						<Send className="size-3" />
						Post
					</Button>
				</div>
			</div>
		</div>
	);
}
