"use client";

import { useQueryState } from "nuqs";
import { useMemo } from "react";
import type { AgentStatus } from "@/entities/agent";
import { useAgents } from "@/features/agents/api/use-agents";
import { AgentGrid } from "@/features/agents/components/agent-grid";
import { AgentSearchBar } from "@/features/agents/components/agent-search-bar";
import { PageHeader } from "@/shared/ui/page-header";

export function AgentsRosterView() {
	const { agents, isLoading } = useAgents();
	const [search, setSearch] = useQueryState("q", { defaultValue: "" });
	const [statusFilter, setStatusFilter] = useQueryState("status", {
		defaultValue: "all",
	});

	const filtered = useMemo(() => {
		return agents.filter((agent) => {
			const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || agent.status === (statusFilter as AgentStatus);
			return matchesSearch && matchesStatus;
		});
	}, [agents, search, statusFilter]);

	return (
		<div className="space-y-6">
			<PageHeader title="Agents" description="View and manage your AI agents" />

			<AgentSearchBar
				search={search}
				onSearchChange={setSearch}
				status={statusFilter}
				onStatusChange={setStatusFilter}
			/>

			<AgentGrid agents={filtered} isLoading={isLoading} />
		</div>
	);
}
