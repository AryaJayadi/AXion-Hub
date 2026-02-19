"use client";

import { useMemo } from "react";
import type { MemorySearchResult } from "@/entities/memory";
import { EmptyState } from "@/shared/ui/empty-state";

import { MemorySearchCard } from "./memory-search-card";

interface MemorySearchResultsProps {
	results: MemorySearchResult[];
	query: string;
}

export function MemorySearchResults({ results, query }: MemorySearchResultsProps) {
	const uniqueAgentCount = useMemo(() => {
		const ids = new Set(results.map((r) => r.agentId));
		return ids.size;
	}, [results]);

	if (results.length === 0) {
		return (
			<EmptyState
				title="No memories found"
				description="Try different keywords or broaden your search terms."
			/>
		);
	}

	return (
		<div>
			{/* Result count */}
			<p className="text-sm text-muted-foreground mb-4">
				{results.length} result{results.length !== 1 ? "s" : ""} across{" "}
				{uniqueAgentCount} agent{uniqueAgentCount !== 1 ? "s" : ""}
			</p>

			{/* Responsive card grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{results.map((result) => (
					<MemorySearchCard key={result.id} result={result} query={query} />
				))}
			</div>
		</div>
	);
}
