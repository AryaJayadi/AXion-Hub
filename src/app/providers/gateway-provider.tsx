"use client";

/**
 * Gateway Provider: initializes the WebSocket stack and wires it to React.
 *
 * Creates the full gateway communication stack (EventBus, WebSocketManager,
 * GatewayClient) once on mount, subscribes the connection store to Event Bus
 * events, and provides the gateway client + event bus via React context.
 *
 * In Phase 1 this will likely fail to connect (no gateway running), which is
 * expected. The connection state will show 'disconnected' or 'failed', and
 * the UI will show appropriate status when built in later phases.
 */

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import { createGatewayStack } from "@/features/gateway-connection";
import {
	initConnectionStoreSubscriptions,
	useConnectionStore,
} from "@/features/gateway-connection/model/store";
import { initDashboardStoreSubscriptions, initActivityStoreSubscriptions } from "@/features/dashboard";
import { initAgentStoreSubscriptions } from "@/features/agents";
import { initMissionStoreSubscriptions } from "@/features/missions";
import type { GatewayClient } from "@/features/gateway-connection/lib/gateway-client";
import type { EventBus } from "@/features/gateway-connection/lib/event-bus";

interface GatewayContextValue {
	gatewayClient: GatewayClient;
	eventBus: EventBus;
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

/**
 * Access the gateway client and event bus from within the GatewayProvider tree.
 *
 * @throws Error if used outside GatewayProvider
 *
 * @example
 * const { gatewayClient, eventBus } = useGateway();
 * const agents = await gatewayClient.getAgents();
 */
export function useGateway(): GatewayContextValue {
	const ctx = useContext(GatewayContext);
	if (!ctx) {
		throw new Error("useGateway must be used within GatewayProvider");
	}
	return ctx;
}

export function GatewayProvider({ children }: { children: ReactNode }) {
	const stackRef = useRef<ReturnType<typeof createGatewayStack> | null>(
		null,
	);

	// Initialize once (ref persists across renders, not recreated)
	if (!stackRef.current) {
		stackRef.current = createGatewayStack({
			url:
				process.env.NEXT_PUBLIC_GATEWAY_URL ??
				"ws://localhost:18789",
			token: "", // Token will be set after auth in Phase 2
			mode:
				(process.env.NEXT_PUBLIC_AXION_MODE as
					| "local"
					| "remote") ?? "local",
		});
	}

	const { eventBus, wsManager, gatewayClient } = stackRef.current;

	useEffect(() => {
		// Wire connection store to event bus
		const cleanup = initConnectionStoreSubscriptions(eventBus);

		// Wire dashboard, activity, and agent stores to event bus
		const cleanupDashboard = initDashboardStoreSubscriptions(eventBus);
		const cleanupActivity = initActivityStoreSubscriptions(eventBus);
		initAgentStoreSubscriptions(eventBus); // No cleanup returned (uses permanent subscriptions)
		const cleanupMissions = initMissionStoreSubscriptions(eventBus);

		// Store wsManager ref for retry/disconnect actions
		useConnectionStore.getState().setWsManager(wsManager);

		// Auto-connect if we have a gateway URL configured
		// In Phase 1, this may not connect (no gateway running) -- that is fine.
		// The connection state will stay 'disconnected' or 'failed'.
		const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
		if (gatewayUrl) {
			try {
				wsManager.connect({
					url: gatewayUrl,
					token: "",
					mode:
						(process.env.NEXT_PUBLIC_AXION_MODE as
							| "local"
							| "remote") ?? "local",
				});
			} catch {
				// Connection failure is expected if no gateway is running
			}
		}

		return () => {
			cleanup();
			cleanupDashboard();
			cleanupActivity();
			cleanupMissions();
			wsManager.disconnect();
		};
	}, [eventBus, wsManager]);

	return (
		<GatewayContext.Provider value={{ gatewayClient, eventBus }}>
			{children}
		</GatewayContext.Provider>
	);
}
