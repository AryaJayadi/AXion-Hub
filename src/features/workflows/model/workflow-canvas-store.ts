/**
 * Zustand store for workflow canvas graph state.
 *
 * Manages nodes, edges, selection, and undo/redo history.
 * Uses functional updates (NO immer) for immutable state management.
 */

import {
	applyNodeChanges,
	applyEdgeChanges,
	type Node,
	type Edge,
	type NodeChange,
	type EdgeChange,
} from "@xyflow/react";
import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryEntry {
	nodes: Node[];
	edges: Edge[];
}

interface WorkflowCanvasState {
	nodes: Node[];
	edges: Edge[];
	selectedNodeId: string | null;
	workflowId: string | null;
	workflowName: string;
	isDirty: boolean;
	past: HistoryEntry[];
	future: HistoryEntry[];
}

interface WorkflowCanvasActions {
	setNodes: (nodesOrUpdater: Node[] | ((prev: Node[]) => Node[])) => void;
	setEdges: (edgesOrUpdater: Edge[] | ((prev: Edge[]) => Edge[])) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	addNode: (node: Node) => void;
	selectNode: (id: string | null) => void;
	updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
	deleteSelectedNodes: () => void;
	loadWorkflow: (
		id: string,
		name: string,
		nodes: Node[],
		edges: Edge[],
	) => void;
	clearCanvas: () => void;
	takeSnapshot: () => void;
	undo: () => void;
	redo: () => void;
}

type WorkflowCanvasStore = WorkflowCanvasState & WorkflowCanvasActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

export const useWorkflowCanvasStore = create<WorkflowCanvasStore>(
	(set, get) => ({
		// State
		nodes: [],
		edges: [],
		selectedNodeId: null,
		workflowId: null,
		workflowName: "Untitled Workflow",
		isDirty: false,
		past: [],
		future: [],

		// Actions
		setNodes: (nodesOrUpdater) => {
			set((state) => ({
				nodes:
					typeof nodesOrUpdater === "function"
						? nodesOrUpdater(state.nodes)
						: nodesOrUpdater,
				isDirty: true,
			}));
		},

		setEdges: (edgesOrUpdater) => {
			set((state) => ({
				edges:
					typeof edgesOrUpdater === "function"
						? edgesOrUpdater(state.edges)
						: edgesOrUpdater,
				isDirty: true,
			}));
		},

		onNodesChange: (changes) => {
			set((state) => ({
				nodes: applyNodeChanges(changes, state.nodes),
				isDirty: true,
			}));
		},

		onEdgesChange: (changes) => {
			set((state) => ({
				edges: applyEdgeChanges(changes, state.edges),
				isDirty: true,
			}));
		},

		addNode: (node) => {
			const { nodes, edges, past } = get();
			// Take snapshot for undo
			const newPast = [...past, { nodes, edges }].slice(-MAX_HISTORY);
			set({
				nodes: [...nodes, node],
				past: newPast,
				future: [],
				isDirty: true,
			});
		},

		selectNode: (id) => {
			set({ selectedNodeId: id });
		},

		updateNodeData: (nodeId, data) => {
			set((state) => ({
				nodes: state.nodes.map((n) =>
					n.id === nodeId
						? { ...n, data: { ...n.data, ...data } }
						: n,
				),
				isDirty: true,
			}));
		},

		deleteSelectedNodes: () => {
			const { nodes, edges, past } = get();
			const selectedIds = new Set(
				nodes.filter((n) => n.selected).map((n) => n.id),
			);
			if (selectedIds.size === 0) return;

			// Take snapshot for undo
			const newPast = [...past, { nodes, edges }].slice(-MAX_HISTORY);
			const newNodes = nodes.filter((n) => !selectedIds.has(n.id));
			const newEdges = edges.filter(
				(e) => !selectedIds.has(e.source) && !selectedIds.has(e.target),
			);

			set({
				nodes: newNodes,
				edges: newEdges,
				selectedNodeId: null,
				past: newPast,
				future: [],
				isDirty: true,
			});
		},

		loadWorkflow: (id, name, nodes, edges) => {
			set({
				workflowId: id,
				workflowName: name,
				nodes,
				edges,
				selectedNodeId: null,
				isDirty: false,
				past: [],
				future: [],
			});
		},

		clearCanvas: () => {
			set({
				nodes: [],
				edges: [],
				selectedNodeId: null,
				workflowId: null,
				workflowName: "Untitled Workflow",
				isDirty: false,
				past: [],
				future: [],
			});
		},

		takeSnapshot: () => {
			const { nodes, edges, past } = get();
			const newPast = [...past, { nodes, edges }].slice(-MAX_HISTORY);
			set({ past: newPast, future: [] });
		},

		undo: () => {
			const { past, nodes, edges, future } = get();
			const previous = past[past.length - 1];
			if (!previous) return;

			const newPast = past.slice(0, -1);

			set({
				nodes: previous.nodes,
				edges: previous.edges,
				past: newPast,
				future: [{ nodes, edges }, ...future],
				isDirty: true,
			});
		},

		redo: () => {
			const { future, nodes, edges, past } = get();
			const next = future[0];
			if (!next) return;

			const newFuture = future.slice(1);

			set({
				nodes: next.nodes,
				edges: next.edges,
				past: [...past, { nodes, edges }],
				future: newFuture,
				isDirty: true,
			});
		},
	}),
);
