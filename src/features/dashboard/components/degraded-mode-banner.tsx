"use client";

import { AlertTriangle } from "lucide-react";
import { useIsConnected, useConnectionError } from "@/features/gateway-connection";

/**
 * Persistent degraded-mode banner shown when the gateway is disconnected.
 *
 * Per locked decision: "Gateway disconnect triggers a persistent degraded-mode
 * banner ('Gateway disconnected -- showing last known state') with stale data
 * indicators on affected widgets, not an overlay"
 *
 * Returns null when connected.
 */
export function DegradedModeBanner() {
	const isConnected = useIsConnected();
	const error = useConnectionError();

	if (isConnected) {
		return null;
	}

	return (
		<div
			role="alert"
			className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3"
		>
			<AlertTriangle className="size-5 shrink-0 text-warning" />
			<div className="flex flex-col gap-0.5">
				<p className="text-sm font-medium text-warning">
					Gateway disconnected &mdash; showing last known state
				</p>
				{error && (
					<p className="text-xs text-muted-foreground">{error}</p>
				)}
			</div>
		</div>
	);
}
