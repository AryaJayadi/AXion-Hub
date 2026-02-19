"use client";

import { useState } from "react";
import { CheckCircle, ChevronRight, XCircle } from "lucide-react";
import type { TranscriptToolCall } from "@/entities/session";
import { cn } from "@/shared/lib/cn";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { StatusBadge } from "@/shared/ui/status-badge";

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

interface TranscriptToolBlockProps {
	toolCall: TranscriptToolCall;
}

export function TranscriptToolBlock({ toolCall }: TranscriptToolBlockProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showFullOutput, setShowFullOutput] = useState(false);

	const isError = toolCall.status === "error";
	const truncatedOutput =
		toolCall.output && toolCall.output.length > 500 && !showFullOutput
			? `${toolCall.output.slice(0, 500)}...`
			: toolCall.output;

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<div
				className={cn(
					"mt-2 rounded-lg border border-border/50 bg-muted/20",
					"border-l-2",
					isError ? "border-l-destructive" : "border-l-emerald-500",
				)}
			>
				<CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors rounded-lg">
					<ChevronRight
						className={cn(
							"size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
							isOpen && "rotate-90",
						)}
					/>
					{isError ? (
						<XCircle className="size-3.5 shrink-0 text-destructive" />
					) : (
						<CheckCircle className="size-3.5 shrink-0 text-emerald-500" />
					)}
					<span className="text-xs font-mono font-medium">
						{toolCall.name}
					</span>
					<StatusBadge
						status={toolCall.status === "completed" ? "active" : "error"}
						label={toolCall.status}
						size="sm"
						showDot={false}
					/>
					<span className="ml-auto text-xs text-muted-foreground">
						{formatDuration(toolCall.durationMs)}
					</span>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<div className="space-y-3 px-3 pb-3 pt-1">
						{/* Arguments */}
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-1">
								Arguments
							</p>
							<pre className="rounded-md bg-muted p-2 font-mono text-xs overflow-x-auto">
								{JSON.stringify(toolCall.arguments, null, 2)}
							</pre>
						</div>

						{/* Output */}
						{toolCall.output && (
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1">
									Output
								</p>
								<pre className="rounded-md bg-muted p-2 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
									{truncatedOutput}
								</pre>
								{toolCall.output.length > 500 && (
									<button
										type="button"
										onClick={() => setShowFullOutput(!showFullOutput)}
										className="mt-1 text-xs text-primary hover:underline"
									>
										{showFullOutput ? "Show less" : "Show all"}
									</button>
								)}
							</div>
						)}

						{/* Error */}
						{toolCall.error && (
							<div>
								<p className="text-xs font-medium text-destructive mb-1">
									Error
								</p>
								<p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
									{toolCall.error}
								</p>
							</div>
						)}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
