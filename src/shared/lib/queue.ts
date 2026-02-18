import { type ConnectionOptions, Queue } from "bullmq";
import { createRedisConnection } from "./redis";

// BullMQ bundles its own ioredis, causing exactOptionalPropertyTypes mismatch
// with the project's ioredis. The runtime instances are fully compatible.
function createBullMQConnection(): ConnectionOptions {
	return createRedisConnection() as unknown as ConnectionOptions;
}

// Each queue needs its own Redis connection
export const auditQueue = new Queue("audit", {
	connection: createBullMQConnection(),
	defaultJobOptions: {
		removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
		removeOnFail: { count: 5000 }, // Keep last 5000 failed jobs
		attempts: 3,
		backoff: { type: "exponential", delay: 1000 },
	},
});

export const alertQueue = new Queue("alerts", {
	connection: createBullMQConnection(),
	defaultJobOptions: {
		removeOnComplete: { count: 500 },
		removeOnFail: { count: 1000 },
		attempts: 3,
		backoff: { type: "exponential", delay: 2000 },
	},
});

// Future queues (placeholder comments):
// export const workflowQueue = new Queue('workflow', { connection: createBullMQConnection() });
