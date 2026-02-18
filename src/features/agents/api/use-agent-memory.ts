"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AgentMemoryFile } from "@/entities/agent";

/** Realistic MEMORY.md content for mock data. */
const MOCK_MEMORY_MD = `# Agent Memory

## Active Context

Currently working on the AXion Hub dashboard project. The team uses TypeScript,
React, and Next.js. We follow feature-sliced design for project organization.

## Key Decisions

- Use TanStack Query for server state, Zustand for client state
- shadcn/ui for component library with Tailwind CSS v4
- Biome for linting and formatting (not ESLint/Prettier)
- PostgreSQL for primary database, Redis for caching and queues

## User Preferences

The primary user prefers:
- Concise responses with code examples
- TypeScript with strict mode enabled
- Functional patterns over class-based
- Tests for business logic, integration tests for APIs

## Important References

- Project docs: .planning/PROJECT.md
- Gateway protocol: docs/gateway-protocol.md
- Auth setup: better-auth with organization plugin

## Learned Patterns

- exactOptionalPropertyTypes requires \`| undefined\` on optional props
- shadcn/ui components need prop default fixes for strict TS
- Zod v4 uses "zod/v4" import path in this project
- Agent status glow uses box-shadow to prevent layout shift
`;

/** Generate realistic daily memory files. */
function generateDailyMemoryFiles(): AgentMemoryFile[] {
	const days = [
		{
			name: "2026-02-17.md",
			content: `# February 17, 2026

## Tasks Completed
- Implemented agent creation wizard with 7-step flow
- Added template gallery with 4 pre-built agent templates
- Fixed zodResolver type compatibility with Zod v4

## Key Interactions
- Discussed wizard state management approach (Zustand with sessionStorage persist)
- Resolved exactOptionalPropertyTypes conflict in slider component

## Observations
- LucideIcon mapping requires explicit Record<string, LucideIcon> for strict TS
- Smart defaults improve wizard UX significantly -- pre-fill model config and sandbox settings
`,
		},
		{
			name: "2026-02-16.md",
			content: `# February 16, 2026

## Tasks Completed
- Built agent detail layout with persistent sidebar navigation
- Created overview page with 4 stat widget cards
- Implemented recent activity feed and quick actions

## Key Interactions
- Designed sidebar active state detection using pathname matching
- Added loading skeletons matching exact page layout shapes

## Observations
- usePathname exact match for overview, startsWith for sub-pages prevents false positives
- Static skeleton components satisfy Biome noArrayIndexKey rule
`,
		},
		{
			name: "2026-02-15.md",
			content: `# February 15, 2026

## Tasks Completed
- Set up agent roster view with card grid layout
- Implemented agent search and status filtering
- Connected TanStack Query with Zustand for agent state

## Key Interactions
- Discussed card design: employee badge style, status glow via box-shadow

## Observations
- NuqsAdapter needed in AppProviders for URL search param state
- staleTime Infinity prevents WebSocket/Query desync
`,
		},
		{
			name: "2026-02-14.md",
			content: `# February 14, 2026

## Tasks Completed
- Completed Phase 2: authentication and app shell
- Set up better-auth with organization plugin
- Built dashboard layout with sidebar navigation

## Key Interactions
- Resolved auth schema compatibility with drizzle adapter
- Configured org switcher with deterministic color avatars

## Observations
- requestPasswordReset is the correct better-auth method (not forgetPassword)
- Verify email needs Suspense boundary for useSearchParams
`,
		},
		{
			name: "2026-02-13.md",
			content: `# February 13, 2026

## Tasks Completed
- Infrastructure setup: Docker, database, Redis, BullMQ workers
- Established audit logging pattern with createAuditLog and withAudit HOC

## Key Interactions
- Discussed service architecture for containerized development
- Configured Turbopack compatibility with server external packages

## Observations
- pg and ioredis need serverExternalPackages for Turbopack
- Worker service shares codebase via bind mount, runs workers/index.ts
`,
		},
	];

	const now = Date.now();
	const day = 24 * 3_600_000;

	return days.map((d, i) => ({
		name: d.name,
		path: `memory/${d.name}`,
		content: d.content,
		lastModified: new Date(now - (i + 1) * day),
	}));
}

// TODO: Replace with gatewayClient.agent.memory.list(agentId)
async function fetchAgentMemory(
	_agentId: string,
): Promise<AgentMemoryFile[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const memoryMd: AgentMemoryFile = {
		name: "MEMORY.md",
		path: "MEMORY.md",
		content: MOCK_MEMORY_MD,
		lastModified: new Date(),
	};

	return [memoryMd, ...generateDailyMemoryFiles()];
}

// TODO: Replace with gatewayClient.agent.memory.save(agentId, path, content)
async function saveMemoryFile(
	_agentId: string,
	_path: string,
	_content: string,
): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	// eslint-disable-next-line no-console
	console.log(`[mock] Saved memory file "${_path}" for agent ${_agentId}`);
}

/**
 * TanStack Query hook for fetching and managing agent memory files.
 *
 * Returns memory file list, loading state, save mutation, and search function.
 * Pattern: staleTime Infinity + refetchOnWindowFocus false.
 */
export function useAgentMemory(agentId: string) {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");

	const query = useQuery({
		queryKey: ["agents", agentId, "memory"],
		queryFn: () => fetchAgentMemory(agentId),
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		enabled: !!agentId,
	});

	const mutation = useMutation({
		mutationFn: ({ path, content }: { path: string; content: string }) =>
			saveMemoryFile(agentId, path, content),
		onSuccess: (_data, variables) => {
			// Optimistically update the query cache
			queryClient.setQueryData<AgentMemoryFile[]>(
				["agents", agentId, "memory"],
				(prev) =>
					prev?.map((f) =>
						f.path === variables.path
							? { ...f, content: variables.content, lastModified: new Date() }
							: f,
					),
			);
		},
		onError: () => {
			toast.error("Failed to save memory file");
		},
	});

	const memoryFiles = query.data ?? [];

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) return null;
		const q = searchQuery.toLowerCase();
		return memoryFiles
			.filter((f) => f.content.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
			.map((f) => f.path);
	}, [memoryFiles, searchQuery]);

	const searchMemory = useCallback((q: string) => {
		setSearchQuery(q);
	}, []);

	return {
		memoryFiles,
		isLoading: query.isLoading,
		error: query.error,
		saveMemoryFile: (path: string, content: string) =>
			mutation.mutateAsync({ path, content }),
		isSaving: mutation.isPending,
		searchMemory,
		searchQuery,
		searchResults,
	};
}
