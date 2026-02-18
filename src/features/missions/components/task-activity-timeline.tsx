"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Bot,
	ChevronDown,
	ChevronRight,
	Clock,
	MessageSquare,
	Paperclip,
	UserPlus,
} from "lucide-react";

import type { ActivityEntry, AgentActivityDetail } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";

interface TaskActivityTimelineProps {
	taskId: string;
	entries: ActivityEntry[];
}

/** Icon mapping by entry type */
const TYPE_ICONS: Record<ActivityEntry["type"], typeof ArrowRight> = {
	status_change: ArrowRight,
	comment: MessageSquare,
	deliverable: Paperclip,
	assignment: UserPlus,
	agent_detail: Bot,
};

/** Color mapping by entry type (dot + icon colors) */
const TYPE_COLORS: Record<ActivityEntry["type"], string> = {
	status_change: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
	comment: "text-gray-500 bg-gray-100 dark:bg-gray-800",
	deliverable: "text-green-500 bg-green-100 dark:bg-green-900/50",
	assignment: "text-purple-500 bg-purple-100 dark:bg-purple-900/50",
	agent_detail: "text-amber-500 bg-amber-100 dark:bg-amber-900/50",
};

/** Dot color for the timeline line */
const DOT_COLORS: Record<ActivityEntry["type"], string> = {
	status_change: "bg-blue-500",
	comment: "bg-gray-400",
	deliverable: "bg-green-500",
	assignment: "bg-purple-500",
	agent_detail: "bg-amber-500",
};

/** Actor type labels */
const ACTOR_TYPE_LABELS: Record<ActivityEntry["actorType"], string> = {
	user: "User",
	agent: "Agent",
	system: "System",
};

function AgentDetailItem({ detail }: { detail: AgentActivityDetail }) {
	if (detail.type === "tool_call") {
		return (
			<div className="space-y-1">
				<p className="text-xs font-medium text-muted-foreground">
					Tool Call
				</p>
				<pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
					{detail.content}
				</pre>
			</div>
		);
	}

	if (detail.type === "reasoning") {
		return (
			<div className="space-y-1">
				<p className="text-xs font-medium text-muted-foreground">
					Reasoning
				</p>
				<p className="text-xs italic text-muted-foreground">
					{detail.content}
				</p>
			</div>
		);
	}

	// output
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground">Output</p>
			<p className="text-xs text-foreground">{detail.content}</p>
		</div>
	);
}

function TimelineEntry({ entry }: { entry: ActivityEntry }) {
	const [expanded, setExpanded] = useState(false);
	const Icon = TYPE_ICONS[entry.type];
	const hasAgentDetails =
		entry.agentDetails != null && entry.agentDetails.length > 0;

	return (
		<div className="relative flex gap-3 pb-6 last:pb-0">
			{/* Timeline line */}
			<div className="flex flex-col items-center">
				<div
					className={cn(
						"size-2.5 rounded-full mt-1.5 shrink-0",
						DOT_COLORS[entry.type],
					)}
				/>
				<div className="w-px flex-1 bg-border" />
			</div>

			{/* Entry content */}
			<div className="flex-1 min-w-0 space-y-1.5">
				{/* Header row: icon, actor, timestamp */}
				<div className="flex items-start gap-2">
					<div
						className={cn(
							"size-6 rounded-md flex items-center justify-center shrink-0",
							TYPE_COLORS[entry.type],
						)}
					>
						<Icon className="size-3.5" />
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<Avatar size="sm">
								<AvatarFallback>
									{entry.actorId[0]?.toUpperCase() ?? "S"}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs font-medium truncate">
								{entry.actorId}
							</span>
							<span className="text-[10px] text-muted-foreground">
								{ACTOR_TYPE_LABELS[entry.actorType]}
							</span>
						</div>
					</div>

					<time className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
						{formatDistanceToNow(entry.timestamp, {
							addSuffix: true,
						})}
					</time>
				</div>

				{/* Summary */}
				<p className="text-sm text-foreground">{entry.summary}</p>

				{/* Expandable agent detail */}
				{hasAgentDetails && (
					<div>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
							onClick={() => setExpanded(!expanded)}
						>
							{expanded ? (
								<ChevronDown className="size-3 mr-1" />
							) : (
								<ChevronRight className="size-3 mr-1" />
							)}
							{expanded
								? "Hide agent detail"
								: "Show agent detail"}
						</Button>

						<AnimatePresence initial={false}>
							{expanded && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="overflow-hidden"
								>
									<div className="mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
										{entry.agentDetails?.map(
											(detail, idx) => (
												<AgentDetailItem
													key={`${entry.id}-detail-${detail.type}-${idx}`}
													detail={detail}
												/>
											),
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
}

export function TaskActivityTimeline({
	entries,
}: TaskActivityTimelineProps) {
	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
				<Clock className="size-8 mb-2 opacity-50" />
				<p className="text-xs">No activity yet</p>
			</div>
		);
	}

	// Sort by timestamp descending (most recent first)
	const sorted = [...entries].sort(
		(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
	);

	return (
		<div className="space-y-0">
			{sorted.map((entry) => (
				<TimelineEntry key={entry.id} entry={entry} />
			))}
		</div>
	);
}
