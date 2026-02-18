import { z } from "zod/v4";

export const agentStatusSchema = z.enum(["online", "idle", "working", "error", "offline"]);

export const agentSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	avatar: z.string().optional(),
	status: agentStatusSchema,
	model: z.string(),
	keyStat: z.string(),
	contextUsage: z.number().min(0).max(100),
	uptime: z.number().min(0),
	currentTask: z.string().optional(),
	createdAt: z.coerce.date(),
	lastActive: z.coerce.date(),
});

export const agentSessionSchema = z.object({
	id: z.string(),
	agentId: z.string(),
	startedAt: z.coerce.date(),
	endedAt: z.coerce.date().optional(),
	tokenCount: z.number().min(0),
	compactionCount: z.number().min(0),
	status: z.enum(["active", "compacted", "ended"]),
});

export const agentSkillSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	enabled: z.boolean(),
	source: z.enum(["built-in", "clawhub", "custom"]),
});

export const agentToolSchema = z.object({
	name: z.string(),
	description: z.string(),
	allowed: z.boolean(),
	elevated: z.boolean(),
});
