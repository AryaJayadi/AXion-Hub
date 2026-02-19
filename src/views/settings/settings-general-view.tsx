"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { GeneralSettingsForm } from "@/features/settings/components/general-settings-form";
import { ThemeSettingsForm } from "@/features/settings/components/theme-settings-form";
import { useGeneralSettings } from "@/features/settings/api/use-settings";

export function SettingsGeneralView() {
	const { data, isLoading } = useGeneralSettings();

	if (isLoading || !data) {
		return (
			<div className="space-y-6">
				<SkeletonCard />
				<SkeletonCard />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<GeneralSettingsForm defaults={data} />
			<ThemeSettingsForm />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
	return (
		<div className="rounded-xl border bg-card p-6 space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-64" />
			</div>
			<div className="space-y-4">
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		</div>
	);
}
