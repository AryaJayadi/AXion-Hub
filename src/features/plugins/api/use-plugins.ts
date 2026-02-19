"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Plugin } from "@/entities/plugin";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock installed plugins for development */
const MOCK_PLUGINS: Plugin[] = [
	{
		id: "plg-001",
		name: "Slack Integration",
		version: "2.4.1",
		description: "Send messages, create channels, and manage Slack workspaces",
		status: "active",
		lastUpdated: new Date("2026-02-15"),
		author: "AXion Labs",
		homepage: "https://axion.dev/plugins/slack",
		permissions: ["messages:write", "channels:manage", "users:read"],
		agentCount: 5,
	},
	{
		id: "plg-002",
		name: "GitHub Actions",
		version: "1.8.0",
		description: "Trigger workflows, manage PRs, and monitor CI/CD pipelines",
		status: "active",
		lastUpdated: new Date("2026-02-10"),
		author: "AXion Labs",
		homepage: "https://axion.dev/plugins/github",
		permissions: ["repos:read", "actions:trigger", "pulls:manage"],
		agentCount: 3,
	},
	{
		id: "plg-003",
		name: "PostgreSQL Query",
		version: "1.2.3",
		description: "Execute read-only SQL queries against PostgreSQL databases",
		status: "active",
		lastUpdated: new Date("2026-01-28"),
		author: "DataBridge Inc",
		homepage: null,
		permissions: ["db:read"],
		agentCount: 2,
	},
	{
		id: "plg-004",
		name: "Jira Sync",
		version: "3.1.0",
		description: "Sync tasks, update issues, and manage sprints in Jira",
		status: "disabled",
		lastUpdated: new Date("2026-02-01"),
		author: "WorkflowHQ",
		homepage: "https://workflowhq.io/jira",
		permissions: ["issues:read", "issues:write", "sprints:manage"],
		agentCount: 0,
	},
	{
		id: "plg-005",
		name: "S3 File Manager",
		version: "1.0.2",
		description: "Upload, download, and manage files in AWS S3 buckets",
		status: "active",
		lastUpdated: new Date("2026-02-12"),
		author: "CloudTools",
		homepage: "https://cloudtools.dev/s3",
		permissions: ["s3:read", "s3:write"],
		agentCount: 4,
	},
	{
		id: "plg-006",
		name: "Sentry Monitor",
		version: "0.9.1",
		description: "Query error logs, resolve issues, and track performance",
		status: "error",
		lastUpdated: new Date("2026-02-08"),
		author: "AXion Labs",
		homepage: "https://axion.dev/plugins/sentry",
		permissions: ["errors:read", "issues:manage"],
		agentCount: 1,
	},
	{
		id: "plg-007",
		name: "Notion Connector",
		version: "2.0.0",
		description: "Read and write Notion pages, databases, and blocks",
		status: "active",
		lastUpdated: new Date("2026-02-17"),
		author: "AXion Labs",
		homepage: "https://axion.dev/plugins/notion",
		permissions: ["pages:read", "pages:write", "databases:query"],
		agentCount: 6,
	},
	{
		id: "plg-008",
		name: "Webhook Relay",
		version: "1.1.0",
		description: "Forward and transform incoming webhooks to agent actions",
		status: "disabled",
		lastUpdated: new Date("2026-01-20"),
		author: "NetBridge",
		homepage: null,
		permissions: ["webhooks:receive", "webhooks:send"],
		agentCount: 0,
	},
];

async function fetchPlugins(): Promise<Plugin[]> {
	await new Promise((resolve) => setTimeout(resolve, 350));
	return MOCK_PLUGINS;
}

/** Fetches the list of installed plugins */
export function usePlugins() {
	return useQuery({
		queryKey: queryKeys.plugins.lists(),
		queryFn: fetchPlugins,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

/** Toggle a plugin between active and disabled */
export function useTogglePlugin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pluginId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return pluginId;
		},
		onMutate: async (pluginId) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.plugins.lists() });
			const previous = queryClient.getQueryData<Plugin[]>(queryKeys.plugins.lists());

			queryClient.setQueryData<Plugin[]>(queryKeys.plugins.lists(), (old) =>
				old?.map((p) =>
					p.id === pluginId
						? { ...p, status: p.status === "active" ? ("disabled" as const) : ("active" as const) }
						: p,
				),
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKeys.plugins.lists(), context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
		},
	});
}

/** Uninstall a plugin from the workspace */
export function useUninstallPlugin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pluginId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return pluginId;
		},
		onMutate: async (pluginId) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.plugins.lists() });
			const previous = queryClient.getQueryData<Plugin[]>(queryKeys.plugins.lists());

			queryClient.setQueryData<Plugin[]>(queryKeys.plugins.lists(), (old) =>
				old?.filter((p) => p.id !== pluginId),
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKeys.plugins.lists(), context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
		},
	});
}
