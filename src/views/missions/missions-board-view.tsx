"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { useBoards } from "@/features/missions/api/use-boards";
import { useBoardTasks } from "@/features/missions/api/use-board-tasks";
import { KanbanBoard } from "@/features/missions/components/kanban-board";
import { TaskCreateDialog } from "@/features/missions/components/task-create-dialog";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export function MissionsBoardView() {
	const { boards, isLoading: boardsLoading } = useBoards();
	const activeBoardId = boards[0]?.id ?? "";

	const { isLoading: tasksLoading } = useBoardTasks(activeBoardId);

	const isLoading = boardsLoading || tasksLoading;

	// Dialog state for task creation
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="flex flex-col h-full">
			<PageHeader
				title="Missions"
				description="Manage and track agent tasks"
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							asChild
						>
							<Link href="/missions/new">
								<ExternalLink className="mr-1.5 size-4" />
								Full Page
							</Link>
						</Button>
						<Button
							size="sm"
							onClick={() => setDialogOpen(true)}
						>
							<Plus className="mr-1.5 size-4" />
							New Task
						</Button>
					</div>
				}
			/>

			{isLoading ? (
				<div className="flex gap-4 overflow-x-auto p-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={`skeleton-col-${i}`} className="w-72 shrink-0 space-y-3">
							<Skeleton className="h-6 w-24" />
							<div className="space-y-2 rounded-lg bg-muted/40 p-2 min-h-24">
								<Skeleton className="h-24 w-full rounded-lg" />
								<Skeleton className="h-24 w-full rounded-lg" />
							</div>
						</div>
					))}
				</div>
			) : (
				<KanbanBoard />
			)}

			{/* Task creation dialog */}
			<TaskCreateDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}
