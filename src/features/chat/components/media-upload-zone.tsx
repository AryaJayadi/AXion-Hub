"use client";

/**
 * Drag-and-drop, paste-to-upload, and file picker media upload zone.
 *
 * Wraps children with drag-and-drop handling and paste event listeners.
 * Also exports a file input trigger pattern for the attachment button.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { validateFile, ALL_ACCEPTED_MIME_TYPES } from "../lib/media-upload";

interface MediaUploadZoneProps {
	onFilesAdded: (files: File[]) => void;
	children: React.ReactNode;
	disabled?: boolean | undefined;
}

/**
 * Wraps children in a drop zone that accepts drag-and-drop and paste uploads.
 * Shows a visual overlay when files are dragged over.
 */
export function MediaUploadZone({
	onFilesAdded,
	children,
	disabled,
}: MediaUploadZoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const dragCounterRef = useRef(0);

	const processFiles = useCallback(
		(fileList: FileList) => {
			const validFiles: File[] = [];
			for (const file of Array.from(fileList)) {
				const result = validateFile(file);
				if (result.valid) {
					validFiles.push(file);
				} else if (result.error) {
					toast.error(result.error);
				}
			}
			if (validFiles.length > 0) {
				onFilesAdded(validFiles);
			}
		},
		[onFilesAdded],
	);

	const handleDragEnter = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (disabled) return;
			dragCounterRef.current++;
			if (e.dataTransfer.types.includes("Files")) {
				setIsDragging(true);
			}
		},
		[disabled],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (disabled) return;
		},
		[disabled],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current--;
		if (dragCounterRef.current === 0) {
			setIsDragging(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			dragCounterRef.current = 0;
			if (disabled) return;

			const { files } = e.dataTransfer;
			if (files.length > 0) {
				processFiles(files);
			}
		},
		[disabled, processFiles],
	);

	// Paste-to-upload listener
	useEffect(() => {
		if (disabled) return;

		const handlePaste = (e: ClipboardEvent) => {
			const { files } = e.clipboardData ?? { files: [] as unknown as FileList };
			if (files.length > 0) {
				processFiles(files);
			}
		};

		document.addEventListener("paste", handlePaste);
		return () => {
			document.removeEventListener("paste", handlePaste);
		};
	}, [disabled, processFiles]);

	return (
		<div
			className="relative"
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{children}

			{/* Drag overlay */}
			{isDragging && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-2 text-primary">
						<Upload className="size-8" />
						<span className="text-sm font-medium">Drop files here</span>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * File input trigger button with hidden input.
 *
 * Renders a Paperclip button that opens the native file picker.
 * Validated files are passed to onFilesAdded.
 */
export function FileInputTrigger({
	onFilesAdded,
	disabled,
}: {
	onFilesAdded: (files: File[]) => void;
	disabled?: boolean | undefined;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { files } = e.target;
			if (!files || files.length === 0) return;

			const validFiles: File[] = [];
			for (const file of Array.from(files)) {
				const result = validateFile(file);
				if (result.valid) {
					validFiles.push(file);
				} else if (result.error) {
					toast.error(result.error);
				}
			}
			if (validFiles.length > 0) {
				onFilesAdded(validFiles);
			}

			// Reset input so the same file can be re-selected
			e.target.value = "";
		},
		[onFilesAdded],
	);

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				multiple
				accept={ALL_ACCEPTED_MIME_TYPES.join(",")}
				onChange={handleChange}
				className="hidden"
				aria-hidden="true"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
				aria-label="Attach file"
				disabled={disabled}
				onClick={() => inputRef.current?.click()}
			>
				<Paperclip className="size-4" />
			</Button>
		</>
	);
}
