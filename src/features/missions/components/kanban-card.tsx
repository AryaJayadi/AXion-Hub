"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { Calendar, CheckSquare } from "lucide-react";

import type { Task } from "@/entities/mission";
import { PRIORITY_BADGE, PRIORITY_BORDER, getTaskGlowClasses } from "@/entities/mission";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";

interface KanbanCardProps {
	task: Task;
	isOverlay?: boolean;
}

const MAX_VISIBLE_AVATARS = 3;
const MAX_VISIBLE_TAGS = 3;

function KanbanCardInner({ task, isOverlay = false }: KanbanCardProps) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id, disabled: isOverlay });

	// Check if any assigned agent is currently "working"
	const agents = useAgentStore((s) => s.agents);
	const isAgentWorking = task.assignedAgentIds.some((agentId) => {
		const agent = agents.find((a) => a.id === agentId);
		return agent?.status === "working";
	});

	const glowClasses = getTaskGlowClasses(isAgentWorking);
	const priorityBorder = PRIORITY_BORDER[task.priority];
	const priorityBadge = PRIORITY_BADGE[task.priority];

	const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
	const totalSubtasks = task.subtasks.length;

	const style = isOverlay
		? undefined
		: {
				transform: CSS.Transform.toString(transform),
				transition: transition ?? undefined,
			};

	return (
		<div
			ref={isOverlay ? undefined : setNodeRef}
			style={style}
			className={cn(
				"bg-card text-card-foreground rounded-lg border shadow-sm p-3 space-y-2",
				priorityBorder,
				glowClasses,
				isOverlay && "rotate-2 scale-105 shadow-lg",
				isDragging && "opacity-50",
				!isOverlay && "cursor-grab active:cursor-grabbing",
			)}
			{...(isOverlay ? {} : attributes)}
			{...(isOverlay ? {} : listeners)}
		>
			{/* Title */}
			<p className="text-sm font-medium leading-snug line-clamp-2">
				{task.title}
			</p>

			{/* Priority badge + due date row */}
			<div className="flex items-center gap-2 flex-wrap">
				<Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityBadge.className)}>
					{priorityBadge.label}
				</Badge>

				{task.dueDate && (
					<span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
						<Calendar className="size-3" />
						{formatDistanceToNow(task.dueDate, { addSuffix: true })}
					</span>
				)}
			</div>

			{/* Tags */}
			{task.tags.length > 0 && (
				<div className="flex items-center gap-1 flex-wrap">
					{task.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
						<Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
							{tag}
						</Badge>
					))}
					{task.tags.length > MAX_VISIBLE_TAGS && (
						<span className="text-[10px] text-muted-foreground">
							+{task.tags.length - MAX_VISIBLE_TAGS}
						</span>
					)}
				</div>
			)}

			{/* Bottom row: agent avatars + subtask progress */}
			<div className="flex items-center justify-between">
				{/* Agent avatars */}
				{task.assignedAgentIds.length > 0 ? (
					<AvatarGroup>
						{task.assignedAgentIds.slice(0, MAX_VISIBLE_AVATARS).map((agentId) => {
							const agent = agents.find((a) => a.id === agentId);
							return (
								<Avatar key={agentId} size="sm">
									<AvatarFallback>
										{agent?.name?.[0]?.toUpperCase() ?? "A"}
									</AvatarFallback>
								</Avatar>
							);
						})}
						{task.assignedAgentIds.length > MAX_VISIBLE_AVATARS && (
							<AvatarGroupCount>
								+{task.assignedAgentIds.length - MAX_VISIBLE_AVATARS}
							</AvatarGroupCount>
						)}
					</AvatarGroup>
				) : (
					<div />
				)}

				{/* Subtask progress */}
				{totalSubtasks > 0 && (
					<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
						<CheckSquare className="size-3" />
						<span>
							{completedSubtasks}/{totalSubtasks}
						</span>
						<div className="h-1 w-10 rounded-full bg-muted overflow-hidden">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{
									width: `${(completedSubtasks / totalSubtasks) * 100}%`,
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export const KanbanCard = memo(KanbanCardInner);
