"use client";

import { AlertCircle } from "lucide-react";
import { useAgentMemory } from "@/features/agents/api/use-agent-memory";
import {
	AgentMemoryBrowser,
	AgentMemoryBrowserSkeleton,
} from "@/features/agents/components/agent-memory-browser";
import { AgentMemorySearch } from "@/features/agents/components/agent-memory-search";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface AgentMemoryViewProps {
	agentId: string;
}

export function AgentMemoryView({ agentId }: AgentMemoryViewProps) {
	const {
		memoryFiles,
		isLoading,
		error,
		saveMemoryFile,
		isSaving,
		searchMemory,
		searchResults,
	} = useAgentMemory(agentId);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<h2 className="text-xl font-semibold">Memory</h2>
				</div>
				<AgentMemoryBrowserSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load memory files</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<h2 className="text-xl font-semibold">Memory</h2>
					<Badge variant="secondary">{memoryFiles.length} files</Badge>
				</div>
				<div className="w-64">
					<AgentMemorySearch onSearch={searchMemory} />
				</div>
			</div>

			<AgentMemoryBrowser
				memoryFiles={memoryFiles}
				onSave={saveMemoryFile}
				isSaving={isSaving}
				searchResults={searchResults}
			/>
		</div>
	);
}
