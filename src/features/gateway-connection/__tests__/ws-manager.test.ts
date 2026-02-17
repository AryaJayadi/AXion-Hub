/**
 * WebSocketManager tests.
 *
 * Uses a mock WebSocket class to test state transitions,
 * three-phase handshake, request/response matching, and reconnection.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../lib/event-bus";
import { WebSocketManager } from "../lib/ws-manager";

// -- Mock WebSocket --

let mockWsInstance: MockWebSocket | null = null;

class MockWebSocket {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;

	readyState = MockWebSocket.OPEN;
	onopen: (() => void) | null = null;
	onmessage: ((event: { data: string }) => void) | null = null;
	onclose: ((event: { wasClean: boolean; code: number }) => void) | null = null;
	onerror: (() => void) | null = null;

	sent: string[] = [];

	constructor(_url: string) {
		mockWsInstance = this;
		// Simulate async open
		queueMicrotask(() => {
			this.onopen?.();
		});
	}

	send(data: string): void {
		this.sent.push(data);
	}

	close(_code?: number, _reason?: string): void {
		this.readyState = MockWebSocket.CLOSED;
	}

	// Test helpers
	simulateMessage(data: unknown): void {
		this.onmessage?.({ data: JSON.stringify(data) });
	}

	simulateClose(wasClean: boolean, code = 1006): void {
		this.onclose?.({ wasClean, code });
	}
}

/** Helper: complete the three-phase handshake on the mock */
function completeHandshake(ws: MockWebSocket): void {
	// 1. Gateway sends connect.challenge
	ws.simulateMessage({ type: "event", event: "connect.challenge", payload: {} });

	// 2. Client sent a connect request -- get its ID
	const connectReq = JSON.parse(ws.sent[0] as string);

	// 3. Gateway sends hello-ok
	ws.simulateMessage({
		type: "res",
		id: connectReq.id,
		ok: true,
		payload: { auth: { deviceToken: "dt-123" } },
	});
}

describe("WebSocketManager", () => {
	let eventBus: EventBus;
	let manager: WebSocketManager;

	beforeEach(() => {
		eventBus = new EventBus();
		manager = new WebSocketManager(eventBus);
		vi.stubGlobal("WebSocket", MockWebSocket);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		eventBus.clear();
		mockWsInstance = null;
	});

	it("starts in disconnected state", () => {
		expect(manager.state).toBe("disconnected");
	});

	it("transitions to connecting on connect()", () => {
		const stateChanges: string[] = [];
		eventBus.on("ws.state", ({ state }) => stateChanges.push(state));

		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		expect(manager.state).toBe("connecting");
		expect(stateChanges).toContain("connecting");
	});

	it("transitions to authenticating on WebSocket open", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });

		await vi.waitFor(() => {
			expect(manager.state).toBe("authenticating");
		});
	});

	it("sends connect request on connect.challenge event", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const ws = mockWsInstance!;
		ws.simulateMessage({
			type: "event",
			event: "connect.challenge",
			payload: { version: "1.0" },
		});

		expect(ws.sent.length).toBe(1);
		const sent = JSON.parse(ws.sent[0] as string);
		expect(sent.type).toBe("req");
		expect(sent.method).toBe("connect");
		expect(sent.params.role).toBe("operator");
		expect(sent.params.auth.token).toBe("tok");
	});

	it("transitions to connected on hello-ok response", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		completeHandshake(mockWsInstance!);
		expect(manager.state).toBe("connected");
	});

	it("dispatches gateway events to the Event Bus", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const handler = vi.fn();
		eventBus.on("agent.status", handler);

		mockWsInstance!.simulateMessage({
			type: "event",
			event: "agent.status",
			payload: { agentId: "a1", status: "online" },
		});

		expect(handler).toHaveBeenCalledWith({ agentId: "a1", status: "online" });
	});

	it("resolves pending requests on matching response", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const ws = mockWsInstance!;
		completeHandshake(ws);
		expect(manager.state).toBe("connected");

		// Now send a request
		const resultPromise = manager.request("agent.list", {});

		// The request should have been sent immediately (state is connected)
		const agentReqIdx = ws.sent.length - 1;
		const agentReq = JSON.parse(ws.sent[agentReqIdx] as string);
		expect(agentReq.method).toBe("agent.list");

		// Simulate response
		ws.simulateMessage({
			type: "res",
			id: agentReq.id,
			ok: true,
			payload: { agents: [] },
		});

		const result = await resultPromise;
		expect(result.ok).toBe(true);
		expect(result.payload).toEqual({ agents: [] });
	});

	it("rejects pending requests on error response", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const ws = mockWsInstance!;
		completeHandshake(ws);

		const resultPromise = manager.request("agent.get", { agentId: "bad-id" });
		const agentReqIdx = ws.sent.length - 1;
		const agentReq = JSON.parse(ws.sent[agentReqIdx] as string);

		ws.simulateMessage({
			type: "res",
			id: agentReq.id,
			ok: false,
			error: { code: "NOT_FOUND", message: "Agent not found" },
		});

		await expect(resultPromise).rejects.toThrow("Agent not found");
	});

	it("queues requests when not connected and flushes on connect", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const ws = mockWsInstance!;

		// Request before connected -- should be queued
		const _resultPromise = manager.request("health", {});

		// Before challenge, only queued, not sent
		const sentBeforeChallenge = ws.sent.length;
		expect(sentBeforeChallenge).toBe(0);

		// Complete handshake -- queued request should flush
		completeHandshake(ws);

		// connect request + health request
		expect(ws.sent.length).toBe(2);
		const healthReq = JSON.parse(ws.sent[1] as string);
		expect(healthReq.method).toBe("health");
	});

	it("transitions to disconnected on disconnect()", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		manager.disconnect();
		expect(manager.state).toBe("disconnected");
	});

	it("rejects all pending requests on disconnect()", async () => {
		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		const ws = mockWsInstance!;
		completeHandshake(ws);

		const p = manager.request("agent.list", {});
		manager.disconnect();

		await expect(p).rejects.toThrow("Connection closed");
	});

	it("handles invalid gateway frames gracefully without crashing", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		// Send invalid JSON
		mockWsInstance!.onmessage?.({ data: "not valid json" });

		expect(consoleSpy).toHaveBeenCalled();
		expect(manager.state).toBe("authenticating"); // State unchanged
		consoleSpy.mockRestore();
	});

	it("emits ws.connected event with mode on successful connection", async () => {
		const handler = vi.fn();
		eventBus.on("ws.connected", handler);

		manager.connect({ url: "ws://test", token: "tok", mode: "local" });
		await vi.waitFor(() => expect(manager.state).toBe("authenticating"));

		completeHandshake(mockWsInstance!);

		expect(handler).toHaveBeenCalledWith({ mode: "local" });
	});
});
