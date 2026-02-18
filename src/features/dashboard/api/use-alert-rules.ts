"use client";

import {
	useQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";
import type { AlertRule, NewAlertRule } from "../model/alert-schema";

// ---------------------------------------------------------------------------
// Mock data -- 3 pre-configured rules matching templates
// ---------------------------------------------------------------------------
const MOCK_RULES: AlertRule[] = [
	{
		id: "rule-1",
		name: "Agent Offline Alert",
		description: "Alert when any agent goes offline for more than 5 minutes",
		templateId: "agent-down",
		enabled: true,
		metric: "agent.status",
		operator: "==",
		threshold: 0,
		duration: 300,
		severity: "critical",
		webhookUrl: null,
		createdAt: new Date("2026-02-15T10:00:00Z"),
		updatedAt: new Date("2026-02-15T10:00:00Z"),
	},
	{
		id: "rule-2",
		name: "High Error Rate",
		description: "Alert when error rate exceeds 10% in 15 minutes",
		templateId: "high-error-rate",
		enabled: true,
		metric: "error.rate",
		operator: ">",
		threshold: 10,
		duration: 900,
		severity: "warning",
		webhookUrl: "https://hooks.slack.com/services/T00/B00/xxx",
		createdAt: new Date("2026-02-16T14:30:00Z"),
		updatedAt: new Date("2026-02-16T14:30:00Z"),
	},
	{
		id: "rule-3",
		name: "Context Window Full",
		description: "Alert when context usage exceeds 90%",
		templateId: "context-window-full",
		enabled: false,
		metric: "agent.context_usage",
		operator: ">",
		threshold: 90,
		duration: 0,
		severity: "warning",
		webhookUrl: null,
		createdAt: new Date("2026-02-17T09:00:00Z"),
		updatedAt: new Date("2026-02-17T09:00:00Z"),
	},
];

// TODO: Replace with real API calls when alert endpoints are available
async function fetchAlertRules(): Promise<AlertRule[]> {
	await new Promise((resolve) => setTimeout(resolve, 250));
	return MOCK_RULES;
}

async function createAlertRuleMock(
	data: Omit<NewAlertRule, "id" | "createdAt" | "updatedAt">,
): Promise<AlertRule> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return {
		id: `rule-${Date.now()}`,
		name: data.name,
		description: data.description ?? null,
		templateId: data.templateId ?? null,
		enabled: data.enabled ?? true,
		metric: data.metric,
		operator: data.operator,
		threshold: data.threshold,
		duration: data.duration ?? 0,
		severity: data.severity,
		webhookUrl: data.webhookUrl ?? null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

async function updateAlertRuleMock(
	data: Partial<AlertRule> & { id: string },
): Promise<AlertRule> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	const existing = MOCK_RULES.find((r) => r.id === data.id);
	return {
		id: data.id,
		name: data.name ?? existing?.name ?? "",
		description: data.description ?? existing?.description ?? null,
		templateId: data.templateId ?? existing?.templateId ?? null,
		enabled: data.enabled ?? existing?.enabled ?? true,
		metric: data.metric ?? existing?.metric ?? "",
		operator: data.operator ?? existing?.operator ?? "",
		threshold: data.threshold ?? existing?.threshold ?? 0,
		duration: data.duration ?? existing?.duration ?? 0,
		severity: data.severity ?? existing?.severity ?? "info",
		webhookUrl: data.webhookUrl ?? existing?.webhookUrl ?? null,
		createdAt: existing?.createdAt ?? new Date(),
		updatedAt: new Date(),
	};
}

async function deleteAlertRuleMock(ruleId: string): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	void ruleId;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetches all alert rules.
 * staleTime: 30 seconds -- rules don't change frequently.
 */
export function useAlertRules() {
	return useQuery({
		queryKey: queryKeys.alerts.rules(),
		queryFn: fetchAlertRules,
		staleTime: 30_000,
	});
}

/**
 * Creates a new alert rule. Optimistically adds to query cache.
 */
export function useCreateAlertRule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAlertRuleMock,
		onSuccess: (rule) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rules() });
			toast.success(`Alert rule "${rule.name}" created`);
		},
		onError: (error) => {
			toast.error("Failed to create alert rule", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		},
	});
}

/**
 * Updates an existing alert rule (toggle enabled, edit fields).
 */
export function useUpdateAlertRule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateAlertRuleMock,
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.alerts.rules() });
			const previous = queryClient.getQueryData<AlertRule[]>(
				queryKeys.alerts.rules(),
			);

			queryClient.setQueryData<AlertRule[]>(
				queryKeys.alerts.rules(),
				(old) =>
					old?.map((rule) =>
						rule.id === updated.id ? { ...rule, ...updated } : rule,
					),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKeys.alerts.rules(), context.previous);
			}
			toast.error("Failed to update alert rule");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rules() });
		},
	});
}

/**
 * Deletes an alert rule.
 */
export function useDeleteAlertRule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAlertRuleMock,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rules() });
			toast.success("Alert rule deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete alert rule", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		},
	});
}
