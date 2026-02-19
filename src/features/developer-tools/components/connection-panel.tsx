"use client";

import { useCallback, useRef } from "react";
import { Plug, PlugZap } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";
import { usePlaygroundStore } from "../model/playground-store";
import type { PlaygroundConnectionState } from "../model/playground-store";
import {
	createPlaygroundConnection,
	type PlaygroundConnection,
} from "../lib/playground-ws-manager";
import { nanoid } from "nanoid";

const STATE_LABELS: Record<PlaygroundConnectionState, string> = {
	disconnected: "Disconnected",
	connecting: "Connecting...",
	connected: "Connected",
	error: "Error",
};

const STATE_VARIANTS: Record<
	PlaygroundConnectionState,
	"default" | "secondary" | "destructive" | "outline"
> = {
	disconnected: "secondary",
	connecting: "outline",
	connected: "default",
	error: "destructive",
};

interface ConnectionPanelProps {
	/** Ref to the active playground connection, managed by parent. */
	connectionRef: React.RefObject<PlaygroundConnection | null>;
}

export function ConnectionPanel({ connectionRef }: ConnectionPanelProps) {
	const url = usePlaygroundStore((s) => s.url);
	const token = usePlaygroundStore((s) => s.token);
	const connectionState = usePlaygroundStore((s) => s.connectionState);
	const setUrl = usePlaygroundStore((s) => s.setUrl);
	const setToken = usePlaygroundStore((s) => s.setToken);
	const setConnectionState = usePlaygroundStore((s) => s.setConnectionState);
	const addEvent = usePlaygroundStore((s) => s.addEvent);
	const setError = usePlaygroundStore((s) => s.setError);

	const isConnected = connectionState === "connected";
	const isConnecting = connectionState === "connecting";

	const handleConnect = useCallback(() => {
		setError(null);

		const connection = createPlaygroundConnection(
			url,
			token,
			// onMessage
			(data: string) => {
				let type: "res" | "event" = "event";
				try {
					const parsed = JSON.parse(data) as { type?: string };
					if (parsed.type === "res") type = "res";
					if (parsed.type === "event") type = "event";
				} catch {
					// non-JSON payload, treat as event
				}

				addEvent({
					id: nanoid(),
					timestamp: new Date(),
					direction: "received",
					type,
					raw: data,
				});
			},
			// onStateChange
			(state) => {
				if (state === "error") {
					setError("Connection failed");
				}
				setConnectionState(state as PlaygroundConnectionState);
			},
		);

		(connectionRef as React.MutableRefObject<PlaygroundConnection | null>).current = connection;
	}, [url, token, connectionRef, setConnectionState, addEvent, setError]);

	const handleDisconnect = useCallback(() => {
		connectionRef.current?.disconnect();
		(connectionRef as React.MutableRefObject<PlaygroundConnection | null>).current = null;
	}, [connectionRef]);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<Input
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				placeholder="ws://127.0.0.1:18789"
				className="flex-1 font-mono text-sm"
				disabled={isConnected || isConnecting}
			/>
			<Input
				type="password"
				value={token}
				onChange={(e) => setToken(e.target.value)}
				placeholder="Auth token (optional)"
				className="w-full sm:w-48 font-mono text-sm"
				disabled={isConnected || isConnecting}
			/>
			<div className="flex items-center gap-2">
				{isConnected ? (
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDisconnect}
					>
						<PlugZap className="mr-1.5 size-4" />
						Disconnect
					</Button>
				) : (
					<Button
						size="sm"
						onClick={handleConnect}
						disabled={isConnecting || !url}
					>
						<Plug className="mr-1.5 size-4" />
						{isConnecting ? "Connecting..." : "Connect"}
					</Button>
				)}
				<Badge
					variant={STATE_VARIANTS[connectionState]}
					className={cn(
						"whitespace-nowrap",
						connectionState === "connected" && "bg-emerald-600 text-white",
					)}
				>
					{STATE_LABELS[connectionState]}
				</Badge>
			</div>
		</div>
	);
}
