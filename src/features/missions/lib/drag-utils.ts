/**
 * Find which column a task currently belongs to.
 */
export function findColumnOfTask(
	tasksByColumn: Record<string, string[]>,
	taskId: string,
): string | null {
	for (const [columnId, taskIds] of Object.entries(tasksByColumn)) {
		if (taskIds.includes(taskId)) {
			return columnId;
		}
	}
	return null;
}

/**
 * Get the index of a task within a column's task list.
 * Returns -1 if not found.
 */
export function getTaskIndex(
	tasksByColumn: Record<string, string[]>,
	columnId: string,
	taskId: string,
): number {
	const ids = tasksByColumn[columnId];
	if (!ids) return -1;
	return ids.indexOf(taskId);
}
