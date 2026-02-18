"use client";

/**
 * Board list sidebar for mission board navigation.
 *
 * Renders inside the missions board view as an in-content secondary sidebar
 * (like the chat conversation sidebar, NOT nested in the app sidebar).
 * Allows creating, renaming, and deleting boards.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
	LayoutGrid,
	MoreHorizontal,
	Pencil,
	Plus,
	Settings,
	Trash2,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useBoardStore } from "../model/board-store";
import { useCreateBoard, useDeleteBoard, useUpdateBoard } from "../api/use-board-mutations";

export function BoardSidebar() {
	const router = useRouter();
	const boards = useBoardStore((s) => s.boards);
	const activeBoardId = useBoardStore((s) => s.activeBoardId);
	const setActiveBoard = useBoardStore((s) => s.setActiveBoard);

	const createBoard = useCreateBoard();
	const updateBoard = useUpdateBoard();
	const deleteBoard = useDeleteBoard();

	// Create board dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [newBoardName, setNewBoardName] = useState("");

	// Rename dialog
	const [renameOpen, setRenameOpen] = useState(false);
	const [renameBoardId, setRenameBoardId] = useState<string | null>(null);
	const [renameName, setRenameName] = useState("");

	// Delete confirmation
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);

	const handleCreate = useCallback(() => {
		if (!newBoardName.trim()) return;
		createBoard.mutate({ name: newBoardName.trim() });
		setNewBoardName("");
		setCreateOpen(false);
	}, [newBoardName, createBoard]);

	const handleRename = useCallback(() => {
		if (!renameBoardId || !renameName.trim()) return;
		updateBoard.mutate({
			boardId: renameBoardId,
			updates: { name: renameName.trim() },
		});
		setRenameOpen(false);
		setRenameBoardId(null);
	}, [renameBoardId, renameName, updateBoard]);

	const handleDelete = useCallback(() => {
		if (!deleteBoardId) return;
		deleteBoard.mutate(deleteBoardId);
		setDeleteOpen(false);
		setDeleteBoardId(null);
	}, [deleteBoardId, deleteBoard]);

	const openRename = useCallback(
		(boardId: string, currentName: string) => {
			setRenameBoardId(boardId);
			setRenameName(currentName);
			setRenameOpen(true);
		},
		[],
	);

	const openDelete = useCallback((boardId: string) => {
		setDeleteBoardId(boardId);
		setDeleteOpen(true);
	}, []);

	return (
		<div className="hidden md:flex w-56 shrink-0 flex-col border-r bg-muted/20">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-3 py-2">
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Boards
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="size-6"
					onClick={() => setCreateOpen(true)}
				>
					<Plus className="size-3.5" />
					<span className="sr-only">Create board</span>
				</Button>
			</div>

			{/* Board list */}
			<div className="flex-1 overflow-y-auto py-1">
				{boards.map((board) => (
					<div
						key={board.id}
						className={cn(
							"group flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors",
							board.id === activeBoardId
								? "bg-accent text-accent-foreground"
								: "text-foreground hover:bg-accent/50",
						)}
					>
						<button
							type="button"
							className="flex flex-1 items-center gap-2 text-left"
							onClick={() => setActiveBoard(board.id)}
						>
							<LayoutGrid className="size-3.5 shrink-0 text-muted-foreground" />
							<span className="truncate text-sm">
								{board.name}
							</span>
						</button>

						{/* Actions menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-5 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<MoreHorizontal className="size-3" />
									<span className="sr-only">
										Board actions
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem
									onClick={() =>
										openRename(board.id, board.name)
									}
								>
									<Pencil className="mr-2 size-3.5" />
									Rename
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										router.push(
											`/missions/boards/${board.id}/settings`,
										)
									}
								>
									<Settings className="mr-2 size-3.5" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => openDelete(board.id)}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 size-3.5" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				))}
			</div>

			{/* View all boards link */}
			<div className="border-t px-3 py-2">
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start text-xs text-muted-foreground"
					onClick={() => router.push("/missions/boards")}
				>
					<LayoutGrid className="mr-1.5 size-3" />
					View all boards
				</Button>
			</div>

			{/* Create board dialog */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Create Board</DialogTitle>
						<DialogDescription>
							Create a new board to organize your tasks.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="board-name">Board name</Label>
						<Input
							id="board-name"
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
							onClick={() => setCreateOpen(false)}
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

			{/* Rename board dialog */}
			<Dialog open={renameOpen} onOpenChange={setRenameOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Rename Board</DialogTitle>
						<DialogDescription>
							Enter a new name for this board.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="rename-board">Board name</Label>
						<Input
							id="rename-board"
							value={renameName}
							onChange={(e) => setRenameName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleRename();
							}}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setRenameOpen(false)}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleRename}
							disabled={!renameName.trim()}
						>
							Rename
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Board</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this board? This
							action cannot be undone. All tasks on this board
							will be moved to the default board.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
