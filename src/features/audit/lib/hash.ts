import { createHash } from "node:crypto";

interface AuditHashInput {
	timestamp: Date;
	actor: string;
	action: string;
	resourceType: string;
	resourceId: string;
	before: unknown;
	after: unknown;
	prevHash: string | null;
}

export function computeAuditHash(input: AuditHashInput): string {
	const data = JSON.stringify({
		timestamp: input.timestamp.toISOString(),
		actor: input.actor,
		action: input.action,
		resourceType: input.resourceType,
		resourceId: input.resourceId,
		before: input.before,
		after: input.after,
		prevHash: input.prevHash,
	});
	return createHash("sha256").update(data).digest("hex");
}
