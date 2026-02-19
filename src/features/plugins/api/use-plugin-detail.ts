"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PluginDetail } from "@/entities/plugin";
import { queryKeys } from "@/shared/lib/query-keys";

/** Generate mock plugin detail data */
function getMockPluginDetail(pluginId: string): PluginDetail {
	return {
		id: pluginId,
		name: pluginId === "plg-001" ? "Slack Integration" : pluginId === "plg-002" ? "GitHub Actions" : "Plugin",
		version: pluginId === "plg-001" ? "2.4.1" : "1.8.0",
		description:
			pluginId === "plg-001"
				? "Send messages, create channels, and manage Slack workspaces"
				: "Trigger workflows, manage PRs, and monitor CI/CD pipelines",
		status: "active",
		lastUpdated: new Date("2026-02-15"),
		author: "AXion Labs",
		homepage: "https://axion.dev/plugins/example",
		permissions: ["read", "write", "manage"],
		agentCount: 4,
		readme: `# ${pluginId === "plg-001" ? "Slack Integration" : "Plugin"}\n\nThis plugin provides deep integration with your workspace tools.\n\n## Features\n\n- **Real-time sync** -- Changes are reflected instantly across all connected agents\n- **Granular permissions** -- Control exactly what each agent can access\n- **Audit logging** -- Every action is recorded for compliance\n\n## Configuration\n\nSet up your API key in the Settings tab. You can generate a new key from your provider dashboard.\n\n## Usage\n\nOnce configured, agents with this plugin enabled can use the following capabilities:\n\n\`\`\`\n/plugin-action send --target #general --message "Hello from AXion"\n\`\`\`\n\n## Troubleshooting\n\nIf you encounter connection issues, verify your API key is valid and has the required scopes.`,
		config: {
			apiKey: "sk-***hidden***",
			defaultChannel: "#general",
			notifyOnError: true,
			maxRetries: 3,
		},
		configSchema: {
			apiKey: { type: "string", label: "API Key", required: true },
			defaultChannel: { type: "string", label: "Default Channel", required: false },
			notifyOnError: { type: "boolean", label: "Notify on Error" },
			maxRetries: { type: "number", label: "Max Retries" },
		},
		agents: [
			{ id: "agent-001", name: "Atlas", enabled: true },
			{ id: "agent-002", name: "Scout", enabled: true },
			{ id: "agent-003", name: "Harbor", enabled: false },
			{ id: "agent-004", name: "Scribe", enabled: true },
		],
		updateHistory: [
			{
				version: "2.4.1",
				date: new Date("2026-02-15"),
				changelog: "Fixed rate limiting issue with batch message sends",
			},
			{
				version: "2.4.0",
				date: new Date("2026-02-01"),
				changelog: "Added support for Slack Canvas and thread replies",
			},
			{
				version: "2.3.0",
				date: new Date("2026-01-15"),
				changelog: "New channel management capabilities and improved error handling",
			},
			{
				version: "2.2.1",
				date: new Date("2025-12-20"),
				changelog: "Security patch for OAuth token refresh flow",
			},
		],
	};
}

async function fetchPluginDetail(pluginId: string): Promise<PluginDetail> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return getMockPluginDetail(pluginId);
}

/** Fetches full detail for a single plugin */
export function usePluginDetail(pluginId: string) {
	return useQuery({
		queryKey: queryKeys.plugins.detail(pluginId),
		queryFn: () => fetchPluginDetail(pluginId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});
}

/** Update plugin configuration */
export function useUpdatePluginConfig(pluginId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (config: Record<string, unknown>) => {
			await new Promise((resolve) => setTimeout(resolve, 400));
			return config;
		},
		onMutate: async (config) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.plugins.detail(pluginId) });
			const previous = queryClient.getQueryData<PluginDetail>(queryKeys.plugins.detail(pluginId));

			queryClient.setQueryData<PluginDetail>(queryKeys.plugins.detail(pluginId), (old) =>
				old ? { ...old, config } : old,
			);

			return { previous };
		},
		onError: (_err, _config, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKeys.plugins.detail(pluginId), context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.plugins.detail(pluginId) });
		},
	});
}

/** Toggle plugin access for a specific agent */
export function useTogglePluginForAgent(pluginId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (agentId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return agentId;
		},
		onMutate: async (agentId) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.plugins.detail(pluginId) });
			const previous = queryClient.getQueryData<PluginDetail>(queryKeys.plugins.detail(pluginId));

			queryClient.setQueryData<PluginDetail>(queryKeys.plugins.detail(pluginId), (old) =>
				old
					? {
							...old,
							agents: old.agents.map((a) =>
								a.id === agentId ? { ...a, enabled: !a.enabled } : a,
							),
						}
					: old,
			);

			return { previous };
		},
		onError: (_err, _agentId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKeys.plugins.detail(pluginId), context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.plugins.detail(pluginId) });
		},
	});
}
