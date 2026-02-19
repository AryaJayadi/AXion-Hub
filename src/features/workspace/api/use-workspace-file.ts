"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkspaceFile } from "@/entities/workspace";
import { queryKeys } from "@/shared/lib/query-keys";

/** Map file extension to language name for editor. */
function detectLanguage(ext: string): string {
	switch (ext) {
		case "ts":
		case "tsx":
			return "typescript";
		case "js":
		case "jsx":
			return "javascript";
		case "json":
			return "json";
		case "md":
		case "mdx":
			return "markdown";
		case "py":
			return "python";
		case "yaml":
		case "yml":
			return "yaml";
		case "log":
			return "plaintext";
		default:
			return "plaintext";
	}
}

/** Generate mock file content based on extension. */
function generateMockContent(filePath: string, ext: string): string {
	switch (ext) {
		case "ts":
		case "tsx":
			return `import { z } from "zod/v4";

/**
 * Agent task configuration schema.
 * Validates incoming task parameters before execution.
 */
export const taskConfigSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  maxRetries: z.number().int().min(0).max(10).default(3),
  timeout: z.number().positive().default(30_000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TaskConfig = z.infer<typeof taskConfigSchema>;

interface TaskResult {
  success: boolean;
  output: string;
  tokensUsed: number;
  durationMs: number;
}

export async function executeTask(
  config: TaskConfig,
): Promise<TaskResult> {
  const startTime = performance.now();

  // Validate configuration
  const validated = taskConfigSchema.parse(config);

  // Simulate task execution
  const output = \`Executed task "\${validated.name}" with priority \${validated.priority}\`;

  return {
    success: true,
    output,
    tokensUsed: Math.floor(Math.random() * 5000) + 500,
    durationMs: Math.round(performance.now() - startTime),
  };
}
`;
		case "py":
			return `"""
Agent utility functions for data processing.
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Any


def load_config(config_path: str) -> dict[str, Any]:
    """Load agent configuration from a JSON file."""
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")
    return json.loads(path.read_text())


def format_timestamp(dt: datetime) -> str:
    """Format a datetime for log output."""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


class AgentLogger:
    """Simple logger for agent operations."""

    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.entries: list[str] = []

    def log(self, message: str) -> None:
        ts = format_timestamp(datetime.now())
        entry = f"[{ts}] [{self.agent_id}] {message}"
        self.entries.append(entry)
        print(entry)
`;
		case "json":
			return JSON.stringify(
				{
					name: "workspace-config",
					version: "1.0.0",
					agents: {
						"research-agent": {
							model: "claude-sonnet-4",
							maxTokens: 4096,
							temperature: 0.7,
						},
						"code-agent": {
							model: "claude-sonnet-4",
							maxTokens: 8192,
							temperature: 0.3,
						},
						"data-agent": {
							model: "claude-sonnet-4",
							maxTokens: 4096,
							temperature: 0.5,
						},
					},
					settings: {
						autoSave: true,
						logLevel: "info",
						maxConcurrentTasks: 5,
					},
				},
				null,
				2,
			);
		case "md":
		case "mdx":
			return `# ${filePath.split("/").pop()?.replace(/\\.mdx?$/, "") ?? "Document"}

## Overview

This document provides notes and documentation for the workspace.

### Key Points

- Agent workspace files are organized by agent
- Shared files are accessible to all agents
- Output files contain task results and summaries

### Usage

\`\`\`bash
# Run the agent with workspace access
axion agent run --workspace ./workspace
\`\`\`

## References

- [Agent Configuration Guide](https://docs.axion.hub/agents)
- [Workspace Management](https://docs.axion.hub/workspace)

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`;
		case "yaml":
		case "yml":
			return `# Agent workspace configuration
name: workspace-config
version: "1.0"

agents:
  research-agent:
    model: claude-sonnet-4
    max_tokens: 4096
    temperature: 0.7
    tools:
      - web_search
      - file_read
      - file_write

  code-agent:
    model: claude-sonnet-4
    max_tokens: 8192
    temperature: 0.3
    tools:
      - code_execute
      - file_read
      - file_write

settings:
  auto_save: true
  log_level: info
  max_concurrent_tasks: 5
  workspace_root: ./workspace
`;
		case "log":
			return `[2026-02-19 04:00:01] [INFO] Agent started successfully
[2026-02-19 04:00:02] [INFO] Loading workspace configuration...
[2026-02-19 04:00:02] [INFO] Connected to gateway at ws://localhost:3100
[2026-02-19 04:00:05] [INFO] Received task: analyze-dataset (priority: high)
[2026-02-19 04:00:05] [DEBUG] Task config: {"maxRetries": 3, "timeout": 30000}
[2026-02-19 04:00:06] [INFO] Starting task execution...
[2026-02-19 04:00:12] [INFO] Task completed successfully (6.2s, 2847 tokens)
[2026-02-19 04:00:15] [INFO] Received task: generate-report (priority: medium)
[2026-02-19 04:00:15] [INFO] Starting task execution...
[2026-02-19 04:00:28] [INFO] Task completed successfully (13.1s, 5102 tokens)
[2026-02-19 04:00:30] [WARN] High memory usage detected: 78%
[2026-02-19 04:00:45] [INFO] Idle - waiting for next task
`;
		default:
			return `// File: ${filePath}\n// No content generator for this file type.\n`;
	}
}

/**
 * TanStack Query hook for loading a single workspace file with content.
 *
 * Generates mock content based on file extension for development.
 * Language detection maps extensions to editor language modes.
 */
export function useWorkspaceFile(agentId: string, filePath: string) {
	const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

	return useQuery({
		queryKey: queryKeys.workspace.file(agentId, filePath),
		queryFn: (): Promise<WorkspaceFile> => {
			const content = generateMockContent(filePath, ext);
			return Promise.resolve({
				path: filePath,
				agentId: agentId === "shared" ? null : agentId,
				content,
				language: detectLanguage(ext),
				size: new Blob([content]).size,
				lastModified: new Date(),
				isReadOnly: ext === "log",
			});
		},
		staleTime: Number.POSITIVE_INFINITY,
		enabled: Boolean(agentId) && Boolean(filePath),
	});
}
