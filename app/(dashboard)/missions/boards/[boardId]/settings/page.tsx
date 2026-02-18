import { Suspense } from "react";
import type { Metadata } from "next";
import { BoardSettingsView } from "@/views/missions/board-settings-view";
import { Skeleton } from "@/shared/ui/skeleton";

export const metadata: Metadata = {
	title: "Board Settings | AXion Hub",
	description: "Configure board settings and automation rules",
};

function SettingsLoading() {
	return (
		<div className="p-6 space-y-6 max-w-2xl">
			<Skeleton className="h-8 w-64" />
			<Skeleton className="h-40 rounded-lg" />
			<Skeleton className="h-60 rounded-lg" />
		</div>
	);
}

export default async function BoardSettingsPage({
	params,
}: {
	params: Promise<{ boardId: string }>;
}) {
	const { boardId } = await params;

	return (
		<Suspense fallback={<SettingsLoading />}>
			<BoardSettingsView boardId={boardId} />
		</Suspense>
	);
}
