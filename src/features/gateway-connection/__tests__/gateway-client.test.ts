/**
 * GatewayClient tests.
 *
 * Uses a mock WebSocketManager to test Zod validation,
 * method delegation, and dual-mode support.
 */

import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "../lib/gateway-client";
import type { WebSocketManager } from "../lib/ws-manager";
import type { GatewayResponse } from "@/entities/gateway-event";

/** Create a mock WebSocketManager */
function createMockWs(): WebSocketManager {
	return {
		request: vi.fn(),
		state: "connected",
	} as unknown as WebSocketManager;
}

/** Create a mock GatewayResponse */
function mockResponse(payload: Record<string, unknown>): GatewayResponse {
	return {
		type: "res",
		id: "mock-id",
		ok: true,
		payload,
	};
}

describe("GatewayClient", () => {
	it("getAgents() validates and transforms gateway response", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				agents: [
					{
						agent_id: "agent-1",
						display_name: "Test Agent",
						agent_status: "online",
						current_model: "gpt-4",
						last_activity: "2026-01-15T10:00:00Z",
					},
				],
			}),
		);

		const agents = await client.getAgents();

		expect(ws.request).toHaveBeenCalledWith("agent.list", {});
		expect(agents).toHaveLength(1);
		expect(agents[0]).toEqual({
			id: "agent-1",
			name: "Test Agent",
			status: "online",
			model: "gpt-4",
			lastActive: new Date("2026-01-15T10:00:00Z"),
		});
	});

	it("getAgents() maps unknown agent statuses to offline", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				agents: [
					{
						agent_id: "a1",
						display_name: "Agent",
						agent_status: "some_future_status",
					},
				],
			}),
		);

		const agents = await client.getAgents();
		expect(agents[0]?.status).toBe("offline");
	});

	it("getAgents() maps 'busy' to 'working'", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				agents: [
					{
						agent_id: "a1",
						display_name: "Agent",
						agent_status: "busy",
						current_model: "claude",
					},
				],
			}),
		);

		const agents = await client.getAgents();
		expect(agents[0]?.status).toBe("working");
	});

	it("getAgent() validates and transforms a single agent", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				agent: {
					agent_id: "agent-1",
					display_name: "My Agent",
					agent_status: "idle",
				},
			}),
		);

		const agent = await client.getAgent("agent-1");
		expect(ws.request).toHaveBeenCalledWith("agent.get", { agentId: "agent-1" });
		expect(agent.id).toBe("agent-1");
		expect(agent.name).toBe("My Agent");
		expect(agent.status).toBe("idle");
		expect(agent.model).toBe("unknown"); // optional field missing -> default
	});

	it("getHealth() validates and transforms health response", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				status: "healthy",
				uptime: 3600,
				version: "1.2.3",
				agent_count: 5,
			}),
		);

		const health = await client.getHealth();
		expect(ws.request).toHaveBeenCalledWith("health", {});
		expect(health).toEqual({
			status: "healthy",
			uptime: 3600,
			version: "1.2.3",
			agentCount: 5,
		});
	});

	it("sendMessage() sends with idempotencyKey", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({}),
		);

		await client.sendMessage("agent-1", "Hello!", "session-1");

		expect(ws.request).toHaveBeenCalledWith("agent.send", {
			agentId: "agent-1",
			message: "Hello!",
			sessionId: "session-1",
			idempotencyKey: expect.any(String),
		});
	});

	it("getConfig() returns data in local mode", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws, "local");

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				gateway_port: 18789,
				data_dir: "/home/user/.openclaw",
				log_level: "info",
			}),
		);

		const result = await client.getConfig();
		expect(result.available).toBe(true);
		if (result.available) {
			expect(result.data.gatewayPort).toBe(18789);
			expect(result.data.dataDir).toBe("/home/user/.openclaw");
			expect(result.data.logLevel).toBe("info");
		}
	});

	it("getConfig() returns unavailable in remote mode", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws, "remote");

		const result = await client.getConfig();
		expect(result.available).toBe(false);
		if (!result.available) {
			expect(result.reason).toBe("remote-mode");
		}
		expect(ws.request).not.toHaveBeenCalled();
	});

	it("getSessions() validates and transforms session list", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				sessions: [
					{
						session_id: "s1",
						agent_id: "a1",
						started_at: "2026-01-15T10:00:00Z",
						message_count: 42,
					},
				],
			}),
		);

		const sessions = await client.getSessions("a1");
		expect(ws.request).toHaveBeenCalledWith("sessions.list", { agentId: "a1" });
		expect(sessions).toHaveLength(1);
		expect(sessions[0]).toEqual({
			id: "s1",
			agentId: "a1",
			startedAt: new Date("2026-01-15T10:00:00Z"),
			messageCount: 42,
		});
	});

	it("throws on invalid gateway response data (Zod validation)", async () => {
		const ws = createMockWs();
		const client = new GatewayClient(ws);

		vi.mocked(ws.request).mockResolvedValue(
			mockResponse({
				agents: [{ invalid_shape: true }],
			}),
		);

		await expect(client.getAgents()).rejects.toThrow();
	});
});
