"use client";

/**
 * Mention autocomplete popover for @agent and @human in task comments.
 *
 * Reuses the cmdk Command component for searchable list with keyboard
 * navigation. Appears above the cursor position in the textarea.
 */

import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";

import type { Mention } from "@/entities/mission";
import { useAgentStore } from "@/features/agents/model/agent-store";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/ui/command";

/** Mock team members until real user directory is wired */
const MOCK_TEAM_MEMBERS: Mention[] = [
	{ type: "human", id: "user-arya", name: "Arya" },
	{ type: "human", id: "user-admin", name: "Admin" },
	{ type: "human", id: "user-reviewer", name: "Reviewer" },
];

interface MentionPopoverProps {
	open: boolean;
	onSelect: (mention: Mention) => void;
	onClose: () => void;
	position: { top: number; left: number };
	searchQuery: string;
}

export function MentionPopover({
	open,
	onSelect,
	onClose,
	position,
	searchQuery,
}: MentionPopoverProps) {
	const agents = useAgentStore((s) => s.agents);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on Escape key (document-level to catch even when focus is elsewhere)
	useEffect(() => {
		if (!open) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			ref={containerRef}
			className="absolute z-50 w-64 rounded-md border bg-popover shadow-md"
			style={{
				bottom: `calc(100% - ${position.top}px + 4px)`,
				left: `${position.left}px`,
			}}
		>
			<Command className="rounded-md" shouldFilter>
				<CommandInput
					placeholder="Search people..."
					value={searchQuery}
					className="h-8 text-xs"
					autoFocus
				/>
				<CommandList className="max-h-48">
					<CommandEmpty className="py-3 text-xs">
						No results found.
					</CommandEmpty>

					{/* Agents group */}
					<CommandGroup heading="Agents">
						{agents.map((agent) => (
							<CommandItem
								key={agent.id}
								value={agent.name}
								onSelect={() =>
									onSelect({
										type: "agent",
										id: agent.id,
										name: agent.name,
									})
								}
								className="gap-2 text-xs"
							>
								<Bot className="size-3.5 text-blue-500" />
								<span>{agent.name}</span>
							</CommandItem>
						))}
					</CommandGroup>

					{/* Team Members group */}
					<CommandGroup heading="Team Members">
						{MOCK_TEAM_MEMBERS.map((member) => (
							<CommandItem
								key={member.id}
								value={member.name}
								onSelect={() => onSelect(member)}
								className="gap-2 text-xs"
							>
								<User className="size-3.5 text-purple-500" />
								<span>{member.name}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	);
}
