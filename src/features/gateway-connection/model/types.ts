/**
 * Connection state machine types for the WebSocket Manager.
 *
 * State transitions:
 *   disconnected -> connecting -> authenticating -> connected
 *   connected -> reconnecting -> connecting (on unclean close)
 *   reconnecting -> failed (after max attempts)
 *   failed -> connecting (on manual retry)
 */

export type ConnectionState =
	| "disconnected"
	| "connecting"
	| "authenticating"
	| "connected"
	| "reconnecting"
	| "failed";

/** Dual-mode connection: local has filesystem access, remote is WS-only */
export type ConnectionMode = "local" | "remote";

/** Configuration for establishing a gateway connection */
export interface ConnectionConfig {
	/** WebSocket URL (e.g., ws://127.0.0.1:18789) */
	url: string;
	/** Authentication token */
	token: string;
	/** Connection mode: local (filesystem + WS) or remote (WS only) */
	mode: ConnectionMode;
	/** Max reconnection attempts before entering failed state (default: 5) */
	maxReconnectAttempts?: number | undefined;
	/** Request timeout in milliseconds (default: 30000) */
	requestTimeout?: number | undefined;
}

/** Pending request awaiting a response from the gateway */
export interface PendingRequest {
	resolve: (response: import("@/entities/gateway-event").GatewayResponse) => void;
	reject: (error: Error) => void;
	timeout: ReturnType<typeof setTimeout>;
}
