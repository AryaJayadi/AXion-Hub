// Stores
export { useBoardStore } from "./model/board-store";
export { useTaskStore } from "./model/task-store";

// Hooks
export {
	useActiveBoard,
	useColumns,
	useTasksForColumn,
	useTask,
	useSelectedTask,
} from "./model/hooks";

// API
export { useBoards } from "./api/use-boards";
export { useBoardTasks } from "./api/use-board-tasks";
export { useTaskDetail } from "./api/use-task-detail";
export {
	useCreateTask,
	useUpdateTask,
	useDeleteTask,
} from "./api/use-task-mutations";
export {
	useCreateBoard,
	useUpdateBoard,
	useDeleteBoard,
} from "./api/use-board-mutations";

// Schemas
export { taskFormSchema, subtaskInputSchema } from "./schemas/task-schemas";
export type { TaskFormValues } from "./schemas/task-schemas";
export {
	createBoardSchema,
	updateBoardSchema,
	boardColumnFormSchema,
	automationRuleSchema,
} from "./schemas/board-schemas";
export type {
	CreateBoardValues,
	UpdateBoardValues,
	BoardColumnFormValues,
	AutomationRule,
} from "./schemas/board-schemas";

// Subscriptions
export { initMissionStoreSubscriptions } from "./lib/mission-subscriptions";

// Utils
export { findColumnOfTask, getTaskIndex } from "./lib/drag-utils";
