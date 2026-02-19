"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { NotificationPrefsForm } from "@/features/settings/components/notification-prefs-form";
import { useNotificationPrefs } from "@/features/settings/api/use-notifications";

export function SettingsNotificationsView() {
	const { data, isLoading } = useNotificationPrefs();

	if (isLoading || !data) {
		return (
			<div className="space-y-6">
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			</div>
		);
	}

	return <NotificationPrefsForm defaults={data} />;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
	return (
		<div className="rounded-xl border bg-card p-6 space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-4 w-64" />
			</div>
			<div className="flex items-center gap-3">
				<Skeleton className="h-5 w-8 rounded-full" />
				<Skeleton className="h-4 w-40" />
			</div>
		</div>
	);
}
