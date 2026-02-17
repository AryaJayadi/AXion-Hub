/**
 * Gateway Client: typed abstraction layer over the raw OpenClaw Gateway protocol.
 *
 * All dashboard code communicates with the gateway through this layer.
 * Raw gateway protocol types are NEVER imported in UI code.
 *
 * Responsibilities:
 * - Clean async API methods (getAgents, sendMessage, getHealth, etc.)
 * - Zod validation + transformation of gateway responses into internal domain types
 * - Dual-mode support: WebSocket operations work in both modes,
 *   filesystem operations return ModeAwareResult
 */

import { z } from "zod/v4";
import { nanoid } from "nanoid";
import type { ConnectionMode } from "../model/types";
import type { WebSocketManager } from "./ws-manager";

// -- Internal domain types (AXion Hub's own, NOT the gateway's raw types) --

export type AgentStatus = "online" | "idle" | "working" | "error" | "offline";

export interface Agent {
	id: string;
	name: string;
	status: AgentStatus;
	model: string;
	lastActive: Date;
}

export interface GatewayHealth {
	status: string;
	uptime: number;
	version: string;
	agentCount: number;
}

export interface GatewayConfig {
	gatewayPort: number;
	dataDir: string;
	logLevel: string;
}

export interface Session {
	id: string;
	agentId: string;
	startedAt: Date;
	messageCount: number;
}

/**
 * Result type for mode-aware operations.
 * Some operations are only available in local mode (filesystem access).
 */
export type ModeAwareResult<T> =
	| { available: true; data: T }
	| { available: false; reason: "remote-mode" };

// -- Zod schemas for gateway response validation + transformation --

/** Maps gateway agent_status strings to internal AgentStatus */
function mapAgentStatus(rawStatus: string): AgentStatus {
	const statusMap: Record<string, AgentStatus> = {
		online: "online",
		idle: "idle",
		working: "working",
		busy: "working",
		error: "error",
		offline: "offline",
		stopped: "offline",
	};
	return statusMap[rawStatus] ?? "offline";
}

/** Validates + transforms a raw gateway agent into an internal Agent */
const GatewayAgentSchema = z
	.object({
		agent_id: z.string(),
		display_name: z.string(),
		agent_status: z.string(),
		current_model: z.string().optional(),
		last_activity: z.string().optional(),
	})
	.passthrough()
	.transform((raw) => ({
		id: raw.agent_id,
		name: raw.display_name,
		status: mapAgentStatus(raw.agent_status),
		model: raw.current_model ?? "unknown",
		lastActive: raw.last_activity ? new Date(raw.last_activity) : new Date(),
	}));

/** Validates + transforms a raw gateway health response */
const GatewayHealthSchema = z
	.object({
		status: z.string(),
		uptime: z.number(),
		version: z.string(),
		agent_count: z.number(),
	})
	.passthrough()
	.transform((raw) => ({
		status: raw.status,
		uptime: raw.uptime,
		version: raw.version,
		agentCount: raw.agent_count,
	}));

/** Validates + transforms a raw gateway config response */
const GatewayConfigSchema = z
	.object({
		gateway_port: z.number(),
		data_dir: z.string(),
		log_level: z.string(),
	})
	.passthrough()
	.transform((raw) => ({
		gatewayPort: raw.gateway_port,
		dataDir: raw.data_dir,
		logLevel: raw.log_level,
	}));

/** Validates + transforms a raw gateway session */
const GatewaySessionSchema = z
	.object({
		session_id: z.string(),
		agent_id: z.string(),
		started_at: z.string(),
		message_count: z.number(),
	})
	.passthrough()
	.transform((raw) => ({
		id: raw.session_id,
		agentId: raw.agent_id,
		startedAt: new Date(raw.started_at),
		messageCount: raw.message_count,
	}));

export class GatewayClient {
	private ws: WebSocketManager;
	private mode: ConnectionMode;

	constructor(ws: WebSocketManager, mode: ConnectionMode = "remote") {
		this.ws = ws;
		this.mode = mode;
	}

	// -- Agent operations --

	/**
	 * Fetch the list of all agents from the gateway.
	 */
	async getAgents(): Promise<Agent[]> {
		const response = await this.ws.request("agent.list", {});
		const payload = response.payload as Record<string, unknown> | undefined;
		return z.array(GatewayAgentSchema).parse(payload?.agents);
	}

	/**
	 * Fetch a single agent by ID.
	 */
	async getAgent(agentId: string): Promise<Agent> {
		const response = await this.ws.request("agent.get", { agentId });
		const payload = response.payload as Record<string, unknown> | undefined;
		return GatewayAgentSchema.parse(payload?.agent);
	}

	// -- Health --

	/**
	 * Get the gateway's health status.
	 */
	async getHealth(): Promise<GatewayHealth> {
		const response = await this.ws.request("health", {});
		return GatewayHealthSchema.parse(response.payload);
	}

	// -- Chat --

	/**
	 * Send a message to an agent.
	 * The response will arrive as streaming events via the Event Bus.
	 *
	 * @param agentId - Target agent ID
	 * @param message - Message text
	 * @param sessionId - Optional session ID (creates new session if omitted)
	 */
	async sendMessage(agentId: string, message: string, sessionId?: string): Promise<void> {
		await this.ws.request("agent.send", {
			agentId,
			message,
			sessionId,
			idempotencyKey: nanoid(),
		});
	}

	// -- Config (local mode only) --

	/**
	 * Get the gateway configuration.
	 * Only available in local mode (requires filesystem access).
	 */
	async getConfig(): Promise<ModeAwareResult<GatewayConfig>> {
		if (this.mode !== "local") {
			return { available: false, reason: "remote-mode" };
		}
		const response = await this.ws.request("config.get", {});
		const config = GatewayConfigSchema.parse(response.payload);
		return { available: true, data: config };
	}

	// -- Sessions --

	/**
	 * Get chat sessions for a specific agent.
	 */
	async getSessions(agentId: string): Promise<Session[]> {
		const response = await this.ws.request("sessions.list", { agentId });
		const payload = response.payload as Record<string, unknown> | undefined;
		return z.array(GatewaySessionSchema).parse(payload?.sessions);
	}
}
