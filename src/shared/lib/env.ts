import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		REDIS_URL: z.url(),
		GATEWAY_URL: z.url().optional(),
		GATEWAY_TOKEN: z.string().optional(),
		AXION_MODE: z.enum(["local", "remote"]).default("local"),
	},
	client: {},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		REDIS_URL: process.env.REDIS_URL,
		GATEWAY_URL: process.env.GATEWAY_URL,
		GATEWAY_TOKEN: process.env.GATEWAY_TOKEN,
		AXION_MODE: process.env.AXION_MODE,
	},
});
