"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useWorkspaceFile } from "@/features/workspace/api/use-workspace-file";
import { FileViewer } from "@/features/workspace/components/file-viewer";
import { EmptyState } from "@/shared/ui/empty-state";
import { SkeletonDetail } from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";

interface WorkspaceFileViewProps {
	/** Agent ID from route params. */
	agentId: string;
	/** File path segments from catch-all route params. */
	path: string[];
}

/**
 * Standalone workspace file view for /workspace/[agentId]/[...path].
 *
 * Renders a full-page file editor with breadcrumb navigation.
 * Uses the same FileViewer component as the inline browser.
 */
export function WorkspaceFileView({ agentId, path }: WorkspaceFileViewProps) {
	const filePath = path.join("/");
	const fileName = path[path.length - 1] ?? "unknown";
	const { data: file, isLoading } = useWorkspaceFile(agentId, filePath);

	const handleSave = useCallback(async (_content: string) => {
		// Mock save mutation
		await new Promise((resolve) => setTimeout(resolve, 300));
		toast.success("File saved");
	}, []);

	if (isLoading) {
		return (
			<div>
				<PageHeader
					title="Loading..."
					breadcrumbs={[
						{ label: "Workspace", href: "/workspace" },
						{ label: agentId },
						{ label: fileName },
					]}
				/>
				<SkeletonDetail />
			</div>
		);
	}

	if (!file) {
		return (
			<div>
				<PageHeader
					title="File Not Found"
					breadcrumbs={[
						{ label: "Workspace", href: "/workspace" },
						{ label: agentId },
						{ label: fileName },
					]}
				/>
				<EmptyState
					title="File not found"
					description={`The file "${filePath}" could not be found in ${agentId}'s workspace.`}
				/>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={fileName}
				breadcrumbs={[
					{ label: "Workspace", href: "/workspace" },
					{ label: agentId, href: "/workspace" },
					{ label: fileName },
				]}
			/>
			<div className="h-[calc(100vh-14rem)] border rounded-lg overflow-hidden">
				<FileViewer file={file} onSave={handleSave} />
			</div>
		</div>
	);
}
