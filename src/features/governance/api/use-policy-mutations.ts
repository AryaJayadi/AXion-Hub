"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { PolicyRule } from "@/entities/governance";
import type { PolicyRuleInput } from "@/entities/governance";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Creates a new governance policy with optimistic cache insert.
 */
export function useCreatePolicy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: PolicyRuleInput): Promise<PolicyRule> => {
			await new Promise((r) => setTimeout(r, 300));

			const policy: PolicyRule = {
				id: `policy-${nanoid(8)}`,
				name: data.name,
				description: data.description ?? undefined,
				conditions: data.conditions,
				action: data.action,
				actionConfig: data.actionConfig ?? undefined,
				enabled: data.enabled,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			return policy;
		},
		onMutate: async (data) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.governance.policies(),
			});

			const previous = queryClient.getQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
			);

			const tempPolicy: PolicyRule = {
				id: `temp-${nanoid(6)}`,
				name: data.name,
				description: data.description ?? undefined,
				conditions: data.conditions,
				action: data.action,
				actionConfig: data.actionConfig ?? undefined,
				enabled: data.enabled,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			queryClient.setQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
				(old) => [...(old ?? []), tempPolicy],
			);

			return { previous, tempId: tempPolicy.id };
		},
		onSuccess: (policy, _data, context) => {
			// Replace temp with real policy
			if (context?.tempId) {
				queryClient.setQueryData<PolicyRule[]>(
					queryKeys.governance.policies(),
					(old) =>
						(old ?? []).map((p) =>
							p.id === context.tempId ? policy : p,
						),
				);
			}
			toast.success("Policy created");
		},
		onError: (_err, _data, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.governance.policies(),
					context.previous,
				);
			}
			toast.error("Failed to create policy");
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.governance.policies(),
			});
		},
	});
}

/**
 * Updates an existing governance policy.
 */
export function useUpdatePolicy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: PolicyRuleInput;
		}): Promise<PolicyRule> => {
			await new Promise((r) => setTimeout(r, 300));

			const existing = queryClient
				.getQueryData<PolicyRule[]>(queryKeys.governance.policies())
				?.find((p) => p.id === id);

			return {
				id,
				name: data.name,
				description: data.description ?? undefined,
				conditions: data.conditions,
				action: data.action,
				actionConfig: data.actionConfig ?? undefined,
				enabled: data.enabled,
				createdAt: existing?.createdAt ?? new Date(),
				updatedAt: new Date(),
			};
		},
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.governance.policies(),
			});

			const previous = queryClient.getQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
			);

			queryClient.setQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
				(old) =>
					(old ?? []).map((p) =>
						p.id === id
							? {
									...p,
									...data,
									description: data.description ?? undefined,
									actionConfig: data.actionConfig ?? undefined,
									updatedAt: new Date(),
								}
							: p,
					),
			);

			return { previous };
		},
		onSuccess: (policy) => {
			queryClient.setQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
				(old) => (old ?? []).map((p) => (p.id === policy.id ? policy : p)),
			);
			toast.success("Policy updated");
		},
		onError: (_err, _data, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.governance.policies(),
					context.previous,
				);
			}
			toast.error("Failed to update policy");
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.governance.policies(),
			});
		},
	});
}

/**
 * Deletes a governance policy from the cache.
 */
export function useDeletePolicy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<string> => {
			await new Promise((r) => setTimeout(r, 300));
			return id;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.governance.policies(),
			});

			const previous = queryClient.getQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
			);

			queryClient.setQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
				(old) => (old ?? []).filter((p) => p.id !== id),
			);

			return { previous };
		},
		onSuccess: () => {
			toast.success("Policy deleted");
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.governance.policies(),
					context.previous,
				);
			}
			toast.error("Failed to delete policy");
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.governance.policies(),
			});
		},
	});
}

/**
 * Toggles a policy enabled/disabled state optimistically.
 */
export function useTogglePolicy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			enabled,
		}: {
			id: string;
			enabled: boolean;
		}): Promise<{ id: string; enabled: boolean }> => {
			await new Promise((r) => setTimeout(r, 200));
			return { id, enabled };
		},
		onMutate: async ({ id, enabled }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.governance.policies(),
			});

			const previous = queryClient.getQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
			);

			let toggledName = "";

			queryClient.setQueryData<PolicyRule[]>(
				queryKeys.governance.policies(),
				(old) =>
					(old ?? []).map((p) => {
						if (p.id === id) {
							toggledName = p.name;
							return { ...p, enabled, updatedAt: new Date() };
						}
						return p;
					}),
			);

			return { previous, toggledName };
		},
		onSuccess: (_data, { enabled }, context) => {
			const name = context?.toggledName ?? "Policy";
			toast.success(`${name} ${enabled ? "enabled" : "disabled"}`);
		},
		onError: (_err, _data, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.governance.policies(),
					context.previous,
				);
			}
			toast.error("Failed to toggle policy");
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.governance.policies(),
			});
		},
	});
}
