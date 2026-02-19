import { z } from "zod/v4";

import type {
	ConditionField,
	ConditionOperator,
	PolicyAction,
} from "./types";

const CONDITION_FIELDS: [ConditionField, ...ConditionField[]] = [
	"agent",
	"task_priority",
	"cost",
	"tool",
	"task_status",
];

const CONDITION_OPERATORS: [ConditionOperator, ...ConditionOperator[]] = [
	"equals",
	"not_equals",
	"greater_than",
	"less_than",
	"contains",
];

const POLICY_ACTIONS: [PolicyAction, ...PolicyAction[]] = [
	"require_approval",
	"block",
	"notify",
	"auto_approve",
];

export const policyConditionSchema = z.object({
	field: z.enum(CONDITION_FIELDS),
	operator: z.enum(CONDITION_OPERATORS),
	value: z.string().min(1, "Value is required"),
});

export const policyRuleSchema = z.object({
	name: z.string().min(1, "Name required").max(100),
	description: z.string().max(500).optional(),
	conditions: z
		.array(policyConditionSchema)
		.min(1, "At least one condition required"),
	action: z.enum(POLICY_ACTIONS),
	actionConfig: z.record(z.string(), z.string()).optional(),
	enabled: z.boolean(),
});

export type PolicyConditionInput = z.infer<typeof policyConditionSchema>;
export type PolicyRuleInput = z.infer<typeof policyRuleSchema>;
