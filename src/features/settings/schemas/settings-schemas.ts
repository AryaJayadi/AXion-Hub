import { z } from "zod/v4";

/**
 * Schema for general workspace settings.
 */
export const generalSettingsSchema = z.object({
	appName: z
		.string()
		.min(1, "App name is required")
		.max(100, "App name must be 100 characters or less"),
	timezone: z.string().min(1, "Timezone is required"),
	language: z.string().min(1, "Language is required"),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

/**
 * Schema for profile settings.
 */
export const profileSettingsSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(100, "Display name must be 100 characters or less"),
	avatar: z.union([z.url("Must be a valid URL"), z.literal("")]).nullable(),
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;
