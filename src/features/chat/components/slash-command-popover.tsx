"use client";

/**
 * Slash command autocomplete popover for the chat input.
 *
 * Appears above the chat input when the user types '/' at the start of
 * their message. Filters the quickCommands list based on the text after
 * the slash character. Supports keyboard navigation (ArrowUp/Down/Enter/Escape).
 *
 * The parent ChatInput is responsible for detecting '/' and managing the
 * open state + filter text.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import type { QuickCommand } from "../lib/commands";
import { quickCommands, filterCommands } from "../lib/commands";

interface SlashCommandPopoverProps {
	isOpen: boolean;
	filter: string;
	onSelect: (command: QuickCommand) => void;
	onClose: () => void;
}

export function SlashCommandPopover({
	isOpen,
	filter,
	onSelect,
	onClose,
}: SlashCommandPopoverProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	const filtered = filterCommands(quickCommands, filter);

	// Reset active index when filter changes
	useEffect(() => {
		setActiveIndex(0);
	}, [filter]);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen || filtered.length === 0) return;

			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					setActiveIndex((prev) =>
						prev < filtered.length - 1 ? prev + 1 : 0,
					);
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					setActiveIndex((prev) =>
						prev > 0 ? prev - 1 : filtered.length - 1,
					);
					break;
				}
				case "Enter": {
					e.preventDefault();
					const selected = filtered[activeIndex];
					if (selected) {
						onSelect(selected);
					}
					break;
				}
				case "Escape": {
					e.preventDefault();
					onClose();
					break;
				}
			}
		},
		[isOpen, filtered, activeIndex, onSelect, onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [isOpen, handleKeyDown]);

	if (!isOpen || filtered.length === 0) return null;

	return (
		<div
			ref={listRef}
			className="absolute bottom-full left-0 z-50 mb-1 w-72 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
			role="listbox"
			aria-label="Slash commands"
		>
			{filtered.map((command, index) => {
				const Icon = command.icon;
				return (
					<button
						key={command.id}
						type="button"
						role="option"
						aria-selected={index === activeIndex}
						onClick={() => onSelect(command)}
						onMouseEnter={() => setActiveIndex(index)}
						className={cn(
							"flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
							index === activeIndex
								? "bg-accent text-accent-foreground"
								: "text-foreground hover:bg-accent/50",
						)}
					>
						<Icon className="size-4 shrink-0 text-muted-foreground" />
						<div className="flex-1 text-left">
							<div className="font-medium">{command.label}</div>
							<div className="text-xs text-muted-foreground">
								{command.description}
							</div>
						</div>
						{command.shortcut && (
							<Badge
								variant="secondary"
								className="ml-auto shrink-0 text-[10px]"
							>
								{command.shortcut}
							</Badge>
						)}
					</button>
				);
			})}
		</div>
	);
}
