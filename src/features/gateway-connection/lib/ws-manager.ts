/**
 * WebSocket Manager for the OpenClaw Gateway.
 *
 * Manages a single raw WebSocket connection, implementing the gateway's
 * custom JSON-RPC protocol with three-phase authentication handshake:
 *
 * 1. Gateway sends `connect.challenge` event after socket opens
 * 2. Client responds with `connect` request (role, scopes, auth token)
 * 3. Gateway responds with hello-ok (auth.deviceToken in payload)
 *
 * CRITICAL: This uses raw WebSocket (NOT Socket.IO). The gateway speaks
 * a custom JSON-RPC protocol with {type:"req"/"res"/"event"} frames.
 */

import { nanoid } from "nanoid";
import type { GatewayFrame, GatewayRequest, GatewayResponse } from "@/entities/gateway-event";
import { parseGatewayFrame } from "@/entities/gateway-event";
import type { ConnectionConfig, PendingRequest } from "../model/types";
import type { ConnectionState } from "../model/types";
import type { EventBus } from "./event-bus";
import { ReconnectStrategy } from "./reconnect";

const DEFAULT_REQUEST_TIMEOUT = 30_000;

export class WebSocketManager {
	private ws: WebSocket | null = null;
	private _state: ConnectionState = "disconnected";
	private pendingRequests = new Map<string, PendingRequest>();
	private messageQueue: GatewayRequest[] = [];
	private reconnectStrategy: ReconnectStrategy;
	private eventBus: EventBus;
	private config: ConnectionConfig | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(eventBus: EventBus, config?: { maxReconnectAttempts?: number | undefined }) {
		this.eventBus = eventBus;
		this.reconnectStrategy = new ReconnectStrategy({
			maxAttempts: config?.maxReconnectAttempts ?? 5,
		});
	}

	/** Current connection state */
	get state(): ConnectionState {
		return this._state;
	}

	/**
	 * Connect to the OpenClaw Gateway.
	 *
	 * Opens a WebSocket connection and waits for the three-phase handshake:
	 * 1. Gateway sends connect.challenge
	 * 2. We respond with connect request (role, scopes, auth)
	 * 3. Gateway responds with hello-ok
	 */
	connect(config: ConnectionConfig): void {
		this.config = config;
		this.setState("connecting");

		const ws = new WebSocket(config.url);
		this.ws = ws;

		ws.onopen = () => {
			// Gateway sends connect.challenge first -- do NOT send anything yet.
			this.setState("authenticating");
		};

		ws.onmessage = (event: MessageEvent) => {
			let frame: GatewayFrame;
			try {
				const data: unknown = JSON.parse(event.data as string);
				frame = parseGatewayFrame(data);
			} catch {
				// Invalid frame -- log and skip. Do not crash the connection.
				console.error("[ws-manager] Failed to parse gateway frame:", event.data);
				return;
			}

			this.handleFrame(frame);
		};

		ws.onclose = (event: CloseEvent) => {
			if (!event.wasClean && this._state !== "failed" && this._state !== "disconnected") {
				this.scheduleReconnect();
			}
		};

		ws.onerror = () => {
			// Let onclose handle reconnection. Just log.
			console.error("[ws-manager] WebSocket error occurred");
		};
	}

	/**
	 * Send a request to the gateway and await the response.
	 *
	 * If not connected, the request is queued and sent after connection
	 * is established.
	 *
	 * @param method - RPC method name (e.g., "agent.list")
	 * @param params - Method parameters
	 * @returns Promise resolving to the gateway response
	 * @throws Error on timeout or gateway error
	 */
	request(method: string, params: unknown = {}): Promise<GatewayResponse> {
		const id = nanoid();
		const requestFrame: GatewayRequest = { type: "req", id, method, params };
		const timeout = this.config?.requestTimeout ?? DEFAULT_REQUEST_TIMEOUT;

		return new Promise<GatewayResponse>((resolve, reject) => {
			const timeoutHandle = setTimeout(() => {
				this.pendingRequests.delete(id);
				reject(new Error(`Request "${method}" timed out after ${timeout}ms`));
			}, timeout);

			this.pendingRequests.set(id, {
				resolve,
				reject,
				timeout: timeoutHandle,
			});

			if (this._state === "connected") {
				this.sendRaw(requestFrame);
			} else {
				this.messageQueue.push(requestFrame);
			}
		});
	}

