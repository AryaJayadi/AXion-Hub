"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Agent } from "@/entities/agent";
import { useAgentStore } from "../model/agent-store";

// TODO: Replace with gatewayClient.createAgent() when gateway methods are wired
async function createAgentMock(
	data: Pick<Agent, "name" | "description" | "model">,
): Promise<Agent> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return {
		id: `agent-${Date.now()}`,
		name: data.name,
		description: data.description,
		model: data.model,
		status: "offline",
		keyStat: "New agent",
		contextUsage: 0,
		uptime: 0,
		createdAt: new Date(),
		lastActive: new Date(),
	};
}

// TODO: Replace with gatewayClient.deleteAgent() when gateway methods are wired
async function deleteAgentMock(agentId: string): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	// Simulate successful deletion
	void agentId;
}

/**
 * Mutation hook for creating a new agent.
 * Adds the agent to the Zustand store on success and invalidates the query cache.
 */
export function useCreateAgent() {
	const queryClient = useQueryClient();
	const addAgent = useAgentStore((s) => s.addAgent);

	return useMutation({
		mutationFn: createAgentMock,
		onSuccess: (agent) => {
			addAgent(agent);
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success(`Agent "${agent.name}" created successfully`);
		},
		onError: (error) => {
			toast.error("Failed to create agent", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		},
	});
}

/**
 * Mutation hook for deleting an agent.
 * Removes the agent from the Zustand store on success.
 */
export function useDeleteAgent() {
	const queryClient = useQueryClient();
	const removeAgent = useAgentStore((s) => s.removeAgent);

	return useMutation({
		mutationFn: deleteAgentMock,
		onSuccess: (_data, agentId) => {
			removeAgent(agentId);
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success("Agent deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete agent", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		},
	});
}
