"use client";

import type { Agent } from "@/entities/agent";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { AgentCard } from "./agent-card";

interface AgentGridProps {
	agents: Agent[];
	isLoading: boolean;
}

function AgentGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={`skeleton-${
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no stable id
						i
					}`}
					className="rounded-xl border bg-card p-4"
				>
					<div className="flex items-center gap-4">
						<Skeleton className="size-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export function AgentGrid({ agents, isLoading }: AgentGridProps) {
	if (isLoading) {
		return <AgentGridSkeleton />;
	}

	if (agents.length === 0) {
		return (
			<EmptyState
				title="No agents found"
				description="Try adjusting your search or filter to find what you're looking for."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
		</div>
	);
}
