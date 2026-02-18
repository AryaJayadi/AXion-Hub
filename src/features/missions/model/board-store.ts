import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Board, BoardColumn, TaskStatus } from "@/entities/mission";
import { getColumnBySemanticRole } from "@/entities/mission";

interface PendingTransition {
	taskId: string;
	targetColumn: string;
}

interface BoardStore {
	// State
	boards: Board[];
	activeBoardId: string | null;
	columns: BoardColumn[];
	tasksByColumn: Record<string, string[]>; // columnId -> taskId[]
	isDragging: boolean;
	activeTaskId: string | null;
	pendingTransitions: PendingTransition[];

	// Actions
	setBoards: (boards: Board[]) => void;
	setActiveBoard: (boardId: string) => void;
	setColumns: (columns: BoardColumn[]) => void;
	setTaskOrder: (columnId: string, taskIds: string[]) => void;
	moveCard: (
		taskId: string,
		fromColumnId: string,
		toColumnId: string,
		newIndex: number,
	) => void;
	reorderInColumn: (
		columnId: string,
		oldIndex: number,
		newIndex: number,
	) => void;
	setDragging: (isDragging: boolean, activeTaskId: string | null) => void;
	autoTransition: (taskId: string, targetColumnSemanticRole: TaskStatus) => void;
	flushPendingTransitions: () => void;
}

export const useBoardStore = create<BoardStore>()(
	immer((set, get) => ({
		boards: [],
		activeBoardId: null,
		columns: [],
		tasksByColumn: {},
		isDragging: false,
		activeTaskId: null,
		pendingTransitions: [],

		setBoards: (boards) =>
			set((state) => {
				state.boards = boards;
				const firstBoard = boards[0];
				if (firstBoard && !state.activeBoardId) {
					state.activeBoardId = firstBoard.id;
					state.columns = firstBoard.columns;
				}
			}),

		setActiveBoard: (boardId) =>
			set((state) => {
				state.activeBoardId = boardId;
				const board = state.boards.find((b) => b.id === boardId);
				if (board) {
					state.columns = board.columns;
				}
			}),

		setColumns: (columns) =>
			set((state) => {
				state.columns = columns;
			}),

		setTaskOrder: (columnId, taskIds) =>
			set((state) => {
				state.tasksByColumn[columnId] = taskIds;
			}),

		moveCard: (taskId, fromColumnId, toColumnId, newIndex) =>
			set(() => {
				// Read fresh state to avoid stale closures during rapid drags
				const current = get();
				const sourceIds = [...(current.tasksByColumn[fromColumnId] ?? [])];
				const targetIds =
					fromColumnId === toColumnId
						? sourceIds
						: [...(current.tasksByColumn[toColumnId] ?? [])];

				// Remove from source
				const oldIndex = sourceIds.indexOf(taskId);
				if (oldIndex === -1) return;
				sourceIds.splice(oldIndex, 1);

				// Insert into target
				if (fromColumnId === toColumnId) {
					sourceIds.splice(newIndex, 0, taskId);
				} else {
					targetIds.splice(newIndex, 0, taskId);
				}

				// Apply via immer on a new set call
				return (state: BoardStore) => {
					state.tasksByColumn[fromColumnId] = sourceIds;
					if (fromColumnId !== toColumnId) {
						state.tasksByColumn[toColumnId] = targetIds;
					}
				};
			}),

		reorderInColumn: (columnId, oldIndex, newIndex) =>
			set(() => {
				const current = get();
				const ids = [...(current.tasksByColumn[columnId] ?? [])];
				if (oldIndex < 0 || oldIndex >= ids.length) return;
				if (newIndex < 0 || newIndex >= ids.length) return;

				// arrayMove logic
				const removed = ids.splice(oldIndex, 1);
				const item = removed[0];
				if (!item) return;
				ids.splice(newIndex, 0, item);

				return (state: BoardStore) => {
					state.tasksByColumn[columnId] = ids;
				};
			}),

		setDragging: (isDragging, activeTaskId) =>
			set((state) => {
				state.isDragging = isDragging;
				state.activeTaskId = activeTaskId;
			}),

		autoTransition: (taskId, targetColumnSemanticRole) =>
			set((state) => {
				// If currently dragging and this task is the one being dragged, queue it
				if (state.isDragging && state.activeTaskId === taskId) {
					const targetCol = getColumnBySemanticRole(
						state.columns,
						targetColumnSemanticRole,
					);
					if (targetCol) {
						state.pendingTransitions.push({
							taskId,
							targetColumn: targetCol.id,
						});
					}
					return;
				}

				// Otherwise, move task to top of target column immediately
				const targetCol = getColumnBySemanticRole(
					state.columns,
					targetColumnSemanticRole,
				);
				if (!targetCol) return;

				// Find and remove from current column
				for (const colId of Object.keys(state.tasksByColumn)) {
					const ids = state.tasksByColumn[colId];
					if (!ids) continue;
					const idx = ids.indexOf(taskId);
					if (idx !== -1) {
						ids.splice(idx, 1);
						break;
					}
				}

				// Add to top of target column
				const targetList =
					state.tasksByColumn[targetCol.id] ??
					(state.tasksByColumn[targetCol.id] = []);
				targetList.unshift(taskId);
			}),

		flushPendingTransitions: () =>
			set((state) => {
				for (const transition of state.pendingTransitions) {
					const { taskId, targetColumn } = transition;

					// Find and remove from current column
					for (const colId of Object.keys(state.tasksByColumn)) {
						const ids = state.tasksByColumn[colId];
						if (!ids) continue;
						const idx = ids.indexOf(taskId);
						if (idx !== -1) {
							ids.splice(idx, 1);
							break;
						}
					}

					// Add to top of target
					const targetList =
						state.tasksByColumn[targetColumn] ??
						(state.tasksByColumn[targetColumn] = []);
					targetList.unshift(taskId);
				}
				state.pendingTransitions = [];
			}),
	})),
);
