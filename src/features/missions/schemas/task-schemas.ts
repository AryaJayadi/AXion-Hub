import { z } from "zod/v4";
import { createTaskSchema } from "@/entities/mission";

/**
 * Subtask input schema for task creation form.
 */
export const subtaskInputSchema = z.object({
	title: z.string().min(1, "Subtask title is required"),
});

/**
 * Full task form validation schema.
 * Extends createTaskSchema with subtasks array.
 */
export const taskFormSchema = createTaskSchema.extend({
	subtasks: z.array(subtaskInputSchema).default([]),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** Re-export the base create task schema for convenience */
export { createTaskSchema };
