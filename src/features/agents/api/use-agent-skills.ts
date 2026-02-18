"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AgentSkill } from "@/entities/agent";
import { toast } from "sonner";

const MOCK_SKILLS: AgentSkill[] = [
	{
		id: "skill-001",
		name: "Code Analysis",
		description: "Analyze code for bugs, security issues, and style violations",
		enabled: true,
		source: "built-in",
	},
	{
		id: "skill-002",
		name: "Web Search",
		description: "Search the web for up-to-date information and documentation",
		enabled: true,
		source: "built-in",
	},
	{
		id: "skill-003",
		name: "Git Operations",
		description: "Perform git operations like commit, branch, and merge",
		enabled: false,
		source: "built-in",
	},
	{
		id: "skill-004",
		name: "Summarization",
		description: "Summarize documents, conversations, and code changes",
		enabled: true,
		source: "clawhub",
	},
	{
		id: "skill-005",
		name: "Data Processing",
		description: "Process and transform structured data in various formats",
		enabled: false,
		source: "clawhub",
	},
	{
		id: "skill-006",
		name: "File Management",
		description: "Organize, rename, and manage files and directories",
		enabled: true,
		source: "built-in",
	},
	{
		id: "skill-007",
		name: "Image Generation",
		description: "Generate images from text descriptions using AI models",
		enabled: false,
		source: "clawhub",
	},
	{
		id: "skill-008",
		name: "Task Planning",
		description: "Break down complex tasks into actionable steps with dependencies",
		enabled: true,
		source: "custom",
	},
];

// TODO: Replace with gatewayClient.agent.skills(agentId)
async function fetchAgentSkills(_agentId: string): Promise<AgentSkill[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return MOCK_SKILLS;
}

export function useAgentSkills(agentId: string) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["agents", agentId, "skills"],
		queryFn: () => fetchAgentSkills(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	const toggleSkillMutation = useMutation({
		mutationFn: async ({ skillId, enabled }: { skillId: string; enabled: boolean }) => {
			// TODO: Replace with gatewayClient.agent.toggleSkill(agentId, skillId, enabled)
			await new Promise((resolve) => setTimeout(resolve, 200));
			return { skillId, enabled };
		},
		onMutate: async ({ skillId, enabled }) => {
			await queryClient.cancelQueries({ queryKey: ["agents", agentId, "skills"] });

			const previousSkills = queryClient.getQueryData<AgentSkill[]>(["agents", agentId, "skills"]);

			queryClient.setQueryData<AgentSkill[]>(["agents", agentId, "skills"], (old) =>
				old?.map((s) => (s.id === skillId ? { ...s, enabled } : s)),
			);

			return { previousSkills };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousSkills) {
				queryClient.setQueryData(["agents", agentId, "skills"], context.previousSkills);
			}
			toast.error("Failed to update skill");
		},
		onSuccess: (_data, { enabled }) => {
			toast.success(enabled ? "Skill enabled" : "Skill disabled");
		},
	});

	return {
		skills: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		toggleSkill: (skillId: string, enabled: boolean) =>
			toggleSkillMutation.mutate({ skillId, enabled }),
	};
}
