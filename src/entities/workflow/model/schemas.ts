/**
 * Zod v4 schemas for workflow entities.
 */

import { z } from "zod/v4";

export const workflowStatusSchema = z.enum([
	"draft",
	"active",
	"paused",
	"error",
]);

export const workflowTriggerTypeSchema = z.enum([
	"manual",
	"cron",
	"webhook",
	"event",
]);

export const workflowNodeTypeSchema = z.enum([
	"trigger",
	"agentAction",
	"condition",
	"delay",
	"transform",
	"output",
	"loop",
	"parallel",
	"httpRequest",
	"code",
	"approvalGate",
	"subWorkflow",
]);

export const workflowDefinitionSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	description: z.string(),
	status: workflowStatusSchema,
	triggerType: workflowTriggerTypeSchema,
	nodes: z.array(z.unknown()),
	edges: z.array(z.unknown()),
	nodeCount: z.number().int().min(0),
	lastEditedAt: z.coerce.date(),
	lastRunAt: z.coerce.date().nullable(),
	lastRunStatus: z
		.enum(["success", "error", "running"])
		.nullable(),
});

export const executionNodeStatusSchema = z.enum([
	"pending",
	"running",
	"success",
	"error",
	"skipped",
]);

export const nodeExecutionStateSchema = z.object({
	status: executionNodeStatusSchema,
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	input: z.unknown(),
	output: z.unknown(),
	error: z.string().nullable(),
});
