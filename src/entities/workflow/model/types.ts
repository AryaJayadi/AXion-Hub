/**
 * Workflow entity types.
 *
 * Defines the core data model for workflows: statuses, trigger types,
 * node types, and the full workflow definition shape.
 */

// ---------------------------------------------------------------------------
// Status & trigger enums
// ---------------------------------------------------------------------------

export type WorkflowStatus = "draft" | "active" | "paused" | "error";

export type WorkflowTriggerType = "manual" | "cron" | "webhook" | "event";

// ---------------------------------------------------------------------------
// Node types
// ---------------------------------------------------------------------------

export type WorkflowNodeType =
	| "trigger"
	| "agentAction"
	| "condition"
	| "delay"
	| "transform"
	| "output"
	| "loop"
	| "parallel"
	| "httpRequest"
	| "code"
	| "approvalGate"
	| "subWorkflow";

/** Base data that all nodes carry */
export type WorkflowNodeData = Record<string, unknown> & { label: string };

// ---------------------------------------------------------------------------
// Workflow definition
// ---------------------------------------------------------------------------

export interface WorkflowDefinition {
	id: string;
	name: string;
	description: string;
	status: WorkflowStatus;
	triggerType: WorkflowTriggerType;
	/** Serialized node positions/types/data */
	nodes: unknown[];
	/** Serialized connections */
	edges: unknown[];
	nodeCount: number;
	lastEditedAt: Date;
	lastRunAt: Date | null;
	lastRunStatus: "success" | "error" | "running" | null;
}

// ---------------------------------------------------------------------------
// Execution state
// ---------------------------------------------------------------------------

export type ExecutionNodeStatus =
	| "pending"
	| "running"
	| "success"
	| "error"
	| "skipped";

export interface NodeExecutionState {
	status: ExecutionNodeStatus;
	startedAt: Date | null;
	completedAt: Date | null;
	input: unknown;
	output: unknown;
	error: string | null;
}
