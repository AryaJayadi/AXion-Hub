"use client";

import { useMemo, memo } from "react";
import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	Controls,
	Background,
	Handle,
	Position,
	type NodeProps,
	type Node,
	type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import {
	MessageSquare,
	Send,
	Hash,
	Globe,
	Smartphone,
	Bot,
} from "lucide-react";
import type { Channel, ChannelPlatform, ChannelRouting } from "@/entities/channel";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/shared/lib/cn";
import { MOCK_AGENT_OPTIONS } from "../api/use-channels";

// ---------------------------------------------------------------------------
// Custom node types
// ---------------------------------------------------------------------------

const PLATFORM_ICONS: Record<ChannelPlatform, typeof MessageSquare> = {
	whatsapp: MessageSquare,
	telegram: Send,
	discord: Hash,
	slack: Hash,
	web: Globe,
	sms: Smartphone,
};

const PLATFORM_COLORS: Record<ChannelPlatform, string> = {
	whatsapp: "border-green-500",
	telegram: "border-blue-500",
	discord: "border-indigo-500",
	slack: "border-purple-500",
	web: "border-gray-500",
	sms: "border-orange-500",
};

interface ChannelNodeData {
	label: string;
	platform: ChannelPlatform;
	status: string;
	[key: string]: unknown;
}

interface AgentNodeData {
	label: string;
	status: string;
	[key: string]: unknown;
}

function ChannelNodeComponent({ data }: NodeProps) {
	const nodeData = data as unknown as ChannelNodeData;
	const Icon = PLATFORM_ICONS[nodeData.platform] ?? MessageSquare;
	const borderColor = PLATFORM_COLORS[nodeData.platform] ?? "border-gray-500";

	return (
		<>
			<div
				className={cn(
					"flex w-[180px] flex-col gap-2 rounded-lg border-2 bg-card p-3 shadow-sm",
					borderColor,
				)}
			>
				<div className="flex items-center gap-2">
					<Icon className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate text-sm font-semibold text-foreground">
						{nodeData.label}
					</span>
				</div>
				<StatusBadge status={nodeData.status} size="sm" />
			</div>
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-muted-foreground"
			/>
		</>
	);
}

function AgentNodeComponent({ data }: NodeProps) {
	const nodeData = data as unknown as AgentNodeData;

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				className="!bg-muted-foreground"
			/>
			<div className="flex w-[160px] flex-col gap-2 rounded-lg border-2 border-primary/50 bg-card p-3 shadow-sm">
				<div className="flex items-center gap-2">
					<Bot className="size-4 shrink-0 text-primary" />
					<span className="truncate text-sm font-semibold text-foreground">
						{nodeData.label}
					</span>
				</div>
				<StatusBadge status={nodeData.status} size="sm" />
			</div>
		</>
	);
}

const ChannelNode = memo(ChannelNodeComponent);
const AgentNode = memo(AgentNodeComponent);

const nodeTypes = {
	channel: ChannelNode,
	agent: AgentNode,
};

// ---------------------------------------------------------------------------
// Layout computation
// ---------------------------------------------------------------------------

function computeRoutingLayout(
	channels: Channel[],
	routing: ChannelRouting[],
): { nodes: Node[]; edges: Edge[] } {
	const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

	graph.setGraph({
		rankdir: "LR",
		nodesep: 40,
		ranksep: 120,
	});

	// Channel nodes (left side)
	const channelIds = new Set(routing.map((r) => r.channelId));
	for (const ch of channels.filter((c) => channelIds.has(c.id))) {
		graph.setNode(ch.id, { width: 200, height: 80 });
	}

	// Agent nodes (right side) -- deduplicated
	const agentIds = new Set(routing.map((r) => r.agentId));
	for (const agentId of agentIds) {
		graph.setNode(agentId, { width: 180, height: 80 });
	}

	// Edges from channels to agents
	const edges: Edge[] = [];
	for (const r of routing) {
		const edgeId = `e-${r.channelId}-${r.agentId}`;
		graph.setEdge(r.channelId, r.agentId);
		edges.push({
			id: edgeId,
			source: r.channelId,
			target: r.agentId,
			label: r.rule,
			animated: true,
			style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
			labelStyle: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
		});
	}

	// Compute layout
	Dagre.layout(graph);

	// Map to React Flow nodes
	const nodes: Node[] = [];

	for (const ch of channels.filter((c) => channelIds.has(c.id))) {
		const nodeData = graph.node(ch.id);
		nodes.push({
			id: ch.id,
			type: "channel",
			position: {
				x: (nodeData?.x ?? 0) - 100,
				y: (nodeData?.y ?? 0) - 40,
			},
			data: {
				label: ch.name,
				platform: ch.platform,
				status: ch.status,
			},
		});
	}

	for (const agentId of agentIds) {
		const nodeData = graph.node(agentId);
		const agent = MOCK_AGENT_OPTIONS.find((a) => a.id === agentId);
		nodes.push({
			id: agentId,
			type: "agent",
			position: {
				x: (nodeData?.x ?? 0) - 90,
				y: (nodeData?.y ?? 0) - 40,
			},
			data: {
				label: agent?.name ?? agentId,
				status: "online",
			},
		});
	}

	return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RoutingGraphProps {
	routing: ChannelRouting[];
	channels: Channel[];
}

export function RoutingGraph({ routing, channels }: RoutingGraphProps) {
	const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
		() => computeRoutingLayout(channels, routing),
		[channels, routing],
	);

	const [nodes, , onNodesChange] = useNodesState(layoutNodes);
	const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

	return (
		<div className="h-[500px] w-full rounded-lg border bg-card">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				nodesDraggable={false}
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Controls showInteractive={false} />
				<Background />
			</ReactFlow>
		</div>
	);
}
