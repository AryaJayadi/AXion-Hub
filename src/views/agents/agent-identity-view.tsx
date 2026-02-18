"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useAgentIdentity } from "@/features/agents/api/use-agent-identity";
import {
	AgentIdentityEditor,
	AgentIdentityEditorSkeleton,
} from "@/features/agents/components/agent-identity-editor";
import {
	AgentIdentitySidebar,
	AgentIdentitySidebarSkeleton,
} from "@/features/agents/components/agent-identity-sidebar";
import type { IdentityFileKey } from "@/features/agents/lib/identity-templates";
import { Button } from "@/shared/ui/button";

interface AgentIdentityViewProps {
	agentId: string;
}

export function AgentIdentityView({ agentId }: AgentIdentityViewProps) {
	const { files, isLoading, error, refetch, saveFile } = useAgentIdentity(agentId);
	const [activeFile, setActiveFile] = useState<IdentityFileKey>("soul");

	// Local file state for immediate editor updates (avoids waiting for query cache)
	const [localFiles, setLocalFiles] = useState<Record<string, string> | null>(null);

	// Merge server files with local edits
	const mergedFiles = localFiles ?? files;

	const handleFileChange = useCallback(
		(fileKey: string, content: string) => {
			setLocalFiles((prev) => ({
				...(prev ?? files ?? {}),
				[fileKey]: content,
			}));
		},
		[files],
	);

	const handleSave = useCallback(
		async (fileKey: string, content: string) => {
			await saveFile(fileKey, content);
		},
		[saveFile],
	);

	// Initialize local files when server data arrives
	if (files && !localFiles) {
		// Using a side-effect-free pattern: set initial local state on first render with data
		setLocalFiles(files);
	}

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-12rem)]">
				<AgentIdentitySidebarSkeleton />
				<AgentIdentityEditorSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<AlertCircle className="size-10 text-destructive mb-4" />
				<h2 className="text-lg font-semibold">Failed to load identity files</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
				<Button variant="outline" onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		);
	}

	if (!mergedFiles) {
		return null;
	}

	return (
		<div className="flex h-[calc(100vh-12rem)]">
			<AgentIdentitySidebar activeFile={activeFile} onFileSelect={setActiveFile} />
			<AgentIdentityEditor
				activeFile={activeFile}
				files={mergedFiles}
				onSave={handleSave}
				onFileChange={handleFileChange}
			/>
		</div>
	);
}
