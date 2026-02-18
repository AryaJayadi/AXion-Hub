import { z } from "zod/v4";

export const channelPlatformSchema = z.enum([
	"whatsapp",
	"telegram",
	"discord",
	"slack",
	"web",
	"sms",
]);

export const channelStatusSchema = z.enum([
	"connected",
	"disconnected",
	"pairing",
	"error",
]);

export const channelSchema = z.object({
	id: z.string(),
	name: z.string(),
	platform: channelPlatformSchema,
	status: channelStatusSchema,
	agentId: z.string().nullable(),
	phoneNumber: z.string().optional(),
	username: z.string().optional(),
	connectedAt: z.coerce.date().nullable(),
	messageCount: z.number().min(0),
});

export const channelRoutingSchema = z.object({
	channelId: z.string(),
	agentId: z.string(),
	rule: z.string(),
	priority: z.number().min(0),
});

export const channelGroupSettingsSchema = z.object({
	allowlist: z.array(z.string()),
	mentionPatterns: z.array(z.string()),
	broadcastEnabled: z.boolean(),
});

export const pairingStatusSchema = z.enum([
	"idle",
	"generating",
	"waiting",
	"scanned",
	"connected",
	"error",
]);

export const pairingStateSchema = z.object({
	status: pairingStatusSchema,
	qrCode: z.string().nullable(),
	platform: channelPlatformSchema.nullable(),
	expiresAt: z.coerce.date().nullable(),
});
