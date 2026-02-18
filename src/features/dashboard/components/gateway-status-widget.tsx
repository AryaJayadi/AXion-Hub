"use client";

import { Wifi, WifiOff } from "lucide-react";
import {
	useIsConnected,
	useConnectionState,
	useConnectionError,
	useConnectionMode,
} from "@/features/gateway-connection";
import { StatusBadge } from "@/shared/ui/status-badge";

/**
 * Gateway status widget showing connection state.
 *
 * Displays the current gateway connection as a StatusBadge with
 * connection mode and latency info when available.
 */
export function GatewayStatusWidget() {
	const isConnected = useIsConnected();
	const connectionState = useConnectionState();
	const error = useConnectionError();
	const mode = useConnectionMode();

	const statusLabel = isConnected
		? "Connected"
		: connectionState === "reconnecting"
			? "Reconnecting"
			: "Disconnected";

	const statusKey = isConnected
		? "connected"
		: connectionState === "reconnecting"
			? "degraded"
			: "offline";

	const Icon = isConnected ? Wifi : WifiOff;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<Icon className="size-5 text-muted-foreground" />
				<StatusBadge status={statusKey} label={statusLabel} size="lg" />
			</div>
			<div className="flex flex-col gap-1 text-xs text-muted-foreground">
				<span>
					Mode: <span className="font-medium text-foreground">{mode ?? "local"}</span>
				</span>
			</div>
			{error && (
				<p className="text-xs text-destructive truncate">{error}</p>
			)}
		</div>
	);
}
