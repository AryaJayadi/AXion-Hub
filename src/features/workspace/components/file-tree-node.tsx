"use client";

import { memo, useState } from "react";
import {
	ChevronRight,
	File,
	FileCode,
	FileJson,
	FileText,
	FileType,
	Folder,
	FolderOpen,
} from "lucide-react";
import type { FileTreeNode as FileTreeNodeType } from "@/entities/workspace";
import { cn } from "@/shared/lib/cn";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";

/** Map file extension to an icon component. */
function getFileIcon(name: string) {
	const ext = name.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "md":
		case "mdx":
			return FileText;
		case "ts":
		case "tsx":
		case "js":
		case "jsx":
		case "py":
			return FileCode;
		case "json":
			return FileJson;
		case "yaml":
		case "yml":
			return FileType;
		default:
			return File;
	}
}

interface FileTreeNodeProps {
	node: FileTreeNodeType;
	depth: number;
	activePath: string;
	onSelect: (path: string) => void;
}

/**
 * Recursive file tree node component.
 *
 * Files render as selectable buttons with file-type icons.
 * Directories render as collapsible sections with folder icons
 * and recursively render their children.
 */
export const FileTreeNode = memo(function FileTreeNode({
	node,
	depth,
	activePath,
	onSelect,
}: FileTreeNodeProps) {
	const [isOpen, setIsOpen] = useState(depth < 2);

	if (node.type === "file") {
		const Icon = getFileIcon(node.name);
		const isActive = activePath === node.path;

		return (
			<button
				type="button"
				onClick={() => onSelect(node.path)}
				className={cn(
					"w-full text-left py-1.5 text-sm flex items-center gap-2 transition-colors pr-3",
					isActive
						? "bg-accent text-accent-foreground"
						: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
				)}
				style={{ paddingLeft: `${depth * 12 + 12}px` }}
			>
				<Icon className="size-3.5 shrink-0" />
				<span className="truncate font-mono text-xs">{node.name}</span>
			</button>
		);
	}

	// Directory node
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger
				className="w-full flex items-center gap-1.5 py-1.5 text-sm text-foreground hover:bg-accent/30 transition-colors pr-3"
				style={{ paddingLeft: `${depth * 12}px` }}
			>
				<ChevronRight
					className={cn(
						"size-3.5 shrink-0 transition-transform",
						isOpen && "rotate-90",
					)}
				/>
				{isOpen ? (
					<FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
				) : (
					<Folder className="size-3.5 shrink-0 text-muted-foreground" />
				)}
				<span className="truncate font-mono text-xs font-medium">
					{node.name}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				{node.children?.map((child) => (
					<FileTreeNode
						key={child.path}
						node={child}
						depth={depth + 1}
						activePath={activePath}
						onSelect={onSelect}
					/>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
},
(prev, next) =>
	prev.node.path === next.node.path &&
	prev.activePath === next.activePath &&
	prev.depth === next.depth,
);
