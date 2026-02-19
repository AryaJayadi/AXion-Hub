"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import { Brain } from "lucide-react";
import type { MemoryEntry } from "@/entities/memory";
import { Badge } from "@/shared/ui/badge";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const MEMORY_TYPE_LABELS: Record<string, string> = {
	persistent: "Persistent",
	daily: "Daily",
	conversation: "Conversation",
};

interface MemoryPreviewProps {
	entry: MemoryEntry | null;
}

export function MemoryPreview({ entry }: MemoryPreviewProps) {
	const { resolvedTheme } = useTheme();

	if (!entry) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
				<Brain className="size-10 opacity-30" />
				<p className="text-sm">Select a memory file to preview</p>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-w-0">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/20">
				<div className="flex items-center gap-2 min-w-0">
					<span className="font-mono text-sm font-medium truncate">{entry.filePath}</span>
					<Badge variant="outline" className="text-[10px] shrink-0">
						{entry.agentName}
					</Badge>
					<Badge variant="secondary" className="text-[10px] shrink-0">
						{MEMORY_TYPE_LABELS[entry.memoryType] ?? entry.memoryType}
					</Badge>
				</div>
				<span className="text-xs text-muted-foreground shrink-0 ml-2">
					{formatDistanceToNow(entry.lastModified, { addSuffix: true })}
				</span>
			</div>

			{/* Content -- read-only markdown preview */}
			<div
				className="flex-1 overflow-auto"
				data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
			>
				<MDEditor
					value={entry.content}
					preview="preview"
					visibleDragbar={false}
					height="100%"
					hideToolbar
					style={{ background: "transparent" }}
				/>
			</div>
		</div>
	);
}
