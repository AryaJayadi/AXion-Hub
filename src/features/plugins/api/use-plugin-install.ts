"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvailablePlugin } from "@/entities/plugin";
import { queryKeys } from "@/shared/lib/query-keys";
import { usePluginInstallStore } from "../model/plugin-install-store";

/** Mock available plugins in the registry */
const MOCK_AVAILABLE_PLUGINS: AvailablePlugin[] = [
	{
		id: "avail-001",
		name: "Linear Sync",
		version: "1.3.0",
		description: "Two-way sync between AXion tasks and Linear issues",
		author: "AXion Labs",
		downloads: 12400,
		category: "DevOps",
		installed: false,
		icon: "GitBranch",
	},
	{
		id: "avail-002",
		name: "Stripe Billing",
		version: "2.1.0",
		description: "Query invoices, manage subscriptions, and handle payments",
		author: "FinOps Tools",
		downloads: 8900,
		category: "Analytics",
		installed: false,
		icon: "CreditCard",
	},
	{
		id: "avail-003",
		name: "Datadog Metrics",
		version: "1.0.4",
		description: "Fetch metrics, create monitors, and query dashboards",
		author: "AXion Labs",
		downloads: 6200,
		category: "Analytics",
		installed: false,
		icon: "BarChart3",
	},
	{
		id: "plg-001",
		name: "Slack Integration",
		version: "2.4.1",
		description: "Send messages, create channels, and manage Slack workspaces",
		author: "AXion Labs",
		downloads: 45000,
		category: "Messaging",
		installed: true,
		icon: "MessageSquare",
	},
	{
		id: "avail-004",
		name: "Confluence Wiki",
		version: "1.2.0",
		description: "Read and write Confluence pages and search knowledge bases",
		author: "WorkflowHQ",
		downloads: 5100,
		category: "Storage",
		installed: false,
		icon: "BookOpen",
	},
	{
		id: "avail-005",
		name: "OpenAI Embeddings",
		version: "0.8.2",
		description: "Generate and query vector embeddings for semantic search",
		author: "AI Toolbox",
		downloads: 15600,
		category: "AI",
		installed: false,
		icon: "Brain",
	},
	{
		id: "plg-002",
		name: "GitHub Actions",
		version: "1.8.0",
		description: "Trigger workflows, manage PRs, and monitor CI/CD pipelines",
		author: "AXion Labs",
		downloads: 32000,
		category: "DevOps",
		installed: true,
		icon: "Github",
	},
	{
		id: "avail-006",
		name: "Redis Cache",
		version: "1.1.0",
		description: "Read and write cached data with TTL management",
		author: "DataBridge Inc",
		downloads: 4300,
		category: "Storage",
		installed: false,
		icon: "Database",
	},
	{
		id: "avail-007",
		name: "PagerDuty Alerts",
		version: "2.0.1",
		description: "Create incidents, acknowledge alerts, and manage on-call",
		author: "AXion Labs",
		downloads: 7800,
		category: "DevOps",
		installed: false,
		icon: "Bell",
	},
	{
		id: "avail-008",
		name: "Twilio SMS",
		version: "1.4.0",
		description: "Send SMS messages and manage phone number provisioning",
		author: "CommStack",
		downloads: 9200,
		category: "Messaging",
		installed: false,
		icon: "Phone",
	},
	{
		id: "avail-009",
		name: "Google Drive",
		version: "2.2.0",
		description: "Upload, download, and manage files in Google Drive",
		author: "CloudTools",
		downloads: 18700,
		category: "Storage",
		installed: false,
		icon: "HardDrive",
	},
	{
		id: "avail-010",
		name: "Pinecone Vector DB",
		version: "0.6.1",
		description: "Index, query, and manage vectors for RAG pipelines",
		author: "AI Toolbox",
		downloads: 11300,
		category: "AI",
		installed: false,
		icon: "Layers",
	},
	{
		id: "plg-007",
		name: "Notion Connector",
		version: "2.0.0",
		description: "Read and write Notion pages, databases, and blocks",
		author: "AXion Labs",
		downloads: 21400,
		category: "Storage",
		installed: true,
		icon: "FileText",
	},
	{
		id: "avail-011",
		name: "AWS Lambda",
		version: "1.0.0",
		description: "Invoke Lambda functions and manage serverless deployments",
		author: "CloudTools",
		downloads: 3900,
		category: "DevOps",
		installed: false,
		icon: "Zap",
	},
	{
		id: "avail-012",
		name: "Anthropic Tools",
		version: "1.5.0",
		description: "Extended tool use with computer use and code execution",
		author: "AI Toolbox",
		downloads: 24100,
		category: "AI",
		installed: false,
		icon: "Cpu",
	},
];

async function fetchAvailablePlugins(search?: string): Promise<AvailablePlugin[]> {
	await new Promise((resolve) => setTimeout(resolve, 400));
	if (!search) return MOCK_AVAILABLE_PLUGINS;
	const lower = search.toLowerCase();
	return MOCK_AVAILABLE_PLUGINS.filter(
		(p) =>
			p.name.toLowerCase().includes(lower) ||
			p.description.toLowerCase().includes(lower) ||
			p.category.toLowerCase().includes(lower),
	);
}

/** Fetches available plugins from the registry with optional search */
export function useAvailablePlugins(search?: string) {
	return useQuery({
		queryKey: queryKeys.plugins.available(),
		queryFn: () => fetchAvailablePlugins(),
		staleTime: 60_000, // 1 minute
		refetchOnWindowFocus: false,
		select: (data) => {
			if (!search) return data;
			const lower = search.toLowerCase();
			return data.filter(
				(p) =>
					p.name.toLowerCase().includes(lower) ||
					p.description.toLowerCase().includes(lower) ||
					p.category.toLowerCase().includes(lower),
			);
		},
	});
}

/** Install a plugin with simulated progress */
export function useInstallPlugin() {
	const queryClient = useQueryClient();
	const { startInstall, updateProgress, completeInstall, failInstall } =
		usePluginInstallStore.getState();

	return useMutation({
		mutationFn: async (plugin: { id: string; name: string }) => {
			startInstall(plugin.id, plugin.name);

			// Simulate download -> install -> configure -> complete
			await new Promise((resolve) => setTimeout(resolve, 600));
			updateProgress(plugin.id, "downloading", 30);

			await new Promise((resolve) => setTimeout(resolve, 500));
			updateProgress(plugin.id, "installing", 60);

			await new Promise((resolve) => setTimeout(resolve, 500));
			updateProgress(plugin.id, "configuring", 85);

			await new Promise((resolve) => setTimeout(resolve, 400));
			completeInstall(plugin.id);

			return plugin.id;
		},
		onSuccess: (pluginId) => {
			// Mark as installed in the available list
			queryClient.setQueryData<AvailablePlugin[]>(
				queryKeys.plugins.available(),
				(old) =>
					old?.map((p) => (p.id === pluginId ? { ...p, installed: true } : p)),
			);
			// Invalidate installed plugins list
			queryClient.invalidateQueries({ queryKey: queryKeys.plugins.lists() });
		},
		onError: (_err, plugin) => {
			failInstall(plugin.id, "Installation failed. Please try again.");
		},
	});
}
