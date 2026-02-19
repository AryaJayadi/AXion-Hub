"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
	Code,
	ExternalLink,
	FileIcon,
	Package,
} from "lucide-react";

import type {
	ApprovalDeliverable,
	ApprovalDetail,
	ApprovalPriority,
} from "@/entities/approval";
import { cn } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

/** Priority badge styles */
const PRIORITY_STYLES: Record<
	ApprovalPriority,
	string
> = {
	critical:
		"bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
	high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
	medium: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
	low: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
};

/** Type icon for deliverables */
function DeliverableTypeIcon({
	type,
	className,
}: { type: ApprovalDeliverable["type"]; className?: string }) {
	switch (type) {
		case "code":
			return <Code className={cn("size-4", className)} />;
		case "link":
			return <ExternalLink className={cn("size-4", className)} />;
		case "file":
		default:
			return <FileIcon className={cn("size-4", className)} />;
	}
}

/** Format file size for display */
function formatSize(bytes: number | undefined): string {
	if (bytes === undefined) return "";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ApprovalReviewProps {
	detail: ApprovalDetail;
}

export function ApprovalReview({ detail }: ApprovalReviewProps) {
	const [previewDeliverable, setPreviewDeliverable] =
		useState<ApprovalDeliverable | null>(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
				{/* Left: Deliverables */}
				<div className="space-y-4">
					<h3 className="text-sm font-semibold flex items-center gap-2">
						<Package className="size-4 text-muted-foreground" />
						Deliverables ({detail.deliverables.length})
					</h3>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{detail.deliverables.map((deliverable) => (
							<Card
								key={deliverable.id}
								className="cursor-pointer transition-colors hover:bg-muted/50"
								onClick={() =>
									setPreviewDeliverable(deliverable)
								}
							>
								<CardContent className="p-3 space-y-2">
									{/* Header */}
									<div className="flex items-start gap-2">
										<DeliverableTypeIcon
											type={deliverable.type}
											className="mt-0.5 shrink-0 text-muted-foreground"
										/>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium truncate">
												{deliverable.name}
											</p>
											<div className="flex items-center gap-2 mt-0.5">
												<Badge
													variant="outline"
													className="text-[10px]"
												>
													{deliverable.type}
												</Badge>
												{deliverable.size !==
													undefined && (
													<span className="text-[10px] text-muted-foreground">
														{formatSize(
															deliverable.size,
														)}
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Code preview */}
									{deliverable.type === "code" &&
										deliverable.content && (
											<div className="rounded-md bg-muted p-2">
												<pre className="text-[11px] font-mono text-muted-foreground overflow-hidden whitespace-pre-wrap leading-relaxed line-clamp-5">
													{deliverable.content
														.split("\n")
														.slice(0, 5)
														.join("\n")}
												</pre>
											</div>
										)}

									{/* File info */}
									{deliverable.type === "file" && (
										<div className="flex items-center justify-center rounded-md bg-muted/50 py-4">
											<FileIcon className="size-8 text-muted-foreground/30" />
										</div>
									)}

									{/* Link */}
									{deliverable.type === "link" &&
										deliverable.url && (
											<p className="text-[10px] text-primary truncate">
												{deliverable.url}
											</p>
										)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Right: Task info */}
				<div className="space-y-6">
					{/* Task details */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Task Info</h3>
						<div className="space-y-3">
							<div>
								<p className="text-base font-medium">
									{detail.taskTitle}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{detail.taskDescription}
								</p>
							</div>

							<div className="flex items-center gap-3">
								<Avatar className="size-7">
									<AvatarFallback className="text-xs">
										{detail.agentName[0]?.toUpperCase() ??
											"A"}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-medium">
										{detail.agentName}
									</p>
									<p className="text-[10px] text-muted-foreground">
										{detail.agentId}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className={cn(
										"text-xs border",
										PRIORITY_STYLES[detail.priority],
									)}
								>
									{detail.priority}
								</Badge>
								<span className="text-xs text-muted-foreground">
									Submitted{" "}
									{formatDistanceToNow(
										detail.submittedAt,
										{ addSuffix: true },
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Activity timeline */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Activity</h3>
						<div className="relative space-y-3 pl-5">
							{/* Timeline line */}
							<div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />

							{detail.taskActivity.map((entry, idx) => (
								<div
									key={`activity-${idx.toString()}`}
									className="relative flex gap-3"
								>
									{/* Timeline dot */}
									<div className="absolute left-[-13px] top-1.5 size-2 rounded-full bg-muted-foreground/40" />

									<div className="min-w-0 flex-1">
										<p className="text-xs">
											{entry.action}
										</p>
										<p className="text-[10px] text-muted-foreground">
											{entry.actor}{" "}
											&middot;{" "}
											{formatDistanceToNow(
												entry.timestamp,
												{ addSuffix: true },
											)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Full preview dialog */}
			<Dialog
				open={previewDeliverable !== null}
				onOpenChange={(open) => !open && setPreviewDeliverable(null)}
			>
				{previewDeliverable && (
					<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<DeliverableTypeIcon
									type={previewDeliverable.type}
								/>
								{previewDeliverable.name}
							</DialogTitle>
						</DialogHeader>

						{previewDeliverable.type === "code" &&
							previewDeliverable.content && (
								<div className="rounded-md bg-muted p-4">
									<pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
										{previewDeliverable.content}
									</pre>
								</div>
							)}

						{previewDeliverable.type === "file" && (
							<div className="flex flex-col items-center gap-2 py-8">
								<FileIcon className="size-12 text-muted-foreground/30" />
								<p className="text-sm text-muted-foreground">
									{previewDeliverable.name}
								</p>
								{previewDeliverable.size !== undefined && (
									<p className="text-xs text-muted-foreground">
										{formatSize(previewDeliverable.size)}
									</p>
								)}
							</div>
						)}

						{previewDeliverable.type === "link" &&
							previewDeliverable.url && (
								<div className="space-y-2 py-4">
									<p className="text-sm text-muted-foreground">
										External link:
									</p>
									<a
										href={previewDeliverable.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary text-sm underline break-all"
									>
										{previewDeliverable.url}
									</a>
								</div>
							)}
					</DialogContent>
				)}
			</Dialog>
		</>
	);
}
