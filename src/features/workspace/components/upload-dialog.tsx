"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import {
	useFileUpload,
	UPLOAD_TARGET_AGENTS,
	type UploadTarget,
} from "../api/use-file-upload";

/** Maximum file size: 50 MB */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Format bytes as human-readable KB/MB */
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadDialogProps {
	onUploadSuccess?: () => void;
}

export function UploadDialog({ onUploadSuccess }: UploadDialogProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [targetValue, setTargetValue] = useState("shared");
	const [isDragging, setIsDragging] = useState(false);
	const dragCounterRef = useRef(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const uploadMutation = useFileUpload();

	/** Resolve the upload target from the select value */
	const resolveTarget = useCallback((): UploadTarget => {
		if (targetValue === "shared") {
			return { type: "shared" };
		}
		const agent = UPLOAD_TARGET_AGENTS.find((a) => a.id === targetValue);
		return agent
			? { type: "agent", agentId: agent.id, agentName: agent.name }
			: { type: "shared" };
	}, [targetValue]);

	/** Validate and add files, rejecting files > 50MB */
	const addFiles = useCallback((newFiles: File[]) => {
		const valid: File[] = [];
		for (const file of newFiles) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error(
					`"${file.name}" exceeds the 50 MB size limit and was not added.`,
				);
			} else {
				valid.push(file);
			}
		}
		if (valid.length > 0) {
			setFiles((prev) => [...prev, ...valid]);
		}
	}, []);

	/** Remove a file from the list */
	const removeFile = useCallback((index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}, []);

	/** Handle drag enter */
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current++;
		if (e.dataTransfer.types.includes("Files")) {
			setIsDragging(true);
		}
	}, []);

	/** Handle drag over */
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	/** Handle drag leave */
	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current--;
		if (dragCounterRef.current === 0) {
			setIsDragging(false);
		}
	}, []);

	/** Handle drop */
	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			dragCounterRef.current = 0;

			const droppedFiles = Array.from(e.dataTransfer.files);
			if (droppedFiles.length > 0) {
				addFiles(droppedFiles);
			}
		},
		[addFiles],
	);

	/** Handle file input change */
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selected = e.target.files;
			if (selected && selected.length > 0) {
				addFiles(Array.from(selected));
			}
			// Reset input so the same file can be re-selected
			e.target.value = "";
		},
		[addFiles],
	);

	/** Submit upload */
	const handleUpload = useCallback(() => {
		if (files.length === 0) return;
		const target = resolveTarget();
		uploadMutation.mutate(
			{ files, target },
			{
				onSuccess: () => {
					setFiles([]);
					onUploadSuccess?.();
				},
			},
		);
	}, [files, resolveTarget, uploadMutation, onUploadSuccess]);

	return (
		<div className="space-y-6">
			{/* Drag-and-drop zone */}
			<div
				className={cn(
					"relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
					isDragging
						? "border-primary bg-accent/10"
						: "border-muted-foreground/25 hover:border-muted-foreground/50",
				)}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						inputRef.current?.click();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="Drop files here or click to browse"
			>
				<input
					ref={inputRef}
					type="file"
					multiple
					onChange={handleInputChange}
					className="hidden"
					aria-hidden="true"
				/>
				<div className="flex flex-col items-center gap-2">
					<Upload
						className={cn(
							"size-10",
							isDragging
								? "text-primary"
								: "text-muted-foreground",
						)}
					/>
					<p className="text-sm font-medium text-foreground">
						Drag files here or click to browse
					</p>
					<p className="text-xs text-muted-foreground">
						Maximum file size: 50 MB
					</p>
				</div>
			</div>

			{/* Selected files list */}
			{files.length > 0 && (
				<div className="space-y-2">
					<Label className="text-sm font-medium">
						Selected files ({files.length})
					</Label>
					<div className="divide-y rounded-md border">
						{files.map((file, index) => (
							<div
								key={`${file.name}-${file.size}-${index.toString()}`}
								className="flex items-center justify-between px-3 py-2"
							>
								<div className="flex items-center gap-2 min-w-0">
									<FileIcon className="size-4 shrink-0 text-muted-foreground" />
									<span className="text-sm truncate">
										{file.name}
									</span>
									<span className="text-xs text-muted-foreground shrink-0">
										{formatFileSize(file.size)}
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-7 shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										removeFile(index);
									}}
									aria-label={`Remove ${file.name}`}
								>
									<X className="size-3.5" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Target selector */}
			<div className="space-y-2">
				<Label className="text-sm font-medium">Upload target</Label>
				<Select value={targetValue} onValueChange={setTargetValue}>
					<SelectTrigger className="w-full sm:w-[280px]">
						<SelectValue placeholder="Select upload target" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="shared">
							Shared workspace
						</SelectItem>
						{UPLOAD_TARGET_AGENTS.map((agent) => (
							<SelectItem key={agent.id} value={agent.id}>
								{agent.name} workspace
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-xs text-muted-foreground">
					{targetValue === "shared"
						? "Files will be available to all agents"
						: `Files will be uploaded to the selected agent's workspace`}
				</p>
			</div>

			{/* Upload button */}
			<Button
				onClick={handleUpload}
				disabled={files.length === 0 || uploadMutation.isPending}
				className="w-full sm:w-auto"
			>
				{uploadMutation.isPending ? (
					<>
						<Loader2 className="mr-2 size-4 animate-spin" />
						Uploading...
					</>
				) : (
					<>
						<Upload className="mr-2 size-4" />
						Upload {files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"}` : "files"}
					</>
				)}
			</Button>
		</div>
	);
}
