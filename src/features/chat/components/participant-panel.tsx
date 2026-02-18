"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useChatStore } from "../model/chat-store";

interface ParticipantPanelProps {
	conversationId?: string | undefined;
}

/**
 * Collapsible right-side panel showing agents in the current conversation.
 *
 * Displays each agent's avatar, name, status, and model info.
 * Agent details are placeholder for now -- they show the agentId as
 * the name fallback until wired to the agent store.
 */
export function ParticipantPanel({ conversationId }: ParticipantPanelProps) {
	const conversations = useChatStore((s) => s.conversations);

	const agentIds = useMemo(() => {
		if (!conversationId) return [];
		const conversation = conversations.get(conversationId);
		return conversation?.agentIds ?? [];
	}, [conversationId, conversations]);

	if (!conversationId || agentIds.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center border-l px-4 text-center">
				<Users className="mb-2 size-8 text-muted-foreground/40" />
				<p className="text-sm text-muted-foreground">
					No participants
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col border-l">
			{/* Header */}
			<div className="flex items-center gap-2 border-b px-4 py-3">
				<Users className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold">Participants</h3>
				<span className="ml-auto text-xs text-muted-foreground">
					{agentIds.length}
				</span>
			</div>

			{/* Agent list */}
			<ScrollArea className="flex-1">
				<div className="space-y-1 p-2">
					{agentIds.map((agentId) => (
						<AgentParticipant key={agentId} agentId={agentId} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

// --- Individual agent entry ---

function AgentParticipant({ agentId }: { agentId: string }) {
	// Placeholder: show agentId as name until agent store is wired
	const displayName = agentId;
	const initials = agentId.slice(0, 2).toUpperCase();

	return (
		<div className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/50">
			<Avatar size="sm">
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{displayName}</p>
				<p className="text-[11px] text-muted-foreground">
					Agent
				</p>
			</div>
			<StatusBadge status="online" size="sm" />
		</div>
	);
}
