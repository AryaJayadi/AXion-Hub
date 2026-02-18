"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FileText, Lock, Pencil } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import type { AgentMemoryFile } from "@/entities/agent";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";

// Dynamic import for SSR safety (Pitfall 1 from research)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface AgentMemoryBrowserProps {
	memoryFiles: AgentMemoryFile[];
	onSave: (path: string, content: string) => Promise<void>;
	isSaving: boolean;
	searchResults: string[] | null;
}

function isMemoryMd(file: AgentMemoryFile): boolean {
	return file.name === "MEMORY.md";
}

export function AgentMemoryBrowser({
	memoryFiles,
	onSave,
	isSaving,
	searchResults,
}: AgentMemoryBrowserProps) {
	const [activeFilePath, setActiveFilePath] = useState<string>(
		memoryFiles[0]?.path ?? "",
	);
	const [localContents, setLocalContents] = useState<Record<string, string>>(
		() => {
			const map: Record<string, string> = {};
			for (const f of memoryFiles) {
				map[f.path] = f.content;
			}
			return map;
		},
	);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

	const activeFile = memoryFiles.find((f) => f.path === activeFilePath);
	const isEditable = activeFile ? isMemoryMd(activeFile) : false;

	const debouncedSave = useDebouncedCallback(async (path: string, content: string) => {
		setSaveStatus("saving");
		try {
			await onSave(path, content);
			setSaveStatus("saved");
			setTimeout(() => setSaveStatus("idle"), 2000);
		} catch {
			setSaveStatus("idle");
		}
	}, 500);

	const handleContentChange = (value: string | undefined) => {
		if (!activeFile || !isEditable || value === undefined) return;
		setLocalContents((prev) => ({ ...prev, [activeFile.path]: value }));
		void debouncedSave(activeFile.path, value);
	};

	const handleFileSelect = (path: string) => {
		// Flush pending save before switching
		debouncedSave.flush();
		setActiveFilePath(path);
	};

	// Separate persistent and daily files
	const persistentFiles = memoryFiles.filter(isMemoryMd);
	const dailyFiles = memoryFiles.filter((f) => !isMemoryMd(f));

	return (
		<div className="flex border rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
			{/* File tree sidebar */}
			<aside className="w-56 shrink-0 border-r border-border bg-muted/30">
				<ScrollArea className="h-full">
					<div className="py-3">
						{/* Persistent Memory section */}
						<div className="px-3 mb-1">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
								Persistent Memory
							</span>
						</div>
						{persistentFiles.map((file) => {
							const isActive = activeFilePath === file.path;
							const isMatch = searchResults?.includes(file.path);
							return (
								<button
									key={file.path}
									type="button"
									onClick={() => handleFileSelect(file.path)}
									className={cn(
										"w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
										isActive
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
									)}
								>
									<Pencil className="size-3.5 shrink-0" />
									<span className="font-mono text-xs truncate">{file.name}</span>
									{isMatch && (
										<Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">
											match
										</Badge>
									)}
								</button>
							);
						})}

						{/* Daily Memory section */}
						<div className="px-3 mt-4 mb-1">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
								Daily Memory
							</span>
						</div>
						{dailyFiles.map((file) => {
							const isActive = activeFilePath === file.path;
							const isMatch = searchResults?.includes(file.path);
							return (
								<button
									key={file.path}
									type="button"
									onClick={() => handleFileSelect(file.path)}
									className={cn(
										"w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
										isActive
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
									)}
								>
									<FileText className="size-3.5 shrink-0" />
									<span className="font-mono text-xs truncate">{file.name}</span>
									{isMatch && (
										<Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">
											match
										</Badge>
									)}
								</button>
							);
						})}
					</div>
				</ScrollArea>
			</aside>

			{/* Content area */}
			<div className="flex-1 flex flex-col min-w-0">
				{activeFile ? (
					<>
						{/* File header */}
						<div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/20">
							<span className="font-mono text-sm font-medium">{activeFile.name}</span>
							<div className="flex items-center gap-2">
								{!isEditable && (
									<Badge variant="outline" className="gap-1 text-xs">
										<Lock className="size-3" />
										Read only
									</Badge>
								)}
								{isEditable && saveStatus === "saving" && (
									<span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
								)}
								{isEditable && saveStatus === "saved" && (
									<span className="text-xs text-emerald-500">Saved</span>
								)}
								{isEditable && isSaving && saveStatus !== "saving" && (
									<span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
								)}
							</div>
						</div>

						{/* Editor / Preview */}
						<div className="flex-1 overflow-auto" data-color-mode="dark">
							<MDEditor
								value={localContents[activeFile.path] ?? activeFile.content}
								{...(isEditable ? { onChange: handleContentChange } : {})}
								preview={isEditable ? "live" : "preview"}
								visibleDragbar={false}
								height="100%"
								hideToolbar={!isEditable}
								style={{ background: "transparent" }}
							/>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center text-muted-foreground">
						Select a file to view
					</div>
				)}
			</div>
		</div>
	);
}

export function AgentMemoryBrowserSkeleton() {
	return (
		<div className="flex border rounded-lg overflow-hidden h-[calc(100vh-14rem)]">
			{/* File tree skeleton */}
			<aside className="w-56 shrink-0 border-r border-border bg-muted/30">
				<div className="py-3 px-3 space-y-3">
					<Skeleton className="h-3 w-28" />
					<div className="space-y-1">
						<Skeleton className="h-8 w-full" />
					</div>
					<Skeleton className="h-3 w-24 mt-4" />
					<div className="space-y-1">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				</div>
			</aside>

			{/* Content area skeleton */}
			<div className="flex-1 flex flex-col">
				<div className="border-b border-border px-4 py-2">
					<Skeleton className="h-5 w-24" />
				</div>
				<div className="flex-1 p-6 space-y-3">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-6 w-36 mt-4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		</div>
	);
}
