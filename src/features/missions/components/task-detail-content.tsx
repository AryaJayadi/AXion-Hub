"use client";

import { useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	GitBranch,
	MessageSquare,
	User,
	Users,
} from "lucide-react";

import type { TaskPriority, TaskStatus } from "@/entities/mission";
import { COLUMN_DISPLAY, PRIORITY_BADGE } from "@/entities/mission";
import { useAgentStore } from "@/features/agents/model/agent-store";
import { cn } from "@/shared/lib/cn";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
} from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import { useTask } from "../model/hooks";
import { useUpdateTask } from "../api/use-task-mutations";

interface TaskDetailContentProps {
	taskId: string;
	/** When true, renders compact single-column layout (for slide-over) */
	isCompact: boolean;
}

const MAX_VISIBLE_AVATARS = 5;

/** Map priority to color badge classes */
function getPriorityBadgeVariant(priority: TaskPriority) {
	const config = PRIORITY_BADGE[priority];
	return config;
}

/** Map status to display label */
function getStatusLabel(status: TaskStatus) {
	return COLUMN_DISPLAY[status]?.label ?? status;
}

/** Status badge color mapping */
const STATUS_COLORS: Record<TaskStatus, string> = {
	inbox: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	queued: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	in_progress:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	in_review:
		"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
	done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	archived: "bg-muted text-muted-foreground",
};

