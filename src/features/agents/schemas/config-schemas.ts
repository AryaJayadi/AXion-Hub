import { z } from "zod/v4";

export const sandboxConfigSchema = z.object({
	enabled: z.boolean(),
	image: z.string().min(1, "Docker image is required"),
	workspacePath: z.string().min(1, "Workspace path is required"),
});

export type SandboxConfig = z.infer<typeof sandboxConfigSchema>;

export const toolConfigSchema = z.object({
	name: z.string(),
	allowed: z.boolean(),
	elevated: z.boolean(),
});

export type ToolConfig = z.infer<typeof toolConfigSchema>;
