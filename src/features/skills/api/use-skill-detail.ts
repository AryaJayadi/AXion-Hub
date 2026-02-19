"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SkillConfig, SkillDetail } from "@/entities/skill";
import { queryKeys } from "@/shared/lib/query-keys";

/** Mock skill detail data. Generated per skillId for development. */
function createMockSkillDetail(skillId: string): SkillDetail {
	const SKILL_DATA: Record<
		string,
		{
			name: string;
			description: string;
			category: SkillDetail["category"];
			icon: string;
			version: string;
			status: SkillDetail["status"];
			config: SkillConfig | null;
		}
	> = {
		"skill-code-review": {
			name: "Code Review",
			description:
				"Analyze pull requests for bugs, style, and best practices",
			category: "code",
			icon: "git-pull-request",
			version: "2.1.0",
			status: "enabled",
			config: {
				severity: "warning",
				maxFileSize: 5000,
				autoApprove: false,
				ignorePatterns: ["*.test.ts", "*.spec.ts"],
				language: "typescript",
			},
		},
		"skill-test-gen": {
			name: "Test Generator",
			description:
				"Auto-generate unit and integration tests from source code",
			category: "code",
			icon: "test-tube",
			version: "1.3.2",
			status: "enabled",
			config: {
				framework: "vitest",
				coverage: 80,
				includeEdgeCases: true,
				mockStrategy: "auto",
			},
		},
		"skill-slack-notify": {
			name: "Slack Notifications",
			description: "Send notifications and updates to Slack channels",
			category: "communication",
			icon: "message-square",
			version: "1.0.4",
			status: "enabled",
			config: {
				webhookUrl: "https://hooks.slack.com/services/T00/B00/xxxxx",
				channel: "#agent-updates",
				mentionOnError: true,
				threadReplies: false,
			},
		},
		"skill-sql-query": {
			name: "SQL Query Builder",
			description:
				"Generate and optimize SQL queries from natural language",
			category: "data",
			icon: "database",
			version: "3.0.1",
			status: "enabled",
			config: {
				dialect: "postgresql",
				maxRows: 1000,
				safeMode: true,
				explainPlan: false,
			},
		},
		"skill-github-integration": {
			name: "GitHub Integration",
			description:
				"Manage issues, PRs, and repositories via GitHub API",
			category: "integration",
			icon: "github",
			version: "4.2.1",
			status: "enabled",
			config: {
				repo: "axion-hub/platform",
				autoLabel: true,
				prTemplate: "default",
				branchProtection: true,
			},
		},
	};

	const data = SKILL_DATA[skillId] ?? {
		name: "Unknown Skill",
		description: "Skill details not found",
		category: "code" as const,
		icon: "puzzle",
		version: "0.0.0",
		status: "disabled" as const,
		config: null,
	};

	return {
		id: skillId,
		name: data.name,
		description: data.description,
		category: data.category,
		icon: data.icon,
		version: data.version,
		status: data.status,
		agentCount: 3,
		configSchema: data.config
			? Object.fromEntries(
					Object.entries(data.config).map(([k, v]) => [
						k,
						typeof v,
					]),
				)
			: null,
		installedAt: new Date("2026-01-15"),
		config: data.config,
		readme: `# ${data.name}

${data.description}

## Overview

${data.name} is a powerful skill that integrates seamlessly with your AXion agents. It provides automated capabilities to streamline your workflow and improve productivity.

## Configuration

Configure this skill using the form editor or raw JSON. All changes are applied immediately to active agents.

### Options

| Option | Type | Description |
|--------|------|-------------|
${
	data.config
		? Object.entries(data.config)
				.map(
					([k, v]) =>
						`| \`${k}\` | ${typeof v} | Configure the ${k.replace(/([A-Z])/g, " $1").toLowerCase()} setting |`,
				)
				.join("\n")
		: "| N/A | N/A | No configuration required |"
}

## Usage

Once enabled, this skill is available to all assigned agents. Agents will automatically use this skill when relevant tasks are encountered.

## Changelog

- **v${data.version}** - Latest stable release with performance improvements
- **v1.0.0** - Initial release
`,
		agents: [
			{ id: "agent-001", name: "Atlas", enabled: true },
			{ id: "agent-002", name: "Scout", enabled: true },
			{ id: "agent-004", name: "Scribe", enabled: false },
			{ id: "agent-007", name: "Relay", enabled: false },
			{ id: "agent-008", name: "Forge", enabled: true },
		],
	};
}

async function fetchSkillDetail(
	skillId: string,
): Promise<SkillDetail> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return createMockSkillDetail(skillId);
}

/**
 * Fetches a single skill's full detail including config, readme, and agent list.
 */
export function useSkillDetail(skillId: string) {
	return useQuery({
		queryKey: queryKeys.skills.detail(skillId),
		queryFn: () => fetchSkillDetail(skillId),
		staleTime: 30_000,
		enabled: !!skillId,
	});
}

/**
 * Update a skill's configuration.
 * Invalidates skill detail cache on success.
 */
export function useUpdateSkillConfig() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			skillId,
			config,
		}: { skillId: string; config: SkillConfig }) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return { skillId, config };
		},
		onSuccess: (_data, { skillId }) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.skills.detail(skillId),
			});
		},
	});
}

/**
 * Toggle a skill for a specific agent.
 * Optimistic update for instant UI feedback.
 */
export function useToggleSkillForAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			skillId,
			agentId,
			enabled,
		}: { skillId: string; agentId: string; enabled: boolean }) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { skillId, agentId, enabled };
		},
		onMutate: async ({ skillId, agentId, enabled }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.skills.detail(skillId),
			});

			const previous = queryClient.getQueryData<SkillDetail>(
				queryKeys.skills.detail(skillId),
			);

			queryClient.setQueryData<SkillDetail>(
				queryKeys.skills.detail(skillId),
				(old) =>
					old
						? {
								...old,
								agents: old.agents.map((a) =>
									a.id === agentId
										? { ...a, enabled }
										: a,
								),
							}
						: old,
			);

			return { previous };
		},
		onError: (_err, { skillId }, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					queryKeys.skills.detail(skillId),
					context.previous,
				);
			}
		},
		onSettled: (_data, _err, { skillId }) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.skills.detail(skillId),
			});
		},
	});
}
