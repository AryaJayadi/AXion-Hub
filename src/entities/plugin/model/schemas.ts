import { z } from "zod/v4";

import type { PluginStatus } from "./types";

const PLUGIN_STATUSES: [PluginStatus, ...PluginStatus[]] = [
	"active",
	"disabled",
	"error",
];

export const pluginSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	version: z.string().min(1),
	description: z.string(),
	status: z.enum(PLUGIN_STATUSES),
	lastUpdated: z.coerce.date(),
	author: z.string(),
	homepage: z.string().nullable(),
	permissions: z.array(z.string()),
	agentCount: z.number().int().min(0),
});

export const availablePluginSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	version: z.string().min(1),
	description: z.string(),
	author: z.string(),
	downloads: z.number().int().min(0),
	category: z.string(),
	installed: z.boolean(),
	icon: z.string(),
});

export type PluginInput = z.infer<typeof pluginSchema>;
export type AvailablePluginInput = z.infer<typeof availablePluginSchema>;
