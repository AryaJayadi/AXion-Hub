import { afterEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "../lib/event-bus";

describe("EventBus", () => {
	let bus: EventBus;

	afterEach(() => {
		bus?.clear();
	});

	it("dispatches events to exact match subscribers", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("ws.state", handler);
		bus.emit("ws.state", { state: "connected" });

		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith({ state: "connected" });
	});

	it("supports multiple handlers for the same event", () => {
		bus = new EventBus();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		bus.on("agent.status", handler1);
		bus.on("agent.status", handler2);
		bus.emit("agent.status", { agentId: "a1", status: "online" });

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it("supports wildcard subscriptions", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("agent.*", handler);
		bus.emit("agent.status", { agentId: "a1", status: "online" });
		bus.emit("agent.created", { agentId: "a2", name: "Test Agent" });

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it("does not dispatch unrelated events to wildcard subscribers", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("agent.*", handler);
		bus.emit("ws.state", { state: "connected" });

		expect(handler).not.toHaveBeenCalled();
	});

	it("supports multi-level wildcard matching", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("chat.*", handler);
		bus.emit("chat.stream.token", { sessionId: "s1", messageId: "m1", token: "hello" });

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("returns unsubscribe function from on()", () => {
		bus = new EventBus();
		const handler = vi.fn();

		const unsub = bus.on("ws.state", handler);
		bus.emit("ws.state", { state: "connecting" });
		expect(handler).toHaveBeenCalledTimes(1);

		unsub();
		bus.emit("ws.state", { state: "connected" });
		expect(handler).toHaveBeenCalledTimes(1); // not called again
	});

	it("supports off() to remove a handler", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("ws.state", handler);
		bus.off("ws.state", handler);
		bus.emit("ws.state", { state: "connected" });

		expect(handler).not.toHaveBeenCalled();
	});

	it("supports once() for single-emission subscriptions", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.once("ws.connected", handler);
		bus.emit("ws.connected", { mode: "local" });
		bus.emit("ws.connected", { mode: "remote" });

		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith({ mode: "local" });
	});

	it("reports listener count correctly", () => {
		bus = new EventBus();
		const h1 = vi.fn();
		const h2 = vi.fn();

		expect(bus.listenerCount("ws.state")).toBe(0);

		bus.on("ws.state", h1);
		expect(bus.listenerCount("ws.state")).toBe(1);

		bus.on("ws.state", h2);
		expect(bus.listenerCount("ws.state")).toBe(2);

		bus.off("ws.state", h1);
		expect(bus.listenerCount("ws.state")).toBe(1);
	});

	it("handles emission to events with no subscribers gracefully", () => {
		bus = new EventBus();
		// Should not throw
		expect(() =>
			bus.emit("ws.state", { state: "disconnected" }),
		).not.toThrow();
	});

	it("cleans up empty listener sets", () => {
		bus = new EventBus();
		const handler = vi.fn();

		const unsub = bus.on("ws.state", handler);
		expect(bus.listenerCount("ws.state")).toBe(1);

		unsub();
		expect(bus.listenerCount("ws.state")).toBe(0);
	});

	it("handles unknown gateway events with string keys", () => {
		bus = new EventBus();
		const handler = vi.fn();

		bus.on("some.unknown.event", handler);
		bus.emit("some.unknown.event", { data: "value" });

		expect(handler).toHaveBeenCalledWith({ data: "value" });
	});
});
