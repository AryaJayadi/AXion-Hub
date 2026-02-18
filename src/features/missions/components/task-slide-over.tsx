"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Expand, Pencil, Trash2 } from "lucide-react";

import { PRIORITY_BADGE } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";

import { useTask } from "../model/hooks";
import { useDeleteTask } from "../api/use-task-mutations";
import { TaskDetailContent } from "./task-detail-content";

interface TaskSlideOverProps {
	taskId: string | null;
	open: boolean;
	onClose: () => void;
}

export function TaskSlideOver({ taskId, open, onClose }: TaskSlideOverProps) {
	const task = useTask(taskId ?? "");
	const deleteTask = useDeleteTask();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDelete = useCallback(async () => {
		if (!taskId) return;
		await deleteTask.mutateAsync(taskId);
		setDeleteDialogOpen(false);
		onClose();
	}, [taskId, deleteTask, onClose]);

	const priorityBadge = task ? PRIORITY_BADGE[task.priority] : null;

	return (
		<>
			<Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-xl overflow-y-auto"
				>
					<SheetHeader>
						<div className="flex items-center gap-2">
							<SheetTitle className="flex-1 truncate">
								{task?.title ?? "Task Detail"}
							</SheetTitle>
							{priorityBadge && (
								<Badge
									variant="outline"
									className={cn(
										"text-[10px] shrink-0",
										priorityBadge.className,
									)}
								>
									{priorityBadge.label}
								</Badge>
							)}
						</div>
						<SheetDescription>
							Quick view of task details
						</SheetDescription>
					</SheetHeader>

					{/* Task detail content - compact mode */}
					<div className="flex-1 overflow-y-auto px-4 py-2">
						{taskId ? (
							<TaskDetailContent
								taskId={taskId}
								isCompact={true}
							/>
						) : (
							<div className="flex items-center justify-center py-12 text-muted-foreground">
								No task selected
							</div>
						)}
					</div>

					<SheetFooter>
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-2">
								{taskId && (
									<Button
										variant="outline"
										size="sm"
										asChild
									>
										<Link href={`/missions/${taskId}`}>
											<Expand className="mr-1.5 size-4" />
											Open full page
										</Link>
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									disabled
								>
									<Pencil className="mr-1.5 size-4" />
									Edit
								</Button>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => setDeleteDialogOpen(true)}
							>
								<Trash2 className="mr-1.5 size-4" />
								Delete
							</Button>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Task</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{task?.title}
							&quot;? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleDelete}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
