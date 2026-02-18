"use client";

/**
 * Media preview component for rendering attachment previews within messages.
 *
 * Renders different attachment types appropriately:
 * - Images: inline thumbnail with click-to-open
 * - Documents: card with file icon and download link
 * - Audio: native audio player in styled card
 */

import { FileText, Headphones } from "lucide-react";
import type { Attachment } from "@/entities/chat-message";

interface MediaPreviewProps {
	attachments: Attachment[];
}

/** Format file size to human-readable KB/MB */
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImagePreview({ attachment }: { attachment: Attachment }) {
	return (
		<a
			href={attachment.url}
			target="_blank"
			rel="noopener noreferrer"
			className="block overflow-hidden rounded-md border border-border"
		>
			<img
				src={attachment.url}
				alt={attachment.name}
				className="max-h-[200px] max-w-[300px] object-contain"
			/>
		</a>
	);
}

function DocumentPreview({ attachment }: { attachment: Attachment }) {
	return (
		<a
			href={attachment.url}
			download={attachment.name}
			className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
		>
			<FileText className="size-4 shrink-0 text-muted-foreground" />
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-foreground">{attachment.name}</p>
				<p className="text-xs text-muted-foreground">
					{formatFileSize(attachment.size)}
				</p>
			</div>
		</a>
	);
}

function AudioPreview({ attachment }: { attachment: Attachment }) {
	return (
		<div className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-2">
			<div className="flex items-center gap-2">
				<Headphones className="size-4 shrink-0 text-muted-foreground" />
				<span className="truncate text-sm font-medium text-foreground">
					{attachment.name}
				</span>
			</div>
			<audio controls className="h-8 w-full" preload="metadata">
				<source src={attachment.url} type={attachment.mimeType} />
			</audio>
		</div>
	);
}

export function MediaPreview({ attachments }: MediaPreviewProps) {
	if (attachments.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{attachments.map((attachment) => {
				switch (attachment.type) {
					case "image":
						return <ImagePreview key={attachment.id} attachment={attachment} />;
					case "document":
						return <DocumentPreview key={attachment.id} attachment={attachment} />;
					case "audio":
						return <AudioPreview key={attachment.id} attachment={attachment} />;
				}
			})}
		</div>
	);
}
