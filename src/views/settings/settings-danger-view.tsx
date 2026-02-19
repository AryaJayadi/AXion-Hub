"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { DangerZoneCard } from "@/features/settings/components/danger-zone-card";
import { useActiveOrganization } from "@/features/auth/lib/auth-client";

export function SettingsDangerView() {
	const { data: activeOrg, isPending } = useActiveOrganization();

	if (isPending || !activeOrg) {
		return (
			<div className="rounded-xl border border-destructive bg-card p-6 space-y-6">
				<div className="flex items-center gap-2">
					<Skeleton className="size-5" />
					<Skeleton className="h-5 w-28" />
				</div>
				<Skeleton className="h-4 w-64" />
				<Skeleton className="h-9 w-full max-w-sm" />
				<Skeleton className="h-8 w-28" />
			</div>
		);
	}

	return (
		<DangerZoneCard
			orgName={activeOrg.name}
			organizationId={activeOrg.id}
		/>
	);
}
