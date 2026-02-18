"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

import { COLUMN_DISPLAY } from "@/entities/mission";
import type { TaskStatus } from "@/entities/mission";
import {
	useDeleteTask,
	useUpdateTask,
} from "@/features/missions/api/use-task-mutations";
import { useTask } from "@/features/missions/model/hooks";
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
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

import { TaskDetailContent } from "@/features/missions/components/task-detail-content";

interface MissionDetailViewProps {
	taskId: string;
}

const STATUS_OPTIONS: TaskStatus[] = [
	"inbox",
	"queued",
	"in_progress",
	"in_review",
	"done",
	"archived",
];

export function MissionDetailView({ taskId }: MissionDetailViewProps) {
	const router = useRouter();
	const task = useTask(taskId);
	const deleteTask = useDeleteTask();
	const updateTask = useUpdateTask();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDelete = useCallback(async () => {
		await deleteTask.mutateAsync(taskId);
		setDeleteDialogOpen(false);
		router.push("/missions");
	}, [taskId, deleteTask, router]);

	const handleStatusChange = useCallback(
		(newStatus: string) => {
			updateTask.mutate({
				taskId,
				updates: { status: newStatus as TaskStatus },
			});
		},
		[taskId, updateTask],
	);

	if (!task) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<PageHeader
				title={task.title}
				breadcrumbs={[
					{ label: "Missions", href: "/missions" },
					{ label: task.title },
				]}
				actions={
					<div className="flex items-center gap-2">
						{/* Change Status dropdown */}
						<Select
							value={task.status}
							onValueChange={handleStatusChange}
						>
							<SelectTrigger className="w-36" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((status) => (
									<SelectItem key={status} value={status}>
										{COLUMN_DISPLAY[status].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Delete button */}
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setDeleteDialogOpen(true)}
						>
							<Trash2 className="mr-1.5 size-4" />
							Delete
						</Button>

						{/* Back link */}
						<Button variant="outline" size="sm" asChild>
							<Link href="/missions">
								<ArrowLeft className="mr-1.5 size-4" />
								Back
							</Link>
						</Button>
					</div>
				}
			/>

			{/* Full page task detail content - two-column layout */}
			<div className="px-1">
				<TaskDetailContent taskId={taskId} isCompact={false} />
			</div>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Task</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{task.title}
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
		</div>
	);
}
