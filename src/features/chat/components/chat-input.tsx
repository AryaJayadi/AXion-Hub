"use client";

/**
 * Chat input component with auto-resize textarea, send button,
 * and media attachment support (drag-and-drop, paste, file picker).
 *
 * Uses a native <textarea> (NOT contentEditable) per research
 * anti-pattern guidance. Supports:
 * - Enter to send, Shift+Enter for newline
 * - Auto-resize up to 200px
 * - Draft preservation across conversation switches
 * - Media attachments via drag-and-drop, paste, or file picker
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { Send, XCircle, FileText, Headphones } from "lucide-react";
import type { Attachment } from "@/entities/chat-message";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { useGateway } from "@/app/providers/gateway-provider";
import { useChatStore } from "../model/chat-store";
import {
	createAttachmentFromFile,
	revokeAttachmentUrl,
} from "../lib/media-upload";
import { MediaUploadZone, FileInputTrigger } from "./media-upload-zone";
import { SlashCommandPopover } from "./slash-command-popover";
import type { QuickCommand, CommandContext } from "../lib/commands";

interface ChatInputProps {
	conversationId: string;
	onSend: (text: string, attachments: Attachment[]) => void;
	disabled?: boolean | undefined;
}

/**
 * Chat message textarea with send, attachment buttons, and media upload zone.
 *
 * Features:
 * - Auto-resize textarea on content change (max 200px)
 * - Submit on Enter (without Shift), Shift+Enter for newline
 * - Draft preservation per conversation
 * - Drag-and-drop, paste-to-upload, and file picker for media attachments
 * - Pending attachment preview chips with remove button
 */
export function ChatInput({ conversationId, onSend, disabled }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { gatewayClient } = useGateway();

	// Load draft on mount / conversation switch
	const savedDraft = useChatStore.getState().getDraft(conversationId);
	const [text, setText] = useState(savedDraft);
	const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

	// Slash command popover state
	const [slashOpen, setSlashOpen] = useState(false);
	const [slashFilter, setSlashFilter] = useState("");

	// Sync draft when conversation changes
	useEffect(() => {
		const draft = useChatStore.getState().getDraft(conversationId);
		setText(draft);

		// Clear pending attachments when switching conversations
		setPendingAttachments((prev) => {
			for (const a of prev) {
				revokeAttachmentUrl(a.url);
			}
			return [];
		});

		// Reset textarea height when switching conversations
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [conversationId]);

	// Cleanup: revoke all pending attachment object URLs on unmount
	useEffect(() => {
		return () => {
			const current = pendingAttachments;
			for (const a of current) {
				revokeAttachmentUrl(a.url);
			}
		};
		// Only on unmount
		// biome-ignore lint/correctness/useExhaustiveDependencies: cleanup only on unmount
	}, []);

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

			// Detect slash command: '/' at start of input
			if (value.startsWith("/")) {
				setSlashOpen(true);
				setSlashFilter(value.slice(1));
			} else {
				setSlashOpen(false);
				setSlashFilter("");
			}
		},
		[conversationId, handleInput],
	);

	const handleSlashSelect = useCallback(
		(command: QuickCommand) => {
			// Clear the '/' text from input
			setText("");
			useChatStore.getState().saveDraft(conversationId, "");
			setSlashOpen(false);
			setSlashFilter("");

			// Reset textarea height
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}

			// Build context and execute command
			const store = useChatStore.getState();
			const activeConvo = store.conversations.get(conversationId);
			const agentId = activeConvo?.agentIds[0] ?? null;

			const context: CommandContext = {
				conversationId,
				agentId,
				gatewayClient,
				insertSystemMessage: (msgText: string) => {
					store.addMessage(conversationId, {
						id: crypto.randomUUID(),
						conversationId,
						role: "system",
						agentId: undefined,
						content: msgText,
						timestamp: new Date(),
						toolCalls: [],
						attachments: [],
					});
				},
			};

			command.action(context);
		},
		[conversationId, gatewayClient],
	);

	const handleSlashClose = useCallback(() => {
		setSlashOpen(false);
		setSlashFilter("");
	}, []);

	const handleFilesAdded = useCallback((files: File[]) => {
		const newAttachments = files.map(createAttachmentFromFile);
		setPendingAttachments((prev) => [...prev, ...newAttachments]);
	}, []);

	const handleRemoveAttachment = useCallback((id: string) => {
		setPendingAttachments((prev) => {
			const toRemove = prev.find((a) => a.id === id);
			if (toRemove) {
				revokeAttachmentUrl(toRemove.url);
			}
			return prev.filter((a) => a.id !== id);
		});
	}, []);

	const handleSend = useCallback(() => {
		const trimmed = text.trim();
		if ((!trimmed && pendingAttachments.length === 0) || disabled) return;

		onSend(trimmed, pendingAttachments);
		setText("");
		useChatStore.getState().saveDraft(conversationId, "");

		// Clear attachments (don't revoke URLs -- they're now part of the sent message)
		setPendingAttachments([]);

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [text, pendingAttachments, disabled, onSend, conversationId]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Don't send when slash command popover is open (it handles
			// Enter/Escape/ArrowUp/ArrowDown via its own keyboard listener)
			if (slashOpen) return;

			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend, slashOpen],
	);

	const canSend =
		(text.trim().length > 0 || pendingAttachments.length > 0) && !disabled;

	return (
		<div className="border-t border-border bg-background p-3">
			<MediaUploadZone onFilesAdded={handleFilesAdded} disabled={disabled}>
				<div
					className={cn(
						"relative rounded-lg border border-input bg-background",
						"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
					)}
				>
					{/* Slash command popover */}
					<SlashCommandPopover
						isOpen={slashOpen}
						filter={slashFilter}
						onSelect={handleSlashSelect}
						onClose={handleSlashClose}
					/>
					{/* Pending attachment chips */}
					{pendingAttachments.length > 0 && (
						<div className="flex flex-wrap gap-1.5 px-3 pt-2">
							{pendingAttachments.map((attachment) => (
								<AttachmentChip
									key={attachment.id}
									attachment={attachment}
									onRemove={handleRemoveAttachment}
								/>
							))}
						</div>
					)}

					{/* Input row: attachment button + textarea + send */}
					<div className="flex items-end gap-2 px-3 py-2">
						<FileInputTrigger
							onFilesAdded={handleFilesAdded}
							disabled={disabled}
						/>

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
			</MediaUploadZone>
		</div>
	);
}

/** Compact chip showing a pending attachment with remove button */
function AttachmentChip({
	attachment,
	onRemove,
}: {
	attachment: Attachment;
	onRemove: (id: string) => void;
}) {
	return (
		<div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1">
			{attachment.type === "image" ? (
				<img
					src={attachment.url}
					alt={attachment.name}
					className="size-8 rounded object-cover"
				/>
			) : attachment.type === "audio" ? (
				<Headphones className="size-4 shrink-0 text-muted-foreground" />
			) : (
				<FileText className="size-4 shrink-0 text-muted-foreground" />
			)}
			<span className="max-w-[120px] truncate text-xs text-foreground">
				{attachment.name}
			</span>
			<button
				type="button"
				onClick={() => onRemove(attachment.id)}
				className="ml-0.5 text-muted-foreground hover:text-foreground"
				aria-label={`Remove ${attachment.name}`}
			>
				<XCircle className="size-3.5" />
			</button>
		</div>
	);
}
