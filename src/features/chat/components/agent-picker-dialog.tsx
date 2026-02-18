"use client";

/**
 * Agent picker dialog for creating new conversations.
 *
 * Lets the user search and select one or more agents, then create a
 * conversation. Single agent selection creates a 'direct' conversation;
 * multiple agents create a 'room' conversation.
 *
 * Agent list is fetched via the gateway client wrapped in a TanStack Query
 * hook, with fallback to empty array.
 */

import { useState, useMemo, useCallback } from "react";
import { Search, Users, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useGateway } from "@/app/providers/gateway-provider";
import { queryKeys } from "@/shared/lib/query-keys";

interface AgentPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateConversation: (agentIds: string[], title?: string) => void;
}

export function AgentPickerDialog({
	open,
	onOpenChange,
	onCreateConversation,
}: AgentPickerDialogProps) {
	const { gatewayClient } = useGateway();
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [title, setTitle] = useState("");

	// Fetch agents from gateway
	const { data: agents = [] } = useQuery({
		queryKey: queryKeys.agents.lists(),
		queryFn: async () => {
			try {
				return await gatewayClient.getAgents();
			} catch {
				return [];
			}
		},
		staleTime: 30_000,
		enabled: open,
	});

	// Filter agents by search
	const filtered = useMemo(() => {
		if (!search.trim()) return agents;
		const q = search.toLowerCase();
		return agents.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				a.id.toLowerCase().includes(q),
		);
	}, [agents, search]);

	// Auto-generate title from selected agent names
	const autoTitle = useMemo(() => {
		if (selectedIds.size === 0) return "";
		const names = agents
			.filter((a) => selectedIds.has(a.id))
			.map((a) => a.name);
		return `Chat with ${names.join(", ")}`;
	}, [selectedIds, agents]);

	const displayTitle = title || autoTitle;

	const toggleAgent = useCallback((agentId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(agentId)) {
				next.delete(agentId);
			} else {
				next.add(agentId);
			}
			return next;
		});
	}, []);

	const handleCreate = useCallback(() => {
		if (selectedIds.size === 0) return;
		onCreateConversation(
			Array.from(selectedIds),
			displayTitle || undefined,
		);
		// Reset state
		setSelectedIds(new Set());
		setTitle("");
		setSearch("");
		onOpenChange(false);
	}, [selectedIds, displayTitle, onCreateConversation, onOpenChange]);

	const conversationType = selectedIds.size > 1 ? "room" : "direct";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{conversationType === "room" ? (
							<Users className="size-5" />
						) : (
							<MessageSquare className="size-5" />
						)}
						New Conversation
					</DialogTitle>
					<DialogDescription>
						Select one or more agents to start a conversation.
						{selectedIds.size > 1 &&
							" Multiple agents will create a room."}
					</DialogDescription>
				</DialogHeader>

				{/* Search input */}
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search agents..."
						className="pl-8"
					/>
				</div>

				{/* Agent list */}
				<ScrollArea className="max-h-[240px]">
					<div className="space-y-1">
						{filtered.length === 0 && (
							<div className="px-2 py-6 text-center text-sm text-muted-foreground">
								{agents.length === 0
									? "No agents available. Connect to a gateway to see agents."
									: "No agents match your search."}
							</div>
						)}
						{filtered.map((agent) => {
							const isSelected = selectedIds.has(agent.id);
							const initials = agent.name
								.split(" ")
								.map((w) => w[0])
								.join("")
								.slice(0, 2)
								.toUpperCase();

							return (
								<button
									key={agent.id}
									type="button"
									onClick={() => toggleAgent(agent.id)}
									className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/50"
								>
									<Checkbox
										checked={isSelected}
										tabIndex={-1}
										aria-hidden
									/>
									<Avatar size="sm">
										<AvatarFallback>
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="truncate text-sm font-medium">
											{agent.name}
										</div>
										<div className="truncate text-xs text-muted-foreground">
											{agent.model}
										</div>
									</div>
									<Badge
										variant={
											agent.status === "online" ||
											agent.status === "idle"
												? "default"
												: "secondary"
										}
										className="shrink-0 text-[10px]"
									>
										{agent.status}
									</Badge>
								</button>
							);
						})}
					</div>
				</ScrollArea>

				{/* Title field */}
				{selectedIds.size > 0 && (
					<div className="space-y-1.5">
						<label
							htmlFor="conversation-title"
							className="text-sm font-medium"
						>
							Title
						</label>
						<Input
							id="conversation-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={autoTitle}
						/>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={selectedIds.size === 0}
					>
						{selectedIds.size > 1
							? `Create Room (${selectedIds.size} agents)`
							: "Start Chat"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
