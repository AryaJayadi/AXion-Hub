import Dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { ServiceHealth } from "@/entities/dashboard-event";

interface DependencyNodeData {
	label: string;
	type: ServiceHealth["type"];
	health: ServiceHealth["health"];
	metrics?: ServiceHealth["metrics"];
	serviceId: string;
	connectedTo: string[];
	[key: string]: unknown;
}

const EDGE_HEALTH_COLORS: Record<ServiceHealth["health"], string> = {
	healthy: "#22c55e",
	degraded: "#eab308",
	down: "#ef4444",
};

/**
 * Compute a top-to-bottom dagre layout for service health nodes.
 *
 * @param services - Array of ServiceHealth objects with connection info
 * @returns React Flow nodes and edges with dagre-computed positions
 */
export function computeDagreLayout(services: ServiceHealth[]): {
	nodes: Node<DependencyNodeData>[];
	edges: Edge[];
} {
	const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

	graph.setGraph({
		rankdir: "TB",
		nodesep: 60,
		ranksep: 80,
	});

	// Add nodes
	for (const service of services) {
		graph.setNode(service.id, { width: 220, height: 100 });
	}

	// Add edges from connectedTo arrays
	const edges: Edge[] = [];
	for (const service of services) {
		for (const targetId of service.connectedTo) {
			const edgeId = `e-${service.id}-${targetId}`;
			graph.setEdge(service.id, targetId);

			// Edge color based on target node health
			const target = services.find((s) => s.id === targetId);
			const strokeColor = EDGE_HEALTH_COLORS[target?.health ?? "healthy"];

			edges.push({
				id: edgeId,
				source: service.id,
				target: targetId,
				animated: true,
				style: { stroke: strokeColor, strokeWidth: 2 },
			});
		}
	}

	// Compute layout
	Dagre.layout(graph);

	// Map to React Flow nodes
	const nodes: Node<DependencyNodeData>[] = services.map((service) => {
		const nodeData = graph.node(service.id);
		return {
			id: service.id,
			type: "health",
			position: {
				x: (nodeData?.x ?? 0) - 110,
				y: (nodeData?.y ?? 0) - 50,
			},
			data: {
				label: service.name,
				type: service.type,
				health: service.health,
				metrics: service.metrics,
				serviceId: service.id,
				connectedTo: service.connectedTo,
			},
		};
	});

	return { nodes, edges };
}

export type { DependencyNodeData };
