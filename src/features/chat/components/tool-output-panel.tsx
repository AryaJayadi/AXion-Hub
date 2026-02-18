"use client";

/**
 * Sheet side panel for viewing tool call output details.
 *
 * Opens from the right side, showing tool arguments, output,
 * error details (if any), and timing information.
 */

import { format } from "date-fns";
import { XCircle } from "lucide-react";
import type { ToolCallInfo } from "@/entities/chat-message";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/shared/ui/sheet";
import { StatusBadge } from "@/shared/ui/status-badge";

interface ToolOutputPanelProps {
	tool: ToolCallInfo | null;
	open: boolean;
	onClose: () => void;
}

export function ToolOutputPanel({
	tool,
	open,
	onClose,
}: ToolOutputPanelProps) {
	if (!tool) return null;

	return (
		<Sheet open={open} onOpenChange={(o) => !o && onClose()}>
			<SheetContent side="right">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<SheetTitle className="flex-1 truncate">{tool.name}</SheetTitle>
						<StatusBadge status={tool.status} size="sm" />
					</div>
					<SheetDescription>Tool call details</SheetDescription>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
					{/* Error banner */}
					{tool.status === "error" && tool.error && (
						<div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3">
							<XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
							<p className="text-sm text-destructive">{tool.error}</p>
						</div>
					)}

					{/* Arguments section */}
					<div>
						<h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Arguments
						</h4>
						<pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
							{JSON.stringify(tool.arguments, null, 2)}
						</pre>
					</div>

					{/* Output section */}
					{tool.output && (
						<div>
							<h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Output
							</h4>
							<pre className="max-h-[300px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
								{tool.output}
							</pre>
						</div>
					)}

					{/* Timing section */}
					{(tool.startedAt || tool.completedAt) && (
						<div>
							<h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Timing
							</h4>
							<div className="space-y-1 text-xs text-muted-foreground">
								{tool.startedAt && (
									<p>Started: {format(tool.startedAt, "HH:mm:ss.SSS")}</p>
								)}
								{tool.completedAt && (
									<p>Completed: {format(tool.completedAt, "HH:mm:ss.SSS")}</p>
								)}
								{tool.startedAt && tool.completedAt && (
									<p>
										Duration:{" "}
										{(
											(tool.completedAt.getTime() - tool.startedAt.getTime()) /
											1000
										).toFixed(2)}
										s
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
