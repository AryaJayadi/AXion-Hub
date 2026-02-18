import { z } from "zod/v4";

export const basicsSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(64, "Name must be at most 64 characters"),
	description: z.string().max(500, "Description must be at most 500 characters").default(""),
	avatar: z.url("Must be a valid URL").optional(),
});

export type BasicsFormValues = z.infer<typeof basicsSchema>;

export const modelConfigSchema = z.object({
	model: z.string().min(1, "Model is required"),
	temperature: z.number().min(0).max(2).default(0.7),
	maxTokens: z.number().min(256).max(200000).default(4096),
});

export type ModelConfigFormValues = z.infer<typeof modelConfigSchema>;

export const identitySchema = z.object({
	soul: z.string().default(""),
	identity: z.string().default(""),
	user: z.string().default(""),
	agents: z.string().default(""),
});

export type IdentityFormValues = z.infer<typeof identitySchema>;

export const skillsToolsSchema = z.object({
	skills: z.array(z.string()).default([]),
	tools: z.array(z.string()).default([]),
	deniedTools: z.array(z.string()).default([]),
});

export type SkillsToolsFormValues = z.infer<typeof skillsToolsSchema>;

export const sandboxSchema = z.object({
	enabled: z.boolean().default(false),
	image: z.string().default("node:20-slim"),
	workspacePath: z.string().default("/workspace"),
});

export type SandboxFormValues = z.infer<typeof sandboxSchema>;

export const channelsSchema = z.object({
	bindings: z
		.array(
			z.object({
				channelId: z.string(),
				rule: z.string(),
			}),
		)
		.default([]),
});

export type ChannelsFormValues = z.infer<typeof channelsSchema>;
