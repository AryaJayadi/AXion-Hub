"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import type { Task } from "@/entities/mission";
import { queryKeys } from "@/shared/lib/query-keys";
import { useTaskStore } from "../model/task-store";

/**
 * Fetches a single task by ID.
 * Mock: reads from task store's Map.
 */
async function fetchTaskDetail(taskId: string): Promise<Task | null> {
	// Simulate API latency
	await new Promise((r) => setTimeout(r, 100));

	const task = useTaskStore.getState().tasks.get(taskId);
	return task ?? null;
}

/**
 * TanStack Query hook for fetching single task detail.
 * Syncs selected task ID into the task store.
 */
export function useTaskDetail(taskId: string | null) {
	const setSelectedTask = useTaskStore((s) => s.setSelectedTask);

	const query = useQuery({
		queryKey: queryKeys.tasks.detail(taskId ?? ""),
		queryFn: () => fetchTaskDetail(taskId!),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!taskId,
	});

	// Sync selected task ID into task store
	useEffect(() => {
		setSelectedTask(taskId);
		return () => {
			setSelectedTask(null);
		};
	}, [taskId, setSelectedTask]);

	return {
		task: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error,
	};
}
