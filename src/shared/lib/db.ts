import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Pool is created lazily -- only connects when first query is made.
// NOTE: Uses process.env directly (not env.ts) to avoid circular dependency
// and allow drizzle-kit CLI to use this file without Next.js env validation.
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 20,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 5_000,
});

export const db = drizzle({ client: pool });

// Export pool for health check endpoints
export { pool };
