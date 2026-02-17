/**
 * React hooks for connection state access.
 *
 * Each hook uses a Zustand selector for minimal re-renders --
 * components only re-render when the specific slice they use changes.
 *
 * Usage:
 *   const isConnected = useIsConnected();
 *   const { attempt, maxAttempts } = useReconnectInfo();
 *   const retry = useRetryConnection();
 */

import { useConnectionStore } from "./store";

/** Current connection state (disconnected, connecting, authenticating, connected, reconnecting, failed) */
export const useConnectionState = () =>
	useConnectionStore((s) => s.state);

/** Whether the gateway is currently connected */
export const useIsConnected = () =>
	useConnectionStore((s) => s.state === "connected");

/** Whether the gateway is currently reconnecting */
export const useIsReconnecting = () =>
	useConnectionStore((s) => s.state === "reconnecting");

/** Current connection mode (local or remote) */
export const useConnectionMode = () =>
	useConnectionStore((s) => s.mode);

/** Reconnection progress (current attempt and max attempts) */
export const useReconnectInfo = () =>
	useConnectionStore((s) => ({
		attempt: s.reconnectAttempt,
		maxAttempts: s.maxAttempts,
	}));

/** Current connection error message, or null if no error */
export const useConnectionError = () =>
	useConnectionStore((s) => s.error);

/** Action to manually retry the gateway connection */
export const useRetryConnection = () =>
	useConnectionStore((s) => s.retry);
