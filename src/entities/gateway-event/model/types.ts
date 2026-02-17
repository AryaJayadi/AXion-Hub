/**
 * Gateway frame types for the OpenClaw Gateway JSON-RPC protocol.
 *
 * The gateway uses raw WebSocket (NOT Socket.IO) with three frame types:
 * - req: client-to-gateway request
 * - res: gateway-to-client response
 * - event: gateway-to-client push event
 */

/** Client-to-gateway request frame */
export type GatewayRequest = {
	type: "req";
	id: string;
	method: string;
	params: unknown;
};

/** Gateway-to-client response frame */
export type GatewayResponse = {
	type: "res";
	id: string;
	ok: boolean;
	payload?: Record<string, unknown> | undefined;
	error?: { code: string; message: string } | undefined;
};

/** Gateway-to-client push event frame */
export type GatewayEvent = {
	type: "event";
	event: string;
	payload: Record<string, unknown>;
};

/** Discriminated union of all gateway frame types */
export type GatewayFrame = GatewayRequest | GatewayResponse | GatewayEvent;

/**
 * Known gateway event types for type-safe subscriptions.
 * The gateway may send events not in this list -- handle gracefully.
 */
export type KnownGatewayEventType =
	| "connect.challenge"
	| "agent.status"
	| "agent.created"
	| "agent.deleted"
	| "chat.stream.start"
	| "chat.stream.token"
	| "chat.stream.end"
	| "exec.approval.requested"
	| "exec.approval.resolved"
	| "system-presence";

/** Known gateway RPC methods */
export type KnownGatewayMethod =
	| "connect"
	| "agent.list"
	| "agent.get"
	| "agent.send"
	| "health"
	| "config.get"
	| "sessions.list";
