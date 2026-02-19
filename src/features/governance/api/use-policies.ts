"use client";

import { useQuery } from "@tanstack/react-query";
import type { PolicyRule } from "@/entities/governance";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock governance policies for development */
const MOCK_POLICIES: PolicyRule[] = [
	{
		id: "policy-require-approval",
		name: "Require approval for high-priority tasks",
		description:
			"Any task marked as high priority must be reviewed and approved by a human before completion.",
		conditions: [
			{ field: "task_priority", operator: "equals", value: "high" },
		],
		action: "require_approval",
		actionConfig: undefined,
		enabled: true,
		createdAt: new Date("2026-01-15T09:00:00Z"),
		updatedAt: new Date("2026-02-10T14:30:00Z"),
	},
	{
		id: "policy-block-tools",
		name: "Block dangerous tools",
		description:
			"Prevent agents from using shell execution tools that could modify system state.",
		conditions: [
			{ field: "tool", operator: "contains", value: "shell_exec" },
		],
		action: "block",
		actionConfig: undefined,
		enabled: true,
		createdAt: new Date("2026-01-20T11:00:00Z"),
		updatedAt: new Date("2026-01-20T11:00:00Z"),
	},
	{
		id: "policy-auto-approve-low-cost",
		name: "Auto-approve low-cost operations",
		description:
			"Operations costing less than $1.00 are automatically approved to reduce manual overhead.",
		conditions: [
			{ field: "cost", operator: "less_than", value: "1.00" },
		],
		action: "auto_approve",
		actionConfig: undefined,
		enabled: true,
		createdAt: new Date("2026-01-25T08:00:00Z"),
		updatedAt: new Date("2026-02-05T16:00:00Z"),
	},
	{
		id: "policy-notify-errors",
		name: "Notify on agent errors",
		description:
			"Send a notification when any task enters a failed state for visibility.",
		conditions: [
			{ field: "task_status", operator: "equals", value: "failed" },
		],
		action: "notify",
		actionConfig: undefined,
		enabled: false,
		createdAt: new Date("2026-02-01T10:00:00Z"),
		updatedAt: new Date("2026-02-12T09:00:00Z"),
	},
];

// TODO: Replace with API call when backend wired
async function fetchPolicies(): Promise<PolicyRule[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_POLICIES;
}

/**
 * Fetches governance policies via TanStack Query.
 * staleTime: Infinity -- policies are static until mutated.
 */
export function usePolicies() {
	return useQuery({
		queryKey: queryKeys.governance.policies(),
		queryFn: fetchPolicies,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}
