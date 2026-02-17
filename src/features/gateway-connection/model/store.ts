/**
 * Zustand connection store for real-time WebSocket state.
 *
 * This store reflects the current gateway connection state, updated
 * in real time via Event Bus subscriptions. It provides:
 * - Connection state machine position (disconnected, connecting, etc.)
 * - Connection mode (local vs remote)
 * - Reconnection progress (attempt count, max attempts)
 * - Error information
 * - Manual retry and disconnect actions
 *
 * PUSH state pattern: Event Bus events update this store directly.
 * No polling, no REST calls -- WebSocket events drive state.
 */

import { create } from "zustand";
import type { ConnectionMode, ConnectionState } from "./types";
import type { EventBus } from "../lib/event-bus";
import type { WebSocketManager } from "../lib/ws-manager";

interface ConnectionStore {
	// State
	state: ConnectionState;
	mode: ConnectionMode;
	reconnectAttempt: number;
	maxAttempts: number;
	error: string | null;

	// Internal refs (not reactive -- set once)
	_wsManager: WebSocketManager | null;

	// Actions
	retry: () => void;
	disconnect: () => void;
	setWsManager: (manager: WebSocketManager) => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
	state: "disconnected",
	mode: "local",
	reconnectAttempt: 0,
	maxAttempts: 5,
	error: null,
	_wsManager: null,

	retry: () => {
		const manager = get()._wsManager;
		if (manager) {
			manager.retry();
		}
	},

	disconnect: () => {
		const manager = get()._wsManager;
		if (manager) {
			manager.disconnect();
		}
	},

	setWsManager: (manager) => set({ _wsManager: manager }),
}));

/**
 * Initialize Event Bus subscriptions that keep the connection store
 * in sync with WebSocket lifecycle events.
 *
 * Call once at app startup (from GatewayProvider). Returns a cleanup
 * function that removes all subscriptions.
 *
 * Events handled:
 * - ws.state -> updates connection state
 * - ws.reconnecting -> updates attempt/maxAttempts
 * - ws.failed -> sets error reason
 * - ws.connected -> sets mode, clears error and reconnect counter
 */
export function initConnectionStoreSubscriptions(
	eventBus: EventBus,
): () => void {
	const unsubs: Array<() => void> = [];

	unsubs.push(
		eventBus.on("ws.state", ({ state }) => {
			useConnectionStore.setState({ state });
		}),
	);

	unsubs.push(
		eventBus.on("ws.reconnecting", ({ attempt, maxAttempts }) => {
			useConnectionStore.setState({
				reconnectAttempt: attempt,
				maxAttempts,
			});
		}),
	);

	unsubs.push(
		eventBus.on("ws.failed", ({ reason }) => {
			useConnectionStore.setState({ error: reason });
		}),
	);

	unsubs.push(
		eventBus.on("ws.connected", ({ mode }) => {
			useConnectionStore.setState({
				mode,
				error: null,
				reconnectAttempt: 0,
			});
		}),
	);

	// Return cleanup function
	return () => unsubs.forEach((fn) => fn());
}
