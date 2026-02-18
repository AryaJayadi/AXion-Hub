"use client";

/**
 * Cmd+K global command palette for quick commands.
 *
 * Uses the shadcn Command component (wrapping cmdk) to provide a searchable
 * command palette accessible via Cmd+K (or Ctrl+K on non-Mac). Shows the same
 * quick commands available via the slash autocomplete popover.
 *
 * Rendered once at the ChatLayout level, not per-conversation.
 */

import { useState, useEffect, useCallback } from "react";
import {
	CommandDialog,
	CommandInput,
	CommandList,
	CommandGroup,
	CommandItem,
	CommandEmpty,
	CommandShortcut,
} from "@/shared/ui/command";
import { Badge } from "@/shared/ui/badge";
import { useGateway } from "@/app/providers/gateway-provider";
import { useChatStore } from "../model/chat-store";
import { quickCommands } from "../lib/commands";
import type { CommandContext } from "../lib/commands";

interface CommandPaletteProps {
	onOpenAgentPicker?: (() => void) | undefined;
}

export function CommandPalette({ onOpenAgentPicker }: CommandPaletteProps) {
	const [open, setOpen] = useState(false);
	const { gatewayClient } = useGateway();

	// Register Cmd+K keyboard shortcut
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSelect = useCallback(
		(commandId: string) => {
			const command = quickCommands.find((c) => c.id === commandId);
			if (!command) return;

			// Build context from current state
			const state = useChatStore.getState();
			const activeId = state.activeConversationId;
			const activeConvo = activeId
				? state.conversations.get(activeId)
				: undefined;
			const agentId = activeConvo?.agentIds[0] ?? null;

			const context: CommandContext = {
				conversationId: activeId,
				agentId,
				gatewayClient,
				openAgentPicker: onOpenAgentPicker,
				insertSystemMessage: (text: string) => {
					if (!activeId) return;
					state.addMessage(activeId, {
						id: crypto.randomUUID(),
						conversationId: activeId,
						role: "system",
						agentId: undefined,
						content: text,
						timestamp: new Date(),
						toolCalls: [],
						attachments: [],
					});
				},
			};

			command.action(context);
			setOpen(false);
		},
		[gatewayClient, onOpenAgentPicker],
	);

	return (
		<CommandDialog
			open={open}
			onOpenChange={setOpen}
			title="Command Palette"
			description="Search for a command to run..."
		>
			<CommandInput placeholder="Type a command..." />
			<CommandList>
				<CommandEmpty>No commands found.</CommandEmpty>
				<CommandGroup heading="Quick Commands">
					{quickCommands.map((command) => {
						const Icon = command.icon;
						return (
							<CommandItem
								key={command.id}
								value={[
									command.label,
									...command.keywords,
								].join(" ")}
								onSelect={() => handleSelect(command.id)}
							>
								<Icon className="size-4" />
								<div className="flex flex-1 flex-col">
									<span>{command.label}</span>
									<span className="text-xs text-muted-foreground">
										{command.description}
									</span>
								</div>
								{command.shortcut && (
									<CommandShortcut>
										{command.shortcut}
									</CommandShortcut>
								)}
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
