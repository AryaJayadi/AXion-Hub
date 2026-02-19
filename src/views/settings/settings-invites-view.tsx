"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { InviteManager } from "@/features/settings/components/invite-manager";

export function SettingsInvitesView() {
	return (
		<div className="space-y-6">
			<Button variant="ghost" size="sm" asChild>
				<Link href="/settings/team">
					<ArrowLeft className="mr-2 size-4" />
					Back to Team
				</Link>
			</Button>
			<InviteManager />
		</div>
	);
}
