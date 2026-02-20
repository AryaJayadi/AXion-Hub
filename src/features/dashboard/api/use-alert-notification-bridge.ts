"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAlertStore } from "../model/alert-store";
import type { AlertNotification } from "../model/alert-store";
import { queryKeys } from "@/shared/lib/query-keys";

interface RawAlertNotification {
	id: string;
	ruleId: string;
	ruleName: string | null;
	severity: "critical" | "warning" | "info";
	message: string;
	createdAt: string;
	read: boolean;
}

/**
 * Bridges alert notifications from the database to the client UI.
 *
 * Polls GET /api/alerts/notifications every 30 seconds. When new
 * notifications arrive (newer than the last-seen ID), pushes each
 * into the Zustand alertStore and fires a sonner toast.
 *
 * Mount this once in AppProviders or the dashboard layout.
 */
export function useAlertNotificationBridge() {
	const addAlert = useAlertStore((s) => s.addAlert);
	const lastSeenIdRef = useRef<string | null>(null);

	const { data: notifications } = useQuery({
		queryKey: queryKeys.alerts.notifications(),
		queryFn: async (): Promise<RawAlertNotification[]> => {
			try {
				const res = await fetch("/api/alerts/notifications?limit=10");
				if (!res.ok) return [];
				return res.json();
			} catch {
				return [];
			}
		},
		refetchInterval: 30_000,
		staleTime: 15_000,
	});

	useEffect(() => {
		if (!notifications?.length) return;

		const newest = notifications[0];
		if (!newest || newest.id === lastSeenIdRef.current) return;

		// Find notifications newer than last seen
		const lastIdx = lastSeenIdRef.current
			? notifications.findIndex((n) => n.id === lastSeenIdRef.current)
			: notifications.length;

		const newOnes = notifications.slice(
			0,
			lastIdx === -1 ? notifications.length : lastIdx,
		);

		// Process from oldest to newest
		for (const n of [...newOnes].reverse()) {
			addAlert({
				id: n.id,
				ruleId: n.ruleId,
				ruleName: n.ruleName ?? "Alert",
				severity: n.severity,
				message: n.message,
				timestamp: new Date(n.createdAt),
				read: n.read,
			});

			if (!n.read) {
				toast.warning(n.message, {
					description: n.ruleName ?? "Alert",
					duration: 8000,
				});
			}
		}

		lastSeenIdRef.current = newest.id;
	}, [notifications, addAlert]);
}
