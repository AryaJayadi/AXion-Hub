"use client";

import { Plus } from "lucide-react";

import { useBoards } from "@/features/missions/api/use-boards";
import { useBoardTasks } from "@/features/missions/api/use-board-tasks";
import { KanbanBoard } from "@/features/missions/components/kanban-board";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export function MissionsBoardView() {
	const { boards, isLoading: boardsLoading } = useBoards();
	const activeBoardId = boards[0]?.id ?? "";

	const { isLoading: tasksLoading } = useBoardTasks(activeBoardId);

	const isLoading = boardsLoading || tasksLoading;

	return (
		<div className="flex flex-col h-full">
			<PageHeader
				title="Missions"
				description="Manage and track agent tasks"
				actions={
					<Button
						size="sm"
						onClick={() => {
							// Placeholder: will connect in 06-02
							console.log("[Missions] New Task clicked");
						}}
					>
						<Plus className="mr-1.5 size-4" />
						New Task
					</Button>
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
		</div>
	);
}
