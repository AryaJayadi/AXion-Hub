"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgentMemoryGroup, MemoryEntry } from "@/entities/memory";
import { queryKeys } from "@/shared/lib/query-keys";

// ---------------------------------------------------------------------------
// Mock data: 4 agents, each with persistent + daily + conversation memories
// ---------------------------------------------------------------------------

function buildMockMemories(): AgentMemoryGroup[] {
	const agents = [
		{ id: "agent-atlas", name: "Atlas", avatar: undefined },
		{ id: "agent-nova", name: "Nova", avatar: undefined },
		{ id: "agent-cipher", name: "Cipher", avatar: undefined },
		{ id: "agent-echo", name: "Echo", avatar: undefined },
	];

	return agents.map((agent) => {
		const memories: MemoryEntry[] = [];

		// Persistent memory (MEMORY.md)
		memories.push({
			id: `${agent.id}-persistent-1`,
			agentId: agent.id,
			agentName: agent.name,
			memoryType: "persistent",
			filePath: `agents/${agent.id}/MEMORY.md`,
			fileName: "MEMORY.md",
			content: `# ${agent.name} Persistent Memory

## User Preferences

- Preferred communication style: concise and technical
- Working hours: 9am-6pm EST
- Primary project: AXion Hub platform development

## Key Context

- The project uses **Next.js 15** with App Router and **TypeScript** strict mode
- Feature-Sliced Design (FSD) architecture with layers: app, views, features, entities, shared
- UI built with **shadcn/ui v3** components and **Tailwind CSS v4**
- State management: Zustand for push state, TanStack Query for pull state

## Important Notes

- Always run \`npx tsc --noEmit\` before committing changes
- Use \`exactOptionalPropertyTypes\` pattern: optional props need \`| undefined\`
- Mock data is used until gateway integration is complete
- The user values code quality and consistent patterns across the codebase
`,
			lastModified: new Date("2025-02-18T14:30:00Z"),
			size: 742,
		});

		// Daily memories
		memories.push({
			id: `${agent.id}-daily-1`,
			agentId: agent.id,
			agentName: agent.name,
			memoryType: "daily",
			filePath: `agents/${agent.id}/daily/2025-02-18.md`,
			fileName: "2025-02-18.md",
			content: `# Daily Log - February 18, 2025

## Tasks Completed
- Implemented gateway health monitoring dashboard
- Fixed TypeScript strict mode errors in channel routing
- Reviewed pull request for model failover configuration

## Observations
- Build time increased by 12% after adding new dependencies
- User requested more detailed error messages in the UI
`,
			lastModified: new Date("2025-02-18T23:59:00Z"),
			size: 384,
		});

		memories.push({
			id: `${agent.id}-daily-2`,
			agentId: agent.id,
			agentName: agent.name,
			memoryType: "daily",
			filePath: `agents/${agent.id}/daily/2025-02-17.md`,
			fileName: "2025-02-17.md",
			content: `# Daily Log - February 17, 2025

## Tasks Completed
- Set up mission board with Kanban columns
- Created task detail slide-over component
- Added drag-and-drop support with dnd-kit

## Blockers
- None today
`,
			lastModified: new Date("2025-02-17T23:59:00Z"),
			size: 256,
		});

		if (agent.id !== "agent-echo") {
			memories.push({
				id: `${agent.id}-daily-3`,
				agentId: agent.id,
				agentName: agent.name,
				memoryType: "daily",
				filePath: `agents/${agent.id}/daily/2025-02-16.md`,
				fileName: "2025-02-16.md",
				content: `# Daily Log - February 16, 2025

## Tasks Completed
- Refactored shared UI components for consistency
- Updated query key factory with new domains

## Notes
- Explored Biome 2 configuration for Tailwind v4 CSS parsing
`,
				lastModified: new Date("2025-02-16T23:59:00Z"),
				size: 218,
			});
		}

		// Conversation memories
		memories.push({
			id: `${agent.id}-conv-1`,
			agentId: agent.id,
			agentName: agent.name,
			memoryType: "conversation",
			filePath: `agents/${agent.id}/conversations/conv-abc123.md`,
			fileName: "conv-abc123.md",
			content: `# Conversation Summary

**Topic:** Architecture discussion about state management patterns

**Key Points:**
- Decided to use Zustand for WebSocket push state and TanStack Query for REST pull state
- Agreed on query key factory pattern for cache invalidation
- User emphasized separation of concerns between real-time and request-response data

**Action Items:**
- Implement gateway provider with auto-connect behavior
- Add staleTime: Infinity to prevent WebSocket/Query desync
`,
			lastModified: new Date("2025-02-15T10:30:00Z"),
			size: 445,
		});

		if (agent.id === "agent-atlas" || agent.id === "agent-cipher") {
			memories.push({
				id: `${agent.id}-conv-2`,
				agentId: agent.id,
				agentName: agent.name,
				memoryType: "conversation",
				filePath: `agents/${agent.id}/conversations/conv-def456.md`,
				fileName: "conv-def456.md",
				content: `# Conversation Summary

**Topic:** UI design review for dashboard widgets

**Key Points:**
- Bento grid layout approved for dashboard with responsive breakpoints
- Status badge pulse animation for real-time count changes
- Cost widget should show both bar chart and data table

**Decision:** Use Recharts for all chart visualizations with CSS variable colors.
`,
				lastModified: new Date("2025-02-14T16:00:00Z"),
				size: 378,
			});
		}

		return {
			agentId: agent.id,
			agentName: agent.name,
			agentAvatar: agent.avatar,
			memories,
		};
	});
}

const MOCK_DATA = buildMockMemories();

export function useMemoryBrowser() {
	const { data, isLoading } = useQuery({
		queryKey: queryKeys.memory.browser(),
		queryFn: async () => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 400));
			return MOCK_DATA;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	return {
		groups: data ?? [],
		isLoading,
	};
}

/** Export mock data for reuse in search hook */
export { MOCK_DATA as MOCK_MEMORY_GROUPS };
