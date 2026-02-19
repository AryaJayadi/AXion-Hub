"use client";

import { useSessions } from "@/features/sessions/api/use-sessions";
import { SessionsTable } from "@/features/sessions/components/sessions-table";
import { PageHeader } from "@/shared/ui/page-header";

export function SessionsListView() {
	const { data: sessions, isLoading } = useSessions();

	return (
		<div>
			<PageHeader
				title="Sessions"
				description="Browse all agent sessions"
			/>
			<SessionsTable
				sessions={sessions ?? []}
				isLoading={isLoading}
			/>
		</div>
	);
}
