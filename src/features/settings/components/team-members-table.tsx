"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
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
import {
	useTeamMembers,
	useUpdateMemberRole,
	useRemoveMember,
} from "../api/use-team";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function SkeletonTable() {
	return (
		<div className="space-y-3">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeamMembersTable() {
	const { data: members, isLoading } = useTeamMembers();
	const updateRole = useUpdateMemberRole();
	const removeMember = useRemoveMember();

	const [memberToRemove, setMemberToRemove] = useState<{
		id: string;
		name: string;
	} | null>(null);

	function handleRoleChange(memberId: string, role: string) {
		if (role === "admin" || role === "member") {
			updateRole.mutate({ memberId, role });
		}
	}

	function handleRemoveConfirm() {
		if (memberToRemove) {
			removeMember.mutate(memberToRemove.id);
			setMemberToRemove(null);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Team Members</CardTitle>
				<CardDescription>
					Manage your organization&apos;s members and their roles
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<SkeletonTable />
				) : !members || members.length === 0 ? (
					<p className="text-sm text-muted-foreground py-4 text-center">
						No team members found.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="w-[80px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{members.map((member) => {
								const isOwner = member.role === "owner";

								return (
									<TableRow key={member.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="size-8">
													{member.image ? (
														<AvatarImage
															src={member.image}
															alt={member.name}
														/>
													) : null}
													<AvatarFallback className="text-xs">
														{getInitials(member.name)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">
													{member.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{member.email}
										</TableCell>
										<TableCell>
											{isOwner ? (
												<Badge variant="secondary">Owner</Badge>
											) : (
												<Select
													value={member.role}
													onValueChange={(value) =>
														handleRoleChange(member.id, value)
													}
												>
													<SelectTrigger className="w-[110px]" size="sm">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="admin">
															Admin
														</SelectItem>
														<SelectItem value="member">
															Member
														</SelectItem>
													</SelectContent>
												</Select>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatDate(member.createdAt)}
										</TableCell>
										<TableCell>
											{isOwner ? null : (
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive"
													onClick={() =>
														setMemberToRemove({
															id: member.id,
															name: member.name,
														})
													}
													disabled={removeMember.isPending}
												>
													{removeMember.isPending ? (
														<Loader2 className="size-4 animate-spin" />
													) : (
														<Trash2 className="size-4" />
													)}
												</Button>
											)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</CardContent>

			{/* Remove confirmation dialog */}
			<AlertDialog
				open={memberToRemove !== null}
				onOpenChange={(open) => {
					if (!open) setMemberToRemove(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Member</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove{" "}
							<strong>{memberToRemove?.name}</strong> from the
							organization? They will lose access to all
							organization resources.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleRemoveConfirm}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
