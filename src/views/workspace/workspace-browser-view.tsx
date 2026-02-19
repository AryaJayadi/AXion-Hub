"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useWorkspaceTree } from "@/features/workspace/api/use-workspace-tree";
import { FileTree } from "@/features/workspace/components/file-tree";
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
 * - Right panel: file content area (placeholder until Task 2 adds FileViewer)
 *
 * File selection state maintained in React state.
 */
export function WorkspaceBrowserView() {
	const { data: tree, isLoading } = useWorkspaceTree();
	const [activePath, setActivePath] = useState("");

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

	/** Derive agentId from file path (first segment, or "shared"). */
	const getAgentId = (path: string): string => {
		const firstSegment = path.split("/")[0];
		return firstSegment === "shared" ? "shared" : (firstSegment ?? "shared");
	};

	/** Get file size display string. */
	const formatSize = (bytes: number | undefined): string => {
		if (bytes === undefined) return "Unknown";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	/** Find a node by path in the tree. */
	const findNode = (
		node: typeof tree,
		path: string,
	): typeof tree | undefined => {
		if (node.path === path) return node;
		if (node.children) {
			for (const child of node.children) {
				const found = findNode(child, path);
				if (found) return found;
			}
		}
		return undefined;
	};

	const activeNode = activePath ? findNode(tree, activePath) : undefined;

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
						{activeNode && activeNode.type === "file" ? (
							<div className="h-full flex flex-col">
								{/* File header with metadata */}
								<div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/20">
									<span className="font-mono text-sm font-medium truncate">
										{activeNode.path}
									</span>
									<div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
										<span>{formatSize(activeNode.size)}</span>
										{activeNode.lastModified && (
											<span>
												{activeNode.lastModified.toLocaleDateString()}
											</span>
										)}
									</div>
								</div>
								{/* Placeholder for FileViewer (Task 2) */}
								<div className="flex-1 flex items-center justify-center text-muted-foreground">
									<div className="text-center space-y-2">
										<p className="text-sm">File viewer loading for</p>
										<code className="text-xs bg-muted px-2 py-1 rounded font-mono">
											{activeNode.path}
										</code>
										<p className="text-xs text-muted-foreground/70">
											Agent: {getAgentId(activePath)}
										</p>
									</div>
								</div>
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
