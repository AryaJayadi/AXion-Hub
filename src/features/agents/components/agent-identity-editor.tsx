"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import type { IdentityFileKey } from "../lib/identity-templates";

/**
 * Dynamic import of @uiw/react-md-editor with SSR disabled.
 *
 * CRITICAL: react-md-editor uses browser APIs (document, window) internally.
 * Must be loaded client-side only to prevent "document is not defined" errors.
 * See RESEARCH.md Pitfall 1.
 */
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
	ssr: false,
	loading: () => <Skeleton className="h-full w-full" />,
});

type SaveStatus = "idle" | "saving" | "saved";

interface AgentIdentityEditorProps {
	activeFile: IdentityFileKey;
	files: Record<string, string>;
	onSave: (fileKey: string, content: string) => Promise<void>;
	onFileChange: (fileKey: string, content: string) => void;
}

export function AgentIdentityEditor({
	activeFile,
	files,
	onSave,
	onFileChange,
}: AgentIdentityEditorProps) {
	const { resolvedTheme } = useTheme();
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const previousFileRef = useRef<IdentityFileKey>(activeFile);

	// Debounced save: triggers 500ms after user stops typing
	const debouncedSave = useDebouncedCallback(async (fileKey: string, content: string) => {
		setSaveStatus("saving");
		try {
			await onSave(fileKey, content);
			setSaveStatus("saved");

			// Clear "Saved" indicator after 2 seconds
			if (savedTimerRef.current) {
				clearTimeout(savedTimerRef.current);
			}
			savedTimerRef.current = setTimeout(() => {
				setSaveStatus("idle");
			}, 2000);
		} catch {
			setSaveStatus("idle");
		}
	}, 500);

	// Flush pending save when switching files
	useEffect(() => {
		if (previousFileRef.current !== activeFile) {
			debouncedSave.flush();
			previousFileRef.current = activeFile;
			setSaveStatus("idle");
		}
	}, [activeFile, debouncedSave]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (savedTimerRef.current) {
				clearTimeout(savedTimerRef.current);
			}
			debouncedSave.flush();
		};
	}, [debouncedSave]);

	const handleChange = useCallback(
		(value: string | undefined) => {
			const content = value ?? "";
			onFileChange(activeFile, content);
			debouncedSave(activeFile, content);
		},
		[activeFile, debouncedSave, onFileChange],
	);

	const colorMode = resolvedTheme === "light" ? "light" : "dark";

	return (
		<div className="flex-1 relative">
			<div data-color-mode={colorMode} className="h-full">
				<MDEditor
					value={files[activeFile] ?? ""}
					onChange={handleChange}
					height="100%"
					preview="live"
					visibleDragbar={false}
				/>
			</div>

			{/* Save status indicator */}
			<div
				className={cn(
					"absolute bottom-3 right-3 text-xs transition-opacity duration-300",
					saveStatus === "idle" && "opacity-0",
					saveStatus === "saving" && "opacity-100 text-muted-foreground",
					saveStatus === "saved" && "opacity-100 text-green-500",
				)}
			>
				{saveStatus === "saving" && "Saving..."}
				{saveStatus === "saved" && "Saved"}
			</div>
		</div>
	);
}

export function AgentIdentityEditorSkeleton() {
	return (
		<div className="flex-1">
			<Skeleton className="h-full w-full" />
		</div>
	);
}