export function TaskDetailContent({
	taskId,
	isCompact,
}: TaskDetailContentProps) {
	const task = useTask(taskId);
	const agents = useAgentStore((s) => s.agents);
	const updateTask = useUpdateTask();

	const handleSubtaskToggle = useCallback(
		(subtaskId: string, completed: boolean) => {
			if (!task) return;
			const updatedSubtasks = task.subtasks.map((s) =>
				s.id === subtaskId ? { ...s, completed } : s,
			);
			updateTask.mutate({
				taskId: task.id,
				updates: { subtasks: updatedSubtasks },
			});
		},
		[task, updateTask],
	);

	const handleSignOffToggle = useCallback(
		(checked: boolean) => {
			if (!task) return;
			updateTask.mutate({
				taskId: task.id,
				updates: { signOffRequired: checked },
			});
		},
		[task, updateTask],
	);

	if (!task) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground">
				Task not found
			</div>
		);
	}

	const priorityBadge = getPriorityBadgeVariant(task.priority);
	const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
	const totalSubtasks = task.subtasks.length;

	// Metadata sidebar content
	const metadataContent = (
		<div className="space-y-6">
			{/* Status */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Status
				</p>
				<Badge
					variant="outline"
					className={cn(
						"text-xs",
						STATUS_COLORS[task.status],
					)}
				>
					{getStatusLabel(task.status)}
				</Badge>
			</div>

			{/* Priority */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Priority
				</p>
				<Badge
					variant="outline"
					className={cn("text-xs", priorityBadge.className)}
				>
					{priorityBadge.label}
				</Badge>
			</div>

			{/* Assigned Agents */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					<Users className="inline size-3 mr-1" />
					Assigned Agents
				</p>
				{task.assignedAgentIds.length > 0 ? (
					<div className="space-y-1">
						<AvatarGroup>
							{task.assignedAgentIds
								.slice(0, MAX_VISIBLE_AVATARS)
								.map((agentId) => {
									const agent = agents.find(
										(a) => a.id === agentId,
									);
									return (
										<Avatar key={agentId} size="sm">
											<AvatarFallback>
												{agent?.name?.[0]?.toUpperCase() ??
													"A"}
											</AvatarFallback>
										</Avatar>
									);
								})}
							{task.assignedAgentIds.length >
								MAX_VISIBLE_AVATARS && (
								<AvatarGroupCount>
									+
									{task.assignedAgentIds.length -
										MAX_VISIBLE_AVATARS}
								</AvatarGroupCount>
							)}
						</AvatarGroup>
						<div className="text-xs text-muted-foreground">
							{task.assignedAgentIds
								.map((id) => {
									const agent = agents.find(
										(a) => a.id === id,
									);
									return agent?.name ?? id;
								})
								.join(", ")}
						</div>
					</div>
				) : (
					<p className="text-xs text-muted-foreground">Unassigned</p>
				)}
			</div>

			{/* Reviewer */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					<User className="inline size-3 mr-1" />
					Reviewer
				</p>
				{task.reviewerId ? (
					<div className="flex items-center gap-2">
						<Avatar size="sm">
							<AvatarFallback>
								{task.reviewerId[0]?.toUpperCase() ?? "R"}
							</AvatarFallback>
						</Avatar>
						<span className="text-sm">{task.reviewerId}</span>
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						No reviewer assigned
					</p>
				)}
			</div>

			{/* Due Date */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					<Calendar className="inline size-3 mr-1" />
					Due Date
				</p>
				{task.dueDate ? (
					<div className="space-y-0.5">
						<p className="text-sm">
							{format(task.dueDate, "PPP")}
						</p>
						<p className="text-xs text-muted-foreground">
							{formatDistanceToNow(task.dueDate, {
								addSuffix: true,
							})}
						</p>
					</div>
				) : (
					<p className="text-xs text-muted-foreground">No due date</p>
				)}
			</div>

			{/* Created */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					<Clock className="inline size-3 mr-1" />
					Created
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDistanceToNow(task.createdAt, { addSuffix: true })}
				</p>
			</div>

			{/* Sign-off gate toggle */}
			<div className="space-y-1.5">
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					<CheckCircle className="inline size-3 mr-1" />
					Sign-off Gate
				</p>
				<div className="flex items-center gap-2">
					<Switch
						id="detail-signoff"
						checked={task.signOffRequired}
						onCheckedChange={handleSignOffToggle}
					/>
					<Label
						htmlFor="detail-signoff"
						className="text-xs cursor-pointer"
					>
						Require sign-off
					</Label>
				</div>
				<p className="text-[10px] text-muted-foreground">
					When enabled, task requires human approval before moving to
					DONE.
				</p>
				{task.signOffRequired && task.signOffStatus && (
					<Badge variant="outline" className="text-[10px]">
						{task.signOffStatus.replace("_", " ")}
					</Badge>
				)}
			</div>
		</div>
	);

	// Main content
	const mainContent = (
		<div className="space-y-6">
			{/* Title */}
			<h2
				className={cn(
					"font-semibold tracking-tight",
					isCompact ? "text-lg" : "text-2xl",
				)}
			>
				{task.title}
			</h2>

			{/* Description */}
			{task.description && (
				<div className="space-y-1.5">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Description
					</p>
					<div className="rounded-md border bg-muted/30 p-3">
						<p className="text-sm whitespace-pre-wrap">
							{task.description}
						</p>
					</div>
				</div>
			)}

			{/* Tags */}
			{task.tags.length > 0 && (
				<div className="space-y-1.5">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Tags
					</p>
					<div className="flex flex-wrap gap-1.5">
						{task.tags.map((tag) => (
							<Badge key={tag} variant="secondary">
								{tag}
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Subtasks */}
			{totalSubtasks > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Subtasks
						</p>
						<span className="text-xs text-muted-foreground">
							{completedSubtasks}/{totalSubtasks}
						</span>
					</div>
					{/* Progress bar */}
					<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
						<div
							className="h-full rounded-full bg-primary transition-all"
							style={{
								width: `${(completedSubtasks / totalSubtasks) * 100}%`,
							}}
						/>
					</div>
					{/* Checklist */}
					<div className="space-y-1">
						{task.subtasks.map((subtask) => (
							<div
								key={subtask.id}
								className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
							>
								<Checkbox
									checked={subtask.completed}
									onCheckedChange={(checked) =>
										handleSubtaskToggle(
											subtask.id,
											!!checked,
										)
									}
								/>
								<span
									className={cn(
										"text-sm",
										subtask.completed &&
											"line-through text-muted-foreground",
									)}
								>
									{subtask.title}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Placeholder sections for upcoming plans */}
			<div className="space-y-4 pt-4 border-t">
				{/* Activity Timeline placeholder (06-03) */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<GitBranch className="size-4 text-muted-foreground" />
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Activity Timeline
						</p>
					</div>
					<div className="flex items-center justify-center rounded-md border border-dashed p-6">
						<p className="text-xs text-muted-foreground">
							Coming soon
						</p>
					</div>
				</div>

				{/* Deliverables placeholder (06-03) */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<FileText className="size-4 text-muted-foreground" />
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Deliverables
						</p>
					</div>
					<div className="flex items-center justify-center rounded-md border border-dashed p-6">
						<p className="text-xs text-muted-foreground">
							Coming soon
						</p>
					</div>
				</div>

				{/* Comments placeholder (06-04) */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<MessageSquare className="size-4 text-muted-foreground" />
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Comments
						</p>
					</div>
					<div className="flex items-center justify-center rounded-md border border-dashed p-6">
						<p className="text-xs text-muted-foreground">
							Coming soon
						</p>
					</div>
				</div>
			</div>
		</div>
	);

	if (isCompact) {
		// Single-column compact layout for slide-over
		return (
			<div className="space-y-6 px-1">
				{mainContent}
				<div className="border-t pt-4">{metadataContent}</div>
			</div>
		);
	}

	// Two-column layout for full page
	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
			<div>{mainContent}</div>
			<div className="space-y-6 border-l pl-6">{metadataContent}</div>
		</div>
	);
}
