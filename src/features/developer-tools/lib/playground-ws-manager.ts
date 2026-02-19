/**
 * Standalone WebSocket manager for the Developer Tools Playground.
 *
 * CRITICAL: This creates an INDEPENDENT WebSocket connection, NOT
 * reusing the app's singleton from GatewayProvider (per research
 * Pitfall 4). The playground connection is isolated so developer
 * testing does not interfere with production connections.
 *
 * Uses raw WebSocket rather than the full WebSocketManager class
 * to keep the playground lightweight and free from the gateway's
 * three-phase auth handshake (playground manages its own connect).
 */

import { nanoid } from "nanoid";

export interface PlaygroundConnection {
	/** Send a raw JSON string through the WebSocket. */
	send: (data: string) => void;
	/** Close the WebSocket connection. */
	disconnect: () => void;
}

type ConnectionStateValue = "connecting" | "connected" | "disconnected" | "error";

/**
 * Create a standalone playground WebSocket connection.
 *
 * @param url - Gateway WebSocket URL (e.g., ws://127.0.0.1:18789)
 * @param token - Optional auth token for the connect handshake
 * @param onMessage - Called with raw data string for each incoming message
 * @param onStateChange - Called when connection state changes
 * @returns Object with send() and disconnect() methods
 */
export function createPlaygroundConnection(
	url: string,
	token: string,
	onMessage: (data: string) => void,
	onStateChange: (state: ConnectionStateValue) => void,
): PlaygroundConnection {
	onStateChange("connecting");

	const ws = new WebSocket(url);

	ws.onopen = () => {
		onStateChange("connected");

		// If token provided, send a connect handshake frame
		if (token) {
			const connectFrame = JSON.stringify({
				type: "req",
				id: nanoid(),
				method: "connect",
				params: { token },
			});
			ws.send(connectFrame);
		}
	};

	ws.onmessage = (event: MessageEvent) => {
		onMessage(event.data as string);
	};

	ws.onclose = () => {
		onStateChange("disconnected");
	};

	ws.onerror = () => {
		onStateChange("error");
	};

	return {
		send: (data: string) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(data);
			}
		},
		disconnect: () => {
			ws.onclose = null; // Prevent onStateChange on intentional close
			ws.close(1000, "Playground disconnect");
			onStateChange("disconnected");
		},
	};
}
