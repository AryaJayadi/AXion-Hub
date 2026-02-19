"use client";

import { useQuery } from "@tanstack/react-query";
import type { MemorySearchResult } from "@/entities/memory";
import { queryKeys } from "@/shared/lib/query-keys";
import { MOCK_MEMORY_GROUPS } from "./use-memory-browser";

// ---------------------------------------------------------------------------
// Client-side fuzzy text search across all mock memory entries
// ---------------------------------------------------------------------------

function searchMemories(
	query: string,
	agentId: string | undefined,
): MemorySearchResult[] {
	const lowerQuery = query.toLowerCase();
	const results: MemorySearchResult[] = [];

	const groups = agentId
		? MOCK_MEMORY_GROUPS.filter((g) => g.agentId === agentId)
		: MOCK_MEMORY_GROUPS;

	for (const group of groups) {
		for (const entry of group.memories) {
			const lowerContent = entry.content.toLowerCase();
			const matchIndex = lowerContent.indexOf(lowerQuery);

			if (matchIndex === -1) continue;

			// Count total matches for relevance scoring
			let matchCount = 0;
			let searchFrom = 0;
			while (true) {
				const idx = lowerContent.indexOf(lowerQuery, searchFrom);
				if (idx === -1) break;
				matchCount++;
				searchFrom = idx + 1;
			}

			// Extract snippet (100 chars around first match)
			const snippetStart = Math.max(0, matchIndex - 50);
			const snippetEnd = Math.min(entry.content.length, matchIndex + query.length + 50);
			const snippet = entry.content.slice(snippetStart, snippetEnd);

			// Extract before/after context
			const beforeStart = Math.max(0, snippetStart - 50);
			const beforeContext = entry.content.slice(beforeStart, snippetStart);
			const afterEnd = Math.min(entry.content.length, snippetEnd + 50);
			const afterContext = entry.content.slice(snippetEnd, afterEnd);

			// Calculate relevance score: earlier match = higher, more matches = higher
			const positionScore = 1 - matchIndex / entry.content.length;
			const frequencyScore = Math.min(matchCount / 5, 1);
			const relevanceScore = Math.round((positionScore * 0.4 + frequencyScore * 0.6) * 100) / 100;

			results.push({
				id: `search-${entry.id}`,
				agentId: entry.agentId,
				agentName: entry.agentName,
				memoryType: entry.memoryType,
				filePath: entry.filePath,
				snippet,
				beforeContext,
				afterContext,
				relevanceScore: Math.min(relevanceScore, 1),
				lastModified: entry.lastModified,
			});
		}
	}

	// Sort by relevance descending
	results.sort((a, b) => b.relevanceScore - a.relevanceScore);

	return results;
}

interface UseMemorySearchOptions {
	query: string;
	agentId?: string | undefined;
}

export function useMemorySearch({ query, agentId }: UseMemorySearchOptions) {
	const { data, isLoading, isFetching } = useQuery({
		queryKey: queryKeys.memory.search(query, agentId),
		queryFn: async () => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 300));
			return searchMemories(query, agentId);
		},
		enabled: query.length >= 2,
		staleTime: Number.POSITIVE_INFINITY,
	});

	return {
		results: data ?? [],
		isLoading: isLoading && query.length >= 2,
		isFetching,
	};
}
