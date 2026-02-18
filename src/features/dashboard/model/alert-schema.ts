import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// ---------------------------------------------------------------------------
// alert_rules -- user-configured alert conditions
// ---------------------------------------------------------------------------
export const alertRules = pgTable("alert_rules", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 1000 }),
	templateId: varchar("template_id", { length: 100 }),
	enabled: boolean("enabled").default(true).notNull(),
	metric: varchar("metric", { length: 100 }).notNull(),
	operator: varchar("operator", { length: 10 }).notNull(),
	threshold: integer("threshold").notNull(),
	duration: integer("duration").default(0).notNull(),
	severity: varchar("severity", { length: 20 }).notNull(),
	webhookUrl: varchar("webhook_url", { length: 2000 }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type AlertRule = InferSelectModel<typeof alertRules>;
export type NewAlertRule = InferInsertModel<typeof alertRules>;

// ---------------------------------------------------------------------------
// alert_notifications -- fired alert instances
// ---------------------------------------------------------------------------
export const alertNotifications = pgTable(
	"alert_notifications",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		ruleId: uuid("rule_id").notNull(),
		severity: varchar("severity", { length: 20 }).notNull(),
		message: varchar("message", { length: 1000 }).notNull(),
		details: jsonb("details"),
		read: boolean("read").default(false).notNull(),
		webhookDelivered: boolean("webhook_delivered"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("idx_alert_notifications_rule_id").on(table.ruleId),
		index("idx_alert_notifications_created_at").on(table.createdAt),
	],
);

export type AlertNotification = InferSelectModel<typeof alertNotifications>;
export type NewAlertNotification = InferInsertModel<typeof alertNotifications>;
