"use client";

import type { RefObject } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { BoardColumn } from "@/entities/mission";
import { COLUMN_DISPLAY } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { useTask } from "../model/hooks";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
	column: BoardColumn;
	taskIds: string[];
	/** Ref for click-vs-drag detection, passed through to KanbanCard */
	wasDraggingRef?: RefObject<boolean> | undefined;
}

/** Wrapper to get task and render card -- avoids hook-in-loop issue */
function TaskCardSlot({
	taskId,
	wasDraggingRef,
}: {
	taskId: string;
	wasDraggingRef?: RefObject<boolean> | undefined;
}) {
	const task = useTask(taskId);
	if (!task) return null;
	return <KanbanCard task={task} wasDraggingRef={wasDraggingRef} />;
}

export function KanbanColumn({
	column,
	taskIds,
	wasDraggingRef,
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id: column.id });

	const display = column.semanticRole
		? COLUMN_DISPLAY[column.semanticRole]
		: null;

	return (
		<div className="flex w-72 shrink-0 flex-col">
			{/* Column header */}
			<div className="mb-3 flex items-center justify-between px-1">
				<h3 className="text-sm font-semibold text-foreground">
					{display?.label ?? column.name}
				</h3>
				<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
					{taskIds.length}
				</Badge>
			</div>

			{/* Sortable drop zone */}
			<SortableContext
				items={taskIds}
				strategy={verticalListSortingStrategy}
			>
				<div
					ref={setNodeRef}
					className={cn(
						"flex flex-1 flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-24 transition-colors",
						isOver && "bg-muted/70 ring-1 ring-primary/20",
					)}
				>
					{taskIds.length > 0 ? (
						taskIds.map((taskId) => (
							<TaskCardSlot
								key={taskId}
								taskId={taskId}
								wasDraggingRef={wasDraggingRef}
							/>
						))
					) : (
						<div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 p-4 min-h-24">
							<p className="text-xs text-muted-foreground">No tasks</p>
						</div>
					)}
				</div>
			</SortableContext>
		</div>
	);
}
