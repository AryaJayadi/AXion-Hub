"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClawHubSkill } from "@/entities/skill";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock ClawHub registry data with varied categories. */
const MOCK_CLAWHUB_SKILLS: ClawHubSkill[] = [
	// Featured skills
	{
		id: "ch-auto-doc",
		name: "AutoDoc",
		description: "Generate comprehensive documentation from codebases automatically",
		category: "code",
		icon: "book-open",
		version: "3.1.0",
		author: "ClawHub Labs",
		downloads: 45200,
		rating: 4.8,
		featured: true,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-smart-deploy",
		name: "Smart Deploy",
		description: "Intelligent deployment orchestration with rollback and canary support",
		category: "integration",
		icon: "rocket",
		version: "2.4.0",
		author: "DevOps Collective",
		downloads: 38100,
		rating: 4.7,
		featured: true,
		trending: true,
		installable: true,
		installed: false,
	},
	{
		id: "ch-data-pipeline",
		name: "Data Pipeline",
		description: "Build and manage ETL pipelines with visual flow designer",
		category: "data",
		icon: "workflow",
		version: "4.0.2",
		author: "DataForge Inc.",
		downloads: 31500,
		rating: 4.6,
		featured: true,
		trending: false,
		installable: true,
		installed: false,
	},
	// Trending skills
	{
		id: "ch-ai-refactor",
		name: "AI Refactor",
		description: "Refactor code with AI-driven suggestions and automated transformations",
		category: "code",
		icon: "wand-sparkles",
		version: "1.2.0",
		author: "CodeCraft",
		downloads: 12300,
		rating: 4.5,
		featured: false,
		trending: true,
		installable: true,
		installed: false,
	},
	{
		id: "ch-realtime-collab",
		name: "Realtime Collab",
		description: "Enable real-time collaboration between agents with conflict resolution",
		category: "communication",
		icon: "users",
		version: "1.0.3",
		author: "SyncTeam",
		downloads: 8900,
		rating: 4.4,
		featured: false,
		trending: true,
		installable: true,
		installed: false,
	},
	{
		id: "ch-cost-guard",
		name: "Cost Guard",
		description: "Monitor and optimize API costs with smart token management",
		category: "security",
		icon: "shield-alert",
		version: "2.0.1",
		author: "FinOps Tools",
		downloads: 15600,
		rating: 4.3,
		featured: false,
		trending: true,
		installable: true,
		installed: false,
	},
	// Standard skills
	{
		id: "ch-markdown-pro",
		name: "Markdown Pro",
		description: "Advanced markdown rendering with diagrams, math, and embeds",
		category: "productivity",
		icon: "file-text",
		version: "2.3.1",
		author: "DocTools",
		downloads: 22400,
		rating: 4.6,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-api-mocker",
		name: "API Mocker",
		description: "Generate realistic mock APIs and fixtures from OpenAPI specs",
		category: "code",
		icon: "server",
		version: "1.5.0",
		author: "MockLab",
		downloads: 9800,
		rating: 4.2,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-linear-sync",
		name: "Linear Sync",
		description: "Bi-directional sync between AXion missions and Linear issues",
		category: "integration",
		icon: "arrow-left-right",
		version: "1.1.0",
		author: "WorkflowBridge",
		downloads: 6700,
		rating: 4.1,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-sentiment",
		name: "Sentiment Analyzer",
		description: "Analyze text sentiment and emotional tone in conversations",
		category: "data",
		icon: "brain",
		version: "2.0.0",
		author: "NLPWorks",
		downloads: 14200,
		rating: 4.4,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-cron-scheduler",
		name: "Cron Scheduler",
		description: "Schedule recurring tasks with cron expressions and timezone support",
		category: "productivity",
		icon: "clock",
		version: "1.3.0",
		author: "TimeKeep",
		downloads: 18300,
		rating: 4.5,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-secret-vault",
		name: "Secret Vault",
		description: "Secure credential storage and rotation for agent integrations",
		category: "security",
		icon: "lock",
		version: "3.0.0",
		author: "VaultSec",
		downloads: 27800,
		rating: 4.7,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-discord-bot",
		name: "Discord Bot Bridge",
		description: "Connect agents to Discord servers with command and event handling",
		category: "communication",
		icon: "message-circle",
		version: "1.4.2",
		author: "BotForge",
		downloads: 11200,
		rating: 4.0,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-perf-profiler",
		name: "Performance Profiler",
		description: "Profile and benchmark agent execution with detailed flame graphs",
		category: "code",
		icon: "activity",
		version: "1.0.1",
		author: "PerfLabs",
		downloads: 5400,
		rating: 4.3,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-notion-sync",
		name: "Notion Sync",
		description: "Sync workspace files and notes with Notion databases",
		category: "integration",
		icon: "notebook",
		version: "2.1.0",
		author: "SyncWorks",
		downloads: 19600,
		rating: 4.5,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-image-gen",
		name: "Image Generator",
		description: "Generate images from text prompts using DALL-E and Stable Diffusion",
		category: "productivity",
		icon: "image",
		version: "1.2.0",
		author: "PixelAI",
		downloads: 32100,
		rating: 4.6,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-compliance-check",
		name: "Compliance Checker",
		description: "Validate outputs against regulatory and organizational policies",
		category: "security",
		icon: "file-check",
		version: "1.0.0",
		author: "GovTech",
		downloads: 4200,
		rating: 4.1,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
	{
		id: "ch-webhook-relay",
		name: "Webhook Relay",
		description: "Receive and route webhooks from external services to agents",
		category: "integration",
		icon: "webhook",
		version: "1.6.0",
		author: "HookStream",
		downloads: 16800,
		rating: 4.4,
		featured: false,
		trending: false,
		installable: true,
		installed: false,
	},
];

async function fetchClawHubSkills(
	_filters?: Record<string, unknown>,
): Promise<ClawHubSkill[]> {
	await new Promise((resolve) => setTimeout(resolve, 500));
	return MOCK_CLAWHUB_SKILLS;
}

/**
 * Fetches ClawHub registry skills with optional filters.
 * staleTime: 30s for moderate freshness.
 */
export function useClawHubSkills(filters?: Record<string, unknown>) {
	return useQuery({
		queryKey: queryKeys.clawhub.list(filters),
		queryFn: () => fetchClawHubSkills(filters),
		staleTime: 30_000,
	});
}

/**
 * Install a skill from ClawHub registry.
 * Marks skill as installed and invalidates both ClawHub and skills caches.
 */
export function useInstallFromClawHub() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (skillId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 1200));
			return skillId;
		},
		onMutate: async (skillId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.clawhub.all,
			});

			const previousSkills = queryClient.getQueryData<ClawHubSkill[]>(
				queryKeys.clawhub.list(),
			);

			// Mark as installed optimistically
			queryClient.setQueryData<ClawHubSkill[]>(
				queryKeys.clawhub.list(),
				(old) =>
					old?.map((s) =>
						s.id === skillId
							? { ...s, installed: true, installable: false }
							: s,
					) ?? [],
			);

			return { previousSkills };
		},
		onError: (_err, _skillId, context) => {
			if (context?.previousSkills) {
				queryClient.setQueryData(
					queryKeys.clawhub.list(),
					context.previousSkills,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.clawhub.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.skills.all,
			});
		},
	});
}
