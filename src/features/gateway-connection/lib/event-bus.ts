/**
 * Typed pub/sub Event Bus for routing gateway events and internal signals.
 *
 * Supports:
 * - Typed event subscriptions with known event payloads
 * - Wildcard matching (e.g., "agent.*" matches "agent.status")
 * - Once-only subscriptions
 * - Cleanup via returned unsubscribe functions
 */

import type { ConnectionMode, ConnectionState } from "../model/types";

/** Known event payloads for type-safe subscriptions */
export type KnownEvents = {
	// Internal WebSocket lifecycle events
	"ws.state": { state: ConnectionState };
	"ws.reconnecting": { attempt: number; maxAttempts: number };
	"ws.failed": { reason: string; attempts: number };
	"ws.connected": { mode: ConnectionMode };

	// Gateway agent events
	"agent.status": { agentId: string; status: string };
	"agent.created": { agentId: string; name: string };
	"agent.deleted": { agentId: string };

	// Gateway chat streaming events
	"chat.stream.start": { sessionId: string; messageId: string };
	"chat.stream.token": { sessionId: string; messageId: string; token: string };
	"chat.stream.end": { sessionId: string; messageId: string; fullText: string };

	// Gateway execution events
	"exec.approval.requested": {
		agentId: string;
		approvalId: string;
		command: string;
	};
	"exec.approval.resolved": { agentId: string; approvalId: string; approved: boolean };

	// Gateway system events
	"system-presence": { agents: string[] };
};

/**
 * Full event map: known events with specific payloads,
 * plus any unknown gateway events with generic payload.
 */
export type EventMap = KnownEvents & Record<string, Record<string, unknown>>;

type EventHandler<P = Record<string, unknown>> = (payload: P) => void;
type Unsubscribe = () => void;

// biome-ignore lint/suspicious/noExplicitAny: handlers map stores heterogeneous handler types
type AnyHandler = EventHandler<any>;

export class EventBus {
	private listeners = new Map<string, Set<AnyHandler>>();

	/**
	 * Subscribe to an event. Returns an unsubscribe function.
	 *
	 * @example
	 * const unsub = eventBus.on('agent.status', ({ agentId, status }) => {
	 *   console.log(`Agent ${agentId} is now ${status}`);
	 * });
	 * // Later: unsub();
	 */
	on<K extends keyof KnownEvents>(event: K, handler: EventHandler<KnownEvents[K]>): Unsubscribe;
	on(event: string, handler: EventHandler): Unsubscribe;
	on(event: string, handler: AnyHandler): Unsubscribe {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		const handlers = this.listeners.get(event);
		handlers?.add(handler);

		return () => {
			handlers?.delete(handler);
			if (handlers?.size === 0) {
				this.listeners.delete(event);
			}
		};
	}

	/**
	 * Unsubscribe a handler from an event.
	 */
	off(event: string, handler: AnyHandler): void {
		const handlers = this.listeners.get(event);
		if (handlers) {
			handlers.delete(handler);
			if (handlers.size === 0) {
				this.listeners.delete(event);
			}
		}
	}

	/**
	 * Emit an event to all subscribed handlers, including wildcard matches.
	 *
	 * Wildcard: subscribing to "agent.*" will receive events for
	 * "agent.status", "agent.created", etc.
	 */
	emit<K extends keyof KnownEvents>(event: K, payload: KnownEvents[K]): void;
	emit(event: string, payload: Record<string, unknown>): void;
	emit(event: string, payload: Record<string, unknown>): void {
		// Dispatch to exact match handlers
		this.listeners.get(event)?.forEach((handler) => handler(payload));

		// Dispatch to wildcard handlers (e.g., "agent.*" matches "agent.status")
		const parts = event.split(".");
		for (let i = parts.length - 1; i > 0; i--) {
			const wildcard = `${parts.slice(0, i).join(".")}.*`;
			this.listeners.get(wildcard)?.forEach((handler) => handler(payload));
		}
	}

	/**
	 * Subscribe to an event for a single emission only.
	 * The handler is automatically removed after being called once.
	 */
	once<K extends keyof KnownEvents>(
		event: K,
		handler: EventHandler<KnownEvents[K]>,
	): Unsubscribe;
	once(event: string, handler: EventHandler): Unsubscribe;
	once(event: string, handler: AnyHandler): Unsubscribe {
		const wrappedHandler: AnyHandler = (payload) => {
			unsub();
			handler(payload);
		};
		const unsub = this.on(event, wrappedHandler);
		return unsub;
	}

	/**
	 * Remove all listeners. Useful for cleanup in tests.
	 */
	clear(): void {
		this.listeners.clear();
	}

	/**
	 * Get the number of listeners for a specific event (for debugging/testing).
	 */
	listenerCount(event: string): number {
		return this.listeners.get(event)?.size ?? 0;
	}
}
