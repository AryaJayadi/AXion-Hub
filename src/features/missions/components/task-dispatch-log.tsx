"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Radio } from "lucide-react";

import type { ActivityEntry } from "@/entities/mission";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";

interface TaskDispatchLogProps {
	taskId: string;
	entries: ActivityEntry[];
}

/** Dispatch-relevant entry types: agent interactions only */
const DISPATCH_TYPES = new Set<ActivityEntry["type"]>([
	"assignment",
	"agent_detail",
]);

function isAgentEntry(entry: ActivityEntry): boolean {
	// Include entries of dispatch types, or status changes made by agents
	if (DISPATCH_TYPES.has(entry.type)) return true;
	if (entry.type === "status_change" && entry.actorType === "agent")
		return true;
	return false;
}

/** Action label for dispatch log */
function getActionLabel(entry: ActivityEntry): string {
	switch (entry.type) {
		case "assignment":
			return "Assigned";
		case "agent_detail":
			return "Agent Activity";
		case "status_change":
			return "Status Changed";
		default:
			return entry.type;
	}
}

export function TaskDispatchLog({ entries }: TaskDispatchLogProps) {
	const dispatchEntries = useMemo(
		() =>
			entries
				.filter(isAgentEntry)
				.sort(
					(a, b) =>
						b.timestamp.getTime() - a.timestamp.getTime(),
				),
		[entries],
	);

	if (dispatchEntries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
				<Radio className="size-8 mb-2 opacity-50" />
				<p className="text-xs">No dispatches yet</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[120px]">Timestamp</TableHead>
					<TableHead className="w-[120px]">Agent</TableHead>
					<TableHead className="w-[120px]">Action</TableHead>
					<TableHead>Details</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{dispatchEntries.map((entry) => (
					<TableRow key={entry.id}>
						<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
							{formatDistanceToNow(entry.timestamp, {
								addSuffix: true,
							})}
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-1.5">
								<Avatar size="sm">
									<AvatarFallback>
										{entry.actorId[0]?.toUpperCase() ??
											"A"}
									</AvatarFallback>
								</Avatar>
								<span className="text-xs truncate max-w-[80px]">
									{entry.actorId}
								</span>
							</div>
						</TableCell>
						<TableCell className="text-xs">
							{getActionLabel(entry)}
						</TableCell>
						<TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
							{entry.summary}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
