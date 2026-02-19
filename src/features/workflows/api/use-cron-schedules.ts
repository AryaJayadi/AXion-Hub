/**
 * TanStack Query hooks for cron schedule management.
 *
 * Returns mock CronSchedule data until a backend API is available.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CronRunRecord {
	id: string;
	status: "success" | "error" | "running";
	duration: number; // ms
	startedAt: Date;
	triggeredBy: string;
	payload?: string;
}

export interface CronSchedule {
	id: string;
	name: string;
	workflowId: string;
	workflowName: string;
	expression: string;
	enabled: boolean;
	lastRunAt: Date | null;
	lastRunStatus: "success" | "error" | null;
	nextRunAt: Date;
	createdAt: Date;
	runs: CronRunRecord[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CRON_SCHEDULES: CronSchedule[] = [
	{
		id: "cron-1",
		name: "Daily Report Generation",
		workflowId: "wf-2",
		workflowName: "Daily Report Generator",
		expression: "0 0 * * *",
		enabled: true,
		lastRunAt: new Date("2026-02-19T00:00:00Z"),
		lastRunStatus: "success",
		nextRunAt: new Date("2026-02-20T00:00:00Z"),
		createdAt: new Date("2026-01-15T10:00:00Z"),
		runs: [
			{
				id: "run-c1-1",
				status: "success",
				duration: 4520,
				startedAt: new Date("2026-02-19T00:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"reportType": "daily", "recipients": ["team@example.com"]}',
			},
			{
				id: "run-c1-2",
				status: "success",
				duration: 4230,
				startedAt: new Date("2026-02-18T00:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"reportType": "daily", "recipients": ["team@example.com"]}',
			},
			{
				id: "run-c1-3",
				status: "error",
				duration: 1200,
				startedAt: new Date("2026-02-17T00:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"reportType": "daily", "recipients": ["team@example.com"]}',
			},
		],
	},
	{
		id: "cron-2",
		name: "Health Check Sweep",
		workflowId: "wf-5",
		workflowName: "Data Sync Pipeline",
		expression: "0 */6 * * *",
		enabled: true,
		lastRunAt: new Date("2026-02-19T06:00:00Z"),
		lastRunStatus: "success",
		nextRunAt: new Date("2026-02-19T12:00:00Z"),
		createdAt: new Date("2026-01-20T14:00:00Z"),
		runs: [
			{
				id: "run-c2-1",
				status: "success",
				duration: 8900,
				startedAt: new Date("2026-02-19T06:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"syncMode": "incremental"}',
			},
			{
				id: "run-c2-2",
				status: "success",
				duration: 9100,
				startedAt: new Date("2026-02-19T00:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"syncMode": "incremental"}',
			},
		],
	},
	{
		id: "cron-3",
		name: "Monday Standup Summary",
		workflowId: "wf-1",
		workflowName: "Customer Onboarding",
		expression: "0 9 * * 1",
		enabled: true,
		lastRunAt: new Date("2026-02-17T09:00:00Z"),
		lastRunStatus: "success",
		nextRunAt: new Date("2026-02-24T09:00:00Z"),
		createdAt: new Date("2026-02-01T08:00:00Z"),
		runs: [
			{
				id: "run-c3-1",
				status: "success",
				duration: 3200,
				startedAt: new Date("2026-02-17T09:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"team": "engineering", "format": "summary"}',
			},
			{
				id: "run-c3-2",
				status: "success",
				duration: 3050,
				startedAt: new Date("2026-02-10T09:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"team": "engineering", "format": "summary"}',
			},
			{
				id: "run-c3-3",
				status: "success",
				duration: 3400,
				startedAt: new Date("2026-02-03T09:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"team": "engineering", "format": "summary"}',
			},
		],
	},
	{
		id: "cron-4",
		name: "Nightly Cleanup",
		workflowId: "wf-6",
		workflowName: "Incident Response Playbook",
		expression: "30 2 * * *",
		enabled: false,
		lastRunAt: new Date("2026-02-14T02:30:00Z"),
		lastRunStatus: "error",
		nextRunAt: new Date("2026-02-20T02:30:00Z"),
		createdAt: new Date("2026-01-10T16:00:00Z"),
		runs: [
			{
				id: "run-c4-1",
				status: "error",
				duration: 500,
				startedAt: new Date("2026-02-14T02:30:00Z"),
				triggeredBy: "scheduler",
				payload: '{"cleanupTargets": ["temp_files", "expired_sessions"]}',
			},
			{
				id: "run-c4-2",
				status: "success",
				duration: 6700,
				startedAt: new Date("2026-02-13T02:30:00Z"),
				triggeredBy: "scheduler",
				payload: '{"cleanupTargets": ["temp_files", "expired_sessions"]}',
			},
		],
	},
	{
		id: "cron-5",
		name: "Hourly Metrics Rollup",
		workflowId: "wf-2",
		workflowName: "Daily Report Generator",
		expression: "0 * * * *",
		enabled: true,
		lastRunAt: new Date("2026-02-19T07:00:00Z"),
		lastRunStatus: "success",
		nextRunAt: new Date("2026-02-19T08:00:00Z"),
		createdAt: new Date("2026-02-05T12:00:00Z"),
		runs: [
			{
				id: "run-c5-1",
				status: "success",
				duration: 1200,
				startedAt: new Date("2026-02-19T07:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"metricsWindow": "1h"}',
			},
			{
				id: "run-c5-2",
				status: "success",
				duration: 1100,
				startedAt: new Date("2026-02-19T06:00:00Z"),
				triggeredBy: "scheduler",
				payload: '{"metricsWindow": "1h"}',
			},
		],
	},
];

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

export function useCronSchedules() {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.workflows.cron(),
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_CRON_SCHEDULES;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	return {
		schedules: data ?? [],
		isLoading,
		error,
	};
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateCronSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			name: string;
			workflowId: string;
			expression: string;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			const newSchedule: CronSchedule = {
				id: `cron-${Date.now()}`,
				name: input.name,
				workflowId: input.workflowId,
				workflowName: "Selected Workflow",
				expression: input.expression,
				enabled: true,
				lastRunAt: null,
				lastRunStatus: null,
				nextRunAt: new Date(Date.now() + 86400000),
				createdAt: new Date(),
				runs: [],
			};
			return newSchedule;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.cron(),
			});
			toast.success("Schedule created");
		},
	});
}

