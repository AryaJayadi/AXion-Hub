/**
 * Zod schemas for validating and parsing OpenClaw Gateway frames.
 *
 * Each schema uses .passthrough() to allow unknown fields from the gateway,
 * ensuring forward compatibility when the gateway adds new fields.
 */

import { z } from "zod/v4";
import type { GatewayFrame } from "../model/types";

/** Schema for client-to-gateway request frames */
export const GatewayRequestSchema = z
	.object({
		type: z.literal("req"),
		id: z.string(),
		method: z.string(),
		params: z.unknown(),
	})
	.passthrough();

/** Schema for gateway-to-client response frames */
export const GatewayResponseSchema = z
	.object({
		type: z.literal("res"),
		id: z.string(),
		ok: z.boolean(),
		payload: z.record(z.string(), z.unknown()).optional(),
		error: z
			.object({
				code: z.string(),
				message: z.string(),
			})
			.passthrough()
			.optional(),
	})
	.passthrough();

/** Schema for gateway-to-client push event frames */
export const GatewayEventSchema = z
	.object({
		type: z.literal("event"),
		event: z.string(),
		payload: z.record(z.string(), z.unknown()),
	})
	.passthrough();

/** Discriminated union schema for all gateway frame types */
export const GatewayFrameSchema = z.discriminatedUnion("type", [
	GatewayRequestSchema,
	GatewayResponseSchema,
	GatewayEventSchema,
]);

/**
 * Parse and validate a raw gateway frame.
 *
 * @param data - Raw data received from the WebSocket (typically parsed JSON)
 * @returns A validated and typed GatewayFrame
 * @throws ZodError with descriptive message if validation fails
 */
export function parseGatewayFrame(data: unknown): GatewayFrame {
	const result = GatewayFrameSchema.safeParse(data);

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");
		throw new Error(`Invalid gateway frame: ${issues}`);
	}

	return result.data as GatewayFrame;
}
