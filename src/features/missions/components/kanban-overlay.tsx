"use client";

import { useTaskStore } from "../model/task-store";
import { KanbanCard } from "./kanban-card";

interface KanbanOverlayProps {
	taskId: string | null;
}

export function KanbanOverlay({ taskId }: KanbanOverlayProps) {
	if (!taskId) return null;

	// Use getState() for overlay to avoid re-render cascading
	const task = useTaskStore.getState().tasks.get(taskId);
	if (!task) return null;

	return <KanbanCard task={task} isOverlay />;
}