	/**
	 * Gracefully disconnect from the gateway.
	 *
	 * Closes the WebSocket with code 1000 (normal closure),
	 * rejects all pending requests, and clears the message queue.
	 */
	disconnect(): void {
		this.setState("disconnected");
		this.clearReconnectTimer();
		this.reconnectStrategy.reset();

		if (this.ws) {
			this.ws.onclose = null; // Prevent reconnect on intentional close
			this.ws.onmessage = null;
			this.ws.onerror = null;
			this.ws.close(1000, "Client disconnect");
			this.ws = null;
		}

		// Reject all pending requests
		for (const [id, pending] of this.pendingRequests) {
			clearTimeout(pending.timeout);
			pending.reject(new Error("Connection closed"));
			this.pendingRequests.delete(id);
		}

		this.messageQueue = [];
	}

	/**
	 * Manually retry connection after entering the "failed" state.
	 * Resets the reconnect strategy and initiates a fresh connection.
	 */
	retry(): void {
		if (!this.config) {
			throw new Error("Cannot retry: no previous connection config");
		}
		this.reconnectStrategy.reset();
		this.connect(this.config);
	}

	// -- Private methods --

	private handleFrame(frame: GatewayFrame): void {
		switch (frame.type) {
			case "event":
				if (frame.event === "connect.challenge") {
					// Phase 2: Respond with connect request.
					// Register as pending so the hello-ok response is matched.
					const connectId = nanoid();
					const timeout = this.config?.requestTimeout ?? DEFAULT_REQUEST_TIMEOUT;
					const timeoutHandle = setTimeout(() => {
						this.pendingRequests.delete(connectId);
						this.setState("failed");
						this.eventBus.emit("ws.failed", {
							reason: "auth_timeout",
							attempts: 0,
						});
					}, timeout);

					this.pendingRequests.set(connectId, {
						resolve: () => {
							/* handled in handleFrame res branch */
						},
						reject: (err: Error) => {
							console.error("[ws-manager] Connect request failed:", err.message);
						},
						timeout: timeoutHandle,
					});

					this.sendRaw({
						type: "req",
						id: connectId,
						method: "connect",
						params: {
							role: "operator",
							scopes: ["operator.read", "operator.write"],
							auth: { token: this.config?.token },
							client: { name: "AXion Hub", version: "1.0.0" },
						},
					});
				} else {
					// Regular gateway event -- dispatch to Event Bus
					this.eventBus.emit(frame.event, frame.payload);
				}
				break;

			case "res": {
				const pending = this.pendingRequests.get(frame.id);
				if (pending) {
					clearTimeout(pending.timeout);
					this.pendingRequests.delete(frame.id);

					if (frame.ok) {
						// Check for hello-ok (auth complete)
						const payload = frame.payload as
							| Record<string, Record<string, unknown>>
							| undefined;
						if (payload?.auth?.deviceToken) {
							this.setState("connected");
							this.reconnectStrategy.reset();
							this.eventBus.emit("ws.connected", {
								mode: this.config?.mode ?? "remote",
							});
							this.flushMessageQueue();
						}
						pending.resolve(frame);
					} else {
						const errorMsg = frame.error?.message ?? "Request failed";
						pending.reject(new Error(errorMsg));
					}
				}
				break;
			}

			case "req":
				// Gateway should not send requests to the client.
				// Log and ignore for forward compatibility.
				console.warn("[ws-manager] Received unexpected request frame from gateway:", frame);
				break;
		}
	}

	private setState(state: ConnectionState): void {
		this._state = state;
		this.eventBus.emit("ws.state", { state });
	}

	private scheduleReconnect(): void {
		if (!this.reconnectStrategy.shouldRetry()) {
			this.setState("failed");
			this.eventBus.emit("ws.failed", {
				reason: "max_retries",
				attempts: this.reconnectStrategy.attempt,
			});
			return;
		}

		this.setState("reconnecting");
		const delay = this.reconnectStrategy.nextDelay();
		this.eventBus.emit("ws.reconnecting", {
			attempt: this.reconnectStrategy.attempt,
			maxAttempts: this.reconnectStrategy.maxAttempts,
		});

		this.reconnectTimer = setTimeout(() => {
			if (this.config) {
				this.connect(this.config);
			}
		}, delay);
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer !== null) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	private flushMessageQueue(): void {
		while (this.messageQueue.length > 0) {
			const msg = this.messageQueue.shift();
			if (msg) {
				this.sendRaw(msg);
			}
		}
	}

	private sendRaw(frame: unknown): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(frame));
		}
	}
}
