"use client";

import { useMemo, useState, useCallback } from "react";
import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	Controls,
	Background,
	MiniMap,
	type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ServiceHealth } from "@/entities/dashboard-event";
import { computeDagreLayout } from "../lib/dagre-layout";
import { DependencyNode } from "./dependency-node";
import { NodeDetailPanel } from "./node-detail-panel";

const nodeTypes = { health: DependencyNode };

interface DependencyMapProps {
	services: ServiceHealth[];
}

export function DependencyMap({ services }: DependencyMapProps) {
	const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);

	// Compute dagre layout
	const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
		() => computeDagreLayout(services),
		[services],
	);

	const [nodes, , onNodesChange] = useNodesState(layoutNodes);
	const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

	const onNodeClick: NodeMouseHandler = useCallback(
		(_event, node) => {
			const service = services.find((s) => s.id === node.id);
			if (service) {
				setSelectedService(service);
			}
		},
		[services],
	);

	const handleClosePanel = useCallback(() => {
		setSelectedService(null);
	}, []);

	return (
		<div className="relative h-[600px] w-full rounded-lg border bg-card">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				onNodeClick={onNodeClick}
				nodesDraggable={false}
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Controls showInteractive={false} />
				<Background />
				<MiniMap
					nodeStrokeWidth={3}
					className="!bg-muted/50"
				/>
			</ReactFlow>

			{/* Node detail side panel */}
			<NodeDetailPanel
				service={selectedService}
				onClose={handleClosePanel}
			/>
		</div>
	);
}
