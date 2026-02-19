/**
 * Zustand store for live workflow execution tracking.
 *
 * Tracks per-node execution state during a workflow run.
 * In production this would be driven by WebSocket events;
 * for now it uses setTimeout-based simulation.
 */

import { create } from "zustand";
import type { ExecutionNodeStatus, NodeExecutionState } from "@/entities/workflow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExecutionStoreState {
	runId: string | null;
	nodeStates: Map<string, NodeExecutionState>;
	isRunning: boolean;
	startedAt: Date | null;
}

interface ExecutionStoreActions {
	startRun: (runId: string, nodeIds: string[]) => void;
	updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;
	clearRun: () => void;
	simulateExecution: (
		runId: string,
		nodes: Array<{ id: string; label: string }>,
	) => void;
}

type ExecutionStore = ExecutionStoreState & ExecutionStoreActions;

// ---------------------------------------------------------------------------
// Mock I/O generators
// ---------------------------------------------------------------------------

function mockInput(label: string, index: number): unknown {
	return {
		source: index === 0 ? "trigger" : `node-${index}`,
		payload: { label, timestamp: new Date().toISOString() },
	};
}

function mockOutput(label: string, status: ExecutionNodeStatus): unknown {
	if (status === "error") return null;
	return {
		result: `Processed by ${label}`,
		success: true,
		metrics: { processingTime: Math.floor(Math.random() * 500) + 100 },
	};
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
	// State
	runId: null,
	nodeStates: new Map(),
	isRunning: false,
	startedAt: null,

	// Actions
	startRun: (runId, nodeIds) => {
		const nodeStates = new Map<string, NodeExecutionState>();
		for (const nodeId of nodeIds) {
			nodeStates.set(nodeId, {
				status: "pending",
				startedAt: null,
				completedAt: null,
				input: null,
				output: null,
				error: null,
			});
		}
		set({ runId, nodeStates, isRunning: true, startedAt: new Date() });
	},

	updateNodeState: (nodeId, partial) => {
		const { nodeStates } = get();
		const current = nodeStates.get(nodeId);
		if (!current) return;

		const updated = new Map(nodeStates);
		updated.set(nodeId, { ...current, ...partial });
		set({ nodeStates: updated });
	},

	clearRun: () => {
		set({
			runId: null,
			nodeStates: new Map(),
			isRunning: false,
			startedAt: null,
		});
	},

	simulateExecution: (runId, nodes) => {
		const { startRun, updateNodeState } = get();

		// Initialize all nodes as pending
		startRun(
			runId,
			nodes.map((n) => n.id),
		);

		// Sequentially simulate each node with delays
		let cumulativeDelay = 200; // initial delay before first node starts

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (!node) continue;
			const nodeId = node.id;
			const nodeLabel = node.label;

			// Transition to running
			const startDelay = cumulativeDelay;
			setTimeout(() => {
				updateNodeState(nodeId, {
					status: "running",
					startedAt: new Date(),
					input: mockInput(nodeLabel, i),
				});
			}, startDelay);

			// Transition to success/error after processing
			const processingTime = 500 + Math.floor(Math.random() * 1000);
			const completeDelay = startDelay + processingTime;

			// ~80% success, ~20% error
			const willSucceed = Math.random() > 0.2;

			setTimeout(() => {
				const status: ExecutionNodeStatus = willSucceed ? "success" : "error";
				updateNodeState(nodeId, {
					status,
					completedAt: new Date(),
					output: mockOutput(nodeLabel, status),
					error: willSucceed ? null : `Error in ${nodeLabel}: Operation timed out after ${processingTime}ms`,
				});

				// Check if this is the last node
				if (i === nodes.length - 1) {
					// Mark remaining pending nodes as skipped (if any errored before)
					setTimeout(() => {
						const currentStates = get().nodeStates;
						const updated = new Map(currentStates);
						let hasSkips = false;
						for (const [nId, state] of updated) {
							if (state.status === "pending") {
								updated.set(nId, {
									...state,
									status: "skipped",
									completedAt: new Date(),
								});
								hasSkips = true;
							}
						}
						if (hasSkips) {
							set({ nodeStates: updated });
						}
						set({ isRunning: false });
					}, 100);
				}
			}, completeDelay);

			cumulativeDelay = completeDelay + 200; // gap between nodes

			// If a node errors, skip remaining nodes
			if (!willSucceed) {
				// Mark remaining nodes as skipped after error
				for (let j = i + 1; j < nodes.length; j++) {
					const skipNode = nodes[j];
					if (!skipNode) continue;
					setTimeout(() => {
						updateNodeState(skipNode.id, {
							status: "skipped",
							completedAt: new Date(),
						});
					}, completeDelay + 100);
				}
				// End run
				setTimeout(() => {
					set({ isRunning: false });
				}, completeDelay + 200);
				break;
			}
		}
	},
}));
