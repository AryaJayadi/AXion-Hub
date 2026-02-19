"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { TeamMembersTable } from "@/features/settings/components/team-members-table";

export function SettingsTeamView() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div />
				<Button variant="outline" asChild>
					<Link href="/settings/team/invites">
						<Mail className="mr-2 size-4" />
						Manage Invitations
					</Link>
				</Button>
			</div>
			<TeamMembersTable />
		</div>
	);
}
