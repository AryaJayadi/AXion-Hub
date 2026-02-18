"use client";

/**
 * Chat input component with auto-resize textarea, send button,
 * and attachment trigger placeholder.
 *
 * Uses a native <textarea> (NOT contentEditable) per research
 * anti-pattern guidance. Supports:
 * - Enter to send, Shift+Enter for newline
 * - Auto-resize up to 200px
 * - Draft preservation across conversation switches
 * - Placeholder hint for future slash commands
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { useChatStore } from "../model/chat-store";

interface ChatInputProps {
	conversationId: string;
	onSend: (text: string) => void;
	disabled?: boolean | undefined;
}

/**
 * Chat message textarea with send and attachment buttons.
 *
 * Features:
 * - Auto-resize textarea on content change (max 200px)
 * - Submit on Enter (without Shift), Shift+Enter for newline
 * - Draft preservation per conversation
 * - Paperclip button placeholder for media attachments (04-03)
 */
export function ChatInput({ conversationId, onSend, disabled }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Load draft on mount / conversation switch
	const savedDraft = useChatStore.getState().getDraft(conversationId);
	const [text, setText] = useState(savedDraft);

	// Sync draft when conversation changes
	useEffect(() => {
		const draft = useChatStore.getState().getDraft(conversationId);
		setText(draft);

		// Reset textarea height when switching conversations
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [conversationId]);

	// Auto-resize textarea
	const handleInput = useCallback(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
		}
	}, []);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value;
			setText(value);
			useChatStore.getState().saveDraft(conversationId, value);
			handleInput();
		},
		[conversationId, handleInput],
	);

	const handleSend = useCallback(() => {
		const trimmed = text.trim();
		if (!trimmed || disabled) return;

		onSend(trimmed);
		setText("");
		useChatStore.getState().saveDraft(conversationId, "");

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [text, disabled, onSend, conversationId]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	const canSend = text.trim().length > 0 && !disabled;

	return (
		<div className="border-t border-border bg-background p-3">
			<div
				className={cn(
					"flex items-end gap-2 rounded-lg border border-input bg-background px-3 py-2",
					"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
				)}
			>
				{/* Attachment trigger (placeholder for 04-03 media support) */}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
					aria-label="Attach file"
					disabled={disabled}
				>
					<Paperclip className="size-4" />
				</Button>

				{/* Textarea */}
				<textarea
					ref={textareaRef}
					value={text}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder="Type a message... (/ for commands)"
					disabled={disabled}
					rows={1}
					className={cn(
						"flex-1 resize-none bg-transparent text-sm text-foreground",
						"placeholder:text-muted-foreground",
						"focus:outline-none",
						"max-h-[200px] overflow-y-auto",
						"py-1",
					)}
				/>

				{/* Send button */}
				<Button
					type="button"
					size="icon"
					className="size-8 shrink-0"
					onClick={handleSend}
					disabled={!canSend}
					aria-label="Send message"
				>
					<Send className="size-4" />
				</Button>
			</div>
		</div>
	);
}
