"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { Task } from "@/entities/mission";
import { queryKeys } from "@/shared/lib/query-keys";
import { useBoardStore } from "../model/board-store";
import { useTaskStore } from "../model/task-store";
import type { TaskFormValues } from "../schemas/task-schemas";

/**
 * Column ID for the INBOX column where newly created tasks land.
 */
const INBOX_COLUMN_ID = "col-inbox";

/**
 * Mutation hook to create a new task with optimistic board insert.
 */
export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (values: TaskFormValues): Promise<Task> => {
			// Mock API: simulate latency then return the task
			await new Promise((r) => setTimeout(r, 200));

			const now = new Date();
			const task: Task = {
				id: nanoid(),
				boardId: values.boardId,
				title: values.title,
				description: values.description ?? "",
				priority: values.priority ?? "medium",
				status: "inbox",
				assignedAgentIds: values.assignedAgentIds ?? [],
				reviewerId: values.reviewerId,
				tags: values.tags ?? [],
				subtasks: (values.subtasks ?? []).map((s) => ({
					id: nanoid(),
					title: s.title,
					completed: false,
				})),
				deliverables: [],
				signOffRequired: values.signOffRequired ?? false,
				signOffStatus: undefined,
				parentTaskId: undefined,
				dueDate: values.dueDate,
				createdAt: now,
				updatedAt: now,
				columnOrder: 0,
			};

			return task;
		},
		onMutate: async (values) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.tasks.byBoard(values.boardId),
			});

			const now = new Date();
			const optimisticId = `optimistic-${nanoid()}`;

			const optimisticTask: Task = {
				id: optimisticId,
				boardId: values.boardId,
				title: values.title,
				description: values.description ?? "",
				priority: values.priority ?? "medium",
				status: "inbox",
				assignedAgentIds: values.assignedAgentIds ?? [],
				reviewerId: values.reviewerId,
				tags: values.tags ?? [],
				subtasks: (values.subtasks ?? []).map((s) => ({
					id: nanoid(),
					title: s.title,
					completed: false,
				})),
				deliverables: [],
				signOffRequired: values.signOffRequired ?? false,
				signOffStatus: undefined,
				parentTaskId: undefined,
				dueDate: values.dueDate,
				createdAt: now,
				updatedAt: now,
				columnOrder: 0,
			};

			// Add to task store
			useTaskStore.getState().addTask(optimisticTask);

			// Add to board store INBOX column
			const boardState = useBoardStore.getState();
			const currentInbox = boardState.tasksByColumn[INBOX_COLUMN_ID] ?? [];
			boardState.setTaskOrder(INBOX_COLUMN_ID, [
				optimisticId,
				...currentInbox,
			]);

			return { optimisticId };
		},
		onSuccess: (serverTask, _values, context) => {
			if (context?.optimisticId) {
				// Replace optimistic task with server response
				useTaskStore.getState().removeTask(context.optimisticId);
				useTaskStore.getState().addTask(serverTask);

				// Update board store: replace optimistic ID with real ID
				const boardState = useBoardStore.getState();
				const currentInbox =
					boardState.tasksByColumn[INBOX_COLUMN_ID] ?? [];
				const updatedIds = currentInbox.map((id) =>
					id === context.optimisticId ? serverTask.id : id,
				);
				boardState.setTaskOrder(INBOX_COLUMN_ID, updatedIds);
			}

			toast.success("Task created");
		},
		onError: (_error, _values, context) => {
			// Rollback: remove optimistic task
			if (context?.optimisticId) {
				useTaskStore.getState().removeTask(context.optimisticId);

				const boardState = useBoardStore.getState();
				const currentInbox =
					boardState.tasksByColumn[INBOX_COLUMN_ID] ?? [];
				boardState.setTaskOrder(
					INBOX_COLUMN_ID,
					currentInbox.filter((id) => id !== context.optimisticId),
				);
			}

			toast.error("Failed to create task");
		},
	});
}

/**
 * Mutation hook to update an existing task with optimistic updates.
 */
export function useUpdateTask() {
	return useMutation({
		mutationFn: async ({
			taskId,
			updates,
		}: {
			taskId: string;
			updates: Partial<Task>;
		}): Promise<Task> => {
			// Mock API
			await new Promise((r) => setTimeout(r, 200));

			const current = useTaskStore.getState().tasks.get(taskId);
			if (!current) throw new Error("Task not found");

			return { ...current, ...updates, updatedAt: new Date() };
		},
		onMutate: async ({ taskId, updates }) => {
			const snapshot = useTaskStore.getState().tasks.get(taskId);
			if (snapshot) {
				useTaskStore.getState().updateTask(taskId, updates);
			}
			return { snapshot };
		},
		onError: (_error, { taskId }, context) => {
			// Rollback to snapshot
			if (context?.snapshot) {
				useTaskStore
					.getState()
					.updateTask(taskId, context.snapshot as Partial<Task>);
			}
			toast.error("Failed to update task");
		},
	});
}

/**
 * Mutation hook to delete a task with optimistic removal.
 */
export function useDeleteTask() {
	return useMutation({
		mutationFn: async (taskId: string): Promise<void> => {
			// Mock API
			await new Promise((r) => setTimeout(r, 200));
		},
		onMutate: async (taskId) => {
			const snapshot = useTaskStore.getState().tasks.get(taskId);

			// Find which column the task is in
			const boardState = useBoardStore.getState();
			let snapshotColumnId: string | null = null;
			let snapshotIndex = -1;

			for (const [colId, taskIds] of Object.entries(
				boardState.tasksByColumn,
			)) {
				const idx = taskIds.indexOf(taskId);
				if (idx !== -1) {
					snapshotColumnId = colId;
					snapshotIndex = idx;
					break;
				}
			}

			// Remove from task store
			useTaskStore.getState().removeTask(taskId);

			// Remove from board store
			if (snapshotColumnId) {
				const currentIds =
					boardState.tasksByColumn[snapshotColumnId] ?? [];
				useBoardStore
					.getState()
					.setTaskOrder(
						snapshotColumnId,
						currentIds.filter((id) => id !== taskId),
					);
			}

			return { snapshot, snapshotColumnId, snapshotIndex };
		},
		onSuccess: () => {
			toast.success("Task deleted");
		},
		onError: (_error, taskId, context) => {
			// Rollback: re-add task and board entry
			if (context?.snapshot) {
				useTaskStore.getState().addTask(context.snapshot);
			}
			if (context?.snapshotColumnId && context.snapshotIndex >= 0) {
				const boardState = useBoardStore.getState();
				const currentIds =
					boardState.tasksByColumn[context.snapshotColumnId] ?? [];
				const restored = [...currentIds];
				restored.splice(context.snapshotIndex, 0, taskId);
				boardState.setTaskOrder(context.snapshotColumnId, restored);
			}

			toast.error("Failed to delete task");
		},
	});
}
