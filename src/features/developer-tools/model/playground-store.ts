/**
 * Zustand store for the WebSocket Playground.
 *
 * Manages connection state, event log, template selection,
 * and JSON payload editor. Ephemeral (no persist) -- playground
 * sessions are throwaway debugging sessions.
 */

import { create } from "zustand";
import { getTemplateById, templateToJson } from "./event-templates";

/** Connection states for the playground WebSocket. */
export type PlaygroundConnectionState =
	| "disconnected"
	| "connecting"
	| "connected"
	| "error";

/** A single event in the playground event log. */
export interface PlaygroundEvent {
	id: string;
	timestamp: Date;
	direction: "sent" | "received";
	type: "req" | "res" | "event";
	raw: string;
}

interface PlaygroundState {
	/** Gateway URL to connect to. */
	url: string;
	/** Auth token for the gateway handshake. */
	token: string;
	/** Current WebSocket connection state. */
	connectionState: PlaygroundConnectionState;
	/** Chronological event log (newest first). */
	events: PlaygroundEvent[];
	/** Currently selected event template ID. */
	selectedTemplateId: string | null;
	/** JSON payload in the editor. */
	jsonPayload: string;
	/** Last connection error message. */
	error: string | null;
}

interface PlaygroundActions {
	setUrl: (url: string) => void;
	setToken: (token: string) => void;
	setConnectionState: (state: PlaygroundConnectionState) => void;
	addEvent: (event: PlaygroundEvent) => void;
	clearEvents: () => void;
	selectTemplate: (id: string) => void;
	setJsonPayload: (json: string) => void;
	setError: (error: string | null) => void;
}

export const usePlaygroundStore = create<PlaygroundState & PlaygroundActions>(
	(set) => ({
		// -- State --
		url: "ws://127.0.0.1:18789",
		token: "",
		connectionState: "disconnected",
		events: [],
		selectedTemplateId: null,
		jsonPayload: "{}",
		error: null,

		// -- Actions --
		setUrl: (url) => set({ url }),
		setToken: (token) => set({ token }),
		setConnectionState: (connectionState) => set({ connectionState }),

		addEvent: (event) =>
			set((state) => ({ events: [event, ...state.events] })),

		clearEvents: () => set({ events: [] }),

		selectTemplate: (id) => {
			const template = getTemplateById(id);
			if (template) {
				set({
					selectedTemplateId: id,
					jsonPayload: templateToJson(template),
				});
			}
		},

		setJsonPayload: (jsonPayload) => set({ jsonPayload }),
		setError: (error) => set({ error }),
	}),
);
