import { describe, expect, it } from "vitest";
import { parseGatewayFrame } from "../lib/parser";

describe("parseGatewayFrame", () => {
	it("parses a valid request frame", () => {
		const frame = parseGatewayFrame({
			type: "req",
			id: "abc123",
			method: "agent.list",
			params: {},
		});
		expect(frame.type).toBe("req");
		if (frame.type === "req") {
			expect(frame.id).toBe("abc123");
			expect(frame.method).toBe("agent.list");
		}
	});

	it("parses a valid response frame with payload", () => {
		const frame = parseGatewayFrame({
			type: "res",
			id: "abc123",
			ok: true,
			payload: { agents: [] },
		});
		expect(frame.type).toBe("res");
		if (frame.type === "res") {
			expect(frame.ok).toBe(true);
			expect(frame.payload).toEqual({ agents: [] });
		}
	});

	it("parses a valid response frame with error", () => {
		const frame = parseGatewayFrame({
			type: "res",
			id: "abc123",
			ok: false,
			error: { code: "NOT_FOUND", message: "Agent not found" },
		});
		expect(frame.type).toBe("res");
		if (frame.type === "res") {
			expect(frame.ok).toBe(false);
			expect(frame.error?.code).toBe("NOT_FOUND");
		}
	});

	it("parses a valid event frame", () => {
		const frame = parseGatewayFrame({
			type: "event",
			event: "agent.status",
			payload: { agentId: "agent-1", status: "online" },
		});
		expect(frame.type).toBe("event");
		if (frame.type === "event") {
			expect(frame.event).toBe("agent.status");
			expect(frame.payload).toEqual({ agentId: "agent-1", status: "online" });
		}
	});

	it("passes through unknown fields (forward compatibility)", () => {
		const frame = parseGatewayFrame({
			type: "event",
			event: "agent.status",
			payload: { agentId: "agent-1", status: "online" },
			extraField: "future-gateway-addition",
		});
		expect(frame.type).toBe("event");
		// passthrough allows extra fields
		expect((frame as Record<string, unknown>).extraField).toBe("future-gateway-addition");
	});

	it("throws on invalid frame (missing type)", () => {
		expect(() => parseGatewayFrame({ id: "123", method: "test" })).toThrow(
			"Invalid gateway frame",
		);
	});

	it("throws on invalid frame (wrong type value)", () => {
		expect(() =>
			parseGatewayFrame({ type: "unknown", id: "123" }),
		).toThrow("Invalid gateway frame");
	});

	it("throws on invalid response frame (missing ok field)", () => {
		expect(() =>
			parseGatewayFrame({ type: "res", id: "123" }),
		).toThrow("Invalid gateway frame");
	});

	it("throws on null input", () => {
		expect(() => parseGatewayFrame(null)).toThrow("Invalid gateway frame");
	});

	it("throws on non-object input", () => {
		expect(() => parseGatewayFrame("not an object")).toThrow("Invalid gateway frame");
	});
});
