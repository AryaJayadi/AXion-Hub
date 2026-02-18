import { create } from "zustand";
import type { Agent, AgentStatus } from "@/entities/agent";
import type { EventBus } from "@/features/gateway-connection";

interface AgentStore {
	// Roster state
	agents: Agent[];
	isLoading: boolean;

	// Detail state
	agentDetail: Agent | null;

	// Actions
	setAgents: (agents: Agent[]) => void;
	updateAgentStatus: (agentId: string, status: AgentStatus) => void;
	setAgentDetail: (agent: Agent | null) => void;
	addAgent: (agent: Agent) => void;
	removeAgent: (agentId: string) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
	agents: [],
	isLoading: true,
	agentDetail: null,

	setAgents: (agents) => set({ agents, isLoading: false }),

	updateAgentStatus: (agentId, status) =>
		set((state) => ({
			agents: state.agents.map((a) => (a.id === agentId ? { ...a, status } : a)),
			agentDetail:
				state.agentDetail?.id === agentId ? { ...state.agentDetail, status } : state.agentDetail,
		})),

	setAgentDetail: (agent) => set({ agentDetail: agent }),

	addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),

	removeAgent: (agentId) =>
		set((state) => ({
			agents: state.agents.filter((a) => a.id !== agentId),
		})),
}));

/**
 * Initialize real-time subscriptions from the Event Bus.
 * Called once at app startup via GatewayProvider.
 */
export function initAgentStoreSubscriptions(eventBus: EventBus) {
	eventBus.on("agent.status", ({ agentId, status }) => {
		useAgentStore.getState().updateAgentStatus(agentId, status as AgentStatus);
	});
}
