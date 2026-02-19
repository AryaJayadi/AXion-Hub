"use client";

/**
 * Interactive workflow canvas using @xyflow/react.
 *
 * Supports drag-from-sidebar node creation, node connections via handles,
 * keyboard delete, and selection management. The nodeTypes constant is
 * defined at module level to prevent re-renders (React Flow Pitfall 1).
 */

import { useCallback, useRef, type DragEvent, type KeyboardEvent } from "react";
import {
	ReactFlow,
	Controls,
	Background,
	MiniMap,
	addEdge,
	type Connection,
	type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";
import type { WorkflowNodeType } from "@/entities/workflow";
import { getDefaultNodeData } from "@/entities/workflow";
import { useWorkflowCanvasStore } from "../../model/workflow-canvas-store";

// Node type imports
import { TriggerNode } from "../nodes/trigger-node";
import { AgentActionNode } from "../nodes/agent-action-node";
import { ConditionNode } from "../nodes/condition-node";
import { DelayNode } from "../nodes/delay-node";
import { TransformNode } from "../nodes/transform-node";
import { OutputNode } from "../nodes/output-node";
import { LoopNode } from "../nodes/loop-node";
import { ParallelNode } from "../nodes/parallel-node";
import { HttpRequestNode } from "../nodes/http-request-node";
import { CodeNode } from "../nodes/code-node";
import { ApprovalGateNode } from "../nodes/approval-gate-node";
import { SubWorkflowNode } from "../nodes/sub-workflow-node";

// ---------------------------------------------------------------------------
// CRITICAL: nodeTypes MUST be defined OUTSIDE the component (module-level)
// to prevent re-renders. See research Pitfall 1.
// ---------------------------------------------------------------------------

const nodeTypes = {
	trigger: TriggerNode,
	agentAction: AgentActionNode,
	condition: ConditionNode,
	delay: DelayNode,
	transform: TransformNode,
	output: OutputNode,
	loop: LoopNode,
	parallel: ParallelNode,
	httpRequest: HttpRequestNode,
	code: CodeNode,
	approvalGate: ApprovalGateNode,
	subWorkflow: SubWorkflowNode,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowCanvas() {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);

	// Store selectors
	const nodes = useWorkflowCanvasStore((s) => s.nodes);
	const edges = useWorkflowCanvasStore((s) => s.edges);
	const onNodesChange = useWorkflowCanvasStore((s) => s.onNodesChange);
	const onEdgesChange = useWorkflowCanvasStore((s) => s.onEdgesChange);
	const setEdges = useWorkflowCanvasStore((s) => s.setEdges);
	const addNode = useWorkflowCanvasStore((s) => s.addNode);
	const selectNode = useWorkflowCanvasStore((s) => s.selectNode);
	const deleteSelectedNodes = useWorkflowCanvasStore(
		(s) => s.deleteSelectedNodes,
	);

	// Connect handler
	const onConnect = useCallback(
		(connection: Connection) => {
			setEdges((eds) => addEdge(connection, eds));
		},
		[setEdges],
	);

	// Drag over -- allow drop
	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	// Drop handler -- create node at drop position
	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			const type = event.dataTransfer.getData("application/reactflow");
			if (!type) return;

			// We need the reactFlowInstance to convert screen -> flow position.
			// Since we're using the store-managed approach, we need to access
			// screenToFlowPosition from the ReactFlow instance.
			// The ReactFlow component provides this via the internal instance.
			// We get position from the wrapper element bounds.
			const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();
			if (!wrapperBounds) return;

			const position = {
				x: event.clientX - wrapperBounds.left,
				y: event.clientY - wrapperBounds.top,
			};

			const newNode = {
				id: nanoid(),
				type,
				position,
				data: getDefaultNodeData(type as WorkflowNodeType),
			};

			addNode(newNode);
		},
		[addNode],
	);

	// Node click -- select node
	const onNodeClick: NodeMouseHandler = useCallback(
		(_event, node) => {
			selectNode(node.id);
		},
		[selectNode],
	);

	// Pane click -- deselect
	const onPaneClick = useCallback(() => {
		selectNode(null);
	}, [selectNode]);

	// Keyboard delete
	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Backspace" || event.key === "Delete") {
				deleteSelectedNodes();
			}
		},
		[deleteSelectedNodes],
	);

	return (
		<div
			ref={reactFlowWrapper}
			className="h-full w-full"
			onKeyDown={onKeyDown}
			tabIndex={0}
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
				nodeTypes={nodeTypes}
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Controls />
				<Background />
				<MiniMap className="!bg-muted/50" />
			</ReactFlow>
		</div>
	);
}
