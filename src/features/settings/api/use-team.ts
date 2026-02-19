"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/lib/auth-client";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeamMember {
	id: string;
	userId: string;
	name: string;
	email: string;
	image: string | null;
	role: "owner" | "admin" | "member";
	createdAt: Date;
}

export interface PendingInvitation {
	id: string;
	email: string;
	role: "admin" | "member";
	status: string;
	expiresAt: Date;
	inviterEmail: string;
}

// ---------------------------------------------------------------------------
// Mock data (replaced by real API when backend is wired)
// ---------------------------------------------------------------------------

const MOCK_MEMBERS: TeamMember[] = [
	{
		id: "mem-1",
		userId: "user-1",
		name: "Alice Johnson",
		email: "alice@axion.dev",
		image: null,
		role: "owner",
		createdAt: new Date("2025-08-01"),
	},
	{
		id: "mem-2",
		userId: "user-2",
		name: "Bob Chen",
		email: "bob@axion.dev",
		image: null,
		role: "admin",
		createdAt: new Date("2025-09-15"),
	},
	{
		id: "mem-3",
		userId: "user-3",
		name: "Carol Rivera",
		email: "carol@axion.dev",
		image: null,
		role: "member",
		createdAt: new Date("2025-11-20"),
	},
];

const MOCK_INVITATIONS: PendingInvitation[] = [
	{
		id: "inv-1",
		email: "dave@axion.dev",
		role: "member",
		status: "pending",
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		inviterEmail: "alice@axion.dev",
	},
];

// ---------------------------------------------------------------------------
// Team members hooks
// ---------------------------------------------------------------------------

/**
 * Fetch organization members.
 * Wraps authClient.organization.getFullOrganization() and extracts members.
 */
export function useTeamMembers() {
	return useQuery({
		queryKey: queryKeys.settings.team(),
		queryFn: async (): Promise<TeamMember[]> => {
			try {
				const { data, error } =
					await authClient.organization.getFullOrganization();
				if (error || !data) throw new Error("Failed to load team");

				return (data.members ?? []).map((m: Record<string, unknown>) => ({
					id: (m.id as string) ?? "",
					userId: (m.userId as string) ?? "",
					name: ((m.user as Record<string, unknown>)?.name as string) ?? "Unknown",
					email: ((m.user as Record<string, unknown>)?.email as string) ?? "",
					image: ((m.user as Record<string, unknown>)?.image as string | null) ?? null,
					role: (m.role as "owner" | "admin" | "member") ?? "member",
					createdAt: new Date((m.createdAt as string) ?? Date.now()),
				}));
			} catch {
				// Fall back to mock data if API not available
				return MOCK_MEMBERS;
			}
		},
		staleTime: 30_000,
	});
}

/**
 * Update a member's role.
 * Wraps authClient.organization.updateMemberRole().
 */
export function useUpdateMemberRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			memberId,
			role,
		}: {
			memberId: string;
			role: "admin" | "member";
		}) => {
			const { error } = await authClient.organization.updateMemberRole({
				memberId,
				role,
			});
			if (error) throw new Error("Failed to update role");
		},
		onMutate: async ({ memberId, role }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.settings.team(),
			});

			const previous = queryClient.getQueryData<TeamMember[]>(
				queryKeys.settings.team(),
			);

			queryClient.setQueryData<TeamMember[]>(
				queryKeys.settings.team(),
				(old) =>
					old?.map((m) => (m.id === memberId ? { ...m, role } : m)) ?? [],
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.settings.team(),
					context.previous,
				);
			}
			toast.error("Failed to update member role");
		},
		onSuccess: () => {
			toast.success("Member role updated");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.team(),
			});
		},
	});
}

/**
 * Remove a member from the organization.
 * Wraps authClient.organization.removeMember().
 */
export function useRemoveMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (memberIdOrEmail: string) => {
			const { error } = await authClient.organization.removeMember({
				memberIdOrEmail,
			});
			if (error) throw new Error("Failed to remove member");
		},
		onMutate: async (memberIdOrEmail) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.settings.team(),
			});

			const previous = queryClient.getQueryData<TeamMember[]>(
				queryKeys.settings.team(),
			);

			// Optimistic removal
			queryClient.setQueryData<TeamMember[]>(
				queryKeys.settings.team(),
				(old) =>
					old?.filter(
						(m) =>
							m.id !== memberIdOrEmail && m.email !== memberIdOrEmail,
					) ?? [],
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.settings.team(),
					context.previous,
				);
			}
			toast.error("Failed to remove member");
		},
		onSuccess: () => {
			toast.success("Member removed");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.team(),
			});
		},
	});
}

// ---------------------------------------------------------------------------
// Invitation hooks
// ---------------------------------------------------------------------------

/**
 * Fetch pending invitations.
 * Derives from getFullOrganization() invitation data.
 */
export function usePendingInvitations() {
	return useQuery({
		queryKey: [...queryKeys.settings.team(), "invitations"] as const,
		queryFn: async (): Promise<PendingInvitation[]> => {
			try {
				const { data, error } =
					await authClient.organization.getFullOrganization();
				if (error || !data) throw new Error("Failed to load invitations");

				return (data.invitations ?? []).map(
					(inv: Record<string, unknown>) => ({
						id: (inv.id as string) ?? "",
						email: (inv.email as string) ?? "",
						role: (inv.role as "admin" | "member") ?? "member",
						status: (inv.status as string) ?? "pending",
						expiresAt: new Date(
							(inv.expiresAt as string) ?? Date.now(),
						),
						inviterEmail:
							(inv.inviterEmail as string) ?? "unknown",
					}),
				);
			} catch {
				// Fall back to mock data if API not available
				return MOCK_INVITATIONS;
			}
		},
		staleTime: 30_000,
	});
}

/**
 * Invite a new member by email.
 * Wraps authClient.organization.inviteMember().
 */
export function useInviteMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			email,
			role,
		}: {
			email: string;
			role: "admin" | "member";
		}) => {
			const { error } = await authClient.organization.inviteMember({
				email,
				role,
			});
			if (error) throw new Error("Failed to send invitation");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.team(),
			});
			toast.success("Invitation sent");
		},
		onError: () => {
			toast.error("Failed to send invitation");
		},
	});
}

/**
 * Cancel a pending invitation.
 * Wraps authClient.organization.cancelInvitation().
 */
export function useCancelInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (invitationId: string) => {
			const { error } = await authClient.organization.cancelInvitation({
				invitationId,
			});
			if (error) throw new Error("Failed to cancel invitation");
		},
		onMutate: async (invitationId) => {
			await queryClient.cancelQueries({
				queryKey: [...queryKeys.settings.team(), "invitations"],
			});

			const previous = queryClient.getQueryData<PendingInvitation[]>([
				...queryKeys.settings.team(),
				"invitations",
			]);

			// Optimistic removal
			queryClient.setQueryData<PendingInvitation[]>(
				[...queryKeys.settings.team(), "invitations"],
				(old) => old?.filter((inv) => inv.id !== invitationId) ?? [],
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					[...queryKeys.settings.team(), "invitations"],
					context.previous,
				);
			}
			toast.error("Failed to cancel invitation");
		},
		onSuccess: () => {
			toast.success("Invitation cancelled");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.team(),
			});
		},
	});
}
