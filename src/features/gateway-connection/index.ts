// Gateway connection feature -- barrel export

// Core classes
export { WebSocketManager } from "./lib/ws-manager";
export { EventBus } from "./lib/event-bus";
export { GatewayClient } from "./lib/gateway-client";
export { ReconnectStrategy } from "./lib/reconnect";

// State management
export { useConnectionStore, initConnectionStoreSubscriptions } from "./model/store";
export {
	useConnectionState,
	useIsConnected,
	useIsReconnecting,
	useConnectionMode,
	useReconnectInfo,
	useConnectionError,
	useRetryConnection,
} from "./model/hooks";

// Types
export type {
	ConnectionState,
	ConnectionMode,
	ConnectionConfig,
	PendingRequest,
} from "./model/types";

// Event types
export type { KnownEvents, EventMap } from "./lib/event-bus";

// Gateway client domain types
export type {
	Agent,
	AgentStatus,
	GatewayHealth,
	GatewayConfig,
	Session,
	ModeAwareResult,
} from "./lib/gateway-client";

// -- Factory --

import type { ConnectionConfig } from "./model/types";
import { EventBus } from "./lib/event-bus";
import { WebSocketManager } from "./lib/ws-manager";
import { GatewayClient } from "./lib/gateway-client";

export interface GatewayStack {
	eventBus: EventBus;
	wsManager: WebSocketManager;
	gatewayClient: GatewayClient;
}

/**
 * Create the full gateway communication stack.
 *
 * @param config - Connection configuration (url, token, mode)
 * @returns Object with eventBus, wsManager, and gatewayClient
 *
 * @example
 * const { eventBus, wsManager, gatewayClient } = createGatewayStack({
 *   url: 'ws://127.0.0.1:18789',
 *   token: 'my-auth-token',
 *   mode: 'local',
 * });
 *
 * // Subscribe to events
 * eventBus.on('agent.status', ({ agentId, status }) => {
 *   console.log(`Agent ${agentId}: ${status}`);
 * });
 *
 * // Connect
 * wsManager.connect(config);
 *
 * // Use the client
 * const agents = await gatewayClient.getAgents();
 */
export function createGatewayStack(config: ConnectionConfig): GatewayStack {
	const eventBus = new EventBus();
	const wsManager = new WebSocketManager(eventBus, {
		maxReconnectAttempts: config.maxReconnectAttempts,
	});
	const gatewayClient = new GatewayClient(wsManager, config.mode);

	return { eventBus, wsManager, gatewayClient };
}
