"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Agent } from "@/entities/agent";
import { getStatusGlowClasses } from "@/entities/agent";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useDeleteAgent } from "../api/use-agent-mutations";

interface AgentCardProps {
	agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
	const router = useRouter();
	const deleteAgent = useDeleteAgent();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	return (
		<>
			<Card
				className={cn(
					"cursor-pointer border transition-all duration-300 hover:scale-[1.02]",
					getStatusGlowClasses(agent.status),
				)}
				onClick={() => router.push(`/agents/${agent.id}`)}
			>
				<CardContent className="relative flex items-center gap-4 p-4">
					<Avatar className="size-12">
						<AvatarImage src={agent.avatar} alt={agent.name} />
						<AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-sm font-semibold">{agent.name}</h3>
						<p className="truncate text-xs text-muted-foreground">{agent.model}</p>
						<p className="mt-1 text-xs text-muted-foreground">{agent.keyStat}</p>
					</div>

					{/* Three-dot dropdown menu */}
					<div className="absolute right-3 top-3">
						<DropdownMenu>
							<DropdownMenuTrigger
								onClick={(e) => e.stopPropagation()}
								className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<MoreHorizontal className="size-4" />
								<span className="sr-only">Agent actions</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										router.push(`/agents/${agent.id}`);
									}}
								>
									<Pencil className="size-4" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										// TODO: Implement clone agent flow
									}}
								>
									<Copy className="size-4" />
									Clone
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={(e) => {
										e.stopPropagation();
										setShowDeleteDialog(true);
									}}
								>
									<Trash2 className="size-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardContent>
			</Card>

			{/* Delete confirmation dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete agent "{agent.name}"?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. The agent and all its configuration will be permanently
							removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteAgent.mutate(agent.id)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
