"use client";

import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import type { MemoryEntry } from "@/entities/memory";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(1)} KB`;
}

interface MemoryTypeListProps {
	label: string;
	entries: MemoryEntry[];
	selectedMemoryId: string | null;
	onSelect: (entry: MemoryEntry) => void;
}

export function MemoryTypeList({
	label,
	entries,
	selectedMemoryId,
	onSelect,
}: MemoryTypeListProps) {
	return (
		<div className="px-2 py-1">
			{/* Section header */}
			<div className="flex items-center gap-2 px-2 py-1.5">
				<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					{label}
				</span>
				<Badge variant="outline" className="text-[10px] px-1 py-0">
					{entries.length}
				</Badge>
			</div>

			{/* File entries */}
			{entries.map((entry) => {
				const isActive = selectedMemoryId === entry.id;
				return (
					<button
						key={entry.id}
						type="button"
						onClick={() => onSelect(entry)}
						className={cn(
							"w-full text-left rounded-md px-2 py-2 text-sm transition-colors flex items-center gap-2",
							isActive
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
						)}
					>
						<FileText className="size-3.5 shrink-0" />
						<span className="flex-1 font-mono text-xs truncate">{entry.fileName}</span>
						<span className="text-[10px] text-muted-foreground shrink-0">
							{formatDistanceToNow(entry.lastModified, { addSuffix: true })}
						</span>
						<span className="text-[10px] text-muted-foreground shrink-0">
							{formatSize(entry.size)}
						</span>
					</button>
				);
			})}
		</div>
	);
}
