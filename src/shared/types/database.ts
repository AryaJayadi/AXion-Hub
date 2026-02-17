import type { auditLogs } from "@/features/audit/model/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
