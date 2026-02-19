"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Skill } from "@/entities/skill";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock installed skills data for development. */
const MOCK_SKILLS: Skill[] = [
	{
		id: "skill-code-review",
		name: "Code Review",
		description: "Analyze pull requests for bugs, style, and best practices",
		category: "code",
		icon: "git-pull-request",
		version: "2.1.0",
		status: "enabled",
		agentCount: 4,
		configSchema: {
			severity: "string",
			maxFileSize: "number",
			autoApprove: "boolean",
		},
		installedAt: new Date("2026-01-10"),
	},
	{
		id: "skill-test-gen",
		name: "Test Generator",
		description: "Auto-generate unit and integration tests from source code",
		category: "code",
		icon: "test-tube",
		version: "1.3.2",
		status: "enabled",
		agentCount: 3,
		configSchema: {
			framework: "string",
			coverage: "number",
		},
		installedAt: new Date("2026-01-12"),
	},
	{
		id: "skill-slack-notify",
		name: "Slack Notifications",
		description: "Send notifications and updates to Slack channels",
		category: "communication",
		icon: "message-square",
		version: "1.0.4",
		status: "enabled",
		agentCount: 6,
		configSchema: {
			webhookUrl: "string",
			channel: "string",
			mentionOnError: "boolean",
		},
		installedAt: new Date("2026-01-15"),
	},
	{
		id: "skill-email-compose",
		name: "Email Composer",
		description: "Draft and format professional emails from context",
		category: "communication",
		icon: "mail",
		version: "1.1.0",
		status: "disabled",
		agentCount: 0,
		configSchema: null,
		installedAt: new Date("2026-01-20"),
	},
	{
		id: "skill-sql-query",
		name: "SQL Query Builder",
		description: "Generate and optimize SQL queries from natural language",
		category: "data",
		icon: "database",
		version: "3.0.1",
		status: "enabled",
		agentCount: 2,
		configSchema: {
			dialect: "string",
			maxRows: "number",
			safeMode: "boolean",
		},
		installedAt: new Date("2026-01-18"),
	},
	{
		id: "skill-csv-transform",
		name: "CSV Transformer",
		description: "Parse, transform, and export CSV data with column mapping",
		category: "data",
		icon: "file-spreadsheet",
		version: "1.2.0",
		status: "update_available",
		agentCount: 1,
		configSchema: {
			delimiter: "string",
			encoding: "string",
		},
		installedAt: new Date("2026-02-01"),
	},
	{
		id: "skill-calendar-sync",
		name: "Calendar Sync",
		description: "Read and create calendar events across connected accounts",
		category: "productivity",
		icon: "calendar",
		version: "2.0.0",
		status: "enabled",
		agentCount: 3,
		configSchema: {
			provider: "string",
			syncInterval: "number",
		},
		installedAt: new Date("2026-01-22"),
	},
	{
		id: "skill-github-integration",
		name: "GitHub Integration",
		description: "Manage issues, PRs, and repositories via GitHub API",
		category: "integration",
		icon: "github",
		version: "4.2.1",
		status: "enabled",
		agentCount: 5,
		configSchema: {
			repo: "string",
			autoLabel: "boolean",
		},
		installedAt: new Date("2026-01-08"),
	},
	{
		id: "skill-vuln-scanner",
		name: "Vulnerability Scanner",
		description: "Scan dependencies and code for known security vulnerabilities",
		category: "security",
		icon: "shield-check",
		version: "1.5.0",
		status: "enabled",
		agentCount: 2,
		configSchema: {
			scanDepth: "string",
			blockOnCritical: "boolean",
		},
		installedAt: new Date("2026-01-25"),
	},
	{
		id: "skill-jira-sync",
		name: "Jira Sync",
		description: "Sync tasks and issues between AXion missions and Jira projects",
		category: "integration",
		icon: "layout-grid",
		version: "1.0.2",
		status: "disabled",
		agentCount: 0,
		configSchema: {
			projectKey: "string",
			syncDirection: "string",
		},
		installedAt: new Date("2026-02-05"),
	},
];

async function fetchSkills(): Promise<Skill[]> {
	await new Promise((resolve) => setTimeout(resolve, 400));
	return MOCK_SKILLS;
}

/**
 * Fetches the list of installed skills via TanStack Query.
 * staleTime: 30s for moderate freshness.
 */
export function useSkills() {
	return useQuery({
		queryKey: queryKeys.skills.lists(),
		queryFn: fetchSkills,
		staleTime: 30_000,
	});
}

/**
 * Install a skill from ClawHub registry.
 * Optimistic update: adds the skill to the installed list immediately.
 */
export function useInstallSkill() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (skillId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 800));
			return skillId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.skills.all,
			});
		},
	});
}

/**
 * Toggle a skill's enabled/disabled status.
 * Optimistic update for instant UI feedback.
 */
export function useToggleSkill() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			skillId,
			enabled,
		}: { skillId: string; enabled: boolean }) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { skillId, enabled };
		},
		onMutate: async ({ skillId, enabled }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.skills.lists(),
			});

			const previousSkills = queryClient.getQueryData<Skill[]>(
				queryKeys.skills.lists(),
			);

			queryClient.setQueryData<Skill[]>(
				queryKeys.skills.lists(),
				(old) =>
					old?.map((s) =>
						s.id === skillId
							? { ...s, status: enabled ? "enabled" : "disabled" }
							: s,
					) ?? [],
			);

			return { previousSkills };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousSkills) {
				queryClient.setQueryData(
					queryKeys.skills.lists(),
					context.previousSkills,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.skills.all,
			});
		},
	});
}
