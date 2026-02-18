"use client";

/**
 * Board settings page view.
 *
 * Renders BoardSettings component with breadcrumb navigation
 * and back link to /missions/boards.
 */

import { useBoardStore } from "@/features/missions/model/board-store";
import { BoardSettings } from "@/features/missions/components/board-settings";
import { PageHeader } from "@/shared/ui/page-header";

interface BoardSettingsViewProps {
	boardId: string;
}

export function BoardSettingsView({ boardId }: BoardSettingsViewProps) {
	const board = useBoardStore((s) =>
		s.boards.find((b) => b.id === boardId),
	);

	return (
		<div className="flex flex-col h-full">
			<PageHeader
				title="Board Settings"
				description={
					board
						? `Configure "${board.name}" board settings`
						: "Board settings"
				}
				breadcrumbs={[
					{ label: "Missions", href: "/missions" },
					{ label: "Boards", href: "/missions/boards" },
					{ label: board?.name ?? "Board" },
					{ label: "Settings" },
				]}
			/>

			<div className="flex-1 p-6">
				<BoardSettings boardId={boardId} />
			</div>
		</div>
	);
}
