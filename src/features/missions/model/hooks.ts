"use client";

import { useMemo } from "react";
import { useBoardStore } from "./board-store";
import { useTaskStore } from "./task-store";

/** Get the active board from the board store */
export function useActiveBoard() {
	const activeBoardId = useBoardStore((s) => s.activeBoardId);
	const boards = useBoardStore((s) => s.boards);
	return useMemo(
		() => boards.find((b) => b.id === activeBoardId) ?? null,
		[boards, activeBoardId],
	);
}

/** Get the columns from the board store */
export function useColumns() {
	return useBoardStore((s) => s.columns);
}

/** Get tasks for a specific column */
export function useTasksForColumn(columnId: string) {
	const taskIds = useBoardStore((s) => s.tasksByColumn[columnId] ?? []);
	const tasks = useTaskStore((s) => s.tasks);
	return useMemo(() => {
		return taskIds
			.map((id) => tasks.get(id))
			.filter((t): t is NonNullable<typeof t> => t != null);
	}, [taskIds, tasks]);
}

/** Get a single task by ID */
export function useTask(taskId: string) {
	return useTaskStore((s) => s.tasks.get(taskId) ?? null);
}

/** Get the selected task for slide-over/detail panel */
export function useSelectedTask() {
	const selectedId = useTaskStore((s) => s.selectedTaskId);
	const task = useTaskStore((s) =>
		selectedId ? (s.tasks.get(selectedId) ?? null) : null,
	);
	return task;
}
