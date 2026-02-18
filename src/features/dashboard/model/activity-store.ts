import { create } from "zustand";
import type { DashboardEvent } from "@/entities/dashboard-event";
import { parseGatewayEvent } from "@/entities/dashboard-event";
import type { EventBus } from "@/features/gateway-connection";
import { EVENT_NAMESPACES } from "../lib/event-mapper";

/** Max events shown on the dashboard widget */
const DASHBOARD_BUFFER_SIZE = 20;

/** Max events stored for the full /activity page */
const FULL_BUFFER_SIZE = 200;

interface ActivityStore {
	/** Recent events for dashboard widget (max 20, circular buffer) */
	events: DashboardEvent[];

	/** Full event history for /activity page (max 200) */
	fullEvents: DashboardEvent[];

	/** Count of unread events since last markRead */
	unreadCount: number;

	// Actions
	pushEvent: (event: DashboardEvent) => void;
	markRead: () => void;
	clear: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
	events: [],
	fullEvents: [],
	unreadCount: 0,

	pushEvent: (event) =>
		set((state) => ({
			events: [event, ...state.events].slice(0, DASHBOARD_BUFFER_SIZE),
			fullEvents: [event, ...state.fullEvents].slice(0, FULL_BUFFER_SIZE),
			unreadCount: state.unreadCount + 1,
		})),

	markRead: () => set({ unreadCount: 0 }),

	clear: () => set({ events: [], fullEvents: [], unreadCount: 0 }),
}));

/**
 * Initialize real-time subscriptions from the Event Bus for activity tracking.
 * Subscribes to all event namespaces and pushes parsed events to the store.
 *
 * @returns Cleanup function that unsubscribes all listeners
 */
export function initActivityStoreSubscriptions(eventBus: EventBus): () => void {
	const unsubscribers: (() => void)[] = [];

	for (const namespace of EVENT_NAMESPACES) {
		const unsub = eventBus.on(namespace, (payload) => {
			// For wildcard subscriptions, the event type isn't directly available.
			// The EventBus dispatches to "namespace.*" handlers; we use the namespace
			// as a base type. The actual event type is in the payload context.
			const eventType = (payload as Record<string, unknown>)._eventType as string | undefined;
			const resolvedType = eventType ?? namespace.replace(".*", ".event");
			const dashboardEvent = parseGatewayEvent(resolvedType, payload);
			useActivityStore.getState().pushEvent(dashboardEvent);
		});
		unsubscribers.push(unsub);
	}

	return () => {
		for (const unsub of unsubscribers) {
			unsub();
		}
	};
}
