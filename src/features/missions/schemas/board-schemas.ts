import { z } from "zod/v4";

// -- Board CRUD schemas --

export const createBoardSchema = z.object({
	name: z.string().min(1, "Board name is required").max(100),
});

export type CreateBoardValues = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	columns: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().min(1),
				semanticRole: z.string().nullable(),
				order: z.number(),
				isHumanOnly: z.boolean(),
			}),
		)
		.optional(),
});

export type UpdateBoardValues = z.infer<typeof updateBoardSchema>;

// -- Column form schema --

export const boardColumnFormSchema = z.object({
	name: z.string().min(1, "Column name is required"),
	semanticRole: z.string().nullable(),
	isHumanOnly: z.boolean(),
});

export type BoardColumnFormValues = z.infer<typeof boardColumnFormSchema>;

// -- Automation rule schemas --

export const automationTriggerEnum = z.enum([
	"card_enters_column",
	"card_assigned",
	"deliverable_submitted",
	"sign_off_completed",
]);

export const automationActionEnum = z.enum([
	"notify_reviewer",
	"auto_assign",
	"send_webhook",
	"change_status",
]);

export const automationRuleSchema = z.object({
	id: z.string(),
	trigger: automationTriggerEnum,
	triggerColumn: z.string().optional(),
	action: automationActionEnum,
	actionConfig: z.record(z.string(), z.string()),
});

export type AutomationRule = z.infer<typeof automationRuleSchema>;
