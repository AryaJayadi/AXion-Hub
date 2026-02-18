import { create } from "zustand";
import type { AgentStatus } from "@/entities/agent";
import type { CostSummary, TaskSummary, TimePeriod, AgentCostData } from "@/entities/dashboard-event";
import type { EventBus } from "@/features/gateway-connection";
import { useAgentStore } from "@/features/agents/model/agent-store";

interface DashboardStore {
	// Agent summary counts
	agentCounts: Record<AgentStatus, number>;
	totalAgents: number;

	// Task summary (mock data until Phase 6)
	taskSummary: TaskSummary;

	// Cost data by time period
	costByPeriod: Record<TimePeriod, CostSummary>;

	// Per-agent cost breakdown
	perAgentCosts: AgentCostData[];

	// Data freshness
	isStale: boolean;

	// Actions
	updateAgentCounts: () => void;
	updateTaskSummary: (summary: TaskSummary) => void;
	updateCosts: (period: TimePeriod, costs: CostSummary) => void;
	updatePerAgentCosts: (costs: AgentCostData[]) => void;
	setStale: (stale: boolean) => void;
}

const emptyCostSummary: CostSummary = {
	tokens: 0,
	dollars: 0,
	inputTokens: 0,
	outputTokens: 0,
};

export const useDashboardStore = create<DashboardStore>((set) => ({
	agentCounts: {
		online: 0,
		idle: 0,
		working: 0,
		error: 0,
		offline: 0,
	},
	totalAgents: 0,

	taskSummary: {
		inbox: 0,
		assigned: 0,
		inProgress: 0,
		review: 0,
		done: 0,
	},

	costByPeriod: {
		session: { ...emptyCostSummary },
		today: { ...emptyCostSummary },
		week: { ...emptyCostSummary },
	},

	perAgentCosts: [],
	isStale: false,

	updateAgentCounts: () => {
		const agents = useAgentStore.getState().agents;
		const counts: Record<AgentStatus, number> = {
			online: 0,
			idle: 0,
			working: 0,
			error: 0,
			offline: 0,
		};
		for (const agent of agents) {
			counts[agent.status]++;
		}
		set({ agentCounts: counts, totalAgents: agents.length });
	},

	updateTaskSummary: (summary) => set({ taskSummary: summary }),

	updateCosts: (period, costs) =>
		set((state) => ({
			costByPeriod: { ...state.costByPeriod, [period]: costs },
		})),

	updatePerAgentCosts: (costs) => set({ perAgentCosts: costs }),

	setStale: (stale) => set({ isStale: stale }),
}));

/**
 * Initialize real-time subscriptions from the Event Bus for dashboard data.
 * Called once at app startup via GatewayProvider.
 *
 * @returns Cleanup function that unsubscribes all listeners
 */
export function initDashboardStoreSubscriptions(eventBus: EventBus): () => void {
	const unsubStatus = eventBus.on("agent.status", () => {
		useDashboardStore.getState().updateAgentCounts();
	});

	const unsubCreated = eventBus.on("agent.created", () => {
		useDashboardStore.getState().updateAgentCounts();
	});

	const unsubDeleted = eventBus.on("agent.deleted", () => {
		useDashboardStore.getState().updateAgentCounts();
	});

	const unsubDisconnected = eventBus.on("ws.failed", () => {
		useDashboardStore.getState().setStale(true);
	});

	const unsubConnected = eventBus.on("ws.connected", () => {
		useDashboardStore.getState().setStale(false);
		// Re-sync agent counts on reconnect
		useDashboardStore.getState().updateAgentCounts();
	});

	return () => {
		unsubStatus();
		unsubCreated();
		unsubDeleted();
		unsubDisconnected();
		unsubConnected();
	};
}
