import IORedis from "ioredis";

// Lazy singleton -- created on first import.
// NOTE: Uses process.env directly (not env.ts) to avoid circular dependency
// and allow standalone scripts to use Redis without Next.js env validation.
export const redis = new IORedis(
	process.env.REDIS_URL ?? "redis://localhost:6379",
	{
		maxRetriesPerRequest: null, // Required by BullMQ
		retryStrategy: (times: number) => Math.min(times * 50, 2000),
	},
);

// For BullMQ -- it needs a separate connection per queue/worker
export function createRedisConnection(): IORedis {
	return new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
		maxRetriesPerRequest: null,
	});
}
