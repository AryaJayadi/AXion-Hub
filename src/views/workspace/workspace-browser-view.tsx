"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceTree } from "@/features/workspace/api/use-workspace-tree";
import { useWorkspaceFile } from "@/features/workspace/api/use-workspace-file";
import { FileTree } from "@/features/workspace/components/file-tree";
import { FileViewer } from "@/features/workspace/components/file-viewer";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import {
	SkeletonDetail,
	SkeletonList,
} from "@/shared/ui/loading-skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/shared/ui/resizable";

/**
 * Workspace browser view.
 *
 * Two-panel layout using react-resizable-panels:
 * - Left panel: file tree sidebar with shared + per-agent directories
 * - Right panel: inline file editor using FileViewer (CodeMirror or MDEditor)
 *
 * When a file is selected in the tree, it loads inline via useWorkspaceFile
 * and renders FileViewer in the right panel.
 */
export function WorkspaceBrowserView() {
	const { data: tree, isLoading } = useWorkspaceTree();
	const [activePath, setActivePath] = useState("");

	/** Derive agentId from file path (first segment, or "shared"). */
	const getAgentId = (path: string): string => {
		const firstSegment = path.split("/")[0];
		return firstSegment === "shared" ? "shared" : (firstSegment ?? "shared");
	};

	const agentId = activePath ? getAgentId(activePath) : "";
	const { data: fileData, isLoading: isFileLoading } = useWorkspaceFile(
		agentId,
		activePath,
	);

	const handleSave = useCallback(async (content: string) => {
		// Mock save -- in production this would write to the gateway
		await new Promise((resolve) => setTimeout(resolve, 300));
		toast.success("File saved");
	}, []);

	if (isLoading || !tree) {
		return (
			<div>
				<PageHeader
					title="Workspace"
					description="Browse agent workspace files"
				/>
				<div className="flex h-[calc(100vh-14rem)] border rounded-lg overflow-hidden">
					<div className="w-56 shrink-0 border-r border-border p-3">
						<SkeletonList items={8} />
					</div>
					<div className="flex-1 p-6">
						<SkeletonDetail />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title="Workspace"
				description="Browse agent workspace files"
				actions={
					<Button variant="outline" size="sm" disabled>
						<Upload className="mr-2 size-4" />
						Upload
					</Button>
				}
			/>

			<div className="h-[calc(100vh-14rem)] border rounded-lg overflow-hidden">
				<ResizablePanelGroup orientation="horizontal">
					{/* File tree sidebar */}
					<ResizablePanel
						defaultSize="25%"
						minSize="15%"
						id="workspace-tree"
					>
						<div className="h-full bg-muted/30">
							<div className="px-3 py-2 border-b border-border">
								<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Files
								</span>
							</div>
							<FileTree
								tree={tree}
								activePath={activePath}
								onSelect={setActivePath}
							/>
						</div>
					</ResizablePanel>

					<ResizableHandle />

					{/* Content area */}
					<ResizablePanel
						defaultSize="75%"
						id="workspace-content"
					>
						{activePath && fileData ? (
							<FileViewer file={fileData} onSave={handleSave} />
						) : activePath && isFileLoading ? (
							<div className="p-6">
								<SkeletonDetail />
							</div>
						) : (
							<EmptyState
								title="Select a file to view"
								description="Choose a file from the workspace tree to view or edit its contents."
								className="h-full"
							/>
						)}
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
