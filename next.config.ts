import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	serverExternalPackages: ["pino", "pino-pretty", "bullmq"],
};

export default nextConfig;
