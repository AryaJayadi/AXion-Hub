"use client";

import { ChevronsUpDown } from "lucide-react";
import type { AgentMemoryGroup as AgentMemoryGroupType, MemoryEntry } from "@/entities/memory";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";

import { MemoryTypeList } from "./memory-type-list";

interface MemoryAgentGroupProps {
	group: AgentMemoryGroupType;
	defaultOpen: boolean;
	selectedMemoryId: string | null;
	onSelectMemory: (entry: MemoryEntry) => void;
}

export function MemoryAgentGroup({
	group,
	defaultOpen,
	selectedMemoryId,
	onSelectMemory,
}: MemoryAgentGroupProps) {
	const initials = group.agentName
		.split(/\s+/)
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	// Group memories by type
	const persistent = group.memories.filter((m) => m.memoryType === "persistent");
	const daily = group.memories.filter((m) => m.memoryType === "daily");
	const conversation = group.memories.filter((m) => m.memoryType === "conversation");

	return (
		<Collapsible defaultOpen={defaultOpen} className="border-b border-border last:border-b-0">
			<CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50">
				<Avatar size="sm">
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<span className="flex-1 text-sm font-medium">{group.agentName}</span>
				<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
					{group.memories.length}
				</Badge>
				<ChevronsUpDown className="size-4 text-muted-foreground" />
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div className="pb-2">
					{persistent.length > 0 && (
						<MemoryTypeList
							label="Persistent Memory"
							entries={persistent}
							selectedMemoryId={selectedMemoryId}
							onSelect={onSelectMemory}
						/>
					)}
					{daily.length > 0 && (
						<MemoryTypeList
							label="Daily Memory"
							entries={daily}
							selectedMemoryId={selectedMemoryId}
							onSelect={onSelectMemory}
						/>
					)}
					{conversation.length > 0 && (
						<MemoryTypeList
							label="Conversation Memory"
							entries={conversation}
							selectedMemoryId={selectedMemoryId}
							onSelect={onSelectMemory}
						/>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
