"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { useProfileSettings } from "@/features/settings/api/use-settings";

export function SettingsProfileView() {
	const { data, isLoading } = useProfileSettings();

	if (isLoading || !data) {
		return (
			<div className="rounded-xl border bg-card p-6 space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-56" />
				</div>
				<div className="flex items-center gap-4">
					<Skeleton className="size-16 rounded-full" />
					<Skeleton className="h-4 w-48" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
				</div>
			</div>
		);
	}

	return <ProfileSettingsForm defaults={data} />;
}
