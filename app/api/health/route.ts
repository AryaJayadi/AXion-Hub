import { pool } from "@/shared/lib/db";
import { redis } from "@/shared/lib/redis";

export async function GET() {
	const checks: Record<string, "ok" | "error"> = {};

	// PostgreSQL check
	try {
		const client = await pool.connect();
		await client.query("SELECT 1");
		client.release();
		checks.database = "ok";
	} catch {
		checks.database = "error";
	}

	// Redis check
	try {
		const pong = await redis.ping();
		checks.redis = pong === "PONG" ? "ok" : "error";
	} catch {
		checks.redis = "error";
	}

	const allHealthy = Object.values(checks).every((v) => v === "ok");

	return Response.json(
		{
			status: allHealthy ? "healthy" : "degraded",
			checks,
			timestamp: new Date().toISOString(),
		},
		{ status: allHealthy ? 200 : 503 },
	);
}
