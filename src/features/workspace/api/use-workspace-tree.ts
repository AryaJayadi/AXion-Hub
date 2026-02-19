"use client";

import { useQuery } from "@tanstack/react-query";
import type { FileTreeNode } from "@/entities/workspace";
import { queryKeys } from "@/shared/lib/query-keys";

/**
 * Generate a mock workspace file tree.
 *
 * Structure:
 * - shared/ (README.md, config.yaml, data/ with JSON files)
 * - research-agent/ (workspace, output, logs)
 * - code-agent/ (workspace, output, logs)
 * - data-agent/ (workspace, output, logs)
 */
function generateMockTree(): FileTreeNode {
	const now = new Date();
	const oneHourAgo = new Date(now.getTime() - 3_600_000);
	const oneDayAgo = new Date(now.getTime() - 86_400_000);
	const twoDaysAgo = new Date(now.getTime() - 172_800_000);

	return {
		name: "workspace",
		path: "",
		type: "directory",
		children: [
			{
				name: "shared",
				path: "shared",
				type: "directory",
				size: undefined,
				lastModified: oneHourAgo,
				mimeType: undefined,
				children: [
					{
						name: "README.md",
						path: "shared/README.md",
						type: "file",
						children: undefined,
						size: 2048,
						lastModified: oneDayAgo,
						mimeType: "text/markdown",
					},
					{
						name: "config.yaml",
						path: "shared/config.yaml",
						type: "file",
						children: undefined,
						size: 512,
						lastModified: twoDaysAgo,
						mimeType: "text/yaml",
					},
					{
						name: "data",
						path: "shared/data",
						type: "directory",
						size: undefined,
						lastModified: oneHourAgo,
						mimeType: undefined,
						children: [
							{
								name: "agents.json",
								path: "shared/data/agents.json",
								type: "file",
								children: undefined,
								size: 4096,
								lastModified: oneHourAgo,
								mimeType: "application/json",
							},
							{
								name: "models.json",
								path: "shared/data/models.json",
								type: "file",
								children: undefined,
								size: 3200,
								lastModified: oneDayAgo,
								mimeType: "application/json",
							},
							{
								name: "prompts.json",
								path: "shared/data/prompts.json",
								type: "file",
								children: undefined,
								size: 1800,
								lastModified: twoDaysAgo,
								mimeType: "application/json",
							},
						],
					},
				],
			},
			createAgentDir("research-agent", now, oneHourAgo, oneDayAgo),
			createAgentDir("code-agent", oneHourAgo, oneDayAgo, twoDaysAgo),
			createAgentDir("data-agent", oneDayAgo, twoDaysAgo, twoDaysAgo),
		],
		size: undefined,
		lastModified: now,
		mimeType: undefined,
	};
}

function createAgentDir(
	agentName: string,
	t1: Date,
	t2: Date,
	t3: Date,
): FileTreeNode {
	return {
		name: agentName,
		path: agentName,
		type: "directory",
		size: undefined,
		lastModified: t1,
		mimeType: undefined,
		children: [
			{
				name: "workspace",
				path: `${agentName}/workspace`,
				type: "directory",
				size: undefined,
				lastModified: t1,
				mimeType: undefined,
				children: [
					{
						name: "main.ts",
						path: `${agentName}/workspace/main.ts`,
						type: "file",
						children: undefined,
						size: 2400,
						lastModified: t1,
						mimeType: "text/typescript",
					},
					{
						name: "utils.py",
						path: `${agentName}/workspace/utils.py`,
						type: "file",
						children: undefined,
						size: 1600,
						lastModified: t2,
						mimeType: "text/x-python",
					},
					{
						name: "notes.md",
						path: `${agentName}/workspace/notes.md`,
						type: "file",
						children: undefined,
						size: 800,
						lastModified: t2,
						mimeType: "text/markdown",
					},
				],
			},
			{
				name: "output",
				path: `${agentName}/output`,
				type: "directory",
				size: undefined,
				lastModified: t2,
				mimeType: undefined,
				children: [
					{
						name: "result.json",
						path: `${agentName}/output/result.json`,
						type: "file",
						children: undefined,
						size: 5120,
						lastModified: t2,
						mimeType: "application/json",
					},
					{
						name: "summary.md",
						path: `${agentName}/output/summary.md`,
						type: "file",
						children: undefined,
						size: 3072,
						lastModified: t3,
						mimeType: "text/markdown",
					},
				],
			},
			{
				name: "logs",
				path: `${agentName}/logs`,
				type: "directory",
				size: undefined,
				lastModified: t1,
				mimeType: undefined,
				children: [
					{
						name: "agent.log",
						path: `${agentName}/logs/agent.log`,
						type: "file",
						children: undefined,
						size: 12288,
						lastModified: t1,
						mimeType: "text/plain",
					},
				],
			},
		],
	};
}

/** Fetches the workspace file tree (mock). */
export function useWorkspaceTree() {
	return useQuery({
		queryKey: queryKeys.workspace.tree(),
		queryFn: () => Promise.resolve(generateMockTree()),
		staleTime: Number.POSITIVE_INFINITY,
	});
}
