"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

import type { ApprovalAction, ApprovalItem } from "@/entities/approval";
import { queryKeys } from "@/shared/lib/query-keys";

interface ApprovalActionInput {
	taskId: string;
	action: ApprovalAction;
}

const ACTION_TOAST: Record<
	ApprovalAction["type"],
	{ message: string; icon: typeof CheckCircle }
> = {
	approve: { message: "Task approved", icon: CheckCircle },
	reject: { message: "Task rejected", icon: XCircle },
	revision: { message: "Revision requested", icon: RotateCcw },
};

// TODO: Replace with real API call when wired
async function submitApprovalAction(input: ApprovalActionInput): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Mutation hook for approval actions (approve/reject/revision).
 * Optimistically removes the item from the approvals list cache.
 */
export function useApprovalActions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: submitApprovalAction,
		onMutate: async (input) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: queryKeys.approvals.lists(),
			});

			// Snapshot previous value
			const previousApprovals = queryClient.getQueryData<ApprovalItem[]>(
				queryKeys.approvals.lists(),
			);

			// Optimistically remove the item from the list
			if (previousApprovals) {
				queryClient.setQueryData(
					queryKeys.approvals.lists(),
					previousApprovals.filter(
						(item) => item.taskId !== input.taskId,
					),
				);
			}

			return { previousApprovals };
		},
		onSuccess: (_data, input) => {
			const toastConfig = ACTION_TOAST[input.action.type];
			toast.success(toastConfig.message);
		},
		onError: (_error, _input, context) => {
			// Rollback on error
			if (context?.previousApprovals) {
				queryClient.setQueryData(
					queryKeys.approvals.lists(),
					context.previousApprovals,
				);
			}
			toast.error("Action failed. Please try again.");
		},
		onSettled: (_data, _error, input) => {
			// Invalidate to ensure fresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.approvals.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.tasks.detail(input.taskId),
			});
		},
	});
}
