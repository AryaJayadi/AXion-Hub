"use client";

import { Loader2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { useClawHubSkills } from "@/features/skills/api/use-clawhub";
import { ClawHubBrowser } from "@/features/skills/components/clawhub-browser";

export function ClawHubView() {
	const { data: skills, isLoading } = useClawHubSkills();

	return (
		<div>
			<PageHeader
				title="ClawHub Registry"
				description="Discover and install skills from the community marketplace"
				breadcrumbs={[
					{ label: "Skills", href: "/skills" },
					{ label: "ClawHub" },
				]}
			/>

			{isLoading || !skills ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<ClawHubBrowser skills={skills} />
			)}
		</div>
	);
}
