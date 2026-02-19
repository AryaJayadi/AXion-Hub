import { z } from "zod/v4";

export const skillCategorySchema = z.enum([
	"code",
	"communication",
	"data",
	"productivity",
	"integration",
	"security",
]);

export const skillStatusSchema = z.enum([
	"enabled",
	"disabled",
	"update_available",
]);

export const skillSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: skillCategorySchema,
	icon: z.string(),
	version: z.string(),
	status: skillStatusSchema,
	agentCount: z.number().min(0),
	configSchema: z.record(z.string(), z.unknown()).nullable(),
	installedAt: z.coerce.date(),
});

export const clawHubSkillSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: skillCategorySchema,
	icon: z.string(),
	version: z.string(),
	author: z.string(),
	downloads: z.number().min(0),
	rating: z.number().min(0).max(5),
	featured: z.boolean(),
	trending: z.boolean(),
	installable: z.boolean(),
	installed: z.boolean(),
});
