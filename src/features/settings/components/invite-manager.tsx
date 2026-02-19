"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2, Mail, Send, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
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
	usePendingInvitations,
	useInviteMember,
	useCancelInvitation,
} from "../api/use-team";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
	email: z.email("Please enter a valid email address"),
	role: z.enum(["admin", "member"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InviteManager() {
	const { data: invitations, isLoading } = usePendingInvitations();
	const inviteMember = useInviteMember();
	const cancelInvitation = useCancelInvitation();

	const [invitationToCancel, setInvitationToCancel] = useState<{
		id: string;
		email: string;
	} | null>(null);
	const [selectedRole, setSelectedRole] = useState<"admin" | "member">(
		"member",
	);

	const form = useForm<InviteFormValues>({
		resolver: zodResolver(inviteSchema) as never,
		defaultValues: {
			email: "",
			role: "member",
		},
	});

	function onSubmit(values: InviteFormValues) {
		inviteMember.mutate(
			{ email: values.email, role: values.role },
			{
				onSuccess: () => {
					form.reset();
					setSelectedRole("member");
				},
			},
		);
	}

	function handleCancelConfirm() {
		if (invitationToCancel) {
			cancelInvitation.mutate(invitationToCancel.id);
			setInvitationToCancel(null);
		}
	}

	const pendingInvitations =
		invitations?.filter((inv) => inv.status === "pending") ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Invitations</CardTitle>
				<CardDescription>
					Invite new members and manage pending invitations
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Invite form */}
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4 sm:flex-row sm:items-end"
				>
					<div className="flex-1">
						<FormField
							label="Email Address"
							error={form.formState.errors.email?.message}
						>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									{...form.register("email")}
									type="email"
									placeholder="colleague@example.com"
									className="pl-9"
								/>
							</div>
						</FormField>
					</div>
					<div className="w-full sm:w-[140px]">
						<FormField label="Role">
							<Select
								value={selectedRole}
								onValueChange={(value) => {
									const role = value as "admin" | "member";
									setSelectedRole(role);
									form.setValue("role", role);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="member">Member</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
					</div>
					<Button
						type="submit"
						disabled={inviteMember.isPending}
						className="sm:mb-0"
					>
						{inviteMember.isPending ? (
							<Loader2 className="mr-2 size-4 animate-spin" />
						) : (
							<Send className="mr-2 size-4" />
						)}
						Send Invite
					</Button>
				</form>

				{/* Pending invitations */}
				<div className="space-y-3">
					<h4 className="text-sm font-medium text-muted-foreground">
						Pending Invitations
					</h4>
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : pendingInvitations.length === 0 ? (
						<p className="text-sm text-muted-foreground py-3 text-center">
							No pending invitations.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead className="w-[80px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pendingInvitations.map((invitation) => (
									<TableRow key={invitation.id}>
										<TableCell className="font-medium">
											{invitation.email}
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{invitation.role}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatDate(invitation.expiresAt)}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												className="text-destructive hover:text-destructive"
												onClick={() =>
													setInvitationToCancel({
														id: invitation.id,
														email: invitation.email,
													})
												}
												disabled={cancelInvitation.isPending}
											>
												{cancelInvitation.isPending ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<X className="size-4" />
												)}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</CardContent>

			{/* Cancel confirmation dialog */}
			<AlertDialog
				open={invitationToCancel !== null}
				onOpenChange={(open) => {
					if (!open) setInvitationToCancel(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel the invitation for{" "}
							<strong>{invitationToCancel?.email}</strong>? They will
							no longer be able to join using this invitation link.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleCancelConfirm}
						>
							Cancel Invitation
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
