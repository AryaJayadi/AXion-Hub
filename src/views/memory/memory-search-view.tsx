"use client";

import Link from "next/link";
import { useQueryState } from "nuqs";
import { BookOpen, Search } from "lucide-react";
import { useMemorySearch } from "@/features/memory/api/use-memory-search";
import { MOCK_MEMORY_GROUPS } from "@/features/memory/api/use-memory-browser";
import { MemorySearchResults } from "@/features/memory/components/memory-search-results";
import { SearchInput } from "@/shared/ui/search-input";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/loading-skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

export function MemorySearchView() {
	const [query, setQuery] = useQueryState("q", { defaultValue: "" });
	const [agentFilter, setAgentFilter] = useQueryState("agent", {
		defaultValue: "all",
	});

	const selectedAgentId = agentFilter === "all" ? undefined : agentFilter;
	const { results, isLoading } = useMemorySearch({
		query,
		agentId: selectedAgentId,
	});

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Memory Search"
				description="Search across all agent memories"
				breadcrumbs={[
					{ label: "Memory", href: "/memory" },
					{ label: "Search" },
				]}
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href="/memory">
							<BookOpen className="mr-1.5 size-4" />
							Browse memories
						</Link>
					</Button>
				}
			/>

			{/* Search controls */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder="Search memories..."
					debounceMs={300}
					className="flex-1"
				/>
				<Select
					value={agentFilter}
					onValueChange={setAgentFilter}
				>
					<SelectTrigger className="w-full sm:w-48">
						<SelectValue placeholder="All agents" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All agents</SelectItem>
						{MOCK_MEMORY_GROUPS.map((group) => (
							<SelectItem key={group.agentId} value={group.agentId}>
								{group.agentName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Results area */}
			{query.length < 2 ? (
				<div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
					<Search className="size-12 opacity-20" />
					<div className="text-center">
						<p className="text-sm font-medium">Search across all agent memories</p>
						<p className="text-xs mt-1 text-muted-foreground/70">
							Type at least 2 characters to begin searching
						</p>
					</div>
				</div>
			) : isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			) : (
				<MemorySearchResults results={results} query={query} />
			)}
		</div>
	);
}
