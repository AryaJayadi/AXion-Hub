/**
 * TanStack Query hooks for webhook endpoint management.
 *
 * Returns mock WebhookEndpoint data until a backend API is available.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookRunRecord {
	id: string;
	status: "success" | "error" | "running";
	duration: number; // ms
	startedAt: Date;
	sourceIp: string;
	payload: string; // truncated JSON
}

export interface WebhookEndpoint {
	id: string;
	name: string;
	url: string;
	secret: string;
	workflowId: string;
	workflowName: string;
	status: "active" | "disabled";
	lastTriggeredAt: Date | null;
	createdAt: Date;
	runs: WebhookRunRecord[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateToken(length: number): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function generateSecret(): string {
	return `whsec_${generateToken(32)}`;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
	{
		id: "wh-1",
		name: "Customer Onboarding Trigger",
		url: "https://axion.hub/api/webhooks/wh_abc123def456",
		secret: "whsec_k9m2n4p6q8r0s2t4u6v8w0x2y4z6a8b0",
		workflowId: "wf-1",
		workflowName: "Customer Onboarding",
		status: "active",
		lastTriggeredAt: new Date("2026-02-19T06:15:00Z"),
		createdAt: new Date("2026-01-20T10:00:00Z"),
		runs: [
			{
				id: "run-wh1-1",
				status: "success",
				duration: 2340,
				startedAt: new Date("2026-02-19T06:15:00Z"),
				sourceIp: "203.0.113.42",
				payload: '{"event": "customer.created", "customer_id": "cust_123", "email": "user@example.com"}',
			},
			{
				id: "run-wh1-2",
				status: "success",
				duration: 2100,
				startedAt: new Date("2026-02-18T14:22:00Z"),
				sourceIp: "203.0.113.42",
				payload: '{"event": "customer.created", "customer_id": "cust_122", "email": "another@example.com"}',
			},
			{
				id: "run-wh1-3",
				status: "error",
				duration: 890,
				startedAt: new Date("2026-02-17T09:10:00Z"),
				sourceIp: "198.51.100.15",
				payload: '{"event": "customer.created", "customer_id": "cust_121"}',
			},
		],
	},
	{
		id: "wh-2",
		name: "GitHub Push Handler",
		url: "https://axion.hub/api/webhooks/wh_gh789xyz012",
		secret: "whsec_c2d4e6f8g0h2i4j6k8l0m2n4o6p8q0r2",
		workflowId: "wf-5",
		workflowName: "Data Sync Pipeline",
		status: "active",
		lastTriggeredAt: new Date("2026-02-19T05:45:00Z"),
		createdAt: new Date("2026-02-01T08:00:00Z"),
		runs: [
			{
				id: "run-wh2-1",
				status: "success",
				duration: 5600,
				startedAt: new Date("2026-02-19T05:45:00Z"),
				sourceIp: "140.82.115.10",
				payload: '{"ref": "refs/heads/main", "repository": {"full_name": "org/repo"}, "commits": [{"id": "abc123"}]}',
			},
			{
				id: "run-wh2-2",
				status: "success",
				duration: 5200,
				startedAt: new Date("2026-02-18T22:30:00Z"),
				sourceIp: "140.82.115.10",
				payload: '{"ref": "refs/heads/develop", "repository": {"full_name": "org/repo"}, "commits": []}',
			},
		],
	},
	{
		id: "wh-3",
		name: "Stripe Payment Events",
		url: "https://axion.hub/api/webhooks/wh_str345mno678",
		secret: "whsec_s4t6u8v0w2x4y6z8a0b2c4d6e8f0g2h4",
		workflowId: "wf-6",
		workflowName: "Incident Response Playbook",
		status: "active",
		lastTriggeredAt: new Date("2026-02-18T16:30:00Z"),
		createdAt: new Date("2026-01-25T14:00:00Z"),
		runs: [
			{
				id: "run-wh3-1",
				status: "success",
				duration: 1200,
				startedAt: new Date("2026-02-18T16:30:00Z"),
				sourceIp: "54.187.174.169",
				payload: '{"type": "payment_intent.succeeded", "data": {"object": {"amount": 2000, "currency": "usd"}}}',
			},
			{
				id: "run-wh3-2",
				status: "error",
				duration: 450,
				startedAt: new Date("2026-02-17T10:15:00Z"),
				sourceIp: "54.187.174.169",
				payload: '{"type": "payment_intent.failed", "data": {"object": {"amount": 5000, "currency": "usd"}}}',
			},
			{
				id: "run-wh3-3",
				status: "success",
				duration: 980,
				startedAt: new Date("2026-02-16T08:00:00Z"),
				sourceIp: "54.187.174.169",
				payload: '{"type": "charge.refunded", "data": {"object": {"amount": 1500}}}',
			},
		],
	},
	{
		id: "wh-4",
		name: "Slack Bot Events",
		url: "https://axion.hub/api/webhooks/wh_slk901pqr234",
		secret: "whsec_i4j6k8l0m2n4o6p8q0r2s4t6u8v0w2x4",
		workflowId: "wf-3",
		workflowName: "Error Escalation Pipeline",
		status: "disabled",
		lastTriggeredAt: new Date("2026-02-10T12:00:00Z"),
		createdAt: new Date("2026-02-05T16:00:00Z"),
		runs: [
			{
				id: "run-wh4-1",
				status: "success",
				duration: 780,
				startedAt: new Date("2026-02-10T12:00:00Z"),
				sourceIp: "34.226.206.19",
				payload: '{"type": "message", "channel": "C0123456", "text": "Bot command received"}',
			},
		],
	},
];

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

export function useWebhooks() {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.workflows.webhooks(),
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MOCK_WEBHOOKS;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	return {
		webhooks: data ?? [],
		isLoading,
		error,
	};
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { name: string; workflowId: string }) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			const token = `wh_${generateToken(16)}`;
			const newWebhook: WebhookEndpoint = {
				id: `wh-${Date.now()}`,
				name: input.name,
				url: `https://axion.hub/api/webhooks/${token}`,
				secret: generateSecret(),
				workflowId: input.workflowId,
				workflowName: "Selected Workflow",
				status: "active",
				lastTriggeredAt: null,
				createdAt: new Date(),
				runs: [],
			};
			return newWebhook;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});
			toast.success("Webhook created");
		},
	});
}

export function useUpdateWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { id: string; status: "active" | "disabled" }) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return input;
		},
		onMutate: async (input) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});

			const previous = queryClient.getQueryData<WebhookEndpoint[]>(
				queryKeys.workflows.webhooks(),
			);

			queryClient.setQueryData<WebhookEndpoint[]>(
				queryKeys.workflows.webhooks(),
				(old) =>
					old?.map((wh) =>
						wh.id === input.id ? { ...wh, status: input.status } : wh,
					),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.workflows.webhooks(),
					context.previous,
				);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});
		},
	});
}

export function useDeleteWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return id;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});

			const previous = queryClient.getQueryData<WebhookEndpoint[]>(
				queryKeys.workflows.webhooks(),
			);

			queryClient.setQueryData<WebhookEndpoint[]>(
				queryKeys.workflows.webhooks(),
				(old) => old?.filter((wh) => wh.id !== id),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.workflows.webhooks(),
					context.previous,
				);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});
		},
	});
}

export function useRetryWebhookRun() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			webhookId: string;
			runId: string;
			overridePayload?: string;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return input;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});
			toast.success("Webhook run retry queued");
		},
	});
}

export function useRegenerateWebhookSecret() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (webhookId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { webhookId, secret: generateSecret() };
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.webhooks(),
			});
			toast.success("Secret regenerated");
		},
	});
}
