import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ActivityEntry, Deliverable, Task } from "@/entities/mission";

interface TaskStore {
	// State
	tasks: Map<string, Task>;
	selectedTaskId: string | null;

	// Actions
	setTasks: (tasks: Task[]) => void;
	addTask: (task: Task) => void;
	updateTask: (taskId: string, updates: Partial<Task>) => void;
	removeTask: (taskId: string) => void;
	setSelectedTask: (taskId: string | null) => void;
	addDeliverable: (taskId: string, deliverable: Deliverable) => void;
	addActivityEntry: (taskId: string, entry: ActivityEntry) => void;
}

export const useTaskStore = create<TaskStore>()(
	immer((set) => ({
		tasks: new Map<string, Task>(),
		selectedTaskId: null,

		setTasks: (tasks) =>
			set((state) => {
				state.tasks = new Map(tasks.map((t) => [t.id, t]));
			}),

		addTask: (task) =>
			set((state) => {
				state.tasks.set(task.id, task);
			}),

		updateTask: (taskId, updates) =>
			set((state) => {
				const task = state.tasks.get(taskId);
				if (task) {
					Object.assign(task, updates);
				}
			}),

		removeTask: (taskId) =>
			set((state) => {
				state.tasks.delete(taskId);
			}),

		setSelectedTask: (taskId) =>
			set((state) => {
				state.selectedTaskId = taskId;
			}),

		addDeliverable: (taskId, deliverable) =>
			set((state) => {
				const task = state.tasks.get(taskId);
				if (task) {
					task.deliverables.push(deliverable);
				}
			}),

		addActivityEntry: (_taskId, _entry) => {
			// Activity entries will be stored per-task when activity timeline is implemented
			// For now this is a placeholder for EventBus subscriptions
		},
	})),
);
