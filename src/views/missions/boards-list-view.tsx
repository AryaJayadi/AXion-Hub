"use client";

/**
 * Boards list view at /missions/boards.
 *
 * Displays a grid of board cards with task counts. Users can create new
 * boards, navigate to specific boards, or access board settings.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { LayoutGrid, Plus, Settings } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PageHeader } from "@/shared/ui/page-header";

import { useBoardStore } from "@/features/missions/model/board-store";
import { useTaskStore } from "@/features/missions/model/task-store";
import { useCreateBoard } from "@/features/missions/api/use-board-mutations";

export function BoardsListView() {
	const router = useRouter();
	const boards = useBoardStore((s) => s.boards);
	const setActiveBoard = useBoardStore((s) => s.setActiveBoard);
	const tasks = useTaskStore((s) => s.tasks);
	const createBoard = useCreateBoard();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [newBoardName, setNewBoardName] = useState("");

	const handleCreate = () => {
		if (!newBoardName.trim()) return;
		createBoard.mutate({ name: newBoardName.trim() });
		setNewBoardName("");
		setDialogOpen(false);
	};

	/** Count tasks for a specific board */
	const getTaskCount = (boardId: string): number => {
		let count = 0;
		tasks.forEach((task) => {
			if (task.boardId === boardId) count++;
		});
		return count;
	};

	return (
		<div className="flex flex-col h-full">
			<PageHeader
				title="Boards"
				description="Organize tasks across project boards"
				breadcrumbs={[
					{ label: "Missions", href: "/missions" },
					{ label: "Boards" },
				]}
				actions={
					<Button size="sm" onClick={() => setDialogOpen(true)}>
						<Plus className="mr-1.5 size-4" />
						Create Board
					</Button>
				}
			/>

			{/* Board grid */}
			<div className="flex-1 p-6">
				{boards.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16">
						<LayoutGrid className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							No boards yet. Create your first board to get
							started.
						</p>
						<Button
							size="sm"
							onClick={() => setDialogOpen(true)}
						>
							<Plus className="mr-1.5 size-4" />
							Create Board
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{boards.map((board) => {
							const taskCount = getTaskCount(board.id);
							return (
								<Card
									key={board.id}
									className={cn(
										"cursor-pointer transition-colors hover:border-primary/50",
									)}
								>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-base">
												<button
													type="button"
													className="hover:underline text-left"
													onClick={() => {
														setActiveBoard(
															board.id,
														);
														router.push(
															"/missions",
														);
													}}
												>
													{board.name}
												</button>
											</CardTitle>
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={(e) => {
													e.stopPropagation();
													router.push(
														`/missions/boards/${board.id}/settings`,
													);
												}}
											>
												<Settings className="size-3.5" />
												<span className="sr-only">
													Board settings
												</span>
											</Button>
										</div>
										<CardDescription>
											{taskCount} task
											{taskCount !== 1 ? "s" : ""}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground">
											Created{" "}
											{formatDistanceToNow(
												board.createdAt,
												{ addSuffix: true },
											)}
										</p>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			{/* Create board dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Create Board</DialogTitle>
						<DialogDescription>
							Create a new board to organize your tasks.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="boards-new-name">Board name</Label>
						<Input
							id="boards-new-name"
							placeholder="e.g. Sprint 42"
							value={newBoardName}
							onChange={(e) => setNewBoardName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleCreate();
							}}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleCreate}
							disabled={!newBoardName.trim()}
						>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
