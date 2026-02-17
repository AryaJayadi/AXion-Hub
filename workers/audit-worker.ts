import { type ConnectionOptions, Worker } from "bullmq";
import { desc } from "drizzle-orm";
import { db } from "../src/shared/lib/db";
import { createRedisConnection } from "../src/shared/lib/redis";
import { computeAuditHash } from "../src/features/audit/lib/hash";
import { auditLogs } from "../src/features/audit/model/schema";

// BullMQ bundles its own ioredis -- cast for exactOptionalPropertyTypes compat
const connection = createRedisConnection() as unknown as ConnectionOptions;

const auditWorker = new Worker(
	"audit",
	async (job) => {
		const {
			actor,
			actorType,
			action,
			resourceType,
			resourceId,
			before,
			after,
			metadata,
			timestamp,
		} = job.data;

		// Get the previous audit log's hash for chain
		const [lastLog] = await db
			.select({ prevHash: auditLogs.prevHash })
			.from(auditLogs)
			.orderBy(desc(auditLogs.id))
			.limit(1);

		const prevHash = lastLog?.prevHash ?? null;

		// Compute hash for this record
		const hash = computeAuditHash({
			timestamp: new Date(timestamp),
			actor,
			action,
			resourceType,
			resourceId,
			before,
			after,
			prevHash,
		});

		// Insert into database
		await db.insert(auditLogs).values({
			timestamp: new Date(timestamp),
			actor,
			actorType,
			action,
			resourceType,
			resourceId,
			before,
			after,
			metadata,
			prevHash: hash,
		});
	},
	{
		connection,
		concurrency: 5,
	},
);

// Logging
auditWorker.on("completed", (job) => {
	console.log(`[audit-worker] Job ${job.id} completed`);
});

auditWorker.on("failed", (job, err) => {
	console.error(`[audit-worker] Job ${job?.id} failed:`, err.message);
});

console.log("[audit-worker] Started, waiting for jobs...");
