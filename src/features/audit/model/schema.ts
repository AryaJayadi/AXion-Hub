import {
	index,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: serial("id").primaryKey(),
		timestamp: timestamp("timestamp", { withTimezone: true })
			.defaultNow()
			.notNull(),
		actor: text("actor").notNull(),
		actorType: text("actor_type").notNull(), // 'user' | 'system' | 'webhook'
		action: text("action").notNull(), // 'create' | 'update' | 'delete'
		resourceType: text("resource_type").notNull(),
		resourceId: text("resource_id").notNull(),
		before: jsonb("before"),
		after: jsonb("after"),
		metadata: jsonb("metadata"), // { ip, userAgent, correlationId }
		prevHash: text("prev_hash"), // Hash chain for tamper detection
	},
	(table) => [
		index("idx_audit_logs_timestamp").on(table.timestamp),
		index("idx_audit_logs_resource").on(table.resourceType, table.resourceId),
		index("idx_audit_logs_actor").on(table.actor),
	],
);
