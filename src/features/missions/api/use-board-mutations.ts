"use client";

import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { Board, BoardColumn } from "@/entities/mission";
import { useBoardStore } from "../model/board-store";
import type { CreateBoardValues, UpdateBoardValues } from "../schemas/board-schemas";

/** Default columns for new boards */
function getDefaultColumns(): BoardColumn[] {
	return [
		{ id: `col-${nanoid(6)}`, name: "INBOX", semanticRole: "inbox", order: 0, isHumanOnly: false },
		{ id: `col-${nanoid(6)}`, name: "QUEUED", semanticRole: "queued", order: 1, isHumanOnly: false },
		{ id: `col-${nanoid(6)}`, name: "IN PROGRESS", semanticRole: "in_progress", order: 2, isHumanOnly: false },
		{ id: `col-${nanoid(6)}`, name: "IN REVIEW", semanticRole: "in_review", order: 3, isHumanOnly: false },
		{ id: `col-${nanoid(6)}`, name: "DONE", semanticRole: "done", order: 4, isHumanOnly: false },
		{ id: `col-${nanoid(6)}`, name: "ARCHIVED", semanticRole: "archived", order: 5, isHumanOnly: false },
	];
}

/**
 * Mutation hook to create a new board with optimistic store insert.
 */
export function useCreateBoard() {
	return useMutation({
		mutationFn: async (values: CreateBoardValues): Promise<Board> => {
			await new Promise((r) => setTimeout(r, 200));

			const board: Board = {
				id: `board-${nanoid(8)}`,
				name: values.name,
				orgId: "org-default",
				columns: getDefaultColumns(),
				createdAt: new Date(),
			};

			return board;
		},
		onMutate: (values) => {
			// Optimistic add
			const tempBoard: Board = {
				id: `temp-${nanoid(6)}`,
				name: values.name,
				orgId: "org-default",
				columns: getDefaultColumns(),
				createdAt: new Date(),
			};
			const store = useBoardStore.getState();
			store.setBoards([...store.boards, tempBoard]);
			return { tempBoard };
		},
		onSuccess: (board, _values, context) => {
			// Replace temp board with real one
			if (context?.tempBoard) {
				const store = useBoardStore.getState();
				const updated = store.boards.map((b) =>
					b.id === context.tempBoard.id ? board : b,
				);
				store.setBoards(updated);
			}
			toast.success(`Board "${board.name}" created`);
		},
		onError: (_err, _values, context) => {
			// Rollback
			if (context?.tempBoard) {
				const store = useBoardStore.getState();
				store.setBoards(
					store.boards.filter((b) => b.id !== context.tempBoard.id),
				);
			}
			toast.error("Failed to create board");
		},
	});
}

/**
 * Mutation hook to update board name/columns in store.
 */
export function useUpdateBoard() {
	return useMutation({
		mutationFn: async ({
			boardId,
			updates,
		}: {
			boardId: string;
			updates: UpdateBoardValues;
		}): Promise<Board> => {
			await new Promise((r) => setTimeout(r, 200));

			const store = useBoardStore.getState();
			const board = store.boards.find((b) => b.id === boardId);
			if (!board) throw new Error("Board not found");

			return {
				...board,
				name: updates.name ?? board.name,
				columns: (updates.columns as BoardColumn[]) ?? board.columns,
			};
		},
		onSuccess: (board) => {
			const store = useBoardStore.getState();
			const updated = store.boards.map((b) =>
				b.id === board.id ? board : b,
			);
			store.setBoards(updated);
			toast.success("Board updated");
		},
		onError: () => {
			toast.error("Failed to update board");
		},
	});
}

/**
 * Mutation hook to delete a board from the store.
 */
export function useDeleteBoard() {
	return useMutation({
		mutationFn: async (boardId: string): Promise<string> => {
			await new Promise((r) => setTimeout(r, 200));
			return boardId;
		},
		onSuccess: (boardId) => {
			const store = useBoardStore.getState();
			const filtered = store.boards.filter((b) => b.id !== boardId);
			store.setBoards(filtered);
			// If deleted board was active, switch to first
			if (store.activeBoardId === boardId && filtered[0]) {
				store.setActiveBoard(filtered[0].id);
			}
			toast.success("Board deleted");
		},
		onError: () => {
			toast.error("Failed to delete board");
		},
	});
}
