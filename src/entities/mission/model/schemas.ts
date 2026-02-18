import { z } from "zod/v4";

export const taskPrioritySchema = z.enum([
	"critical",
	"high",
	"medium",
	"low",
]);

export const taskStatusSchema = z.enum([
	"inbox",
	"queued",
	"in_progress",
	"in_review",
	"done",
	"archived",
]);

export const createTaskSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().default(""),
	priority: taskPrioritySchema.default("medium"),
	assignedAgentIds: z.array(z.string()).default([]),
	reviewerId: z.string().optional(),
	tags: z.array(z.string()).default([]),
	signOffRequired: z.boolean().default(false),
	dueDate: z.coerce.date().optional(),
	boardId: z.string().min(1),
});

export const updateTaskSchema = createTaskSchema.partial();

export const boardColumnSchema = z.object({
	name: z.string().min(1).max(100),
	semanticRole: taskStatusSchema.nullable(),
	isHumanOnly: z.boolean().default(false),
});

export const createBoardSchema = z.object({
	name: z.string().min(1).max(100),
	orgId: z.string().min(1),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
export type CreateBoardValues = z.infer<typeof createBoardSchema>;