export function useUpdateCronSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			id: string;
			enabled?: boolean;
			expression?: string;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return input;
		},
		onMutate: async (input) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.workflows.cron(),
			});

			const previous = queryClient.getQueryData<CronSchedule[]>(
				queryKeys.workflows.cron(),
			);

			queryClient.setQueryData<CronSchedule[]>(
				queryKeys.workflows.cron(),
				(old) =>
					old?.map((s) =>
						s.id === input.id
							? {
									...s,
									...(input.enabled !== undefined
										? { enabled: input.enabled }
										: {}),
									...(input.expression !== undefined
										? { expression: input.expression }
										: {}),
								}
							: s,
					),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.workflows.cron(),
					context.previous,
				);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.cron(),
			});
		},
	});
}

export function useDeleteCronSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return id;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.workflows.cron(),
			});

			const previous = queryClient.getQueryData<CronSchedule[]>(
				queryKeys.workflows.cron(),
			);

			queryClient.setQueryData<CronSchedule[]>(
				queryKeys.workflows.cron(),
				(old) => old?.filter((s) => s.id !== id),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.workflows.cron(),
					context.previous,
				);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.cron(),
			});
		},
	});
}

export function useRetryCronRun() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			scheduleId: string;
			runId: string;
			overridePayload?: string;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return input;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.cron(),
			});
			toast.success("Run retry queued");
		},
	});
}
