"use client";

import type { FileTreeNode as FileTreeNodeType } from "@/entities/workspace";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { FileTreeNode } from "./file-tree-node";

interface FileTreeProps {
	/** Root tree node (children are rendered). */
	tree: FileTreeNodeType;
	/** Currently selected file path. */
	activePath: string;
	/** Callback when a file is selected. */
	onSelect: (path: string) => void;
}

/**
 * File tree sidebar component.
 *
 * Renders a recursive file tree using Collapsible for directories
 * and selectable buttons for files. Wrapped in ScrollArea for overflow.
 */
export function FileTree({ tree, activePath, onSelect }: FileTreeProps) {
	return (
		<ScrollArea className="h-full">
			<div className="py-2">
				{tree.children?.map((child) => (
					<FileTreeNode
						key={child.path}
						node={child}
						depth={1}
						activePath={activePath}
						onSelect={onSelect}
					/>
				))}
			</div>
		</ScrollArea>
	);
}
