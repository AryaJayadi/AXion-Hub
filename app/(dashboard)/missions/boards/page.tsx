import { Suspense } from "react";
import type { Metadata } from "next";
import { BoardsListView } from "@/views/missions/boards-list-view";
import { Skeleton } from "@/shared/ui/skeleton";

export const metadata: Metadata = {
	title: "Boards | AXion Hub",
	description: "Manage and organize project boards",
};

function BoardsLoading() {
	return (
		<div className="p-6 space-y-4">
			<Skeleton className="h-8 w-48" />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
			</div>
		</div>
	);
}

export default function BoardsPage() {
	return (
		<Suspense fallback={<BoardsLoading />}>
			<BoardsListView />
		</Suspense>
	);
}
