/** Fields that can be evaluated in policy conditions */
export type ConditionField =
	| "agent"
	| "task_priority"
	| "cost"
	| "tool"
	| "task_status";

/** Operators for comparing condition field values */
export type ConditionOperator =
	| "equals"
	| "not_equals"
	| "greater_than"
	| "less_than"
	| "contains";

/** Actions to execute when policy conditions match */
export type PolicyAction =
	| "require_approval"
	| "block"
	| "notify"
	| "auto_approve";

/** A single condition in a policy rule */
export interface PolicyCondition {
	field: ConditionField;
	operator: ConditionOperator;
	value: string;
}

/** A governance policy rule */
export interface PolicyRule {
	id: string;
	name: string;
	description: string | undefined;
	conditions: PolicyCondition[];
	action: PolicyAction;
	actionConfig: Record<string, string> | undefined;
	enabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/** Human-readable labels for condition fields */
export const CONDITION_FIELD_LABELS: Record<ConditionField, string> = {
	agent: "Agent",
	task_priority: "Task Priority",
	cost: "Cost",
	tool: "Tool",
	task_status: "Task Status",
};

/** Human-readable labels for operators */
export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
	equals: "equals",
	not_equals: "does not equal",
	greater_than: "is greater than",
	less_than: "is less than",
	contains: "contains",
};

/** Human-readable labels for policy actions */
export const ACTION_LABELS: Record<PolicyAction, string> = {
	require_approval: "Require Approval",
	block: "Block",
	notify: "Notify",
	auto_approve: "Auto-Approve",
};
