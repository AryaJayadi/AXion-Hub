"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
	ExternalLink,
	FileCode,
	FileIcon,
	FileText,
} from "lucide-react";

import type { Deliverable } from "@/entities/mission";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

/** Mock code snippet for code-type deliverables */
const MOCK_CODE_SNIPPETS: Record<string, string> = {
	"del-001": `export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number,
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(count = 1): boolean {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
}`,
	"del-006": `name: Deploy Agent
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - run: bun run deploy`,
};

/** Get the first N lines of content for preview */
function getPreviewLines(content: string, maxLines = 3): string {
	const lines = content.split("\n");
	const preview = lines.slice(0, maxLines).join("\n");
	return lines.length > maxLines ? `${preview}\n...` : preview;
}

/** Type-specific icon */
function DeliverableIcon({
	type,
	className,
}: { type: Deliverable["type"]; className?: string }) {
	switch (type) {
		case "file":
			return <FileText className={cn("size-4", className)} />;
		case "code":
			return <FileCode className={cn("size-4", className)} />;
		case "link":
			return <ExternalLink className={cn("size-4", className)} />;
		default:
			return <FileIcon className={cn("size-4", className)} />;
	}
}

interface DeliverablePreviewCardProps {
	deliverable: Deliverable;
}

export function DeliverablePreviewCard({
	deliverable,
}: DeliverablePreviewCardProps) {
	const [codeDialogOpen, setCodeDialogOpen] = useState(false);

	const codeContent = MOCK_CODE_SNIPPETS[deliverable.id] ?? "// No preview available";
	const previewCode = getPreviewLines(codeContent, 3);

	const handleClick = () => {
		if (deliverable.type === "code") {
			setCodeDialogOpen(true);
		} else if (deliverable.type === "link") {
			window.open(deliverable.url, "_blank", "noopener,noreferrer");
		} else {
			// File type: open in new tab
			window.open(deliverable.url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<>
			<Card
				className="cursor-pointer transition-colors hover:bg-muted/50 overflow-hidden"
				onClick={handleClick}
			>
				<CardContent className="p-3">
					{/* Header: icon + title */}
					<div className="flex items-start gap-2 mb-2">
						<div className="mt-0.5 shrink-0">
							<DeliverableIcon
								type={deliverable.type}
								className="text-muted-foreground"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">
								{deliverable.title}
							</p>
							{deliverable.mimeType && (
								<Badge
									variant="outline"
									className="text-[10px] mt-0.5"
								>
									{deliverable.mimeType}
								</Badge>
							)}
						</div>
					</div>

					{/* Type-specific content */}
					{deliverable.type === "file" && (
						<div className="relative rounded-md bg-muted/50 p-3">
							{deliverable.thumbnailUrl ? (
								<img
									src={deliverable.thumbnailUrl}
									alt={deliverable.title}
									className="h-16 w-full rounded object-cover"
								/>
							) : (
								<div className="flex h-16 items-center justify-center">
									<FileText className="size-8 text-muted-foreground/30" />
								</div>
							)}
						</div>
					)}

					{deliverable.type === "code" && (
						<div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900">
							<pre className="text-[11px] font-mono text-muted-foreground overflow-hidden whitespace-pre-wrap leading-relaxed">
								{previewCode}
							</pre>
						</div>
					)}

					{deliverable.type === "link" && (
						<div className="space-y-1">
							<Button
								variant="link"
								className="h-auto p-0 text-xs text-primary"
								onClick={(e) => {
									e.stopPropagation();
									window.open(
										deliverable.url,
										"_blank",
										"noopener,noreferrer",
									);
								}}
							>
								{deliverable.title}
							</Button>
							<p className="text-[10px] text-muted-foreground truncate">
								{deliverable.url}
							</p>
						</div>
					)}
				</CardContent>

				{/* Footer: submitted info */}
				<CardFooter className="px-3 py-2 border-t bg-muted/20">
					<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
						<Avatar size="sm" className="size-4">
							<AvatarFallback className="text-[8px]">
								{deliverable.submittedBy[0]?.toUpperCase() ??
									"?"}
							</AvatarFallback>
						</Avatar>
						<span>{deliverable.submittedBy}</span>
						<span>-</span>
						<time>
							{formatDistanceToNow(deliverable.submittedAt, {
								addSuffix: true,
							})}
						</time>
					</div>
				</CardFooter>
			</Card>

			{/* Code full view dialog */}
			{deliverable.type === "code" && (
				<Dialog
					open={codeDialogOpen}
					onOpenChange={setCodeDialogOpen}
				>
					<DialogContent className="sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<FileCode className="size-4" />
								{deliverable.title}
							</DialogTitle>
						</DialogHeader>
						<div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
							<pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
								{codeContent}
							</pre>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
