/**
 * Central registry for all 12 workflow node types.
 *
 * Defines palette metadata (icon, description, category), default data,
 * and handle configuration for each node type. Used by the canvas,
 * palette, and config panel components.
 */

import type { WorkflowNodeData, WorkflowNodeType } from "../model/types";

// ---------------------------------------------------------------------------
// Category colors
// ---------------------------------------------------------------------------

export interface NodeCategoryColors {
	border: string;
	bg: string;
	text: string;
}

export const NODE_CATEGORIES: Record<string, NodeCategoryColors> = {
	trigger: {
		border: "border-blue-500",
		bg: "bg-blue-500/10",
		text: "text-blue-500",
	},
	action: {
		border: "border-purple-500",
		bg: "bg-purple-500/10",
		text: "text-purple-500",
	},
	control: {
		border: "border-amber-500",
		bg: "bg-amber-500/10",
		text: "text-amber-500",
	},
	io: {
		border: "border-slate-500",
		bg: "bg-slate-500/10",
		text: "text-slate-500",
	},
	special: {
		border: "border-indigo-500",
		bg: "bg-indigo-500/10",
		text: "text-indigo-500",
	},
	code: {
		border: "border-emerald-500",
		bg: "bg-emerald-500/10",
		text: "text-emerald-500",
	},
};

// ---------------------------------------------------------------------------
// Handle definition
// ---------------------------------------------------------------------------

export interface NodeHandleDef {
	id: string;
	type: "source" | "target";
	position: "top" | "bottom" | "left" | "right";
	label?: string;
}

// ---------------------------------------------------------------------------
// Registry entry
// ---------------------------------------------------------------------------

export interface NodeRegistryEntry {
	type: WorkflowNodeType;
	label: string;
	description: string;
	category: keyof typeof NODE_CATEGORIES;
	icon: string;
	defaultData: WorkflowNodeData;
	handles: NodeHandleDef[];
}

// ---------------------------------------------------------------------------
// Node registry
// ---------------------------------------------------------------------------

export const NODE_REGISTRY: NodeRegistryEntry[] = [
	{
		type: "trigger",
		label: "Trigger",
		description: "Starts the workflow on an event or schedule",
		category: "trigger",
		icon: "Zap",
		defaultData: { label: "Trigger", subType: "manual" },
		handles: [{ id: "out", type: "source", position: "bottom" }],
	},
	{
		type: "agentAction",
		label: "Agent Action",
		description: "Execute an action via an AI agent",
		category: "action",
		icon: "Bot",
		defaultData: { label: "Agent Action", agentName: "", actionDescription: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
	{
		type: "condition",
		label: "Condition",
		description: "Branch based on a boolean expression",
		category: "control",
		icon: "GitBranch",
		defaultData: { label: "Condition", expression: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "true", type: "source", position: "bottom", label: "True" },
			{ id: "false", type: "source", position: "bottom", label: "False" },
		],
	},
	{
		type: "delay",
		label: "Delay",
		description: "Wait for a specified duration",
		category: "control",
		icon: "Clock",
		defaultData: { label: "Delay", duration: 5, unit: "minutes" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
	{
		type: "transform",
		label: "Transform",
		description: "Map and transform data between steps",
		category: "io",
		icon: "Shuffle",
		defaultData: { label: "Transform", mapping: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
	{
		type: "output",
		label: "Output",
		description: "Send results via notification or log",
		category: "io",
		icon: "Send",
		defaultData: { label: "Output", outputType: "notify", target: "" },
		handles: [{ id: "in", type: "target", position: "top" }],
	},
	{
		type: "loop",
		label: "Loop",
		description: "Iterate over a collection or count",
		category: "control",
		icon: "Repeat",
		defaultData: { label: "Loop", count: 10, collection: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "body", type: "source", position: "bottom", label: "Body" },
			{ id: "done", type: "source", position: "bottom", label: "Done" },
		],
	},
	{
		type: "parallel",
		label: "Parallel",
		description: "Run multiple branches simultaneously",
		category: "control",
		icon: "GitFork",
		defaultData: { label: "Parallel", branchCount: 2 },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "fan-out", type: "source", position: "bottom", label: "Fan Out" },
			{ id: "fan-in", type: "source", position: "bottom", label: "Fan In" },
		],
	},
	{
		type: "httpRequest",
		label: "HTTP Request",
		description: "Make an HTTP request to an external API",
		category: "io",
		icon: "Globe",
		defaultData: { label: "HTTP Request", method: "GET", url: "", body: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
	{
		type: "code",
		label: "Code",
		description: "Run custom JavaScript or Python code",
		category: "code",
		icon: "Code",
		defaultData: { label: "Code", language: "javascript", code: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
	{
		type: "approvalGate",
		label: "Approval Gate",
		description: "Pause execution until approved by a human",
		category: "special",
		icon: "ShieldCheck",
		defaultData: { label: "Approval Gate", approver: "", timeout: "24h" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{
				id: "approved",
				type: "source",
				position: "bottom",
				label: "Approved",
			},
			{
				id: "rejected",
				type: "source",
				position: "bottom",
				label: "Rejected",
			},
		],
	},
	{
		type: "subWorkflow",
		label: "Sub-workflow",
		description: "Invoke another workflow as a step",
		category: "special",
		icon: "Workflow",
		defaultData: { label: "Sub-workflow", workflowId: "" },
		handles: [
			{ id: "in", type: "target", position: "top" },
			{ id: "out", type: "source", position: "bottom" },
		],
	},
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const registryByType = new Map<WorkflowNodeType, NodeRegistryEntry>(
	NODE_REGISTRY.map((entry) => [entry.type, entry]),
);

/** Get the default data for a node type */
export function getDefaultNodeData(type: WorkflowNodeType): WorkflowNodeData {
	const entry = registryByType.get(type);
	return entry
		? { ...entry.defaultData }
		: { label: type };
}

/** Get category colors for a node type */
export function getNodeCategory(type: WorkflowNodeType): NodeCategoryColors {
	const entry = registryByType.get(type);
	const categoryKey = entry?.category ?? "io";
	const colors = NODE_CATEGORIES[categoryKey];
	if (colors) return colors;
	// Fallback -- should never happen since all categories are defined
	return { border: "border-slate-500", bg: "bg-slate-500/10", text: "text-slate-500" };
}

/** Get the full registry entry for a node type */
export function getNodeRegistryEntry(
	type: WorkflowNodeType,
): NodeRegistryEntry | undefined {
	return registryByType.get(type);
}
