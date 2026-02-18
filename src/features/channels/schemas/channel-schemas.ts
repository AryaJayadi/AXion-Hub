import { z } from "zod/v4";
import { channelPlatformSchema } from "@/entities/channel/model/schemas";

/** Schema for the channel configuration form */
export const channelConfigSchema = z.object({
	name: z.string().min(1, "Name is required"),
	platform: channelPlatformSchema,
	agentId: z.string().nullable(),
	// Platform-specific optional fields
	phoneNumber: z.string().optional(),
	botToken: z.string().optional(),
	webhookUrl: z.string().url("Must be a valid URL").optional(),
});

export type ChannelConfigFormValues = z.infer<typeof channelConfigSchema>;

/** Schema for group-specific channel settings */
export const channelGroupSettingsSchema = z.object({
	allowlist: z.array(z.string()),
	mentionPatterns: z.array(z.string()),
	broadcastEnabled: z.boolean(),
});

export type ChannelGroupSettingsFormValues = z.infer<
	typeof channelGroupSettingsSchema
>;

/** Schema for channel update mutations */
export const updateChannelSchema = z.object({
	name: z.string().min(1).optional(),
	agentId: z.string().nullable().optional(),
	phoneNumber: z.string().optional(),
	botToken: z.string().optional(),
	webhookUrl: z.string().url().optional(),
});

export type UpdateChannelValues = z.infer<typeof updateChannelSchema>;
