"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Lock } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import type { WorkspaceFile } from "@/entities/workspace";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { CodeEditor } from "./code-editor";

/**
 * Dynamic import of @uiw/react-md-editor with SSR disabled.
 * Same pattern as AgentIdentityEditor.
 */
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
	ssr: false,
	loading: () => <Skeleton className="h-full w-full" />,
});

type SaveStatus = "idle" | "saving" | "saved";

interface FileViewerProps {
	/** The workspace file to display. */
	file: WorkspaceFile;
	/** Called when file content should be saved. */
	onSave: (content: string) => Promise<void>;
}

/**
 * File viewer component that routes to the appropriate editor by file extension.
 *
 * - .md/.mdx files: @uiw/react-md-editor with split-pane preview
 * - All other files: CodeMirror-based CodeEditor with syntax highlighting
 *
 * Includes a header bar with file path, language badge, size,
 * and save status indicator (Saving.../Saved pattern).
 */
export function FileViewer({ file, onSave }: FileViewerProps) {
	const { resolvedTheme } = useTheme();
	const [localContent, setLocalContent] = useState(file.content);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const previousPathRef = useRef(file.path);

	// Sync local content when file changes
	useEffect(() => {
		if (previousPathRef.current !== file.path) {
			setLocalContent(file.content);
			previousPathRef.current = file.path;
			setSaveStatus("idle");
		}
	}, [file.path, file.content]);

	const debouncedSave = useDebouncedCallback(async (content: string) => {
		setSaveStatus("saving");
		try {
			await onSave(content);
			setSaveStatus("saved");
			if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
			savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
		} catch {
			setSaveStatus("idle");
		}
	}, 500);

	// Flush pending save on file switch and unmount
	useEffect(() => {
		return () => {
			debouncedSave.flush();
			if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
		};
	}, [debouncedSave]);

	const handleCodeChange = useCallback(
		(val: string) => {
			setLocalContent(val);
			debouncedSave(val);
		},
		[debouncedSave],
	);

	const handleMdChange = useCallback(
		(value: string | undefined) => {
			const content = value ?? "";
			setLocalContent(content);
			debouncedSave(content);
		},
		[debouncedSave],
	);

	const isMarkdown =
		file.path.endsWith(".md") || file.path.endsWith(".mdx");
	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	const formatSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="h-full flex flex-col">
			{/* File header bar */}
			<div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/20 shrink-0">
				<div className="flex items-center gap-2 min-w-0">
					<span className="font-mono text-sm font-medium truncate">
						{file.path}
					</span>
					<Badge variant="secondary" className="text-[10px] shrink-0">
						{file.language}
					</Badge>
				</div>
				<div className="flex items-center gap-3 shrink-0">
					<span className="text-xs text-muted-foreground">
						{formatSize(file.size)}
					</span>
					{file.isReadOnly && (
						<Badge variant="outline" className="gap-1 text-xs">
							<Lock className="size-3" />
							Read-only
						</Badge>
					)}
					{!file.isReadOnly && (
						<span
							className={cn(
								"text-xs transition-opacity duration-300",
								saveStatus === "idle" && "opacity-0",
								saveStatus === "saving" &&
									"opacity-100 text-muted-foreground animate-pulse",
								saveStatus === "saved" && "opacity-100 text-green-500",
							)}
						>
							{saveStatus === "saving" && "Saving..."}
							{saveStatus === "saved" && "Saved"}
						</span>
					)}
				</div>
			</div>

			{/* Editor area */}
			<div className="flex-1 overflow-auto min-h-0">
				{isMarkdown ? (
					<div
						data-color-mode={colorMode}
						className="h-full"
					>
						<MDEditor
							value={localContent}
							{...(file.isReadOnly ? {} : { onChange: handleMdChange })}
							preview={file.isReadOnly ? "preview" : "live"}
							visibleDragbar={false}
							height="100%"
							hideToolbar={file.isReadOnly}
							style={{ background: "transparent" }}
						/>
					</div>
				) : (
					<CodeEditor
						value={localContent}
						filePath={file.path}
						onChange={handleCodeChange}
						readOnly={file.isReadOnly}
					/>
				)}
			</div>
		</div>
	);
}
