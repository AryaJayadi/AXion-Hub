import { create } from "zustand";

export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertNotification {
	id: string;
	ruleId: string;
	ruleName: string;
	severity: AlertSeverity;
	message: string;
	timestamp: Date;
	read: boolean;
}

interface AlertStore {
	/** Count of unread alerts for badge display */
	unreadAlertCount: number;

	/** Recent alert notifications */
	recentAlerts: AlertNotification[];

	// Actions
	addAlert: (alert: AlertNotification) => void;
	markAllRead: () => void;
	markRead: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
	unreadAlertCount: 0,
	recentAlerts: [],

	addAlert: (alert) =>
		set((state) => ({
			recentAlerts: [alert, ...state.recentAlerts],
			unreadAlertCount: state.unreadAlertCount + (alert.read ? 0 : 1),
		})),

	markAllRead: () =>
		set((state) => ({
			unreadAlertCount: 0,
			recentAlerts: state.recentAlerts.map((a) => ({ ...a, read: true })),
		})),

	markRead: (id) =>
		set((state) => {
			const alert = state.recentAlerts.find((a) => a.id === id);
			if (!alert || alert.read) return state;
			return {
				unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
				recentAlerts: state.recentAlerts.map((a) =>
					a.id === id ? { ...a, read: true } : a,
				),
			};
		}),
}));
